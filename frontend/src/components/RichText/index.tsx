import { MediaBlock } from '@/blocks/MediaBlock/Component'
import {
  DefaultNodeTypes,
  SerializedBlockNode,
  SerializedLinkNode,
  type DefaultTypedEditorState,
} from '@payloadcms/richtext-lexical'
import {
  JSXConvertersFunction,
  LinkJSXConverter,
  RichText as ConvertRichText,
} from '@payloadcms/richtext-lexical/react'

import { CodeBlock, CodeBlockProps } from '@/blocks/Code/Component'

import type {
  BannerBlock as BannerBlockProps,
  CallToActionBlock as CTABlockProps,
  MediaBlock as MediaBlockProps,
} from '@/payload-types'
import { BannerBlock } from '@/blocks/Banner/Component'
import { CallToActionBlock } from '@/blocks/CallToAction/Component'
import { LinkInterno, LinkScritto } from '@/components/LinkInterno'
import { cn } from '@/utilities/ui'
import { stileTesto } from '@/utilities/stileTesto'

type NodeTypes =
  | DefaultNodeTypes
  | SerializedBlockNode<CTABlockProps | MediaBlockProps | BannerBlockProps | CodeBlockProps>

const internalDocToHref = ({ linkNode }: { linkNode: SerializedLinkNode }) => {
  const { value, relationTo } = linkNode.fields.doc!
  if (typeof value !== 'object') {
    throw new Error('Expected value to be an object')
  }
  const slug = value.slug
  return relationTo === 'posts' ? `/posts/${slug}` : `/${slug}`
}

const collegamenti = LinkJSXConverter({ internalDocToHref })

const jsxConverters: JSXConvertersFunction<NodeTypes> = ({ defaultConverters }) => ({
  ...defaultConverters,
  ...collegamenti,
  // Collegamenti a pagine e notizie: nella lingua della pagina (/en/…)
  link: (args) => {
    const doc = args.node.fields.doc
    if (
      args.node.fields.linkType === 'internal' &&
      doc &&
      typeof doc.value === 'object' &&
      doc.value.slug
    ) {
      return (
        <LinkInterno
          raccolta={doc.relationTo === 'posts' ? 'posts' : 'pages'}
          slug={String(doc.value.slug)}
          nuovaScheda={args.node.fields.newTab}
        >
          {args.nodesToJSX({ nodes: args.node.children })}
        </LinkInterno>
      )
    }
    // Indirizzi scritti a mano che iniziano con "/" (es. /privacy-policy): anche loro nella lingua
    const url = args.node.fields.url
    if (args.node.fields.linkType !== 'internal' && url?.startsWith('/') && !url.startsWith('//')) {
      return (
        <LinkScritto url={url} nuovaScheda={args.node.fields.newTab}>
          {args.nodesToJSX({ nodes: args.node.children })}
        </LinkScritto>
      )
    }
    return typeof collegamenti.link === 'function' ? collegamenti.link(args) : null
  },
  // Testo con "Stile testo" dell'editor (dimensione, colore della tavolozza): solo stili ammessi
  text: (args) => {
    const testo =
      typeof defaultConverters.text === 'function' ? defaultConverters.text(args) : args.node.text
    const stile = stileTesto(args.node.style)
    return stile ? <span style={stile}>{testo}</span> : testo
  },
  blocks: {
    banner: ({ node }) => <BannerBlock className="col-start-2 mb-4" {...node.fields} />,
    mediaBlock: ({ node }) => (
      <MediaBlock
        className="col-start-1 col-span-3"
        imgClassName="m-0"
        {...node.fields}
        captionClassName="mx-auto max-w-[48rem]"
        enableGutter={false}
        disableInnerContainer={true}
      />
    ),
    code: ({ node }) => <CodeBlock className="col-start-2" {...node.fields} />,
    cta: ({ node }) => <CallToActionBlock {...node.fields} />,
  },
})

type Props = {
  data: DefaultTypedEditorState
  enableGutter?: boolean
  enableProse?: boolean
} & React.HTMLAttributes<HTMLDivElement>

export default function RichText(props: Props) {
  const { className, enableProse = true, enableGutter = true, ...rest } = props
  return (
    <ConvertRichText
      converters={jsxConverters}
      className={cn(
        'payload-richtext',
        {
          container: enableGutter,
          'max-w-none': !enableGutter,
          'mx-auto prose md:prose-md dark:prose-invert': enableProse,
        },
        className,
      )}
      {...rest}
    />
  )
}
