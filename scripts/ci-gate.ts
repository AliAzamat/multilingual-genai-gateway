import { runMatrix, worstLocale } from "../src/eval/multilingual";
import { GOLDEN } from "../src/eval/golden";

const LOCALES = ["en-US", "ja-JP", "ar-EG", "de-DE"];
const FLOOR = 0.8;   // every locale must clear this, not just the average

async function main() {
  const version = process.env.PROMPT_VERSION;
  if (!version) throw new Error("set PROMPT_VERSION");

  let failed = false;
  for (const gold of GOLDEN) {
    const results = await runMatrix(gold, LOCALES, version);
    const worst = worstLocale(results);
    for (const r of results) {
      const mark = r.score >= FLOOR && r.shippable ? "ok" : "FAIL";
      console.log(`${mark}  ${r.locale}  ${r.score.toFixed(2)}  "${gold.input.slice(0, 30)}"`);
    }
    if (worst.score < FLOOR || !worst.shippable) failed = true;
  }
  // Non-zero exit fails the CI job, which blocks the merge.
  process.exit(failed ? 1 : 0);
}

main();
