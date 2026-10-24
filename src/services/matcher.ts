import type { Axis, DeadlockHero, Mapping, MatchResult, SourceCharacter } from '../types'

/** Pontos somados ao herói indicado manualmente no mapeamento. */
export const BONUS_PADRAO = 12

/** Pontos perdidos por nível de dificuldade de diferença, além do primeiro (1 nível de diferença é tolerado). */
export const PENALIDADE_DIFICULDADE = 5

const MAX_NOTA = 10

/**
 * Converte os pontos do cálculo (0 a 100) na porcentagem mostrada no site, de 10% a 90%.
 * Comprimir a escala evita que dois personagens de jogos diferentes pareçam "iguais" (95%+)
 * sem mudar a ordem do ranking.
 */
export function escalaExibicao(pontos: number): number {
  const limitado = Math.max(0, Math.min(100, pontos))
  return Math.round(50 + (limitado - 50) * 0.8)
}

/** Faixa que acompanha a porcentagem (o texto vem de i18n: rotulo.<faixa>), para o número não ser lido ao pé da letra. */
export function faixaCompatibilidade(porcentagem: number): 'muito' | 'bem' | 'parecido' | 'pouco' {
  if (porcentagem >= 85) return 'muito'
  if (porcentagem >= 75) return 'bem'
  if (porcentagem >= 65) return 'parecido'
  return 'pouco'
}

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

/** Chaves dos eixos em que os dois personagens se destacam juntos, do mais forte para o mais fraco (texto em i18n: eixo.<chave>). */
export function razoes(a: number[], b: number[], axes: Axis[], limite = 3): string[] {
  return axes
    .map((axis, i) => ({ axis, media: ((a[i] ?? 0) + (b[i] ?? 0)) / 2, diff: Math.abs((a[i] ?? 0) - (b[i] ?? 0)) }))
    .filter((x) => x.diff <= 2 && x.media >= 6)
    .sort((x, y) => y.media - x.media || x.diff - y.diff)
    .slice(0, limite)
    .map((x) => x.axis.key)
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
        pontos,
        porcentagem: escalaExibicao(pontos),
        razoes: razoes(personagem.vetor, hero.vetor, axes),
        recomendado,
      }
    })
    // Ordena pelos pontos exatos: dois heróis com a mesma % arredondada não trocam de lugar à toa.
    .sort((x, y) => y.pontos - x.pontos || Number(y.recomendado) - Number(x.recomendado))
    .sort((x, y) => peso(y, mapping) - peso(x, mapping))
    .map(({ pontos: _pontos, ...resultado }) => resultado)
}

/** Escolhas manuais vêm antes do cálculo: o par principal em 1º e a segunda opção fixada em 2º. */
function peso(r: MatchResult, mapping?: Mapping): number {
  if (r.recomendado) return 2
  return mapping?.segunda === r.hero.id ? 1 : 0
}
