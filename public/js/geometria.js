// Posicoes derivadas das constantes compartilhadas.
//
// O servidor tem uma copia disto em server/jogo.js. Sao poucas linhas, mas se
// um dia divergirem as raquetes aparecem em lugares diferentes nas duas telas —
// por isso os dois calculos saem das MESMAS constantes de shared/constantes.js.

import { CAMPO, LADO, RAQUETE } from '/shared/constantes.js';

/** Posicao X fixa de cada raquete. */
export const X_RAQUETE = {
  [LADO.ESQUERDA]: RAQUETE.MARGEM,
  [LADO.DIREITA]: CAMPO.LARGURA - RAQUETE.MARGEM - RAQUETE.LARGURA,
};
