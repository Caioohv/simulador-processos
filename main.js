// main.js - Exemplo de uso dos composables (Node.js)
// Para usar no Nuxt, importe diretamente nas páginas

import { useProcesso } from './composables/useProcesso.js'
import { useSimuladorHospital } from './composables/useSimuladorHospital.js'

console.log('🏥 === SIMULADOR DO HOSPITAL DIGITAL ===')
console.log('Este exemplo demonstra o uso dos composables.')
console.log('Para interface completa, execute: npm run dev')
console.log('')

// Demonstração básica dos composables
async function exemploBasico() {
  const { Processo, criarProcessosExemplo, compararAlgoritmos } = useSimuladorHospital()
  
  console.log('📋 Criando processos de exemplo...')
  const processos = criarProcessosExemplo()
  
  console.log('🔄 Comparando algoritmos com 1 médico...')
  await compararAlgoritmos(processos, 1, 2000)
  
  console.log('\n' + '='.repeat(50))
  console.log('✅ Exemplo concluído!')
  console.log('💡 Para ver interface completa: npm run dev')
}

// Executar exemplo se este arquivo for executado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  exemploBasico().catch(console.error)
}

export { useProcesso, useSimuladorHospital }
