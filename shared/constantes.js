// Constantes compartilhadas entre servidor (Node.js) e cliente (navegador).
//
// Este e o unico arquivo importado pelos dois lados: o servidor importa pelo
// caminho do disco e o navegador importa por HTTP (o servidor publica a pasta
// /shared). Manter as medidas aqui evita que servidor e cliente discordem sobre
// o tamanho do campo — um bug classico e dificil de achar em jogo em rede.

/** Dimensoes logicas do campo, em pixels. O canvas usa exatamente estas medidas. */
export const CAMPO = {
  LARGURA: 800,
  ALTURA: 480,
};

/** Raquete de cada jogador. VELOCIDADE esta em pixels por segundo. */
export const RAQUETE = {
  LARGURA: 12,
  ALTURA: 80,
  MARGEM: 24, // distancia entre a raquete e a parede lateral
  VELOCIDADE: 420,
};

/** Bola. VELOCIDADE_INICIAL em pixels por segundo. */
export const BOLA = {
  RAIO: 8,
  VELOCIDADE_INICIAL: 300,
  FATOR_ACELERACAO: 1.05, // a cada rebatida a bola fica 5% mais rapida
  VELOCIDADE_MAXIMA: 900,
};

/** Regras da partida. */
export const PARTIDA = {
  PONTOS_PARA_VENCER: 5,
  TICKS_POR_SEGUNDO: 60, // frequencia da simulacao no servidor
  MAX_JOGADORES: 2,
};

/** Lados do campo. O servidor decide quem fica em cada lado na hora da conexao. */
export const LADO = {
  ESQUERDA: 'esquerda',
  DIREITA: 'direita',
};

/** Direcao do comando de movimento enviado pelo cliente. */
export const DIRECAO = {
  CIMA: -1,
  PARADO: 0,
  BAIXO: 1,
};

/** Fases da partida, usadas para a tela decidir o que mostrar. */
export const FASE = {
  AGUARDANDO: 'aguardando', // falta jogador para comecar
  JOGANDO: 'jogando',
  ENCERRADA: 'encerrada',
};

/**
 * Tipos de mensagem do protocolo WebSocket.
 * Documentacao completa em docs/protocolo.md.
 */
export const TIPOS = {
  // cliente -> servidor
  ENTRAR: 'entrar',
  MOVER: 'mover',
  // servidor -> cliente
  BEM_VINDO: 'bem-vindo',
  ESTADO: 'estado',
  FIM: 'fim',
  ERRO: 'erro',
};
