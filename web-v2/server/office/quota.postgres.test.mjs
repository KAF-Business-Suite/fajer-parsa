import { test } from 'node:test'
import assert from 'node:assert/strict'
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
const exec = promisify(execFile)
const connection = new URL(process.env.OFFICE_TEST_DATABASE_URL || 'invalid:')
if (!['localhost','127.0.0.1','[::1]'].includes(connection.hostname)
 || connection.pathname !== '/fajr_office_test' || connection.protocol !== 'postgresql:') {
 throw new Error('A disposable loopback fajr_office_test database is required')
}
// Pass the synthetic connection in the environment, never in process arguments/output.
const env = { ...process.env, PGDATABASE: connection.toString() }
const sql = async text => (await exec('psql',['-XAt','-v','ON_ERROR_STOP=1','-c',text],{env})).stdout.trim()
const actor='d5072836-0d50-4dfa-88dc-596e9befd276'
const other='19eb0b58-dee3-4db7-898e-f57f01c72ade'
const outsider='29eb0b58-dee3-4db7-898e-f57f01c72ade'
const slot = id => sql(`set role service_role; select public.fajr_office_take_slot('${id}')`).then(x=>x.split('\n').at(-1))

test('atomic quota, isolation, expiry and permissions on PostgreSQL',async()=>{
 await exec('psql',['-X','-v','ON_ERROR_STOP=1','-f',new URL('./sql-test/setup.sql',import.meta.url).pathname],{env})
 for(const role of ['anon','authenticated']){
  await assert.rejects(sql(`set role ${role}; select public.fajr_office_take_slot('${actor}')`),/permission denied/)
  await assert.rejects(sql(`set role ${role}; select * from fajr_private.office_quota`),/permission denied/)
 }
 await assert.rejects(slot(outsider),/Office access denied/)
 // Four concurrent waves keep the disposable database below its connection limit.
 const results=[]
 for(let wave=0;wave<4;wave++)results.push(...await Promise.all(Array.from({length:20},()=>slot(actor))))
 assert.equal(results.filter(x=>x==='t').length,60)
 assert.equal(results.filter(x=>x==='f').length,20)
 assert.equal(await sql(`select used from fajr_private.office_quota where user_id='${actor}'`),'60')
 assert.equal(await slot(other),'t')
 await sql(`update fajr_private.office_quota set window_started_at=clock_timestamp()-interval '61 seconds' where user_id='${actor}'`)
 assert.equal(await slot(actor),'t')
 assert.equal(await sql(`select used from fajr_private.office_quota where user_id='${actor}'`),'1')
 await sql(`update fajr_private.office_members set enabled=false where user_id='${actor}'`)
 await assert.rejects(slot(actor),/Office access denied/)
 assert.equal(await sql(`select count(*) from fajr_private.office_quota`),'2')
 assert.equal(await sql(`select count(*) from public.fajr_web_requests`),'0')
})
