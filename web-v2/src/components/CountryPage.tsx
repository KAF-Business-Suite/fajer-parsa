import { siteText, type SiteLanguage } from '../content/site-i18n'
import { useEffect, useRef } from 'react'
import { ArrowLeft, CheckCircle2, Globe2 } from 'lucide-react'
import { countryServices } from '../content/countries'
import { countryPresentation } from '../content/country-presentation'
import { destinations } from '../content/destinations'
import { Reveal } from './Reveal'
import type { RequestContext } from './DetailsDialog'
import './country-page.css'

type Country = typeof countryServices[number]
type ServiceChoice = { title:string;group?:string;purpose?:string }

function choicesFor(country:Country):ServiceChoice[] {
  if(country.name==='ایران') return [
    ...['سیاحتی','زیارتی','تجارتی','تحصیلی','کاری','درمانی','دیدار خانواده'].map(type=>({title:'ویزای '+type,group:'ویزا و اقامت',purpose:type})),
    {title:'اقامت',group:'ویزا و اقامت'},
    {title:'خدمات کاری',group:'ویزا و اقامت',purpose:'کار'},
    {title:'تکت',group:'پرواز و هتل'},
    {title:'تور و سیاحت',group:'پرواز و هتل',purpose:'سیاحت'},
    {title:'دعوتنامه',group:'دعوتنامه و تجارت'},
    {title:'تکمیل درخواست ویزا و مراحل خدمات',group:'اسناد و کنسولی'},
  ]
  // Preserve owner-confirmed combinations; mixed categories are chosen explicitly in the request form.
  return country.services.map(title=>({title}))
}

