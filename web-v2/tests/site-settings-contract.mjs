import assert from 'node:assert/strict'
import { parsePublishedSiteSettings, validMapUrl } from '../src/lib/site-settings-contract.ts'

const valid={
  version:1,site:'fajr-parsa',revision:'qa-check-000001',publishedAt:'2026-11-16T08:00:00Z',
  contact:{whatsapp:'93777377774',email:'contact@example.invalid',phone:'+93777377774',mapUrl:'https://maps.app.goo.gl/example123'},
  design:{fontPreset:'vazirmatn-manrope'}
}
assert.deepEqual(parsePublishedSiteSettings(valid),valid)
assert.ok(parsePublishedSiteSettings({...valid,contact:{whatsapp:'93777377774',email:'info@example.invalid'}}))
for(const invalid of [
 {...valid,site:'rpc'},
 {...valid,privateToken:'not-allowed'},
 {...valid,contact:{...valid.contact,serviceRoleKey:'not-allowed'}},
 {...valid,contact:{...valid.contact,whatsapp:'https://attacker.invalid'}},
 {...valid,contact:{...valid.contact,email:'bad@@example'}},
 {...valid,contact:{...valid.contact,mapUrl:'javascript:alert(1)'}},
 {...valid,contact:{...valid.contact,mapUrl:'https://maps.app.goo.gl.attacker.invalid/x'}},
 {...valid,design:{fontPreset:'https://attacker.invalid/font.css'}},
 {...valid,revision:'../../wrong'},
 {...valid,publishedAt:'not-a-date'}
]) assert.equal(parsePublishedSiteSettings(invalid),null,'reject unsafe or extra fields')
assert.equal(validMapUrl('https://www.google.com/maps/place/Kabul'),true)
assert.equal(validMapUrl('https://www.openstreetmap.org/#map=12/34.5/69.2'),true)
assert.equal(validMapUrl('https://evil.google.com/maps'),false)
assert.equal(validMapUrl('http://maps.google.com/maps'),false)
console.log('FP-SITE-CONTROL: published-only whitelist and verified contact/map URLs PASS')
