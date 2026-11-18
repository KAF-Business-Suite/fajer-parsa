import {useEffect,useMemo,useState} from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import {Globe2,AppWindow,Files,Plug2,Plus,Search,ArrowLeft,ArrowRight,ShieldCheck,ShieldAlert,Unplug,RefreshCw,LockKeyhole,CheckCircle2,ExternalLink,ChevronLeft,ChevronRight,Layers3,SlidersHorizontal,X,Trash2,FileText,Image,Settings2,History,Activity,Palette,Sun,Moon,Check,LayoutGrid} from 'lucide-react'
import {Card,CardContent,CardHeader,CardTitle} from './oss/card'
import {Input} from './oss/input'
import {addBookmark,detachFromConsole,relinkInConsole,previewSeed} from './resource-registry'
import type {PreviewResource,ResourceKind,Provider} from './resource-registry'
import './resource-center.css'
import {isPrivateOfficeConsole,readOwnerPagesMetadata} from './private-office-bridge'
import type {ReadResult} from './private-office-bridge'

type L='fa'|'en'
type ResourceProps={
 lang:L;resources:PreviewResource[];onResources:(x:PreviewResource[])=>void;
 onToast:(text:string)=>void;
}
export type PreviewStyle={mode:'light'|'dark'|'system';accent:'jade'|'ocean'|'champagne';density:'comfortable'|'compact';corners:'rounded'|'extra';font:'estedad'}
export const defaultStyle:PreviewStyle={mode:'light',accent:'champagne',density:'comfortable',corners:'rounded',font:'estedad'}
const copy={
 fa:{
  title:'منابع و سایت‌های من',sub:'تمام سایت‌ها، اپلیکیشن‌ها و منابع زیر یک کنسول؛ بدون انتقال مالکیت.',
  preview:'نسخهٔ نمایشی — اتصال به حساب‌ها هنوز انجام نشده است',search:'جستجوی منابع',
  all:'همه',website:'وب‌سایت‌ها',application:'اپلیکیشن‌ها',document:'اسناد',integration:'اتصالات',
  add:'افزودن منبع',choose:'نوع منبع',resourceName:'نام منبع',address:'آدرس کامل https',
  provider:'سرویس ارائه‌کننده',workspace:'فضای کاری',create:'افزودن به کنسول',
  cancel:'انصراف',close:'بستن',back:'بازگشت',details:'جزئیات منبع',empty:'منبعی در این دسته وجود ندارد.',
  bookmark:'فقط به‌صورت لینک ثبت شده',disconnected:'از کنسول جدا شده',noOwner:'مالکیت و اختیار ویرایش هنوز تأیید نشده است.',
  readOnly:'فقط مشاهدهٔ عمومی',notConnected:'اتصال مدیریتی فعال نیست',check:'اتصال رسمی',
  checkInfo:'برای مدیریت واقعی، نخست باید مجوز رسمی سرویس‌دهنده تأیید شود. ورود و کلیدها در این نمونه درخواست نمی‌شوند.',
  actions:'امکانات این منبع',view:'دیدن صفحهٔ عمومی',pages:'صفحات و منوها',media:'رسانه و عکس',content:'خبرها و پیشنهادها',integrations:'اتصالات',publish:'نشر و نسخه‌ها',
  locked:'تا تأیید مجوز غیرفعال',remove:'جداکردن از کنسول',reconnect:'بازافزودن به فهرست',showDetached:'نمایش جداشده‌ها',
  confirmTitle:'جداکردن این منبع از فهرست؟',confirmBody:'تنها ارتباط نمایشی آن با کنسول قطع می‌شود. سایت، دامنه، عکس‌ها، دیتابیس و مخزن واقعی حذف نمی‌شوند.',
  confirm:'فقط از کنسول جدا شود',added:'منبع به فهرست نمایشی اضافه شد.',removed:'منبع از فهرست کنسول جدا شد؛ سایت واقعی دست‌نخورده است.',restored:'منبع دوباره به فهرست نمایشی برگشت.',
  invalidName:'نام باید بین ۲ تا ۷۵ حرف باشد.',invalidUrl:'یک لینک HTTPS عمومی و معتبر وارد کنید.',duplicate:'این لینک از قبل در فهرست فعال موجود است.',
  safeUrl:'لینک به‌تنهایی دسترسی مدیریتی ایجاد نمی‌کند.',connect:'اتصال مدیریتی نیازمند تأیید رسمی مجوزها است.',
  sample:'نمونهٔ ساختگی',keep:'برگشت‌پذیر',websiteSection:'مدیریت محتوای سایت',future:'آماده برای اتصال در مراحل بعدی',
  status:'وضعیت',scope:'سطح دسترسی',type:'دسته',tools:'امکانات',live:'دادهٔ زنده: ندارد',
  samples:'منابع نمونه',counts:'تعداد منابع در فهرست',click:'برای جزئیات انتخاب کنید',
 },
 en:{
  title:'My sites & resources',sub:'Websites, apps and documents in one owner-controlled console, without transferring ownership.',
  preview:'Design preview — provider connections not yet enabled',search:'Search resources',
  all:'All',website:'Websites',application:'Applications',document:'Documents',integration:'Integrations',
  add:'Add resource',choose:'Resource type',resourceName:'Resource name',address:'Full HTTPS address',
  provider:'Provider',workspace:'Workspace',create:'Add to console',cancel:'Cancel',close:'Close',back:'Back',
  details:'Resource details',empty:'No resources in this category.',bookmark:'Bookmark only',disconnected:'Detached from console',
  noOwner:'Ownership and edit permission are not verified.',readOnly:'Public-view only',notConnected:'Management connection not active',
  check:'Official connection',checkInfo:'To manage content, first verify authorization with the provider. No passwords or API keys are requested in this demo.',
  actions:'Resource capabilities',view:'Open public website',pages:'Pages & navigation',media:'Media & images',content:'News & promotions',
  integrations:'Integrations',publish:'Publishing & revisions',locked:'Locked until authorization',
  remove:'Detach from console',reconnect:'Restore to list',showDetached:'Show detached resources',
  confirmTitle:'Detach this resource from the console?',confirmBody:'Only its demo association is removed. The actual site, domain, media, database and repository will not be deleted.',
  confirm:'Detach listing only',added:'Resource added to demo list.',removed:'Detached from console. No real site changed.',restored:'Resource restored to demo list.',
  invalidName:'Use a name between 2 and 75 characters.',invalidUrl:'Enter a valid public HTTPS URL.',duplicate:'This URL already has an active listing.',
  safeUrl:'A URL alone does not grant management rights.',connect:'Official provider authorization is required.',
  sample:'Synthetic example',keep:'Reversible',websiteSection:'Website content management',future:'Ready for later integration',
  status:'Status',scope:'Access scope',type:'Type',tools:'Capabilities',live:'Live data: none',samples:'Example resources',
  counts:'Listed resources',click:'Select for details',
 }
}
const types:{id:ResourceKind;icon:typeof Globe2}[]=[
 {id:'website',icon:Globe2},{id:'application',icon:AppWindow},{id:'document',icon:Files},{id:'integration',icon:Plug2}
]
const available:Provider[]=['Cloudflare','Vercel','WordPress','Other']
const capabilityKeys=['pages','media','content','integrations','publish'] as const

