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

      <!-- Toggle Modo Tempo Real -->
      <div class="mt-6 flex justify-center">
        <div class="bg-white rounded-lg shadow-lg p-4">
          <label class="flex items-center gap-3 cursor-pointer">
            <span class="text-sm font-medium text-gray-700">Modo Simulação:</span>
            <div class="relative">
              <input v-model="modoTempoReal" type="checkbox" class="sr-only"
                :disabled="executando || estadoTempoReal.executando" />
              <div :class="[
                'w-14 h-7 rounded-full transition-colors duration-200',
                modoTempoReal ? 'bg-red-500' : 'bg-blue-500'
              ]">
                <div :class="[
                  'w-6 h-6 bg-white rounded-full shadow transform transition-transform duration-200 mt-0.5',
                  modoTempoReal ? 'translate-x-7' : 'translate-x-0.5'
                ]"></div>
              </div>
            </div>
            <span :class="[
              'text-sm font-medium',
              modoTempoReal ? 'text-red-600' : 'text-blue-600'
            ]">
              {{ modoTempoReal ? '⚡ Tempo Real' : '🎯 Instantâneo' }}
            </span>
          </label>
        </div>
      </div>
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
              <option value="round_robin">🔄 Round Robin (Preemptivo)</option>
              <option value="shortest_job_first">⚡ Shortest Job First (Não-Preemptivo)</option>
              <option value="shortest_remaining_time">🔄 Shortest Remaining Time First (Preemptivo)</option>
              <option value="prioridade">⭐ Prioridade (Cooperativo)</option>
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

          <!-- Velocidade (só para Tempo Real) -->
          <div v-if="modoTempoReal" class="mb-6">
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Velocidade de Simulação: {{ velocidadeLabel }}
            </label>
            <input v-model.number="velocidadeSimulacao" @input="atualizarVelocidadeTempoReal" type="range" min="100"
              max="3000" step="100" class="w-full" />
            <div class="flex justify-between text-xs text-gray-500 mt-1">
              <span>Rápida</span>
              <span>Lenta</span>
            </div>
          </div>

          <!-- Controles -->
          <div class="space-y-3">
            <!-- Controles Modo Instantâneo -->
            <div v-if="!modoTempoReal">
              <button @click="executarSimulacao" :disabled="executando || processos.length === 0"
                class="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white py-3 px-4 rounded-lg transition-colors font-medium">
                {{ executando ? '⏳ Executando...' : '🚀 Executar Simulação' }}
              </button>
            </div>

            <!-- Controles Modo Tempo Real -->
            <div v-else class="space-y-2">
              <button v-if="!estadoTempoReal.executando" @click="iniciarSimulacaoTempoReal"
                :disabled="processos.length === 0"
                class="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white py-3 px-4 rounded-lg transition-colors font-medium">
                ▶️ Iniciar Tempo Real
              </button>

              <div v-else class="space-y-2">
                <button @click="pausarSimulacaoTempoReal"
                  class="w-full bg-yellow-600 hover:bg-yellow-700 text-white py-2 px-4 rounded-lg transition-colors">
                  {{ estadoTempoReal.pausado ? '▶️ Continuar' : '⏸️ Pausar' }}
                </button>

                <button @click="pararSimulacaoTempoReal"
                  class="w-full bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg transition-colors">
                  ⏹️ Parar
                </button>
              </div>
            </div>

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

        <!-- Status Tempo Real -->
        <div v-if="modoTempoReal && (estadoTempoReal.executando || estadoTempoReal.processosFinalizados.length > 0)"
          class="bg-white rounded-lg shadow-lg p-6">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-bold text-gray-800">⚡ Status em Tempo Real</h3>
            <div class="flex items-center space-x-4 text-sm">
              <span class="bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
                ⏱️ {{ estadoTempoReal.tempoAtual }}ms
              </span>
              <span v-if="estadoTempoReal.executando" class="bg-green-100 text-green-800 px-3 py-1 rounded-full">
                {{ estadoTempoReal.pausado ? '⏸️ Pausado' : '▶️ Executando' }}
              </span>
            </div>
          </div>

          <!-- Métricas em Tempo Real -->
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div class="text-center">
              <div class="text-2xl font-bold text-blue-600">{{ estadoTempoReal.metricas.processosCompletados }}</div>
              <div class="text-sm text-gray-600">Concluídos</div>
            </div>
            <div class="text-center">
              <div class="text-2xl font-bold text-green-600">{{ estadoTempoReal.metricas.tempoMedioEspera.toFixed(0)
              }}ms</div>
              <div class="text-sm text-gray-600">Espera Média</div>
            </div>
            <div class="text-center">
              <div class="text-2xl font-bold text-purple-600">{{
                estadoTempoReal.metricas.tempoMedioTurnaround.toFixed(0) }}ms</div>
              <div class="text-sm text-gray-600">Turnaround Médio</div>
            </div>
            <div class="text-center">
              <div class="text-2xl font-bold text-orange-600">{{ estadoTempoReal.metricas.utilizacaoMediaCPU.toFixed(1)
              }}%</div>
              <div class="text-sm text-gray-600">CPU Utilizada</div>
            </div>
          </div>

          <!-- Filas de Processos -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div>
              <h4 class="font-semibold text-gray-700 mb-2">⏳ Na Fila ({{ estadoTempoReal.processosNaFila.length }})</h4>
              <div class="space-y-2 max-h-32 overflow-y-auto">
                <div v-for="processo in estadoTempoReal.processosNaFila" :key="processo.pid"
                  class="p-2 bg-yellow-50 border border-yellow-200 rounded text-sm">
                  {{ processo.nome }}
                  <div class="text-xs text-gray-600">{{ processo.duracao }}ms restantes</div>
                </div>
              </div>
            </div>

            <div>
              <h4 class="font-semibold text-gray-700 mb-2">⚡ Executando ({{ estadoTempoReal.processosExecutando.length
              }})</h4>
              <div class="space-y-2 max-h-32 overflow-y-auto">
                <div v-for="processo in estadoTempoReal.processosExecutando" :key="processo.pid"
                  class="p-2 bg-blue-50 border border-blue-200 rounded text-sm">
                  {{ processo.nome }}
                  <div class="text-xs text-gray-600">{{ processo.duracao }}ms restantes</div>
                  <div class="w-full bg-gray-200 rounded-full h-1 mt-1">
                    <div class="bg-blue-600 h-1 rounded-full transition-all duration-300"
                      :style="`width: ${((processo.duracaoOriginal - processo.duracao) / processo.duracaoOriginal) * 100}%`">
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h4 class="font-semibold text-gray-700 mb-2">✅ Finalizados ({{ estadoTempoReal.processosFinalizados.length
              }})</h4>
              <div class="space-y-2 max-h-32 overflow-y-auto">
                <div v-for="processo in estadoTempoReal.processosFinalizados" :key="processo.pid"
                  class="p-2 bg-green-50 border border-green-200 rounded text-sm">
                  {{ processo.nome }}
                  <div class="text-xs text-gray-600">
                    T: {{ processo.tempoTurnaround }}ms • E: {{ processo.tempoEspera }}ms
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Gantt em Tempo Real -->
          <div class="mb-4">
            <h4 class="font-semibold text-gray-700 mb-3">📈 Diagrama de Gantt (Tempo Real)</h4>
            <div v-if="estadoTempoReal.diagramaGantt.length > 0" class="space-y-3">
              <div v-for="medico in estadoTempoReal.medicos" :key="medico.id" class="border rounded-lg p-3">
                <div class="font-medium text-gray-700 mb-2">{{ medico.nome }}</div>
                <div class="relative h-8 bg-gray-100 rounded overflow-hidden">
                  <div v-for="bloco in obterBlocosGanttTempoReal(medico.nome)"
                    :key="`${bloco.processo}-${bloco.inicio}`" :style="{
                      left: `${(bloco.inicio / Math.max(estadoTempoReal.tempoAtual, 1)) * 100}%`,
                      width: `${Math.max(((bloco.fim - bloco.inicio) / Math.max(estadoTempoReal.tempoAtual, 1)) * 100, 1)}%`,
                      backgroundColor: bloco.cor
                    }"
                    class="absolute h-full flex items-center justify-center text-xs font-medium text-white shadow-sm transition-all duration-300"
                    :title="`${bloco.processo}: ${bloco.inicio}ms - ${bloco.fim}ms`">
                    {{ bloco.processo.split(' ')[1] || bloco.processo.charAt(0) }}
                  </div>

                  <!-- Indicador de tempo atual -->
                  <div :style="{
                    left: `${(estadoTempoReal.tempoAtual / Math.max(estadoTempoReal.tempoAtual, 1)) * 100}%`
                  }" class="absolute h-full w-0.5 bg-red-500 z-10" title="Tempo atual"></div>
                </div>

                <div class="flex justify-between text-xs text-gray-500 mt-1">
                  <span>0ms</span>
                  <span>{{ estadoTempoReal.tempoAtual }}ms</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Log de Eventos -->
          <div>
            <h4 class="font-semibold text-gray-700 mb-3">📝 Log de Eventos</h4>
            <div class="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm max-h-48 overflow-y-auto">
              <div v-for="evento in eventosRecentesTempoReal"
                :key="`${evento.tempo}-${evento.processo.nome}-${evento.tipo}`" class="mb-1">
                <span class="text-gray-500">[{{ evento.tempo }}ms]</span> {{ evento.mensagem }}
              </div>
              <div v-if="eventosRecentesTempoReal.length === 0" class="text-gray-500 italic">
                Aguardando eventos...
              </div>
            </div>
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
import { useSimulacaoTempoReal } from '~/composables/useSimulacaoTempoReal'
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
const simulacaoTempoReal = useSimulacaoTempoReal()

