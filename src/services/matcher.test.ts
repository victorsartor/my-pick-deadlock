import { describe, expect, it } from 'vitest'
import { axes, games, heroes } from '../data'
import { ranquear, similaridade } from './matcher'

describe('similaridade', () => {
  it('é 1 para vetores iguais e 0 para opostos', () => {
    const v = axes.map(() => 5)
    expect(similaridade(v, v, axes)).toBe(1)
    expect(similaridade(axes.map(() => 0), axes.map(() => 10), axes)).toBeCloseTo(0)
  })
})

describe('dados', () => {
  const lol = games.lol!

  it('todos os vetores têm um valor por eixo, entre 0 e 10', () => {
    for (const v of [...heroes.map((h) => h.vetor), ...lol.personagens.map((p) => p.vetor)]) {
      expect(v).toHaveLength(axes.length)
      for (const n of v) expect(n >= 0 && n <= 10).toBe(true)
    }
  })

  it('cada campeão tem mapeamento para um herói existente', () => {
    for (const p of lol.personagens) {
      const m = lol.mapeamentos[p.id]
      expect(m, p.id).toBeDefined()
      expect(heroes.some((h) => h.id === m!.heroi), p.id).toBe(true)
    }
  })

  // Vários campeões podem dividir o mesmo herói (o LoL tem muito mais personagens que o Deadlock).
  it('ajustes manuais só citam heróis existentes', () => {
    for (const [id, m] of Object.entries(lol.mapeamentos)) {
      for (const heroId of Object.keys(m.ajustes ?? {})) {
        expect(heroes.some((h) => String(h.id) === heroId), `${id} -> ${heroId}`).toBe(true)
      }
    }
  })

  it('o herói recomendado fica em primeiro e a segunda opção fixada em segundo', () => {
    for (const p of lol.personagens) {
      const m = lol.mapeamentos[p.id]
      const [primeiro, segundo] = ranquear(p, heroes, axes, m)
      expect(primeiro!.recomendado, p.id).toBe(true)
      if (m?.segunda) expect(segundo!.hero.id, p.id).toBe(m.segunda)
    }
  })

  it('a porcentagem do herói principal não fica abaixo da segunda opção', () => {
    for (const p of lol.personagens) {
      const [primeiro, segundo] = ranquear(p, heroes, axes, lol.mapeamentos[p.id])
      expect(primeiro!.porcentagem, p.id).toBeGreaterThanOrEqual(segundo!.porcentagem)
    }
  })
})
