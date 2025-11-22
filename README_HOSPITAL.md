# 🏥 Simulador do Hospital Digital

Simulador de escalonamento de processos inspirado no ambiente hospitalar, onde **Pacientes** representam **Processos** e **Médicos** representam **Núcleos de CPU**.

## 📋 Sobre o Projeto

Este trabalho implementa um simulador que permite compreender e comparar o comportamento dos principais algoritmos de escalonamento em diferentes condições de carga, prioridade e quantidade de recursos disponíveis.

### 🎯 Objetivos
- Implementar 4 algoritmos de escalonamento obrigatórios
- Permitir configuração de 1, 2 ou 4 núcleos (médicos)
- Gerar métricas de desempenho detalhadas
- Executar cenários específicos para análise acadêmica
- Fornecer visualização clara dos resultados

## 🔧 Algoritmos Implementados

### 1. Round-Robin (Preemptivo) 🔄
- Cada processo recebe um quantum de tempo
- Garante fairness entre todos os pacientes
- Ideal para sistemas interativos

### 2. Shortest Job First - SJF (Não-preemptivo) ⚡
- Atende primeiro os pacientes que requerem menos tempo
- Minimiza tempo médio de espera
- Pode causar starvation em processos longos

### 3. Shortest Remaining Time First - SRTF (Preemptivo) 🔄
- Versão preemptiva do SJF
- Interrompe processos quando chega um com menos tempo restante
- Ótimo desempenho teórico

### 4. Escalonamento por Prioridade (Não-preemptivo) ⭐
- Atende pacientes por ordem de urgência médica
- Inclui sistema de envelhecimento para prevenir starvation
- Reflete prioridades reais do ambiente hospitalar

## 🚀 Como Executar

### Pré-requisitos
- Node.js 18+
- npm ou yarn

### Instalação
```bash
# Instalar dependências
npm install

# Executar em modo desenvolvimento
npm run dev

# Acessar http://localhost:3000
```

### Execução via Terminal (Linha de Comando)
```bash
# Executar exemplo básico
node main.js
```

## 🎭 Cenários do Trabalho

### Cenário 1 - Emergência Crítica
- **Configuração**: 1 Médico disponível
- **Objetivo**: Observar tratamento de processos de alta prioridade
- **Análise**: Verificar inanição e inversão de prioridade

### Cenário 2 - Plantão Lotado
- **Configuração**: 2 Médicos disponíveis
- **Objetivo**: Verificar comportamento sob carga intensa
- **Análise**: Comparar impacto das preempções e balanceamento

### Cenário 3 - Hospital Moderno
- **Configuração**: 4 Médicos disponíveis
- **Objetivo**: Avaliar comportamento com recursos abundantes
- **Análise**: Verificar adaptação a múltiplos núcleos

## 📊 Métricas de Desempenho

- **⏱️ Tempo Médio de Espera**: Tempo que processos ficam na fila
- **🏃 Tempo Médio de Turnaround**: Tempo total desde chegada até conclusão
- **🔀 Número de Trocas de Contexto**: Mudanças entre processos
- **💻 Utilização Média da CPU**: Percentual de tempo que núcleos ficam ocupados

## 🖥️ Interface Web

### Páginas Disponíveis

- **🏠 Home (`/`)**: Visão geral e navegação
- **🎯 Simulação (`/simulacao`)**: Configuração personalizada
- **🎭 Cenários (`/cenarios`)**: Cenários específicos do trabalho
- **📊 Comparação (`/comparacao`)**: Comparação entre algoritmos
- **📚 Documentação (`/documentacao`)**: Guia detalhado

## 🏗️ Arquitetura do Código

### Estrutura de Diretórios
```
📁 simulador-processos/
├── 📁 composables/           # Lógica reutilizável
│   ├── 📁 scheduling/        # Algoritmos de escalonamento
│   │   ├── useRoundRobin.ts
│   │   ├── useShortestJobFirst.ts
│   │   ├── useShortestRemainingTime.ts
│   │   └── usePrioridade.ts
│   ├── useEscalonamento.ts   # Classe base
│   ├── useProcesso.ts        # Modelo de processo
│   └── useSimuladorHospital.ts # Orquestrador principal
├── 📁 pages/                 # Páginas da interface
├── 📁 types/                 # Definições TypeScript
├── main.js                   # Exemplo de uso via terminal
└── README.md                 # Esta documentação
```

### Tecnologias Utilizadas
- **Nuxt 3**: Framework Vue.js para interface web
- **TypeScript**: Tipagem estática
- **Tailwind CSS**: Estilização
- **Node.js**: Runtime JavaScript

## 📖 Exemplo de Uso

### Via Composables (Nuxt)
```typescript
import { useSimuladorHospital } from '~/composables/useSimuladorHospital'

const { executarSimulacao, compararAlgoritmos } = useSimuladorHospital()

// Executar simulação específica
const resultado = await executarSimulacao({
  algoritmo: AlgoritmoEscalonamento.ROUND_ROBIN,
  numeroMedicos: 2,
  quantum: 2000,
  processos: [/* seus processos */]
})

// Comparar todos os algoritmos
const comparacao = await compararAlgoritmos(processos, 2, 2000)
```

### Via Terminal (Node.js)
```javascript
import { useSimuladorHospital } from './composables/useSimuladorHospital.js'

const { criarProcessosExemplo, compararAlgoritmos } = useSimuladorHospital()
const processos = criarProcessosExemplo()
await compararAlgoritmos(processos, 1, 2000)
```

## 🎓 Análise Acadêmica

### Perguntas de Pesquisa Implementadas

1. **Qual algoritmo atende mais rapidamente os pacientes críticos?**
   - Implementado sistema de prioridades
   - Métricas específicas para processos de alta prioridade

2. **Algum paciente de baixa prioridade sofreu inanição?**
   - Sistema de detecção de starvation
   - Implementação de envelhecimento no algoritmo de prioridade

3. **Como diferentes números de núcleos afetam o desempenho?**
   - Suporte completo para 1, 2 ou 4 médicos (núcleos)
   - Métricas de utilização e balanceamento de carga

## 🔍 Funcionalidades Avançadas

- **🎂 Sistema de Envelhecimento**: Previne starvation no algoritmo de prioridade
- **⚡ Preempção Inteligente**: SRTF implementa preempção baseada em eventos
- **📈 Visualização em Tempo Real**: Timeline de eventos e estados dos processos
- **📋 Relatórios Detalhados**: Análise comparativa automática
- **🎨 Interface Temática**: Uso de terminologia hospitalar para facilitar compreensão

## 📝 Licença

Este projeto foi desenvolvido para fins acadêmicos como parte do trabalho de Sistemas Operacionais.

---

**🏥 Desenvolvido com ❤️ para o curso de Sistemas Operacionais - IFMG**