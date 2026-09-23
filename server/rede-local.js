// Utilitario para descobrir o IP da maquina na rede local.
//
// Durante a oficina a outra dupla precisa digitar http://<ip-do-host>:3000 no
// navegador. Imprimir o IP no console evita o "roda ai um ipconfig" a cada vez.

import os from 'node:os';

/** @returns {string[]} IPv4 das interfaces de rede, ignorando loopback e virtuais */
export function listarIPsLocais() {
  const interfaces = os.networkInterfaces();
  const ips = [];

  for (const enderecos of Object.values(interfaces)) {
    for (const endereco of enderecos ?? []) {
      if (endereco.family === 'IPv4' && !endereco.internal) {
        ips.push(endereco.address);
      }
    }
  }

  return ips;
}
