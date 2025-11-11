import Processo from './processo.js';
import RoundRobin from './roundRobin.js';
import ShortestJobFirst from "./shortestJobFirst.js";


const processos = [
  new Processo(1, 't1', 0, 5000, 3),
  new Processo(2, 't2', 0, 2000, 2),
] 

const processosAdicionais = [
  new Processo(2, 't3',  1000,4000, 5),
   new Processo(3, 't4', 3000, 1000, 2),
    new Processo(4, 't5', 5000, 2000, 1),
]

const shortestJobFirst = new ShortestJobFirst();

processos.forEach(processo => shortestJobFirst.adicionarProcesso(processo));

shortestJobFirst.executar();

processosAdicionais.forEach(p => setTimeout(() => {
  shortestJobFirst.adicionarProcesso(p);
}, p.getIngresso()));



/* --ROUND ROBIN--
const roundRobin = new RoundRobin(2000);

processos.forEach(processo => roundRobin.adicionarProcesso(processo));

roundRobin.executar();

processosAdicionais.forEach(p => setTimeout(() => {
  roundRobin.adicionarProcesso(p);
}, p.getIngresso()));

*/