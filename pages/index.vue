<!-- pages/index.vue -->
<template>
  <div class="container mx-auto px-4 py-8">
    <!-- Header -->
    <div class="text-center mb-12">
      <h1 class="text-4xl font-bold text-gray-800 mb-4">
        Bem-vindo ao Hospital Digital
      </h1>
      <p class="text-lg text-gray-600 max-w-3xl mx-auto">
        Sistema de escalonamento de processos inspirado no ambiente hospitalar,
        onde <strong>Pacientes</strong> representam <strong>Processos</strong> e
        <strong>Médicos</strong> representam <strong>Núcleos de CPU</strong>.
      </p>
    </div>

    <!-- Navegação Rápida -->
    <NavegacaoRapida />

    <!-- Menu de Navegação -->
    <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
      <NuxtLink to="/simulacao"
        class="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow border-l-4 border-blue-500">
        <div class="text-3xl mb-3">🎯</div>
        <h3 class="text-xl font-semibold text-gray-800 mb-2">Simulação Personalizada</h3>
        <p class="text-gray-600">Configure e execute simulações com parâmetros customizados</p>
      </NuxtLink>

      <NuxtLink to="/cenarios"
        class="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow border-l-4 border-green-500">
        <div class="text-3xl mb-3">🎭</div>
        <h3 class="text-xl font-semibold text-gray-800 mb-2">Cenários do Trabalho</h3>
        <p class="text-gray-600">Execute os 3 cenários específicos do trabalho acadêmico</p>
      </NuxtLink>

      <NuxtLink to="/comparacao"
        class="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow border-l-4 border-yellow-500">
        <div class="text-3xl mb-3">📊</div>
        <h3 class="text-xl font-semibold text-gray-800 mb-2">Comparação de Algoritmos</h3>
        <p class="text-gray-600">Compare todos os algoritmos com os mesmos processos</p>
      </NuxtLink>

      <NuxtLink to="/documentacao"
        class="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow border-l-4 border-purple-500">
        <div class="text-3xl mb-3">📚</div>
        <h3 class="text-xl font-semibold text-gray-800 mb-2">Documentação</h3>
        <p class="text-gray-600">Entenda os algoritmos e métricas utilizadas</p>
      </NuxtLink>
    </div>

    <!-- Algoritmos Implementados -->
    <div class="bg-white rounded-lg shadow-lg p-8 mb-8">
      <h2 class="text-2xl font-bold text-gray-800 mb-6">🔧 Algoritmos Implementados</h2>

      <div class="grid md:grid-cols-2 gap-6">
        <div class="border rounded-lg p-4">
          <div class="flex items-center mb-3">
            <span class="text-2xl mr-3">🔄</span>
            <h3 class="text-lg font-semibold">Round-Robin (Preemptivo)</h3>
          </div>
          <p class="text-gray-600 text-sm">
            Cada processo recebe um quantum de tempo. Garante fairness entre todos os pacientes.
          </p>
        </div>

        <div class="border rounded-lg p-4">
          <div class="flex items-center mb-3">
            <span class="text-2xl mr-3">⚡</span>
            <h3 class="text-lg font-semibold">Shortest Job First (Não-preemptivo)</h3>
          </div>
          <p class="text-gray-600 text-sm">
            Atende primeiro os pacientes que requerem menos tempo de consulta.
          </p>
        </div>

        <div class="border rounded-lg p-4">
          <div class="flex items-center mb-3">
            <span class="text-2xl mr-3">🔄</span>
            <h3 class="text-lg font-semibold">Shortest Remaining Time (Preemptivo)</h3>
          </div>
          <p class="text-gray-600 text-sm">
            Pode interromper consultas para atender pacientes com menos tempo restante.
          </p>
        </div>

        <div class="border rounded-lg p-4">
          <div class="flex items-center mb-3">
            <span class="text-2xl mr-3">⭐</span>
            <h3 class="text-lg font-semibold">Prioridade (Não-preemptivo)</h3>
          </div>
          <p class="text-gray-600 text-sm">
            Atende pacientes por ordem de urgência médica. Inclui sistema de envelhecimento.
          </p>
        </div>
      </div>
    </div>

    <!-- Métricas -->
    <div class="bg-white rounded-lg shadow-lg p-8">
      <h2 class="text-2xl font-bold text-gray-800 mb-6">📈 Métricas de Desempenho</h2>

      <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div class="text-center">
          <div class="text-3xl mb-2">⏱️</div>
          <h4 class="font-semibold text-gray-800">Tempo Médio de Espera</h4>
          <p class="text-sm text-gray-600">Tempo que pacientes ficam na fila</p>
        </div>

        <div class="text-center">
          <div class="text-3xl mb-2">🏃</div>
          <h4 class="font-semibold text-gray-800">Tempo Médio de Turnaround</h4>
          <p class="text-sm text-gray-600">Tempo total desde chegada até saída</p>
        </div>

        <div class="text-center">
          <div class="text-3xl mb-2">🔀</div>
          <h4 class="font-semibold text-gray-800">Trocas de Contexto</h4>
          <p class="text-sm text-gray-600">Número de mudanças entre pacientes</p>
        </div>

        <div class="text-center">
          <div class="text-3xl mb-2">💻</div>
          <h4 class="font-semibold text-gray-800">Utilização da CPU</h4>
          <p class="text-sm text-gray-600">Percentual de tempo que médicos ficam ocupados</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Configurar meta tags
useHead({
  title: 'Hospital Digital - Simulador de Escalonamento',
  meta: [
    { name: 'description', content: 'Simulador de escalonamento de processos inspirado no ambiente hospitalar' }
  ]
})
</script>