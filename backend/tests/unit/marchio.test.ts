import { describe, expect, it } from 'vitest'

import { RIFERIMENTO_ESTERNO } from '@/collections/Marchio'

describe('riferimenti esterni negli SVG del marchio', () => {
  it('trova href, src e url() verso altri siti', () => {
    for (const s of [
      '<image href="https://x.invalid/a.png"/>',
      "<image xlink:href='http://x.invalid/a.png'/>",
      '<image href="//x.invalid/a.png"/>',
      '<rect style="fill:url(https://x.invalid/a)"/>',
      '<rect style="fill:url( \'//x.invalid/a\')"/>',
    ])
      expect(RIFERIMENTO_ESTERNO.test(s), s).toBe(true)
  })

  it('ammette i namespace, i riferimenti interni e le immagini incorporate', () => {
    for (const s of [
      '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">',
      '<use href="#forma"/>',
      '<rect fill="url(#sfumatura)"/>',
      '<image xlink:href="data:image/png;base64,AAAA"/>',
    ])
      expect(RIFERIMENTO_ESTERNO.test(s), s).toBe(false)
  })
})
