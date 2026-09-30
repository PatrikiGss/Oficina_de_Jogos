// =============================================================================
// jogo.js — AS REGRAS DO JOGO
//
// Construção 1: medidas do campo e estado inicial
// Construção 2: física (atualizar)
// Construção 3: nada muda aqui! O servidor passa a importar ESTE arquivo.
//
// Este arquivo não desenha nada e não sabe o que é rede. Só regra.
// Por isso ele roda tanto no navegador quanto no Node.js.
// =============================================================================

// ----- Construção 1: medidas do campo (em pixels) -----------------------------

export const LARGURA = 800;
export const ALTURA = 480;
export const RAQUETE_LARGURA = 12;
export const RAQUETE_ALTURA = 80;
export const RAIO_BOLA = 8;

// As raquetes só andam na vertical, então o X delas é fixo.
export const RAQUETE_X = {
  esquerda: 24,
  direita: LARGURA - 24 - RAQUETE_LARGURA,
};

const VELOCIDADE_RAQUETE = 420; // pixels por segundo
const VELOCIDADE_BOLA = 300;
const VELOCIDADE_MAXIMA = 800;
const PONTOS_PARA_VENCER = 5;

// Tudo o que muda durante a partida mora neste objeto.
// Em Java seria uma classe com atributos; em JS basta um objeto literal.
export function criarEstado() {
  return {
    bola: novaBola(Math.random() < 0.5 ? -1 : 1),
    esquerda: { y: ALTURA / 2 - RAQUETE_ALTURA / 2, direcao: 0, pontos: 0 },
    direita: { y: ALTURA / 2 - RAQUETE_ALTURA / 2, direcao: 0, pontos: 0 },
    vencedor: null, // vira 'esquerda' ou 'direita' quando alguém ganhar
  };
}

// Bola no centro, indo para a esquerda (sentido -1) ou direita (sentido 1),
// com uma inclinação sorteada para cada saque ser diferente.
function novaBola(sentido) {
  return {
    x: LARGURA / 2,
    y: ALTURA / 2,
    vx: VELOCIDADE_BOLA * sentido,
    vy: (Math.random() * 2 - 1) * VELOCIDADE_BOLA * 0.5,
  };
}

// ----- Construção 2: física -----------------------------------------------------

// Avança o jogo em `dt` segundos. É chamada ~60 vezes por segundo.
// Usar o tempo (dt) e não "um passo por quadro" faz o jogo ter a mesma
// velocidade em qualquer computador, rápido ou lento.
export function atualizar(estado, dt) {
  if (estado.vencedor) return; // partida encerrada: tudo parado

  // Se o computador engasgou (ou a aba ficou escondida), dt fica enorme e a
  // bola "teletransporta" através da raquete. Limitamos a 1/30 de segundo.
  dt = Math.min(dt, 1 / 30);

  moverRaquete(estado.esquerda, dt);
  moverRaquete(estado.direita, dt);

  const bola = estado.bola;
  bola.x += bola.vx * dt;
  bola.y += bola.vy * dt;

  // Teto e chão: força a bola a voltar para dentro do campo.
  if (bola.y < RAIO_BOLA) bola.vy = Math.abs(bola.vy);
  if (bola.y > ALTURA - RAIO_BOLA) bola.vy = -Math.abs(bola.vy);

  // Raquetes: só rebate se a bola estiver indo na direção dela.
  if (bola.vx < 0 && encostou(bola, 'esquerda', estado.esquerda)) {
    rebater(bola, estado.esquerda, 1);
  }
  if (bola.vx > 0 && encostou(bola, 'direita', estado.direita)) {
    rebater(bola, estado.direita, -1);
  }

  // Saiu pela lateral: ponto para quem está do outro lado.
  if (bola.x < 0) marcarPonto(estado, 'direita');
  if (bola.x > LARGURA) marcarPonto(estado, 'esquerda');
}

function moverRaquete(raquete, dt) {
  raquete.y += raquete.direcao * VELOCIDADE_RAQUETE * dt;
  // Não deixa a raquete sair do campo (mesmo Math.max/Math.min do Java).
  raquete.y = Math.max(0, Math.min(ALTURA - RAQUETE_ALTURA, raquete.y));
}

// Colisão entre dois retângulos: a "caixa" da bola sobrepõe a da raquete?
function encostou(bola, lado, raquete) {
  const x = RAQUETE_X[lado];
  return (
    bola.x + RAIO_BOLA > x &&
    bola.x - RAIO_BOLA < x + RAQUETE_LARGURA &&
    bola.y + RAIO_BOLA > raquete.y &&
    bola.y - RAIO_BOLA < raquete.y + RAQUETE_ALTURA
  );
}

// sentido: 1 manda a bola para a direita, -1 para a esquerda.
function rebater(bola, raquete, sentido) {
  // Onde a bola bateu? -1 = ponta de cima, 0 = meio, 1 = ponta de baixo.
  const meio = raquete.y + RAQUETE_ALTURA / 2;
  const impacto = (bola.y - meio) / (RAQUETE_ALTURA / 2);

  // Volta 5% mais rápida (até o limite) e mais inclinada se bateu na ponta.
  // É isso que dá controle ao jogador: ele escolhe o ângulo com a raquete.
  bola.vx = sentido * Math.min(Math.abs(bola.vx) * 1.05, VELOCIDADE_MAXIMA);
  bola.vy = impacto * VELOCIDADE_BOLA;
}

function marcarPonto(estado, lado) {
  estado[lado].pontos++;
  if (estado[lado].pontos >= PONTOS_PARA_VENCER) {
    estado.vencedor = lado;
  }
  // Recomeça do meio, indo para quem levou o ponto.
  estado.bola = novaBola(lado === 'esquerda' ? 1 : -1);
}
