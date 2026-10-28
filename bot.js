import './server.js'; // sobe o mesmo servidor do npm start
import WebSocket from 'ws';
import { ALTURA, RAQUETE_ALTURA } from './public/jogo.js';

class Bot {
  static REACAO_MS = 250; // tempo até começar a seguir a bola que vem na direção dele
  static ERRO_MAXIMO = 60; // erro de mira em pixels; acima de 48 a raquete não alcança a bola
  static ZONA_MORTA = 10; // perto assim do alvo ele para, senão fica tremendo

  constructor(endereco) {
    this.lado = null;
    this.bolaVindo = false;
    this.pontos = 0;
    this.inicioReacao = 0;
    this.erro = 0;

    this.socket = new WebSocket(endereco); // o bot entra no jogo como um navegador entraria
    this.socket.on('open', () => console.log('Bot conectado. Abra http://localhost:3000 para jogar contra ele.'));
    this.socket.on('message', (dados) => this.receber(JSON.parse(dados)));
    this.socket.on('error', (erro) => console.log(`O bot não conseguiu conectar: ${erro.message}`));
  }

  receber(mensagem) {
    if (mensagem.tipo === 'lado') this.lado = mensagem.lado;
    if (mensagem.tipo === 'estado' && this.lado) this.jogar(mensagem.estado);
  }

  jogar(estado) {
    if (estado.vencedor) return;

    const bola = estado.bola;
    const vindo = this.lado === 'esquerda' ? bola.vx < 0 : bola.vx > 0;
    const pontos = estado.esquerda.pontos + estado.direita.pontos;
    if (vindo && (!this.bolaVindo || pontos !== this.pontos)) { // a bola virou na direção dele ou houve um novo saque
      this.inicioReacao = Date.now();
      this.erro = (Math.random() * 2 - 1) * Bot.ERRO_MAXIMO; // cada jogada tem uma mira diferente
    }
    this.bolaVindo = vindo;
    this.pontos = pontos;

    const reagiu = Date.now() - this.inicioReacao >= Bot.REACAO_MS;
    const alvo = vindo && reagiu ? bola.y + this.erro : ALTURA / 2; // sem a bola vindo, espera no meio
    const raquete = estado[this.lado];
    const distancia = alvo - (raquete.y + RAQUETE_ALTURA / 2);
    const direcao = Math.abs(distancia) < Bot.ZONA_MORTA ? 0 : Math.sign(distancia);

    if (direcao !== raquete.direcao) { // compara com a direção que o servidor tem, não com a última enviada
      this.socket.send(JSON.stringify({ tipo: 'mover', direcao }));
    }
  }
}

new Bot('ws://localhost:3000'); // mesma porta do server.js
