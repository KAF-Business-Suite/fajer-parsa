/**
 * FP-ADMIN | Enterprise console design candidate: real MIT shadcn-admin Card,
 * Input and Table primitives, existing React/Radix/Lucide.
 * Only fake in-memory records; no fetch/credentials/database on this route.
 */
import {useEffect,useMemo,useRef,useState} from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import {
 LayoutDashboard,Layers,ShieldCheck,ListTodo,CalendarDays,Bell,BriefcaseBusiness,Inbox,Users,
 FolderOpen,Plane,MapPinned,CalendarCheck,Files,Building2,Globe,PanelsTopLeft,
 Images,Newspaper,Tags,Megaphone,ClipboardList,Languages,SearchCheck,History,
 MessagesSquare,MessageCircle,Mail,Share2,Target,NotebookTabs,Workflow,
 ChartNoAxesCombined,Wallet,ReceiptText,CreditCard,ChartColumn,FileChartColumn,
 Settings,Blocks,Palette,Plug,Code2,CloudUpload,UsersRound,Shield,DatabaseBackup,
 SlidersHorizontal,Search,ChevronDown,ChevronLeft,ChevronRight,ArrowUpRight,
 Menu,X,Check,Eye,LockKeyhole,PanelLeftClose,PanelLeftOpen,FilePlus2,
 FolderPlus,Plus,BookOpen,Globe2,Filter,MoreHorizontal,CheckCircle2,
 CircleHelp,Radio,RefreshCw,UploadCloud,PanelTop,Send,MonitorSmartphone,
 MessageSquareText,FileText,Columns3,Save,AlignLeft
} from 'lucide-react'
import type {LucideIcon} from 'lucide-react'
import {Card,CardContent,CardDescription,CardHeader,CardTitle} from './oss/card'
import {Table,TableBody,TableCell,TableHead,TableHeader,TableRow} from './oss/table'
import {Input} from './oss/input'
import {adminLanguages,byId,features,groups,publicLanguages,totalFeatures} from './console-model'
import type {AdminLanguage,AdminGroup,Feature,FeatureMode} from './console-model'
import './enterprise.css'
import {ResourceCenter,ThemeLab,defaultStyle} from './ResourceCenter'
import type {PreviewStyle} from './ResourceCenter'
import {previewSeed} from './resource-registry'
import type {PreviewResource} from './resource-registry'

