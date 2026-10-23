// Baixa os votos do Supabase e gera dois arquivos em relatorios/:
//   resumo.md  → placar de cada par e heróis sugeridos (abre em qualquer editor)
//   votos.csv  → todos os votos, um por linha (abre no Excel)
//
// Uso: npm run relatorio
//
// Precisa de SUPABASE_SECRET_KEY no .env.local (só no seu PC, nunca no site nem no git).
// Ela não tem o prefixo VITE_, então o Vite nunca a coloca dentro do site.

import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const raiz = join(dirname(fileURLToPath(import.meta.url)), '..')

function lerEnv() {
  const env = {}
  try {
    for (const linha of readFileSync(join(raiz, '.env.local'), 'utf8').split(/\r?\n/)) {
      const m = linha.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/)
      if (m) env[m[1]] = m[2]
    }
  } catch {
    // sem .env.local: usa só as variáveis do sistema
  }
  return { ...env, ...process.env }
}

const env = lerEnv()
const url = env.VITE_SUPABASE_URL
const chave = env.SUPABASE_SECRET_KEY

if (!url || !chave) {
  console.error('Faltam VITE_SUPABASE_URL e/ou SUPABASE_SECRET_KEY no .env.local.')
  console.error('Gere a chave em Supabase → Project Settings → API Keys → Secret keys.')
  process.exit(1)
}

const herois = JSON.parse(readFileSync(join(raiz, 'src/data/deadlock/heroes.json'), 'utf8')).heroes
const nomeHeroi = (id) => herois.find((h) => h.id === id)?.nome ?? (id == null ? '' : `#${id}`)

const resposta = await fetch(`${url}/rest/v1/votos?select=*&order=atualizado_em.desc`, {
  headers: { apikey: chave, ...(chave.startsWith('eyJ') ? { Authorization: `Bearer ${chave}` } : {}) },
})
if (!resposta.ok) {
  console.error(`Supabase respondeu ${resposta.status}: ${await resposta.text()}`)
  process.exit(1)
}
const votos = await resposta.json()

// ---------- placar por par ----------
const pares = new Map()
for (const v of votos) {
  const chavePar = `${v.personagem}|${v.heroi}`
  const p = pares.get(chavePar) ?? { campeao: v.personagem, heroi: nomeHeroi(v.heroi), likes: 0, dislikes: 0 }
  if (v.opiniao === 'like') p.likes++
  else p.dislikes++
  pares.set(chavePar, p)
}
const placar = [...pares.values()].sort((a, b) => b.dislikes - a.dislikes || a.likes - b.likes)

// ---------- sugestões ----------
const sugestoes = new Map()
for (const v of votos.filter((v) => v.opiniao === 'dislike' && v.sugestao != null)) {
  const k = `${v.personagem}|${v.heroi}|${v.sugestao}`
  const s = sugestoes.get(k) ?? { campeao: v.personagem, atual: nomeHeroi(v.heroi), sugerido: nomeHeroi(v.sugestao), votos: 0 }
  s.votos++
  sugestoes.set(k, s)
}
const listaSugestoes = [...sugestoes.values()].sort((a, b) => b.votos - a.votos)

// ---------- arquivos ----------
const agora = new Date().toLocaleString('pt-BR')
const pct = (p) => Math.round((100 * p.likes) / (p.likes + p.dislikes))
const tabela = (cabecalho, linhas) =>
  [`| ${cabecalho.join(' | ')} |`, `|${cabecalho.map(() => '---').join('|')}|`, ...linhas.map((l) => `| ${l.join(' | ')} |`)].join('\n')

const md = [
  `# Votos do My Pick Deadlock`,
  ``,
  `Gerado em ${agora} · ${votos.length} voto(s) · ${new Set(votos.map((v) => v.visitante)).size} pessoa(s)`,
  ``,
  `## Placar dos pares (mais rejeitados primeiro)`,
  ``,
  placar.length
    ? tabela(['Campeão', 'Herói', 'Concordam', 'Discordam', '% concordam'], placar.map((p) => [p.campeao, p.heroi, p.likes, p.dislikes, `${pct(p)}%`]))
    : '_Nenhum voto ainda._',
  ``,
  `## Heróis sugeridos por quem não concordou`,
  ``,
  listaSugestoes.length
    ? tabela(['Campeão', 'Par atual', 'Sugerido', 'Votos'], listaSugestoes.map((s) => [s.campeao, s.atual, s.sugerido, s.votos]))
    : '_Nenhuma sugestão ainda._',
  ``,
].join('\n')

const csvCampo = (x) => `"${String(x ?? '').replace(/"/g, '""')}"`
const csv = [
  ['data', 'campeao', 'heroi', 'opiniao', 'sugestao'].join(';'),
  ...votos.map((v) =>
    [new Date(v.atualizado_em).toLocaleString('pt-BR'), v.personagem, nomeHeroi(v.heroi), v.opiniao === 'like' ? 'concordo' : 'não concordo', nomeHeroi(v.sugestao)]
      .map(csvCampo)
      .join(';'),
  ),
].join('\r\n')

const pasta = join(raiz, 'relatorios')
mkdirSync(pasta, { recursive: true })
writeFileSync(join(pasta, 'resumo.md'), md)
// BOM no início para o Excel abrir os acentos certos.
writeFileSync(join(pasta, 'votos.csv'), '﻿' + csv)

console.log(`${votos.length} voto(s) salvos em relatorios/resumo.md e relatorios/votos.csv`)
