import type { Habilidade } from '../types'
import { gravarCache, lerCache } from './cache'
import { textoLimpo } from './texto'

// Data Dragon: CDN oficial e gratuito da Riot com artes e dados dos campeões.
const BASE = 'https://ddragon.leagueoflegends.com'
const LOCALE = 'pt_BR'
const UM_DIA = 24 * 60 * 60 * 1000

export interface LolChampionInfo {
  nome: string
  titulo: string
}

export interface LolCatalogo {
  versao: string
  campeoes: Record<string, LolChampionInfo>
}

export async function carregarCatalogoLol(): Promise<LolCatalogo> {
  const emCache = lerCache<LolCatalogo>('ddragon-catalogo', UM_DIA)
  if (emCache) return emCache

  const versoes: string[] = await fetch(`${BASE}/api/versions.json`).then((r) => r.json())
  const versao = versoes[0]!
  const resposta = await fetch(`${BASE}/cdn/${versao}/data/${LOCALE}/champion.json`).then((r) => r.json())

  const campeoes: Record<string, LolChampionInfo> = {}
  for (const [id, c] of Object.entries<{ name: string; title: string }>(resposta.data)) {
    campeoes[id] = { nome: c.name, titulo: c.title }
  }
  const catalogo = { versao, campeoes }
  gravarCache('ddragon-catalogo', catalogo)
  return catalogo
}

interface DdSpell {
  name: string
  description: string
  image: { full: string }
  cooldownBurn?: string
  rangeBurn?: string
}

const TECLAS = ['Q', 'W', 'E', 'R']

/** Passiva e Q/W/E/R do campeão, em pt-BR. */
export async function carregarHabilidadesLol(versao: string, id: string): Promise<Habilidade[]> {
  const chave = `ddragon-habilidades-${versao}-${id}`
  const emCache = lerCache<Habilidade[]>(chave, UM_DIA)
  if (emCache) return emCache

  const resposta = await fetch(`${BASE}/cdn/${versao}/data/${LOCALE}/champion/${id}.json`).then((r) => r.json())
  const c = resposta.data[id] as { passive: DdSpell; spells: DdSpell[] }
  const descricao = (s: string) => textoLimpo(s).replace(/\{\{[^}]*\}\}/g, '?')

  const habilidades: Habilidade[] = [
    {
      tecla: 'P',
      nome: c.passive.name,
      icone: `${BASE}/cdn/${versao}/img/passive/${c.passive.image.full}`,
      descricao: descricao(c.passive.description),
      stats: [],
    },
    ...c.spells.map((s, i) => ({
      tecla: TECLAS[i] ?? '',
      nome: s.name,
      icone: `${BASE}/cdn/${versao}/img/spell/${s.image.full}`,
      descricao: descricao(s.description),
      stats: [
        ...(s.cooldownBurn && s.cooldownBurn !== '0' ? [{ label: 'Recarga', valor: `${s.cooldownBurn}s` }] : []),
        ...(s.rangeBurn && s.rangeBurn !== 'self'
          ? [{ label: 'Alcance', valor: Number(s.rangeBurn) >= 25000 ? 'Global' : s.rangeBurn }]
          : []),
      ],
    })),
  ]
  gravarCache(chave, habilidades)
  return habilidades
}

export const lolIcone = (versao: string, id: string) => `${BASE}/cdn/${versao}/img/champion/${id}.png`
export const lolSplash = (id: string) => `${BASE}/cdn/img/champion/splash/${id}_0.jpg`
export const lolLoading = (id: string) => `${BASE}/cdn/img/champion/loading/${id}_0.jpg`
