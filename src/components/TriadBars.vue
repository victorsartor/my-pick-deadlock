<script setup lang="ts">
import type { Foco } from '../types'

defineProps<{ triade: Record<Foco, number> }>()

const linhas: { foco: Foco; titulo: string; legenda: string; cor: string }[] = [
  { foco: 'arma', titulo: 'Arma', legenda: 'Dano balístico', cor: 'bg-arma' },
  { foco: 'espirito', titulo: 'Espírito', legenda: 'Dano de habilidades', cor: 'bg-espirito' },
  { foco: 'vitalidade', titulo: 'Vitalidade', legenda: 'Vida, escudos e resistências', cor: 'bg-vitalidade' },
]
</script>

<template>
  <ul class="space-y-4">
    <li v-for="l in linhas" :key="l.foco">
      <div class="mb-1 flex items-baseline justify-between text-sm">
        <span>
          <span class="font-semibold">{{ l.titulo }}</span>
          <span class="ml-2 text-xs text-suave">{{ l.legenda }}</span>
        </span>
        <span class="font-display">{{ triade[l.foco] }}/10</span>
      </div>
      <div class="h-2.5 overflow-hidden rounded-full bg-borda">
        <div :class="l.cor" class="h-full rounded-full transition-[width] duration-700" :style="{ width: `${triade[l.foco] * 10}%` }" />
      </div>
    </li>
  </ul>
</template>
