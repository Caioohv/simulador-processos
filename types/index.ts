// types/processo.ts
export interface IProcesso {
  pid: number
  nome: string
  ingresso: number
  duracao: number
  duracaoOriginal: number
  prioridade: number
  estado: EstadoProcesso
  tempoEspera: number
  tempoResposta: number
  tempoTurnaround: number
  tempoInicioExecucao?: number
  tempoFimExecucao?: number
  numeroExecucoes: number
  medico?: string // Representa o núcleo/médico que está atendendo
  
  // Métodos
  toDisplayString(): string
  executar(duracao?: number): Promise<boolean>
  clone(): IProcesso
}

export enum EstadoProcesso {
  NOVO = 'novo',
  PRONTO = 'pronto', 
  EXECUTANDO = 'executando',
  BLOQUEADO = 'bloqueado',
  TERMINADO = 'terminado'
}

export enum AlgoritmoEscalonamento {
  ROUND_ROBIN = 'round_robin',
  SHORTEST_JOB_FIRST = 'shortest_job_first',
  SHORTEST_REMAINING_TIME = 'shortest_remaining_time',
  PRIORIDADE = 'prioridade'
}

// Re-export do enum para garantir compatibilidade
export const AlgoritmoEscalonamentoEnum = AlgoritmoEscalonamento

export interface ProcessoConfig {
  pid: number
  nome: string
  ingresso: number
  duracao: number
  prioridade: number
}

export interface ConfiguracaoSimulacao {
  algoritmo: AlgoritmoEscalonamento
  numeroMedicos: number // 1, 2 ou 4 núcleos
  quantum?: number // Para Round Robin
  processos: ProcessoConfig[]
}

export interface MetricasDesempenho {
  tempoMedioEspera: number
  tempoMedioTurnaround: number
  numeroTrocasContexto: number
  utilizacaoMediaCPU: number
  tempoTotalSimulacao: number
}

export interface EventoExecucao {
  tempo: number
  tipo: 'inicio' | 'fim' | 'preempcao' | 'chegada'
  processo: IProcesso
  medico?: string
  descricao: string
}

export interface EstadoMedico {
  id: string
  nome: string
  ocupado: boolean
  processoAtual?: IProcesso
  tempoOcupado: number
}

export interface ResultadoSimulacao {
  metricas: MetricasDesempenho
  eventos: EventoExecucao[]
  processos: IProcesso[]
  medicos: EstadoMedico[]
  diagramaGantt: RegistroGantt[]
}

export interface RegistroGantt {
  medico: string
  processo: string
  inicio: number
  fim: number
  cor?: string
}

export interface CenarioTeste {
  nome: string
  descricao: string
  configuracao: ConfiguracaoSimulacao
  objetivos: string[]
  perguntasAnalise: string[]
}

// Tipos adicionais para as páginas
export interface ProcessoConfigForm {
  id: string
  nome: string
  tempoChegada: number
  tempoExecucao: number
  prioridade: number
}

export interface ComparacaoResultado {
  algoritmo: string
  resultado: ResultadoSimulacao
}

export interface ConfiguradorProcesso extends ProcessoConfigForm {}