-- Consultas para você revisar os pares. Rode no Supabase: SQL Editor → New query.
-- (Rodam como administrador, por isso enxergam a tabela inteira.)

-- 1. Pares com mais "não concordo", do pior para o melhor.
select jogo, personagem, heroi,
       count(*) filter (where opiniao = 'like')    as concordam,
       count(*) filter (where opiniao = 'dislike') as discordam
from votos
group by jogo, personagem, heroi
order by discordam desc, concordam asc;

-- 2. Heróis sugeridos por quem não concordou.
select personagem, heroi as par_atual, sugestao as heroi_sugerido, count(*) as votos
from votos
where opiniao = 'dislike' and sugestao is not null
group by personagem, heroi, sugestao
order by votos desc;
