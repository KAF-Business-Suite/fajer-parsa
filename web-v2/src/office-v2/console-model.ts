/**
 * FP-ADMIN ENTERPRISE IA (design-only, no data or permission enforcement).
 * Every feature is future-additive and maps to a versioned BFF permission.
 * Owner may change modules later without redesigning navigation or schema.
 */
export type AdminLanguage='fa'|'en';
export type AdminGroup='command'|'operations'|'content'|'communications'|'commerce'|'platform';
export type FeatureMode='dashboard'|'workspace'|'records'|'website'|'media'|'publishing'|'connectors'|'builder'|'permissions'|'developer'|'reports';
export type Role='owner'|'manager'|'finance'|'designer'|'developer'|'communications';
export type Translated={fa:string;en:string};
export type Feature={
 id:string;group:AdminGroup;mode:FeatureMode;label:Translated;description:Translated;
 role:Role;planned:boolean; icon:string;
}
export const groups:{id:AdminGroup;name:Translated;icon:string}[]=[
 {id:'command',name:{fa:'مرکز فرمان',en:'Command center'},icon:'layout-dashboard'},
 {id:'operations',name:{fa:'عملیات شرکت',en:'Business operations'},icon:'briefcase-business'},
 {id:'content',name:{fa:'وب‌سایت و محتوا',en:'Website & content'},icon:'globe'},
 {id:'communications',name:{fa:'ارتباطات و بازاریابی',en:'Communications & marketing'},icon:'messages-square'},
 {id:'commerce',name:{fa:'مالی و گزارش‌ها',en:'Finance & intelligence'},icon:'chart-no-axes-combined'},
 {id:'platform',name:{fa:'مدیریت پلتفرم',en:'Platform administration'},icon:'settings'},
];
const make=(id:string,group:AdminGroup,mode:FeatureMode,fa:string,en:string,role:Role,icon:string,descFa:string,descEn:string):Feature=>
 ({id,group,mode,role,icon,planned:true,label:{fa,en},description:{fa:descFa,en:descEn}});
