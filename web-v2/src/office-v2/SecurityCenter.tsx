import {useEffect,useState} from 'react'
import {CheckCircle2,Clock3,ExternalLink,Fingerprint,KeyRound,LockKeyhole,
 RefreshCw,ShieldCheck,ShieldAlert,LogOut,Mail,Link2,Smartphone} from 'lucide-react'
import type {AdminLanguage} from './console-model'
import {readSecurityOverview} from './security-overview'
import type {SecurityReadResult,SecurityOverview} from './security-overview'
import './security-center.css'

const words={
 fa:{
  heading:'امنیت و هویت حساب',intro:'وضعیت واقعی حساب مدیر از نشست امن و مجوز سرور؛ بدون نمایش رمز یا توکن.',
  verified:'اطلاعات مجاز · فقط مشاهده',preview:'برای مشاهدهٔ اطلاعات واقعی، وارد کنسول خصوصی شوید.',
  loading:'در حال بررسی نشست و مجوز حساب…',refresh:'بررسی دوباره',active:'نشست فعلی',
  personal:'این دستگاه تا ۷ روز به یاد سپرده شده است.',normal:'نشست عادی؛ تازه‌سازی صفحه به‌تنهایی آن را خاتمه نمی‌دهد.',
  expires:'اعتبار نشست تا',email:'تأیید ایمیل',mfa:'Authenticator (کد ۶ رقمی)',
  methods:'روش‌های ورود و اتصال',emailPassword:'ایمیل و رمز',passwordReady:'روش ورود فعلی دفتر',
  linked:'متصل به هویت حساب',notLinked:'اتصال این هویت تأیید نشده',
  verifiedEmail:'تأییدشده',notVerifiedEmail:'تأییدنشده',unknown:'نامشخص — بررسی لازم',
  totpEnabled:'عامل تأییدشده ثبت شده',totpOff:'عامل فعال ثبت نشده',totpUnknown:'وضعیت عامل قابل تأیید نیست',
  options:'گزینه‌های بعدی',passkey:'Passkey',magic:'Magic Link / OTP',recovery:'بازیابی حساب',
  future:'پس از پیکربندی، تست و تأیید مالک',recoveryReady:'بازیابی رمز از صفحهٔ ورود موجود است؛ روش ورود تازه فعال نشده.',
  safety:'ورود با Google، GitHub یا Microsoft به‌تنهایی مجوز دسترسی به کنسول نمی‌دهد؛ اجازهٔ مدیر همچنان در سرور بررسی می‌شود.',
  logout:'خروج امن از این دستگاه',logoutConfirm:'آیا می‌خواهید نشست همین دستگاه را پایان دهید؟',
  logoutFail:'خروج تأیید نشد. از دفتر اصلی دوباره تلاش کنید.',
  sign_in_required:'نشست منقضی شده یا ورود لازم است. دوباره وارد دفتر شوید.',
  access_denied:'این حساب اجازهٔ دیدن مرکز امنیت مدیر را ندارد.',
  rate_limited:'درخواست‌ها محدود شده‌اند. کمی بعد دوباره بررسی کنید.',
  unavailable:'پاسخ معتبر امنیت حساب دریافت نشد؛ وضعیت ساختگی نشان داده نمی‌شود.'
 },
 en:{
  heading:'Account identity & security',intro:'Your verified owner-account status from the secure session and server permissions; no password or tokens are exposed.',
  verified:'Verified private view · read only',preview:'Sign in to the private console to see real account status.',
  loading:'Checking verified session and account permissions…',refresh:'Refresh status',active:'Current session',
  personal:'This personal device is remembered for up to 7 days.',normal:'Normal browser session; refreshing the page alone does not end it.',
  expires:'Session expires',email:'Verified email',mfa:'Authenticator (6-digit code)',
  methods:'Login and linked identities',emailPassword:'Email & password',passwordReady:'Existing staff sign-in',
  linked:'Linked to this identity',notLinked:'Identity connection not verified',
  verifiedEmail:'Verified',notVerifiedEmail:'Not verified',unknown:'Unknown — needs review',
  totpEnabled:'Verified factor enrolled',totpOff:'No active factor reported',totpUnknown:'Factor status could not be verified',
  options:'Future options',passkey:'Passkey',magic:'Magic Link / OTP',recovery:'Account recovery',
  future:'Requires configuration, tests and owner approval',recoveryReady:'Password recovery exists on the login page; no new login method was enabled.',
  safety:'Signing in with Google, GitHub or Microsoft alone never grants console access. Your owner permission is checked again by the server.',
  logout:'Secure sign out from this device',logoutConfirm:'End the session on this device?',
  logoutFail:'Sign out was not confirmed. Retry from the Office page.',
  sign_in_required:'Session expired or sign-in required. Please sign in again.',
  access_denied:'This account is not authorized to see owner security status.',
  rate_limited:'Requests are rate-limited. Try again later.',
  unavailable:'No verified security response was received; sample values are not shown.'
 }
} as const

