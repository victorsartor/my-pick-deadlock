<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { Habilidade } from '../types'

const props = defineProps<{
  titulo: string
  habilidades: Habilidade[] | null
  erro?: boolean
  /** Ícones do Deadlock são símbolos brancos e precisam de fundo; os do LoL já são quadrados coloridos. */
  estilo: 'lol' | 'deadlock'
}>()

const selecionada = ref(0)
watch(
  () => props.habilidades,
  () => (selecionada.value = 0),
)
const atual = computed(() => props.habilidades?.[selecionada.value])
</script>

<template>
  <section class="flex h-[26rem] flex-col rounded-xl border border-borda bg-painel p-5">
    <h3 class="mb-4 text-lg uppercase">{{ titulo }}</h3>

    <p v-if="erro" class="text-sm text-suave">Não foi possível carregar as habilidades agora.</p>
    <p v-else-if="!habilidades" class="text-sm text-suave">Carregando habilidades…</p>

    <template v-else>
      <div class="mb-4 flex flex-wrap gap-2" role="tablist">
        <button
          v-for="(h, i) in habilidades"
          :key="h.tecla"
          type="button"
          role="tab"
          :aria-selected="selecionada === i"
          :title="h.nome"
          class="relative h-14 w-14 overflow-hidden rounded-lg border-2 transition"
          :class="[
            selecionada === i ? 'border-ouro' : 'border-borda opacity-70 hover:opacity-100',
            estilo === 'deadlock' ? 'bg-gradient-to-b from-[#3a3128] to-[#1f1a15] p-2' : '',
          ]"
          @click="selecionada = i"
        >
          <img :src="h.icone" :alt="h.nome" class="h-full w-full object-contain" loading="lazy" />
          <span class="absolute right-0 bottom-0 rounded-tl bg-fundo/90 px-1 font-display text-[11px] leading-4">
            {{ h.tecla }}
          </span>
        </button>
      </div>

      <!-- Altura fixa com rolagem interna: trocar de habilidade não mexe no layout da página -->
      <div v-if="atual" role="tabpanel" class="min-h-0 flex-1 overflow-y-auto pr-2">

        <p class="font-semibold">
          {{ atual.nome }}
          <span v-if="atual.nomeOriginal && atual.nomeOriginal !== atual.nome" class="ml-1 text-sm font-normal text-suave">
            ({{ atual.nomeOriginal }})
          </span>
        </p>
        <ul v-if="atual.stats.length" class="mt-2 flex flex-wrap gap-2">
          <li v-for="s in atual.stats" :key="s.label" class="rounded bg-borda/60 px-2 py-0.5 text-xs">
            <span class="text-suave">{{ s.label }}:</span> {{ s.valor }}
          </li>
        </ul>
        <p class="mt-3 text-sm leading-relaxed text-suave">{{ atual.descricao }}</p>
        <ol v-if="atual.melhorias.length" class="mt-4 space-y-1.5 text-sm">
          <li v-for="(m, i) in atual.melhorias" :key="i" class="flex gap-2">
            <span class="h-5 shrink-0 self-start rounded bg-espirito/20 px-1.5 font-display text-xs leading-5 text-espirito">T{{ i + 1 }}</span>
            <span>{{ m }}</span>
          </li>
        </ol>
      </div>
    </template>
  </section>
</template>
