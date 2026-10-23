// Gera, antes do build (e do dev), os dados das APIs que quase nunca mudam:
//   src/data/gerado/lol.json      → versão do Data Dragon e nome/título de cada campeão do site
//   src/data/gerado/deadlock.json → imagens e ordem das habilidades de cada herói do site
//   public/campeoes/<Id>.webp     → ícone de cada campeão em WebP (~3 KB, contra ~28 KB do PNG da Riot)
//   public/herois/fundo/<id>.webp → fundo oficial do herói em 1600 px (~30 KB, contra ~1,4 MB do original 4096 px)
// Assim o site abre sem esperar nenhuma API. Se a rede falhar, mantém os arquivos que já existem.

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const raiz = join(dirname(fileURLToPath(import.meta.url)), '..')
const pasta = join(raiz, 'src/data/gerado')
const pastaIcones = join(raiz, 'public/campeoes')
const pastaFundos = join(raiz, 'public/herois/fundo')
const lerJson = (arquivo) => JSON.parse(readFileSync(join(raiz, arquivo), 'utf8'))

async function buscar(url) {
  const r = await fetch(url)
  if (!r.ok) throw new Error(`${url} respondeu ${r.status}`)
  return r.json()
}

async function syncLol() {
  const ids = lerJson('src/data/games/lol.json').personagens.map((p) => p.id)
  const [versao] = await buscar('https://ddragon.leagueoflegends.com/api/versions.json')
  const { data } = await buscar(`https://ddragon.leagueoflegends.com/cdn/${versao}/data/pt_BR/champion.json`)
  const campeoes = Object.fromEntries(ids.filter((id) => data[id]).map((id) => [id, { nome: data[id].name, titulo: data[id].title }]))
  const faltando = ids.filter((id) => !data[id])
  if (faltando.length) console.warn(`  ids que não existem no Data Dragon: ${faltando.join(', ')}`)
  await gerarIcones(Object.keys(campeoes), versao)
  return { versao, campeoes }
}

/** Baixa o ícone de cada campeão e salva em WebP. Só refaz quando a versão do Data Dragon muda. */
async function gerarIcones(ids, versao) {
  mkdirSync(pastaIcones, { recursive: true })
  const marcador = join(pastaIcones, 'versao.txt')
  const mesmaVersao = existsSync(marcador) && readFileSync(marcador, 'utf8').trim() === versao
  const pendentes = ids.filter((id) => !mesmaVersao || !existsSync(join(pastaIcones, `${id}.webp`)))
  await Promise.all(
    pendentes.map(async (id) => {
      const r = await fetch(`https://ddragon.leagueoflegends.com/cdn/${versao}/img/champion/${id}.png`)
      if (!r.ok) throw new Error(`ícone de ${id} respondeu ${r.status}`)
      await sharp(Buffer.from(await r.arrayBuffer())).webp({ quality: 80 }).toFile(join(pastaIcones, `${id}.webp`))
    }),
  )
  writeFileSync(marcador, versao + '\n')
  if (pendentes.length) console.log(`sync-assets: ${pendentes.length} ícone(s) gerado(s)`)
}

async function syncDeadlock() {
  const ids = new Set(lerJson('src/data/deadlock/heroes.json').heroes.map((h) => h.id))
  // Sem only_active: heróis já lançados como Violet e Baba ainda vêm marcados como "em desenvolvimento".
  const herois = (await buscar('https://api.deadlock-api.com/v1/assets/heroes?language=english')).filter((h) => ids.has(h.id))
  const fundos = await gerarFundos(herois)
  return Object.fromEntries(
    herois.map((h) => {
      const img = h.images ?? {}
      const items = h.items ?? {}
      return [
        h.id,
        {
          nome: h.name,
          card: img.icon_hero_card_webp ?? img.icon_hero_card,
          pequeno: img.icon_image_small_webp ?? img.icon_image_small,
          fundo: fundos[h.id],
          habilidades: [1, 2, 3, 4].map((n) => items[`signature${n}`]).filter(Boolean),
        },
      ]
    }),
  )
}

/**
 * Baixa o fundo oficial de cada herói e salva reduzido. Refaz só quando a URL de origem muda
 * (registrada em origens.json), para não baixar ~60 MB a cada build.
 */
async function gerarFundos(herois) {
  mkdirSync(pastaFundos, { recursive: true })
  const registro = join(pastaFundos, 'origens.json')
  const origens = existsSync(registro) ? JSON.parse(readFileSync(registro, 'utf8')) : {}
  const caminhos = {}
  let gerados = 0
  await Promise.all(
    herois.map(async (h) => {
      const origem = h.images?.background_image_webp ?? h.images?.background_image
      if (!origem) return
      const arquivo = join(pastaFundos, `${h.id}.webp`)
      if (origens[h.id] !== origem || !existsSync(arquivo)) {
        const r = await fetch(origem)
        if (!r.ok) throw new Error(`fundo de ${h.name} respondeu ${r.status}`)
        await sharp(Buffer.from(await r.arrayBuffer())).resize({ width: 1600, withoutEnlargement: true }).webp({ quality: 60 }).toFile(arquivo)
        origens[h.id] = origem
        gerados++
      }
      caminhos[h.id] = `/herois/fundo/${h.id}.webp`
    }),
  )
  writeFileSync(registro, JSON.stringify(origens, null, 1) + '\n')
  if (gerados) console.log(`sync-assets: ${gerados} fundo(s) gerado(s)`)
  return caminhos
}

mkdirSync(pasta, { recursive: true })
for (const [arquivo, gerar] of [['lol.json', syncLol], ['deadlock.json', syncDeadlock]]) {
  try {
    writeFileSync(join(pasta, arquivo), JSON.stringify(await gerar(), null, 1) + '\n')
    console.log(`sync-assets: ${arquivo} atualizado`)
  } catch (e) {
    console.warn(`sync-assets: mantendo ${arquivo} existente (${e.message})`)
  }
}
