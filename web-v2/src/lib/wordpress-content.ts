/**
 * Read-only public WordPress.com content adapter for the Fajr Parsa newsroom.
 * This is an intentionally unauthenticated integration. Never add tokens or customer data here.
 * WordPress site ID: 256155663 (fajerparsa.wordpress.com).
 */
export interface WordPressArticle {
  id: number
  date: string
  slug: string
  status: string
  title: { rendered: string }
  excerpt: { rendered: string }
  content?: { rendered: string }
}

export interface ArticleBlock {
  type: 'heading' | 'paragraph' | 'list' | 'quote'
  text: string
}

const API_ROOT = 'https://public-api.wordpress.com/wp/v2/sites/256155663'
const DEFAULT_POST_SLUG = 'hello-world'

function validArticle(value: unknown): value is WordPressArticle {
  if (!value || typeof value !== 'object') return false
  const item = value as Partial<WordPressArticle>
  return (
    typeof item.id === 'number' && Number.isSafeInteger(item.id) && item.id > 0 &&
    typeof item.slug === 'string' && typeof item.date === 'string' &&
    item.status === 'publish' && typeof item.title?.rendered === 'string' &&
    typeof item.excerpt?.rendered === 'string'
  )
}

async function getJson(url: string, signal?: AbortSignal): Promise<unknown> {
  const response = await fetch(url, {
    method: 'GET',
    signal,
    headers: { Accept: 'application/json' },
    credentials: 'omit',
  })
  if (!response.ok) throw new Error('WordPress HTTP ' + response.status)
  return response.json()
}

export async function getPublishedArticles(signal?: AbortSignal): Promise<WordPressArticle[]> {
  const params = new URLSearchParams({
    per_page: '20',
    orderby: 'date',
    order: 'desc',
    _fields: 'id,date,slug,status,title,excerpt',
  })
  const items = await getJson(API_ROOT + '/posts?' + params.toString(), signal)
  if (!Array.isArray(items)) throw new Error('Unexpected WordPress response')
  return items.filter(validArticle).filter((post) => post.slug !== DEFAULT_POST_SLUG)
}

export async function getPublishedArticle(id: number, signal?: AbortSignal): Promise<WordPressArticle> {
  if (!Number.isSafeInteger(id) || id < 1) throw new Error('Invalid article ID')
  const params = new URLSearchParams({ _fields: 'id,date,slug,status,title,excerpt,content' })
  const item = await getJson(API_ROOT + '/posts/' + id + '?' + params.toString(), signal)
  if (!validArticle(item) || item.slug === DEFAULT_POST_SLUG) {
    throw new Error('Article is not published')
  }
  return item
}

/** Treat all WordPress content as untrusted. Only render text nodes, never raw HTML. */
function parseSafeDocument(markup: string): Document {
  const doc = new DOMParser().parseFromString(markup, 'text/html')
  doc.querySelectorAll('script,style,iframe,object,embed,form,svg').forEach((node) => node.remove())
  return doc
}

export function toPlainText(markup: string): string {
  return parseSafeDocument(markup).body.textContent?.replace(/\s+/g, ' ').trim() ?? ''
}

export function toSafeBlocks(markup: string): ArticleBlock[] {
  const doc = parseSafeDocument(markup)
  return Array.from(doc.body.querySelectorAll('h2,h3,p,li,blockquote'))
    .filter((node) => !node.parentElement?.closest('li,blockquote'))
    .slice(0, 100)
    .map((node) => {
      const tag = node.tagName.toLowerCase()
      const type: ArticleBlock['type'] = tag === 'h2' || tag === 'h3'
        ? 'heading'
        : tag === 'li' ? 'list' : tag === 'blockquote' ? 'quote' : 'paragraph'
      return { type, text: (node.textContent ?? '').replace(/\s+/g, ' ').trim().slice(0, 4000) }
    })
    .filter((block) => block.text.length > 0)
}
