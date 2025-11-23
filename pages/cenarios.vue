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
          <button @click="executarTodosCenarios"
            :disabled="executando || estadoTempoReal.executando || executandoSequencia"
            class="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg transition-colors">
            {{ executando ? '⏳ Executando...' :
              executandoSequencia ? '📈 Executando Sequencialmente...' :
                modoTempoReal ? '🎬 Executar Cenários Sequencialmente' : '🚀 Executar Todos os Cenários' }}
          </button>

          <button @click="limparResultados"
            :disabled="(!resultados || Object.keys(resultados).length === 0) && Object.keys(resultadosSequenciais).length === 0 && !estadoTempoReal.executando"
            class="bg-gray-600 hover:bg-gray-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg transition-colors">
            🗑️ Limpar Resultados
          </button>

          <button v-if="totalDiagramasPreenchidos > 0" @click="limparTodosDiagramas"
            class="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg transition-colors">
            🗑️ Limpar Diagramas
          </button>

          <button v-if="escalaTempoFixa > 0" @click="resetarEscalaTempoFixa"
            class="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg transition-colors text-sm"
            :title="`Escala atual: ${escalaTempoFixa}ms`">
            🔄 Reset Escala
          </button>

          <!-- Botão temporário para debug -->
          <button v-if="(resultados && Object.keys(resultados).length > 0) || Object.keys(resultadosSequenciais).length > 0" 
            @click="forcarPreenchimentoDiagramas"
            class="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg transition-colors text-sm">
            🔧 Debug: Forçar Diagramas
          </button>

          <!-- Botão para debug de normalização -->
          <button v-if="totalDiagramasPreenchidos > 0" 
            @click="debugNormalizacao"
            class="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors text-sm">
            🔍 Debug Normalização
          </button>
        </div>

        <!-- Controles Tempo Real -->
        <div v-if="modoTempoReal && (estadoTempoReal.executando || executandoSequencia)"
          class="flex gap-2 items-center">
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
          <div class="flex flex-col gap-1">
            <span v-if="tempoExecucao && !modoTempoReal">⏱️ Tempo de execução: {{ tempoExecucao }}ms</span>
            <span v-if="modoTempoReal && estadoTempoReal.executando" class="flex items-center gap-2">
              <span class="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
              Tempo: {{ estadoTempoReal.tempoAtual }}ms
            </span>
            <span v-if="executandoSequencia && !estadoTempoReal.executando" class="flex items-center gap-2">
              <span class="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
              Preparando cenário {{ cenarioAtualIndex + 1 }}...
            </span>
            <span v-if="totalDiagramasPreenchidos > 0" class="text-xs text-blue-600">
              � {{ totalDiagramasPreenchidos }} diagrama{{ totalDiagramasPreenchidos > 1 ? 's' : '' }}
              preenchido{{ totalDiagramasPreenchidos > 1 ? 's' : '' }}
            </span>
          </div>
        </div>
      </div>

      <!-- Controle de Velocidade Tempo Real -->
      <div v-if="modoTempoReal" class="mt-4 pt-4 border-t">
        <div class="flex items-center gap-4">
          <label class="text-sm font-medium text-gray-700">Velocidade:</label>
          <input v-model="velocidadeSimulacao" @input="atualizarVelocidadeTempoReal" type="range" min="100" max="2000"
            step="100" class="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer">
          <span class="text-sm text-gray-600 w-20">{{ velocidadeLabel }}</span>
        </div>
      </div>
    </div>

    <!-- Progress Bar Global e Histórico -->
    <div v-if="modoTempoReal && (executandoSequencia || Object.keys(resultadosSequenciais).length > 0)"
      class="bg-white rounded-lg shadow-lg p-4 mb-8">
      <div class="flex justify-between items-center text-sm text-gray-600 mb-2">
        <span v-if="executandoSequencia">🎬 Execução Sequencial em Progresso</span>
        <span v-else-if="Object.keys(resultadosSequenciais).length === cenarios.length">✅ Todos os Cenários
          Concluídos</span>
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
                <div v-if="resultadosSequenciais[cenario.nome]" class="bg-green-500 text-xs px-2 py-1 rounded-full">
                  ✅ Concluído
                </div>
                <div
                  v-else-if="executandoCenario === cenario.nome || (cenarioAtualIndex === index && estadoTempoReal.executando)"
                  class="bg-yellow-500 text-xs px-2 py-1 rounded-full animate-pulse">
                  ⚡ Executando
                </div>
              </div>
              <p class="text-blue-100">{{ cenario.descricao }}</p>
            </div>
            <button @click="executarCenarioSelecionado(cenario)"
              :disabled="executando || estadoTempoReal.executando || executandoSequencia"
              class="bg-white/20 hover:bg-white/30 disabled:bg-white/10 text-white px-4 py-2 rounded-lg transition-colors ml-4">
              {{ (executandoCenario === cenario.nome || (cenarioAtualIndex === index && estadoTempoReal.executando)) ?
                '⏳' : '▶️' }} Executar
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
        <div v-if="modoTempoReal && (cenarioAtualIndex === index && estadoTempoReal.executando)"
          class="p-6 border-b bg-blue-50">
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
              <h5 class="font-semibold text-gray-700 mb-2">⚡ Executando ({{ estadoTempoReal.processosExecutando.length
              }})</h5>
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
                <div v-if="estadoTempoReal.processosExecutando.length === 0"
                  class="text-center text-gray-500 text-sm py-4">
                  Nenhum executando
                </div>
              </div>
            </div>

            <div>
              <h5 class="font-semibold text-gray-700 mb-2">✅ Finalizados ({{ estadoTempoReal.processosFinalizados.length
              }})</h5>
              <div class="space-y-2 max-h-32 overflow-y-auto">
                <div v-for="processo in estadoTempoReal.processosFinalizados" :key="processo.pid"
                  class="p-2 bg-green-50 border border-green-200 rounded text-sm">
                  {{ processo.nome }}
                  <div class="text-xs text-gray-600">
                    T: {{ processo.tempoTurnaround }}ms • E: {{ processo.tempoEspera }}ms
                  </div>
                </div>
                <div v-if="estadoTempoReal.processosFinalizados.length === 0"
                  class="text-center text-gray-500 text-sm py-4">
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

        <!-- Diagrama Final do Cenário (cópia do estado final em tempo real) -->
        <div
          v-if="diagramasGanttCenarios[cenario.nome]?.preenchido && (cenarioAtualIndex !== index || !estadoTempoReal.executando)"
          class="p-6 border-b bg-green-50">
          <div class="flex items-center justify-between mb-4">
            <div class="flex items-center gap-2">
              <div
                class="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                📊
              </div>
              <h4 class="font-semibold text-gray-800">Diagrama de Gantt: {{ cenario.nome }}</h4>
              <span class="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                ✅ {{ diagramasGanttCenarios[cenario.nome].blocos.length }} blocos preenchidos
              </span>
            </div>

            <div class="flex gap-2">
              <button @click="limparDiagramaCenario(cenario.nome)"
                class="text-xs bg-red-100 text-red-600 hover:bg-red-200 px-3 py-1 rounded-full transition-colors">
                🗑️ Limpar
              </button>
              <button @click="exportarDiagramaCenario(cenario.nome)"
                class="text-xs bg-blue-100 text-blue-600 hover:bg-blue-200 px-3 py-1 rounded-full transition-colors">
                💾 Exportar
              </button>
              <button @click="debugAlinhamentoBlocos(cenario.nome)"
                class="text-xs bg-yellow-100 text-yellow-600 hover:bg-yellow-200 px-3 py-1 rounded-full transition-colors">
                🔍 Debug Estado
              </button>

            </div>
          </div>

          <!-- Explicação do Modo -->
          <div class="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
            <div class="flex items-center gap-2 text-sm text-blue-800">
              <span>�</span>
              <strong>Diagrama Final:</strong> Mantém exatamente as posições e tempos da simulação executada
            </div>
          </div>

          <!-- Indicadores de Desempenho -->
          <div class="bg-gradient-to-r from-blue-50 to-green-50 rounded-lg p-4 mb-4">
            <h6 class="font-semibold text-gray-800 mb-3 flex items-center gap-2">
              📈 Indicadores de Desempenho
              <span class="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full">
                {{ cenario.nome }}
              </span>
            </h6>
            
            <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div class="bg-white rounded-lg p-3 text-center shadow-sm">
                <div class="text-xl font-bold text-blue-600">
                  {{ Math.round((resultados?.[cenario.nome] || resultadosSequenciais[cenario.nome])?.metricas?.tempoMedioEspera || 0) }}ms
                </div>
                <div class="text-xs text-gray-600">Tempo Médio de Espera</div>
              </div>
              
              <div class="bg-white rounded-lg p-3 text-center shadow-sm">
                <div class="text-xl font-bold text-green-600">
                  {{ Math.round((resultados?.[cenario.nome] || resultadosSequenciais[cenario.nome])?.metricas?.tempoMedioTurnaround || 0) }}ms
                </div>
                <div class="text-xs text-gray-600">Tempo Médio de Execução</div>
              </div>
              
              <div class="bg-white rounded-lg p-3 text-center shadow-sm">
                <div class="text-xl font-bold text-yellow-600">
                  {{ (resultados?.[cenario.nome] || resultadosSequenciais[cenario.nome])?.metricas?.numeroTrocasContexto || 0 }}
                </div>
                <div class="text-xs text-gray-600">Trocas de Contexto</div>
              </div>
              
              <div class="bg-white rounded-lg p-3 text-center shadow-sm">
                <div class="text-xl font-bold text-purple-600">
                  {{ ((resultados?.[cenario.nome] || resultadosSequenciais[cenario.nome])?.metricas?.utilizacaoMediaCPU || 0).toFixed(1) }}%
                </div>
                <div class="text-xs text-gray-600">Utilização Média dos Médicos</div>
              </div>
            </div>
          </div>

          <!-- Diagrama Final (cópia exata do estado final da simulação) -->
          <div class="bg-white rounded-lg shadow-sm border-l-4 border-l-green-500 p-4">
            <h6 class="font-medium text-gray-800 mb-3 flex items-center gap-2">
              📊 Estado Final da Simulação
              <span class="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full">
                {{ diagramasGanttCenarios[cenario.nome].blocos.length }} blocos
              </span>
              <span class="text-xs bg-green-100 text-green-600 px-2 py-1 rounded-full" 
                    :title="`Tempo total: ${diagramasGanttCenarios[cenario.nome].tempoTotal}ms`">
                🕐 Último Estado
              </span>
            </h6>

            <div class="space-y-3">
              <div v-for="medico in diagramasGanttCenarios[cenario.nome].medicos" :key="medico.id" class="border rounded-lg p-3">
                <div class="font-medium text-gray-700 mb-2">{{ medico.nome }}</div>
                <div class="relative h-8 bg-gray-100 rounded overflow-hidden">
                  <div v-for="bloco in obterBlocosGanttFinal(cenario.nome, medico.nome)"
                    :key="`${bloco.processo}-${bloco.inicio}`" :style="{
                      left: `${(bloco.inicio / diagramasGanttCenarios[cenario.nome].tempoTotal) * 100}%`,
                      width: `${Math.max(((bloco.fim - bloco.inicio) / diagramasGanttCenarios[cenario.nome].tempoTotal) * 100, 1)}%`,
                      backgroundColor: bloco.cor
                    }"
                    class="absolute h-full flex items-center justify-center text-xs font-medium text-white shadow-sm"
                    :title="`${bloco.processo}: ${bloco.inicio}ms - ${bloco.fim}ms`">
                    {{ bloco.processo.split(' ')[1] || bloco.processo.charAt(0) }}
                  </div>
                </div>

                <div class="flex justify-between text-xs text-gray-500 mt-1">
                  <span>0ms</span>
                  <span>{{ diagramasGanttCenarios[cenario.nome].tempoTotal }}ms</span>
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
          {{ Math.round((resultados?.[cenario.nome] ||
            resultadosSequenciais[cenario.nome]).metricas.tempoMedioEspera) }}ms
        </div>
        <div class="text-sm text-gray-600">Tempo Médio de Espera</div>
      </div>
      <div class="bg-white rounded-lg p-4 text-center">
        <div class="text-2xl font-bold text-green-600">
          {{ Math.round((resultados?.[cenario.nome] ||
            resultadosSequenciais[cenario.nome]).metricas.tempoMedioTurnaround) }}ms
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
          {{ (resultados?.[cenario.nome] ||
            resultadosSequenciais[cenario.nome]).metricas.utilizacaoMediaCPU.toFixed(1) }}%
        </div>
        <div class="text-sm text-gray-600">Utilização CPU</div>
      </div>
    </div>

    <!-- Diagrama de Gantt Final -->
    <div class="bg-white rounded-lg p-4 mb-4">
      <h5 class="font-medium text-gray-800 mb-3">📊 Diagrama de Gantt Final:</h5>
      <div class="space-y-3">
        <div v-for="medico in (resultados?.[cenario.nome] || resultadosSequenciais[cenario.nome]).medicos"
          :key="medico.id">
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
            <span>{{ (resultados?.[cenario.nome] ||
              resultadosSequenciais[cenario.nome]).metricas.tempoTotalSimulacao }}ms</span>
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
        <div v-if="(resultados?.[cenario.nome] || resultadosSequenciais[cenario.nome]).eventos.length > 20"
          class="text-center py-2 text-gray-500 text-sm">
          ... e mais {{ (resultados?.[cenario.nome] || resultadosSequenciais[cenario.nome]).eventos.length - 20 }}
          eventos
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
import { useSimulacaoTempoReal } from '~/composables/useSimulacaoTempoReal'
import { useSimuladorHospital } from '~/composables/useSimuladorHospital'
import type { CenarioTeste, ConfiguracaoSimulacao, ResultadoSimulacao } from '../types/index'

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

