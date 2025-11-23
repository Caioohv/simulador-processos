<!-- pages/tempo-real.vue -->
<template>
  <div class="container mx-auto px-4 py-8">
    <!-- Header -->
    <div class="text-center mb-8">
      <h1 class="text-3xl font-bold text-gray-800 mb-4">
        ⚡ Simulação em Tempo Real
      </h1>
      <p class="text-lg text-gray-600">
        Observe os algoritmos de escalonamento executando ao vivo
      </p>
    </div>

    <div class="grid lg:grid-cols-4 gap-6">
      <!-- Painel de Controle -->
      <div class="lg:col-span-1">
        <div class="bg-white rounded-lg shadow-lg p-6 sticky top-8">
          <h2 class="text-xl font-bold text-gray-800 mb-6">🎮 Controles</h2>
          
          <!-- Algoritmo -->
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Algoritmo
            </label>
            <select 
              v-model="configuracao.algoritmo" 
              :disabled="estado.executando"
              class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
            >
              <option value="round_robin">🔄 Round Robin</option>
              <option value="shortest_job_first">⚡ Shortest Job First</option>
              <option value="shortest_remaining_time">🔄 Shortest Remaining Time</option>
              <option value="prioridade">⭐ Prioridade</option>
            </select>
          </div>

          <!-- Número de Médicos -->
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Médicos (CPUs)
            </label>
            <div class="flex gap-1">
              <button
                v-for="num in [1, 2, 4]"
                :key="num"
                @click="configuracao.numeroMedicos = num"
                :disabled="estado.executando"
                :class="[
                  'flex-1 py-2 px-3 rounded border text-sm transition-colors',
                  configuracao.numeroMedicos === num
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50',
                  estado.executando && 'opacity-50 cursor-not-allowed'
                ]"
              >
                {{ num }}
              </button>
            </div>
          </div>

          <!-- Quantum (apenas para Round Robin) -->
          <div v-if="configuracao.algoritmo === 'round_robin'" class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Quantum: {{ configuracao.quantum }}ms
            </label>
            <input
              v-model.number="configuracao.quantum"
              :disabled="estado.executando"
              type="range"
              min="500"
              max="5000"
              step="500"
              class="w-full disabled:opacity-50"
            />
          </div>

          <!-- Velocidade -->
          <div class="mb-6">
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Velocidade: {{ velocidadeLabel }}
            </label>
            <input
              v-model.number="velocidade"
              @input="atualizarVelocidade"
              type="range"
              min="100"
              max="3000"
              step="100"
              class="w-full"
            />
          </div>

          <!-- Botões de Controle -->
          <div class="space-y-3">
            <button
              v-if="!estado.executando"
              @click="iniciarSimulacao"
              :disabled="processos.length === 0"
              class="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white py-3 px-4 rounded-lg transition-colors font-medium"
            >
              ▶️ Iniciar Simulação
            </button>
            
            <div v-else class="space-y-2">
              <button
                @click="pausarSimulacao"
                class="w-full bg-yellow-600 hover:bg-yellow-700 text-white py-2 px-4 rounded-lg transition-colors"
              >
                {{ estado.pausado ? '▶️ Continuar' : '⏸️ Pausar' }}
              </button>
              
              <button
                @click="pararSimulacao"
                class="w-full bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg transition-colors"
              >
                ⏹️ Parar
              </button>
            </div>

            <button
              v-if="!estado.executando"
              @click="carregarExemplo"
              class="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors"
            >
              📝 Carregar Exemplo
            </button>
          </div>
        </div>
      </div>

      <!-- Área Principal -->
      <div class="lg:col-span-3 space-y-6">
        <!-- Status da Simulação -->
        <div class="bg-white rounded-lg shadow-lg p-6">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-bold text-gray-800">📊 Status da Simulação</h3>
            <div class="flex items-center space-x-4 text-sm">
              <span class="bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
                ⏱️ Tempo: {{ estado.tempoAtual }}ms
              </span>
              <span v-if="estado.executando" class="bg-green-100 text-green-800 px-3 py-1 rounded-full">
                {{ estado.pausado ? '⏸️ Pausado' : '▶️ Executando' }}
              </span>
            </div>
          </div>

          <!-- Métricas em Tempo Real -->
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div class="text-center">
              <div class="text-2xl font-bold text-blue-600">{{ estado.metricas.processosCompletados }}</div>
              <div class="text-sm text-gray-600">Concluídos</div>
            </div>
            <div class="text-center">
              <div class="text-2xl font-bold text-green-600">{{ estado.metricas.tempoMedioEspera.toFixed(0) }}ms</div>
              <div class="text-sm text-gray-600">Espera Média</div>
            </div>
            <div class="text-center">
              <div class="text-2xl font-bold text-purple-600">{{ estado.metricas.tempoMedioTurnaround.toFixed(0) }}ms</div>
              <div class="text-sm text-gray-600">Turnaround Médio</div>
            </div>
            <div class="text-center">
              <div class="text-2xl font-bold text-orange-600">{{ estado.metricas.utilizacaoMediaCPU.toFixed(1) }}%</div>
              <div class="text-sm text-gray-600">CPU Utilizada</div>
            </div>
          </div>

          <!-- Status dos Médicos -->
          <div class="border-t pt-4">
            <h4 class="font-semibold text-gray-700 mb-3">👨‍⚕️ Status dos Médicos</h4>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div
                v-for="medico in estado.medicos"
                :key="medico.id"
                :class="[
                  'p-3 rounded-lg border',
                  medico.ocupado ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'
                ]"
              >
                <div class="flex items-center justify-between">
                  <span class="font-medium">{{ medico.nome }}</span>
                  <span :class="medico.ocupado ? 'text-red-600' : 'text-green-600'">
                    {{ medico.ocupado ? '🔴 Ocupado' : '🟢 Livre' }}
                  </span>
                </div>
                <div v-if="medico.processoAtual" class="text-sm text-gray-600 mt-1">
                  Atendendo: {{ medico.processoAtual.nome }}
                  <div class="w-full bg-gray-200 rounded-full h-2 mt-1">
                    <div 
                      class="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      :style="`width: ${((medico.processoAtual.duracaoOriginal - medico.processoAtual.duracao) / medico.processoAtual.duracaoOriginal) * 100}%`"
                    ></div>
                  </div>
                  <span class="text-xs">{{ medico.processoAtual.duracao }}ms restantes</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Filas de Processos -->
        <div class="bg-white rounded-lg shadow-lg p-6">
          <h3 class="text-lg font-bold text-gray-800 mb-4">📋 Filas de Processos</h3>
          
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <!-- Fila de Espera -->
            <div>
              <h4 class="font-semibold text-gray-700 mb-2">⏳ Na Fila ({{ estado.processosNaFila.length }})</h4>
              <div class="space-y-2 max-h-40 overflow-y-auto">
                <div
                  v-for="processo in estado.processosNaFila"
                  :key="processo.pid"
                  class="p-2 bg-yellow-50 border border-yellow-200 rounded text-sm"
                >
                  {{ processo.nome }}
                  <div class="text-xs text-gray-600">{{ processo.duracao }}ms • Prioridade {{ processo.prioridade }}</div>
                </div>
                <div v-if="estado.processosNaFila.length === 0" class="text-gray-500 text-sm italic">
                  Nenhum processo na fila
                </div>
              </div>
            </div>

            <!-- Executando -->
            <div>
              <h4 class="font-semibold text-gray-700 mb-2">⚡ Executando ({{ estado.processosExecutando.length }})</h4>
              <div class="space-y-2 max-h-40 overflow-y-auto">
                <div
                  v-for="processo in estado.processosExecutando"
                  :key="processo.pid"
                  class="p-2 bg-blue-50 border border-blue-200 rounded text-sm"
                >
                  {{ processo.nome }}
                  <div class="text-xs text-gray-600">{{ processo.duracao }}ms restantes</div>
                  <div class="w-full bg-gray-200 rounded-full h-1 mt-1">
                    <div 
                      class="bg-blue-600 h-1 rounded-full transition-all duration-300"
                      :style="`width: ${((processo.duracaoOriginal - processo.duracao) / processo.duracaoOriginal) * 100}%`"
                    ></div>
                  </div>
                </div>
                <div v-if="estado.processosExecutando.length === 0" class="text-gray-500 text-sm italic">
                  Nenhum processo executando
                </div>
              </div>
            </div>

            <!-- Finalizados -->
            <div>
              <h4 class="font-semibold text-gray-700 mb-2">✅ Finalizados ({{ estado.processosFinalizados.length }})</h4>
              <div class="space-y-2 max-h-40 overflow-y-auto">
                <div
                  v-for="processo in estado.processosFinalizados"
                  :key="processo.pid"
                  class="p-2 bg-green-50 border border-green-200 rounded text-sm"
                >
                  {{ processo.nome }}
                  <div class="text-xs text-gray-600">
                    Turnaround: {{ processo.tempoTurnaround }}ms • Espera: {{ processo.tempoEspera }}ms
                  </div>
                </div>
                <div v-if="estado.processosFinalizados.length === 0" class="text-gray-500 text-sm italic">
                  Nenhum processo finalizado
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Diagrama de Gantt em Tempo Real -->
        <div class="bg-white rounded-lg shadow-lg p-6">
          <h3 class="text-lg font-bold text-gray-800 mb-4">📈 Diagrama de Gantt (Tempo Real)</h3>
          
          <div v-if="estado.diagramaGantt.length > 0" class="space-y-3">
            <div
              v-for="medico in estado.medicos"
              :key="medico.id"
              class="border rounded-lg p-3"
            >
              <div class="font-medium text-gray-700 mb-2">{{ medico.nome }}</div>
              <div class="relative h-8 bg-gray-100 rounded overflow-hidden">
                <div
                  v-for="bloco in obterBlocosGantt(medico.nome)"
                  :key="`${bloco.processo}-${bloco.inicio}`"
                  :style="{
                    left: `${(bloco.inicio / Math.max(estado.tempoAtual, 1)) * 100}%`,
                    width: `${Math.max(((bloco.fim - bloco.inicio) / Math.max(estado.tempoAtual, 1)) * 100, 1)}%`,
                    backgroundColor: bloco.cor
                  }"
                  class="absolute h-full flex items-center justify-center text-xs font-medium text-white shadow-sm transition-all duration-300"
                  :title="`${bloco.processo}: ${bloco.inicio}ms - ${bloco.fim}ms`"
                >
                  {{ bloco.processo.split(' ')[1] || bloco.processo.charAt(0) }}
                </div>
                
                <!-- Indicador de tempo atual -->
                <div
                  :style="{
                    left: `${(estado.tempoAtual / Math.max(estado.tempoAtual, 1)) * 100}%`
                  }"
                  class="absolute h-full w-0.5 bg-red-500 z-10"
                  title="Tempo atual"
                ></div>
              </div>
              
              <!-- Escala de tempo -->
              <div class="flex justify-between text-xs text-gray-500 mt-1">
                <span>0ms</span>
                <span>{{ estado.tempoAtual }}ms</span>
              </div>
            </div>
          </div>
          
          <div v-else class="text-center text-gray-500 py-8">
            📊 O diagrama de Gantt aparecerá aqui durante a execução
          </div>
        </div>

        <!-- Log de Eventos -->
        <div class="bg-white rounded-lg shadow-lg p-6">
          <h3 class="text-lg font-bold text-gray-800 mb-4">📝 Log de Eventos</h3>
          
          <div class="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm max-h-64 overflow-y-auto">
            <div
              v-for="evento in eventosRecentes"
              :key="`${evento.tempo}-${evento.processo.nome}-${evento.tipo}`"
              class="mb-1 animate-pulse"
            >
              <span class="text-gray-500">[{{ evento.tempo }}ms]</span> {{ evento.mensagem }}
            </div>
            <div v-if="eventosRecentes.length === 0" class="text-gray-500 italic">
              Aguardando início da simulação...
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useProcesso } from '~/composables/useProcesso'
import { useSimulacaoTempoReal } from '~/composables/useSimulacaoTempoReal'
import type { ConfiguracaoSimulacao } from '../types/index'
import { AlgoritmoEscalonamento } from '../types/index'

