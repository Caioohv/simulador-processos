// composables/testSimulacao.ts
// Simulação de teste simples para verificar se métricas funcionam

export const useTestSimulacao = () => {
  const testarRoundRobin = () => {
    console.log('🧪 === TESTE ROUND ROBIN ===')
    
    // Criar processos de teste
    const processos = [
      { pid: 1, nome: '👨 João', ingresso: 0, duracao: 6000, prioridade: 3 },
      { pid: 2, nome: '👩 Maria', ingresso: 1000, duracao: 3000, prioridade: 2 },
      { pid: 3, nome: '👴 Pedro', ingresso: 2000, duracao: 4000, prioridade: 1 }
    ]
    
    // Simular Round Robin com quantum de 2000ms
    let tempo = 0
    const quantum = 2000
    const fila = [...processos.map(p => ({ ...p, duracaoOriginal: p.duracao }))]
    const terminados = []
    const gantt = []
    let trocasContexto = 0
    
    console.log('📋 Processos iniciais:', fila)
    
    while (fila.length > 0) {
      const processo = fila.shift()!
      const tempoExecucao = Math.min(quantum, processo.duracao)
      
      console.log(`⚡ Executando ${processo.nome} por ${tempoExecucao}ms no tempo ${tempo}`)
      
      // Registrar no Gantt
      gantt.push({
        medico: 'Médico-1',
        processo: processo.nome,
        inicio: tempo,
        fim: tempo + tempoExecucao,
        cor: '#3B82F6'
      })
      
      tempo += tempoExecucao
      processo.duracao -= tempoExecucao
      
      if (processo.duracao > 0) {
        // Volta para fila
        fila.push(processo)
        trocasContexto++
        console.log(`⏰ ${processo.nome} volta à fila (restante: ${processo.duracao}ms)`)
      } else {
        // Terminou
        const turnaround = tempo - processo.ingresso
        const espera = turnaround - processo.duracaoOriginal
        
        terminados.push({
          ...processo,
          tempoFimExecucao: tempo,
          tempoTurnaround: turnaround,
          tempoEspera: espera
        })
        
        console.log(`✅ ${processo.nome} TERMINOU! Turnaround: ${turnaround}ms, Espera: ${espera}ms`)
      }
    }
    
    // Calcular métricas
    const tempoMedioEspera = terminados.reduce((acc, p) => acc + p.tempoEspera, 0) / terminados.length
    const tempoMedioTurnaround = terminados.reduce((acc, p) => acc + p.tempoTurnaround, 0) / terminados.length
    const utilizacaoCpu = (terminados.reduce((acc, p) => acc + p.duracaoOriginal, 0) / tempo) * 100
    
    const resultado = {
      metricas: {
        tempoMedioEspera,
        tempoMedioTurnaround,
        numeroTrocasContexto: trocasContexto,
        utilizacaoMediaCPU: utilizacaoCpu,
        tempoTotalSimulacao: tempo
      },
      processos: terminados,
      diagramaGantt: gantt,
      eventos: [],
      medicos: [{ id: 'medico-1', nome: 'Médico-1', ocupado: false, tempoOcupado: tempo }]
    }
    
    console.log('📊 === MÉTRICAS FINAIS ===')
    console.log(`⏱️  Tempo Médio de Espera: ${tempoMedioEspera.toFixed(2)}ms`)
    console.log(`🏃 Tempo Médio de Turnaround: ${tempoMedioTurnaround.toFixed(2)}ms`)
    console.log(`🔀 Trocas de Contexto: ${trocasContexto}`)
    console.log(`💻 Utilização CPU: ${utilizacaoCpu.toFixed(1)}%`)
    console.log(`⏰ Tempo Total: ${tempo}ms`)
    console.log('📈 Gantt Chart:', gantt)
    
    return resultado
  }
  
  return {
    testarRoundRobin
  }
}