import { useCallback, useEffect, useState } from 'react'

export type Status = 'received' | 'reviewing' | 'contacted' | 'closed'
export type OfficeItem = { id:string; service:string; destination:string; variant:string; contact:string; status:Status; created_at:string }
export type OfficeQueueProps = {
  load: (offset:number)=>Promise<OfficeItem[]>
  change: (id:string, expected:Status, next:Status)=>Promise<void>
  canUpdate:boolean
}
const states:Status[]=['received','reviewing','contacted','closed']
const labels:Record<Status,string>={received:'دریافت شد',reviewing:'در حال بررسی',contacted:'تماس گرفته شد',closed:'بسته شد'}
const allowed=(x:unknown):x is Status=>typeof x==='string'&&states.includes(x as Status)
const valid=(x:unknown):x is OfficeItem=>{
 if(!x||typeof x!=='object')return false
 const v=x as Record<string,unknown>
 return typeof v.id==='string'&&/^[0-9a-f]{8}-[0-9a-f-]{27}$/i.test(v.id)&&
   ['service','destination','variant','contact','created_at'].every(k=>typeof v[k]==='string')&&allowed(v.status)
}
/** NOT MOUNTED: needs authenticated server-only staff API, real permission checks and auditing before use. */
export function OfficeQueue({load,change,canUpdate}:OfficeQueueProps){
 const [records,setRecords]=useState<OfficeItem[]>([])
 const [offset,setOffset]=useState(0)
 const [error,setError]=useState('')
 const [busy,setBusy]=useState(false)
 const [pending,setPending]=useState<{item:OfficeItem,next:Status}|null>(null)
 const refresh=useCallback(async (nextOffset:number)=>{
  setBusy(true);setError('')
  try{
   const result=await load(nextOffset)
   if(!Array.isArray(result)||result.length>25||!result.every(valid))throw Error('Invalid response')
   setRecords(result);setOffset(nextOffset)
  }catch{setRecords([]);setError('دسترسی یا اتصال دفتر برقرار نیست. درخواست ثبت یا تغییر نشد.')}
  finally{setBusy(false)}
 },[load])
 useEffect(()=>{void refresh(0)},[refresh])
 const save=async()=>{
  if(!pending||busy||!canUpdate)return
  const {item,next}=pending;setPending(null);setBusy(true)
  try{await change(item.id,item.status,next);await refresh(offset)}
  catch{setError('ذخیره تأیید نشد. فهرست را تازه کرده و وضعیت را بررسی کنید.');setBusy(false)}
 }
 return <section dir="rtl" aria-label="دفتر فجرپارسا" style={{maxWidth:1040,margin:'auto',padding:16,fontFamily:'Vazirmatn,sans-serif'}}>
  <header style={{display:'flex',justifyContent:'space-between',gap:12,alignItems:'center',flexWrap:'wrap'}}>
   <div><h1>دفتر درخواست‌های فجرپارسا</h1><p>فقط برای کارمندان مجاز</p></div>
   <button disabled={busy} onClick={()=>void refresh(offset)}>تازه‌سازی</button>
  </header>
  {busy&&<p role="status">در حال بارگذاری…</p>}
  {error&&<p role="alert">{error}</p>}
  {!busy&&!error&&!records.length&&<p>در این صفحه درخواستی نیست.</p>}
  <div style={{display:'grid',gap:12}}>
   {records.map(item=><article key={item.id} style={{border:'1px solid #cbd5e1',borderRadius:12,padding:16}}>
    <strong>{item.service} — {item.destination}</strong><p>{item.variant}</p>
    <p>تماس: <bdi>{item.contact}</bdi></p><p>وضعیت: {labels[item.status]}</p>
    <small>شناسه: <bdi>{item.id}</bdi></small>
    {canUpdate&&<label style={{display:'block',marginTop:12}}>تغییر وضعیت
     <select disabled={busy} value={item.status} onChange={e=>{const next=e.target.value;if(allowed(next)&&next!==item.status)setPending({item,next})}}>
      {states.map(s=><option key={s} value={s}>{labels[s]}</option>)}
     </select>
    </label>}
   </article>)}
  </div>
  <nav aria-label="صفحه‌بندی" style={{display:'flex',gap:12,marginTop:16}}>
   <button disabled={busy||offset===0} onClick={()=>void refresh(Math.max(0,offset-25))}>قبلی</button>
   <span>صفحه {1+Math.floor(offset/25)}</span>
   <button disabled={busy||records.length<25} onClick={()=>void refresh(offset+25)}>بعدی</button>
  </nav>
  {pending&&<div role="dialog" aria-modal="true" aria-label="تأیید تغییر" style={{position:'fixed',inset:'auto 16px 20px',margin:'auto',maxWidth:480,padding:20,background:'white',color:'#102a43',border:'2px solid #102a43',borderRadius:12,zIndex:100}}>
   <h2>تأیید تغییر وضعیت</h2>
   <p>از «{labels[pending.item.status]}» به «{labels[pending.next]}» تغییر کند؟</p>
   <p>سرور دوباره مجوز و وضعیت قبلی را بررسی می‌کند.</p>
   <button disabled={busy} onClick={()=>void save()}>تأیید و ذخیره</button>{' '}
   <button onClick={()=>setPending(null)}>انصراف</button>
  </div>}
 </section>
}
