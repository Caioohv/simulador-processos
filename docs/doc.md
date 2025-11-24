# 📚 Documentação Técnica - Simulador de Processos Hospitalares

## 🎯 Visão Geral do Projeto

Este projeto implementa um simulador educacional de algoritmos de escalonamento de processos, utilizando uma analogia hospitalar para tornar os conceitos de sistemas operacionais mais acessíveis e compreensíveis.

## 🏗️ Arquitetura Técnica

### Framework e Tecnologias

#### Nuxt 3 + Vue 3
- **Nuxt 3**: Framework que oferece SSR, SSG e SPA
- **Vue 3**: Framework reativo com Composition API
- **TypeScript**: Tipagem estática para maior robustez

#### Vantagens da Escolha:
- **Composition API**: Lógica reutilizável e organizana
- **Hot Module Replacement** - Atualização em tempo real
- **Desempenho**: Ótima reatividade provida pela stack

---

## 🔬 Lógica de Simulação

### Conceitos Fundamentais

#### Analogia Hospital ↔ Sistema Operacional
- **Médicos** = CPUs/Processadores
- **Pacientes** = Processos
- **Atendimento** = Execução
- **Fila de Espera** = Fila de Prontos
- **Gravidade** = Prioridade
- **Tempo de Consulta** = Tempo de Execução

### Estados dos Processos (Pacientes)

```typescript
enum EstadoProcesso {
  NOVO = 'novo',           // Paciente chegou ao hospital
  PRONTO = 'pronto',       // Na fila de espera
  EXECUTANDO = 'executando', // Sendo atendido por médico
  CONCLUIDO = 'concluido'   // Atendimento finalizado
}
```

### Estrutura de Dados Principal

```typescript
interface Processo {
  id: number              // Identificador único
  nome: string           // Nome do paciente
  tempoChegada: number   // Quando chegou ao hospital
  tempoExecucao: number  // Tempo total de atendimento necessário
  tempoExecutado: number // Quanto já foi atendido
  prioridade: number     // Nível de gravidade (1=crítico, 5=leve)
  cor: string           // Cor para identificação visual
  estado: EstadoProcesso // Estado atual
}
```

### Eventos do Diagrama de Gantt

```typescript
interface EventoGantt {
  processoId: number     // Qual paciente
  medico: number        // Qual médico atendeu
  inicio: number        // Momento de início
  fim: number          // Momento de fim
  tipo: 'execucao' | 'espera' | 'preempcao'
}
```

## ⚙️ Implementação dos Algoritmos

### 1. 🚨 Algoritmo de Prioridade

```typescript
// composables/scheduling/usePrioridade.ts
export function usePrioridade() {
  function executar(processos: Processo[], numCPUs: number) {
    // Ordena por prioridade (menor número = maior prioridade)
    // Em caso de empate, usa FCFS (First Come First Served)
    const filaOrdenada = [...processos].sort((a, b) => {
      if (a.prioridade === b.prioridade) {
        return a.tempoChegada - b.tempoChegada
      }
      return a.prioridade - b.prioridade
    })
    
    // Executa sem preempção
    return executarSemPreempcao(filaOrdenada, numCPUs)
  }
}
```

#### Características:
- **Não-preemptivo**: Paciente não é interrompido
- **Ordenação**: Por prioridade, depois por chegada
- **Uso**: Ideal para emergências médicas

### 2. 🔄 Round Robin

```typescript
// composables/scheduling/useRoundRobin.ts
export function useRoundRobin() {
  function executar(processos: Processo[], numCPUs: number, quantum = 3) {
    const fila = [...processos]
    let tempo = 0
    
    while (fila.some(p => p.tempoExecutado < p.tempoExecucao)) {
      for (let cpu = 0; cpu < numCPUs; cpu++) {
        const processo = encontrarProximoProcesso(fila, tempo)
        if (processo) {
          const tempoExecucao = Math.min(quantum, 
            processo.tempoExecucao - processo.tempoExecutado)
          
          executarPorTempo(processo, tempoExecucao, cpu, tempo)
          tempo += tempoExecucao
        }
      }
    }
  }
}
```

