import {useState} from 'react'
import {ArrowUpRight,Check,Globe2,LayoutDashboard,Languages,Layers,LockKeyhole,
 MonitorSmartphone,Moon,RotateCcw,Settings2,ShieldCheck,SlidersHorizontal,Sun,Eye} from 'lucide-react'
import type {AdminLanguage,Feature} from './console-model'
import type {PreviewStyle} from './ResourceCenter'
import {defaultStyle} from './ResourceCenter'
import './admin-settings.css'

const copy={
 fa:{
  heading:'تنظیمات عمومی کنسول',sub:'یک مرکز ساده و واقعی برای ظاهر و زبان دفتر؛ بدون تغییر حساب یا تنظیمات سرور.',
  local:'فقط در همین مرورگر',localNote:'انتخاب‌های زبان و ظاهر روی این دستگاه ذخیره می‌شوند؛ مجوز، رمز، دیتابیس و تنظیمات شرکت تغییر نمی‌کنند.',
  language:'زبان رابط مدیریت',fa:'دری افغانستان',en:'English',languageNote:'زبان‌های چهارگانهٔ وب‌سایت عمومی از این گزینه جدا هستند.',
  mode:'نمای صفحه',light:'روشن',dark:'تاریک',density:'فشردگی اجزا',comfortable:'معمولی',compact:'فشرده',corners:'گوشهٔ کارت‌ها',rounded:'گرد',extra:'گردتر',
  reset:'بازگشت به تنظیمات پیش‌فرض',saved:'تنظیم نمایش تغییر کرد؛ ذخیره فقط محلی است.',preview:'این صفحه روی نمونهٔ طراحی است؛ فقط نمایش محلی را تغییر می‌دهد.',
  operational:'دسترسی به بخش‌های متصل',security:'امنیت و نشست',office:'مرکز فرمان',site:'تنظیمات واقعی وب‌سایت',resources:'منابع متصل',
  note:'ویرایش اطلاعات واقعی فقط در بخش مجاز و با تأیید سرور امکان دارد.',help:'هیچ کلید یا رمز در این تنظیمات ذخیره نمی‌شود.',
  unavailable:'این بخش هنوز عملیاتی نشده است',unavailableNote:'در محیط خصوصی این بخش فقط طرح آینده است. برای جلوگیری از عملیات ساختگی، دکمهٔ افزودن یا نشر در اینجا نمایش داده نمی‌شود.',
  back:'بازگشت به مرکز فرمان',settings:'تنظیمات واقعی رابط',status:'اتصال این بخش هنوز تأیید نشده'
 },
 en:{
  heading:'Console settings',sub:'One practical place for staff appearance and language, without changing account or server settings.',
  local:'On this browser only',localNote:'Display and language are stored on this device, not in account permissions, passwords, databases, or company settings.',
  language:'Admin interface language',fa:'Afghan Dari',en:'English',languageNote:'The public website\'s four content languages are independent.',
  mode:'Appearance',light:'Light',dark:'Dark',density:'Spacing',comfortable:'Comfortable',compact:'Compact',corners:'Card corners',rounded:'Rounded',extra:'Extra rounded',
  reset:'Restore appearance defaults',saved:'Display settings changed locally.',preview:'This is the design preview; changes affect only local appearance.',
  operational:'Open connected tools',security:'Account security',office:'Command center',site:'Real website settings',resources:'Connected resources',
  note:'Real data updates are possible only through authorized server-backed modules.',help:'No secret or password is saved in these settings.',
  unavailable:'Module not operational yet',unavailableNote:'This module is only a future design. No fake create or publish controls are exposed in the private office.',
  back:'Return to command center',settings:'Working interface settings',status:'No verified server connection for this module'
 }
} as const

