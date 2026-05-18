import type { FormEvent } from "react";
import type { AppState, ConfirmDialog, TickerTab } from "../types";
import type { UpdateState } from "./StateTypes";
import { createId } from "./stateUtils";

export function createTabActions({
  closeModal,
  setConfirmDialog,
  setTickerError,
  state,
  tickerInput,
  updateState,
}: {
  closeModal: () => void;
  setConfirmDialog: (dialog: ConfirmDialog | null) => void;
  setTickerError: (error: string | null) => void;
  state: AppState;
  tickerInput: string;
  updateState: UpdateState;
}) {
  function createTicker(event: FormEvent) {
    event.preventDefault();
    const ticker = tickerInput.trim().toUpperCase();
    if (!ticker) {
      setTickerError("Enter a ticker symbol.");
      return;
    }
    if (state.tabs.some((tab) => tab.ticker === ticker)) {
      setTickerError("That ticker already exists.");
      return;
    }

    const tab: TickerTab = {
      id: createId(),
      ticker,
      sections: [],
    };

    updateState((current) => ({
      ...current,
      tabs: [...current.tabs, tab],
      activeTabId: tab.id,
    }));
    closeModal();
  }

  function removeTab(tabId: string) {
    const tabToRemove = state.tabs.find((tab) => tab.id === tabId);
    if (!tabToRemove) {
      return;
    }

    setConfirmDialog({
      title: `Remove ${tabToRemove.ticker}?`,
      message: `This will delete ${tabToRemove.ticker} and every section and entry inside it.`,
      confirmLabel: "Remove Tab",
      onConfirm: () => {
        updateState((current) => {
          const tabs = current.tabs.filter((tab) => tab.id !== tabId);
          const activeTabId =
            current.activeTabId === tabId ? tabs[0]?.id ?? null : current.activeTabId;

          return {
            ...current,
            tabs,
            activeTabId,
          };
        });
      },
    });
  }

  function selectTab(tabId: string) {
    updateState((current) => ({ ...current, activeTabId: tabId }));
  }

  return {
    createTicker,
    removeTab,
    selectTab,
  };
}
