/** Public-safe fallbacks. Runtime published settings override these values without new builds.
 * Do not place tokens, private contacts, admin drafts or unverified channels here. */
import {useEffect,useState} from 'react'
import {loadPublishedSiteSettings} from './site-settings-client'
const env=import.meta.env as Record<string,string|undefined>
const fallbackWhatsApp='93777377774'
const fallbackEmail='fp.rpc.khwaja@gmail.com'
const proposedWhatsApp=(env.VITE_FAJR_OFFICE_WHATSAPP||fallbackWhatsApp).replace(/\D/g,'')
const proposedEmail=(env.VITE_FAJR_OFFICE_EMAIL||fallbackEmail).trim()
export const officeWhatsApp=/^[1-9][0-9]{6,14}$/.test(proposedWhatsApp)?proposedWhatsApp:fallbackWhatsApp
export const officeEmail=/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(proposedEmail)?proposedEmail:fallbackEmail

/** Shared contact values used in both public contact UI and already-issued intake receipts. */
export function useOfficeContact(){
 const [contact,setContact]=useState<{whatsapp:string;email:string;phone?:string;mapUrl?:string}>({
  whatsapp:officeWhatsApp,email:officeEmail
 })
 useEffect(()=>{
  let mounted=true
  void loadPublishedSiteSettings().then(data=>{
   if(mounted&&data)setContact({...data.contact})
  })
  return ()=>{mounted=false}
 },[])
 return contact
}
