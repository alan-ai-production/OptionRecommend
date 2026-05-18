import type { Dispatch, SetStateAction } from "react";
import { saveConsent } from "../consent";
import { defaultState, STORAGE_KEY } from "../storage";
import type { AppState, ConfirmDialog, TickerTab } from "../types";
import type { UpdateState } from "./StateTypes";
import { cloneImportedTab, createUniqueTicker, replaceTicker } from "./stateUtils";

export function createSettingActions({
  activeTab,
  setConfirmDialog,
  setCopyStatus,
  setHasConsent,
  setState,
  state,
  updateState,
}: {
  activeTab: TickerTab | null;
  setConfirmDialog: (dialog: ConfirmDialog | null) => void;
  setCopyStatus: Dispatch<SetStateAction<string | null>>;
  setHasConsent: Dispatch<SetStateAction<boolean>>;
  setState: Dispatch<SetStateAction<AppState>>;
  state: AppState;
  updateState: UpdateState;
}) {
  async function copyPrompt() {
    if (!activeTab) {
      return;
    }

    const prompt = replaceTicker(state.promptTemplate, activeTab.ticker);
    await navigator.clipboard.writeText(prompt);
    setCopyStatus(activeTab.ticker);
    window.setTimeout(() => setCopyStatus(null), 1800);
  }

  function toggleTheme() {
    updateState((current) => ({
      ...current,
      theme: current.theme === "dark" ? "light" : "dark",
    }));
  }

  function acceptConsent() {
    saveConsent();
    setHasConsent(true);
  }

  function updatePromptTemplate(promptTemplate: string) {
    setState((current) => ({ ...current, promptTemplate }));
  }

  function replaceImportedState(importedState: AppState) {
    setState(importedState);
  }

  function mergeImportedState(importedState: AppState) {
    setState((current) => {
      const usedTickers = new Set(current.tabs.map((tab) => tab.ticker.toLowerCase()));
      const importedTabs = importedState.tabs.map((tab) =>
        cloneImportedTab(tab, createUniqueTicker(tab.ticker, usedTickers)),
      );

      return {
        ...current,
        tabs: [...current.tabs, ...importedTabs],
        activeTabId: current.activeTabId ?? current.tabs[0]?.id ?? importedTabs[0]?.id ?? null,
      };
    });
  }

  function requestResetLocalData(onReset?: () => void) {
    setConfirmDialog({
      title: "Reset local data?",
      message:
        "This will clear this app's saved tabs, sections, entries, prompt template, theme, and restore the default state.",
      confirmLabel: "Reset Data",
      onConfirm: () => {
        localStorage.removeItem(STORAGE_KEY);
        onReset?.();
        setState({
          ...defaultState,
          tabs: [],
          activeTabId: null,
        });
      },
    });
  }

  return {
    acceptConsent,
    copyPrompt,
    mergeImportedState,
    replaceImportedState,
    requestResetLocalData,
    toggleTheme,
    updatePromptTemplate,
  };
}
