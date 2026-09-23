// Desenho no Canvas 2D.
//
// Regra de ouro: este arquivo NAO decide nada. Ele recebe o estado que veio do
// servidor e pinta. Se a bola nao anda, o problema esta no servidor, nao aqui.

import { BOLA, CAMPO, FASE, LADO, RAQUETE } from '/shared/constantes.js';
import { X_RAQUETE } from './geometria.js';

const CORES = {
  linha: '#2a3a4a',
  raquete: '#e6edf3',
  raqueteDoJogador: '#4ade80',
  bola: '#e6edf3',
  placar: '#44586e',
  aviso: '#e6edf3',
};

export function criarRenderizador(canvas) {
  const ctx = canvas.getContext('2d');
  canvas.width = CAMPO.LARGURA;
  canvas.height = CAMPO.ALTURA;

  /**
   * @param {object|null} estado ultimo estado recebido do servidor
   * @param {string|null} meuLado lado que este navegador controla
   */
  return function desenhar(estado, meuLado) {
    ctx.clearRect(0, 0, CAMPO.LARGURA, CAMPO.ALTURA);
    desenharLinhaCentral(ctx);

    if (!estado) {
      desenharAviso(ctx, 'Aguardando servidor...');
      return;
    }

    desenharPlacar(ctx, estado.placar);

    for (const lado of [LADO.ESQUERDA, LADO.DIREITA]) {
      const destacar = lado === meuLado;
      desenharRaquete(ctx, X_RAQUETE[lado], estado.raquetes[lado], destacar);
    }

    if (estado.fase === FASE.JOGANDO) {
      desenharBola(ctx, estado.bola);
    } else if (estado.fase === FASE.AGUARDANDO) {
      desenharAviso(ctx, 'Aguardando o outro jogador...');
    } else if (estado.fase === FASE.ENCERRADA) {
      desenharAviso(ctx, `Venceu: ${estado.vencedor}`);
    }
  };
}

function desenharLinhaCentral(ctx) {
  ctx.save();
  ctx.strokeStyle = CORES.linha;
  ctx.lineWidth = 2;
  ctx.setLineDash([10, 14]); // linha tracejada do meio da quadra
  ctx.beginPath();
  ctx.moveTo(CAMPO.LARGURA / 2, 0);
  ctx.lineTo(CAMPO.LARGURA / 2, CAMPO.ALTURA);
  ctx.stroke();
  ctx.restore();
}

function desenharRaquete(ctx, x, y, destacar) {
  ctx.fillStyle = destacar ? CORES.raqueteDoJogador : CORES.raquete;
  ctx.fillRect(x, y, RAQUETE.LARGURA, RAQUETE.ALTURA);
}

function desenharBola(ctx, bola) {
  ctx.fillStyle = CORES.bola;
  ctx.beginPath();
  ctx.arc(bola.x, bola.y, BOLA.RAIO, 0, Math.PI * 2);
  ctx.fill();
}

function desenharPlacar(ctx, placar) {
  ctx.save();
  ctx.fillStyle = CORES.placar;
  ctx.font = 'bold 64px "Segoe UI", system-ui, sans-serif';
  ctx.textBaseline = 'top';

  ctx.textAlign = 'right';
  ctx.fillText(String(placar[LADO.ESQUERDA]), CAMPO.LARGURA / 2 - 32, 24);

  ctx.textAlign = 'left';
  ctx.fillText(String(placar[LADO.DIREITA]), CAMPO.LARGURA / 2 + 32, 24);
  ctx.restore();
}

function desenharAviso(ctx, texto) {
  ctx.save();
  ctx.fillStyle = CORES.aviso;
  ctx.font = '20px "Segoe UI", system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(texto, CAMPO.LARGURA / 2, CAMPO.ALTURA / 2);
  ctx.restore();
}
