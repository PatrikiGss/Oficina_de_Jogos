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
deve abrir no navegador.

O primeiro navegador que conecta fica com a raquete da esquerda, o segundo com
a da direita, e quem entrar depois só assiste. Cada navegador controla apenas
a própria raquete, que aparece em verde, usando W e S ou as setas para cima e
para baixo (tanto faz). Vence quem fizer 5 pontos primeiro. Depois disso, a
barra de espaço começa uma nova partida, então dá para revezar os jogadores
sem reiniciar o servidor.

Para jogar sozinho contra o computador, inicie com `npm run bot` em vez de
`npm start`. O bot entra no jogo assim que o servidor sobe e fica com a
raquete da esquerda; abra `http://localhost:3000` e jogue com a da direita.

Para testar a conexão entre dois navegadores no mesmo computador, use
`npm start` e abra o endereço local em duas janelas. O teclado só chega à
janela que está em foco, então você controla um lado de cada vez: clique em
uma janela e mova a raquete verde dela, depois clique na outra. Solte a tecla
antes de trocar de janela, senão a raquete continua andando. Para duas pessoas
jogarem de verdade, são necessários dois computadores.

Se a página abre em `localhost` mas não na outra máquina, o problema costuma
ser o firewall do Windows (permita o Node em redes privadas na primeira vez
que o servidor rodar) ou uma rede Wi-Fi que não deixa os aparelhos se
comunicarem.

## Como o código está organizado

O jogo tem três arquivos de JavaScript e uma página HTML, mais o bot, que é
opcional.

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

`bot.js` não faz parte do jogo construído na aula. Ele sobe o mesmo servidor e
conecta nele um jogador automático, pela mesma conexão WebSocket que um
navegador usaria, então o servidor nem sabe que está jogando contra um bot. A
cada estado recebido, o bot decide se sobe, desce ou para. Para poder ser
vencido, ele demora um pouco para reagir e erra a mira de propósito, por um
valor sorteado a cada jogada. As três constantes no topo da classe `Bot`
controlam a dificuldade.

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

Licença: [MIT](LICENSE.md).
