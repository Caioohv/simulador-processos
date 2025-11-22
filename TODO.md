# Lista de Pendências - Simulador de Processos

## 🔧 Correções Necessárias

### 1. Shortest Remaining Time First (SRTF)
- ❌ **Problema**: Está usando quantum fixo, mas deveria ser preemptivo baseado em chegada de novos processos
- ❌ **Problema**: Não está considerando tempo de chegada corretamente para preempção
- ✅ **Solução**: Reescrevever lógica para verificar preempção a cada chegada de processo

### 2. Round Robin
- ❌ **Problema**: Não calcula métricas de desempenho
- ✅ **Solução**: Adicionar cálculo de tempo médio de espera, turnaround e utilização CPU

### 3. Shortest Remaining Time
- ❌ **Problema**: Quantum fixo não faz sentido para SRTF
- ✅ **Solução**: Implementar preempção baseada em eventos (chegada de processos)

## 🆕 Funcionalidades a Implementar

### 1. Interface de Usuário
- [ ] Menu de seleção de algoritmo
- [ ] Configuração de número de núcleos (1, 2, 4)
- [ ] Input de processos dinâmico
- [ ] Configuração de quantum para RR

### 2. Suporte Multi-Core
- [ ] Classe `CPU` para representar núcleos individuais
- [ ] Classe `Escalonador` para gerenciar múltiplos núcleos
- [ ] Algoritmo de distribuição de carga
- [ ] Sincronização entre núcleos

### 3. Métricas Completas
- [ ] Tempo Médio de Espera padronizado
- [ ] Tempo Médio de Execução (Turnaround)
- [ ] Número Total de Trocas de Contexto
- [ ] Utilização Média da CPU (%)

### 4. Visualização
- [ ] Diagrama de Gantt textual
- [ ] Timeline de execução
- [ ] Estados dos processos
- [ ] Indicação de núcleo ocupado

### 5. Cenários de Teste
- [ ] Cenário 1: Emergência Crítica (1 núcleo)
- [ ] Cenário 2: Plantão Lotado (2 núcleos)  
- [ ] Cenário 3: Hospital Moderno (4 núcleos)

## 📊 Análise Requerida

Para cada cenário, implementar análise de:
- Qual algoritmo atende mais rapidamente processos críticos
- Detecção de inanição (starvation)
- Comportamento sob alta carga
- Impacto das preempções
- Balanceamento de carga
- Adaptação a múltiplos recursos

## 🎯 Prioridades

1. **Alta**: Corrigir algoritmos existentes
2. **Alta**: Implementar interface básica
3. **Média**: Suporte multi-core
4. **Média**: Métricas completas
5. **Baixa**: Visualização avançada



## Todo real
- terminar diagramas de gantt e métricas