import { useState } from 'react'
import { CheckCircle2, ClipboardCopy, Download, Mail, MessageCircle } from 'lucide-react'
import { officeEmail, officeWhatsApp } from '../lib/office-contact'
import type { SiteLanguage } from '../content/site-i18n'
import './intake-receipt.css'

const labels = {
  fa: {title:'درخواست شما ثبت شد',reference:'شمارهٔ پیگیری',copy:'کاپی شماره',save:'دریافت رسید',copied:'شمارهٔ رسید کپی شد.',copyError:'کپی ممکن نشد؛ شماره را انتخاب و دستی کپی کنید.',description:'این رسید فقط دریافت درخواست را تأیید می‌کند؛ نتیجهٔ ویزا یا رزرو نیست.',service:'خدمت',destination:'مقصد',company:'فجر پارسا',filename:'fajr-parsa-receipt'},
  ps: {title:'ستاسې غوښتنه ثبت شوه',reference:'د تعقیب شمېره',copy:'شمېره کاپي کړئ',save:'رسید واخلئ',copied:'د رسید شمېره کاپي شوه.',copyError:'کاپي ممکن نه شوه؛ شمېره په خپله کاپي کړئ.',description:'دا رسید یوازې د غوښتنې ترلاسه کېدل ښيي؛ د ویزې یا ریزرف پایله نه ده.',service:'خدمت',destination:'مقصد',company:'فجر پارسا',filename:'fajr-parsa-receipt'},
  en: {title:'Enquiry received',reference:'Tracking number',copy:'Copy number',save:'Get receipt',copied:'Receipt number copied.',copyError:'Could not copy automatically; select the number to copy it.',description:'This receipt confirms receipt of your enquiry, not a visa or booking approval.',service:'Service',destination:'Destination',company:'Fajr Parsa',filename:'fajr-parsa-receipt'},
  ar: {title:'تم تسجيل الطلب',reference:'رقم المتابعة',copy:'نسخ الرقم',save:'تنزيل الإيصال',copied:'تم نسخ رقم الإيصال.',copyError:'تعذّر النسخ؛ يمكنك تحديد الرقم ونسخه يدوياً.',description:'يؤكد هذا الإيصال استلام الاستفسار فقط، وليس الموافقة على التأشيرة أو الحجز.',service:'الخدمة',destination:'الوجهة',company:'فجر بارسا',filename:'fajr-parsa-receipt'}
} as const
const followup:Record<SiteLanguage,{summary:string;whatsapp:string;email:string;note:string;subject:string}> = {
  fa:{summary:'پیگیری از دفتر (اختیاری)',whatsapp:'واتساپ دفتر',email:'ایمیل دفتر',note:'درخواست قبلاً ثبت شده است؛ نیاز به ارسال دوباره نیست. پیام فقط با انتخاب شما فرستاده می‌شود.',subject:'پیگیری درخواست ثبت‌شدهٔ فجرپارسا'},
  ps:{summary:'له دفتر سره اړیکه (اختياري)',whatsapp:'د دفتر واتساپ',email:'د دفتر برېښنالیک',note:'غوښتنه مخکې ثبت شوې ده؛ بیا ثبت ته اړتیا نشته. پیغام یوازې ستاسو په خوښه لېږل کېږي.',subject:'د فجر پارسا ثبت شوې غوښتنې تعقیب'},
  en:{summary:'Contact the office (optional)',whatsapp:'Office WhatsApp',email:'Office email',note:'Your enquiry is already registered. Do not submit again. A message is sent only if you choose to send it.',subject:'Fajr Parsa registered enquiry follow-up'},
  ar:{summary:'التواصل مع المكتب (اختياري)',whatsapp:'واتساب المكتب',email:'البريد الإلكتروني',note:'طلبك مسجل بالفعل؛ لا حاجة لإرساله مرة أخرى. لن تُرسل رسالة إلا باختيارك.',subject:'متابعة طلب مسجل لدى فجر بارسا'}
}

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
    <details className="fp-receipt-contact">
      <summary>{followup[language].summary}</summary>
      <div className="fp-receipt-contact-links">
        <a href={'https://wa.me/'+officeWhatsApp} target="_blank" rel="noopener noreferrer"><MessageCircle size={16} aria-hidden="true"/>{followup[language].whatsapp}</a>
        <a href={'mailto:'+officeEmail+'?subject='+encodeURIComponent(followup[language].subject)}><Mail size={16} aria-hidden="true"/>{followup[language].email}</a>
      </div>
      <p>{followup[language].note}</p>
    </details>
  </div>
}
