import {useEffect,useMemo,useState} from 'react'
import {CheckCircle2,FileCheck2,Globe2,History,LockKeyhole,Plus,RefreshCw,Save,ShieldCheck,Trash2} from 'lucide-react'
import type {AdminLanguage} from './console-model'
import {
 siteLanguages,readSiteDraft,saveSiteDraft,cleanSiteDraft
} from './site-draft-bridge'
import type {SiteDraft,SiteDraftState,SiteLanguage} from './site-draft-bridge'
import './integrated-site-editor.css'

const texts={
 fa:{
  kicker:'یک کنسول · یک مجوز · یک منبع داده',heading:'ویرایش محتوای وب‌سایت',intro:'همین‌جا ویرایش کنید؛ ذخیره فقط پیش‌نویس QA است، نه نشر روی سایت عمومی.',
  contact:'تماس',office:'دفتر و ساعات',notices:'اعلان‌ها',faq:'پرسش‌های متداول',review:'بررسی تغییرات',
  whatsapp:'واتساپ',email:'ایمیل',phone:'تلفن',mapUrl:'نشانی نقشه',address:'آدرس رسمی دفتر',hours:'ساعات کاری',
  notice:'اعلان وب‌سایت',question:'پرسش',answer:'پاسخ',addFaq:'افزودن پرسش',removeFaq:'حذف پرسش',font:'فونت رسمی سایت',
  langNotice:'محتوای سایت چهارزبانه است؛ زبان کنسول فقط دری/انگلیسی است.',
  loading:'در حال دریافت نسخهٔ واقعی پیش‌نویس…',refresh:'بازخوانی سرور',save:'ذخیرهٔ پیش‌نویس QA',
  saving:'در حال ذخیره و بازخوانی…',saved:'پیش‌نویس روی سرور ذخیره و دوباره تأیید شد.',
  readOnly:'این حساب فقط اجازهٔ مشاهده دارد.',draft:'شناسهٔ پیش‌نویس',published:'نسخهٔ نشرشده',
  empty:'اطلاعاتی ثبت نشده',unchanged:'تغییری برای ذخیره وجود ندارد.',unsaved:'تغییر ذخیره‌نشده',
  verification:'هیچ نشر یا حذفِ سایت از این بخش انجام نمی‌شود. تمام تغییرات با مجوز فعلی سرور و نسخهٔ موردانتظار بررسی می‌شوند.',
  previewNote:'این پیش‌نمایش از محتوای واردشده در همین صفحه است و چیزی را منتشر نمی‌کند.',
  contacts:'اطلاعات تماس',noFaq:'هیچ پرسشی موجود نیست.',tooManyFaq:'حداکثر پنج پرسش مجاز است.',
  sign_in_required:'نشست به پایان رسیده؛ دوباره وارد شوید.',access_denied:'این حساب مجوز تنظیمات وب‌سایت را ندارد.',
  rate_limited:'محدودیت درخواست سرور فعال است.',conflict:'پیش‌نویس در جای دیگری تغییر کرده؛ بدون پاک‌کردن متن‌های خود، نسخهٔ تازه را بررسی کنید.',
  invalid:'محتوای فورم معتبر نیست؛ شماره‌ها، ایمیل و نقشه را بررسی کنید.',unavailable:'اطلاعات امن سرور در دسترس نیست؛ مقدار ساختگی جایگزین نمی‌شود.',
  unverified:'پاسخ ذخیره دریافت شد، اما بازخوانی معتبر نشد؛ موفقیت ثبت نمی‌شود.',
  retry:'بررسی دوباره',seePreview:'نمایش پیش‌نمایش',qaOnly:'فقط QA · نشر اصلی مسدود است'
 },
 en:{
  kicker:'One console · one authorization · one data source',heading:'Website content editor',intro:'Edit here in the same console. Saving changes the QA draft only, never the public production site.',
  contact:'Contacts',office:'Office and hours',notices:'Notices',faq:'Frequently asked questions',review:'Review changes',
  whatsapp:'WhatsApp',email:'Email',phone:'Phone',mapUrl:'Map URL',address:'Official office address',hours:'Office hours',
  notice:'Website announcement',question:'Question',answer:'Answer',addFaq:'Add question',removeFaq:'Remove question',font:'Site font',
  langNotice:'Public content stays in four languages; staff console language is independent.',
  loading:'Loading verified draft from server…',refresh:'Refresh server draft',save:'Save QA draft',
  saving:'Saving and verifying server readback…',saved:'Draft saved and verified from server.',
  readOnly:'Your account can view but not edit.',draft:'Draft revision',published:'Published revision',
  empty:'No recorded value',unchanged:'No changes to save.',unsaved:'Unsaved changes',
  verification:'No publish or website delete action is available here. Server authorization and expected revision guard every draft write.',
  previewNote:'This is a local view of your entered text and never publishes.',
  contacts:'Contact channels',noFaq:'No FAQs recorded.',tooManyFaq:'A maximum of five questions are allowed.',
  sign_in_required:'Session expired, sign in again.',access_denied:'This account cannot access website settings.',
  rate_limited:'Server request limit reached.',conflict:'Draft was changed elsewhere. Review the server version without losing your form text.',
  invalid:'Invalid input. Check contact number, email and map URL.',unavailable:'Verified server content is not available; no demo values are substituted.',
  unverified:'The server replied, but authoritative readback did not confirm this save.',
  retry:'Retry',seePreview:'View local preview',qaOnly:'QA draft only · Production publishing blocked'
 }
} as const
const langTitle:Record<SiteLanguage,string>={fa:'دری',ps:'پښتو',en:'English',ar:'العربية'}
type Panel='contact'|'office'|'notices'|'faq'|'review'
export function IntegratedSiteEditor({lang}:{lang:AdminLanguage}){
 const tx=texts[lang]
 const [state,setState]=useState<SiteDraftState|null>(null)
 const [draft,setDraft]=useState<SiteDraft|null>(null)
 const [loadState,setLoadState]=useState<'loading'|'ready'|'sign_in_required'|'access_denied'|'rate_limited'|'conflict'|'invalid'|'unavailable'>('loading')
 const [revision,setRevision]=useState(0)
 const [saving,setSaving]=useState(false)
 const [feedback,setFeedback]=useState<{error:boolean;message:string}|null>(null)
 const [panel,setPanel]=useState<Panel>('contact')
 const dirty=useMemo(()=>!!draft&&!!state&&JSON.stringify(draft)!==JSON.stringify(state.draft),[draft,state])
 useEffect(()=>{
  let active=true
  setLoadState('loading')
  readSiteDraft().then(result=>{
   if(!active)return
   setLoadState(result.status)
   if(result.status==='ready'){setState(result.data);setDraft(structuredClone(result.data.draft))}
   else{setState(null);setDraft(null)}
  })
  return()=>{active=false}
 },[revision])
 const setContact=(key:'whatsapp'|'email'|'phone'|'mapUrl',value:string)=>{
  setDraft(old=>old?{...old,contact:{...old.contact,[key]:value}}:old);setFeedback(null)
 }
 const setTranslations=(path:'address'|'hours'|'notice',k:SiteLanguage,v:string)=>{
  setDraft(old=>!old?old:path==='notice'?
   {...old,content:{...old.content,notice:{...old.content.notice,[k]:v}}}:
   {...old,office:{...old.office,[path]:{...old.office[path],[k]:v}}})
  setFeedback(null)
 }
 const setFaq=(index:number,kind:'question'|'answer',language:SiteLanguage,value:string)=>{
  setDraft(old=>{
   if(!old)return old
   const faqs=old.content.faq.map((faq,i)=>i===index?{...faq,[kind]:{...faq[kind],[language]:value}}:faq)
   return {...old,content:{...old.content,faq:faqs}}
  })
  setFeedback(null)
 }
 const addFaq=()=>{
  if(!draft||draft.content.faq.length>=5)return
  const languages=Object.fromEntries(siteLanguages.map(x=>[x,''])) as Record<SiteLanguage,string>
  setDraft({...draft,content:{...draft.content,faq:[...draft.content.faq,{question:{...languages},answer:{...languages}}]}})
 }
 const removeFaq=(index:number)=>{
  setDraft(old=>old?{...old,content:{...old.content,faq:old.content.faq.filter((_,i)=>i!==index)}}:old)
 }
 async function save(){
  if(!state||!draft||!state.canEdit||!dirty||saving)return
  const validation=cleanSiteDraft(draft)
  if(!validation.draft){setFeedback({error:true,message:tx.invalid});return}
  setSaving(true);setFeedback(null)
  try{
   const result=await saveSiteDraft(state,validation.draft)
   if(result.status==='verified'){
    setState(result.data);setDraft(structuredClone(result.data.draft))
    setFeedback({error:false,message:tx.saved})
   }else setFeedback({error:true,message:tx[result.status]})
  }finally{setSaving(false)}
 }
 const contactFields=[
  {key:'whatsapp' as const,label:tx.whatsapp,type:'tel',max:18},
  {key:'email' as const,label:tx.email,type:'email',max:254},
  {key:'phone' as const,label:tx.phone,type:'tel',max:18},
  {key:'mapUrl' as const,label:tx.mapUrl,type:'url',max:350}
 ]
 function translatedFields(label:string,path:'address'|'hours'|'notice',max:number,multi:boolean){
  return <div className="fpx-site-editor-fields">
   {siteLanguages.map(k=><label key={k} className="fpx-site-editor-field">
    <span>{label} · {langTitle[k]}</span>
    {multi?<textarea dir={k==='en'?'ltr':'rtl'} lang={k} maxLength={max}
     value={path==='notice'?draft?.content.notice[k]||'':draft?.office[path][k]||''}
     onChange={e=>setTranslations(path,k,e.target.value)} disabled={!state?.canEdit}/>:
     <input dir={k==='en'?'ltr':'rtl'} lang={k} maxLength={max}
     value={draft?.office[path==='notice'?'address':path][k]||''}
     onChange={e=>setTranslations(path,k,e.target.value)} disabled={!state?.canEdit}/>}
   </label>)}
  </div>
 }
 return <section className="fpx-site-editor" aria-label={tx.heading}>
  <header className="fpx-site-editor-head"><div><p className="fpx-site-editor-kicker"><ShieldCheck size={15}/>{tx.kicker}</p>
   <h2>{tx.heading}</h2><p>{tx.intro}</p></div>
   <button type="button" className="fpx-site-editor-reload" onClick={()=>{if(!saving&&!dirty){setFeedback(null);setRevision(x=>x+1)}}}
    disabled={saving||dirty||loadState==='loading'}><RefreshCw size={16}/>{tx.refresh}</button></header>
  {loadState==='loading'?<p role="status" className="fpx-site-editor-feedback">{tx.loading}</p>:
   loadState!=='ready'?<p role="alert" className="fpx-site-editor-feedback">{tx[loadState]}</p>:
   draft&&state?<><div className="fpx-site-editor-revisions">
    <span><History size={16}/>{tx.draft}: <code dir="ltr">{state.draftRevision.slice(0,12)}</code></span>
    <span><Globe2 size={16}/>{tx.published}: <code dir="ltr">{state.publishedRevision?.slice(0,12)||'—'}</code></span>
    <span><LockKeyhole size={16}/>{state.canEdit?tx.qaOnly:tx.readOnly}</span>
   </div>
   <nav className="fpx-site-editor-tabs" aria-label={tx.heading}>
    {(['contact','office','notices','faq','review'] as const).map(id=><button type="button" key={id}
     aria-current={panel===id?'page':undefined} className={panel===id?'active':''} onClick={()=>setPanel(id)}>{tx[id]}</button>)}
   </nav>
   {panel==='contact'&&<div className="fpx-site-editor-fields">{contactFields.map(f=><label className="fpx-site-editor-field" key={f.key}>
    <span>{f.label}</span><input dir="ltr" type={f.type} maxLength={f.max} disabled={!state.canEdit}
     value={draft.contact[f.key]||''} onChange={e=>setContact(f.key,e.target.value)}/></label>)}</div>}
   {panel==='office'&&<div className="fpx-site-editor-sections">
    <h3>{tx.address}</h3>{translatedFields(tx.address,'address',300,true)}
    <h3>{tx.hours}</h3>{translatedFields(tx.hours,'hours',120,false)}
   </div>}
   {panel==='notices'&&<div className="fpx-site-editor-sections">
    <h3>{tx.notice}</h3>{translatedFields(tx.notice,'notice',500,true)}
    <label className="fpx-site-editor-field"><span>{tx.font}</span><select disabled={!state.canEdit} value={draft.design.fontPreset}
     onChange={e=>{setDraft({...draft,design:{fontPreset:e.target.value as SiteDraft['design']['fontPreset']}})}}>
     <option value="vazirmatn-manrope">Vazirmatn + Manrope</option><option value="estedad-inter">Estedad + Inter</option>
    </select></label></div>}
   {panel==='faq'&&<div className="fpx-site-editor-sections">
    <button type="button" className="fpx-site-editor-reload" disabled={!state.canEdit||draft.content.faq.length>=5} onClick={addFaq}>
     <Plus size={16}/>{tx.addFaq} ({draft.content.faq.length}/5)</button>
    {!draft.content.faq.length&&<p>{tx.noFaq}</p>}
    {draft.content.faq.map((item,index)=><fieldset className="fpx-site-editor-faq" key={index}>
     <legend>{tx.question} {index+1}</legend>
     {siteLanguages.map(k=><div className="fpx-site-editor-faq-row" key={k}>
      <label className="fpx-site-editor-field"><span>{tx.question} · {langTitle[k]}</span>
       <input maxLength={180} lang={k} dir={k==='en'?'ltr':'rtl'} disabled={!state.canEdit}
        value={item.question[k]} onChange={e=>setFaq(index,'question',k,e.target.value)}/></label>
      <label className="fpx-site-editor-field"><span>{tx.answer} · {langTitle[k]}</span>
       <textarea maxLength={600} lang={k} dir={k==='en'?'ltr':'rtl'} disabled={!state.canEdit}
        value={item.answer[k]} onChange={e=>setFaq(index,'answer',k,e.target.value)}/></label>
     </div>)}
     <button type="button" className="fpx-site-editor-reload" disabled={!state.canEdit} onClick={()=>removeFaq(index)}>
      <Trash2 size={16}/>{tx.removeFaq}</button>
    </fieldset>)}
   </div>}
   {panel==='review'&&<div className="fpx-site-editor-sections">
    <p className="fpx-site-editor-feedback">{tx.previewNote}</p>
    <div className="fpx-site-editor-previews">{siteLanguages.map(k=><article key={k} lang={k} dir={k==='en'?'ltr':'rtl'}>
     <h3>{langTitle[k]}</h3>
     <p>{tx.contacts}: <bdi dir="ltr">{[draft.contact.whatsapp,draft.contact.phone,draft.contact.email].filter(Boolean).join(' · ')}</bdi></p>
     <p>{tx.address}: {draft.office.address[k]||'—'}</p><p>{tx.hours}: {draft.office.hours[k]||'—'}</p>
     <p>{tx.notice}: {draft.content.notice[k]||'—'}</p>
     {draft.content.faq.map((item,i)=><p key={i}>{item.question[k]||'—'} — {item.answer[k]||'—'}</p>)}
    </article>)}</div>
   </div>}
   <div className="fpx-site-editor-actions"><div><p><LockKeyhole size={16}/>{tx.verification}</p>
    {dirty&&<small>{tx.unsaved}</small>}</div>
    <button type="button" className="fpx-site-editor-save" disabled={!state.canEdit||!dirty||saving}
     onClick={save}><Save size={17}/>{saving?tx.saving:tx.save}</button>
   </div>
   {feedback&&<p className="fpx-site-editor-feedback" role={feedback.error?'alert':'status'}>
    {feedback.error?<LockKeyhole size={17}/>:<CheckCircle2 size={17}/>}
    {feedback.message}</p>}
  </>:null}
 </section>
}
