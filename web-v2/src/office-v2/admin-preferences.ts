/** FP-ADMIN-G6: browser-only UI preferences, never authentication or a company configuration source. */
export type AdminUiLanguage='fa'|'en'
export const ADMIN_LANGUAGE_KEY='fp-admin-console-language-v1'
export function validAdminLanguage(value:unknown):AdminUiLanguage{
 return value==='en'?'en':'fa'
}
export function readAdminLanguage(storage:{getItem:(key:string)=>string|null}|null=typeof localStorage==='undefined'?null:localStorage):AdminUiLanguage{
 try{return validAdminLanguage(storage?.getItem(ADMIN_LANGUAGE_KEY))}catch{return 'fa'}
}
export function saveAdminLanguage(language:AdminUiLanguage,storage:{setItem:(key:string,value:string)=>void}|null=typeof localStorage==='undefined'?null:localStorage):boolean{
 try{storage?.setItem(ADMIN_LANGUAGE_KEY,validAdminLanguage(language));return !!storage}catch{return false}
}
