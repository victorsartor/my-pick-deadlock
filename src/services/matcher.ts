import type { Axis, DeadlockHero, Mapping, MatchResult, SourceCharacter } from '../types'

/** Pontos somados ao herói indicado manualmente no mapeamento. */
export const BONUS_PADRAO = 12

/** Pontos perdidos por nível de dificuldade de diferença, além do primeiro (1 nível de diferença é tolerado). */
export const PENALIDADE_DIFICULDADE = 5

const MAX_NOTA = 10

export const NOMES_DIFICULDADE = ['', 'Fácil', 'Média', 'Desafiadora', 'Muito difícil', 'Extrema'] as const

export function penalidadeDificuldade(origem: number, destino: number): number {
  return PENALIDADE_DIFICULDADE * Math.max(0, Math.abs(origem - destino) - 1)
}

/** Similaridade ponderada entre dois vetores de estilo, de 0 (oposto) a 1 (idêntico). */
export function similaridade(a: number[], b: number[], axes: Axis[]): number {
  let soma = 0
  let pesos = 0
  axes.forEach((axis, i) => {
    const diff = ((a[i] ?? 0) - (b[i] ?? 0)) / MAX_NOTA
    soma += axis.peso * diff * diff
    pesos += axis.peso
  })
  return 1 - Math.sqrt(soma / pesos)
}

/** Eixos em que os dois personagens se destacam juntos, do mais forte para o mais fraco. */
export function razoes(a: number[], b: number[], axes: Axis[], limite = 3): string[] {
  return axes
    .map((axis, i) => ({ axis, media: ((a[i] ?? 0) + (b[i] ?? 0)) / 2, diff: Math.abs((a[i] ?? 0) - (b[i] ?? 0)) }))
    .filter((x) => x.diff <= 2 && x.media >= 6)
    .sort((x, y) => y.media - x.media || x.diff - y.diff)
    .slice(0, limite)
    .map((x) => x.axis.alto)
}

export function ranquear(
  personagem: SourceCharacter,
  heroes: DeadlockHero[],
  axes: Axis[],
  mapping?: Mapping,
): MatchResult[] {
  return heroes
    .map((hero) => {
      const recomendado = mapping?.heroi === hero.id
      let pontos = similaridade(personagem.vetor, hero.vetor, axes) * 100
      if (recomendado) pontos += mapping?.bonus ?? BONUS_PADRAO
      pontos += mapping?.ajustes?.[String(hero.id)] ?? 0
      pontos -= penalidadeDificuldade(personagem.dificuldade, hero.dificuldade)
      return {
        hero,
        porcentagem: Math.max(1, Math.min(99, Math.round(pontos))),
        razoes: razoes(personagem.vetor, hero.vetor, axes),
        recomendado,
      }
    })
    .sort((x, y) => y.porcentagem - x.porcentagem || Number(y.recomendado) - Number(x.recomendado))
    .sort((x, y) => peso(y, mapping) - peso(x, mapping))
}

/** Escolhas manuais vêm antes do cálculo: o par principal em 1º e a segunda opção fixada em 2º. */
function peso(r: MatchResult, mapping?: Mapping): number {
  if (r.recomendado) return 2
  return mapping?.segunda === r.hero.id ? 1 : 0
}
