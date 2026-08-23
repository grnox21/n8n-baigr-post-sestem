export type ContentType = "image" | "carousel" | "video" | "talking_head" | "auto";

export type ModelChoice = "auto" | "gpt2" | "nano_banana_2" | "nano_banana_pro";

export type AspectRatio = "1:1" | "4:5" | "9:16" | "16:9" | "3:4" | "4:3";

/** Ratios the simulated GPT2 engine can render natively. */
export type GptNativeRatio = "1:1" | "2:3" | "3:2";

export type Quality = "1K" | "2K" | "4K";

export type GenerationStatus =
  | "idle"
  | "strategizing"
  | "routing"
  | "generating"
  | "resizing"
  | "ready"
  | "approved"
  | "revision_requested"
  | "cancelled";

export interface CreativeOSState {
  telegramChatId: string;
  contentType: ContentType;
  model: ModelChoice;
  aspectRatio: AspectRatio;
  quality: Quality;
  topic: string;
  generationStatus: GenerationStatus;
  version: number;
  revisionNote: string;
  interacted: boolean;
  autoplay: boolean;
}

export interface RatioCompatibilityResult {
  requested: AspectRatio;
  supported: boolean;
  nativeRatio: AspectRatio | GptNativeRatio;
  resizeRequired: boolean;
}
