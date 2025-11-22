<!-- pages/documentacao.vue -->
<template>
  <div class="container mx-auto px-4 py-8">
    <!-- Header -->
    <div class="text-center mb-12">
      <h1 class="text-4xl font-bold text-gray-800 mb-4">
        📚 Documentação
      </h1>
      <p class="text-lg text-gray-600 max-w-3xl mx-auto">
        Guia completo sobre algoritmos de escalonamento, métricas de desempenho e análise acadêmica
      </p>
    </div>

    <!-- Navegação -->
    <div class="bg-white rounded-lg shadow-lg p-6 mb-8">
      <div class="flex flex-wrap gap-2">
        <button v-for="secao in secoes" :key="secao.id" @click="secaoAtiva = secao.id" :class="[
          'px-4 py-2 rounded-lg transition-colors',
          secaoAtiva === secao.id
            ? 'bg-blue-600 text-white'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        ]">
          {{ secao.icone }} {{ secao.titulo }}
        </button>
      </div>
    </div>

    <!-- Conteúdo das Seções -->
    <div class="space-y-8">
      <!-- Algoritmos -->
      <div v-show="secaoAtiva === 'algoritmos'" class="space-y-6">
        <div class="bg-white rounded-lg shadow-lg p-8">
          <h2 class="text-2xl font-bold text-gray-800 mb-6">🔧 Algoritmos de Escalonamento</h2>

          <!-- Round Robin -->
          <div class="mb-8">
            <div class="flex items-center gap-3 mb-4">
              <span class="text-3xl">🔄</span>
              <div>
                <h3 class="text-xl font-bold text-gray-800">Round Robin (RR)</h3>
                <span class="text-sm text-blue-600 bg-blue-100 px-2 py-1 rounded-full">Preemptivo</span>
              </div>
            </div>

            <div class="grid md:grid-cols-2 gap-6 mb-4">
              <div>
                <h4 class="font-semibold text-gray-700 mb-2">🎯 Características:</h4>
                <ul class="text-gray-600 space-y-1 text-sm">
                  <li>• Cada processo recebe um quantum de tempo</li>
                  <li>• Execução circular (round-robin)</li>
                  <li>• Preempção baseada em tempo</li>
                  <li>• Justo (fair) para todos os processos</li>
                </ul>
              </div>
              <div>
                <h4 class="font-semibold text-gray-700 mb-2">⚖️ Vantagens e Desvantagens:</h4>
                <div class="text-sm">
                  <div class="text-green-600 mb-2">✅ Vantagens:</div>
                  <ul class="text-green-600 space-y-1 mb-3">
                    <li>• Fairness entre processos</li>
                    <li>• Não há starvation</li>
                    <li>• Bom para sistemas interativos</li>
                  </ul>
                  <div class="text-red-600 mb-2">❌ Desvantagens:</div>
                  <ul class="text-red-600 space-y-1">
                    <li>• Overhead de context switching</li>
                    <li>• Quantum inadequado afeta performance</li>
                  </ul>
                </div>
              </div>
            </div>

            <div class="bg-gray-50 rounded-lg p-4">
              <h4 class="font-semibold text-gray-700 mb-2">🏥 No Contexto Hospitalar:</h4>
              <p class="text-gray-600 text-sm">
                Como um pronto-socorro que atende todos os pacientes por ordem de chegada,
                dando um tempo limitado para cada consulta. Se não terminar no tempo,
                o paciente volta ao final da fila.
              </p>
            </div>
          </div>

          <!-- Shortest Job First -->
          <div class="mb-8">
            <div class="flex items-center gap-3 mb-4">
              <span class="text-3xl">⚡</span>
              <div>
                <h3 class="text-xl font-bold text-gray-800">Shortest Job First (SJF)</h3>
                <span class="text-sm text-orange-600 bg-orange-100 px-2 py-1 rounded-full">Não-preemptivo</span>
              </div>
            </div>

            <div class="grid md:grid-cols-2 gap-6 mb-4">
              <div>
                <h4 class="font-semibold text-gray-700 mb-2">🎯 Características:</h4>
                <ul class="text-gray-600 space-y-1 text-sm">
                  <li>• Executa primeiro o processo mais curto</li>
                  <li>• Não-preemptivo (executa até o fim)</li>
                  <li>• Minimiza tempo médio de espera</li>
                  <li>• Requer conhecimento da duração</li>
                </ul>
              </div>
              <div>
                <h4 class="font-semibold text-gray-700 mb-2">⚖️ Vantagens e Desvantagens:</h4>
                <div class="text-sm">
                  <div class="text-green-600 mb-2">✅ Vantagens:</div>
                  <ul class="text-green-600 space-y-1 mb-3">
                    <li>• Menor tempo médio de espera</li>
                    <li>• Eficiente para processos batch</li>
                    <li>• Teoricamente ótimo</li>
                  </ul>
                  <div class="text-red-600 mb-2">❌ Desvantagens:</div>
                  <ul class="text-red-600 space-y-1">
                    <li>• Pode causar starvation</li>
                    <li>• Difícil prever duração real</li>
                  </ul>
                </div>
              </div>
            </div>

            <div class="bg-gray-50 rounded-lg p-4">
              <h4 class="font-semibold text-gray-700 mb-2">🏥 No Contexto Hospitalar:</h4>
              <p class="text-gray-600 text-sm">
                Como uma clínica que prioriza consultas rápidas. Pacientes que precisam
                de apenas alguns minutos são atendidos primeiro, mesmo chegando depois
                de quem precisa de consultas longas.
              </p>
            </div>
          </div>

          <!-- Shortest Remaining Time First -->
          <div class="mb-8">
            <div class="flex items-center gap-3 mb-4">
              <span class="text-3xl">🔄</span>
              <div>
                <h3 class="text-xl font-bold text-gray-800">Shortest Remaining Time First (SRTF)</h3>
                <span class="text-sm text-blue-600 bg-blue-100 px-2 py-1 rounded-full">Preemptivo</span>
              </div>
            </div>

            <div class="grid md:grid-cols-2 gap-6 mb-4">
              <div>
                <h4 class="font-semibold text-gray-700 mb-2">🎯 Características:</h4>
                <ul class="text-gray-600 space-y-1 text-sm">
                  <li>• Versão preemptiva do SJF</li>
                  <li>• Interrompe para processos mais curtos</li>
                  <li>• Re-avalia a cada chegada de processo</li>
                  <li>• Teoricamente ótimo para turnaround</li>
                </ul>
              </div>
              <div>
                <h4 class="font-semibold text-gray-700 mb-2">⚖️ Vantagens e Desvantagens:</h4>
                <div class="text-sm">
                  <div class="text-green-600 mb-2">✅ Vantagens:</div>
                  <ul class="text-green-600 space-y-1 mb-3">
                    <li>• Melhor tempo médio de turnaround</li>
                    <li>• Resposta rápida para jobs curtos</li>
                    <li>• Adaptativo a mudanças</li>
                  </ul>
                  <div class="text-red-600 mb-2">❌ Desvantagens:</div>
                  <ul class="text-red-600 space-y-1">
                    <li>• Alto overhead de preempção</li>
                    <li>• Starvation severa para jobs longos</li>
                  </ul>
                </div>
              </div>
            </div>

            <div class="bg-gray-50 rounded-lg p-4">
              <h4 class="font-semibold text-gray-700 mb-2">🏥 No Contexto Hospitalar:</h4>
              <p class="text-gray-600 text-sm">
                Como um pronto-socorro que pode interromper consultas longas quando
                chega um caso que precisa de atendimento mais rápido. Maximiza o
                número de pacientes atendidos rapidamente.
              </p>
            </div>
          </div>

          <!-- Prioridade -->
          <div class="mb-8">
            <div class="flex items-center gap-3 mb-4">
              <span class="text-3xl">⭐</span>
              <div>
                <h3 class="text-xl font-bold text-gray-800">Escalonamento por Prioridade</h3>
                <span class="text-sm text-orange-600 bg-orange-100 px-2 py-1 rounded-full">Não-preemptivo</span>
              </div>
            </div>

            <div class="grid md:grid-cols-2 gap-6 mb-4">
              <div>
                <h4 class="font-semibold text-gray-700 mb-2">🎯 Características:</h4>
                <ul class="text-gray-600 space-y-1 text-sm">
                  <li>• Executa por ordem de prioridade</li>
                  <li>• Menor número = maior prioridade</li>
                  <li>• Sistema de envelhecimento implementado</li>
                  <li>• Ideal para sistemas críticos</li>
                </ul>
              </div>
              <div>
                <h4 class="font-semibold text-gray-700 mb-2">⚖️ Vantagens e Desvantagens:</h4>
                <div class="text-sm">
                  <div class="text-green-600 mb-2">✅ Vantagens:</div>
                  <ul class="text-green-600 space-y-1 mb-3">
                    <li>• Reflete importância real dos processos</li>
                    <li>• Flexível e configurável</li>
                    <li>• Bom para sistemas críticos</li>
                  </ul>
                  <div class="text-red-600 mb-2">❌ Desvantagens:</div>
                  <ul class="text-red-600 space-y-1">
                    <li>• Pode causar starvation</li>
                    <li>• Difícil definir prioridades</li>
                  </ul>
                </div>
              </div>
            </div>

            <div class="bg-gray-50 rounded-lg p-4">
              <h4 class="font-semibold text-gray-700 mb-2">🏥 No Contexto Hospitalar:</h4>
              <p class="text-gray-600 text-sm">
                Como um hospital que atende por ordem de urgência médica. Emergências
                (Prioridade 1) são atendidas antes de consultas de rotina (Prioridade 5),
                independente da ordem de chegada.
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Métricas -->
      <div v-show="secaoAtiva === 'metricas'" class="space-y-6">
        <div class="bg-white rounded-lg shadow-lg p-8">
          <h2 class="text-2xl font-bold text-gray-800 mb-6">📊 Métricas de Desempenho</h2>

          <div class="space-y-8">
            <!-- Tempo de Espera -->
            <div>
              <div class="flex items-center gap-3 mb-4">
                <span class="text-3xl">⏱️</span>
                <h3 class="text-xl font-bold text-gray-800">Tempo Médio de Espera</h3>
              </div>
              <div class="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 class="font-semibold text-gray-700 mb-2">📋 Definição:</h4>
                  <p class="text-gray-600 text-sm mb-3">
                    Tempo que um processo permanece na fila de prontos, aguardando para ser executado.
                    É o tempo total na fila - tempo de execução.
                  </p>
                  <div class="bg-blue-50 rounded-lg p-3">
                    <code class="text-sm text-blue-800">
                        Tempo de Espera = Tempo de Início - Tempo de Chegada
                      </code>
                  </div>
                </div>
                <div>
                  <h4 class="font-semibold text-gray-700 mb-2">🎯 Importância:</h4>
                  <ul class="text-gray-600 space-y-1 text-sm">
                    <li>• Indica responsividade do sistema</li>
                    <li>• Afeta experiência do usuário</li>
                    <li>• Meta: minimizar tempo de espera</li>
                    <li>• Crítico para sistemas interativos</li>
                  </ul>
                </div>
              </div>
            </div>

            <!-- Turnaround Time -->
            <div>
              <div class="flex items-center gap-3 mb-4">
                <span class="text-3xl">🏃</span>
                <h3 class="text-xl font-bold text-gray-800">Tempo de Turnaround</h3>
              </div>
              <div class="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 class="font-semibold text-gray-700 mb-2">📋 Definição:</h4>
                  <p class="text-gray-600 text-sm mb-3">
                    Tempo total que um processo leva desde sua chegada até sua conclusão.
                    Inclui tempo de espera + tempo de execução.
                  </p>
                  <div class="bg-green-50 rounded-lg p-3">
                    <code class="text-sm text-green-800">
                        Turnaround = Tempo de Conclusão - Tempo de Chegada
                      </code>
                  </div>
                </div>
                <div>
                  <h4 class="font-semibold text-gray-700 mb-2">🎯 Importância:</h4>
                  <ul class="text-gray-600 space-y-1 text-sm">
                    <li>• Medida de eficiência geral</li>
                    <li>• Inclui todo o ciclo de vida</li>
                    <li>• Meta: minimizar turnaround médio</li>
                    <li>• Importante para batch jobs</li>
                  </ul>
                </div>
              </div>
            </div>

            <!-- Trocas de Contexto -->
            <div>
              <div class="flex items-center gap-3 mb-4">
                <span class="text-3xl">🔀</span>
                <h3 class="text-xl font-bold text-gray-800">Número de Trocas de Contexto</h3>
              </div>
              <div class="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 class="font-semibold text-gray-700 mb-2">📋 Definição:</h4>
                  <p class="text-gray-600 text-sm mb-3">
                    Número total de vezes que o sistema muda de um processo para outro.
                    Cada mudança envolve salvar/restaurar estado do processo.
                  </p>
                  <div class="bg-yellow-50 rounded-lg p-3">
                    <code class="text-sm text-yellow-800">
                        Context Switch = Mudança de Processo Executando
                      </code>
                  </div>
                </div>
                <div>
                  <h4 class="font-semibold text-gray-700 mb-2">🎯 Importância:</h4>
                  <ul class="text-gray-600 space-y-1 text-sm">
                    <li>• Overhead do sistema operacional</li>
                    <li>• Afeta performance geral</li>
                    <li>• Meta: balancear com fairness</li>
                    <li>• Crítico em sistemas RT</li>
                  </ul>
                </div>
              </div>
            </div>

            <!-- Utilização da CPU -->
            <div>
              <div class="flex items-center gap-3 mb-4">
                <span class="text-3xl">💻</span>
                <h3 class="text-xl font-bold text-gray-800">Utilização da CPU</h3>
              </div>
              <div class="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 class="font-semibold text-gray-700 mb-2">📋 Definição:</h4>
                  <p class="text-gray-600 text-sm mb-3">
                    Percentual do tempo que a CPU fica ocupada executando processos,
                    versus tempo ocioso esperando processos chegarem.
                  </p>
                  <div class="bg-purple-50 rounded-lg p-3">
                    <code class="text-sm text-purple-800">
                        Utilização = (Tempo Ocupado / Tempo Total) × 100%
                      </code>
                  </div>
                </div>
                <div>
                  <h4 class="font-semibold text-gray-700 mb-2">🎯 Importância:</h4>
                  <ul class="text-gray-600 space-y-1 text-sm">
                    <li>• Indica eficiência dos recursos</li>
                    <li>• Mede aproveitamento da CPU</li>
                    <li>• Meta: maximizar utilização</li>
                    <li>• Importante para dimensionamento</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Cenários -->
      <div v-show="secaoAtiva === 'cenarios'" class="space-y-6">
        <div class="bg-white rounded-lg shadow-lg p-8">
          <h2 class="text-2xl font-bold text-gray-800 mb-6">🎭 Cenários do Trabalho Acadêmico</h2>

          <div class="space-y-8">
            <!-- Cenário 1 -->
            <div class="border-l-4 border-red-500 pl-6">
              <h3 class="text-xl font-bold text-gray-800 mb-3">
                🚨 Cenário 1: Emergência Crítica
              </h3>
              <div class="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 class="font-semibold text-gray-700 mb-2">⚙️ Configuração:</h4>
                  <ul class="text-gray-600 space-y-1 text-sm">
                    <li>• <strong>1 Médico</strong> disponível</li>
                    <li>• Poucos pacientes</li>
                    <li>• <strong>Níveis de urgência muito diferentes</strong></li>
                    <li>• Foco em prioridades médicas</li>
                  </ul>
                </div>
                <div>
                  <h4 class="font-semibold text-gray-700 mb-2">🎯 Objetivos:</h4>
                  <ul class="text-gray-600 space-y-1 text-sm">
                    <li>• Observar tratamento de alta prioridade</li>
                    <li>• Verificar inanição em baixa prioridade</li>
                    <li>• Analisar inversão de prioridade</li>
                    <li>• Comparar algoritmos em emergências</li>
                  </ul>
                </div>
              </div>
              <div class="mt-4 bg-red-50 rounded-lg p-4">
                <h4 class="font-semibold text-red-700 mb-2">❓ Perguntas para Análise:</h4>
                <ul class="text-red-700 space-y-1 text-sm">
                  <li>• Qual algoritmo atende mais rapidamente os pacientes críticos?</li>
                  <li>• Algum paciente de baixa prioridade sofreu inanição?</li>
                  <li>• Como o Round Robin trata pacientes críticos vs. rotina?</li>
                </ul>
              </div>
            </div>

            <!-- Cenário 2 -->
            <div class="border-l-4 border-yellow-500 pl-6">
              <h3 class="text-xl font-bold text-gray-800 mb-3">
                🏥 Cenário 2: Plantão Lotado (Alta Carga)
              </h3>
              <div class="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 class="font-semibold text-gray-700 mb-2">⚙️ Configuração:</h4>
                  <ul class="text-gray-600 space-y-1 text-sm">
                    <li>• <strong>2 Médicos</strong> disponíveis</li>
                    <li>• Muitos pacientes</li>
                    <li>• <strong>Chegadas contínuas</strong></li>
                    <li>• Tempos de atendimento variados</li>
                  </ul>
                </div>
                <div>
                  <h4 class="font-semibold text-gray-700 mb-2">🎯 Objetivos:</h4>
                  <ul class="text-gray-600 space-y-1 text-sm">
                    <li>• Verificar comportamento sob carga intensa</li>
                    <li>• Comparar impacto das preempções</li>
                    <li>• Analisar balanceamento de carga</li>
                    <li>• Medir overhead de context switching</li>
                  </ul>
                </div>
              </div>
              <div class="mt-4 bg-yellow-50 rounded-lg p-4">
                <h4 class="font-semibold text-yellow-700 mb-2">❓ Perguntas para Análise:</h4>
                <ul class="text-yellow-700 space-y-1 text-sm">
                  <li>• Qual algoritmo apresentou menor tempo médio de espera?</li>
                  <li>• Em qual houve mais trocas de contexto?</li>
                  <li>• Qual mantém melhor utilização média da CPU?</li>
                </ul>
              </div>
            </div>

            <!-- Cenário 3 -->
            <div class="border-l-4 border-green-500 pl-6">
              <h3 class="text-xl font-bold text-gray-800 mb-3">
                🏢 Cenário 3: Hospital Moderno (Recursos Amplos)
              </h3>
              <div class="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 class="font-semibold text-gray-700 mb-2">⚙️ Configuração:</h4>
                  <ul class="text-gray-600 space-y-1 text-sm">
                    <li>• <strong>4 Médicos</strong> disponíveis</li>
                    <li>• Chegadas aleatórias</li>
                    <li>• <strong>Diferentes Burst Times</strong></li>
                    <li>• Prioridades diversas</li>
                  </ul>
                </div>
                <div>
                  <h4 class="font-semibold text-gray-700 mb-2">🎯 Objetivos:</h4>
                  <ul class="text-gray-600 space-y-1 text-sm">
                    <li>• Avaliar com recursos abundantes</li>
                    <li>• Verificar adaptação a multi-core</li>
                    <li>• Analisar quando preempção é vantajosa</li>
                    <li>• Medir escalabilidade</li>
                  </ul>
                </div>
              </div>
              <div class="mt-4 bg-green-50 rounded-lg p-4">
                <h4 class="font-semibold text-green-700 mb-2">❓ Perguntas para Análise:</h4>
                <ul class="text-green-700 space-y-1 text-sm">
                  <li>• Há diferença perceptível no tempo médio entre algoritmos?</li>
                  <li>• Qual algoritmo se adapta melhor aos múltiplos recursos?</li>
                  <li>• Em que situações a preempção continua sendo vantajosa?</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Como Usar -->
      <div v-show="secaoAtiva === 'uso'" class="space-y-6">
        <div class="bg-white rounded-lg shadow-lg p-8">
          <h2 class="text-2xl font-bold text-gray-800 mb-6">🚀 Como Usar o Simulador</h2>

          <div class="space-y-8">
            <!-- Simulação Personalizada -->
            <div>
              <h3 class="text-xl font-bold text-gray-800 mb-4">🎯 Simulação Personalizada</h3>
              <ol class="space-y-3">
                <li class="flex gap-3">
                  <span
                    class="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">1</span>
                  <div>
                    <strong>Escolha o Algoritmo:</strong> Selecione entre Round Robin, SJF, SRTF ou Prioridade
                  </div>
                </li>
                <li class="flex gap-3">
                  <span
                    class="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">2</span>
                  <div>
                    <strong>Configure Recursos:</strong> Defina o número de médicos (1, 2 ou 4)
                  </div>
                </li>
                <li class="flex gap-3">
                  <span
                    class="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">3</span>
                  <div>
                    <strong>Adicione Processos:</strong> Crie pacientes com tempos de chegada, duração e prioridade
                  </div>
                </li>
                <li class="flex gap-3">
                  <span
                    class="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">4</span>
                  <div>
                    <strong>Execute e Analise:</strong> Veja métricas, diagrama de Gantt e timeline de eventos
                  </div>
                </li>
              </ol>
            </div>

            <!-- Cenários Pré-Definidos -->
            <div>
              <h3 class="text-xl font-bold text-gray-800 mb-4">🎭 Cenários Pré-Definidos</h3>
              <div class="bg-gray-50 rounded-lg p-4">
                <p class="text-gray-600 mb-3">
                  Use a página "Cenários do Trabalho" para executar os três cenários acadêmicos:
                </p>
                <ul class="space-y-2 text-sm text-gray-600">
                  <li>• <strong>Emergência Crítica:</strong> Teste com 1 médico e diferentes prioridades</li>
                  <li>• <strong>Plantão Lotado:</strong> Teste com 2 médicos e alta carga</li>
                  <li>• <strong>Hospital Moderno:</strong> Teste com 4 médicos e recursos abundantes</li>
                </ul>
              </div>
            </div>

            <!-- Comparação de Algoritmos -->
            <div>
              <h3 class="text-xl font-bold text-gray-800 mb-4">📊 Comparação de Algoritmos</h3>
              <div class="bg-gray-50 rounded-lg p-4">
                <p class="text-gray-600 mb-3">
                  Use a página "Comparação" para testar todos os algoritmos com os mesmos processos:
                </p>
                <ul class="space-y-2 text-sm text-gray-600">
                  <li>• Configure número de médicos e quantum</li>
                  <li>• Escolha conjunto de processos (exemplo ou cenários)</li>
                  <li>• Execute comparação automática</li>
                  <li>• Analise tabela comparativa e gráficos</li>
                </ul>
              </div>
            </div>

            <!-- Interpretação de Resultados -->
            <div>
              <h3 class="text-xl font-bold text-gray-800 mb-4">📈 Interpretação de Resultados</h3>
              <div class="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 class="font-semibold text-gray-700 mb-2">🟢 Métricas Baixas são Melhores:</h4>
                  <ul class="space-y-1 text-sm text-gray-600">
                    <li>• Tempo Médio de Espera</li>
                    <li>• Tempo Médio de Turnaround</li>
                    <li>• Número de Trocas de Contexto</li>
                  </ul>
                </div>
                <div>
                  <h4 class="font-semibold text-gray-700 mb-2">🔵 Métricas Altas são Melhores:</h4>
                  <ul class="space-y-1 text-sm text-gray-600">
                    <li>• Utilização da CPU (%)</li>
                    <li>• Throughput (processos/tempo)</li>
                    <li>• Fairness entre processos</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Conceitos -->
      <div v-show="secaoAtiva === 'conceitos'" class="space-y-6">
        <div class="bg-white rounded-lg shadow-lg p-8">
          <h2 class="text-2xl font-bold text-gray-800 mb-6">🧠 Conceitos Fundamentais</h2>

          <div class="space-y-8">
            <!-- Estados de Processo -->
            <div>
              <h3 class="text-xl font-bold text-gray-800 mb-4">🔄 Estados de Processo</h3>
              <div class="grid md:grid-cols-2 gap-6">
                <div class="space-y-4">
                  <div class="flex items-center gap-3">
                    <div class="w-4 h-4 bg-blue-500 rounded-full"></div>
                    <div>
                      <strong>Novo:</strong> Processo criado, aguardando admissão
                    </div>
                  </div>
                  <div class="flex items-center gap-3">
                    <div class="w-4 h-4 bg-yellow-500 rounded-full"></div>
                    <div>
                      <strong>Pronto:</strong> Na fila, aguardando execução
                    </div>
                  </div>
                  <div class="flex items-center gap-3">
                    <div class="w-4 h-4 bg-green-500 rounded-full"></div>
                    <div>
                      <strong>Executando:</strong> Utilizando a CPU atualmente
                    </div>
                  </div>
                </div>
                <div class="space-y-4">
                  <div class="flex items-center gap-3">
                    <div class="w-4 h-4 bg-red-500 rounded-full"></div>
                    <div>
                      <strong>Bloqueado:</strong> Aguardando recurso (I/O)
                    </div>
                  </div>
                  <div class="flex items-center gap-3">
                    <div class="w-4 h-4 bg-gray-500 rounded-full"></div>
                    <div>
                      <strong>Terminado:</strong> Execução concluída
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Preempção -->
            <div>
              <h3 class="text-xl font-bold text-gray-800 mb-4">⚡ Preempção</h3>
              <div class="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 class="font-semibold text-green-700 mb-2">✅ Algoritmos Preemptivos:</h4>
                  <ul class="space-y-1 text-sm text-gray-600">
                    <li>• <strong>Round Robin:</strong> Por quantum de tempo</li>
                    <li>• <strong>SRTF:</strong> Por chegada de job mais curto</li>
                    <li>• <strong>Prioridade Preemptiva:</strong> Por maior prioridade</li>
                  </ul>
                  <p class="text-sm text-green-600 mt-2">
                    Podem interromper processos em execução
                  </p>
                </div>
                <div>
                  <h4 class="font-semibold text-orange-700 mb-2">❌ Algoritmos Não-Preemptivos:</h4>
                  <ul class="space-y-1 text-sm text-gray-600">
                    <li>• <strong>SJF:</strong> Executa até terminar</li>
                    <li>• <strong>Prioridade:</strong> Não interrompe</li>
                    <li>• <strong>FCFS:</strong> Primeiro a chegar, primeiro servido</li>
                  </ul>
                  <p class="text-sm text-orange-600 mt-2">
                    Executam até conclusão voluntária
                  </p>
                </div>
              </div>
            </div>

            <!-- Starvation -->
            <div>
              <h3 class="text-xl font-bold text-gray-800 mb-4">😵 Starvation (Inanição)</h3>
              <div class="bg-red-50 rounded-lg p-4">
                <p class="text-gray-700 mb-3">
                  <strong>Definição:</strong> Situação onde um processo aguarda indefinidamente por recursos,
                  nunca conseguindo ser executado.
                </p>
                <div class="grid md:grid-cols-2 gap-4">
                  <div>
                    <h4 class="font-semibold text-red-700 mb-2">Causas Comuns:</h4>
                    <ul class="space-y-1 text-sm text-red-600">
                      <li>• Prioridades fixas muito baixas</li>
                      <li>• SJF com stream de jobs curtos</li>
                      <li>• Recursos limitados mal distribuídos</li>
                    </ul>
                  </div>
                  <div>
                    <h4 class="font-semibold text-green-700 mb-2">Soluções:</h4>
                    <ul class="space-y-1 text-sm text-green-600">
                      <li>• Sistema de envelhecimento</li>
                      <li>• Algoritmos fair (Round Robin)</li>
                      <li>• Limites de tempo de espera</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <!-- Multi-Core -->
            <div>
              <h3 class="text-xl font-bold text-gray-800 mb-4">🏭 Processamento Multi-Core</h3>
              <div class="space-y-4">
                <p class="text-gray-600">
                  Com múltiplos núcleos (médicos), vários processos podem executar simultaneamente:
                </p>
                <div class="grid md:grid-cols-3 gap-4">
                  <div class="text-center p-4 bg-blue-50 rounded-lg">
                    <div class="text-2xl mb-2">👨‍⚕️</div>
                    <strong>1 Médico</strong>
                    <p class="text-sm text-gray-600">Execução sequencial tradicional</p>
                  </div>
                  <div class="text-center p-4 bg-green-50 rounded-lg">
                    <div class="text-2xl mb-2">👨‍⚕️👩‍⚕️</div>
                    <strong>2 Médicos</strong>
                    <p class="text-sm text-gray-600">Paralelismo básico, balanceamento de carga</p>
                  </div>
                  <div class="text-center p-4 bg-purple-50 rounded-lg">
                    <div class="text-2xl mb-2">👨‍⚕️👩‍⚕️👨‍⚕️👩‍⚕️</div>
                    <strong>4 Médicos</strong>
                    <p class="text-sm text-gray-600">Alto paralelismo, recursos abundantes</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Meta tags
useHead({
  title: 'Documentação - Hospital Digital',
  meta: [
    { name: 'description', content: 'Documentação completa sobre algoritmos de escalonamento e métricas' }
  ]
})

// Estado reativo
const secaoAtiva = ref('algoritmos')

// Seções da documentação
const secoes = [
  { id: 'algoritmos', titulo: 'Algoritmos', icone: '🔧' },
  { id: 'metricas', titulo: 'Métricas', icone: '📊' },
  { id: 'cenarios', titulo: 'Cenários', icone: '🎭' },
  { id: 'uso', titulo: 'Como Usar', icone: '🚀' },
  { id: 'conceitos', titulo: 'Conceitos', icone: '🧠' }
]
</script>