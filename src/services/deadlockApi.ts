import type { Habilidade } from '../types'
import { gravarCache, lerCache } from './cache'
import { textoLimpo } from './texto'

// Deadlock API: projeto da comunidade (não oficial). Documentação em https://api.deadlock-api.com/docs
const BASE = 'https://api.deadlock-api.com'
const SEIS_HORAS = 6 * 60 * 60 * 1000

export interface DeadlockHeroAssets {
  nome: string
  card?: string
  pequeno?: string
  vertical?: string
  fundo?: string
  /** class_name das habilidades 1 a 4, na ordem do jogo. */
  habilidades: string[]
}

interface ApiHero {
  id: number
  name: string
  images?: Record<string, string | undefined>
  items?: Record<string, string>
}

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

/** Imagens e nomes atuais dos heróis, indexados pelo id da API. */
export async function carregarAssetsDeadlock(): Promise<Record<number, DeadlockHeroAssets>> {
  const emCache = lerCache<Record<number, DeadlockHeroAssets>>('deadlock-assets-v3', SEIS_HORAS)
  if (emCache) return emCache

  // Sem only_active: heróis já lançados como Violet e Baba ainda vêm marcados como "em desenvolvimento".
  // Só aparecem no site os heróis que estão em data/deadlock/heroes.json.
  const herois = await buscar<ApiHero[]>('/v1/assets/heroes?language=english')

  const assets: Record<number, DeadlockHeroAssets> = {}
  for (const h of herois) {
    const img = h.images ?? {}
    const items = h.items ?? {}
    assets[h.id] = {
      nome: h.name,
      card: img.icon_hero_card_webp ?? img.icon_hero_card,
      pequeno: img.icon_image_small_webp ?? img.icon_image_small,
      vertical: img.top_bar_vertical_image_webp ?? img.top_bar_vertical_image,
      fundo: img.background_image_webp ?? img.background_image,
      habilidades: [1, 2, 3, 4].map((n) => items[`signature${n}`]).filter((c): c is string => !!c),
    }
  }
  gravarCache('deadlock-assets-v3', assets)
  return assets
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
export async function carregarHabilidadesDeadlock(heroId: number, ordem: string[]): Promise<Habilidade[]> {
  const chave = `deadlock-habilidades-${heroId}`
  const emCache = lerCache<Habilidade[]>(chave, SEIS_HORAS)
  if (emCache) return emCache

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
