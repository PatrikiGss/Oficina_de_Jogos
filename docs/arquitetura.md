# Arquitetura

## A decisão central: servidor autoritativo

Existem duas formas de fazer um jogo em rede:

| Abordagem | Como funciona | Problema |
| --- | --- | --- |
| **P2P / cliente confiável** | cada navegador calcula a própria física e avisa o outro | as duas telas divergem em segundos; qualquer um pode trapacear editando o JS |
| **Servidor autoritativo** (escolhida) | o servidor calcula tudo; o cliente só manda "estou subindo" e desenha o que recebe | exige um processo Node rodando, e o movimento tem a latência da rede |

Adotamos **servidor autoritativo**. Para uma rede local (latência de poucos
milissegundos) a desvantagem é irrelevante, e o ganho pedagógico é grande: fica
óbvio na explicação quem manda em quê.

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

## O ciclo de um lance

1. O aluno segura `W`. `entrada.js` percebe a **mudança** de direção (não repete
   enquanto a tecla fica presa) e chama `rede.mover(-1)`.
2. `rede.js` envia `{"tipo":"mover","direcao":-1}` pelo WebSocket.
3. `sala.js` recebe, confere de qual lado é aquela conexão — o cliente **não**
   escolhe o lado, quem decide é o servidor — e grava a direção no estado.
4. 60 vezes por segundo, `sala.tick()` chama `jogo.atualizar(estado, dt)`, que
   move raquetes e bola, trata colisões e placar.
5. `sala.difundirEstado()` envia o estado resumido para os dois navegadores.
6. `main.js` guarda o estado; `render.js` desenha no `requestAnimationFrame`
   seguinte.

Desenho e rede são independentes de propósito: se um pacote atrasa, a tela
continua mostrando o último estado conhecido em vez de congelar.

## Por que uma pasta `shared/`

Servidor e cliente precisam concordar sobre o tamanho do campo, da raquete e
sobre os nomes das mensagens. Duplicar esses números é a origem do bug mais
chato de jogo em rede: a bola quica na parede em uma tela e atravessa na outra.

`shared/constantes.js` é importado pelos dois lados:

- no servidor, por caminho de arquivo (`../shared/constantes.js`);
- no navegador, por HTTP (`/shared/constantes.js`) — o `estatico.js` publica
  essa pasta de propósito.

Isso só funciona porque o projeto usa **ES Modules dos dois lados**
(`"type": "module"` no `package.json` e `<script type="module">` no HTML).

## Um servidor, uma sala

Cada dupla roda o próprio servidor. Os dois primeiros navegadores que conectarem
viram jogadores (esquerda e direita); do terceiro em diante entram como
espectadores, recebendo o estado sem poder mover nada.

Para o teste final "dupla contra dupla", **uma** das duplas roda `npm start` e a
outra abre `http://<ip-do-host>:3000`. Salas múltiplas (várias partidas no mesmo
servidor, com código de sala) são um item opcional do roadmap.

## Limites conhecidos

- **Sem interpolação/predição.** A raquete responde após o retorno do servidor.
  Em LAN isso é imperceptível; por Wi-Fi ruim, nem tanto.
- **Sem persistência.** Fechou o processo, perdeu o placar.
- **Sem autenticação.** Qualquer um na rede que abrir o IP entra. Para a oficina,
  é o comportamento desejado.