const icons:Record<string,LucideIcon>={
 'layout-dashboard':LayoutDashboard,'layers':Layers,'shield-check':ShieldCheck,'list-todo':ListTodo,
 'calendar-days':CalendarDays,'bell':Bell,'briefcase-business':BriefcaseBusiness,'inbox':Inbox,
 'users':Users,'folder-open':FolderOpen,'plane':Plane,'map-pinned':MapPinned,'calendar-check':CalendarCheck,
 'files':Files,'building-2':Building2,'globe':Globe,'panels-top-left':PanelsTopLeft,'images':Images,
 'newspaper':Newspaper,'tags':Tags,'megaphone':Megaphone,'clipboard-list':ClipboardList,'languages':Languages,
 'search-check':SearchCheck,'history':History,'messages-square':MessagesSquare,'message-circle':MessageCircle,
 'mail':Mail,'share-2':Share2,'target':Target,'notebook-tabs':NotebookTabs,'workflow':Workflow,
 'chart-no-axes-combined':ChartNoAxesCombined,'wallet':Wallet,'receipt-text':ReceiptText,
 'credit-card':CreditCard,'chart-column':ChartColumn,'file-chart-column':FileChartColumn,'settings':Settings,
 'blocks':Blocks,'palette':Palette,'plug':Plug,'code-2':Code2,'cloud-upload':CloudUpload,
 'users-round':UsersRound,'shield':Shield,'database-backup':DatabaseBackup,'sliders-horizontal':SlidersHorizontal,
}
const phrases={
 fa:{
  search:'جستجو در همهٔ بخش‌ها', mode:'نمونهٔ طراحی', noLive:'اطلاعات زنده وصل نیست',
  production:'نشر اصلی مسدود است',workspace:'فضای کاری',company:'فجرپارسا',all:'همهٔ بخش‌ها',
  role:'مالک / مدیر کل',heading:'کنسول مدیریت فجرپارسا',subtitle:'همهٔ بخش‌های شرکت در یک محل؛ با توان توسعه و کنترول.',
  dashboard:'نمای مدیریتی',recent:'فعالیت‌های اخیر',tasks:'کارهای نیازمند اقدام',
  integrations:'اتصالات',content:'مدیریت محتوا',requests:'درخواست‌ها',members:'کاربران',
  quick:'دسترسی سریع',view:'باز کردن',sample:'معلومات نمونهٔ ساختگی',none:'هنوز اطلاعات واقعی دریافت نشده است',
  choose:'بخش موردنظر را از منو انتخاب کنید',open:'باز کردن',new:'ایجاد',import:'واردکردن',
  filter:'فلتر',records:'فهرست موارد',searchRecords:'جستجو در موارد نمایشی',
  details:'جزئیات',status:'وضعیت',owner:'مسئول',date:'تاریخ',number:'شناسه',menu:'بیشتر',
  noAction:'این عملیات در نسخهٔ نمایشی به سرور ارسال نمی‌شود.',
  demoOnly:'این اطلاعات فقط نمونه‌اند؛ هیچ پیام، پرداخت یا نشر واقعی انجام نمی‌شود.',
  release:'مدیریت نشر',preview:'پیش‌نمایش سایت',draft:'پیش‌نویس',review:'بررسی تغییرات',
  saved:'ذخیرهٔ نمایشی',never:'هیچ اطلاعات واقعی تغییر نکرد.',publisher:'نشر فقط با تأیید مسئول',
  createModule:'افزودن بخش',createWorkspace:'افزودن فضای کاری',moduleTitle:'نام بخش جدید',
  template:'انتخاب قالب آماده',previewAdd:'اضافه‌کردن به نمونه',moduleName:'نام نمونهٔ بخش',
  added:'بخش فقط در این پیش‌نمایش اضافه شد.',security:'امنیت و مجوز',sandbox:'محیط آزمایشی',
  connected:'اتصال تأیید نشده',roleControls:'نقش‌های مدیریتی',audit:'تاریخچه و ممیزی',
  activity:'فعالیت‌ها و گزارش‌ها',apps:'برنامه‌ها و افزونه‌ها',notifications:'اعلان‌ها',
  sitePreview:'نمایش بصری سایت در چهار زبان',publicLanguage:'زبان سایت عمومی',
  noApproved:'هیچ دادهٔ تأییدشدهٔ واقعی در این نسخه قرار ندارد.',
  publishingModal:'مرور پیش از نشر',pubModalBody:'این پنجره نمونهٔ روند نشر است. هیچ نسخه‌ای به سایت عمومی ارسال نمی‌شود.',
  verify:'بررسی چهار زبان',approval:'تأیید نمونه، نه نشر',notPublished:'هیچ چیز منتشر نشد.',
  prev:'بازگشت',cancel:'انصراف',close:'بستن',
  overview:'خانه',work:'کارها',website:'وب‌سایت',console:'کنسول',more:'بیشتر',
  platform:'تنظیمات پیشرفته',changeLanguage:'زبان پنل',publicNote:'چهار زبانِ سایت عمومی مستقل از زبان پنل باقی می‌ماند.',
  pending:'در مرحلهٔ طراحی',onlyDesign:'نمایش نمونه، بدون دسترسی عملیاتی',
  customTitle:'بخش‌های قابل‌افزودن',standardTemplates:'قالب‌های آماده',
  approvedReview:'تأیید نمایشی ثبت شد.',noFake:'—',userAccess:'مجوزهای دسترسی',
  integrationsNote:'این فهرست به معنی فعال بودن اتصال نیست.',devConsole:'مرکز توسعه و وضعیت سرویس‌ها',
  systemHealth:'وضعیت زیرساخت',serverLinks:'مرجع سرویس‌ها',hideKey:'کلیدها نمایش داده نمی‌شوند',
  route:'مسیر ماژول',feature:'بخش',planned:'برای توسعه آماده',tool:'ابزار',
  ownerSetting:'کنترول و تنظیمات مالک',docs:'اسناد',previewFrame:'نمایش صفحهٔ عمومی، دادهٔ ساختگی',
  publish:'نشر',schedule:'زمان‌بندی',siteBrand:'برند و محتوا',siteMedia:'رسانه و عکس',
  offers:'آفرها و اعلان‌ها',faq:'پرسش‌های متداول',add:'اضافه',readonly:'نمایشی',
  noProduction:'این فقط رابط است؛ نقش‌ها و مجوزها در سرویس واقعی تعیین می‌شوند.',
  builtBy:'بر پایهٔ اجزای متن‌باز Refine / shadcn/ui',
 },
 en:{
  search:'Search all modules',mode:'Design preview',noLive:'Live data is not connected',
  production:'Production publishing locked',workspace:'Workspace',company:'Fajr Parsa',all:'All modules',
  role:'Owner / super administrator',heading:'Fajr Parsa Administration',subtitle:'One extensible console for every part of the company.',
  dashboard:'Management overview',recent:'Recent activity',tasks:'Tasks requiring action',
  integrations:'Integrations',content:'Content management',requests:'Requests',members:'Users',
  quick:'Quick navigation',view:'Open',sample:'Fictional sample data',none:'No live data loaded',
  choose:'Choose a module from navigation',open:'Open',new:'Create',import:'Import',
  filter:'Filter',records:'Records',searchRecords:'Search fictional records',
  details:'Details',status:'Status',owner:'Owner',date:'Date',number:'ID',menu:'More',
  noAction:'This design preview does not send operations to a server.',
  demoOnly:'All data is fictional. No real publishing, messages or payments.',
  release:'Publishing control',preview:'Website preview',draft:'Draft',review:'Review changes',
  saved:'Demo-only save',never:'No real business data changed.',publisher:'Publishing requires owner approval',
  createModule:'Add module',createWorkspace:'Add workspace',moduleTitle:'New module name',
  template:'Choose a ready template',previewAdd:'Add to preview',moduleName:'Example module name',
  added:'Module added only in this design preview.',security:'Security & permissions',sandbox:'QA design environment',
  connected:'Connection not verified',roleControls:'Administration roles',audit:'Audit history',
  activity:'Activity & reporting',apps:'Apps & plugins',notifications:'Notifications',
  sitePreview:'Visual site preview in four languages',publicLanguage:'Public website language',
  noApproved:'No verified production data is shown in this preview.',
  publishingModal:'Review before publishing',pubModalBody:'This is a sample publishing workflow. Nothing is sent to the public website.',
  verify:'Verify four languages',approval:'Approve sample, not publish',notPublished:'Nothing was published.',
  prev:'Back',cancel:'Cancel',close:'Close',
  overview:'Home',work:'Work',website:'Website',console:'Console',more:'More',
  platform:'Advanced settings',changeLanguage:'Console language',publicNote:'The public website retains four languages independently of console language.',
  pending:'Design phase',onlyDesign:'Interface preview with no operational access',
  customTitle:'Addable modules',standardTemplates:'Ready-made templates',
  approvedReview:'Preview-only approval recorded.',noFake:'—',userAccess:'Access permissions',
  integrationsNote:'These entries do not indicate a working connection.',devConsole:'Development and service health',
  systemHealth:'Infrastructure status',serverLinks:'Service references',hideKey:'API keys are never shown',
  route:'Module route',feature:'Feature',planned:'Ready to extend',tool:'Tool',
  ownerSetting:'Owner controls & settings',docs:'Documents',previewFrame:'Fictional public website rendering',
  publish:'Publish',schedule:'Schedule',siteBrand:'Brand and content',siteMedia:'Media and photos',
  offers:'Offers and announcements',faq:'FAQ',add:'Add',readonly:'Preview',
  noProduction:'Roles and access will be enforced by the real server, not this preview.',
  builtBy:'Built from open-source Refine / shadcn/ui building blocks',
 }
} as const
type Texts={ [K in keyof typeof phrases['fa']]: string }
function Icon({name,size=18}:{name:string;size?:number}){const Element=icons[name]||Blocks;return <Element size={size} strokeWidth={1.9}/>}
const dummyRows=[
 {id:'QA-DEMO-001',label:{fa:'درخواست نمونهٔ خدمات',en:'Example service request'},status:{fa:'پیش‌نویس',en:'Draft'}},
 {id:'QA-DEMO-002',label:{fa:'پیگیری نمونهٔ دفتر',en:'Example office follow-up'},status:{fa:'در انتظار بررسی',en:'Needs review'}},
 {id:'QA-DEMO-003',label:{fa:'فورم ساختگی',en:'Fictional form'},status:{fa:'آزمایشی',en:'Test only'}},
]
const siteText={
 fa:{hero:'سفر را با اطمینان آغاز کنید',sub:'فجرپارسا — اطلاعات سفر و خدمات تأییدشده',nav:['خانه','خدمات','دربارهٔ ما','تماس'],cta:'خدمات ما',card:'راهنمای سفر'},
 ps:{hero:'خپل سفر په ډاډ پیل کړئ',sub:'فجرپارسا — د سفر تایید شوي معلومات',nav:['کور','خدمتونه','زموږ په اړه','اړیکه'],cta:'زموږ خدمتونه',card:'د سفر لارښود'},
 en:{hero:'Begin your journey with confidence',sub:'Fajr Parsa — verified travel information and services',nav:['Home','Services','About','Contact'],cta:'Explore services',card:'Travel guide'},
 ar:{hero:'ابدأ رحلتك بثقة',sub:'فجر بارسا — معلومات السفر والخدمات المعتمدة',nav:['الرئيسية','الخدمات','من نحن','اتصل بنا'],cta:'اكتشف الخدمات',card:'دليل السفر'}
}
type PublicLang=keyof typeof siteText
const roleLabels:{fa:string;en:string}[]=[
 {fa:'مالک و مدیریت',en:'Owner & management'},
 {fa:'مسئول عملیات',en:'Operations manager'},
 {fa:'حسابداری و مالی',en:'Finance'},
 {fa:'طراحی و محتوا',en:'Design & content'},
 {fa:'توسعه‌دهنده',en:'Developer'},
 {fa:'ارتباطات و مارکتینگ',en:'Communications & marketing'},
]
const connectors=['Cloudflare','Supabase','GitHub','WhatsApp Business','Google Workspace','Meta Business','Google Analytics','Vercel']
const buildingBlocks:{fa:string;en:string;icon:string}[]=[
 {fa:'صفحهٔ وب‌سایت',en:'Website page',icon:'panels-top-left'},
 {fa:'جدول مدیریت',en:'Data management table',icon:'files'},
 {fa:'فضای کاری',en:'Workspace',icon:'layers'},
 {fa:'فورم و درخواست',en:'Request form',icon:'clipboard-list'},
 {fa:'گزارش و نمودار',en:'Report & chart',icon:'chart-column'},
 {fa:'جریان اتوماسیون',en:'Automation flow',icon:'workflow'},
]

