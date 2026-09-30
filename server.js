// =============================================================================
// server.js — O SERVIDOR (só a máquina que hospeda a partida roda isto)
//
// Setup:        entrega os arquivos do jogo para o navegador
// Construção 3: WebSocket — recebe os comandos, roda a física e
//               manda o estado do jogo para todo mundo, ~60 vezes por segundo
//
// Rodar: npm start
// =============================================================================

import http from 'node:http';
import fs from 'node:fs';
import os from 'node:os';
import { WebSocketServer } from 'ws';
import { criarEstado, atualizar } from './public/jogo.js';

const PORTA = 3000;

// ----- Setup: servidor de arquivos ------------------------------------------------

// Só estes arquivos podem ser baixados. Qualquer outro endereço dá 404.
// O tipo (Content-Type) é obrigatório: sem ele o navegador recusa o .js.
const ARQUIVOS = {
  '/': { caminho: 'public/index.html', tipo: 'text/html; charset=utf-8' },
  '/jogo.js': { caminho: 'public/jogo.js', tipo: 'text/javascript; charset=utf-8' },
  '/cliente.js': { caminho: 'public/cliente.js', tipo: 'text/javascript; charset=utf-8' },
};

const servidor = http.createServer((requisicao, resposta) => {
  const arquivo = ARQUIVOS[requisicao.url];
  if (!arquivo) {
    resposta.writeHead(404);
    resposta.end('Arquivo não encontrado');
    return;
  }
  resposta.writeHead(200, { 'Content-Type': arquivo.tipo });
  resposta.end(fs.readFileSync(arquivo.caminho));
});

servidor.listen(PORTA, () => {
  console.log(`Jogo no ar! Nesta máquina: http://localhost:${PORTA}`);

  // Descobre o IP desta máquina na rede, para passar para a outra dupla.
  const redes = Object.values(os.networkInterfaces()).flat();
  for (const rede of redes) {
    if (rede.family === 'IPv4' && !rede.internal) {
      console.log(`Para a outra dupla:  http://${rede.address}:${PORTA}`);
    }
  }
});

// ----- Construção 3: WebSocket ----------------------------------------------------

// O WebSocket usa a mesma porta do servidor de arquivos.
const wss = new WebSocketServer({ server: servidor });

let estado = criarEstado();
const jogadores = { esquerda: null, direita: null }; // conexão de cada lado

wss.on('connection', (socket) => {
  // Os dois primeiros viram jogadores; do terceiro em diante, espectadores.
  let lado = null;
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
      return; // não é JSON: ignora em vez de derrubar o servidor
    }

    if (mensagem.tipo === 'mover') {
      // Nunca confie no cliente: só aceitamos -1, 0 ou 1.
      // E repare: o lado vem do servidor, não da mensagem.
      estado[lado].direcao = Math.sign(mensagem.direcao) || 0;
    }
    if (mensagem.tipo === 'reiniciar' && estado.vencedor) {
      estado = criarEstado();
    }
  });

  socket.on('close', () => {
    if (!lado) return;
    console.log(`Saiu o jogador da ${lado}`);
    jogadores[lado] = null;
    estado = criarEstado(); // partida recomeça quando alguém entrar no lugar
  });
});

// O coração do jogo online: ~60 vezes por segundo, calcula e avisa todo mundo.
// Medimos o tempo real entre as voltas porque o relógio do sistema não é
// exato (no Windows chegam só ~40 voltas por segundo, e não 60).
let anterior = Date.now();

setInterval(() => {
  const agora = Date.now();
  const dt = (agora - anterior) / 1000; // em segundos
  anterior = agora;

  const aguardando = !jogadores.esquerda || !jogadores.direita;
  if (!aguardando) atualizar(estado, dt);

  const mensagem = JSON.stringify({ tipo: 'estado', estado, aguardando });
  for (const cliente of wss.clients) {
    cliente.send(mensagem);
  }
}, 1000 / 60);
