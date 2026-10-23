<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue'
import { useAssets } from '../composables/useAssets'
import HeroImage from './HeroImage.vue'

// Lista de heróis com foto e busca, no lugar do <select> nativo (que não aceita imagens).
const props = defineProps<{
  herois: { id: number; nome: string }[]
  modelValue?: number
  placeholder?: string
}>()
const emit = defineEmits<{ 'update:modelValue': [id: number] }>()

const assets = useAssets()
const aberto = ref(false)
const busca = ref('')
const destacado = ref(0)
const raiz = ref<HTMLElement | null>(null)
const campoBusca = ref<HTMLInputElement | null>(null)
const lista = ref<HTMLElement | null>(null)

const selecionado = computed(() => props.herois.find((h) => h.id === props.modelValue))
const filtrados = computed(() => {
  const termo = busca.value.trim().toLowerCase()
  return termo ? props.herois.filter((h) => h.nome.toLowerCase().includes(termo)) : props.herois
})
watch(filtrados, () => (destacado.value = 0))

async function abrir() {
  aberto.value = true
  busca.value = ''
  destacado.value = Math.max(0, filtrados.value.findIndex((h) => h.id === props.modelValue))
  await nextTick()
  campoBusca.value?.focus()
  rolarAteDestacado()
}

function fechar() {
  aberto.value = false
}

function escolher(id: number) {
  emit('update:modelValue', id)
  fechar()
}

function rolarAteDestacado() {
  lista.value?.querySelectorAll('[role=option]')[destacado.value]?.scrollIntoView({ block: 'nearest' })
}

function teclado(e: KeyboardEvent) {
  if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
    e.preventDefault()
    const passo = e.key === 'ArrowDown' ? 1 : -1
    destacado.value = (destacado.value + passo + filtrados.value.length) % Math.max(1, filtrados.value.length)
    nextTick(rolarAteDestacado)
  } else if (e.key === 'Enter') {
    e.preventDefault()
    const h = filtrados.value[destacado.value]
    if (h) escolher(h.id)
  } else if (e.key === 'Escape') {
    fechar()
  }
}

function cliqueFora(e: MouseEvent) {
  if (raiz.value && !raiz.value.contains(e.target as Node)) fechar()
}
watch(aberto, (a) => (a ? document.addEventListener('mousedown', cliqueFora) : document.removeEventListener('mousedown', cliqueFora)))
onBeforeUnmount(() => document.removeEventListener('mousedown', cliqueFora))
</script>

<template>
  <div ref="raiz" class="relative inline-block">
    <button
      type="button"
      class="flex min-w-48 items-center gap-2 rounded-md border bg-fundo px-2 py-1 text-left text-sm transition"
      :class="aberto ? 'border-ouro' : 'border-borda hover:border-suave'"
      aria-haspopup="listbox"
      :aria-expanded="aberto"
      @click="aberto ? fechar() : abrir()"
    >
      <template v-if="selecionado">
        <HeroImage :src="assets.deadlock[selecionado.id]?.pequeno" :nome="selecionado.nome" class="h-6 w-6 rounded object-cover text-[10px]" />
        <span class="flex-1">{{ selecionado.nome }}</span>
      </template>
      <span v-else class="flex-1 text-suave">{{ placeholder ?? 'Escolha um herói…' }}</span>
      <svg viewBox="0 0 20 20" class="h-4 w-4 text-suave transition" :class="aberto ? 'rotate-180' : ''" fill="currentColor" aria-hidden="true">
        <path d="M5.3 7.3a1 1 0 0 1 1.4 0L10 10.6l3.3-3.3a1 1 0 1 1 1.4 1.4l-4 4a1 1 0 0 1-1.4 0l-4-4a1 1 0 0 1 0-1.4Z" />
      </svg>
    </button>

    <div
      v-if="aberto"
      class="absolute bottom-full left-0 z-20 mb-1 w-64 overflow-hidden rounded-lg border border-borda bg-painel shadow-2xl shadow-black/60"
    >
      <input
        ref="campoBusca"
        v-model="busca"
        type="text"
        placeholder="Buscar herói…"
        aria-label="Buscar herói"
        class="w-full border-b border-borda bg-fundo px-3 py-2 text-sm outline-none placeholder:text-suave"
        @keydown="teclado"
      />
      <ul ref="lista" role="listbox" class="max-h-64 overflow-y-auto py-1">
        <li
          v-for="(h, i) in filtrados"
          :key="h.id"
          role="option"
          :aria-selected="h.id === modelValue"
          class="flex cursor-pointer items-center gap-2 px-2 py-1.5 text-sm"
          :class="[i === destacado ? 'bg-ouro/15 text-ouro' : 'text-texto', h.id === modelValue ? 'font-semibold' : '']"
          @mouseenter="destacado = i"
          @click="escolher(h.id)"
        >
          <HeroImage :src="assets.deadlock[h.id]?.pequeno" :nome="h.nome" class="h-7 w-7 shrink-0 rounded object-cover text-[10px]" />
          {{ h.nome }}
        </li>
        <li v-if="!filtrados.length" class="px-3 py-2 text-sm text-suave">Nenhum herói encontrado.</li>
      </ul>
    </div>
  </div>
</template>
