export type Destination = { name:string;short:string;place:string;category:string;desc:string;image:string;detailImage?:string;imageNote?:string }
export const destinations:Destination[] = [
  { name: 'امارات متحده عربی', short: 'امارات', place: 'دبی', category: 'شهری', desc: 'سفر کاری، اقامت، پرواز و هتل', image: '/media/dubai.webp' },
  { name: 'ایران', short: 'ایران', place: 'شیراز', category: 'فرهنگ و زیارت', desc: 'سفر، خدمات اسناد و درخواست ویزا', image: '/media/shiraz.webp' },
  { name: 'ترکیه', short: 'ترکیه', place: 'استانبول', category: 'شهری', desc: 'بررسی خدمات و برنامه‌ریزی سفر', image: '/media/istanbul.webp' },
  { name: 'تاجیکستان', short: 'تاجیکستان', place: 'اسکندرکول', category: 'طبیعت', desc: 'مقصد، مسیر و خدمات مورد نیاز سفر', image: '/media/tajikistan.webp' },
  { name: 'عربستان سعودی', short: 'عربستان سعودی', place: 'العُلا', category: 'فرهنگ و زیارت', desc: 'زیارت، سفرهای گروهی و هماهنگی سفر', image: '/media/alula.webp' },
  { name: 'عراق و عتبات', short: 'عراق', place: 'کربلا', category: 'فرهنگ و زیارت', desc: 'سفر زیارتی و خدمات گروهی', image: '/media/karbala.webp' },
  { name: 'پاکستان', short: 'پاکستان', place: 'هنزه', category: 'طبیعت', desc: 'بررسی مسیر، اسناد و خدمات سفر', image: '/media/hunza-editorial-ai.webp', detailImage:'/media/hunza-editorial-ai-large.webp', imageNote:'تصویرسازی با هوش مصنوعی، الهام‌گرفته از هنزه؛ تصویر مستندِ تور یا اقامتگاه نیست.' },
]
