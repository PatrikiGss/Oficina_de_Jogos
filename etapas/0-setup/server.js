// =============================================================================
// server.js — PROJETO INICIAL (bloco de Setup)
//
// Por enquanto ele só entrega os arquivos do jogo para o navegador.
// Na Construção 3 vamos acrescentar o WebSocket no fim deste arquivo.
//
// Rodar: npm install (uma vez) e depois npm start
// =============================================================================

import http from 'node:http';
import fs from 'node:fs';
import os from 'node:os';

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
