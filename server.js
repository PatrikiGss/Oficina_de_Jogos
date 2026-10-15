import http from 'node:http';
import fs from 'node:fs';
import os from 'node:os';
import { WebSocketServer } from 'ws';
import { criarEstado, atualizar } from './public/jogo.js';

const PORTA = 3000;

const ARQUIVOS = {
  '/': { caminho: 'public/index.html', tipo: 'text/html; charset=utf-8' },
  '/jogo.js': { caminho: 'public/jogo.js', tipo: 'text/javascript; charset=utf-8' },
  '/cliente.js': { caminho: 'public/cliente.js', tipo: 'text/javascript; charset=utf-8' },
};

const servidor = http.createServer((requisicao, resposta) => {
  const arquivo = ARQUIVOS[requisicao.url]; // só os arquivos da lista podem ser baixados
  if (!arquivo) {
    resposta.writeHead(404);
    resposta.end('Arquivo não encontrado');
    return;
  }
  resposta.writeHead(200, { 'Content-Type': arquivo.tipo }); // sem o tipo certo o navegador recusa o .js
  resposta.end(fs.readFileSync(arquivo.caminho));
});

servidor.listen(PORTA, () => {
  console.log(`Jogo no ar! Nesta máquina: http://localhost:${PORTA}`);

  const redes = Object.values(os.networkInterfaces()).flat();
  for (const rede of redes) {
    if (rede.family === 'IPv4' && !rede.internal) {
      console.log(`Para a outra dupla:  http://${rede.address}:${PORTA}`);
    }
  }
});

const wss = new WebSocketServer({ server: servidor }); // usa a mesma porta do servidor HTTP

let estado = criarEstado();
const jogadores = { esquerda: null, direita: null };

wss.on('connection', (socket) => {
  let lado = null; // continua null para quem chega depois dos dois jogadores
  if (!jogadores.esquerda) lado = 'esquerda';
  else if (!jogadores.direita) lado = 'direita';

  if (lado) jogadores[lado] = socket;
  console.log(lado ? `Entrou jogador na ${lado}` : 'Entrou um espectador');
  socket.send(JSON.stringify({ tipo: 'lado', lado }));

  socket.on('message', (dados) => {
    if (!lado) return; // espectador só assiste

    let mensagem;
    try {
      mensagem = JSON.parse(dados);
    } catch {
      return; // ignora o que não é JSON em vez de derrubar o servidor
    }

    if (mensagem.tipo === 'mover') {
      estado[lado].direcao = Math.sign(mensagem.direcao) || 0; // só aceita -1, 0 ou 1
    }
    if (mensagem.tipo === 'reiniciar' && estado.vencedor) {
      estado = criarEstado();
    }
  });

  socket.on('close', () => {
    if (!lado) return;
    console.log(`Saiu o jogador da ${lado}`);
    jogadores[lado] = null;
    estado = criarEstado(); // a partida recomeça quando alguém ocupar o lugar
  });
});

let anterior = Date.now();

setInterval(() => {
  const agora = Date.now();
  const dt = (agora - anterior) / 1000; // tempo medido: no Windows o intervalo real fica perto de 40 por segundo
  anterior = agora;

  const aguardando = !jogadores.esquerda || !jogadores.direita;
  if (!aguardando) atualizar(estado, dt);

  const mensagem = JSON.stringify({ tipo: 'estado', estado, aguardando });
  for (const cliente of wss.clients) {
    cliente.send(mensagem);
  }
}, 1000 / 60);
