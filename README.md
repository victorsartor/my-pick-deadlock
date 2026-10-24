# My Pick Deadlock

**Do seu main no LoL ao herói certo no Deadlock.**

🔗 https://my-pick-deadlock.vercel.app

## A ideia

Quem chega ao Deadlock vindo de outro jogo já tem anos de memória muscular e um jeito próprio de jogar. O My Pick Deadlock usa isso a favor: você escolhe o campeão que joga no League of Legends e o site recomenda o herói do Deadlock que mais combina com o seu estilo.

Para cada recomendação, o site mostra:

- **Porcentagem de compatibilidade** entre o campeão e o herói.
- **Por que combina**: o motivo do par e quais habilidades de um lembram as do outro.
- **Tríade de atributos** do herói, nas três cores do jogo: 🟠 Arma, 🟣 Espírito e 🟢 Vitalidade.
- **Habilidades lado a lado**: o kit do campeão e o do herói, com descrição, recarga e melhorias.
- **Vertentes de build**: formas diferentes de jogar o mesmo herói.
- **Dificuldade** do herói, de Fácil a Extrema.
- **Uma segunda opção**, para quem quiser explorar outro caminho.

A estrutura já está pronta para receber jogadores de outros jogos no futuro, como Dota 2, Overwatch 2 e Valorant.

## Como a porcentagem é calculada

**1. Notas de estilo.** Cada campeão e cada herói recebe uma nota de 0 a 10 em 11 eixos de jogabilidade. Cada eixo tem um peso, que define o quanto ele conta no cálculo:

| Eixo | Peso | Eixo | Peso |
|---|---|---|---|
| Alcance | 1,4 | Autocura | 0,8 |
| Mobilidade | 1,2 | Controle de grupo | 1,0 |
| Dano explosivo | 1,0 | Suporte ao time | 1,3 |
| Dano contínuo | 0,8 | Furtividade | 0,9 |
| Resistência | 1,2 | Foco em arma | 1,3 |
| | | Controle de área | 0,8 |

**2. Similaridade.** O site compara as notas eixo a eixo. Quanto menor a diferença entre os dois personagens, maior a porcentagem. Diferenças grandes pesam mais do que várias diferenças pequenas: um herói muito diferente em um ponto central do estilo perde mais pontos do que um herói levemente diferente em vários pontos.

**3. Curadoria.** Números não captam tudo. Por isso, cada campeão tem um herói principal escolhido à mão, com bônus de pontos e uma explicação do porquê. Também dá para fixar a segunda opção quando a temática ou o kit fazem mais sentido do que o cálculo puro.

**4. Dificuldade.** Campeões e heróis têm uma dificuldade de 1 (Fácil) a 5 (Extrema). Quando a diferença entre os dois passa de um nível, o herói perde pontos. Assim, quem joga um campeão simples não recebe como sugestão um herói que exige muita mecânica.

**5. Escala final.** Os pontos são convertidos para uma escala de 10% a 90%. Personagens de jogos diferentes nunca são idênticos, então nenhum par passa de 90%. A ordem dos heróis não muda, só o número fica mais realista. Junto da porcentagem aparece um rótulo:

| Porcentagem | Rótulo |
|---|---|
| 85% ou mais | Combina muito |
| 75% a 84% | Combina bem |
| 65% a 74% | Parecido |
| abaixo de 65% | Pouco parecido |

Os motivos em destaque na tela, como "Muita mobilidade" ou "Aguenta muito dano", são os eixos em que os dois personagens são fortes ao mesmo tempo.

## Idiomas

O site está em **português** e **inglês**. O seletor **PT | EN** fica no canto superior direito e a escolha fica salva no navegador; na primeira visita, o idioma segue o do navegador. Nomes e habilidades dos campeões e dos heróis vêm das APIs já no idioma escolhido, e os textos do site (motivos, resumos e builds) existem nas duas línguas.

## Feedback da comunidade

Cada recomendação tem os botões **Concordo** e **Não concordo**. Quem discorda pode indicar qual herói acha que combina mais. Esses votos são usados para revisar os pares.

Tem uma sugestão de par, encontrou algo estranho ou quer ver outro jogo no site? Me chama no X: **[@vitinhoosartor](https://x.com/vitinhoosartor)**.

## APIs e serviços usados

- **[Data Dragon](https://developer.riotgames.com/docs/lol#data-dragon)** (Riot Games, oficial): nomes, artes e habilidades dos campeões do League of Legends, em português e em inglês.
- **[Deadlock API](https://deadlock-api.com)** (projeto da comunidade, não oficial): imagens, nomes e habilidades dos heróis do Deadlock. Como o jogo está em beta, o site se atualiza sozinho quando a Valve muda algo.
- **[Community Dragon](https://www.communitydragon.org)**: ícones das posições do LoL.

Para o site abrir rápido, o que quase nunca muda (versão do LoL, nomes dos campeões, ícones e imagens dos heróis) é baixado a cada publicação e servido pelo próprio site; os ícones dos campeões viram WebP de ~3 KB. As habilidades continuam vindo das APIs na hora, e são pré-carregadas quando o mouse passa sobre um campeão.
- **[Supabase](https://supabase.com)**: armazenamento dos votos, de forma anônima.
- **[Vercel](https://vercel.com)**: hospedagem do site.

## Aviso legal

O My Pick Deadlock é um projeto de fã, sem fins lucrativos, e não é afiliado, patrocinado ou endossado pela Riot Games ou pela Valve.

League of Legends e todos os seus personagens, nomes e artes são marcas e propriedade da Riot Games, Inc. Deadlock e todos os seus personagens, nomes e artes são marcas e propriedade da Valve Corporation. As imagens e textos dos jogos são carregados dos serviços listados acima e pertencem aos seus respectivos donos.
