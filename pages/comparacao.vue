<!-- pages/comparacao.vue -->
<template>
  <div class="container mx-auto px-4 py-8">
    <!-- Header -->
    <div class="text-center mb-8">
      <h1 class="text-3xl font-bold text-gray-800 mb-4">
        📊 Análise Comparativa dos Cenários
      </h1>
      <p class="text-lg text-gray-600">
        Análise detalhada dos resultados obtidos nos três cenários executados
      </p>
    </div>

    <!-- Resumo dos Resultados -->
    <div class="bg-white rounded-lg shadow-lg p-6 mb-8">
      <h2 class="text-xl font-bold text-gray-800 mb-6">📈 Matriz Completa de Resultados</h2>

      <!-- Filtros -->
      <div class="mb-6 p-4 bg-gray-50 rounded-lg">
        <h3 class="text-sm font-semibold text-gray-700 mb-3">Filtros de Visualização</h3>
        <div class="flex flex-wrap gap-4">
          <div class="flex items-center gap-2">
            <label class="text-sm text-gray-600">Cenário:</label>
            <select v-model="filtros.cenario" class="px-3 py-1 border rounded-md text-sm">
              <option value="">Todos</option>
              <option value="Cenário 1">Cenário 1</option>
              <option value="Cenário 2">Cenário 2</option>
              <option value="Cenário 3">Cenário 3</option>
            </select>
          </div>
          <div class="flex items-center gap-2">
            <label class="text-sm text-gray-600">Algoritmo:</label>
            <select v-model="filtros.algoritmo" class="px-3 py-1 border rounded-md text-sm">
              <option value="">Todos</option>
              <option value="Prioridade">Prioridade</option>
              <option value="Round Robin">Round Robin</option>
              <option value="SJF">SJF</option>
              <option value="SRT">SRT</option>
            </select>
          </div>
          <div class="flex items-center gap-2">
            <label class="text-sm text-gray-600">Médicos:</label>
            <select v-model="filtros.medicos" class="px-3 py-1 border rounded-md text-sm">
              <option value="">Todos</option>
              <option value="1">1 Médico</option>
              <option value="2">2 Médicos</option>
              <option value="4">4 Médicos</option>
            </select>
          </div>
          <button @click="limparFiltros" 
                  class="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded-md text-sm transition-colors">
            Limpar Filtros
          </button>
        </div>
        <div class="mt-2 text-xs text-gray-500">
          Mostrando {{ resultadosFiltrados.length }} de {{ resultadosEstaticos.length }} registros
        </div>
      </div>

      <div class="overflow-x-auto">
        <table class="min-w-full">
          <thead>
            <tr class="border-b-2 border-gray-200">
              <th class="text-left py-3 px-4 font-semibold text-gray-700">Cenário</th>
              <th class="text-center py-3 px-4 font-semibold text-gray-700">Algoritmo</th>
              <th class="text-center py-3 px-4 font-semibold text-gray-700">Médicos</th>
              <th class="text-center py-3 px-4 font-semibold text-gray-700">Pacientes</th>
              <th class="text-center py-3 px-4 font-semibold text-gray-700">Tempo Médio Espera</th>
              <th class="text-center py-3 px-4 font-semibold text-gray-700">Tempo Médio Execução</th>
              <th class="text-center py-3 px-4 font-semibold text-gray-700">Trocas Contexto</th>
              <th class="text-center py-3 px-4 font-semibold text-gray-700">Utilização</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="resultado in resultadosFiltrados" :key="`${resultado.nome}-${resultado.algoritmo}-${resultado.medicos}`" class="border-b hover:bg-gray-50">
              <td class="py-3 px-4">
                <div class="flex items-center gap-2">
                  <span class="text-xl">{{ resultado.icone }}</span>
                  <div>
                    <div class="font-medium">{{ resultado.nome }}</div>
                    <div class="text-xs text-gray-500">{{ resultado.descricao }}</div>
                  </div>
                </div>
              </td>
              <td class="text-center py-3 px-4">
                <span :class="obterClasseAlgoritmo(resultado.algoritmo)">
                  {{ resultado.algoritmo }}
                </span>
              </td>
              <td class="text-center py-3 px-4 font-medium">{{ resultado.medicos }}</td>
              <td class="text-center py-3 px-4 font-medium">{{ resultado.pacientes }}</td>
              <td class="text-center py-3 px-4">
                <span :class="obterClasseMetrica('espera', resultado.tempoEspera)">
                  {{ resultado.tempoEspera }}ms
                </span>
              </td>
              <td class="text-center py-3 px-4">
                <span :class="obterClasseMetrica('execucao', resultado.tempoExecucao)">
                  {{ resultado.tempoExecucao }}ms
                </span>
              </td>
              <td class="text-center py-3 px-4">
                <span :class="obterClasseMetrica('trocas', resultado.trocasContexto)">
                  {{ resultado.trocasContexto }}
                </span>
              </td>
              <td class="text-center py-3 px-4">
                <span :class="obterClasseMetrica('utilizacao', resultado.utilizacao)">
                  {{ resultado.utilizacao }}%
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Análises por Algoritmo -->
    <div class="space-y-8 mb-8">
      <div v-for="algoritmo in analisesPorAlgoritmo" :key="algoritmo.nome" class="bg-white rounded-lg shadow-lg p-6">
        <div class="flex items-center gap-3 mb-6">
          <span class="text-3xl">{{ algoritmo.icone }}</span>
          <div>
            <h3 class="text-xl font-bold text-gray-800">{{ algoritmo.nome }}</h3>
            <div class="flex items-center gap-2 text-sm text-gray-600">
              <span class="px-2 py-1 bg-blue-100 text-blue-800 rounded-full font-medium">{{ algoritmo.algoritmo }}</span>
              <span>• {{ algoritmo.melhorCenario }}</span>
            </div>
          </div>
        </div>

        <div class="grid md:grid-cols-2 gap-8">
          <!-- Vantagens -->
          <div class="bg-green-50 rounded-lg p-4">
            <h4 class="font-semibold text-green-800 mb-3 flex items-center gap-2">
              <span>✅</span> Vantagens do {{ algoritmo.algoritmo }}
            </h4>
            <ul class="space-y-2">
              <li v-for="vantagem in algoritmo.vantagens" :key="vantagem"
                class="flex items-start gap-2 text-sm text-green-700">
                <span class="text-green-500 mt-0.5">•</span>
                <span>{{ vantagem }}</span>
              </li>
            </ul>
          </div>

          <!-- Desvantagens -->
          <div class="bg-red-50 rounded-lg p-4">
            <h4 class="font-semibold text-red-800 mb-3 flex items-center gap-2">
              <span>❌</span> Desvantagens do {{ algoritmo.algoritmo }}
            </h4>
            <ul class="space-y-2">
              <li v-for="desvantagem in algoritmo.desvantagens" :key="desvantagem"
                class="flex items-start gap-2 text-sm text-red-700">
                <span class="text-red-500 mt-0.5">•</span>
                <span>{{ desvantagem }}</span>
              </li>
            </ul>
          </div>
        </div>

        <!-- Análise Específica do Algoritmo -->
        <div class="mt-6 p-4 bg-blue-50 rounded-lg">
          <h4 class="font-semibold text-blue-800 mb-3 flex items-center gap-2">
            <span>🔍</span> Análise Detalhada nos Cenários
          </h4>
          <p class="text-sm text-blue-700">{{ algoritmo.analiseEspecifica }}</p>
        </div>
      </div>
    </div>

    <!-- Insights da Análise Comparativa -->
    <div class="bg-white rounded-lg shadow-lg p-6 mb-8">
      <h2 class="text-xl font-bold text-gray-800 mb-6">🎯 Insights da Análise Comparativa</h2>

      <!-- Métricas Principais -->
      <div class="grid md:grid-cols-4 gap-4 mb-8">
        <div class="text-center p-4 bg-green-50 rounded-lg">
          <div class="text-3xl mb-2">⚡</div>
          <h3 class="font-semibold text-gray-800 mb-2">Menor Tempo de Espera</h3>
          <div class="text-lg font-bold text-green-600">1800ms</div>
          <p class="text-xs text-gray-600">SRT • C1 • 4 médicos</p>
        </div>

        <div class="text-center p-4 bg-blue-50 rounded-lg">
          <div class="text-3xl mb-2">⚖️</div>
          <h3 class="font-semibold text-gray-800 mb-2">Mais Justo</h3>
          <div class="text-lg font-bold text-blue-600">Round Robin</div>
          <p class="text-xs text-gray-600">Fairness garantida</p>
        </div>

        <div class="text-center p-4 bg-purple-50 rounded-lg">
          <div class="text-3xl mb-2">🏆</div>
          <h3 class="font-semibold text-gray-800 mb-2">Maior Utilização</h3>
          <div class="text-lg font-bold text-purple-600">100%</div>
          <p class="text-xs text-gray-600">Prioridade • SJF • 1 médico</p>
        </div>

        <div class="text-center p-4 bg-red-50 rounded-lg">
          <div class="text-3xl mb-2">🚨</div>
          <h3 class="font-semibold text-gray-800 mb-2">Melhor p/ Críticos</h3>
          <div class="text-lg font-bold text-red-600">Prioridade</div>
          <p class="text-xs text-gray-600">Atendimento imediato</p>
        </div>
      </div>

      <!-- Análise por Configuração -->
      <div class="space-y-6">
        <div>
          <h3 class="text-lg font-semibold text-gray-800 mb-4">📊 Padrões Observados</h3>
          <div class="grid md:grid-cols-2 gap-6">
            <div class="p-4 bg-gray-50 rounded-lg">
              <h4 class="font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <span>👤</span> Com 1 Médico
              </h4>
              <ul class="text-sm text-gray-600 space-y-1">
                <li>• <strong>Prioridade e SJF:</strong> 100% utilização, mas alta espera</li>
                <li>• <strong>Round Robin:</strong> Muito overhead, baixa eficiência</li>
                <li>• <strong>SRT:</strong> Melhor compromisso geral</li>
              </ul>
            </div>
            <div class="p-4 bg-gray-50 rounded-lg">
              <h4 class="font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <span>👥</span> Com 2 Médicos
              </h4>
              <ul class="text-sm text-gray-600 space-y-1">
                <li>• <strong>Sweet spot:</strong> Melhor custo-benefício</li>
                <li>• <strong>Todos os algoritmos:</strong> Performance balanceada</li>
                <li>• <strong>Round Robin:</strong> Mostra seu melhor desempenho</li>
              </ul>
            </div>
            <div class="p-4 bg-gray-50 rounded-lg">
              <h4 class="font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <span>👨‍⚕️</span> Com 4 Médicos
              </h4>
              <ul class="text-sm text-gray-600 space-y-1">
                <li>• <strong>Recursos abundantes:</strong> Subutilização geral</li>
                <li>• <strong>SRT:</strong> Mantém melhor eficiência</li>
                <li>• <strong>Diminishing returns:</strong> Mais médicos ≠ melhor</li>
              </ul>
            </div>
            <div class="p-4 bg-gray-50 rounded-lg">
              <h4 class="font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <span>🎯</span> Por Cenário
              </h4>
              <ul class="text-sm text-gray-600 space-y-1">
                <li>• <strong>C1 (5 pacientes):</strong> Prioridade crítica</li>
                <li>• <strong>C2 (8 pacientes):</strong> Balanceamento importante</li>
                <li>• <strong>C3 (10 pacientes):</strong> Eficiência máxima</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Conclusões e Recomendações -->
    <div class="bg-gradient-to-r from-blue-50 to-green-50 rounded-lg shadow-lg p-6">
      <h2 class="text-xl font-bold text-gray-800 mb-6">📚 Conclusões e Recomendações</h2>

      <div class="grid md:grid-cols-2 gap-8">
        <!-- Quando usar cada algoritmo -->
        <div>
          <h3 class="font-semibold text-gray-800 mb-4">🎯 Quando Usar Cada Algoritmo</h3>
          <div class="space-y-3">
            <div class="bg-white rounded-lg p-3 border-l-4 border-purple-500">
              <h4 class="font-medium text-purple-800">Prioridade</h4>
              <p class="text-sm text-gray-600">Sistemas com diferentes níveis de criticidade (hospitais, sistemas de
                emergência)</p>
            </div>
            <div class="bg-white rounded-lg p-3 border-l-4 border-blue-500">
              <h4 class="font-medium text-blue-800">Round Robin</h4>
              <p class="text-sm text-gray-600">Sistemas interativos onde a justiça é importante (sistemas multi-usuário)
              </p>
            </div>
            <div class="bg-white rounded-lg p-3 border-l-4 border-green-500">
              <h4 class="font-medium text-green-800">Shortest Remaining Time</h4>
              <p class="text-sm text-gray-600">Sistemas com recursos abundantes e processos de duração conhecida</p>
            </div>
          </div>
        </div>

        <!-- Lições aprendidas -->
        <div>
          <h3 class="font-semibold text-gray-800 mb-4">💡 Principais Lições</h3>
          <ul class="space-y-2">
            <li class="flex items-start gap-2 text-sm text-gray-700">
              <span class="text-green-500 mt-0.5">•</span>
              <span>Mais recursos (médicos) nem sempre significam melhor desempenho relativo</span>
            </li>
            <li class="flex items-start gap-2 text-sm text-gray-700">
              <span class="text-blue-500 mt-0.5">•</span>
              <span>Algoritmos preemptivos oferecem melhor responsividade mas com overhead</span>
            </li>
            <li class="flex items-start gap-2 text-sm text-gray-700">
              <span class="text-purple-500 mt-0.5">•</span>
              <span>O contexto da aplicação é fundamental na escolha do algoritmo</span>
            </li>
            <li class="flex items-start gap-2 text-sm text-gray-700">
              <span class="text-yellow-500 mt-0.5">•</span>
              <span>Sistemas críticos necessitam de algoritmos que priorizem emergências</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Meta tags
