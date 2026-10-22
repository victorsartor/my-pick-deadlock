import type { Axis, DeadlockHero, Mapping, Source, SourceCharacter } from '../types'
import axesJson from './axes.json'
import heroesJson from './deadlock/heroes.json'
import lolJson from './games/lol.json'
import lolMappings from './mappings/lol.json'
import sourcesJson from './sources.json'

export const axes = axesJson.axes as Axis[]
export const heroes = heroesJson.heroes as DeadlockHero[]
export const sources = sourcesJson.sources as Source[]

interface GameData {
  personagens: SourceCharacter[]
  mapeamentos: Record<string, Mapping>
}

/** Um registro por jogo de origem. Para adicionar Dota 2, OW2 etc., importe os JSONs e inclua aqui. */
export const games: Record<string, GameData> = {
  lol: {
    personagens: lolJson.personagens as SourceCharacter[],
    mapeamentos: lolMappings.mapeamentos as Record<string, Mapping>,
  },
}

export const heroPorId = (id: number) => heroes.find((h) => h.id === id)
