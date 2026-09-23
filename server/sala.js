// A Sala e a ponte entre as conexoes WebSocket e as regras do jogo.
//
// Responsabilidades:
//   - decidir quem e jogador (os dois primeiros) e quem e espectador;
//   - traduzir as mensagens recebidas em chamadas de jogo.js;
//   - rodar o relogio da partida (60 ticks por segundo);
//   - transmitir o estado para todo mundo que estiver conectado.
//
// Toda a comunicacao usa JSON no formato { tipo, ... }. Ver docs/protocolo.md.

import { FASE, LADO, PARTIDA, TIPOS } from '../shared/constantes.js';
import { atualizar, criarEstado, definirDirecao, estadoPublico, iniciarPartida } from './jogo.js';

const INTERVALO_TICK = 1000 / PARTIDA.TICKS_POR_SEGUNDO;

export class Sala {
  constructor() {
    /** @type {Map<import('ws').WebSocket, {lado: string, nome: string}>} */
    this.jogadores = new Map();
    /** @type {Set<import('ws').WebSocket>} */
    this.espectadores = new Set();
    this.estado = criarEstado();
    this.relogio = null;
    this.instanteUltimoTick = 0;
  }

  /** Registra uma nova conexao e devolve a ela o lado que vai controlar. */
  conectar(conexao) {
    const lado = this.ladoLivre();

    if (lado) {
      this.jogadores.set(conexao, { lado, nome: `Jogador ${this.jogadores.size + 1}` });
      console.log(`[sala] jogador entrou no lado ${lado}`);
    } else {
      this.espectadores.add(conexao);
      console.log('[sala] espectador entrou');
    }

    this.enviar(conexao, {
      tipo: TIPOS.BEM_VINDO,
      lado: lado ?? null, // null = espectador, so assiste
      espectador: lado === null,
    });

    conexao.on('message', (dadosBrutos) => this.receber(conexao, dadosBrutos));
    conexao.on('close', () => this.desconectar(conexao));
    conexao.on('error', (erro) => console.error('[ws] erro na conexao:', erro.message));

    if (this.jogadores.size === PARTIDA.MAX_JOGADORES && this.estado.fase !== FASE.JOGANDO) {
      iniciarPartida(this.estado);
      this.iniciarRelogio();
      console.log('[sala] partida iniciada');
    }

    this.difundirEstado();
  }

  /** @returns {string|null} um lado ainda sem dono, ou null se a sala esta cheia */
  ladoLivre() {
    const ocupados = new Set([...this.jogadores.values()].map((j) => j.lado));
    if (!ocupados.has(LADO.ESQUERDA)) return LADO.ESQUERDA;
    if (!ocupados.has(LADO.DIREITA)) return LADO.DIREITA;
    return null;
  }

  /** Interpreta uma mensagem vinda do cliente. */
  receber(conexao, dadosBrutos) {
    let mensagem;
    try {
      mensagem = JSON.parse(dadosBrutos.toString());
    } catch {
      this.enviar(conexao, { tipo: TIPOS.ERRO, mensagem: 'JSON invalido' });
      return;
    }

    const jogador = this.jogadores.get(conexao);

    switch (mensagem.tipo) {
      case TIPOS.ENTRAR:
        if (jogador && typeof mensagem.nome === 'string') {
          jogador.nome = mensagem.nome.slice(0, 20);
        }
        break;

      case TIPOS.MOVER:
        // Um cliente so pode mover a propria raquete: o lado vem do registro do
        // servidor, nunca da mensagem. Espectador cai fora aqui.
        if (jogador) definirDirecao(this.estado, jogador.lado, mensagem.direcao);
        break;

      default:
        this.enviar(conexao, { tipo: TIPOS.ERRO, mensagem: `tipo desconhecido: ${mensagem.tipo}` });
    }
  }

  /** Remove a conexao e pausa a partida se faltou jogador. */
  desconectar(conexao) {
    if (this.jogadores.delete(conexao)) {
      console.log('[sala] jogador saiu — partida pausada');
      this.estado.fase = FASE.AGUARDANDO;
      this.pararRelogio();
    } else {
      this.espectadores.delete(conexao);
    }
    this.difundirEstado();
  }

  iniciarRelogio() {
    if (this.relogio) return;
    this.instanteUltimoTick = Date.now();
    this.relogio = setInterval(() => this.tick(), INTERVALO_TICK);
  }

  pararRelogio() {
    clearInterval(this.relogio);
    this.relogio = null;
  }

  /** Um passo da simulacao: avanca o jogo e avisa todo mundo. */
  tick() {
    const agora = Date.now();
    const dt = (agora - this.instanteUltimoTick) / 1000; // em segundos
    this.instanteUltimoTick = agora;

    atualizar(this.estado, dt);
    this.difundirEstado();

    if (this.estado.fase === FASE.ENCERRADA) {
      this.pararRelogio();
      this.difundir({ tipo: TIPOS.FIM, vencedor: this.estado.vencedor });
    }
  }

  difundirEstado() {
    this.difundir({ tipo: TIPOS.ESTADO, estado: estadoPublico(this.estado) });
  }

  difundir(mensagem) {
    const texto = JSON.stringify(mensagem);
    for (const conexao of [...this.jogadores.keys(), ...this.espectadores]) {
      this.enviarTexto(conexao, texto);
    }
  }

  enviar(conexao, mensagem) {
    this.enviarTexto(conexao, JSON.stringify(mensagem));
  }

  enviarTexto(conexao, texto) {
    // 1 = OPEN. Enviar para socket fechando derruba o processo.
    if (conexao.readyState === 1) conexao.send(texto);
  }
}
