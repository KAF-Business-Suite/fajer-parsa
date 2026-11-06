import {useCallback,useState} from 'react'

/** Prepared staff interface: intentionally not mounted or reachable in the public build. */
export type OfficeCase={id:string;service:string;destination:string;variant:string;contact:string;status:'received'|'reviewing'|'contacted'|'closed';created_at:string}
export type OfficeGateway={
 list:(offset:number)=>Promise<OfficeCase[]>
 change:(id:string,expected:OfficeCase['status'],next:OfficeCase['status'])=>Promise<{id:string;status:OfficeCase['status']}>
}
const states:OfficeCase['status'][]=['received','reviewing','contacted','closed']
const labels:Record<OfficeCase['status'],string>={received:'دریافت‌شده',reviewing:'در حال بررسی',contacted:'تماس گرفته شد',closed:'بسته‌شده'}
const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
function valid(row:OfficeCase):boolean{return !!row&&uuid.test(row.id)&&states.includes(row.status)&&['service','destination','variant','contact','created_at'].every(k=>typeof row[k as keyof OfficeCase]==='string')}
export function OfficeWorkspace({gateway,onSignOut}:{gateway:OfficeGateway;onSignOut:()=>void}){
 const [rows,setRows]=useState<OfficeCase[]>([])
 const [offset,setOffset]=useState(0)
 const [loading,setLoading]=useState(false)
 const [error,setError]=useState('')
 const [selection,setSelection]=useState<{row:OfficeCase;next:OfficeCase['status']}|null>(null)
 const [busy,setBusy]=useState(false)
 const [ready,setReady]=useState(false)
 const load=useCallback(async (page=0)=>{
  setLoading(true);setError('');setSelection(null)
  try{
   const result=await gateway.list(page*25)
   if(!Array.isArray(result)||result.length>25||!result.every(valid))throw Error('unexpected response')
   setRows(result);setOffset(page);setReady(true)
  }catch{setRows([]);setReady(false);setError('امکان دریافت درخواست‌ها نیست. اتصال یا مجوز خود را بررسی کنید.')}
  finally{setLoading(false)}
 },[gateway])
 const apply=async()=>{
  if(!selection||busy)return
  setBusy(true);setError('')
  try{
   const {row,next}=selection
   const answer=await gateway.change(row.id,row.status,next)
   if(answer.id!==row.id||answer.status!==next)throw Error('unexpected reply')
   setSelection(null)
   // Always refresh authoritative state instead of optimistic local changes.
   await load(offset)
  }catch{
   setSelection(null)
   setRows([]);setReady(false)
   setError('تغییر تأیید نشد؛ اطلاعات ممکن است عوض شده باشد. تازه‌سازی کنید.')
  }finally{setBusy(false)}
 }
 return <main dir="rtl" lang="fa" style={{maxWidth:1080,margin:'auto',padding:20,fontFamily:'Vazirmatn, sans-serif',color:'#102a43'}}>
  <header style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:12,flexWrap:'wrap'}}>
   <div><h1>دفتر درخواست‌های فجرپارسا</h1><p>فقط برای کارمندان دارای دسترسی تأییدشده</p></div>
   <button type="button" onClick={onSignOut}>خروج امن</button>
  </header>
  <nav aria-label="عملیات دفتر" style={{display:'flex',gap:12,marginBlock:20}}>
   <button type="button" disabled={loading||busy} onClick={()=>void load(offset)}>تازه‌سازی</button>
   <button type="button" disabled={loading||busy||offset===0} onClick={()=>void load(offset-1)}>صفحهٔ قبل</button>
   <button type="button" disabled={loading||busy||rows.length<25} onClick={()=>void load(offset+1)}>صفحهٔ بعد</button>
  </nav>
  {error&&<p role="alert">{error}</p>}
  {!ready&&!loading&&<p>برای نمایش درخواست‌ها «تازه‌سازی» را بزنید. اطلاعات فقط از سرور تأییدشده دریافت می‌شود.</p>}
  {loading&&<p role="status">در حال دریافت…</p>}
  {ready&&<div style={{overflowX:'auto'}}><table style={{width:'100%',borderCollapse:'collapse'}}>
   <thead><tr>{['شناسه','خدمت','مقصد','تماس','وضعیت','اقدام'].map(k=><th key={k} scope="col" style={{textAlign:'right',padding:12}}>{k}</th>)}</tr></thead>
   <tbody>{rows.map(row=><tr key={row.id}>
    <td style={{padding:12}}>{row.id.slice(0,8)}</td><td style={{padding:12}}>{row.service}</td><td style={{padding:12}}>{row.destination}</td><td style={{padding:12}}>{row.contact}</td><td style={{padding:12}}>{labels[row.status]}</td>
    <td style={{padding:12}}><label>تغییر وضعیت
     <select aria-label={'تغییر وضعیت '+row.id} value={row.status} disabled={busy||loading} onChange={e=>{const next=e.target.value as OfficeCase['status'];if(next!==row.status)setSelection({row,next})}}>
      {states.map(s=><option key={s} value={s}>{labels[s]}</option>)}
     </select></label></td>
   </tr>)}</tbody>
  </table>{rows.length===0&&<p>درخواستی در این صفحه نیست.</p>}</div>}
  {selection&&<div role="dialog" aria-modal="true" aria-label="تأیید تغییر وضعیت" style={{position:'fixed',inset:0,background:'rgba(0,0,0,.45)',display:'grid',placeItems:'center',padding:16}}>
   <section style={{background:'#fff',padding:24,borderRadius:12,maxWidth:480,width:'100%'}}>
    <h2>تأیید تغییر وضعیت</h2>
    <p>درخواست {selection.row.id.slice(0,8)}: از «{labels[selection.row.status]}» به «{labels[selection.next]}» تغییر کند؟</p>
    <p>ثبت فقط پس از تأیید شما و پاسخ موفق سرور انجام می‌شود.</p>
    <button type="button" disabled={busy} onClick={()=>void apply()}>تأیید و ثبت</button>{' '}
    <button type="button" disabled={busy} onClick={()=>setSelection(null)}>انصراف</button>
   </section>
  </div>}
 </main>
}