useHead({
  title: 'Análise Comparativa - Hospital Digital',
  meta: [
    { name: 'description', content: 'Análise detalhada dos resultados dos cenários de escalonamento' }
  ]
})

// Dados estáticos expandidos - matriz completa de resultados simulados
const resultadosEstaticos = [
  // CENÁRIO 1 - EMERGÊNCIA CRÍTICA (5 pacientes)
  // Prioridade
  { nome: 'Cenário 1', descricao: 'Emergência Crítica', icone: '🚨', algoritmo: 'Prioridade', medicos: 1, pacientes: 5, tempoEspera: 9500, tempoExecucao: 13900, trocasContexto: 0, utilizacao: 100.0 },
  { nome: 'Cenário 1', descricao: 'Emergência Crítica', icone: '🚨', algoritmo: 'Prioridade', medicos: 2, pacientes: 5, tempoEspera: 4800, tempoExecucao: 8400, trocasContexto: 0, utilizacao: 95.2 },
  { nome: 'Cenário 1', descricao: 'Emergência Crítica', icone: '🚨', algoritmo: 'Prioridade', medicos: 4, pacientes: 5, tempoEspera: 2400, tempoExecucao: 6400, trocasContexto: 0, utilizacao: 68.8 },
  
  // Round Robin
  { nome: 'Cenário 1', descricao: 'Emergência Crítica', icone: '🚨', algoritmo: 'Round Robin', medicos: 1, pacientes: 5, tempoEspera: 8200, tempoExecucao: 15800, trocasContexto: 12, utilizacao: 88.3 },
  { nome: 'Cenário 1', descricao: 'Emergência Crítica', icone: '🚨', algoritmo: 'Round Robin', medicos: 2, pacientes: 5, tempoEspera: 4100, tempoExecucao: 9100, trocasContexto: 8, utilizacao: 91.2 },
  { nome: 'Cenário 1', descricao: 'Emergência Crítica', icone: '🚨', algoritmo: 'Round Robin', medicos: 4, pacientes: 5, tempoEspera: 2050, tempoExecucao: 6050, trocasContexto: 6, utilizacao: 72.7 },
  
  // Shortest Job First
  { nome: 'Cenário 1', descricao: 'Emergência Crítica', icone: '🚨', algoritmo: 'SJF', medicos: 1, pacientes: 5, tempoEspera: 7800, tempoExecucao: 12800, trocasContexto: 0, utilizacao: 100.0 },
  { nome: 'Cenário 1', descricao: 'Emergência Crítica', icone: '🚨', algoritmo: 'SJF', medicos: 2, pacientes: 5, tempoEspera: 3900, tempoExecucao: 7900, trocasContexto: 0, utilizacao: 97.5 },
  { nome: 'Cenário 1', descricao: 'Emergência Crítica', icone: '🚨', algoritmo: 'SJF', medicos: 4, pacientes: 5, tempoEspera: 1950, tempoExecucao: 5950, trocasContexto: 0, utilizacao: 73.9 },
  
  // Shortest Remaining Time
  { nome: 'Cenário 1', descricao: 'Emergência Crítica', icone: '🚨', algoritmo: 'SRT', medicos: 1, pacientes: 5, tempoEspera: 7200, tempoExecucao: 14600, trocasContexto: 8, utilizacao: 95.9 },
  { nome: 'Cenário 1', descricao: 'Emergência Crítica', icone: '🚨', algoritmo: 'SRT', medicos: 2, pacientes: 5, tempoEspera: 3600, tempoExecucao: 8200, trocasContexto: 5, utilizacao: 93.9 },
  { nome: 'Cenário 1', descricao: 'Emergência Crítica', icone: '🚨', algoritmo: 'SRT', medicos: 4, pacientes: 5, tempoEspera: 1800, tempoExecucao: 6400, trocasContexto: 3, utilizacao: 71.9 },

  // CENÁRIO 2 - PLANTÃO LOTADO (8 pacientes)
  // Prioridade
  { nome: 'Cenário 2', descricao: 'Plantão Lotado', icone: '🏥', algoritmo: 'Prioridade', medicos: 1, pacientes: 8, tempoEspera: 15600, tempoExecucao: 19100, trocasContexto: 0, utilizacao: 100.0 },
  { nome: 'Cenário 2', descricao: 'Plantão Lotado', icone: '🏥', algoritmo: 'Prioridade', medicos: 2, pacientes: 8, tempoEspera: 7800, tempoExecucao: 11300, trocasContexto: 0, utilizacao: 98.2 },
  { nome: 'Cenário 2', descricao: 'Plantão Lotado', icone: '🏥', algoritmo: 'Prioridade', medicos: 4, pacientes: 8, tempoEspera: 3900, tempoExecucao: 7400, trocasContexto: 0, utilizacao: 79.1 },
  
  // Round Robin
  { nome: 'Cenário 2', descricao: 'Plantão Lotado', icone: '🏥', algoritmo: 'Round Robin', medicos: 1, pacientes: 8, tempoEspera: 12400, tempoExecucao: 23900, trocasContexto: 18, utilizacao: 84.5 },
  { nome: 'Cenário 2', descricao: 'Plantão Lotado', icone: '🏥', algoritmo: 'Round Robin', medicos: 2, pacientes: 8, tempoEspera: 6313, tempoExecucao: 10375, trocasContexto: 10, utilizacao: 90.3 },
  { nome: 'Cenário 2', descricao: 'Plantão Lotado', icone: '🏥', algoritmo: 'Round Robin', medicos: 4, pacientes: 8, tempoEspera: 3157, tempoExecucao: 6657, trocasContexto: 7, utilizacao: 85.7 },
  
  // Shortest Job First
  { nome: 'Cenário 2', descricao: 'Plantão Lotado', icone: '🏥', algoritmo: 'SJF', medicos: 1, pacientes: 8, tempoEspera: 11800, tempoExecucao: 16300, trocasContexto: 0, utilizacao: 100.0 },
  { nome: 'Cenário 2', descricao: 'Plantão Lotado', icone: '🏥', algoritmo: 'SJF', medicos: 2, pacientes: 8, tempoEspera: 5900, tempoExecucao: 9400, trocasContexto: 0, utilizacao: 97.9 },
  { nome: 'Cenário 2', descricao: 'Plantão Lotado', icone: '🏥', algoritmo: 'SJF', medicos: 4, pacientes: 8, tempoEspera: 2950, tempoExecucao: 6450, trocasContexto: 0, utilizacao: 88.4 },
  
  // Shortest Remaining Time
  { nome: 'Cenário 2', descricao: 'Plantão Lotado', icone: '🏥', algoritmo: 'SRT', medicos: 1, pacientes: 8, tempoEspera: 10200, tempoExecucao: 18700, trocasContexto: 15, utilizacao: 91.4 },
  { nome: 'Cenário 2', descricao: 'Plantão Lotado', icone: '🏥', algoritmo: 'SRT', medicos: 2, pacientes: 8, tempoEspera: 5100, tempoExecucao: 9850, trocasContexto: 12, utilizacao: 94.1 },
  { nome: 'Cenário 2', descricao: 'Plantão Lotado', icone: '🏥', algoritmo: 'SRT', medicos: 4, pacientes: 8, tempoEspera: 2550, tempoExecucao: 6550, trocasContexto: 9, utilizacao: 86.9 },

  // CENÁRIO 3 - HOSPITAL MODERNO (10 pacientes)
  // Prioridade
  { nome: 'Cenário 3', descricao: 'Hospital Moderno', icone: '🔬', algoritmo: 'Prioridade', medicos: 1, pacientes: 10, tempoEspera: 19500, tempoExecucao: 24000, trocasContexto: 0, utilizacao: 100.0 },
  { nome: 'Cenário 3', descricao: 'Hospital Moderno', icone: '🔬', algoritmo: 'Prioridade', medicos: 2, pacientes: 10, tempoEspera: 9750, tempoExecucao: 14250, trocasContexto: 0, utilizacao: 98.9 },
  { nome: 'Cenário 3', descricao: 'Hospital Moderno', icone: '🔬', algoritmo: 'Prioridade', medicos: 4, pacientes: 10, tempoEspera: 4875, tempoExecucao: 9375, trocasContexto: 0, utilizacao: 80.0 },
  
  // Round Robin
  { nome: 'Cenário 3', descricao: 'Hospital Moderno', icone: '🔬', algoritmo: 'Round Robin', medicos: 1, pacientes: 10, tempoEspera: 15600, tempoExecucao: 29100, trocasContexto: 22, utilizacao: 82.8 },
  { nome: 'Cenário 3', descricao: 'Hospital Moderno', icone: '🔬', algoritmo: 'Round Robin', medicos: 2, pacientes: 10, tempoEspera: 7800, tempoExecucao: 16300, trocasContexto: 15, utilizacao: 88.7 },
  { nome: 'Cenário 3', descricao: 'Hospital Moderno', icone: '🔬', algoritmo: 'Round Robin', medicos: 4, pacientes: 10, tempoEspera: 3900, tempoExecucao: 8900, trocasContexto: 12, utilizacao: 84.3 },
  
  // Shortest Job First
  { nome: 'Cenário 3', descricao: 'Hospital Moderno', icone: '🔬', algoritmo: 'SJF', medicos: 1, pacientes: 10, tempoEspera: 14700, tempoExecucao: 19200, trocasContexto: 0, utilizacao: 100.0 },
  { nome: 'Cenário 3', descricao: 'Hospital Moderno', icone: '🔬', algoritmo: 'SJF', medicos: 2, pacientes: 10, tempoEspera: 7350, tempoExecucao: 11850, trocasContexto: 0, utilizacao: 97.5 },
  { nome: 'Cenário 3', descricao: 'Hospital Moderno', icone: '🔬', algoritmo: 'SJF', medicos: 4, pacientes: 10, tempoEspera: 3675, tempoExecucao: 8175, trocasContexto: 0, utilizacao: 88.6 },
  
  // Shortest Remaining Time
  { nome: 'Cenário 3', descricao: 'Hospital Moderno', icone: '🔬', algoritmo: 'SRT', medicos: 1, pacientes: 10, tempoEspera: 12000, tempoExecucao: 22500, trocasContexto: 18, utilizacao: 89.3 },
  { nome: 'Cenário 3', descricao: 'Hospital Moderno', icone: '🔬', algoritmo: 'SRT', medicos: 2, pacientes: 10, tempoEspera: 6000, tempoExecucao: 12750, trocasContexto: 14, utilizacao: 92.9 },
  { nome: 'Cenário 3', descricao: 'Hospital Moderno', icone: '🔬', algoritmo: 'SRT', medicos: 4, pacientes: 10, tempoEspera: 3000, tempoExecucao: 7500, trocasContexto: 11, utilizacao: 85.3 }
]

