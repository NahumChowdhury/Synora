const ADULT_PATTERNS: RegExp[] = [
  /\b(?:porn|pornography|xxx)\b/i,
  /\b(?:nudes?|naked\s+(?:pics?|photos?)|send\s+(?:me\s+)?(?:nudes?|naked\s+(?:pics?|photos?)))\b/i,
  /\b(?:sexual\s+content|sex\s+chat|sext(?:ing)?)\b/i,
  /\b(?:onlyfans|xvideos|pornhub)\b/i,
];

const THREAT_PATTERNS: RegExp[] = [
  /\b(?:i(?:'|’)ll|i\s+will)\s+(?:kill|hurt|attack)\s+you\b/i,
  /\b(?:kill\s+yourself)\b/i,
];

export type SafetyDecision = { allowed: true } | { allowed: false; message: string };

export function checkMessageSafety(content: string): SafetyDecision {
  if (content.length > 2000) {
    return { allowed: false, message: "Messages must be 2,000 characters or fewer." };
  }

  if (ADULT_PATTERNS.some((pattern) => pattern.test(content))) {
    return {
      allowed: false,
      message: "Adult or sexual content is not allowed in Synora messages.",
    };
  }

  if (THREAT_PATTERNS.some((pattern) => pattern.test(content))) {
    return {
      allowed: false,
      message: "Threatening or dangerous messages are not allowed on Synora.",
    };
  }

  return { allowed: true };
}