// Sistema de diagramas dedicados por cenário
const diagramasGanttCenarios = ref<Record<string, {
  blocos: any[],
  medicos: any[],
  tempoTotal: number,
  preenchido: boolean,
  timestampExecucao: number
}>>({})

// Inicializar diagramas vazios para cada cenário
const inicializarDiagramasCenarios = () => {
  console.log(`🔧 Inicializando diagramas para ${cenarios.length} cenários`)
  cenarios.forEach(cenario => {
    if (!diagramasGanttCenarios.value[cenario.nome]) {
      diagramasGanttCenarios.value[cenario.nome] = {
        blocos: [],
        medicos: [],
        tempoTotal: 0,
        preenchido: false,
        timestampExecucao: 0
      }
      console.log(`📋 Diagrama inicializado para: ${cenario.nome}`)
    } else {
      console.log(`📋 Diagrama já existe para: ${cenario.nome} (${diagramasGanttCenarios.value[cenario.nome].preenchido ? 'preenchido' : 'vazio'})`)
    }
  })
}

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
  // Priorizar diagrama dedicado se disponível
  if (diagramasGanttCenarios.value[nomeCenario]?.preenchido) {
    return obterBlocosDiagramaDedicado(nomeCenario, medicoId)
  }

  // Fallback para resultados temporários
  const resultado = resultados.value?.[nomeCenario] || resultadosSequenciais.value[nomeCenario]
  if (!resultado) return []

  return obterBlocosGanttExecucao(resultado, medicoId)
}

