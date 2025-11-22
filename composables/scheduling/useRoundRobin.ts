// composables/scheduling/useRoundRobin.ts
import type { IProcesso, ResultadoSimulacao } from '../../types/index'
import { EstadoProcesso } from '../../types/index'
import { EscalonadorBase } from '../useEscalonamento'

export class RoundRobinEscalonador extends EscalonadorBase {
  private quantum: number
  private processoAtual: IProcesso | null = null
  private tempoQuantumRestante: number = 0

  constructor(quantum: number = 2000, numeroMedicos: number = 1) {
    super(numeroMedicos)
    this.quantum = quantum
    console.log(`🔄 Algoritmo Round Robin inicializado (Quantum: ${quantum}ms, Médicos: ${numeroMedicos})`)
  }

  public async executar(): Promise<ResultadoSimulacao> {
    console.log(`\n🏥 === ROUND ROBIN INICIADO ===`)
    console.log(`⚡ Quantum: ${this.quantum}ms`)
    console.log(`👥 Médicos: ${this.medicos.length}`)
    console.log(`🔢 Processos: ${this.fila.length}`)

    // Simulação síncrona para métricas corretas
    let ciclo = 0
    while (this.temProcessosAtivos() && ciclo < 1000) {
      ciclo++
      console.log(`\n--- Ciclo ${ciclo} (Tempo: ${this.tempoAtual}ms) ---`)
      
      await this.executarCicloRoundRobin()
      
      if (ciclo % 10 === 0) {
        console.log(`⏰ Progresso: ${ciclo} ciclos, ${this.fila.filter(p => p.estado === EstadoProcesso.TERMINADO).length} processos terminados`)
      }
    }

    this.tempoTotalSimulacao = this.tempoAtual
    console.log(`\n✅ Round Robin concluído em ${this.tempoTotalSimulacao}ms após ${ciclo} ciclos`)
    
    return this.obterResultado()
  }

  private async executarCicloRoundRobin(): Promise<void> {
    // Alocar processos prontos para médicos livres
    this.alocarProcessosParaMedicos()
    
    // Executar processos em médicos ocupados
    for (const medico of this.medicos) {
      if (medico.ocupado && medico.processoAtual) {
        const processo = medico.processoAtual
        const tempoExecucao = Math.min(this.quantum, processo.duracao)
        const tempoInicio = this.tempoAtual
        
        // Executar processo
        processo.duracao -= tempoExecucao
        medico.tempoOcupado += tempoExecucao
        
        // Registrar no Gantt
        this.adicionarRegistroGantt(
          medico.nome, 
          processo.nome, 
          tempoInicio, 
          tempoExecucao
        )
        
        console.log(`👨‍⚕️ ${medico.nome} executou ${processo.nome} por ${tempoExecucao}ms (restante: ${processo.duracao}ms)`)
        
        if (processo.duracao === 0) {
          // Processo terminou
          processo.estado = EstadoProcesso.TERMINADO
          processo.tempoFimExecucao = this.tempoAtual + tempoExecucao
          processo.tempoTurnaround = processo.tempoFimExecucao - processo.ingresso
          processo.tempoEspera = Math.max(0, processo.tempoTurnaround - processo.duracaoOriginal)
          
          console.log(`✅ ${processo.nome} TERMINOU! Espera: ${processo.tempoEspera}ms, Turnaround: ${processo.tempoTurnaround}ms`)
          
          this.liberarMedico(medico.id)
        } else {
          // Quantum expirado - preempção
          processo.estado = EstadoProcesso.PRONTO
          this.fila.push(processo)
          this.trocasContexto++
          
          console.log(`⏰ Quantum expirado: ${processo.nome} volta à fila (${this.trocasContexto} trocas de contexto)`)
          
          this.liberarMedico(medico.id)
        }
        
        this.tempoAtual += tempoExecucao
      }
    }
  }

  protected async executarCiclo(): Promise<void> {
    // Processar chegadas de novos processos
    this.processarChegadas()

    // Verificar se algum médico terminou um quantum ou processo
    await this.verificarMedicosOcupados()

    // Alocar processos para médicos livres
    this.alocarProcessosParaMedicos()

    this.exibirEstadoFila()
  }

