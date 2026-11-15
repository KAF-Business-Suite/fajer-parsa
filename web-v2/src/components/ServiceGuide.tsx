import { ArrowLeft, ClipboardList, Clock3, FileQuestion, Info, ShieldCheck } from 'lucide-react'
import { useState } from 'react'
import { serviceGroups } from '../content/services'
import { serviceCatalog, serviceInquiryDestinations, serviceIsReadyForPublicOffer } from '../content/service-catalog'
import { siteText, type SiteLanguage } from '../content/site-i18n'
import type { RequestContext } from './DetailsDialog'
import './service-guide.css'

const wording = {
  fa: {
    eyebrow:'راهنمای شفاف خدمات',heading:'پیش از درخواست، شرایط را بشناسید',
    intro:'این فهرست برای بررسی اولیه است. خدمات، شرایط کشور، مدارک و هزینه تنها پس از تأیید دفتر مشخص می‌شوند.',
    groups:'گروه خدمت',destination:'مقصد مورد نظر',choose:'ابتدا مقصد را انتخاب کنید (اختیاری)',
    status:'وضعیت فعلی',review:'نیازمند بررسی دفتر',verified:'قابل درخواست پس از تأیید',
    scope:'محدودهٔ راهنمایی',scopeText:'نوع خدمت و هدف سفر خود را مشخص کنید. امکان ارائه برای هر کشور و پاسپورت جدا بررسی می‌شود.',
    docs:'مدارک',docsText:'مدارک لازم هنوز تأیید نشده‌اند؛ فعلاً سند شخصی در این صفحه بارگذاری نکنید.',
    time:'مدت و هزینه',timeText:'نرخ و زمان قطعی اعلام نشده است. پیش از پرداخت، شرایط کتبی را از دفتر بگیرید.',
    cancellation:'تغییر و انصراف',cancellationText:'شرایط لغو، استرداد و تعهدات برای این خدمت هنوز تأیید نشده است.',
    steps:'مراحل درخواست',stepsText:'خدمت و مقصد را انتخاب کنید، درخواست اولیه بسازید و برای تأیید مدارک و شرایط با دفتر هماهنگ شوید.',
    request:'آماده‌سازی درخواست',important:'توجه: ثبت درخواست به معنی تأیید ویزا، رزرو یا تضمین ارائهٔ خدمت نیست.',
    noOffer:'اطلاعات برای بررسی؛ فروش یا تأیید قطعی فعال نیست.',
  },
  ps: {
    eyebrow:'د خدمتونو روښانه لارښود',heading:'له غوښتنې مخکې شرایط وپېژنئ',
    intro:'دا نوملړ یوازې د لومړنۍ ارزونې لپاره دی. د هر هېواد شرطونه، اسناد او لګښتونه دفتر تاییدوي.',
    groups:'د خدمت ډول',destination:'د سفر مقصد',choose:'مقصد وټاکئ (اختیاري)',
    status:'اوسنی حالت',review:'د دفتر تایید ته اړتیا',verified:'له تایید وروسته غوښتنه کېدای شي',
    scope:'د لارښوونې حدود',scopeText:'خپل خدمت او د سفر موخه وټاکئ. د هر پاسپورټ او هېواد شرایط جلا ارزول کېږي.',
    docs:'اسناد',docsText:'اړین اسناد لا نه دي تایید شوي؛ دلته شخصي اسناد مه پورته کوئ.',
    time:'وخت او لګښت',timeText:'بیه او وخت لا نه دي تایید شوي. له تادیې مخکې له دفتره لیکلي شرایط وغواړئ.',
    cancellation:'بدلون او لغوه کول',cancellationText:'د لغوه کولو، بېرته ورکولو او ژمنو شرایط لا نه دي تایید شوي.',
    steps:'د غوښتنې پړاوونه',stepsText:'خدمت او مقصد وټاکئ، لومړنۍ غوښتنه چمتو کړئ او شرایط له دفتره تایید کړئ.',
    request:'غوښتنه چمتو کړئ',important:'یادونه: غوښتنه د ویزې، ریزرف یا خدمت تضمین نه دی.',
    noOffer:'یوازې معلومات؛ قطعي پلور او تایید فعال نه دی.',
  },
  en: {
    eyebrow:'Transparent service guide',heading:'Review the conditions before enquiring',
    intro:'This catalog is for initial enquiries. Destination rules, documents, availability and fees require confirmation by the office.',
    groups:'Service category',destination:'Destination',choose:'Choose a destination (optional)',
    status:'Current status',review:'Office confirmation required',verified:'Enquiry approved with evidence',
    scope:'Scope of guidance',scopeText:'Choose your service and travel purpose. Conditions depend on the destination and passport.',
    docs:'Documents',docsText:'Document requirements are not yet verified. Do not upload personal documents here.',
    time:'Timeline and price',timeText:'No confirmed price or processing time. Ask the office for written terms before paying.',
    cancellation:'Changes and cancellation',cancellationText:'Cancellation, refund and commitment terms have not been verified for this service.',
    steps:'How to enquire',stepsText:'Select a service and destination, prepare an initial enquiry, and confirm the requirements with the office.',
    request:'Prepare an enquiry',important:'Submitting an enquiry does not guarantee a visa, reservation or availability.',
    noOffer:'Information only; no confirmed sale or approval is offered.',
  },
  ar: {
    eyebrow:'دليل خدمات واضح',heading:'اطّلع على الشروط قبل الاستفسار',
    intro:'هذا الدليل للاستفسارات الأولية. يجب تأكيد شروط الوجهة والوثائق والتوفر والأسعار لدى المكتب.',
    groups:'فئة الخدمة',destination:'الوجهة',choose:'اختر وجهة (اختياري)',
    status:'الحالة الحالية',review:'تتطلب تأكيد المكتب',verified:'استفسار معتمد بالأدلة',
    scope:'نطاق الإرشاد',scopeText:'اختر نوع الخدمة وهدف السفر. تختلف الشروط بحسب الوجهة وجواز السفر.',
    docs:'الوثائق',docsText:'الوثائق المطلوبة غير مؤكدة بعد. لا ترفع مستندات شخصية هنا.',
    time:'المدة والتكلفة',timeText:'لا توجد أسعار أو مدد مؤكدة. اطلب الشروط المكتوبة من المكتب قبل الدفع.',
    cancellation:'التغيير والإلغاء',cancellationText:'لم يتم التحقق بعد من شروط الإلغاء والاسترداد والالتزامات.',
    steps:'خطوات الاستفسار',stepsText:'اختر الخدمة والوجهة، وجهّز الاستفسار الأولي، وأكّد المتطلبات مع المكتب.',
    request:'إعداد الاستفسار',important:'الاستفسار لا يضمن التأشيرة أو الحجز أو توفر الخدمة.',
    noOffer:'معلومات أولية فقط؛ لا بيع أو موافقة مؤكدة.',
  },
} as const

