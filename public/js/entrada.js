// Teclado.
//
// Guardamos quais teclas estao pressionadas e so avisamos quando a direcao
// MUDA. Sem isso, o navegador dispara "keydown" dezenas de vezes por segundo
// enquanto a tecla esta segurada e o servidor recebe mensagem repetida a toa.

import { DIRECAO } from '/shared/constantes.js';

const TECLAS_CIMA = ['ArrowUp', 'w', 'W'];
const TECLAS_BAIXO = ['ArrowDown', 's', 'S'];

export function ouvirTeclado(aoMudarDirecao) {
  const pressionadas = new Set();
  let direcaoAtual = DIRECAO.PARADO;

  function recalcular() {
    const cima = TECLAS_CIMA.some((tecla) => pressionadas.has(tecla));
    const baixo = TECLAS_BAIXO.some((tecla) => pressionadas.has(tecla));

    let direcao = DIRECAO.PARADO;
    if (cima && !baixo) direcao = DIRECAO.CIMA;
    if (baixo && !cima) direcao = DIRECAO.BAIXO;

    if (direcao !== direcaoAtual) {
      direcaoAtual = direcao;
      aoMudarDirecao(direcao);
    }
  }

  window.addEventListener('keydown', (evento) => {
    if (evento.repeat) return;
    pressionadas.add(evento.key);
    // Evita a pagina rolar quando o jogador usa as setas.
    if ([...TECLAS_CIMA, ...TECLAS_BAIXO].includes(evento.key)) evento.preventDefault();
    recalcular();
  });

  window.addEventListener('keyup', (evento) => {
    pressionadas.delete(evento.key);
    recalcular();
  });

  // Trocar de aba com a tecla apertada deixaria a raquete andando sozinha.
  window.addEventListener('blur', () => {
    pressionadas.clear();
    recalcular();
  });
}
