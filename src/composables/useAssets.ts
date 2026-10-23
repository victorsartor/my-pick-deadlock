import deadlockGerado from '../data/gerado/deadlock.json'
import lolGerado from '../data/gerado/lol.json'

// Versão do Data Dragon, nomes dos campeões e imagens dos heróis vêm de src/data/gerado/,
// gerados por scripts/sync-assets.mjs antes de cada build e dev. Assim nenhuma tela espera
// uma API para mostrar ícones e nomes; só as habilidades são buscadas ao abrir um resultado.

export interface LolCatalogo {
  versao: string
  campeoes: Record<string, { nome: string; titulo: string }>
}

export interface DeadlockHeroAssets {
  nome: string
  card?: string
  pequeno?: string
  /** Fundo oficial do herói, reduzido no build (public/herois/fundo). */
  fundo?: string
  /** class_name das habilidades 1 a 4, na ordem do jogo. */
  habilidades: string[]
}

const assets = {
  lol: lolGerado as LolCatalogo,
  deadlock: deadlockGerado as unknown as Record<number, DeadlockHeroAssets>,
}

export function useAssets() {
  return assets
}
