import type { TickerTab } from "../types";

export function createId() {
  return crypto.randomUUID();
}

export function todayLabel() {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date());
}

export function replaceTicker(template: string, ticker: string) {
  return template.replaceAll("{{ticker}}", ticker);
}

export function createUniqueTicker(ticker: string, usedTickers: Set<string>) {
  let candidate = ticker;
  let suffix = 2;

  while (usedTickers.has(candidate.toLowerCase())) {
    candidate = `${ticker}-${suffix}`;
    suffix += 1;
  }

  usedTickers.add(candidate.toLowerCase());
  return candidate;
}

export function cloneImportedTab(tab: TickerTab, ticker: string): TickerTab {
  return {
    id: createId(),
    ticker,
    sections: tab.sections.map((section) => ({
      ...section,
      id: createId(),
      entries: section.entries.map((entry) => ({
        ...entry,
        id: createId(),
      })),
    })),
  };
}
