// FP-09 one-time Cloudflare QA Worker bootstrap — DENY ALL traffic.
// Source controlled. This exact artifact can be uploaded with the Workers API.
// No public route, credentials, Supabase calls, or other side effects are possible.
// It is intentionally different from the future audited entry.ts application bundle.
const headers={ 'content-type':'application/json; charset=utf-8',
  'cache-control':'no-store','x-content-type-options':'nosniff','x-robots-tag':'noindex'};
export default {
  async fetch(request){
    const url=new URL(request.url);
    if(url.protocol!=='https:' ||
       url.hostname!=='fp-intake-safe-review.fajr-parsa-qa.pages.dev' ||
       url.pathname!=='/api/requests' || request.method!=='POST'){
      return new Response(JSON.stringify({error:'not_found'}),{status:404,headers});
    }
    return new Response(JSON.stringify({error:'intake_not_enabled'}),{status:503,headers});
  }
};
