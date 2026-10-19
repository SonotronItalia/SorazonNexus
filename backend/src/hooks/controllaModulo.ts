import { APIError, type CollectionBeforeValidateHook } from 'payload'

// Campo trappola: nascosto ai visitatori, i programmi che compilano tutto lo riempiono
export const CAMPO_TRAPPOLA = '_sito'

const MAX_CARATTERI = 5000
const EMAIL = /^[^\s@<>()",;:]+@[^\s@<>()",;:]+\.[^\s@<>()",;:]{2,}$/

type Voce = { field?: string; value?: unknown }

/**
 * Controlli sugli invii dei moduli del sito, fatti dal backend perché chiunque può chiamare
 * POST /api/form-submissions senza passare dal sito: campo trappola vuoto, solo i campi del
 * modulo, obbligatori compilati, caselle obbligatorie spuntate, email valide, testi non enormi.
 */
export const controllaModulo: CollectionBeforeValidateHook = async ({ data, operation, req }) => {
  if (operation !== 'create' || !data) return data

  const voci: Voce[] = Array.isArray(data.submissionData) ? data.submissionData : []
  const trappola = voci.find((v) => v.field === CAMPO_TRAPPOLA)
  if (trappola && String(trappola.value ?? '').trim() !== '') {
    req.payload.logger.warn('[moduli] invio scartato: campo trappola compilato')
    throw new APIError('Invio non valido.', 400, null, true)
  }

  const idModulo = typeof data.form === 'object' && data.form ? data.form.id : data.form
  if (idModulo == null) throw new APIError('Modulo mancante.', 400, null, true)
  const modulo = await req.payload.findByID({ collection: 'forms', id: idModulo, depth: 0, req }).catch(() => null)
  if (!modulo) throw new APIError('Modulo inesistente.', 400, null, true)

  const campi = (modulo.fields ?? []).filter(
    (c): c is typeof c & { name: string } => 'name' in c && typeof c.name === 'string',
  )
  const valori = new Map(voci.map((v) => [v.field, v.value]))

  for (const campo of campi) {
    const valore = valori.get(campo.name)
    const testo = typeof valore === 'string' ? valore.trim() : valore
    const etichetta = ('label' in campo && campo.label) || campo.name
    if ('required' in campo && campo.required) {
      const vuoto = campo.blockType === 'checkbox' ? valore !== true && valore !== 'true' : testo == null || testo === ''
      if (vuoto) throw new APIError(`Il campo "${etichetta}" è obbligatorio.`, 400, null, true)
    }
    if (typeof testo === 'string' && testo.length > MAX_CARATTERI) {
      throw new APIError(`Il campo "${etichetta}" è troppo lungo.`, 400, null, true)
    }
    if (campo.blockType === 'email' && typeof testo === 'string' && testo && !EMAIL.test(testo)) {
      throw new APIError(`L'indirizzo email non è valido.`, 400, null, true)
    }
  }

  // Si salvano solo i campi del modulo (niente trappola né campi inventati)
  const nomi = new Set(campi.map((c) => c.name))
  return {
    ...data,
    submissionData: voci
      .filter((v) => v.field && nomi.has(v.field))
      .map((v) => ({ field: v.field, value: typeof v.value === 'string' ? v.value.trim() : String(v.value ?? '') })),
  }
}