// Sistema de cores únicas
const coresDisponiveis = [
  '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899',
  '#06B6D4', '#84CC16', '#F97316', '#E11D48', '#7C3AED', '#0891B2',
  '#65A30D', '#DC2626', '#9333EA', '#059669', '#CA8A04', '#BE185D',
  '#0369A1', '#166534', '#92400E', '#991B1B', '#581C87', '#064E3B'
]
const coresUsadas = ref<Set<string>>(new Set())
const mapeamentoCoresProcessos = ref<Map<number, string>>(new Map())

const obterCorUnicaProcesso = (pid: number): string => {
  // Se já temos uma cor para este processo, retorna ela
  if (mapeamentoCoresProcessos.value.has(pid)) {
    return mapeamentoCoresProcessos.value.get(pid)!
  }

  // Procura uma cor não usada
  for (const cor of coresDisponiveis) {
    if (!coresUsadas.value.has(cor)) {
      coresUsadas.value.add(cor)
      mapeamentoCoresProcessos.value.set(pid, cor)
      return cor
    }
  }

  // Se todas as cores foram usadas, usa baseado no PID
  const corFallback = coresDisponiveis[pid % coresDisponiveis.length]
  mapeamentoCoresProcessos.value.set(pid, corFallback)
  return corFallback
}

