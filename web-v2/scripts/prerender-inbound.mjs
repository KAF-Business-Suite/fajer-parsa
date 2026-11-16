// Build-time only: use the same React page as visitors, with no server/Worker at runtime.
import { createServer } from 'vite'
import { readFile, writeFile } from 'node:fs/promises'
const server = await createServer({ server: { middlewareMode:true }, appType:'custom' })
try {
  const { renderInbound, inboundSeo, inboundCanonical } = await server.ssrLoadModule('/src/entry-prerender.tsx')
  const escape = value => value.replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;').replaceAll('>','&gt;')
  const seo = inboundSeo.en
  let html = await readFile('dist/index.html','utf8')
  html = html.replace('<html lang="fa" dir="rtl">','<html lang="en" dir="ltr">')
    .replace(/<title>[^<]*<\/title>/, `<title>${escape(seo.title)}</title>`)
    .replace(/<meta name="description" content="[^"]*"\s*\/>/, `<meta name="description" content="${escape(seo.description)}" />`)
    .replace('<div id="root"></div>', () => `<div id="root">${renderInbound()}</div>`)
  const tags = [`<link rel="canonical" href="${inboundCanonical}" data-inbound-seo />`]
  for (const [property,content] of Object.entries({'og:title':seo.title,'og:description':seo.description,'og:url':inboundCanonical,'og:type':'website','og:locale':'en_US'})) {
    tags.push(`<meta property="${property}" content="${escape(content)}" data-inbound-seo />`)
  }
  html = html.replace('</head>', tags.join('\n    ')+'\n  </head>')
  await writeFile('dist/inbound.html',html)
  console.log('Pre-rendered /inbound from the existing React page (static HTML only).')
} finally { await server.close() }
