class ShortestJobFirst {
  constructor() {
    this.fila = [];
    this.log = [];
    this.espera = 0;
    this.execucao = 0;
    this.nProcessos = 0;
    this.duracao = 0;
    this.tempoTotal;
  }

  adicionarProcesso(processo) {
    console.log(`##### Adicionando processo ${processo.getPid()} à fila #####`);
    this.fila.push(processo);
    this.nProcessos++;
  }

  async executar() {
    while (this.fila.length > 0) {
      // Organiza a fila de processos
      this.fila.sort((a, b) => a.getDuracao() - b.getDuracao());      

      const processoAtual = this.fila.shift();
      const filaPids = this.fila.map(p => p.getNome());
      console.log('\n------------------------------');
      console.log(`Fila atual de processos (PIDs): [${filaPids.join(', ')}]`);

      // Mostra processo sendo executado e tempo restante
      this.log.push(` - ${processoAtual.getNome()} executado por ${processoAtual.getDuracao()} ms, restando 0 ms`);

      // Pega o tempo de espera e de execução do processo
      this.duracao += processoAtual.getDuracao();
      this.espera += Math.abs(this.duracao - processoAtual.getDuracao() - processoAtual.getIngresso());
      this.execucao += Math.abs(this.duracao - processoAtual.getIngresso());
      await processoAtual.executar(processoAtual.getDuracao());
    }
    console.log('\n\nTodos os processos foram executados.');
    console.log('\nLog de execução:');
    this.log.forEach(entry => console.log(entry));
    console.log(`Tempo médio de execução: ${this.execucao/this.nProcessos} ms.`);
    console.log(`Tempo médio de espera: ${this.espera/this.nProcessos} ms.`);
    console.log(`Número de trocas de contexto: ${this.nProcessos-1}.`);
    //console.log(`Utilização Média da CPU: ${((this.duracao/)*100)}%.`)

  }
}

export default ShortestJobFirst;