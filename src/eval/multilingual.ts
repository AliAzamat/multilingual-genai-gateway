import { handle } from "../gateway/gateway";
import { GoldenCase } from "./judge";

export interface LocaleResult {
  locale: string;
  score: number;
  shippable: boolean;
}

// Run ONE golden case through the gateway in every target locale. The whole
// reason a globalization-aware service exists: passing in en-US tells you
// almost nothing about ja-JP or ar-EG.
export async function runMatrix(
  gold: GoldenCase,
  locales: string[],
  promptVersion: string
): Promise<LocaleResult[]> {
  const results: LocaleResult[] = [];
  for (const locale of locales) {
    const res = await handle(
      { promptVersion, input: gold.input, locale },
      gold
    );
    results.push({
      locale,
      score: res.eval.score,
      shippable: res.shippable,
    });
  }
  return results;
}

// A prompt version is only as good as its WORST locale, not its average.
export function worstLocale(results: LocaleResult[]): LocaleResult {
  return results.reduce((a, b) => (b.score < a.score ? b : a));
}
