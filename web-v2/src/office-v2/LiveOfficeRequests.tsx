import {useEffect,useState} from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import {CheckCircle2,ChevronLeft,ChevronRight,RefreshCw,ShieldCheck,X} from 'lucide-react'
import type {AdminLanguage} from './console-model'
import {readOfficeRequests} from './live-office-requests'
import type {OfficeRequestResult,OfficeRequestRow,OfficeStatus} from './live-office-requests'
import {changeOfficeRequestStatus} from './office-status-change'
import type {OfficeChangeResult} from './office-status-change'

const statusText:Record<OfficeStatus,{fa:string;en:string}>={
 received:{fa:'دریافت‌شده',en:'Received'},
 reviewing:{fa:'در حال بررسی',en:'Reviewing'},
 contacted:{fa:'تماس گرفته شد',en:'Contacted'},
 closed:{fa:'بسته‌شده',en:'Closed'}
}
const statusOptions:readonly OfficeStatus[]=['received','reviewing','contacted','closed']
const words={
 fa:{
  title:'درخواست‌های واقعی دفتر',sub:'درخواست‌ها از دفتر امن خوانده می‌شوند؛ تغییر وضعیت فقط با تأیید و ثبت ممیزی در سرور انجام می‌شود.',
  refresh:'تازه‌سازی',pending:'در حال خواندن درخواست‌ها…',shown:'درخواست در این صفحه',
  empty:'در این صفحه درخواستی ثبت نشده است.',service:'خدمت',destination:'مقصد',contact:'تماس',
  previous:'قبلی',next:'بعدی',page:'صفحه',verified:'دادهٔ واقعی · تغییر با تأیید',
  edit:'تغییر وضعیت',confirmTitle:'بررسی تغییر وضعیت',current:'وضعیت فعلی',target:'وضعیت جدید',
  confirmation:'این تغییر تنها پس از بررسی مجوز، ثبت ممیزی و خواندن مجدد از سرور موفق اعلام می‌شود.',
  save:'تأیید و ثبت',cancel:'انصراف',saving:'در حال ثبت و بازخوانی…',
  success:'تغییر ثبت شد و وضعیت تازه از سرور بازخوانی شد.',
  invalid_request:'وضعیت جدید معتبر نیست یا با وضعیت فعلی تفاوت ندارد.',
  conflict:'وضعیت این درخواست هم‌زمان تغییر کرده است؛ فهرست برای بررسی تازه‌سازی شد.',
  unverified:'نتیجهٔ ثبت از سرور تأیید نشد. برای جلوگیری از ثبت تکراری، نخست فهرست را تازه‌سازی کنید.',
  sign_in_required:'نشست ورود پایان یافته است. لطفاً از دفتر دوباره وارد شوید.',
  access_denied:'این حساب برای تغییر یا خواندن وضعیت مجوز لازم را ندارد.',
  rate_limited:'محدودیت درخواست‌های دفتر فعال است. برای جلوگیری از فشار به سرور، بعداً بررسی کنید.',
  unavailable:'ارتباط با دفتر برقرار نشد یا پاسخ معتبر نبود. اطلاعات ساختگی نمایش داده نمی‌شود.'
 },
 en:{
  title:'Live office requests',sub:'Read from the secured Office. Changes require confirmation, server authorization and an audit record.',
  refresh:'Refresh',pending:'Reading office requests…',shown:'Requests on this page',
  empty:'No requests on this page.',service:'Service',destination:'Destination',contact:'Contact',
  previous:'Previous',next:'Next',page:'Page',verified:'Verified Office · confirmed changes',
  edit:'Change status',confirmTitle:'Review status change',current:'Current status',target:'New status',
  confirmation:'A change is marked successful only after permission checks, server audit and an authoritative readback.',
  save:'Confirm and save',cancel:'Cancel',saving:'Saving and verifying…',
  success:'Change saved and the new status was verified from the Office.',
  invalid_request:'Choose a valid new status different from the current status.',
  conflict:'Another update changed this request; the list has been refreshed for review.',
  unverified:'The result could not be verified. Refresh the list before attempting another update.',
  sign_in_required:'Your session has expired. Sign in again through the Office.',
  access_denied:'This account is not permitted to read or change these requests.',
  rate_limited:'The Office request limit is active. Retry later rather than repeatedly refreshing.',
  unavailable:'The Office is unavailable or returned invalid data. No demo records are substituted.'
 }
}
type Feedback={kind:'success'|'error';message:string}
export function LiveOfficeRequests({lang}:{lang:AdminLanguage}){
 const [page,setPage]=useState(0)
 const [revision,setRevision]=useState(0)
 const [state,setState]=useState<OfficeRequestResult|null>(null)
 const [selected,setSelected]=useState<OfficeRequestRow|null>(null)
 const [target,setTarget]=useState<OfficeStatus>('reviewing')
 const [saving,setSaving]=useState(false)
 const [feedback,setFeedback]=useState<Feedback|null>(null)
 const tx=words[lang]
 useEffect(()=>{
  let active=true
  setState(null)
  readOfficeRequests(page).then(result=>{if(active)setState(result)})
  return()=>{active=false}
 },[page,revision])
 const busy=state===null||saving
 const rows=state?.status==='ok'?state.items:[]
 const error=state&&state.status!=='ok'?tx[state.status]:null
 const refresh=()=>{if(busy)return;setSelected(null);setFeedback(null);setRevision(n=>n+1)}
 const changePage=(next:number)=>{if(busy)return;setSelected(null);setFeedback(null);setPage(next)}
 const openChange=(row:OfficeRequestRow)=>{
  if(busy)return
  setTarget(statusOptions.find(s=>s!==row.status)||row.status)
  setFeedback(null)
  setSelected(row)
 }
 const confirm=async()=>{
  if(!selected||busy||target===selected.status)return
  const row=selected
  setSaving(true)
  let result:OfficeChangeResult
  try{result=await changeOfficeRequestStatus(row,target,page)}
  catch{result={status:'unverified',items:null}}
  if(result.status==='verified'){
   setState({status:'ok',items:result.items})
   setFeedback({kind:'success',message:tx.success})
  }else{
   setFeedback({kind:'error',message:tx[result.status]})
   if(result.status==='conflict')setRevision(x=>x+1)
  }
  setSaving(false)
  setSelected(null)
 }
 return <section className="fpx-live-office" aria-label={tx.title}>
  <div className="fpx-live-office-top">
   <div><div className="fpx-live-office-mark"><ShieldCheck size={17}/>{tx.verified}</div>
    <h2>{tx.title}</h2><p>{tx.sub}</p></div>
   <button type="button" onClick={refresh} disabled={busy} aria-label={tx.refresh}>
    <RefreshCw size={16}/>{tx.refresh}</button>
  </div>
  {feedback&&<p className="fpx-live-office-feedback" role={feedback.kind==='error'?'alert':'status'} data-kind={feedback.kind}>{feedback.message}</p>}
  {busy&&!saving?<p role="status" className="fpx-live-office-message">{tx.pending}</p>:
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
     <div className="fpx-live-office-actions"><code dir="ltr">{row.id.slice(0,8)}</code>
      <button type="button" onClick={()=>openChange(row)} disabled={busy}>{tx.edit}</button></div>
    </article>
   )}</div>}
   <nav className="fpx-live-office-pagination" aria-label={tx.page}>
    <button type="button" disabled={busy||page===0} onClick={()=>changePage(Math.max(0,page-1))}><ChevronRight size={16}/>{tx.previous}</button>
    <span>{tx.page} {page+1}</span>
    <button type="button" disabled={busy||rows.length<25} onClick={()=>changePage(page+1)}>{tx.next}<ChevronLeft size={16}/></button>
   </nav>
  </>}
  <Dialog.Root open={selected!==null} onOpenChange={open=>{if(!open&&!saving)setSelected(null)}}>
   <Dialog.Portal>
    <Dialog.Overlay className="fpx-office-dialog-overlay"/>
    <Dialog.Content className="fpx-office-dialog" dir={lang==='fa'?'rtl':'ltr'}
      onEscapeKeyDown={event=>{if(saving)event.preventDefault()}}
      onPointerDownOutside={event=>{if(saving)event.preventDefault()}}>
     <div className="fpx-office-dialog-heading"><Dialog.Title>{tx.confirmTitle}</Dialog.Title>
      <Dialog.Close aria-label={tx.cancel} disabled={saving}><X size={18}/></Dialog.Close></div>
     <Dialog.Description>{tx.confirmation}</Dialog.Description>
     {selected&&<form onSubmit={event=>{event.preventDefault();void confirm()}}>
      <div className="fpx-office-dialog-field"><span>{tx.current}</span><strong>{statusText[selected.status][lang]}</strong></div>
      <label className="fpx-office-dialog-field" htmlFor="fpx-office-new-status"><span>{tx.target}</span>
       <select id="fpx-office-new-status" value={target} disabled={saving} onChange={e=>setTarget(e.target.value as OfficeStatus)}>
        {statusOptions.map(status=><option key={status} value={status}>{statusText[status][lang]}</option>)}
       </select></label>
      <div className="fpx-office-dialog-actions"><Dialog.Close type="button" disabled={saving}>{tx.cancel}</Dialog.Close>
       <button type="submit" disabled={saving||target===selected.status}><CheckCircle2 size={17}/>{saving?tx.saving:tx.save}</button></div>
     </form>}
    </Dialog.Content>
   </Dialog.Portal>
  </Dialog.Root>
 </section>
}
