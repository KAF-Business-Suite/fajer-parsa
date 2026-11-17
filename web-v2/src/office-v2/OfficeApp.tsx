import {useEffect,useMemo,useRef,useState} from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import {
  LayoutDashboard, Globe2, Inbox, Users, Plane, Wallet, MessagesSquare,
  BarChart3, Building2, Settings2, Menu, X, Bell, Search, ChevronLeft,
  ChevronRight, LockKeyhole, Check, Clock3, ArrowUpRight, Eye, ShieldCheck,
  PencilLine, FileText, CircleHelp, ClipboardList, MoreHorizontal, Languages,
  History, ChevronDown, ExternalLink, PanelLeftClose, PanelLeftOpen
} from 'lucide-react'
import type {LucideIcon} from 'lucide-react'
import {copy,groups,labelFor,languages,modules} from './registry'
import type {Lang, ModuleId, ModuleSpec} from './registry'
import './office.css'

const iconFor:Record<ModuleId,LucideIcon>={
  overview:LayoutDashboard, website:Globe2, requests:Inbox, customers:Users,
  services:Plane, finance:Wallet, messages:MessagesSquare, reports:BarChart3,
  organization:Building2, settings:Settings2
}

const websiteTabs=[
  {id:'pages',icon:FileText,label:'publicPages'},
  {id:'brand',icon:Globe2,label:'brand'},
  {id:'office',icon:Building2,label:'officeDetails'},
  {id:'services',icon:Plane,label:'serviceCatalog'},
  {id:'faq',icon:CircleHelp,label:'faq'},
  {id:'locales',icon:Languages,label:'translations'},
] as const
type WebsiteTab=(typeof websiteTabs)[number]['id']
const siteHero:Record<Lang,{tag:string,title:string,subtitle:string,nav:string[]}> = {
 fa:{tag:'سفر و تجربه',title:'فجرپارسا، همراه مسیر شما',subtitle:'برنامه‌ریزی سفر و درخواست خدمات، با اطلاعات تأییدشده.',nav:['خانه','خدمات','دربارهٔ ما','تماس']},
 ps:{tag:'سفر او تجربه',title:'فجرپارسا، ستاسو د لارې ملګری',subtitle:'د تایید شویو معلوماتو پر بنسټ د سفر خدمتونه.',nav:['کور','خدمتونه','زموږ په اړه','اړیکه']},
 en:{tag:'TRAVEL & EXPERIENCE',title:'Fajr Parsa, your journey companion',subtitle:'Explore travel information with transparent, verified service details.',nav:['Home','Services','About','Contact']},
 ar:{tag:'السفر والتجربة',title:'فجر بارسا، رفيق رحلتك',subtitle:'استكشف خدمات السفر بمعلومات واضحة وموثقة.',nav:['الرئيسية','الخدمات','من نحن','اتصل بنا']},
}
const pageCopy:Record<Lang,{preview:string;details:string;recheck:string;notLive:string;confirm:string;confirmBody:string;proceed:string;onlyDesign:string;noPublish:string;sample:string;previewLabel:string;components:string;more:string;checklist:string;save:string}> = {
 fa:{preview:'پیش‌نمایش',details:'جزئیات ماژول',recheck:'بازبینی نسخه',notLive:'اطلاعات واقعی هنوز متصل نیست',confirm:'مرور و تأیید نمونه',confirmBody:'این تأیید فقط در همین صفحهٔ نمونه ثبت می‌شود؛ هیچ نشر، پیام یا تغییری در دیتابیس انجام نمی‌شود.',proceed:'تأیید نمایشی',onlyDesign:'نمونهٔ طراحی؛ بدون دادهٔ واقعی',noPublish:'نشر اصلی نیازمند گیت حقوقی و امنیت است',sample:'نمونهٔ ساختگی',previewLabel:'نمونهٔ وب‌سایت چهارزبانه',components:'بخش‌های آماده برای اتصال',more:'جزئیات بیشتر',checklist:'فهرست بررسی',save:'ذخیرهٔ نمایشی'},
 ps:{preview:'مخکتنه',details:'د برخې معلومات',recheck:'د نسخې کتنه',notLive:'ریښتیني معلومات لا نه دي تړل شوي',confirm:'د بېلګې ارزونه',confirmBody:'دا یوازې ازمایښتي تایید دی؛ هیڅ خپرول، پیغام یا د ډیټابېس بدلون نه کېږي.',proceed:'ازمایښتي تایید',onlyDesign:'د ډیزاین نمونه؛ بې له ریښتینو معلوماتو',noPublish:'اصلي خپرول قانوني او امنیتي تایید غواړي',sample:'ازمایښتي بېلګه',previewLabel:'څلورژبنی وېبپاڼې بېلګه',components:'د نښلولو لپاره چمتو برخې',more:'نور معلومات',checklist:'د کتنې لېست',save:'ازمایښتي خوندي کول'},
 en:{preview:'Preview',details:'Module details',recheck:'Review version',notLive:'Live business data is not connected',confirm:'Review and confirm demo',confirmBody:'This is a visual-only confirmation in the preview. Nothing is published, sent or written to a database.',proceed:'Confirm preview only',onlyDesign:'Design prototype, no live data',noPublish:'Production requires legal and security release gates',sample:'Synthetic example',previewLabel:'Four-language website preview',components:'Ready-to-integrate sections',more:'More details',checklist:'Acceptance checklist',save:'Demo-only save'},
 ar:{preview:'معاينة',details:'تفاصيل الوحدة',recheck:'مراجعة النسخة',notLive:'البيانات الحقيقية غير متصلة',confirm:'مراجعة واعتماد تجريبي',confirmBody:'هذه موافقة للمعاينة فقط، ولا يتم نشر أي شيء أو إرسال رسالة أو تغيير قاعدة بيانات.',proceed:'اعتماد تجريبي فقط',onlyDesign:'نموذج تصميم دون بيانات حقيقية',noPublish:'النشر العام يتطلب موافقات قانونية وأمنية',sample:'مثال تجريبي',previewLabel:'معاينة موقع بأربع لغات',components:'أقسام جاهزة للربط',more:'المزيد من التفاصيل',checklist:'قائمة المراجعة',save:'حفظ تجريبي'}
}
const dot='fp-dot'
const show = (v:string|undefined)=>v||'—'

