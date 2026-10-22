import { reactive } from 'vue'
import { carregarCatalogoLol, type LolCatalogo } from '../services/dataDragon'
import { carregarAssetsDeadlock, type DeadlockHeroAssets } from '../services/deadlockApi'

// Estado compartilhado: as APIs externas são chamadas uma vez por sessão.
const estado = reactive({
  lol: null as LolCatalogo | null,
  deadlock: {} as Record<number, DeadlockHeroAssets>,
  erroLol: false,
  erroDeadlock: false,
})

let iniciado = false

export function useAssets() {
  if (!iniciado) {
    iniciado = true
    carregarCatalogoLol()
      .then((c) => (estado.lol = c))
      .catch(() => (estado.erroLol = true))
    carregarAssetsDeadlock()
      .then((a) => (estado.deadlock = a))
      .catch(() => (estado.erroDeadlock = true))
  }
  return estado
}
