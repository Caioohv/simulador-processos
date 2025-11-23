// composables/useEscalonamento.ts
import type {
    EstadoMedico,
    EventoExecucao,
    IProcesso,
    MetricasDesempenho,
    RegistroGantt,
    ResultadoSimulacao
} from '../types/index'
import { EstadoProcesso } from '../types/index'

export abstract class EscalonadorBase {
  protected fila: IProcesso[] = []
  protected medicos: EstadoMedico[] = []
  protected eventos: EventoExecucao[] = []
  protected diagramaGantt: RegistroGantt[] = []
  protected tempoAtual: number = 0
  protected trocasContexto: number = 0
  protected tempoTotalSimulacao: number = 0

  constructor(numeroMedicos: number = 1) {
    this.inicializarMedicos(numeroMedicos)
  }

  protected inicializarMedicos(numeroMedicos: number): void {
    this.medicos = []
    const nomesMedicos = ['Dr. Silva', 'Dra. Santos', 'Dr. Oliveira', 'Dra. Costa']
    
    for (let i = 0; i < numeroMedicos; i++) {
      this.medicos.push({
        id: `medico-${i + 1}`,
        nome: nomesMedicos[i] || `Médico ${i + 1}`,
        ocupado: false,
        tempoOcupado: 0
      })
    }
  }

  public adicionarProcesso(processo: IProcesso): void {
    console.log(`🏥 Paciente ${processo.nome} chegou ao hospital (PID: ${processo.pid})`)
    processo.estado = EstadoProcesso.PRONTO
    this.fila.push(processo)
    
    this.eventos.push({
      tempo: this.tempoAtual,
      tipo: 'chegada',
      processo,
      descricao: `Paciente ${processo.nome} chegou ao hospital`
    })
  }

  protected adicionarEventoExecucao(tipo: EventoExecucao['tipo'], processo: IProcesso, medico?: string, descricao?: string): void {
    this.eventos.push({
      tempo: this.tempoAtual,
      tipo,
      processo,
      medico,
      descricao: descricao || `${tipo} - ${processo.nome}`
    })
  }

  protected encontrarMedicoLivre(): EstadoMedico | null {
    return this.medicos.find(medico => !medico.ocupado) || null
  }

  protected liberarMedico(medicoId: string): void {
    const medico = this.medicos.find(m => m.id === medicoId)
    if (medico) {
      medico.ocupado = false
      medico.processoAtual = undefined
    }
  }

  protected ocuparMedico(medicoId: string, processo: IProcesso): void {
    const medico = this.medicos.find(m => m.id === medicoId)
    if (medico) {
      medico.ocupado = true
      medico.processoAtual = processo
      processo.medico = medico.nome
    }
  }

  protected adicionarRegistroGantt(medico: string, processo: string, inicio: number, duracao: number): void {
    this.diagramaGantt.push({
      medico,
      processo,
      inicio,
      fim: inicio + duracao,
      cor: this.obterCorProcesso(processo)
    })
  }

  protected obterCorProcesso(nomeProcesso: string): string {
    // Extrair PID do nome do processo (formato: "👨 João" -> pid é o índice)
    // Como não temos acesso direto ao PID aqui, vamos usar hash consistente
    const cores = [
      '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899',
      '#06B6D4', '#84CC16', '#F97316', '#E11D48', '#7C3AED', '#0891B2',
      '#65A30D', '#DC2626', '#9333EA', '#059669', '#CA8A04', '#BE185D',
      '#0369A1', '#166534', '#92400E', '#991B1B', '#581C87', '#064E3B'
    ]
    const hash = nomeProcesso.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
    return cores[hash % cores.length]
  }

  protected calcularMetricas(): MetricasDesempenho {
    const processosTerminados = this.fila.filter(p => p.estado === EstadoProcesso.TERMINADO)
    const numProcessos = processosTerminados.length

    if (numProcessos === 0) {
      return {
        tempoMedioEspera: 0,
        tempoMedioTurnaround: 0,
        numeroTrocasContexto: this.trocasContexto,
        utilizacaoMediaCPU: 0,
        tempoTotalSimulacao: this.tempoTotalSimulacao
      }
    }

    // Calcular tempos baseado nos eventos de execução
    let tempoTotalEspera = 0
    let tempoTotalTurnaround = 0
    
    for (const processo of processosTerminados) {
      if (processo.tempoFimExecucao && processo.tempoInicioExecucao) {
        // Turnaround = fim - chegada
        const turnaround = processo.tempoFimExecucao - processo.ingresso
        // Espera = turnaround - duração original
        const espera = Math.max(0, turnaround - processo.duracaoOriginal)
        
        processo.tempoTurnaround = turnaround
        processo.tempoEspera = espera
        
        tempoTotalEspera += espera
        tempoTotalTurnaround += turnaround
      }
    }
    
    // Calcular utilização da CPU
    const tempoTotalOcupado = this.medicos.reduce((acc, medico) => acc + medico.tempoOcupado, 0)
    const tempoTotalDisponivel = this.tempoTotalSimulacao * this.medicos.length
    const utilizacaoMediaCPU = tempoTotalDisponivel > 0 ? (tempoTotalOcupado / tempoTotalDisponivel) * 100 : 0

    return {
      tempoMedioEspera: tempoTotalEspera / numProcessos,
      tempoMedioTurnaround: tempoTotalTurnaround / numProcessos,
      numeroTrocasContexto: this.trocasContexto,
      utilizacaoMediaCPU,
      tempoTotalSimulacao: this.tempoTotalSimulacao
    }
  }

  public obterResultado(): ResultadoSimulacao {
    return {
      metricas: this.calcularMetricas(),
      eventos: [...this.eventos],
      processos: [...this.fila],
      medicos: [...this.medicos],
      diagramaGantt: [...this.diagramaGantt]
    }
  }

  protected exibirEstadoFila(): void {
    const filaNomes = this.fila
      .filter(p => p.estado === EstadoProcesso.PRONTO)
      .map(p => p.toDisplayString())
    
    console.log(`📋 Fila de espera: [${filaNomes.join(', ')}]`)
    
    // Mostrar médicos ocupados
    this.medicos.forEach(medico => {
      if (medico.ocupado && medico.processoAtual) {
        console.log(`👨‍⚕️ ${medico.nome} atendendo: ${medico.processoAtual.nome}`)
      }
    })
  }

  // Método abstrato que deve ser implementado pelas subclasses
  public abstract executar(): Promise<ResultadoSimulacao>

  // Método de template para execução padrão
  protected async executarTemplate(): Promise<ResultadoSimulacao> {
    console.log('\n🏥 === INICIANDO SIMULAÇÃO DO HOSPITAL DIGITAL ===\n')
    
    while (this.temProcessosAtivos()) {
      await this.executarCiclo()
      // Tempo é incrementado pelos algoritmos específicos
    }

    this.tempoTotalSimulacao = this.tempoAtual
    
    console.log('\n✅ === SIMULAÇÃO CONCLUÍDA ===')
    console.log('📊 Calculando métricas finais...\n')
    
    return this.obterResultado()
  }

  protected temProcessosAtivos(): boolean {
    return this.fila.some(p => 
      p.estado === EstadoProcesso.PRONTO || 
      p.estado === EstadoProcesso.EXECUTANDO
    )
  }

  // Método abstrato para um ciclo de execução
  protected abstract executarCiclo(): Promise<void>
}

export const useEscalonamento = () => {
  return {
    EscalonadorBase
  }
}