const limparCoresProcessos = () => {
  coresUsadas.value.clear()
  mapeamentoCoresProcessos.value.clear()
}

// Estado reativo
const executando = ref(false)
const mostrarFormulario = ref(false)
const resultado = ref<ResultadoSimulacao | null>(null)
const modoTempoReal = ref(true)

// Estado do tempo real
const { estado: estadoTempoReal, eventos: eventosTempoReal } = simulacaoTempoReal
const velocidadeSimulacao = ref(1000)

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
  const nomes = [
    '👨 João', '👩 Maria', '👨 José', '👨 Caio', '👩 Talita',
    '👨 Luís', '👨 André', '👩 Suelen', '👩 Ana', '👨 Carlos',
    '👨 Pedro', '👨 Rodolfo', '👨 Tiago', '👨 Paulo'
  ]

  const temposPossiveis = [500, 1000, 1500, 2000, 3000, 4000, 5000]

  // Selecionar aleatoriamente
  const nomeAleatorio = nomes[Math.floor(Math.random() * nomes.length)]
  const duracaoAleatoria = temposPossiveis[Math.floor(Math.random() * temposPossiveis.length)]
  const prioridadeAleatoria = Math.floor(Math.random() * 5) + 1 // 1 a 5
  const ingressoAleatorio = temposPossiveis[Math.floor(Math.random() * temposPossiveis.length)] // 0 a 5000ms

  const processo = new Processo(
    processos.value.length + 1,
    nomeAleatorio,
    ingressoAleatorio,
    duracaoAleatoria,
    prioridadeAleatoria
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

// Métodos para Tempo Real
const iniciarSimulacaoTempoReal = () => {
  // Limpar sistema de cores
  limparCoresProcessos()

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

  simulacaoTempoReal.inicializarSimulacao(config)
  simulacaoTempoReal.definirVelocidade(velocidadeSimulacao.value)
  simulacaoTempoReal.iniciarSimulacao()
}

const pausarSimulacaoTempoReal = () => {
  simulacaoTempoReal.pausarSimulacao()
}

const pararSimulacaoTempoReal = () => {
  simulacaoTempoReal.pararSimulacao()
}

const atualizarVelocidadeTempoReal = () => {
  simulacaoTempoReal.definirVelocidade(velocidadeSimulacao.value)
}

const obterBlocosGanttTempoReal = (medico: string) => {
  return estadoTempoReal.value.diagramaGantt
    .filter(bloco => bloco.medico === medico)
    .sort((a, b) => a.inicio - b.inicio)
}

// Computed properties
const velocidadeLabel = computed(() => {
  if (velocidadeSimulacao.value <= 300) return 'Muito Rápida'
  if (velocidadeSimulacao.value <= 800) return 'Rápida'
  if (velocidadeSimulacao.value <= 1500) return 'Normal'
  if (velocidadeSimulacao.value <= 2500) return 'Lenta'
  return 'Muito Lenta'
})

const eventosRecentesTempoReal = computed(() => {
  return eventosTempoReal.value.slice(-10).reverse()
})

// Adicionar alguns processos exemplo ao inicializar
onMounted(() => {
  adicionarProcessoExemplo()
  adicionarProcessoExemplo()
  adicionarProcessoExemplo()
})
</script>