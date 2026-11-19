import {useEffect,useState} from 'react'
import {CheckCircle2,Clock3,Fingerprint,KeyRound,LockKeyhole,
 RefreshCw,ShieldCheck,ShieldAlert,LogOut,Mail,Link2,Smartphone,ExternalLink,Globe2,BriefcaseBusiness,Layers,Palette} from 'lucide-react'
import type {AdminLanguage} from './console-model'
import {readSecurityOverview} from './security-overview'
import type {SecurityReadResult,SecurityOverview} from './security-overview'
import {checkOfficeControls} from './office-control-diagnostics'
import type {OfficeProbeReport,OfficeProbeName,OfficeProbeStatus} from './office-control-diagnostics'
import './security-center.css'

const words={
 fa:{
  heading:'امنیت و هویت حساب',intro:'وضعیت واقعی حساب مدیر از نشست امن و مجوز سرور؛ بدون نمایش رمز یا توکن.',
  verified:'اطلاعات مجاز · فقط مشاهده',preview:'این صفحه فقط نمونهٔ طراحی است؛ تغییر واقعی باید در کنسول خصوصی انجام شود.',
  enterReal:'بازکردن کنسول خصوصی و ورود امن',realActions:'کنترول‌های واقعی دفتر',officeLink:'مدیریت درخواست‌ها',siteLink:'تنظیمات وب‌سایت',resourcesLink:'بررسی منابع متصل',themeLink:'تنظیم ظاهر کنسول',
  actionsNote:'این مسیرها به ابزارهای فعلی دفتر وصل هستند. تغییر اطلاعات فقط با مجوز و تأیید سرور انجام می‌شود.',
  probeTitle:'آزمایش اتصال کنترل‌ها',probeIntro:'با یک لمس، فقط اتصال و مجوز سه بخش را از سرور می‌خواند؛ هیچ موردی ذخیره یا ویرایش نمی‌شود.',probeRun:'بررسی واقعی اتصال‌ها',probeRunning:'در حال بررسی امن…',probeIdle:'برای شروع روی دکمهٔ بررسی بزنید.',probeIdentity:'ورود و مجوز مدیر',probeWebsite:'تنظیمات وب‌سایت',probeResources:'منابع Cloudflare',probeReady:'اتصال تأیید شد',probeUnverified:'وضعیت نامشخص',probeCanEdit:'مجوز ویرایش اعلام‌شده',probeCanPublish:'مجوز انتشار اعلام‌شده',probeYes:'دارد',probeNo:'ندارد',probeUntried:'این بررسی هیچ ذخیره یا نشری را آزمایش نمی‌کند.',
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
  verified:'Verified private view · read only',preview:'This is a design-only preview; real changes require the private console.',
  enterReal:'Open private console and sign in securely',realActions:'Working office controls',officeLink:'Manage requests',siteLink:'Website settings',resourcesLink:'Connected resources',themeLink:'Console appearance',
  actionsNote:'These lead to existing authorized office tools. Any changes are checked and confirmed by the server.',
  probeTitle:'Check real controls',probeIntro:'One tap checks connectivity and permissions on three existing server paths. No data is changed.',probeRun:'Run secure control check',probeRunning:'Checking securely…',probeIdle:'Press the check button to start.',probeIdentity:'Owner access & session',probeWebsite:'Website settings',probeResources:'Cloudflare resources',probeReady:'Verified connection',probeUnverified:'Unverified status',probeCanEdit:'Server-reported edit permission',probeCanPublish:'Server-reported publish permission',probeYes:'Allowed',probeNo:'Not allowed',probeUntried:'No actual edit or publication is tested.',
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
 const [probing,setProbing]=useState(false)
 const [probe,setProbe]=useState<OfficeProbeReport|null>(null)
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
 async function runControlCheck(){
  if(!privateOffice||probing)return
  setProbing(true);setProbe(null)
  try{setProbe(await checkOfficeControls())}
  finally{setProbing(false)}
 }
 const probeTitles:Record<OfficeProbeName,string>={identity:tx.probeIdentity,website:tx.probeWebsite,resources:tx.probeResources}
 const probeResult=(status:OfficeProbeStatus)=>status==='ready'?tx.probeReady:status==='sign_in_required'?tx.sign_in_required:status==='access_denied'?tx.access_denied:status==='rate_limited'?tx.rate_limited:tx.unavailable
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
  {!privateOffice?<div className="fpx-security-preview-notice" role="status"><p>{tx.preview}</p><a className="fpx-security-launch" href="https://fajr-office-qa.khoojafahim.workers.dev/?next=console-security"><LockKeyhole size={17}/>{tx.enterReal}<ExternalLink size={15}/></a></div>:
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
  {privateOffice&&data&&<section className="fpx-security-workflow" aria-label={tx.realActions}>
   <div className="fpx-security-subheading"><h2>{tx.realActions}</h2></div>
   <div className="fpx-security-workflow-grid">
    <a href="/"><BriefcaseBusiness size={19}/><span>{tx.officeLink}</span><ExternalLink size={15}/></a>
    <a href="/site-settings"><Globe2 size={19}/><span>{tx.siteLink}</span><ExternalLink size={15}/></a>
    <a href="/resources"><Layers size={19}/><span>{tx.resourcesLink}</span><ExternalLink size={15}/></a>
    <a href="#/designsystem"><Palette size={19}/><span>{tx.themeLink}</span><ExternalLink size={15}/></a>
   </div><p className="fpx-security-workflow-note">{tx.actionsNote}</p>
  </section>}
  {privateOffice&&<section className="fpx-security-diagnostic" aria-label={tx.probeTitle}>
   <div className="fpx-security-diagnostic-head"><div><h2>{tx.probeTitle}</h2><p>{tx.probeIntro}</p></div>
    <button className="fpx-security-refresh" type="button" disabled={probing} aria-busy={probing} onClick={runControlCheck}><RefreshCw size={16}/>{probing?tx.probeRunning:tx.probeRun}</button>
   </div>
   {probe?<div className="fpx-security-probe-list" role="status" aria-live="polite">
    {probe.checks.map(item=><div className="fpx-security-probe-row" key={item.name}>
     <strong>{probeTitles[item.name]}</strong>
     <span className={item.status==='ready'?'is-verified':'is-unverified'}>{probeResult(item.status)}</span>
     {item.name==='website'&&item.status==='ready'&&<small>{tx.probeCanEdit}: {item.canEdit?tx.probeYes:tx.probeNo} · {tx.probeCanPublish}: {item.canPublish?tx.probeYes:tx.probeNo}</small>}
    </div>)}
    <p className="fpx-security-workflow-note">{tx.probeUntried}</p>
   </div>:<p className="fpx-security-workflow-note" role="status">{probing?tx.probeRunning:tx.probeIdle}</p>}
  </section>}
  <div className="fpx-security-subheading"><h2>{tx.methods}</h2></div>
  <div className="fpx-security-methods">
   <article><KeyRound size={21}/><div><strong>{tx.emailPassword}</strong><small>{tx.passwordReady}</small></div></article>
   {providers.map(([id,name])=><article key={id}><Link2 size={21}/><div><strong>{name}</strong><small>{!data?tx.unknown:data.linkedProviders.includes(id as SecurityOverview['linkedProviders'][number])?tx.linked:tx.notLinked}</small></div></article>)}
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
