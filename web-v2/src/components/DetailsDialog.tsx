import { siteText, type SiteLanguage } from '../content/site-i18n'
import {CentralRequest,centralIntakeEnabled} from './CentralRequest'
import { serviceNames } from '../content/services'
import { useRef, useState } from 'react'
import { ArrowLeft, Copy, Download, MessageCircle } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog'
export type RequestContext = { destination?: string; service?: string; purpose?: string; passport?: string; bundle?: string; variant?: string }
export type Selection = RequestContext & { contactOnly?: boolean; title: string; description: string; request?: boolean; destination?: string; image?: string; imageNote?:string; location?:string; category?:string; options?: { title: string; description: string }[] }
export function DetailsDialog({ selection,language,onClose, onRequest }: { selection: Selection | null;language:SiteLanguage;onClose: () => void; onRequest: (context: RequestContext) => void }) {
  const t=(v:string)=>siteText(v,language)
  const returnFocus = useRef<HTMLElement | null>(null)
  const context:RequestContext={destination:selection?.destination,service:selection?.service,purpose:selection?.purpose,passport:selection?.passport,bundle:selection?.bundle,variant:selection?.variant}
  return <Dialog open={Boolean(selection)} onOpenChange={(open) => { if (!open) onClose() }}>
    <DialogContent dir={language==='en'?'ltr':'rtl'} onOpenAutoFocus={() => { returnFocus.current = document.activeElement instanceof HTMLElement ? document.activeElement : null }} onCloseAutoFocus={(event) => { event.preventDefault(); const target=returnFocus.current; if(target?.isConnected && target!==document.body) target.focus(); else document.querySelector<HTMLButtonElement>('[aria-controls="mobile-navigation"]')?.focus() }}>
      <DialogHeader><DialogTitle>{selection?.title}</DialogTitle><DialogDescription>{selection?.description}</DialogDescription></DialogHeader>
      {selection?.image && <figure className="destination-detail"><img className="dialog-destination-image" src={selection.image} alt={selection.location ? selection.location+'، '+selection.title : selection.title} width="1440" height="960"/>{selection.imageNote && <figcaption>{selection.imageNote}</figcaption>}{selection.location && <div className="destination-detail-tags"><span>{selection.location}</span><span>{selection.category}</span></div>}</figure>}
      {selection?.options && <div className="related-services">{selection.options.map(option => <article key={option.title}><h3>{t(option.title)}</h3><p>{t(option.description)}</p><button type="button" className="service-choice" onClick={()=>onRequest({...context,service:option.title})}>{t("انتخاب این خدمت")}<ArrowLeft size={14}/></button></article>)}</div>}
      {selection?.request ? <RequestDraft language={language} key={[selection.destination,selection.service,selection.purpose,selection.bundle,selection.variant].join('|')} initial={context}/> : <div className="dialog-actions"><>{selection?.contactOnly ? <a className="primary-action" href="https://wa.me/93777377774" target="_blank" rel="noopener noreferrer"><MessageCircle size={16}/>{t("تماس با دفتر در واتساپ")}</a> : <button type="button" className="primary-action" onClick={()=>onRequest(context)}>{t("آماده‌سازی درخواست")}<ArrowLeft size={16}/></button>}</><button type="button" className="secondary-action" onClick={onClose}>{t("بازگشت به سایت")}</button></div>}
    </DialogContent>
  </Dialog>
}
function RequestDraft({initial,language}: {initial:RequestContext;language:SiteLanguage}) {
  const t=(v:string)=>siteText(v,language)
  const [service, setService] = useState(initial.service || '')
  const [variant,setVariant] = useState(initial.variant || '')
  const [destination, setDestination] = useState(initial.destination || '')
  const [date, setDate] = useState('')
  const [travelers, setTravelers] = useState('1')
  const [saved, setSaved] = useState(false)
  const [reviewed, setReviewed] = useState(false)
  const [submissionLocked,setSubmissionLocked]=useState(false)
  const [copyStatus,setCopyStatus] = useState('')
  const summaryRef=useRef<HTMLTextAreaElement>(null)
  const formRef=useRef<HTMLFormElement>(null)
  const fieldLabels=language==='en'?['Service type','Travel purpose','Nationality','Package']:language==='ar'?['نوع الخدمة','غرض السفر','الجنسية','الباقة']:['نوع خدمت','هدف سفر','تابعیت','بسته']
  const contextLines=[variant && `${fieldLabels[0]}: ${t(variant)}`,initial.purpose && `${fieldLabels[1]}: ${t(initial.purpose)}`,initial.passport && `${fieldLabels[2]}: ${t(initial.passport)}`,initial.bundle && `${fieldLabels[3]}: ${t(initial.bundle)}`].filter(Boolean).join('\n')
  const summary=language==='en'
    ? `Hello Fajr Parsa, I would like to enquire about travel services.\nService: ${t(service)}\nDestination: ${t(destination)}\nTravellers: ${travelers}\nApproximate date: ${date || t('هنوز مشخص نیست')}${contextLines ? '\n'+contextLines : ''}`
    :language==='ar'
    ? `مرحباً فجر بارسا، أود الاستفسار عن خدمات السفر.\nالخدمة: ${t(service)}\nالوجهة: ${t(destination)}\nعدد المسافرين: ${travelers}\nالتاريخ التقريبي: ${date || t('هنوز مشخص نیست')}${contextLines ? '\n'+contextLines : ''}`
    :`سلام، برای بررسی خدمات فجر پارسا درخواست دارم.\nخدمت: ${service}\nمقصد: ${destination}\nتعداد مسافران: ${travelers}\nزمان تقریبی: ${date || 'هنوز مشخص نیست'}${contextLines ? '\n'+contextLines : ''}`
  const changed=()=>{setSaved(false);setReviewed(false);setCopyStatus('')}
  async function copySummary() {
    try {
      await navigator.clipboard.writeText(summary)
      setCopyStatus(t('خلاصه کپی شد؛ هنوز به دفتر ارسال نشده است.'))
    } catch {
      summaryRef.current?.focus()
      summaryRef.current?.select()
      setCopyStatus(t('کپی خودکار ممکن نشد. متن انتخاب‌شده را با گزینهٔ کپی دستگاه بردارید.'))
    }
  }
  function download() {
    if(!formRef.current?.reportValidity()) return
    const blob = new Blob([JSON.stringify({ format:'fajr-parsa-request-draft-v1',purpose:initial.purpose,passport:initial.passport,bundle:initial.bundle,variant:variant || undefined,service,destination,date,travelers,status:'not-submitted' },null,2)],{type:'application/json'})
    const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='fajr-parsa-request-draft.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);setSaved(true)
  }
  return <form ref={formRef} className="request-draft" onSubmit={e=>{e.preventDefault();setReviewed(true)}}>
    {variant && <p className="draft-note">{t("خدمت انتخاب‌شده:")}<strong>{t(variant)}</strong></p>}
    {initial.bundle && <p className="draft-note">{t("بستهٔ انتخاب‌شده:")}<strong>{t(initial.bundle)}</strong></p>}
    <div className="draft-field"><label htmlFor="draft-service">{t("خدمت مورد نظر")}</label><select id="draft-service" disabled={submissionLocked} required value={service} onChange={e=>{setService(e.target.value);if(initial.service && e.target.value!==initial.service)setVariant('');changed()}}><option value="">{t("انتخاب خدمت")}</option>{serviceNames.map(x=><option key={x} value={x}>{t(x)}</option>)}</select></div>
    <div className="draft-field"><label htmlFor="draft-destination">{t("مقصد")}</label><input id="draft-destination" disabled={submissionLocked} required value={destination} maxLength={80} onChange={e=>{setDestination(e.target.value);if(e.target.value!==initial.destination)setVariant('');changed()}} placeholder={t("نام کشور یا شهر")}/></div>
    <div className="draft-row"><div className="draft-field"><label htmlFor="draft-date">{t("زمان تقریبی سفر (اختیاری)")}</label><input id="draft-date" disabled={submissionLocked} type="date" value={date} onChange={e=>{setDate(e.target.value);changed()}}/></div><div className="draft-field"><label htmlFor="draft-travelers">{t("تعداد مسافران")}</label><input id="draft-travelers" disabled={submissionLocked} type="number" min="1" max="99" required value={travelers} onChange={e=>{setTravelers(e.target.value);changed()}}/></div></div>
    <p className="draft-note">{t("پیش از ارسال، خلاصه را مرور کنید. این فرم تصویر اسناد یا اطلاعات هویتی نمی‌خواهد و پیام را خودکار ارسال نمی‌کند.")}</p>
    <button type="submit" disabled={submissionLocked} className="primary-action">{t("مرور پیام درخواست")}<ArrowLeft size={16}/></button>
    {reviewed && <div className="request-summary" aria-live="polite"><h3>{t("خلاصه برای مشاور")}</h3><label htmlFor="request-summary-text">{t("متن آمادهٔ درخواست")}</label><textarea id="request-summary-text" ref={summaryRef} className="request-summary-text" readOnly value={summary} rows={9}/><button type="button" className="secondary-action" onClick={copySummary}><Copy size={16}/>{t("کپی خلاصهٔ درخواست")}</button><div role="status">{copyStatus}</div><small>{centralIntakeEnabled ? t('کپی متن یا باز کردن واتساپ به معنی ثبت مرکزی نیست؛ نتیجهٔ ثبت در بخش پایین نمایش داده می‌شود.') : t('می‌توانید متن را در ایمیل یا پیام‌رسان دلخواه بفرستید. این صفحه درخواست را در دفتر ثبت نمی‌کند.')}</small><a className="primary-action" href={'https://wa.me/93777377774?text='+encodeURIComponent(summary)} target="_blank" rel="noopener noreferrer"><MessageCircle size={17}/>{t("باز کردن واتساپ دفتر")}</a><small>{t("پیام تنها پس از انتخاب «ارسال» در واتساپ فرستاده می‌شود.")}</small></div>}
    {reviewed && centralIntakeEnabled && <CentralRequest service={service} destination={destination} variant={variant} onLock={()=>setSubmissionLocked(true)}/>}
    <button type="button" className="draft-download" disabled={submissionLocked} onClick={download}><Download size={15}/>{t("دریافت پیش‌نویس")}</button>
    <div role="status">{saved ? t('فایل پیش‌نویس آمادهٔ دریافت شد؛ درخواست به دفتر ارسال نشده است.') : ''}</div>
  </form>
}
