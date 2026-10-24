<script setup lang="ts">
import { idioma, t, trocarIdioma, type Idioma } from '../i18n'

const opcoes: { id: Idioma; sigla: string; nome: string }[] = [
  { id: 'pt', sigla: 'PT', nome: 'Português' },
  { id: 'en', sigla: 'EN', nome: 'English' },
]
</script>

<template>
  <div class="inline-flex rounded-full border border-borda bg-painel p-0.5 text-xs" role="group" :aria-label="t('idioma.aria')">
    <button
      v-for="o in opcoes"
      :key="o.id"
      type="button"
      :lang="o.id"
      :title="o.nome"
      :aria-pressed="idioma === o.id"
      class="rounded-full px-3 py-1 font-medium tracking-wider transition duration-200"
      :class="idioma === o.id ? 'bg-ouro/15 text-ouro' : 'text-suave hover:text-texto'"
      @click="trocarIdioma(o.id)"
    >
      {{ o.sigla }}
    </button>
  </div>
</template>
