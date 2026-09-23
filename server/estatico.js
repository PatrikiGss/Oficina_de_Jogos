// Servidor de arquivos estaticos, sem dependencia externa.
//
// Publica duas pastas:
//   /          -> public/   (html, css e js do cliente)
//   /shared/   -> shared/   (constantes usadas pelos dois lados)

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ESTE_ARQUIVO = fileURLToPath(import.meta.url);
const RAIZ_PROJETO = path.resolve(path.dirname(ESTE_ARQUIVO), '..');
const PASTA_PUBLIC = path.join(RAIZ_PROJETO, 'public');
const PASTA_SHARED = path.join(RAIZ_PROJETO, 'shared');

const TIPOS_MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.mp3': 'audio/mpeg',
  '.wav': 'audio/wav',
};

/**
 * Converte a URL pedida em um caminho de arquivo, recusando qualquer tentativa
 * de sair das pastas publicadas (o classico "../../etc/passwd").
 * @returns {string|null} caminho absoluto do arquivo, ou null se for invalido
 */
function resolverCaminho(url) {
  const semQuery = url.split('?')[0];
  const caminhoUrl = decodeURIComponent(semQuery);

  if (caminhoUrl.startsWith('/shared/')) {
    const alvo = path.join(PASTA_SHARED, caminhoUrl.replace('/shared/', ''));
    return alvo.startsWith(PASTA_SHARED) ? alvo : null;
  }

  const relativo = caminhoUrl === '/' ? 'index.html' : caminhoUrl.slice(1);
  const alvo = path.join(PASTA_PUBLIC, relativo);
  return alvo.startsWith(PASTA_PUBLIC) ? alvo : null;
}

/** Responde a uma requisicao HTTP com o arquivo pedido (ou 404). */
export function servirArquivo(requisicao, resposta) {
  const caminho = resolverCaminho(requisicao.url);

  if (!caminho) {
    resposta.writeHead(403).end('403 - acesso negado');
    return;
  }

  fs.readFile(caminho, (erro, conteudo) => {
    if (erro) {
      resposta.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      resposta.end('404 - arquivo nao encontrado');
      return;
    }

    const extensao = path.extname(caminho).toLowerCase();
    resposta.writeHead(200, {
      'Content-Type': TIPOS_MIME[extensao] ?? 'application/octet-stream',
      'Cache-Control': 'no-cache', // durante a oficina queremos sempre a versao nova
    });
    resposta.end(conteudo);
  });
}
