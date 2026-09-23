# Escopo da Oficina — Ping-Pong Multiplayer com Sockets (JavaScript)

> Transcrição do documento de escopo entregue pelos instrutores. É a fonte da
> verdade sobre **o que a oficina precisa entregar**; o código do repositório
> existe para atender a isto.

## 1. Objetivo

Construir, em pair programming, um jogo de Ping-Pong multiplayer em JavaScript,
com dois computadores conectados na mesma rede via WebSocket. O código é
fornecido pelos instrutores; a aula consiste em explicar linha a linha enquanto
os alunos acompanham e replicam.

**Duração:** 3 horas.

## 2. Público-alvo

Alunos da 2ª fase de Ciência da Computação. Já possuem base de lógica de
programação em Java.

## 3. Metodologia

- Alunos em duplas, um computador por dupla, em pair programming.
- Reduz o número de máquinas e de atendimentos individuais durante a explicação.
- Código fornecido pronto pelos instrutores; formato "mostrar e explicar →
  copiar e rodar".
- Ao final, cada dupla conecta seu jogo ao de outra dupla via rede local e os
  integrantes se revezam jogando.
- Equipe: 1 instrutor principal conduzindo + monitores de apoio conforme o
  número de duplas.

## 4. Jogo e tecnologia

- **Jogo:** Ping-Pong (1x1).
- **Tecnologia:** JavaScript — Node.js + WebSocket no servidor, HTML5 Canvas no
  cliente (navegador).
- Apenas o computador que hospeda a partida precisa ter Node.js instalado; o
  restante roda direto no navegador.

## 5. Arquitetura técnica

- Um servidor Node.js mantém o estado do jogo (posição da bola, das raquetes e
  placar).
- Os dois clientes (navegadores) se conectam ao servidor pelo IP local
  (`ws://<ip-do-host>:3000`).
- Cada cliente envia apenas os comandos de movimento da própria raquete; o
  servidor calcula a física e retransmite o estado atualizado para os dois lados.

## 6. Cronograma (180 min)

| Horário | Bloco | Conteúdo |
| --- | --- | --- |
| 0:00–0:10 | Abertura | Apresentação da oficina, formação das duplas, visão geral do jogo final |
| 0:10–0:25 | Contexto técnico | Papel do servidor/cliente; diferenças de sintaxe JS vs Java (`let`/`const`, arrow functions, objetos/JSON, ausência de tipagem explícita) |
| 0:25–0:45 | Setup | Instalação/verificação do Node.js, abertura do projeto, teste de conexão entre duas máquinas |
| 0:45–1:15 | Construção 1 | Estrutura visual do jogo no Canvas (campo, raquetes, bola) |
| 1:15–1:45 | Construção 2 | Movimento das raquetes, física da bola, placar |
| 1:45–2:25 | Construção 3 | Conexão via WebSocket entre servidor e clientes, sincronização de estado |
| 2:25–2:50 | Testes | Cada dupla conecta com outra dupla via rede e joga, revezando quem controla a raquete |
| 2:50–3:00 | Encerramento | Recapitulação, dúvidas, materiais de apoio |

## 7. Requisitos técnicos / infraestrutura

- Node.js instalado em pelo menos uma máquina por dupla.
- Editor de código: VSCode.
- Navegador atualizado.
- Rede local com comunicação liberada entre as máquinas.
- Código-fonte pronto, disponível para cópia rápida se necessário (repositório
  no GitHub).
- Número par de duplas, para o teste final "dupla contra dupla".

## 8. Materiais de apoio entregues aos alunos

- Repositório com o código completo comentado.
