export type Foco = 'arma' | 'espirito' | 'vitalidade'

export interface Axis {
  key: string
  label: string
  peso: number
  alto: string
  baixo: string
}

export interface Build {
  nome: string
  foco: Foco
  descricao: string
}

export interface DeadlockHero {
  id: number
  nome: string
  arquetipo: string
  /** 1 (fácil) a 5 (extremo). */
  dificuldade: number
  vetor: number[]
  triade: Record<Foco, number>
  resumo: string
  builds: Build[]
}

/** Personagem de um jogo de origem (LoL, e futuramente Dota 2, OW2, Valorant). */
export interface SourceCharacter {
  id: string
  funcao: string
  /** 1 (fácil) a 5 (extremo), na mesma escala dos heróis. */
  dificuldade: number
  vetor: number[]
}

export interface Paralelo {
  origem: string
  destino: string
}

export interface Mapping {
  heroi: number
  /** Herói fixado como segunda opção. Sem ele, a segunda opção sai do cálculo. */
  segunda?: number
  bonus?: number
  ajustes?: Record<string, number>
  motivo: string
  paralelos: Paralelo[]
}

export interface Source {
  id: string
  nome: string
  sigla: string
  ativo: boolean
}

/** Habilidade pronta para exibir, venha ela do LoL ou do Deadlock. */
export interface Habilidade {
  tecla: string
  nome: string
  /** Nome em inglês, usado na tabela de paralelos (Deadlock). */
  nomeOriginal?: string
  icone: string
  descricao: string
  stats: { label: string; valor: string }[]
  melhorias: string[]
}

export interface MatchResult {
  hero: DeadlockHero
  porcentagem: number
  razoes: string[]
  recomendado: boolean
}