#### Características:
- **Preemptivo**: Paciente pode ser interrompido
- **Quantum fixo**: Tempo máximo de atendimento
- **Fairness**: Todos recebem atenção igual

### 3. ⏱️ Shortest Job First (SJF)

```typescript
// composables/scheduling/useShortestJobFirst.ts
export function useShortestJobFirst() {
  function executar(processos: Processo[], numCPUs: number) {
    // Ordena por tempo de execução (menor primeiro)
    const filaOrdenada = [...processos].sort((a, b) => {
      if (a.tempoExecucao === b.tempoExecucao) {
        return a.tempoChegada - b.tempoChegada
      }
      return a.tempoExecucao - b.tempoExecucao
    })
    
    return executarSemPreempcao(filaOrdenada, numCPUs)
  }
}
```

#### Características:
- **Não-preemptivo**: Procedimento não é interrompido
- **Otimização**: Minimiza tempo médio de espera
- **Uso**: Consultas rápidas primeiro

### 4. ⚡ Shortest Remaining Time (SRT)

```typescript
// composables/scheduling/useShortestRemainingTime.ts
export function useShortestRemainingTime() {
  function executar(processos: Processo[], numCPUs: number) {
    let tempo = 0
    const processosAtivos = []
    
    while (existemProcessosPendentes()) {
      // Adiciona processos que chegaram no tempo atual
      adicionarProcessosChegando(processosAtivos, processos, tempo)
      
      // Ordena por tempo restante
      processosAtivos.sort((a, b) => 
        (a.tempoExecucao - a.tempoExecutado) - 
        (b.tempoExecucao - b.tempoExecutado)
      )
      
      // Executa os primeiros numCPUs processos
      executarProximoPasso(processosAtivos, numCPUs, tempo)
      tempo++
    }
  }
}
```

#### Características:
- **Preemptivo**: Paciente mais crítico assume prioridade
- **Otimização**: Minimiza tempo de resposta
- **Dinâmico**: Reavalia constantemente

## 📊 Sistema de Métricas

### Cálculos Implementados

#### Tempo de Espera
```typescript
function calcularTempoEspera(processo: ProcessoCompleto): number {
  // Soma todos os períodos de espera na fila
  return processo.eventos
    .filter(evento => evento.tipo === 'espera')
    .reduce((total, evento) => total + (evento.fim - evento.inicio), 0)
}
```

#### Turnaround Time
```typescript
function calcularTurnaround(processo: ProcessoCompleto): number {
  // Tempo desde chegada até conclusão completa
  return processo.tempoFinalizacao - processo.tempoChegada
}
```

#### Tempo de Resposta
```typescript
function calcularTempoResposta(processo: ProcessoCompleto): number {
  // Tempo até primeiro atendimento
  const primeiroAtendimento = processo.eventos
    .find(evento => evento.tipo === 'execucao')
  return primeiroAtendimento ? 
    primeiroAtendimento.inicio - processo.tempoChegada : 0
}
```

#### Utilização de CPU
```typescript
function calcularUtilizacaoCPU(gantt: EventoGantt[], numCPUs: number): number {
  const tempoTotal = Math.max(...gantt.map(e => e.fim))
  const tempoOcupado = gantt
    .filter(evento => evento.tipo === 'execucao')
    .reduce((total, evento) => total + (evento.fim - evento.inicio), 0)
  
  return (tempoOcupado / (tempoTotal * numCPUs)) * 100
}
```

## 🎮 Interface e Interação

### Simulação em Tempo Real

