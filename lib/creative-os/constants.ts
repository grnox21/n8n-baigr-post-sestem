import type { AspectRatio, ContentType, ModelChoice, Quality } from "./types";

export const CONTENT_TYPE_OPTIONS: {
  id: ContentType;
  label: string;
  hint: string;
}[] = [
  { id: "image", label: "صورة", hint: "منشور بصري واحد" },
  { id: "carousel", label: "كاروسيل", hint: "سلسلة شرائح" },
  { id: "video", label: "فيديو", hint: "مقطع متحرك" },
  { id: "talking_head", label: "شخصية متحدثة", hint: "راوٍ رقمي" },
  { id: "auto", label: "تلقائي", hint: "يقرر النظام" },
];

export const MODEL_OPTIONS: {
  id: ModelChoice;
  label: string;
  code: string;
  hint: string;
}[] = [
  { id: "auto", label: "تلقائي", code: "auto", hint: "يختار النظام الأنسب" },
  { id: "gpt2", label: "GPT2", code: "gpt2", hint: "قياسات أصلية محدودة" },
  { id: "nano_banana_2", label: "نانو بنانا 2", code: "nano_banana_2", hint: "توليد سريع ومرن" },
  { id: "nano_banana_pro", label: "نانو بنانا برو", code: "nano_banana_pro", hint: "أعلى دقة وتفاصيل" },
];

export const ASPECT_RATIO_OPTIONS: {
  id: AspectRatio;
  label: string;
  css: string;
}[] = [
  { id: "1:1", label: "مربع", css: "1 / 1" },
  { id: "4:5", label: "بورتريه", css: "4 / 5" },
  { id: "9:16", label: "ستوري", css: "9 / 16" },
  { id: "16:9", label: "عريض", css: "16 / 9" },
  { id: "3:4", label: "عمودي", css: "3 / 4" },
  { id: "4:3", label: "أفقي", css: "4 / 3" },
];

export const ASPECT_RATIO_CSS: Record<string, string> = {
  "1:1": "1 / 1",
  "4:5": "4 / 5",
  "9:16": "9 / 16",
  "16:9": "16 / 9",
  "3:4": "3 / 4",
  "4:3": "4 / 3",
  "2:3": "2 / 3",
  "3:2": "3 / 2",
};

export const QUALITY_OPTIONS: {
  id: Quality;
  label: string;
  hint: string;
  gridDensity: number;
}[] = [
  { id: "1K", label: "1K", hint: "أساسية", gridDensity: 4 },
  { id: "2K", label: "2K", hint: "عالية", gridDensity: 8 },
  { id: "4K", label: "4K", hint: "فائقة الدقة", gridDensity: 14 },
];

/** Ratios the simulated GPT2 engine can render natively — everything else needs auto-format. */
export const GPT2_NATIVE_RATIOS: AspectRatio[] = ["1:1"];

/** Closest native GPT2 output for a requested ratio that isn't natively supported. */
export const GPT2_CLOSEST_NATIVE: Record<AspectRatio, "1:1" | "2:3" | "3:2"> = {
  "1:1": "1:1",
  "4:5": "2:3",
  "9:16": "2:3",
  "3:4": "2:3",
  "16:9": "3:2",
  "4:3": "3:2",
};

export const STATUS_LABELS: Record<string, string> = {
  idle: "بانتظار البدء",
  strategizing: "صياغة الاستراتيجية الإبداعية",
  routing: "توجيه المهمة للنموذج",
  generating: "توليد الصورة",
  resizing: "تهيئة القياس تلقائيًا",
  ready: "جاهز للمراجعة",
  approved: "تمت الموافقة والنشر",
  revision_requested: "قيد إعادة التوليد",
  cancelled: "أُلغي المشروع",
};

export const DEFAULT_TOPIC = "٥ أخطاء تقلل نسبة التحويل في موقعك الإلكتروني";
