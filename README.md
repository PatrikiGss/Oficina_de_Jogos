# Ping-Pong Multiplayer — Oficina de Jogos

Jogo de Ping-Pong **1×1 em rede local**, feito em JavaScript, para a oficina da
disciplina de **Atividade de Extensão III**. Duas máquinas na mesma rede, um
servidor Node.js no meio e o jogo rodando direto no navegador.

O repositório é o jogo **e** o material da aula de 3 horas: são **4 arquivos**,
cerca de **260 linhas** de código comentado, pensados para serem explicados
linha a linha para quem acabou de sair do Java.

---

## O jogo

Duas raquetes, uma bola, primeiro a fazer **5 pontos** vence. Cada jogador
está em um computador diferente.

- Uma dupla roda o servidor (`npm start`) e vira a "casa".
- A outra dupla abre `http://<ip-da-casa>:3000` no navegador.
- Os dois primeiros a conectar jogam (esquerda e direita). Quem chegar depois
  assiste.
- Acabou a partida, **Espaço** começa outra — dá para revezar os jogadores sem
  reiniciar nada.

Controles: <kbd>W</kbd>/<kbd>S</kbd> ou <kbd>↑</kbd>/<kbd>↓</kbd>. A sua raquete
aparece em verde.

## Como rodar

Precisa de **Node.js 18 ou mais novo** (`node --version`) só na máquina que
hospeda.

```bash
npm install
npm start
```

```
Jogo no ar! Nesta máquina: http://localhost:3000
Para a outra dupla:  http://192.168.0.3:3000
```

Para testar sozinho, abra `http://localhost:3000` em **duas abas**.

> Abre em `localhost` mas não na outra máquina? Quase sempre é o firewall do
> Windows (permita o Node em redes privadas) ou um Wi-Fi que isola os
> aparelhos. Soluções no [Plano B](docs/roteiro-aula.md#plano-b).

## Estrutura

```
Oficina_de_Jogos/
├── server.js              # servidor: entrega os arquivos + WebSocket + física
├── package.json           # uma dependência só: ws
├── public/                # o que vai para o navegador
│   ├── index.html         # a página com o <canvas>
│   ├── jogo.js            # AS REGRAS: medidas, estado, física, placar
│   └── cliente.js         # desenho, teclado e conexão com o servidor
├── etapas/                # pontos de partida e de resgate da aula
│   ├── 0-setup/           #   projeto inicial entregue às duplas
│   └── 2-jogo-local/      #   jogo sem rede (fim da Construção 2 / Plano B)
└── docs/
    ├── escopo-oficina.md  # escopo original: objetivo, público, cronograma
    └── roteiro-aula.md    # guia do instrutor, bloco a bloco
```

| Arquivo | Linhas de código | Responsabilidade |
| --- | --- | --- |
| `public/jogo.js` | 74 | Só regra. Não desenha, não sabe o que é rede — por isso roda **no navegador e no servidor** |
| `public/cliente.js` | 81 | Desenha o que o servidor manda e avisa o que o jogador apertou. Não calcula nada |
| `server.js` | 74 | Entrega os arquivos, decide quem joga em cada lado, roda a física e transmite o estado |
| `public/index.html` | 30 | O canvas e o texto de ajuda |

Cada arquivo é dividido em seções marcadas com o bloco da aula em que é
escrito (`// ----- Construção 2: física -----`).

## Como funciona

**O servidor manda; o navegador obedece.** O cliente nunca move a bola nem a
raquete: ele só diz "estou subindo" e desenha a foto do jogo que chega do
servidor. É isso que mantém as duas telas iguais — e impede alguém de trapacear
editando o próprio JavaScript.

```
  Navegador A                      Servidor (Node.js)                 Navegador B
  cliente.js                       server.js + jogo.js                cliente.js
      │                                    │                               │
      │── {"tipo":"mover","direcao":-1} ──►│◄── {"tipo":"mover",...} ──────│
      │                                    │                               │
      │                          atualizar(estado, dt)                     │
      │                            ~60x por segundo                        │
      │                                    │                               │
      │◄──────── {"tipo":"estado", ...} ───┴─── {"tipo":"estado", ...} ───►│
```

O `jogo.js` é o mesmo arquivo nos dois momentos da aula: na Construção 2 ele
roda no navegador (jogo local); na Construção 3 o servidor passa a importá-lo e
o navegador para de calcular. **A física muda de casa sem mudar uma linha.**

### Mensagens

Todas são JSON com um campo `tipo`.

| De → para | `tipo` | Conteúdo |
| --- | --- | --- |
| cliente → servidor | `mover` | `direcao`: `-1` sobe, `0` para, `1` desce |
| cliente → servidor | `reiniciar` | — (só vale depois que alguém venceu) |
| servidor → cliente | `lado` | `lado`: `"esquerda"`, `"direita"` ou `null` (espectador) |
| servidor → cliente | `estado` | `estado` (bola, raquetes, pontos, vencedor) e `aguardando` |

Para ver as mensagens ao vivo: **F12 → Network → WS → Messages**.

## A oficina em 3 blocos de construção

| Bloco | Arquivos | O que se escreve | Resultado na tela |
| --- | --- | --- | --- |
| Setup (0:25) | — | nada: `etapas/0-setup` é entregue pronto | página abre na máquina da outra dupla |
| Construção 1 (0:45) | `jogo.js`, `cliente.js` | medidas, estado inicial, desenho (~60 linhas) | campo, raquetes, bola e placar parados |
| Construção 2 (1:15) | `jogo.js`, `cliente.js` | física, colisão, placar, teclado (~75 linhas) | jogo completo, dois jogadores no mesmo teclado |
| Construção 3 (1:45) | `server.js`, `cliente.js` | WebSocket, e a física vai para o servidor (~90 linhas) | duas máquinas jogando uma contra a outra |

O passo a passo, com o que explicar em cada bloco, pontos de controle,
problemas comuns e o que fazer se a rede da sala não colaborar, está em
**[`docs/roteiro-aula.md`](docs/roteiro-aula.md)**.

## Decisões de simplicidade

O projeto é pequeno de propósito. Algumas coisas que **não** estão aqui, e por
quê:

| Ficou de fora | Motivo |
| --- | --- |
| Express ou outro framework | O servidor de arquivos tem 10 linhas e mostra o que um framework esconderia |
| Classes | Funções que recebem o estado são mais fáceis de ler de cima a baixo |
| Reconexão automática | Caiu, aperta F5. Menos código para explicar |
| Várias salas no mesmo servidor | Cada dupla roda o seu. Uma partida por servidor |
| Predição/interpolação no cliente | Em rede local o atraso é imperceptível |
| CSS em arquivo separado | São 15 linhas, ficam no próprio `index.html` |

## Fluxo de trabalho com Git

> Regras do projeto, mantidas desde a criação do repositório.

- Todo desenvolvimento acontece em **branches separadas**, criadas de acordo
  com a feature que será trabalhada.
- Concluída a feature, abra um **Pull Request** para análise e revisão dos
  demais membros da equipe.
- **Nunca desenvolva uma feature diretamente na `main`.** Alterações diretas na
  `main` devem ser restritas a ajustes pontuais.

```bash
git checkout -b feat/nome-da-feature
# ... desenvolve e testa com duas abas ...
git commit -m "feat: descrição curta"
git push -u origin feat/nome-da-feature
# abre o Pull Request e chama a revisão
```

Licença: [MIT](LICENSE.md).
