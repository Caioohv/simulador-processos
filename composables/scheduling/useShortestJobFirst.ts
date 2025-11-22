// composables/scheduling/useShortestJobFirst.ts
import type { IProcesso, ResultadoSimulacao } from '../../types/index'
import { EstadoProcesso } from '../../types/index'
import { EscalonadorBase } from '../useEscalonamento'

export class ShortestJobFirstEscalonador extends EscalonadorBase {
  constructor(numeroMedicos: number = 1) {
    super(numeroMedicos)
    console.log(`⚡ Algoritmo Shortest Job First inicializado (Médicos: ${numeroMedicos})`)
  }

  public async executar(): Promise<ResultadoSimulacao> {
    console.log(`\n🏥 === SHORTEST JOB FIRST INICIADO ===`)
    console.log(`⚡ Não-preemptivo`)
    console.log(`👥 Médicos: ${this.medicos.length}`)
    console.log(`🔢 Processos: ${this.fila.length}`)

    // Simulação síncrona
    let ciclo = 0
    while (this.temProcessosAtivos() && ciclo < 1000) {
      ciclo++
      
      await this.executarCicloSJF()
      
      if (ciclo % 10 === 0) {
        console.log(`⏰ Progresso: ${this.fila.filter(p => p.estado === EstadoProcesso.TERMINADO).length} processos terminados`)
      }
    }

    this.tempoTotalSimulacao = this.tempoAtual
    console.log(`\n✅ SJF concluído em ${this.tempoTotalSimulacao}ms`)
    
    return this.obterResultado()
  }

  private async executarCicloSJF(): Promise<void> {
    // Alocar processos para médicos livres (ordenados por duração)
    this.alocarProcessosParaMedicos()
    
    // Executar processos até o fim (não-preemptivo)
    for (const medico of this.medicos) {
      if (medico.ocupado && medico.processoAtual) {
        const processo = medico.processoAtual
        const tempoExecucao = processo.duracao
        const tempoInicio = this.tempoAtual
        
        // Executar completamente
        processo.duracao = 0
        medico.tempoOcupado += processo.duracaoOriginal
        
        // Registrar no Gantt
        this.adicionarRegistroGantt(
          medico.nome,
          processo.nome,
          tempoInicio,
          processo.duracaoOriginal
        )
        
        // Processo sempre termina (não-preemptivo)
        processo.estado = EstadoProcesso.TERMINADO
        processo.tempoFimExecucao = this.tempoAtual + processo.duracaoOriginal
        processo.tempoTurnaround = processo.tempoFimExecucao - processo.ingresso
        processo.tempoEspera = Math.max(0, processo.tempoTurnaround - processo.duracaoOriginal)
        
        console.log(`✅ ${medico.nome} terminou ${processo.nome} (Duração: ${processo.duracaoOriginal}ms, Espera: ${processo.tempoEspera}ms)`)
        
        this.liberarMedico(medico.id)
        this.tempoAtual += processo.duracaoOriginal
      }
    }
  }

  protected async executarCiclo(): Promise<void> {
    // Processar chegadas de novos processos
    this.processarChegadas()

    // Verificar médicos ocupados
    await this.verificarMedicosOcupados()

    // Alocar processos para médicos livres usando SJF
    this.alocarProcessosParaMedicos()

    this.exibirEstadoFila()
  }

  private processarChegadas(): void {
    // Processos que chegaram neste momento
    // Por simplicidade, assumimos que todos os processos já foram adicionados
  }

