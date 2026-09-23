// Camada de rede do cliente: tudo que fala WebSocket mora aqui.
//
// O resto do cliente nao sabe o que e um socket — recebe estado e manda
// comandos. Isso deixa render.js e entrada.js testaveis sem servidor.

import { TIPOS } from '/shared/constantes.js';

export class Rede {
  /**
   * @param {{aoEstado: Function, aoBemVindo: Function, aoStatus: Function}} eventos
   */
  constructor(eventos) {
    this.eventos = eventos;
    this.socket = null;
    this.tentativas = 0;
  }

  conectar() {
    // Monta ws://<host>:<porta> a partir do endereco que o navegador ja abriu.
    // Assim o mesmo arquivo funciona em localhost e no IP da rede local, sem
    // ninguem precisar editar codigo durante a oficina.
    const protocolo = location.protocol === 'https:' ? 'wss:' : 'ws:';
    const endereco = `${protocolo}//${location.host}`;

    this.eventos.aoStatus(`Conectando em ${endereco}...`, false);
    this.socket = new WebSocket(endereco);

    this.socket.addEventListener('open', () => {
      this.tentativas = 0;
      this.eventos.aoStatus('Conectado', true);
      this.enviar({ tipo: TIPOS.ENTRAR, nome: 'dupla' });
    });

    this.socket.addEventListener('message', (evento) => {
      const mensagem = JSON.parse(evento.data);

      switch (mensagem.tipo) {
        case TIPOS.BEM_VINDO:
          this.eventos.aoBemVindo(mensagem);
          break;
        case TIPOS.ESTADO:
          this.eventos.aoEstado(mensagem.estado);
          break;
        case TIPOS.FIM:
          this.eventos.aoStatus(`Fim de jogo — venceu: ${mensagem.vencedor}`, true);
          break;
        case TIPOS.ERRO:
          console.warn('[rede] erro do servidor:', mensagem.mensagem);
          break;
      }
    });

    this.socket.addEventListener('close', () => {
      this.eventos.aoStatus('Desconectado — tentando reconectar...', false);
      this.reconectar();
    });

    this.socket.addEventListener('error', () => {
      this.eventos.aoStatus('Falha na conexao', false);
    });
  }

  /** Reconecta com espera crescente (1s, 2s, 4s... ate 8s). */
  reconectar() {
    this.tentativas += 1;
    const espera = Math.min(1000 * 2 ** (this.tentativas - 1), 8000);
    setTimeout(() => this.conectar(), espera);
  }

  enviar(mensagem) {
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(mensagem));
    }
  }

  /** Avisa o servidor que a raquete deve subir (-1), descer (1) ou parar (0). */
  mover(direcao) {
    this.enviar({ tipo: TIPOS.MOVER, direcao });
  }
}
