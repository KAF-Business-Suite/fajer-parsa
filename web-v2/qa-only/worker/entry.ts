// Private FP-09 QA intake Worker. Not routed publicly, not deployed by normal CI.
// All privileged bindings live here, never on shared Pages preview environments.
import {onRequest} from '../../server/intake/pages-entry.ts'

type RateLimit={limit:(options:{key:string})=>Promise<{success:boolean}>}
type Env={
  FAJR_INTAKE_ENABLED?:string
  SUPABASE_URL?:string
  SUPABASE_SERVER_KEY?:string
  TURNSTILE_SECRET_KEY?:string
  FAJR_RATE_LIMIT?:RateLimit
}
export default {
  async fetch(request:Request,env:Env):Promise<Response>{
    return onRequest({request,env})
  }
}
