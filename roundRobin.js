class RoundRobin {
  constructor(quantum) {
    this.quantum = quantum;
    this.fila = [];
    this.log = [];
  }

  adicionarProcesso(processo) {
    console.log(`##### Adicionando processo ${processo.getPid()} à fila #####`);
    this.fila.push(processo);
  }

  async executar() {
    while (this.fila.length > 0) {
      const processoAtual = this.fila.shift();
      const filaPids = this.fila.map(p => p.getNome());

      console.log('\n------------------------------');
      console.log(`Fila atual de processos (PIDs): [${filaPids.join(', ')}]`);

      const resto = processoAtual.getDuracao() - this.quantum 
      this.log.push(` - ${processoAtual.getNome()} executado por ${this.quantum} ms, restando ${ resto > 0 ? resto : 0} ms`);
      const shouldReplay = await processoAtual.executar(this.quantum);
      if(shouldReplay)
        this.fila.push(processoAtual);
      
    }
    console.log('\n\nTodos os processos foram executados.');
    console.log('\nLog de execução:');
    this.log.forEach(entry => console.log(entry));
  }
}

export default RoundRobin;