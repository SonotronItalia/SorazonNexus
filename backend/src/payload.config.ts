import { postgresAdapter } from '@payloadcms/db-postgres'
import { nodemailerAdapter } from '@payloadcms/email-nodemailer'
import sharp from 'sharp'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'

import { Categories } from './collections/Categories'
import { Media } from './collections/Media'
import { Pages } from './collections/Pages'
import { Posts } from './collections/Posts'
import { Users } from './collections/Users'
import { Centri } from './collections/Centri'
import { Colori } from './collections/Colori'
import { BLOCCHI_PAGINA } from './blocks/blocchiPagina'
import { Footer } from './Footer/config'
import { Header } from './Header/config'
import { plugins } from './plugins'
import { defaultLexical } from '@/fields/defaultLexical'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

// Indirizzi pubblici (quelli che vede il browser), letti a runtime dall'ambiente
const origins = [process.env.FRONTEND_PUBLIC_URL, process.env.BACKEND_PUBLIC_URL].filter(
  Boolean,
) as string[]

// Email: SMTP solo se configurato (in sviluppo Mailpit, vedi docker-compose.dev.yml).
// Senza SMTP_HOST Payload scrive le email nel log, come prima.
const email = process.env.SMTP_HOST
  ? nodemailerAdapter({
      // Email di sistema del CMS (reset password, account): indirizzo IT
      defaultFromAddress: process.env.EMAIL_FROM || 'it@sonotronitalia.com',
      defaultFromName: 'Sorazon',
      // Non blocca l'avvio se il server SMTP non risponde subito
      skipVerify: true,
      transportOptions: {
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT || 587),
        // 465 = TLS diretto; 587 e 1025 (Mailpit) = STARTTLS o in chiaro
        secure: Number(process.env.SMTP_PORT) === 465,
        auth: process.env.SMTP_USER
          ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
          : undefined,
      },
    })
  : undefined

export default buildConfig({
  email,
  serverURL: process.env.BACKEND_PUBLIC_URL,
  cors: origins,
  csrf: origins,
  admin: {
    importMap: {
      baseDir: path.resolve(dirname),
    },
    user: Users.slug,
    livePreview: {
      breakpoints: [
        {
          label: 'Mobile',
          name: 'mobile',
          width: 375,
          height: 667,
        },
        {
          label: 'Tablet',
          name: 'tablet',
          width: 768,
          height: 1024,
        },
        {
          label: 'Desktop',
          name: 'desktop',
          width: 1440,
          height: 900,
        },
      ],
    },
  },
  // This config helps us configure global or default features that the other editors can inherit
  editor: defaultLexical,
  db: postgresAdapter({
    // Niente sincronizzazione automatica dello schema neanche in sviluppo:
    // lo schema cambia solo con le migrazioni (make migrate-create, make migrate)
    push: false,
    pool: {
      connectionString: process.env.DATABASE_URL || '',
    },
  }),
  // Blocchi delle pagine, usati per nome dalle pagine e dal Contenitore (vedi blocks/blocchiPagina.ts)
  blocks: BLOCCHI_PAGINA,
  collections: [Pages, Posts, Centri, Colori, Media, Categories, Users],
  globals: [Header, Footer],
  plugins,
  secret: process.env.PAYLOAD_SECRET,
  sharp,
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
})
