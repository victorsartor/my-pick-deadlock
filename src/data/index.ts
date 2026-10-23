import type { Axis, DeadlockHero, Mapping, SourceCharacter } from '../types'
import axesJson from './axes.json'
import { personagensPorJogo } from './catalogo'
import heroesJson from './deadlock/heroes.json'
import lolMappings from './mappings/lol.json'

export { sources } from './catalogo'

export const axes = axesJson.axes as Axis[]
export const heroes = heroesJson.heroes as DeadlockHero[]

interface GameData {
  personagens: SourceCharacter[]
  mapeamentos: Record<string, Mapping>
}

/** Um registro por jogo de origem. Para adicionar Dota 2, OW2 etc., importe os JSONs e inclua aqui. */
export const games: Record<string, GameData> = {
  lol: {
    personagens: personagensPorJogo.lol!,
    mapeamentos: lolMappings.mapeamentos as Record<string, Mapping>,
  },
}

export const heroPorId = (id: number) => heroes.find((h) => h.id === id)