#### Controle de Estado
```typescript
// composables/useSimulacaoTempoReal.ts
export function useSimulacaoTempoReal() {
  const estado = reactive({
    executando: false,
    pausado: false,
    velocidade: 1000, // ms entre steps
    tempoAtual: 0,
    stepAtual: 0
  })
  
  function iniciar() {
    estado.executando = true
    executarProximoStep()
  }
  
  function pausar() {
    estado.pausado = !estado.pausado
  }
  
  function proximoStep() {
    if (!estado.executando) return
    
    // Executa lógica do algoritmo para o tempo atual
    processarStepAtual()
    estado.tempoAtual++
    
    // Agenda próximo step
    if (!estado.pausado) {
      setTimeout(() => proximoStep(), estado.velocidade)
    }
  }
}
```

### Diagrama de Gantt Interativo

#### Renderização Visual
```vue
<template>
  <div class="gantt-container">
    <div class="gantt-header">
      <!-- Escala de tempo -->
      <div v-for="t in tempoTotal" :key="t" 
           class="time-unit">{{ t }}</div>
    </div>
    
    <div class="gantt-body">
      <!-- Uma linha para cada CPU/médico -->
      <div v-for="cpu in numCPUs" :key="cpu" class="cpu-row">
        <div class="cpu-label">Médico {{ cpu }}</div>
        
        <!-- Eventos de execução -->
        <div v-for="evento in eventosPorCPU[cpu]" 
             :key="evento.id"
             :style="estiloEvento(evento)"
             :class="classeEvento(evento)"
             class="gantt-event">
          {{ evento.processoNome }}
        </div>
      </div>
    </div>
  </div>
</template>
```

### Sistema de Cenários

#### Geração Automática
```typescript
// composables/useSimuladorHospital.ts
function criarCenarios() {
  const cenarios = []
  const configsCenarios = [
    { nome: 'Emergência Crítica', processos: gerarEmergencia() },
    { nome: 'Plantão Lotado', processos: gerarPlantao() },
    { nome: 'Hospital Moderno', processos: gerarModerno() }
  ]
  
  const algoritmos = ['Prioridade', 'Round Robin', 'SJF', 'SRT']
  const configsCPUs = [1, 2, 4]
  
  // Gera todas as 36 combinações
  configsCenarios.forEach((cenario, cId) => {
    algoritmos.forEach(algoritmo => {
      configsCPUs.forEach(cpus => {
        cenarios.push({
          id: cenarios.length + 1,
          nome: `${cenario.nome} - ${algoritmo} - ${cpus} Médicos`,
          algoritmo,
          cpus,
          processos: [...cenario.processos],
          categoria: `Cenário ${cId + 1}`
        })
      })
    })
  })
  
  return cenarios
}
```

## 🎨 Design System

### Paleta de Cores Semântica

```css
:root {
  /* Prioridades Médicas */
  --critico: #EF4444;    /* Vermelho - Emergência */
  --alto: #F97316;       /* Laranja - Urgente */
  --medio: #F59E0B;      /* Amarelo - Atenção */
  --baixo: #10B981;      /* Verde - Estável */
  --eletivo: #3B82F6;    /* Azul - Não urgente */
  
  /* Estados dos Processos */
  --novo: #6B7280;       /* Cinza - Chegando */
  --pronto: #F59E0B;     /* Amarelo - Aguardando */
  --executando: #10B981;  /* Verde - Em atendimento */
  --concluido: #8B5CF6;   /* Roxo - Finalizado */
}
```

### Componentes Responsivos

#### Grid Adaptativo
```vue
<template>
  <!-- Layout que se adapta ao tamanho da tela -->
  <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
    <!-- Configuração ocupa 1/3 em desktop, tela inteira em mobile -->
    <div class="lg:col-span-1">
      <!-- Painel de controles -->
    </div>
    
    <!-- Visualização ocupa 2/3 em desktop, tela inteira em mobile -->
    <div class="lg:col-span-2">
      <!-- Gráficos e resultados -->
    </div>
  </div>
</template>
```

### Microinterações

