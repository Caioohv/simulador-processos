<!-- pages/simulacao.vue -->
<template>
  <div class="container mx-auto px-4 py-8">
    <!-- Header -->
    <div class="text-center mb-8">
      <h1 class="text-3xl font-bold text-gray-800 mb-4">
        🔬 Simulação Personalizada
      </h1>
      <p class="text-lg text-gray-600">
        Configure seus próprios pacientes e teste diferentes algoritmos de escalonamento
      </p>
    </div>

    <div class="grid lg:grid-cols-3 gap-8">
      <!-- Painel de Configuração -->
      <div class="lg:col-span-1">
        <div class="bg-white rounded-lg shadow-lg p-6 sticky top-8">
          <h2 class="text-xl font-bold text-gray-800 mb-6">⚙️ Configuração</h2>

          <!-- Algoritmo -->
          <div class="mb-6">
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Algoritmo de Escalonamento
            </label>
            <select v-model="configuracao.algoritmo"
              class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              <option value="round_robin">🔄 Round Robin</option>
              <option value="shortest_job_first">⚡ Shortest Job First</option>
              <option value="shortest_remaining_time">🔄 Shortest Remaining Time</option>
              <option value="prioridade">⭐ Prioridade</option>
            </select>
          </div>

          <!-- Número de Médicos -->
          <div class="mb-6">
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Número de Médicos (CPUs)
            </label>
            <div class="flex gap-2">
              <button v-for="num in [1, 2, 4]" :key="num" @click="configuracao.numeroMedicos = num" :class="[
                'flex-1 py-2 px-4 rounded-lg border transition-colors',
                configuracao.numeroMedicos === num
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              ]">
                {{ num }}
              </button>
            </div>
          </div>

          <!-- Quantum (só para Round Robin) -->
          <div v-if="configuracao.algoritmo === 'round_robin'" class="mb-6">
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Quantum (ms)
            </label>
            <input v-model.number="configuracao.quantum" type="number" min="100" max="10000" step="100"
              class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
          </div>

          <!-- Controles -->
          <div class="space-y-3">
            <button @click="executarSimulacao" :disabled="executando || processos.length === 0"
              class="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white py-3 px-4 rounded-lg transition-colors font-medium mb-2">
              {{ executando ? '⏳ Executando...' : '🚀 Executar Simulação' }}
            </button>

            <button @click="testarSimulacaoSimples"
              class="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg transition-colors">
              🧪 Teste Rápido (Debug)
            </button>

            <button @click="adicionarProcessoExemplo"
              class="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg transition-colors">
              ➕ Adicionar Processo Exemplo
            </button>

            <button @click="limparProcessos" :disabled="processos.length === 0"
              class="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white py-2 px-4 rounded-lg transition-colors">
              🗑️ Limpar Processos
            </button>
          </div>
        </div>
      </div>

      <!-- Painel Principal -->
      <div class="lg:col-span-2 space-y-6">
        <!-- Lista de Processos -->
        <div class="bg-white rounded-lg shadow-lg p-6">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-lg font-bold text-gray-800">👥 Pacientes ({{ processos.length }})</h3>
            <button @click="mostrarFormulario = !mostrarFormulario"
              class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors">
              {{ mostrarFormulario ? 'Ocultar' : 'Novo Paciente' }}
            </button>
          </div>

          <!-- Formulário para Novo Processo -->
          <div v-if="mostrarFormulario" class="bg-gray-50 rounded-lg p-4 mb-4">
            <h4 class="font-medium text-gray-800 mb-3">Adicionar Novo Paciente</h4>
            <div class="grid md:grid-cols-5 gap-3">
              <div>
                <label class="block text-xs font-medium text-gray-600 mb-1">Nome</label>
                <input v-model="novoProcesso.nome" type="text" placeholder="Ex: João"
                  class="w-full border rounded px-2 py-1 text-sm" />
              </div>
              <div>
                <label class="block text-xs font-medium text-gray-600 mb-1">Chegada (ms)</label>
                <input v-model.number="novoProcesso.ingresso" type="number" min="0"
                  class="w-full border rounded px-2 py-1 text-sm" />
              </div>
              <div>
                <label class="block text-xs font-medium text-gray-600 mb-1">Duração (ms)</label>
                <input v-model.number="novoProcesso.duracao" type="number" min="100"
                  class="w-full border rounded px-2 py-1 text-sm" />
              </div>
              <div>
                <label class="block text-xs font-medium text-gray-600 mb-1">Prioridade</label>
                <select v-model.number="novoProcesso.prioridade" class="w-full border rounded px-2 py-1 text-sm">
                  <option value="1">1 (Crítica)</option>
                  <option value="2">2 (Alta)</option>
                  <option value="3">3 (Média)</option>
                  <option value="4">4 (Baixa)</option>
                  <option value="5">5 (Rotina)</option>
                </select>
              </div>
              <div class="flex items-end">
                <button @click="adicionarProcesso" :disabled="!podeAdicionarProcesso"
                  class="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-3 py-1 rounded text-sm transition-colors">
                  Adicionar
                </button>
              </div>
            </div>
          </div>

          <!-- Tabela de Processos -->
          <div v-if="processos.length > 0" class="overflow-x-auto">
            <table class="min-w-full">
              <thead>
                <tr class="border-b">
                  <th class="text-left py-2 text-sm font-medium text-gray-600">Nome</th>
                  <th class="text-left py-2 text-sm font-medium text-gray-600">Chegada</th>
                  <th class="text-left py-2 text-sm font-medium text-gray-600">Duração</th>
                  <th class="text-left py-2 text-sm font-medium text-gray-600">Prioridade</th>
                  <th class="text-left py-2 text-sm font-medium text-gray-600">Ações</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(processo, index) in processos" :key="processo.pid" class="border-b hover:bg-gray-50">
                  <td class="py-2 text-sm">{{ processo.nome }}</td>
                  <td class="py-2 text-sm">{{ processo.ingresso }}ms</td>
                  <td class="py-2 text-sm">{{ processo.duracao }}ms</td>
                  <td class="py-2 text-sm">
                    <span :class="[
                      'px-2 py-1 rounded-full text-xs font-medium',
                      processo.prioridade === 1 ? 'bg-red-100 text-red-800' :
                        processo.prioridade === 2 ? 'bg-orange-100 text-orange-800' :
                          processo.prioridade === 3 ? 'bg-yellow-100 text-yellow-800' :
                            processo.prioridade === 4 ? 'bg-blue-100 text-blue-800' :
                              'bg-gray-100 text-gray-800'
                    ]">
                      P{{ processo.prioridade }}
                    </span>
                  </td>
                  <td class="py-2">
                    <button @click="removerProcesso(index)" class="text-red-600 hover:text-red-800 text-sm">
                      🗑️
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div v-else class="text-center py-8 text-gray-500">
            <div class="text-4xl mb-2">👥</div>
            <p>Nenhum paciente adicionado</p>
            <p class="text-sm">Adicione alguns pacientes para começar a simulação</p>
          </div>
        </div>

        <!-- Resultados da Simulação -->
        <div v-if="resultado" class="bg-white rounded-lg shadow-lg p-6">
          <h3 class="text-lg font-bold text-gray-800 mb-4">📊 Resultados da Simulação</h3>

          <!-- Métricas Principais -->
          <div class="grid md:grid-cols-4 gap-4 mb-6">
            <div class="bg-blue-50 rounded-lg p-4 text-center">
              <div class="text-2xl font-bold text-blue-600">
                {{ Math.round(resultado.metricas.tempoMedioEspera) }}ms
              </div>
              <div class="text-sm text-gray-600">Tempo Médio de Espera</div>
            </div>
            <div class="bg-green-50 rounded-lg p-4 text-center">
              <div class="text-2xl font-bold text-green-600">
                {{ Math.round(resultado.metricas.tempoMedioTurnaround) }}ms
              </div>
              <div class="text-sm text-gray-600">Tempo Médio Turnaround</div>
            </div>
            <div class="bg-yellow-50 rounded-lg p-4 text-center">
              <div class="text-2xl font-bold text-yellow-600">
                {{ resultado.metricas.numeroTrocasContexto }}
              </div>
              <div class="text-sm text-gray-600">Trocas de Contexto</div>
            </div>
            <div class="bg-purple-50 rounded-lg p-4 text-center">
              <div class="text-2xl font-bold text-purple-600">
                {{ resultado.metricas.utilizacaoMediaCPU.toFixed(1) }}%
              </div>
              <div class="text-sm text-gray-600">Utilização CPU</div>
            </div>
          </div>

          <!-- Diagrama de Gantt Simples -->
          <div class="mb-6">
            <h4 class="font-medium text-gray-800 mb-3">📈 Diagrama de Gantt</h4>
            <div class="bg-gray-100 rounded-lg p-4">
              <div v-for="medico in resultado.medicos" :key="medico.id" class="mb-3 last:mb-0">
                <div class="text-sm font-medium text-gray-700 mb-1">{{ medico.nome }}</div>
                <div class="h-8 bg-white rounded border relative overflow-hidden">
                  <div v-for="bloco in obterBlocosGantt(medico.id)" :key="`${bloco.inicio}-${bloco.processo}`" :style="{
                    left: `${(bloco.inicio / resultado.metricas.tempoTotalSimulacao) * 100}%`,
                    width: `${((bloco.fim - bloco.inicio) / resultado.metricas.tempoTotalSimulacao) * 100}%`,
                    backgroundColor: bloco.cor
                  }" class="absolute top-0 h-8 flex items-center justify-center text-xs text-white font-medium"
                    :title="`${bloco.processo}: ${bloco.inicio}ms - ${bloco.fim}ms`">
                    {{ bloco.processo.split(' ')[0] }}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Timeline de Eventos -->
          <div>
            <h4 class="font-medium text-gray-800 mb-3">📋 Timeline de Eventos</h4>
            <div class="max-h-64 overflow-y-auto bg-gray-50 rounded-lg p-3">
              <div v-for="evento in resultado.eventos.slice(0, 50)"
                :key="`${evento.tempo}-${evento.processo.pid}-${evento.tipo}`"
                class="flex items-center gap-3 py-1 text-sm">
                <div class="text-xs text-gray-500 w-16">{{ evento.tempo }}ms</div>
                <div class="w-2 h-2 rounded-full" :class="{
                  'bg-green-500': evento.tipo === 'inicio',
                  'bg-red-500': evento.tipo === 'fim',
                  'bg-yellow-500': evento.tipo === 'preempcao',
                  'bg-blue-500': evento.tipo === 'chegada'
                }"></div>
                <div class="flex-1">{{ evento.descricao }}</div>
              </div>
              <div v-if="resultado.eventos.length > 50" class="text-center py-2 text-gray-500 text-xs">
                ... e mais {{ resultado.eventos.length - 50 }} eventos
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useSimuladorHospital } from '~/composables/useSimuladorHospital'
import type { ConfiguracaoSimulacao, IProcesso, ResultadoSimulacao } from '../types/index'
import { AlgoritmoEscalonamento } from '../types/index'

