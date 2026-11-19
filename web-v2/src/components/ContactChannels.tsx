import { Mail, MapPin, MessageCircle, Phone, ShieldCheck } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog'
import { siteText, type SiteLanguage } from '../content/site-i18n'
import { useOfficeContact } from '../lib/office-contact'

/** FP-CONTACT-02: Show usable, verified channels only. Never imply a draft was sent. */
const copy:Record<SiteLanguage,{intro:string,email:string,emailNote:string,whatsappNote:string,privacy:string,subject:string}>={
  fa:{intro:'از راه واتساپ یا ایمیل با دفتر فجرپارسا در تماس شوید.',email:'ایمیل دفتر',emailNote:'برنامهٔ ایمیل باز می‌شود؛ ارسال با شماست.',whatsappNote:'گفت‌وگو در واتساپ باز می‌شود؛ ارسال با شماست.',privacy:'ارسال پیام تنها با اقدام شما در ایمیل یا واتساپ انجام می‌شود.',subject:'درخواست معلومات خدمات فجرپارسا'},
  ps:{intro:'د فجر پارسا دفتر سره د واتساپ یا برېښنالیک له لارې اړیکه ونیسئ.',email:'د دفتر برېښنالیک',emailNote:'د برېښنالیک پروګرام پرانیستل کېږي؛ لېږل ستاسو په خوښه دي.',whatsappNote:'په واتساپ کې خبرې پرانیستل کېږي؛ لېږل ستاسو په خوښه دي.',privacy:'پیغام یوازې ستاسو له تایید وروسته لېږل کېږي.',subject:'د فجر پارسا د خدمتونو پوښتنه'},
  en:{intro:'Contact the Fajr Parsa office directly by WhatsApp or email.',email:'Office email',emailNote:'Opens your email app. You decide whether to send.',whatsappNote:'Opens WhatsApp. You decide whether to send.',privacy:'No message is sent without your action in your email app or WhatsApp.',subject:'Fajr Parsa service enquiry'},
  ar:{intro:'تواصل مع مكتب فجر بارسا عبر واتساب أو البريد الإلكتروني.',email:'البريد الإلكتروني للمكتب',emailNote:'يفتح تطبيق البريد. أنت تقرر إرسال الرسالة.',whatsappNote:'يفتح واتساب. أنت تقرر إرسال الرسالة.',privacy:'لا تُرسل أي رسالة دون موافقتك في البريد أو واتساب.',subject:'استفسار عن خدمات فجر بارسا'}
}
export function ContactChannels({ language, open, onOpenChange }: {
  language: SiteLanguage
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const {email:officeEmail,whatsapp:officeWhatsApp,phone:officePhone,mapUrl:officeMapUrl}=useOfficeContact()
  const t=(value:string)=>siteText(value,language)
  const c=copy[language]
  return <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent id="fp-contact-dialog" className="fp-contact-dialog" dir={language==='en'?'ltr':'rtl'} aria-describedby="fp-contact-description">
      <DialogHeader>
        <p className="fp-contact-kicker">{t('ارتباط مستقیم با دفتر')}</p>
        <DialogTitle className="fp-contact-title">{t('راه‌های ارتباط')}</DialogTitle>
        <DialogDescription id="fp-contact-description" className="fp-contact-lead">{c.intro}</DialogDescription>
      </DialogHeader>
      <div className="fp-contact-channels">
        <a className="fp-channel fp-channel-active" href={'https://wa.me/'+officeWhatsApp} target="_blank" rel="noopener noreferrer">
          <span className="fp-channel-icon"><MessageCircle size={21} aria-hidden="true"/></span>
          <span className="fp-channel-copy">
            <strong>{t('واتساپ دفتر')}</strong>
            <small>{c.whatsappNote}</small>
          </span>
        </a>
        <a className="fp-channel fp-channel-active" href={'mailto:'+officeEmail+'?subject='+encodeURIComponent(c.subject)}>
          <span className="fp-channel-icon"><Mail size={21} aria-hidden="true"/></span>
          <span className="fp-channel-copy">
            <strong>{c.email}</strong>
            <small><b dir="ltr">{officeEmail}</b> — {c.emailNote}</small>
          </span>
        </a>
        {officePhone && <a className="fp-channel fp-channel-active" href={'tel:'+officePhone}><span className="fp-channel-icon"><Phone size={21} aria-hidden="true"/></span><span className="fp-channel-copy"><strong>{language==='fa'?'تماس تلفنی':language==='ps'?'تلیفوني اړیکه':language==='ar'?'اتصال هاتفي':'Call the office'}</strong><small dir="ltr">{officePhone}</small></span></a>}
        {officeMapUrl && <a className="fp-channel fp-channel-active" href={officeMapUrl} target="_blank" rel="noopener noreferrer"><span className="fp-channel-icon"><MapPin size={21} aria-hidden="true"/></span><span className="fp-channel-copy"><strong>{language==='fa'?'موقعیت دفتر':language==='ps'?'د دفتر ځای':language==='ar'?'موقع المكتب':'Office location'}</strong><small>{language==='fa'?'بازکردن نقشه':language==='ps'?'نقشه پرانیستل':language==='ar'?'فتح الخريطة':'Open map'}</small></span></a>}
      </div>
      <p className="fp-contact-privacy"><ShieldCheck size={17} aria-hidden="true"/>{c.privacy}</p>
    </DialogContent>
  </Dialog>
}
