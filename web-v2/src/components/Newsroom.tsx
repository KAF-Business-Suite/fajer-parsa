import { useEffect, useMemo, useState } from 'react'
import { ArrowLeft, ArrowRight, BookOpenText, CalendarDays, RefreshCw, ShieldCheck } from 'lucide-react'
import {
  getPublishedArticle,
  getPublishedArticles,
  toPlainText,
  toSafeBlocks,
  type WordPressArticle,
} from '../lib/wordpress-content'

type LoadState = 'loading' | 'ready' | 'error'

function localDate(iso: string): string {
  const date = new Date(iso)
  return Number.isNaN(date.getTime())
    ? ''
    : new Intl.DateTimeFormat('fa-AF', { year: 'numeric', month: 'long', day: 'numeric' }).format(date)
}

export function Newsroom({ routeHash }: { routeHash: string }) {
  const match = /^#\/journal\/post\/([1-9]\d*)$/.exec(routeHash)
  const articleId = match ? Number(match[1]) : null
  const invalidRoute = routeHash !== '#/journal' && articleId === null
  const [articles, setArticles] = useState<WordPressArticle[]>([])
  const [article, setArticle] = useState<WordPressArticle | null>(null)
  const [loadState, setLoadState] = useState<LoadState>('loading')
  const [retry, setRetry] = useState(0)

  useEffect(() => {
    if (invalidRoute) {
      setLoadState('error')
      return
    }
    const controller = new AbortController()
    setLoadState('loading')
    setArticle(null)
    const task = articleId === null
      ? getPublishedArticles(controller.signal).then(setArticles)
      : getPublishedArticle(articleId, controller.signal).then(setArticle)
    task.then(() => {
      if (!controller.signal.aborted) setLoadState('ready')
    }).catch(() => {
      if (!controller.signal.aborted) setLoadState('error')
    })
    return () => controller.abort()
  }, [articleId, invalidRoute, retry])

  const paragraphs = useMemo(() => article?.content?.rendered ? toSafeBlocks(article.content.rendered) : [], [article])
  const retryLoad = () => setRetry((value) => value + 1)

  return (
    <section className="shell min-h-[70vh] pb-36 pt-12 md:pb-20 md:pt-16" aria-label="مرکز مقالات فجر پارسا">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
        <a href="#" className="inline-flex items-center gap-2 rounded-xl border border-[var(--fp-line)] bg-[var(--fp-surface)] px-4 py-2.5 text-xs font-bold hover:border-[var(--fp-gold)]">
          <ArrowRight size={16} /> صفحه اصلی
        </a>
        <span className="inline-flex items-center gap-2 text-xs font-bold text-[var(--fp-muted)]">
          <ShieldCheck size={16} /> راهنمای عمومی؛ شرایط نهایی با دفتر و مراجع رسمی بررسی شود
        </span>
      </div>

      <div className="relative mb-9 overflow-hidden rounded-[30px] bg-[#09111f] px-6 py-12 text-white shadow-2xl md:px-12 md:py-16">
        <div className="pointer-events-none absolute -left-12 -top-20 h-64 w-64 rounded-full bg-[#caa85a]/20 blur-3xl" aria-hidden="true" />
        <div className="pointer-events-none absolute -bottom-28 right-10 h-64 w-64 rounded-full bg-[#0c746d]/30 blur-3xl" aria-hidden="true" />
        <div className="relative">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#d3b370]/30 px-4 py-2 text-xs font-bold text-[#e7d095]">
            <BookOpenText size={16} /> FAJR PARSA JOURNAL
          </div>
          <h1 className="max-w-3xl text-3xl font-black leading-[1.65] md:text-5xl">
            {articleId === null ? 'راهنما، اخبار و مقالات سفر' : 'راهنمای سفر فجر پارسا'}
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-8 text-slate-300">
            مطالب آموزشی و اطلاع‌رسانی فجر پارسا در همین وب‌سایت نمایش داده می‌شوند و از مرکز مدیریت محتوای WordPress خوانده می‌شوند.
          </p>
        </div>
      </div>

      {articleId !== null && (
        <a href="#/journal" className="mb-6 inline-flex items-center gap-2 text-sm font-extrabold text-[var(--fp-teal)]">
          <ArrowRight size={17} /> بازگشت به همه مقالات
        </a>
      )}

      <div aria-live="polite" aria-atomic="true">
        {loadState === 'loading' && (
          <div role="status" className="rounded-[24px] border border-[var(--fp-line)] bg-[var(--fp-surface)] p-10 text-center text-sm">
            در حال دریافت مقالات منتشرشده…
          </div>
        )}

        {loadState === 'error' && (
          <div role="alert" className="rounded-[24px] border border-amber-300/60 bg-[var(--fp-surface)] p-8 text-center">
            <h2 className="text-xl font-black">محتوا فعلاً در دسترس نیست</h2>
            <p className="mt-3 text-sm leading-7 text-[var(--fp-muted)]">ممکن است ارتباط با مرکز مقالات قطع شده باشد. خدمات اصلی سایت همچنان فعال است.</p>
            <button type="button" onClick={retryLoad} className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#09111f] px-5 py-3 text-xs font-bold text-white">
              <RefreshCw size={16} /> تلاش دوباره
            </button>
          </div>
        )}

        {loadState === 'ready' && articleId === null && (
          articles.length === 0 ? (
            <div className="rounded-[24px] border border-[var(--fp-line)] bg-[var(--fp-surface)] px-6 py-12 text-center">
              <BookOpenText size={34} className="mx-auto text-[var(--fp-gold)]" />
              <h2 className="mt-4 text-xl font-black">مقالهٔ تأییدشده‌ای هنوز منتشر نشده است</h2>
              <p className="mx-auto mt-3 max-w-lg text-sm leading-8 text-[var(--fp-muted)]">
                پس از نشر اولین راهنمای رسمی در WordPress، عنوان و خلاصهٔ آن به‌صورت خودکار اینجا ظاهر می‌شود.
              </p>
              <a href="#services" className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#09111f] px-5 py-3 text-xs font-black text-white">
                مشاهده خدمات <ArrowLeft size={16} />
              </a>
            </div>
          ) : (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {articles.map((post) => (
                <article key={post.id} className="group flex flex-col overflow-hidden rounded-[26px] border border-[var(--fp-line)] bg-[var(--fp-surface)] p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
                  <div className="mb-6 flex items-center justify-between">
                    <span className="rounded-full bg-[#e7d095]/25 px-3 py-1 text-xs font-extrabold text-[#836018]">راهنمای سفر</span>
                    <BookOpenText size={22} className="text-[var(--fp-teal)]" />
                  </div>
                  <h2 className="text-xl font-black leading-9">{toPlainText(post.title.rendered)}</h2>
                  <p className="mt-3 line-clamp-4 flex-1 text-sm leading-8 text-[var(--fp-muted)]">{toPlainText(post.excerpt.rendered)}</p>
                  <div className="mt-6 flex items-center justify-between border-t border-[var(--fp-line)] pt-4">
                    <span className="flex items-center gap-1.5 text-[11px] text-[var(--fp-muted)]"><CalendarDays size={14} />{localDate(post.date)}</span>
                    <a href={'#/journal/post/' + post.id} className="inline-flex items-center gap-1.5 text-xs font-black text-[var(--fp-teal)]" aria-label={'خواندن ' + toPlainText(post.title.rendered)}>
                      مطالعه مقاله <ArrowLeft size={15} />
                    </a>
                  </div>
                </article>
              ))}
            </div>
          )
        )}

        {loadState === 'ready' && articleId !== null && article && (
          <article className="mx-auto max-w-4xl rounded-[28px] border border-[var(--fp-line)] bg-[var(--fp-surface)] px-6 py-10 shadow-sm md:px-12">
            <div className="mb-5 inline-flex items-center gap-2 text-xs text-[var(--fp-muted)]"><CalendarDays size={15}/>{localDate(article.date)}</div>
            <h2 className="text-2xl font-black leading-[1.7] md:text-4xl">{toPlainText(article.title.rendered)}</h2>
            <div className="my-7 h-px bg-[var(--fp-line)]" />
            <div className="space-y-5 text-sm leading-9 md:text-base">
              {paragraphs.map((block, index) => {
                if (block.type === 'heading') return <h3 key={index} className="pt-4 text-xl font-black">{block.text}</h3>
                if (block.type === 'quote') return <blockquote key={index} className="border-r-4 border-[var(--fp-gold)] pr-4 italic">{block.text}</blockquote>
                if (block.type === 'list') return <p key={index} className="pr-3">• {block.text}</p>
                return <p key={index}>{block.text}</p>
              })}
              {paragraphs.length === 0 && <p>متن قابل نمایش برای این مقاله موجود نیست.</p>}
            </div>
            <div className="mt-10 rounded-2xl bg-[var(--fp-mist)] p-5 text-xs leading-7 text-[var(--fp-muted)]">
              این نوشته برای آگاهی عمومی است و تضمین ویزا یا نتیجهٔ درخواست نیست. مقررات، هزینه‌ها و زمان‌بندی را پیش از اقدام با منبع رسمی بررسی کنید.
            </div>
            <a href="#journey" className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#09111f] px-5 py-3 text-xs font-black text-white">
              بررسی خدمات و درخواست <ArrowLeft size={16} />
            </a>
          </article>
        )}
      </div>
    </section>
  )
}
