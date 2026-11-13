export const inboundSeo = {
  en: { title: 'Afghanistan Inbound Tourism | Fajr Parsa', description: 'Plan your Afghanistan visit with Fajr Parsa in Kabul: airport pickup, private transport, accommodation, interpreter and guide coordination. Enquire before booking.' },
  fa: { title: 'گردشگری ورودی افغانستان | فجر پارسا', description: 'هماهنگی سفر به افغانستان با فجر پارسا در کابل: استقبال میدان هوایی، ترانسپورت، اقامت، ترجمان و رهنمای گردشگری؛ بررسی پیش از رزرو.' },
  ps: { title: 'افغانستان ته د راتلونکو سیلانیانو سفر | فجر پارسا', description: 'په کابل کې له فجر پارسا سره افغانستان ته د سفر همغږي: له هوایي ډګره استقبال، ترانسپورټ، استوګنه، ژباړن او لارښود. له ریزرف مخکې پوښتنه وکړئ.' },
  ar: { title: 'السياحة الوافدة إلى أفغانستان | فجر بارسا', description: 'خطط لزيارة أفغانستان مع فجر بارسا في كابول: الاستقبال والنقل والإقامة وتنسيق المترجمين والمرشدين. استفسر قبل الحجز.' },
}
export const inboundCanonical = 'https://fajr-parsa-qa.pages.dev/inbound'
export const homeDescription = 'Fajr Parsa Travel Commerce — خدمات سفر، ویزا، زیارت، تجارت و پیگیری درخواست'
export function isInboundPath(path: string) {
  return path === '/inbound' || path === '/inbound/' || path === '/inbound.html'
}
// Fragments never reach Pages. Normalize legacy links in the browser, not in _redirects.
export function normalizeLegacyInbound() {
  if (window.location.pathname === '/' && window.location.hash === '#/inbound') {
    window.history.replaceState(window.history.state, '', '/inbound' + window.location.search)
  }
}
export function updateInboundMetadata(language: keyof typeof inboundSeo, inbound: boolean) {
  const seo = inboundSeo[language]
  const set = (selector: string, attributes: Record<string,string>) => {
    const element = document.head.querySelector(selector) || document.head.appendChild(document.createElement('meta'))
    for (const [key,value] of Object.entries(attributes)) element.setAttribute(key,value)
  }
  set('meta[name="description"]', {name:'description', content:inbound ? seo.description : homeDescription})
  if (!inbound) {
    document.head.querySelectorAll('[data-inbound-seo]').forEach(element=>element.remove())
    return
  }
  let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]')
  if (!canonical) { canonical = document.createElement('link'); document.head.appendChild(canonical) }
  canonical.rel = 'canonical'; canonical.href = inboundCanonical; canonical.dataset.inboundSeo = ''
  for (const [property,content] of Object.entries({'og:title':seo.title,'og:description':seo.description,'og:url':inboundCanonical,'og:type':'website','og:locale':language === 'fa' ? 'fa_AF' : language === 'ps' ? 'ps_AF' : language === 'ar' ? 'ar_AR' : 'en_US'})) {
    set(`meta[property="${property}"]`, {property,content,'data-inbound-seo':''})
  }
}
