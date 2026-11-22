/**
 * KAF-35 / FP-UNIFY-02 — canonical private Admin Console entry for old
 * Office URLs. Never send authenticated data, cookies, or API keys to Pages.
 *
 * Keep the formerly independent HTML assets in the QA rollback version;
 * /site-settings and /resources no longer open a second visual shell.
 */
const PRIVATE_ORIGIN='fajr-office-qa.khoojafahim.workers.dev';
const DESTINATIONS=Object.freeze({
 '/site-settings':Object.freeze({module:'website',login:'console-website'}),
 '/resources':Object.freeze({module:'resources',login:'console-resources'})
});
export function legacyConsoleNavigation(request,security){
 const url=new URL(request.url);
 if(url.hostname!==PRIVATE_ORIGIN||request.method!=='GET')return null;
 const selected=DESTINATIONS[url.pathname];
 if(!selected)return null;
 // No source URL/query/host is copied into the Location header.
 // A present cookie is only a navigation hint: /console ALWAYS rechecks role.
 const hasSession=(request.headers.get('Cookie')||'').split(';').some(x=>x.trim().startsWith('__Host-fp-office-session='));
 const location=hasSession?'/console#/'+selected.module:'/?next='+selected.login;
 const h=new Headers(security);
 h.set('Location',location);
 h.set('Cache-Control','private, no-store');
 h.set('X-Robots-Tag','noindex, nofollow');
 return new Response(null,{status:302,headers:h});
}
