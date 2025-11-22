<!-- pages/comparacao.vue -->
<template>
  <div class="container mx-auto px-4 py-8">
    <!-- Header -->
    <div class="text-center mb-8">
      <h1 class="text-3xl font-bold text-gray-800 mb-4">
        📊 Comparação de Algoritmos
      </h1>
      <p class="text-lg text-gray-600">
        Compare todos os algoritmos de escalonamento com os mesmos processos
      </p>
    </div>

    <!-- Configuração da Comparação -->
    <div class="bg-white rounded-lg shadow-lg p-6 mb-8">
      <h2 class="text-xl font-bold text-gray-800 mb-4">⚙️ Configuração da Comparação</h2>

      <div class="grid md:grid-cols-3 gap-6 mb-6">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Número de Médicos (CPUs)
          </label>
          <div class="flex gap-2">
            <button v-for="num in [1, 2, 4]" :key="num" @click="numeroMedicos = num" :class="[
              'flex-1 py-2 px-4 rounded-lg border transition-colors',
              numeroMedicos === num
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            ]">
              {{ num }}
            </button>
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Quantum para Round Robin (ms)
          </label>
          <input v-model.number="quantum" type="number" min="100" max="10000" step="100"
            class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Conjunto de Processos
          </label>
          <select v-model="conjuntoEscolhido"
            class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent">
            <option value="exemplo">Processos Exemplo</option>
            <option value="emergencia">Cenário Emergência</option>
            <option value="lotado">Cenário Lotado</option>
            <option value="moderno">Cenário Moderno</option>
          </select>
        </div>
      </div>

      <div class="flex gap-4">
        <button @click="executarComparacao" :disabled="executando"
          class="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg transition-colors font-medium">
          {{ executando ? '⏳ Comparando...' : '🚀 Executar Comparação' }}
        </button>

        <button @click="limparResultados" :disabled="!resultados || Object.keys(resultados).length === 0"
          class="bg-gray-600 hover:bg-gray-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg transition-colors">
          🗑️ Limpar Resultados
        </button>
      </div>
    </div>

    <!-- Processos Utilizados -->
    <div class="bg-white rounded-lg shadow-lg p-6 mb-8">
      <h3 class="text-lg font-bold text-gray-800 mb-4">👥 Processos Utilizados na Comparação</h3>
      <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
        <div v-for="processo in processosAtivos" :key="processo.pid" class="bg-gray-50 rounded-lg p-3">
          <div class="font-medium text-sm">{{ processo.nome }}</div>
          <div class="text-xs text-gray-600">
            Chegada: {{ processo.ingresso }}ms |
            Duração: {{ processo.duracao }}ms |
            Prioridade: {{ processo.prioridade }}
          </div>
        </div>
      </div>
    </div>

    <!-- Resultados da Comparação -->
    <div v-if="resultados && Object.keys(resultados).length > 0">
      <!-- Tabela Comparativa -->
      <div class="bg-white rounded-lg shadow-lg p-6 mb-8">
        <h3 class="text-lg font-bold text-gray-800 mb-4">📈 Tabela Comparativa</h3>

        <div class="overflow-x-auto">
          <table class="min-w-full">
            <thead>
              <tr class="border-b-2 border-gray-200">
                <th class="text-left py-3 px-4 font-semibold text-gray-700">Algoritmo</th>
                <th class="text-center py-3 px-4 font-semibold text-gray-700">Tempo Médio Espera</th>
                <th class="text-center py-3 px-4 font-semibold text-gray-700">Tempo Médio Turnaround</th>
                <th class="text-center py-3 px-4 font-semibold text-gray-700">Trocas Contexto</th>
                <th class="text-center py-3 px-4 font-semibold text-gray-700">Utilização CPU</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="[algoritmo, resultado] in Object.entries(resultados)" :key="algoritmo"
                class="border-b hover:bg-gray-50">
                <td class="py-3 px-4">
                  <div class="flex items-center gap-2">
                    <span class="text-2xl">{{ obterIconeAlgoritmo(algoritmo) }}</span>
                    <span class="font-medium">{{ formatarNomeAlgoritmo(algoritmo) }}</span>
                  </div>
                </td>
                <td class="text-center py-3 px-4">
                  <span :class="[
                    'px-3 py-1 rounded-full text-sm font-medium',
                    obterClasseMetrica('espera', algoritmo)
                  ]">
                    {{ Math.round(resultado.metricas.tempoMedioEspera) }}ms
                  </span>
                </td>
                <td class="text-center py-3 px-4">
                  <span :class="[
                    'px-3 py-1 rounded-full text-sm font-medium',
                    obterClasseMetrica('turnaround', algoritmo)
                  ]">
                    {{ Math.round(resultado.metricas.tempoMedioTurnaround) }}ms
                  </span>
                </td>
                <td class="text-center py-3 px-4">
                  <span :class="[
                    'px-3 py-1 rounded-full text-sm font-medium',
                    obterClasseMetrica('trocas', algoritmo)
                  ]">
                    {{ resultado.metricas.numeroTrocasContexto }}
                  </span>
                </td>
                <td class="text-center py-3 px-4">
                  <span :class="[
                    'px-3 py-1 rounded-full text-sm font-medium',
                    obterClasseMetrica('cpu', algoritmo)
                  ]">
                    {{ resultado.metricas.utilizacaoMediaCPU.toFixed(1) }}%
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Melhores Desempenhos -->
      <div class="bg-white rounded-lg shadow-lg p-6 mb-8">
        <h3 class="text-lg font-bold text-gray-800 mb-4">🏆 Melhores Desempenhos</h3>

        <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div class="bg-green-50 rounded-lg p-4 text-center">
            <div class="text-2xl mb-2">⏱️</div>
            <div class="text-sm text-gray-600 mb-1">Menor Tempo de Espera</div>
            <div class="font-bold text-green-700">{{ melhorEspera.nome }}</div>
            <div class="text-sm text-green-600">{{ Math.round(melhorEspera.valor) }}ms</div>
          </div>

          <div class="bg-blue-50 rounded-lg p-4 text-center">
            <div class="text-2xl mb-2">🏃</div>
            <div class="text-sm text-gray-600 mb-1">Menor Turnaround</div>
            <div class="font-bold text-blue-700">{{ melhorTurnaround.nome }}</div>
            <div class="text-sm text-blue-600">{{ Math.round(melhorTurnaround.valor) }}ms</div>
          </div>

          <div class="bg-purple-50 rounded-lg p-4 text-center">
            <div class="text-2xl mb-2">💻</div>
            <div class="text-sm text-gray-600 mb-1">Melhor Utilização CPU</div>
            <div class="font-bold text-purple-700">{{ melhorCPU.nome }}</div>
            <div class="text-sm text-purple-600">{{ melhorCPU.valor.toFixed(1) }}%</div>
          </div>

          <div class="bg-yellow-50 rounded-lg p-4 text-center">
            <div class="text-2xl mb-2">🔀</div>
            <div class="text-sm text-gray-600 mb-1">Menos Trocas Contexto</div>
            <div class="font-bold text-yellow-700">{{ menorTrocas.nome }}</div>
            <div class="text-sm text-yellow-600">{{ menorTrocas.valor }}</div>
          </div>
        </div>
      </div>

      <!-- Gráficos Comparativos -->
      <div class="bg-white rounded-lg shadow-lg p-6 mb-8">
        <h3 class="text-lg font-bold text-gray-800 mb-4">📊 Gráficos Comparativos</h3>

        <div class="grid md:grid-cols-2 gap-8">
          <!-- Gráfico de Barras - Tempo de Espera -->
          <div>
            <h4 class="font-medium text-gray-700 mb-3">Tempo Médio de Espera</h4>
            <div class="space-y-2">
              <div v-for="[algoritmo, resultado] in Object.entries(resultados)" :key="`espera-${algoritmo}`"
                class="flex items-center gap-3">
                <div class="w-24 text-sm text-gray-600 truncate">
                  {{ formatarNomeAlgoritmo(algoritmo) }}
                </div>
                <div class="flex-1 bg-gray-200 rounded-full h-6 relative">
                  <div class="bg-blue-500 h-6 rounded-full flex items-center justify-end pr-2"
                    :style="{ width: `${(resultado.metricas.tempoMedioEspera / maxEspera) * 100}%` }">
                    <span class="text-white text-xs font-medium">
                      {{ Math.round(resultado.metricas.tempoMedioEspera) }}ms
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Gráfico de Barras - Utilização CPU -->
          <div>
            <h4 class="font-medium text-gray-700 mb-3">Utilização da CPU</h4>
            <div class="space-y-2">
              <div v-for="[algoritmo, resultado] in Object.entries(resultados)" :key="`cpu-${algoritmo}`"
                class="flex items-center gap-3">
                <div class="w-24 text-sm text-gray-600 truncate">
                  {{ formatarNomeAlgoritmo(algoritmo) }}
                </div>
                <div class="flex-1 bg-gray-200 rounded-full h-6 relative">
                  <div class="bg-green-500 h-6 rounded-full flex items-center justify-end pr-2"
                    :style="{ width: `${resultado.metricas.utilizacaoMediaCPU}%` }">
                    <span class="text-white text-xs font-medium">
                      {{ resultado.metricas.utilizacaoMediaCPU.toFixed(1) }}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Análise Detalhada -->
      <div class="bg-white rounded-lg shadow-lg p-6">
        <h3 class="text-lg font-bold text-gray-800 mb-4">🔍 Análise Detalhada</h3>

        <div class="grid md:grid-cols-2 gap-6">
          <div>
            <h4 class="font-medium text-gray-700 mb-3">📋 Observações</h4>
            <ul class="space-y-2 text-sm text-gray-600">
              <li v-for="observacao in observacoes" :key="observacao" class="flex items-start gap-2">
                <span class="text-blue-500 mt-1">•</span>
                <span>{{ observacao }}</span>
              </li>
            </ul>
          </div>

          <div>
            <h4 class="font-medium text-gray-700 mb-3">💡 Recomendações</h4>
            <ul class="space-y-2 text-sm text-gray-600">
              <li v-for="recomendacao in recomendacoes" :key="recomendacao" class="flex items-start gap-2">
                <span class="text-green-500 mt-1">•</span>
                <span>{{ recomendacao }}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <!-- Estado Vazio -->
    <div v-else class="bg-white rounded-lg shadow-lg p-12 text-center">
      <div class="text-6xl mb-4">📊</div>
      <h3 class="text-xl font-bold text-gray-800 mb-2">Nenhuma comparação executada</h3>
      <p class="text-gray-600 mb-6">Configure os parâmetros acima e execute uma comparação para ver os resultados</p>
      <button @click="executarComparacao" :disabled="executando"
        class="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-8 py-3 rounded-lg transition-colors font-medium">
        {{ executando ? '⏳ Comparando...' : '🚀 Executar Primeira Comparação' }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useSimuladorHospital } from '~/composables/useSimuladorHospital'
