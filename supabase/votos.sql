-- My Pick Deadlock: votos "concordo / não concordo".
-- Rode este arquivo inteiro no Supabase: SQL Editor → New query → colar → Run.
-- Pode rodar de novo sem problema (não apaga votos existentes).

create table if not exists public.votos (
  id bigint generated always as identity primary key,
  visitante uuid not null,                 -- id anônimo gerado no navegador de quem votou
  jogo text not null check (char_length(jogo) <= 30),
  personagem text not null check (char_length(personagem) <= 60),
  heroi int not null,
  opiniao text not null check (opiniao in ('like', 'dislike')),
  sugestao int,                            -- no dislike: herói que a pessoa acha que combina mais
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now(),
  unique (visitante, jogo, personagem, heroi)
);

-- Ninguém lê nem escreve direto na tabela pelo site: sem policies, o RLS bloqueia tudo.
-- O site só usa as três funções abaixo.
alter table public.votos enable row level security;

-- Registra ou troca o voto de um visitante em um par.
create or replace function public.votar(
  p_visitante uuid, p_jogo text, p_personagem text, p_heroi int, p_opiniao text, p_sugestao int default null
) returns void
language sql security definer set search_path = public as $$
  insert into votos (visitante, jogo, personagem, heroi, opiniao, sugestao)
  values (p_visitante, p_jogo, p_personagem, p_heroi, p_opiniao, p_sugestao)
  on conflict (visitante, jogo, personagem, heroi)
  do update set opiniao = excluded.opiniao, sugestao = excluded.sugestao, atualizado_em = now();
$$;

-- Desfaz o voto (clicar de novo no mesmo botão).
create or replace function public.remover_voto(
  p_visitante uuid, p_jogo text, p_personagem text, p_heroi int
) returns void
language sql security definer set search_path = public as $$
  delete from votos
  where visitante = p_visitante and jogo = p_jogo and personagem = p_personagem and heroi = p_heroi;
$$;

-- Totais de um campeão, por herói. Não expõe quem votou.
create or replace function public.contagem_votos(p_jogo text, p_personagem text)
returns table (heroi int, likes bigint, dislikes bigint)
language sql stable security definer set search_path = public as $$
  select v.heroi,
         count(*) filter (where v.opiniao = 'like'),
         count(*) filter (where v.opiniao = 'dislike')
  from votos v
  where v.jogo = p_jogo and v.personagem = p_personagem
  group by v.heroi;
$$;

revoke all on function public.votar(uuid, text, text, int, text, int) from public;
revoke all on function public.remover_voto(uuid, text, text, int) from public;
revoke all on function public.contagem_votos(text, text) from public;
grant execute on function public.votar(uuid, text, text, int, text, int) to anon, authenticated;
grant execute on function public.remover_voto(uuid, text, text, int) to anon, authenticated;
grant execute on function public.contagem_votos(text, text) to anon, authenticated;
