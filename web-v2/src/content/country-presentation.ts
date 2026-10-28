export type CountryPresentation = {code:string;tags:string[];image?:string;place?:string;credit?:string;source?:string}
// Labels summarize owner-confirmed services; photographs introduce destinations, not specific packages.
export const countryPresentation:Record<string,CountryPresentation> = {
  "ازبکستان": {
    "code": "UZ",
    "tags": [
      "ویزا و دعوتنامه",
      "تور و سفر"
    ],
    "image": "/media/uzbekistan-destination.webp",
    "place": "سمرقند",
    "credit": "AXP Photography",
    "source": "https://www.pexels.com/photo/registan-square-in-samarkand-in-uzbekistan-19439125/"
  },
  "قزاقستان": {
    "code": "KZ",
    "tags": [
      "ویزا و دعوتنامه",
      "تحصیل و سفر"
    ],
    "image": "/media/kazakhstan-destination.webp",
    "place": "آلماتی",
    "credit": "Aibek Skakov",
    "source": "https://www.pexels.com/photo/urban-skyline-view-of-almaty-kazakhstan-28931915/"
  },
  "روسیه": {
    "code": "RU",
    "tags": [
      "ویزا و دعوتنامه",
      "تحصیل و سفر"
    ],
    "image": "/media/russia-destination.webp",
    "place": "مسکو",
    "credit": "Vitali Adutskevich",
    "source": "https://www.pexels.com/photo/sunset-sunlight-over-saint-basils-cathedral-in-moscow-12900781/"
  },
  "چین": {
    "code": "CN",
    "tags": [
      "ویزا و تجارت",
      "تحصیل و دعوتنامه"
    ],
    "image": "/media/china-destination.webp",
    "place": "پکن",
    "credit": "Kaca Pic",
    "source": "https://www.pexels.com/photo/beijing-skyline-featuring-modern-skyscrapers-37506202/"
  },
  "هند": {
    "code": "IN",
    "tags": [
      "ویزا و درمان",
      "تجارت و سفر"
    ],
    "image": "/media/india-destination.webp",
    "place": "آگرا",
    "credit": "Yash Rai",
    "source": "https://www.pexels.com/photo/majestic-view-of-the-iconic-taj-mahal-in-agra-31372009/"
  },
  "مالیزیا": {
    "code": "MY",
    "tags": [
      "بررسی ورود",
      "هتل و سفر"
    ],
    "image": "/media/malaysia-destination.webp",
    "place": "کوالالامپور",
    "credit": "Airlangga Jati",
    "source": "https://www.pexels.com/photo/kuala-lumpur-skyline-featuring-petronas-towers-32644036/"
  },
  "مالدیو": {
    "code": "MV",
    "tags": [
      "بررسی ورود",
      "هتل و تور"
    ],
    "image": "/media/maldives-destination.webp",
    "place": "جزایر مالدیو",
    "credit": "Asad Photo Maldives",
    "source": "https://www.pexels.com/photo/stunning-aerial-view-of-maldives-island-paradise-28859944/"
  },
  "جاپان": {
    "code": "JP",
    "tags": [
      "خدمت کاری یک‌ساله"
    ],
    "image": "/media/japan-destination.webp",
    "place": "کوه فوجی",
    "credit": "Lorenzo Castellino",
    "source": "https://www.pexels.com/photo/majestic-mount-fuji-with-serene-lake-view-33229965/"
  },
  "ایران": {
    "code": "IR",
    "tags": [
      "انواع ویزا",
      "اقامت و سفر"
    ]
  },
  "پاکستان": {
    "code": "PK",
    "tags": [
      "ویزا و دعوتنامه",
      "درمان و سفر"
    ]
  },
  "امارات": {
    "code": "AE",
    "tags": [
      "ویزا و اقامت",
      "تجارت و سفر"
    ]
  },
  "ترکیه": {
    "code": "TR",
    "tags": [
      "ویزا و اقامت",
      "دعوتنامه و سفر"
    ]
  },
  "تاجیکستان": {
    "code": "TJ",
    "tags": [
      "ویزا و دعوتنامه",
      "تور و سفر"
    ]
  },
  "عربستان سعودی": {
    "code": "SA",
    "tags": [
      "حج و عمره",
      "خدمات همراه"
    ]
  },
  "عراق": {
    "code": "IQ",
    "tags": [
      "ویزا و زیارت",
      "تور و کاروان"
    ]
  }
}
