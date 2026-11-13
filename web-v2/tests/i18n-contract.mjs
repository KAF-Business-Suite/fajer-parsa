import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

// FP-UX-02 / FP-PS-01: deterministic four-language inventory gate for all catalog data.
// Source labels remain stable Dari identifiers. Every customer-facing catalog
// string must have non-empty English, Arabic and Afghan Pashto equivalents.
const read=async path=>readFile(new URL('../'+path,import.meta.url),'utf8')
const [dictionary,pashto,countries,destinations,presentation,services,...screens]=await Promise.all([
  'src/content/site-i18n.ts','src/content/site-ps.ts','src/content/countries.ts','src/content/destinations.ts',
  'src/content/country-presentation.ts','src/content/services.ts','src/App.tsx',
  'src/components/CountryPage.tsx','src/components/CountryExplorer.tsx',
  'src/components/DestinationGallery.tsx','src/components/DetailsDialog.tsx',
  'src/components/FaqSection.tsx',
].map(read))

const keys=new Set([...dictionary.matchAll(/^\s{2}"([^"]+)":\s*\{/gm)].map(m=>m[1]))
const psEntries=[...pashto.matchAll(/^\s{2}("(?:\\.|[^"\\])*"):\s*("(?:\\.|[^"\\])*"),?$/gm)].map(m=>[JSON.parse(m[1]),JSON.parse(m[2])])
const psMap=new Map(psEntries)
assert.equal(psEntries.length,psMap.size,'Duplicate Pashto translation keys')
assert.deepEqual([...keys].filter(key=>!psMap.get(key)),[],'Missing/empty Afghan Pashto catalogue entries')
assert.deepEqual([...psMap.keys()].filter(key=>!keys.has(key)),[],'Orphan Pashto translation keys')
assert.ok(dictionary.includes("'ps'"),'ps must be a first-class SiteLanguage')
assert.ok(psMap.get('ترکیه'),'Turkey needs a Pashto display name')
assert.ok(psMap.get('تابعیت'),'Nationality requires a Pashto translation')
assert.ok(psMap.get('کپی متن یا باز کردن واتساپ به معنی ثبت مرکزی نیست؛ نتیجهٔ ثبت در بخش پایین نمایش داده می‌شود.'),'Consent and recording warnings cannot fall back to Dari')
const names=[...countries.matchAll(/"name":\s*"([^"]+)"/g)].map(m=>m[1])
const inData=[
 ...names,
 ...[...countries.matchAll(/^\s+"([^"]+)"[,]?$/gm)].map(m=>m[1]),
 ...[...destinations.matchAll(/\b(?:name|short|place|category|desc|imageNote):\s*'([^']+)'/g)].map(m=>m[1]),
 ...[...presentation.matchAll(/"place":\s*"([^"]+)"/g)].map(m=>m[1]),
 ...[...presentation.matchAll(/"tags":\s*\[([\s\S]*?)\]/g)].flatMap(m=>[...m[1].matchAll(/"([^"]+)"/g)].map(z=>z[1])),
 ...[...services.matchAll(/\b(?:title|desc|label):\s*'([^']+)'/g)].map(m=>m[1]),
 ...screens.flatMap(src=>[...src.matchAll(/\bt\(\s*(['"])(.*?)\1\s*\)/g)].map(m=>m[2])),
].filter(x=>/[\u0600-\u06ff]/.test(x))
// Iran page generates these seven country-specific labels dynamically.
const iranVisaChoices=['سیاحتی','زیارتی','تجارتی','تحصیلی','کاری','درمانی','دیدار خانواده']
for(const suffix of iranVisaChoices)inData.push('ویزای '+suffix)
const missing=[...new Set(inData)].filter(key=>!keys.has(key))
assert.deepEqual(missing,[], 'Untranslated inventory/source keys: '+JSON.stringify(missing))
assert.equal(names.length,15, 'Review the complete country inventory if number changes')
assert.ok(dictionary.includes('"ترکیه": {'), 'Country Türkiye requires explicit translation')
assert.ok(dictionary.includes('"تابعیت": '), 'Nationality label requires explicit translation')
assert.ok(dictionary.includes('"خدمات سفر به": '), 'Country finder heading requires explicit translation')
console.log(JSON.stringify({gate:'FP-UX-02',status:'PASS',countries:names.length,translatedKeys:keys.size,pashtoKeys:psMap.size,sourceLabelsAudited:new Set(inData).size,untranslated:missing.length,pashtoMissing:0}))
