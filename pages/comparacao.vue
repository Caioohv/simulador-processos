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
      <h2 class="text-xl font-bold text-gray-800 mb-6">📈 Resumo dos Resultados</h2>
      
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
            <tr v-for="resultado in resultadosEstaticos" :key="resultado.nome" class="border-b hover:bg-gray-50">
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
                <span class="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
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

    <!-- Análises por Cenário -->
    <div class="space-y-8 mb-8">
      <div v-for="cenario in analisesCenarios" :key="cenario.nome" class="bg-white rounded-lg shadow-lg p-6">
        <div class="flex items-center gap-3 mb-6">
          <span class="text-3xl">{{ cenario.icone }}</span>
          <div>
            <h3 class="text-xl font-bold text-gray-800">{{ cenario.nome }}</h3>
            <p class="text-gray-600">{{ cenario.algoritmo }} • {{ cenario.medicos }} médico(s) • {{ cenario.pacientes }} paciente(s)</p>
          </div>
        </div>

        <div class="grid md:grid-cols-2 gap-8">
          <!-- Vantagens -->
          <div class="bg-green-50 rounded-lg p-4">
            <h4 class="font-semibold text-green-800 mb-3 flex items-center gap-2">
              <span>✅</span> Vantagens do {{ cenario.algoritmo }}
            </h4>
            <ul class="space-y-2">
              <li v-for="vantagem in cenario.vantagens" :key="vantagem" class="flex items-start gap-2 text-sm text-green-700">
                <span class="text-green-500 mt-0.5">•</span>
                <span>{{ vantagem }}</span>
              </li>
            </ul>
          </div>

          <!-- Desvantagens -->
          <div class="bg-red-50 rounded-lg p-4">
            <h4 class="font-semibold text-red-800 mb-3 flex items-center gap-2">
              <span>❌</span> Desvantagens do {{ cenario.algoritmo }}
            </h4>
            <ul class="space-y-2">
              <li v-for="desvantagem in cenario.desvantagens" :key="desvantagem" class="flex items-start gap-2 text-sm text-red-700">
                <span class="text-red-500 mt-0.5">•</span>
                <span>{{ desvantagem }}</span>
              </li>
            </ul>
          </div>
        </div>

        <!-- Análise Específica do Cenário -->
        <div class="mt-6 p-4 bg-blue-50 rounded-lg">
          <h4 class="font-semibold text-blue-800 mb-3 flex items-center gap-2">
            <span>🔍</span> Análise Específica neste Cenário
          </h4>
          <p class="text-sm text-blue-700">{{ cenario.analiseEspecifica }}</p>
        </div>
      </div>
    </div>

    <!-- Comparação Geral -->
    <div class="bg-white rounded-lg shadow-lg p-6 mb-8">
      <h2 class="text-xl font-bold text-gray-800 mb-6">🎯 Comparação Geral dos Algoritmos</h2>
      
      <div class="grid md:grid-cols-3 gap-6">
        <!-- Eficiência -->
        <div class="text-center">
          <div class="text-3xl mb-3">⚡</div>
          <h3 class="font-semibold text-gray-800 mb-2">Mais Eficiente</h3>
          <div class="bg-green-100 text-green-800 px-3 py-2 rounded-full text-sm font-medium">
            Shortest Remaining Time
          </div>
          <p class="text-xs text-gray-600 mt-2">Cenário 3: 400ms tempo médio de espera</p>
        </div>

        <!-- Balanceamento -->
        <div class="text-center">
          <div class="text-3xl mb-3">⚖️</div>
          <h3 class="font-semibold text-gray-800 mb-2">Mais Balanceado</h3>
          <div class="bg-blue-100 text-blue-800 px-3 py-2 rounded-full text-sm font-medium">
            Round Robin
          </div>
          <p class="text-xs text-gray-600 mt-2">Cenário 2: Distribuição justa entre processos</p>
        </div>

        <!-- Priorização -->
        <div class="text-center">
          <div class="text-3xl mb-3">🏆</div>
          <h3 class="font-semibold text-gray-800 mb-2">Melhor Priorização</h3>
          <div class="bg-purple-100 text-purple-800 px-3 py-2 rounded-full text-sm font-medium">
            Prioridade
          </div>
          <p class="text-xs text-gray-600 mt-2">Cenário 1: Atende críticos primeiro</p>
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
              <p class="text-sm text-gray-600">Sistemas com diferentes níveis de criticidade (hospitais, sistemas de emergência)</p>
            </div>
            <div class="bg-white rounded-lg p-3 border-l-4 border-blue-500">
              <h4 class="font-medium text-blue-800">Round Robin</h4>
              <p class="text-sm text-gray-600">Sistemas interativos onde a justiça é importante (sistemas multi-usuário)</p>
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