#### Transições Suaves
```css
.processo-card {
  @apply transition-all duration-300 ease-in-out;
  
  &:hover {
    @apply transform scale-105 shadow-lg;
  }
  
  &.executando {
    @apply animate-pulse;
  }
}

.gantt-event {
  @apply transition-all duration-200;
  animation: slideIn 0.5s ease-in-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(-10px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}
```

## 📊 Análise de Desempenho

### Complexidade dos Algoritmos

#### Prioridade
- **Ordenação inicial**: O(n log n)
- **Execução**: O(n)
- **Total**: O(n log n)

#### Round Robin
- **Por quantum**: O(n)
- **Ciclos**: O(n/q) onde q é o quantum
- **Total**: O(n²) no pior caso

#### SJF
- **Ordenação inicial**: O(n log n)
- **Execução**: O(n)
- **Total**: O(n log n)

#### SRT
- **Por step**: O(n log n) para reordenação
- **Steps**: O(soma dos tempos de execução)
- **Total**: O(n² log n) no pior caso

### Otimizações Implementadas

#### Lazy Loading de Cenários
```typescript
const cenarios = computed(() => {
  // Só gera cenários quando necessário
  if (!cenariosCache.value) {
    cenariosCache.value = criarCenarios()
  }
  return cenariosCache.value
})
```

#### Memoização de Resultados
```typescript
const resultadosCache = new Map<string, ResultadoSimulacao>()

function executarComCache(
  processos: Processo[], 
  algoritmo: string, 
  cpus: number
) {
  const chave = `${algoritmo}-${cpus}-${JSON.stringify(processos)}`
  
  if (resultadosCache.has(chave)) {
    return resultadosCache.get(chave)
  }
  
  const resultado = executarAlgoritmo(processos, algoritmo, cpus)
  resultadosCache.set(chave, resultado)
  return resultado
}
```

## 🧪 Testing e Validação

### Casos de Teste

#### Cenários Básicos
```typescript
describe('Algoritmo de Prioridade', () => {
  test('deve ordenar por prioridade', () => {
    const processos = [
      { id: 1, prioridade: 3, tempoChegada: 0 },
      { id: 2, prioridade: 1, tempoChegada: 1 },
      { id: 3, prioridade: 2, tempoChegada: 2 }
    ]
    
    const resultado = executarPrioridade(processos, 1)
    expect(resultado.ordemExecucao).toEqual([2, 3, 1])
  })
  
  test('deve usar FCFS para mesma prioridade', () => {
    // Teste de desempate
  })
})
```

### Validação de Métricas

#### Consistência dos Cálculos
```typescript
function validarResultado(resultado: ResultadoSimulacao) {
  const { processos, metricas, gantt } = resultado
  
  // Valida que tempo total de execução coincide
  const tempoTotalGantt = Math.max(...gantt.map(e => e.fim))
  const tempoTotalProcessos = Math.max(
    ...processos.map(p => p.tempoFinalizacao)
  )
  expect(tempoTotalGantt).toBe(tempoTotalProcessos)
  
  // Valida que todos os processos foram executados completamente
  processos.forEach(processo => {
    expect(processo.tempoExecutado).toBe(processo.tempoExecucao)
  })
}
```

## 📈 Monitoramento e Analytics

### Coleta de Métricas de Uso

```typescript
// composables/useAnalytics.ts
export function useAnalytics() {
  function rastrearSimulacao(algoritmo: string, cenario: string, cpus: number) {
    const evento = {
      tipo: 'simulacao_executada',
      algoritmo,
      cenario,
      cpus,
      timestamp: new Date().toISOString()
    }
    
    // Em produção, enviaria para serviço de analytics
    console.log('Analytics:', evento)
  }
  
  function rastrearTempo(pagina: string, tempoGasto: number) {
    const evento = {
      tipo: 'tempo_na_pagina',
      pagina,
      tempoGasto,
      timestamp: new Date().toISOString()
    }
    
    console.log('Analytics:', evento)
  }
}
```

