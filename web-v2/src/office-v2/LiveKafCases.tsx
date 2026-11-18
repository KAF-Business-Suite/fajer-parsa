import {useEffect,useState} from 'react'
import {BriefcaseBusiness,ChevronLeft,ChevronRight,Clock3,RefreshCw,ShieldCheck} from 'lucide-react'
import type {AdminLanguage} from './console-model'
import {readKafCases} from './live-kaf-cases'
import type {KafCasesResult,KafCase} from './live-kaf-cases'

type Mode='cases'|'tasks'
const langText={
 fa:{
  cases:'پرونده‌های واقعی KAF',tasks:'پیگیری‌های ثبت‌شده در پرونده‌های KAF',
  casesIntro:'پرونده‌های شرکت فجرپارسا، فقط با مجوز موجود KAF و بدون اطلاعات نمایشی.',
  tasksIntro:'فقط اقدام‌های بعدی که در پرونده‌های قابل‌دسترسی KAF ثبت شده‌اند؛ این صفحه سامانهٔ وظایف مستقل نیست.',
  scope:'فهرست فقط از پرونده‌های مجاز فجرپارسا خوانده می‌شود. هر صفحه حداکثر ۲۵ مورد است؛ این آمار مجموع شرکت نیست.',
  badge:'ارتباط امن با KAF · فقط مشاهده',
  refresh:'تازه‌سازی',loading:'در حال خواندن پرونده‌های مجاز…',
  emptyCases:'پرونده‌ای در این صفحه دریافت نشد.',emptyTasks:'در این صفحه پرونده‌ای دارای اقدام بعدی دریافت نشد.',
  code:'شماره پرونده',status:'وضعیت',due:'تاریخ پیگیری',assigned:'مسئول',nextAction:'اقدام بعدی',
  none:'ثبت نشده',previous:'قبلی',next:'بعدی',page:'صفحه',shown:'مورد در این صفحه',
  note:'ثبت یا ویرایش پرونده از این بخش فعال نیست؛ تغییرات نیازمند قرارداد تأیید و ثبت ممیزی مستقل هستند.',
  sign_in_required:'نشست امن دفتر پایان یافته است؛ دوباره وارد دفتر شوید.',
  access_denied:'این حساب مجوز دیدن پرونده‌های KAF شرکت فجرپارسا را ندارد.',
  rate_limited:'درخواست‌های زیاد موقتاً محدود شده‌اند؛ بعداً دوباره بررسی کنید.',
  unavailable:'دادهٔ معتبر از KAF دریافت نشد. هیچ پرونده یا پیگیری ساختگی نمایش داده نمی‌شود.'
 },
 en:{
  cases:'Live KAF cases',tasks:'KAF case follow-ups',
  casesIntro:'Fajr Parsa cases only, with existing KAF authorization and no demo entries.',
  tasksIntro:'Next actions already recorded on visible KAF cases; not a separate task-management system.',
  scope:'Only permissioned Fajr Parsa cases are shown, up to 25 per page; this is not a company-wide total.',
  badge:'Secure KAF connection · read-only',
  refresh:'Refresh',loading:'Reading authorized cases…',
  emptyCases:'No cases returned on this page.',emptyTasks:'No case follow-ups returned on this page.',
  code:'Case code',status:'Status',due:'Follow-up date',assigned:'Assigned to',nextAction:'Next action',
  none:'Not recorded',previous:'Previous',next:'Next',page:'Page',shown:'items on this page',
  note:'Creating or editing cases is not enabled here; changes require a separately audited confirmation contract.',
  sign_in_required:'Your Office session expired. Sign in again.',
  access_denied:'This account is not permitted to view Fajr Parsa KAF cases.',
  rate_limited:'Too many requests are temporarily limited. Retry later.',
  unavailable:'No verified KAF case data was returned. Demo cases and follow-ups are never substituted.'
 }
} as const
export function LiveKafCases({lang,mode}:{lang:AdminLanguage;mode:Mode}){
 const tx=langText[lang]
 const [page,setPage]=useState(0)
 const [revision,setRevision]=useState(0)
 const [state,setState]=useState<KafCasesResult|null>(null)
 useEffect(()=>{
  let active=true
  setState(null)
  readKafCases(page).then(result=>{if(active)setState(result)})
  return()=>{active=false}
 },[page,revision])
 const busy=state===null
 const all=state?.status==='ok'?state.items:[]
 const rows=mode==='tasks'?all.filter(item=>item.nextAction.trim().length>0):all
 const error=state&&state.status!=='ok'?tx[state.status]:null
 const title=tx[mode]
 const fmt=(value:string|null)=>value||tx.none
 return <section className="fpx-live-kaf" aria-label={title}>
  <header className="fpx-live-kaf-header">
   <div><span className="fpx-live-kaf-badge"><ShieldCheck size={16}/>{tx.badge}</span>
    <h1>{title}</h1><p>{mode==='tasks'?tx.tasksIntro:tx.casesIntro}</p></div>
   <button type="button" aria-label={tx.refresh} disabled={busy}
    onClick={()=>setRevision(v=>v+1)}><RefreshCw size={17}/><span>{tx.refresh}</span></button>
  </header>
  <p className="fpx-live-kaf-scope">{tx.scope}</p>
  {busy?<p className="fpx-live-kaf-message" role="status">{tx.loading}</p>:
   error?<p className="fpx-live-kaf-message" role="alert" data-state={state?.status}>{error}</p>:
   <>
    <p className="fpx-live-kaf-count" role="status">{rows.length} {tx.shown}</p>
    {rows.length===0?<p className="fpx-live-kaf-message">{mode==='tasks'?tx.emptyTasks:tx.emptyCases}</p>:
     <div className="fpx-live-kaf-list">{rows.map((row:KafCase)=>
      <article className="fpx-live-kaf-card" key={row.id}>
       <div className="fpx-live-kaf-card-heading"><div><small>{tx.code} · <span dir="ltr">{row.code}</span></small><h2>{row.title}</h2></div><span className="fpx-live-kaf-status">{row.status}</span></div>
       <div className="fpx-live-kaf-fields">
        <div><small><BriefcaseBusiness size={14}/>{tx.assigned}</small><strong>{row.assignedTo||tx.none}</strong></div>
        <div><small><Clock3 size={14}/>{tx.due}</small><strong dir="ltr">{fmt(row.dueDate)}</strong></div>
       </div>
       <p className="fpx-live-kaf-action"><strong>{tx.nextAction}</strong><span>{row.nextAction||tx.none}</span></p>
      </article>
     )}</div>}
    <nav className="fpx-live-kaf-pagination" aria-label={tx.page}>
     <button type="button" disabled={page===0} onClick={()=>setPage(v=>Math.max(0,v-1))}><ChevronRight size={16}/>{tx.previous}</button>
     <span>{tx.page} {page+1}</span>
     <button type="button" disabled={all.length<25||page>=400} onClick={()=>setPage(v=>v+1)}>{tx.next}<ChevronLeft size={16}/></button>
    </nav>
   </>}
  <p className="fpx-live-kaf-footnote">{tx.note}</p>
 </section>
}
