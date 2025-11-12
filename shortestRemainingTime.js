class ShortestRemainingTime {
  constructor(quantum) {
    this.quantum = quantum;
    this.trocaContexto = 0;
    this.processoAnterior = '';
    this.fila = [];
    this.log = [];
  }

  adicionarProcesso(processo) {
    console.log(`##### Adicionando processo ${processo.getPid()} à fila #####`);
    this.fila.push(processo);
  }

  async executar() {
    while (this.fila.length > 0) {
      // Organiza a fila de processos 
      this.fila.sort((a, b) => {
        if (a.getIngresso() != b.getIngresso() && a.getDuracao()===b.getDuracao()) {
            return a.getIngresso() - b.getIngresso();
        }
        return a.getDuracao() - b.getDuracao();
    });
      
      const processoAtual = this.fila.shift();

      // Verifica e contabiliza se há troca de contexto
      this.trocaContexto = (this.processoAnterior != processoAtual.getNome())? this.trocaContexto +1: this.trocaContexto;
      this.processoAnterior = processoAtual.getNome();
      
      // Mostra fila de processos
      const filaPids = this.fila.map(p => p.getNome());
      console.log('\n------------------------------');
      console.log(`Fila atual de processos (PIDs): [${filaPids.join(', ')}]`);

      // Mostra processo sendo executado e tempo restante
      const resto = processoAtual.getDuracao() - this.quantum
      this.log.push(` - ${processoAtual.getNome()} executado por ${this.quantum} ms, restando ${ resto > 0 ? resto : 0} ms.`);
      
      // Diminui o tempo executado na duração total do processo
      const shouldReplay = await processoAtual.executar(this.quantum);

      // Checa se o processo ainda precisa de tempo de processamento
      if(shouldReplay)
        this.fila.push(processoAtual);
      
    }
    console.log('\n\nTodos os processos foram executados.');
    console.log('\nLog de execução:');
    this.log.forEach(entry => console.log(entry));
    console.log(`Trocas de contexto: ${this.trocaContexto}`);
  }
}

export default ShortestRemainingTime;