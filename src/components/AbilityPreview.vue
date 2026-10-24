<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { t } from '../i18n'
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

    <p v-if="erro" class="text-sm text-suave">{{ t('ability.erro') }}</p>
    <!-- Esqueleto pulsando enquanto as habilidades chegam, no mesmo formato da lista final. -->
    <div v-else-if="!habilidades" :aria-label="t('ability.carregando')" class="animate-pulse">
      <div class="mb-4 flex gap-2">
        <div v-for="n in 4" :key="n" class="h-14 w-14 rounded-lg bg-borda/70" />
      </div>
      <div class="mb-3 h-4 w-40 rounded bg-borda/70" />
      <div class="space-y-2">
        <div class="h-3 rounded bg-borda/50" />
        <div class="h-3 w-11/12 rounded bg-borda/50" />
        <div class="h-3 w-3/4 rounded bg-borda/50" />
      </div>
    </div>

    <template v-else>
      <div class="mb-4 flex flex-wrap gap-2" role="tablist">
        <button
          v-for="(h, i) in habilidades"
          :key="h.tecla"
          type="button"
          role="tab"
          :aria-selected="selecionada === i"
          :title="h.nome"
          class="relative h-14 w-14 overflow-hidden rounded-lg border-2 transition duration-200 active:scale-95"
          :class="[
            selecionada === i ? 'scale-105 border-ouro shadow-[0_0_14px_-4px] shadow-ouro/70' : 'border-borda opacity-70 hover:-translate-y-0.5 hover:opacity-100',
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
      <Transition name="troca" mode="out-in">
        <div v-if="atual" :key="atual.tecla" role="tabpanel" class="min-h-0 flex-1 overflow-y-auto pr-2">
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
        </div>
      </Transition>
    </template>
  </section>
</template>
