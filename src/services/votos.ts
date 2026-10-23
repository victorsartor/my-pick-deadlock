// Votos "concordo / não concordo" em cada par campeão → herói.
//
// O voto de quem está navegando fica sempre no navegador (para os botões lembrarem a escolha).
// Se VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY estiverem configuradas, o voto também vai para o
// Supabase e a contagem da comunidade aparece nos botões. Sem elas, tudo funciona só localmente.
// O banco é criado com supabase/votos.sql.

export type Opiniao = 'like' | 'dislike'

export interface Par {
  jogo: string
  personagem: string
  heroi: number
}

export interface Voto extends Par {
  opiniao: Opiniao
  /** No dislike, o herói que a pessoa acha que combina mais. */
  sugestao?: number
  em: string
}

export interface Contagem {
  likes: number
  dislikes: number
}

export const SUPABASE_URL: string | undefined = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_KEY: string | undefined = import.meta.env.VITE_SUPABASE_ANON_KEY
export const votosOnline = Boolean(SUPABASE_URL && SUPABASE_KEY)

// ---------- navegador ----------

const PREFIXO = 'voto:'

export const chaveVoto = (p: Par) => `${p.jogo}/${p.personagem}/${p.heroi}`

export function lerVoto(p: Par): Voto | null {
  try {
    const bruto = localStorage.getItem(PREFIXO + chaveVoto(p))
    return bruto ? (JSON.parse(bruto) as Voto) : null
  } catch {
    return null
  }
}

function gravarLocal(p: Par, voto: Voto | null) {
  try {
    if (voto) localStorage.setItem(PREFIXO + chaveVoto(p), JSON.stringify(voto))
    else localStorage.removeItem(PREFIXO + chaveVoto(p))
  } catch {
    // sem armazenamento disponível: o voto vale só até recarregar a página
  }
}

/** Id anônimo e aleatório deste navegador, para o banco saber que dois votos são da mesma pessoa. */
function visitante(): string {
  try {
    let id = localStorage.getItem('visitante')
    if (!id) {
      id = crypto.randomUUID()
      localStorage.setItem('visitante', id)
    }
    return id
  } catch {
    return crypto.randomUUID()
  }
}

// ---------- Supabase ----------

async function rpc<T>(funcao: string, args: Record<string, unknown>): Promise<T> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json', apikey: SUPABASE_KEY! }
  // Chaves antigas ("anon", em formato JWT) também precisam ir no Authorization.
  if (SUPABASE_KEY!.startsWith('eyJ')) headers.Authorization = `Bearer ${SUPABASE_KEY}`
  const r = await fetch(`${SUPABASE_URL}/rest/v1/rpc/${funcao}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(args),
  })
  if (!r.ok) throw new Error(`Supabase respondeu ${r.status}`)
  const texto = await r.text()
  return (texto ? JSON.parse(texto) : null) as T
}

const contagensEmAndamento = new Map<string, Promise<Record<number, Contagem>>>()

/** Totais da comunidade para todos os heróis de um campeão. Null quando o Supabase não está configurado. */
export function carregarContagem(jogo: string, personagem: string): Promise<Record<number, Contagem>> | null {
  if (!votosOnline) return null
  const chave = `${jogo}/${personagem}`
  let promessa = contagensEmAndamento.get(chave)
  if (!promessa) {
    promessa = rpc<{ heroi: number; likes: number; dislikes: number }[]>('contagem_votos', {
      p_jogo: jogo,
      p_personagem: personagem,
    }).then((linhas) => Object.fromEntries(linhas.map((l) => [l.heroi, { likes: Number(l.likes), dislikes: Number(l.dislikes) }])))
    promessa.catch(() => contagensEmAndamento.delete(chave))
    contagensEmAndamento.set(chave, promessa)
  }
  return promessa
}

// ---------- registrar ----------

/** Salva (ou apaga, com opiniao null) o voto no navegador e, se configurado, no Supabase. */
export function registrarVoto(p: Par, opiniao: Opiniao | null, sugestao?: number): Voto | null {
  const voto = opiniao ? { ...p, opiniao, sugestao, em: new Date().toISOString() } : null
  gravarLocal(p, voto)
  contagensEmAndamento.delete(`${p.jogo}/${p.personagem}`)

  if (votosOnline) {
    const base = { p_visitante: visitante(), p_jogo: p.jogo, p_personagem: p.personagem, p_heroi: p.heroi }
    const envio = voto
      ? rpc('votar', { ...base, p_opiniao: voto.opiniao, p_sugestao: voto.sugestao ?? null })
      : rpc('remover_voto', base)
    envio.catch((e) => console.warn('Não foi possível enviar o voto:', e))
  }
  return voto
}
