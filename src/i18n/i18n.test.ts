/// <reference types="node" />
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { games, heroes } from '../data'
import enHerois from '../data/en/herois.json'
import enPares from '../data/en/pares.json'
import { en } from './en'
import { pt } from './pt'

function arquivos(pasta: string): string[] {
  return readdirSync(pasta).flatMap((nome: string) => {
    const caminho = join(pasta, nome)
    if (statSync(caminho).isDirectory()) return nome === 'data' ? [] : arquivos(caminho)
    return /\.(vue|ts)$/.test(nome) && !nome.endsWith('.test.ts') ? [caminho] : []
  })
}

describe('textos da interface', () => {
  it('português e inglês têm as mesmas chaves, sem texto vazio', () => {
    expect(Object.keys(en).sort()).toEqual(Object.keys(pt).sort())
    for (const [chave, texto] of Object.entries(en)) expect(texto.trim(), chave).not.toBe('')
  })

  it('placeholders {x} são os mesmos nos dois idiomas', () => {
    const marcas = (s: string) => (s.match(/\{\w+\}/g) ?? []).sort()
    for (const chave of Object.keys(pt) as (keyof typeof pt)[]) expect(marcas(en[chave]), chave).toEqual(marcas(pt[chave]))
  })

  it('toda chave usada no código com t(\'...\') existe no dicionário', () => {
    const usadas = new Set<string>()
    for (const arquivo of arquivos(fileURLToPath(new URL('..', import.meta.url)))) {
      for (const m of readFileSync(arquivo, 'utf8').matchAll(/\bt\(\s*'([^']+)'/g)) usadas.add(m[1]!)
    }
    // Chaves montadas em tempo de execução (t('foco.' + x)) precisam ter todas as variantes cadastradas.
    for (const prefixo of ['lane.', 'foco.', 'triade.', 'dificuldade.', 'rotulo.', 'eixo.']) {
      expect(Object.keys(pt).some((k) => k.startsWith(prefixo)), prefixo).toBe(true)
    }
    for (const chave of usadas) {
      if (chave.endsWith('.')) continue
      expect(Object.keys(pt), chave).toContain(chave)
    }
  })

  it('há um texto para cada eixo, lane, faixa e nível de dificuldade', () => {
    for (const n of [1, 2, 3, 4, 5]) expect(pt).toHaveProperty(`dificuldade.${n}`)
    for (const faixa of ['muito', 'bem', 'parecido', 'pouco']) expect(pt).toHaveProperty(`rotulo.${faixa}`)
    for (const lane of new Set(games.lol!.personagens.map((p) => p.funcao))) expect(pt, lane).toHaveProperty(`lane.${lane}`)
  })
})

describe('conteúdo em inglês', () => {
  it('todo herói tem arquétipo, resumo e as mesmas builds', () => {
    const traducoes = enHerois as Record<string, { arquetipo: string; resumo: string; builds: { nome: string; descricao: string }[] }>
    for (const h of heroes) {
      const e = traducoes[String(h.id)]
      expect(e, h.nome).toBeDefined()
      expect(e!.arquetipo.trim(), h.nome).not.toBe('')
      expect(e!.resumo.trim(), h.nome).not.toBe('')
      expect(e!.builds, h.nome).toHaveLength(h.builds.length)
      for (const b of e!.builds) expect(b.nome.trim() && b.descricao.trim(), h.nome).toBeTruthy()
    }
  })

  it('todo par tem motivo e o mesmo número de paralelos', () => {
    const traducoes = enPares as Record<string, { motivo: string; paralelos: { origem: string; destino?: string }[] }>
    const lol = games.lol!
    for (const [id, m] of Object.entries(lol.mapeamentos)) {
      const e = traducoes[id]
      expect(e, id).toBeDefined()
      expect(e!.motivo.trim(), id).not.toBe('')
      expect(e!.paralelos, id).toHaveLength(m.paralelos.length)
      for (const p of e!.paralelos) expect(p.origem.trim(), id).not.toBe('')
    }
  })

  it('o inglês não deixa palavras do português nos textos', () => {
    // Heurística: acentos e algumas palavras que só existem em português.
    const suspeitas = /[áàâãéêíóôõúç]|\b(você|para o|para a|dos|das|uma|com o|com a)\b/i
    const todos = [
      ...Object.entries(enHerois as Record<string, { arquetipo: string; resumo: string; builds: { nome: string; descricao: string }[] }>).flatMap(([id, h]) => [
        [`herói ${id}`, h.arquetipo],
        [`herói ${id}`, h.resumo],
        ...h.builds.flatMap((b) => [[`build ${id}`, b.nome], [`build ${id}`, b.descricao]]),
      ]),
      ...Object.entries(enPares as Record<string, { motivo: string; paralelos: { origem: string; destino?: string }[] }>).flatMap(([id, p]) => [
        [`par ${id}`, p.motivo],
        ...p.paralelos.flatMap((x) => [[`par ${id}`, x.origem], ...(x.destino ? [[`par ${id}`, x.destino]] : [])]),
      ]),
    ] as [string, string][]
    const achados = todos.filter(([, texto]) => suspeitas.test(texto)).map(([onde, texto]) => `${onde}: ${texto.slice(0, 70)}`)
    expect(achados).toEqual([])
  })
})