export default function OfficeApp(){
  const [lang,setLang]=useState<Lang>('fa')
  const [module,setModule]=useState<ModuleId>('overview')
  const [siteTab,setSiteTab]=useState<WebsiteTab>('pages')
  const [collapsed,setCollapsed]=useState(false)
  const [drawer,setDrawer]=useState(false)
  const [search,setSearch]=useState('')
  const [openReview,setOpenReview]=useState(false)
  const [localApproved,setLocalApproved]=useState(false)
  const [toast,setToast]=useState('')
  const searchRef=useRef<HTMLInputElement>(null)
  const c=copy[lang],p=pageCopy[lang]
  const direction=languages.find(x=>x.id===lang)?.dir||'rtl'
  useEffect(()=>{
    const key=(event:KeyboardEvent)=>{
      if((event.metaKey||event.ctrlKey)&&event.key.toLowerCase()==='k'){
        event.preventDefault();searchRef.current?.focus()
      }
      if(event.key==='Escape')setDrawer(false)
    }
    window.addEventListener('keydown',key)
    return()=>window.removeEventListener('keydown',key)
  },[])
  useEffect(()=>{
    document.documentElement.lang=lang
    document.documentElement.dir=direction
    document.title=labelFor(module,lang)+' | Fajr Parsa Admin Preview'
  },[lang,direction,module])
  const filtered=useMemo(()=>modules.filter(x=>x.label[lang].toLowerCase().includes(search.trim().toLowerCase())),[lang,search])
  const activeName=labelFor(module,lang)
  const flash=(message:string)=>{setToast(message)}
  const switchTo=(next:ModuleId)=>{setModule(next);setSearch('');setDrawer(false);window.scrollTo({top:0,behavior:'instant'})}
  const navByGroup=(group:ModuleSpec['group'])=>filtered.filter(x=>x.group===group)
  function sidebar(){
    return <>
      <div className="fp-brand">
        <div className="fp-brand-icon" aria-hidden>FP</div>
        {!collapsed&&<div className="fp-brand-name"><strong>FAJR PARSA</strong><small>CONTROL STUDIO</small></div>}
      </div>
      {!collapsed&&<p className="fp-sidebar-label">{c.workspace}</p>}
      {groups.map(group=><div className="fp-nav-group" key={group}>
        {!collapsed&&<span className="fp-nav-group-label">{group==='workspace'?c.workspace:group==='business'?c.business:c.control}</span>}
        {navByGroup(group).map(item=>{
          const Icon=iconFor[item.id]
          return <button key={item.id} type="button" title={item.label[lang]} aria-current={module===item.id?'page':undefined}
            className={'fp-nav-item '+(module===item.id?'active':'')} onClick={()=>switchTo(item.id)}>
            <Icon size={19} strokeWidth={1.9}/>
            {!collapsed&&<span>{item.label[lang]}</span>}
            {!collapsed&&module===item.id&&<span className="fp-active-mark"/>}
          </button>
        })}
      </div>)}
      <div className="fp-sidebar-bottom">
        {!collapsed&&<div className="fp-safe-note"><ShieldCheck size={18}/><span>{c.secure}</span></div>}
        <button className="fp-collapse" type="button" onClick={()=>setCollapsed(v=>!v)} title={collapsed?'Expand':'Collapse'}>
          {collapsed?<PanelLeftOpen size={18}/>:<PanelLeftClose size={18}/>}
          {!collapsed&&<span>{c.menu}</span>}
        </button>
      </div>
    </>
  }

  return <div className={'fp-app '+(collapsed?'fp-collapsed':'')} dir={direction}>
    <aside className="fp-sidebar" aria-label={c.menu}>{sidebar()}</aside>
    <div className="fp-shell">
      <header className="fp-topbar">
        <button className="fp-icon-button fp-mobile-menu" type="button" onClick={()=>setDrawer(true)} aria-label={c.menu}><Menu size={22}/></button>
        <div className="fp-breadcrumb"><span>FAJR PARSA</span><span className="fp-breadcrumb-sep">/</span><strong>{activeName}</strong></div>
        <div className="fp-top-actions">
          <label className="fp-search"><Search size={18}/><input ref={searchRef} type="search" placeholder={c.search+'  Ctrl+K'} value={search} onChange={e=>setSearch(e.target.value)} aria-label={c.search}/></label>
          <label className="fp-language-select" aria-label="Language"><Languages size={17}/><select value={lang} onChange={e=>setLang(e.target.value as Lang)}>{languages.map(x=><option value={x.id} key={x.id}>{x.label}</option>)}</select><ChevronDown size={14}/></label>
          <button className="fp-icon-button" type="button" aria-label="Notifications" onClick={()=>flash(c.noConnected)}><Bell size={19}/><span className={dot}/></button>
          <button className="fp-avatar" type="button" onClick={()=>switchTo('organization')} aria-label={c.owner}>FP</button>
        </div>
      </header>
      <main className="fp-main">
        <div className="fp-demo-banner"><span className="fp-preview-tag"><Eye size={15}/>{c.demo}</span><span>{c.preview}</span><span className="fp-prod-tag"><LockKeyhole size={14}/>{c.deployLocked}</span></div>
        <div className="fp-page-header">
          <div><p className="fp-eyebrow">FAJR PARSA / CONTROL CENTER</p><h1>{module==='overview'?c.welcome:activeName}</h1><p>{module==='overview'?c.slogan:p.notLive}</p></div>
          <div className="fp-page-actions">
            {module==='website'&&<button type="button" className="fp-button fp-button-ghost" onClick={()=>setOpenReview(true)}><History size={16}/>{c.review}</button>}
            <button type="button" className="fp-button fp-button-primary" onClick={()=>module==='website'?setOpenReview(true):flash(p.notLive)}><ArrowUpRight size={17}/>{module==='website'?p.recheck:c.start}</button>
          </div>
        </div>
        {module==='overview'&&<Overview c={c} p={p} lang={lang} go={switchTo}/>}
        {module==='website'&&<Website c={c} p={p} lang={lang} tab={siteTab} setTab={setSiteTab} onReview={()=>setOpenReview(true)}/>}
        {module==='settings'&&<SettingsPreview c={c} p={p} lang={lang} go={switchTo}/>}
        {module!=='overview'&&module!=='website'&&module!=='settings'&&<ModulePreview c={c} p={p} module={module} lang={lang} go={switchTo}/>}
        <footer className="fp-footer"><span>FAJR PARSA · CONTROL STUDIO · QA DESIGN V1</span><span>{p.onlyDesign}</span></footer>
      </main>
    </div>
    <nav className="fp-bottom-nav" aria-label={c.menu}>
      {(['overview','requests','customers','website','settings'] as const).map(id=>{
        const Icon=iconFor[id]
        return <button key={id} type="button" className={'fp-tab '+((id===module||id==='settings'&&!(['overview','requests','customers','website'] as string[]).includes(module))?'active':'')} onClick={()=>id==='settings'?setDrawer(true):switchTo(id)} aria-current={(id===module||id==='settings'&&!(['overview','requests','customers','website'] as string[]).includes(module))?'page':undefined}>
          <Icon size={20}/><span>{id==='settings'?c.menu:id==='overview'?c.home:labelFor(id,lang)}</span>
        </button>
      })}
    </nav>
    {drawer&&<div className="fp-drawer-backdrop" onClick={()=>setDrawer(false)}>
      <div className="fp-drawer" role="dialog" aria-modal="true" aria-label={c.menu} onClick={e=>e.stopPropagation()}>
        <div className="fp-drawer-top"><strong>{c.moreTitle}</strong><button className="fp-icon-button" type="button" onClick={()=>setDrawer(false)} aria-label={c.close}><X size={18}/></button></div>
        {modules.map(item=>{const Icon=iconFor[item.id];return <button className="fp-drawer-entry" type="button" key={item.id} onClick={()=>switchTo(item.id)}><Icon size={19}/>{item.label[lang]}</button>})}
      </div>
    </div>}
    <Dialog.Root open={openReview} onOpenChange={setOpenReview}>
      <Dialog.Portal><Dialog.Overlay className="fp-modal-overlay"/><Dialog.Content className="fp-modal">
        <div className="fp-modal-icon"><ShieldCheck size={23}/></div>
        <Dialog.Title className="fp-modal-title">{p.confirm}</Dialog.Title>
        <Dialog.Description className="fp-modal-description">{p.confirmBody}</Dialog.Description>
        <div className="fp-diff">
          <div className="fp-diff-row"><span>{c.brand}</span><span>{c.draftStatus}</span></div>
          <div className="fp-diff-row"><span>{c.translations}</span><span>fa · ps · en · ar</span></div>
          <div className="fp-diff-row"><span>{c.publishing}</span><span className="fp-danger-text">{c.deployLocked}</span></div>
        </div>
        <div className="fp-modal-actions">
          <Dialog.Close className="fp-button fp-button-ghost">{c.cancel}</Dialog.Close>
          <button className="fp-button fp-button-primary" type="button" onClick={()=>{setLocalApproved(true);setOpenReview(false);flash(c.approved)}}><Check size={16}/>{p.proceed}</button>
        </div>
      </Dialog.Content></Dialog.Portal>
    </Dialog.Root>
    {localApproved&&<div className="fp-local-approved"><Check size={15}/>{c.approved}</div>}
    {toast&&<div className="fp-toast" role="status"><span>{toast}</span><button type="button" aria-label={c.close} onClick={()=>setToast('')}><X size={14}/></button></div>}
  </div>
}
type C=Record<string,string>
function StatCard({icon:Icon,title,desc}:{icon:LucideIcon;title:string;desc:string}){return <article className="fp-stat"><div className="fp-stat-head"><span>{title}</span><span className="fp-stat-icon"><Icon size={18}/></span></div><strong>—</strong><small>{desc}</small></article>}

