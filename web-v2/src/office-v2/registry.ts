/**
 * FP-ADMIN-V2 | Modular module registry and global UI policy.
 *
 * Design-only shell. Every module is replaceable and has no direct credential,
 * network or database access. Existing Office BFF + Supabase remain the only
 * approved future source of truth. No parallel auth or second CMS.
 */
export type Lang = 'fa' | 'ps' | 'en' | 'ar'
export type ModuleId =
  | 'overview' | 'website' | 'requests' | 'customers'
  | 'services' | 'finance' | 'messages' | 'reports'
  | 'organization' | 'settings'

export type Translated = Record<Lang, string>
export type ModuleSpec = {
  id: ModuleId
  label: Translated
  group: 'workspace' | 'business' | 'control'
  access: 'owner' | 'staff' | 'finance'
  integration: 'future-bff' | 'public-published-only'
}

export const languages: {id: Lang; label:string; dir:'rtl'|'ltr'}[] = [
  {id:'fa', label:'دری', dir:'rtl'},
  {id:'ps', label:'پښتو', dir:'rtl'},
  {id:'en', label:'English', dir:'ltr'},
  {id:'ar', label:'العربية', dir:'rtl'},
]

export const modules: ModuleSpec[] = [
  {id:'overview',group:'workspace',access:'staff',integration:'future-bff',
   label:{fa:'داشبورد',ps:'ډشبورډ',en:'Dashboard',ar:'لوحة التحكم'}},
  {id:'requests',group:'workspace',access:'staff',integration:'future-bff',
   label:{fa:'درخواست‌ها',ps:'غوښتنې',en:'Requests',ar:'الطلبات'}},
  {id:'customers',group:'workspace',access:'staff',integration:'future-bff',
   label:{fa:'مشتریان',ps:'پېرودونکي',en:'Customers',ar:'العملاء'}},
  {id:'website',group:'business',access:'owner',integration:'public-published-only',
   label:{fa:'مدیریت وب‌سایت',ps:'د وېبپاڼې مدیریت',en:'Website manager',ar:'إدارة الموقع'}},
  {id:'services',group:'business',access:'owner',integration:'future-bff',
   label:{fa:'خدمات و کشورها',ps:'خدمتونه او هېوادونه',en:'Services & countries',ar:'الخدمات والدول'}},
  {id:'finance',group:'business',access:'finance',integration:'future-bff',
   label:{fa:'مالی و رسیدها',ps:'مالیه او رسیدونه',en:'Finance & receipts',ar:'المالية والإيصالات'}},
  {id:'messages',group:'business',access:'owner',integration:'future-bff',
   label:{fa:'ارتباطات',ps:'اړیکې',en:'Communications',ar:'الاتصالات'}},
  {id:'reports',group:'control',access:'owner',integration:'future-bff',
   label:{fa:'گزارش‌ها',ps:'راپورونه',en:'Reports',ar:'التقارير'}},
  {id:'organization',group:'control',access:'owner',integration:'future-bff',
   label:{fa:'شرکت و کارکنان',ps:'شرکت او کارکوونکي',en:'Company & people',ar:'الشركة والموظفون'}},
  {id:'settings',group:'control',access:'owner',integration:'future-bff',
   label:{fa:'تنظیمات و امنیت',ps:'ترتیبات او امنیت',en:'Settings & security',ar:'الإعدادات والأمان'}},
]

