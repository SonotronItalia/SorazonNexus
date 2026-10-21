/**
 * Cache dei file caricati (immagini, PDF, video, loghi), servita dal backend e passata intatta da
 * frontend e nginx. Una settimana: le immagini del sito hanno già la data di modifica
 * nell'indirizzo (?updatedAt), ma un PDF collegato a mano e sostituito con lo stesso nome deve
 * aggiornarsi in tempi ragionevoli. Dopo la scadenza il browser usa la copia che ha e la rinnova
 * in background (stale-while-revalidate). Vale anche per una CDN davanti al sito (Cloudflare).
 */
export const CACHE_MEDIA = 'public, max-age=604800, stale-while-revalidate=86400'
