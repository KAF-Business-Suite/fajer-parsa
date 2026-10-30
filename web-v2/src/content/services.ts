import { TicketCheck, BriefcaseBusiness, Plane, Building2, FileText, ShieldCheck } from 'lucide-react'

// Shared homepage and request catalog; keep service names consistent.
export const serviceGroups = [
  { title: 'ویزا و اقامت', icon: TicketCheck, desc: 'توریستی، تجاری، تحصیلی، کاری، زیارتی، تمدید، تغییر وضعیت و اقامت.', label: 'ویزا و اقامت' },
  { title: 'دعوتنامه و تجارت', icon: BriefcaseBusiness, desc: 'دعوتنامه تجاری، نمایشگاه، سفر کاری، جلسات و خدمات شرکتی.', label: 'سفر کاری' },
  { title: 'پرواز و هتل', icon: Plane, desc: 'درخواست بلیت، رزرو هتل، مسیر سفر و بسته‌های ترکیبی.', label: 'پرواز و هتل' },
  { title: 'زیارت و کاروان', icon: Building2, desc: 'عمره، کربلا، ایران و خدمات گروهی و زیارتی.', label: 'سفر زیارتی' },
  { title: 'اسناد و کنسولی', icon: FileText, desc: 'ترجمه، تصدیق، فرم، وقت سفارت و آماده‌سازی پرونده.', label: 'خدمات اسناد' },
  { title: 'خدمات مکمل سفر', icon: ShieldCheck, desc: 'بیمه، ترانسفر، بررسی اسناد و خدمات پشتیبان سفر.', label: 'همراه سفر' },
]

export const serviceNames = serviceGroups.map(service => service.title)
