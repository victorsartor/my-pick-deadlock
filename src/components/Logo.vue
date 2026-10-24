<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { t } from '../i18n'

// Marca: um hexágono (o mapa e o formato dos cards) com uma mira no centro (a escolha do herói).
// As cores vêm do tema: ouro para a moldura e o ponto, texto claro para a mira.
</script>

<template>
  <RouterLink to="/" class="group inline-flex items-center gap-3" :aria-label="t('logo.aria')">
    <svg viewBox="0 0 120 120" class="h-10 w-10 shrink-0 transition-transform duration-300 group-hover:rotate-6" aria-hidden="true">
      <polygon points="60,6 106,33 106,87 60,114 14,87 14,33" fill="var(--color-painel)" stroke="var(--color-ouro)" stroke-width="6" stroke-linejoin="round" />
      <circle cx="60" cy="60" r="24" fill="none" stroke="var(--color-texto)" stroke-width="4.5" />
      <path d="M60 24v12M60 84v12M24 60h12M84 60h12" stroke="var(--color-texto)" stroke-width="4.5" stroke-linecap="round" />
      <circle cx="60" cy="60" r="6.5" fill="var(--color-ouro)" class="transition-transform duration-300 group-hover:scale-125" style="transform-box: fill-box; transform-origin: center" />
    </svg>
    <span class="font-display text-xl leading-none tracking-wide uppercase">
      My Pick <span class="text-ouro">Deadlock</span>
    </span>
  </RouterLink>
</template>
