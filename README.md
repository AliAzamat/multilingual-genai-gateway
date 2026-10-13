# Multilingual GenAI Gateway

**A TypeScript gateway that runs versioned prompts and returns a single `shippable` bit per locale — combining an LLM-as-judge score, a fail-closed moderation pass, and deterministic locale checks — so prompt changes can be gated in CI across languages.**

A prompt that works in `en-US` tells you very little about `ja-JP` or `ar-EG`. This gateway is the choke point that every team's prompt goes through: it runs the model, refuses to grade anything moderation blocks, scores the answer against a rubric, checks it actually follows the target locale's conventions, and judges a prompt version by its *worst* locale rather than its average.

```mermaid
flowchart LR
    R[Request<br/>promptVersion · input · locale] --> M[Model call<br/>versioned template<br/>with locale slot]
    M --> MOD{Moderation<br/>fail-closed}
    MOD -->|blocked| X[shippable = false<br/>no judge call]
    MOD -->|clean| J[LLM judge<br/>rubric score ≥ 0.80]
    MOD -->|clean| W[World-readiness<br/>number format · script]
    J --> S[shippable =<br/>passed ∧ clean ∧ locale-ok]
    W --> S
```

## Design choices

- **Versions, not raw prompts.** Callers send a prompt version like `support-reply@v7`; templates are resolved server-side and carry `{{input}}` and `{{locale}}` slots, so every output is traceable to an immutable prompt.
- **Moderate before judging.** A blocked answer is never shippable, so the gateway skips the judge call entirely. If the moderation call errors or returns unparseable output, the result is treated as blocked (`moderation-error`).
- **Rubric-based judging.** The judge scores 0–1 against what a correct answer must contain, not an exact string, because good answers vary in wording. The pass bar is 0.80.
- **Deterministic locale checks.** World-readiness is checked in code, not by another model: number grouping must match `Intl.NumberFormat` for the locale, and answers for Arabic, Hebrew, Persian, Urdu, Japanese, Chinese, Korean, and Russian locales must contain non-Latin script.
- **Worst locale wins.** The CI gate runs every golden case across `en-US`, `ja-JP`, `ar-EG`, and `de-DE`, prints a per-locale line, and exits non-zero if any locale is below 0.80 or not shippable.

## CI gate

```bash
PROMPT_VERSION=support-reply@v7 npx tsx scripts/ci-gate.ts
```

It prints one line per golden case and locale, in the form `<ok|FAIL>  <locale>  <score>  "<first 30 chars of input>"`. A locale can score above the floor and still `FAIL` when moderation or a locale check fails — see [RUNBOOK.md](RUNBOOK.md) for how to read and act on a red locale.

## Layout

| Path | Purpose |
|---|---|
| `src/gateway/` | Request/response types, the model runner, and `handle()` |
| `src/eval/judge.ts` | Golden-case type and rubric judge |
| `src/eval/multilingual.ts` | Per-locale matrix and `worstLocale` |
| `src/moderation/moderate.ts` | Policy classifier (harassment, self-harm, private data, off-brand), fail-closed |
| `src/i18n/worldReady.ts` | Number-format and script checks |
| `scripts/ci-gate.ts` | The merge gate |
