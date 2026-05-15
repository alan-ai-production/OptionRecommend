import type { AppState } from "./types";
import { defaultPrompt } from "./components/prompt";

export const STORAGE_KEY = "optionRecommend:data";

export const defaultState: AppState = {
  tabs: [],
  promptTemplate: defaultPrompt,
  theme: "light",
  activeTabId: null,
};

export function loadState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return defaultState;
    }

    const parsed = JSON.parse(raw) as Partial<AppState>;

    return {
      tabs: Array.isArray(parsed.tabs) ? parsed.tabs : [],
      promptTemplate:
        typeof parsed.promptTemplate === "string"
          ? parsed.promptTemplate
          : defaultPrompt,
      theme: parsed.theme === "dark" ? "dark" : "light",
      activeTabId:
        typeof parsed.activeTabId === "string" ? parsed.activeTabId : null,
    };
  } catch {
    return defaultState;
  }
}

export function saveState(state: AppState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}
