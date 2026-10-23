const emAndamento = new Map<string, Promise<unknown>>()

/**
 * Evita buscar a mesma coisa duas vezes ao mesmo tempo: quem pedir a mesma chave enquanto a
 * primeira busca não terminou recebe a mesma promessa (ex.: pré-carregamento no hover + clique).
 */
export function semDuplicar<T>(chave: string, buscar: () => Promise<T>): Promise<T> {
  const atual = emAndamento.get(chave) as Promise<T> | undefined
  if (atual) return atual
  const nova = buscar().finally(() => emAndamento.delete(chave))
  emAndamento.set(chave, nova)
  return nova
}

/** Cache simples em localStorage. Falha em silêncio (modo privado, armazenamento bloqueado). */
export function lerCache<T>(chave: string, validadeMs: number): T | null {
  try {
    const bruto = localStorage.getItem(chave)
    if (!bruto) return null
    const { salvoEm, dados } = JSON.parse(bruto) as { salvoEm: number; dados: T }
    return Date.now() - salvoEm < validadeMs ? dados : null
  } catch {
    return null
  }
}

export function gravarCache<T>(chave: string, dados: T): void {
  try {
    localStorage.setItem(chave, JSON.stringify({ salvoEm: Date.now(), dados }))
  } catch {
    // sem cache, segue sem ele
  }
}
