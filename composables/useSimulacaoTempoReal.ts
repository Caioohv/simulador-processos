// composables/useSimulacaoTempoReal.ts
import type { ConfiguracaoSimulacao, IProcesso, RegistroGantt, ResultadoSimulacao } from '../types/index'
import { AlgoritmoEscalonamento, EstadoProcesso } from '../types/index'
import { useProcesso } from './useProcesso'

export interface EstadoSimulacao {
  tempoAtual: number
  processosNaFila: IProcesso[]
  processosExecutando: IProcesso[]
  processosFinalizados: IProcesso[]
  processosAguardandoChegada: IProcesso[]
  medicos: Medico[]
  diagramaGantt: RegistroGantt[]
  metricas: MetricasTempoReal
  executando: boolean
  pausado: boolean
}

export interface Medico {
  id: string
  nome: string
  ocupado: boolean
  processoAtual: IProcesso | null
  tempoOcupado: number
  tempoInicioAtendimento?: number
  tempoQuantumAtual?: number // Para controlar quantum do Round Robin
}

export interface MetricasTempoReal {
  tempoMedioEspera: number
  tempoMedioTurnaround: number
  utilizacaoMediaCPU: number
  numeroTrocasContexto: number
  processosCompletados: number
  totalProcessos: number
}

export interface EventoSimulacao {
  tempo: number
  tipo: 'chegada' | 'inicio_execucao' | 'fim_execucao' | 'preempcao'
  processo: IProcesso
  medico?: string
  mensagem: string
}

