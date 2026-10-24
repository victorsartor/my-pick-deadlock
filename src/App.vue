<script setup lang="ts">
import { RouterView } from 'vue-router'
import LanguageSwitch from './components/LanguageSwitch.vue'
import Logo from './components/Logo.vue'
import { t } from './i18n'
</script>

<template>
  <div class="flex min-h-screen flex-col">
    <header class="border-b border-borda/70">
      <div class="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Logo />
        <div class="flex items-center gap-4">
          <span class="hidden text-sm text-suave sm:block">{{ t('app.tagline') }}</span>
          <LanguageSwitch />
        </div>
      </div>
    </header>

    <main class="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
      <!-- A chave muda só ao trocar de tela ou de campeão (filtros na URL não reanimam a Home). -->
      <RouterView v-slot="{ Component, route }">
        <div :key="`${String(route.name)}/${route.params.personagem ?? ''}`" class="animar-entrada">
          <component :is="Component" />
        </div>
      </RouterView>
    </main>

    <footer class="border-t border-borda/70 px-4 py-6 text-center text-xs leading-relaxed text-suave">
      {{ t('app.rodape') }}
      <a href="https://deadlock-api.com" class="underline hover:text-texto" target="_blank" rel="noopener">deadlock-api.com</a>.
    </footer>
  </div>
</template>
