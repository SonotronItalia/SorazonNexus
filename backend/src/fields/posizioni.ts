// Nove posizioni in un riquadro: riga (alto, centro, basso) e colonna (sinistra, centro, destra).
// Usate per il titolo degli hero e per il punto di partenza degli effetti.
export const POSIZIONI = ['alto', 'centro', 'basso'].flatMap((riga) =>
  ['sinistra', 'centro', 'destra'].map((colonna) => ({
    label: `${riga[0].toUpperCase()}${riga.slice(1)} ${colonna}`,
    value: `${riga}-${colonna}`,
  })),
)
