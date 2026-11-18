import {useEffect,useState} from 'react'
import {ChevronLeft,ChevronRight,RefreshCw,ShieldCheck} from 'lucide-react'
import type {AdminLanguage} from './console-model'
import {readOfficeRequests} from './live-office-requests'
import type {OfficeRequestResult,OfficeStatus} from './live-office-requests'
const statusText:Record<OfficeStatus,{fa:string;en:string}>={
 received:{fa:'دریافت‌شده',en:'Received'},
 reviewing:{fa:'در حال بررسی',en:'Reviewing'},
 contacted:{fa:'تماس گرفته شد',en:'Contacted'},
 closed:{fa:'بسته‌شده',en:'Closed'}
}
const words={
 fa:{
  title:'درخواست‌های واقعی دفتر',sub:'داده‌ها مستقیم از دفتر امن فجرپارسا خوانده می‌شوند؛ هیچ تغییری از این صفحه ثبت نمی‌شود.',
  refresh:'تازه‌سازی',pending:'در حال خواندن درخواست‌ها…',shown:'درخواست در این صفحه',
  empty:'در این صفحه درخواستی ثبت نشده است.',service:'خدمت',destination:'مقصد',contact:'تماس',
  previous:'قبلی',next:'بعدی',page:'صفحه',viewOnly:'دادهٔ واقعی · فقط مشاهده',
  sign_in_required:'نشست ورود پایان یافته است. لطفاً از دفتر دوباره وارد شوید.',
  access_denied:'این حساب مجوز خواندن درخواست‌های دفتر را ندارد.',
  rate_limited:'محدودیت درخواست‌های دفتر فعال است. برای جلوگیری از فشار به سرور، بعداً دوباره بررسی کنید.',
  unavailable:'ارتباط با دفتر برقرار نشد یا پاسخ معتبر نبود. اطلاعات ساختگی نمایش داده نمی‌شود.'
 },
 en:{
  title:'Live office requests',sub:'Read-only data from the secured Fajr Office. This screen cannot change records.',
  refresh:'Refresh',pending:'Reading office requests…',shown:'Requests on this page',
  empty:'No requests on this page.',service:'Service',destination:'Destination',contact:'Contact',
  previous:'Previous',next:'Next',page:'Page',viewOnly:'Verified office · read-only',
  sign_in_required:'Your session has expired. Sign in again through the Office.',
  access_denied:'This account is not permitted to read Office requests.',
  rate_limited:'The Office request limit is active. Retry later rather than repeatedly refreshing.',
  unavailable:'The Office is unavailable or returned invalid data. No demo records are substituted.'
 }
}
export function LiveOfficeRequests({lang}:{lang:AdminLanguage}){
 const [page,setPage]=useState(0)
 const [revision,setRevision]=useState(0)
 const [state,setState]=useState<OfficeRequestResult|null>(null)
 const tx=words[lang]
 useEffect(()=>{
  let active=true
  setState(null)
  readOfficeRequests(page).then(result=>{if(active)setState(result)})
  return()=>{active=false}
 },[page,revision])
 const busy=state===null
 const rows=state?.status==='ok'?state.items:[]
 const error=state&&state.status!=='ok'?tx[state.status]:null
 return <section className="fpx-live-office" aria-label={tx.title}>
  <div className="fpx-live-office-top">
   <div><div className="fpx-live-office-mark"><ShieldCheck size={17}/>{tx.viewOnly}</div>
    <h2>{tx.title}</h2><p>{tx.sub}</p></div>
   <button type="button" onClick={()=>setRevision(n=>n+1)} disabled={busy} aria-label={tx.refresh}>
    <RefreshCw size={16}/>{tx.refresh}</button>
  </div>
  {busy?<p role="status" className="fpx-live-office-message">{tx.pending}</p>:
  error?<p role="alert" className="fpx-live-office-message" data-state={state?.status}>{error}</p>:
  <>
   <p className="fpx-live-office-count" role="status">{rows.length} {tx.shown}</p>
   {rows.length===0?<p className="fpx-live-office-message">{tx.empty}</p>:
   <div className="fpx-live-office-items">{rows.map(row=>
    <article className="fpx-live-office-item" key={row.id}>
     <div className="fpx-live-office-row"><strong>{row.service||'—'}</strong><span data-state={row.status}>{statusText[row.status][lang]}</span></div>
     <div className="fpx-live-office-fields">
      <div><small>{tx.destination}</small><p>{row.destination||'—'}</p></div>
      <div><small>{tx.contact}</small><p>{row.contact||'—'}</p></div>
     </div>
     <code dir="ltr">{row.id.slice(0,8)}</code>
    </article>
   )}</div>}
   <nav className="fpx-live-office-pagination" aria-label={tx.page}>
    <button type="button" disabled={page===0} onClick={()=>setPage(p=>Math.max(0,p-1))}><ChevronRight size={16}/>{tx.previous}</button>
    <span>{tx.page} {page+1}</span>
    <button type="button" disabled={rows.length<25} onClick={()=>setPage(p=>p+1)}>{tx.next}<ChevronLeft size={16}/></button>
   </nav>
  </>}
 </section>
}
