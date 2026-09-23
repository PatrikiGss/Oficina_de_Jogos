# Protocolo WebSocket

Toda mensagem é **JSON em texto** com um campo obrigatório `tipo`. Os nomes dos
tipos ficam em [`shared/constantes.js`](../shared/constantes.js) (`TIPOS`) —
nunca escreva a string solta no código, use a constante.

## Cliente → servidor

### `entrar`
Enviada assim que a conexão abre.

```json
{ "tipo": "entrar", "nome": "dupla 3" }
```

O servidor corta o nome em 20 caracteres. Não há senha: quem está na rede e
abre a página, entra.

### `mover`
Enviada **só quando a direção muda** (ao apertar e ao soltar a tecla), não a
cada frame.

```json
{ "tipo": "mover", "direcao": -1 }
```

`direcao`: `-1` sobe, `0` para, `1` desce.

O cliente **não** informa qual raquete está movendo. O servidor sabe, pelo
registro da conexão, de qual lado ele é — é o que impede um jogador de mexer na
raquete do adversário. Mensagem de espectador é ignorada.

## Servidor → cliente

### `bem-vindo`
Primeira mensagem depois da conexão. Diz ao navegador qual é o papel dele.

```json
{ "tipo": "bem-vindo", "lado": "esquerda", "espectador": false }
```

`lado` é `null` quando `espectador` é `true`.

### `estado`
Enviada a cada tick (60x/s) e também quando alguém entra ou sai.

```json
{
  "tipo": "estado",
  "estado": {
    "fase": "jogando",
    "bola": { "x": 400, "y": 240 },
    "raquetes": { "esquerda": 200, "direita": 214 },
    "placar": { "esquerda": 2, "direita": 3 },
    "vencedor": null
  }
}
```

Note o que **não** é enviado: velocidade da bola, direção das raquetes, nomes
internos. Mandamos o mínimo para desenhar, com os valores arredondados
(`Math.round`) — menos bytes por tick e nada de `0.30000000000000004`.

`fase`: `aguardando` (falta jogador), `jogando`, `encerrada`.

### `fim`
Enviada uma vez quando alguém atinge `PARTIDA.PONTOS_PARA_VENCER`.

```json
{ "tipo": "fim", "vencedor": "direita" }
```

### `erro`
JSON inválido ou tipo desconhecido. Não derruba a conexão.

```json
{ "tipo": "erro", "mensagem": "tipo desconhecido: pular" }
```

## Como inspecionar durante a aula

No navegador: **F12 → aba Network → filtro WS → clique na conexão → Messages**.
Dá para ver cada `mover` saindo e cada `estado` chegando, em tempo real. É a
melhor forma de mostrar que o cliente realmente não calcula nada.

## Se for estender o protocolo

1. Adicione o tipo em `TIPOS`, em `shared/constantes.js`.
2. Trate no `switch` de `server/sala.js` (`receber`) e/ou no de
   `public/js/rede.js`.
3. Documente aqui — protocolo sem documentação vira arqueologia em duas semanas.