import type { IProcesso, ResultadoSimulacao } from '../types/index'

// Meta tags
useHead({
  title: 'Comparação de Algoritmos - Hospital Digital',
  meta: [
    { name: 'description', content: 'Compare todos os algoritmos de escalonamento de processos' }
  ]
})

// Composables
const { compararAlgoritmos, criarProcessosExemplo, criarCenarios } = useSimuladorHospital()

// Estado reativo  
const executando = ref(false)
const numeroMedicos = ref(1)
const quantum = ref(2000)
const conjuntoEscolhido = ref('exemplo')
const resultados = ref<Record<string, ResultadoSimulacao> | null>(null)

// Computed
const processosAtivos = computed(() => {
  switch (conjuntoEscolhido.value) {
    case 'exemplo':
      return criarProcessosExemplo()
    case 'emergencia':
      return criarCenarios()[0].configuracao.processos.map((p, i) => ({ ...p, pid: i + 1 }))
    case 'lotado':
      return criarCenarios()[1].configuracao.processos.map((p, i) => ({ ...p, pid: i + 1 }))
    case 'moderno':
      return criarCenarios()[2].configuracao.processos.map((p, i) => ({ ...p, pid: i + 1 }))
    default:
      return criarProcessosExemplo()
  }
})

const melhorEspera = computed(() => {
  if (!resultados.value) return { nome: '', valor: 0 }

  const entries = Object.entries(resultados.value)
  const melhor = entries.reduce((min, [nome, resultado]) =>
    resultado.metricas.tempoMedioEspera < min.valor
      ? { nome: formatarNomeAlgoritmo(nome), valor: resultado.metricas.tempoMedioEspera }
      : min
    , { nome: '', valor: Infinity })

  return melhor
})

