<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import AbilityPreview from '../components/AbilityPreview.vue'
import DifficultyMeter from '../components/DifficultyMeter.vue'
import HeroImage from '../components/HeroImage.vue'
import MatchGauge from '../components/MatchGauge.vue'
import TriadBars from '../components/TriadBars.vue'
import VoteButtons from '../components/VoteButtons.vue'
import { useAssets } from '../composables/useAssets'
import { axes, games, heroes } from '../data'
import { carregarHabilidadesLol, lolIcone, usarIconeRiot } from '../services/dataDragon'
import { carregarHabilidadesDeadlock } from '../services/deadlockApi'
import { ranquear, rotuloCompatibilidade } from '../services/matcher'
import type { Foco, Habilidade } from '../types'

const props = defineProps<{ jogo: string; personagem: string }>()
const assets = useAssets()
const router = useRouter()

/** Volta para a Home com os filtros que estavam escolhidos; sem histórico (link direto), vai para a Home limpa. */
function voltar() {
  const anterior = window.history.state?.back
  if (typeof anterior === 'string' && anterior.split('?')[0] === '/') router.back()
  else router.push('/')
}

const game = computed(() => games[props.jogo])
const origem = computed(() => game.value?.personagens.find((p) => p.id === props.personagem))
const mapping = computed(() => game.value?.mapeamentos[props.personagem])
const ranking = computed(() => (origem.value ? ranquear(origem.value, heroes, axes, mapping.value) : []))
const top = computed(() => ranking.value[0])
// segunda: null no mapeamento = segunda opção ainda não escolhida; mostra um aviso no lugar.
const segundaPendente = computed(() => mapping.value?.segunda === null)
const segunda = computed(() => (segundaPendente.value ? undefined : ranking.value[1]))

const origemInfo = computed(() => assets.lol.campeoes[props.personagem])
const heroAssets = (id: number) => assets.deadlock[id]

const habilidadesOrigem = ref<Habilidade[] | null>(null)
const habilidadesHeroi = ref<Habilidade[] | null>(null)
const erroOrigem = ref(false)
const erroHeroi = ref(false)

watch(
  () => props.personagem,
  (id) => {
    habilidadesOrigem.value = null
    erroOrigem.value = false
    carregarHabilidadesLol(assets.lol.versao, id)
      .then((h) => (habilidadesOrigem.value = h))
      .catch(() => (erroOrigem.value = true))
  },
  { immediate: true },
)

watch(
  () => [top.value?.hero.id, top.value && heroAssets(top.value.hero.id)?.habilidades] as const,
  ([id, ordem]) => {
    habilidadesHeroi.value = null
    erroHeroi.value = false
    if (!id || !ordem) return
    carregarHabilidadesDeadlock(id, ordem)
      .then((h) => (habilidadesHeroi.value = h))
      .catch(() => (erroHeroi.value = true))
  },
  { immediate: true },
)

/** Números (1 a 4) das habilidades do herói citadas pelo nome em inglês num texto de paralelo. */
function teclasDoHeroi(destino: string): string[] {
  const texto = destino.toLowerCase()
  return (habilidadesHeroi.value ?? [])
    .filter((h) => h.nomeOriginal && texto.includes(h.nomeOriginal.toLowerCase()))
    .map((h) => h.tecla)
}

const corFoco: Record<Foco, string> = {
  arma: 'border-arma',
  espirito: 'border-espirito',
  vitalidade: 'border-vitalidade',
}
const nomeFoco: Record<Foco, string> = { arma: 'Arma', espirito: 'Espírito', vitalidade: 'Vitalidade' }
const textoFoco: Record<Foco, string> = { arma: 'text-arma', espirito: 'text-espirito', vitalidade: 'text-vitalidade' }
</script>