export default function EnterpriseConsole(){
 const [lang,setLang]=useState<AdminLanguage>('fa')
 const [resources,setResources]=useState<PreviewResource[]>(()=>previewSeed.map(x=>({...x})))
 const [appearance,setAppearance]=useState<PreviewStyle>(defaultStyle)
 const [systemDark,setSystemDark]=useState(()=>window.matchMedia?.('(prefers-color-scheme: dark)').matches??false)
 useEffect(()=>{const q=window.matchMedia('(prefers-color-scheme: dark)');const change=()=>setSystemDark(q.matches);q.addEventListener('change',change);return()=>q.removeEventListener('change',change)},[])
 const [featureId,setFeatureId]=useState(()=>{
   const hash=decodeURIComponent(location.hash.replace(/^#\/?/,''))
   return features.some(x=>x.id===hash)?hash:'overview'
 })
 const [collapsed,setCollapsed]=useState(false)
 const [mobileMenu,setMobileMenu]=useState(false)
 const [expanded,setExpanded]=useState<AdminGroup[]>(['command','content'])
 const [query,setQuery]=useState('')
 const [rowQuery,setRowQuery]=useState('')
 const [modal,setModal]=useState<'publish'|'create'|'workspace'|null>(null)
 const [publicLang,setPublicLang]=useState<PublicLang>('fa')
 const [notice,setNotice]=useState('')
 const [moduleName,setModuleName]=useState('')
 const [custom,setCustom]=useState<string[]>([])
 const [chosenBlock,setChosenBlock]=useState(0)
 const [currentTab,setCurrentTab]=useState<'overview'|'design'|'history'>('overview')
 const searchRef=useRef<HTMLInputElement>(null)
 const tx=phrases[lang] as Texts
 const current=byId(featureId)
 const dir=lang==='en'?'ltr':'rtl'
 const isCustom=featureId.startsWith('demo-')
 const label=isCustom?(custom.find(x=>'demo-'+x===featureId)||tx.moduleName):current.label[lang]
 const filtered=useMemo(()=>features.filter(f=>(f.label[lang]+f.description[lang]).toLowerCase().includes(query.toLowerCase())),[query,lang])
 useEffect(()=>{
  const change=()=>{const hash=decodeURIComponent(location.hash.replace(/^#\/?/,''));setFeatureId(features.some(x=>x.id===hash)||hash.startsWith('demo-')?hash:'overview')}
  const keys=(event:KeyboardEvent)=>{if((event.ctrlKey||event.metaKey)&&event.key.toLowerCase()==='k'){event.preventDefault();searchRef.current?.focus()}if(event.key==='Escape')setMobileMenu(false)}
  window.addEventListener('hashchange',change);window.addEventListener('keydown',keys)
  return()=>{window.removeEventListener('hashchange',change);window.removeEventListener('keydown',keys)}
 },[])
 useEffect(()=>{document.documentElement.lang=lang;document.documentElement.dir=dir;document.title=label+' | Fajr Parsa Console Preview'},[lang,dir,label])
 function go(id:string){location.hash='/'+encodeURIComponent(id);setFeatureId(id);setMobileMenu(false);setRowQuery('');setCurrentTab('overview');window.scrollTo({top:0,behavior:'instant'})}
 function toggleGroup(id:AdminGroup){setExpanded(x=>x.includes(id)?x.filter(y=>y!==id):[...x,id])}
 function toast(m:string){setNotice(m)}
 function sidebar(){
  return <><div className="fpx-brand"><div className="fpx-logo">FP</div>{!collapsed&&<div><strong>FAJR PARSA</strong><small>ADMIN CONSOLE</small></div>}</div>
   <div className="fpx-workspace-card" onClick={()=>go('workspaces')} role="button" tabIndex={0} onKeyDown={e=>{if(e.key==='Enter')go('workspaces')}}><Layers size={18}/>{!collapsed&&<div><strong>{tx.company}</strong><small>{tx.workspace}</small></div>}{!collapsed&&<ChevronDown size={14}/>}</div>
   <div className="fpx-nav-scroll">{groups.map(group=>{
    const found=filtered.filter(f=>f.group===group.id)
    if(!found.length)return null
    const open=expanded.includes(group.id)||!!query
    return <div className="fpx-group" key={group.id}>
     <button className="fpx-group-head" type="button" onClick={()=>toggleGroup(group.id)} aria-expanded={open} title={group.name[lang]}><Icon name={group.icon} size={17}/>{!collapsed&&<><span>{group.name[lang]}</span><ChevronDown size={14} className={open?'':'fpx-chevron-fold'}/></>}</button>
     {open&&found.map(f=><button key={f.id} type="button" onClick={()=>go(f.id)} aria-current={featureId===f.id?'page':undefined} title={f.label[lang]} className={'fpx-nav-item '+(featureId===f.id?'active':'')}>
      <Icon name={f.icon} size={17}/>{!collapsed&&<><span>{f.label[lang]}</span>{featureId===f.id&&<i/>}</>}
     </button>)}
    </div>
   })}{custom.map(name=><button className={'fpx-nav-item '+(featureId==='demo-'+name?'active':'')} key={name} onClick={()=>go('demo-'+name)} type="button"><Blocks size={16}/>{!collapsed&&<span>{name}</span>}</button>)}</div>
   <div className="fpx-sidebar-footer"><div className="fpx-sandbox"><LockKeyhole size={17}/>{!collapsed&&<span>{tx.sandbox}<small>{tx.production}</small></span>}</div><button type="button" onClick={()=>setCollapsed(c=>!c)} aria-label={collapsed?'Expand sidebar':'Collapse sidebar'}>{collapsed?<PanelLeftOpen size={18}/>:<PanelLeftClose size={18}/>}</button></div>
  </>
 }
 function featureHeader(){
  if(featureId==='resources'||featureId==='designsystem')return null
  return <div className="fpx-content-head"><div><div className="fpx-overline">{tx.workspace} / {groups.find(g=>g.id===current.group)?.name[lang]}</div><h1>{featureId==='overview'?tx.heading:label}</h1><p>{featureId==='overview'?tx.subtitle:current.description[lang]}</p></div><div className="fpx-content-actions"><span className="fpx-state-pill"><span/>{tx.pending}</span><button type="button" onClick={()=>setModal(current.mode==='publishing'||current.mode==='website'?'publish':'create')}><Plus size={16}/>{current.mode==='website'||current.mode==='publishing'?tx.review:tx.add}</button></div></div>
 }
 return <div className={'fpx-root '+(collapsed?'is-collapsed':'')} dir={dir} data-theme={appearance.mode==='system'?(systemDark?'dark':'light'):appearance.mode} data-tone={appearance.accent} data-density={appearance.density} data-corners={appearance.corners} data-font={appearance.font}>
  <aside className="fpx-sidebar">{sidebar()}</aside>
  <div className="fpx-frame">
   <header className="fpx-header"><button type="button" className="fpx-icon-button fpx-menu-mobile" onClick={()=>setMobileMenu(true)} aria-label={tx.menu}><Menu size={22}/></button>
    <div className="fpx-breadcrumb"><span>FAJR PARSA</span><ChevronRight size={14}/><strong>{label}</strong></div>
    <div className="fpx-header-actions">
      <label className="fpx-global-search"><Search size={17}/><Input aria-label={tx.search} placeholder={tx.search+'   Ctrl+K'} ref={searchRef} value={query} onChange={e=>setQuery(e.target.value)}/></label>
      <label className="fpx-lang-switch"><Languages size={17}/><select aria-label={tx.changeLanguage} value={lang} onChange={e=>setLang(e.target.value as AdminLanguage)}>{adminLanguages.map(l=><option key={l.id} value={l.id}>{l.label}</option>)}</select></label>
      <button type="button" className="fpx-icon-button" onClick={()=>go('notifications')} title={tx.notifications}><Bell size={19}/></button>
      <button type="button" className="fpx-avatar" onClick={()=>go('permissions')} aria-label={tx.role}>FP</button>
    </div>
   </header>
   <main className="fpx-main">
    <div className="fpx-warning"><span className="fpx-warning-label"><Eye size={15}/>{tx.mode}</span><span>{tx.demoOnly}</span><span className="fpx-warning-lock"><LockKeyhole size={14}/>{tx.production}</span></div>
    {featureHeader()}
    {featureId==='resources'?<ResourceCenter lang={lang} resources={resources} onResources={setResources} onToast={toast}/>:featureId==='designsystem'?<ThemeLab lang={lang} value={appearance} onChange={setAppearance}/>:isCustom?<CustomModule name={label} lang={lang} tx={tx} onAdd={()=>setModal('create')}/>:current.mode==='dashboard'?<OverviewPage tx={tx} lang={lang} onGo={go}/>:current.mode==='website'?<WebsitePage tx={tx} lang={lang} publicLang={publicLang} setPublicLang={setPublicLang} onReview={()=>setModal('publish')} current={current}/>:current.mode==='builder'||current.mode==='workspace'?<BuilderPage tx={tx} lang={lang} current={current} onAdd={()=>setModal('create')} onGo={go}/>:current.mode==='connectors'?<ConnectorsPage tx={tx}/>:current.mode==='permissions'?<RolesPage tx={tx} lang={lang}/>:current.mode==='developer'?<DevPage tx={tx} current={current}/>:current.mode==='publishing'?<PublishingPage tx={tx} current={current} onReview={()=>setModal('publish')}/>:current.mode==='reports'?<ReportPage tx={tx} current={current}/>:current.mode==='media'?<MediaPage tx={tx} onReview={()=>setModal('create')}/>:<RecordsPage tx={tx} lang={lang} current={current} query={rowQuery} setQuery={setRowQuery} onAdd={()=>setModal('create')}/>}
    <footer className="fpx-footer"><span>{tx.builtBy} · MIT</span><span>Fajr Parsa · QA Admin Preview V4</span></footer>
   </main>
  </div>
  <nav className="fpx-mobile-tabs" aria-label={tx.menu}>{[
    {id:'overview',name:tx.overview,icon:LayoutDashboard},
    {id:'resources',name:lang==='fa'?'منابع':'Resources',icon:Layers},
    {id:'website',name:tx.website,icon:Globe2},
    {id:'appbuilder',name:tx.console,icon:Blocks},
    {id:'more',name:tx.more,icon:MoreHorizontal}
  ].map(item=><button key={item.id} aria-current={featureId===item.id?'page':undefined} className={featureId===item.id?'active':''} onClick={()=>item.id==='more'?setMobileMenu(true):go(item.id)} type="button"><item.icon size={19}/><span>{item.name}</span></button>)}</nav>
  {mobileMenu&&<div className="fpx-drawer-cover" onClick={()=>setMobileMenu(false)}><aside className="fpx-mobile-drawer" onClick={e=>e.stopPropagation()} role="dialog" aria-modal="true" aria-label={tx.all}><div className="fpx-drawer-head"><strong>{tx.all} · {totalFeatures}</strong><button type="button" aria-label={tx.close} onClick={()=>setMobileMenu(false)}><X size={18}/></button></div><div className="fpx-drawer-list">{groups.map(g=><div key={g.id}><h3>{g.name[lang]}</h3>{features.filter(f=>f.group===g.id).map(f=><button key={f.id} onClick={()=>go(f.id)} type="button"><Icon name={f.icon} size={17}/>{f.label[lang]}</button>)}</div>)}</div></aside></div>}
  <Dialog.Root open={modal!==null} onOpenChange={open=>{if(!open)setModal(null)}}>
   <Dialog.Portal><Dialog.Overlay className="fpx-dialog-overlay"/><Dialog.Content className="fpx-dialog">
    <Dialog.Title>{modal==='publish'?tx.publishingModal:modal==='workspace'?tx.createWorkspace:tx.createModule}</Dialog.Title>
    <Dialog.Description>{modal==='publish'?tx.pubModalBody:tx.onlyDesign}</Dialog.Description>
    {modal==='publish'?<div className="fpx-review-list"><div><ShieldCheck size={17}/>{tx.verify} — fa / ps / en / ar</div><div><History size={17}/>{tx.audit}</div><div><LockKeyhole size={17}/>{tx.production}</div></div>:<div className="fpx-creator"><label>{tx.template}</label><div className="fpx-template-grid">{buildingBlocks.map((b,i)=><button key={i} type="button" className={chosenBlock===i?'active':''} onClick={()=>setChosenBlock(i)}><Icon name={b.icon}/><span>{b[lang]}</span></button>)}</div><label>{tx.moduleTitle}<Input value={moduleName} maxLength={40} placeholder={tx.moduleName} onChange={e=>setModuleName(e.target.value)}/></label></div>}
    <div className="fpx-dialog-actions"><Dialog.Close asChild><button type="button" className="fpx-outline">{tx.cancel}</button></Dialog.Close><button type="button" className="fpx-filled" onClick={()=>{
     if(modal==='publish'){toast(tx.notPublished)}
     else {const name=moduleName.trim()||buildingBlocks[chosenBlock][lang];setCustom(arr=>arr.includes(name)?arr:[...arr,name]);setModuleName('');toast(tx.added);go('demo-'+name)}
     setModal(null)
    }}>{modal==='publish'?tx.approval:tx.previewAdd}</button></div>
   </Dialog.Content></Dialog.Portal>
  </Dialog.Root>
  {notice&&<div className="fpx-toast" role="status"><span>{notice}</span><button type="button" onClick={()=>setNotice('')} aria-label={tx.close}><X size={14}/></button></div>}
 </div>
}
type Tx=Texts
function Status({tx}:{tx:Tx}){return <span className="fpx-status"><i/>{tx.pending}</span>}
function Stat({title,tx,icon}:{title:string;tx:Tx;icon:string}){return <Card className="fpx-stat"><CardHeader className="fpx-stat-title"><div><p>{title}</p><strong>—</strong></div><span><Icon name={icon}/></span></CardHeader><CardContent><small>{tx.noLive}</small></CardContent></Card>}
function OverviewPage({tx,lang,onGo}:{tx:Tx;lang:AdminLanguage;onGo:(id:string)=>void}){
 return <div className="fpx-section-stack"><div className="fpx-stats">{[
   ['requests',tx.requests,'inbox'],['customers',tx.members,'users'],
   ['website',tx.content,'globe'],['integrations',tx.integrations,'plug']
 ].map(([id,name,icon])=><Stat key={id} title={name} tx={tx} icon={icon}/>)}</div>
 <div className="fpx-two"><Card className="fpx-panel"><CardHeader><div className="fpx-panel-head"><div><CardTitle>{tx.quick}</CardTitle><CardDescription>{tx.onlyDesign}</CardDescription></div><Layers size={20}/></div></CardHeader><CardContent><div className="fpx-shortcuts">{['resources','website','requests','customers','inbox','appbuilder'].map(id=><button key={id} type="button" onClick={()=>onGo(id)}><Icon name={byId(id).icon}/><span>{byId(id).label[lang]}</span><ArrowUpRight size={15}/></button>)}</div></CardContent></Card>
 <Card className="fpx-panel"><CardHeader><CardTitle>{tx.activity}</CardTitle><CardDescription>{tx.none}</CardDescription></CardHeader><CardContent><div className="fpx-empty"><ClockIcon/><strong>{tx.noLive}</strong><span>{tx.demoOnly}</span></div></CardContent></Card></div>
 <Card className="fpx-panel"><CardHeader><CardTitle>{tx.all} · {totalFeatures}</CardTitle><CardDescription>{tx.ownerSetting}</CardDescription></CardHeader><CardContent><div className="fpx-category-grid">{groups.map(g=><button key={g.id} type="button" onClick={()=>onGo(features.find(f=>f.group===g.id)!.id)}><Icon name={g.icon} size={21}/><span>{g.name[lang]}</span><strong>{features.filter(f=>f.group===g.id).length}</strong></button>)}</div></CardContent></Card>
 </div>
}
function ClockIcon(){return <CalendarDays size={28}/>}
function RecordsPage({tx,lang,current,query,setQuery,onAdd}:{tx:Tx;lang:AdminLanguage;current:Feature;query:string;setQuery:(x:string)=>void;onAdd:()=>void}){
 const [selected,setSelected]=useState<string|null>(null)
 const found=dummyRows.filter(r=>(r.label[lang]+' '+r.id).toLowerCase().includes(query.toLowerCase()))
 return <div className="fpx-section-stack"><Card className="fpx-panel"><CardHeader><div className="fpx-panel-head"><div><CardTitle>{current.label[lang]}</CardTitle><CardDescription>{current.description[lang]} · {tx.sample}</CardDescription></div><Status tx={tx}/></div></CardHeader>
 <CardContent><div className="fpx-table-toolbar"><label><Search size={16}/><Input placeholder={tx.searchRecords} value={query} onChange={e=>setQuery(e.target.value)}/></label><button type="button" onClick={onAdd}><Plus size={16}/>{tx.new}</button><button type="button" className="fpx-outline" onClick={()=>setQuery('')}><Filter size={16}/>{tx.filter}</button></div>
 <Table><TableHeader><TableRow><TableHead>{tx.number}</TableHead><TableHead>{tx.records}</TableHead><TableHead>{tx.status}</TableHead><TableHead>{tx.details}</TableHead></TableRow></TableHeader><TableBody>{found.map(row=><TableRow key={row.id}><TableCell dir="ltr" className="fpx-mono">{row.id}</TableCell><TableCell>{row.label[lang]}</TableCell><TableCell><Status tx={tx}/></TableCell><TableCell><button type="button" className="fpx-link" onClick={()=>setSelected(row.id)}>{tx.view}<ChevronLeft size={14}/></button></TableCell></TableRow>)}</TableBody></Table>
 {found.length===0&&<div className="fpx-empty">{tx.none}</div>}</CardContent></Card>
 {selected&&<Card className="fpx-panel"><CardHeader><CardTitle>{tx.details} · {selected}</CardTitle></CardHeader><CardContent><p>{tx.demoOnly}</p><button className="fpx-outline" type="button" onClick={()=>setSelected(null)}>{tx.close}</button></CardContent></Card>}
 </div>
}
function WebsitePage({tx,lang,publicLang,setPublicLang,onReview,current}:{tx:Tx;lang:AdminLanguage;publicLang:PublicLang;setPublicLang:(x:PublicLang)=>void;onReview:()=>void;current:Feature}){
 const [tab,setTab]=useState('pages')
 const tabs=['pages','brand','media','offers','seo','translations','publishing']
 const labels:{[key:string]:{fa:string;en:string}}={
 pages:{fa:'صفحات و منوها',en:'Pages & navigation'},brand:{fa:'برند',en:'Brand'},
 media:{fa:'رسانه و عکس',en:'Media'},offers:{fa:'آفر و اعلان',en:'Offers'},
 seo:{fa:'سئو',en:'SEO'},translations:{fa:'چهار زبان سایت',en:'4 website languages'},
 publishing:{fa:'نشر و تاریخچه',en:'Publishing & history'}}
 const page=siteText[publicLang]
 return <div className="fpx-section-stack"><div className="fpx-subtabs" role="tablist" aria-label={tx.content}>{tabs.map(id=><button role="tab" aria-selected={tab===id} type="button" key={id} onClick={()=>setTab(id)} className={tab===id?'active':''}>{labels[id][lang]}</button>)}</div>
 <div className="fpx-website-grid"><Card className="fpx-panel"><CardHeader><CardTitle>{labels[tab][lang]}</CardTitle><CardDescription>{tx.draft} · {tx.onlyDesign}</CardDescription></CardHeader><CardContent><div className="fpx-structure">
 {[
  [tx.siteBrand,'panels-top-left'],[tx.siteMedia,'images'],[tx.offers,'tags'],[tx.faq,'clipboard-list'],[tx.publicLanguage,'languages']
 ].map(([name,icon])=><button key={name} type="button" onClick={()=>setTab(icon==='images'?'media':icon==='tags'?'offers':icon==='languages'?'translations':'pages')}><Icon name={icon}/><span>{name}</span><ChevronLeft size={15}/></button>)}</div>
 <div className="fpx-locked-hint"><ShieldCheck size={18}/>{tx.publisher}</div>
 <button className="fpx-filled fpx-full" type="button" onClick={onReview}><Eye size={17}/>{tx.review}</button></CardContent></Card>
 <Card className="fpx-panel fpx-website-card"><CardHeader><div className="fpx-panel-head"><div><CardTitle>{tx.preview}</CardTitle><CardDescription>{tx.previewFrame}</CardDescription></div><label className="fpx-site-language"><Languages size={15}/><select aria-label={tx.publicLanguage} value={publicLang} onChange={e=>setPublicLang(e.target.value as PublicLang)}>{publicLanguages.map(x=><option key={x} value={x}>{x==='fa'?'دری':x==='ps'?'پښتو':x==='en'?'English':'العربية'}</option>)}</select></label></div></CardHeader><CardContent><div className="fpx-browser"><div className="fpx-browser-top"><i/><i/><i/><span>fajr-parsa / {publicLang} · {tx.sample}</span><LockKeyhole size={13}/></div><div className="fpx-public" lang={publicLang} dir={publicLang==='en'?'ltr':'rtl'}><div className="fpx-public-nav"><strong>FAJR<span>PARSA</span></strong><div>{page.nav.map(x=><span key={x}>{x}</span>)}</div></div><section className="fpx-public-hero"><span>FAJR PARSA · AFGHANISTAN</span><h2>{page.hero}</h2><p>{page.sub}</p><span className="fpx-public-cta">{page.cta}<ArrowUpRight size={14}/></span></section><div className="fpx-public-cards">{[Plane,Globe2,ShieldCheck].map((Icon,i)=><div key={i}><Icon size={20}/><span>{i===0?page.card:i===1?page.cta:page.sub}</span></div>)}</div></div></div></CardContent></Card></div>
 <p className="fpx-note">{tx.publicNote}</p>
 </div>
}
function BuilderPage({tx,lang,current,onAdd,onGo}:{tx:Tx;lang:AdminLanguage;current:Feature;onAdd:()=>void;onGo:(id:string)=>void}){
 return <div className="fpx-section-stack"><div className="fpx-builder-head"><div><h2>{tx.customTitle}</h2><p>{tx.onlyDesign}</p></div><button type="button" className="fpx-filled" onClick={onAdd}><Plus size={16}/>{tx.createModule}</button></div>
 <div className="fpx-builder-grid">{buildingBlocks.map((block,i)=><Card key={i} className="fpx-builder-card"><CardHeader><span className="fpx-template-icon"><Icon name={block.icon} size={24}/></span><CardTitle>{block[lang]}</CardTitle></CardHeader><CardContent><p>{tx.planned}</p><button type="button" onClick={onAdd}>{tx.previewAdd}<ArrowUpRight size={15}/></button></CardContent></Card>)}</div>
 <Card className="fpx-panel"><CardHeader><CardTitle>{tx.apps}</CardTitle><CardDescription>{tx.onlyDesign}</CardDescription></CardHeader><CardContent><div className="fpx-category-grid">{groups.map(g=><button key={g.id} type="button" onClick={()=>onGo(features.find(f=>f.group===g.id)!.id)}><Icon name={g.icon}/><span>{g.name[lang]}</span><strong>{features.filter(f=>f.group===g.id).length}</strong></button>)}</div></CardContent></Card></div>
}
function ConnectorsPage({tx}:{tx:Tx}){
 return <div className="fpx-section-stack"><p className="fpx-note">{tx.integrationsNote}</p><div className="fpx-connectors">{connectors.map(name=><Card className="fpx-connector-card" key={name}><CardHeader><div className="fpx-panel-head"><span className="fpx-connector-icon"><Plug size={20}/></span><Status tx={tx}/></div><CardTitle>{name}</CardTitle></CardHeader><CardContent><p>{tx.connected}</p><div className="fpx-note">{tx.noAction}</div></CardContent></Card>)}</div></div>
}
function RolesPage({tx,lang}:{tx:Tx;lang:AdminLanguage}){
 return <div className="fpx-two"><Card className="fpx-panel"><CardHeader><CardTitle>{tx.roleControls}</CardTitle><CardDescription>{tx.noProduction}</CardDescription></CardHeader><CardContent><div className="fpx-role-list">{roleLabels.map((label,i)=><div key={i}><span className="fpx-small-avatar">{i+1}</span><div><strong>{label[lang]}</strong><small>{tx.onlyDesign}</small></div><LockKeyhole size={15}/></div>)}</div></CardContent></Card>
 <Card className="fpx-panel"><CardHeader><CardTitle>{tx.audit}</CardTitle><CardDescription>{tx.noLive}</CardDescription></CardHeader><CardContent><div className="fpx-empty"><ShieldCheck size={28}/><strong>{tx.noApproved}</strong><span>{tx.hideKey}</span></div></CardContent></Card></div>
}
function DevPage({tx,current}:{tx:Tx;current:Feature}){
 return <div className="fpx-two"><Card className="fpx-panel"><CardHeader><CardTitle>{tx.devConsole}</CardTitle><CardDescription>{current.description.en}</CardDescription></CardHeader><CardContent>{['GitHub','Cloudflare Workers','Supabase PostgreSQL','Preview / Production gate'].map(x=><div className="fpx-system-row" key={x}><Code2 size={17}/><span>{x}</span><Status tx={tx}/></div>)}</CardContent></Card>
 <Card className="fpx-panel"><CardHeader><CardTitle>{tx.security}</CardTitle></CardHeader><CardContent><div className="fpx-empty"><LockKeyhole size={27}/><strong>{tx.hideKey}</strong><span>{tx.noProduction}</span></div></CardContent></Card></div>
}
function PublishingPage({tx,current,onReview}:{tx:Tx;current:Feature;onReview:()=>void}){
 return <Card className="fpx-panel"><CardHeader><CardTitle>{tx.release}</CardTitle><CardDescription>{current.description.en}</CardDescription></CardHeader><CardContent><div className="fpx-steps">{[tx.draft,tx.verify,tx.review,tx.publisher,tx.audit].map((title,i)=><div key={title}><span>{i+1}</span><strong>{title}</strong><Status tx={tx}/></div>)}</div><div className="fpx-locked-hint"><LockKeyhole size={17}/>{tx.production}</div><button className="fpx-filled" type="button" onClick={onReview}><ShieldCheck size={17}/>{tx.review}</button></CardContent></Card>
}
function ReportPage({tx,current}:{tx:Tx;current:Feature}){
 return <div className="fpx-two"><Card className="fpx-panel"><CardHeader><CardTitle>{current.label.fa}</CardTitle><CardDescription>{tx.noLive}</CardDescription></CardHeader><CardContent><div className="fpx-chart-placeholder">{[35,60,42,78,55,67,88,50,72].map((x,i)=><div key={i} style={{height:x+'%'}}/>)}</div><p className="fpx-note">{tx.sample}</p></CardContent></Card><Card className="fpx-panel"><CardHeader><CardTitle>{tx.records}</CardTitle></CardHeader><CardContent><div className="fpx-empty"><FileChartColumn size={28}/><strong>{tx.none}</strong><span>{tx.demoOnly}</span></div></CardContent></Card></div>
}
function MediaPage({tx,onReview}:{tx:Tx;onReview:()=>void}){
 return <Card className="fpx-panel"><CardHeader><CardTitle>{tx.siteMedia}</CardTitle><CardDescription>{tx.onlyDesign}</CardDescription></CardHeader><CardContent><div className="fpx-media-grid">{['16:9','1:1','9:16','A4','16:9','1:1'].map((x,i)=><button type="button" onClick={onReview} key={i}><Images size={27}/><span>{x}</span></button>)}</div></CardContent></Card>
}
function CustomModule({name,tx,onAdd}:{name:string;lang:AdminLanguage;tx:Tx;onAdd:()=>void}){
 return <Card className="fpx-panel"><CardHeader><CardTitle>{name}</CardTitle><CardDescription>{tx.added}</CardDescription></CardHeader><CardContent><p>{tx.onlyDesign}</p><button className="fpx-filled" type="button" onClick={onAdd}><Plus size={16}/>{tx.add}</button></CardContent></Card>
}
