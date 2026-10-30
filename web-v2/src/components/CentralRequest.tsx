import {useEffect,useRef,useState} from 'react'
import {submitIntake,intakeErrorMessage} from '../lib/intake-client'
type Widget={render:(el:HTMLElement,options:Record<string,unknown>)=>string;remove:(id:string)=>void;reset:(id:string)=>void}
declare global {interface Window{turnstile?:Widget}}
let scriptPromise:Promise<void>|undefined
function loadWidget(){
  if(window.turnstile)return Promise.resolve()
  if(scriptPromise)return scriptPromise
  scriptPromise=new Promise<void>((resolve,reject)=>{
    const script=document.createElement('script');script.src='https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';script.async=true
    const timeout=setTimeout(()=>{script.remove();reject(new Error('widget_timeout'))},15000)
    script.onload=()=>{clearTimeout(timeout);window.turnstile?resolve():reject(new Error('widget_missing'))}
    script.onerror=()=>{clearTimeout(timeout);script.remove();reject(new Error('widget_failed'))}
    document.head.appendChild(script)
  }).catch(error=>{scriptPromise=undefined;throw error})
  return scriptPromise
}
export function CentralRequest({service,destination,variant,onLock}:{service:string;destination:string;variant:string;onLock:()=>void}){
  const [contact,setContact]=useState('');const [consent,setConsent]=useState(false);const [token,setToken]=useState('')
  const [busy,setBusy]=useState(false);const [started,setStarted]=useState(false);const [error,setError]=useState('');const [receipt,setReceipt]=useState('')
  const [copyStatus,setCopyStatus]=useState('');const receiptText=useRef<HTMLTextAreaElement>(null)
  const requestId=useRef(crypto.randomUUID());const container=useRef<HTMLDivElement>(null);const widget=useRef<string|undefined>(undefined);const sending=useRef(false)
  const active=useRef(true)
  const sitekey=(import.meta.env as Record<string,string>).VITE_FAJR_TURNSTILE_SITEKEY
  const endpoint=(import.meta.env as Record<string,string>).VITE_FAJR_INTAKE_ENDPOINT||'/api/requests'
  useEffect(()=>{active.current=true;let canceled=false
    loadWidget().then(()=>{if(canceled||!container.current)return;widget.current=window.turnstile!.render(container.current,{sitekey,action:'fajr_intake',size:'flexible',callback:(value:string)=>{if(active.current)setToken(value)},'expired-callback':()=>{if(active.current)setToken('')},'error-callback':()=>{if(active.current){setToken('');setError('تأیید امنیتی بارگذاری نشد؛ دوباره تلاش کنید.')}}})}).catch(()=>{if(!canceled)setError('تأیید امنیتی در دسترس نیست؛ فعلاً از راه تماس دفتر استفاده کنید.')})
    return()=>{canceled=true;active.current=false;if(widget.current)window.turnstile?.remove(widget.current)}
  },[sitekey])
  async function send(){
    if(sending.current||receipt)return
    if(!consent){setError('برای ثبت، رضایت تماس را تأیید کنید.');return}
    const value=contact.trim()
    if(!value.endsWith('@example.invalid')||value.length<7||value.length>120||(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)&&!/^\+?[0-9 ()-]{7,24}$/.test(value))){setError('برای آزمون، ایمیل ساختگی مانند qa@example.invalid بنویسید.');return}
    if(!token){setError('ابتدا تأیید امنیتی را کامل کنید.');return}
    sending.current=true;setBusy(true);setStarted(true);setError('');onLock()
    let completed=false
    try{const result=await submitIntake({requestId:requestId.current,service,destination,variant,contact:value,consent:true,challenge:token,website:''},fetch,endpoint);completed=true;if(active.current)setReceipt(result.receipt)}
    catch(reason){if(active.current)setError(intakeErrorMessage(reason))}
    finally{sending.current=false;if(active.current){setBusy(false);setToken('');if(!completed&&widget.current)window.turnstile?.reset(widget.current)}}
  }
  const receiptSummary=['فجر پارسا — رسید درخواست اولیه',`شمارهٔ کامل رسید: ${receipt}`,`مقصد: ${destination}`,`خدمت: ${variant||service}`,'این رسید تأیید ویزا یا نتیجهٔ بررسی نیست.','پیگیری آنلاین هنوز فعال نیست؛ هنگام تماس با دفتر شمارهٔ کامل رسید را ارائه کنید.'].join('\n')
  async function copyReceipt(){
    try{await navigator.clipboard.writeText(receiptSummary);if(active.current)setCopyStatus('رسید کپی شد.')}
    catch{receiptText.current?.focus();receiptText.current?.select();if(active.current)setCopyStatus('کپی خودکار ممکن نشد؛ متن رسید را انتخاب و کپی کنید.')}
  }
  return <section className="central-request" aria-labelledby="central-request-title">
    <h3 id="central-request-title">ثبت بررسی اولیه در دفتر</h3>
    <p className="draft-note">بررسی اتصال: فقط ایمیل ساختگی با پایان @example.invalid وارد کنید. کشور، خدمت انتخاب‌شده و راه تماس ثبت می‌شود؛ زمان سفر، تعداد نفرات و اسناد در این مرحله ارسال نمی‌شوند.</p>
    {receipt?<div><div role="status"><strong>درخواست اولیه ثبت شد</strong></div><p>مقصد: {destination} · خدمت: {variant||service}</p><p>رسید ثبت: <bdi>{receipt}</bdi></p><label htmlFor="intake-receipt">متن رسید برای نگهداری و پیگیری</label><textarea id="intake-receipt" ref={receiptText} className="request-summary-text" readOnly rows={7} value={receiptSummary}/><button type="button" className="secondary-action" onClick={copyReceipt}>کپی رسید ثبت</button><p role="status">{copyStatus}</p><small>پیگیری آنلاین هنوز فعال نیست. هنگام تماس با دفتر شمارهٔ کامل رسید را ارائه کنید. این رسید تأیید ویزا یا نتیجهٔ بررسی نیست.</small></div>:<>
      <label htmlFor="intake-contact">شماره تماس یا ایمیل</label><input id="intake-contact" type="text" dir="auto" maxLength={120} value={contact} disabled={started} autoComplete="off" onChange={event=>setContact(event.target.value)}/>
      <label className="intake-consent"><input type="checkbox" checked={consent} disabled={started} onChange={event=>setConsent(event.target.checked)}/> رضایت دارم اطلاعات همین درخواست برای بررسی و تماس دفتر ذخیره شود.</label>
      <div ref={container}/><button type="button" className="primary-action" disabled={busy||!token} onClick={send}>{busy?'در حال ثبت…':started?'بررسی دوبارهٔ همین درخواست':'ثبت درخواست اولیه'}</button>
      {started&&<p className="draft-note">برای جلوگیری از ثبت تکراری، اطلاعات این تلاش ثابت مانده است. تازه‌کردن صفحه یا شروع فرم جدید ممکن است درخواست دیگری ایجاد کند.</p>}
    </>}
    {error&&<p role="alert">{error}</p>}
  </section>
}
export const centralIntakeEnabled=(location.origin==='https://qa-fajr-visual-review-202610.fajr-parsa-qa.pages.dev'||location.hostname==='127.0.0.1')&&(import.meta.env as Record<string,string>).VITE_FAJR_INTAKE_ENABLED==='true'&&Boolean((import.meta.env as Record<string,string>).VITE_FAJR_TURNSTILE_SITEKEY)