<template>
  <button type="button" class="mb-6 inline-block text-sm text-suave hover:text-texto" @click="voltar">
    ← Escolher outro campeão
  </button>

  <p v-if="!origem || !top" class="py-12 text-center text-suave">Campeão não encontrado.</p>

  <template v-else>
    <!-- Destaque: origem → herói recomendado -->
    <section class="animar-secao relative overflow-hidden rounded-2xl border border-borda bg-painel" style="--ordem: 0">
      <!-- Fundo oficial do jogo, reduzido no build (~30 KB). -->
      <img
        v-if="heroAssets(top.hero.id)?.fundo"
        :src="heroAssets(top.hero.id)?.fundo"
        alt=""
        aria-hidden="true"
        class="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-20"
      />
      <div class="relative flex flex-col items-center gap-6 p-6 md:flex-row md:p-8">
        <HeroImage
          :src="heroAssets(top.hero.id)?.card"
          :nome="top.hero.nome"
          class="h-56 w-40 shrink-0 rounded-xl object-cover shadow-2xl"
        />

        <div class="flex-1 text-center md:text-left">
          <div class="mb-2 flex items-center justify-center gap-2 text-sm text-suave md:justify-start">
            <img
              :src="lolIcone(origem.id)"
              @error="usarIconeRiot($event, assets.lol.versao, origem.id)"
              :alt="origemInfo?.nome ?? origem.id"
              class="h-7 w-7 rounded-full"
            />
            <span>Para quem joga de <strong class="text-texto">{{ origemInfo?.nome ?? origem.id }}</strong></span>
          </div>
          <p class="text-xs tracking-widest text-ouro uppercase">{{ top.hero.arquetipo }}</p>
          <h1 class="text-4xl font-bold uppercase sm:text-6xl">{{ top.hero.nome }}</h1>
          <DifficultyMeter :nivel="top.hero.dificuldade" class="mt-1" />
          <p class="mt-3 max-w-xl text-suave">{{ top.hero.resumo }}</p>
        </div>

        <MatchGauge :valor="top.porcentagem" />
      </div>
      <VoteButtons
        :jogo="jogo"
        :personagem="origem.id"
        :nome-origem="origemInfo?.nome ?? origem.id"
        :heroi="top.hero"
        class="relative border-t border-borda/70 px-6 py-4 md:px-8"
      />
    </section>

    <div class="animar-secao mt-6 grid gap-6 lg:grid-cols-3" style="--ordem: 1">
      <!-- Por que combina -->
      <section class="rounded-xl border border-borda bg-painel p-6 lg:col-span-2">
        <h2 class="mb-3 text-xl uppercase">Por que combina</h2>
        <p v-if="mapping" class="mb-4">{{ mapping.motivo }}</p>
        <ul v-if="top.razoes.length" class="mb-5 flex flex-wrap gap-2">
          <li v-for="r in top.razoes" :key="r" class="rounded-full bg-ouro/10 px-3 py-1 text-sm text-ouro first-letter:uppercase">
            {{ r }}
          </li>
        </ul>
        <table v-if="mapping?.paralelos.length" class="w-full text-left text-sm">
          <thead class="text-xs tracking-wider text-suave uppercase">
            <tr>
              <th class="pb-2 font-medium">{{ origemInfo?.nome ?? origem.id }}</th>
              <th class="pb-2 font-medium">{{ top.hero.nome }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="p in mapping.paralelos" :key="p.origem" class="border-t border-borda">
              <td class="py-2 pr-4">{{ p.origem }}</td>
              <td class="py-2 font-medium">
                <span class="inline-flex items-center gap-2">
                  <span
                    v-for="t in teclasDoHeroi(p.destino)"
                    :key="t"
                    class="inline-flex h-5 min-w-5 items-center justify-center rounded bg-borda px-1 font-display text-xs text-ouro"
                    :title="`Habilidade ${t}`"
                  >
                    {{ t }}
                  </span>
                  {{ p.destino }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </section>

      <!-- Tríade -->
      <section class="rounded-xl border border-borda bg-painel p-6">
        <h2 class="mb-4 text-xl uppercase">Tríade de atributos</h2>
        <TriadBars :triade="top.hero.triade" />
      </section>
    </div>

    <!-- Habilidades lado a lado -->
    <section class="animar-secao mt-6" style="--ordem: 2">
      <h2 class="mb-3 text-xl uppercase">Habilidades</h2>
      <div class="grid gap-4 md:grid-cols-2">
        <AbilityPreview
          :titulo="origemInfo?.nome ?? origem.id"
          :habilidades="habilidadesOrigem"
          :erro="erroOrigem"
          estilo="lol"
        />
        <AbilityPreview :titulo="top.hero.nome" :habilidades="habilidadesHeroi" :erro="erroHeroi" estilo="deadlock" />
      </div>
    </section>

    <!-- Vertentes de build -->
    <section class="animar-secao mt-6" style="--ordem: 3">
      <h2 class="mb-3 text-xl uppercase">Vertentes de build</h2>
      <div class="grid gap-4 md:grid-cols-2">
        <article
          v-for="b in top.hero.builds"
          :key="b.nome"
          class="rounded-xl border border-l-4 border-borda bg-painel p-5"
          :class="corFoco[b.foco]"
        >
          <p class="text-xs tracking-wider uppercase" :class="textoFoco[b.foco]">{{ nomeFoco[b.foco] }}</p>
          <h3 class="text-lg">{{ b.nome }}</h3>
          <p class="mt-1 text-sm text-suave">{{ b.descricao }}</p>
        </article>
      </div>
    </section>

    <!-- Segunda opção: o próximo do ranking, já considerando a diferença de dificuldade -->
    <section v-if="segundaPendente" class="animar-secao mt-8" style="--ordem: 4">
      <h2 class="mb-3 text-xl uppercase">Segunda opção</h2>
      <div class="flex flex-col items-center gap-2 rounded-xl border border-dashed border-borda bg-painel/50 p-6 text-center">
        <p class="font-display text-lg uppercase text-suave">Em breve</p>
        <p class="max-w-md text-sm text-suave">
          Ainda estamos escolhendo a segunda opção para {{ origemInfo?.nome ?? origem.id }}. Tem uma sugestão? Manda no X:
          <a href="https://x.com/vitinhoosartor" target="_blank" rel="noopener" class="text-ouro underline hover:text-texto">@vitinhoosartor</a>
        </p>
      </div>
    </section>

    <section v-else-if="segunda" class="animar-secao mt-8" style="--ordem: 4">
      <h2 class="mb-3 text-xl uppercase">Segunda opção</h2>
      <article class="flex flex-col gap-4 rounded-xl border border-borda bg-painel p-4 sm:flex-row sm:items-center">
        <HeroImage
          :src="heroAssets(segunda.hero.id)?.pequeno"
          :nome="segunda.hero.nome"
          class="h-20 w-20 shrink-0 rounded-lg object-cover"
        />
        <div class="min-w-0 flex-1">
          <p class="text-xs tracking-widest text-ouro uppercase">{{ segunda.hero.arquetipo }}</p>
          <h3 class="text-2xl uppercase">{{ segunda.hero.nome }}</h3>
          <DifficultyMeter :nivel="segunda.hero.dificuldade" />
          <p class="mt-2 text-sm text-suave">{{ segunda.hero.resumo }}</p>
          <ul v-if="segunda.razoes.length" class="mt-3 flex flex-wrap gap-2">
            <li v-for="r in segunda.razoes" :key="r" class="rounded-full bg-ouro/10 px-3 py-0.5 text-xs text-ouro first-letter:uppercase">
              {{ r }}
            </li>
          </ul>
        </div>
        <div class="flex flex-col items-start sm:items-center sm:px-4">
          <span class="font-display text-4xl text-ouro">{{ segunda.porcentagem }}%</span>
          <span class="text-xs text-suave">{{ rotuloCompatibilidade(segunda.porcentagem) }}</span>
        </div>
      </article>
      <VoteButtons
        :jogo="jogo"
        :personagem="origem.id"
        :nome-origem="origemInfo?.nome ?? origem.id"
        :heroi="segunda.hero"
        class="mt-3 px-1"
      />
    </section>
  </template>
</template>
