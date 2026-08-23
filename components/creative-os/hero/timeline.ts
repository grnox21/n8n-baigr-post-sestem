export interface HeroFrame {
  scenario: 1 | 2;
  node: number;
  duration: number;
  label: string;
  contentType: string;
  model: string;
  ratio: string;
  displayRatio: string;
  quality: string;
  status: string;
  resizing?: boolean;
}

export const HERO_NODES = [
  "تيليجرام",
  "النوع والنموذج",
  "الصيغة والجودة",
  "عقل الإبداع",
  "التوجيه",
  "التوليد والتهيئة",
  "المعاينة والاعتماد",
];

const A_MODEL = "nano_banana_pro";
const A_RATIO = "4:5";

export const HERO_TIMELINE: HeroFrame[] = [
  { scenario: 1, node: 0, duration: 1500, label: "اختيار نوع المحتوى: صورة", contentType: "صورة", model: A_MODEL, ratio: A_RATIO, displayRatio: A_RATIO, quality: "2K", status: "idle" },
  { scenario: 1, node: 1, duration: 1500, label: "اختيار النموذج: نانو بنانا برو", contentType: "صورة", model: A_MODEL, ratio: A_RATIO, displayRatio: A_RATIO, quality: "2K", status: "idle" },
  { scenario: 1, node: 2, duration: 1400, label: "الصيغة 4:5 بجودة 2K", contentType: "صورة", model: A_MODEL, ratio: A_RATIO, displayRatio: A_RATIO, quality: "2K", status: "idle" },
  { scenario: 1, node: 3, duration: 1700, label: "صياغة الاستراتيجية الإبداعية", contentType: "صورة", model: A_MODEL, ratio: A_RATIO, displayRatio: A_RATIO, quality: "2K", status: "strategizing" },
  { scenario: 1, node: 4, duration: 1100, label: "توجيه المهمة للنموذج الصحيح", contentType: "صورة", model: A_MODEL, ratio: A_RATIO, displayRatio: A_RATIO, quality: "2K", status: "routing" },
  { scenario: 1, node: 5, duration: 2000, label: "توليد الصورة مباشرة", contentType: "صورة", model: A_MODEL, ratio: A_RATIO, displayRatio: A_RATIO, quality: "2K", status: "generating" },
  { scenario: 1, node: 6, duration: 1500, label: "تسليم النتيجة في تيليجرام", contentType: "صورة", model: A_MODEL, ratio: A_RATIO, displayRatio: A_RATIO, quality: "2K", status: "ready" },
  { scenario: 1, node: 6, duration: 1700, label: "تمت الموافقة والنشر", contentType: "صورة", model: A_MODEL, ratio: A_RATIO, displayRatio: A_RATIO, quality: "2K", status: "approved" },

  { scenario: 2, node: 1, duration: 1500, label: "تبديل النموذج إلى GPT2", contentType: "صورة", model: "gpt2", ratio: "9:16", displayRatio: "9:16", quality: "2K", status: "idle" },
  { scenario: 2, node: 2, duration: 1400, label: "طلب صيغة ستوري 9:16", contentType: "صورة", model: "gpt2", ratio: "9:16", displayRatio: "9:16", quality: "2K", status: "idle" },
  { scenario: 2, node: 4, duration: 1300, label: "GPT2 لا يدعم 9:16 أصليًا", contentType: "صورة", model: "gpt2", ratio: "9:16", displayRatio: "2:3", quality: "2K", status: "routing" },
  { scenario: 2, node: 5, duration: 1900, label: "توليد بأقرب قياس أصلي 2:3", contentType: "صورة", model: "gpt2", ratio: "9:16", displayRatio: "2:3", quality: "2K", status: "generating" },
  { scenario: 2, node: 5, duration: 1600, label: "تهيئة تلقائية إلى 9:16", contentType: "صورة", model: "gpt2", ratio: "9:16", displayRatio: "9:16", quality: "2K", status: "resizing", resizing: true },
  { scenario: 2, node: 6, duration: 1700, label: "المحتوى محفوظ، القياس مُهيأ", contentType: "صورة", model: "gpt2", ratio: "9:16", displayRatio: "9:16", quality: "2K", status: "ready" },
  { scenario: 2, node: 6, duration: 1900, label: "جاهز للنشر عبر المنصات", contentType: "صورة", model: "gpt2", ratio: "9:16", displayRatio: "9:16", quality: "2K", status: "approved" },
];
