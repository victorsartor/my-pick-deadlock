<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { heroes } from '../data'
import HeroPicker from './HeroPicker.vue'
import { carregarContagem, chaveVoto, lerVoto, registrarVoto, type Contagem, type Opiniao, type Par, type Voto } from '../services/votos'

const props = defineProps<{
  jogo: string
  personagem: string
  nomeOrigem: string
  heroi: { id: number; nome: string }
}>()

const par = computed<Par>(() => ({ jogo: props.jogo, personagem: props.personagem, heroi: props.heroi.id }))
const voto = ref<Voto | null>(null)
/** Totais da comunidade (já incluem o voto deste navegador). Null sem Supabase ou antes de carregar. */
const contagem = ref<Contagem | null>(null)

watch(
  () => chaveVoto(par.value),
  () => {
    voto.value = lerVoto(par.value)
    contagem.value = null
    const alvo = props.heroi.id
    carregarContagem(props.jogo, props.personagem)
      ?.then((mapa) => {
        if (alvo === props.heroi.id) contagem.value = mapa[alvo] ?? { likes: 0, dislikes: 0 }
      })
      .catch(() => (contagem.value = null))
  },
  { immediate: true },
)

const outrosHerois = computed(() =>
  heroes.filter((h) => h.id !== props.heroi.id).sort((a, b) => a.nome.localeCompare(b.nome)),
)

const campo = (o: Opiniao) => (o === 'like' ? 'likes' : 'dislikes')

function votar(opiniao: Opiniao) {
  // Clicar de novo no mesmo botão desfaz o voto.
  const anterior = voto.value?.opiniao
  const nova = anterior === opiniao ? null : opiniao
  voto.value = registrarVoto(par.value, nova)
  // Atualiza a contagem na hora, sem esperar o banco.
  if (contagem.value) {
    if (anterior) contagem.value[campo(anterior)] = Math.max(0, contagem.value[campo(anterior)] - 1)
    if (nova) contagem.value[campo(nova)]++
  }
}

function sugerir(id: number) {
  if (!voto.value) return
  voto.value = registrarVoto(par.value, voto.value.opiniao, id)
}
</script>

<template>
  <div class="text-sm">
    <div class="flex flex-wrap items-center gap-2">
      <span class="text-suave">{{ nomeOrigem }} → {{ heroi.nome }} faz sentido?</span>
      <button
        type="button"
        class="inline-flex items-center gap-1.5 rounded-md border px-3 py-1 transition"
        :class="voto?.opiniao === 'like' ? 'border-vitalidade bg-vitalidade/15 text-vitalidade' : 'border-borda text-suave hover:text-texto'"
        :aria-pressed="voto?.opiniao === 'like'"
        @click="votar('like')"
      >
        <svg viewBox="0 0 24 24" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M7 10v12" />
          <path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2a3.13 3.13 0 0 1 3 3.88Z" />
        </svg>
        Concordo
        <span v-if="contagem" class="font-display">{{ contagem.likes }}</span>
      </button>
      <button
        type="button"
        class="inline-flex items-center gap-1.5 rounded-md border px-3 py-1 transition"
        :class="voto?.opiniao === 'dislike' ? 'border-arma bg-arma/15 text-arma' : 'border-borda text-suave hover:text-texto'"
        :aria-pressed="voto?.opiniao === 'dislike'"
        @click="votar('dislike')"
      >
        <svg viewBox="0 0 24 24" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M17 14V2" />
          <path d="M9 18.12 10 14H4.17a2 2 0 0 1-1.92-2.56l2.33-8A2 2 0 0 1 6.5 2H20a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-2.76a2 2 0 0 0-1.79 1.11L12 22a3.13 3.13 0 0 1-3-3.88Z" />
        </svg>
        Não concordo
        <span v-if="contagem" class="font-display">{{ contagem.dislikes }}</span>
      </button>
      <span v-if="contagem && contagem.likes + contagem.dislikes > 0" class="text-xs text-suave">
        {{ Math.round((contagem.likes / (contagem.likes + contagem.dislikes)) * 100) }}% da comunidade concorda
      </span>
    </div>

    <p v-if="voto?.opiniao === 'like'" class="mt-2 text-xs text-vitalidade">Valeu pelo voto!</p>

    <div v-else-if="voto?.opiniao === 'dislike'" class="mt-3 flex flex-wrap items-center gap-2">
      <span class="text-xs text-suave">Quem combina mais com {{ nomeOrigem }}?</span>
      <HeroPicker :herois="outrosHerois" :model-value="voto.sugestao" @update:model-value="sugerir" />
      <span v-if="voto.sugestao" class="text-xs text-vitalidade">Sugestão registrada!</span>
    </div>
  </div>
</template>
