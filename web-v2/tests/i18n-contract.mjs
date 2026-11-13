import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

// FP-UX-02: deterministic trilingual inventory gate for all catalog data.
// Source labels remain stable Dari identifiers. Every customer-facing catalog
// string must have a non-empty English and Arabic display equivalent.
const read=async path=>readFile(new URL('../'+path,import.meta.url),'utf8')
const [dictionary,countries,destinations,presentation,services,...screens]=await Promise.all([
  'src/content/site-i18n.ts','src/content/countries.ts','src/content/destinations.ts',
  'src/content/country-presentation.ts','src/content/services.ts','src/App.tsx',
  'src/components/CountryPage.tsx','src/components/CountryExplorer.tsx',
  'src/components/DestinationGallery.tsx','src/components/DetailsDialog.tsx',
  'src/components/FaqSection.tsx',
].map(read))

const keys=new Set([...dictionary.matchAll(/^\s{2}"([^"]+)":\s*\{/gm)].map(m=>m[1]))
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
console.log(JSON.stringify({gate:'FP-UX-02',status:'PASS',countries:names.length,translatedKeys:keys.size,sourceLabelsAudited:new Set(inData).size,untranslated:missing.length}))
