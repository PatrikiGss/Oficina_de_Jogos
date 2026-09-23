# Roadmap

O jogo **não** precisa sair inteiro em uma sprint. Cada sprint abaixo fecha um
pedaço que roda e pode ser demonstrado; a ordem importa, porque cada uma usa o
que a anterior deixou pronto.

Coluna "Bloco da oficina" liga a sprint ao cronograma de 3h em
[escopo-oficina.md](escopo-oficina.md).

| Sprint | Entrega | Bloco da oficina | Status |
| --- | --- | --- | --- |
| 0 | Estrutura, servidor e conexão | Setup (0:25–0:45) | ✅ concluída |
| 1 | Desenho do campo no Canvas | Construção 1 (0:45–1:15) | ✅ concluída |
| 2 | Física, movimento e placar | Construção 2 (1:15–1:45) | 🚧 pendente |
| 3 | Sincronização e partida completa | Construção 3 (1:45–2:25) | 🚧 pendente |
| 4 | Testes em rede e roteiro de aula | Testes (2:25–2:50) | 🚧 pendente |
| 5+ | Extras (opcionais) | — | 💤 backlog |

---

## Sprint 0 — Fundação ✅

Objetivo: `npm start` sobe algo que abre no navegador e conecta.

- [x] `package.json`, `.gitignore`, estrutura de pastas
- [x] Servidor HTTP de arquivos estáticos sem dependência externa
      (`server/estatico.js`)
- [x] Servidor WebSocket na mesma porta (`server/server.js`)
- [x] IP local impresso no console para a outra dupla conectar
      (`server/rede-local.js`)
- [x] `shared/constantes.js` compartilhado entre os dois lados
- [x] Cliente conecta, reconecta sozinho ao cair (`public/js/rede.js`)

**Demonstrável:** abrir duas abas, ver "Conectado", ver no console do servidor
uma virar esquerda e a outra direita.

## Sprint 1 — O campo ✅

Objetivo: a tela parece um Ping-Pong, mesmo parado.

- [x] Canvas dimensionado pelas constantes (`public/js/render.js`)
- [x] Linha central tracejada, raquetes, bola, placar
- [x] A raquete do próprio jogador sai destacada em verde
- [x] Avisos de fase ("Aguardando o outro jogador...", "Venceu: ...")
- [x] Captura de teclado sem repetição (`public/js/entrada.js`)

**Demonstrável:** campo desenhado, placar 0×0, mensagem de espera.

## Sprint 2 — Física e placar 🚧

Objetivo: a bola anda e o placar mexe. **É a única sprint que mexe em regra de
jogo** — todo o trabalho está em `server/jogo.js`, na função `atualizar()`, que
já tem os seis passos comentados na ordem de implementação.

- [ ] Movimento vertical das raquetes, preso às bordas do campo
- [ ] Movimento da bola por `dt` (nunca por frame — senão a velocidade muda
      conforme a máquina)
- [ ] Quique no teto e no chão
- [ ] Rebatida na raquete, com aceleração e ângulo dependendo de onde bateu
- [ ] Ponto ao sair pela lateral + saque para quem sofreu (`sacar()`)
- [ ] Fim de partida em `PARTIDA.PONTOS_PARA_VENCER`

**Demonstrável:** partida jogável do início ao fim entre duas abas.

**Cuidado clássico:** ao inverter `vy` no quique, reposicione a bola para dentro
do campo. Sem isso ela fica presa na parede invertendo o sinal todo tick.

## Sprint 3 — Sincronização sólida 🚧

Objetivo: dois computadores diferentes, mesma partida, sem esquisitice.

- [ ] Contagem regressiva de 3 segundos antes do saque
- [ ] Pausa e retomada quando um jogador cai e volta
- [ ] "Rematch" sem reiniciar o servidor
- [ ] Medir e exibir o ping na tela
- [ ] Limitar o envio de estado (ex.: 30x/s) e comparar se dá para notar

**Demonstrável:** partida entre duas máquinas na rede, com queda e volta de um
dos lados sem travar.

## Sprint 4 — Oficina 🚧

Objetivo: material pronto para a aula de 3h.

- [ ] Roteiro do instrutor com os pontos de parada de cada bloco
- [ ] `docs/js-para-quem-vem-do-java.md` (`let`/`const`, arrow functions,
      objetos e JSON, ausência de tipagem, callbacks)
- [ ] Checklist de setup: versão do Node, liberação de firewall, teste de ping
      entre as máquinas
- [ ] Plano B: e se a rede da sala bloquear a porta 3000?
- [ ] Teste de mesa com número ímpar de duplas

**Demonstrável:** um monitor consegue conduzir a oficina só com o repositório.

## Sprint 5+ — Backlog 💤

Nada aqui é necessário para a oficina. Serve para quem quiser continuar depois.

- Salas múltiplas com código de 4 letras (vários jogos no mesmo servidor)
- Modo 1 jogador contra a máquina, para testar sozinho
- Efeitos sonoros na rebatida e no ponto
- Placar histórico entre duplas
- Controle por toque, para jogar no celular na mesma rede
- Testes automatizados da física (`node --test`) — `jogo.js` é feito de funções
  puras justamente para permitir isso

---

## Como uma sprint vira código

Seguindo a regra do projeto — nada direto na `main`:

```bash
git checkout -b feat/sprint-2-fisica
# implementa, testa com duas abas
git commit -m "feat: movimento das raquetes e quique da bola"
git push -u origin feat/sprint-2-fisica
# abre o Pull Request e chama a revisão
```
