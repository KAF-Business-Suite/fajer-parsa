import { Bot, Mail, MessageCircle, Send, ShieldCheck } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog'
import { siteText, type SiteLanguage } from '../content/site-i18n'

/**
 * FP-CONTACT-01 — only independently verified business destinations may be links.
 * No messages, CRM records or customer data are sent from this UI.
 */
export function ContactChannels({ language, open, onOpenChange }: {
  language: SiteLanguage
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const t=(value:string)=>siteText(value,language)
  const pending=[
    {key:'تلگرام',Icon:Send},
    {key:'ایمیل',Icon:Mail},
    {key:'دستیار هوشمند',Icon:Bot},
  ]
  return <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="fp-contact-dialog" dir={language==='en'?'ltr':'rtl'} aria-describedby="fp-contact-description">
      <DialogHeader>
        <p className="fp-contact-kicker">{t('ارتباط مستقیم با دفتر')}</p>
        <DialogTitle className="fp-contact-title">{t('راه‌های ارتباط')}</DialogTitle>
        <DialogDescription id="fp-contact-description" className="fp-contact-lead">
          {t('فقط کانال‌های تأییدشده فعال هستند.')}
        </DialogDescription>
      </DialogHeader>
      <div className="fp-contact-channels">
        <a className="fp-channel fp-channel-active" href="https://wa.me/93777377774" target="_blank" rel="noopener noreferrer">
          <span className="fp-channel-icon"><MessageCircle size={21} aria-hidden="true"/></span>
          <span className="fp-channel-copy">
            <strong>{t('واتساپ دفتر')}</strong>
            <small>{t('پیام را خودتان در واتساپ ارسال می‌کنید.')}</small>
          </span>
          <span className="fp-channel-status fp-channel-status-live">{t('فعال')}</span>
        </a>
        {pending.map(({key,Icon})=><div key={key} className="fp-channel fp-channel-pending">
          <span className="fp-channel-icon"><Icon size={20} aria-hidden="true"/></span>
          <span className="fp-channel-copy"><strong>{t(key)}</strong><small>{t('پس از تأیید نشانی رسمی فعال می‌شود.')}</small></span>
          <span className="fp-channel-status">{t('در انتظار تأیید')}</span>
        </div>)}
      </div>
      <p className="fp-contact-privacy"><ShieldCheck size={17} aria-hidden="true"/>{t('این صفحه هیچ پیام یا درخواست را خودکار ارسال نمی‌کند.')}</p>
    </DialogContent>
  </Dialog>
}
