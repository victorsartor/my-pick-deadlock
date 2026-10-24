import { useAssets } from '../composables/useAssets'
import { idioma } from '../i18n'
import { carregarHabilidadesLol } from './dataDragon'
import { carregarHabilidadesDeadlock } from './deadlockApi'
import { carregarContagem, SUPABASE_URL } from './votos'

/** Código da tela de resultado (separado do bundle da Home). */
export const carregarTelaResultado = () => import('../views/ResultView.vue')

const jaPedidos = new Set<string>()

/** Abre cedo a conexão com o Supabase (o endereço vem de variável de ambiente, por isso não fica no index.html). */
export function preconectarVotos() {
  if (!SUPABASE_URL) return
  const link = document.createElement('link')
  link.rel = 'preconnect'
  link.href = SUPABASE_URL
  link.crossOrigin = 'anonymous'
  document.head.appendChild(link)
}

/**
 * Chamado quando o mouse passa ou o dedo encosta no card de um campeão: começa a baixar a tela de
 * resultado, as habilidades dos dois lados e a imagem do herói antes do clique. Ao abrir o resultado,
 * os dados já estão no cache (ou a busca em andamento é reaproveitada).
 */
export function preCarregarResultado(jogo: string, personagem: string) {
  const chave = `${jogo}/${personagem}/${idioma.value}`
  if (jaPedidos.has(chave)) return
  jaPedidos.add(chave)

  const assets = useAssets()
  const ignorar = () => {}

  carregarTelaResultado().catch(ignorar)
  carregarHabilidadesLol(assets.lol.versao, personagem, idioma.value).catch(ignorar)
  carregarContagem(jogo, personagem)?.catch(ignorar)
  // Os pares ficam no mesmo pedaço de código da tela de resultado: importar aqui não pesa na Home.
  import('../data')
    .then(({ games }) => {
      const heroiId = games[jogo]?.mapeamentos[personagem]?.heroi
      const heroi = heroiId ? assets.deadlock[heroiId] : undefined
      if (!heroiId || !heroi) return
      carregarHabilidadesDeadlock(heroiId, heroi.habilidades, idioma.value).catch(ignorar)
      if (heroi.card) new Image().src = heroi.card
    })
    .catch(ignorar)
}
