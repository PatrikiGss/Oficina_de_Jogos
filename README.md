# Oficina de Jogos: Ping-Pong multiplayer

Jogo de ping-pong para dois jogadores em computadores diferentes, ligados pela
rede local. Foi feito para a oficina de jogos da disciplina de Atividade de
Extensão III, em que alunos da 2ª fase de Ciência da Computação constroem o
jogo em duplas, com pair programming, durante uma aula de 3 horas.

O servidor roda em Node.js e o jogo roda no navegador, usando Canvas para o
desenho e WebSocket para a comunicação. Só a máquina que hospeda a partida
precisa ter o Node instalado.

## Como rodar

Com o Node.js 18 ou mais recente instalado, dentro da pasta do projeto:

```bash
npm install
npm start
```

O terminal mostra dois endereços: um para abrir na própria máquina
(`http://localhost:3000`) e outro com o IP da rede, que é o que a outra dupla
deve abrir no navegador. Para testar sozinho, basta abrir o endereço local em
duas abas.

O primeiro navegador que conecta fica com a raquete da esquerda, o segundo com
a da direita, e quem entrar depois só assiste. Cada jogador vê a própria
raquete em verde. Os controles são W e S ou as setas para cima e para baixo, e
vence quem fizer 5 pontos primeiro. Depois disso, a barra de espaço começa uma
nova partida, então dá para revezar os jogadores sem reiniciar o servidor.

Se a página abre em `localhost` mas não na outra máquina, o problema costuma
ser o firewall do Windows ou uma rede Wi-Fi que não deixa os aparelhos se
comunicarem. O [roteiro da aula](docs/roteiro-aula.md#plano-b) explica o que
fazer nesses casos.

## Como o código está organizado

O jogo tem três arquivos de JavaScript e uma página HTML.

`public/jogo.js` guarda as regras: tamanho do campo, estado da partida,
movimento da bola, colisões e placar. Ele não desenha nada e não sabe nada de
rede, e é por isso que o mesmo arquivo pode rodar tanto no navegador quanto no
servidor.

`public/cliente.js` roda no navegador. Desenha no canvas o estado que recebe do
servidor e avisa o servidor quando o jogador aperta ou solta uma tecla. Ele não
calcula a posição da bola nem das raquetes.

`server.js` entrega os arquivos da pasta `public` para o navegador, decide qual
conexão controla cada lado e roda a física cerca de 60 vezes por segundo,
enviando o resultado para todos os navegadores conectados.

`public/index.html` tem só o canvas, o texto de ajuda e o carregamento do
`cliente.js`.

A pasta `etapas` guarda versões intermediárias usadas na aula: o projeto
inicial que as duplas recebem e uma versão do cliente sem rede, com os dois
jogadores no mesmo teclado. A pasta `docs` tem o escopo da oficina e o roteiro
para quem vai conduzir a aula.

## Como funciona a comunicação

Quem decide o que acontece no jogo é o servidor. O navegador manda só a direção
em que o jogador quer mover a raquete, e o servidor responde com o estado
completo da partida. Assim as duas telas mostram sempre a mesma coisa, e
ninguém consegue trapacear alterando o código no próprio navegador.

As mensagens são objetos JSON com um campo `tipo`:

- `mover`, do navegador para o servidor, com o campo `direcao`: -1 para subir,
  1 para descer e 0 para parar.
- `reiniciar`, do navegador para o servidor, pede uma nova partida. Só tem
  efeito depois que alguém venceu.
- `lado`, do servidor para o navegador, diz qual raquete aquele navegador
  controla, ou `null` para quem só assiste.
- `estado`, do servidor para o navegador, traz a posição da bola e das
  raquetes, o placar, o vencedor e se ainda falta jogador.

Dá para acompanhar essas mensagens no próprio navegador, abrindo as
ferramentas de desenvolvedor (F12) na aba Network e filtrando por WS.

## A aula

A oficina segue o cronograma de [docs/escopo-oficina.md](docs/escopo-oficina.md),
e o código é escrito em três blocos.

Na Construção 1, o campo é desenhado no canvas, ainda parado. Na Construção 2,
entram a física, o placar e o teclado, e no fim desse bloco o jogo já funciona
em um único computador, com um jogador de cada lado do teclado. Na Construção
3, o servidor passa a usar o mesmo `jogo.js` e o navegador deixa de calcular a
física, o que permite que duas máquinas joguem uma contra a outra.

Os arquivos têm comentários marcando em qual bloco cada parte é escrita. O
passo a passo, os pontos de controle e o que fazer quando uma dupla se perde
ou a rede da sala não funciona estão em [docs/roteiro-aula.md](docs/roteiro-aula.md).

O projeto foi mantido pequeno de propósito, porque precisa ser explicado linha
a linha em pouco tempo. Por isso não usa framework, classes nem reconexão
automática, e cada servidor atende uma partida por vez.

## Desenvolvimento

Todo o desenvolvimento deve ser feito em branches separadas, criadas de acordo
com a feature que será trabalhada. Ao terminar a feature, abra um Pull Request
para análise e revisão dos demais membros da equipe.

Nunca desenvolva uma feature diretamente na `main`. Alterações diretas na
`main` devem se restringir a ajustes pontuais.

Se mudar alguma coisa no jogo, confira se as versões em `etapas/` continuam de
acordo com a da raiz, porque o roteiro da aula depende delas.

Algumas ideias para depois da oficina: modo contra o computador, som na
rebatida e no ponto, controle por toque para jogar pelo celular e testes
automáticos para a física.

## Licença

MIT. Veja [LICENSE.md](LICENSE.md).
