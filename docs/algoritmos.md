# 🔧 Algoritmos de Escalonamento

## ⭐ Escalonamento por Prioridade
**Tipo:** Não-preemptivo

**Como funciona:** Executa os processos em ordem de prioridade (menor número = maior prioridade). Processos de alta prioridade são sempre executados antes dos de baixa prioridade, independente da ordem de chegada.

**Objetivo:** Garantir que tarefas críticas sejam executadas primeiro, refletindo a importância real de cada processo no sistema.

🏥 **Contexto Hospitalar:** Como um hospital que atende por ordem de urgência médica. Emergências (Prioridade 1) são atendidas antes de consultas de rotina (Prioridade 5), independente da ordem de chegada.

---

## 🔄 Round Robin (RR)
**Tipo:** Preemptivo

**Como funciona:** Cada processo recebe um quantum de tempo fixo. Se não terminar neste tempo, é interrompido e colocado no final da fila. Execução circular entre todos os processos.

**Objetivo:** Garantir fairness entre todos os processos, evitando que um processo monopolize a CPU e proporcionando boa resposta para sistemas interativos.

🏥 **Contexto Hospitalar:** Como um pronto-socorro que atende todos os pacientes por ordem de chegada, dando um tempo limitado para cada consulta. Se não terminar no tempo, o paciente volta ao final da fila.

---

## ⚡ Shortest Job First (SJF)
**Tipo:** Não-preemptivo

**Como funciona:** Executa primeiro o processo com menor tempo estimado de execução. Uma vez iniciado, o processo executa até completar totalmente.

**Objetivo:** Minimizar o tempo médio de espera do sistema, priorizando processos que podem ser completados rapidamente.

🏥 **Contexto Hospitalar:** Como uma clínica que prioriza consultas rápidas. Pacientes que precisam de apenas alguns minutos são atendidos primeiro, mesmo chegando depois de quem precisa de consultas longas.

---

## 🔄 Shortest Remaining Time First (SRTF)
**Tipo:** Preemptivo

**Como funciona:** Versão preemptiva do SJF. A cada chegada de novo processo, compara o tempo restante do processo atual com o tempo do novo. Se o novo for menor, interrompe o atual.

**Objetivo:** Maximizar o throughput do sistema, sempre executando o processo que pode ser completado mais rapidamente, adaptando-se dinamicamente às mudanças.

🏥 **Contexto Hospitalar:** Como um pronto-socorro que pode interromper consultas longas quando chega um caso que precisa de atendimento mais rápido. Maximiza o número de pacientes atendidos rapidamente.

---

## 📊 Resumo Comparativo

| Algoritmo | Tipo | Objetivo Principal | Principal Vantagem | Principal Desvantagem |
|-----------|------|-------------------|-------------------|----------------------|
| **Prioridade** | Não-preemptivo | Criticidade | Reflete importância real | Pode causar starvation |
| **Round Robin** | Preemptivo | Fairness | Não há starvation | Overhead de context switch |
| **SJF** | Não-preemptivo | Eficiência | Menor tempo médio de espera | Starvation de jobs longos |
| **SRTF** | Preemptivo | Throughput | Melhor turnaround time | Alto overhead de preempção |