const obterBlocosGanttExecucao = (resultado: ResultadoSimulacao, medicoId: string) => {
  if (!resultado || !resultado.diagramaGantt || resultado.diagramaGantt.length === 0) {
    console.warn(`⚠️ Resultado ou diagrama de Gantt vazio para médico ${medicoId}:`, {
      temResultado: !!resultado,
      temDiagrama: !!resultado?.diagramaGantt,
      quantidadeBlocos: resultado?.diagramaGantt?.length || 0
    })
    return []
  }

  const medicoIdLower = medicoId.toLowerCase().trim()

  // Estratégias de filtragem para encontrar blocos do médico específico
  const blocosFiltrados = resultado.diagramaGantt.filter(bloco => {
    if (!bloco || !bloco.medico) {
      console.warn(`⚠️ Bloco inválido encontrado:`, bloco)
      return false
    }

    const medicoNomeBloco = bloco.medico.toLowerCase().trim()

    // Múltiplas estratégias de matching
    const estrategias = [
      // 1. Match exato
      () => medicoNomeBloco === medicoIdLower,

      // 2. Match por ID numérico (medico-1 -> 1, Dr. Silva 1 -> medico-1)
      () => {
        const numeroId = medicoId.match(/\d+/)?.[0]
        const numeroBloco = bloco.medico.match(/\d+/)?.[0]
        return numeroId && numeroBloco && numeroId === numeroBloco
      },

      // 3. Match por conteúdo parcial
      () => medicoNomeBloco.includes(medicoIdLower) || medicoIdLower.includes(medicoNomeBloco),

      // 4. Match por palavras-chave médicas
      () => {
        const palavrasChave = ['dr.', 'dra.', 'doutor', 'doutora', 'medico', 'silva', 'santos', 'oliveira', 'costa', 'pereira']
        return palavrasChave.some(palavra =>
          medicoNomeBloco.includes(palavra) && medicoIdLower.includes(palavra)
        )
      },

      // 5. Match se ambos contêm números similares
      () => {
        const numerosId: string[] = medicoId.match(/\d+/g) || []
        const numerosBloco: string[] = (bloco.medico.match(/\d+/g) || [])
        return numerosId.length > 0 && numerosBloco.length > 0 &&
          numerosId.some((num: string) => numerosBloco.includes(num))
      }
    ]

    return estrategias.some((estrategia, indice) => {
      try {
        const resultado = estrategia()
        return resultado
      } catch (error) {
        console.warn(`Erro na estratégia ${indice + 1}:`, error)
        return false
      }
    })
  })

  // Processar e enriquecer blocos filtrados
  const blocosProcessados = blocosFiltrados.map((bloco, index) => {
    const blocoEnriquecido = {
      // Usar ID existente ou criar um novo
      id: (bloco as any).id || `${medicoIdLower.replace(/\s+/g, '-')}-${Date.now()}-${index}`,
      medico: bloco.medico,
      processo: bloco.processo,
      inicio: bloco.inicio || 0,
      fim: bloco.fim || bloco.inicio || 0,
      // Garantir cor consistente - usar cor salva ou gerar uma nova
      cor: bloco.cor || obterCorConsistentePorNome(bloco.processo),
      // Metadados para debug
      filtradoPor: medicoId,
      indexOriginal: resultado.diagramaGantt.indexOf(bloco)
    }

    // Validação de integridade
    if (blocoEnriquecido.fim <= blocoEnriquecido.inicio) {
      console.warn(`⚠️ Corrigindo bloco com duração inválida:`, blocoEnriquecido)
      blocoEnriquecido.fim = blocoEnriquecido.inicio + 1
    }

    return blocoEnriquecido
  })
    .sort((a, b) => a.inicio - b.inicio) // Ordenar por tempo de início

  // Log detalhado para debug
  console.log(`🔍 Filtro Gantt executado:`, {
    medicoSolicitado: medicoId,
    totalBlocosDisponiveis: resultado.diagramaGantt.length,
    blocosFiltrados: blocosProcessados.length,
    medicosDisponiveis: [...new Set(resultado.diagramaGantt.map(b => b.medico))],
    exemploBlocosEncontrados: blocosProcessados.slice(0, 2).map(b =>
      `${b.processo}(${b.inicio}-${b.fim})`
    )
  })

  // Alertar sobre falha no filtro
  if (resultado.diagramaGantt.length > 0 && blocosProcessados.length === 0) {
    console.error(`❌ FALHA NO FILTRO - Nenhum bloco encontrado:`, {
      medicoSolicitado: medicoId,
      totalBlocos: resultado.diagramaGantt.length,
      medicosDisponiveis: [...new Set(resultado.diagramaGantt.map(b => b.medico))],
      exemploBloco: resultado.diagramaGantt[0],
      sugestao: 'Verificar se o ID do médico corresponde aos nomes no diagrama'
    })
  }

  return blocosProcessados
}

