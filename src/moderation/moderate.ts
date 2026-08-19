import { ModerationVerdict } from "../gateway/types";
import { callModel } from "../model/client";

const POLICIES = ["harassment", "self-harm", "private-data", "off-brand"];

const MOD_PROMPT = `You are a content safety classifier. Given TEXT, return the
policy categories it violates from this list, or an empty list if clean:
${POLICIES.join(", ")}. Reply as JSON: {"categories": string[]}.`;

export async function moderate(text: string): Promise<ModerationVerdict> {
  try {
    const raw = await callModel(`${MOD_PROMPT}\nTEXT: ${text}`);
    const parsed = JSON.parse(raw) as { categories: string[] };
    return { blocked: parsed.categories.length > 0, categories: parsed.categories };
  } catch {
    // Fail CLOSED: if the moderator errors, treat the output as unsafe.
    return { blocked: true, categories: ["moderation-error"] };
  }
}
