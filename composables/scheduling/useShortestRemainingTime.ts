// composables/scheduling/useShortestRemainingTime.ts
import type { IProcesso, ResultadoSimulacao } from '../../types/index'
import { EstadoProcesso } from '../../types/index'
import { EscalonadorBase } from '../useEscalonamento'

export class ShortestRemainingTimeEscalonador extends EscalonadorBase {
  private quantum: number = 100 // Quantum pequeno para verificações frequentes de preempção
  private processosChegando: IProcesso[] = []

  constructor(numeroMedicos: number = 1) {
    super(numeroMedicos)
    console.log(`🔄 Algoritmo Shortest Remaining Time First inicializado (Médicos: ${numeroMedicos})`)
  }

  // Override do método para adicionar suporte a chegadas futuras
  public override adicionarProcesso(processo: IProcesso): void {
    if (processo.ingresso <= this.tempoAtual) {
      // Processo chega imediatamente
      super.adicionarProcesso(processo)
    } else {
      // Processo chegará no futuro
      this.processosChegando.push(processo)
      console.log(`📅 Paciente ${processo.nome} agendado para chegar em ${processo.ingresso}ms`)
    }
  }

  public async executar(): Promise<ResultadoSimulacao> {
    console.log('🔄 Iniciando algoritmo SRTF...')
    
    // Executar ciclo principal síncrono
    while (this.temProcessosAtivos()) {
      this.executarCicloSRTF()
    }
    
    // Calcular métricas e retornar resultado
    const resultado = this.obterResultado()
    console.log('✅ SRTF concluído:', resultado.metricas)
    return resultado
  }

  protected async executarCiclo(): Promise<void> {
    // Método requerido pela classe base (não usado na versão síncrona)
  }

  protected executarCicloSRTF(): void {
    // Processar chegadas de novos processos
    this.processarChegadas()

    // Verificar se há necessidade de preempção
    this.verificarPreempcao()

    // Alocar processos para médicos livres
    this.alocarProcessosParaMedicos()

    // Executar um quantum em todos os médicos ocupados
    this.executarQuantumEmTodosOsMedicos()

    // Incrementar tempo apenas se não há médicos trabalhando
    if (!this.medicos.some(m => m.ocupado)) {
      this.tempoAtual += this.quantum
    }
  }

  private executarQuantumEmTodosOsMedicos(): void {
    for (const medico of this.medicos) {
      if (medico.ocupado && medico.processoAtual) {
        const processo = medico.processoAtual
        const tempoInicio = this.tempoAtual
        const tempoExecucao = Math.min(this.quantum, processo.duracao)
        
        // Executar o processo por um quantum
        processo.duracao -= tempoExecucao
        medico.tempoOcupado += tempoExecucao
        this.tempoAtual += tempoExecucao
        
        // Registrar no Gantt
        this.adicionarRegistroGantt(
          medico.nome,
          processo.nome,
          tempoInicio,
          tempoExecucao
        )
        
        if (processo.duracao <= 0) {
          // Processo terminou
          processo.estado = EstadoProcesso.TERMINADO
          processo.tempoFimExecucao = this.tempoAtual
          processo.tempoTurnaround = this.tempoAtual - processo.ingresso
          processo.tempoEspera = processo.tempoTurnaround - processo.duracaoOriginal
          
          console.log(`✅ ${medico.nome} terminou de atender ${processo.nome}`)
          this.liberarMedico(medico.id)
        }
      }
    }
  }

  private processarChegadas(): void {
    // Processar processos que chegaram neste momento
    const processosChegaram = this.processosChegando.filter(p => p.ingresso <= this.tempoAtual)
    
    for (const processo of processosChegaram) {
      super.adicionarProcesso(processo)
      // Remove da lista de chegadas futuras
      const index = this.processosChegando.findIndex(p => p.pid === processo.pid)
      if (index !== -1) {
        this.processosChegando.splice(index, 1)
      }
    }
  }

