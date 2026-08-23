import { GPT2_CLOSEST_NATIVE, GPT2_NATIVE_RATIOS } from "./constants";
import type { AspectRatio, ModelChoice, RatioCompatibilityResult } from "./types";

/** Fits a `W:H` ratio string inside a maxSize x maxSize box, preserving proportions. */
export function ratioBoxSize(ratio: string, maxSize: number): { width: number; height: number } {
  const [wRaw, hRaw] = ratio.split(":").map(Number);
  const w = wRaw || 1;
  const h = hRaw || 1;
  if (w >= h) {
    return { width: maxSize, height: (maxSize * h) / w };
  }
  return { width: (maxSize * w) / h, height: maxSize };
}

/**
 * Determines whether the chosen model can render the requested aspect ratio
 * natively, or whether the output must pass through the auto-format /
 * resize engine before it reaches the final asset stage.
 *
 * Nano Banana 2 / Pro and "auto" are treated as fully flexible generation
 * engines that accept any of the supported ratios directly. GPT2 only
 * ships a small set of native canvas sizes, so most requested ratios need
 * the smart canvas engine to adapt the frame without altering the image.
 */
export function checkRatioCompatibility(
  model: ModelChoice,
  requested: AspectRatio
): RatioCompatibilityResult {
  if (model !== "gpt2") {
    return {
      requested,
      supported: true,
      nativeRatio: requested,
      resizeRequired: false,
    };
  }

  const supported = GPT2_NATIVE_RATIOS.includes(requested);

  return {
    requested,
    supported,
    nativeRatio: supported ? requested : GPT2_CLOSEST_NATIVE[requested],
    resizeRequired: !supported,
  };
}
