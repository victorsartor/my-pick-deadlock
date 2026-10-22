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
