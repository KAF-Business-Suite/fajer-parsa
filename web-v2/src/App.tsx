import { countryPresentation } from './content/country-presentation'
import { CountryExplorer } from './components/CountryExplorer'
import { countryServices } from './content/countries'
import { serviceGroups } from './content/services'
import { siteText, type SiteLanguage } from './content/site-i18n'
import { lazy, Suspense, useEffect, useMemo, useRef, useState } from 'react'
import { MenuToggle } from './components/ui/menu-toggle'
import { ThemeToggle } from './components/ThemeToggle'
import { ContactChannels } from './components/ContactChannels'
import { ScrollProgress } from './components/magicui/scroll-progress'
import { DestinationGallery } from './components/DestinationGallery'
import { FaqSection } from './components/FaqSection'
import { MagicCard } from './components/magicui/magic-card'
import { Reveal } from './components/Reveal'
import type { Selection, RequestContext } from './components/DetailsDialog'
const CountryPage = lazy(() => import('./components/CountryPage').then(module => ({default:module.CountryPage})))
import { InboundTourism } from './components/InboundTourism'
import { inboundSeo, isInboundPath, normalizeLegacyInbound, updateInboundMetadata } from './inbound-route'
const DetailsDialog = lazy(() => import('./components/DetailsDialog').then(m => ({default:m.DetailsDialog})))
import {
  ArrowLeft,
  House,
  LayoutGrid,
  ClipboardList,
  BadgeCheck,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Globe2,
  Headphones,
  Languages,
  MessageCircle,
  Search,
  CircleHelp,
  UserRound,
  WalletCards,
} from 'lucide-react'

type FinderState = {
  passport: string
  destination: string
  purpose: string
}





const trustItems = [
  ['انتخاب آگاهانه', 'خدمت و شرایط را بررسی کنید'],
  ['هماهنگی انسانی', 'مستقیم با دفتر در تماس باشید'],
  ['درخواست کوتاه', 'جزئیات سفر را یک‌جا آماده کنید'],
  ['پیگیری از دفتر', 'اطلاعات رسید را همراه داشته باشید'],
]
type InboundLanguage = SiteLanguage

// The Dari homepage is not yet translated. These links intentionally open
// the already-localized Afghanistan inbound page; never relabel untranslated UI.
function inboundLanguageFromUrl(): InboundLanguage {
  // The static /inbound HTML is rendered at build time, before window exists.
  if (typeof window === 'undefined') return 'en'
  const code = new URLSearchParams(window.location.search).get('lang')
  if (code === 'fa' || code === 'ps' || code === 'en' || code === 'ar') return code
  return isInboundPath(window.location.pathname) ? 'en' : 'fa'
}
const inboundHeaderText = {
  en: {nav:'Visitor navigation',services:'Services',how:'How it works',enquire:'Enquire',home:'Main website',contact:'Contact',menu:'Mobile menu',themeLight:'Switch to light mode',themeDark:'Switch to dark mode',skip:'Skip to main content',visit:'VISIT AFGHANISTAN',header:'Fajr Parsa header',logo:'Fajr Parsa logo'},
  fa: {nav:'ناوبری گردشگران',services:'خدمات',how:'روش کار',enquire:'درخواست سفر',home:'سایت اصلی',contact:'تماس',menu:'منوی موبایل',themeLight:'فعال کردن حالت روشن',themeDark:'فعال کردن حالت تاریک',skip:'رفتن به محتوای اصلی',visit:'سفر به افغانستان',header:'سربرگ فجر پارسا',logo:'لوگوی فجر پارسا'},
  ar: {nav:'التنقل للزوار',services:'الخدمات',how:'طريقة العمل',enquire:'استفسار',home:'الموقع الرئيسي',contact:'اتصل بنا',menu:'قائمة الهاتف',themeLight:'التبديل إلى الوضع الفاتح',themeDark:'التبديل إلى الوضع الداكن',skip:'الانتقال إلى المحتوى الرئيسي',visit:'زيارة أفغانستان',header:'ترويسة فجر بارسا',logo:'شعار فجر بارسا'},
  ps: {nav:'د لیدونکو لارښود',services:'خدمتونه',how:'د کار طریقه',enquire:'د سفر غوښتنه',home:'اصلي وېبپاڼه',contact:'اړیکه',menu:'د موبایل مېنو',themeLight:'روښانه بڼه فعاله کړئ',themeDark:'تیاره بڼه فعاله کړئ',skip:'اصلي منځپانګې ته لاړ شئ',visit:'افغانستان ته سفر',header:'د فجر پارسا سرلیک',logo:'د فجر پارسا لوګو'},
}

const touristLanguages: {code:InboundLanguage;label:string;detail:string;htmlLang:string}[] = [
  {code:'fa',label:'دری',detail:'Afghan Dari',htmlLang:'fa-AF'},
  {code:'ps',label:'پښتو',detail:'Afghan Pashto',htmlLang:'ps-AF'},
  {code:'en',label:'English',detail:'English',htmlLang:'en'},
  {code:'ar',label:'العربية',detail:'Arabic',htmlLang:'ar'},
]

