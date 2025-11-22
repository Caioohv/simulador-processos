<!-- components/NavegacaoRapida.vue -->
<template>
  <div class="bg-white rounded-lg shadow-lg p-6 mb-8">
    <h3 class="text-lg font-bold text-gray-800 mb-4">🧭 Navegação Rápida</h3>
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-3">
      <NuxtLink v-for="item in itensMenu" :key="item.to" :to="item.to" :class="[
        'flex items-center gap-2 p-3 rounded-lg transition-colors text-sm',
        $route.path === item.to
          ? 'bg-blue-100 text-blue-700 border border-blue-200'
          : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-transparent'
      ]">
        <span class="text-lg">{{ item.icone }}</span>
        <span class="font-medium">{{ item.nome }}</span>
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
const itensMenu = [
  { to: '/', nome: 'Início', icone: '🏠' },
  { to: '/cenarios', nome: 'Cenários', icone: '🎭' },
  { to: '/simulacao', nome: 'Simulação', icone: '🔬' },
  { to: '/comparacao', nome: 'Comparação', icone: '📊' },
  { to: '/documentacao', nome: 'Documentação', icone: '📚' }
]
</script>