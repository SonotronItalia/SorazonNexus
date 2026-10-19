// Data in italiano, es. "1 luglio 2014" (fuso orario di Roma, uguale sul server e nel browser)
export const formatDateTime = (timestamp: string): string =>
  new Date(timestamp || Date.now()).toLocaleDateString('it-IT', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'Europe/Rome',
  })