  private verificarPreempcao(): void {
    const processosDisponveis = this.fila.filter(p => p.estado === EstadoProcesso.PRONTO)
    
    if (processosDisponveis.length === 0) return

    // Encontrar processo com menor tempo restante na fila
    const processoMenorTempo = processosDisponveis.reduce((menor, atual) => 
      atual.duracao < menor.duracao ? atual : menor
    )

    // Verificar se algum médico está executando um processo com tempo maior
    for (const medico of this.medicos) {
      if (medico.ocupado && medico.processoAtual) {
        const processoAtual = medico.processoAtual
        
        if (processoMenorTempo.duracao < processoAtual.duracao) {
          // Preempção necessária
          console.log(`🚨 Preempção: ${processoMenorTempo.nome} (${processoMenorTempo.duracao}ms) vai interromper ${processoAtual.nome} (${processoAtual.duracao}ms)`)
          
          // Retorna processo atual para a fila
          processoAtual.estado = EstadoProcesso.PRONTO
          this.fila.push(processoAtual)
          
          this.adicionarEventoExecucao(
            'preempcao',
            processoAtual,
            medico.nome,
            `${processoMenorTempo.nome} preemptou ${processoAtual.nome}`
          )

          this.trocasContexto++
          this.liberarMedico(medico.id)
          
          // Remove o processo que vai preemptar da fila
          const index = this.fila.findIndex(p => p.pid === processoMenorTempo.pid)
          if (index !== -1) {
            this.fila.splice(index, 1)
          }

          // Aloca o novo processo
          this.ocuparMedico(medico.id, processoMenorTempo)
          processoMenorTempo.estado = EstadoProcesso.EXECUTANDO

          this.adicionarEventoExecucao(
            'inicio',
            processoMenorTempo,
            medico.nome,
            `${medico.nome} começou a atender ${processoMenorTempo.nome} após preempção`
          )

          break // Só uma preempção por ciclo
        }
      }
    }
  }



  private alocarProcessosParaMedicos(): void {
    // Ordenar processos por menor tempo restante (SRTF)
    const processosDisponveis = this.fila
      .filter(p => p.estado === EstadoProcesso.PRONTO)
      .sort((a, b) => {
        // Primeiro critério: menor tempo restante
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

        // Aloca processo ao médico
        this.ocuparMedico(medicoLivre.id, processo)
        processo.estado = EstadoProcesso.EXECUTANDO

        this.adicionarEventoExecucao(
          'inicio',
          processo,
          medicoLivre.nome,
          `${medicoLivre.nome} começou a atender ${processo.nome} (Tempo restante: ${processo.duracao}ms)`
        )

        console.log(`👨‍⚕️ ${medicoLivre.nome} começou a atender ${processo.nome} (${processo.duracao}ms restantes)`)
      } else {
        break // Não há médicos disponíveis
      }
    }
  }

  protected override temProcessosAtivos(): boolean {
    return super.temProcessosAtivos() || this.processosChegando.length > 0
  }

  public obterEstatisticas(): string {
    const resultado = this.obterResultado()
    const metricas = resultado.metricas

    // Contar quantas vezes cada processo foi preemptado
    const preempcoes = this.eventos.filter(e => e.tipo === 'preempcao')
    const preempcoesPorProcesso = preempcoes.reduce((acc, evento) => {
      acc[evento.processo.nome] = (acc[evento.processo.nome] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const resumoPreempcoes = Object.entries(preempcoesPorProcesso)
      .map(([nome, count]) => `${nome}: ${count}x`)
      .join(', ')

    return `
🔄 === RELATÓRIO SHORTEST REMAINING TIME FIRST ===
⚡ Preempções: ${resumoPreempcoes || 'Nenhuma'}
⏱️  Tempo Médio de Espera: ${metricas.tempoMedioEspera.toFixed(2)}ms
🏃 Tempo Médio de Turnaround: ${metricas.tempoMedioTurnaround.toFixed(2)}ms
🔀 Número de Trocas de Contexto: ${metricas.numeroTrocasContexto}
💻 Utilização Média da CPU: ${metricas.utilizacaoMediaCPU.toFixed(2)}%
⏲️  Tempo Total de Simulação: ${metricas.tempoTotalSimulacao}ms
👥 Número de Médicos: ${this.medicos.length}
📊 Algoritmo: Preemptivo (menor tempo restante)
🕐 Quantum de Verificação: ${this.quantum}ms
    `.trim()
  }
}

export const useShortestRemainingTime = (numeroMedicos: number = 1) => {
  const escalonador = new ShortestRemainingTimeEscalonador(numeroMedicos)

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