import test from 'node:test'
import assert from 'node:assert/strict'
import vm from 'node:vm'
import {SITE_JS} from '../../workers/fajr-office-qa/site-settings-ui.mjs'

const begin=SITE_JS.indexOf('function latinDigits(')
const end=SITE_JS.indexOf('function at(obj,path)',begin)
assert.ok(begin>=0&&end>begin,'Pure site settings validation helpers are defined')
const context=vm.createContext({URL,document:{querySelector:()=>null},setStatus:()=>{},t:s=>s})
new vm.Script(SITE_JS.slice(begin,end),{filename:'site-settings-validation.js'}).runInContext(context)
const calc=source=>vm.runInContext(source,context)

test('Afghan national mobile numbers in Dari and Arabic digits become international',()=>{
 assert.equal(calc("normalizeMobile('۰۷۸۱۲۳۴۵۶۷',true)"),'93781234567')
 assert.equal(calc("normalizeMobile('٠٧٧١٢٣٤٥٦٧')"),'+93771234567')
 assert.equal(calc("normalizeMobile('0781234567',true)"),'93781234567')
 assert.equal(calc("normalizeMobile('+93781234567',true)"),'93781234567')
 assert.equal(calc("normalizeMobile('0093781234567')"),'+93781234567')
})

test('foreign international numbers are not prefixed with 93',()=>{
 assert.equal(calc("normalizeMobile('+447700900123',true)"),'447700900123')
 assert.equal(calc("normalizeMobile('+447700900123')"),'+447700900123')
})

test('only safe publishable contact formats are accepted',()=>{
 assert.equal(calc("draftIssue({contact:{whatsapp:'93781234567',email:'qa@example.invalid',phone:'+93771234567'}},true)"),null)
 assert.equal(calc("draftIssue({contact:{whatsapp:'0781234567',email:'qa@example.invalid'}},true).key"),'invalidNumber')
 assert.equal(calc("draftIssue({contact:{whatsapp:'93781234567',email:'not-an-email'}},true).key"),'invalidEmail')
 assert.equal(calc("draftIssue({contact:{whatsapp:'93781234567',email:'qa@example.invalid',mapUrl:'https://evil.invalid/hello'}},true).key"),'invalidMap')
 assert.equal(calc("draftIssue({contact:{whatsapp:'',email:''}},false)"),null)
})

test('PostgreSQL JSONB key ordering cannot cause a false unsaved-change warning',()=>{
 assert.equal(calc("sameDraft({contact:{whatsapp:'93781234567',email:'qa@example.invalid'},design:{fontPreset:'vazirmatn-manrope'}},{design:{fontPreset:'vazirmatn-manrope'},contact:{email:'qa@example.invalid',whatsapp:'93781234567'}})"),true)
 assert.equal(calc("sameDraft({contact:{whatsapp:'93781234567'}},{contact:{whatsapp:'93781234568'}})"),false)
})
