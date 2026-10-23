import { useAssets } from '../composables/useAssets'
import { carregarHabilidadesLol } from './dataDragon'
import { carregarHabilidadesDeadlock } from './deadlockApi'

/** Código da tela de resultado (separado do bundle da Home). */
export const carregarTelaResultado = () => import('../views/ResultView.vue')

const jaPedidos = new Set<string>()

/**
 * Chamado quando o mouse passa ou o dedo encosta no card de um campeão: começa a baixar a tela de
 * resultado, as habilidades dos dois lados e a imagem do herói antes do clique. Ao abrir o resultado,
 * os dados já estão no cache (ou a busca em andamento é reaproveitada).
 */
export function preCarregarResultado(jogo: string, personagem: string) {
  const chave = `${jogo}/${personagem}`
  if (jaPedidos.has(chave)) return
  jaPedidos.add(chave)

  const assets = useAssets()
  const ignorar = () => {}

  carregarTelaResultado().catch(ignorar)
  carregarHabilidadesLol(assets.lol.versao, personagem).catch(ignorar)
  // Os pares ficam no mesmo pedaço de código da tela de resultado: importar aqui não pesa na Home.
  import('../data')
    .then(({ games }) => {
      const heroiId = games[jogo]?.mapeamentos[personagem]?.heroi
      const heroi = heroiId ? assets.deadlock[heroiId] : undefined
      if (!heroiId || !heroi) return
      carregarHabilidadesDeadlock(heroiId, heroi.habilidades).catch(ignorar)
      if (heroi.card) new Image().src = heroi.card
    })
    .catch(ignorar)
}
