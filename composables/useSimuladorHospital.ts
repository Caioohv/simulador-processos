// composables/useSimuladorHospital.ts
import type {
    CenarioTeste,
    ConfiguracaoSimulacao,
    IProcesso,
    ResultadoSimulacao
} from '../types/index'
import { AlgoritmoEscalonamento } from '../types/index'
import { usePrioridade } from './scheduling/usePrioridade'
import { useRoundRobin } from './scheduling/useRoundRobin'
import { useShortestJobFirst } from './scheduling/useShortestJobFirst'
import { useShortestRemainingTime } from './scheduling/useShortestRemainingTime'
import { useProcesso } from './useProcesso'

export const useSimuladorHospital = () => {
  const { Processo, criarProcessosExemplo } = useProcesso()

  // Cenários pré-definidos expandidos - 4 algoritmos com 1, 2 e 4 médicos cada
  const criarCenarios = (): CenarioTeste[] => {
    const cenarios: CenarioTeste[] = []
    
    // Algoritmos a testar
    const algoritmos = [
      { tipo: AlgoritmoEscalonamento.PRIORIDADE, nome: 'Prioridade' },
      { tipo: AlgoritmoEscalonamento.ROUND_ROBIN, nome: 'Round Robin' },
      { tipo: AlgoritmoEscalonamento.SHORTEST_JOB_FIRST, nome: 'Shortest Job First' },
      { tipo: AlgoritmoEscalonamento.SHORTEST_REMAINING_TIME, nome: 'Shortest Remaining Time' }
    ]
    
    // Configurações de médicos
    const configMedicos = [1, 2, 4]
    
    // Dados dos cenários base
    const cenariosBases = [
      {
        numero: 1,
        nome: "Emergência Crítica",
        descricao: "Pacientes de diferentes níveis de urgência",
        icone: "🚨",
        processos: [
          { pid: 1, nome: '🚑 João (UTI)', ingresso: 0, duracao: 8000, prioridade: 1 },
          { pid: 2, nome: '👴 Maria (Consulta)', ingresso: 500, duracao: 3000, prioridade: 4 },
          { pid: 3, nome: '🤰 Ana (Emergência)', ingresso: 1000, duracao: 5000, prioridade: 1 },
          { pid: 4, nome: '👶 Pedro (Pediatria)', ingresso: 2000, duracao: 2000, prioridade: 2 },
          { pid: 5, nome: '👨 Carlos (Rotina)', ingresso: 3000, duracao: 4000, prioridade: 5 }
        ],
        objetivos: [
          "Observar como os algoritmos tratam processos de alta prioridade",
          "Verificar se há inanição em algoritmos que não consideram prioridade",
          "Analisar inversão de prioridade"
        ],
        perguntasAnalise: [
          "Qual algoritmo atende mais rapidamente os pacientes críticos?",
          "Algum paciente de baixa prioridade sofreu inanição?",
          "Como cada algoritmo trata pacientes críticos vs. rotina?"
        ]
      },
      {
        numero: 2,
        nome: "Plantão Lotado",
        descricao: "Alta carga de pacientes diversos",
        icone: "🏥",
        processos: [
          { pid: 1, nome: '👴 João', ingresso: 0, duracao: 6000, prioridade: 3 },
          { pid: 2, nome: '🤰 Maria', ingresso: 500, duracao: 3000, prioridade: 2 },
          { pid: 3, nome: '👶 Ana', ingresso: 1000, duracao: 8000, prioridade: 1 },
          { pid: 4, nome: '👨 Pedro', ingresso: 1500, duracao: 2000, prioridade: 4 },
          { pid: 5, nome: '👵 Carla', ingresso: 2000, duracao: 5000, prioridade: 2 },
          { pid: 6, nome: '🚑 Bruno', ingresso: 2500, duracao: 1000, prioridade: 1 },
          { pid: 7, nome: '👨 Luis', ingresso: 3000, duracao: 4000, prioridade: 3 },
          { pid: 8, nome: '👩 Sofia', ingresso: 3500, duracao: 3500, prioridade: 2 }
        ],
        objetivos: [
          "Verificar comportamento sob carga intensa",
          "Comparar impacto das preempções",
          "Analisar balanceamento de carga entre médicos"
        ],
        perguntasAnalise: [
          "Qual algoritmo apresentou menor tempo médio de espera?",
          "Em qual houve mais trocas de contexto?",
          "Qual mantém melhor utilização média da CPU?"
        ]
      },
      {
        numero: 3,
        nome: "Hospital Moderno",
        descricao: "Recursos abundantes com pacientes diversos",
        icone: "🔬",
        processos: [
          { pid: 1, nome: '👴 João', ingresso: 0, duracao: 7000, prioridade: 3 },
          { pid: 2, nome: '🤰 Maria', ingresso: 1000, duracao: 2000, prioridade: 1 },
          { pid: 3, nome: '👶 Ana', ingresso: 2000, duracao: 9000, prioridade: 2 },
          { pid: 4, nome: '👨 Pedro', ingresso: 3000, duracao: 1000, prioridade: 4 },
          { pid: 5, nome: '👵 Carla', ingresso: 4000, duracao: 6000, prioridade: 2 },
          { pid: 6, nome: '🚑 Bruno', ingresso: 5000, duracao: 500, prioridade: 1 },
          { pid: 7, nome: '👨 Luis', ingresso: 6000, duracao: 8000, prioridade: 3 },
          { pid: 8, nome: '👩 Sofia', ingresso: 7000, duracao: 3000, prioridade: 2 },
          { pid: 9, nome: '🧓 Roberto', ingresso: 8000, duracao: 4000, prioridade: 4 },
          { pid: 10, nome: '👩 Lucia', ingresso: 9000, duracao: 2500, prioridade: 1 }
        ],
        objetivos: [
          "Avaliar comportamento com recursos abundantes",
          "Verificar adaptação a múltiplos núcleos",
          "Analisar quando preempção continua vantajosa"
        ],
        perguntasAnalise: [
          "Há diferença perceptível no tempo médio entre algoritmos?",
          "Qual algoritmo se adapta melhor aos múltiplos recursos?",
          "Em que situações a preempção ainda é vantajosa?"
        ]
      }
    ]
    
    // Gerar todos os cenários (3 cenários × 4 algoritmos × 3 configurações de médicos = 36 cenários)
    for (const cenarioBase of cenariosBases) {
      for (const algoritmo of algoritmos) {
        for (const numMedicos of configMedicos) {
          cenarios.push({
            nome: `Cenário ${cenarioBase.numero} - ${cenarioBase.nome} (${algoritmo.nome}, ${numMedicos} médico${numMedicos > 1 ? 's' : ''})`,
            descricao: `${cenarioBase.descricao} - ${algoritmo.nome} com ${numMedicos} médico${numMedicos > 1 ? 's' : ''}`,
            configuracao: {
              algoritmo: algoritmo.tipo,
              numeroMedicos: numMedicos,
              quantum: algoritmo.tipo === AlgoritmoEscalonamento.ROUND_ROBIN ? 2000 : undefined,
              processos: cenarioBase.processos
            },
            objetivos: cenarioBase.objetivos,
            perguntasAnalise: cenarioBase.perguntasAnalise
          })
        }
      }
    }
    
    return cenarios
  }

  const executarSimulacao = async (configuracao: ConfiguracaoSimulacao): Promise<ResultadoSimulacao> => {
    console.log('\n🏥 === SIMULADOR DO HOSPITAL DIGITAL ===')
    console.log(`📋 Algoritmo: ${configuracao.algoritmo}`)
    console.log(`👥 Médicos: ${configuracao.numeroMedicos}`)
    console.log(`🔢 Processos: ${configuracao.processos.length}`)
    
    // Criar instância do algoritmo apropriado
    let simulacao: any

    switch (configuracao.algoritmo) {
      case AlgoritmoEscalonamento.ROUND_ROBIN:
        simulacao = useRoundRobin(configuracao.quantum || 2000, configuracao.numeroMedicos)
        break
      case AlgoritmoEscalonamento.SHORTEST_JOB_FIRST:
        simulacao = useShortestJobFirst(configuracao.numeroMedicos)
        break
      case AlgoritmoEscalonamento.SHORTEST_REMAINING_TIME:
        simulacao = useShortestRemainingTime(configuracao.numeroMedicos)
        break
      case AlgoritmoEscalonamento.PRIORIDADE:
        simulacao = usePrioridade(configuracao.numeroMedicos)
        break
      default:
        throw new Error(`Algoritmo não suportado: ${configuracao.algoritmo}`)
    }

    // Adicionar processos à simulação
    for (const processoConfig of configuracao.processos) {
      const processo = new Processo(
        processoConfig.pid,
        processoConfig.nome,
        processoConfig.ingresso,
        processoConfig.duracao,
        processoConfig.prioridade
      )
      simulacao.adicionarProcesso(processo)
    }

    // Executar simulação
    const resultado = await simulacao.executar()
    
    // Exibir estatísticas
    console.log('\n' + simulacao.obterEstatisticas())
    
    return resultado
  }

  const compararAlgoritmos = async (
    processos: IProcesso[], 
    numeroMedicos: number = 1,
    quantum: number = 2000
  ): Promise<Record<string, ResultadoSimulacao>> => {
    const algoritmos = [
      AlgoritmoEscalonamento.ROUND_ROBIN,
      AlgoritmoEscalonamento.SHORTEST_JOB_FIRST,
      AlgoritmoEscalonamento.SHORTEST_REMAINING_TIME,
      AlgoritmoEscalonamento.PRIORIDADE
    ]

    const resultados: Record<string, ResultadoSimulacao> = {}

    console.log('\n🔄 === COMPARAÇÃO DE ALGORITMOS ===\n')

    for (const algoritmo of algoritmos) {
      console.log(`\n▶️  Executando ${algoritmo}...`)
      
      const configuracao: ConfiguracaoSimulacao = {
        algoritmo,
        numeroMedicos,
        quantum: algoritmo === AlgoritmoEscalonamento.ROUND_ROBIN ? quantum : undefined,
        processos: processos.map(p => ({
          pid: p.pid,
          nome: p.nome,
          ingresso: p.ingresso,
          duracao: p.duracaoOriginal,
          prioridade: p.prioridade
        }))
      }

      try {
        resultados[algoritmo] = await executarSimulacao(configuracao)
        console.log(`✅ ${algoritmo} concluído`)
      } catch (error) {
        console.error(`❌ Erro em ${algoritmo}:`, error)
      }
    }

    // Gerar relatório comparativo
    gerarRelatorioComparativo(resultados)
    
    return resultados
  }

  const gerarRelatorioComparativo = (resultados: Record<string, ResultadoSimulacao>) => {
    console.log('\n📊 === RELATÓRIO COMPARATIVO ===')
    console.log('┌─────────────────────────────┬──────────┬─────────────┬─────────┬────────────┐')
    console.log('│ Algoritmo                   │ Espera   │ Turnaround  │ Trocas  │ CPU (%)    │')
    console.log('├─────────────────────────────┼──────────┼─────────────┼─────────┼────────────┤')

    Object.entries(resultados).forEach(([algoritmo, resultado]) => {
      const m = resultado.metricas
      const nomeAlgoritmo = algoritmo.replace(/_/g, ' ').toUpperCase().padEnd(27)
      const espera = `${m.tempoMedioEspera.toFixed(0)}ms`.padEnd(8)
      const turnaround = `${m.tempoMedioTurnaround.toFixed(0)}ms`.padEnd(11)
      const trocas = `${m.numeroTrocasContexto}`.padEnd(7)
      const cpu = `${m.utilizacaoMediaCPU.toFixed(1)}%`.padEnd(10)
      
      console.log(`│ ${nomeAlgoritmo} │ ${espera} │ ${turnaround} │ ${trocas} │ ${cpu} │`)
    })
    
    console.log('└─────────────────────────────┴──────────┴─────────────┴─────────┴────────────┘')

    // Encontrar melhores em cada métrica
    const entradas = Object.entries(resultados)
    const melhorEspera = entradas
      .reduce((melhor, [nome, resultado]) => 
        resultado.metricas.tempoMedioEspera < melhor[1].metricas.tempoMedioEspera 
          ? [nome, resultado] 
          : melhor
      )
    
    const melhorTurnaround = entradas
      .reduce((melhor, [nome, resultado]) => 
        resultado.metricas.tempoMedioTurnaround < melhor[1].metricas.tempoMedioTurnaround 
          ? [nome, resultado] 
          : melhor
      )

    const melhorCPU = entradas
      .reduce((melhor, [nome, resultado]) => 
        resultado.metricas.utilizacaoMediaCPU > melhor[1].metricas.utilizacaoMediaCPU 
          ? [nome, resultado] 
          : melhor
      )

    console.log('\n🏆 === MELHORES DESEMPENHOS ===')
    console.log(`⏱️  Menor Tempo de Espera: ${melhorEspera[0]} (${melhorEspera[1].metricas.tempoMedioEspera.toFixed(2)}ms)`)
    console.log(`🏃 Menor Turnaround: ${melhorTurnaround[0]} (${melhorTurnaround[1].metricas.tempoMedioTurnaround.toFixed(2)}ms)`)
    console.log(`💻 Melhor Utilização CPU: ${melhorCPU[0]} (${melhorCPU[1].metricas.utilizacaoMediaCPU.toFixed(2)}%)`)
  }

  const executarCenario = async (cenario: CenarioTeste): Promise<ResultadoSimulacao> => {
    console.log(`\n🎭 === ${cenario.nome.toUpperCase()} ===`)
    console.log(`📝 ${cenario.descricao}`)
    console.log('\n🎯 Objetivos:')
    cenario.objetivos.forEach(obj => console.log(`  • ${obj}`))
    
    const resultado = await executarSimulacao(cenario.configuracao)
    
    console.log('\n❓ Perguntas para Análise:')
    cenario.perguntasAnalise.forEach(pergunta => console.log(`  • ${pergunta}`))
    
    return resultado
  }

  const executarTodosCenarios = async (): Promise<Record<string, ResultadoSimulacao>> => {
    const cenarios = criarCenarios()
    const resultados: Record<string, ResultadoSimulacao> = {}

    for (const cenario of cenarios) {
      resultados[cenario.nome] = await executarCenario(cenario)
      
      // Aguardar um pouco entre cenários para melhor visualização
      await new Promise(resolve => setTimeout(resolve, 1000))
    }

    return resultados
  }

  return {
    // Funções principais
    executarSimulacao,
    compararAlgoritmos,
    executarCenario,
    executarTodosCenarios,
    
    // Utilitários
    criarCenarios,
    criarProcessosExemplo,
    gerarRelatorioComparativo,
    
    // Classes
    Processo
  }
}