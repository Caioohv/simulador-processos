class Processo {
  constructor(pid, nome, duracao) {
    this.pid = pid;
    this.nome = nome;
    this.duracao = duracao;
  }

  executar(duracao) {
    if(!duracao) duracao = this.duracao;

    console.log(`\nExecutando processo ${this.pid} - ${this.nome} (${this.duracao} ms) por ${duracao} ms`)

    this.duracao = this.duracao - duracao;
    
    if (this.duracao < 0) {
      this.duracao = 0;
    }
    
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log(`Processo PID: ${this.pid} executado por ${duracao} ms. Tempo restante: ${this.duracao} ms.`)
        const shouldReplay = this.duracao > 0;
        resolve(shouldReplay);
      }, duracao);
    });
  }

  getPid() {
    return this.pid;
  }
  
  getNome() {
    return this.nome;
  }

  getDuracao() {
    return this.duracao;
  }
}

export default Processo;