function Overview({c,p,lang,go}:{c:C;p:typeof pageCopy['fa'];lang:Lang;go:(v:ModuleId)=>void}){
 return <div className="fp-stacked">
   <div className="fp-stats">
    <StatCard icon={Inbox} title={c.inbox} desc={p.notLive}/>
    <StatCard icon={Users} title={c.customers} desc={p.notLive}/>
    <StatCard icon={Clock3} title={c.pending} desc={p.notLive}/>
    <StatCard icon={Globe2} title={c.siteStatus} desc={c.unpublished}/>
   </div>
   <div className="fp-two-cols">
     <section className="fp-panel">
       <header className="fp-panel-header"><div><span className="fp-eyebrow">WORKSPACE</span><h2>{c.activity}</h2></div><button type="button" className="fp-text-action" onClick={()=>go('requests')}>{p.more}<ChevronLeft size={17}/></button></header>
       <div className="fp-empty-state"><ClipboardList size={29}/><strong>{c.noConnected}</strong><p>{c.sampleOnly}</p></div>
     </section>
     <section className="fp-panel">
       <header className="fp-panel-header"><div><span className="fp-eyebrow">QUICK ACCESS</span><h2>{c.quick}</h2></div></header>
       <div className="fp-quick-grid">
        {(['requests','customers','website','reports'] as const).map(id=>{const Icon=iconFor[id];return <button key={id} type="button" onClick={()=>go(id)}><span className="fp-quick-icon"><Icon size={20}/></span><strong>{labelFor(id,lang)}</strong><ArrowUpRight size={16}/></button>})}
       </div>
       <div className="fp-mini-note"><ShieldCheck size={18}/><span>{c.deployLocked}</span></div>
     </section>
   </div>
  </div>
}
function Website({c,p,lang,tab,setTab,onReview}:{c:C;p:typeof pageCopy['fa'];lang:Lang;tab:WebsiteTab;setTab:(x:WebsiteTab)=>void;onReview:()=>void}){
 const selected=websiteTabs.find(x=>x.id===tab)!
 return <div className="fp-stacked">
   <div className="fp-site-tabs" role="tablist" aria-label={c.siteContent}>
      {websiteTabs.map(t=>{const Icon=t.icon;return <button key={t.id} type="button" role="tab" aria-selected={tab===t.id} className={tab===t.id?'active':''} onClick={()=>setTab(t.id)}><Icon size={17}/>{c[t.label]}</button>})}
   </div>
   <div className="fp-web-grid">
     <section className="fp-panel fp-manager-panel">
       <header className="fp-panel-header"><div><span className="fp-eyebrow">SITE CONTENT / {tab.toUpperCase()}</span><h2>{c[selected.label]}</h2></div><span className="fp-status-dot"><span/>{c.draft}</span></header>
       <div className="fp-content-row"><span className="fp-content-icon"><PencilLine size={17}/></span><div><strong>{c[selected.label]}</strong><small>{p.onlyDesign}</small></div><span className="fp-row-pill">{p.components}</span></div>
       <div className="fp-content-row"><span className="fp-content-icon"><Languages size={17}/></span><div><strong>{c.translations}</strong><small>دری · پښتو · English · العربية</small></div><span className="fp-row-pill">{c.draft}</span></div>
       <div className="fp-content-row"><span className="fp-content-icon"><Eye size={17}/></span><div><strong>{c.visualPreview}</strong><small>{p.previewLabel}</small></div><span className="fp-row-pill">{p.preview}</span></div>
       <div className="fp-content-note"><LockKeyhole size={17}/><span>{p.noPublish}</span></div>
       <button className="fp-button fp-button-primary fp-full" type="button" onClick={onReview}><ShieldCheck size={17}/>{c.review}</button>
     </section>
     <section className="fp-panel fp-preview-panel">
       <header className="fp-panel-header"><div><span className="fp-eyebrow">LIVE VISUAL PREVIEW / SYNTHETIC</span><h2>{c.visualPreview}</h2></div><span className="fp-site-device"><Eye size={14}/>{p.preview}</span></header>
       <div className="fp-site-frame"><div className="fp-browserbar"><span className="fp-browser-dots"><i/><i/><i/></span><span>fajr-parsa.example / preview</span><LockKeyhole size={13}/></div>
         <div className="fp-public-mock" dir={lang==='en'?'ltr':'rtl'} lang={lang}>
           <div className="fp-public-head"><strong>FAJR <span>PARSA</span></strong><nav>{siteHero[lang].nav.map(n=><span key={n}>{n}</span>)}</nav></div>
           <div className="fp-public-hero"><span className="fp-public-kicker">{siteHero[lang].tag}</span><h3>{siteHero[lang].title}</h3><p>{siteHero[lang].subtitle}</p><div className="fp-public-pills"><span>{c.serviceCatalog}</span><span>{c.officeDetails}</span></div></div>
           <div className="fp-public-features"><div><Plane size={18}/><span>{c.serviceCatalog}</span></div><div><ShieldCheck size={18}/><span>{c.approvals}</span></div><div><Globe2 size={18}/><span>{c.translations}</span></div></div>
         </div>
       </div>
       <p className="fp-visual-footnote">{c.sampleOnly}</p>
     </section>
   </div>
 </div>
}

