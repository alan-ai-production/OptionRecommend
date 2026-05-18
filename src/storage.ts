import type { AppState, DateSection, Entry, TickerTab } from "./types";
import { defaultPrompt } from "./components/prompt";

export const STORAGE_KEY = "optionRecommend:data";

export const defaultState: AppState = {
  tabs: [],
  promptTemplate: defaultPrompt,
  theme: "light",
  activeTabId: null,
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function todayLabel() {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date());
}

function toLocalDateKey(date: Date) {
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

function isCreatedToday(createdAt: string | undefined, label: string) {
  if (createdAt) {
    const createdDate = new Date(createdAt);

    if (!Number.isNaN(createdDate.getTime())) {
      return toLocalDateKey(createdDate) === toLocalDateKey(new Date());
    }
  }

  return label.trim() === todayLabel();
}

function normalizeEntry(value: unknown): Entry | null {
  if (!isRecord(value)) {
    return null;
  }

  const { id, createdAt, responseText, isCollapsed } = value;
  if (typeof id !== "string" || typeof createdAt !== "string" || typeof responseText !== "string") {
    return null;
  }

  return {
    id,
    createdAt,
    responseText,
    isCollapsed: typeof isCollapsed === "boolean" ? isCollapsed : false,
  };
}

function normalizeSection(value: unknown): DateSection | null {
  if (!isRecord(value)) {
    return null;
  }

  const { id, label, createdAt, entries, isCollapsed } = value;
  if (typeof id !== "string" || typeof label !== "string" || !Array.isArray(entries)) {
    return null;
  }

  const sectionCreatedAt = typeof createdAt === "string" ? createdAt : undefined;
  const createdToday = isCreatedToday(sectionCreatedAt, label);
  const collapsed = typeof isCollapsed === "boolean" ? isCollapsed : false;

  return {
    id,
    label,
    createdAt: sectionCreatedAt,
    entries: entries.map(normalizeEntry).filter((entry): entry is Entry => entry !== null),
    isCollapsed: createdToday ? collapsed : true,
  };
}

function normalizeTab(value: unknown): TickerTab | null {
  if (!isRecord(value)) {
    return null;
  }

  const { id, ticker, sections } = value;
  if (typeof id !== "string" || typeof ticker !== "string" || !Array.isArray(sections)) {
    return null;
  }

  return {
    id,
    ticker,
    sections: sections
      .map(normalizeSection)
      .filter((section): section is DateSection => section !== null),
  };
}

export function loadState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return defaultState;
    }

    const parsed = JSON.parse(raw) as Partial<AppState>;
    const tabs = Array.isArray(parsed.tabs)
      ? parsed.tabs.map(normalizeTab).filter((tab): tab is TickerTab => tab !== null)
      : [];

    return {
      tabs,
      promptTemplate:
        typeof parsed.promptTemplate === "string"
          ? parsed.promptTemplate
          : defaultPrompt,
      theme: parsed.theme === "dark" ? "dark" : "light",
      activeTabId:
        typeof parsed.activeTabId === "string" && tabs.some((tab) => tab.id === parsed.activeTabId)
          ? parsed.activeTabId
          : tabs[0]?.id ?? null,
    };
  } catch {
    return defaultState;
  }
}

export function saveState(state: AppState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}
