<script setup lang="ts">
import { t } from '../i18n'

defineProps<{ nivel: number }>()
</script>

<template>
  <span class="inline-flex items-center gap-1.5 text-xs" :title="t('dificuldade.titulo', { n: nivel })">
    <span class="flex gap-0.5" aria-hidden="true">
      <span v-for="i in 5" :key="i" class="h-2 w-2 rounded-sm" :class="i <= nivel ? 'bg-ouro' : 'bg-borda'" />
    </span>
    <span class="text-suave">{{ t(`dificuldade.${nivel}`) }}</span>
  </span>
</template>