const melhorTurnaround = computed(() => {
  if (!resultados.value) return { nome: '', valor: 0 }

  const entries = Object.entries(resultados.value)
  const melhor = entries.reduce((min, [nome, resultado]) =>
    resultado.metricas.tempoMedioTurnaround < min.valor
      ? { nome: formatarNomeAlgoritmo(nome), valor: resultado.metricas.tempoMedioTurnaround }
      : min
    , { nome: '', valor: Infinity })

  return melhor
})

const melhorCPU = computed(() => {
  if (!resultados.value) return { nome: '', valor: 0 }

  const entries = Object.entries(resultados.value)
  const melhor = entries.reduce((max, [nome, resultado]) =>
    resultado.metricas.utilizacaoMediaCPU > max.valor
      ? { nome: formatarNomeAlgoritmo(nome), valor: resultado.metricas.utilizacaoMediaCPU }
      : max
    , { nome: '', valor: 0 })

  return melhor
})

const menorTrocas = computed(() => {
  if (!resultados.value) return { nome: '', valor: 0 }

  const entries = Object.entries(resultados.value)
  const melhor = entries.reduce((min, [nome, resultado]) =>
    resultado.metricas.numeroTrocasContexto < min.valor
      ? { nome: formatarNomeAlgoritmo(nome), valor: resultado.metricas.numeroTrocasContexto }
      : min
    , { nome: '', valor: Infinity })

  return melhor
})