// Função auxiliar para obter cor consistente por nome do processo
const obterCorConsistentePorNome = (nomeProcesso: string): string => {
  if (!nomeProcesso) return coresDisponiveis[0]

  // Usar hash simples baseado no nome do processo para cor consistente
  let hash = 0
  for (let i = 0; i < nomeProcesso.length; i++) {
    const char = nomeProcesso.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32-bit integer
  }

  const indice = Math.abs(hash) % coresDisponiveis.length
  return coresDisponiveis[indice]
}

// Métodos do sistema de diagramas dedicados
const carregarDiagramasLocalStorage = () => {
  try {
    const dados = localStorage.getItem('simulador-diagramas-cenarios')
    if (dados) {
      const dadosParsed = JSON.parse(dados)
      
      // Compatibilidade com formato antigo
      if (dadosParsed.diagramas) {
        diagramasGanttCenarios.value = dadosParsed.diagramas
        if (dadosParsed.escalaFixa) {
          escalaTempoFixa.value = dadosParsed.escalaFixa
        }
      } else {
        // Formato antigo - só os diagramas
        diagramasGanttCenarios.value = dadosParsed
      }
    }
  } catch (error) {
    console.warn('Erro ao carregar diagramas do localStorage:', error)
  }
}

const salvarDiagramasLocalStorage = () => {
  try {
    const dadosParaSalvar = {
      diagramas: diagramasGanttCenarios.value,
      escalaFixa: escalaTempoFixa.value
    }
    localStorage.setItem('simulador-diagramas-cenarios', JSON.stringify(dadosParaSalvar))
  } catch (error) {
    console.warn('Erro ao salvar diagramas no localStorage:', error)
  }
}

const preencherDiagramaCenario = (nomeCenario: string, resultado: ResultadoSimulacao) => {
  console.log(`🔍 Capturando estado final para ${nomeCenario}:`, {
    temResultado: !!resultado,
    temDiagrama: !!resultado?.diagramaGantt,
    quantidadeBlocos: resultado?.diagramaGantt?.length || 0,
    jaPreenchido: diagramasGanttCenarios.value[nomeCenario]?.preenchido || false
  })

  // Só preenche se ainda não foi preenchido
  if (diagramasGanttCenarios.value[nomeCenario]?.preenchido && diagramasGanttCenarios.value[nomeCenario]?.blocos?.length > 0) {
    console.log(`📊 Diagrama de ${nomeCenario} já foi preenchido - mantendo dados existentes (${diagramasGanttCenarios.value[nomeCenario].blocos.length} blocos)`)
    return
  }

  const timestampExecucao = Date.now()

  // Usar sempre dados do resultado capturado (estado final da simulação)
  const diagramaFonte = resultado.diagramaGantt
  
  console.log(`🎨 Capturando estado final idêntico ao tempo real:`, {
    blocosCapturados: diagramaFonte?.length || 0,
    tempoFinal: resultado.metricas?.tempoTotalSimulacao,
    exemploBloco: diagramaFonte?.[0]
  })

  if (diagramaFonte && diagramaFonte.length > 0) {
    // Capturar blocos exatamente como estão no estado final
    // SEM processamento adicional - manter estado idêntico ao tempo real
    const blocosFinal = diagramaFonte.map((bloco, index) => ({
      id: `final-${nomeCenario.replace(/\s+/g, '-')}-${index}`,
      medico: bloco.medico,
      processo: bloco.processo,
      inicio: bloco.inicio,
      fim: bloco.fim,
      cor: bloco.cor
    }))

    // Capturar médicos exatamente como estão no estado final
    const medicosInfo = resultado.medicos || []
    const tempoTotal = resultado.metricas?.tempoTotalSimulacao || 0

    // Armazenar estado final capturado
    diagramasGanttCenarios.value[nomeCenario] = {
      blocos: blocosFinal,
      medicos: JSON.parse(JSON.stringify(medicosInfo)),
      tempoTotal: tempoTotal,
      preenchido: true,
      timestampExecucao
    }

    console.log(`✅ Estado final capturado para ${nomeCenario}:`, {
      blocosCapturados: blocosFinal.length,
      medicos: [...new Set(blocosFinal.map(b => b.medico))],
      tempoTotal: tempoTotal,
      exemploBloco: blocosFinal[0]
    })

    // Atualizar escala de tempo fixa para manter alinhamento
    definirEscalaTempoFixa()

    salvarDiagramasLocalStorage()
  } else {
    console.warn(`❌ Não foi possível preencher diagrama de ${nomeCenario} - sem dados de Gantt:`, {
      resultado: !!resultado,
      temDiagramaResultado: resultado?.diagramaGantt?.length || 0,
      temDiagramaTempoReal: estadoTempoReal.value.diagramaGantt?.length || 0
    })
  }
}