export const features:Feature[]=[
 make('overview','command','dashboard','نمای عمومی','Overview','owner','layout-dashboard','تمام بخش‌ها و کارهای مهم در یک مرکز','A single view of operations and priorities'),
 make('workspaces','command','workspace','فضاهای کاری','Workspaces','owner','layers','مدیریت فضاهای شرکت و بخش‌ها','Organize company spaces and departments'),
 make('approvals','command','publishing','تأییدیه‌ها','Approvals','manager','shield-check','تأیید تغییرات و درخواست‌های حساس','Review and approve sensitive changes'),
 make('tasks','command','records','وظایف و پیگیری','Tasks & follow-ups','manager','list-todo','وظایف، مسئولان و پیگیری‌ها','Tasks, owners and follow-ups'),
 make('calendar','command','records','تقویم و رویدادها','Calendar & events','manager','calendar-days','زمان‌بندی کارها و رویدادهای شرکت','Schedule operations and business events'),
 make('notifications','command','records','اعلان‌ها','Notifications','manager','bell','اعلان‌های سیستم و کارها','Business and system notifications'),

 make('requests','operations','records','درخواست‌ها','Requests','manager','inbox','فرایند ثبت و بررسی درخواست','Request intake and review'),
 make('customers','operations','records','مشتریان و مخاطبان','Customers & contacts','manager','users','مدیریت مشتریان و سوابق ارتباط','Contact records and relationship history'),
 make('cases','operations','records','پرونده‌ها','Cases','manager','folder-open','پرونده‌های خدمات و پیگیری‌ها','Service cases and case tracking'),
 make('services','operations','records','کاتالوگ خدمات','Service catalog','manager','plane','خدمات مجاز، شروط و اسناد','Eligible services, requirements and documents'),
 make('destinations','operations','records','کشورها و مقاصد','Countries & destinations','manager','map-pinned','قوانین و شرایط مقصد بر اساس مدارک معتبر','Verified country and destination conditions'),
 make('bookings','operations','records','رزروها و برنامه‌ها','Bookings & itineraries','manager','calendar-check','مدیریت برنامه‌های سفر و رزروها','Travel itineraries and booking workflows'),
 make('documents','operations','records','اسناد و فورم‌ها','Documents & forms','manager','files','اسناد، قالب‌ها و چاپ','Document templates, records and printing'),
 make('company','operations','permissions','شرکت و شعبه‌ها','Company & branches','owner','building-2','هویت رسمی، شعبه‌ها و اطلاعات معتبر','Official company details and branches'),

 make('website','content','website','مدیریت وب‌سایت','Website studio','designer','globe','صفحات، بلاک‌ها و پیش‌نمایش واقعی','Pages, reusable blocks and visual preview'),
 make('pages','content','website','صفحات و منوها','Pages & navigation','designer','panels-top-left','ویرایش ساختار سایت و ناوبری','Website structure and navigation'),
 make('media','content','media','کتابخانهٔ رسانه','Media library','designer','images','مدیریت عکس، ویدیو و فایل','Organize website image, video and documents'),
 make('news','content','publishing','خبرها و مقاله‌ها','News & articles','communications','newspaper','محتوای روزانه و مقالات','Daily content, news and articles'),
 make('offers','content','publishing','پیشنهادها و تخفیف‌ها','Offers & promotions','communications','tags','پیشنهادهای زمان‌دار و کمپاین‌ها','Timed offers and promotional content'),
 make('banners','content','publishing','بنرها و اعلان‌های سایت','Banners & announcements','designer','megaphone','بنرهای اصلی و خبرهای فوری','Hero banners and site announcements'),
 make('forms','content','records','فورم‌های عمومی','Public forms','designer','clipboard-list','فورم‌های درخواست قابل تنظیم','Configurable public request forms'),
 make('translations','content','website','زبان‌های سایت','Website languages','designer','languages','دری، پشتو، انگلیسی و عربی برای سایت','Dari, Pashto, English and Arabic website content'),
 make('seo','content','website','جستجو و سئو','Search & SEO','designer','search-check','عنوان‌ها، توضیحات و ساختار جستجو','Search metadata and indexing structure'),
 make('publishing','content','publishing','نشر و تاریخچهٔ نسخه‌ها','Publishing & revisions','owner','history','پیش‌نویس، بررسی، نشر و بازگردانی','Draft, review, publish and rollback'),

 make('inbox','communications','records','صندوق پیام‌ها','Unified inbox','communications','messages-square','صندوق پیام‌های کاری به‌شکل یکپارچه','Central communication inbox'),
 make('whatsapp','communications','connectors','واتساپ کاری','WhatsApp business','communications','message-circle','پیام‌ها و پاسخ‌های تأییدشده','Approved messages and replies'),
 make('email','communications','connectors','ایمیل‌های شرکت','Business email','communications','mail','مدیریت و اتصال ایمیل‌ها','Business mail integrations'),
 make('social','communications','connectors','شبکه‌های اجتماعی','Social channels','communications','share-2','مدیریت کانال‌ها و کمپاین‌ها','Social publishing and channels'),
 make('campaigns','communications','publishing','کمپاین‌های تبلیغاتی','Campaigns','communications','target','کمپاین، آگهی و گزارش انتشار','Campaign creation and performance'),
 make('templates','communications','records','قالب‌های پیام','Message templates','communications','notebook-tabs','پاسخ‌های آماده و دو‌زبانه','Saved bilingual reply templates'),
 make('automations','communications','builder','اتوماسیون‌ها','Automations','developer','workflow','جریان‌های کار قابل‌مدیریت','Workflows with approvals and limits'),

 make('finance','commerce','records','مرکز مالی','Finance center','finance','wallet','مدیریت داده‌های مالی محدود به مجوز','Permission-scoped finance operations'),
 make('invoices','commerce','records','فاکتورها و رسیدها','Invoices & receipts','finance','receipt-text','ایجاد، پیگیری و چاپ اسناد مالی','Financial documents and print workflows'),
 make('payments','commerce','records','پرداخت‌ها','Payments','finance','credit-card','ثبت و تطبیق پرداخت‌ها','Payment records and reconciliation'),
 make('analytics','commerce','reports','تحلیل و نمودارها','Analytics & charts','owner','chart-column','ارقام واقعی و روندهای تجاری','Grounded KPIs and business trends'),
 make('reports','commerce','reports','گزارش‌ساز','Report builder','owner','file-chart-column','ساخت و صادرکردن گزارش‌ها','Compose and export structured reports'),

 make('appbuilder','platform','builder','سازندهٔ ماژول و صفحه','Module & page builder','owner','blocks','اضافه‌کردن بخش‌های تازه و قابل‌توسعه','Extend the console with new modules'),
 make('designsystem','platform','builder','دیزاین سیستم','Design system','designer','palette','رنگ‌ها، فونت‌ها و اجزای مشترک','Shared components, themes and typography'),
 make('integrations','platform','connectors','اتصالات و افزونه‌ها','Integrations & plugins','developer','plug','مدیریت سرویس‌ها و اتصال‌های مجاز','Manage approved connected services'),
 make('developer','platform','developer','مرکز توسعه‌دهنده','Developer console','developer','code-2','API، لاگ، محیط‌ها و تنظیمات نشر','APIs, logs, environments and release controls'),
 make('deployments','platform','developer','محیط‌ها و نشر برنامه','Deployments & environments','developer','cloud-upload','آزمایشی، اصلی، بررسی نسخه‌ها','QA, production, release history and gates'),
 make('permissions','platform','permissions','کارکنان و مجوزها','Roles & permissions','owner','users-round','مجوزهای وظیفه و مالکیت','Role-scoped access and teams'),
 make('security','platform','permissions','امنیت و ممیزی','Security & audit','owner','shield','ثبت رویدادها و کنترول امنیت','Access security and audit trails'),
 make('backups','platform','developer','پشتیبان و بازیابی','Backup & recovery','developer','database-backup','نسخه‌ها، بازیابی و محافظت از داده','Backup and restoration readiness'),
 make('settings','platform','permissions','تنظیمات عمومی','Global settings','owner','sliders-horizontal','تنظیمات کاربری و سازمانی','Personal and organization-wide settings'),
];
export const byId=(id:string):Feature=>features.find(item=>item.id===id)||features[0];
export const adminLanguages:{id:AdminLanguage;label:string;dir:'rtl'|'ltr'}[]=[
 {id:'fa',label:'دری',dir:'rtl'}, {id:'en',label:'English',dir:'ltr'},
];
export const publicLanguages=['fa','ps','en','ar'] as const;
export const totalFeatures=features.length;
export const groupFor=(id:string):AdminGroup=>byId(id).group;
