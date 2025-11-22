<!-- pages/cenarios.vue -->
<template>
  <div class="container mx-auto px-4 py-8">
    <!-- Header -->
    <div class="text-center mb-8">
      <h1 class="text-3xl font-bold text-gray-800 mb-4">
        🎭 Cenários do Trabalho
      </h1>
      <p class="text-lg text-gray-600">
        Execute os 3 cenários específicos definidos no trabalho acadêmico
      </p>
    </div>

    <!-- Controles -->
    <div class="bg-white rounded-lg shadow-lg p-6 mb-8">
      <div class="flex flex-wrap gap-4 items-center justify-between">
        <div class="flex gap-4">
          <button @click="executarTodosCenarios" :disabled="executando"
            class="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg transition-colors">
            {{ executando ? '⏳ Executando...' : '🚀 Executar Todos os Cenários' }}
          </button>

          <button @click="limparResultados" :disabled="!resultados || Object.keys(resultados).length === 0"
            class="bg-gray-600 hover:bg-gray-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg transition-colors">
            🗑️ Limpar Resultados
          </button>
        </div>

        <div class="text-sm text-gray-600">
          <span v-if="tempoExecucao">⏱️ Tempo de execução: {{ tempoExecucao }}ms</span>
        </div>
      </div>
    </div>

    <!-- Lista de Cenários -->
    <div class="grid gap-6 mb-8">
      <div v-for="(cenario, index) in cenarios" :key="cenario.nome"
        class="bg-white rounded-lg shadow-lg overflow-hidden">
        <!-- Header do Cenário -->
        <div class="bg-gradient-to-r from-blue-600 to-green-600 text-white p-6">
          <div class="flex justify-between items-start">
            <div>
              <h3 class="text-xl font-bold mb-2">{{ cenario.nome }}</h3>
              <p class="text-blue-100">{{ cenario.descricao }}</p>
            </div>
            <button @click="executarCenarioSelecionado(cenario)" :disabled="executando"
              class="bg-white/20 hover:bg-white/30 disabled:bg-white/10 text-white px-4 py-2 rounded-lg transition-colors">
              {{ executandoCenario === cenario.nome ? '⏳' : '▶️' }} Executar
            </button>
          </div>
        </div>

        <!-- Configuração do Cenário -->
        <div class="p-6 border-b">
          <div class="grid md:grid-cols-3 gap-4 mb-4">
            <div>
              <span class="text-sm font-medium text-gray-600">Algoritmo:</span>
              <div class="text-lg font-semibold">{{ formatarAlgoritmo(cenario.configuracao.algoritmo) }}</div>
            </div>
            <div>
              <span class="text-sm font-medium text-gray-600">Médicos:</span>
              <div class="text-lg font-semibold">{{ cenario.configuracao.numeroMedicos }}</div>
            </div>
            <div v-if="cenario.configuracao.quantum">
              <span class="text-sm font-medium text-gray-600">Quantum:</span>
              <div class="text-lg font-semibold">{{ cenario.configuracao.quantum }}ms</div>
            </div>
          </div>

          <!-- Processos -->
          <div class="mb-4">
            <h4 class="font-semibold text-gray-800 mb-2">👥 Pacientes ({{ cenario.configuracao.processos.length }}):
            </h4>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
              <div v-for="processo in cenario.configuracao.processos" :key="processo.pid"
                class="bg-gray-50 rounded p-3 text-sm">
                <div class="font-medium">{{ processo.nome }}</div>
                <div class="text-gray-600">
                  Chegada: {{ processo.ingresso }}ms |
                  Duração: {{ processo.duracao }}ms |
                  Prioridade: {{ processo.prioridade }}
                </div>
              </div>
            </div>
          </div>

          <!-- Objetivos -->
          <div class="mb-4">
            <h4 class="font-semibold text-gray-800 mb-2">🎯 Objetivos:</h4>
            <ul class="text-sm text-gray-700">
              <li v-for="objetivo in cenario.objetivos" :key="objetivo" class="mb-1">
                • {{ objetivo }}
              </li>
            </ul>
          </div>

          <!-- Perguntas de Análise -->
          <div>
            <h4 class="font-semibold text-gray-800 mb-2">❓ Perguntas para Análise:</h4>
            <ul class="text-sm text-gray-700">
              <li v-for="pergunta in cenario.perguntasAnalise" :key="pergunta" class="mb-1">
                • {{ pergunta }}
              </li>
            </ul>
          </div>
        </div>

        <!-- Resultado do Cenário -->
        <div v-if="resultados && resultados[cenario.nome]" class="p-6 bg-gray-50">
          <h4 class="font-semibold text-gray-800 mb-4">📊 Resultados:</h4>
          <div class="grid md:grid-cols-4 gap-4 mb-4">
            <div class="bg-white rounded-lg p-4 text-center">
              <div class="text-2xl font-bold text-blue-600">
                {{ Math.round(resultados[cenario.nome].metricas.tempoMedioEspera) }}ms
              </div>
              <div class="text-sm text-gray-600">Tempo Médio de Espera</div>
            </div>
            <div class="bg-white rounded-lg p-4 text-center">
              <div class="text-2xl font-bold text-green-600">
                {{ Math.round(resultados[cenario.nome].metricas.tempoMedioTurnaround) }}ms
              </div>
              <div class="text-sm text-gray-600">Tempo Médio Turnaround</div>
            </div>
            <div class="bg-white rounded-lg p-4 text-center">
              <div class="text-2xl font-bold text-yellow-600">
                {{ resultados[cenario.nome].metricas.numeroTrocasContexto }}
              </div>
              <div class="text-sm text-gray-600">Trocas de Contexto</div>
            </div>
            <div class="bg-white rounded-lg p-4 text-center">
              <div class="text-2xl font-bold text-purple-600">
                {{ resultados[cenario.nome].metricas.utilizacaoMediaCPU.toFixed(1) }}%
              </div>
              <div class="text-sm text-gray-600">Utilização CPU</div>
            </div>
          </div>

          <!-- Timeline de Eventos -->
          <div class="bg-white rounded-lg p-4">
            <h5 class="font-medium text-gray-800 mb-3">📋 Timeline de Eventos:</h5>
            <div class="max-h-64 overflow-y-auto">
              <div v-for="evento in resultados[cenario.nome].eventos.slice(0, 20)"
                :key="`${evento.tempo}-${evento.processo.pid}-${evento.tipo}`"
                class="flex items-center gap-3 py-2 border-b border-gray-100 last:border-b-0">
                <div class="text-xs text-gray-500 w-16">{{ evento.tempo }}ms</div>
                <div class="w-2 h-2 rounded-full" :class="{
                  'bg-green-500': evento.tipo === 'inicio',
                  'bg-red-500': evento.tipo === 'fim',
                  'bg-yellow-500': evento.tipo === 'preempcao',
                  'bg-blue-500': evento.tipo === 'chegada'
                }"></div>
                <div class="text-sm">{{ evento.descricao }}</div>
              </div>
              <div v-if="resultados[cenario.nome].eventos.length > 20" class="text-center py-2 text-gray-500 text-sm">
                ... e mais {{ resultados[cenario.nome].eventos.length - 20 }} eventos
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Console de Saída -->
    <div v-if="consoleOutput.length > 0" class="bg-black text-green-400 rounded-lg p-4 font-mono text-sm">
      <div class="flex justify-between items-center mb-2">
        <h3 class="text-white font-bold">🖥️ Console de Execução</h3>
        <button @click="consoleOutput = []" class="text-gray-400 hover:text-white text-xs">
          Limpar
        </button>
      </div>
      <div class="max-h-96 overflow-y-auto">
        <div v-for="(linha, index) in consoleOutput" :key="index" class="mb-1">
          {{ linha }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useSimuladorHospital } from '~/composables/useSimuladorHospital'