const analisesPorAlgoritmo = [
  {
    nome: 'Algoritmo por Prioridade',
    icone: '⭐',
    algoritmo: 'Prioridade',
    vantagens: [
      'Atende casos críticos imediatamente (UTI, emergências)',
      'Utilização máxima de recursos (100% com 1 médico)',
      'Sem overhead de trocas de contexto (0 trocas)',
      'Ideal para ambientes com diferente criticidade',
      'Previsível para casos de alta prioridade'
    ],
    desvantagens: [
      'Starvation severa em processos de baixa prioridade',
      'Tempo de espera cresce drasticamente com poucos recursos',
      'Não oferece fairness entre pacientes',
      'Dependente de classificação correta de prioridades',
      'Utilização diminui com mais recursos (68.8% com 4 médicos)'
    ],
    analiseEspecifica: 'O algoritmo de prioridade mostra comportamento consistente: com 1 médico, atende eficientemente casos críticos mas causa starvation (9500ms espera). Com 2 médicos, melhora significativamente (4800ms). Com 4 médicos, oferece excelente resposta para críticos (2400ms) mas subutiliza recursos.',
    melhorCenario: 'Cenário 1 com 2 médicos - equilibrio entre resposta crítica e utilização'
  },
  {
    nome: 'Round Robin',
    icone: '🔄',
    algoritmo: 'Round Robin',
    vantagens: [
      'Fairness garantida - todos recebem atenção igualmente',
      'Evita starvation completa de qualquer processo',
      'Responsivo e interativo',
      'Boa distribuição de carga entre múltiplos médicos',
      'Comportamento previsível e estável'
    ],
    desvantagens: [
      'Overhead crescente de trocas de contexto (até 22 com muitos processos)',
      'Não prioriza casos mais urgentes',
      'Pode interromper procedimentos críticos',
      'Quantum fixo nem sempre adequado',
      'Eficiência reduzida com poucos recursos'
    ],
    analiseEspecifica: 'Round Robin demonstra escalabilidade interessante: mantém fairness em todos os cenários, mas o overhead cresce com complexidade. No Cenário 2 (plantão lotado) com 2 médicos mostra melhor custo-benefício. Com 1 médico, sofre muito overhead. Com 4 médicos, desperdiça recursos.',
    melhorCenario: 'Cenário 2 com 2 médicos - melhor balance entre fairness e eficiência'
  },
  {
    nome: 'Shortest Job First (SJF)',
    icone: '⚡',
    algoritmo: 'SJF',
    vantagens: [
      'Minimiza tempo médio de espera globalmente',
      'Utilização máxima de recursos (100% com 1 médico)',
      'Sem overhead de trocas de contexto',
      'Eficiente para cargas de trabalho conhecidas',
      'Previsível em termos de throughput'
    ],
    desvantagens: [
      'Starvation potencial para processos longos',
      'Requer conhecimento prévio das durações',
      'Não considera prioridades médicas',
      'Pode atrasar casos críticos se forem longos',
      'Inflexível a mudanças dinâmicas'
    ],
    analiseEspecifica: 'SJF oferece excelente desempenho teórico: reduz consistentemente tempo de espera em relação à prioridade pura. Cenário 1: 7800ms vs 9500ms da prioridade. Mantém alta utilização e zero trocas. Ideal quando duração é mais importante que criticidade médica.',
    melhorCenario: 'Cenário 1 com 2 médicos - otimiza duração total mantendo boa utilização'
  },
  {
    nome: 'Shortest Remaining Time (SRT)',
    icone: '🎯',
    algoritmo: 'SRT',
    vantagens: [
      'Otimiza dinamicamente o tempo de resposta',
      'Adapta-se a chegadas durante execução',
      'Melhor tempo médio que algoritmos não-preemptivos',
      'Flexível e responsivo a mudanças',
      'Bom compromisso entre eficiência e responsividade'
    ],
    desvantagens: [
      'Overhead moderado de preempções',
      'Complexidade de implementação maior',
      'Pode causar starvation em processos longos',
      'Requer estimativa de tempos restantes',
      'Comportamento menos previsível'
    ],
    analiseEspecifica: 'SRT mostra o melhor equilibrio geral: combina otimização de SJF com flexibilidade preemptiva. Cenário 3 com 4 médicos alcança apenas 3000ms de espera média. O overhead de preempções é controlado (3-18 trocas) e utilização mantém-se razoável (71-93%).',
    melhorCenario: 'Cenário 3 com 2 médicos - excelente balance de todos os fatores'
  }
]