function SettingsPreview({c,p,lang}:{c:C;p:typeof pageCopy['fa'];lang:Lang;go:(x:ModuleId)=>void}){
 const cells=[['owner',c.owner,'approve','✓'],['staff',lang==='en'?'Staff':c.workspace,'view','✓'],['finance',labelFor('finance',lang),'limited','—']] as const
 return <div className="fp-two-cols">
  <section className="fp-panel"><header className="fp-panel-header"><div><span className="fp-eyebrow">ACCESS CONTROL</span><h2>{c.permission}</h2></div><ShieldCheck size={23}/></header>
  <div className="fp-role-table">{cells.map(([id,name,level,approved])=><div className="fp-role-row" key={id}><span className="fp-avatar-sm">{id.slice(0,2).toUpperCase()}</span><div><strong>{name}</strong><small>{level}</small></div><span>{approved}</span></div>)}</div>
  <div className="fp-content-note"><LockKeyhole size={17}/>{p.onlyDesign}</div></section>
  <section className="fp-panel"><header className="fp-panel-header"><div><span className="fp-eyebrow">AUDIT TRAIL</span><h2>{c.history}</h2></div><History size={21}/></header>
    <div className="fp-empty-state"><History size={29}/><strong>{c.noConnected}</strong><p>{c.secure}</p></div>
  </section>
 </div>
}

function ModulePreview({c,p,module,lang,go}:{c:C;p:typeof pageCopy['fa'];module:ModuleId;lang:Lang;go:(v:ModuleId)=>void}){
 const Icon=iconFor[module]
 return <div className="fp-two-cols">
   <section className="fp-panel fp-module-intro"><span className="fp-large-icon"><Icon size={30}/></span><span className="fp-eyebrow">MODULE / {module.toUpperCase()}</span><h2>{labelFor(module,lang)}</h2><p>{c.noConnected}</p>
     <div className="fp-content-note"><LockKeyhole size={16}/>{p.onlyDesign}</div>
     <button className="fp-button fp-button-primary" type="button" onClick={()=>go('overview')}><LayoutDashboard size={17}/>{c.home}</button>
   </section>
   <section className="fp-panel"><header className="fp-panel-header"><div><span className="fp-eyebrow">STRUCTURED MODULE</span><h2>{p.components}</h2></div></header>
   {['permission','history','audit'].map(k=><div className="fp-content-row" key={k}><span className="fp-content-icon"><Check size={17}/></span><div><strong>{c[k]}</strong><small>{p.notLive}</small></div></div>)}
   </section>
 </div>
}
