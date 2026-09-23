// Regras do jogo: estado da partida e simulacao.
//
// IMPORTANTE: este arquivo roda SO no servidor. Ele e a "fonte da verdade" —
// o cliente nunca calcula posicao de bola, so desenha o que recebe. E isso que
// impede um jogador de trapacear mexendo no codigo do proprio navegador.
//
// As funcoes aqui sao propositalmente simples (recebem o estado, alteram o
// estado) para poderem ser explicadas linha a linha na oficina.

import { BOLA, CAMPO, DIRECAO, FASE, LADO, PARTIDA, RAQUETE } from '../shared/constantes.js';

/** Posicao X fixa de cada raquete (elas so se movem na vertical). */
export const X_RAQUETE = {
  [LADO.ESQUERDA]: RAQUETE.MARGEM,
  [LADO.DIREITA]: CAMPO.LARGURA - RAQUETE.MARGEM - RAQUETE.LARGURA,
};

/** Cria o estado inicial de uma partida. */
export function criarEstado() {
  return {
    fase: FASE.AGUARDANDO,
    bola: {
      x: CAMPO.LARGURA / 2,
      y: CAMPO.ALTURA / 2,
      vx: 0,
      vy: 0,
    },
    raquetes: {
      [LADO.ESQUERDA]: { y: (CAMPO.ALTURA - RAQUETE.ALTURA) / 2, direcao: DIRECAO.PARADO },
      [LADO.DIREITA]: { y: (CAMPO.ALTURA - RAQUETE.ALTURA) / 2, direcao: DIRECAO.PARADO },
    },
    placar: {
      [LADO.ESQUERDA]: 0,
      [LADO.DIREITA]: 0,
    },
    vencedor: null,
  };
}

/** Guarda a direcao que o jogador esta pedindo (cima, baixo ou parado). */
export function definirDirecao(estado, lado, direcao) {
  const raquete = estado.raquetes[lado];
  if (!raquete) return;

  // Nunca confie no valor que veio da rede: so aceitamos -1, 0 ou 1.
  const valores = [DIRECAO.CIMA, DIRECAO.PARADO, DIRECAO.BAIXO];
  raquete.direcao = valores.includes(direcao) ? direcao : DIRECAO.PARADO;
}

/** Coloca a bola no centro e a lanca na direcao de quem acabou de marcar. */
export function sacar(estado, ladoQueSaca) {
  const anguloMaximo = Math.PI / 4; // ate 45 graus para cima ou para baixo
  const angulo = (Math.random() * 2 - 1) * anguloMaximo;
  const sentidoX = ladoQueSaca === LADO.ESQUERDA ? -1 : 1;

  estado.bola.x = CAMPO.LARGURA / 2;
  estado.bola.y = CAMPO.ALTURA / 2;
  estado.bola.vx = Math.cos(angulo) * BOLA.VELOCIDADE_INICIAL * sentidoX;
  estado.bola.vy = Math.sin(angulo) * BOLA.VELOCIDADE_INICIAL;
}

/** Comeca a partida (chamado quando os dois jogadores estao conectados). */
export function iniciarPartida(estado) {
  const novo = criarEstado();
  Object.assign(estado, novo);
  estado.fase = FASE.JOGANDO;
  sacar(estado, Math.random() < 0.5 ? LADO.ESQUERDA : LADO.DIREITA);
}

/**
 * Avanca a simulacao em `dt` segundos. Chamado 60x por segundo pela Sala.
 *
 * ---------------------------------------------------------------------------
 * SPRINT 2 — "Construcao 2" do cronograma (movimento, fisica e placar).
 * Este e o miolo que sera escrito ao vivo na oficina. Os passos abaixo estao
 * na ordem em que devem ser implementados:
 *
 *   1. Mover as raquetes
 *      raquete.y += raquete.direcao * RAQUETE.VELOCIDADE * dt
 *      e prender o valor entre 0 e CAMPO.ALTURA - RAQUETE.ALTURA.
 *
 *   2. Mover a bola
 *      bola.x += bola.vx * dt   /   bola.y += bola.vy * dt
 *
 *   3. Quicar no teto e no chao
 *      se bola.y - RAIO < 0 ou bola.y + RAIO > CAMPO.ALTURA, inverter bola.vy
 *      (e reposicionar a bola para dentro, senao ela "gruda" na parede).
 *
 *   4. Rebater nas raquetes
 *      testar colisao com o retangulo de cada raquete; ao rebater:
 *      inverter bola.vx, multiplicar a velocidade por BOLA.FATOR_ACELERACAO
 *      (limitado a BOLA.VELOCIDADE_MAXIMA) e variar bola.vy conforme o ponto
 *      da raquete que foi atingido — e isso que da controle ao jogador.
 *
 *   5. Marcar ponto
 *      se bola.x < 0  -> ponto do lado DIREITA
 *      se bola.x > CAMPO.LARGURA -> ponto do lado ESQUERDA
 *      somar no placar e chamar sacar() para o lado que sofreu.
 *
 *   6. Encerrar
 *      quando alguem chegar a PARTIDA.PONTOS_PARA_VENCER, definir
 *      estado.vencedor e estado.fase = FASE.ENCERRADA.
 * ---------------------------------------------------------------------------
 *
 * @param {object} estado estado da partida (alterado no lugar)
 * @param {number} dt segundos desde o ultimo tick
 */
export function atualizar(estado, dt) {
  if (estado.fase !== FASE.JOGANDO) return;

  // TODO(sprint-2): implementar os passos 1 a 6 descritos acima.
  void dt;
  void PARTIDA;
}

/**
 * Monta a versao do estado que vai para a rede.
 * Mandamos so o necessario e arredondado: menos bytes por tick, menos
 * diferenca entre as maquinas.
 */
export function estadoPublico(estado) {
  return {
    fase: estado.fase,
    bola: {
      x: Math.round(estado.bola.x),
      y: Math.round(estado.bola.y),
    },
    raquetes: {
      [LADO.ESQUERDA]: Math.round(estado.raquetes[LADO.ESQUERDA].y),
      [LADO.DIREITA]: Math.round(estado.raquetes[LADO.DIREITA].y),
    },
    placar: estado.placar,
    vencedor: estado.vencedor,
  };
}