// Meta da página
useHead({
  title: 'Simulação em Tempo Real - Algoritmos de Escalonamento'
})

// Composables
const simulacao = useSimulacaoTempoReal()
const { Processo } = useProcesso()

// Estado reativo
const { estado, eventos } = simulacao

// Configuração da simulação
const configuracao = ref<ConfiguracaoSimulacao>({
  algoritmo: AlgoritmoEscalonamento.ROUND_ROBIN,
  numeroMedicos: 1,
  quantum: 2000,
  processos: []
})

// Velocidade da simulação
const velocidade = ref(1000)

// Processos exemplo
const processos = ref([
  { pid: 1, nome: '👴 João', ingresso: 0, duracao: 5000, prioridade: 3 },
  { pid: 2, nome: '🤰 Maria', ingresso: 1000, duracao: 3000, prioridade: 1 },
  { pid: 3, nome: '👶 Ana', ingresso: 2000, duracao: 4000, prioridade: 2 },
  { pid: 4, nome: '👨 Pedro', ingresso: 3000, duracao: 2000, prioridade: 4 },
])

// Computed
const velocidadeLabel = computed(() => {
  if (velocidade.value <= 300) return 'Muito Rápida'
  if (velocidade.value <= 800) return 'Rápida'
  if (velocidade.value <= 1500) return 'Normal'
  if (velocidade.value <= 2500) return 'Lenta'
  return 'Muito Lenta'
})

