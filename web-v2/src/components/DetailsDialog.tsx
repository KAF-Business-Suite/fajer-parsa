import { useRef, useState } from 'react'
import { ArrowLeft, Download, MessageCircle } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog'
export type Selection = { title: string; description: string; request?: boolean; destination?: string; image?: string; options?: { title: string; description: string }[] }
export function DetailsDialog({ selection, onClose, onRequest }: { selection: Selection | null; onClose: () => void; onRequest: (destination?: string) => void }) {
  const returnFocus = useRef<HTMLElement | null>(null)
  return <Dialog open={Boolean(selection)} onOpenChange={(open) => { if (!open) onClose() }}>
    <DialogContent dir="rtl" onOpenAutoFocus={() => { returnFocus.current = document.activeElement instanceof HTMLElement ? document.activeElement : null }} onCloseAutoFocus={(event) => { event.preventDefault(); returnFocus.current?.focus() }}>
      <DialogHeader><DialogTitle>{selection?.title}</DialogTitle><DialogDescription>{selection?.description}</DialogDescription></DialogHeader>
      {selection?.image && <img className="dialog-destination-image" src={selection.image} alt={selection.title} width="720" height="420"/>}
      {selection?.options && <div className="related-services">{selection.options.map(option => <article key={option.title}><h3>{option.title}</h3><p>{option.description}</p></article>)}</div>}
      {selection?.request ? <RequestDraft key={selection.destination || 'new'} initialDestination={selection.destination || ''}/> : <div className="dialog-actions"><button type="button" className="primary-action" onClick={()=>onRequest(selection?.destination)}>آماده‌سازی درخواست <ArrowLeft size={16}/></button><button type="button" className="secondary-action" onClick={onClose}>بازگشت به سایت</button></div>}
    </DialogContent>
  </Dialog>
}
function RequestDraft({initialDestination}: {initialDestination:string}) {
  const [service, setService] = useState('')
  const [destination, setDestination] = useState(initialDestination)
  const [date, setDate] = useState('')
  const [travelers, setTravelers] = useState('1')
  const [saved, setSaved] = useState(false)
  const [reviewed, setReviewed] = useState(false)
  const formRef=useRef<HTMLFormElement>(null)
  const summary=`سلام، برای بررسی خدمات فجر پارسا درخواست دارم.\nخدمت: ${service}\nمقصد: ${destination}\nتعداد مسافران: ${travelers}\nزمان تقریبی: ${date || 'هنوز مشخص نیست'}`
  const changed=()=>{setSaved(false);setReviewed(false)}
  function download() {
    if(!formRef.current?.reportValidity()) return
    const blob = new Blob([JSON.stringify({ format:'fajr-parsa-request-draft-v1',service,destination,date,travelers,status:'not-submitted' },null,2)],{type:'application/json'})
    const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='fajr-parsa-request-draft.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);setSaved(true)
  }
  return <form ref={formRef} className="request-draft" onSubmit={e=>{e.preventDefault();setReviewed(true)}}>
    <div className="draft-field"><label htmlFor="draft-service">خدمت مورد نظر</label><select id="draft-service" required value={service} onChange={e=>{setService(e.target.value);changed()}}><option value="">انتخاب خدمت</option>{['ویزا و اقامت','دعوتنامه و تجارت','پرواز و هتل','زیارت و کاروان','اسناد و کنسولی','خدمات مکمل سفر'].map(x=><option key={x}>{x}</option>)}</select></div>
    <div className="draft-field"><label htmlFor="draft-destination">مقصد</label><input id="draft-destination" required value={destination} maxLength={80} onChange={e=>{setDestination(e.target.value);changed()}} placeholder="نام کشور یا شهر"/></div>
    <div className="draft-row"><div className="draft-field"><label htmlFor="draft-date">زمان تقریبی سفر (اختیاری)</label><input id="draft-date" type="date" value={date} onChange={e=>{setDate(e.target.value);changed()}}/></div><div className="draft-field"><label htmlFor="draft-travelers">تعداد مسافران</label><input id="draft-travelers" type="number" min="1" max="99" required value={travelers} onChange={e=>{setTravelers(e.target.value);changed()}}/></div></div>
    <p className="draft-note">پیش از ارسال، خلاصه را مرور کنید. این فرم تصویر اسناد یا اطلاعات هویتی نمی‌خواهد و پیام را خودکار ارسال نمی‌کند.</p>
    <button type="submit" className="primary-action">مرور پیام درخواست <ArrowLeft size={16}/></button>
    {reviewed && <div className="request-summary" aria-live="polite"><h3>خلاصه برای مشاور</h3><p>{summary}</p><a className="primary-action" href={'https://wa.me/93777377774?text='+encodeURIComponent(summary)} target="_blank" rel="noopener noreferrer"><MessageCircle size={17}/> باز کردن واتساپ دفتر</a><small>پیام تنها پس از انتخاب «ارسال» در واتساپ فرستاده می‌شود.</small></div>}
    <button type="button" className="draft-download" onClick={download}><Download size={15}/> دریافت پیش‌نویس</button>
    <div role="status">{saved ? 'فایل پیش‌نویس آمادهٔ دریافت شد؛ درخواست به دفتر ارسال نشده است.' : ''}</div>
  </form>
}