export const copy: Record<Lang, Record<string,string>> = {
  fa:{
   slogan:'مرکز مدیریت یکپارچهٔ فجرپارسا', preview:'پیش‌نمایش طراحی — هیچ اطلاعات واقعی متصل نیست',
   search:'جستجو در پنل',demo:'حالت نمایشی',welcome:'مدیریت همهٔ فعالیت‌ها، از یک محل',
   workspace:'فضای کاری',business:'بخش‌های تجاری',control:'مدیریت و کنترول',
   activity:'مرور فعالیت‌ها',quick:'اقدامات سریع',newRequest:'درخواست جدید',
   today:'امروز',inbox:'درخواست‌ها',customers:'مشتریان',pending:'نیازمند بررسی',
   siteStatus:'وضعیت وب‌سایت',draft:'پیش‌نویس',published:'منتشرشده',unpublished:'منتشر نشده',
   siteContent:'مدیریت محتوا',visualPreview:'پیش‌نمایش واقعی سایت',edit:'ویرایش',
   brand:'هویت و برند',publicPages:'صفحات و منوها',serviceCatalog:'خدمات و کشورها',
   officeDetails:'اطلاعات دفتر',review:'مرور تغییرات',approvals:'تأییدیه‌ها',
   faq:'پرسش‌های متداول',translations:'چهار زبان',draftStatus:'پیش‌نویسِ نمونه',
   sampleOnly:'تمام معلومات این صفحه نمونه‌اند؛ نشر و ارسال واقعی غیرفعال است.',
   publishing:'مدیریت نشر',check:'بررسی تغییرات',previewWebsite:'نمایش وب‌سایت',
   home:'خانه',menu:'بیشتر',owner:'مدیر مسئول',signIn:'ورود مجدد در نسخهٔ واقعی',
   noConnected:'هنوز به داده‌های زنده وصل نشده است',noSending:'پیام‌رسانی غیرفعال',
   start:'شروع کار',close:'بستن',cancel:'انصراف',approve:'تأیید در نمونه',
   approved:'تأیید نمایشی ثبت شد؛ هیچ چیزی نشر نشد.',history:'تاریخچهٔ تصمیم‌ها',
   log:'ثبت تغییرات',permission:'نقش و مجوز',audit:'گزارش ممیزی',
   deployLocked:'نشر اصلی مسدود است',previewMode:'مشاهدهٔ نمونه',
   selectSection:'بخش موردنظر را انتخاب کنید',
   moreTitle:'ماژول‌های مدیریتی',secure:'اطلاعات خصوصی خارج از پیش‌نمایش',
  },
  ps:{
   slogan:'د فجرپارسا یوځای مدیریت',preview:'ازمایښتي ډیزاین — ریښتیني معلومات نشته',
   search:'په پنل کې لټون',demo:'ازمایښتي حالت',welcome:'ټول کارونه له یو ځایه مدیریت کړئ',
   workspace:'کاري چاپېریال',business:'سوداګریزې برخې',control:'مدیریت او کنټرول',
   activity:'د کارونو کتنه',quick:'چټک ګامونه',newRequest:'نوې غوښتنه',
   today:'نن',inbox:'غوښتنې',customers:'پېرودونکي',pending:'د څېړنې اړتیا',
   siteStatus:'د وېبپاڼې حالت',draft:'مسوده',published:'خپور شوی',unpublished:'نه دی خپور',
   siteContent:'د منځپانګې مدیریت',visualPreview:'د وېبپاڼې مخکتنه',edit:'سمول',
   brand:'نښه او هویت',publicPages:'پاڼې او مېنو',serviceCatalog:'خدمتونه او هېوادونه',
   officeDetails:'د دفتر معلومات',review:'بدلونونه کتل',approvals:'تاییدونه',
   faq:'تکراري پوښتنې',translations:'څلور ژبې',draftStatus:'بېلګه مسوده',
   sampleOnly:'ټول معلومات ازمایښتي دي؛ ریښتینی خپرول او لېږل بند دي.',
   publishing:'د خپرولو مدیریت',check:'بدلونونه کتل',previewWebsite:'وېبپاڼه کتل',
   home:'کور',menu:'نور',owner:'مسؤول مدیر',signIn:'په ریښتینې بڼه کې ننوتل',
   noConnected:'ریښتینې معلومات نه دي تړل شوي',noSending:'پیغام لېږل بند دي',
   start:'پیل',close:'بندول',cancel:'لغوه',approve:'د بېلګې تایید',
   approved:'یوازې ازمایښتي تایید وشو؛ هېڅ شی خپور نه شو.',history:'د پرېکړو تاریخچه',
   log:'د بدلونونو ثبت',permission:'رول او اجازه',audit:'د څارنې راپور',
   deployLocked:'اصلي خپرول بند دي',previewMode:'د بېلګې کتنه',
   selectSection:'برخه وټاکئ',moreTitle:'د مدیریت برخې',secure:'شخصي معلومات له مخکتنې بهر دي',
  },
  en:{
   slogan:'Fajr Parsa unified management',preview:'Design preview — no live business data connected',
   search:'Search the workspace',demo:'Design preview',welcome:'One workspace for every essential operation',
   workspace:'Workspace',business:'Business modules',control:'Control & security',
   activity:'Operations overview',quick:'Quick actions',newRequest:'New request',
   today:'Today',inbox:'Requests',customers:'Customers',pending:'Needs review',
   siteStatus:'Website status',draft:'Draft',published:'Published',unpublished:'Not published',
   siteContent:'Content management',visualPreview:'True website-style preview',edit:'Edit',
   brand:'Brand identity',publicPages:'Pages & navigation',serviceCatalog:'Services & countries',
   officeDetails:'Office details',review:'Review changes',approvals:'Approvals',
   faq:'FAQ',translations:'Four languages',draftStatus:'Sample draft',
   sampleOnly:'Everything is fictional. Publishing and sending are disabled.',
   publishing:'Publishing workflow',check:'Review changes',previewWebsite:'View website',
   home:'Home',menu:'More',owner:'Responsible owner',signIn:'Use existing sign-in in production',
   noConnected:'No live data connection yet',noSending:'Messaging disabled',
   start:'Get started',close:'Close',cancel:'Cancel',approve:'Approve in preview',
   approved:'Preview-only approval recorded; nothing was published.',history:'Decision history',
   log:'Change log',permission:'Roles and access',audit:'Audit log',
   deployLocked:'Production publishing is locked',previewMode:'Demo content',
   selectSection:'Select a module',moreTitle:'Administration modules',secure:'Private data kept outside this preview',
  },
  ar:{
   slogan:'الإدارة الموحدة لفجر بارسا',preview:'معاينة التصميم — لا توجد بيانات عمل حقيقية',
   search:'البحث في النظام',demo:'وضع المعاينة',welcome:'كل العمليات الأساسية في مكان واحد',
   workspace:'مساحة العمل',business:'أقسام العمل',control:'الإدارة والأمان',
   activity:'ملخص العمليات',quick:'إجراءات سريعة',newRequest:'طلب جديد',
   today:'اليوم',inbox:'الطلبات',customers:'العملاء',pending:'يحتاج مراجعة',
   siteStatus:'حالة الموقع',draft:'مسودة',published:'منشور',unpublished:'غير منشور',
   siteContent:'إدارة المحتوى',visualPreview:'معاينة الموقع الفعلية',edit:'تعديل',
   brand:'هوية العلامة',publicPages:'الصفحات والقوائم',serviceCatalog:'الخدمات والدول',
   officeDetails:'معلومات المكتب',review:'مراجعة التغييرات',approvals:'الموافقات',
   faq:'الأسئلة الشائعة',translations:'أربع لغات',draftStatus:'مسودة تجريبية',
   sampleOnly:'جميع المعلومات تجريبية؛ النشر والإرسال الفعلي معطلان.',
   publishing:'إدارة النشر',check:'مراجعة التغييرات',previewWebsite:'عرض الموقع',
   home:'الرئيسية',menu:'المزيد',owner:'المدير المسؤول',signIn:'استخدم الدخول الحالي في الإنتاج',
   noConnected:'لم تُربط البيانات الفعلية بعد',noSending:'المراسلة معطلة',
   start:'البدء',close:'إغلاق',cancel:'إلغاء',approve:'اعتماد في المعاينة',
   approved:'تم الاعتماد في المعاينة فقط؛ لم يُنشر شيء.',history:'سجل القرارات',
   log:'سجل التغييرات',permission:'الأدوار والصلاحيات',audit:'سجل التدقيق',
   deployLocked:'النشر العام محظور',previewMode:'محتوى تجريبي',
   selectSection:'اختر القسم',moreTitle:'وحدات الإدارة',secure:'البيانات الخاصة خارج المعاينة',
  },
}

export function labelFor(id:ModuleId,lang:Lang):string {
 return modules.find(item=>item.id===id)?.label[lang] ?? id
}

export const groups: Array<ModuleSpec['group']> = ['workspace','business','control']
