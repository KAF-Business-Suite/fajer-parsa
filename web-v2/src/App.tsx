import { useEffect, useMemo, useRef, useState } from 'react'
import { MenuToggle } from './components/ui/menu-toggle'
import { useReducedMotion } from 'motion/react'
import { ThemeToggle } from './components/ThemeToggle'
import { TextAnimate } from './components/magicui/text-animate'
import { ShimmerButton } from './components/magicui/shimmer-button'
import { ScrollProgress } from './components/magicui/scroll-progress'
import { DestinationGallery } from './components/DestinationGallery'
import { FaqSection } from './components/FaqSection'
import { destinations } from './content/destinations'
import { MagicCard } from './components/magicui/magic-card'
import { BorderBeam } from './components/magicui/border-beam'
import { Reveal } from './components/Reveal'
import { DetailsDialog, type Selection } from './components/DetailsDialog'
import {
  ArrowLeft,
  BadgeCheck,
  BriefcaseBusiness,
  Building2,
  CheckCircle2,
  ChevronDown,
  Clock3,
  FileText,
  Globe2,
  Headphones,
  Languages,
  MessageCircle,
  Plane,
  Search,
  ShieldCheck,
  Sparkles,
  TicketCheck,
  UserRound,
  WalletCards,
} from 'lucide-react'

type FinderState = {
  passport: string
  destination: string
  purpose: string
}

const serviceGroups = [
  { title: 'ویزا و اقامت', icon: TicketCheck, desc: 'توریستی، تجاری، تحصیلی، کاری، زیارتی، تمدید، تغییر وضعیت و اقامت.', label: 'ویزا و اقامت' },
  { title: 'دعوتنامه و تجارت', icon: BriefcaseBusiness, desc: 'دعوتنامه تجاری، نمایشگاه، سفر کاری، جلسات و خدمات شرکتی.', label: 'سفر کاری' },
  { title: 'پرواز و هتل', icon: Plane, desc: 'درخواست بلیت، رزرو هتل، مسیر سفر و بسته‌های ترکیبی.', label: 'پرواز و هتل' },
  { title: 'زیارت و کاروان', icon: Building2, desc: 'عمره، کربلا، ایران و خدمات گروهی و زیارتی.', label: 'سفر زیارتی' },
  { title: 'اسناد و کنسولی', icon: FileText, desc: 'ترجمه، تصدیق، فرم، وقت سفارت و آماده‌سازی پرونده.', label: 'خدمات اسناد' },
  { title: 'خدمات مکمل سفر', icon: ShieldCheck, desc: 'بیمه، ترانسفر، بررسی اسناد و خدمات پشتیبان سفر.', label: 'همراه سفر' },
]

const moreDestinations = ['چین', 'ازبکستان', 'قزاقستان']

