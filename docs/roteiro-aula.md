# Roteiro da aula (3 horas)

Guia para quem conduz a oficina. Segue o cronograma de
[`escopo-oficina.md`](escopo-oficina.md) e diz, bloco a bloco, o que digitar, o
que explicar e como saber que a turma pode seguir.

Legenda:

- ⌨️ **digitar junto** — o instrutor escreve no projetor, as duplas replicam.
- 📋 **colar pronto** — trecho longo ou pouco didático: mostra, explica e cola.
- ✔️ **deu certo quando** — o que tem que aparecer na tela antes de avançar.

---

## Antes da aula

- [ ] **Node.js 18+** em pelo menos uma máquina por dupla (`node --version`).
- [ ] **`npm install` feito antes.** A rede da sala pode não ter internet. Se
      não der para instalar na hora, leve a pasta `node_modules` num pendrive —
      é um único pacote (`ws`), sem dependências.
- [ ] **Teste de rede na sala real**, com duas máquinas: uma roda `npm start`, a
      outra abre `http://<ip>:3000`. Wi-Fi de universidade costuma **isolar os
      aparelhos** entre si — se for o caso, veja o [Plano B](#plano-b).
- [ ] Pasta `etapas/0-setup` pronta para distribuir (link do repositório em ZIP
      ou pendrive).
- [ ] Número **par** de duplas (se não fechar, veja o [Plano B](#plano-b)).
- [ ] Projetor com fonte grande no VSCode (Ctrl + `+`).

---

## 0:00–0:10 · Abertura

- Mostre o jogo final rodando **entre duas máquinas** (instrutor × monitor).
  Deixe a turma ver o objetivo antes de ver código.
- Forme as duplas: **piloto** (digita) e **navegador** (lê, confere, caça erro
  de digitação). Trocam de papel a cada bloco de construção.

## 0:10–0:25 · Contexto técnico

**Cliente × servidor, em uma frase:** o navegador só desenha e avisa o que o
jogador apertou; quem calcula a bola é o servidor. Vale desenhar no quadro os
dois navegadores ligados ao servidor: dos navegadores sai só "estou subindo" ou
"parei", e do servidor volta a foto do jogo, umas 60 vezes por segundo.

**JavaScript para quem vem do Java** — só o que aparece no código da oficina:

| Java | JavaScript | Onde aparece |
| --- | --- | --- |
| `int x = 5;` | `let x = 5;` — sem tipo declarado | em todo lugar |
| `final int X = 5;` | `const X = 5;` | constantes do `jogo.js` |
| classe com atributos | objeto literal `{ y: 0, pontos: 0 }` | `criarEstado()` |
| `(a, b) -> a + b` | `(a, b) => a + b` | eventos de teclado e rede |
| `"x = " + x` | `` `x = ${x}` `` (crase) | mensagens na tela |
| `a.equals(b)` / `==` | **sempre `===`** (`'2' == 2` é `true`!) | comparações |
| `for (String s : lista)` | `for (const s of lista)` | desenho das raquetes |
| `import pacote.Classe;` | `import { nome } from './arquivo.js';` | topo dos arquivos |
| `public` | `export` — sem ele, o outro arquivo não enxerga | `jogo.js` |
| — | `const [lado, direcao] = par;` desmonta um array | teclado (Construção 2) |
| `null` | `null` **e** `undefined` | `vencedor`, `meuLado` |

## 0:25–0:45 · Setup

1. Cada dupla copia a pasta **`etapas/0-setup`** para um lugar seu (ex.:
   Área de Trabalho) e abre **a pasta** no VSCode (Arquivo → Abrir Pasta).
2. Terminal do VSCode (Ctrl + `'`):
   ```bash
   node --version
   npm install
   npm start
   ```
3. Abrir `http://localhost:3000`.
4. **Teste de rede:** a dupla vizinha abre o endereço "Para a outra dupla" que
   apareceu no terminal.

📋 Explique o `server.js` já pronto (umas 30 linhas): a lista `ARQUIVOS` é tudo o
que o servidor aceita entregar; o `Content-Type` diz ao navegador o que é cada
arquivo (sem ele o `.js` é recusado).

✔️ A página (moldura vazia + texto de ajuda) abre na **máquina da outra dupla**.

Problemas comuns:

| Sintoma | Causa |
| --- | --- |
| `npm` não é reconhecido | Node não instalado, ou VSCode aberto antes da instalação — feche e abra |
| `EADDRINUSE` | já tem um servidor rodando nessa porta — Ctrl+C no outro terminal |
| Abre em `localhost` mas não na outra máquina | firewall ou Wi-Fi isolado — [Plano B](#plano-b) |
| Abriu o `index.html` com duplo clique e o jogo não aparece | tem que abrir **pelo servidor** (`http://...`), nunca por `file://` |

## 0:45–1:15 · Construção 1 — o campo (~60 linhas)

⌨️ **`public/jogo.js`** — seção "Construção 1": medidas, `RAQUETE_X`,
velocidades, `criarEstado()` e `novaBola()`.

⌨️ **`public/cliente.js`** — seção "Construção 1" da versão
[`etapas/2-jogo-local/cliente.js`](../etapas/2-jogo-local/cliente.js):
`import`, canvas, `let estado = criarEstado();`, `desenhar()`, `escrever()` e
um laço que por enquanto **só desenha**. No `import`, deixe de fora o
`atualizar` — ele ainda não existe e o navegador acusa erro.

```js
function laco() {
  desenhar();
  requestAnimationFrame(laco);
}
requestAnimationFrame(laco);
```

Explique:

- No canvas, **(0, 0) é o canto superior esquerdo e o Y cresce para baixo** —
  o contrário do plano cartesiano. Vai aparecer de novo na física.
- `fillRect` para raquetes e linha do meio, `arc` para a bola.
- `requestAnimationFrame`: o navegador chama a função a cada quadro da tela.
- `export` / `import`: o mesmo `jogo.js` vai ser usado pelo servidor depois.

✔️ Campo com placar 0 × 0, duas raquetes e a bola parada no meio.

Armadilhas: esquecer o `export` (erro no console: *does not provide an export
named*); nome de arquivo sem `.js` no `import`. **F12 → Console** é o primeiro
lugar para olhar.

## 1:15–1:45 · Construção 2 — física e placar (~75 linhas)

Resultado do bloco: **jogo completo no mesmo teclado**, W/S contra as setas.

Vá em passos pequenos, rodando (F5) depois de cada um:

1. ⌨️ No `jogo.js`, escreva `atualizar()` só com o movimento da bola. No
   `cliente.js`, acrescente `atualizar` ao `import` e troque o laço pela versão
   com `dt`.
   → a bola anda e **some pela lateral**.
2. ⌨️ Teto e chão. Explique por que `Math.abs` e não só inverter o sinal: se a
   bola passar um pouco da parede, inverter duas vezes seguidas a deixa
   "grudada".
3. ⌨️ `moverRaquete()` + teclado (`TECLAS`, `keydown`, `keyup`).
   → as raquetes andam e param nas bordas.
4. 📋 `encostou()` (colisão de retângulos — desenhe as duas caixas no quadro)
   e ⌨️ `rebater()`. Mostre que bater na ponta da raquete muda o ângulo: é o que
   dá controle ao jogador.
5. ⌨️ `marcarPonto()` e vencedor. → placar anda, parou em 5.
6. ⌨️ Espaço reinicia.

Explique o `dt`: velocidade em **pixels por segundo** × tempo que passou. Sem
isso, o jogo roda mais rápido em computador mais rápido. A linha
`dt = Math.min(dt, 1 / 30)` no começo de `atualizar()` é a trava para quando o
computador engasga ou a aba fica escondida: sem ela, um `dt` grande faz a bola
pular por cima da raquete.

✔️ A dupla joga uma partida inteira até 5 pontos, um de cada lado do teclado.

Checkpoint: quem se perdeu copia [`etapas/2-jogo-local/cliente.js`](../etapas/2-jogo-local/cliente.js)
e o `public/jogo.js` da raiz (ver [Resgate](#resgate)).

## 1:45–2:25 · Construção 3 — rede (~90 linhas)

A frase do bloco: **a física muda de casa.** O `jogo.js` não muda uma linha — o
servidor passa a importar o mesmo arquivo, e o navegador para de calcular.

**1. Servidor** ⌨️ (`server.js`, seção "Construção 3" da raiz)

1. Os dois `import` novos no topo (`ws` e `./public/jogo.js`).
2. `WebSocketServer`, `estado`, `jogadores` e o `connection` que escolhe o
   lado.
3. O `setInterval` que roda a física e manda o estado para todos.
4. Os eventos `message` (mover, reiniciar) e `close`.

Depois de mexer no `server.js`: **Ctrl+C e `npm start` de novo**. (No cliente,
F5 basta.)

**2. Cliente** ⌨️ — o que muda no `cliente.js`:

| Sai | Entra |
| --- | --- |
| `criarEstado, atualizar` no `import` | — |
| `let estado = criarEstado();` | `let estado = null;` + `meuLado`, `aguardando`, `aviso` |
| linha que troca o texto de ajuda | — |
| teclado com dois lados + laço com `atualizar()` | laço que só desenha + seção "Construção 3" inteira |
| raquetes da mesma cor | a sua em verde (`lado === meuLado`) |
| bola usando a cor que sobrou das raquetes | `ctx.fillStyle` próprio antes do `arc` (senão ela fica verde para quem joga na direita) |
| — | em `desenhar()`: `if (!estado)` e o aviso de "Aguardando" |

Explique:

- **HTTP** pergunta e responde, e acabou. **WebSocket** fica aberto e os dois
  lados falam quando quiserem.
- Mensagens são objetos → `JSON.stringify` para enviar, `JSON.parse` para ler.
- **O cliente nunca diz qual raquete move.** O servidor sabe o lado de cada
  conexão. E `Math.sign(...) || 0` garante que só chega -1, 0 ou 1: nunca
  confie no que vem da rede.
- O servidor **mede o tempo** entre as voltas do `setInterval`: no Windows ele
  não consegue 60 voltas por segundo (dá umas 40), e sem medir o jogo ficaria
  mais lento.
- Mostre ao vivo: **F12 → Network → WS → Messages**. Dá para ver cada `mover`
  saindo e cada `estado` chegando.

✔️ Duas abas no mesmo computador jogam uma contra a outra; cada aba só controla
a sua raquete (a verde). Uma terceira aba vira espectadora.

Armadilhas: esquecer de reiniciar o servidor depois de editar; "Conexão
perdida" na tela = o servidor caiu, olhe o terminal.

## 2:25–2:50 · Testes: dupla × dupla

- A dupla A roda `npm start`; a dupla B abre `http://<ip-da-A>:3000` no
  navegador dela. A primeira página aberta fica com a esquerda.
- Revezamento: partida de 5 pontos, troca quem está no teclado, **Espaço**
  começa outra — não precisa reiniciar o servidor. Depois inverte quem hospeda.
- Quem abrir a página depois dos dois jogadores assiste como espectador.

Desafios para quem terminar antes:

- Mudar `PONTOS_PARA_VENCER`, a velocidade da bola ou as cores.
- **Tentar trapacear:** no console do navegador, abrir `new WebSocket(...)` e
  mandar `mover` com `direcao: 1000`. Não funciona — descubra por quê (dica:
  quantos jogadores o servidor aceita, e o que o `Math.sign` faz).

## 2:50–3:00 · Encerramento

- Recapitule com o desenho do início: 3 arquivos, quem faz o quê.
- Passe o link do repositório (o código completo e comentado está na raiz).
- Ideias para continuar em casa estão no fim do README.

---

## Resgate

Dupla perdida? Não conserte linha por linha na hora — copie o ponto de
controle e siga junto com a turma.

| Perdeu-se em | Copie |
| --- | --- |
| Setup | a pasta `etapas/0-setup` inteira |
| Construção 1 ou 2 | `public/jogo.js` da raiz + `etapas/2-jogo-local/cliente.js` → `public/cliente.js` |
| Construção 3 | `server.js` e `public/cliente.js` da raiz |

## Plano B

| Problema | O que fazer |
| --- | --- |
| Firewall do Windows bloqueia | Na primeira execução, **permita** o Node em redes privadas. Se a rede estiver como "Pública", mude para "Privada" nas configurações de Wi-Fi |
| Wi-Fi isola os aparelhos (abre em `localhost`, nunca no IP) | Roteador próprio, cabo com switch, ou hotspot de um celular/notebook com todas as máquinas nele |
| Nenhuma rede funciona | A Construção 3 continua demonstrável com **duas abas no mesmo PC** (localhost sempre funciona). Para o teste final, dupla × dupla na mesma máquina com o jogo local (`etapas/2-jogo-local`): cada dupla fica com um lado do teclado |
| Sem internet para `npm install` | Copie `node_modules` de uma máquina que já instalou |
| Número ímpar de duplas | A dupla que sobra joga contra um monitor, ou três duplas fazem rodízio (A × B, vencedor × C) |
| Máquina sem Node | Só quem hospeda precisa de Node. A outra dupla joga pelo navegador |

## Perguntas que costumam aparecer

- **"Por que não abre com duplo clique no `index.html`?"** — `import`/`export`
  no navegador só funcionam quando a página vem de um servidor (`http://`).
- **"Dá para jogar pela internet?"** — Dá, mas precisa de um servidor com
  endereço público ou liberar porta no roteador. Fora do escopo da oficina.
- **"Por que o servidor manda o estado inteiro toda vez?"** — Porque é simples
  e em rede local sobra velocidade. Jogos comerciais mandam só o que mudou e
  "adivinham" o resto no cliente.