export function SecurityCenter({lang,privateOffice}:{lang:AdminLanguage;privateOffice:boolean}){
 const tx=words[lang]
 const [revision,setRevision]=useState(0)
 const [state,setState]=useState<SecurityReadResult|null>(null)
 const [signingOut,setSigningOut]=useState(false)
 const [logoutError,setLogoutError]=useState('')
 useEffect(()=>{
  if(!privateOffice)return
  let active=true
  setState(null)
  readSecurityOverview().then(v=>{if(active)setState(v)})
  return()=>{active=false}
 },[privateOffice,revision])
 const data:SecurityOverview|null=privateOffice&&state?.status==='ready'?state.data:null
 const error=state&&state.status!=='ready'?tx[state.status]:null
 const emailStatus=data?.emailVerification==='verified'?tx.verifiedEmail:data?.emailVerification==='not_verified'?tx.notVerifiedEmail:tx.unknown
 const totpStatus=data?.totp==='enabled'?tx.totpEnabled:data?.totp==='not_enrolled'?tx.totpOff:tx.totpUnknown
 const providers:[string,string][]=[['google','Google'],['github','GitHub'],['azure','Microsoft']]
 async function signOut(){
  if(!privateOffice||signingOut||!window.confirm(tx.logoutConfirm))return
  setSigningOut(true)
  setLogoutError('')
  try{
   const r=await fetch('/api/session/logout',{
    method:'POST',credentials:'same-origin',
    headers:{'X-FP-Office-Request':'same-origin'},cache:'no-store',redirect:'error'
   })
   if(!r.ok)throw Error('logout_failed')
   window.location.replace('/')
  }catch{setLogoutError(tx.logoutFail);setSigningOut(false)}
 }
 return <section className="fpx-security" aria-label={tx.heading}>
  <div className="fpx-security-heading">
   <div className="fpx-security-title"><span className="fpx-security-symbol"><ShieldCheck size={22}/></span><div>
    <p className="fpx-security-kicker">{tx.verified}</p><h1>{tx.heading}</h1><p>{tx.intro}</p>
   </div></div>
   <button type="button" className="fpx-security-refresh" disabled={!privateOffice||!state}
    onClick={()=>setRevision(x=>x+1)}><RefreshCw size={16}/>{tx.refresh}</button>
  </div>
  {!privateOffice?<p className="fpx-security-feedback" role="status">{tx.preview}</p>:
   !state?<p className="fpx-security-feedback" role="status">{tx.loading}</p>:
   error?<p className="fpx-security-feedback" role="alert">{error}</p>:
   <div className="fpx-security-overview">
    <article className="fpx-security-card"><div className="fpx-security-card-top"><Clock3 size={19}/><h2>{tx.active}</h2></div>
     <p>{data?.session.remember?tx.personal:tx.normal}</p>
     <div className="fpx-security-status"><span>{tx.expires}</span><time dateTime={data?.session.expiresAt}>{data?.session.expiresAt?new Date(data.session.expiresAt).toLocaleString(lang==='fa'?'fa-AF':'en-US',{timeZone:'Asia/Kabul',dateStyle:'medium',timeStyle:'short'}):tx.unknown}</time></div>
    </article>
    <article className="fpx-security-card"><div className="fpx-security-card-top"><Mail size={19}/><h2>{tx.email}</h2></div>
     <strong className="fpx-security-result"><CheckCircle2 size={17}/>{emailStatus}</strong>
     <p>{tx.emailPassword} · {tx.passwordReady}</p>
    </article>
    <article className="fpx-security-card"><div className="fpx-security-card-top"><ShieldCheck size={19}/><h2>{tx.mfa}</h2></div>
     <strong className="fpx-security-result"><ShieldAlert size={17}/>{totpStatus}</strong>
     <p>{tx.future}</p>
    </article>
   </div>}
  <div className="fpx-security-subheading"><h2>{tx.methods}</h2></div>
  <div className="fpx-security-methods">
   <article><KeyRound size={21}/><div><strong>{tx.emailPassword}</strong><small>{tx.passwordReady}</small></div></article>
   {providers.map(([id,name])=><article key={id}><Link2 size={21}/><div><strong>{name}</strong><small>{data?.linkedProviders.includes(id as SecurityOverview['linkedProviders'][number])?tx.linked:tx.notLinked}</small></div></article>)}
  </div>
  <div className="fpx-security-subheading"><h2>{tx.options}</h2></div>
  <div className="fpx-security-methods">
   <article><Fingerprint size={21}/><div><strong>{tx.passkey}</strong><small>{tx.future}</small></div></article>
   <article><Smartphone size={21}/><div><strong>{tx.magic}</strong><small>{tx.future}</small></div></article>
   <article><Mail size={21}/><div><strong>{tx.recovery}</strong><small>{tx.recoveryReady}</small></div></article>
  </div>
  <p className="fpx-security-note"><LockKeyhole size={16}/>{tx.safety}</p>
  {privateOffice&&data&&<div className="fpx-security-actions">
   <button type="button" className="fpx-security-signout" disabled={signingOut} onClick={signOut}>
    <LogOut size={17}/>{tx.logout}
   </button>
   {logoutError&&<p role="alert">{logoutError}</p>}
  </div>}
 </section>
}