function SiteLanguageMenu({language,inbound,onSelect}: {
  language:InboundLanguage;inbound:boolean;onSelect:(code:InboundLanguage)=>void
}) {
  const t=(value:string)=>siteText(value,language)
  const [open,setOpen]=useState(false)
  const host=useRef<HTMLDivElement>(null)
  const trigger=useRef<HTMLButtonElement>(null)
  useEffect(()=>{
    if(!open)return
    const outside=(event:PointerEvent)=>{
      if(event.target instanceof Node && !host.current?.contains(event.target))setOpen(false)
    }
    const escape=(event:KeyboardEvent)=>{
      if(event.key==='Escape'){setOpen(false);trigger.current?.focus()}
    }
    document.addEventListener('pointerdown',outside)
    document.addEventListener('keydown',escape)
    return ()=>{document.removeEventListener('pointerdown',outside);document.removeEventListener('keydown',escape)}
  },[open])
  const active=language
  const activeText=active==='fa'?'دری':active==='ps'?'پښتو':active==='ar'?'العربية':'EN'
  return <div ref={host} className="fp-lang-menu">
    <button ref={trigger} type="button" className="fp-lang-trigger fp-control" aria-label={t("انتخاب زبان / Choose language / اختيار اللغة")} aria-expanded={open} aria-controls="fp-language-options" onClick={()=>setOpen(value=>!value)}>
      <Languages size={17} aria-hidden="true"/>
      <span className="fp-lang-current">{activeText}</span>
      <ChevronDown size={14} aria-hidden="true" className={open?'rotate-180 transition':'transition'}/>
    </button>
    {open && <div className="fp-lang-panel" id="fp-language-options" role="group" aria-label={t("زبان بخش گردشگری افغانستان")}>
      <div className="fp-lang-heading">{t("زبان گردشگری افغانستان")}<span lang="en">/ Travel language</span></div>
      {touristLanguages.map(item=><button type="button" key={item.code} lang={item.htmlLang} aria-label={item.label} aria-pressed={active===item.code} className="fp-lang-choice" onClick={()=>{onSelect(item.code);setOpen(false)}}>
        <span>{item.label}</span><span aria-hidden="true" className="fp-lang-detail">{item.detail}</span>{active===item.code&&<CheckCircle2 size={17} aria-hidden="true" className="fp-lang-check"/>}
      </button>)}
    </div>}
  </div>
}

// FP-UX-03: offline follow-up via an opt-in office WhatsApp draft.
// The website does NOT claim access to case status or transmit any customer identifier.
const followUpContent: Record<SiteLanguage,{description:string;message:string}> = {
  ps:{
    description:'د دوسیې آنلاین وضعیت لا د دفتر له ثبتونو سره نه دی نښلول شوی. تاسو کولی شئ د دفتر لپاره د واټساپ پیغام چمتو کړئ. دا پاڼه شخصي اسناد یا د دوسیې پېژندشمېره نه غواړي؛ وروستۍ لېږنه ستاسو په اختیار کې ده.',
    message:'سلام فجر پارسا، غواړم د خپلې پخوانۍ غوښتنې تعقیب وکړم. مهرباني وکړئ راته ووایاست چې د رسید شمېره څنګه په خوندي ډول درولېږم او د غوښتنې وضعیت معلوم کړم.'
  },
  fa:{
    description:'پیگیری آنلاین هنوز به پرونده‌های دفتر متصل نیست. برای بررسی وضعیت، از واتساپ دفتر پیام آماده کنید. هیچ سند یا شمارهٔ شخصی در این صفحه درخواست یا ارسال نمی‌شود و ارسال نهایی به انتخاب شماست.',
    message:'سلام فجر پارسا، می‌خواهم یک درخواست قبلی را از دفتر پیگیری کنم. لطفاً راهنمایی کنید برای بررسی وضعیت و ارائهٔ شمارهٔ رسید از چه راه مصونی استفاده کنم.'
  },
  en:{
    description:'Online case status is not connected yet. You can prepare a message to our office on WhatsApp. This page requests no personal documents or case identifiers; you decide whether to send the message.',
    message:'Hello Fajr Parsa, I would like to follow up on an existing enquiry. Please advise how I can securely provide my receipt reference and check its status.'
  },
  ar:{
    description:'تتبّع حالة الطلب عبر الموقع غير متصل حالياً بسجلات المكتب. يمكنك تجهيز رسالة إلى المكتب عبر واتساب. لا تطلب هذه الصفحة وثائق أو أرقاماً شخصية، ولن تُرسل الرسالة إلا باختيارك.',
    message:'مرحباً فجر بارسا، أود متابعة طلب سابق. يرجى إرشادي إلى طريقة آمنة لتقديم رقم الإيصال والتحقق من حالة الطلب.'
  }
}

