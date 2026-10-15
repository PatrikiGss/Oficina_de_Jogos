export const LARGURA = 800;
export const ALTURA = 480;
export const RAQUETE_LARGURA = 12;
export const RAQUETE_ALTURA = 80;
export const RAIO_BOLA = 8;

export const RAQUETE_X = {
  esquerda: 24,
  direita: LARGURA - 24 - RAQUETE_LARGURA,
};

const VELOCIDADE_RAQUETE = 420; // pixels por segundo
const VELOCIDADE_BOLA = 300;
const VELOCIDADE_MAXIMA = 800;
const PONTOS_PARA_VENCER = 5;

export function criarEstado() {
  return {
    bola: novaBola(Math.random() < 0.5 ? -1 : 1),
    esquerda: { y: ALTURA / 2 - RAQUETE_ALTURA / 2, direcao: 0, pontos: 0 },
    direita: { y: ALTURA / 2 - RAQUETE_ALTURA / 2, direcao: 0, pontos: 0 },
    vencedor: null, // 'esquerda' ou 'direita' quando alguém ganhar
  };
}

function novaBola(sentido) {
  return {
    x: LARGURA / 2,
    y: ALTURA / 2,
    vx: VELOCIDADE_BOLA * sentido, // sentido: -1 para a esquerda, 1 para a direita
    vy: (Math.random() * 2 - 1) * VELOCIDADE_BOLA * 0.5, // inclinação sorteada a cada saque
  };
}

export function atualizar(estado, dt) {
  if (estado.vencedor) return;

  dt = Math.min(dt, 1 / 30); // um dt grande faria a bola atravessar a raquete

  moverRaquete(estado.esquerda, dt);
  moverRaquete(estado.direita, dt);

  const bola = estado.bola;
  bola.x += bola.vx * dt;
  bola.y += bola.vy * dt;

  if (bola.y < RAIO_BOLA) bola.vy = Math.abs(bola.vy); // teto
  if (bola.y > ALTURA - RAIO_BOLA) bola.vy = -Math.abs(bola.vy); // chão

  if (bola.vx < 0 && encostou(bola, 'esquerda', estado.esquerda)) {
    rebater(bola, estado.esquerda, 1);
  }
  if (bola.vx > 0 && encostou(bola, 'direita', estado.direita)) {
    rebater(bola, estado.direita, -1);
  }

  if (bola.x < 0) marcarPonto(estado, 'direita');
  if (bola.x > LARGURA) marcarPonto(estado, 'esquerda');
}

function moverRaquete(raquete, dt) {
  raquete.y += raquete.direcao * VELOCIDADE_RAQUETE * dt;
  raquete.y = Math.max(0, Math.min(ALTURA - RAQUETE_ALTURA, raquete.y)); // não deixa sair do campo
}

function encostou(bola, lado, raquete) {
  const x = RAQUETE_X[lado];
  return (
    bola.x + RAIO_BOLA > x &&
    bola.x - RAIO_BOLA < x + RAQUETE_LARGURA &&
    bola.y + RAIO_BOLA > raquete.y &&
    bola.y - RAIO_BOLA < raquete.y + RAQUETE_ALTURA
  );
}

function rebater(bola, raquete, sentido) {
  const meio = raquete.y + RAQUETE_ALTURA / 2;
  const impacto = (bola.y - meio) / (RAQUETE_ALTURA / 2); // -1 na ponta de cima, 0 no meio, 1 na ponta de baixo

  bola.vx = sentido * Math.min(Math.abs(bola.vx) * 1.05, VELOCIDADE_MAXIMA); // 5% mais rápida a cada rebatida
  bola.vy = impacto * VELOCIDADE_BOLA; // bater na ponta deixa a bola mais inclinada
}

function marcarPonto(estado, lado) {
  estado[lado].pontos++;
  if (estado[lado].pontos >= PONTOS_PARA_VENCER) {
    estado.vencedor = lado;
  }
  estado.bola = novaBola(lado === 'esquerda' ? 1 : -1); // o saque vai para quem levou o ponto
}
