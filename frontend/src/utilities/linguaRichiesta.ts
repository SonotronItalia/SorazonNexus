import { headers } from 'next/headers'

import { linguaValida } from './lingue'

// Lingua della richiesta: la mette il proxy (proxy.ts) togliendo il prefisso /en/… dall'indirizzo
export async function linguaRichiesta(): Promise<string> {
  return linguaValida((await headers()).get('x-lingua'))
}
