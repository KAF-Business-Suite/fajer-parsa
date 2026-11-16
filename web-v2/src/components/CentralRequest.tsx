import {useEffect,useRef,useState} from 'react'
import {submitIntake,intakeErrorMessage} from '../lib/intake-client'
import {siteText,type SiteLanguage} from '../content/site-i18n'

// Localized only within the guarded, disabled-by-default synthetic intake component.
// The 324-key site catalog stays canonical and keeps its exact-key contract.
const centralCopy: Record<string, {ps:string;en:string;ar:string}> = {
  "تأیید امنیتی بارگذاری نشد؛ دوباره تلاش کنید.": {ps:"امنیتي تایید بار نه شو؛ بیا هڅه وکړئ.",en:"Security verification did not load; please try again.",ar:"تعذّر تحميل التحقق الأمني؛ حاول مرة أخرى."},
  "تأیید امنیتی در دسترس نیست؛ فعلاً از راه تماس دفتر استفاده کنید.": {ps:"امنیتي تایید اوس نشته؛ له دفتر سره اړیکه ونیسئ.",en:"Security verification is unavailable; please contact the office.",ar:"التحقق الأمني غير متاح؛ يرجى التواصل مع المكتب."},
  "برای ثبت، رضایت تماس را تأیید کنید.": {ps:"د ثبت لپاره د اړیکې رضایت تایید کړئ.",en:"Please consent before registering the request.",ar:"يرجى الموافقة قبل تسجيل الطلب."},
  "شماره تماس یا ایمیل معتبر بنویسید.": {ps:"د اړیکې سمه شمېره یا برېښنالیک ولیکئ.",en:"Enter a valid phone number or email address.",ar:"أدخل رقم هاتف أو بريداً إلكترونياً صالحاً."},
  "ابتدا تأیید امنیتی را کامل کنید.": {ps:"لومړی امنیتي تایید بشپړ کړئ.",en:"Complete security verification first.",ar:"أكمل التحقق الأمني أولاً."},
  "درخواست‌ها زیاد شده‌اند؛ کمی بعد دوباره تلاش کنید.": {ps:"غوښتنې ډېرې شوې دي؛ لږ وروسته بیا هڅه وکړئ.",en:"Too many requests; please try again later.",ar:"طلبات كثيرة؛ يرجى المحاولة لاحقاً."},
  "تأیید امنیتی کامل نشد؛ دوباره تأیید کنید.": {ps:"امنیتي تایید بشپړ نه شو؛ بیا یې تایید کړئ.",en:"Security verification failed; please verify again.",ar:"فشل التحقق الأمني؛ حاول التحقق مجدداً."},
  "اطلاعات درخواست پذیرفته نشد؛ برای راهنمایی با دفتر تماس بگیرید.": {ps:"د غوښتنې معلومات ونه منل شول؛ له دفتر سره اړیکه ونیسئ.",en:"Request details were not accepted; please contact the office.",ar:"لم تُقبل بيانات الطلب؛ يرجى الاتصال بالمكتب."},
  "رسید دریافت نشد؛ وضعیت ثبت قطعی نیست. برای بررسی دوباره، همین درخواست را تکرار کنید.": {ps:"رسید ترلاسه نه شو؛ د ثبت حالت روښانه نه دی. همدا غوښتنه بیا وڅېړئ.",en:"No receipt was received. Registration is unconfirmed; retry this same request.",ar:"لم يتم استلام إيصال؛ حالة التسجيل غير مؤكدة. أعد محاولة الطلب نفسه."},
  "ثبت بررسی اولیه در دفتر": {ps:"په دفتر کې د لومړنۍ ارزونې ثبت",en:"Register a preliminary enquiry",ar:"تسجيل طلب مراجعة أولية"},
  "آزمایشی: فقط اطلاعات ساختگی وارد کنید. کشور، خدمت انتخاب‌شده و راه تماس ثبت می‌شود؛ زمان سفر، تعداد نفرات و اسناد در این مرحله ارسال نمی‌شوند.": {ps:"ازمایښتي: یوازې جوړ شوي معلومات ولیکئ. هېواد، خدمت او د اړیکې لاره ثبتېږي؛ د سفر وخت، د کسانو شمېر او اسناد نه لېږل کېږي.",en:"TEST ONLY: Enter synthetic information. Country, service and contact are recorded; dates, party size and documents are not submitted.",ar:"اختبار فقط: أدخل بيانات وهمية. تُسجّل الدولة والخدمة وطريقة التواصل؛ ولا تُرسل التواريخ أو عدد المسافرين أو الوثائق."},
  "درخواست اولیه ثبت شد": {ps:"لومړنۍ غوښتنه ثبت شوه",en:"Preliminary enquiry received",ar:"تم تسجيل الطلب الأولي"},
  "رسید ثبت: ": {ps:"د ثبت رسید: ",en:"Receipt: ",ar:"الإيصال: "},
  "این رسید تأیید ویزا یا نتیجهٔ بررسی نیست. برای پیگیری آن را نگه دارید.": {ps:"دا رسید د ویزې تایید یا د ارزونې پایله نه ده. د تعقیب لپاره یې وساتئ.",en:"This is not visa approval or a decision. Keep the receipt for follow-up.",ar:"هذا الإيصال ليس موافقة على تأشيرة أو نتيجة مراجعة؛ احتفظ به للمتابعة."},
  "شماره تماس یا ایمیل": {ps:"د اړیکې شمېره یا برېښنالیک",en:"Phone number or email",ar:"رقم الهاتف أو البريد الإلكتروني"},
  "رضایت دارم اطلاعات همین درخواست برای بررسی و تماس دفتر ذخیره شود.": {ps:"رضایت لرم چې د دې غوښتنې معلومات د ارزونې او د دفتر د اړیکې لپاره وساتل شي.",en:"I consent to storing this enquiry for review and office follow-up.",ar:"أوافق على تخزين معلومات هذا الطلب للمراجعة والتواصل من المكتب."},
  "در حال ثبت…": {ps:"د ثبت په حال کې…",en:"Registering…",ar:"جارٍ التسجيل…"},
  "بررسی دوبارهٔ همین درخواست": {ps:"د همدې غوښتنې بیا ارزونه",en:"Retry this request",ar:"إعادة محاولة الطلب نفسه"},
  "ثبت درخواست اولیه": {ps:"لومړنۍ غوښتنه ثبت کړئ",en:"Register enquiry",ar:"تسجيل الطلب"},
  "برای جلوگیری از ثبت تکراری، اطلاعات این تلاش ثابت مانده است. تازه‌کردن صفحه یا شروع فرم جدید ممکن است درخواست دیگری ایجاد کند.": {ps:"د تکراري ثبت د مخنیوي لپاره معلومات نه بدلېږي. د پاڼې تازه کول یا نوې فورمه ښايي بله غوښتنه جوړه کړي.",en:"This request's data is locked to prevent duplicates. Reloading or starting a new form may create a new request.",ar:"تم تثبيت بيانات هذه المحاولة لمنع التكرار. قد يؤدي تحديث الصفحة أو فتح نموذج جديد إلى إنشاء طلب آخر."},
}
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
export function CentralRequest({service,destination,variant,onLock,language='fa'}:{service:string;destination:string;variant:string;onLock:()=>void;language?:SiteLanguage}){
  const t=(value:string)=>language==='fa'?value:(centralCopy[value]?.[language]??siteText(value,language))
  const [contact,setContact]=useState('');const [consent,setConsent]=useState(false);const [token,setToken]=useState('')
  const [busy,setBusy]=useState(false);const [started,setStarted]=useState(false);const [error,setError]=useState('');const [receipt,setReceipt]=useState('')
  const requestId=useRef(crypto.randomUUID());const container=useRef<HTMLDivElement>(null);const widget=useRef<string|undefined>(undefined);const sending=useRef(false)
  const active=useRef(true)
  const sitekey=(import.meta.env as Record<string,string>).VITE_FAJR_TURNSTILE_SITEKEY
  useEffect(()=>{active.current=true;let canceled=false
    loadWidget().then(()=>{if(canceled||!container.current)return;widget.current=window.turnstile!.render(container.current,{sitekey,action:'fajr_intake',size:'flexible',callback:(value:string)=>{if(active.current)setToken(value)},'expired-callback':()=>{if(active.current)setToken('')},'error-callback':()=>{if(active.current){setToken('');setError(t('تأیید امنیتی بارگذاری نشد؛ دوباره تلاش کنید.'))}}})}).catch(()=>{if(!canceled)setError(t('تأیید امنیتی در دسترس نیست؛ فعلاً از راه تماس دفتر استفاده کنید.'))})
    return()=>{canceled=true;active.current=false;if(widget.current)window.turnstile?.remove(widget.current)}
  },[sitekey,language])
  async function send(){
    if(sending.current||receipt)return
    if(!consent){setError(t('برای ثبت، رضایت تماس را تأیید کنید.'));return}
    const value=contact.trim()
    if(value.length<7||value.length>120||(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)&&!/^\+?[0-9 ()-]{7,24}$/.test(value))){setError(t('شماره تماس یا ایمیل معتبر بنویسید.'));return}
    if(!token){setError(t('ابتدا تأیید امنیتی را کامل کنید.'));return}
    sending.current=true;setBusy(true);setStarted(true);setError('');onLock()
    let completed=false
    try{const result=await submitIntake({requestId:requestId.current,service,destination,variant,contact:value,consent:true,challenge:token,website:''});completed=true;if(active.current)setReceipt(result.receipt)}
    catch(reason){if(active.current)setError(t(intakeErrorMessage(reason)))}
    finally{sending.current=false;if(active.current){setBusy(false);setToken('');if(!completed&&widget.current)window.turnstile?.reset(widget.current)}}
  }
  return <section className="central-request" aria-labelledby="central-request-title">
    <h3 id="central-request-title">{t("ثبت بررسی اولیه در دفتر")}</h3>
    <p className="draft-note">{t("آزمایشی: فقط اطلاعات ساختگی وارد کنید. کشور، خدمت انتخاب‌شده و راه تماس ثبت می‌شود؛ زمان سفر، تعداد نفرات و اسناد در این مرحله ارسال نمی‌شوند.")}</p>
    {receipt?<div role="status"><strong>{t("درخواست اولیه ثبت شد")}</strong><p>{t("رسید ثبت: ")}<bdi>{receipt}</bdi></p><small>{t("این رسید تأیید ویزا یا نتیجهٔ بررسی نیست. برای پیگیری آن را نگه دارید.")}</small></div>:<>
      <label htmlFor="intake-contact">{t("شماره تماس یا ایمیل")}</label><input id="intake-contact" type="text" dir="auto" maxLength={120} value={contact} disabled={started} autoComplete="off" onChange={event=>setContact(event.target.value)}/>
      <label className="intake-consent"><input type="checkbox" checked={consent} disabled={started} onChange={event=>setConsent(event.target.checked)}/> {t("رضایت دارم اطلاعات همین درخواست برای بررسی و تماس دفتر ذخیره شود.")}</label>
      <div ref={container}/><button type="button" className="primary-action" disabled={busy||!token} onClick={send}>{busy?t('در حال ثبت…'):started?t('بررسی دوبارهٔ همین درخواست'):t('ثبت درخواست اولیه')}</button>
      {started&&<p className="draft-note">{t("برای جلوگیری از ثبت تکراری، اطلاعات این تلاش ثابت مانده است. تازه‌کردن صفحه یا شروع فرم جدید ممکن است درخواست دیگری ایجاد کند.")}</p>}
    </>}
    {error&&<p role="alert">{error}</p>}
  </section>
}
export const centralIntakeEnabled=(import.meta.env as Record<string,string>).VITE_FAJR_INTAKE_ENABLED==='true'&&Boolean((import.meta.env as Record<string,string>).VITE_FAJR_TURNSTILE_SITEKEY)
