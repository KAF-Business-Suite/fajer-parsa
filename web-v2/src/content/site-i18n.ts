// FP-UX-02 — one source of truth for customer-facing Dari/English/Arabic labels.
// Localized text is for presentation only. Existing Dari service codes and request data remain stable.
export type SiteLanguage = 'fa' | 'en' | 'ar'
const textMap: Record<string, {en:string;ar:string}> = {
  "فجر پارسا": {
    "en": "Fajr Parsa",
    "ar": "فجر بارسا"
  },
  "سفر • ویزا • تجارت": {
    "en": "Travel • Visas • Business",
    "ar": "سفر • تأشيرات • أعمال"
  },
  "خدمات": {
    "en": "Services",
    "ar": "الخدمات"
  },
  "کشورها": {
    "en": "Countries",
    "ar": "الدول"
  },
  "درخواست سفر": {
    "en": "Travel enquiry",
    "ar": "طلب سفر"
  },
  "پیگیری": {
    "en": "Follow-up",
    "ar": "المتابعة"
  },
  "تماس": {
    "en": "Contact",
    "ar": "اتصل بنا"
  },
  "همه خدمات": {
    "en": "All services",
    "ar": "جميع الخدمات"
  },
  "از یک خدمت تا بسته کامل سفر": {
    "en": "From one service to a complete trip",
    "ar": "من خدمة واحدة إلى رحلة متكاملة"
  },
  "کشور، هدف سفر و نوع خدمت را انتخاب کنید و گزینه‌های مربوط به سفر خود را بررسی کنید.": {
    "en": "Select a destination, travel purpose and service to explore suitable options.",
    "ar": "اختر وجهتك وهدف السفر والخدمة لاستعراض الخيارات المناسبة."
  },
  "مشاهده خدمات": {
    "en": "Explore services",
    "ar": "استعراض الخدمات"
  },
  "سفر خود را برنامه‌ریزی کنید": {
    "en": "Plan your journey",
    "ar": "خطط لرحلتك"
  },
  "انتخاب سریع خدمت": {
    "en": "Choose a service",
    "ar": "اختر خدمة"
  },
  "راهنما و ارتباط": {
    "en": "Help & contact",
    "ar": "المساعدة والتواصل"
  },
  "راهنمای انتخاب خدمت": {
    "en": "Service selection guide",
    "ar": "دليل اختيار الخدمة"
  },
  "خدمات فجر پارسا": {
    "en": "Fajr Parsa services",
    "ar": "خدمات فجر بارسا"
  },
  "ناوبری گوشی": {
    "en": "Mobile navigation",
    "ar": "قائمة الهاتف"
  },
  "سربرگ فجر پارسا": {
    "en": "Fajr Parsa header",
    "ar": "ترويسة فجر بارسا"
  },
  "لوگوی فجر پارسا": {
    "en": "Fajr Parsa logo",
    "ar": "شعار فجر بارسا"
  },
  "در حال آماده‌سازی صفحهٔ کشور…": {
    "en": "Loading country page…",
    "ar": "جارٍ تحميل صفحة الدولة…"
  },
  "فجر پارسا؛ همراه برنامه‌ریزی سفر شما": {
    "en": "Fajr Parsa — your travel planning partner",
    "ar": "فجر بارسا — شريكك في تخطيط السفر"
  },
  "سفر بعدی شما،": {
    "en": "Your next journey",
    "ar": "رحلتك القادمة"
  },
  "از همین‌جا آغاز می‌شود.": {
    "en": "starts right here.",
    "ar": "تبدأ من هنا."
  },
  "ویزا، تکت، هتل و خدمات سفر؛ گزینه‌ها را بررسی کنید و با اطلاعات روشن، قدم بعد را با مشاور فجر پارسا بردارید.": {
    "en": "Visas, flights, hotels and travel services. Explore your options, then plan the next step with our team.",
    "ar": "التأشيرات والرحلات الجوية والفنادق وخدمات السفر. استكشف خياراتك وخطط للخطوة التالية مع فريقنا."
  },
  "شروع درخواست": {
    "en": "Start enquiry",
    "ar": "ابدأ الطلب"
  },
  "ویزا و اقامت": {
    "en": "Visas & residency",
    "ar": "التأشيرات والإقامة"
  },
  "پرواز و هتل": {
    "en": "Flights & hotels",
    "ar": "الطيران والفنادق"
  },
  "سفرهای گروهی": {
    "en": "Group travel",
    "ar": "الرحلات الجماعية"
  },
  "مقصدی برای ایده گرفتن": {
    "en": "Featured destination",
    "ar": "وجهة ملهمة"
  },
  "دبی، امارات متحده عربی": {
    "en": "Dubai, United Arab Emirates",
    "ar": "دبي، الإمارات العربية المتحدة"
  },
  "کشف مقصدها": {
    "en": "Explore destinations",
    "ar": "اكتشف الوجهات"
  },
  "انتخاب مسیر سفر": {
    "en": "Find your route",
    "ar": "حدد مسار رحلتك"
  },
  "مسیر سفرتان را مشخص کنید": {
    "en": "Find your travel options",
    "ar": "اكتشف خيارات سفرك"
  },
  "سه انتخاب کوتاه؛ سپس گزینه‌های مرتبط را می‌بینید.": {
    "en": "Three quick choices help identify relevant services.",
    "ar": "ثلاثة اختيارات بسيطة لعرض الخدمات المناسبة."
  },
  "پاسپورت / تابعیت": {
    "en": "Passport / nationality",
    "ar": "جواز السفر / الجنسية"
  },
  "افغانستان": {
    "en": "Afghanistan",
    "ar": "أفغانستان"
  },
  "کشور دیگر": {
    "en": "Other country",
    "ar": "دولة أخرى"
  },
  "مقصد": {
    "en": "Destination",
    "ar": "الوجهة"
  },
  "انتخاب مقصد": {
    "en": "Choose destination",
    "ar": "اختر الوجهة"
  },
  "هدف سفر": {
    "en": "Travel purpose",
    "ar": "هدف السفر"
  },
  "انتخاب هدف": {
    "en": "Choose a purpose",
    "ar": "اختر الهدف"
  },
  "سیاحت": {
    "en": "Tourism",
    "ar": "السياحة"
  },
  "تجارت": {
    "en": "Business",
    "ar": "الأعمال"
  },
  "اقامت": {
    "en": "Residency",
    "ar": "الإقامة"
  },
  "زیارت": {
    "en": "Pilgrimage",
    "ar": "الزيارة الدينية"
  },
  "تحصیل": {
    "en": "Study",
    "ar": "الدراسة"
  },
  "کار": {
    "en": "Work",
    "ar": "العمل"
  },
  "نمایش خدمات مرتبط": {
    "en": "See matching services",
    "ar": "اعرض الخدمات المناسبة"
  },
  "کشورمحور": {
    "en": "By destination",
    "ar": "حسب الوجهة"
  },
  "مرحله‌ای": {
    "en": "Step by step",
    "ar": "خطوة بخطوة"
  },
  "پشتیبانی": {
    "en": "Support",
    "ar": "الدعم"
  },
  "برای هر سفر، خدمت مناسب": {
    "en": "The right service for every journey",
    "ar": "الخدمة المناسبة لكل رحلة"
  },
  "از خدمات ویزا و اسناد تا پرواز و سفرهای گروهی، مسیر مورد نیاز خود را بررسی کنید.": {
    "en": "From visas and documents to flights and group trips, explore the services you need.",
    "ar": "من التأشيرات والوثائق إلى الطيران والرحلات الجماعية، استكشف الخدمات التي تحتاجها."
  },
  "جستجوی خدمات": {
    "en": "Search services",
    "ar": "ابحث عن الخدمات"
  },
  "جستجو در خدمات": {
    "en": "Search services",
    "ar": "بحث في الخدمات"
  },
  "خدمتی با این عبارت پیدا نشد. عبارت کوتاه‌تری بنویسید.": {
    "en": "No services found. Try a shorter search.",
    "ar": "لم نجد خدمات مطابقة. جرّب عبارة أقصر."
  },
  "بررسی گزینه‌ها": {
    "en": "Explore options",
    "ar": "استعرض الخيارات"
  },
  "مسیر درخواست": {
    "en": "Enquiry process",
    "ar": "خطوات الاستفسار"
  },
  "از انتخاب خدمت تا آماده‌سازی درخواست": {
    "en": "From choosing a service to preparing your enquiry",
    "ar": "من اختيار الخدمة إلى تجهيز الاستفسار"
  },
  "ابتدا کشور و خدمت را مشخص کنید. سپس شرایط و مدارک لازم را با دفتر بررسی کنید.": {
    "en": "First choose a destination and service, then confirm requirements with our office.",
    "ar": "حدد الوجهة والخدمة أولاً، ثم تحقق من الشروط والوثائق مع مكتبنا."
  },
  "انتخاب خدمت": {
    "en": "Choose service",
    "ar": "اختر الخدمة"
  },
  "کشور، نوع خدمت و گزینه مناسب": {
    "en": "Destination, service type and option",
    "ar": "الوجهة ونوع الخدمة والخيار المناسب"
  },
  "زمان و تعداد مسافران": {
    "en": "Travel date and party size",
    "ar": "موعد السفر وعدد المسافرين"
  },
  "زمان تقریبی و تعداد همراهان": {
    "en": "Approximate date and number of travellers",
    "ar": "التاريخ التقريبي وعدد المسافرين"
  },
  "مرور درخواست": {
    "en": "Review enquiry",
    "ar": "راجع الطلب"
  },
  "جزئیات را پیش از ارسال ببینید": {
    "en": "Check details before sending",
    "ar": "راجع التفاصيل قبل الإرسال"
  },
  "گفت‌وگو با مشاور": {
    "en": "Talk to an adviser",
    "ar": "تحدث مع مستشار"
  },
  "ارسال انتخابی در واتساپ و هماهنگی با دفتر": {
    "en": "Send via WhatsApp only when you choose",
    "ar": "الإرسال عبر واتساب باختيارك والتنسيق مع المكتب"
  },
  "خدمات ترکیبی": {
    "en": "Combined services",
    "ar": "الخدمات المجمعة"
  },
  "بسته سفر خود را بسازید": {
    "en": "Build your travel package",
    "ar": "صمّم باقة سفرك"
  },
  "ویزا + دعوتنامه + هتل + تکت + بیمه + ترانسفر. خدمات مکمل فقط وقتی پیشنهاد می‌شوند که برای سفر مربوط باشند.": {
    "en": "Visas, invitation letters, hotels, flights, insurance and transfers — select only what your journey needs.",
    "ar": "تأشيرات ودعوات وفنادق وطيران وتأمين وتنقلات — اختر فقط ما تحتاجه رحلتك."
  },
  "خدمات ویزا": {
    "en": "Visa services",
    "ar": "خدمات التأشيرات"
  },
  "بسته سفر کاری": {
    "en": "Business travel package",
    "ar": "باقة سفر الأعمال"
  },
  "خدمات کامل سفر": {
    "en": "Full travel services",
    "ar": "خدمات السفر المتكاملة"
  },
  "پشتیبانی فجر پارسا": {
    "en": "Fajr Parsa support",
    "ar": "دعم فجر بارسا"
  },
  "برای ادامهٔ مسیر، همراه شما": {
    "en": "Support for your next step",
    "ar": "معك في الخطوة التالية"
  },
  "برای پروندهٔ موجود، شمارهٔ ثبت‌شده در رسید و مدارک مورد نیاز را هنگام تماس با دفتر آماده داشته باشید.": {
    "en": "For an existing case, have your receipt reference and requested documents ready before contacting the office.",
    "ar": "للمعاملات السابقة، جهّز رقم الإيصال والوثائق المطلوبة قبل التواصل مع المكتب."
  },
  "پیگیری پرونده": {
    "en": "Follow up an existing case",
    "ar": "متابعة معاملة"
  },
  "راهنمای خدمات": {
    "en": "Service guidance",
    "ar": "إرشادات الخدمات"
  },
  "از کجا شروع کنیم؟": {
    "en": "Where should I start?",
    "ar": "من أين أبدأ؟"
  },
  "کشور مقصد و هدف سفر را انتخاب کنید، خدمات مرتبط را بخوانید و خلاصهٔ درخواست خود را برای مشاور آماده کنید.": {
    "en": "Choose your destination and purpose, review services, then prepare a summary for an adviser.",
    "ar": "اختر الوجهة وهدف السفر، راجع الخدمات وجهّز ملخص طلبك للمستشار."
  },
  "مسیر همراهی فجر پارسا": {
    "en": "Your journey with Fajr Parsa",
    "ar": "رحلتك مع فجر بارسا"
  },
  "برای سفر بعدی‌تان، قدم اول را بردارید": {
    "en": "Take the first step toward your next trip",
    "ar": "ابدأ الخطوة الأولى لرحلتك القادمة"
  },
  "مقصد و خدمت را مشخص کنید؛ جزئیات را با دفتر در میان بگذارید و دربارهٔ شرایط و قیمت سؤال کنید.": {
    "en": "Choose your destination and service, then ask the office about terms and pricing.",
    "ar": "حدد الوجهة والخدمة واستفسر من المكتب عن الشروط والأسعار."
  },
  "در حال آماده‌سازی فرم…": {
    "en": "Preparing the form…",
    "ar": "جارٍ تجهيز النموذج…"
  },
  "سفر، ویزا، زیارت و تجارت در یک تجربه منظم و قابل پیگیری.": {
    "en": "Travel, visas, pilgrimage and business with clear human support.",
    "ar": "السفر والتأشيرات والزيارات الدينية والأعمال مع دعم واضح من فريقنا."
  },
  "ویزا • اقامت • دعوتنامه • پرواز • هتل • زیارت • اسناد • بیمه": {
    "en": "Visas • Residency • Invitations • Flights • Hotels • Pilgrimage • Documents • Insurance",
    "ar": "تأشيرات • إقامة • دعوات • طيران • فنادق • زيارات دينية • وثائق • تأمين"
  },
  "راه‌های ارتباط": {
    "en": "Contact details",
    "ar": "معلومات الاتصال"
  },
  "واتساپ دفتر: ۰۷۷۷۳۷۷۷۷۴": {
    "en": "Office WhatsApp: +93 777 377 774",
    "ar": "واتساب المكتب: ‎+93 777 377 774"
  },
  "کابل، دشت برچی، مارکیت پیوند، منزل دوم، دفتر ۸۵.": {
    "en": "Kabul, Dasht-e Barchi, Paywand Market, 2nd floor, Office 85.",
    "ar": "كابول، دشت برچي، سوق بيوند، الطابق الثاني، مكتب 85."
  },
  "پرسش‌های رایج": {
    "en": "Frequently asked questions",
    "ar": "الأسئلة الشائعة"
  },
  "راهنمای درخواست": {
    "en": "Enquiry guide",
    "ar": "دليل الطلب"
  },
  "تماس با دفتر": {
    "en": "Contact the office",
    "ar": "اتصل بالمكتب"
  },
  "فجر پارسا — خدمات سفر، ویزا و تجارت": {
    "en": "Fajr Parsa — Travel, Visa & Business",
    "ar": "فجر بارسا — السفر والتأشيرات والأعمال"
  },
  "واتساپ": {
    "en": "WhatsApp",
    "ar": "واتساب"
  },
  "انتخاب آگاهانه": {
    "en": "Informed choices",
    "ar": "اختيارات مدروسة"
  },
  "خدمت و شرایط را بررسی کنید": {
    "en": "Review services and requirements",
    "ar": "راجع الخدمات والشروط"
  },
  "هماهنگی انسانی": {
    "en": "Human assistance",
    "ar": "مساعدة بشرية"
  },
  "مستقیم با دفتر در تماس باشید": {
    "en": "Talk directly with our office",
    "ar": "تواصل مباشرة مع المكتب"
  },
  "درخواست کوتاه": {
    "en": "Simple enquiry",
    "ar": "استفسار بسيط"
  },
  "جزئیات سفر را یک‌جا آماده کنید": {
    "en": "Prepare your travel details in one place",
    "ar": "جهز تفاصيل سفرك في مكان واحد"
  },
  "پیگیری از دفتر": {
    "en": "Office follow-up",
    "ar": "المتابعة مع المكتب"
  },
  "اطلاعات رسید را همراه داشته باشید": {
    "en": "Keep your receipt reference handy",
    "ar": "احتفظ بمرجع الإيصال"
  },
  "تکت و بوکینگ سراسری": {
    "en": "International flight booking enquiries",
    "ar": "استفسارات حجز الرحلات الدولية"
  },
  "بسته‌های خدمات": {
    "en": "Service packages",
    "ar": "باقات الخدمات"
  },
  "الهام سفر": {
    "en": "Travel inspiration",
    "ar": "إلهام السفر"
  },
  "معرفی و تماس دفتر": {
    "en": "About & contact",
    "ar": "من نحن والاتصال"
  },
  "خدمت مورد نظر": {
    "en": "Requested service",
    "ar": "الخدمة المطلوبة"
  },
  "آماده‌سازی درخواست": {
    "en": "Prepare enquiry",
    "ar": "تجهيز الطلب"
  },
  "انتخاب این خدمت": {
    "en": "Choose this service",
    "ar": "اختر هذه الخدمة"
  },
  "تماس با دفتر در واتساپ": {
    "en": "Contact office on WhatsApp",
    "ar": "اتصل بالمكتب عبر واتساب"
  },
  "بازگشت به سایت": {
    "en": "Back to site",
    "ar": "العودة إلى الموقع"
  },
  "خدمت انتخاب‌شده:": {
    "en": "Selected service:",
    "ar": "الخدمة المختارة:"
  },
  "بستهٔ انتخاب‌شده:": {
    "en": "Selected package:",
    "ar": "الباقة المختارة:"
  },
  "نام کشور یا شهر": {
    "en": "Country or city",
    "ar": "الدولة أو المدينة"
  },
  "زمان تقریبی سفر (اختیاری)": {
    "en": "Approximate travel date (optional)",
    "ar": "موعد السفر التقريبي (اختياري)"
  },
  "تعداد مسافران": {
    "en": "Travellers",
    "ar": "عدد المسافرين"
  },
  "پیش از ارسال، خلاصه را مرور کنید. این فرم تصویر اسناد یا اطلاعات هویتی نمی‌خواهد و پیام را خودکار ارسال نمی‌کند.": {
    "en": "Review your details before sharing. No passport images or identity documents are requested, and no message is sent automatically.",
    "ar": "راجع التفاصيل قبل المشاركة. لا نطلب صور الجواز أو وثائق الهوية، ولا تُرسل الرسائل تلقائياً."
  },
  "مرور پیام درخواست": {
    "en": "Review enquiry message",
    "ar": "مراجعة رسالة الطلب"
  },
  "خلاصه برای مشاور": {
    "en": "Summary for adviser",
    "ar": "ملخص للمستشار"
  },
  "متن آمادهٔ درخواست": {
    "en": "Prepared enquiry text",
    "ar": "نص الطلب المجهز"
  },
  "کپی خلاصهٔ درخواست": {
    "en": "Copy enquiry summary",
    "ar": "نسخ ملخص الطلب"
  },
  "باز کردن واتساپ دفتر": {
    "en": "Open office WhatsApp",
    "ar": "فتح واتساب المكتب"
  },
  "پیام تنها پس از انتخاب «ارسال» در واتساپ فرستاده می‌شود.": {
    "en": "The message is sent only after you press Send in WhatsApp.",
    "ar": "لن تُرسل الرسالة إلا بعد الضغط على إرسال في واتساب."
  },
  "دریافت پیش‌نویس": {
    "en": "Download draft",
    "ar": "تنزيل المسودة"
  },
  "هنوز مشخص نیست": {
    "en": "Not decided yet",
    "ar": "لم يُحدّد بعد"
  },
  "خلاصه کپی شد؛ هنوز به دفتر ارسال نشده است.": {
    "en": "Summary copied; nothing sent to our office.",
    "ar": "تم نسخ الملخص؛ لم يُرسل إلى المكتب."
  },
  "کپی خودکار ممکن نشد. متن انتخاب‌شده را با گزینهٔ کپی دستگاه بردارید.": {
    "en": "Automatic copy failed. Copy the selected text manually.",
    "ar": "تعذر النسخ التلقائي. انسخ النص المحدد يدوياً."
  },
  "می‌توانید متن را در ایمیل یا پیام‌رسان دلخواه بفرستید. این صفحه درخواست را در دفتر ثبت نمی‌کند.": {
    "en": "You may send the text using your preferred app. This page does not register your request with our office.",
    "ar": "يمكنك إرسال النص عبر تطبيق تختاره. هذه الصفحة لا تسجّل طلبك لدى المكتب."
  },
  "فایل پیش‌نویس آمادهٔ دریافت شد؛ درخواست به دفتر ارسال نشده است.": {
    "en": "Draft file is ready. No request was sent.",
    "ar": "ملف المسودة جاهز؛ لم يُرسل طلب إلى المكتب."
  },
  "خدمات واقعی فجر پارسا": {
    "en": "Fajr Parsa destinations",
    "ar": "وجهات فجر بارسا"
  },
  "کشور شما، خدمت مورد نیاز شما": {
    "en": "Your destination, your services",
    "ar": "وجهتك وخدماتك"
  },
  "مقصدتان را انتخاب کنید؛ خدمات و مسیر درخواست را یک‌جا ببینید.": {
    "en": "Select your destination and see the available service enquiries.",
    "ar": "اختر وجهتك واستعرض استفسارات الخدمات المتاحة."
  },
  "ویزا · سفر · تجارت": {
    "en": "Visas · Travel · Business",
    "ar": "التأشيرات · السفر · الأعمال"
  },
  "کشوری با این عبارت پیدا نشد؛ عبارت کوتاه‌تری بنویسید.": {
    "en": "No matching country. Try a shorter search.",
    "ar": "لا توجد دولة مطابقة. جرّب عبارة أقصر."
  },
  "بررسی خدمات": {
    "en": "View services",
    "ar": "استعراض الخدمات"
  },
  "تصویرسازی مقصد": {
    "en": "Illustrative destination image",
    "ar": "صورة توضيحية للوجهة"
  },
  "تصویرها برای معرفی مقصد هستند. فهرست خدمات به‌مرور تکمیل می‌شود؛ جزئیات هر درخواست با دفتر بررسی می‌شود.": {
    "en": "Images illustrate destinations. Service details are confirmed with our office for each enquiry.",
    "ar": "الصور للتعريف بالوجهات. تُؤكد تفاصيل الخدمات مع مكتبنا لكل استفسار."
  },
  "فراتر از این مقصدها": {
    "en": "Beyond these destinations",
    "ar": "وجهات أخرى"
  },
  "مسیر مورد نظرتان را بگویید؛ موجودی و شرایط رزرو با دفتر بررسی می‌شود.": {
    "en": "Tell us your route; availability and booking conditions must be confirmed with the office.",
    "ar": "أخبرنا بمسار سفرك؛ يؤكد المكتب التوفر وشروط الحجز."
  },
  "درخواست تکت و بوکینگ": {
    "en": "Ask about flight booking",
    "ar": "استفسر عن حجز الطيران"
  },
  "جستجوی کشور و خدمات": {
    "en": "Search countries and services",
    "ar": "البحث في الدول والخدمات"
  },
  "کشور یا خدمت": {
    "en": "Country or service",
    "ar": "الدولة أو الخدمة"
  },
  "این مقصد پیدا نشد": {
    "en": "Destination not found",
    "ar": "الوجهة غير موجودة"
  },
  "کشور مورد نظرتان را از فهرست خدمات انتخاب کنید.": {
    "en": "Please choose a destination from the service list.",
    "ar": "اختر وجهة من قائمة الخدمات."
  },
  "بازگشت به کشورها": {
    "en": "Back to countries",
    "ar": "العودة إلى الدول"
  },
  "خدمت مورد نیازتان را انتخاب کنید؛ جزئیات درخواست را آماده کنید و شرایط ارائه را با دفتر بررسی کنید.": {
    "en": "Choose the service you need and confirm eligibility and requirements with the office.",
    "ar": "اختر الخدمة المطلوبة وتحقق من الأهلية والشروط مع المكتب."
  },
  "درخواست مشاوره": {
    "en": "Request advice",
    "ar": "طلب استشارة"
  },
  "بر اساس خدمات اعلام‌شدهٔ دفتر": {
    "en": "Services listed by our office",
    "ar": "الخدمات المعلنة من مكتبنا"
  },
  "برای چه خدمتی همراه شما باشیم؟": {
    "en": "How can we help with your trip?",
    "ar": "كيف يمكننا مساعدتك في رحلتك؟"
  },
  "قیمت، زمان انجام و مدارک مورد نیاز پس از بررسی شرایط درخواست مشخص می‌شود.": {
    "en": "Prices, timing and required documents are confirmed case by case.",
    "ar": "تُؤكد الأسعار والمدة والوثائق المطلوبة حسب كل حالة."
  },
  "درخواست این خدمت": {
    "en": "Enquire about this service",
    "ar": "استفسر عن هذه الخدمة"
  },
  "بعد از انتخاب خدمت چه می‌شود؟": {
    "en": "What happens next?",
    "ar": "ماذا يحدث بعد ذلك؟"
  },
  "پیش از تصمیم‌گیری": {
    "en": "Before you decide",
    "ar": "قبل اتخاذ القرار"
  },
  "بررسی کشورهای دیگر": {
    "en": "Explore other countries",
    "ar": "استعرض دولاً أخرى"
  },
  "جزئیات مسیر کاری، شرایط متقاضی و امکان ارائه باید با دفتر بررسی شود.": {
    "en": "Work pathways and applicant requirements must be confirmed individually with the office.",
    "ar": "يجب تأكيد شروط المسارات المهنية وأهلية المتقدم مع المكتب بشكل فردي."
  },
  "برای بررسی شرایط و مراحل این خدمت، درخواست مربوط را آماده کنید.": {
    "en": "Prepare an enquiry to confirm the steps and requirements for this service.",
    "ar": "جهز استفساراً لتأكيد خطوات هذه الخدمة ومتطلباتها."
  },
  "انتخاب و مرور": {
    "en": "Select and review",
    "ar": "الاختيار والمراجعة"
  },
  "کشور و خدمت انتخاب‌شده وارد فرم می‌شود؛ زمان سفر و تعداد نفرات را اضافه کنید.": {
    "en": "The selected destination and service go into the form; add your date and party size.",
    "ar": "تُضاف الوجهة والخدمة إلى النموذج؛ أدخل التاريخ وعدد المسافرين."
  },
  "خلاصه را مرور کنید؛ در نسخهٔ فعلی ارسال نهایی پیام در واتساپ با خود شماست.": {
    "en": "Review your summary; sending via WhatsApp remains your own action.",
    "ar": "راجع الملخص؛ إرسال الرسالة عبر واتساب مسؤوليتك."
  },
  "بررسی با دفتر": {
    "en": "Confirm with office",
    "ar": "التأكيد مع المكتب"
  },
  "مدارک، هزینه، زمان و امکان ادامهٔ کار را پیش از هر پرداخت یا تعهد با دفتر روشن کنید.": {
    "en": "Confirm documents, costs and timelines before any payment or commitment.",
    "ar": "تأكد من الوثائق والتكاليف والمدة قبل أي دفع أو التزام."
  },
  "برای انتخاب سفر بعدی": {
    "en": "For your next trip",
    "ar": "لرحلتك القادمة"
  },
  "هر مقصد، یک تجربهٔ تازه": {
    "en": "A new experience in every destination",
    "ar": "تجربة جديدة في كل وجهة"
  },
  "از شهرهای پرجنب‌وجوش تا منظره‌های آرام؛ مقصد را انتخاب کنید و خدمات مورد نیازتان را بررسی کنید.": {
    "en": "From vibrant cities to quiet scenery, explore destinations and services.",
    "ar": "من المدن النابضة بالحياة إلى المناظر الهادئة، استكشف الوجهات والخدمات."
  },
  "کشف مقصد": {
    "en": "Explore destination",
    "ar": "اكتشف الوجهة"
  },
  "خدمات این مقصد": {
    "en": "Destination services",
    "ar": "خدمات هذه الوجهة"
  },
  "تصویرها معرفی مقصد هستند؛ قیمت، ظرفیت و امکان سفر برای هر درخواست جداگانه بررسی می‌شود.": {
    "en": "Images are illustrative; availability, prices and travel options are confirmed for each enquiry.",
    "ar": "الصور للتعريف بالوجهات؛ ويُؤكد التوفر والأسعار وإمكانية السفر لكل استفسار."
  },
  "همه مقصدها": {
    "en": "All destinations",
    "ar": "كل الوجهات"
  },
  "شهری": {
    "en": "City",
    "ar": "مدن"
  },
  "طبیعت": {
    "en": "Nature",
    "ar": "طبيعة"
  },
  "فرهنگ و زیارت": {
    "en": "Culture & pilgrimage",
    "ar": "ثقافة وزيارات دينية"
  },
  "هنوز مقصدی انتخاب نکرده‌اید؛ با نشان قلب، مقصد دلخواه را نگه دارید.": {
    "en": "No saved destinations yet. Select a heart to save one.",
    "ar": "لم تحفظ أي وجهة بعد. اضغط على القلب للحفظ."
  },
  "مقصدی با این عبارت و فیلتر پیدا نشد.": {
    "en": "No destinations match these filters.",
    "ar": "لا توجد وجهات مطابقة لهذه التصفية."
  },
  "جستجو در مقصدها": {
    "en": "Search destinations",
    "ar": "البحث عن الوجهات"
  },
  "کشور یا شهر": {
    "en": "Country or city",
    "ar": "الدولة أو المدينة"
  },
  "دسته‌بندی مقصدها": {
    "en": "Destination categories",
    "ar": "فئات الوجهات"
  },
  "پرسش‌هایی که شاید شما هم داشته باشید": {
    "en": "Questions you may have",
    "ar": "أسئلة قد تكون لديك"
  },
  "برای شروع چه چیزهایی لازم است؟": {
    "en": "What do I need to get started?",
    "ar": "ماذا أحتاج للبدء؟"
  },
  "کشور مقصد، هدف سفر، زمان تقریبی و خدمت مورد نیازتان را مشخص کنید. در گام اول به ارسال تصویر پاسپورت یا اسناد هویتی نیازی نیست.": {
    "en": "Choose a destination, purpose, approximate travel date and service. You do not need to send passport or identity images at this stage.",
    "ar": "حدد الوجهة والهدف والتاريخ التقريبي والخدمة. لا حاجة لإرسال صور الجواز أو وثائق الهوية في هذه المرحلة."
  },
  "چطور قیمت دقیق بگیرم؟": {
    "en": "How can I get a precise quote?",
    "ar": "كيف أحصل على عرض سعر دقيق؟"
  },
  "هزینه به مقصد، نوع خدمت و جزئیات درخواست بستگی دارد. پس از بررسی اطلاعات، شرایط و قیمت را از دفتر دریافت کنید.": {
    "en": "Costs depend on the destination and requested services. The office confirms terms and quotes after reviewing your enquiry.",
    "ar": "تعتمد التكلفة على الوجهة والخدمات. يؤكد المكتب الشروط والسعر بعد مراجعة استفسارك."
  },
  "آیا می‌توانم فقط یک خدمت انتخاب کنم؟": {
    "en": "Can I choose just one service?",
    "ar": "هل يمكنني اختيار خدمة واحدة؟"
  },
  "بله؛ می‌توانید برای یک خدمت مشخص مانند ویزا، تکت یا هتل مشاوره بخواهید، یا دربارهٔ خدمات ترکیبی سؤال کنید.": {
    "en": "Yes. You can ask about a single service or combined services.",
    "ar": "نعم، يمكنك الاستفسار عن خدمة واحدة أو خدمات مجمعة."
  },
  "درخواست از این سایت چطور به دفتر می‌رسد؟": {
    "en": "How does my enquiry reach the office?",
    "ar": "كيف يصل استفساري إلى المكتب؟"
  },
  "اطلاعات سفر را آماده می‌کنید، خلاصه را می‌بینید و با انتخاب خودتان آن را در واتساپ دفتر باز می‌کنید. ارسال نهایی در واتساپ با خود شماست.": {
    "en": "You prepare and review the message, then open WhatsApp yourself. Only you can send the final message.",
    "ar": "تجهّز الرسالة وتراجعها ثم تفتح واتساب بنفسك؛ الإرسال النهائي بيدك."
  },
  "برای پروندهٔ قبلی چطور پیگیری کنم؟": {
    "en": "How do I follow up an earlier request?",
    "ar": "كيف أتابع طلباً سابقاً؟"
  },
  "شمارهٔ پرونده یا اطلاعات درج‌شده در رسید را آماده کنید و با دفتر تماس بگیرید. این صفحه وضعیت پرونده‌های مشتریان را نمایش نمی‌دهد.": {
    "en": "Have your receipt or case reference ready and contact the office. This page does not show customer case status.",
    "ar": "جهّز رقم الملف أو الإيصال واتصل بالمكتب. لا تعرض هذه الصفحة حالة ملفات العملاء."
  },
  "دعوتنامه و تجارت": {
    "en": "Invitations & business",
    "ar": "الدعوات والأعمال"
  },
  "زیارت و کاروان": {
    "en": "Pilgrimage & groups",
    "ar": "الزيارات الدينية والمجموعات"
  },
  "اسناد و کنسولی": {
    "en": "Documents & consular services",
    "ar": "الوثائق والخدمات القنصلية"
  },
  "خدمات مکمل سفر": {
    "en": "Additional travel services",
    "ar": "خدمات السفر الإضافية"
  },
  "توریستی، تجاری، تحصیلی، کاری، زیارتی، تمدید، تغییر وضعیت و اقامت.": {
    "en": "Tourist, business, study, work and pilgrimage visas, extensions and residence enquiries.",
    "ar": "استفسارات التأشيرات السياحية والتجارية والدراسية والعمل والزيارة والتمديد والإقامة."
  },
  "دعوتنامه تجاری، نمایشگاه، سفر کاری، جلسات و خدمات شرکتی.": {
    "en": "Business invitations, exhibitions, work trips, meetings and corporate travel.",
    "ar": "دعوات الأعمال والمعارض والرحلات المهنية والاجتماعات وخدمات الشركات."
  },
  "درخواست بلیت، رزرو هتل، مسیر سفر و بسته‌های ترکیبی.": {
    "en": "Flight and hotel enquiries, travel routes and combined packages.",
    "ar": "استفسارات التذاكر والفنادق ومسارات السفر والباقات المجمعة."
  },
  "عمره، کربلا، ایران و خدمات گروهی و زیارتی.": {
    "en": "Umrah, Karbala, Iran and religious/group travel enquiries.",
    "ar": "استفسارات العمرة وكربلاء وإيران والرحلات الجماعية والدينية."
  },
  "ترجمه، تصدیق، فرم، وقت سفارت و آماده‌سازی پرونده.": {
    "en": "Translations, attestations, forms, embassy appointments and case preparation.",
    "ar": "الترجمة والتصديقات والنماذج ومواعيد السفارات وتجهيز المعاملات."
  },
  "بیمه، ترانسفر، بررسی اسناد و خدمات پشتیبان سفر.": {
    "en": "Insurance enquiries, transfers, document checks and travel assistance.",
    "ar": "استفسارات التأمين والتنقل ومراجعة الوثائق والمساعدة في السفر."
  },
  "سفر کاری": {
    "en": "Business travel",
    "ar": "سفر الأعمال"
  },
  "سفر زیارتی": {
    "en": "Pilgrimage travel",
    "ar": "السفر الديني"
  },
  "خدمات اسناد": {
    "en": "Document services",
    "ar": "خدمات الوثائق"
  },
  "همراه سفر": {
    "en": "Travel assistance",
    "ar": "مساعدة السفر"
  },
  "ایران": {
    "en": "Iran",
    "ar": "إيران"
  },
  "پاکستان": {
    "en": "Pakistan",
    "ar": "باكستان"
  },
  "امارات": {
    "en": "UAE",
    "ar": "الإمارات"
  },
  "ترکیه": {
    "en": "Türkiye",
    "ar": "تركيا"
  },
  "تاجیکستان": {
    "en": "Tajikistan",
    "ar": "طاجيكستان"
  },
  "ازبکستان": {
    "en": "Uzbekistan",
    "ar": "أوزبكستان"
  },
  "قزاقستان": {
    "en": "Kazakhstan",
    "ar": "كازاخستان"
  },
  "روسیه": {
    "en": "Russia",
    "ar": "روسيا"
  },
  "چین": {
    "en": "China",
    "ar": "الصين"
  },
  "هند": {
    "en": "India",
    "ar": "الهند"
  },
  "عربستان سعودی": {
    "en": "Saudi Arabia",
    "ar": "المملكة العربية السعودية"
  },
  "عراق": {
    "en": "Iraq",
    "ar": "العراق"
  },
  "مالیزیا": {
    "en": "Malaysia",
    "ar": "ماليزيا"
  },
  "مالدیو": {
    "en": "Maldives",
    "ar": "المالديف"
  },
  "جاپان": {
    "en": "Japan",
    "ar": "اليابان"
  },
  "امارات متحده عربی": {
    "en": "United Arab Emirates",
    "ar": "الإمارات العربية المتحدة"
  },
  "عراق و عتبات": {
    "en": "Iraq & holy sites",
    "ar": "العراق والمراقد المقدسة"
  },
  "دبی": {
    "en": "Dubai",
    "ar": "دبي"
  },
  "شیراز": {
    "en": "Shiraz",
    "ar": "شيراز"
  },
  "استانبول": {
    "en": "Istanbul",
    "ar": "إسطنبول"
  },
  "اسکندرکول": {
    "en": "Iskanderkul",
    "ar": "إسكندركول"
  },
  "العُلا": {
    "en": "AlUla",
    "ar": "العلا"
  },
  "کربلا": {
    "en": "Karbala",
    "ar": "كربلاء"
  },
  "هنزه": {
    "en": "Hunza",
    "ar": "هونزا"
  },
  "سمرقند": {
    "en": "Samarkand",
    "ar": "سمرقند"
  },
  "آلماتی": {
    "en": "Almaty",
    "ar": "ألماتي"
  },
  "مسکو": {
    "en": "Moscow",
    "ar": "موسكو"
  },
  "پکن": {
    "en": "Beijing",
    "ar": "بكين"
  },
  "آگرا": {
    "en": "Agra",
    "ar": "أغرا"
  },
  "کوالالامپور": {
    "en": "Kuala Lumpur",
    "ar": "كوالالمبور"
  },
  "جزایر مالدیو": {
    "en": "Maldives Islands",
    "ar": "جزر المالديف"
  },
  "کوه فوجی": {
    "en": "Mount Fuji",
    "ar": "جبل فوجي"
  },
  "سفر کاری، اقامت، پرواز و هتل": {
    "en": "Business travel, stays, flights and hotels",
    "ar": "سفر الأعمال والإقامة والطيران والفنادق"
  },
  "سفر، خدمات اسناد و درخواست ویزا": {
    "en": "Travel, documents and visa enquiries",
    "ar": "السفر والوثائق واستفسارات التأشيرة"
  },
  "بررسی خدمات و برنامه‌ریزی سفر": {
    "en": "Service enquiries and trip planning",
    "ar": "استفسارات الخدمات وتخطيط الرحلات"
  },
  "مقصد، مسیر و خدمات مورد نیاز سفر": {
    "en": "Destination, route and travel support",
    "ar": "الوجهة والمسار ودعم السفر"
  },
  "زیارت، سفرهای گروهی و هماهنگی سفر": {
    "en": "Pilgrimage and group travel coordination",
    "ar": "تنسيق الرحلات الدينية والجماعية"
  },
  "سفر زیارتی و خدمات گروهی": {
    "en": "Pilgrimage and group services",
    "ar": "الزيارات الدينية والخدمات الجماعية"
  },
  "بررسی مسیر، اسناد و خدمات سفر": {
    "en": "Route, documents and travel support",
    "ar": "الطريق والوثائق ودعم السفر"
  },
  "ویزا": {
    "en": "Visa",
    "ar": "تأشيرة"
  },
  "دعوتنامه": {
    "en": "Invitation",
    "ar": "دعوة"
  },
  "تور و سفر": {
    "en": "Tours & travel",
    "ar": "الجولات والسفر"
  },
  "ویزا و دعوتنامه": {
    "en": "Visas & invitations",
    "ar": "التأشيرات والدعوات"
  },
  "تحصیل و سفر": {
    "en": "Study & travel",
    "ar": "الدراسة والسفر"
  },
  "ویزا و تجارت": {
    "en": "Visas & business",
    "ar": "التأشيرات والأعمال"
  },
  "تحصیل و دعوتنامه": {
    "en": "Study & invitations",
    "ar": "الدراسة والدعوات"
  },
  "ویزا و درمان": {
    "en": "Visa & medical travel",
    "ar": "التأشيرات والعلاج"
  },
  "تجارت و سفر": {
    "en": "Business & travel",
    "ar": "الأعمال والسفر"
  },
  "بررسی ورود": {
    "en": "Entry conditions review",
    "ar": "مراجعة شروط الدخول"
  },
  "هتل و سفر": {
    "en": "Hotels & travel",
    "ar": "الفنادق والسفر"
  },
  "هتل و تور": {
    "en": "Hotels & tours",
    "ar": "الفنادق والجولات"
  },
  "خدمت کاری یک‌ساله": {
    "en": "One-year work service enquiry",
    "ar": "استفسار خدمة عمل لمدة عام"
  },
  "انواع ویزا": {
    "en": "Visa options",
    "ar": "خيارات التأشيرات"
  },
  "اقامت و سفر": {
    "en": "Residency & travel",
    "ar": "الإقامة والسفر"
  },
  "درمان و سفر": {
    "en": "Medical & travel",
    "ar": "العلاج والسفر"
  },
  "دعوتنامه و سفر": {
    "en": "Invitations & travel",
    "ar": "الدعوات والسفر"
  },
  "حج و عمره": {
    "en": "Hajj & Umrah",
    "ar": "الحج والعمرة"
  },
  "خدمات همراه": {
    "en": "Travel support",
    "ar": "دعم السفر"
  },
  "ویزا و زیارت": {
    "en": "Visas & pilgrimage",
    "ar": "التأشيرات والزيارات الدينية"
  },
  "تور و کاروان": {
    "en": "Tours & groups",
    "ar": "الجولات والمجموعات"
  },
  "تکت": {
    "en": "Flight ticket",
    "ar": "تذكرة طيران"
  },
  "تور و سیاحت": {
    "en": "Tours & tourism",
    "ar": "الجولات والسياحة"
  },
  "تکمیل درخواست ویزا و مراحل خدمات": {
    "en": "Visa forms and application steps",
    "ar": "نماذج التأشيرة وخطوات المعاملة"
  },
  "خدمات کاری": {
    "en": "Work services",
    "ar": "خدمات العمل"
  },
  "سیاحتی": {
    "en": "Tourist",
    "ar": "سياحية"
  },
  "زیارتی": {
    "en": "Pilgrimage",
    "ar": "زيارة دينية"
  },
  "تجارتی": {
    "en": "Business",
    "ar": "تجارية"
  },
  "تحصیلی": {
    "en": "Study",
    "ar": "دراسية"
  },
  "کاری": {
    "en": "Work",
    "ar": "عمل"
  },
  "درمانی": {
    "en": "Medical",
    "ar": "علاجية"
  },
  "دیدار خانواده": {
    "en": "Family visit",
    "ar": "زيارة عائلية"
  },
  "عمره": {
    "en": "Umrah",
    "ar": "العمرة"
  },
  "حج": {
    "en": "Hajj",
    "ar": "الحج"
  }
}
export function siteText(input:string, language:SiteLanguage):string {
  if (language==='fa') return input
  return textMap[input]?.[language] || input
}
export function knownSiteText(input:string):boolean{return Boolean(textMap[input])}
export function countryLabel(input:string,language:SiteLanguage){return siteText(input,language)}
