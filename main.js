import Processo from './processo.js';

import RoundRobin from './roundRobin.js';

const processos = [
  new Processo(1, 't1', 5000),
  new Processo(2, 't2', 2000),
]

const roundRobin = new RoundRobin(2000);

processos.forEach(processo => roundRobin.adicionarProcesso(processo));

roundRobin.executar();

setTimeout(() => {
  roundRobin.adicionarProcesso(new Processo(3, 't3', 4000));
}, 1000);

setTimeout(() => {
  roundRobin.adicionarProcesso(new Processo(4, 't4', 1000));
}, 2000);

setTimeout(() => {
  roundRobin.adicionarProcesso(new Processo(5, 't5', 2000));
}, 3000);