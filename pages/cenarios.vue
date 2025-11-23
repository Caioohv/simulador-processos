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

    <!-- Controles -->
    <div class="bg-white rounded-lg shadow-lg p-6 mb-8">
      <div class="flex flex-wrap gap-4 items-center justify-between">
        <div class="flex gap-4">
          <button @click="executarTodosCenarios" :disabled="executando || estadoTempoReal.executando || executandoSequencia"
            class="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg transition-colors">
            {{ executando ? '⏳ Executando...' : 
               executandoSequencia ? '📈 Executando Sequencialmente...' :
               modoTempoReal ? '🎬 Executar Cenários Sequencialmente' : '🚀 Executar Todos os Cenários' }}
          </button>

          <button @click="limparResultados" :disabled="(!resultados || Object.keys(resultados).length === 0) && Object.keys(resultadosSequenciais).length === 0 && !estadoTempoReal.executando"
            class="bg-gray-600 hover:bg-gray-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg transition-colors">
            🗑️ {{ Object.keys(resultadosSequenciais).length > 0 ? 'Limpar Histórico' : 'Limpar Resultados' }}
          </button>
        </div>

        <!-- Controles Tempo Real -->
        <div v-if="modoTempoReal && (estadoTempoReal.executando || executandoSequencia)" class="flex gap-2 items-center">
          <button v-if="estadoTempoReal.executando" @click="pausarSimulacaoTempoReal"
            class="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg transition-colors">
            {{ estadoTempoReal.pausado ? '▶️ Continuar' : '⏸️ Pausar' }}
          </button>
          <button @click="pararExecucaoSequencial"
            class="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors">
            ⏹️ {{ executandoSequencia ? 'Parar Sequência' : 'Parar' }}
          </button>
          <div v-if="Object.keys(resultadosSequenciais).length > 0" class="text-xs text-gray-500 ml-2">
            📋 {{ Object.keys(resultadosSequenciais).length }} cenário(s) no histórico
          </div>
        </div>

        <div class="text-sm text-gray-600">
          <span v-if="tempoExecucao && !modoTempoReal">⏱️ Tempo de execução: {{ tempoExecucao }}ms</span>
          <span v-if="modoTempoReal && estadoTempoReal.executando" class="flex items-center gap-2">
            <span class="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
            Tempo: {{ estadoTempoReal.tempoAtual }}ms
          </span>
          <span v-if="executandoSequencia && !estadoTempoReal.executando" class="flex items-center gap-2">
            <span class="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
            Preparando cenário {{ cenarioAtualIndex + 1 }}...
          </span>
        </div>
      </div>

      <!-- Controle de Velocidade Tempo Real -->
      <div v-if="modoTempoReal" class="mt-4 pt-4 border-t">
        <div class="flex items-center gap-4">
          <label class="text-sm font-medium text-gray-700">Velocidade:</label>
          <input v-model="velocidadeSimulacao" @input="atualizarVelocidadeTempoReal" type="range" min="100" max="2000" step="100"
            class="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer">
          <span class="text-sm text-gray-600 w-20">{{ velocidadeLabel }}</span>
        </div>
      </div>
    </div>

    <!-- Progress Bar Global e Histórico -->
    <div v-if="modoTempoReal && (executandoSequencia || Object.keys(resultadosSequenciais).length > 0)" class="bg-white rounded-lg shadow-lg p-4 mb-8">
      <div class="flex justify-between items-center text-sm text-gray-600 mb-2">
        <span v-if="executandoSequencia">🎬 Execução Sequencial em Progresso</span>
        <span v-else-if="Object.keys(resultadosSequenciais).length === cenarios.length">✅ Todos os Cenários Concluídos</span>
        <span v-else>📋 Histórico de Execuções</span>
        <span>{{ Object.keys(resultadosSequenciais).length }} / {{ cenarios.length }} concluídos</span>
      </div>
      <div class="w-full bg-gray-200 rounded-full h-2">
        <div :class="[
          'h-2 rounded-full transition-all duration-300',
          Object.keys(resultadosSequenciais).length === cenarios.length ? 'bg-green-600' : 'bg-blue-600'
        ]" :style="{ width: `${(Object.keys(resultadosSequenciais).length / cenarios.length) * 100}%` }"></div>
      </div>
      
      <!-- Lista de Cenários Concluídos -->
      <div v-if="Object.keys(resultadosSequenciais).length > 0" class="mt-3">
        <div class="flex flex-wrap gap-2">
          <div v-for="nomeCenario in Object.keys(resultadosSequenciais)" :key="nomeCenario"
               class="flex items-center gap-1 bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
            <div class="w-3 h-3 bg-green-500 rounded-full"></div>
            {{ nomeCenario.split(' ')[1] || nomeCenario }}
            <span class="text-green-600">{{ resultadosSequenciais[nomeCenario].metricas.tempoTotalSimulacao }}ms</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Cenários Individuais -->
    <div class="space-y-8 mb-8">
      <div v-for="(cenario, index) in cenarios" :key="cenario.nome"
        class="bg-white rounded-lg shadow-lg overflow-hidden">
        <!-- Header do Cenário -->
        <div class="bg-gradient-to-r from-blue-600 to-green-600 text-white p-6">
          <div class="flex justify-between items-start">
            <div class="flex-1">
              <div class="flex items-center gap-3 mb-2">
                <div :class="[
                  'w-8 h-8 rounded-full flex items-center justify-center text-white font-bold',
                  resultadosSequenciais[cenario.nome] ? 'bg-green-500' : 
                  (executandoCenario === cenario.nome || (cenarioAtualIndex === index && estadoTempoReal.executando)) ? 'bg-yellow-500 animate-pulse' :
                  'bg-white/20'
                ]">
                  {{ index + 1 }}
                </div>
                <h3 class="text-xl font-bold">{{ cenario.nome }}</h3>
                <div v-if="resultadosSequenciais[cenario.nome]" 
                     class="bg-green-500 text-xs px-2 py-1 rounded-full">
                  ✅ Concluído
                </div>
                <div v-else-if="executandoCenario === cenario.nome || (cenarioAtualIndex === index && estadoTempoReal.executando)" 
                     class="bg-yellow-500 text-xs px-2 py-1 rounded-full animate-pulse">
                  ⚡ Executando
                </div>
              </div>
              <p class="text-blue-100">{{ cenario.descricao }}</p>
            </div>
            <button @click="executarCenarioSelecionado(cenario)" :disabled="executando || estadoTempoReal.executando || executandoSequencia"
              class="bg-white/20 hover:bg-white/30 disabled:bg-white/10 text-white px-4 py-2 rounded-lg transition-colors ml-4">
              {{ (executandoCenario === cenario.nome || (cenarioAtualIndex === index && estadoTempoReal.executando)) ? '⏳' : '▶️' }} Executar
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

        <!-- Execução em Tempo Real -->
        <div v-if="modoTempoReal && (cenarioAtualIndex === index && estadoTempoReal.executando)" class="p-6 border-b bg-blue-50">
          <h4 class="font-semibold text-gray-800 mb-4">⚡ Execução em Tempo Real</h4>
          
          <!-- Status -->
          <div class="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
            <div class="bg-white rounded-lg p-3 text-center shadow-sm">
              <div class="text-lg font-bold text-blue-600">{{ estadoTempoReal.processosNaFila.length }}</div>
              <div class="text-xs text-gray-600">Na Fila</div>
            </div>
            <div class="bg-white rounded-lg p-3 text-center shadow-sm">
              <div class="text-lg font-bold text-green-600">{{ estadoTempoReal.processosExecutando.length }}</div>
              <div class="text-xs text-gray-600">Executando</div>
            </div>
            <div class="bg-white rounded-lg p-3 text-center shadow-sm">
              <div class="text-lg font-bold text-purple-600">{{ estadoTempoReal.processosFinalizados.length }}</div>
              <div class="text-xs text-gray-600">Finalizados</div>
            </div>
            <div class="bg-white rounded-lg p-3 text-center shadow-sm">
              <div class="text-lg font-bold text-orange-600">{{ estadoTempoReal.metricas.numeroTrocasContexto }}</div>
              <div class="text-xs text-gray-600">Trocas</div>
            </div>
            <div class="bg-white rounded-lg p-3 text-center shadow-sm">
              <div class="text-lg font-bold text-red-600">{{ estadoTempoReal.tempoAtual }}ms</div>
              <div class="text-xs text-gray-600">Tempo</div>
            </div>
          </div>

          <!-- Filas de Processos -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <h5 class="font-semibold text-gray-700 mb-2">⏳ Na Fila ({{ estadoTempoReal.processosNaFila.length }})</h5>
              <div class="space-y-2 max-h-32 overflow-y-auto">
                <div v-for="processo in estadoTempoReal.processosNaFila" :key="processo.pid"
                  class="p-2 bg-yellow-50 border border-yellow-200 rounded text-sm">
                  {{ processo.nome }}
                  <div class="text-xs text-gray-600">{{ processo.duracao }}ms restantes</div>
                </div>
                <div v-if="estadoTempoReal.processosNaFila.length === 0" class="text-center text-gray-500 text-sm py-4">
                  Fila vazia
                </div>
              </div>
            </div>

            <div>
              <h5 class="font-semibold text-gray-700 mb-2">⚡ Executando ({{ estadoTempoReal.processosExecutando.length }})</h5>
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
                <div v-if="estadoTempoReal.processosExecutando.length === 0" class="text-center text-gray-500 text-sm py-4">
                  Nenhum executando
                </div>
              </div>
            </div>

            <div>
              <h5 class="font-semibold text-gray-700 mb-2">✅ Finalizados ({{ estadoTempoReal.processosFinalizados.length }})</h5>
              <div class="space-y-2 max-h-32 overflow-y-auto">
                <div v-for="processo in estadoTempoReal.processosFinalizados" :key="processo.pid"
                  class="p-2 bg-green-50 border border-green-200 rounded text-sm">
                  {{ processo.nome }}
                  <div class="text-xs text-gray-600">
                    T: {{ processo.tempoTurnaround }}ms • E: {{ processo.tempoEspera }}ms
                  </div>
                </div>
                <div v-if="estadoTempoReal.processosFinalizados.length === 0" class="text-center text-gray-500 text-sm py-4">
                  Nenhum finalizado
                </div>
              </div>
            </div>
          </div>

          <!-- Gantt em Tempo Real -->
          <div class="bg-white rounded-lg p-4 shadow-sm">
            <h5 class="font-medium text-gray-800 mb-3">📊 Diagrama de Gantt</h5>
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
            <div v-else class="text-center text-gray-500 py-4">
              Aguardando início da simulação...
            </div>
          </div>

          <!-- Log de Eventos em Tempo Real -->
          <div class="bg-white rounded-lg p-4 shadow-sm mt-4">
            <h5 class="font-medium text-gray-800 mb-3">📝 Log de Eventos</h5>
            <div class="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm max-h-48 overflow-y-auto">
              <div v-for="evento in eventosTempoReal.slice(-20)" 
                   :key="`${evento.tempo}-${evento.processo.nome}-${evento.tipo}`" class="mb-1">
                <span class="text-gray-500">[{{ evento.tempo }}ms]</span> {{ evento.mensagem }}
              </div>
              <div v-if="eventosTempoReal.length === 0" class="text-gray-500 italic">
                Aguardando eventos...
              </div>
            </div>
          </div>
        </div>

        <!-- Histórico Visual do Cenário (após conclusão) -->
        <div v-if="resultadosSequenciais[cenario.nome] && (cenarioAtualIndex !== index || !estadoTempoReal.executando)" class="p-6 border-b bg-green-50">
          <div class="flex items-center gap-2 mb-4">
            <div class="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
              ✓
            </div>
            <h4 class="font-semibold text-gray-800">📊 Histórico: {{ cenario.nome }}</h4>
            <span class="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
              Concluído em {{ resultadosSequenciais[cenario.nome].metricas.tempoTotalSimulacao }}ms
            </span>
          </div>
          
          <!-- Métricas Rápidas -->
          <div class="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            <div class="bg-white rounded-lg p-3 text-center shadow-sm">
              <div class="text-lg font-bold text-blue-600">{{ Math.round(resultadosSequenciais[cenario.nome].metricas.tempoMedioEspera) }}ms</div>
              <div class="text-xs text-gray-600">Espera Média</div>
            </div>
            <div class="bg-white rounded-lg p-3 text-center shadow-sm">
              <div class="text-lg font-bold text-green-600">{{ Math.round(resultadosSequenciais[cenario.nome].metricas.tempoMedioTurnaround) }}ms</div>
              <div class="text-xs text-gray-600">Turnaround</div>
            </div>
            <div class="bg-white rounded-lg p-3 text-center shadow-sm">
              <div class="text-lg font-bold text-orange-600">{{ resultadosSequenciais[cenario.nome].metricas.numeroTrocasContexto }}</div>
              <div class="text-xs text-gray-600">Trocas</div>
            </div>
            <div class="bg-white rounded-lg p-3 text-center shadow-sm">
              <div class="text-lg font-bold text-purple-600">{{ resultadosSequenciais[cenario.nome].metricas.utilizacaoMediaCPU.toFixed(1) }}%</div>
              <div class="text-xs text-gray-600">CPU</div>
            </div>
          </div>

          <!-- Gantt Histórico -->
          <div class="bg-white rounded-lg p-4 shadow-sm">
            <h5 class="font-medium text-gray-800 mb-3">📊 Diagrama de Gantt Final</h5>
            <div class="space-y-3">
              <div v-for="medico in resultadosSequenciais[cenario.nome].medicos" :key="medico.id">
                <div class="text-sm font-medium text-gray-700 mb-1">{{ medico.nome }}</div>
                <div class="h-8 bg-gray-100 rounded border relative overflow-hidden">
                  <div v-for="bloco in obterBlocosGanttCenario(cenario.nome, medico.id)" 
                       :key="`${bloco.inicio}-${bloco.processo}`" :style="{
                    left: `${(bloco.inicio / resultadosSequenciais[cenario.nome].metricas.tempoTotalSimulacao) * 100}%`,
                    width: `${((bloco.fim - bloco.inicio) / resultadosSequenciais[cenario.nome].metricas.tempoTotalSimulacao) * 100}%`,
                    backgroundColor: bloco.cor
                  }" class="absolute top-0 h-8 flex items-center justify-center text-xs text-white font-medium"
                    :title="`${bloco.processo}: ${bloco.inicio}ms - ${bloco.fim}ms`">
                    {{ bloco.processo.split(' ')[0] }}
                  </div>
                </div>
                
                <div class="flex justify-between text-xs text-gray-500 mt-1">
                  <span>0ms</span>
                  <span>{{ resultadosSequenciais[cenario.nome].metricas.tempoTotalSimulacao }}ms</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Resultado do Cenário (modo instantâneo) -->
        <div v-if="(resultados && resultados[cenario.nome]) && !resultadosSequenciais[cenario.nome]" class="p-6 bg-gray-50">
          <h4 class="font-semibold text-gray-800 mb-4">📊 Resultados:</h4>
          <div class="grid md:grid-cols-4 gap-4 mb-4">
            <div class="bg-white rounded-lg p-4 text-center">
              <div class="text-2xl font-bold text-blue-600">
                {{ Math.round((resultados?.[cenario.nome] || resultadosSequenciais[cenario.nome]).metricas.tempoMedioEspera) }}ms
              </div>
              <div class="text-sm text-gray-600">Tempo Médio de Espera</div>
            </div>
            <div class="bg-white rounded-lg p-4 text-center">
              <div class="text-2xl font-bold text-green-600">
                {{ Math.round((resultados?.[cenario.nome] || resultadosSequenciais[cenario.nome]).metricas.tempoMedioTurnaround) }}ms
              </div>
              <div class="text-sm text-gray-600">Tempo Médio Turnaround</div>
            </div>
            <div class="bg-white rounded-lg p-4 text-center">
              <div class="text-2xl font-bold text-yellow-600">
                {{ (resultados?.[cenario.nome] || resultadosSequenciais[cenario.nome]).metricas.numeroTrocasContexto }}
              </div>
              <div class="text-sm text-gray-600">Trocas de Contexto</div>
            </div>
            <div class="bg-white rounded-lg p-4 text-center">
              <div class="text-2xl font-bold text-purple-600">
                {{ (resultados?.[cenario.nome] || resultadosSequenciais[cenario.nome]).metricas.utilizacaoMediaCPU.toFixed(1) }}%
              </div>
              <div class="text-sm text-gray-600">Utilização CPU</div>
            </div>
          </div>

          <!-- Diagrama de Gantt Final -->
          <div class="bg-white rounded-lg p-4 mb-4">
            <h5 class="font-medium text-gray-800 mb-3">📊 Diagrama de Gantt Final:</h5>
            <div class="space-y-3">
              <div v-for="medico in (resultados?.[cenario.nome] || resultadosSequenciais[cenario.nome]).medicos" :key="medico.id">
                <div class="text-sm font-medium text-gray-700 mb-1">{{ medico.nome }}</div>
                <div class="h-8 bg-gray-100 rounded border relative overflow-hidden">
                  <div v-for="bloco in obterBlocosGanttCenario(cenario.nome, medico.id)" 
                       :key="`${bloco.inicio}-${bloco.processo}`" :style="{
                    left: `${(bloco.inicio / (resultados?.[cenario.nome] || resultadosSequenciais[cenario.nome]).metricas.tempoTotalSimulacao) * 100}%`,
                    width: `${((bloco.fim - bloco.inicio) / (resultados?.[cenario.nome] || resultadosSequenciais[cenario.nome]).metricas.tempoTotalSimulacao) * 100}%`,
                    backgroundColor: bloco.cor
                  }" class="absolute top-0 h-8 flex items-center justify-center text-xs text-white font-medium"
                    :title="`${bloco.processo}: ${bloco.inicio}ms - ${bloco.fim}ms`">
                    {{ bloco.processo.split(' ')[0] }}
                  </div>
                </div>
                
                <div class="flex justify-between text-xs text-gray-500 mt-1">
                  <span>0ms</span>
                  <span>{{ (resultados?.[cenario.nome] || resultadosSequenciais[cenario.nome]).metricas.tempoTotalSimulacao }}ms</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Timeline de Eventos -->
          <div class="bg-white rounded-lg p-4">
            <h5 class="font-medium text-gray-800 mb-3">📋 Timeline de Eventos:</h5>
            <div class="max-h-64 overflow-y-auto">
              <div v-for="evento in (resultados?.[cenario.nome] || resultadosSequenciais[cenario.nome]).eventos.slice(0, 20)"
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
              <div v-if="(resultados?.[cenario.nome] || resultadosSequenciais[cenario.nome]).eventos.length > 20" class="text-center py-2 text-gray-500 text-sm">
                ... e mais {{ (resultados?.[cenario.nome] || resultadosSequenciais[cenario.nome]).eventos.length - 20 }} eventos
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
import { useSimulacaoTempoReal } from '~/composables/useSimulacaoTempoReal'
import type { CenarioTeste, ResultadoSimulacao, ConfiguracaoSimulacao } from '../types/index'

