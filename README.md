# Multilingual GenAI Evaluation & Moderation Gateway

The capstone for shared GenAI platform work. You build one gateway that other teams call to run an LLM prompt, score it with an LLM-as-judge against a golden set, moderate it for safety, and check it holds up across multiple languages and locales — then gate every prompt change in CI on those scores. You assemble the eval discipline and the safety/red-team mindset from the prerequisites and add the piece neither teaches: world-readiness. The thing a real globalization-meets-GenAI team ships. TypeScript end to end with an LLM API, an eval harness, a moderation pass, ICU-based i18n, Postgres, and a CI gate.

Built step-by-step with [KhwajaLabs Build](https://khwajalabs.com).

## Stack
- TypeScript
- LLM API
- Eval
- Moderation
- i18n
- ICU
- Postgres
- CI