export function CountryPage({country,language,onRequest}:{country:Country|undefined;language:SiteLanguage;onRequest:(context:RequestContext)=>void}) {
  const t=(v:string)=>siteText(v,language)
  const heading=useRef<HTMLHeadingElement>(null)
  useEffect(()=>{heading.current?.focus();window.scrollTo(0,0)},[country?.name])
  if(!country) return <section className="shell country-page"><h1 ref={heading} tabIndex={-1}>{t("این مقصد پیدا نشد")}</h1><p>{t("کشور مورد نظرتان را از فهرست خدمات انتخاب کنید.")}</p><a className="primary-action" href="#country-services">{t("بازگشت به کشورها")}<ArrowLeft size={16}/></a></section>
  const presentation=countryPresentation[country.name]
  const existing=destinations.find(destination=>destination.short===country.name)
  const image=existing?.detailImage || existing?.image || presentation?.image
  const place=existing?.place || presentation?.place || country.name
  const services=choicesFor(country)
  return <article className="shell country-page">
    <nav className="country-breadcrumb" aria-label={t("مسیر صفحه")}><a href="#">{t("فجر پارسا")}</a><span aria-hidden="true">/</span><a href="#country-services">{t("کشورها")}</a><span aria-hidden="true">/</span><span aria-current="page">{t(country.name)}</span></nav>
    <div className="country-page-hero"><div className="country-page-intro"><p className="eyebrow"><Globe2 size={14}/>{t("خدمات فجر پارسا")}</p><h1 ref={heading} tabIndex={-1}>{language==='ps'?t(country.name)+' ته سفري خدمتونه':(language==='en'?'Travel services in ':language==='ar'?'خدمات السفر إلى ':'خدمات سفر به ')+t(country.name)}</h1><p>{t("خدمت مورد نیازتان را انتخاب کنید؛ جزئیات درخواست را آماده کنید و شرایط ارائه را با دفتر بررسی کنید.")}</p><div className="country-page-actions"><button type="button" className="primary-action" onClick={()=>document.getElementById('country-service-choices')?.scrollIntoView()}>{t("انتخاب خدمت")}<ArrowLeft size={16}/></button><button type="button" className="secondary-action" onClick={()=>onRequest({destination:country.name})}>{t("درخواست مشاوره")}</button></div><div className="country-page-summary">{presentation?.tags.map(tag=><span key={tag}><CheckCircle2 size={14}/>{t(tag)}</span>)}</div></div>
      <figure className="country-page-photo"><img src={image} alt={t(place)+'، '+t(country.name)} width="960" height="640" decoding="async"/><figcaption>{existing?.imageNote ? t(existing.imageNote) : (presentation?.credit ? t(place)+' · '+presentation.credit+' / Pexels — '+(language==='en'?'Destination photo only; not a specific tour, hotel or job.':language==='ar'?'صورة تعريفية للمقصد؛ ليست جولة أو فندقاً أو وظيفة محددة.':language==='ps'?'د منزل پېژندنیز انځور دی، نه مشخص تور، هوټل یا دنده.':'عکس معرفی مقصد؛ نه تور، هتل یا فرصت کاری مشخص.') : t(place)+(language==='en'?' — Destination illustration.':language==='ar'?' — صورة تعريفية للمقصد.':language==='ps'?' — د منزل پېژندنیز انځور دی.':' — تصویر معرفی مقصد است.'))}</figcaption></figure>
    </div>
    <section className="country-page-services" id="country-service-choices" aria-labelledby="country-choice-title"><div className="section-heading"><div><p className="eyebrow">{t("بر اساس خدمات اعلام‌شدهٔ دفتر")}</p><h2 id="country-choice-title">{t("برای چه خدمتی همراه شما باشیم؟")}</h2><p>{t("قیمت، زمان انجام و مدارک مورد نیاز پس از بررسی شرایط درخواست مشخص می‌شود.")}</p></div></div><div className="country-choice-grid">{services.map((service,index)=><Reveal key={service.title} delay={Math.min(index*.025,.12)}><section className="country-choice-card"><span className="country-choice-number" aria-hidden="true">{String(index+1).padStart(2,'0')}</span><h3>{t(service.title)}</h3><p>{t(country.name==='جاپان'?'جزئیات مسیر کاری، شرایط متقاضی و امکان ارائه باید با دفتر بررسی شود.':'برای بررسی شرایط و مراحل این خدمت، درخواست مربوط را آماده کنید.')}</p><button type="button" aria-label={language==='en'?'Request '+t(service.title):language==='ar'?'طلب '+t(service.title):language==='ps'?'غوښتنه: '+t(service.title):'درخواست '+service.title} onClick={()=>onRequest({destination:country.name,service:service.group,purpose:service.purpose,variant:service.title})}>{t("درخواست این خدمت")}<ArrowLeft size={16}/></button></section></Reveal>)}</div></section>
    <section className="country-next-steps" aria-labelledby="country-next-title"><h2 id="country-next-title">{t("بعد از انتخاب خدمت چه می‌شود؟")}</h2><ol>{[['انتخاب و مرور','کشور و خدمت انتخاب‌شده وارد فرم می‌شود؛ زمان سفر و تعداد نفرات را اضافه کنید.'],['آماده‌سازی درخواست','خلاصه را مرور کنید؛ در نسخهٔ فعلی ارسال نهایی پیام در واتساپ با خود شماست.'],['بررسی با دفتر','مدارک، هزینه، زمان و امکان ادامهٔ کار را پیش از هر پرداخت یا تعهد با دفتر روشن کنید.']].map(([title,description])=><li key={title}><h3>{t(title)}</h3><p>{t(description)}</p></li>)}</ol></section>
    <aside className="country-service-note"><h2>{t("پیش از تصمیم‌گیری")}</h2><p>{t("معرفی خدمت به معنی تضمین صدور ویزا، ورود، اقامت یا دریافت کار نیست. شرایط سفر و تصمیم مراجع مربوط باید برای درخواست شما بررسی شود. برای بررسی اولیه، تصویر پاسپورت یا اسناد شخصی را در این صفحه ارسال نکنید.")}</p><a href={"/?lang="+language+"#country-services"}>{t("بررسی کشورهای دیگر")}<ArrowLeft size={16}/></a></aside>
  </article>
}
