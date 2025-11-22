# 🏥 Hospital Digital - Simulador de Escalonamento

> **Sistema completo de simulação de algoritmos de escalonamento de processos com temática hospitalar**

Um projeto acadêmico desenvolvido em **Nuxt 3** + **TypeScript** + **Tailwind CSS** que simula o funcionamento de um hospital como metáfora para algoritmos de escalonamento de processos em sistemas operacionais.

## 🌟 Características Principais

### 🎭 **Temática Inovadora**
- **Pacientes** = Processos
- **Médicos** = Núcleos de CPU 
- **Consultas** = Tempo de Execução
- **Fila de Espera** = Fila de Prontos
- **Urgência** = Prioridade

### 🔧 **Algoritmos Implementados**

| Algoritmo | Tipo | Características |
|-----------|------|----------------|
| 🔄 **Round Robin** | Preemptivo | Quantum configurável, fairness garantido |
| ⚡ **Shortest Job First** | Não-preemptivo | Otimiza tempo médio de espera |
| 🔄 **Shortest Remaining Time** | Preemptivo | Versão preemptiva do SJF |
| ⭐ **Prioridade** | Não-preemptivo | Com sistema de aging anti-starvation |

### 📊 **Funcionalidades Avançadas**

- ✅ **Multi-core**: Suporte para 1, 2 ou 4 médicos simultaneamente
- ✅ **Simulação em Tempo Real**: Visualização step-by-step da execução
- ✅ **Diagramas de Gantt**: Representação visual da timeline
- ✅ **Métricas Detalhadas**: Tempo de espera, turnaround, trocas de contexto
- ✅ **Comparação Automática**: Execute todos os algoritmos com os mesmos dados
- ✅ **Cenários Predefinidos**: 3 cenários específicos do trabalho acadêmico
- ✅ **Interface Responsiva**: Funciona perfeitamente em desktop e mobile

## 🚀 Como Usar

### 📋 **Pré-requisitos**
- Node.js 18+ 
- npm ou yarn

### 🔧 **Instalação e Execução**
```bash
# Instale as dependências
npm install

# Execute o servidor de desenvolvimento
npm run dev
```

### 🌐 **Acesso**
Abra [http://localhost:3000](http://localhost:3000) no seu navegador

## 📱 **Páginas Disponíveis**

### 🏠 **Página Principal** (`/`)
- Visão geral do sistema
- Links para todas as funcionalidades
- Explicação dos algoritmos

### 🎭 **Cenários do Trabalho** (`/cenarios`)
Execute os 3 cenários específicos definidos no trabalho acadêmico:
- **Cenário 1**: Emergência Crítica (1 médico, diferentes prioridades)
- **Cenário 2**: Plantão Lotado (2 médicos, alta carga)
- **Cenário 3**: Hospital Moderno (4 médicos, recursos abundantes)

### 🔬 **Simulação Personalizada** (`/simulacao`)
- Configure seus próprios pacientes
- Teste qualquer algoritmo individualmente
- Visualize resultados em tempo real

### 📊 **Comparação de Algoritmos** (`/comparacao`)
- Execute todos os algoritmos com os mesmos dados
- Visualize tabela comparativa
- Gráficos de desempenho

### 📚 **Documentação** (`/documentacao`)
- Explicação detalhada de todos os algoritmos
- Definições de métricas
- Conceitos fundamentais
- Guias de uso

## 🏗️ **Arquitetura Técnica**

### 📂 **Estrutura do Projeto**
```
├── composables/           # Lógica reutilizável
│   ├── useProcesso.ts          # Classe de processo
│   ├── useEscalonamento.ts     # Classe base dos algoritmos
│   ├── useSimuladorHospital.ts # Orquestrador principal
│   └── scheduling/             # Implementações dos algoritmos
│       ├── useRoundRobin.ts
│       ├── useShortestJobFirst.ts
│       ├── useShortestRemainingTime.ts
│       └── usePrioridade.ts
├── pages/                 # Páginas da aplicação
├── components/            # Componentes Vue reutilizáveis
├── layouts/               # Layout padrão da aplicação
└── types/                 # Definições TypeScript
```

### 🛠️ **Stack Tecnológica**
- **Framework**: Nuxt 3.12.4
- **Frontend**: Vue 3.4.0 + Composition API
- **Linguagem**: TypeScript 5.5.0
- **Estilização**: Tailwind CSS 6.8.4
- **Build**: Vite 6.4.1
- **Renderização**: SSR + SPA Hybrid

## 📊 **Métricas Calculadas**

| Métrica | Descrição |
|---------|-----------|
| **Tempo Médio de Espera** | Tempo que o paciente aguarda na fila |
| **Tempo Médio de Turnaround** | Tempo total desde chegada até conclusão |
| **Trocas de Contexto** | Número de mudanças entre processos |
| **Utilização da CPU** | Percentual de tempo que os médicos ficam ocupados |

## 🎓 **Contexto Acadêmico**

Este projeto foi desenvolvido como trabalho da disciplina de **Sistemas Operacionais** do **IFMG**, focando na compreensão prática de:

- Algoritmos de escalonamento de processos
- Problemas de starvation e solutions
- Impacto de diferentes estratégias de escalonamento
- Análise de métricas de desempenho
- Simulação de sistemas computacionais

## 🔍 **Cenários de Análise**

O projeto inclui cenários específicos para análise acadêmica:

1. **Situações de Emergência**: Como diferentes algoritmos lidam com alta prioridade
2. **Alta Carga de Trabalho**: Comportamento sob stress com múltiplos processos  
3. **Recursos Abundantes**: Eficiência quando há capacidade suficiente

## Production

Build the application for production:

```bash
npm run build
```

Locally preview production build:

```bash
npm run preview
```

---

**Desenvolvido com ❤️ para o aprendizado de Sistemas Operacionais - IFMG**
