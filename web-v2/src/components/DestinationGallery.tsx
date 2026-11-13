import { siteText, type SiteLanguage } from '../content/site-i18n'
import { useEffect, useMemo, useState } from 'react'
import { ArrowLeft, Heart, Maximize2, Search } from 'lucide-react'
import { destinations } from '../content/destinations'
import { Reveal } from './Reveal'
import type { Selection } from './DetailsDialog'

export function DestinationGallery({ language,onSelect }: { language:SiteLanguage;onSelect: (selection: Selection) => void }) {
  const t=(v:string)=>siteText(v,language)
  const [category, setCategory] = useState('همه مقصدها')
  const [query, setQuery] = useState('')
  const [selectedOnly,setSelectedOnly] = useState(false)
  const [favorites,setFavorites] = useState<string[]>(()=>{
    try { const saved=JSON.parse(localStorage.getItem('fajr-parsa-destination-favorites-v1') || '[]');return Array.isArray(saved)?destinations.filter(d=>saved.includes(d.short)).map(d=>d.short):[] } catch { return [] }
  })
  useEffect(()=>{try{localStorage.setItem('fajr-parsa-destination-favorites-v1',JSON.stringify(favorites))}catch{/* Browsing and selection remain available when storage is disabled. */}},[favorites])
  const toggleFavorite=(country:string)=>setFavorites(current=>current.includes(country)?current.filter(x=>x!==country):[...current,country])
  const visible = useMemo(() => destinations.filter(d => (!selectedOnly || favorites.includes(d.short)) && (category === 'همه مقصدها' || d.category === category) && (t(d.name)+' '+t(d.place)+' '+d.name).toLocaleLowerCase().includes(query.trim().toLocaleLowerCase())), [category,query,selectedOnly,favorites,language])
  const openDestination=(destination:typeof destinations[number])=>onSelect({title:t(destination.name),description:t(destination.desc)+(language==='en'?'; availability and requirements are confirmed by the office.':language==='ar'?'؛ يؤكد المكتب التوفر والشروط بعد المراجعة.':language==='ps'?'؛ ظرفیت او شرایط له دفتر سره له ارزونې وروسته تاییدېږي.':'؛ شرایط و امکان ارائهٔ خدمت پس از بررسی با دفتر مشخص می‌شود.'),image:destination.detailImage || destination.image,imageNote:destination.imageNote?t(destination.imageNote):undefined,location:t(destination.place),category:t(destination.category),destination:destination.short})
  return <section id="destinations" className="destination-section shell">
    <div className="section-heading"><div className="destination-intro"><Reveal><p className="eyebrow">{t("برای انتخاب سفر بعدی")}</p><h2>{t("هر مقصد، یک تجربهٔ تازه")}</h2><p>{t("از شهرهای پرجنب‌وجوش تا منظره‌های آرام؛ مقصد را انتخاب کنید و خدمات مورد نیازتان را بررسی کنید.")}</p></Reveal></div>
      <label className="catalog-search"><Search size={18}/><input type="search" aria-label={t("جستجو در مقصدها")} placeholder={t("کشور یا شهر")} value={query} onChange={e=>setQuery(e.target.value)}/></label>
    </div>
    <div className="destination-toolbar"><div className="destination-filters" role="group" aria-label={t("دسته‌بندی مقصدها")}>{['همه مقصدها','شهری','طبیعت','فرهنگ و زیارت'].map(item=><button type="button" key={item} aria-pressed={category===item} onClick={()=>setCategory(item)}>{t(item)}</button>)}</div><button type="button" className="favorites-filter" aria-pressed={selectedOnly} onClick={()=>setSelectedOnly(!selectedOnly)}><Heart size={16}/>{language==='en'?'My favorites':language==='ar'?'المفضلة':language==='ps'?'زما خوښونه':'منتخب‌های من'} ({favorites.length})</button></div>
    <p className="sr-only" role="status">{visible.length} {language==='en'?'destinations found':language==='ar'?'وجهة متاحة':language==='ps'?'منزلونه وموندل شول':'مقصد پیدا شد'}</p>
    {visible.length===0 && <p className="empty-destinations">{t(selectedOnly && favorites.length===0?'هنوز مقصدی انتخاب نکرده‌اید؛ با نشان قلب، مقصد دلخواه را نگه دارید.':'مقصدی با این عبارت و فیلتر پیدا نشد.')}</p>}
    <div className="destination-grid">{visible.map((destination,index)=><Reveal key={destination.name} className={destination.imageNote && category==='همه مقصدها' && !selectedOnly && !query.trim()?'destination-featured':undefined} delay={Math.min(index*.035,.15)}>
      <article className="destination-card">
        <div className="destination-photo"><button type="button" className="destination-image-button" aria-label={language==='en'?'View '+t(destination.name):language==='ar'?'عرض '+t(destination.name):language==='ps'?'منزل وګورئ: '+t(destination.name):'تماشای '+destination.name} onClick={()=>openDestination(destination)}><img src={destination.image} alt={t(destination.place)+(language==='en'?', ':'، ')+t(destination.name)} loading="lazy" decoding="async" width="720" height="480"/><span className="photo-open-hint"><Maximize2 size={15}/><span>{t("کشف مقصد")}</span></span></button><span className="destination-category">{t(destination.category)}</span><button type="button" className="favorite-button" aria-label={language==='en'?(favorites.includes(destination.short)?'Remove '+t(destination.name)+' from favorites':'Add '+t(destination.name)+' to favorites'):language==='ar'?(favorites.includes(destination.short)?'إزالة '+t(destination.name)+' من المفضلة':'إضافة '+t(destination.name)+' إلى المفضلة'):language==='ps'?(favorites.includes(destination.short)?'له خوښونو لرې کړئ: ':'خوښونو ته ورزیات کړئ: ')+t(destination.name):(favorites.includes(destination.short)?'حذف ':'افزودن ')+destination.name+(favorites.includes(destination.short)?' از منتخب‌ها':' به منتخب‌ها')} aria-pressed={favorites.includes(destination.short)} onClick={()=>toggleFavorite(destination.short)}><Heart size={18}/></button>{destination.imageNote && <small className="image-origin-label">{t("تصویرسازی مقصد")}</small>}</div>
        <div className="destination-copy"><span className="destination-place">{t(destination.place)}</span><h3>{t(destination.name)}</h3><p>{t(destination.desc)}</p><button type="button" onClick={()=>openDestination(destination)}>{t("خدمات این مقصد")}<ArrowLeft size={16}/></button></div>
      </article>
    </Reveal>)}</div>
    <p className="destination-footnote">{t("تصویرها معرفی مقصد هستند؛ قیمت، ظرفیت و امکان سفر برای هر درخواست جداگانه بررسی می‌شود.")}</p>
  </section>
}