type Props={
 lang:AdminLanguage;onLanguage:(lang:AdminLanguage)=>void;
 value:PreviewStyle;onAppearance:(value:PreviewStyle)=>void;
 privateOffice:boolean;onGo:(id:string)=>void
}
export function AdminSettingsCenter({lang,onLanguage,value,onAppearance,privateOffice,onGo}:Props){
 const tx=copy[lang]
 const [changed,setChanged]=useState(false)
 const update=(patch:Partial<PreviewStyle>)=>{onAppearance({...value,...patch});setChanged(true)}
 const setLanguage=(language:AdminLanguage)=>{onLanguage(language);setChanged(true)}
 const groups=[
  {id:'mode',title:tx.mode,items:[{id:'light',title:tx.light,icon:Sun},{id:'dark',title:tx.dark,icon:Moon}]},
  {id:'density',title:tx.density,items:[{id:'comfortable',title:tx.comfortable,icon:SlidersHorizontal},{id:'compact',title:tx.compact,icon:SlidersHorizontal}]},
  {id:'corners',title:tx.corners,items:[{id:'rounded',title:tx.rounded,icon:Settings2},{id:'extra',title:tx.extra,icon:Settings2}]}
 ] as const
 return <section className="fpx-admin-settings" aria-label={tx.heading}>
  <header className="fpx-settings-header"><span className="fpx-settings-symbol"><Settings2 size={23}/></span>
   <div><div className="fpx-settings-kicker"><LockKeyhole size={14}/>{tx.local}</div><h1>{tx.heading}</h1><p>{tx.sub}</p></div></header>
  {!privateOffice&&<p className="fpx-settings-note"><Eye size={17}/>{tx.preview}</p>}
  <div className="fpx-settings-grid">
   <section className="fpx-settings-panel" aria-labelledby="fpx-setting-lang"><h2 id="fpx-setting-lang"><Languages size={19}/>{tx.language}</h2>
    <div className="fpx-settings-options">
     {([{id:'fa',title:tx.fa},{id:'en',title:tx.en}] as const).map(item=><button type="button" aria-pressed={lang===item.id} className={lang===item.id?'active':''} key={item.id} onClick={()=>setLanguage(item.id)}><span>{item.title}</span>{lang===item.id&&<Check size={17}/>}</button>)}
    </div><p className="fpx-settings-small">{tx.languageNote}</p></section>
   {groups.map(group=><section className="fpx-settings-panel" key={group.id} aria-labelledby={'fpx-setting-'+group.id}><h2 id={'fpx-setting-'+group.id}>{group.id==='mode'?<Sun size={19}/>:<SlidersHorizontal size={19}/>} {group.title}</h2>
     <div className="fpx-settings-options">{group.items.map(item=><button type="button" aria-pressed={value[group.id]===item.id} className={value[group.id]===item.id?'active':''} key={item.id} onClick={()=>update({[group.id]:item.id})}><item.icon size={18}/><span>{item.title}</span>{value[group.id]===item.id&&<Check size={17}/>}</button>)}</div>
    </section>)}
  </div>
  <div className="fpx-settings-actions"><button type="button" onClick={()=>{onAppearance({...defaultStyle});onLanguage('fa');setChanged(true)}}><RotateCcw size={17}/>{tx.reset}</button>
   {changed&&<p role="status"><Check size={16}/>{tx.saved}</p>}</div>
  <p className="fpx-settings-note"><ShieldCheck size={18}/>{tx.localNote}</p>
  {privateOffice&&<section className="fpx-settings-connected" aria-label={tx.operational}><h2>{tx.operational}</h2>
   <div className="fpx-settings-links">
    <button type="button" onClick={()=>onGo('security')}><ShieldCheck size={19}/>{tx.security}<ArrowUpRight size={16}/></button>
    <button type="button" onClick={()=>onGo('overview')}><LayoutDashboard size={19}/>{tx.office}<ArrowUpRight size={16}/></button>
    <a href="/site-settings"><Globe2 size={19}/>{tx.site}<ArrowUpRight size={16}/></a>
    <a href="/resources"><Layers size={19}/>{tx.resources}<ArrowUpRight size={16}/></a>
   </div><p>{tx.note}</p></section>}
  <p className="fpx-settings-footer"><MonitorSmartphone size={17}/>{tx.help}</p>
 </section>
}

export function NotYetConnectedModule({lang,feature,onGo}:{lang:AdminLanguage;feature:Feature;onGo:(id:string)=>void}){
 const tx=copy[lang]
 return <section className="fpx-admin-module-gate" aria-label={feature.label[lang]}>
   <div className="fpx-settings-symbol"><LockKeyhole size={24}/></div>
   <p className="fpx-settings-kicker">{tx.status}</p>
   <h1>{feature.label[lang]}</h1>
   <h2>{tx.unavailable}</h2>
   <p>{tx.unavailableNote}</p>
   <div className="fpx-admin-module-actions">
    <button type="button" onClick={()=>onGo('overview')}><LayoutDashboard size={18}/>{tx.back}</button>
    <button type="button" onClick={()=>onGo('settings')}><Settings2 size={18}/>{tx.settings}</button>
   </div>
 </section>
}