const limparDiagramaCenario = (nomeCenario: string) => {
  if (diagramasGanttCenarios.value[nomeCenario]) {
    diagramasGanttCenarios.value[nomeCenario] = {
      blocos: [],
      medicos: [],
      tempoTotal: 0,
      preenchido: false,
      timestampExecucao: 0
    }
    salvarDiagramasLocalStorage()
    console.log(`🗑️ Diagrama de ${nomeCenario} foi limpo`)
  }
}

const exportarDiagramaCenario = (nomeCenario: string) => {
  const diagrama = diagramasGanttCenarios.value[nomeCenario]
  if (!diagrama || !diagrama.preenchido) return

  const dadosExport = {
    cenario: nomeCenario,
    timestamp: diagrama.timestampExecucao,
    geradoEm: new Date().toISOString(),
    dados: diagrama
  }

  const blob = new Blob([JSON.stringify(dadosExport, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `diagrama-${nomeCenario.replace(/\s+/g, '-').toLowerCase()}.json`
  link.click()
  URL.revokeObjectURL(url)
}

const formatarDataExecucao = (timestamp: number) => {
  const data = new Date(timestamp)
  const hoje = new Date()
  const ontem = new Date(hoje)
  ontem.setDate(hoje.getDate() - 1)

  if (data.toDateString() === hoje.toDateString()) {
    return `Hoje às ${data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`
  } else if (data.toDateString() === ontem.toDateString()) {
    return `Ontem às ${data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`
  } else {
    return data.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }
}

// Computed properties
const velocidadeLabel = computed(() => {
  if (velocidadeSimulacao.value <= 300) return 'Muito Rápida'
  if (velocidadeSimulacao.value <= 800) return 'Rápida'
  if (velocidadeSimulacao.value <= 1500) return 'Normal'
  return 'Lenta'
})

const totalDiagramasPreenchidos = computed(() => {
  return Object.values(diagramasGanttCenarios.value).filter(diagrama => diagrama.preenchido).length
})

// Escala de tempo fixa para alinhamento visual (não muda durante a sessão)
const escalaTempoFixa = ref<number>(0)

// Função para calcular o tempo máximo entre todos os cenários (para alinhamento visual)
const calcularTempoMaximoGlobal = () => {
  let tempoMaximo = 0
  
  Object.values(diagramasGanttCenarios.value).forEach(diagrama => {
    if (diagrama.preenchido && diagrama.tempoTotal > tempoMaximo) {
      tempoMaximo = diagrama.tempoTotal
    }
  })
  
  // Se não há diagramas preenchidos, usar um valor padrão mínimo
  return tempoMaximo > 0 ? tempoMaximo : 1000
}

// Função para definir escala de tempo fixa (chamada após primeira execução)
const definirEscalaTempoFixa = () => {
  const novaEscala = calcularTempoMaximoGlobal()
  if (escalaTempoFixa.value === 0 || novaEscala > escalaTempoFixa.value) {
    escalaTempoFixa.value = novaEscala
    console.log(`⚖️ Escala de tempo fixa atualizada para: ${escalaTempoFixa.value}ms`)
  }
}

// Função para obter tempo de escala comum (para alinhamento visual dos diagramas)
const obterTempoEscalaComum = () => {
  // Se não há escala fixa definida, calcular e definir
  if (escalaTempoFixa.value === 0) {
    definirEscalaTempoFixa()
  }
  return escalaTempoFixa.value > 0 ? escalaTempoFixa.value : calcularTempoMaximoGlobal()
}

// Modo de visualização fixo: sempre alinhado
const modoVisualizacao = 'normalizado'

// Função para obter o tempo mínimo global de um cenário (primeiro evento de qualquer médico)
const obterTempoMinimoGlobal = (nomeCenario: string) => {
  const diagrama = diagramasGanttCenarios.value[nomeCenario]
  if (!diagrama || !diagrama.preenchido) return 0
  
  let tempoMinimoGlobal = Infinity
  
  diagrama.medicos.forEach(medico => {
    const blocos = obterBlocosDiagramaDedicado(nomeCenario, medico.id)
    if (blocos.length > 0) {
      const tempoMinimoMedico = Math.min(...blocos.map(b => b.inicio))
      if (tempoMinimoMedico < tempoMinimoGlobal) {
        tempoMinimoGlobal = tempoMinimoMedico
      }
    }
  })
  
  return tempoMinimoGlobal === Infinity ? 0 : tempoMinimoGlobal
}

// Função para normalizar blocos por médico usando o tempo mínimo global
const normalizarBlocosPorMedico = (nomeCenario: string, medicoId: string) => {
  const blocos = obterBlocosDiagramaDedicado(nomeCenario, medicoId)
  
  if (blocos.length === 0) return []
  
  // Usar o tempo mínimo global do cenário, não o específico do médico
  const tempoMinimoGlobal = obterTempoMinimoGlobal(nomeCenario)
  
  // Normalizar todos os blocos deste médico usando o tempo global
  return blocos.map(bloco => ({
    ...bloco,
    inicioNormalizado: bloco.inicio - tempoMinimoGlobal,
    fimNormalizado: bloco.fim - tempoMinimoGlobal,
    inicioOriginal: bloco.inicio,
    fimOriginal: bloco.fim
  }))
}

// Função para obter tempo máximo normalizado (para escala comum no modo normalizado)
const obterTempoMaximoNormalizado = (nomeCenario: string) => {
  const diagrama = diagramasGanttCenarios.value[nomeCenario]
  if (!diagrama || !diagrama.preenchido) return 0
  
  let tempoMaximo = 0
  
  diagrama.medicos.forEach(medico => {
    const blocosNormalizados = normalizarBlocosPorMedico(nomeCenario, medico.id)
    if (blocosNormalizados.length > 0) {
      const tempoMaximoMedico = Math.max(...blocosNormalizados.map(b => b.fimNormalizado))
      if (tempoMaximoMedico > tempoMaximo) {
        tempoMaximo = tempoMaximoMedico
      }
    }
  })
  
  return tempoMaximo
}

// Função para obter escala de tempo (sempre usa tempos originais)
const obterEscalaTempoVisualizacao = (nomeCenario?: string) => {
  if (nomeCenario) {
    const diagrama = diagramasGanttCenarios.value[nomeCenario]
    if (diagrama && diagrama.preenchido) {
      return diagrama.tempoTotal
    }
  }
  return obterTempoEscalaComum()
}

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

            // Capturar estado final completo da simulação
            const estadoFinal = JSON.parse(JSON.stringify(estadoTempoReal.value))
            const eventosFinal = JSON.parse(JSON.stringify(eventosTempoReal.value))
            
            console.log(`📊 Capturando estado final para ${cenario.nome}:`, {
              tempoFinal: estadoFinal.tempoAtual,
              blocosDiagrama: estadoFinal.diagramaGantt.length,
              medicos: estadoFinal.medicos.length,
              processosFinalizados: estadoFinal.processosFinalizados.length
            })

            // Criar resultado simulado baseado no estado final capturado
            const resultado: ResultadoSimulacao = {
              metricas: {
                ...estadoFinal.metricas,
                tempoTotalSimulacao: estadoFinal.tempoAtual
              },
              processos: [...estadoFinal.processosFinalizados],
              medicos: estadoFinal.medicos.map(m => ({
                id: m.id,
                nome: m.nome,
                ocupado: m.ocupado,
                tempoOcupado: m.tempoOcupado
              })),
              diagramaGantt: [...estadoFinal.diagramaGantt],
              eventos: eventosFinal.map(e => ({
                tempo: e.tempo,
                tipo: e.tipo === 'inicio_execucao' ? 'inicio' :
                  e.tipo === 'fim_execucao' ? 'fim' : e.tipo,
                processo: e.processo,
                medico: e.medico || '',
                descricao: e.mensagem
              }))
            }

            // Preencher diagrama dedicado do cenário imediatamente após captura
            preencherDiagramaCenario(cenario.nome, resultado)

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

      // Preencher diagrama dedicado do cenário
      preencherDiagramaCenario(cenario.nome, resultado)

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

              // Capturar estado final completo da simulação
              const estadoFinal = JSON.parse(JSON.stringify(estadoTempoReal.value))
              const eventosFinal = JSON.parse(JSON.stringify(eventosTempoReal.value))
              
              console.log(`📊 Capturando estado final sequencial para ${cenario.nome}:`, {
                tempoFinal: estadoFinal.tempoAtual,
                blocosDiagrama: estadoFinal.diagramaGantt.length,
                medicos: estadoFinal.medicos.length,
                processosFinalizados: estadoFinal.processosFinalizados.length
              })

              // Salvar resultado baseado no estado final capturado
              const resultado: ResultadoSimulacao = {
                metricas: {
                  ...estadoFinal.metricas,
                  tempoTotalSimulacao: estadoFinal.tempoAtual
                },
                processos: [...estadoFinal.processosFinalizados],
                medicos: estadoFinal.medicos.map(m => ({
                  id: m.id,
                  nome: m.nome,
                  ocupado: m.ocupado,
                  tempoOcupado: m.tempoOcupado
                })),
                diagramaGantt: [...estadoFinal.diagramaGantt],
                eventos: eventosFinal.map(e => ({
                  tempo: e.tempo,
                  tipo: e.tipo === 'inicio_execucao' ? 'inicio' :
                    e.tipo === 'fim_execucao' ? 'fim' : e.tipo,
                  processo: e.processo,
                  medico: e.medico || '',
                  descricao: e.mensagem
                }))
              }

              // Preencher diagrama dedicado do cenário imediatamente após captura
              preencherDiagramaCenario(cenario.nome, resultado)

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

// Função para resetar escala de tempo fixa
const resetarEscalaTempoFixa = () => {
  escalaTempoFixa.value = 0
  console.log(`🔄 Escala de tempo fixa resetada`)
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
  
  // Não resetar escala para manter alinhamento visual dos diagramas persistentes
  console.log(`🧹 Resultados limpos - diagramas dedicados e escala preservados`)
}

// Função para debug: força preenchimento dos diagramas com dados existentes
const forcarPreenchimentoDiagramas = () => {
  console.log(`🔧 Forçando preenchimento de diagramas com dados existentes`)
  
  // Debug dos diagramas atuais
  console.log(`📊 Estado atual dos diagramas:`, diagramasGanttCenarios.value)
  
  Object.entries(resultados.value || {}).forEach(([nomeCenario, resultado]) => {
    console.log(`🔍 Tentando preencher ${nomeCenario} com dados existentes:`, {
      temDiagrama: !!resultado.diagramaGantt,
      quantidadeBlocos: resultado.diagramaGantt?.length || 0,
      exemploBloco: resultado.diagramaGantt?.[0]
    })
    // Temporariamente marcar como não preenchido para forçar o preenchimento
    if (diagramasGanttCenarios.value[nomeCenario]) {
      diagramasGanttCenarios.value[nomeCenario].preenchido = false
    }
    preencherDiagramaCenario(nomeCenario, resultado)
  })
  
  Object.entries(resultadosSequenciais.value || {}).forEach(([nomeCenario, resultado]) => {
    console.log(`🔍 Tentando preencher ${nomeCenario} com dados sequenciais:`, {
      temDiagrama: !!resultado.diagramaGantt,
      quantidadeBlocos: resultado.diagramaGantt?.length || 0,
      exemploBloco: resultado.diagramaGantt?.[0]
    })
    // Temporariamente marcar como não preenchido para forçar o preenchimento
    if (diagramasGanttCenarios.value[nomeCenario]) {
      diagramasGanttCenarios.value[nomeCenario].preenchido = false
    }
    preencherDiagramaCenario(nomeCenario, resultado)
  })
  
  // Debug final
  console.log(`📊 Estado final dos diagramas após forçar preenchimento:`, diagramasGanttCenarios.value)
}

const limparTodosDiagramas = () => {
  Object.keys(diagramasGanttCenarios.value).forEach(cenario => {
    limparDiagramaCenario(cenario)
  })
  // Resetar escala quando todos os diagramas são limpos
  resetarEscalaTempoFixa()
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

// Função para obter blocos do diagrama dedicado do cenário
const obterBlocosDiagramaDedicado = (nomeCenario: string, medicoId: string) => {
  const diagrama = diagramasGanttCenarios.value[nomeCenario]

  if (!diagrama || !diagrama.preenchido || diagrama.blocos.length === 0) {
    console.warn(`⚠️ Diagrama de ${nomeCenario} não está preenchido ou está vazio`)
    return []
  }



  const medicoIdLower = medicoId.toLowerCase().trim()

  // Usar a mesma lógica de filtragem robusta
  const blocosFiltrados = diagrama.blocos.filter(bloco => {
    if (!bloco || !bloco.medico) {
      console.warn(`⚠️ Bloco inválido:`, bloco)
      return false
    }

    const medicoNomeBloco = bloco.medico.toLowerCase().trim()

    // Estratégias de matching mais permissivas
    const estrategias = [
      // 1. Match exato
      () => medicoNomeBloco === medicoIdLower,
      
      // 2. Match por ID numérico
      () => {
        const numeroId = medicoId.match(/\d+/)?.[0]
        const numeroBloco = bloco.medico.match(/\d+/)?.[0]
        return numeroId && numeroBloco && numeroId === numeroBloco
      },
      
      // 3. Match por conteúdo parcial
      () => medicoNomeBloco.includes(medicoIdLower) || medicoIdLower.includes(medicoNomeBloco),
      
      // 4. Match por palavras-chave específicas
      () => {
        const palavrasChave = ['dr.', 'dra.', 'doutor', 'doutora', 'medico', 'dr', 'médico']
        return palavrasChave.some(palavra =>
          (medicoNomeBloco.includes(palavra) && medicoIdLower.includes(palavra)) ||
          (medicoNomeBloco.includes('dr') && medicoIdLower.includes('dr'))
        )
      },
      
      // 5. Match por letra final (Dr. A -> A)
      () => {
        const letraId = medicoId.match(/[a-zA-Z]$/)?.[0]?.toLowerCase()
        const letraBloco = bloco.medico.match(/[a-zA-Z]$/)?.[0]?.toLowerCase()
        return letraId && letraBloco && letraId === letraBloco
      },
      
      // 6. Match menos restritivo - qualquer letra em comum no final
      () => {
        const ultimaLetraId = medicoId.charAt(medicoId.length - 1).toLowerCase()
        const ultimaLetraBloco = bloco.medico.charAt(bloco.medico.length - 1).toLowerCase()
        return ultimaLetraId && ultimaLetraBloco && ultimaLetraId === ultimaLetraBloco && /[a-z]/.test(ultimaLetraId)
      }
    ]

    const match = estrategias.some((estrategia, indice) => {
      try {
        const resultado = estrategia()
        if (resultado) {
          // Match encontrado
        }
        return resultado
      } catch (error) {
        console.warn(`Erro na estratégia ${indice + 1}:`, error)
        return false
      }
    })

    return match
  })
    .sort((a, b) => a.inicio - b.inicio)

  // Se não encontrou blocos, tentar fallback por posição do médico
  if (blocosFiltrados.length === 0 && diagrama.medicos.length > 0) {
    console.warn(`⚠️ Não encontrou blocos com matching tradicional, tentando fallback por posição`)
    
    const indiceMedico = diagrama.medicos.findIndex(m => 
      m.id === medicoId || m.nome === medicoId || m.id?.toLowerCase() === medicoIdLower
    )
    
    if (indiceMedico >= 0) {
      // Tentar pegar todos os blocos e dividir igualmente entre os médicos
      const todosBlocos = diagrama.blocos
      const blocosPorMedico = Math.ceil(todosBlocos.length / diagrama.medicos.length)
      const inicio = indiceMedico * blocosPorMedico
      const fim = Math.min(inicio + blocosPorMedico, todosBlocos.length)
      
      const blocosFallback = todosBlocos.slice(inicio, fim)
      
      console.log(`🔧 Fallback por posição - Médico ${indiceMedico}: blocos ${inicio}-${fim-1} (${blocosFallback.length} blocos)`)
      
      if (blocosFallback.length > 0) {
        return blocosFallback.sort((a, b) => a.inicio - b.inicio)
      }
    }
    
    // Último recurso: pegar qualquer bloco que mencione o médico de forma relaxada
    const blocosRelaxados = diagrama.blocos.filter(bloco => {
      const textoBloco = (bloco.medico || '').toLowerCase()
      const textoMedico = medicoIdLower
      
      // Matching super relaxado - qualquer substring em comum
      return textoBloco.length > 0 && textoMedico.length > 0 && (
        textoBloco.includes(textoMedico) || 
        textoMedico.includes(textoBloco) ||
        // Matching por primeira letra se for um médico tipo "Dr. A"
        (textoMedico.endsWith('a') && textoBloco.includes('a')) ||
        (textoMedico.endsWith('b') && textoBloco.includes('b')) ||
        (textoMedico.endsWith('c') && textoBloco.includes('c'))
      )
    })
    
    console.log(`🔧 Fallback relaxado encontrou ${blocosRelaxados.length} blocos`)
    
    if (blocosRelaxados.length > 0) {
      return blocosRelaxados.sort((a, b) => a.inicio - b.inicio)
    }
  }



  return blocosFiltrados
}

// Função para debug simples de diagramas
const debugMedicoBloco = (nomeCenario: string) => {
  const diagrama = diagramasGanttCenarios.value[nomeCenario]
  
  if (!diagrama) {
    console.log(`❌ Diagrama ${nomeCenario} não existe`)
    return
  }
  
  console.log(`� ${nomeCenario}:`, {
    preenchido: diagrama.preenchido,
    blocos: diagrama.blocos.length,
    medicos: diagrama.medicos.length,
    tempoTotal: diagrama.tempoTotal,
    escalaComum: obterTempoEscalaComum()
  })
}

// Função para debug dos diagramas
const debugNormalizacao = () => {
  console.log('\n🔍 DEBUG DIAGRAMAS FINAIS:')
  console.log(`   🎨 Modo atual: ${modoVisualizacao} (sempre tempos originais)`)
  
  Object.keys(diagramasGanttCenarios.value).forEach(nomeCenario => {
    const diagrama = diagramasGanttCenarios.value[nomeCenario]
    if (!diagrama.preenchido) return
    
    console.log(`\n📋 CENÁRIO: ${nomeCenario}`)
    console.log(`   🕐 Tempo total: ${diagrama.tempoTotal}ms`)
    console.log(`   📊 Escala visualização: ${obterEscalaTempoVisualizacao(nomeCenario)}ms`)
    
    diagrama.medicos.forEach(medico => {
      const blocos = obterBlocosDiagramaDedicado(nomeCenario, medico.id)
      
      if (blocos.length > 0) {
        const tempoMin = Math.min(...blocos.map(b => b.inicio))
        const tempoMax = Math.max(...blocos.map(b => b.fim))
        
        console.log(`   👨‍⚕️ ${medico.nome}:`)
        console.log(`      📊 ${blocos.length} blocos`)
        console.log(`      ⏰ Período: ${tempoMin}ms - ${tempoMax}ms`)
        
        // Mostrar alguns blocos de exemplo
        blocos.slice(0, 2).forEach((bloco, i) => {
          console.log(`         [${i}] ${bloco.processo}: ${bloco.inicio}-${bloco.fim}ms (${bloco.fim - bloco.inicio}ms)`)
        })
      }
    })
  })
  
  console.log(`\n⚖️ Escalas:`)
  console.log(`   🌐 Fixa global: ${escalaTempoFixa.value}ms`)
  console.log(`   📏 Absoluta: ${obterTempoEscalaComum()}ms`)
  Object.keys(diagramasGanttCenarios.value).forEach(cenario => {
    console.log(`   📐 ${cenario} alinhada: ${obterTempoMaximoNormalizado(cenario)}ms`)
    console.log(`   🌍 ${cenario} tempo mínimo global: ${obterTempoMinimoGlobal(cenario)}ms`)
  })
}

// Função detalhada para debug de alinhamento de blocos
const debugAlinhamentoBlocos = (nomeCenario: string) => {
  const diagrama = diagramasGanttCenarios.value[nomeCenario]
  
  if (!diagrama || !diagrama.preenchido) {
    console.log(`❌ Diagrama ${nomeCenario} não preenchido`)
    return
  }
  
  console.log(`🔍 DEBUG TEMPOS ORIGINAIS - ${nomeCenario}:`)
  console.log(`   📊 Escala fixa: ${escalaTempoFixa.value}ms`)
  console.log(`   ⏱️ Tempo total cenário: ${diagrama.tempoTotal}ms`)
  console.log(`   🎯 Escala comum: ${obterTempoEscalaComum()}ms`)
  console.log(`   🎨 Modo atual: ${modoVisualizacao}`)
  console.log(`   ⚖️ Escala ativa: ${obterEscalaTempoVisualizacao(nomeCenario)}ms`)
  
  // Analisar distribuição dos tempos dos blocos
  const todosTempos = diagrama.blocos.map(b => ({ inicio: b.inicio, fim: b.fim }))
  const tempoMinimo = Math.min(...todosTempos.map(t => t.inicio))
  const tempoMaximo = Math.max(...todosTempos.map(t => t.fim))
  
  console.log(`   📈 Range temporal dos blocos: ${tempoMinimo}ms - ${tempoMaximo}ms`)
  console.log(`   🎨 Total de ${diagrama.blocos.length} blocos`)
  
  // Analisar cada médico
  diagrama.medicos.forEach(medico => {
    const blocosDoMedico = obterBlocosDiagramaDedicado(nomeCenario, medico.id)
    
    if (blocosDoMedico.length > 0) {
      const primeiroBloco = blocosDoMedico[0]
      const ultimoBloco = blocosDoMedico[blocosDoMedico.length - 1]
      
      // Calcular posições visuais
      const posicaoInicialVisual = (primeiroBloco.inicio / obterTempoEscalaComum()) * 100
      const posicaoFinalVisual = (ultimoBloco.fim / obterTempoEscalaComum()) * 100
      
      // Dados normalizados
      const blocosNormalizados = normalizarBlocosPorMedico(nomeCenario, medico.id)
      const primeiroNorm = blocosNormalizados[0]
      const ultimoNorm = blocosNormalizados[blocosNormalizados.length - 1]
      
      console.log(`   👨‍⚕️ ${medico.nome} (${medico.id}):`)
      console.log(`      🔹 ${blocosDoMedico.length} blocos`)
      console.log(`      🔹 Tempo absoluto: ${primeiroBloco.inicio}ms - ${ultimoBloco.fim}ms`)
      console.log(`      🔹 Tempo normalizado: ${primeiroNorm.inicioNormalizado}ms - ${ultimoNorm.fimNormalizado}ms`)
      console.log(`      🔹 Posição visual absoluta: ${posicaoInicialVisual.toFixed(1)}% - ${posicaoFinalVisual.toFixed(1)}%`)
      
      const posVisualNormInicio = (primeiroNorm.inicioNormalizado / obterTempoMaximoNormalizado(nomeCenario)) * 100
      const posVisualNormFim = (ultimoNorm.fimNormalizado / obterTempoMaximoNormalizado(nomeCenario)) * 100
      console.log(`      🔹 Posição visual normalizada: ${posVisualNormInicio.toFixed(1)}% - ${posVisualNormFim.toFixed(1)}%`)
      
      // Listar primeiros blocos para debug
      blocosDoMedico.slice(0, 3).forEach((bloco, i) => {
        const posLeft = (bloco.inicio / obterTempoEscalaComum()) * 100
        const width = ((bloco.fim - bloco.inicio) / obterTempoEscalaComum()) * 100
        console.log(`         [${i}] ${bloco.processo}: ${bloco.inicio}-${bloco.fim}ms (left: ${posLeft.toFixed(1)}%, width: ${width.toFixed(1)}%)`)
      })
    } else {
      console.log(`   👨‍⚕️ ${medico.nome} (${medico.id}): ❌ Nenhum bloco encontrado`)
    }
  })
}



// Função para obter blocos do diagrama final (estado capturado)
const obterBlocosGanttFinal = (nomeCenario: string, nomemedico: string) => {
  const diagrama = diagramasGanttCenarios.value[nomeCenario]
  if (!diagrama || !diagrama.blocos) return []
  
  return diagrama.blocos
    .filter(bloco => bloco.medico === nomemedico || bloco.medico.toLowerCase().includes(nomemedico.toLowerCase()))
    .sort((a, b) => a.inicio - b.inicio)
}

// Carregar diagramas e inicializar quando o componente é montado
inicializarDiagramasCenarios()
carregarDiagramasLocalStorage()

// Limpar interceptação ao sair da página
onUnmounted(() => {
  console.log = originalConsoleLog
})
</script>