// Configurar meta tags
useHead({
  title: 'Cenários do Trabalho - Hospital Digital',
  meta: [
    { name: 'description', content: 'Execute os cenários específicos do trabalho de escalonamento de processos' }
  ]
})

// Composables
const { executarCenario: executarCenarioComposable, executarTodosCenarios: execTodosCenarios, criarCenarios } = useSimuladorHospital()
const simulacaoTempoReal = useSimulacaoTempoReal()

// Estado reativo
const executando = ref(false)
const executandoCenario = ref('')
const resultados = ref<Record<string, ResultadoSimulacao> | null>(null)
const consoleOutput = ref<string[]>([])
const tempoExecucao = ref(0)
const modoTempoReal = ref(true)
const velocidadeSimulacao = ref(1000)
const cenarioAtualIndex = ref(-1)
const executandoSequencia = ref(false)
const resultadosSequenciais = ref<Record<string, ResultadoSimulacao>>({})

// Estado do tempo real
const { estado: estadoTempoReal, eventos: eventosTempoReal } = simulacaoTempoReal

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
  if (mapeamentoCoresProcessos.value.has(pid)) {
    return mapeamentoCoresProcessos.value.get(pid)!
  }
  
  for (const cor of coresDisponiveis) {
    if (!coresUsadas.value.has(cor)) {
      coresUsadas.value.add(cor)
      mapeamentoCoresProcessos.value.set(pid, cor)
      return cor
    }
  }
  
  const corFallback = coresDisponiveis[pid % coresDisponiveis.length]
  mapeamentoCoresProcessos.value.set(pid, corFallback)
  return corFallback
}

