<script setup lang="ts">
import { NOMES_DIFICULDADE } from '../services/matcher'

defineProps<{ nivel: number }>()
</script>

<template>
  <span class="inline-flex items-center gap-1.5 text-xs" :title="`Dificuldade ${nivel} de 5`">
    <span class="flex gap-0.5" aria-hidden="true">
      <span v-for="i in 5" :key="i" class="h-2 w-2 rounded-sm" :class="i <= nivel ? 'bg-ouro' : 'bg-borda'" />
    </span>
    <span class="text-suave">{{ NOMES_DIFICULDADE[nivel] }}</span>
  </span>
</template>
