import { useState } from 'react'
import { CheckCircle2, ClipboardCopy, Download } from 'lucide-react'
import type { SiteLanguage } from '../content/site-i18n'
import './intake-receipt.css'

const labels = {
  fa: {title:'درخواست شما ثبت شد',reference:'شمارهٔ پیگیری',copy:'کاپی شماره',save:'دریافت رسید',copied:'شمارهٔ رسید کپی شد.',copyError:'کپی ممکن نشد؛ شماره را انتخاب و دستی کپی کنید.',description:'این رسید فقط دریافت درخواست را تأیید می‌کند؛ نتیجهٔ ویزا یا رزرو نیست.',service:'خدمت',destination:'مقصد',company:'فجر پارسا',filename:'fajr-parsa-receipt'},
  ps: {title:'ستاسې غوښتنه ثبت شوه',reference:'د تعقیب شمېره',copy:'شمېره کاپي کړئ',save:'رسید واخلئ',copied:'د رسید شمېره کاپي شوه.',copyError:'کاپي ممکن نه شوه؛ شمېره په خپله کاپي کړئ.',description:'دا رسید یوازې د غوښتنې ترلاسه کېدل ښيي؛ د ویزې یا ریزرف پایله نه ده.',service:'خدمت',destination:'مقصد',company:'فجر پارسا',filename:'fajr-parsa-receipt'},
  en: {title:'Enquiry received',reference:'Tracking number',copy:'Copy number',save:'Get receipt',copied:'Receipt number copied.',copyError:'Could not copy automatically; select the number to copy it.',description:'This receipt confirms receipt of your enquiry, not a visa or booking approval.',service:'Service',destination:'Destination',company:'Fajr Parsa',filename:'fajr-parsa-receipt'},
  ar: {title:'تم تسجيل الطلب',reference:'رقم المتابعة',copy:'نسخ الرقم',save:'تنزيل الإيصال',copied:'تم نسخ رقم الإيصال.',copyError:'تعذّر النسخ؛ يمكنك تحديد الرقم ونسخه يدوياً.',description:'يؤكد هذا الإيصال استلام الاستفسار فقط، وليس الموافقة على التأشيرة أو الحجز.',service:'الخدمة',destination:'الوجهة',company:'فجر بارسا',filename:'fajr-parsa-receipt'}
} as const

/** Display only an authenticated server response already validated by intake-client.
 * Never mint a reference on the client or put private contact data in a file/URL. */
export function IntakeReceipt({ receipt, service, destination, language }: {
  receipt: string; service: string; destination: string; language: SiteLanguage
}) {
  const [copyStatus,setCopyStatus]=useState('')
  const t=labels[language]
  async function copy(){
    try { await navigator.clipboard.writeText(receipt);setCopyStatus(t.copied) }
    catch {setCopyStatus(t.copyError)}
  }
  function download(){
    const payload = [t.company,t.title,t.reference+': '+receipt,t.service+': '+service,t.destination+': '+destination,'',t.description].join('\n')
    const url=URL.createObjectURL(new Blob(['\uFEFF'+payload],{type:'text/plain;charset=utf-8'}))
    try {
      const a=document.createElement('a');a.href=url;a.download=t.filename+'.txt';document.body.appendChild(a);a.click();a.remove()
    } finally {setTimeout(()=>URL.revokeObjectURL(url),1000)}
  }
  return <div className="fp-intake-receipt" data-receipt-source="server" role="status">
    <div className="fp-receipt-brand" aria-hidden="true">FAJR PARSA <span>•</span> {t.company}</div>
    <div className="fp-intake-receipt-heading">
      <CheckCircle2 size={22} aria-hidden="true"/>
      <strong>{t.title}</strong>
    </div>
    <label htmlFor="fp-server-receipt">{t.reference}</label>
    <output id="fp-server-receipt" tabIndex={0} dir="ltr">{receipt}</output>
    <div className="fp-intake-receipt-actions">
      <button type="button" className="fp-receipt-copy" onClick={copy}><ClipboardCopy size={17} aria-hidden="true"/>{t.copy}</button>
      <button type="button" className="fp-receipt-save" onClick={download}><Download size={17} aria-hidden="true"/>{t.save}</button>
    </div>
    <p aria-live="polite" className="fp-receipt-copy-status">{copyStatus}</p>
    <p className="fp-intake-receipt-note">{t.description}</p>
  </div>
}
