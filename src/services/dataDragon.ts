import type { Habilidade } from '../types'
import { gravarCache, lerCache, semDuplicar } from './cache'
import { textoLimpo } from './texto'

// Data Dragon: CDN oficial e gratuito da Riot com artes e dados dos campeões.
// A versão e os nomes vêm de src/data/gerado/lol.json (scripts/sync-assets.mjs).
const BASE = 'https://ddragon.leagueoflegends.com'
const LOCALE = 'pt_BR'
const UM_DIA = 24 * 60 * 60 * 1000

interface DdSpell {
  name: string
  description: string
  image: { full: string }
  cooldownBurn?: string
  rangeBurn?: string
}

const TECLAS = ['Q', 'W', 'E', 'R']

/** Passiva e Q/W/E/R do campeão, em pt-BR. */
export function carregarHabilidadesLol(versao: string, id: string): Promise<Habilidade[]> {
  const chave = `ddragon-habilidades-${versao}-${id}`
  const emCache = lerCache<Habilidade[]>(chave, UM_DIA)
  if (emCache) return Promise.resolve(emCache)
  return semDuplicar(chave, () => buscarHabilidadesLol(versao, id, chave))
}

async function buscarHabilidadesLol(versao: string, id: string, chave: string): Promise<Habilidade[]> {

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

/** Ícone em WebP gerado no build (public/campeoes). */
export const lolIcone = (id: string) => `/campeoes/${id}.webp`
/** PNG original da Riot, usado se o WebP local faltar (ex.: campeão novo antes do próximo build). */
export const lolIconeRiot = (versao: string, id: string) => `${BASE}/cdn/${versao}/img/champion/${id}.png`

/** Handler de @error para <img>: troca o WebP local pelo PNG da Riot uma única vez. */
export function usarIconeRiot(evento: Event, versao: string, id: string) {
  const img = evento.target as HTMLImageElement
  const reserva = lolIconeRiot(versao, id)
  if (img.src !== reserva) img.src = reserva
}
export const lolSplash = (id: string) => `${BASE}/cdn/img/champion/splash/${id}_0.jpg`
export const lolLoading = (id: string) => `${BASE}/cdn/img/champion/loading/${id}_0.jpg`
