// Ponto de entrada do cliente: junta rede, entrada e desenho.
//
// Fluxo:
//   teclado -> rede.mover()  ->  servidor calcula  ->  mensagem "estado"
//   -> guardamos o estado -> requestAnimationFrame desenha

import { criarRenderizador } from './render.js';
import { ouvirTeclado } from './entrada.js';
import { Rede } from './rede.js';

const canvas = document.getElementById('campo');
const elementoStatus = document.getElementById('status');
const elementoPapel = document.getElementById('papel');

const desenhar = criarRenderizador(canvas);

// Ultimo estado recebido do servidor e o lado que este navegador controla.
let estadoAtual = null;
let meuLado = null;

const rede = new Rede({
  aoStatus(texto, conectado) {
    elementoStatus.textContent = texto;
    elementoStatus.classList.toggle('conectado', conectado);
  },

  aoBemVindo(mensagem) {
    meuLado = mensagem.lado;
    elementoPapel.textContent = mensagem.espectador
      ? 'Voce entrou como espectador (a sala ja tem dois jogadores).'
      : `Voce controla a raquete da ${meuLado}.`;
  },

  aoEstado(estado) {
    estadoAtual = estado;
  },
});

// Espectador tambem escuta o teclado; o servidor simplesmente ignora o comando
// de quem nao e jogador (ver server/sala.js).
ouvirTeclado((direcao) => rede.mover(direcao));

rede.conectar();

// O desenho roda no ritmo da tela (~60 fps), independente da chegada das
// mensagens. Se a rede engasgar, continuamos desenhando o ultimo estado em vez
// de travar a imagem.
function laco() {
  desenhar(estadoAtual, meuLado);
  requestAnimationFrame(laco);
}

requestAnimationFrame(laco);