export function ServiceGuide({
  language, selected, onSelect, onRequest,
}:{
  language: SiteLanguage
  selected: string
  onSelect: (service:string)=>void
  onRequest: (context:RequestContext)=>void
}){
  const [destination,setDestination] = useState('')
  const copy=wording[language]
  const service=serviceCatalog.find(s=>s.title===selected) || serviceCatalog[0]
  const group=serviceGroups.find(s=>s.title===service.title) || serviceGroups[0]
  const reviewed=serviceIsReadyForPublicOffer(service)
  const t=(value:string)=>siteText(value,language)
  return <section id="service-guide" className="shell fp-service-guide" aria-labelledby="fp-guide-title">
    <div className="fp-guide-top">
      <div>
        <span className="eyebrow">{copy.eyebrow}</span>
        <h2 id="fp-guide-title">{copy.heading}</h2>
        <p>{copy.intro}</p>
      </div>
      <span className="fp-guide-status"><ShieldCheck size={15} aria-hidden="true"/>{copy.noOffer}</span>
    </div>
    <div className="fp-guide-body">
      <div className="fp-guide-categories" role="group" aria-label={copy.groups}>
        {serviceCatalog.map((item,index)=>{
          const Icon=serviceGroups[index].icon
          return <button type="button" key={item.slug} className={'fp-guide-category'+(item.slug===service.slug?' is-selected':'')} onClick={()=>onSelect(item.title)} aria-pressed={item.slug===service.slug}>
            <Icon size={19} aria-hidden="true"/><span>{t(item.title)}</span>
          </button>
        })}
      </div>
      <article className="fp-guide-detail" aria-live="polite">
        <div className="fp-guide-detail-head">
          <div><span className="fp-guide-caption">{copy.status}</span><h3>{t(group.title)}</h3></div>
          <span className={'fp-guide-review'+(reviewed?' is-approved':'')}><Info size={15} aria-hidden="true"/>{reviewed?copy.verified:copy.review}</span>
        </div>
        <p className="fp-guide-service-description">{t(group.desc)}</p>
        <label className="fp-guide-destination" htmlFor="fp-guide-destination">
          <span>{copy.destination}</span>
          <select id="fp-guide-destination" value={destination} onChange={e=>setDestination(e.target.value)}>
            <option value="">{copy.choose}</option>
            {serviceInquiryDestinations.map(name=><option key={name} value={name}>{t(name)}</option>)}
          </select>
        </label>
        <div className="fp-guide-facts">
          <section><ClipboardList size={18} aria-hidden="true"/><div><h4>{copy.scope}</h4><p>{copy.scopeText}</p></div></section>
          <section><FileQuestion size={18} aria-hidden="true"/><div><h4>{copy.docs}</h4><p>{copy.docsText}</p></div></section>
          <section><Clock3 size={18} aria-hidden="true"/><div><h4>{copy.time}</h4><p>{copy.timeText}</p></div></section>
          <section><Info size={18} aria-hidden="true"/><div><h4>{copy.cancellation}</h4><p>{copy.cancellationText}</p></div></section>
        </div>
        <div className="fp-guide-next"><h4>{copy.steps}</h4><p>{copy.stepsText}</p></div>
        <div className="fp-guide-actions">
          <button type="button" className="fp-guide-primary" onClick={()=>onRequest({service:service.title,destination})}>
            {copy.request}<ArrowLeft size={17} aria-hidden="true"/>
          </button>
          <span>{copy.important}</span>
        </div>
      </article>
    </div>
  </section>
}
