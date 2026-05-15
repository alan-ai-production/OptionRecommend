export const CONSENT_KEY = "optionRecommend:consent";
export const CONSENT_VERSION = 1;

export type ConsentRecord = {
  acceptedAt: string;
  version: number;
};

export function loadConsent(): ConsentRecord | null {
  try {
    const raw = localStorage.getItem(CONSENT_KEY);
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw) as Partial<ConsentRecord>;
    if (parsed.version !== CONSENT_VERSION || typeof parsed.acceptedAt !== "string") {
      return null;
    }

    return {
      acceptedAt: parsed.acceptedAt,
      version: parsed.version,
    };
  } catch {
    return null;
  }
}

export function saveConsent() {
  const consent: ConsentRecord = {
    acceptedAt: new Date().toISOString(),
    version: CONSENT_VERSION,
  };

  localStorage.setItem(CONSENT_KEY, JSON.stringify(consent));
  return consent;
}
