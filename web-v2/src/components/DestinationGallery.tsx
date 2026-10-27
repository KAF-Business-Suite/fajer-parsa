import { useMemo, useState } from 'react'
import { ArrowLeft, Search } from 'lucide-react'
import { destinations } from '../content/destinations'
import { Reveal } from './Reveal'
import type { Selection } from './DetailsDialog'

export function DestinationGallery({ onSelect }: { onSelect: (selection: Selection) => void }) {
  const [category, setCategory] = useState('همه مقصدها')
  const [query, setQuery] = useState('')
  const visible = useMemo(() => destinations.filter(d => (category === 'همه مقصدها' || d.category === category) && (d.name+' '+d.place).includes(query.trim())), [category,query])
  return <section id="destinations" className="destination-section shell">
    <div className="section-heading"><div className="destination-intro"><Reveal><p className="eyebrow">برای انتخاب سفر بعدی</p><h2>هر مقصد، یک تجربهٔ تازه</h2><p>از شهرهای پرجنب‌وجوش تا منظره‌های آرام؛ مقصد را انتخاب کنید و خدمات مورد نیازتان را بررسی کنید.</p></Reveal></div>
      <label className="catalog-search"><Search size={18}/><input type="search" aria-label="جستجو در مقصدها" placeholder="کشور یا شهر" value={query} onChange={e=>setQuery(e.target.value)}/></label>
    </div>
    <div className="destination-filters" role="group" aria-label="دسته‌بندی مقصدها">{['همه مقصدها','شهری','طبیعت','فرهنگ و زیارت'].map(item=><button type="button" key={item} aria-pressed={category===item} onClick={()=>setCategory(item)}>{item}</button>)}</div>
    <p className="sr-only" role="status">{visible.length} مقصد پیدا شد</p>
    {visible.length===0 && <p className="empty-destinations">مقصدی با این عبارت پیدا نشد.</p>}
    <div className="destination-grid">{visible.map((destination,index)=><Reveal key={destination.name} delay={Math.min(index*.035,.15)}>
      <article className="destination-card">
        <div className="destination-photo"><img src={destination.image} alt={destination.place+'، '+destination.name} loading="lazy" decoding="async" width="720" height="540"/><span>{destination.category}</span></div>
        <div className="destination-copy"><span className="destination-place">{destination.place}</span><h3>{destination.name}</h3><p>{destination.desc}</p><button type="button" onClick={()=>onSelect({title:destination.name,description:destination.desc+'؛ شرایط و امکان ارائهٔ خدمت پس از بررسی با دفتر مشخص می‌شود.',image:destination.image,destination:destination.short})}>باز کردن مقصد <ArrowLeft size={16}/></button></div>
      </article>
    </Reveal>)}</div>
    <p className="destination-footnote">تصویرها معرفی مقصد هستند؛ قیمت، ظرفیت و امکان سفر برای هر درخواست جداگانه بررسی می‌شود.</p>
  </section>
}
