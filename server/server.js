// Ponto de entrada do servidor.
//
// Faz duas coisas ao mesmo tempo, na mesma porta:
//   1. serve os arquivos do cliente (public/ e shared/) por HTTP;
//   2. aceita conexoes WebSocket e entrega cada uma para a Sala.
//
// Rodar:  npm install  &&  npm start
// Abrir:  http://localhost:3000 na maquina host
//         http://<ip-do-host>:3000 na outra maquina da rede

import http from 'node:http';
import { WebSocketServer } from 'ws';
import { servirArquivo } from './estatico.js';
import { Sala } from './sala.js';
import { listarIPsLocais } from './rede-local.js';

const PORTA = Number(process.env.PORT) || 3000;

// Uma unica sala por servidor: os dois primeiros navegadores a conectar viram
// os jogadores, os demais entram como espectadores. Salas multiplas ficam para
// a Sprint 5 (ver docs/roadmap.md).
const sala = new Sala();

const servidorHttp = http.createServer((requisicao, resposta) => {
  servirArquivo(requisicao, resposta);
});

// O WebSocketServer "pega carona" no servidor HTTP: mesma porta, mesmo processo.
const servidorWs = new WebSocketServer({ server: servidorHttp });

servidorWs.on('connection', (conexao, requisicao) => {
  const ip = requisicao.socket.remoteAddress;
  console.log(`[ws] conexao aberta de ${ip}`);
  sala.conectar(conexao);
});

servidorHttp.listen(PORTA, () => {
  console.log(`\n  Servidor no ar na porta ${PORTA}\n`);
  console.log(`  Nesta maquina:   http://localhost:${PORTA}`);
  for (const ip of listarIPsLocais()) {
    console.log(`  Na rede local:   http://${ip}:${PORTA}`);
  }
  console.log('\n  Ctrl+C para encerrar.\n');
});
