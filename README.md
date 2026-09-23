# Ping-Pong Multiplayer — Oficina de Jogos

Jogo de Ping-Pong **1×1 em rede local**, feito em JavaScript puro, para a oficina
da disciplina de **Atividade de Extensão III**. Duas máquinas na mesma rede, um
servidor Node.js no meio, e o jogo rodando direto no navegador — sem instalar
nada além do Node na máquina que hospeda.

O repositório é, ao mesmo tempo, **o jogo** e **o material didático**: cada
arquivo é curto, comentado em português e pensado para ser explicado linha a
linha durante a aula de 3 horas.

---

## Índice

1. [A ideia do jogo](#1-a-ideia-do-jogo)
2. [Como rodar](#2-como-rodar)
3. [Estrutura do projeto](#3-estrutura-do-projeto)
4. [Como as peças conversam](#4-como-as-peças-conversam)
5. [O protocolo, em uma olhada](#5-o-protocolo-em-uma-olhada)
6. [O que já funciona e o que falta](#6-o-que-já-funciona-e-o-que-falta)
7. [Por onde começar a contribuir](#7-por-onde-começar-a-contribuir)
8. [Fluxo de trabalho com Git](#8-fluxo-de-trabalho-com-git)
9. [Vindo de Java? Leia isto](#9-vindo-de-java-leia-isto)
10. [Documentação completa](#10-documentação-completa)

---

## 1. A ideia do jogo

Ping-Pong clássico: duas raquetes, uma bola, primeiro a fazer **5 pontos**
vence. A diferença é que os dois jogadores estão em **computadores diferentes**.

- Uma das duplas roda o servidor (`npm start`) e vira a "casa".
- A outra dupla abre `http://<ip-da-casa>:3000` no navegador.
- Os dois primeiros navegadores a conectar viram jogadores — esquerda e direita.
  Quem chegar depois entra como **espectador** e assiste à partida ao vivo.

O ponto pedagógico do jogo é a arquitetura: **o navegador não calcula nada**.
Ele manda "estou subindo", "parei", e desenha a foto do jogo que o servidor
devolve 60 vezes por segundo. Isso é o que faz as duas telas mostrarem a mesma
partida — e o que impede alguém de trapacear mexendo no próprio JavaScript.

**Tecnologias:** Node.js + [`ws`](https://github.com/websockets/ws) no servidor,
HTML5 Canvas + WebSocket no cliente. Uma única dependência no projeto inteiro.

## 2. Como rodar

Você precisa de **Node.js 18 ou superior** (`node --version` para conferir).

```bash
npm install
npm start
```

O console mostra os endereços:

```
  Servidor no ar na porta 3000

  Nesta maquina:   http://localhost:3000
  Na rede local:   http://192.168.0.33:3000
```

- **Testando sozinho:** abra `http://localhost:3000` em duas abas. A primeira
  fica com a raquete da esquerda, a segunda com a da direita.
- **Jogando com outra dupla:** passe o endereço "na rede local" para eles. Só a
  máquina que roda o servidor precisa ter Node instalado.

Controles: <kbd>W</kbd>/<kbd>S</kbd> ou <kbd>↑</kbd>/<kbd>↓</kbd>.

Durante o desenvolvimento, `npm run dev` reinicia o servidor sozinho a cada
alteração nos arquivos.

> **A outra máquina não conecta?** Quase sempre é o firewall do Windows
> bloqueando a porta 3000 na primeira execução — aceite o aviso que aparece ao
> subir o servidor, ou libere a porta manualmente. Confirme também que as duas
> máquinas estão na mesma rede (`ping <ip-da-casa>`).

## 3. Estrutura do projeto

```
Oficina_de_Jogos/
├── package.json              # dependências e scripts (npm start / npm run dev)
├── README.md                 # este arquivo
│
├── server/                   # roda no Node.js — a "fonte da verdade" do jogo
│   ├── server.js             # entrada: sobe HTTP + WebSocket na mesma porta
│   ├── estatico.js           # serve public/ e shared/ por HTTP, sem dependência
│   ├── rede-local.js         # descobre e imprime o IP da máquina na rede
│   ├── sala.js               # conexões, quem é jogador, relógio de 60 ticks/s
│   └── jogo.js               # regras: estado, física, colisões e placar
│
├── public/                   # roda no navegador — só desenha e envia comandos
│   ├── index.html            # o canvas e o placar
│   ├── css/estilo.css        # visual da página em volta do jogo
│   └── js/
│       ├── main.js           # junta as três peças abaixo e roda o laço de desenho
│       ├── rede.js           # WebSocket do cliente (com reconexão automática)
│       ├── entrada.js        # teclado → direção
│       ├── render.js         # desenho no Canvas 2D
│       └── geometria.js      # posições derivadas das constantes
│
├── shared/
│   └── constantes.js         # medidas e tipos de mensagem — importado pelos DOIS lados
│
└── docs/
    ├── escopo-oficina.md     # o escopo original da oficina (3h, cronograma)
    ├── arquitetura.md        # por que servidor autoritativo, diagramas, limites
    ├── protocolo.md          # cada mensagem WebSocket, com exemplos de JSON
    └── roadmap.md            # as sprints, o que cada uma entrega
```

### O que cada arquivo faz, com mais calma

**`server/server.js`** — o ponto de entrada. Cria um servidor HTTP e pendura o
servidor WebSocket nele, para os dois usarem a **mesma porta 3000**. Sem isso o
aluno teria que decorar duas portas diferentes.

**`server/estatico.js`** — entrega os arquivos do cliente. Escrito à mão (em vez
de usar Express) por dois motivos: mantém o projeto com uma dependência só, e
mostra que "servir um site" é ler arquivo do disco e devolver com o
`Content-Type` certo. Também bloqueia o clássico `../../` na URL.

**`server/rede-local.js`** — lista os IPv4 da máquina, ignorando loopback e
interfaces virtuais. Existe só para o instrutor não precisar rodar `ipconfig` a
cada início de aula.

**`server/sala.js`** — a ponte entre a rede e o jogo. Decide quem é jogador e
quem é espectador, traduz mensagem em chamada de função, roda o relógio de 60
ticks por segundo e transmite o estado. É aqui que mora a regra de segurança
mais importante: o lado que cada conexão controla vem do **registro do
servidor**, nunca do que o cliente mandou.

**`server/jogo.js`** — as regras, em funções simples que recebem o estado e o
alteram. Sem classe, sem herança, sem framework: dá para ler de cima a baixo.
É o único arquivo que a Sprint 2 precisa tocar.

**`public/js/main.js`** — o "maestro". Liga o teclado à rede, guarda o último
estado recebido e chama o desenho a cada frame.

**`public/js/rede.js`** — todo o WebSocket do cliente. Monta o endereço a partir
de `location.host`, então o mesmo arquivo funciona em `localhost` e no IP da
rede sem ninguém editar código. Reconecta sozinho com espera crescente.

**`public/js/entrada.js`** — traduz teclado em `-1`, `0` ou `1`, e só avisa
quando a direção **muda**. Sem esse cuidado, segurar a tecla dispara dezenas de
mensagens por segundo à toa.

**`public/js/render.js`** — desenha campo, raquetes, bola, placar e avisos. Não
decide nada: se a bola não anda, o problema está no servidor.

**`shared/constantes.js`** — tamanho do campo, da raquete, velocidade da bola,
nomes das mensagens. Importado pelo servidor por caminho de arquivo e pelo
navegador por HTTP. Um único lugar para mudar, e as duas pontas continuam
concordando.

> O arquivo `inicio.js`, da criação do repositório, não é usado por nada e pode
> ser removido quando a estrutura for aprovada.

## 4. Como as peças conversam

```
   NAVEGADOR (dupla A)                 NODE.JS (host)                NAVEGADOR (dupla B)
  ┌────────────────────┐          ┌────────────────────────┐        ┌────────────────────┐
  │ entrada.js         │          │  server.js             │        │ entrada.js         │
  │   tecla W/S        │          │   HTTP  (arquivos)     │        │   tecla W/S        │
  │        │           │          │   WS    (jogo)         │        │        │           │
  │        ▼           │  mover   │        │               │ mover  │        ▼           │
  │ rede.js  ──────────┼─────────►│      sala.js           │◄───────┼── rede.js          │
  │        ▲           │          │        │               │        │        ▲           │
  │        │  estado   │          │        ▼               │ estado │        │           │
  │        └───────────┼◄─────────┤      jogo.js           ├───────►┼────────┘           │
  │ render.js (canvas) │  60x/s   │  (física + placar)     │ 60x/s  │ render.js (canvas) │
  └────────────────────┘          └────────────────────────┘        └────────────────────┘
```

O caminho completo de um lance:

1. O aluno segura <kbd>W</kbd> → `entrada.js` detecta a mudança e chama
   `rede.mover(-1)`.
2. `rede.js` envia `{"tipo":"mover","direcao":-1}`.
3. `sala.js` confere de qual lado é aquela conexão e guarda a direção.
4. 60×/s, `jogo.atualizar()` move raquetes e bola, trata colisões e placar.
5. `sala.js` transmite o estado resumido para todos os conectados.
6. `render.js` desenha, no ritmo da tela.

Desenho e rede são propositalmente independentes: se um pacote atrasa, a tela
continua mostrando o último estado conhecido em vez de congelar.

Detalhes e alternativas descartadas em [`docs/arquitetura.md`](docs/arquitetura.md).

## 5. O protocolo, em uma olhada

Todas as mensagens são JSON com um campo `tipo`.

| Direção | Tipo | Para quê |
| --- | --- | --- |
| cliente → servidor | `entrar` | apresenta o jogador ao conectar |
| cliente → servidor | `mover` | `-1` sobe, `0` para, `1` desce |
| servidor → cliente | `bem-vindo` | diz qual lado você controla (ou que é espectador) |
| servidor → cliente | `estado` | foto do jogo: bola, raquetes, placar, fase |
| servidor → cliente | `fim` | alguém chegou aos 5 pontos |
| servidor → cliente | `erro` | mensagem malformada, sem derrubar a conexão |

Para ver isso acontecendo ao vivo na aula: **F12 → Network → filtro WS →
Messages**. É a demonstração mais convincente de que o cliente não calcula nada.

Exemplos de cada mensagem em [`docs/protocolo.md`](docs/protocolo.md).

## 6. O que já funciona e o que falta

O jogo é construído em sprints — **não precisa sair inteiro de uma vez**. Cada
sprint fecha algo que roda e pode ser demonstrado.

| Sprint | Entrega | Bloco da oficina | Status |
| --- | --- | --- | --- |
| 0 | Estrutura, servidor HTTP + WebSocket, conexão e reconexão | Setup | ✅ |
| 1 | Campo, raquetes, bola e placar desenhados no Canvas; teclado | Construção 1 | ✅ |
| 2 | Física da bola, movimento das raquetes, pontuação | Construção 2 | 🚧 |
| 3 | Contagem regressiva, pausa/retomada, rematch, ping na tela | Construção 3 | 🚧 |
| 4 | Roteiro do instrutor, checklist de setup, plano B de rede | Testes | 🚧 |
| 5+ | Salas múltiplas, modo 1 jogador, som, testes automatizados | — | 💤 |

**Hoje, rodando `npm start`:** os navegadores conectam, recebem seu lado, o campo
aparece com o placar em 0×0 e as teclas já enviam comandos para o servidor. A
bola ainda não se move — essa é exatamente a Sprint 2.

Detalhamento de cada sprint em [`docs/roadmap.md`](docs/roadmap.md).

## 7. Por onde começar a contribuir

A próxima tarefa é a **Sprint 2**, e ela está inteira em um lugar só:
`server/jogo.js`, função `atualizar()`. O corpo da função já tem os **seis
passos comentados na ordem de implementação** — mover raquetes, mover bola,
quicar nas paredes, rebater nas raquetes, marcar ponto, encerrar a partida.

Sugestão de divisão entre duplas:

| Dupla | Tarefa | Arquivo |
| --- | --- | --- |
| 1 | Passos 1 e 2 (movimento) | `server/jogo.js` |
| 2 | Passos 3 e 4 (colisões) | `server/jogo.js` |
| 3 | Passos 5 e 6 (placar e fim) | `server/jogo.js` |
| 4 | Contagem regressiva e rematch | `server/sala.js` |
| 5 | Tela de fim de jogo e ping | `public/js/render.js` |

Para testar: abra duas abas em `localhost:3000`. Não precisa de outra máquina
enquanto estiver desenvolvendo.

## 8. Fluxo de trabalho com Git

> Regras do projeto, mantidas desde a criação do repositório.

- Todo desenvolvimento acontece em **branches separadas**, criadas de acordo com
  a feature que será trabalhada.
- Concluída a feature, abra um **Pull Request** para análise e revisão dos
  demais membros da equipe.
- **Nunca desenvolva uma feature diretamente na `main`.** Alterações diretas na
  `main` devem ser restritas a ajustes pontuais.

```bash
git checkout -b feat/sprint-2-fisica
# ... desenvolve e testa ...
git commit -m "feat: movimento das raquetes e quique da bola"
git push -u origin feat/sprint-2-fisica
# abre o PR e chama a revisão
```

## 9. Vindo de Java? Leia isto

O bloco de contexto técnico da oficina (0:10–0:25) cobre isto, mas vale ter à
mão enquanto lê o código:

| Java | JavaScript |
| --- | --- |
| `int x = 5;` | `let x = 5;` — o tipo não é declarado |
| `final int X = 5;` | `const X = 5;` |
| `(a, b) -> a + b` | `(a, b) => a + b` — praticamente igual |
| `HashMap<String, Integer>` | objeto literal: `{ esquerda: 0, direita: 0 }` |
| `List<String>` | array: `['a', 'b']` |
| classe para tudo | função solta também é valor; `jogo.js` é só funções |
| `System.out.println` | `console.log` |
| `null` | `null` **e** `undefined` (duas formas de "nada") |

Dois operadores que aparecem bastante no código:

- `??` — usa o da direita só se o da esquerda for `null`/`undefined`:
  `mensagem.lado ?? null`.
- `?.` — acessa sem estourar erro se o objeto não existir:
  `this.socket?.readyState`.

E uma armadilha clássica: comparação em JS se faz com `===` (compara valor
**e** tipo). `==` converte tipos por baixo dos panos e cria bugs difíceis —
`'2' == 2` é verdadeiro.

## 10. Documentação completa

| Documento | O que tem lá |
| --- | --- |
| [`docs/escopo-oficina.md`](docs/escopo-oficina.md) | Objetivo, público, metodologia e cronograma das 3 horas |
| [`docs/arquitetura.md`](docs/arquitetura.md) | Servidor autoritativo vs P2P, ciclo de um lance, por que `shared/`, limites conhecidos |
| [`docs/protocolo.md`](docs/protocolo.md) | Cada mensagem com exemplo de JSON e como inspecionar no navegador |
| [`docs/roadmap.md`](docs/roadmap.md) | Checklist de cada sprint e o backlog |

---

Licença: [MIT](LICENSE.md).
