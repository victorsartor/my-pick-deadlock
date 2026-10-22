<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { useAssets } from '../composables/useAssets'
import { games, sources } from '../data'
import { lolIcone } from '../services/dataDragon'

const assets = useAssets()
const route = useRoute()
const router = useRouter()

// Filtros ficam na URL (?lane=Selva&q=lee) para sobreviverem ao voltar de um resultado.
const jogo = ref('lol')
const busca = ref(typeof route.query.q === 'string' ? route.query.q : '')
const funcao = ref<string | null>(typeof route.query.lane === 'string' ? route.query.lane : null)

watch([funcao, busca], ([lane, q]) => {
  router.replace({ query: { ...(lane ? { lane } : {}), ...(q ? { q } : {}) } })
})

const personagens = computed(() => games[jogo.value]?.personagens ?? [])
// Ordem e ícones das lanes do LoL (ícones oficiais, salvos em public/lanes).
const LANES: Record<string, string> = {
  Topo: '/lanes/top.png',
  Selva: '/lanes/jungle.png',
  Meio: '/lanes/middle.png',
  Atirador: '/lanes/bottom.png',
  Suporte: '/lanes/utility.png',
}
const ORDEM_LANES = Object.keys(LANES)
const posicao = (f: string) => (ORDEM_LANES.includes(f) ? ORDEM_LANES.indexOf(f) : ORDEM_LANES.length)

const funcoes = computed(() =>
  [...new Set(personagens.value.map((p) => p.funcao))].sort((a, b) => posicao(a) - posicao(b) || a.localeCompare(b)),
)

const nomeDe = (id: string) => assets.lol?.campeoes[id]?.nome ?? id

/** Ignora acentos e caixa: "kai sa" encontra "Kai'Sa". */
const normalizar = (s: string) => s.normalize('NFD').replace(/[^a-zA-Z0-9]/g, '').toLowerCase()

const filtrados = computed(() => {
  const termo = normalizar(busca.value)
  return personagens.value
    .filter((p) => !funcao.value || p.funcao === funcao.value)
    .filter((p) => !termo || normalizar(nomeDe(p.id)).includes(termo))
    .sort((a, b) => nomeDe(a.id).localeCompare(nomeDe(b.id), 'pt-BR'))
})
</script>

<template>
  <section class="mb-8 text-center">
    <h1 class="text-3xl font-bold uppercase sm:text-5xl">Quem você joga hoje?</h1>
    <p class="mx-auto mt-3 max-w-2xl text-suave">
      Escolha seu campeão e descubra qual herói do Deadlock combina com a sua memória muscular e o seu estilo de jogo.
    </p>
  </section>

  <nav class="mb-6 flex flex-wrap justify-center gap-2" aria-label="Jogo de origem">
    <button
      v-for="s in sources"
      :key="s.id"
      type="button"
      :disabled="!s.ativo"
      class="rounded-full border px-4 py-1.5 text-sm transition"
      :class="
        jogo === s.id
          ? 'border-ouro bg-ouro/15 text-ouro'
          : s.ativo
            ? 'border-borda hover:border-suave'
            : 'cursor-not-allowed border-borda/50 text-suave/50'
      "
      @click="jogo = s.id"
    >
      {{ s.sigla }}<span v-if="!s.ativo" class="ml-1 text-xs">· em breve</span>
    </button>
  </nav>

  <div class="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
    <input
      v-model="busca"
      type="search"
      placeholder="Buscar campeão…"
      aria-label="Buscar campeão"
      class="w-full rounded-lg border border-borda bg-painel px-4 py-2.5 outline-none placeholder:text-suave focus:border-ouro sm:max-w-xs"
    />
    <div class="flex flex-wrap gap-2">
      <button
        v-for="f in [null, ...funcoes]"
        :key="f ?? 'todas'"
        type="button"
        class="group flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-sm transition"
        :class="funcao === f ? 'border-ouro text-ouro' : 'border-borda text-suave hover:text-texto'"
        @click="funcao = f"
      >
        <img
          :src="f ? (LANES[f] ?? '/lanes/fill.png') : '/lanes/fill.png'"
          alt=""
          class="h-4 w-4 transition"
          :class="funcao === f ? '' : 'opacity-60 grayscale group-hover:opacity-100 group-hover:grayscale-0'"
        />
        {{ f ?? 'Todas' }}
      </button>
    </div>
  </div>

  <p v-if="assets.erroLol" class="mb-4 text-sm text-arma">
    Não foi possível carregar as imagens do Data Dragon. Os nomes aparecem pelo id.
  </p>

  <ul class="grid grid-cols-3 gap-3 sm:grid-cols-5 lg:grid-cols-7">
    <li v-for="p in filtrados" :key="p.id">
      <RouterLink
        :to="{ name: 'resultado', params: { jogo, personagem: p.id } }"
        class="group block rounded-lg border border-borda bg-painel p-2 text-center transition hover:-translate-y-0.5 hover:border-ouro"
      >
        <div class="aspect-square overflow-hidden rounded-md bg-borda">
          <img
            v-if="assets.lol"
            :src="lolIcone(assets.lol.versao, p.id)"
            :alt="nomeDe(p.id)"
            loading="lazy"
            class="h-full w-full object-cover transition group-hover:scale-105"
          />
        </div>
        <div class="mt-2 truncate text-sm font-medium">{{ nomeDe(p.id) }}</div>
        <div class="text-xs text-suave">{{ p.funcao }}</div>
      </RouterLink>
    </li>
  </ul>

  <p v-if="!filtrados.length" class="py-12 text-center text-suave">Nenhum campeão encontrado.</p>
</template>
