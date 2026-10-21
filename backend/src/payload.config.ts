import { postgresAdapter } from '@payloadcms/db-postgres'
import { nodemailerAdapter } from '@payloadcms/email-nodemailer'
import sharp from 'sharp'
import path from 'path'
import { buildConfig } from 'payload'
import { en } from '@payloadcms/translations/languages/en'
import { it } from '@payloadcms/translations/languages/it'
import { fileURLToPath } from 'url'

import { Categories } from './collections/Categories'
import { Marchio } from './collections/Marchio'
import { Media } from './collections/Media'
import { Pages } from './collections/Pages'
import { Posts } from './collections/Posts'
import { Users } from './collections/Users'
import { Ruoli } from './collections/Ruoli'
import { Centri } from './collections/Centri'
import { Colori } from './collections/Colori'
import { Effetti } from './collections/Effetti'
import { TipiEffetto } from './collections/TipiEffetto'
import { BLOCCHI_PAGINA } from './blocks/blocchiPagina'
import { TornaSu } from './TornaSu/config'
import { Impostazioni } from './Impostazioni/config'
import { Seo } from './Seo/config'
import { Lingue } from './Lingue/config'
import { LINGUA_PRINCIPALE, LINGUE } from './lingue'
import { linguePerIlPannello } from './utilities/linguePerIlPannello'
import { Footer } from './Footer/config'
import { Header } from './Header/config'
import { plugins } from './plugins'
import { iconaPannello } from './endpoints/iconaPannello'
import { defaultLexical } from '@/fields/defaultLexical'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

// In produzione (non durante la build) il CMS non parte con segreti mancanti, corti o di esempio:
// con PAYLOAD_SECRET noto chiunque potrebbe firmare un accesso all'admin
if (process.env.NODE_ENV === 'production' && process.env.NEXT_PHASE !== 'phase-production-build') {
  for (const nome of ['PAYLOAD_SECRET', 'REVALIDATE_SECRET', 'PREVIEW_SECRET']) {
    const valore = process.env[nome] ?? ''
    if (valore.length < 32 || /cambiami|changeme|secret/i.test(valore)) {
      throw new Error(
        `${nome} mancante o debole: generalo con scripts/env.sh (almeno 32 caratteri casuali)`,
      )
    }
  }
}

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
    meta: {
      titleSuffix: ' – Sorazon',
      // Icona di Impostazioni > Marchio (endpoint qui sotto), o la Z predefinita
      icons: [{ rel: 'icon', url: '/api/icona-pannello' }],
    },
    // Pulsante "Esci" con testo in fondo al menu (quello di Payload è solo un'icona)
    components: {
      logout: { Button: '@/components/admin/Esci#Esci' },
      // Aspetto Sorazon (colori, carattere), spegnibile da Impostazioni del sito > Marchio
      header: ['@/components/admin/TemaPannello#TemaPannello'],
      // Marchio Sorazon nella pagina di accesso e in alto a sinistra
      graphics: {
        Logo: '@/components/admin/Marchio#Logo',
        Icon: '@/components/admin/Marchio#Icona',
      },
      // Manuale d'uso dentro l'admin (src/guida), con la voce "Guida" nel menu
      afterNavLinks: ['@/components/admin/Guida/Collegamento#CollegamentoGuida'],
      // Logo piccolo in cima al menu, sopra "Sfoglia per cartella"
      beforeNavLinks: ['@/components/admin/Marchio#LogoMenu'],
      views: {
        guida: {
          Component: '@/components/admin/Guida#Guida',
          path: '/guida',
          meta: { title: 'Guida' },
        },
      },
    },
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
  // Admin in italiano; ogni utente può passare all'inglese dal proprio account
  i18n: {
    supportedLanguages: { it, en },
    fallbackLanguage: 'it',
    // Le voci delle traduzioni dette "lingua" (Payload in italiano dice "locale" e "località")
    translations: {
      it: {
        general: {
          locale: 'Lingua',
          locales: 'Lingue',
          allLocales: 'Tutte le lingue',
          fallbackToDefaultLocale: "Usa l'italiano se manca la traduzione",
        },
        localization: {
          cannotCopySameLocale: 'Non si può copiare nella stessa lingua',
          copyToLocale: "Copia in un'altra lingua",
          localeToPublish: 'Lingua da pubblicare',
          selectedLocales: 'Lingue scelte',
          selectLocaleToCopy: 'Scegli la lingua in cui copiare',
          selectLocaleToDuplicate: 'Scegli le lingue da duplicare',
        },
        version: {
          publishAllLocales: 'Pubblica tutte le lingue',
          showLocales: 'Mostra le lingue:',
          selectLocales: 'Scegli le lingue da mostrare',
        },
      },
    },
  },
  // GraphQL non serve (il sito usa le API REST): spento, meno superficie esposta
  graphQL: { disable: true },
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
  // Favicon del pannello: rimanda al file dell'icona scelta in Impostazioni > Marchio
  endpoints: [iconaPannello],
  collections: [
    Pages,
    Posts,
    Centri,
    Colori,
    Effetti,
    TipiEffetto,
    Media,
    Marchio,
    Categories,
    Users,
    Ruoli,
  ],
  globals: [Impostazioni, Header, Footer, TornaSu, Seo, Lingue],
  // Traduzioni: italiano principale, le altre lingue di src/lingue.ts. Nel pannello compaiono
  // solo quelle attive in "Lingue e selettore" (e, per un traduttore, quelle che può tradurre)
  localization: {
    locales: LINGUE.map((l) => ({ code: l.codice, label: l.etichetta })),
    defaultLocale: LINGUA_PRINCIPALE,
    fallback: true,
    filterAvailableLocales: linguePerIlPannello,
  },
  plugins,
  secret: process.env.PAYLOAD_SECRET,
  sharp,
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
})
