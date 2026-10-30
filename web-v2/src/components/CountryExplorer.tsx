import { countryPresentation } from '../content/country-presentation'
import { useMemo, useState } from 'react'
import { useReducedMotion } from 'motion/react'
import { ArrowLeft, Globe2, Search } from 'lucide-react'
import TiltedCard, { TiltedCardLayer } from './reactbits/TiltedCard'
import { countryServices } from '../content/countries'
import { destinations } from '../content/destinations'
import type { RequestContext } from './DetailsDialog'
import './country-explorer.css'

export function CountryExplorer({onOpenCountry,onRequest}:{onOpenCountry:(name:string)=>void;onRequest:(context:RequestContext)=>void}) {
  const [query,setQuery]=useState('')
  const reduced=useReducedMotion()
  const visible=useMemo(()=>countryServices.filter(country=>(country.name+' '+country.services.join(' ')).includes(query.trim())),[query])
  return <section className="shell country-explorer" id="country-services" aria-labelledby="country-services-title">
    <div className="section-heading"><div><p className="eyebrow">خدمات واقعی فجر پارسا</p><h2 id="country-services-title">کشور شما، خدمت مورد نیاز شما</h2><p className="country-intro">مقصدتان را انتخاب کنید؛ خدمات و مسیر درخواست را یک‌جا ببینید.</p></div><label className="catalog-search"><Search size={18}/><input type="search" aria-label="جستجوی کشور و خدمات" placeholder="کشور یا خدمت" value={query} onChange={event=>setQuery(event.target.value)}/></label></div>
    <div className="country-results"><span>{visible.length} کشور</span><span>ویزا · سفر · تجارت</span></div>
    {visible.length===0 && <p role="status" className="empty-destinations">کشوری با این عبارت پیدا نشد؛ عبارت کوتاه‌تری بنویسید.</p>}
    <div className="country-card-grid">{visible.map(country=>{
      const presentation=countryPresentation[country.name]
      const existing=destinations.find(destination=>destination.short===country.name)
      const photo=existing || (presentation?.image ? {image:presentation.image,place:presentation.place!,imageNote:undefined} : undefined)
      const code=presentation?.code || ''
      const tags=presentation?.tags || ['بررسی خدمات']
      return <TiltedCard key={country.name} className={'country-depth-card'+(photo?' has-photo':' country-graphic')} imageSrc={photo?.image} altText={photo?photo.place+'، '+country.name:country.name} captionText={'خدمات '+country.name} showTooltip={false} containerHeight="224px" imageHeight="224px" containerWidth="100%" imageWidth="100%" radius={24} rotateAmplitude={reduced?0:5} scaleOnHover={reduced?1:1.015} parallax={reduced?0:.3} glare={reduced?0:.22} shadow={.16} gyroscope={false} floating={false} intro={false} flipOnClick={false} onClick={()=>onOpenCountry(country.name)}>
        <div className="country-card-wash" aria-hidden="true"/>
        {!photo && <div className="country-map-art" aria-hidden="true"><Globe2/><span>{code}</span></div>}
        <TiltedCardLayer depth={14} className="country-card-content"><div className="country-card-top"><span className="country-flag" aria-hidden="true"><Globe2 size={18}/></span><span className="country-code" lang="en">{code}</span></div><div className="country-card-bottom"><h3>{country.name}</h3><div className="country-card-tags">{tags.map(tag=><span key={tag}>{tag}</span>)}</div><span className="country-card-action">بررسی خدمات <ArrowLeft size={16}/></span></div></TiltedCardLayer>
        {photo?.imageNote && <span className="country-ai-note">تصویرسازی مقصد</span>}
      </TiltedCard>
    })}</div>
    <p className="country-note">تصویرها برای معرفی مقصد هستند. فهرست خدمات به‌مرور تکمیل می‌شود؛ جزئیات هر درخواست با دفتر بررسی می‌شود.</p>
    <div className="country-booking" id="worldwide-booking"><div><span className="eyebrow">فراتر از این مقصدها</span><h3>تکت و بوکینگ سراسری</h3><p>مسیر مورد نظرتان را بگویید؛ موجودی و شرایط رزرو با دفتر بررسی می‌شود.</p></div><button type="button" className="primary-action" onClick={()=>onRequest({destination:'',service:'پرواز و هتل',bundle:'تکت و بوکینگ سراسری'})}>درخواست تکت و بوکینگ <ArrowLeft size={16}/></button></div>
  </section>
}