  private async verificarMedicosOcupados(): Promise<void> {
    for (const medico of this.medicos) {
      if (medico.ocupado && medico.processoAtual) {
        const processo = medico.processoAtual
        const tempoExecucao = processo.duracao // SJF executa até o fim (não-preemptivo)
        const tempoInicio = this.tempoAtual

        // Executar processo completamente
        const shouldContinue = await processo.executar(tempoExecucao)
        medico.tempoOcupado += processo.duracaoOriginal
        this.tempoAtual += processo.duracaoOriginal

        this.adicionarRegistroGantt(
          medico.nome,
          processo.nome,
          tempoInicio,
          processo.duracaoOriginal
        )

        // Como é não-preemptivo, o processo sempre termina
        processo.estado = EstadoProcesso.TERMINADO
        processo.tempoFimExecucao = this.tempoAtual
        processo.tempoTurnaround = this.tempoAtual - processo.ingresso
        processo.tempoEspera = processo.tempoTurnaround - processo.duracaoOriginal

        this.adicionarEventoExecucao(
          'fim',
          processo,
          medico.nome,
          `Paciente ${processo.nome} foi completamente atendido por ${medico.nome}`
        )

        console.log(`✅ ${medico.nome} terminou de atender ${processo.nome}`)
        this.liberarMedico(medico.id)
      }
    }
  }

  private alocarProcessosParaMedicos(): void {
    // Ordenar processos por menor duração (SJF)
    const processosDisponveis = this.fila
      .filter(p => p.estado === EstadoProcesso.PRONTO)
      .sort((a, b) => {
        // Primeiro critério: menor duração
        if (a.duracao !== b.duracao) {
          return a.duracao - b.duracao
        }
        // Critério de desempate: tempo de chegada
        return a.ingresso - b.ingresso
      })

    for (const processo of processosDisponveis) {
      const medicoLivre = this.encontrarMedicoLivre()
      
      if (medicoLivre) {
        // Remove processo da fila de espera
        const index = this.fila.findIndex(p => p.pid === processo.pid)
        if (index !== -1) {
          this.fila.splice(index, 1)
        }

        // Calcula tempo de espera
        processo.tempoEspera = Math.max(0, this.tempoAtual - processo.ingresso)

        // Aloca processo ao médico
        this.ocuparMedico(medicoLivre.id, processo)
        processo.estado = EstadoProcesso.EXECUTANDO

        this.adicionarEventoExecucao(
          'inicio',
          processo,
          medicoLivre.nome,
          `${medicoLivre.nome} começou a atender ${processo.nome} (Duração: ${processo.duracao}ms)`
        )

        console.log(`👨‍⚕️ ${medicoLivre.nome} começou a atender ${processo.nome} (${processo.duracao}ms)`)
        
        // Incrementar trocas de contexto (exceto para o primeiro processo)
        if (this.eventos.filter(e => e.tipo === 'inicio').length > 1) {
          this.trocasContexto++
        }
      } else {
        break // Não há médicos disponíveis
      }
    }
  }

  public obterEstatisticas(): string {
    const resultado = this.obterResultado()
    const metricas = resultado.metricas

    // Mostrar ordem de execução
    const ordemExecucao = this.eventos
      .filter(e => e.tipo === 'inicio')
      .map(e => `${e.processo.nome} (${e.processo.duracaoOriginal}ms)`)
      .join(' → ')

    return `
⚡ === RELATÓRIO SHORTEST JOB FIRST ===
📋 Ordem de Execução: ${ordemExecucao}
⏱️  Tempo Médio de Espera: ${metricas.tempoMedioEspera.toFixed(2)}ms
🏃 Tempo Médio de Turnaround: ${metricas.tempoMedioTurnaround.toFixed(2)}ms
🔀 Número de Trocas de Contexto: ${metricas.numeroTrocasContexto}
💻 Utilização Média da CPU: ${metricas.utilizacaoMediaCPU.toFixed(2)}%
⏲️  Tempo Total de Simulação: ${metricas.tempoTotalSimulacao}ms
👥 Número de Médicos: ${this.medicos.length}
📊 Algoritmo: Não-preemptivo (executa até terminar)
    `.trim()
  }
}

export const useShortestJobFirst = (numeroMedicos: number = 1) => {
  const escalonador = new ShortestJobFirstEscalonador(numeroMedicos)

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