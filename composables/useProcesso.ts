// composables/useProcesso.ts
import type { IProcesso } from '../types/index'
import { EstadoProcesso } from '../types/index'

export class Processo implements IProcesso {
  pid: number
  nome: string
  ingresso: number
  duracao: number
  duracaoOriginal: number
  prioridade: number
  estado: EstadoProcesso
  tempoEspera: number = 0
  tempoResposta: number = 0
  tempoTurnaround: number = 0
  tempoInicioExecucao?: number
  tempoFimExecucao?: number
  numeroExecucoes: number = 0
  medico?: string

  constructor(pid: number, nome: string, ingresso: number, duracao: number, prioridade: number) {
    this.pid = pid
    this.nome = nome
    this.ingresso = ingresso
    this.duracao = duracao
    this.duracaoOriginal = duracao
    this.prioridade = prioridade
    this.estado = EstadoProcesso.NOVO
  }

  async executar(duracaoExecucao?: number): Promise<boolean> {
    if (!duracaoExecucao) duracaoExecucao = this.duracao

    // Marca início da execução se for a primeira vez (tempo simulado)
    if (this.numeroExecucoes === 0) {
      this.tempoInicioExecucao = this.ingresso
    }

    this.estado = EstadoProcesso.EXECUTANDO
    this.numeroExecucoes++

    console.log(`\n🏥 Paciente ${this.nome} (PID: ${this.pid}) está sendo atendido`)
    console.log(`⏱️  Tempo de atendimento: ${duracaoExecucao}ms | Tempo restante: ${this.duracao}ms`)

    this.duracao = Math.max(0, this.duracao - duracaoExecucao)

    return new Promise((resolve) => {
      setTimeout(() => {
        const shouldContinue = this.duracao > 0
        
        if (!shouldContinue) {
          this.estado = EstadoProcesso.TERMINADO
          // Tempo simulado: chegada + duração total original
          this.tempoFimExecucao = this.ingresso + this.duracaoOriginal
          console.log(`✅ Paciente ${this.nome} foi completamente atendido!`)
          
          // Calcular métricas finais
          this.tempoTurnaround = this.tempoFimExecucao - this.ingresso
          this.tempoEspera = Math.max(0, this.tempoTurnaround - this.duracaoOriginal)
        } else {
          this.estado = EstadoProcesso.PRONTO
          console.log(`⏸️  Atendimento do paciente ${this.nome} foi interrompido. Retorna à fila.`)
        }

        resolve(shouldContinue)
      }, duracaoExecucao)
    })
  }

  // Métodos getters para compatibilidade com código existente
  getPid(): number { return this.pid }
  getNome(): string { return this.nome }
  getIngresso(): number { return this.ingresso }
  getDuracao(): number { return this.duracao }
  getDuracaoOriginal(): number { return this.duracaoOriginal }
  getPrioridade(): number { return this.prioridade }
  getEstado(): EstadoProcesso { return this.estado }

  // Métodos para calcular métricas
  calcularTempoEspera(tempoAtual: number): number {
    // Tempo de espera = tempo atual - tempo de chegada - tempo já executado
    const tempoExecutado = this.duracaoOriginal - this.duracao
    return Math.max(0, tempoAtual - this.ingresso - tempoExecutado)
  }

  calcularTempoTurnaround(tempoAtual: number): number {
    // Turnaround = tempo atual - tempo de chegada
    return tempoAtual - this.ingresso
  }

  // Cria uma cópia do processo para simulação
  clone(): Processo {
    const clone = new Processo(this.pid, this.nome, this.ingresso, this.duracaoOriginal, this.prioridade)
    return clone
  }

  // Converte para formato de display amigável
  toDisplayString(): string {
    return `${this.nome} (P${this.prioridade}, ${this.duracao}/${this.duracaoOriginal}ms)`
  }
}

export const useProcesso = () => {
  const criarProcesso = (pid: number, nome: string, ingresso: number, duracao: number, prioridade: number): Processo => {
    return new Processo(pid, nome, ingresso, duracao, prioridade)
  }

  const criarProcessosExemplo = (): Processo[] => {
    return [
      new Processo(1, '👴 João (Consulta)', 0, 5000, 3),
      new Processo(2, '🤰 Maria (Emergência)', 0, 2000, 1),
      new Processo(3, '👶 Ana (Pediatria)', 1000, 4000, 2),
      new Processo(4, '🚑 Carlos (UTI)', 3000, 1000, 1),
      new Processo(5, '👨 Pedro (Rotina)', 5000, 2000, 4)
    ]
  }

  return {
    Processo,
    criarProcesso,
    criarProcessosExemplo
  }
}