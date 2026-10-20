// I test di integrazione scrivono nel database: girano SOLO su un database di prova indicato
// esplicitamente. backend/.env NON si carica (punta al database di sviluppo con i dati veri).
const url = process.env.TEST_DATABASE_URL
if (!url) {
  throw new Error(
    'Manca TEST_DATABASE_URL: i test di integrazione vanno lanciati su un database di prova ' +
      '(es. make test-int, che ne crea uno usa e getta)',
  )
}
process.env.DATABASE_URL = url
process.env.PAYLOAD_SECRET ||= 'segreto-solo-per-i-test-di-integrazione-0123456789'
// Nessun avviso al frontend durante i test
process.env.FRONTEND_INTERNAL_URL = 'http://127.0.0.1:9'
