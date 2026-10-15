import { LARGURA, ALTURA, RAQUETE_LARGURA, RAQUETE_ALTURA, RAQUETE_X, RAIO_BOLA } from './jogo.js';

const canvas = document.getElementById('campo');
const ctx = canvas.getContext('2d');
canvas.width = LARGURA;
canvas.height = ALTURA;

let estado = null; // último estado recebido do servidor
let meuLado = null; // 'esquerda', 'direita' ou null para espectador
let aguardando = true;
let aviso = 'Conectando ao servidor...';

function desenhar() {
  ctx.fillStyle = '#101820';
  ctx.fillRect(0, 0, LARGURA, ALTURA);

  ctx.fillStyle = '#2a3a4a';
  for (let y = 0; y < ALTURA; y += 30) {
    ctx.fillRect(LARGURA / 2 - 1, y, 2, 16); // linha tracejada do meio
  }

  if (!estado) {
    escrever(aviso);
    return;
  }

  ctx.fillStyle = '#44586e';
  ctx.font = 'bold 64px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(estado.esquerda.pontos, LARGURA / 2 - 60, 80);
  ctx.fillText(estado.direita.pontos, LARGURA / 2 + 60, 80);

  for (const lado of ['esquerda', 'direita']) {
    ctx.fillStyle = lado === meuLado ? '#4ade80' : '#e6edf3'; // a própria raquete fica verde
    ctx.fillRect(RAQUETE_X[lado], estado[lado].y, RAQUETE_LARGURA, RAQUETE_ALTURA);
  }

  ctx.fillStyle = '#e6edf3';
  ctx.beginPath();
  ctx.arc(estado.bola.x, estado.bola.y, RAIO_BOLA, 0, Math.PI * 2);
  ctx.fill();

  if (estado.vencedor) escrever(`Vitória da ${estado.vencedor}! Espaço para jogar de novo`);
  else if (aguardando) escrever('Aguardando o outro jogador...');
}

function escrever(texto) {
  ctx.fillStyle = '#e6edf3';
  ctx.font = '22px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(texto, LARGURA / 2, ALTURA / 2 + 60); // abaixo do centro para não cobrir a bola
}

function laco() {
  desenhar();
  requestAnimationFrame(laco);
}
requestAnimationFrame(laco);

const socket = new WebSocket(`ws://${location.host}`); // mesmo endereço de onde a página veio

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

const TECLAS = { KeyW: -1, ArrowUp: -1, KeyS: 1, ArrowDown: 1 }; // -1 sobe, 1 desce
let direcaoAtual = 0;

function mudarDirecao(direcao) {
  if (direcao === direcaoAtual) return; // segurar a tecla repete o evento
  direcaoAtual = direcao;
  enviar({ tipo: 'mover', direcao });
}

addEventListener('keydown', (evento) => {
  if (evento.code in TECLAS) mudarDirecao(TECLAS[evento.code]);
  if (evento.code === 'Space') enviar({ tipo: 'reiniciar' });
});

addEventListener('keyup', (evento) => {
  if (TECLAS[evento.code] === direcaoAtual) mudarDirecao(0); // só para se soltou a tecla da direção atual
});
