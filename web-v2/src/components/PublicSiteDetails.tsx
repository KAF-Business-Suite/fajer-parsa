import {useEffect,useState} from 'react'
import type {SiteLanguage} from '../content/site-i18n'
import {loadPublishedSiteSettings} from '../lib/site-settings-client'
import type {PublishedSiteSettings} from '../lib/site-settings-contract'

const labels={
 fa:{details:'معلومات رسمی دفتر',address:'آدرس',hours:'ساعات کاری',map:'موقعیت روی نقشه',notice:'اطلاعیهٔ دفتر',faq:'پرسش‌های متداول'},
 ps:{details:'د دفتر رسمي معلومات',address:'پته',hours:'کاري وختونه',map:'په نقشه کې موقعیت',notice:'د دفتر خبرتیا',faq:'ډېرې پوښتنې'},
 en:{details:'Official office information',address:'Address',hours:'Office hours',map:'View on map',notice:'Office notice',faq:'Frequently asked questions'},
 ar:{details:'معلومات المكتب الرسمية',address:'العنوان',hours:'ساعات العمل',map:'عرض الخريطة',notice:'إعلان المكتب',faq:'الأسئلة الشائعة'}
}
export function PublicSiteDetails({language}:{language:SiteLanguage}){
 const [settings,setSettings]=useState<PublishedSiteSettings|null>(null)
 useEffect(()=>{let alive=true;void loadPublishedSiteSettings().then(x=>{if(alive)setSettings(x)});return ()=>{alive=false}},[])
 if(!settings)return null
 const t=labels[language]
 const address=settings.office?.address[language]?.trim()||''
 const hours=settings.office?.hours[language]?.trim()||''
 const notice=settings.content?.notice[language]?.trim()||''
 const faq=(settings.content?.faq||[]).filter(item=>item.question[language]?.trim()&&item.answer[language]?.trim())
 if(!address&&!hours&&!notice&&!faq.length)return null
 return <section className="shell py-8 md:py-12" id="public-office-information" aria-label={t.details}>
  <div className="rounded-[24px] border border-[var(--fp-line)] bg-[var(--fp-surface)] p-5 shadow-sm md:p-8">
   <h2 className="mb-5 text-lg font-bold md:text-xl">{t.details}</h2>
   {notice&&<div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-8 text-slate-800 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-100"><strong className="block">{t.notice}</strong><p>{notice}</p></div>}
   {(address||hours)&&<div className="grid gap-3 md:grid-cols-2">
    {address&&<article className="rounded-xl bg-[var(--fp-ivory)] p-4"><h3 className="mb-2 font-bold">{t.address}</h3><p className="text-sm leading-8">{address}</p>{settings.contact.mapUrl&&<a href={settings.contact.mapUrl} target="_blank" rel="noopener noreferrer" className="mt-3 inline-block text-sm underline">{t.map}</a>}</article>}
    {hours&&<article className="rounded-xl bg-[var(--fp-ivory)] p-4"><h3 className="mb-2 font-bold">{t.hours}</h3><p className="text-sm leading-8">{hours}</p></article>}
   </div>}
   {faq.length>0&&<div className="mt-6"><h3 className="mb-3 font-bold">{t.faq}</h3><div className="grid gap-2">{faq.map((item,i)=><details key={i} className="rounded-xl border border-[var(--fp-line)] p-4"><summary className="cursor-pointer font-semibold">{item.question[language]}</summary><p className="mt-3 text-sm leading-7">{item.answer[language]}</p></details>)}</div></div>}
  </div>
 </section>
}
