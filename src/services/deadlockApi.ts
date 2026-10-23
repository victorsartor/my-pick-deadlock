import type { Habilidade } from '../types'
import { gravarCache, lerCache, semDuplicar } from './cache'
import { textoLimpo } from './texto'

// Deadlock API: projeto da comunidade (não oficial). Documentação em https://api.deadlock-api.com/docs
// Imagens e ordem das habilidades vêm de src/data/gerado/deadlock.json (scripts/sync-assets.mjs).
const BASE = 'https://api.deadlock-api.com'
const SEIS_HORAS = 6 * 60 * 60 * 1000

interface ApiProperty {
  value?: string | number
  label?: string
  postfix?: string
}

interface ApiAbility {
  class_name: string
  name: string
  type: string
  image?: string
  image_webp?: string
  description?: Record<string, string | undefined>
  properties?: Record<string, ApiProperty | undefined>
}

async function buscar<T>(caminho: string): Promise<T> {
  const r = await fetch(`${BASE}${caminho}`)
  if (!r.ok) throw new Error(`Deadlock API respondeu ${r.status}`)
  return r.json()
}

// Atributos mostrados no preview, na ordem de exibição.
const STATS = ['AbilityCooldown', 'AbilityCastRange', 'Radius', 'AbilityDuration', 'AbilityChannelTime', 'AbilityCharges']

function stats(props: ApiAbility['properties'] = {}) {
  return STATS.flatMap((chave) => {
    const p = props[chave]
    const numero = parseFloat(String(p?.value ?? ''))
    if (!p?.label || !numero) return []
    return [{ label: p.label, valor: `${numero}${(p.postfix ?? '').trim()}` }]
  })
}

/** Habilidades 1 a 4 de um herói, com textos em pt-BR e nome original em inglês. */
export function carregarHabilidadesDeadlock(heroId: number, ordem: string[]): Promise<Habilidade[]> {
  const chave = `deadlock-habilidades-${heroId}`
  const emCache = lerCache<Habilidade[]>(chave, SEIS_HORAS)
  if (emCache) return Promise.resolve(emCache)
  return semDuplicar(chave, () => buscarHabilidadesDeadlock(heroId, ordem, chave))
}

async function buscarHabilidadesDeadlock(heroId: number, ordem: string[], chave: string): Promise<Habilidade[]> {

  const [br, en] = await Promise.all([
    buscar<ApiAbility[]>(`/v1/assets/items/by-hero-id/${heroId}?language=brazilian`),
    buscar<ApiAbility[]>(`/v1/assets/items/by-hero-id/${heroId}?language=english`),
  ])

  const habilidades = ordem.flatMap((classe, i): Habilidade[] => {
    const a = br.find((x) => x.class_name === classe)
    if (!a) return []
    const d = a.description ?? {}
    return [
      {
        tecla: String(i + 1),
        nome: a.name,
        nomeOriginal: en.find((x) => x.class_name === classe)?.name,
        icone: a.image_webp ?? a.image ?? '',
        descricao: textoLimpo(d.desc),
        stats: stats(a.properties),
      },
    ]
  })
  gravarCache(chave, habilidades)
  return habilidades
}
