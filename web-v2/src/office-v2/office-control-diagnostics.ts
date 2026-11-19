/**
 * FP-SEC-04 — manually initiated, no-write control health probe.
 *
 * Never put credentials, user email, JWT, session cookie or customer data in
 * the result. The existing owner-only BFF is the single authority.
 */
import {readSecurityOverview} from './security-overview'
import {readSiteControlSnapshot} from './site-control-snapshot'
import {readOwnerPagesMetadata} from './private-office-bridge'

export type OfficeProbeName='identity'|'website'|'resources'
export type OfficeProbeStatus='ready'|'sign_in_required'|'access_denied'|'rate_limited'|'unavailable'
export type OfficeProbe={
 name:OfficeProbeName;
 status:OfficeProbeStatus;
 mode:'read_only'|'permissions_reported'|'not_verified';
 canEdit?:boolean;
 canPublish?:boolean;
}
export type OfficeProbeReport={kind:'read_only_diagnostic';checks:[OfficeProbe,OfficeProbe,OfficeProbe]}

/** Only GET requests are performed by the three existing verified BFF adapters. */
export async function checkOfficeControls(transport:typeof fetch=fetch):Promise<OfficeProbeReport>{
 const [auth,site,provider]=await Promise.all([
  readSecurityOverview(transport),
  readSiteControlSnapshot(transport),
  readOwnerPagesMetadata(transport)
 ])
 const identity:OfficeProbe={
  name:'identity',
  status:auth.status,
  mode:auth.status==='ready'?'read_only':'not_verified'
 }
 const website:OfficeProbe=site.status==='ready'?{
  name:'website',status:'ready',mode:'permissions_reported',
  canEdit:site.data.canEdit,canPublish:site.data.canPublish
 }:{
  name:'website',status:site.status,mode:'not_verified'
 }
 const resources:OfficeProbe={
  name:'resources',
  status:provider.status==='connected'?'ready':provider.status,
  mode:provider.status==='connected'?'read_only':'not_verified'
 }
 return {kind:'read_only_diagnostic',checks:[identity,website,resources]}
}
