# My Pick Deadlock

Recomenda um herói do Deadlock a partir do campeão que você joga no League of Legends.
Vue 3 + Vite + Tailwind, 100% estático (Vercel/Netlify).

## Rodar

```bash
npm install
npm run dev     # http://localhost:5173
npm test        # valida dados e motor de match
npm run build   # gera dist/ para deploy
```

## Onde fica cada coisa

| Arquivo | O que é |
|---|---|
| `src/data/axes.json` | Os 11 eixos de estilo (alcance, mobilidade…) e o peso de cada um |
| `src/data/deadlock/heroes.json` | Heróis: vetor de estilo, tríade (arma/espírito/vitalidade), resumo e builds |
| `src/data/games/lol.json` | Campeões do LoL: função e vetor de estilo |
| `src/data/mappings/lol.json` | Par recomendado, motivo e habilidades paralelas por campeão |
| `src/data/sources.json` | Jogos de origem (LoL ativo; Dota 2, OW2, Valorant "em breve") |
| `src/services/matcher.ts` | Cálculo da compatibilidade |

**Como o % é calculado:** similaridade ponderada entre os vetores (0 a 10 em cada eixo) × 100,
mais um bônus de 12 pontos para o herói indicado no mapeamento. Limitado a 1–99%.

**Revisando os dados:** altere os números dos vetores ou o texto e rode `npm test`.
O teste avisa se algum vetor ficou fora de 0–10, se faltou mapeamento ou se um herói ficou sem par.

## APIs usadas

### Data Dragon (Riot, oficial)
- Versões: `https://ddragon.leagueoflegends.com/api/versions.json` (a primeira é a atual)
- Campeões em pt-BR: `https://ddragon.leagueoflegends.com/cdn/<versão>/data/pt_BR/champion.json`
- Ícone: `https://ddragon.leagueoflegends.com/cdn/<versão>/img/champion/<Id>.png`
- Splash: `https://ddragon.leagueoflegends.com/cdn/img/champion/splash/<Id>_0.jpg`
- Habilidades (Passiva + Q/W/E/R): `https://ddragon.leagueoflegends.com/cdn/<versão>/data/pt_BR/champion/<Id>.json`

Não precisa de chave. O `<Id>` é o campo `id` do champion.json (ex.: `MissFortune`, `DrMundo`).

### Deadlock API (comunidade, não oficial)
- Documentação: https://api.deadlock-api.com/docs
- Heróis: `https://api.deadlock-api.com/v1/assets/heroes?language=english&only_active=true`
- Habilidades de um herói: `https://api.deadlock-api.com/v1/assets/items/by-hero-id/<id>?language=brazilian`
  (a ordem 1–4 vem de `items.signature1..4` no endpoint de heróis)

Não precisa de chave. O antigo `assets.deadlock-api.com` foi desativado; tudo agora fica em `api.deadlock-api.com/v1/assets/...`.
O app guarda as respostas no `localStorage` (6 h Deadlock, 24 h Riot).

## Adicionar um jogo de origem

1. Crie `src/data/games/<jogo>.json` e `src/data/mappings/<jogo>.json` no mesmo formato do LoL.
2. Registre em `src/data/index.ts` e mude `ativo` para `true` em `sources.json`.
3. Crie um serviço de imagens para o jogo, como `dataDragon.ts`.

## Aviso legal

Projeto de fã, sem afiliação com a Riot Games ou a Valve.
