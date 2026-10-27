import { useEffect, useMemo, useState } from 'react'
import { ArrowLeft, Heart, Maximize2, Search } from 'lucide-react'
import { destinations } from '../content/destinations'
import { Reveal } from './Reveal'
import type { Selection } from './DetailsDialog'

export function DestinationGallery({ onSelect }: { onSelect: (selection: Selection) => void }) {
  const [category, setCategory] = useState('همه مقصدها')
  const [query, setQuery] = useState('')
  const [selectedOnly,setSelectedOnly] = useState(false)
  const [favorites,setFavorites] = useState<string[]>(()=>{
    try { const saved=JSON.parse(localStorage.getItem('fajr-parsa-destination-favorites-v1') || '[]');return Array.isArray(saved)?destinations.filter(d=>saved.includes(d.short)).map(d=>d.short):[] } catch { return [] }
  })
  useEffect(()=>{try{localStorage.setItem('fajr-parsa-destination-favorites-v1',JSON.stringify(favorites))}catch{/* Browsing and selection remain available when storage is disabled. */}},[favorites])
  const toggleFavorite=(country:string)=>setFavorites(current=>current.includes(country)?current.filter(x=>x!==country):[...current,country])
  const visible = useMemo(() => destinations.filter(d => (!selectedOnly || favorites.includes(d.short)) && (category === 'همه مقصدها' || d.category === category) && (d.name+' '+d.place).includes(query.trim())), [category,query,selectedOnly,favorites])
  const openDestination=(destination:typeof destinations[number])=>onSelect({title:destination.name,description:destination.desc+'؛ شرایط و امکان ارائهٔ خدمت پس از بررسی با دفتر مشخص می‌شود.',image:destination.detailImage || destination.image,imageNote:destination.imageNote,location:destination.place,category:destination.category,destination:destination.short})
  return <section id="destinations" className="destination-section shell">
    <div className="section-heading"><div className="destination-intro"><Reveal><p className="eyebrow">برای انتخاب سفر بعدی</p><h2>هر مقصد، یک تجربهٔ تازه</h2><p>از شهرهای پرجنب‌وجوش تا منظره‌های آرام؛ مقصد را انتخاب کنید و خدمات مورد نیازتان را بررسی کنید.</p></Reveal></div>
      <label className="catalog-search"><Search size={18}/><input type="search" aria-label="جستجو در مقصدها" placeholder="کشور یا شهر" value={query} onChange={e=>setQuery(e.target.value)}/></label>
    </div>
    <div className="destination-toolbar"><div className="destination-filters" role="group" aria-label="دسته‌بندی مقصدها">{['همه مقصدها','شهری','طبیعت','فرهنگ و زیارت'].map(item=><button type="button" key={item} aria-pressed={category===item} onClick={()=>setCategory(item)}>{item}</button>)}</div><button type="button" className="favorites-filter" aria-pressed={selectedOnly} onClick={()=>setSelectedOnly(!selectedOnly)}><Heart size={16}/> منتخب‌های من ({favorites.length})</button></div>
    <p className="sr-only" role="status">{visible.length} مقصد پیدا شد</p>
    {visible.length===0 && <p className="empty-destinations">{selectedOnly && favorites.length===0?'هنوز مقصدی انتخاب نکرده‌اید؛ با نشان قلب، مقصد دلخواه را نگه دارید.':'مقصدی با این عبارت و فیلتر پیدا نشد.'}</p>}
    <div className="destination-grid">{visible.map((destination,index)=><Reveal key={destination.name} className={destination.imageNote && category==='همه مقصدها' && !selectedOnly && !query.trim()?'destination-featured':undefined} delay={Math.min(index*.035,.15)}>
      <article className="destination-card">
        <div className="destination-photo"><button type="button" className="destination-image-button" aria-label={'تماشای '+destination.name} onClick={()=>openDestination(destination)}><img src={destination.image} alt={destination.place+'، '+destination.name} loading="lazy" decoding="async" width="720" height="480"/><span className="photo-open-hint"><Maximize2 size={15}/><span>کشف مقصد</span></span></button><span className="destination-category">{destination.category}</span><button type="button" className="favorite-button" aria-label={(favorites.includes(destination.short)?'حذف ':'افزودن ')+destination.name+(favorites.includes(destination.short)?' از منتخب‌ها':' به منتخب‌ها')} aria-pressed={favorites.includes(destination.short)} onClick={()=>toggleFavorite(destination.short)}><Heart size={18}/></button>{destination.imageNote && <small className="image-origin-label">تصویرسازی مقصد</small>}</div>
        <div className="destination-copy"><span className="destination-place">{destination.place}</span><h3>{destination.name}</h3><p>{destination.desc}</p><button type="button" onClick={()=>openDestination(destination)}>خدمات این مقصد <ArrowLeft size={16}/></button></div>
      </article>
    </Reveal>)}</div>
    <p className="destination-footnote">تصویرها معرفی مقصد هستند؛ قیمت، ظرفیت و امکان سفر برای هر درخواست جداگانه بررسی می‌شود.</p>
  </section>
}
