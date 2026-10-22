<script setup lang="ts">
import { ref } from 'vue'

// Mostra a imagem da Deadlock API; se ela faltar ou falhar, cai para as iniciais do herói.
defineProps<{ src?: string; nome: string }>()
const falhou = ref(false)
</script>

<template>
  <img v-if="src && !falhou" :src="src" :alt="nome" loading="lazy" @error="falhou = true" />
  <div v-else class="flex items-center justify-center bg-borda font-display text-2xl text-suave" :aria-label="nome">
    {{ nome.split(/[\s&]+/).map((p) => p[0]).join('').slice(0, 2) }}
  </div>
</template>
