import {useEffect,useState} from 'react'
import {LockKeyhole,RefreshCw,ShieldCheck} from 'lucide-react'
import {IntegratedSiteEditor} from './IntegratedSiteEditor'
import type {AdminLanguage} from './console-model'
import {readSiteControlSnapshot} from './site-control-snapshot'
import type {SiteReadResult} from './site-control-snapshot'
const words={
 fa:{
  heading:'مدیریت واقعی وب‌سایت',intro:'وضعیت زندهٔ تنظیمات از دفتر امن فجرپارسا، بدون نشر یا تغییر.',
  verified:'تنظیمات دفتر · فقط مشاهده',refresh:'تازه‌سازی',loading:'در حال بررسی وضعیت تنظیمات…',
  draft:'شناسهٔ پیش‌نویس',published:'شناسهٔ نسخهٔ نشرشده',edit:'مجوز ویرایش',publish:'مجوز نشر',
  yes:'فعال',no:'غیرفعال',missing:'ثبت نشده',open:'ورود به تنظیمات اصلی',
  note:'ویرایش پیش‌نویس از فرم زیر و با همان مجوزهای سرور انجام می‌شود؛ نشر عمومی همچنان بسته است.',
  sign_in_required:'نشست دفتر پایان یافته است. دوباره وارد دفتر شوید.',
  access_denied:'حساب شما مجوز دیدن تنظیمات سایت را ندارد.',
  rate_limited:'دریافت اطلاعات موقتاً محدود است. بعداً دوباره بررسی کنید.',
  unavailable:'وضعیت واقعی تنظیمات دریافت نشد؛ مقدار نمایشی جایگزین نمی‌شود.'
 },
 en:{
  heading:'Live website management',intro:'Current settings status from the secured Fajr Office, without making changes or publishing.',
  verified:'Verified Office · read-only',refresh:'Refresh',loading:'Checking current site settings…',
  draft:'Draft revision',published:'Published revision',edit:'Edit permission',publish:'Publish permission',
  yes:'Allowed',no:'Not allowed',missing:'None recorded',open:'Open original settings',
  note:'Edit the QA draft below through the existing authorized server; public Production publishing is still blocked.',
  sign_in_required:'Your Office session expired. Please sign in again.',
  access_denied:'This account cannot read website settings.',
  rate_limited:'The request limit is active. Try again later.',
  unavailable:'Live settings are unavailable; no demo values are substituted.'
 }
} as const
export function LiveSiteControl({lang}:{lang:AdminLanguage}){
 const tx=words[lang]
 const [rev,setRev]=useState(0)
 const [state,setState]=useState<SiteReadResult|null>(null)
 useEffect(()=>{
  let active=true
  setState(null)
  readSiteControlSnapshot().then(x=>{if(active)setState(x)})
  return()=>{active=false}
 },[rev])
 const data=state?.status==='ready'?state.data:null
 const error=state&&state.status!=='ready'?tx[state.status]:null
 const cols=data?[
  {key:'draft',label:tx.draft,value:data.draftRevision||tx.missing,code:true},
  {key:'published',label:tx.published,value:data.publishedRevision||tx.missing,code:true},
  {key:'edit',label:tx.edit,value:data.canEdit?tx.yes:tx.no},
  {key:'publish',label:tx.publish,value:data.canPublish?tx.yes:tx.no}
 ]:[]
 return <div className="fpx-unified-website"><section className="fpx-live-site" aria-label={tx.heading}>
  <div className="fpx-live-site-top"><div>
   <span className="fpx-live-site-kicker"><ShieldCheck size={16}/>{tx.verified}</span>
   <h1>{tx.heading}</h1><p>{tx.intro}</p>
  </div><button type="button" disabled={!state} onClick={()=>setRev(x=>x+1)} aria-label={tx.refresh}><RefreshCw size={17}/><span>{tx.refresh}</span></button></div>
  {!state?<p className="fpx-live-site-feedback" role="status">{tx.loading}</p>:
   error?<p className="fpx-live-site-feedback" role="alert">{error}</p>:
   <div className="fpx-live-site-grid">{cols.map(c=><article key={c.key} className="fpx-live-site-tile">
    <small>{c.label}</small><strong dir={c.code?'ltr':undefined} className={c.code?'fpx-live-site-code':undefined}>{c.value}</strong>
   </article>)}</div>}
  <div className="fpx-live-site-footer"><p><LockKeyhole size={15}/>{tx.note}</p>
   <span className="fpx-live-site-integrated"><ShieldCheck size={15}/>{lang==='fa'?'ویرایش در همین کنسول':'Edit inside this console'}</span>
  </div>
 </section><IntegratedSiteEditor lang={lang}/></div>
}