export const useSimulacaoTempoReal = () => {
  const { Processo } = useProcesso()
  
  // Sistema de cores consistente
  const coresDisponiveis = [
    '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899',
    '#06B6D4', '#84CC16', '#F97316', '#E11D48', '#7C3AED', '#0891B2',
    '#65A30D', '#DC2626', '#9333EA', '#059669', '#CA8A04', '#BE185D',
    '#0369A1', '#166534', '#92400E', '#991B1B', '#581C87', '#064E3B'
  ]
  const mapeamentoCores = new Map<number, string>()

  const obterCorConsistente = (pid: number, nomeProcesso: string): string => {
    if (mapeamentoCores.has(pid)) {
      return mapeamentoCores.get(pid)!
    }
    
    // Usar hash do nome como fallback para consistência
    const hash = nomeProcesso.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
    const cor = coresDisponiveis[hash % coresDisponiveis.length]
    mapeamentoCores.set(pid, cor)
    return cor
  }
  
  // Estado reativo da simulação
  const estado = ref<EstadoSimulacao>({
    tempoAtual: 0,
    processosNaFila: [],
    processosExecutando: [],
    processosFinalizados: [],
    processosAguardandoChegada: [],
    medicos: [],
    diagramaGantt: [],
    metricas: {
      tempoMedioEspera: 0,
      tempoMedioTurnaround: 0,
      utilizacaoMediaCPU: 0,
      numeroTrocasContexto: 0,
      processosCompletados: 0,
      totalProcessos: 0
    },
    executando: false,
    pausado: false
  })

  // Logs de eventos em tempo real
  const eventos = ref<EventoSimulacao[]>([])
  
  // Configuração da simulação
  let algoritmo: AlgoritmoEscalonamento = AlgoritmoEscalonamento.ROUND_ROBIN
  let quantum: number = 2000
  let intervalId: ReturnType<typeof setInterval> | null = null
  let velocidadeSimulacao: number = 1000 // ms entre cada "tick" da simulação
  
  const inicializarSimulacao = (config: ConfiguracaoSimulacao) => {
    // Resetar estado
    estado.value = {
      tempoAtual: 0,
      processosNaFila: [],
      processosExecutando: [],
      processosFinalizados: [],
      processosAguardandoChegada: [],
      medicos: [],
      diagramaGantt: [],
      metricas: {
        tempoMedioEspera: 0,
        tempoMedioTurnaround: 0,
        utilizacaoMediaCPU: 0,
        numeroTrocasContexto: 0,
        processosCompletados: 0,
        totalProcessos: config.processos.length
      },
      executando: false,
      pausado: false
    }
    
    eventos.value = []
    algoritmo = config.algoritmo
    quantum = config.quantum || 2000
    
    // Criar médicos
    for (let i = 1; i <= config.numeroMedicos; i++) {
      estado.value.medicos.push({
        id: `medico-${i}`,
        nome: `Dr. ${String.fromCharCode(64 + i)}`,
        ocupado: false,
        processoAtual: null,
        tempoOcupado: 0,
        tempoQuantumAtual: 0
      })
    }
    
    // Preparar processos
    estado.value.processosAguardandoChegada = config.processos.map(p => 
      new Processo(p.pid, p.nome, p.ingresso, p.duracao, p.prioridade)
    ).sort((a, b) => a.ingresso - b.ingresso)
    
    console.log(`🏥 Simulação inicializada - ${config.numeroMedicos} médicos, ${config.processos.length} pacientes`)
    console.log(`⚙️ Algoritmo: ${config.algoritmo}, Quantum: ${quantum}ms`)
  }

  const adicionarEvento = (tipo: EventoSimulacao['tipo'], processo: IProcesso, medico?: string, mensagem?: string) => {
    const evento: EventoSimulacao = {
      tempo: estado.value.tempoAtual,
      tipo,
      processo,
      medico,
      mensagem: mensagem || `${tipo} - ${processo.nome}`
    }
    
    eventos.value.push(evento)
    console.log(`[${estado.value.tempoAtual}ms] ${evento.mensagem}`)
  }

  const verificarPreempcaoSRTF = () => {
    if (algoritmo !== AlgoritmoEscalonamento.SHORTEST_REMAINING_TIME) return
    
    const processosDisponveis = estado.value.processosNaFila.filter(p => p.estado === EstadoProcesso.PRONTO)
    if (processosDisponveis.length === 0) return

    // Encontrar processo com menor tempo restante na fila
    const processoMenorTempo = processosDisponveis.reduce((menor, atual) => 
      atual.duracao < menor.duracao ? atual : menor
    )

    // Verificar se algum médico está executando um processo com tempo restante maior
    for (const medico of estado.value.medicos) {
      if (medico.ocupado && medico.processoAtual) {
        const processoAtual = medico.processoAtual
        
        if (processoMenorTempo.duracao < processoAtual.duracao) {
          // Preempção necessária no SRTF
          console.log(`🚨 SRTF Preempção: ${processoMenorTempo.nome} (${processoMenorTempo.duracao}ms) vai interromper ${processoAtual.nome} (${processoAtual.duracao}ms)`)
          
          // Retorna processo atual para a fila
          processoAtual.estado = EstadoProcesso.PRONTO
          estado.value.processosNaFila.push(processoAtual)
          
          // Remove da execução
          const execIndex = estado.value.processosExecutando.findIndex(p => p.pid === processoAtual.pid)
          if (execIndex !== -1) {
            estado.value.processosExecutando.splice(execIndex, 1)
          }
          
          adicionarEvento('preempcao', processoAtual, medico.nome, 
            `🚨 ${processoMenorTempo.nome} preemptou ${processoAtual.nome} (SRTF)`)

          estado.value.metricas.numeroTrocasContexto++
          
          // Liberar médico
          medico.ocupado = false
          medico.processoAtual = null
          medico.tempoInicioAtendimento = undefined
          
          // Remove o processo que vai preemptar da fila
          const filaIndex = estado.value.processosNaFila.findIndex(p => p.pid === processoMenorTempo.pid)
          if (filaIndex !== -1) {
            estado.value.processosNaFila.splice(filaIndex, 1)
          }

          // Aloca o novo processo
          medico.ocupado = true
          medico.processoAtual = processoMenorTempo
          medico.tempoInicioAtendimento = estado.value.tempoAtual
          medico.tempoQuantumAtual = 0 // Resetar quantum para novo processo
          
          processoMenorTempo.estado = EstadoProcesso.EXECUTANDO
          estado.value.processosExecutando.push(processoMenorTempo)
          
          adicionarEvento('inicio_execucao', processoMenorTempo, medico.nome, 
            `👨‍⚕️ ${medico.nome} começou a atender ${processoMenorTempo.nome} após preempção SRTF`)

          break // Só uma preempção por ciclo
        }
      }
    }
  }

  const processarChegadas = () => {
    const processosChegando = estado.value.processosAguardandoChegada.filter(
      p => p.ingresso <= estado.value.tempoAtual
    )
    
    for (const processo of processosChegando) {
      // Remover da lista de espera e adicionar à fila
      const index = estado.value.processosAguardandoChegada.findIndex(p => p.pid === processo.pid)
      if (index !== -1) {
        estado.value.processosAguardandoChegada.splice(index, 1)
      }
      
      processo.estado = EstadoProcesso.PRONTO
      estado.value.processosNaFila.push(processo)
      
      adicionarEvento('chegada', processo, undefined, `📥 ${processo.nome} entrou na fila`)
    }
  }

  const alocarProcessos = () => {
    // Para SRTF, verificar preempção primeiro
    if (algoritmo === AlgoritmoEscalonamento.SHORTEST_REMAINING_TIME) {
      verificarPreempcaoSRTF()
    }
    
    if (estado.value.processosNaFila.length === 0) return
    
    // Encontrar médicos livres
    const medicosLivres = estado.value.medicos.filter(m => !m.ocupado)
    if (medicosLivres.length === 0) return
    
    // Ordenar processos conforme algoritmo
    let processosOrdenados = [...estado.value.processosNaFila]
    
    switch (algoritmo) {
      case AlgoritmoEscalonamento.SHORTEST_JOB_FIRST:
        // SJF: Não-preemptivo - ordena por duração original mais curta
        processosOrdenados.sort((a, b) => a.duracaoOriginal - b.duracaoOriginal)
        break
      case AlgoritmoEscalonamento.PRIORIDADE:
        // Prioridade: Cooperativo (não-preemptivo) - ordena por prioridade
        processosOrdenados.sort((a, b) => a.prioridade - b.prioridade)
        break
      case AlgoritmoEscalonamento.SHORTEST_REMAINING_TIME:
        // SRTF: Preemptivo - ordena por tempo restante
        processosOrdenados.sort((a, b) => a.duracao - b.duracao)
        break
      // Round Robin: Preemptivo - usa FIFO, preempção por quantum
    }
    
    // Alocar processos aos médicos livres
    for (let i = 0; i < Math.min(medicosLivres.length, processosOrdenados.length); i++) {
      const medico = medicosLivres[i]
      const processo = processosOrdenados[i]
      
      // Remover da fila
      const filaIndex = estado.value.processosNaFila.findIndex(p => p.pid === processo.pid)
      if (filaIndex !== -1) {
        estado.value.processosNaFila.splice(filaIndex, 1)
      }
      
      // Alocar ao médico
      medico.ocupado = true
      medico.processoAtual = processo
      medico.tempoInicioAtendimento = estado.value.tempoAtual
      medico.tempoQuantumAtual = 0 // Resetar quantum para novo processo
      
      // Atualizar processo
      processo.estado = EstadoProcesso.EXECUTANDO
      estado.value.processosExecutando.push(processo)
      
      adicionarEvento('inicio_execucao', processo, medico.nome, 
        `👨‍⚕️ ${medico.nome} começou a atender ${processo.nome}`)
    }
  }

  const executarProcessos = () => {
    for (const medico of estado.value.medicos) {
      if (!medico.ocupado || !medico.processoAtual) continue
      
      const processo = medico.processoAtual
      
      // Determinar tempo de execução baseado no algoritmo
      let tempoExecucao: number
      
      switch (algoritmo) {
        case AlgoritmoEscalonamento.ROUND_ROBIN:
          // Round Robin: controlar quantum corretamente
          const tempoRestanteQuantum = quantum - (medico.tempoQuantumAtual || 0)
          tempoExecucao = Math.min(tempoRestanteQuantum, processo.duracao, velocidadeSimulacao)
          break
        case AlgoritmoEscalonamento.SHORTEST_REMAINING_TIME:
          // Preemptivo: executa em pequenos intervalos para permitir preempção
          tempoExecucao = Math.min(velocidadeSimulacao, processo.duracao)
          break
        case AlgoritmoEscalonamento.SHORTEST_JOB_FIRST:
        case AlgoritmoEscalonamento.PRIORIDADE:
        default:
          // Não-preemptivos: executam até completar ou até o próximo tick
          tempoExecucao = Math.min(processo.duracao, velocidadeSimulacao)
          break
      }
      
      // Executar processo
      processo.duracao -= tempoExecucao
      medico.tempoOcupado += tempoExecucao
      
      // Atualizar quantum para Round Robin
      if (algoritmo === AlgoritmoEscalonamento.ROUND_ROBIN) {
        medico.tempoQuantumAtual = (medico.tempoQuantumAtual || 0) + tempoExecucao
      }
      
      // Atualizar Gantt chart
      const registroExistente = estado.value.diagramaGantt.find(
        r => r.medico === medico.nome && 
        r.processo === processo.nome && 
        r.fim === estado.value.tempoAtual
      )
      
      if (registroExistente) {
        // Estender registro existente
        registroExistente.fim = estado.value.tempoAtual + velocidadeSimulacao
      } else {
        // Criar novo registro
        estado.value.diagramaGantt.push({
          medico: medico.nome,
          processo: processo.nome,
          inicio: estado.value.tempoAtual,
          fim: estado.value.tempoAtual + velocidadeSimulacao,
          cor: obterCorConsistente(processo.pid, processo.nome)
        })
      }
      
      // Verificar se processo terminou
      if (processo.duracao <= 0) {
        // Processo finalizado
        processo.estado = EstadoProcesso.TERMINADO
        processo.tempoFimExecucao = estado.value.tempoAtual + velocidadeSimulacao
        processo.tempoTurnaround = processo.tempoFimExecucao - processo.ingresso
        processo.tempoEspera = processo.tempoTurnaround - processo.duracaoOriginal
        
        // Mover para finalizados
        const execIndex = estado.value.processosExecutando.findIndex(p => p.pid === processo.pid)
        if (execIndex !== -1) {
          estado.value.processosExecutando.splice(execIndex, 1)
        }
        estado.value.processosFinalizados.push(processo)
        
        // Liberar médico
        medico.ocupado = false
        medico.processoAtual = null
        medico.tempoInicioAtendimento = undefined
        medico.tempoQuantumAtual = 0 // Resetar quantum
        
        adicionarEvento('fim_execucao', processo, medico.nome, 
          `✅ ${processo.nome} foi completamente atendido por ${medico.nome}`)
        
        // Atualizar métricas
        atualizarMetricas()
        
      } else if (algoritmo === AlgoritmoEscalonamento.ROUND_ROBIN && (medico.tempoQuantumAtual || 0) >= quantum) {
        // Preempção no Round Robin por quantum esgotado
        console.log(`🔄 Round Robin: ${processo.nome} esgotou quantum ${quantum}ms, restam ${processo.duracao}ms`)
        
        processo.estado = EstadoProcesso.PRONTO
        estado.value.processosNaFila.push(processo) // Volta para o FINAL da fila
        
        // Remover da execução
        const execIndex = estado.value.processosExecutando.findIndex(p => p.pid === processo.pid)
        if (execIndex !== -1) {
          estado.value.processosExecutando.splice(execIndex, 1)
        }
        
        // Liberar médico e resetar quantum
        medico.ocupado = false
        medico.processoAtual = null
        medico.tempoInicioAtendimento = undefined
        medico.tempoQuantumAtual = 0 // Resetar quantum
        
        estado.value.metricas.numeroTrocasContexto++
        
        adicionarEvento('preempcao', processo, medico.nome, 
          `⚡ ${processo.nome} foi interrompido (quantum ${quantum}ms esgotado), restam ${processo.duracao}ms - voltou à fila`)
      }
    }
  }

  const atualizarMetricas = () => {
    const processosCompletos = estado.value.processosFinalizados
    
    if (processosCompletos.length === 0) return
    
    // Tempo médio de espera
    const somaEspera = processosCompletos.reduce((soma, p) => soma + p.tempoEspera, 0)
    estado.value.metricas.tempoMedioEspera = somaEspera / processosCompletos.length
    
    // Tempo médio de turnaround
    const somaTurnaround = processosCompletos.reduce((soma, p) => soma + p.tempoTurnaround, 0)
    estado.value.metricas.tempoMedioTurnaround = somaTurnaround / processosCompletos.length
    
    // Utilização da CPU
    if (estado.value.tempoAtual > 0) {
      const tempoTotalOcupado = estado.value.medicos.reduce((soma, m) => soma + m.tempoOcupado, 0)
      const tempoTotalDisponivel = estado.value.medicos.length * estado.value.tempoAtual
      estado.value.metricas.utilizacaoMediaCPU = (tempoTotalOcupado / tempoTotalDisponivel) * 100
    }
    
    estado.value.metricas.processosCompletados = processosCompletos.length
  }

  const tick = () => {
    if (estado.value.pausado) return
    
    // Processar chegadas
    processarChegadas()
    
    // Alocar processos livres a médicos
    alocarProcessos()
    
    // Executar processos ativos
    executarProcessos()
    
    // Incrementar tempo
    estado.value.tempoAtual += velocidadeSimulacao
    
    // Verificar se simulação terminou
    if (simulacaoTerminou()) {
      pararSimulacao()
    }
  }

  const simulacaoTerminou = (): boolean => {
    return estado.value.processosAguardandoChegada.length === 0 &&
           estado.value.processosNaFila.length === 0 &&
           estado.value.processosExecutando.length === 0
  }

  const iniciarSimulacao = () => {
    if (estado.value.executando) return
    
    estado.value.executando = true
    estado.value.pausado = false
    
    console.log('🚀 Iniciando simulação em tempo real...')
    
    intervalId = setInterval(tick, velocidadeSimulacao)
  }

  const pausarSimulacao = () => {
    estado.value.pausado = !estado.value.pausado
    console.log(estado.value.pausado ? '⏸️ Simulação pausada' : '▶️ Simulação retomada')
  }

  const pararSimulacao = () => {
    if (intervalId) {
      clearInterval(intervalId)
      intervalId = null
    }
    
    estado.value.executando = false
    estado.value.pausado = false
    
    // Limpar mapeamento de cores
    mapeamentoCores.clear()
    
    // Calcular métricas finais
    atualizarMetricas()
    
    console.log('🏁 Simulação finalizada!')
    console.log(`📊 Métricas finais:`, estado.value.metricas)
  }

  const definirVelocidade = (novaVelocidade: number) => {
    velocidadeSimulacao = novaVelocidade
    
    if (intervalId) {
      clearInterval(intervalId)
      intervalId = setInterval(tick, velocidadeSimulacao)
    }
  }

  const obterResultado = (): ResultadoSimulacao => {
    return {
      metricas: {
        tempoMedioEspera: estado.value.metricas.tempoMedioEspera,
        tempoMedioTurnaround: estado.value.metricas.tempoMedioTurnaround,
        numeroTrocasContexto: estado.value.metricas.numeroTrocasContexto,
        utilizacaoMediaCPU: estado.value.metricas.utilizacaoMediaCPU,
        tempoTotalSimulacao: estado.value.tempoAtual
      },
      eventos: eventos.value.map(e => ({
        tempo: e.tempo,
        tipo: e.tipo as 'inicio' | 'fim' | 'preempcao' | 'chegada',
        processo: e.processo,
        medico: e.medico,
        descricao: e.mensagem
      })),
      processos: estado.value.processosFinalizados,
      medicos: estado.value.medicos.map(m => ({
        id: m.id,
        nome: m.nome,
        ocupado: m.ocupado,
        processoAtual: m.processoAtual,
        tempoOcupado: m.tempoOcupado
      })),
      diagramaGantt: estado.value.diagramaGantt
    }
  }

  return {
    estado: readonly(estado),
    eventos: readonly(eventos),
    inicializarSimulacao,
    iniciarSimulacao,
    pausarSimulacao,
    pararSimulacao,
    definirVelocidade,
    obterResultado
  }
}