  private processarChegadas(): void {
    // Lógica para processar chegadas seria implementada aqui
    // Por simplicidade, assumimos que todos os processos já foram adicionados
  }

  private async verificarMedicosOcupados(): Promise<void> {
    for (const medico of this.medicos) {
      if (medico.ocupado && medico.processoAtual) {
        const processo = medico.processoAtual
        
        // Executar por um quantum ou até terminar
        const tempoExecucao = Math.min(this.quantum, processo.duracao)
        const tempoInicio = this.tempoAtual
        
        const shouldContinue = await processo.executar(tempoExecucao)

        medico.tempoOcupado += tempoExecucao
        this.tempoAtual += tempoExecucao

        this.adicionarRegistroGantt(
          medico.nome, 
          processo.nome, 
          tempoInicio, 
          tempoExecucao
        )

        if (!shouldContinue) {
          // Processo terminou
          processo.estado = EstadoProcesso.TERMINADO
          processo.tempoFimExecucao = this.tempoAtual
          processo.tempoTurnaround = this.tempoAtual - processo.ingresso
          processo.tempoEspera = processo.tempoTurnaround - processo.duracaoOriginal

          this.adicionarEventoExecucao(
            'fim', 
            processo, 
            medico.nome, 
            `Paciente ${processo.nome} teve seu atendimento concluído por ${medico.nome}`
          )

          this.liberarMedico(medico.id)
        } else {
          // Quantum expirou, processo vai para o final da fila
          processo.estado = EstadoProcesso.PRONTO
          this.fila.push(processo)
          
          this.adicionarEventoExecucao(
            'preempcao', 
            processo, 
            medico.nome, 
            `Quantum expirado - Paciente ${processo.nome} retorna à fila`
          )

          this.trocasContexto++
          this.liberarMedico(medico.id)
        }
      }
    }
  }

  private alocarProcessosParaMedicos(): void {
    const processosDisponveis = this.fila.filter(p => p.estado === EstadoProcesso.PRONTO)
    
    for (const processo of processosDisponveis) {
      const medicoLivre = this.encontrarMedicoLivre()
      
      if (medicoLivre) {
        // Remove processo da fila de espera
        const index = this.fila.findIndex(p => p.pid === processo.pid)
        if (index !== -1) {
          this.fila.splice(index, 1)
        }

        // Aloca processo ao médico
        this.ocuparMedico(medicoLivre.id, processo)
        processo.estado = EstadoProcesso.EXECUTANDO

        this.adicionarEventoExecucao(
          'inicio', 
          processo, 
          medicoLivre.nome, 
          `${medicoLivre.nome} começou a atender ${processo.nome}`
        )

        console.log(`👨‍⚕️ ${medicoLivre.nome} começou a atender ${processo.nome}`)
      } else {
        break // Não há médicos disponíveis
      }
    }
  }

  public obterEstatisticas(): string {
    const resultado = this.obterResultado()
    const metricas = resultado.metricas

    return `
🔄 === RELATÓRIO ROUND ROBIN ===
⏱️  Tempo Médio de Espera: ${metricas.tempoMedioEspera.toFixed(2)}ms
🏃 Tempo Médio de Turnaround: ${metricas.tempoMedioTurnaround.toFixed(2)}ms
🔀 Número de Trocas de Contexto: ${metricas.numeroTrocasContexto}
💻 Utilização Média da CPU: ${metricas.utilizacaoMediaCPU.toFixed(2)}%
⏲️  Tempo Total de Simulação: ${metricas.tempoTotalSimulacao}ms
👥 Número de Médicos: ${this.medicos.length}
🕐 Quantum: ${this.quantum}ms
    `.trim()
  }
}

export const useRoundRobin = (quantum: number = 2000, numeroMedicos: number = 1) => {
  const escalonador = new RoundRobinEscalonador(quantum, numeroMedicos)

  const adicionarProcesso = (processo: IProcesso) => {
    escalonador.adicionarProcesso(processo)
  }

  const executar = async (): Promise<ResultadoSimulacao> => {
    return await escalonador.executar()
  }

  const obterEstatisticas = (): string => {
    return escalonador.obterEstatisticas()
  }

  return {
    escalonador,
    adicionarProcesso,
    executar,
    obterEstatisticas
  }
}