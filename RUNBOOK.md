# Multilingual GenAI Gateway — Runbook

## What this service guarantees
Every prompt version that ships has, for EACH supported locale:
- scored >= 0.80 against the golden set (LLM judge)
- passed moderation (fail-closed)
- passed world-readiness (number, date, script, direction)

## Changing a prompt
1. Author a new immutable prompt version (never edit a live one).
2. Run the gate locally: `PROMPT_VERSION=<v> npx tsx scripts/ci-gate.ts`
3. Open the PR. CI runs the same gate across en-US, ja-JP, ar-EG, de-DE.
4. A red locale blocks the merge. Fix the prompt, do not lower the floor.

## When a locale regresses
- Read the per-locale line. The score AND the shippable bit tell you whether it
  was a quality drop (score) or a locale/format/safety failure (shippable).
- Reproduce with one locale: call the gateway with that `locale` and inspect
  the world-readiness checks.
