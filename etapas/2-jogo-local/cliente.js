// =============================================================================
// cliente.js — VERSÃO DO FIM DA CONSTRUÇÃO 2 (jogo local, sem rede)
//
// Dois jogadores no MESMO teclado: W/S na esquerda, setas na direita.
// A física roda aqui mesmo, no navegador.
//
// Para usar: copie este arquivo por cima de public/cliente.js.
// Serve para quem se perdeu na aula e como Plano B se a rede da sala falhar.
// =============================================================================

import { LARGURA, ALTURA, RAQUETE_LARGURA, RAQUETE_ALTURA, RAQUETE_X, RAIO_BOLA, criarEstado, atualizar } from './jogo.js';

// ----- Construção 1: desenho ----------------------------------------------------

const canvas = document.getElementById('campo');
const ctx = canvas.getContext('2d');
canvas.width = LARGURA;
canvas.height = ALTURA;
document.getElementById('ajuda').textContent = 'Esquerda: W / S · Direita: ↑ / ↓ · Espaço começa outra partida';

let estado = criarEstado();

function desenhar() {
  // fundo
  ctx.fillStyle = '#101820';
  ctx.fillRect(0, 0, LARGURA, ALTURA);

  // linha tracejada do meio
  ctx.fillStyle = '#2a3a4a';
  for (let y = 0; y < ALTURA; y += 30) {
    ctx.fillRect(LARGURA / 2 - 1, y, 2, 16);
  }

  // placar
  ctx.fillStyle = '#44586e';
  ctx.font = 'bold 64px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(estado.esquerda.pontos, LARGURA / 2 - 60, 80);
  ctx.fillText(estado.direita.pontos, LARGURA / 2 + 60, 80);

  // raquetes
  ctx.fillStyle = '#e6edf3';
  for (const lado of ['esquerda', 'direita']) {
    ctx.fillRect(RAQUETE_X[lado], estado[lado].y, RAQUETE_LARGURA, RAQUETE_ALTURA);
  }

  // bola
  ctx.beginPath();
  ctx.arc(estado.bola.x, estado.bola.y, RAIO_BOLA, 0, Math.PI * 2);
  ctx.fill();

  if (estado.vencedor) escrever(`Vitória da ${estado.vencedor}! Espaço para jogar de novo`);
}

// Mensagem um pouco abaixo do centro, para não ficar em cima da bola.
function escrever(texto) {
  ctx.fillStyle = '#e6edf3';
  ctx.font = '22px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(texto, LARGURA / 2, ALTURA / 2 + 60);
}

// ----- Construção 2: teclado e física ---------------------------------------------

// Cada tecla diz qual raquete move e para onde.
const TECLAS = {
  KeyW: ['esquerda', -1],
  KeyS: ['esquerda', 1],
  ArrowUp: ['direita', -1],
  ArrowDown: ['direita', 1],
};

addEventListener('keydown', (evento) => {
  if (evento.code in TECLAS) {
    const [lado, direcao] = TECLAS[evento.code];
    estado[lado].direcao = direcao;
  }
  if (evento.code === 'Space' && estado.vencedor) {
    estado = criarEstado();
  }
});

addEventListener('keyup', (evento) => {
  if (evento.code in TECLAS) {
    const [lado, direcao] = TECLAS[evento.code];
    // Só para se soltou a tecla da direção atual (evita travar ao trocar rápido).
    if (estado[lado].direcao === direcao) estado[lado].direcao = 0;
  }
});

// A cada quadro: calcula o tempo que passou, avança a física e desenha.
let anterior = performance.now();

function laco(agora) {
  const dt = (agora - anterior) / 1000; // em segundos
  anterior = agora;

  atualizar(estado, dt);
  desenhar();
  requestAnimationFrame(laco);
}
requestAnimationFrame(laco);
