// composables/scheduling/usePrioridade.ts
import type { IProcesso, ResultadoSimulacao } from '../../types/index'
import { EstadoProcesso } from '../../types/index'
import { EscalonadorBase } from '../useEscalonamento'

export class PrioridadeEscalonador extends EscalonadorBase {
  private envelhecimento: boolean = true // Previne starvation
  private incrementoEnvelhecimento: number = 1 // Quanto diminuir na prioridade por ciclo de espera
  private tempoUltimoEnvelhecimento: number = 0
  private intervaloEnvelhecimento: number = 1000 // ms

  constructor(numeroMedicos: number = 1, envelhecimento: boolean = true) {
    super(numeroMedicos)
    this.envelhecimento = envelhecimento
    console.log(`⭐ Algoritmo de Prioridade inicializado (Médicos: ${numeroMedicos}, Envelhecimento: ${envelhecimento ? 'Ativo' : 'Inativo'})`)
  }

  public async executar(): Promise<ResultadoSimulacao> {
    console.log(`\n🏥 === PRIORIDADE INICIADO ===`)
    console.log(`⚡ Não-preemptivo com aging`)
    console.log(`👥 Médicos: ${this.medicos.length}`)
    console.log(`🔢 Processos: ${this.fila.length}`)

    // Simulação síncrona
    let ciclo = 0
    while (this.temProcessosAtivos() && ciclo < 1000) {
      ciclo++
      
      // Aging seria aplicado aqui em implementação mais avançada
      
      await this.executarCicloPrioridade()
      
      if (ciclo % 10 === 0) {
        console.log(`⏰ Progresso: ${this.fila.filter(p => p.estado === EstadoProcesso.TERMINADO).length} processos terminados`)
      }
    }

    this.tempoTotalSimulacao = this.tempoAtual
    console.log(`\n✅ Prioridade concluído em ${this.tempoTotalSimulacao}ms`)
    
    return this.obterResultado()
  }

  private async executarCicloPrioridade(): Promise<void> {
    // Alocar processos para médicos livres (ordenados por prioridade)
    this.alocarProcessosParaMedicos()
    
    // Executar processos até o fim (não-preemptivo)
    for (const medico of this.medicos) {
      if (medico.ocupado && medico.processoAtual) {
        const processo = medico.processoAtual
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
        
        console.log(`✅ ${medico.nome} terminou ${processo.nome} (Prioridade: ${processo.prioridade}, Espera: ${processo.tempoEspera}ms)`)
        
        this.liberarMedico(medico.id)
        this.tempoAtual += processo.duracaoOriginal
      }
    }
  }

  protected async executarCiclo(): Promise<void> {
    // Aplicar envelhecimento se habilitado
    if (this.envelhecimento) {
      this.aplicarEnvelhecimento()
    }

    // Verificar médicos ocupados
    await this.verificarMedicosOcupados()

    // Alocar processos para médicos livres usando Prioridade
    this.alocarProcessosParaMedicos()

    this.exibirEstadoFila()
  }

  private aplicarEnvelhecimento(): void {
    if (this.tempoAtual - this.tempoUltimoEnvelhecimento < this.intervaloEnvelhecimento) {
      return
    }

    const processosEspera = this.fila.filter(p => p.estado === EstadoProcesso.PRONTO)
    
    for (const processo of processosEspera) {
      const tempoEspera = this.tempoAtual - processo.ingresso
      
      // Se processo está esperando muito, melhora sua prioridade
      if (tempoEspera > this.intervaloEnvelhecimento * 2 && processo.prioridade > 1) {
        const prioridadeAnterior = processo.prioridade
        processo.prioridade = Math.max(1, processo.prioridade - this.incrementoEnvelhecimento)
        
        if (processo.prioridade !== prioridadeAnterior) {
          console.log(`🎂 Envelhecimento: ${processo.nome} prioridade ${prioridadeAnterior} → ${processo.prioridade}`)
        }
      }
    }

    this.tempoUltimoEnvelhecimento = this.tempoAtual
  }