// Meta tags
useHead({
  title: 'Simulação Personalizada - Hospital Digital',
  meta: [
    { name: 'description', content: 'Configure e execute simulações personalizadas de escalonamento de processos' }
  ]
})

// Composables
const { executarSimulacao: executarSimulacaoComposable, Processo } = useSimuladorHospital()
const { testarRoundRobin } = useTestSimulacao()

// Estado reativo
const executando = ref(false)
const mostrarFormulario = ref(false)
const resultado = ref<ResultadoSimulacao | null>(null)

// Configuração da simulação
const configuracao = ref<ConfiguracaoSimulacao>({
  algoritmo: 'round_robin' as AlgoritmoEscalonamento,
  numeroMedicos: 1,
  quantum: 2000,
  processos: []
})

// Lista de processos
const processos = ref<IProcesso[]>([])

// Novo processo
const novoProcesso = ref({
  nome: '',
  ingresso: 0,
  duracao: 1000,
  prioridade: 3
})

// Computed
const podeAdicionarProcesso = computed(() => {
  return novoProcesso.value.nome.trim() !== '' &&
    novoProcesso.value.duracao > 0
})

// Métodos
const adicionarProcesso = () => {
  if (!podeAdicionarProcesso.value) return

  const processo = new Processo(
    processos.value.length + 1,
    novoProcesso.value.nome.trim(),
    novoProcesso.value.ingresso,
    novoProcesso.value.duracao,
    novoProcesso.value.prioridade
  )

  processos.value.push(processo)

  // Limpar formulário
  novoProcesso.value = {
    nome: '',
    ingresso: 0,
    duracao: 1000,
    prioridade: 3
  }
}

