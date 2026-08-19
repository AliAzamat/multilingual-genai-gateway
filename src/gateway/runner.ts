import { GatewayRequest } from "./types";
import { resolvePromptVersion } from "../prompts/registry";
import { callModel } from "../model/client";

// The ONE place the model is called. Every team's request funnels here, which
// means eval, moderation, and world-readiness can wrap a single choke point.
export async function runModel(req: GatewayRequest): Promise<string> {
  const prompt = resolvePromptVersion(req.promptVersion);
  if (!prompt) {
    throw new Error(`unknown prompt version: ${req.promptVersion}`);
  }
  // The prompt template carries a {{locale}} slot so the model is told which
  // language and conventions to answer in — the first world-readiness lever.
  const filled = prompt.template
    .replace("{{input}}", req.input)
    .replace("{{locale}}", req.locale);
  return callModel(filled);
}
