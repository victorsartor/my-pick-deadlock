<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { t } from '../i18n'
import { faixaCompatibilidade } from '../services/matcher'

const props = defineProps<{ valor: number }>()
const rotulo = computed(() => t(`rotulo.${faixaCompatibilidade(props.valor)}`))

const RAIO = 52
const circunferencia = 2 * Math.PI * RAIO

// O número sobe de 0 até o valor e o anel acompanha (pula direto se o sistema pede menos movimento).
const exibido = ref(0)
let quadro = 0
function animar(alvo: number) {
  cancelAnimationFrame(quadro)
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
    exibido.value = alvo
    return
  }
  const inicio = performance.now()
  const de = exibido.value
  const passo = (agora: number) => {
    const t = Math.min(1, (agora - inicio) / 900)
    exibido.value = Math.round(de + (alvo - de) * (1 - Math.pow(1 - t, 3)))
    if (t < 1) quadro = requestAnimationFrame(passo)
  }
  quadro = requestAnimationFrame(passo)
}
watch(() => props.valor, animar, { immediate: true })
onBeforeUnmount(() => cancelAnimationFrame(quadro))

const traco = computed(() => circunferencia * (1 - exibido.value / 100))
</script>

<template>
  <div class="flex shrink-0 flex-col items-center gap-2">
    <div class="relative h-36 w-36" role="img" :aria-label="t('gauge.aria', { valor, rotulo })">
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
          class="text-ouro"
          :stroke-dasharray="circunferencia"
          :stroke-dashoffset="traco"
        />
      </svg>
      <div class="absolute inset-0 flex flex-col items-center justify-center">
        <span class="font-display text-4xl font-bold tabular-nums">{{ exibido }}%</span>
        <span class="text-xs tracking-wider text-suave uppercase">{{ t('gauge.match') }}</span>
      </div>
    </div>
    <span class="rounded-full bg-ouro/10 px-3 py-0.5 text-sm text-ouro">{{ rotulo }}</span>
  </div>
</template>