// Dados estáticos baseados nos resultados fornecidos
const resultadosEstaticos = [
  {
    nome: 'Cenário 1',
    descricao: 'Emergência Crítica',
    icone: '🚨',
    algoritmo: 'Prioridade',
    medicos: 1,
    pacientes: 5,
    tempoEspera: 9500,
    tempoExecucao: 13900,
    trocasContexto: 0,
    utilizacao: 100.0
  },
  {
    nome: 'Cenário 2', 
    descricao: 'Plantão Lotado',
    icone: '🏥',
    algoritmo: 'Round Robin',
    medicos: 2,
    pacientes: 8,
    tempoEspera: 6313,
    tempoExecucao: 10375,
    trocasContexto: 10,
    utilizacao: 90.3
  },
  {
    nome: 'Cenário 3',
    descricao: 'Hospital Moderno', 
    icone: '🔬',
    algoritmo: 'Shortest Remaining Time',
    medicos: 4,
    pacientes: 10,
    tempoEspera: 400,
    tempoExecucao: 4700,
    trocasContexto: 7,
    utilizacao: 67.2
  }
]

const analisesCenarios = [
  {
    nome: 'Cenário 1 - Emergência Crítica',
    icone: '🚨',
    algoritmo: 'Prioridade',
    medicos: 1,
    pacientes: 5,
    vantagens: [
      'Atende pacientes críticos (UTI, Emergência) imediatamente',
      'Garante que casos urgentes não esperem',
      'Ideal para ambientes com diferentes níveis de criticidade',
      'Utilização máxima do recurso disponível (100%)',
      'Sem overhead de trocas de contexto (0 trocas)'
    ],
    desvantagens: [
      'Pode causar starvation em processos de baixa prioridade',
      'Pacientes de rotina podem esperar muito tempo',
      'Tempo médio de espera elevado (9500ms)',
      'Não oferece fairness entre todos os pacientes',
      'Dependente de classificação correta de prioridades'
    ],
    analiseEspecifica: 'Com apenas 1 médico disponível, o algoritmo de prioridade foi eficaz em atender primeiro os casos críticos (João-UTI e Ana-Emergência), mas resultou em longo tempo de espera para pacientes menos urgentes. Maria (Consulta) e Carlos (Rotina) esperaram muito tempo, demonstrando o problema de starvation típico deste algoritmo.'
  },
  {
    nome: 'Cenário 2 - Plantão Lotado',
    icone: '🏥', 
    algoritmo: 'Round Robin',
    medicos: 2,
    pacientes: 8,
    vantagens: [
      'Oferece fairness - todos os pacientes recebem atenção',
      'Evita starvation completa de qualquer processo',
      'Boa distribuição de carga entre os 2 médicos',
      'Responsivo para sistemas interativos',
      'Reduz tempo médio de espera comparado ao Cenário 1'
    ],
    desvantagens: [
      'Overhead significativo das trocas de contexto (10 trocas)',
      'Não prioriza casos mais urgentes',
      'Pode interromper procedimentos médicos críticos',
      'Quantum fixo pode não se adequar a todos os casos',
      'Utilização ligeiramente menor (90.3%) devido às trocas'
    ],
    analiseEspecifica: 'Com 2 médicos e quantum de 2000ms, o Round Robin distribuiu bem a carga de trabalho. As 10 trocas de contexto mostram que o sistema foi dinâmico, mas isso criou overhead. O algoritmo garantiu que nenhum paciente fosse completamente esquecido, resultando em melhor tempo médio de espera (6313ms) comparado ao cenário de prioridade.'
  },
  {
    nome: 'Cenário 3 - Hospital Moderno',
    icone: '🔬',
    algoritmo: 'Shortest Remaining Time', 
    medicos: 4,
    pacientes: 10,
    vantagens: [
      'Excelente tempo médio de espera (400ms)',
      'Otimiza o tempo total de execução dos processos',
      'Aproveita bem recursos abundantes (4 médicos)',
      'Prioriza procedimentos mais rápidos',
      'Eficiente para sistemas com recursos suficientes'
    ],
    desvantagens: [
      'Pode causar starvation em processos longos',
      'Requer conhecimento prévio das durações',
      'Overhead moderado de preempções (7 trocas)',
      'Utilização relativamente baixa (67.2%) dos recursos',
      'Complexidade maior de implementação'
    ],
    analiseEspecifica: 'Com 4 médicos disponíveis, o SRT foi muito eficiente, resultando no menor tempo médio de espera (400ms). As 7 preempções mostram que o algoritmo dinamicamente otimizou a ordem de atendimento baseado no tempo restante. No entanto, a utilização de 67.2% indica que ter muitos recursos nem sempre resulta em aproveitamento máximo, especialmente quando a demanda é menor que a capacidade.'
  }
]

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