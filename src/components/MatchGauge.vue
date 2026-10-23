<script setup lang="ts">
import { computed } from 'vue'
import { rotuloCompatibilidade } from '../services/matcher'

const props = defineProps<{ valor: number }>()

const RAIO = 52
const circunferencia = 2 * Math.PI * RAIO
const traco = computed(() => circunferencia * (1 - props.valor / 100))
</script>

<template>
  <div class="flex shrink-0 flex-col items-center gap-2">
    <div class="relative h-36 w-36" role="img" :aria-label="`${valor}% de compatibilidade: ${rotuloCompatibilidade(valor)}`">
      <svg viewBox="0 0 120 120" class="h-full w-full -rotate-90">
        <circle cx="60" cy="60" :r="RAIO" fill="none" stroke="currentColor" stroke-width="10" class="text-borda" />
        <circle
          cx="60"
          cy="60"
          :r="RAIO"
          fill="none"
          stroke="currentColor"
          stroke-width="10"
          stroke-linecap="round"
          class="text-ouro transition-[stroke-dashoffset] duration-700"
          :stroke-dasharray="circunferencia"
          :stroke-dashoffset="traco"
        />
      </svg>
      <div class="absolute inset-0 flex flex-col items-center justify-center">
        <span class="font-display text-4xl font-bold">{{ valor }}%</span>
        <span class="text-xs tracking-wider text-suave uppercase">match</span>
      </div>
    </div>
    <span class="rounded-full bg-ouro/10 px-3 py-0.5 text-sm text-ouro">{{ rotuloCompatibilidade(valor) }}</span>
  </div>
</template>
