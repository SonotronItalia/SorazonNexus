// ID di un video YouTube da un link (watch, youtu.be, embed, shorts) o dall'ID stesso
export const idYouTube = (link: string): string | null => {
  const m = link
    .trim()
    .match(/(?:youtube(?:-nocookie)?\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|live\/)|youtu\.be\/)([\w-]{11})|^([\w-]{11})$/)
  return m ? (m[1] ?? m[2]) : null
}