const maxEspera = computed(() => {
  if (!resultados.value) return 1

  return Math.max(...Object.values(resultados.value).map(r => r.metricas.tempoMedioEspera))
})

const observacoes = computed(() => {
  if (!resultados.value) return []

  const obs = []
  const algoritmos = Object.keys(resultados.value)

  if (algoritmos.includes('shortest_job_first')) {
    obs.push('SJF geralmente apresenta o menor tempo médio de espera para processos curtos')
  }

  if (algoritmos.includes('prioridade')) {
    obs.push('Algoritmo de Prioridade favorece processos críticos, mas pode causar starvation')
  }

  if (algoritmos.includes('round_robin')) {
    obs.push('Round Robin oferece fairness, mas pode ter overhead de trocas de contexto')
  }

  if (numeroMedicos.value > 1) {
    obs.push(`Com ${numeroMedicos.value} médicos, a utilização da CPU tende a ser mais balanceada`)
  }

  return obs
})

const recomendacoes = computed(() => {
  if (!resultados.value) return []

  const rec = []

  if (melhorEspera.value.nome === 'Shortest Job First') {
    rec.push('Use SJF quando souber a duração dos processos antecipadamente')
  }

  if (melhorCPU.value.valor < 80) {
    rec.push('Considere aumentar o número de núcleos para melhor utilização')
  }

  if (numeroMedicos.value === 1) {
    rec.push('Teste com múltiplos núcleos para verificar melhorias no desempenho')
  }

  rec.push('Considere o contexto específico da aplicação ao escolher o algoritmo')

  return rec
})

// Métodos
const executarComparacao = async () => {
  if (executando.value) return

  executando.value = true
  resultados.value = null

  try {
    const processos = processosAtivos.value as IProcesso[]
    resultados.value = await compararAlgoritmos(processos, numeroMedicos.value, quantum.value)
  } catch (error) {
    console.error('Erro na comparação:', error)
    alert('Erro ao executar comparação. Verifique o console para mais detalhes.')
  } finally {
    executando.value = false
  }
}

const limparResultados = () => {
  resultados.value = null
}

const formatarNomeAlgoritmo = (algoritmo: string): string => {
  const nomes: Record<string, string> = {
    round_robin: 'Round Robin',
    shortest_job_first: 'Shortest Job First',
    shortest_remaining_time: 'Shortest Remaining Time',
    prioridade: 'Prioridade'
  }
  return nomes[algoritmo] || algoritmo
}

const obterIconeAlgoritmo = (algoritmo: string): string => {
  const icones: Record<string, string> = {
    round_robin: '🔄',
    shortest_job_first: '⚡',
    shortest_remaining_time: '🔄',
    prioridade: '⭐'
  }
  return icones[algoritmo] || '📊'
}

const obterClasseMetrica = (metrica: string, algoritmo: string): string => {
  if (!resultados.value) return ''

  const valores = Object.values(resultados.value)
  const valorAtual = resultados.value[algoritmo].metricas

  let valor: number
  let isMinMelhor = true

  switch (metrica) {
    case 'espera':
      valor = valorAtual.tempoMedioEspera
      break
    case 'turnaround':
      valor = valorAtual.tempoMedioTurnaround
      break
    case 'trocas':
      valor = valorAtual.numeroTrocasContexto
      break
    case 'cpu':
      valor = valorAtual.utilizacaoMediaCPU
      isMinMelhor = false
      break
    default:
      return ''
  }

  const todosValores = valores.map(r => {
    switch (metrica) {
      case 'espera': return r.metricas.tempoMedioEspera
      case 'turnaround': return r.metricas.tempoMedioTurnaround
      case 'trocas': return r.metricas.numeroTrocasContexto
      case 'cpu': return r.metricas.utilizacaoMediaCPU
      default: return 0
    }
  })

  const melhorValor = isMinMelhor ? Math.min(...todosValores) : Math.max(...todosValores)
  const piorValor = isMinMelhor ? Math.max(...todosValores) : Math.min(...todosValores)

  if (valor === melhorValor) {
    return 'bg-green-100 text-green-800'
  } else if (valor === piorValor) {
    return 'bg-red-100 text-red-800'
  } else {
    return 'bg-yellow-100 text-yellow-800'
  }
}
</script>