const limparCoresProcessos = () => {
  coresUsadas.value.clear()
  mapeamentoCoresProcessos.value.clear()
}

// Dados
const cenarios = criarCenarios()

// Interceptar console.log para mostrar na interface
const originalConsoleLog = console.log
console.log = (...args: any[]) => {
  consoleOutput.value.push(args.join(' '))
  originalConsoleLog(...args)
}

// Métodos de tempo real
const iniciarSimulacaoTempoReal = (config: ConfiguracaoSimulacao) => {
  limparCoresProcessos()
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

const pararExecucaoSequencial = () => {
  if (estadoTempoReal.value.executando) {
    pararSimulacaoTempoReal()
  }
  executandoSequencia.value = false
  cenarioAtualIndex.value = -1
}

const atualizarVelocidadeTempoReal = () => {
  simulacaoTempoReal.definirVelocidade(velocidadeSimulacao.value)
}

const obterBlocosGanttTempoReal = (medico: string) => {
  return estadoTempoReal.value.diagramaGantt
    .filter(bloco => bloco.medico === medico)
    .sort((a, b) => a.inicio - b.inicio)
}

const obterBlocosGanttCenario = (nomeCenario: string, medicoId: string) => {
  const resultado = resultados.value?.[nomeCenario] || resultadosSequenciais.value[nomeCenario]
  if (!resultado) return []
  
  return resultado.diagramaGantt
    .filter(bloco => bloco.medico.includes(medicoId.split('-')[1]) || bloco.medico === medicoId)
    .sort((a, b) => a.inicio - b.inicio)
}

// Computed properties
const velocidadeLabel = computed(() => {
  if (velocidadeSimulacao.value <= 300) return 'Muito Rápida'
  if (velocidadeSimulacao.value <= 800) return 'Rápida'
  if (velocidadeSimulacao.value <= 1500) return 'Normal'
  return 'Lenta'
})

// Métodos
const executarCenarioSelecionado = async (cenario: CenarioTeste) => {
  if (executando.value || estadoTempoReal.value.executando) return

  executando.value = true
  executandoCenario.value = cenario.nome
  consoleOutput.value = []

  const inicio = Date.now()

  try {
    if (modoTempoReal.value) {
      // Execução em tempo real
      const config: ConfiguracaoSimulacao = {
        algoritmo: cenario.configuracao.algoritmo,
        numeroMedicos: cenario.configuracao.numeroMedicos,
        quantum: cenario.configuracao.quantum || 2000,
        processos: cenario.configuracao.processos
      }
      
      iniciarSimulacaoTempoReal(config)
      
      // Aguardar conclusão da simulação
      return new Promise<void>((resolve) => {
        const checkInterval = setInterval(() => {
          if (!estadoTempoReal.value.executando) {
            clearInterval(checkInterval)
            
            // Criar resultado simulado baseado no estado final
            const resultado: ResultadoSimulacao = {
              metricas: {
                ...estadoTempoReal.value.metricas,
                tempoTotalSimulacao: estadoTempoReal.value.tempoAtual
              },
              processos: [...estadoTempoReal.value.processosFinalizados],
              medicos: estadoTempoReal.value.medicos.map(m => ({ 
                id: m.id, 
                nome: m.nome,
                ocupado: m.ocupado,
                tempoOcupado: m.tempoOcupado
              })),
              diagramaGantt: [...estadoTempoReal.value.diagramaGantt],
              eventos: eventosTempoReal.value.map(e => ({
                tempo: e.tempo,
                tipo: e.tipo === 'inicio_execucao' ? 'inicio' : 
                      e.tipo === 'fim_execucao' ? 'fim' : e.tipo,
                processo: e.processo,
                medico: e.medico || '',
                descricao: e.mensagem
              }))
            }
            
            if (!resultados.value) {
              resultados.value = {}
            }
            resultados.value[cenario.nome] = resultado
            
            tempoExecucao.value = Date.now() - inicio
            executando.value = false
            executandoCenario.value = ''
            resolve()
          }
        }, 100)
      })
    } else {
      // Execução instantânea
      const resultado = await executarCenarioComposable(cenario)

      if (!resultados.value) {
        resultados.value = {}
      }
      resultados.value[cenario.nome] = resultado

      tempoExecucao.value = Date.now() - inicio
    }
  } catch (error) {
    console.error('Erro ao executar cenário:', error)
  } finally {
    if (!modoTempoReal.value) {
      executando.value = false
      executandoCenario.value = ''
    }
  }
}

const executarTodosCenarios = async () => {
  if (executando.value || estadoTempoReal.value.executando || executandoSequencia.value) return

  if (modoTempoReal.value) {
    // Execução sequencial em tempo real
    executandoSequencia.value = true
    resultadosSequenciais.value = {}
    cenarioAtualIndex.value = 0
    consoleOutput.value = []
    
    try {
      for (let i = 0; i < cenarios.length; i++) {
        cenarioAtualIndex.value = i
        const cenario = cenarios[i]
        
        console.log(`🎭 Iniciando cenário ${i + 1}: ${cenario.nome}`)
        
        // Limpar cores antes de cada cenário
        limparCoresProcessos()
        
        // Configurar e iniciar simulação
        const config: ConfiguracaoSimulacao = {
          algoritmo: cenario.configuracao.algoritmo,
          numeroMedicos: cenario.configuracao.numeroMedicos,
          quantum: cenario.configuracao.quantum || 2000,
          processos: cenario.configuracao.processos
        }
        
        iniciarSimulacaoTempoReal(config)
        
        // Aguardar conclusão
        await new Promise<void>((resolve) => {
          const checkInterval = setInterval(() => {
            if (!estadoTempoReal.value.executando) {
              clearInterval(checkInterval)
              
              // Salvar resultado
              const resultado: ResultadoSimulacao = {
                metricas: {
                  ...estadoTempoReal.value.metricas,
                  tempoTotalSimulacao: estadoTempoReal.value.tempoAtual
                },
                processos: [...estadoTempoReal.value.processosFinalizados],
                medicos: estadoTempoReal.value.medicos.map(m => ({ 
                  id: m.id, 
                  nome: m.nome,
                  ocupado: m.ocupado,
                  tempoOcupado: m.tempoOcupado
                })),
                diagramaGantt: [...estadoTempoReal.value.diagramaGantt],
                eventos: eventosTempoReal.value.map(e => ({
                  tempo: e.tempo,
                  tipo: e.tipo === 'inicio_execucao' ? 'inicio' : 
                        e.tipo === 'fim_execucao' ? 'fim' : e.tipo,
                  processo: e.processo,
                  medico: e.medico || '',
                  descricao: e.mensagem
                }))
              }
              
              resultadosSequenciais.value[cenario.nome] = resultado
              console.log(`✅ Cenário ${i + 1} concluído: ${cenario.nome}`)
              resolve()
            }
          }, 100)
        })
        
        // Pausa entre cenários
        if (i < cenarios.length - 1) {
          console.log(`⏳ Aguardando para próximo cenário...`)
          await new Promise(resolve => setTimeout(resolve, 2000))
        }
      }
      
      // Copiar resultados para exibição normal
      resultados.value = { ...resultadosSequenciais.value }
      console.log(`🎉 Todos os cenários concluídos!`)
      
    } catch (error) {
      console.error('Erro na execução sequencial:', error)
    } finally {
      executandoSequencia.value = false
      cenarioAtualIndex.value = -1
    }
  } else {
    // Execução instantânea de todos
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
}

const limparResultados = () => {
  if (estadoTempoReal.value.executando) {
    pararSimulacaoTempoReal()
  }
  
  executandoSequencia.value = false
  cenarioAtualIndex.value = -1
  resultados.value = null
  resultadosSequenciais.value = {}
  consoleOutput.value = []
  tempoExecucao.value = 0
  limparCoresProcessos()
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