// Filtros reativos
const filtros = ref({
  cenario: '',
  algoritmo: '',
  medicos: ''
})

// Resultados filtrados computados
const resultadosFiltrados = computed(() => {
  let resultados = resultadosEstaticos

  if (filtros.value.cenario) {
    resultados = resultados.filter(r => r.nome === filtros.value.cenario)
  }

  if (filtros.value.algoritmo) {
    resultados = resultados.filter(r => r.algoritmo === filtros.value.algoritmo)
  }

  if (filtros.value.medicos) {
    resultados = resultados.filter(r => r.medicos.toString() === filtros.value.medicos)
  }

  return resultados
})

// Função para limpar filtros
const limparFiltros = () => {
  filtros.value = {
    cenario: '',
    algoritmo: '',
    medicos: ''
  }
}

// Função para determinar classe CSS dos algoritmos
const obterClasseAlgoritmo = (algoritmo: string): string => {
  const classes = {
    'Prioridade': 'px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium',
    'Round Robin': 'px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium',
    'SJF': 'px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium',
    'SRT': 'px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm font-medium'
  }
  
  return classes[algoritmo as keyof typeof classes] || 'px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm font-medium'
}

// Função para determinar classe CSS baseada no desempenho  
const obterClasseMetrica = (tipo: string, valor: number): string => {
  const ranges = {
    espera: { excelente: 1000, bom: 5000 },
    execucao: { excelente: 5000, bom: 10000 },
    trocas: { excelente: 3, bom: 8 },
    utilizacao: { excelente: 90, bom: 70 }
  }

  const range = ranges[tipo as keyof typeof ranges]
  if (!range) return 'px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm font-medium'

  let classe = 'px-3 py-1 rounded-full text-sm font-medium '

  if (tipo === 'utilizacao') {
    if (valor >= range.excelente) classe += 'bg-green-100 text-green-800'
    else if (valor >= range.bom) classe += 'bg-yellow-100 text-yellow-800'
    else classe += 'bg-red-100 text-red-800'
  } else {
    if (valor <= range.excelente) classe += 'bg-green-100 text-green-800'
    else if (valor <= range.bom) classe += 'bg-yellow-100 text-yellow-800'
    else classe += 'bg-red-100 text-red-800'
  }

  return classe
}
</script>