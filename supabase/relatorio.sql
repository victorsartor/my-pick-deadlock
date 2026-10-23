-- Consultas para você revisar os pares. Rode no Supabase: SQL Editor → New query → colar → Run.
-- (Rodam como administrador, por isso enxergam a tabela inteira.)
-- Rode uma consulta por vez: selecione o trecho dela antes de clicar em Run.

-- Nomes dos heróis (gerado a partir de src/data/deadlock/heroes.json).
create or replace view public.herois_nomes as
select * from (values
  (1, 'Infernus'),
  (2, 'Seven'),
  (3, 'Vindicta'),
  (4, 'Lady Geist'),
  (6, 'Abrams'),
  (7, 'Wraith'),
  (8, 'McGinnis'),
  (10, 'Paradox'),
  (11, 'Dynamo'),
  (12, 'Kelvin'),
  (13, 'Haze'),
  (14, 'Holliday'),
  (15, 'Bebop'),
  (16, 'Calico'),
  (17, 'Grey Talon'),
  (18, 'Mo & Krill'),
  (19, 'Shiv'),
  (20, 'Ivy'),
  (25, 'Warden'),
  (27, 'Yamato'),
  (31, 'Lash'),
  (35, 'Viscous'),
  (50, 'Pocket'),
  (52, 'Mirage'),
  (58, 'Vyper'),
  (60, 'Sinclair'),
  (63, 'Mina'),
  (64, 'Drifter'),
  (65, 'Venator'),
  (66, 'Victor'),
  (67, 'Paige'),
  (69, 'The Doorman'),
  (72, 'Billy'),
  (76, 'Graves'),
  (77, 'Apollo'),
  (78, 'Deadman Danny'),
  (79, 'Rem'),
  (80, 'Silver'),
  (81, 'Celeste'),
  (84, 'Rat King'),
  (85, 'Solomon'),
  (86, 'Violet'),
  (87, 'Nurse Harrow'),
  (88, 'Baba')
) as h(id, nome);

-- A view é só para você no painel; o site não precisa lê-la.
revoke all on public.herois_nomes from anon, authenticated;

-- 1. Placar de cada par, do mais rejeitado para o mais aceito.
select v.personagem as campeao,
       h.nome as heroi,
       count(*) filter (where v.opiniao = 'like')    as concordam,
       count(*) filter (where v.opiniao = 'dislike') as discordam,
       round(100.0 * count(*) filter (where v.opiniao = 'like') / count(*)) as pct_concordam
from votos v
left join herois_nomes h on h.id = v.heroi
group by v.personagem, h.nome
order by discordam desc, concordam asc;

-- 2. Heróis sugeridos por quem não concordou.
select v.personagem as campeao,
       atual.nome as par_atual,
       sugerido.nome as heroi_sugerido,
       count(*) as votos
from votos v
left join herois_nomes atual on atual.id = v.heroi
left join herois_nomes sugerido on sugerido.id = v.sugestao
where v.opiniao = 'dislike' and v.sugestao is not null
group by v.personagem, atual.nome, sugerido.nome
order by votos desc;

-- 3. Últimos 50 votos, do mais recente para o mais antigo.
select v.atualizado_em, v.personagem as campeao, h.nome as heroi, v.opiniao, s.nome as sugestao
from votos v
left join herois_nomes h on h.id = v.heroi
left join herois_nomes s on s.id = v.sugestao
order by v.atualizado_em desc
limit 50;
