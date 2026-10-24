<script setup lang="ts">
import { t } from '../i18n'
import type { Foco } from '../types'

defineProps<{ triade: Record<Foco, number> }>()

const linhas: { foco: Foco; cor: string }[] = [
  { foco: 'arma', cor: 'bg-arma' },
  { foco: 'espirito', cor: 'bg-espirito' },
  { foco: 'vitalidade', cor: 'bg-vitalidade' },
]
</script>

<template>
  <ul class="space-y-4">
    <li v-for="(l, i) in linhas" :key="l.foco" :style="{ '--ordem': i }">
      <div class="mb-1 flex items-baseline justify-between text-sm">
        <span>
          <span class="font-semibold">{{ t('foco.' + l.foco) }}</span>
          <span class="ml-2 text-xs text-suave">{{ t('triade.' + l.foco) }}</span>
        </span>
        <span class="font-display">{{ triade[l.foco] }}/10</span>
      </div>
      <div class="h-2.5 overflow-hidden rounded-full bg-borda">
        <div :class="l.cor" class="animar-barra h-full rounded-full" :style="{ width: `${triade[l.foco] * 10}%` }" />
      </div>
    </li>
  </ul>
</template>
