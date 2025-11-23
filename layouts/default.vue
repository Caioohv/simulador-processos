<!-- layouts/default.vue -->
<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
    <!-- Header -->
    <header class="bg-white shadow-sm border-b">
      <div class="container mx-auto px-4 py-4">
        <div class="flex items-center justify-between">
          <!-- Logo -->
          <NuxtLink to="/" class="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <span class="text-3xl">🏥</span>
            <div>
              <h1 class="text-xl font-bold text-gray-800">Hospital Digital</h1>
              <p class="text-sm text-gray-600">Simulador de Escalonamento</p>
            </div>
          </NuxtLink>

          <!-- Menu Desktop -->
          <nav class="hidden md:flex items-center gap-6">
            <NuxtLink to="/" :class="[
              'px-3 py-2 rounded-lg transition-colors text-sm font-medium',
              $route.path === '/'
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
            ]">
              🏠 Início
            </NuxtLink>

            <NuxtLink to="/cenarios" :class="[
              'px-3 py-2 rounded-lg transition-colors text-sm font-medium',
              $route.path === '/cenarios'
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
            ]">
              🎭 Cenários
            </NuxtLink>

            <NuxtLink to="/simulacao" :class="[
              'px-3 py-2 rounded-lg transition-colors text-sm font-medium',
              $route.path === '/simulacao'
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
            ]">
              🔬 Simulação
            </NuxtLink>



            <NuxtLink to="/comparacao" :class="[
              'px-3 py-2 rounded-lg transition-colors text-sm font-medium',
              $route.path === '/comparacao'
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
            ]">
              📊 Comparação
            </NuxtLink>

            <NuxtLink to="/documentacao" :class="[
              'px-3 py-2 rounded-lg transition-colors text-sm font-medium',
              $route.path === '/documentacao'
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
            ]">
              📚 Docs
            </NuxtLink>
          </nav>

          <!-- Menu Mobile Toggle -->
          <button @click="menuMobileAberto = !menuMobileAberto"
            class="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                :d="menuMobileAberto ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'"></path>
            </svg>
          </button>
        </div>

        <!-- Menu Mobile -->
        <nav v-show="menuMobileAberto" class="md:hidden mt-4 pb-4 border-t pt-4">
          <div class="flex flex-col gap-2">
            <NuxtLink to="/" @click="menuMobileAberto = false" :class="[
              'px-3 py-2 rounded-lg transition-colors text-sm font-medium',
              $route.path === '/'
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
            ]">
              🏠 Início
            </NuxtLink>

            <NuxtLink to="/cenarios" @click="menuMobileAberto = false" :class="[
              'px-3 py-2 rounded-lg transition-colors text-sm font-medium',
              $route.path === '/cenarios'
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
            ]">
              🎭 Cenários do Trabalho
            </NuxtLink>

            <NuxtLink to="/simulacao" @click="menuMobileAberto = false" :class="[
              'px-3 py-2 rounded-lg transition-colors text-sm font-medium',
              $route.path === '/simulacao'
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
            ]">
              🔬 Simulação Personalizada
            </NuxtLink>



            <NuxtLink to="/comparacao" @click="menuMobileAberto = false" :class="[
              'px-3 py-2 rounded-lg transition-colors text-sm font-medium',
              $route.path === '/comparacao'
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
            ]">
              📊 Comparação de Algoritmos
            </NuxtLink>

            <NuxtLink to="/documentacao" @click="menuMobileAberto = false" :class="[
              'px-3 py-2 rounded-lg transition-colors text-sm font-medium',
              $route.path === '/documentacao'
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
            ]">
              📚 Documentação
            </NuxtLink>
          </div>
        </nav>
      </div>
    </header>

    <!-- Conteúdo Principal -->
    <main>
      <slot />
    </main>

    <!-- Footer -->
    <footer class="bg-white border-t mt-16">
      <div class="container mx-auto px-4 py-8">
        <div class="text-center">
          <div class="flex justify-center items-center gap-2 mb-4">
            <span class="text-2xl">🏥</span>
            <span class="font-bold text-gray-800">Hospital Digital</span>
          </div>
          <p class="text-gray-600 text-sm mb-4">
            Simulador de Algoritmos de Escalonamento de Processos
          </p>
          <div class="flex justify-center gap-6 text-sm text-gray-500">
            <span>🎓 Trabalho Acadêmico</span>
            <span>🔧 Sistemas Operacionais</span>
            <span>📚 IFMG</span>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
// Estado do menu mobile
const menuMobileAberto = ref(false)

// Fechar menu mobile ao mudar de rota
const route = useRoute()
watch(() => route.path, () => {
  menuMobileAberto.value = false
})
</script>