const trustItems = [
  ['انتخاب آگاهانه', 'خدمت و شرایط را بررسی کنید'],
  ['هماهنگی انسانی', 'مستقیم با دفتر در تماس باشید'],
  ['درخواست کوتاه', 'جزئیات سفر را یک‌جا آماده کنید'],
  ['پیگیری از دفتر', 'اطلاعات رسید را همراه داشته باشید'],
]
function App() {
  const headerRef = useRef<HTMLElement>(null)
  const [selection, setSelection] = useState<Selection | null>(null)
  const [query, setQuery] = useState('')
  const [headerScrolled, setHeaderScrolled] = useState(false)
  const reducedMotion = useReducedMotion()
  const request = () => setSelection({ title: 'آماده‌سازی درخواست', description: 'خدمت، زمان و جزئیات سفرتان را آماده کنید. ارسال نهایی پیام در واتساپ با خود شماست.', request: true })
  const inform = (title: string, description: string) => setSelection({ title, description })
  const [megaOpen, setMegaOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [finder, setFinder] = useState<FinderState>({ passport: 'افغانستان', destination: '', purpose: '' })
  const finderReady = useMemo(() => Boolean(finder.destination && finder.purpose), [finder])

  const visibleServices = useMemo(() => serviceGroups.filter(s => (s.title + ' ' + s.desc).includes(query.trim())), [query])
  useEffect(() => {
    const sync = () => setHeaderScrolled(window.scrollY > 24)
    sync(); window.addEventListener('scroll', sync, { passive: true })
    return () => window.removeEventListener('scroll', sync)
  }, [])
  useEffect(() => {
    const escape = (e: KeyboardEvent) => { if (e.key === 'Escape') { headerRef.current?.querySelector<HTMLElement>('[aria-expanded="true"]')?.focus(); setMegaOpen(false); setMobileOpen(false) } }
    window.addEventListener('keydown', escape)
    return () => window.removeEventListener('keydown', escape)
  }, [])
  useEffect(() => {
    if (!megaOpen && !mobileOpen) return
    const outside = (event: PointerEvent) => {
      if (event.target instanceof Node && !headerRef.current?.contains(event.target)) { setMegaOpen(false); setMobileOpen(false) }
    }
    const desktop = window.matchMedia('(min-width: 1024px)')
    const resize = () => { setMegaOpen(false); setMobileOpen(false) }
    document.addEventListener('pointerdown', outside)
    desktop.addEventListener('change', resize)
    return () => { document.removeEventListener('pointerdown', outside); desktop.removeEventListener('change', resize) }
  }, [megaOpen, mobileOpen])
  return (
    <div className="min-h-screen overflow-x-clip fp-app bg-[var(--fp-ivory)] text-[var(--fp-ink)]">
      <ScrollProgress className="fp-scroll-progress" aria-hidden="true" />
      <header ref={headerRef} data-scrolled={headerScrolled} className="floating-header" aria-label="سربرگ فجر پارسا">
        <div className="shell flex h-[74px] items-center justify-between gap-4">
          <a href="#" className="flex items-center gap-3">
            <div className="relative">
              <img src="/media/logo.png" alt="لوگوی فجر پارسا" className="h-12 w-12 rounded-[15px] border border-[var(--fp-line)] bg-[var(--fp-surface)] object-contain p-1 shadow-sm" />

            </div>
            <div>
              <div className="text-[17px] font-black tracking-[-.02em]">فجر پارسا</div>
              <div className="font-latin text-[9px] font-bold tracking-[.16em] text-slate-400">سفر • ویزا • تجارت</div>
            </div>
          </a>

          <nav className="hidden items-center gap-1 text-[13px] font-extrabold lg:flex">
            <button aria-expanded={megaOpen} aria-controls="services-mega" onClick={() => setMegaOpen(!megaOpen)} className="flex items-center gap-1.5 rounded-xl px-4 py-2.5 transition hover:bg-slate-900/5">
              خدمات <ChevronDown size={15} className={megaOpen ? 'rotate-180 transition' : 'transition'} />
            </button>
            <a className="rounded-xl px-4 py-2.5 transition hover:bg-slate-900/5" href="#destinations">کشورها</a>
            <a className="rounded-xl px-4 py-2.5 transition hover:bg-slate-900/5" href="#journey">درخواست سفر</a>
            <a className="rounded-xl px-4 py-2.5 transition hover:bg-slate-900/5" href="#deals">پیشنهادها</a>
            <a className="rounded-xl px-4 py-2.5 transition hover:bg-slate-900/5" href="#track">پیگیری</a>
          </nav>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <button onClick={() => inform('ارتباط با فجر پارسا', 'واتساپ دفتر: ۰۷۷۷۳۷۷۷۷۴. کابل، دشت برچی، مارکیت پیوند، منزل دوم، دفتر ۸۵. برای پیگیری، اطلاعات درج‌شده در رسید را آماده کنید.')} className="hidden items-center gap-2 rounded-xl border border-[var(--fp-line)] bg-[var(--fp-surface)] px-3.5 py-2.5 text-xs font-extrabold shadow-sm sm:flex"><Headphones size={16} /> تماس</button>
            <button onClick={request} className="shine rounded-xl bg-[#09111f] px-4 py-2.5 text-xs font-black text-white shadow-lg shadow-slate-950/10">شروع درخواست</button>
            <MenuToggle open={mobileOpen} onToggle={() => setMobileOpen(!mobileOpen)} />
          </div>
        </div>

        {megaOpen && (
          <div id="services-mega" className="absolute inset-x-0 top-full hidden border-t border-[var(--fp-line)] bg-[var(--fp-cream)] shadow-2xl lg:block">
            <div className="shell grid grid-cols-[1.25fr_2.75fr] gap-6 py-7">
              <div className="rounded-3xl bg-[#09111f] p-6 text-white">
                <div className="eyebrow !border-white/10 !bg-[var(--fp-surface)]/5 !text-[#f2d99e]">همه خدمات</div>
                <h3 className="mt-4 text-2xl font-black leading-9">از یک خدمت تا بسته کامل سفر</h3>
                <p className="mt-3 text-xs leading-6 text-slate-300">کشور، هدف سفر و نوع خدمت را انتخاب کنید و گزینه‌های مربوط به سفر خود را بررسی کنید.</p>
                <a href="#services" onClick={() => setMegaOpen(false)} className="mt-5 flex items-center gap-2 text-xs font-black text-[#f0cf7f]">مشاهده خدمات <ArrowLeft size={14} /></a>
              </div>
              <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                {serviceGroups.map(({ title, icon: Icon, desc }) => (
                  <a key={title} href="#services" onClick={() => setMegaOpen(false)} className="action-card rounded-2xl border border-[var(--fp-line)] bg-[var(--fp-surface)] p-4">
                    <Icon size={20} className="mb-3 text-[#9a6f20]" />
                    <div className="text-sm font-black">{title}</div>
                    <div className="mt-1 text-[10px] leading-5 text-[var(--fp-muted)]">{desc}</div>
                  </a>
                ))}
              </div>
            </div>
          </div>
        )}

        {mobileOpen && (
          <nav id="mobile-navigation" aria-label="ناوبری گوشی" className="border-t border-[var(--fp-line)] bg-[var(--fp-cream)] px-4 py-4 lg:hidden">
            <div className="grid gap-2 text-sm font-bold">
              {[['خدمات','services'],['کشورها','destinations'],['درخواست سفر','journey'],['پیشنهادها','deals'],['پیگیری پرونده','track']].map(([item,id]) => (
                <a key={id} href={'#'+id} onClick={() => setMobileOpen(false)} className="rounded-xl bg-[var(--fp-surface)] px-4 py-3 text-right shadow-sm">{item}</a>
              ))}
            </div>
          </nav>
        )}
      </header>

      <a className="skip-link" href="#main-content">رفتن به محتوای اصلی</a>
      <main id="main-content">
        <section className="hero scenic-hero">
          <picture className="hero-scene"><source media="(max-width: 767px)" srcSet="/media/hero-dubai-mobile.webp"/><img src="/media/hero-dubai.webp" alt="چشم‌انداز روشن دبی و برج خلیفه" width="1800" height="1350" fetchPriority="high" decoding="async"/></picture>
          <div className="shell hero-layout">
            <div className="hero-copy">
              <p className="eyebrow">فجر پارسا؛ همراه برنامه‌ریزی سفر شما</p>
              {reducedMotion ? <h1>سفر بعدی شما،<br/>از همین‌جا آغاز می‌شود.</h1> : <TextAnimate as="h1" by="line" animation="blurInUp" once duration={0.45}>{'سفر بعدی شما،\nاز همین‌جا آغاز می‌شود.'}</TextAnimate>}
              <p className="hero-description">ویزا، تکت، هتل و خدمات سفر؛ گزینه‌ها را بررسی کنید و با اطلاعات روشن، قدم بعد را با مشاور فجر پارسا بردارید.</p>
              <div className="hero-actions"><ShimmerButton onClick={request} className="cta-button" shimmerColor="#f9e6b6" background="var(--fp-gold-fill)" shimmerDuration="5s">شروع درخواست <ArrowLeft size={17}/></ShimmerButton><a href="#destinations" className="secondary-action">دیدن مقصدها <Globe2 size={17}/></a></div>
              <div className="hero-services"><span>ویزا و اقامت</span><span>پرواز و هتل</span><span>سفرهای گروهی</span></div>
            </div>
            <div className="hero-caption"><span>مقصدی برای ایده گرفتن</span><strong>دبی، امارات متحده عربی</strong><a href="#destinations">کشف مقصدها <ArrowLeft size={14}/></a></div>
          </div>
        </section>
        <section id="finder" className="shell finder-section"><Reveal><div className="glass finder-panel relative overflow-hidden">
                {!reducedMotion && <BorderBeam duration={10} colorFrom="#d9bd77" colorTo="#31b8a3" />}
                <div className="mb-6 flex items-start justify-between gap-4">
                  <div>
                    <div className="eyebrow">انتخاب مسیر سفر</div>
                    <h2 className="mt-3 text-xl font-black">مسیر سفرتان را مشخص کنید</h2>
                    <p className="mt-1 text-xs leading-6 text-[var(--fp-muted)]">سه انتخاب کوتاه؛ سپس گزینه‌های مرتبط را می‌بینید.</p>
                  </div>
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#f1e7d1] text-[#8a6423]"><Search size={20} /></div>
                </div>

                <div className="finder-fields">
                  <label htmlFor="passport" className="text-[11px] font-black text-[var(--fp-muted)]">پاسپورت / تابعیت</label>
                  <select id="passport" value={finder.passport} onChange={(e) => setFinder({ ...finder, passport: e.target.value })} className="w-full rounded-2xl border border-[var(--fp-line)] bg-[var(--fp-surface)] p-3.5 text-sm outline-none transition focus:border-[#c79a42]">
                    <option>افغانستان</option><option>کشور دیگر</option>
                  </select>
                  <label htmlFor="destination" className="mt-1 text-[11px] font-black text-[var(--fp-muted)]">مقصد</label>
                  <select id="destination" value={finder.destination} onChange={(e) => setFinder({ ...finder, destination: e.target.value })} className="w-full rounded-2xl border border-[var(--fp-line)] bg-[var(--fp-surface)] p-3.5 text-sm outline-none transition focus:border-[#c79a42]">
                    <option value="">انتخاب مقصد</option>
                    {[...destinations.map((d) => d.short), ...moreDestinations].map((name) => <option key={name}>{name}</option>)}
                  </select>
                  <label htmlFor="purpose" className="mt-1 text-[11px] font-black text-[var(--fp-muted)]">هدف سفر</label>
                  <select id="purpose" value={finder.purpose} onChange={(e) => setFinder({ ...finder, purpose: e.target.value })} className="w-full rounded-2xl border border-[var(--fp-line)] bg-[var(--fp-surface)] p-3.5 text-sm outline-none transition focus:border-[#c79a42]">
                    <option value="">انتخاب هدف</option><option>سیاحت</option><option>تجارت</option><option>اقامت</option><option>زیارت</option><option>تحصیل</option><option>کار</option>
                  </select>
                  <button onClick={() => setSelection({title: `خدمات سفر به ${finder.destination}`, description: `هدف سفر: ${finder.purpose} — تابعیت: ${finder.passport}. این فهرست برای راهنمایی اولیه است؛ امکان ارائه، شرایط و مدارک هر خدمت باید با دفتر بررسی شود.`, options: serviceGroups.filter((_, index) => ({'سیاحت':[0,2,5], 'تجارت':[0,1,2,4], 'اقامت':[0,4], 'زیارت':[2,3,5], 'تحصیل':[0,4], 'کار':[0,1,4]}[finder.purpose] || []).includes(index)).map(s => ({title:s.title, description:s.desc}))})} disabled={!finderReady} className="shine mt-2 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#09111f] px-4 py-3.5 text-sm font-black text-white shadow-lg disabled:cursor-not-allowed disabled:opacity-40">نمایش خدمات مرتبط <ArrowLeft size={17} /></button>
                </div>

                <div className="premium-divider my-5" />
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="rounded-2xl bg-[var(--fp-cream)] p-3"><Globe2 size={16} className="mx-auto text-[#9a6f20]" /><div className="mt-2 text-[10px] font-black">کشورمحور</div></div>
                  <div className="rounded-2xl bg-[var(--fp-cream)] p-3"><Clock3 size={16} className="mx-auto text-[#9a6f20]" /><div className="mt-2 text-[10px] font-black">مرحله‌ای</div></div>
                  <div className="rounded-2xl bg-[var(--fp-cream)] p-3"><MessageCircle size={16} className="mx-auto text-[#9a6f20]" /><div className="mt-2 text-[10px] font-black">پشتیبانی</div></div>
                </div>
              </div></Reveal></section>

        <section className="assurance-section">
          <div className="shell">
            <div className="assurance-strip grid sm:grid-cols-2 lg:grid-cols-4">
              {trustItems.map(([title, text], index) => (
                <div key={title} className={`p-5 ${index ? 'border-t border-[var(--fp-line)] sm:border-r sm:border-t-0' : ''}`}>
                  <div className="flex items-center gap-2"><CheckCircle2 size={16} className="text-emerald-600" /><div className="text-xs font-black">{title}</div></div>
                  <div className="mt-2 pr-6 text-[11px] leading-5 text-[var(--fp-muted)]">{text}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="shell py-20" id="services">
          <Reveal><div className="mb-9 flex items-end justify-between gap-4">
            <div>
              <div className="eyebrow">خدمات فجر پارسا</div>
              <h2 className="mt-4 text-3xl font-black tracking-[-.03em] sm:text-4xl">برای هر سفر، خدمت مناسب</h2>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--fp-muted)]">از خدمات ویزا و اسناد تا پرواز و سفرهای گروهی، مسیر مورد نیاز خود را بررسی کنید.</p>
            </div>
            <label className="catalog-search"><Search size={18}/><input type="search" aria-label="جستجوی خدمات" placeholder="جستجو در خدمات" value={query} onChange={e => setQuery(e.target.value)}/></label>
          </div></Reveal>

          <p className="sr-only" role="status">{visibleServices.length} خدمت پیدا شد</p>
          {visibleServices.length === 0 && <p className="py-8 text-center">خدمتی با این عبارت پیدا نشد. عبارت کوتاه‌تری بنویسید.</p>}
          <div className="service-grid grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {visibleServices.map(({ title, icon: Icon, desc, label }, index) => (
              <Reveal key={title} delay={index * 0.04}><MagicCard className="service-card rounded-[28px]" gradientFrom="#c9a75a" gradientTo="#35a994" gradientColor="var(--fp-glow)" gradientOpacity={0.25}><article className="group p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex h-13 w-13 items-center justify-center rounded-2xl bg-gradient-to-br from-[#f4ead5] to-[#fbf7ee] text-[#8a6423] shadow-inner"><Icon size={22} /></div>
                  <span className="font-latin text-[9px] font-bold uppercase tracking-[.12em] text-slate-300">0{index + 1}</span>
                </div>
                <div className="font-latin mt-6 text-[9px] font-extrabold uppercase tracking-[.15em] text-[#9b7730]">{label}</div>
                <h3 className="mt-2 text-xl font-black">{title}</h3>
                <p className="mt-2 min-h-14 text-sm leading-7 text-[var(--fp-muted)]">{desc}</p>
                <div className="premium-divider my-5" />
                <button onClick={() => inform(title, desc + ' شرایط، زمان و هزینه پس از بررسی مدارک مشخص می‌شود.')} className="flex items-center gap-2 text-xs font-black text-[var(--fp-gold)]">بررسی گزینه‌ها <ArrowLeft size={15} className="transition group-hover:-translate-x-1" /></button>
              </article></MagicCard></Reveal>
            ))}
          </div>
        </section>

        <DestinationGallery onSelect={setSelection} />

        <section className="shell py-20" id="journey">
          <div className="grid gap-5 lg:grid-cols-[1.12fr_.88fr]">
            <div className="soft-card dot-grid rounded-[32px] p-7 md:p-9">
              <div className="eyebrow">مسیر درخواست</div>
              <h2 className="mt-4 text-3xl font-black tracking-[-.03em]">از انتخاب خدمت تا آماده‌سازی درخواست</h2>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--fp-muted)]">ابتدا کشور و خدمت را مشخص کنید. سپس شرایط و مدارک لازم را با دفتر بررسی کنید.</p>
              <div className="mt-7 grid gap-3 sm:grid-cols-2">
                {[
                  ['۱', 'انتخاب خدمت', 'کشور، نوع خدمت و گزینه مناسب'],
                  ['۲', 'زمان و تعداد مسافران', 'زمان تقریبی و تعداد همراهان'],
                  ['۳', 'مرور درخواست', 'جزئیات را پیش از ارسال ببینید'],
                  ['۴', 'گفت‌وگو با مشاور', 'ارسال انتخابی در واتساپ و هماهنگی با دفتر'],
                ].map(([num, title, desc]) => (
                  <Reveal key={num} delay={Number(num === '۱' ? 0 : num === '۲' ? 1 : num === '۳' ? 2 : 3) * .07}><div className="journey-step rounded-2xl border border-[var(--fp-line)] bg-[var(--fp-cream)] p-4">
                    <div className="flex items-center gap-3">
                      <span className="font-latin flex h-8 w-8 items-center justify-center rounded-xl bg-[#09111f] text-[11px] font-black text-white">{num}</span>
                      <div><div className="text-sm font-black">{title}</div><div className="mt-1 text-[10px] leading-5 text-[var(--fp-muted)]">{desc}</div></div>
                    </div>
                  </div></Reveal>
                ))}
              </div>
            </div>

            <Reveal delay={.08}><div id="deals" data-tone="gold" className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-[#d9bd77] via-[#ecd89d] to-[#f7ecd0] p-7 md:p-9">
              <div className="absolute -left-16 -top-16 h-48 w-48 rounded-full border border-white/40" />
              <WalletCards size={28} className="relative text-[#6f511d]" />
              <div className="font-latin relative mt-5 text-[9px] font-black uppercase tracking-[.16em] text-[#7c5b20]">خدمات ترکیبی</div>
              <h2 className="relative mt-2 text-3xl font-black leading-[1.25]">بسته سفر خود را بسازید</h2>
              <p className="relative mt-3 text-sm leading-7 text-slate-700">ویزا + دعوتنامه + هتل + تکت + بیمه + ترانسفر. خدمات مکمل فقط وقتی پیشنهاد می‌شوند که برای سفر مربوط باشند.</p>
              <div className="relative mt-6 space-y-2">
                {['خدمات ویزا', 'بسته سفر کاری', 'خدمات کامل سفر'].map((item) => (
                  <button type="button" onClick={request} key={item} className="bundle-option flex items-center justify-between rounded-2xl px-4 py-3"><span className="font-latin text-xs font-extrabold">{item}</span><ArrowLeft size={14} /></button>
                ))}
              </div>
            </div></Reveal>
          </div>
        </section>

        <section id="track" className="bg-[var(--fp-surface)] py-20">
          <div className="shell grid gap-5 lg:grid-cols-2">
            <Reveal><article className="shine overflow-hidden rounded-[32px] bg-[#09111f] p-8 text-white md:p-10">
              <Headphones size={28} className="text-[#f0cf7f]" />
              <div className="font-latin mt-6 text-[9px] font-black uppercase tracking-[.16em] text-[#d9bc75]">پشتیبانی فجر پارسا</div>
              <h2 className="mt-2 text-3xl font-black">برای ادامهٔ مسیر، همراه شما</h2>
              <p className="mt-4 max-w-xl text-sm leading-8 text-slate-300">برای پروندهٔ موجود، شمارهٔ ثبت‌شده در رسید و مدارک مورد نیاز را هنگام تماس با دفتر آماده داشته باشید.</p>
              <button onClick={() => inform('پیگیری پرونده', 'پیگیری آنلاین در این نسخه هنوز به اطلاعات پرونده متصل نیست. برای پیگیری پروندهٔ موجود، با دفتر و شمارهٔ ثبت‌شده در رسیدتان تماس بگیرید.')} className="mt-7 flex items-center gap-2 rounded-2xl bg-[var(--fp-surface)] px-5 py-3 text-xs font-black text-[var(--fp-ink)]">پیگیری پرونده <ArrowLeft size={15} /></button>
            </article></Reveal>

            <Reveal><article className="soft-card relative overflow-hidden rounded-[32px] p-8 md:p-10">
              <div className="absolute left-0 top-0 h-44 w-44 -translate-x-12 -translate-y-16 rounded-full bg-[#e8d6aa]/30 blur-2xl" />
              <Sparkles size={28} className="relative text-[#9a6f20]" />
              <div className="font-latin relative mt-6 text-[9px] font-black uppercase tracking-[.16em] text-[#9a6f20]">راهنمای خدمات</div>
              <h2 className="relative mt-2 text-3xl font-black">از کجا شروع کنیم؟</h2>
              <p className="relative mt-4 max-w-xl text-sm leading-8 text-[var(--fp-muted)]">کشور مقصد و هدف سفر را انتخاب کنید، خدمات مرتبط را بخوانید و خلاصهٔ درخواست خود را برای مشاور آماده کنید.</p>
              <button onClick={() => inform('راهنمای خدمات', 'خدمت یا مقصد را انتخاب کنید تا توضیح آن باز شود. دستیار هوش مصنوعی هنوز متصل نشده است.')} className="relative mt-7 flex items-center gap-2 rounded-2xl border border-[var(--fp-line)] bg-[var(--fp-surface)] px-5 py-3 text-xs font-black shadow-sm"><MessageCircle size={15} /> راهنمای انتخاب خدمت</button>
            </article></Reveal>
          </div>
        </section>

        <section className="shell py-20">
          <Reveal><div data-tone="gold" className="overflow-hidden rounded-[36px] bg-gradient-to-l from-[#caa85a] via-[#e7d095] to-[#f3e7c8] p-8 md:p-12">
            <div className="grid items-center gap-8 lg:grid-cols-[1fr_auto]">
              <div className="max-w-3xl">
                <div className="font-latin text-[9px] font-black uppercase tracking-[.18em] text-[#75551f]">مسیر همراهی فجر پارسا</div>
                <h2 className="mt-3 text-3xl font-black tracking-[-.03em] md:text-4xl">برای سفر بعدی‌تان، قدم اول را بردارید</h2>
                <p className="mt-4 text-sm leading-8 text-slate-700">مقصد و خدمت را مشخص کنید؛ جزئیات را با دفتر در میان بگذارید و دربارهٔ شرایط و قیمت سؤال کنید.</p>
              </div>
              <button onClick={request} className="shine flex items-center justify-center gap-2 rounded-2xl bg-[#09111f] px-6 py-4 text-sm font-black text-white shadow-xl">شروع درخواست <ArrowLeft size={16} /></button>
            </div>
          </div></Reveal>
        </section>
        <FaqSection />
      </main>

      <DetailsDialog selection={selection} onClose={() => setSelection(null)} onRequest={(destination) => setSelection({title: 'آماده‌سازی درخواست', description: 'خدمت، زمان و جزئیات سفرتان را آماده کنید. ارسال نهایی پیام در واتساپ با خود شماست.', request: true, destination})} />
      <footer id="contact" className="bg-[#070d17] py-14 text-slate-300">
        <div className="shell grid gap-9 md:grid-cols-4">
          <div>
            <div className="flex items-center gap-3">
              <img src="/media/logo.png" alt="" className="h-10 w-10 rounded-xl bg-[var(--fp-surface)] p-1 object-contain" />
              <div><div className="font-black text-white">فجر پارسا</div><div className="font-latin text-[8px] tracking-[.14em] text-[var(--fp-muted)]">TRAVEL COMMERCE</div></div>
            </div>
            <p className="mt-4 text-xs leading-6 text-slate-400">سفر، ویزا، زیارت و تجارت در یک تجربه منظم و قابل پیگیری.</p>
          </div>
          <div><div className="text-xs font-black text-white">خدمات</div><p className="mt-4 text-xs leading-7 text-slate-400">ویزا • اقامت • دعوتنامه • پرواز • هتل • زیارت • اسناد • بیمه</p></div>
          <div><div className="text-xs font-black text-white">ارتباط و جامعه</div><p className="mt-4 text-xs leading-7 text-slate-400"><a href="https://wa.me/93777377774" target="_blank" rel="noopener noreferrer">واتساپ دفتر: ۰۷۷۷۳۷۷۷۷۴</a><br/>کابل، دشت برچی، مارکیت پیوند، منزل دوم، دفتر ۸۵.</p></div>
          <div><div className="text-xs font-black text-white">پشتیبانی</div><p className="footer-links"><a href="#faq">پرسش‌های رایج</a><a href="#finder">راهنمای درخواست</a><a href="https://wa.me/93777377774" target="_blank" rel="noopener noreferrer">تماس با دفتر</a></p></div>
        </div>
        <div className="shell mt-10 border-t border-white/10 pt-5 text-[10px] text-[var(--fp-muted)]">فجر پارسا — خدمات سفر، ویزا و تجارت</div>
      </footer>

      <button onClick={() => inform('راهنمای خدمات', 'از جستجوی خدمات یا انتخاب کشور شروع کنید. هیچ درخواست یا اطلاعاتی بدون اقدام شما ارسال نمی‌شود.')} className="floating-ai fixed bottom-24 left-4 md:bottom-5 md:left-5 z-40 flex h-15 w-15 items-center justify-center rounded-2xl border border-white/10 bg-[#09111f] text-white" aria-label="راهنمای خدمات"><Sparkles size={22} className="text-[#f0cf7f]" /></button>

      <div className="mobile-action-bar fixed inset-x-3 bottom-3 z-30 flex items-center gap-2 rounded-2xl border border-[var(--fp-line)] bg-[var(--fp-glass)] p-2 shadow-2xl backdrop-blur md:hidden">
        <button onClick={request} className="flex-1 rounded-xl bg-[#09111f] px-3 py-3 text-xs font-black text-white">شروع درخواست</button>
        <a href="https://wa.me/93777377774" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-1.5 rounded-xl border border-[var(--fp-line)] px-4 py-3 text-xs font-black"><MessageCircle size={15} /> واتساپ</a>
      </div>
    </div>
  )
}

export default App
