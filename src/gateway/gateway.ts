import { GatewayRequest, GatewayResponse } from "./types";
import { runModel } from "./runner";
import { judge, GoldenCase } from "../eval/judge";
import { moderate } from "../moderation/moderate";
import { worldReady } from "../i18n/worldReady";

export async function handle(
  req: GatewayRequest,
  gold: GoldenCase
): Promise<GatewayResponse> {
  const output = await runModel(req);

  // Moderate FIRST. A blocked answer is never shippable no matter how it scores,
  // and we do not want to spend a judge call grading something we will reject.
  const moderation = await moderate(output);
  if (moderation.blocked) {
    return {
      output,
      eval: { score: 0, passed: false, reason: "blocked by moderation" },
      moderation,
      worldReady: false,
      shippable: false,
    };
  }

  const evalVerdict = await judge(output, gold);
  const localeChecks = worldReady(output, req.locale);
  const worldOk = localeChecks.every((c) => c.ok);

  return {
    output,
    eval: evalVerdict,
    moderation,
    worldReady: worldOk,
    // Shippable only if it passed the bar, is clean, AND is right for the locale.
    shippable: evalVerdict.passed && !moderation.blocked && worldOk,
  };
}
