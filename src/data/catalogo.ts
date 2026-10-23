import type { Source, SourceCharacter } from '../types'
import lolJson from './games/lol.json'
import sourcesJson from './sources.json'

// Só o que a Home precisa (lista de jogos e de personagens). Textos dos pares e dados dos heróis
// ficam em ./index.ts, que é carregado junto da tela de resultado.

export const sources = sourcesJson.sources as Source[]

/** Personagens de cada jogo de origem. Para adicionar Dota 2, OW2 etc., inclua o JSON aqui e em ./index.ts. */
export const personagensPorJogo: Record<string, SourceCharacter[]> = {
  lol: lolJson.personagens as SourceCharacter[],
}