function App({initialPath}: {initialPath?: string} = {}) {
  const headerRef = useRef<HTMLElement>(null)
  const [routeHash,setRouteHash] = useState(typeof window === 'undefined' ? '' : window.location.hash)
  const [routePath,setRoutePath] = useState(initialPath ?? (typeof window === 'undefined' ? '/' : window.location.pathname))
  const [inboundLanguage,setInboundLanguage] = useState<InboundLanguage>(inboundLanguageFromUrl)
  const inboundNav=inboundHeaderText[inboundLanguage]
  const language: SiteLanguage = inboundLanguage
  const t = (value:string)=>siteText(value,language)
  const isCountryRoute = routePath === '/' && routeHash.startsWith('#/country/')
  const isInboundRoute = isInboundPath(routePath)
  const changeInboundLanguage = (code: InboundLanguage) => {
    setInboundLanguage(code)
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href)
      url.searchParams.set('lang', code)
      // This is a display preference, not a new booking or navigation event.
      window.history.replaceState(window.history.state, '', url.pathname + url.search + url.hash)
    }
  }
  const routeCode = isCountryRoute ? routeHash.slice('#/country/'.length).toUpperCase() : null
  const selectedCountry = countryServices.find(country=>countryPresentation[country.name]?.code===routeCode)
  const openCountry = (name:string) => { const code=countryPresentation[name]?.code; if(code) window.location.hash='/country/'+code.toLowerCase() }

  const [selection, setSelection] = useState<Selection | null>(null)
  const [query, setQuery] = useState('')
  const [headerScrolled, setHeaderScrolled] = useState(false)
  const [navSection, setNavSection] = useState<'home'|'services'|'request'>('home')
  const openRequest = ({destination=selectedCountry?.name || finder.destination,purpose=selectedCountry ? undefined : finder.purpose,passport=finder.passport,service,bundle,variant}: RequestContext = {}) => setSelection({ destination,purpose,passport,service,bundle,variant, title: t('آماده‌سازی درخواست'), description: language==='en'?'Prepare your trip details. You choose when to send the final WhatsApp message.':language==='ar'?'جهز تفاصيل رحلتك. أنت من يقرر إرسال الرسالة النهائية عبر واتساب.':language==='ps'?'د سفر خدمت، وخت او جزییات چمتو کړئ. په واټساپ کې وروستۍ لېږنه ستاسو په اختیار کې ده.':'خدمت، زمان و جزئیات سفرتان را آماده کنید. ارسال نهایی پیام در واتساپ با خود شماست.', request: true })
  const request = () => {setContactOpen(false);openRequest()}
  const inform = (title: string, description: string, context: RequestContext = {}, contactOnly = false) => setSelection({ ...finder, ...context, title:t(title), description:t(description), contactOnly })
  const [megaOpen, setMegaOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [contactOpen, setContactOpen] = useState(false)
  const [finder, setFinder] = useState<FinderState>({ passport: 'افغانستان', destination: '', purpose: '' })
  const finderReady = useMemo(() => Boolean(finder.destination && finder.purpose), [finder])
  const navActive = contactOpen ? 'contact' : selection?.request ? 'request' : isCountryRoute ? 'services' : navSection
  const finderTitle = t('خدمات سفر به') + ' ' + t(finder.destination)
  const finderDescription = `${t('هدف سفر')}: ${t(finder.purpose)} — ${t('تابعیت')}: ${t(finder.passport)}. ${t('برای راهنمایی اولیه است؛ امکان ارائه، شرایط و مدارک هر خدمت باید با دفتر بررسی شود.')}`

  useEffect(()=>{
    const sync=()=>{normalizeLegacyInbound();setInboundLanguage(inboundLanguageFromUrl());setRouteHash(window.location.hash);setRoutePath(window.location.pathname);setMegaOpen(false);setMobileOpen(false);setContactOpen(false);setSelection(null)}
    window.addEventListener('hashchange',sync)
    window.addEventListener('popstate',sync)
    return ()=>{window.removeEventListener('hashchange',sync);window.removeEventListener('popstate',sync)}
  },[])
  useEffect(()=>{
    updateInboundMetadata(inboundLanguage,isInboundRoute)
    document.title=isInboundRoute ? inboundSeo[inboundLanguage].title : selectedCountry ? (language==='en'?'Travel services in ':language==='ar'?'خدمات السفر إلى ':language==='ps'?'د سفر خدمتونه په ':'خدمات ')+t(selectedCountry.name)+' | '+t('فجر پارسا') : t('فجر پارسا')+' | '+(language==='en'?'Travel, visas & business':language==='ar'?'السفر والتأشيرات والأعمال':language==='ps'?'سفر، ویزه او سوداګري':'سفر، ویزا و تجارت')
    document.documentElement.lang=language==='fa'?'fa-AF':language==='ps'?'ps-AF':language
    document.documentElement.dir=language==='en'?'ltr':'rtl'
    if (isInboundRoute) {
      // Keep section anchors useful; only a fresh route entry resets to the top.
      const frame=requestAnimationFrame(()=>{
        const target=routeHash.length>1 ? document.getElementById(routeHash.slice(1)) : null
        if(target)target.scrollIntoView();else window.scrollTo(0,0)
      })
      return ()=>cancelAnimationFrame(frame)
    }
    if(!isCountryRoute && routeHash.length>1) {
      const frame=requestAnimationFrame(()=>document.getElementById(routeHash.slice(1))?.scrollIntoView())
      return ()=>cancelAnimationFrame(frame)
    }
  },[routeHash,selectedCountry,isCountryRoute,isInboundRoute,language])
  useEffect(()=>{if(isInboundRoute){document.title=inboundSeo[inboundLanguage].title;updateInboundMetadata(inboundLanguage,true)}},[inboundLanguage,isInboundRoute])
  useEffect(() => {
    // Only one tab is active: update for tapping links and ordinary page scrolling.
    const update = () => {
      if (isCountryRoute) {setNavSection('services');return}
      const marker=Math.min(155,window.innerHeight*0.28)
      const inside=(id:string) => {
        const el=document.getElementById(id)
        if(!el)return false
        const r=el.getBoundingClientRect()
        return r.top<=marker && r.bottom>marker
      }
      if(isInboundRoute && inside('inbound-request')) {setNavSection('request');return}
      const services=isInboundRoute?['inbound-services']:['services','country-services','worldwide-booking']
      setNavSection(services.some(inside)?'services':'home')
    }
    update()
    window.addEventListener('scroll',update,{passive:true})
    window.addEventListener('resize',update)
    return ()=>{window.removeEventListener('scroll',update);window.removeEventListener('resize',update)}
  },[isInboundRoute,isCountryRoute,routeHash])
  const visibleServices = useMemo(() => serviceGroups.filter(s => (t(s.title)+' '+t(s.desc)+' '+s.title).toLocaleLowerCase().includes(query.trim().toLocaleLowerCase())), [query,language])
  useEffect(() => {
    const sync = () => setHeaderScrolled(window.scrollY > 24)
    sync(); window.addEventListener('scroll', sync, { passive: true })
    return () => window.removeEventListener('scroll', sync)
  }, [])
  useEffect(() => {
    const escape = (e: KeyboardEvent) => { if (e.key === 'Escape') { headerRef.current?.querySelector<HTMLElement>('[aria-expanded="true"]')?.focus(); setMegaOpen(false); setMobileOpen(false); setContactOpen(false) } }
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
    <div lang={language==='fa'?'fa-AF':language==='ps'?'ps-AF':language} dir={language==='en'?'ltr':'rtl'} className="min-h-screen overflow-x-clip fp-app bg-[var(--fp-ivory)] text-[var(--fp-ink)]">
      <ScrollProgress className="fp-scroll-progress" aria-hidden="true" />
      <header ref={headerRef} data-scrolled={headerScrolled} className="floating-header" aria-label={isInboundRoute ? inboundNav.header : "سربرگ فجر پارسا"}>
        <div className="shell fp-header-inner flex h-[74px] items-center justify-between gap-2 lg:gap-4">
          <a href={isInboundRoute ? '/?lang='+language : "#"} className="fp-brand flex min-w-0 items-center gap-3">
            <div className="relative">
              <img src="/media/logo.png" alt={isInboundRoute ? inboundNav.logo : "لوگوی فجر پارسا"} className="h-12 w-12 rounded-[15px] border border-[var(--fp-line)] bg-[var(--fp-surface)] object-contain p-1 shadow-sm" />

            </div>
            <div>
              <div className="text-[17px] font-black tracking-[-.02em]">{isInboundRoute ? "FAJR PARSA" : t("فجر پارسا")}</div>
              <div className="font-latin text-[9px] font-bold tracking-[.16em] text-slate-400">{isInboundRoute ? "AFGHANISTAN TRAVEL" : t("سفر • ویزا • تجارت")}</div>
            </div>
          </a>

          {isInboundRoute ? <nav className="hidden items-center gap-2 text-[13px] font-extrabold lg:flex" aria-label={inboundNav.nav}>
            <button className="rounded-xl px-3 py-2.5" onClick={()=>document.getElementById('inbound-services')?.scrollIntoView({behavior:'smooth'})}>{inboundNav.services}</button>
            <button className="rounded-xl px-3 py-2.5" onClick={()=>document.getElementById('inbound-process')?.scrollIntoView({behavior:'smooth'})}>{inboundNav.how}</button>
            <button className="rounded-xl px-3 py-2.5" onClick={()=>document.getElementById('inbound-request')?.scrollIntoView({behavior:'smooth'})}>{inboundNav.enquire}</button>
            <a className="rounded-xl px-3 py-2.5" href={'/?lang='+language}>{inboundNav.home}</a>
          </nav> : <nav className="hidden items-center gap-1 text-[13px] font-extrabold lg:flex">
            <button aria-expanded={megaOpen} aria-controls="services-mega" onClick={() => setMegaOpen(!megaOpen)} className="flex items-center gap-1.5 rounded-xl px-4 py-2.5 transition hover:bg-slate-900/5">
              {t("خدمات")} <ChevronDown size={15} className={megaOpen ? 'rotate-180 transition' : 'transition'} />
            </button>
            <a className="rounded-xl px-4 py-2.5 transition hover:bg-slate-900/5" href={'/inbound?lang='+language}>{t("سفر به افغانستان")}</a>
            <a className="rounded-xl px-4 py-2.5 transition hover:bg-slate-900/5" href="#country-services">{t("کشورها")}</a>
            <a className="rounded-xl px-4 py-2.5 transition hover:bg-slate-900/5" href="#journey">{t("درخواست سفر")}</a>
            <a className="rounded-xl px-4 py-2.5 transition hover:bg-slate-900/5" href="#track">{t("پیگیری")}</a>
          </nav>}

          <div className="fp-header-actions flex items-center gap-2">
            <SiteLanguageMenu language={inboundLanguage} inbound={isInboundRoute} onSelect={changeInboundLanguage}/>
            <ThemeToggle labels={{light:inboundNav.themeLight,dark:inboundNav.themeDark}} />
            <button type="button" onClick={()=>{setMobileOpen(false);setContactOpen(true)}} className="fp-header-contact hidden items-center gap-2 rounded-xl border border-[var(--fp-line)] bg-[var(--fp-surface)] px-3.5 py-2.5 text-xs font-extrabold xl:inline-flex"><Headphones size={17} aria-hidden="true"/>{isInboundRoute?inboundNav.contact:t("تماس")}</button>
            <button type="button" onClick={isInboundRoute ? ()=>document.getElementById("inbound-request")?.scrollIntoView({behavior:"smooth"}) : request} className="shine fp-header-request hidden items-center rounded-xl bg-[#09111f] px-4 py-2.5 text-xs font-black text-white shadow-lg shadow-slate-950/10 lg:inline-flex">{isInboundRoute ? inboundNav.enquire : t("شروع درخواست")}</button>
            <MenuToggle open={mobileOpen} onToggle={() => {setContactOpen(false);setMobileOpen(!mobileOpen)}} label={isInboundRoute ? inboundNav.menu : language==='en'?'Mobile menu':language==='ar'?'قائمة الهاتف':language==='ps'?'د موبایل مېنو':'منوی موبایل'} />
          </div>
        </div>

        {!isInboundRoute && megaOpen && (
          <div id="services-mega" className="absolute inset-x-0 top-full hidden border-t border-[var(--fp-line)] bg-[var(--fp-cream)] shadow-2xl lg:block">
            <div className="shell grid grid-cols-[1.25fr_2.75fr] gap-6 py-7">
              <div className="rounded-3xl bg-[#09111f] p-6 text-white">
                <div className="eyebrow !border-white/10 !bg-[var(--fp-surface)]/5 !text-[#f2d99e]">{t("همه خدمات")}</div>
                <h3 className="mt-4 text-2xl font-black leading-9">{t("از یک خدمت تا بسته کامل سفر")}</h3>
                <p className="mt-3 text-xs leading-6 text-slate-300">{t("کشور، هدف سفر و نوع خدمت را انتخاب کنید و گزینه‌های مربوط به سفر خود را بررسی کنید.")}</p>
                <a href="#services" onClick={() => setMegaOpen(false)} className="mt-5 flex items-center gap-2 text-xs font-black text-[#f0cf7f]">{t("مشاهده خدمات")}<ArrowLeft size={14} /></a>
              </div>
              <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                {serviceGroups.map(({ title, icon: Icon, desc }) => (
                  <a key={title} href="#services" onClick={() => setMegaOpen(false)} className="action-card rounded-2xl border border-[var(--fp-line)] bg-[var(--fp-surface)] p-4">
                    <Icon size={20} className="mb-3 text-[#9a6f20]" />
                    <div className="text-sm font-black">{t(title)}</div>
                    <div className="mt-1 text-[10px] leading-5 text-[var(--fp-muted)]">{t(desc)}</div>
                  </a>
                ))}
              </div>
            </div>
          </div>
        )}

        {mobileOpen && (
          <nav id="mobile-navigation" aria-label={isInboundRoute ? inboundNav.nav : "ناوبری گوشی"} className="mobile-navigation-panel lg:hidden">
            {isInboundRoute ? <div className="mobile-nav-group"><p>{inboundNav.visit}</p><div className="mobile-nav-links">{[[inboundNav.services,"inbound-services"],[inboundNav.how,"inbound-process"],[inboundNav.enquire,"inbound-request"]].map(([label,id])=><a href={'#'+id} key={id} onClick={e=>{e.preventDefault();setMobileOpen(false);document.getElementById(id)?.scrollIntoView({behavior:"smooth"})}}>{label}<ArrowLeft size={15}/></a>)}<a href={'/?lang='+language} onClick={()=>setMobileOpen(false)}>{inboundNav.home} <ArrowLeft size={15}/></a></div></div> : <>
            <div className="mobile-nav-group"><p>{t("سفر خود را برنامه‌ریزی کنید")}</p><div className="mobile-nav-links">
              {[['کشورها','country-services'],['خدمات','services'],['تکت و بوکینگ سراسری','worldwide-booking'],['بسته‌های خدمات','deals']].map(([item,id])=><a key={id} href={'#'+id} onClick={()=>setMobileOpen(false)}>{t(item)}<ArrowLeft size={15}/></a>)}
            </div></div>
            <div className="mobile-nav-group"><p>{t("انتخاب سریع خدمت")}</p><div className="mobile-service-links">{serviceGroups.map(({title,icon:Icon,desc})=><button type="button" key={title} onClick={()=>{setMobileOpen(false);inform(title,t(desc)+(language==='en'?' Terms and costs are confirmed by the office.':language==='ar'?' يؤكد المكتب الشروط والتكاليف.':' شرایط و هزینه با دفتر بررسی می‌شود.'),{service:title})}}><Icon size={18}/><span>{t(title)}</span></button>)}</div></div>
            <div className="mobile-nav-group"><p>{t("راهنما و ارتباط")}</p><div className="mobile-nav-links">
              {[['راهنمای انتخاب خدمت','finder'],['درخواست سفر','journey'],['الهام سفر','destinations'],['پرسش‌های رایج','faq'],['پیگیری پرونده','track'],['معرفی و تماس دفتر','contact']].map(([item,id])=><a key={id} href={'#'+id} onClick={()=>setMobileOpen(false)}>{t(item)}<ArrowLeft size={15}/></a>)}
            </div></div>
            </>}
          </nav>
        )}
      </header>

      <a className="skip-link" href="#main-content">{isInboundRoute ? inboundNav.skip : t("رفتن به محتوای اصلی")}</a>
      <main id="main-content">
        {isCountryRoute ? <Suspense fallback={<div className="shell country-page" role="status">{t("در حال آماده‌سازی صفحهٔ کشور…")}</div>}><CountryPage country={selectedCountry} language={language} onRequest={openRequest}/></Suspense> : isInboundRoute ? <InboundTourism language={inboundLanguage}/> : <>
        <section className="hero scenic-hero">
          <picture className="hero-scene"><source media="(max-width: 767px)" srcSet="/media/hero-dubai-mobile.webp"/><img src="/media/hero-dubai.webp" alt="چشم‌انداز روشن دبی و برج خلیفه" width="1800" height="1350" fetchPriority="high" decoding="async"/></picture>
          <div className="shell hero-layout">
            <div className="hero-copy">
              <p className="eyebrow">{t("فجر پارسا؛ همراه برنامه‌ریزی سفر شما")}</p>
              <h1>{t("سفر بعدی شما،")}<br/>{t("از همین‌جا آغاز می‌شود.")}</h1>
              <p className="hero-description">{t("ویزا، تکت، هتل و خدمات سفر؛ گزینه‌ها را بررسی کنید و با اطلاعات روشن، قدم بعد را با مشاور فجر پارسا بردارید.")}</p>
              <div className="hero-actions"><button type="button" onClick={request} className="primary-action cta-button">{t("شروع درخواست")}<ArrowLeft size={17}/></button><a href={'/inbound?lang='+language} className="secondary-action" lang={language}>{t('سفر به افغانستان')} <Globe2 size={17}/></a></div>
              <div className="hero-services"><span>{t("ویزا و اقامت")}</span><span>{t("پرواز و هتل")}</span><span>{t("سفرهای گروهی")}</span></div>
            </div>
            <div className="hero-caption"><span>{t("مقصدی برای ایده گرفتن")}</span><strong>{t("دبی، امارات متحده عربی")}</strong><a href="#destinations">{t("کشف مقصدها")}<ArrowLeft size={14}/></a></div>
          </div>
        </section>
        <section id="finder" className="shell finder-section"><Reveal><div className="glass finder-panel relative overflow-hidden">
                <div className="mb-6 flex items-start justify-between gap-4">
                  <div>
                    <div className="eyebrow">{t("انتخاب مسیر سفر")}</div>
                    <h2 className="mt-3 text-xl font-black">{t("مسیر سفرتان را مشخص کنید")}</h2>
                    <p className="mt-1 text-xs leading-6 text-[var(--fp-muted)]">{t("سه انتخاب کوتاه؛ سپس گزینه‌های مرتبط را می‌بینید.")}</p>
                  </div>
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#f1e7d1] text-[#8a6423]"><Search size={20} /></div>
                </div>

                <div className="finder-fields">
                  <label htmlFor="passport" className="text-[11px] font-black text-[var(--fp-muted)]">{t("پاسپورت / تابعیت")}</label>
                  <select id="passport" value={finder.passport} onChange={(e) => setFinder({ ...finder, passport: e.target.value })} className="w-full rounded-2xl border border-[var(--fp-line)] bg-[var(--fp-surface)] p-3.5 text-sm outline-none transition focus:border-[#c79a42]">
                    <option value="افغانستان">{t('افغانستان')}</option><option value="کشور دیگر">{t('کشور دیگر')}</option>
                  </select>
                  <label htmlFor="destination" className="mt-1 text-[11px] font-black text-[var(--fp-muted)]">{t("مقصد")}</label>
                  <select id="destination" value={finder.destination} onChange={(e) => setFinder({ ...finder, destination: e.target.value })} className="w-full rounded-2xl border border-[var(--fp-line)] bg-[var(--fp-surface)] p-3.5 text-sm outline-none transition focus:border-[#c79a42]">
                    <option value="">{t("انتخاب مقصد")}</option>
                    {countryServices.map(country => country.name).map((name) => <option key={name} value={name}>{t(name)}</option>)}
                  </select>
                  <label htmlFor="purpose" className="mt-1 text-[11px] font-black text-[var(--fp-muted)]">{t("هدف سفر")}</label>
                  <select id="purpose" value={finder.purpose} onChange={(e) => setFinder({ ...finder, purpose: e.target.value })} className="w-full rounded-2xl border border-[var(--fp-line)] bg-[var(--fp-surface)] p-3.5 text-sm outline-none transition focus:border-[#c79a42]">
                    <option value="">{t('انتخاب هدف')}</option>{['سیاحت','تجارت','اقامت','زیارت','تحصیل','کار'].map(value=><option key={value} value={value}>{t(value)}</option>)}
                  </select>
                  <button onClick={() => setSelection({...finder,title:finderTitle,description:finderDescription,options: serviceGroups.filter((_, index) => ({'سیاحت':[0,2,5], 'تجارت':[0,1,2,4], 'اقامت':[0,4], 'زیارت':[2,3,5], 'تحصیل':[0,4], 'کار':[0,1,4]}[finder.purpose] || []).includes(index)).map(s => ({title:s.title, description:s.desc}))})} disabled={!finderReady} className="shine mt-2 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#09111f] px-4 py-3.5 text-sm font-black text-white shadow-lg disabled:cursor-not-allowed disabled:opacity-40">{t("نمایش خدمات مرتبط")}<ArrowLeft size={17} /></button>
                </div>

                <div className="premium-divider my-5" />
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="rounded-2xl bg-[var(--fp-cream)] p-3"><Globe2 size={16} className="mx-auto text-[#9a6f20]" /><div className="mt-2 text-[10px] font-black">{t("کشورمحور")}</div></div>
                  <div className="rounded-2xl bg-[var(--fp-cream)] p-3"><Clock3 size={16} className="mx-auto text-[#9a6f20]" /><div className="mt-2 text-[10px] font-black">{t("مرحله‌ای")}</div></div>
                  <div className="rounded-2xl bg-[var(--fp-cream)] p-3"><MessageCircle size={16} className="mx-auto text-[#9a6f20]" /><div className="mt-2 text-[10px] font-black">{t("پشتیبانی")}</div></div>
                </div>
              </div></Reveal></section>

        <section className="assurance-section">
          <div className="shell">
            <div className="assurance-strip grid sm:grid-cols-2 lg:grid-cols-4">
              {trustItems.map(([title, text], index) => (
                <div key={title} className={`p-5 ${index ? 'border-t border-[var(--fp-line)] sm:border-r sm:border-t-0' : ''}`}>
                  <div className="flex items-center gap-2"><CheckCircle2 size={16} className="text-emerald-600" /><div className="text-xs font-black">{t(title)}</div></div>
                  <div className="mt-2 pr-6 text-[11px] leading-5 text-[var(--fp-muted)]">{t(text)}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="shell py-20" id="services">
          <Reveal><div className="mb-9 flex items-end justify-between gap-4">
            <div>
              <div className="eyebrow">{t("خدمات فجر پارسا")}</div>
              <h2 className="mt-4 text-3xl font-black tracking-[-.03em] sm:text-4xl">{t("برای هر سفر، خدمت مناسب")}</h2>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--fp-muted)]">{t("از خدمات ویزا و اسناد تا پرواز و سفرهای گروهی، مسیر مورد نیاز خود را بررسی کنید.")}</p>
            </div>
            <label className="catalog-search"><Search size={18}/><input type="search" aria-label={t("جستجوی خدمات")} placeholder={t("جستجو در خدمات")} value={query} onChange={e => setQuery(e.target.value)}/></label>
          </div></Reveal>

          <p className="sr-only" role="status">{visibleServices.length} {language==='en'?'services found':language==='ar'?'خدمة متاحة':language==='ps'?'خدمتونه وموندل شول':'خدمت پیدا شد'}</p>
          {visibleServices.length === 0 && <p className="py-8 text-center">{t("خدمتی با این عبارت پیدا نشد. عبارت کوتاه‌تری بنویسید.")}</p>}
          <div className="service-grid grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {visibleServices.map(({ title, icon: Icon, desc, label }, index) => (
              <Reveal key={title} delay={index * 0.04}><MagicCard className="service-card rounded-[28px]" gradientFrom="#c9a75a" gradientTo="#35a994" gradientColor="var(--fp-glow)" gradientOpacity={0.25}><article className="group p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex h-13 w-13 items-center justify-center rounded-2xl bg-gradient-to-br from-[#f4ead5] to-[#fbf7ee] text-[#8a6423] shadow-inner"><Icon size={22} /></div>
                  <span className="font-latin text-[9px] font-bold uppercase tracking-[.12em] text-slate-300">0{index + 1}</span>
                </div>
                <div className="font-latin mt-6 text-[9px] font-extrabold uppercase tracking-[.15em] text-[#9b7730]">{t(label)}</div>
                <h3 className="mt-2 text-xl font-black">{t(title)}</h3>
                <p className="mt-2 min-h-14 text-sm leading-7 text-[var(--fp-muted)]">{t(desc)}</p>
                <div className="premium-divider my-5" />
                <button onClick={() => inform(title, t(desc) + (language==='en'?' Requirements, timing and costs are confirmed after review.':language==='ar'?' يتم تأكيد الشروط والمدة والتكاليف بعد المراجعة.':' شرایط، زمان و هزینه پس از بررسی مدارک مشخص می‌شود.'), {service:title})} className="flex items-center gap-2 text-xs font-black text-[var(--fp-gold)]">{t("بررسی گزینه‌ها")}<ArrowLeft size={15} className="transition group-hover:-translate-x-1" /></button>
              </article></MagicCard></Reveal>
            ))}
          </div>
        </section>

        <CountryExplorer language={language} onOpenCountry={openCountry} onRequest={openRequest} />

        <DestinationGallery language={language} onSelect={setSelection} />

        <section className="shell py-20" id="journey">
          <div className="grid gap-5 lg:grid-cols-[1.12fr_.88fr]">
            <div className="soft-card dot-grid rounded-[32px] p-7 md:p-9">
              <div className="eyebrow">{t("مسیر درخواست")}</div>
              <h2 className="mt-4 text-3xl font-black tracking-[-.03em]">{t("از انتخاب خدمت تا آماده‌سازی درخواست")}</h2>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--fp-muted)]">{t("ابتدا کشور و خدمت را مشخص کنید. سپس شرایط و مدارک لازم را با دفتر بررسی کنید.")}</p>
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
                      <div><div className="text-sm font-black">{t(title)}</div><div className="mt-1 text-[10px] leading-5 text-[var(--fp-muted)]">{t(desc)}</div></div>
                    </div>
                  </div></Reveal>
                ))}
              </div>
            </div>

            <Reveal delay={.08}><div id="deals" data-tone="gold" className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-[#d9bd77] via-[#ecd89d] to-[#f7ecd0] p-7 md:p-9">
              <div className="absolute -left-16 -top-16 h-48 w-48 rounded-full border border-white/40" />
              <WalletCards size={28} className="relative text-[#6f511d]" />
              <div className="font-latin relative mt-5 text-[9px] font-black uppercase tracking-[.16em] text-[#7c5b20]">{t("خدمات ترکیبی")}</div>
              <h2 className="relative mt-2 text-3xl font-black leading-[1.25]">{t("بسته سفر خود را بسازید")}</h2>
              <p className="relative mt-3 text-sm leading-7 text-slate-700">{t("ویزا + دعوتنامه + هتل + تکت + بیمه + ترانسفر. خدمات مکمل فقط وقتی پیشنهاد می‌شوند که برای سفر مربوط باشند.")}</p>
              <div className="relative mt-6 space-y-2">
                {[{label:'خدمات ویزا',service:'ویزا و اقامت'},{label:'بسته سفر کاری',service:'دعوتنامه و تجارت'},{label:'خدمات کامل سفر',service:'خدمات مکمل سفر'}].map(({label,service}) => (
                  <button type="button" onClick={()=>openRequest({service,bundle:label})} key={label} className="bundle-option flex items-center justify-between rounded-2xl px-4 py-3"><span className="font-latin text-xs font-extrabold">{t(label)}</span><ArrowLeft size={14} /></button>
                ))}
              </div>
            </div></Reveal>
          </div>
        </section>

        <section id="track" className="bg-[var(--fp-surface)] py-20">
          <div className="shell grid gap-5 lg:grid-cols-2">
            <Reveal><article className="shine overflow-hidden rounded-[32px] bg-[#09111f] p-8 text-white md:p-10">
              <Headphones size={28} className="text-[#f0cf7f]" />
              <div className="font-latin mt-6 text-[9px] font-black uppercase tracking-[.16em] text-[#d9bc75]">{t("پشتیبانی فجر پارسا")}</div>
              <h2 className="mt-2 text-3xl font-black">{t("برای ادامهٔ مسیر، همراه شما")}</h2>
              <p className="mt-4 max-w-xl text-sm leading-8 text-slate-300">{t("برای پروندهٔ موجود، شمارهٔ ثبت‌شده در رسید و مدارک مورد نیاز را هنگام تماس با دفتر آماده داشته باشید.")}</p>
              <button onClick={() => setSelection({title:t('پیگیری پرونده'),description:followUpContent[language].description,contactOnly:true,contactMessage:followUpContent[language].message})} className="mt-7 flex items-center gap-2 rounded-2xl bg-[var(--fp-surface)] px-5 py-3 text-xs font-black text-[var(--fp-ink)]">{t("پیگیری پرونده")}<ArrowLeft size={15} /></button>
            </article></Reveal>

            <Reveal><article className="soft-card relative overflow-hidden rounded-[32px] p-8 md:p-10">
              <div className="absolute left-0 top-0 h-44 w-44 -translate-x-12 -translate-y-16 rounded-full bg-[#e8d6aa]/30 blur-2xl" />
              <CircleHelp size={28} className="relative text-[#9a6f20]" />
              <div className="font-latin relative mt-6 text-[9px] font-black uppercase tracking-[.16em] text-[#9a6f20]">{t("راهنمای خدمات")}</div>
              <h2 className="relative mt-2 text-3xl font-black">{t("از کجا شروع کنیم؟")}</h2>
              <p className="relative mt-4 max-w-xl text-sm leading-8 text-[var(--fp-muted)]">{t("کشور مقصد و هدف سفر را انتخاب کنید، خدمات مرتبط را بخوانید و خلاصهٔ درخواست خود را برای مشاور آماده کنید.")}</p>
              <a href="#finder" className="secondary-action relative mt-7"><CircleHelp size={16}/>{t("راهنمای انتخاب خدمت")}</a>
            </article></Reveal>
          </div>
        </section>

        <section className="shell py-20">
          <Reveal><div data-tone="gold" className="overflow-hidden rounded-[36px] bg-gradient-to-l from-[#caa85a] via-[#e7d095] to-[#f3e7c8] p-8 md:p-12">
            <div className="grid items-center gap-8 lg:grid-cols-[1fr_auto]">
              <div className="max-w-3xl">
                <div className="font-latin text-[9px] font-black uppercase tracking-[.18em] text-[#75551f]">{t("مسیر همراهی فجر پارسا")}</div>
                <h2 className="mt-3 text-3xl font-black tracking-[-.03em] md:text-4xl">{t("برای سفر بعدی‌تان، قدم اول را بردارید")}</h2>
                <p className="mt-4 text-sm leading-8 text-slate-700">{t("مقصد و خدمت را مشخص کنید؛ جزئیات را با دفتر در میان بگذارید و دربارهٔ شرایط و قیمت سؤال کنید.")}</p>
              </div>
              <button onClick={request} className="shine flex items-center justify-center gap-2 rounded-2xl bg-[#09111f] px-6 py-4 text-sm font-black text-white shadow-xl">{t("شروع درخواست")}<ArrowLeft size={16} /></button>
            </div>
          </div></Reveal>
        </section>
        <FaqSection language={language}/>
        </>}
      </main>

      <ContactChannels language={language} open={contactOpen} onOpenChange={setContactOpen}/>
      {selection && <Suspense fallback={<div role="status" className="dialog-loading">{t("در حال آماده‌سازی فرم…")}</div>}><DetailsDialog selection={selection} language={language} onClose={() => setSelection(null)} onRequest={openRequest} /></Suspense>}
      {!isInboundRoute && <footer id="contact" className="bg-[#070d17] py-14 text-slate-300">
        <div className="shell grid gap-9 md:grid-cols-4">
          <div>
            <div className="flex items-center gap-3">
              <img src="/media/logo.png" alt="" className="h-10 w-10 rounded-xl bg-[var(--fp-surface)] p-1 object-contain" />
              <div><div className="font-black text-white">{t("فجر پارسا")}</div><div className="font-latin text-[8px] tracking-[.14em] text-[var(--fp-muted)]">TRAVEL COMMERCE</div></div>
            </div>
            <p className="mt-4 text-xs leading-6 text-slate-400">{t("سفر، ویزا، زیارت و تجارت در یک تجربه منظم و قابل پیگیری.")}</p>
          </div>
          <div><div className="text-xs font-black text-white">{t("خدمات")}</div><p className="mt-4 text-xs leading-7 text-slate-400">{t("ویزا • اقامت • دعوتنامه • پرواز • هتل • زیارت • اسناد • بیمه")}</p></div>
          <div><div className="text-xs font-black text-white">{t("راه‌های ارتباط")}</div><p className="mt-4 text-xs leading-7 text-slate-400"><a href="https://wa.me/93777377774" target="_blank" rel="noopener noreferrer">{t("واتساپ دفتر: ۰۷۷۷۳۷۷۷۷۴")}</a><br/>{t("کابل، دشت برچی، مارکیت پیوند، منزل دوم، دفتر ۸۵.")}</p></div>
          <div><div className="text-xs font-black text-white">{t("پشتیبانی")}</div><p className="footer-links"><a href="#faq">{t("پرسش‌های رایج")}</a><a href="#finder">{t("راهنمای درخواست")}</a><a href="https://wa.me/93777377774" target="_blank" rel="noopener noreferrer">{t("تماس با دفتر")}</a></p></div>
        </div>
        <div className="shell mt-10 border-t border-white/10 pt-5 text-[10px] text-[var(--fp-muted)]">{t("فجر پارسا — خدمات سفر، ویزا و تجارت")}</div>
      </footer>}



      <nav aria-label={t("ناوبری پایین")} data-active-tab={navActive} className="mobile-action-bar fp-bottom-nav fixed inset-x-3 bottom-3 z-30 grid grid-cols-4 gap-1 rounded-2xl border border-[var(--fp-line)] bg-[var(--fp-glass)] p-2 shadow-2xl backdrop-blur md:hidden">
        <a className={'fp-bottom-item'+(navActive==='home'?' fp-bottom-active':'')} aria-current={navActive==='home'?'page':undefined} href={'/?lang='+language}><House size={18} aria-hidden="true"/><span>{t("خانه")}</span></a>
        <a className={'fp-bottom-item'+(navActive==='services'?' fp-bottom-active':'')} aria-current={navActive==='services'?'location':undefined} href={isInboundRoute?'#inbound-services':isCountryRoute?'/?lang='+language+'#services':'#services'} onClick={()=>{setContactOpen(false);setNavSection('services')}}><LayoutGrid size={18} aria-hidden="true"/><span>{isInboundRoute?inboundNav.services:t("خدمات")}</span></a>
        <button type="button" className={'fp-bottom-item fp-bottom-primary'+(navActive==='request'?' fp-bottom-active':'')} aria-pressed={navActive==='request'} onClick={isInboundRoute?()=>{setContactOpen(false);setNavSection('request');document.getElementById("inbound-request")?.scrollIntoView({behavior:"smooth"})}:request}><ClipboardList size={18} aria-hidden="true"/><span>{isInboundRoute?inboundNav.enquire:t("شروع درخواست")}</span></button>
        <button type="button" className={'fp-bottom-item'+(navActive==='contact'?' fp-bottom-active':'')} aria-controls="fp-contact-dialog" aria-expanded={contactOpen} aria-pressed={navActive==='contact'} onClick={()=>{setMobileOpen(false);setContactOpen(true)}}><Headphones size={18} aria-hidden="true"/><span>{t("تماس")}</span></button>
      </nav>
    </div>
  )
}

export default App
