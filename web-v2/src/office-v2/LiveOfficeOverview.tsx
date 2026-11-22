import {useEffect,useState} from 'react'
import {ArrowUpRight,CheckCircle2,Clock3,Inbox,Layers,RefreshCw,ShieldCheck} from 'lucide-react'
import {Card,CardContent,CardHeader} from './oss/card'
import type {AdminLanguage} from './console-model'
import {readOfficeRequests} from './live-office-requests'
import type {OfficeRequestResult} from './live-office-requests'
import {summarizeOfficePage} from './live-office-summary'
const words={
 fa:{
  heading:'نمای مدیریتی فجرپارسا',
  intro:'خلاصهٔ فقط‌خواندنی از نخستین صفحهٔ درخواست‌های دفتر امن.',
  scope:'فقط ۲۵ درخواست نخست؛ این ارقام مجموع تمام درخواست‌های شرکت نیستند.',
  more:'این صفحه تکمیل است؛ احتمال دارد درخواست‌های بیشتری وجود داشته باشد.',
  verified:'دادهٔ دفتر · فقط مشاهده',
  refresh:'تازه‌سازی',loading:'در حال بررسی درخواست‌های دفتر…',
  total:'درخواست‌های این صفحه',received:'دریافت‌شده',reviewing:'در حال بررسی',contacted:'تماس گرفته‌شده',closed:'بسته‌شده',
  empty:'در صفحهٔ نخست هیچ درخواستی دریافت نشد.',
  sign_in_required:'نشست دفتر پایان یافته است. برای مشاهدهٔ ارقام، دوباره وارد دفتر شوید.',
  access_denied:'این حساب مجوز خواندن آمار درخواست‌های دفتر را ندارد.',
  rate_limited:'محدودیت دریافت درخواست‌ها فعال است. برای جلوگیری از فشار به دفتر، بعداً دوباره بررسی کنید.',
  unavailable:'ارتباط با دفتر برقرار نشد یا پاسخ معتبر نبود. هیچ عدد نمونه‌ای نمایش داده نمی‌شود.',
  requestsLink:'بازکردن درخواست‌ها',resourcesLink:'منابع متصل'
 },
 en:{
  heading:'Fajr Parsa management overview',
  intro:'A read-only summary of the first page of authorized Office requests.',
  scope:'First 25 requests only; these are NOT company-wide totals.',
  more:'The first page is full; additional requests may exist.',
  verified:'Office data · read-only',
  refresh:'Refresh',loading:'Reading the secure Office requests…',
  total:'Requests on this page',received:'Received',reviewing:'Reviewing',contacted:'Contacted',closed:'Closed',
  empty:'No requests were returned on the first page.',
  sign_in_required:'Your Office session has expired. Sign in again to see these counts.',
  access_denied:'Your account is not allowed to read Office request counts.',
  rate_limited:'The Office request limit is active. Retry later without repeated requests.',
  unavailable:'Office data is unavailable or invalid. No sample numbers are displayed.',
  requestsLink:'Open requests',resourcesLink:'Connected resources'
 }
} as const
export function LiveOfficeOverview({lang,onGo}:{lang:AdminLanguage;onGo:(id:string)=>void}){
 const tx=words[lang]
 const [revision,setRevision]=useState(0)
 const [state,setState]=useState<OfficeRequestResult|null>(null)
 useEffect(()=>{
  let active=true
  setState(null)
  readOfficeRequests(0).then(result=>{if(active)setState(result)})
  return()=>{active=false}
 },[revision])
 const busy=state===null
 const result=state?.status==='ok'?summarizeOfficePage(state.items):null
 const error=state&&state.status!=='ok'?tx[state.status]:null
 const cards=result?[
  {key:'shown',name:tx.total,value:result.shown,Icon:Inbox},
  {key:'received',name:tx.received,value:result.received,Icon:Inbox},
  {key:'reviewing',name:tx.reviewing,value:result.reviewing,Icon:Clock3},
  {key:'contacted',name:tx.contacted,value:result.contacted,Icon:CheckCircle2},
  {key:'closed',name:tx.closed,value:result.closed,Icon:CheckCircle2}
 ]:[] 
 return <section className="fpx-live-overview fpx-section-stack" aria-label={tx.heading}>
  <div className="fpx-live-overview-top">
   <div><span className="fpx-live-overview-kicker"><ShieldCheck size={16}/>{tx.verified}</span>
    <h1>{tx.heading}</h1><p>{tx.intro}</p></div>
   <button type="button" aria-label={tx.refresh} disabled={busy} onClick={()=>setRevision(n=>n+1)}>
    <RefreshCw size={16}/><span>{tx.refresh}</span></button>
  </div>
  <p className="fpx-live-overview-scope">{tx.scope}</p>
  {busy?<p role="status" className="fpx-live-overview-feedback">{tx.loading}</p>:
   error?<p role="alert" data-state={state?.status} className="fpx-live-overview-feedback">{error}</p>:
   <>
    <div className="fpx-stats fpx-live-overview-stats">{cards.map(({key,name,value,Icon})=>
     <Card className="fpx-stat fpx-live-overview-stat" key={key}>
      <CardHeader className="fpx-stat-title"><div><p>{name}</p><strong>{value}</strong></div><span><Icon size={20}/></span></CardHeader>
      <CardContent><small>{tx.verified}</small></CardContent>
     </Card>)}</div>
    {result?.shown===0&&<p className="fpx-live-overview-feedback">{tx.empty}</p>}
    {result?.possiblyMore&&<p role="status" className="fpx-live-overview-more">{tx.more}</p>}
   </>}
  <div className="fpx-live-overview-links">
   <button type="button" onClick={()=>onGo('requests')}><Inbox size={17}/>{tx.requestsLink}<ArrowUpRight size={16}/></button>
   <button type="button" onClick={()=>onGo('resources')}><Layers size={17}/>{tx.resourcesLink}<ArrowUpRight size={16}/></button>
  </div>
 </section>
}
