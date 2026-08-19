import { EvalVerdict } from "../gateway/types";
import { callModel } from "../model/client";

// A golden case is an input plus what a correct answer must contain. The judge
// compares the model's actual output to this rubric — not to an exact string,
// because good answers vary in wording.
export interface GoldenCase {
  input: string;
  rubric: string;   // "must state the 30-day refund window and stay polite"
}

const JUDGE_PROMPT = `You are a strict grader. Given a RUBRIC and an ANSWER,
score 0.0 to 1.0 how fully the answer satisfies the rubric. Reply as JSON:
{"score": number, "reason": string}.`;

export async function judge(answer: string, gold: GoldenCase): Promise<EvalVerdict> {
  const raw = await callModel(
    `${JUDGE_PROMPT}\nRUBRIC: ${gold.rubric}\nANSWER: ${answer}`
  );
  const parsed = JSON.parse(raw) as { score: number; reason: string };
  return {
    score: parsed.score,
    passed: parsed.score >= 0.8,   // the bar a shared service holds the line at
    reason: parsed.reason,
  };
}
