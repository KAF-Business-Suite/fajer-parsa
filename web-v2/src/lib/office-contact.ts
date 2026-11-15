/** Fajr public contact channels: replace at build time when an official domain is approved. No secrets. */
const env=import.meta.env as Record<string,string|undefined>
const fallbackWhatsApp='93777377774'
const fallbackEmail='fp.rpc.khwaja@gmail.com'
const proposedWhatsApp=(env.VITE_FAJR_OFFICE_WHATSAPP||fallbackWhatsApp).replace(/\D/g,'')
const proposedEmail=(env.VITE_FAJR_OFFICE_EMAIL||fallbackEmail).trim()
export const officeWhatsApp=/^[1-9][0-9]{6,14}$/.test(proposedWhatsApp)?proposedWhatsApp:fallbackWhatsApp
export const officeEmail=/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(proposedEmail)?proposedEmail:fallbackEmail
