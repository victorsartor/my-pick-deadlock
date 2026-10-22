/** Remove ícones SVG e tags HTML das descrições vindas das APIs e normaliza espaços. */
export function textoLimpo(html: string | undefined): string {
  return String(html ?? '')
    .replace(/<svg[\s\S]*?<\/svg>/gi, '')
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<[^>]+>/g, '')
    .replace(/([.!?])(?=[A-ZÀ-Ú])/g, '$1 ')
    .replace(/\s+/g, ' ')
    .trim()
}