const adicionarProcessoExemplo = () => {
  const exemplos = [
    { nome: '👴 João', ingresso: 0, duracao: 3000, prioridade: 3 },
    { nome: '🤰 Maria', ingresso: 500, duracao: 2000, prioridade: 1 },
    { nome: '👶 Ana', ingresso: 1000, duracao: 4000, prioridade: 2 },
    { nome: '👨 Pedro', ingresso: 2000, duracao: 1500, prioridade: 4 },
    { nome: '🚑 Carlos', ingresso: 3000, duracao: 1000, prioridade: 1 }
  ]

  const exemplo = exemplos[Math.floor(Math.random() * exemplos.length)]
  const processo = new Processo(
    processos.value.length + 1,
    exemplo.nome,
    exemplo.ingresso,
    exemplo.duracao,
    exemplo.prioridade
  )

  processos.value.push(processo)
}

const removerProcesso = (index: number) => {
  processos.value.splice(index, 1)
}

const limparProcessos = () => {
  processos.value = []
  resultado.value = null
}

const executarSimulacao = async () => {
  if (executando.value || processos.value.length === 0) return

  executando.value = true
  resultado.value = null

  try {
    // Preparar configuração
    const config: ConfiguracaoSimulacao = {
      ...configuracao.value,
      processos: processos.value.map(p => ({
        pid: p.pid,
        nome: p.nome,
        ingresso: p.ingresso,
        duracao: p.duracaoOriginal,
        prioridade: p.prioridade
      }))
    }

    resultado.value = await executarSimulacaoComposable(config)
  } catch (error) {
    console.error('Erro na simulação:', error)
    alert('Erro ao executar simulação. Verifique o console para mais detalhes.')
  } finally {
    executando.value = false
  }
}

const testarSimulacaoSimples = async () => {
  console.log('🧪 Executando teste rápido...')
  const resultado = await testarRoundRobin()
  console.log('📊 Resultado do teste:', resultado)
  alert(`Teste concluído! Turnaround médio: ${resultado.metricas.tempoMedioTurnaround}ms, Espera média: ${resultado.metricas.tempoMedioEspera}ms`)
}

const obterBlocosGantt = (medicoId: string) => {
  if (!resultado.value) return []

  return resultado.value.diagramaGantt
    .filter(bloco => bloco.medico.includes(medicoId.split('-')[1]) || bloco.medico === medicoId)
    .sort((a, b) => a.inicio - b.inicio)
}

// Adicionar alguns processos exemplo ao inicializar
onMounted(() => {
  adicionarProcessoExemplo()
  adicionarProcessoExemplo()
  adicionarProcessoExemplo()
})
</script>