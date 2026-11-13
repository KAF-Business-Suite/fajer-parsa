import { useEffect, useState } from 'react'
import { ArrowLeft, ArrowRight, CalendarDays, CheckCircle2, Globe2, Hotel, Languages, MapPin, MessageCircle, PlaneLanding, Send, ShieldCheck, Users, CarFront, Compass, BadgeCheck } from 'lucide-react'
import './inbound-tourism.css'

type Language = 'en' | 'fa' | 'ar'
type Localized = Record<Language, string>
type TravelService = 'arrival' | 'transport' | 'stay' | 'guide' | 'journey'
const contactNumber = '93777377774'

// Evaluate arrival in Afghanistan, not at an overseas visitor's local midnight.
function todayInKabul(): string {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Kabul', year: 'numeric', month: '2-digit', day: '2-digit'
  }).formatToParts(new Date())
  const values = Object.fromEntries(parts.map(part => [part.type, part.value]))
  return values.year + '-' + values.month + '-' + values.day
}

function isReachableContact(value: string): boolean {
  const trimmed = value.trim()
  if (/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(trimmed)) return true
  return /^\+?[\d\s().-]+$/.test(trimmed) && /^\d{7,15}$/.test(trimmed.replace(/[^\d]/g, ''))
}
const translations: Record<Language, {
  eyebrow:string; title:string; accent:string; subtitle:string; ask:string; explore:string;
  local:string; quote:string; process:string; stepOne:string; stepTwo:string; stepThree:string;
  services:string; servicesNote:string; formTitle:string; formNote:string; name:string; email:string;
  date:string; people:string; region:string; choice:string; notes:string; consent:string;
  send:string; notSubmitted:string; invalid:string; contact:string; trustTitle:string; trustBody:string;
  noPromise:string; footer:string; back:string
}> = {
  en: {
    eyebrow:'AFGHANISTAN · PRIVATE TRAVEL COORDINATION',
    title:'Discover Afghanistan.',accent:'Arrive with a plan.',
    subtitle:'A Kabul-based travel team helping you arrange airport transfers, accommodation, local language support and carefully planned journeys. Every service is confirmed individually before booking.',
    ask:'Plan your visit',explore:'Explore services',local:'Local coordination, human support',
    quote:'Clear proposals before confirmation',process:'How we work',
    stepOne:'Tell us where and when you are travelling.',
    stepTwo:'We check availability, requirements and current conditions.',
    stepThree:'Review a written proposal before any reservation is confirmed.',
    services:'Travel services', servicesNote:'Flexible support for visitors, families, business travellers and travel partners.',
    formTitle:'Tell us about your trip',formNote:'Complete the essentials. We prepare a WhatsApp message for you to review and send yourself. This website does not submit or store this form.',
    name:'Your name', email:'Email or contact number',date:'Arrival date',people:'Travellers',region:'Destination in Afghanistan',choice:'Service required',notes:'Special requests (optional)',consent:'I agree to open WhatsApp with the trip details I entered. I will review the message before sending.',
    send:'Continue to WhatsApp',notSubmitted:'No booking is made and no data is submitted automatically.',invalid:'Please complete the required fields and agree to continue.',
    contact:'Contact the team',trustTitle:'Clear, practical coordination',trustBody:'We provide service information and written quotes on request. Availability, access permissions, cancellations and fees must be confirmed for each journey.',
    noPromise:'Travel conditions in Afghanistan can change. We do not guarantee visas, safety, government approval or access to restricted areas.',
    footer:'Fajr Parsa · Kabul, Afghanistan · Inbound travel enquiries',back:'Main website'
  },
  fa: {
    eyebrow:'افغانستان · هماهنگی خدمات سفر و گردشگری',title:'افغانستان را کشف کنید.',accent:'با برنامه سفر کنید.',
    subtitle:'تیم فجر پارسا در کابل برای هماهنگی انتقال میدان هوایی، اقامت، ترجمان و برنامه سفر همراه شماست. هر خدمت پیش از رزرو جداگانه بررسی و تأیید می‌شود.',
    ask:'درخواست برنامه سفر',explore:'مشاهده خدمات',local:'هماهنگی محلی و پاسخ‌گویی انسانی',
    quote:'پیشنهاد روشن پیش از تأیید',process:'روش کار ما',
    stepOne:'مقصد و زمان سفر خود را بگویید.',stepTwo:'ظرفیت، شرایط و وضعیت فعلی بررسی می‌شود.',stepThree:'پیش از رزرو، پیشنهاد مکتوب را بررسی کنید.',
    services:'خدمات سفر',servicesNote:'هماهنگی انعطاف‌پذیر برای مهمانان، خانواده‌ها، مسافران تجاری و همکاران سفر.',
    formTitle:'معلومات سفر خود را بفرستید',formNote:'معلومات ضروری را تکمیل کنید. پیام برای واتساپ آماده می‌شود و ارسال نهایی با خود شماست. این صفحه معلومات را خودکار ذخیره یا ارسال نمی‌کند.',
    name:'نام شما',email:'ایمیل یا شماره تماس',date:'تاریخ ورود',people:'تعداد مسافران',region:'مقصد در افغانستان',choice:'خدمت مورد نیاز',notes:'نیازهای ویژه (اختیاری)',consent:'موافق هستم معلومات نوشته‌شده در واتساپ باز شود؛ پیش از ارسال پیام را بررسی می‌کنم.',
    send:'ادامه در واتساپ',notSubmitted:'هنوز هیچ رزروی انجام یا فورمی خودکار ارسال نشده است.',invalid:'لطفاً بخش‌های ضروری را تکمیل و رضایت را مشخص کنید.',
    contact:'تماس با تیم',trustTitle:'هماهنگی روشن و مسئولانه',trustBody:'شرایط خدمت و پیشنهاد قیمت پس از درخواست ارائه می‌شود. ظرفیت، مجوزهای موردی، لغو و هزینه هر سفر باید جداگانه تأیید شود.',
    noPromise:'شرایط سفر در افغانستان ممکن است تغییر کند. صدور ویزه، امنیت مطلق، موافقت دولتی یا ورود به ساحات محدود تضمین نمی‌شود.',
    footer:'فجر پارسا · کابل، افغانستان · درخواست خدمات گردشگری ورودی',back:'سایت اصلی'
  },
  ar: {
    eyebrow:'أفغانستان · تنسيق خدمات السفر الخاصة',title:'اكتشف أفغانستان.',accent:'وسافر بخطة واضحة.',
    subtitle:'فريق فجر بارسا في كابول يساعد في تنسيق النقل من المطار والإقامة والترجمة وترتيبات الرحلات. تخضع جميع الخدمات للتحقق والتأكيد قبل أي حجز.',
    ask:'خطط لزيارتك',explore:'استكشف الخدمات',local:'تنسيق محلي ودعم بشري',
    quote:'عرض واضح قبل التأكيد',process:'كيف نعمل',
    stepOne:'أخبرنا بوجهتك وموعد السفر.',stepTwo:'نتحقق من التوفر والمتطلبات والظروف الحالية.',stepThree:'راجع العرض المكتوب قبل تأكيد أي حجز.',
    services:'خدمات السفر',servicesNote:'دعم مرن للزوار والعائلات ورجال الأعمال وشركاء السفر.',
    formTitle:'أخبرنا عن رحلتك',formNote:'أدخل المعلومات الأساسية لنجهز رسالة واتساب تراجعها وترسلها بنفسك. هذا النموذج لا يخزن أو يرسل المعلومات تلقائياً.',
    name:'اسمك',email:'البريد الإلكتروني أو رقم التواصل',date:'تاريخ الوصول',people:'عدد المسافرين',region:'الوجهة في أفغانستان',choice:'الخدمة المطلوبة',notes:'طلبات إضافية (اختياري)',consent:'أوافق على فتح واتساب بالمعلومات المدخلة وسأراجع الرسالة قبل إرسالها.',
    send:'المتابعة إلى واتساب',notSubmitted:'لا يوجد حجز أو إرسال تلقائي للمعلومات.',invalid:'يرجى إكمال البيانات المطلوبة والموافقة على المتابعة.',
    contact:'اتصل بفريقنا',trustTitle:'تنسيق واضح ومسؤول',trustBody:'نقدم معلومات الخدمات وعروض الأسعار عند الطلب. يجب تأكيد التوفر والتصاريح والإلغاء والرسوم لكل رحلة.',
    noPromise:'قد تتغير ظروف السفر في أفغانستان. لا نضمن التأشيرات أو السلامة المطلقة أو الموافقات الحكومية أو دخول المناطق المقيدة.',
    footer:'فجر بارسا · كابول، أفغانستان · استفسارات السياحة الوافدة',back:'الموقع الرئيسي'
  }
}
const serviceCards: Array<{id:TravelService;icon:typeof PlaneLanding;title:Localized;description:Localized}> = [
  {id:'arrival',icon:PlaneLanding,title:{en:'Airport pickup',fa:'استقبال از میدان هوایی',ar:'الاستقبال من المطار'},description:{en:'Arrival transfer arrangements, pickup point and driver confirmation.',fa:'هماهنگی انتقال، محل ملاقات و تأیید راننده.',ar:'تنسيق الاستقبال وتأكيد نقطة اللقاء والسائق.'}},
  {id:'transport',icon:CarFront,title:{en:'Private transportation',fa:'ترانسپورت اختصاصی',ar:'النقل الخاص'},description:{en:'City transfers and vehicle requests with a clear itinerary.',fa:'انتقال شهری و درخواست موتر مطابق برنامه مشخص.',ar:'النقل داخل المدينة وترتيبات المركبات حسب البرنامج.'}},
  {id:'stay',icon:Hotel,title:{en:'Hotel reservations',fa:'رزرو هوتل',ar:'حجوزات الفنادق'},description:{en:'Accommodation enquiries, options and written confirmation.',fa:'استعلام اقامت، گزینه‌ها و تأیید مکتوب رزرو.',ar:'الاستفسار عن الإقامة والخيارات والتأكيد الكتابي.'}},
  {id:'guide',icon:Languages,title:{en:'Interpreter & guide coordination',fa:'ترجمان و رهنمای گردشگری',ar:'تنسيق المترجمين والمرشدين'},description:{en:'Language support and local guides subject to applicable requirements.',fa:'خدمات ترجمانی و رهنمای محلی مطابق شرایط مربوط.',ar:'الترجمة والمرشدون المحليون وفق المتطلبات المعمول بها.'}},
  {id:'journey',icon:Compass,title:{en:'Tailored journeys',fa:'برنامه سفر اختصاصی',ar:'برامج رحلات مخصصة'},description:{en:'A thoughtful itinerary matched to your dates and interests.',fa:'طرح سفر بر اساس زمان و علاقه‌مندی‌های شما.',ar:'برنامج يناسب مواعيدك واهتماماتك.'}}
]
export function InboundTourism({language='en'}: {language?:Language}) {
  const [interactive,setInteractive]=useState(false)
  useEffect(()=>setInteractive(true),[])
  const lang=language
  const [name,setName]=useState('')
  const [contact,setContact]=useState('')
  const [arrival,setArrival]=useState('')
  const [people,setPeople]=useState('1')
  const [region,setRegion]=useState('Kabul')
  const [service,setService]=useState<TravelService>('arrival')
  const [notes,setNotes]=useState('')
  const [consent,setConsent]=useState(false)
  const [tried,setTried]=useState(false)
  const t=translations[lang]
  const rtl=lang!=='en'
  const focus=(id:string)=>document.getElementById(id)?.scrollIntoView({behavior:'smooth',block:'start'})
  useEffect(()=>{
    document.documentElement.lang=lang==='fa'?'fa-AF':lang
    document.documentElement.dir=rtl?'rtl':'ltr'
    return ()=>{document.documentElement.lang='fa-AF';document.documentElement.dir='rtl'}
  },[lang,rtl])
  const today = todayInKabul()
  const arrivalValid = /^\d{4}-\d{2}-\d{2}$/.test(arrival) && arrival >= today
  const travellers = Number(people)
  const formReady = name.trim().length > 1 && isReachableContact(contact) && arrivalValid
    && Number.isInteger(travellers) && travellers >= 1 && travellers <= 100
    && Boolean(region.trim()) && consent
  function sendEnquiry(){
    setTried(true)
    if(!formReady || arrival < todayInKabul())return
    const chosen=serviceCards.find(item=>item.id===service)
    const message=[
      'FAJR PARSA | Afghanistan Inbound Travel Enquiry',
      'Name: '+name.trim().replace(/\s+/g, ' '),
      'Contact: '+contact.trim(),
      'Arrival: '+arrival,
      'Travellers: '+people,
      'Afghanistan destination: '+region.trim().replace(/\s+/g, ' '),
      'Service: '+(chosen?.title.en||service),
      'Notes: '+(notes.trim()||'None'),
      'Please confirm availability, quotation, requirements and cancellation terms before any booking.'
    ].join('\n')
    window.open('https://wa.me/'+contactNumber+'?text='+encodeURIComponent(message),'_blank','noopener,noreferrer')
  }
  return <div className="inbound" dir={rtl?'rtl':'ltr'} lang={lang==='fa'?'fa-AF':lang}>
    <div className="inbound-hero">
      <div className="shell inbound-topbar">
        <span className="inbound-mark"><Globe2 size={16}/>{lang==='fa'?'سفر به افغانستان':lang==='ar'?'السفر إلى أفغانستان':'Afghanistan Travel'}</span>
      </div>
      <div className="shell inbound-hero-body">
        <div className="inbound-copy">
          <p className="inbound-eyebrow"><span className="inbound-dot"/>{t.eyebrow}</p>
          <h1>{t.title}<span>{t.accent}</span></h1>
          <p className="inbound-description">{t.subtitle}</p>
          <div className="inbound-hero-actions">
            <button type="button" className="inbound-main-cta" onClick={()=>focus('inbound-request')}>{t.ask}{rtl?<ArrowLeft size={18}/>:<ArrowRight size={18}/>}</button>
            <button type="button" className="inbound-sub-cta" onClick={()=>focus('inbound-services')}>{t.explore}</button>
          </div>
          <div className="inbound-proof"><span><CheckCircle2 size={17}/>{t.local}</span><span><BadgeCheck size={17}/>{t.quote}</span></div>
        </div>
        <div className="inbound-hero-art" aria-label="Afghanistan travel planning visual" role="img">
          <div className="inbound-art-ring"/>
          <div className="inbound-art-plate">
            <span>FAJR PARSA</span>
            <strong>AFGHANISTAN</strong>
            <small>KABUL · LOCAL COORDINATION</small>
          </div>
          <div className="inbound-art-route"><MapPin size={19}/><span>YOUR JOURNEY, THOUGHTFULLY ARRANGED</span></div>
        </div>
      </div>
    </div>

    <section id="inbound-services" className="shell inbound-section">
      <div className="inbound-section-head"><span className="inbound-kicker">01 / SERVICES</span><h2>{t.services}</h2><p>{t.servicesNote}</p></div>
      <div className="inbound-service-grid">{serviceCards.map(item=>{const Icon=item.icon;return <article className="inbound-service" key={item.id}><span className="inbound-service-icon"><Icon size={23}/></span><h3>{item.title[lang]}</h3><p>{item.description[lang]}</p><button type="button" onClick={()=>{setService(item.id);focus('inbound-request')}}>{t.ask}{rtl?<ArrowLeft size={15}/>:<ArrowRight size={15}/>}</button></article>})}</div>
    </section>

    <section id="inbound-process" className="inbound-process">
      <div className="shell inbound-process-inner"><div className="inbound-section-head"><span className="inbound-kicker">02 / OUR APPROACH</span><h2>{t.process}</h2></div>
        <div className="inbound-steps">{[t.stepOne,t.stepTwo,t.stepThree].map((step,index)=><div key={index}><span>0{index+1}</span><p>{step}</p></div>)}</div>
      </div>
    </section>

    <noscript><p className="shell">Enable JavaScript to choose a language and prepare an enquiry. No information is sent from this page without your action.</p></noscript>
    <section id="inbound-request" className="shell inbound-section inbound-request-section">
      <div className="inbound-request-intro">
        <span className="inbound-kicker">03 / YOUR ENQUIRY</span><h2>{t.formTitle}</h2><p>{t.formNote}</p>
        <div className="inbound-trust-note"><ShieldCheck size={22}/><div><strong>{t.trustTitle}</strong><p>{t.trustBody}</p></div></div>
        <p className="inbound-caution">{t.noPromise}</p>
      </div>
      <form inert={!interactive} className="inbound-form" onSubmit={e=>{e.preventDefault();sendEnquiry()}} noValidate>
        <div className="inbound-form-grid">
          <label>{t.name}<input required maxLength={100} autoComplete="name" value={name} onChange={e=>setName(e.target.value)}/></label>
          <label>{t.email}<input required maxLength={120} autoComplete="off" dir="auto" aria-invalid={tried && !isReachableContact(contact)} value={contact} onChange={e=>setContact(e.target.value)}/></label>
          <label>{t.date}<span className="inbound-icon-input"><CalendarDays size={17}/><input required aria-label={t.date} type="date" min={today} aria-invalid={tried && !arrivalValid} value={arrival} onChange={e=>setArrival(e.target.value)}/></span></label>
          <label>{t.people}<span className="inbound-icon-input"><Users size={17}/><input required aria-label={t.people} type="number" min="1" max="100" step="1" aria-invalid={tried && !(Number.isInteger(travellers) && travellers >= 1 && travellers <= 100)} value={people} onChange={e=>setPeople(e.target.value)}/></span></label>
          <label>{t.region}<input required maxLength={80} value={region} onChange={e=>setRegion(e.target.value)}/></label>
          <label>{t.choice}<select value={service} onChange={e=>setService(e.target.value as TravelService)}>{serviceCards.map(s=><option key={s.id} value={s.id}>{s.title[lang]}</option>)}</select></label>
        </div>
        <label>{t.notes}<textarea rows={3} maxLength={700} value={notes} onChange={e=>setNotes(e.target.value)}/></label>
        <label className="inbound-consent"><input type="checkbox" checked={consent} onChange={e=>setConsent(e.target.checked)}/><span>{t.consent}</span></label>
        {tried&&!formReady&&<p className="inbound-error" role="alert">{t.invalid}</p>}
        <button type="submit" disabled={!interactive} className="inbound-form-submit"><MessageCircle size={19}/>{t.send}<Send size={15}/></button>
        <p className="inbound-footnote">{t.notSubmitted}</p>
      </form>
    </section>
    <div className="inbound-bottom"><div className="shell"><span>{t.footer}</span><a href="/">{t.back}</a><a href={'https://wa.me/'+contactNumber} target="_blank" rel="noreferrer noopener">{t.contact}</a></div></div>
  </div>
}
