// =============================================================================
// cliente.js — O QUE RODA NO NAVEGADOR
//
// Construção 1: desenho no canvas
// Construção 2: teclado + física local (versão salva em etapas/2-jogo-local/)
// Construção 3: rede — a física SAI daqui e vai para o servidor.
//               O navegador passa a só desenhar e avisar o que o jogador aperta.
// =============================================================================

import { LARGURA, ALTURA, RAQUETE_LARGURA, RAQUETE_ALTURA, RAQUETE_X, RAIO_BOLA } from './jogo.js';

// ----- Construção 1: desenho ----------------------------------------------------

const canvas = document.getElementById('campo');
const ctx = canvas.getContext('2d');
canvas.width = LARGURA;
canvas.height = ALTURA;

let estado = null; // última "foto" do jogo que chegou do servidor
let meuLado = null; // 'esquerda', 'direita' ou null (espectador)
let aguardando = true; // true enquanto falta jogador
let aviso = 'Conectando ao servidor...';

function desenhar() {
  // fundo
  ctx.fillStyle = '#101820';
  ctx.fillRect(0, 0, LARGURA, ALTURA);

  // linha tracejada do meio
  ctx.fillStyle = '#2a3a4a';
  for (let y = 0; y < ALTURA; y += 30) {
    ctx.fillRect(LARGURA / 2 - 1, y, 2, 16);
  }

  if (!estado) {
    escrever(aviso);
    return;
  }

  // placar
  ctx.fillStyle = '#44586e';
  ctx.font = 'bold 64px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(estado.esquerda.pontos, LARGURA / 2 - 60, 80);
  ctx.fillText(estado.direita.pontos, LARGURA / 2 + 60, 80);

  // raquetes — a sua aparece em verde
  for (const lado of ['esquerda', 'direita']) {
    ctx.fillStyle = lado === meuLado ? '#4ade80' : '#e6edf3';
    ctx.fillRect(RAQUETE_X[lado], estado[lado].y, RAQUETE_LARGURA, RAQUETE_ALTURA);
  }

  // bola
  ctx.fillStyle = '#e6edf3';
  ctx.beginPath();
  ctx.arc(estado.bola.x, estado.bola.y, RAIO_BOLA, 0, Math.PI * 2);
  ctx.fill();

  if (estado.vencedor) escrever(`Vitória da ${estado.vencedor}! Espaço para jogar de novo`);
  else if (aguardando) escrever('Aguardando o outro jogador...');
}

// Mensagem um pouco abaixo do centro, para não ficar em cima da bola.
function escrever(texto) {
  ctx.fillStyle = '#e6edf3';
  ctx.font = '22px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(texto, LARGURA / 2, ALTURA / 2 + 60);
}

// Desenha no ritmo da tela (~60 vezes por segundo).
function laco() {
  desenhar();
  requestAnimationFrame(laco);
}
requestAnimationFrame(laco);

// ----- Construção 3: rede -------------------------------------------------------

// Conecta no mesmo endereço de onde a página veio: funciona em localhost
// e no IP da rede sem ninguém precisar mudar o código.
const socket = new WebSocket(`ws://${location.host}`);

socket.onmessage = (evento) => {
  const mensagem = JSON.parse(evento.data);
  if (mensagem.tipo === 'lado') {
    meuLado = mensagem.lado;
  }
  if (mensagem.tipo === 'estado') {
    estado = mensagem.estado;
    aguardando = mensagem.aguardando;
  }
};

socket.onclose = () => {
  estado = null;
  aviso = 'Conexão perdida. Aperte F5 para tentar de novo.';
};

function enviar(mensagem) {
  if (socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify(mensagem));
  }
}

// Teclado: o navegador NÃO move a raquete. Só avisa o servidor
// "estou subindo" (-1), "estou descendo" (1) ou "parei" (0).
const TECLAS = { KeyW: -1, ArrowUp: -1, KeyS: 1, ArrowDown: 1 };
let direcaoAtual = 0;

function mudarDirecao(direcao) {
  if (direcao === direcaoAtual) return; // segurar a tecla repete o evento: ignora
  direcaoAtual = direcao;
  enviar({ tipo: 'mover', direcao });
}

addEventListener('keydown', (evento) => {
  if (evento.code in TECLAS) mudarDirecao(TECLAS[evento.code]);
  if (evento.code === 'Space') enviar({ tipo: 'reiniciar' });
});

addEventListener('keyup', (evento) => {
  // Só para se soltou a tecla da direção atual. Assim, apertar S antes de
  // soltar W não trava a raquete.
  if (TECLAS[evento.code] === direcaoAtual) mudarDirecao(0);
});
