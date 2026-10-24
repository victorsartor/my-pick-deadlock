import { ref } from 'vue'
import { en } from './en'
import { pt } from './pt'

export type Idioma = 'pt' | 'en'

const CHAVE_ARMAZENADA = 'idioma'
const dicionarios: Record<Idioma, Record<string, string>> = { pt, en }

/** Idioma salvo pela pessoa; sem escolha anterior, português para navegadores em português e inglês para os demais. */
function idiomaInicial(): Idioma {
  try {
    const salvo = localStorage.getItem(CHAVE_ARMAZENADA)
    if (salvo === 'pt' || salvo === 'en') return salvo
  } catch {
    // armazenamento bloqueado: segue para a detecção do navegador
  }
  return navigator.language?.toLowerCase().startsWith('pt') ? 'pt' : 'en'
}

export const idioma = ref<Idioma>(idiomaInicial())

export function trocarIdioma(novo: Idioma) {
  idioma.value = novo
  try {
    localStorage.setItem(CHAVE_ARMAZENADA, novo)
  } catch {
    // sem armazenamento: vale só até recarregar
  }
}

function aplicar(texto: string, params?: Record<string, string | number>) {
  return params ? texto.replace(/\{(\w+)\}/g, (_, nome) => String(params[nome] ?? `{${nome}}`)) : texto
}

/** Tradução reativa: nos templates, trocar o idioma atualiza o texto sozinho. */
export function t(chave: string, params?: Record<string, string | number>): string {
  return tEm(idioma.value, chave, params)
}

/** Tradução em um idioma específico (usada por quem monta textos para guardar em cache por idioma). */
export function tEm(lingua: Idioma, chave: string, params?: Record<string, string | number>): string {
  return aplicar(dicionarios[lingua][chave] ?? pt[chave as keyof typeof pt] ?? chave, params)
}

/** Locale para ordenar nomes (Intl). */
export const localeDe = (lingua: Idioma) => (lingua === 'pt' ? 'pt-BR' : 'en')