export function ResourceCenter({lang,resources,onResources,onToast}:ResourceProps){
 const tx=copy[lang],dir=lang==='en'?'ltr':'rtl'
 const [tab,setTab]=useState<'all'|ResourceKind>('all')
 const [query,setQuery]=useState('')
 const [includeDetached,setIncludeDetached]=useState(false)
 const [selected,setSelected]=useState<string|null>(null)
 const [addOpen,setAddOpen]=useState(false)
 const [confirmOpen,setConfirmOpen]=useState(false)
 const [kind,setKind]=useState<ResourceKind>('website')
 const [provider,setProvider]=useState<Provider>('Cloudflare')
 const [workspace,setWorkspace]=useState('Fajr Parsa')
 const [name,setName]=useState('')
 const [url,setUrl]=useState('')
 const [error,setError]=useState('')
 const details=resources.find(x=>x.id===selected)
 const shown=useMemo(()=>resources.filter(r=>
  (tab==='all'||r.kind===tab)&&
  (includeDetached||r.status==='bookmark')&&
  (r.name+' '+r.provider+' '+r.url).toLowerCase().includes(query.trim().toLowerCase())
 ),[resources,tab,includeDetached,query])
 const normal=resources.filter(r=>r.status==='bookmark').length
 const privateMode=isPrivateOfficeConsole(window.location)
 const [liveRead,setLiveRead]=useState<ReadResult>({status:'unavailable',data:null})
 const [refreshing,setRefreshing]=useState(false)
 const [readCount,setReadCount]=useState(0)
 useEffect(()=>{
  if(!privateMode)return
  let active=true
  setRefreshing(true)
  readOwnerPagesMetadata().then(result=>{if(active)setLiveRead(result)}).finally(()=>{if(active)setRefreshing(false)})
  return()=>{active=false}
 },[privateMode,readCount])
 useEffect(()=>{
  function onBack(){setSelected(null);setAddOpen(false);setConfirmOpen(false)}
  window.addEventListener('popstate',onBack)
  return()=>window.removeEventListener('popstate',onBack)
 },[])
 const openItem=(id:string)=>{if(selected!==id){window.history.pushState({fpResourceDetail:id},'');setSelected(id)}}
 const closeDetail=()=>{if(window.history.state?.fpResourceDetail)window.history.back();else setSelected(null)}
 const add=()=>{
  const result=addBookmark(resources,{name,url,provider,kind,workspace})
  if(result.error){setError(tx[result.error==='invalid_name'?'invalidName':result.error==='invalid_url'?'invalidUrl':'duplicate']);return}
  onResources(result.items);setName('');setUrl('');setError('');setAddOpen(false);onToast(tx.added)
  if(result.id)openItem(result.id)
 }
 const detach=()=>{
  if(!details)return
  onResources(detachFromConsole(resources,details.id));setConfirmOpen(false);setSelected(null)
  if(window.history.state?.fpResourceDetail)window.history.back()
  onToast(tx.removed)
 }
 const restore=()=>{if(!details)return;onResources(relinkInConsole(resources,details.id));onToast(tx.restored)}
 return <div className="fpx-resource-root" dir={dir}>
  {privateMode&&<section className="fpx-live-resource" aria-label={lang==='fa'?'اتصال تأییدشدهٔ دفتر':'Verified office connection'}>
   <div className="fpx-live-resource-head"><ShieldCheck size={19}/><strong>{lang==='fa'?'اتصال واقعی دفتر خصوصی':'Private office verified connection'}</strong><button type="button" disabled={refreshing} onClick={()=>setReadCount(n=>n+1)}><RefreshCw size={16}/>{lang==='fa'?'بررسی دوباره':'Recheck'}</button></div>
   {refreshing?<p role="status">{lang==='fa'?'در حال بررسی مجوز و اتصال…':'Checking authorization and connection…'}</p>:liveRead.status==='connected'?<div className="fpx-live-resource-ok"><strong>{liveRead.data.name} · Cloudflare Pages</strong><p>{lang==='fa'?'فقط مشاهدهٔ تأییدشده؛ ویرایش و نشر فعال نیست':'Verified read-only; editing and publishing are not enabled'}</p><small dir="ltr">{liveRead.data.url} · {liveRead.data.productionBranch}</small></div>:<p role="status">{liveRead.status==='access_denied'?(lang==='fa'?'این حساب مجوز مالک برای خواندن منابع را ندارد.':'Owner permission is required to inspect resources.'):liveRead.status==='sign_in_required'?(lang==='fa'?'برای بررسی وارد دفتر شوید.':'Please sign in to the office.'):(lang==='fa'?'اتصال فعلاً قابل تأیید نیست؛ دادهٔ ساختگی را واقعی تلقی نکنید.':'Connection not verified; demo items are not live resources.')}</p>}
   <p className="fpx-live-resource-note">{lang==='fa'?'فهرست پایین هنوز نمایشی و غیردائمی است.':'The list below remains synthetic and is not saved.'}</p>
  </section>}
  {details?<div className="fpx-resource-detail">
   <button className="fpx-resource-back" type="button" onClick={closeDetail}>{lang==='fa'?<ArrowRight size={18}/>:<ArrowLeft size={18}/>} {tx.back}</button>
   <Card className="fpx-resource-detail-card">
    <CardHeader><div className="fpx-resource-detail-head"><span className="fpx-resource-icon"><IconFor kind={details.kind}/></span><div><p>{tx.details}</p><CardTitle>{details.name}</CardTitle><small dir="ltr">{details.url}</small></div></div></CardHeader>
    <CardContent><div className="fpx-resource-pills">
     <span className="fpx-resource-state"><i/>{details.status==='detached'?tx.disconnected:tx.bookmark}</span>
     <span>{details.provider}</span><span>{details.workspace}</span></div>
     <div className="fpx-resource-warning"><ShieldAlert size={19}/><span>{tx.noOwner} {tx.safeUrl}</span></div>
     <div className="fpx-resource-meta"><div><strong>{tx.type}</strong><span>{tx[details.kind]}</span></div><div><strong>{tx.scope}</strong><span>{tx.readOnly}</span></div><div><strong>{tx.status}</strong><span>{details.status==='detached'?tx.disconnected:tx.notConnected}</span></div></div>
    </CardContent>
   </Card>
   <Card className="fpx-resource-detail-card">
     <CardHeader><CardTitle>{tx.actions}</CardTitle></CardHeader>
     <CardContent><div className="fpx-resource-capabilities">{capabilityKeys.map(key=><div key={key}><LockKeyhole size={16}/><span>{tx[key]}</span><small>{tx.locked}</small></div>)}</div>
       <div className="fpx-resource-connection"><ShieldCheck size={18}/><div><strong>{tx.check}</strong><p>{tx.checkInfo}</p></div></div>
       <div className="fpx-resource-actions">
        {details.status==='detached'?<button className="fpx-resource-primary" onClick={restore} type="button"><RefreshCw size={17}/>{tx.reconnect}</button>:<button className="fpx-resource-quiet" type="button" onClick={()=>setConfirmOpen(true)}><Unplug size={17}/>{tx.remove}</button>}
       </div>
     </CardContent>
   </Card>
  </div>:<>
   <div className="fpx-resource-summary"><div><span className="fpx-resource-kicker">CONTROL / RESOURCES</span><h2>{tx.title}</h2><p>{tx.sub}</p></div><button type="button" className="fpx-resource-primary" onClick={()=>setAddOpen(true)}><Plus size={17}/>{tx.add}</button></div>
   <div className="fpx-resource-stats"><div><Layers3 size={18}/><strong>{normal}</strong><span>{tx.counts}</span></div><div><LockKeyhole size={18}/><strong>{tx.readOnly}</strong><span>{tx.noOwner}</span></div></div>
   <div className="fpx-resource-panel">
    <div className="fpx-resource-segments" role="tablist" aria-label={tx.type}>
      {[{id:'all' as const,icon:LayoutGrid},...types].map(({id,icon:Icon})=><button key={id} type="button" role="tab" aria-selected={tab===id} onClick={()=>setTab(id)}><Icon size={17}/>{tx[id]}</button>)}
    </div>
    <div className="fpx-resource-toolbar"><label><Search size={17}/><Input value={query} onChange={e=>setQuery(e.target.value)} placeholder={tx.search} aria-label={tx.search}/></label>
    <label className="fpx-resource-check"><input type="checkbox" checked={includeDetached} onChange={e=>setIncludeDetached(e.target.checked)}/>{tx.showDetached}</label></div>
    <div className="fpx-resource-list">{shown.map(item=><button key={item.id} type="button" className="fpx-resource-entry" onClick={()=>openItem(item.id)}>
      <span className="fpx-resource-icon"><IconFor kind={item.kind}/></span>
      <span className="fpx-resource-label"><strong>{item.name}</strong><small>{item.provider} · {item.workspace}</small><small className="fpx-resource-domain" dir="ltr">{item.url}</small></span>
      <span className="fpx-resource-end"><span className={item.status==='detached'?'detached':'bookmark'}>{item.status==='detached'?tx.disconnected:tx.bookmark}</span>{lang==='fa'?<ChevronLeft size={17}/>:<ChevronRight size={17}/>}</span>
    </button>)}
    {!shown.length&&<div className="fpx-resource-empty"><Globe2 size={27}/><p>{tx.empty}</p><button type="button" onClick={()=>setAddOpen(true)}>{tx.add}</button></div>}
    </div>
   </div>
   <p className="fpx-resource-footnote"><ShieldCheck size={16}/>{tx.preview}</p>
  </>}
  <Dialog.Root open={addOpen} onOpenChange={v=>{setAddOpen(v);setError('')}}><Dialog.Portal>
    <Dialog.Overlay className="fpx-dialog-overlay"/>
    <Dialog.Content className="fpx-dialog fpx-resource-dialog" dir={dir}>
     <Dialog.Title>{tx.add}</Dialog.Title>
     <Dialog.Description>{tx.safeUrl}</Dialog.Description>
     <div className="fpx-resource-form">
       <fieldset><legend>{tx.choose}</legend><div className="fpx-resource-typegrid">{types.map(({id,icon:Icon})=><button key={id} className={kind===id?'active':''} type="button" onClick={()=>setKind(id)}><Icon size={18}/><span>{tx[id]}</span></button>)}</div></fieldset>
       <label>{tx.resourceName}<Input value={name} onChange={e=>setName(e.target.value)} name="resourceName" maxLength={75} autoComplete="off"/></label>
       <label>{tx.address}<Input value={url} onChange={e=>setUrl(e.target.value)} name="resourceUrl" inputMode="url" dir="ltr" placeholder="https://example.com" autoComplete="url"/></label>
       <div className="fpx-resource-two"><label>{tx.provider}<select value={provider} onChange={e=>setProvider(e.target.value as Provider)}>{available.map(x=><option value={x} key={x}>{x}</option>)}</select></label>
       <label>{tx.workspace}<select value={workspace} onChange={e=>setWorkspace(e.target.value)}><option>Fajr Parsa</option><option>Personal</option></select></label></div>
       {error&&<p className="fpx-resource-error" role="alert">{error}</p>}
     </div>
     <div className="fpx-dialog-actions"><Dialog.Close asChild><button type="button" className="fpx-outline">{tx.cancel}</button></Dialog.Close>
       <button type="button" className="fpx-filled" onClick={add}><Plus size={16}/>{tx.create}</button></div>
    </Dialog.Content>
  </Dialog.Portal></Dialog.Root>
  <Dialog.Root open={confirmOpen} onOpenChange={setConfirmOpen}><Dialog.Portal>
   <Dialog.Overlay className="fpx-dialog-overlay"/>
   <Dialog.Content className="fpx-dialog fpx-resource-dialog" dir={dir}>
     <Dialog.Title>{tx.confirmTitle}</Dialog.Title><Dialog.Description>{tx.confirmBody}</Dialog.Description>
     <div className="fpx-resource-precaution"><ShieldCheck size={22}/><span>{tx.keep}</span></div>
     <div className="fpx-dialog-actions"><Dialog.Close asChild><button className="fpx-outline" type="button">{tx.cancel}</button></Dialog.Close>
     <button className="fpx-resource-primary" type="button" onClick={detach}><Unplug size={16}/>{tx.confirm}</button></div>
   </Dialog.Content>
  </Dialog.Portal></Dialog.Root>
 </div>
}
function IconFor({kind}:{kind:ResourceKind}){const Icon=types.find(x=>x.id===kind)?.icon||Globe2;return <Icon size={21}/>}
type ThemeProps={lang:L;value:PreviewStyle;onChange:(v:PreviewStyle)=>void}
const themes={
 fa:{title:'ظاهر و شخصی‌سازی',sub:'تنظیمات نمونهٔ پنل، بدون تغییر داده‌ها یا سایت عمومی.',
  mode:'حالت نمایش',light:'روشن',dark:'تاریک',system:'سیستم',accent:'رنگ اصلی',jade:'یشمی',ocean:'آبی',champagne:'شامپاینی',density:'تراکم اطلاعات',comfortable:'راحت',compact:'فشرده',
  corners:'گوشه‌ها',rounded:'گرد',extra:'گردتر',font:'فونت رسمی',estedad:'استعداد',sample:'یک هویت شرکتی؛ دو حالت روشن و تاریک.',note:'این ترجیحات ظاهری فقط در همین مرورگر ذخیره می‌شوند؛ با حساب مالک همگام نشده‌اند.'},
 en:{title:'Appearance & personalization',sub:'Preview console settings without touching any business data or public website.',
  mode:'Appearance',light:'Light',dark:'Dark',system:'System',accent:'Accent color',jade:'Jade',ocean:'Ocean',champagne:'Champagne',density:'Information density',comfortable:'Comfortable',compact:'Compact',
  corners:'Corners',rounded:'Rounded',extra:'Extra rounded',font:'Official typography',estedad:'Estedad',sample:'One corporate identity with Light and Dark.',note:'Appearance preferences stay in this browser only; they are not synced to the owner profile.'}
} as const
export function ThemeLab({lang,value,onChange}:ThemeProps){
 const tx=themes[lang]
 const groups:{key:keyof PreviewStyle;items:string[]}[]=[
  {key:'mode',items:['light','dark']},
  {key:'density',items:['comfortable','compact']},{key:'corners',items:['rounded','extra']},
  // FP-TYPE-01: one approved brand font; no switching to inconsistent UI families.
 ]
 return <div className="fpx-resource-root fpx-theme-lab" dir={lang==='en'?'ltr':'rtl'}>
  <div className="fpx-resource-summary"><div><span className="fpx-resource-kicker">CONTROL / DESIGN SYSTEM</span><h2>{tx.title}</h2><p>{tx.sub}</p></div><Palette size={27}/></div>
  <div className="fpx-theme-sections">{groups.map(group=><Card key={group.key} className="fpx-theme-card">
   <CardHeader><CardTitle>{tx[group.key]}</CardTitle></CardHeader>
   <CardContent><div className="fpx-theme-options">{group.items.map(item=><button key={item} type="button" className={value[group.key]===item?'active':''} onClick={()=>onChange({...value,[group.key]:item})}>
    {group.key==='mode'?(item==='light'?<Sun size={16}/>:<Moon size={16}/>):<SlidersHorizontal size={16}/>}
    {tx[item as keyof typeof tx]}{value[group.key]===item&&<Check size={15}/>}
   </button>)}</div></CardContent>
  </Card>)}</div>
  <p className="fpx-resource-footnote"><ShieldCheck size={16}/>{tx.sample} {tx.note}</p>
 </div>
}