  private async verificarMedicosOcupados(): Promise<void> {
    for (const medico of this.medicos) {
      if (medico.ocupado && medico.processoAtual) {
        const processo = medico.processoAtual
        const tempoExecucao = processo.duracao // Prioridade é não-preemptivo
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
          `Paciente ${processo.nome} (Prioridade ${processo.prioridade}) foi completamente atendido por ${medico.nome}`
        )

        console.log(`✅ ${medico.nome} terminou de atender ${processo.nome} (Prioridade ${processo.prioridade})`)
        this.liberarMedico(medico.id)
      }
    }
  }

  private alocarProcessosParaMedicos(): void {
    // Ordenar processos por prioridade (menor número = maior prioridade)
    const processosDisponveis = this.fila
      .filter(p => p.estado === EstadoProcesso.PRONTO)
      .sort((a, b) => {
        // Primeiro critério: maior prioridade (menor número)
        if (a.prioridade !== b.prioridade) {
          return a.prioridade - b.prioridade
        }
        // Critério de desempate: tempo de chegada (FCFS)
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
          `${medicoLivre.nome} começou a atender ${processo.nome} (Prioridade ${processo.prioridade}, Duração: ${processo.duracao}ms)`
        )

        console.log(`👨‍⚕️ ${medicoLivre.nome} começou a atender ${processo.nome} (Prioridade ${processo.prioridade})`)
        
        // Incrementar trocas de contexto (exceto para o primeiro processo)
        if (this.eventos.filter(e => e.tipo === 'inicio').length > 1) {
          this.trocasContexto++
        }
      } else {
        break // Não há médicos disponíveis
      }
    }
  }

  private analisarStarvation(): { processo: string, tempoEspera: number }[] {
    const processosEspera = this.fila.filter(p => p.estado === EstadoProcesso.PRONTO)
    const starvationThreshold = 5000 // 5 segundos

    return processosEspera
      .map(p => ({
        processo: p.nome,
        tempoEspera: this.tempoAtual - p.ingresso,
        prioridade: p.prioridade
      }))
      .filter(info => info.tempoEspera > starvationThreshold)
      .sort((a, b) => b.tempoEspera - a.tempoEspera)
  }

  public obterEstatisticas(): string {
    const resultado = this.obterResultado()
    const metricas = resultado.metricas

    // Mostrar ordem de execução com prioridades
    const ordemExecucao = this.eventos
      .filter(e => e.tipo === 'inicio')
      .map(e => `${e.processo.nome} (P${e.processo.prioridade})`)
      .join(' → ')

    // Analisar casos de starvation
    const starvation = this.analisarStarvation()
    const starvationInfo = starvation.length > 0 
      ? `\n🚨 Possível Starvation: ${starvation.map(s => `${s.processo} (${s.tempoEspera}ms esperando)`).join(', ')}`
      : '\n✅ Nenhum caso de starvation detectado'

    // Contar processos por nível de prioridade
    const processosPorPrioridade = resultado.processos.reduce((acc, p) => {
      acc[p.prioridade] = (acc[p.prioridade] || 0) + 1
      return acc
    }, {} as Record<number, number>)

    const distribuicaoPrioridade = Object.entries(processosPorPrioridade)
      .map(([prioridade, count]) => `P${prioridade}: ${count}`)
      .join(', ')

    return `
⭐ === RELATÓRIO ESCALONAMENTO POR PRIORIDADE ===
📋 Ordem de Execução: ${ordemExecucao}
📊 Distribuição: ${distribuicaoPrioridade}
⏱️  Tempo Médio de Espera: ${metricas.tempoMedioEspera.toFixed(2)}ms
🏃 Tempo Médio de Turnaround: ${metricas.tempoMedioTurnaround.toFixed(2)}ms
🔀 Número de Trocas de Contexto: ${metricas.numeroTrocasContexto}
💻 Utilização Média da CPU: ${metricas.utilizacaoMediaCPU.toFixed(2)}%
⏲️  Tempo Total de Simulação: ${metricas.tempoTotalSimulacao}ms
👥 Número de Médicos: ${this.medicos.length}
📊 Algoritmo: Não-preemptivo (maior prioridade primeiro)
🎂 Envelhecimento: ${this.envelhecimento ? 'Ativo' : 'Inativo'}${starvationInfo}
    `.trim()
  }
}

export const usePrioridade = (numeroMedicos: number = 1, envelhecimento: boolean = true) => {
  const escalonador = new PrioridadeEscalonador(numeroMedicos, envelhecimento)

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