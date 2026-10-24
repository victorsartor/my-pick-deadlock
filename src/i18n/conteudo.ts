import { shallowRef, watch } from 'vue'
import type { DeadlockHero, Mapping } from '../types'
import { idioma } from './index'

// Textos longos (resumos, builds, motivos e paralelos) ficam em português nos JSONs de dados e em
// inglês em src/data/en/. O inglês só é baixado quando alguém usa o site em inglês.

interface HeroiEn {
  arquetipo: string
  resumo: string
  builds: { nome: string; descricao: string }[]
}
interface ParEn {
  motivo: string
  paralelos: { origem: string; destino?: string }[]
}
interface ConteudoEn {
  herois: Record<string, HeroiEn>
  pares: Record<string, ParEn>
}

const conteudoEn = shallowRef<ConteudoEn | null>(null)
let carregando: Promise<void> | null = null

export function carregarConteudoEn(): Promise<void> {
  carregando ??= Promise.all([import('../data/en/herois.json'), import('../data/en/pares.json')]).then(([h, p]) => {
    conteudoEn.value = { herois: h.default as Record<string, HeroiEn>, pares: p.default as Record<string, ParEn> }
  })
  return carregando
}

watch(idioma, (l) => l === 'en' && void carregarConteudoEn(), { immediate: true })

export interface TextosHeroi {
  arquetipo: string
  resumo: string
  builds: { nome: string; descricao: string }[]
}

/** Textos do herói no idioma atual (em português enquanto o inglês ainda não terminou de carregar). */
export function textosHeroi(hero: DeadlockHero): TextosHeroi {
  const traduzido = idioma.value === 'en' ? conteudoEn.value?.herois[hero.id] : undefined
  return traduzido ?? { arquetipo: hero.arquetipo, resumo: hero.resumo, builds: hero.builds.map((b) => ({ nome: b.nome, descricao: b.descricao })) }
}

export interface TextosPar {
  motivo: string
  paralelos: { origem: string; destino: string }[]
}

/** Motivo e paralelos de habilidades do par no idioma atual. */
export function textosPar(personagem: string, mapping?: Mapping): TextosPar | undefined {
  if (!mapping) return undefined
  const traduzido = idioma.value === 'en' ? conteudoEn.value?.pares[personagem] : undefined
  if (!traduzido) return { motivo: mapping.motivo, paralelos: mapping.paralelos }
  return {
    motivo: traduzido.motivo,
    paralelos: mapping.paralelos.map((p, i) => ({
      origem: traduzido.paralelos[i]?.origem ?? p.origem,
      destino: traduzido.paralelos[i]?.destino ?? p.destino,
    })),
  }
}
