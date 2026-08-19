// A GatewayRequest is what any internal team sends. They give us a prompt
// version (not raw prompt text — versions are auditable) and the input.
export interface GatewayRequest {
  promptVersion: string;   // e.g. "support-reply@v7" — resolved, never inlined
  input: string;           // the user/content payload to run through the model
  locale: string;          // BCP-47, e.g. "en-US", "ja-JP", "ar-EG"
}

// Every response carries the output AND the receipts: how it scored, whether
// it was moderated, and whether it is safe to ship in this locale.
export interface GatewayResponse {
  output: string;
  eval: EvalVerdict;
  moderation: ModerationVerdict;
  worldReady: boolean;     // did it pass the locale checks for request.locale
  shippable: boolean;      // the single bit a caller acts on
}

export interface EvalVerdict {
  score: number;           // 0..1 from the LLM judge
  passed: boolean;
  reason: string;
}

export interface ModerationVerdict {
  blocked: boolean;
  categories: string[];    // which policies tripped, empty if clean
}
