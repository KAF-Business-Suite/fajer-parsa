/**
 * FP-ADMIN G4: honest page-scoped counters.
 * A 25-item read is NOT a company-wide total; every displayed count here
 * is explicitly a count of returned, permission-scoped records only.
 */
import type {OfficeRequestRow,OfficeStatus} from './live-office-requests'
export type OfficePageSummary={
 shown:number
 received:number
 reviewing:number
 contacted:number
 closed:number
 possiblyMore:boolean
}
export function summarizeOfficePage(rows:readonly OfficeRequestRow[]):OfficePageSummary{
 const out:OfficePageSummary={shown:0,received:0,reviewing:0,contacted:0,closed:0,possiblyMore:false}
 // Callers use validated readOfficeRequests(0); prevent accidental unbounded input.
 if(rows.length>25)throw new RangeError('Office page summary must not exceed 25 records')
 const seen=new Set<string>()
 for(const row of rows){
  if(seen.has(row.id))continue
  seen.add(row.id)
  if(!(['received','reviewing','contacted','closed'] satisfies OfficeStatus[]).includes(row.status))continue
  out[row.status]++
  out.shown++
 }
 // The API has no proven global count. A full first page may have more pages.
 out.possiblyMore=rows.length===25
 return out
}