## 🚀 Deploy e Produção

### Build Otimizado

```bash
# Gerar build estático (SSG)
npm run generate

# Ou build com SSR
npm run build
```

### Configuração de Deploy

```javascript
// nuxt.config.ts
export default defineNuxtConfig({
  // Para GitHub Pages
  target: 'static',
  router: {
    base: '/simulador-processos/'
  },
  
  // Otimizações de build
  nitro: {
    prerender: {
      routes: ['/sitemap.xml']
    }
  },
  
  // PWA para uso offline
  pwa: {
    manifest: {
      name: 'Simulador de Processos Hospitalares',
      short_name: 'SimuladorSO',
      description: 'Simulador educacional de algoritmos de escalonamento'
    }
  }
})
```

## 🔧 Manutenção e Extensibilidade

### Adicionando Novos Algoritmos

1. **Criar composable**:
```typescript
// composables/scheduling/useNovoAlgoritmo.ts
export function useNovoAlgoritmo() {
  function executar(processos: Processo[], numCPUs: number, parametros?: any) {
    // Implementar lógica do algoritmo
    return {
      processos: processosCompletos,
      gantt: eventosGantt,
      metricas: calcularMetricas(processosCompletos)
    }
  }
  
  return { executar }
}
```

2. **Registrar no sistema**:
```typescript
// composables/useEscalonamento.ts
const algoritmos = {
  'prioridade': usePrioridade,
  'roundRobin': useRoundRobin,
  'sjf': useShortestJobFirst,
  'srt': useShortestRemainingTime,
  'novoAlgoritmo': useNovoAlgoritmo  // ← Adicionar aqui
}
```

3. **Adicionar à UI**:
```vue
<!-- Em todas as páginas que listam algoritmos -->
<option value="novoAlgoritmo">Novo Algoritmo</option>
```

### Adicionando Novos Cenários

```typescript
// composables/useSimuladorHospital.ts
const novosCenarios = [
  {
    nome: 'Pandemia COVID-19',
    descricao: 'Hospital durante pico da pandemia',
    processos: [
      // Definir processos específicos
    ]
  }
]
```

## 📚 Recursos Educacionais

### Material de Apoio Gerado

#### Relatórios Automáticos
```typescript
function gerarRelatorioEducacional(resultado: ResultadoSimulacao) {
  return {
    resumo: `O algoritmo ${resultado.algoritmo} processou ${resultado.processos.length} pacientes`,
    analise: analisarComportamento(resultado),
    comparacao: compararComOutrosAlgoritmos(resultado),
    recomendacoes: gerarRecomendacoes(resultado)
  }
}
```

#### Explicações Contextuais
```vue
<template>
  <div class="explicacao-algoritmo">
    <h3>Por que este resultado?</h3>
    <p v-if="algoritmo === 'prioridade'">
      O algoritmo de Prioridade atendeu primeiro os pacientes mais graves,
      resultando em {{ metricas.tempoEsperaCriticos }}ms de espera média
      para casos críticos.
    </p>
    <!-- Explicações específicas para cada algoritmo -->
  </div>
</template>
```

## 🎯 Conclusão Técnica

Este projeto demonstra como conceitos complexos de sistemas operacionais podem ser tornados acessíveis através de:

1. **Analogias Claras**: Hospital = SO facilita compreensão
2. **Visualização Interativa**: Gantt charts e animações
3. **Experimentação Livre**: Parâmetros modificáveis
4. **Análise Comparativa**: Métricas lado a lado
5. **Tecnologia Moderna**: Vue 3 + TypeScript + Tailwind

A arquitetura modular permite fácil extensão e manutenção, enquanto a interface intuitiva facilita o aprendizado de algoritmos fundamentais de escalonamento de processos.

---

*Esta documentação serve como guia completo para compreensão, manutenção e extensão do simulador educacional.*