import type { CenarioTeste, ResultadoSimulacao } from '../types/index'

// Configurar meta tags
useHead({
  title: 'Cenários do Trabalho - Hospital Digital',
  meta: [
    { name: 'description', content: 'Execute os cenários específicos do trabalho de escalonamento de processos' }
  ]
})

// Composables
const { executarCenario: executarCenarioComposable, executarTodosCenarios: execTodosCenarios, criarCenarios } = useSimuladorHospital()

// Estado reativo
const executando = ref(false)
const executandoCenario = ref('')
const resultados = ref<Record<string, ResultadoSimulacao> | null>(null)
const consoleOutput = ref<string[]>([])
const tempoExecucao = ref(0)

// Dados
const cenarios = criarCenarios()

// Interceptar console.log para mostrar na interface
const originalConsoleLog = console.log
console.log = (...args: any[]) => {
  consoleOutput.value.push(args.join(' '))
  originalConsoleLog(...args)
}

// Métodos
const executarCenarioSelecionado = async (cenario: CenarioTeste) => {
  if (executando.value) return

  executando.value = true
  executandoCenario.value = cenario.nome
  consoleOutput.value = []

  const inicio = Date.now()

  try {
    const resultado = await executarCenarioComposable(cenario)

    if (!resultados.value) {
      resultados.value = {}
    }
    resultados.value[cenario.nome] = resultado

    tempoExecucao.value = Date.now() - inicio
  } catch (error) {
    console.error('Erro ao executar cenário:', error)
  } finally {
    executando.value = false
    executandoCenario.value = ''
  }
}

const executarTodosCenarios = async () => {
  if (executando.value) return

  executando.value = true
  consoleOutput.value = []

  const inicio = Date.now()

  try {
    resultados.value = await execTodosCenarios()
    tempoExecucao.value = Date.now() - inicio
  } catch (error) {
    console.error('Erro ao executar cenários:', error)
  } finally {
    executando.value = false
  }
}

const limparResultados = () => {
  resultados.value = null
  consoleOutput.value = []
  tempoExecucao.value = 0
}

const formatarAlgoritmo = (algoritmo: string): string => {
  const nomes: Record<string, string> = {
    round_robin: 'Round Robin',
    shortest_job_first: 'Shortest Job First',
    shortest_remaining_time: 'Shortest Remaining Time',
    prioridade: 'Prioridade'
  }
  return nomes[algoritmo] || algoritmo
}

// Limpar interceptação ao sair da página
onUnmounted(() => {
  console.log = originalConsoleLog
})
</script>