const eventosRecentes = computed(() => {
  return eventos.value.slice(-10).reverse() // Últimos 10 eventos, mais recente primeiro
})

// Métodos
const iniciarSimulacao = () => {
  configuracao.value.processos = processos.value
  simulacao.inicializarSimulacao(configuracao.value)
  simulacao.definirVelocidade(velocidade.value)
  simulacao.iniciarSimulacao()
}

const pausarSimulacao = () => {
  simulacao.pausarSimulacao()
}

const pararSimulacao = () => {
  simulacao.pararSimulacao()
}

const atualizarVelocidade = () => {
  simulacao.definirVelocidade(velocidade.value)
}

const carregarExemplo = () => {
  processos.value = [
    { pid: 1, nome: '🚑 Emergência', ingresso: 0, duracao: 3000, prioridade: 1 },
    { pid: 2, nome: '👴 João', ingresso: 500, duracao: 5000, prioridade: 3 },
    { pid: 3, nome: '🤰 Maria', ingresso: 1000, duracao: 2000, prioridade: 1 },
    { pid: 4, nome: '👶 Ana', ingresso: 2000, duracao: 4000, prioridade: 2 },
    { pid: 5, nome: '👨 Pedro', ingresso: 4000, duracao: 2500, prioridade: 4 },
  ]
}

const obterBlocosGantt = (medico: string) => {
  return estado.value.diagramaGantt
    .filter(bloco => bloco.medico === medico)
    .sort((a, b) => a.inicio - b.inicio)
}

// Inicializar com exemplo
onMounted(() => {
  carregarExemplo()
})
</script>

<style scoped>
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
</style>