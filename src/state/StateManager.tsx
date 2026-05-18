import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react";
import { loadConsent } from "../consent";
import { loadState, saveState } from "../storage";
import type { AppState, Page } from "../types";
import { createEntryActions } from "./EntryState";
import { useModalState } from "./ModalState";
import { createSectionActions } from "./SectionState";
import { createSettingActions } from "./SettingState";
import { createTabActions } from "./TabState";
import type { StateManagerValue } from "./StateTypes";

const StateManagerContext = createContext<StateManagerValue | null>(null);

export function StateProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(() => loadState());
  const [page, setPage] = useState<Page>("home");
  const [copyStatus, setCopyStatus] = useState<string | null>(null);
  const [hasConsent, setHasConsent] = useState(() => loadConsent() !== null);
  const modalState = useModalState();

  useEffect(() => {
    saveState(state);
    document.documentElement.dataset.theme = state.theme;
  }, [state]);

  const activeTab = useMemo(
    () => state.tabs.find((tab) => tab.id === state.activeTabId) ?? state.tabs[0] ?? null,
    [state.activeTabId, state.tabs],
  );

  useEffect(() => {
    if (state.tabs.length > 0 && !activeTab) {
      setState((current) => ({ ...current, activeTabId: current.tabs[0]?.id ?? null }));
    }
  }, [activeTab, state.tabs.length]);

  function updateState(updater: (current: AppState) => AppState) {
    setState((current) => updater(current));
  }

  const tabActions = createTabActions({
    closeModal: modalState.closeModal,
    setConfirmDialog: modalState.setConfirmDialog,
    setTickerError: modalState.setTickerError,
    state,
    tickerInput: modalState.tickerInput,
    updateState,
  });

  const sectionActions = createSectionActions({
    activeTab,
    closeModal: modalState.closeModal,
    editingSectionId: modalState.editingSectionId,
    sectionInput: modalState.sectionInput,
    setConfirmDialog: modalState.setConfirmDialog,
    setSectionError: modalState.setSectionError,
    updateState,
  });

  const entryActions = createEntryActions({
    activeTab,
    closeModal: modalState.closeModal,
    responseInput: modalState.responseInput,
    responseTarget: modalState.responseTarget,
    setConfirmDialog: modalState.setConfirmDialog,
    updateState,
  });

  const settingActions = createSettingActions({
    activeTab,
    setConfirmDialog: modalState.setConfirmDialog,
    setCopyStatus,
    setHasConsent,
    setState,
    state,
    updateState,
  });

  const value: StateManagerValue = {
    activeTab,
    confirmDialog: modalState.confirmDialog,
    copyStatus,
    editingSectionId: modalState.editingSectionId,
    hasConsent,
    markdownPreview: modalState.markdownPreview,
    modal: modalState.modal,
    page,
    responseInput: modalState.responseInput,
    sectionError: modalState.sectionError,
    sectionInput: modalState.sectionInput,
    state,
    tickerError: modalState.tickerError,
    tickerInput: modalState.tickerInput,
    acceptConsent: settingActions.acceptConsent,
    addEntry: entryActions.addEntry,
    clearConfirmDialog: modalState.clearConfirmDialog,
    closeModal: modalState.closeModal,
    confirmDialogAction: modalState.confirmDialogAction,
    copyPrompt: settingActions.copyPrompt,
    createSection: sectionActions.createSection,
    createTicker: tabActions.createTicker,
    mergeImportedState: settingActions.mergeImportedState,
    openCreateSectionModal: modalState.openCreateSectionModal,
    openMarkdownPreview: modalState.openMarkdownPreview,
    openRenameSection: modalState.openRenameSection,
    openResponseModal: modalState.openResponseModal,
    openTickerModal: modalState.openTickerModal,
    removeEntry: entryActions.removeEntry,
    removeSection: sectionActions.removeSection,
    removeTab: tabActions.removeTab,
    replaceImportedState: settingActions.replaceImportedState,
    requestResetLocalData: settingActions.requestResetLocalData,
    saveResponse: entryActions.saveResponse,
    selectTab: tabActions.selectTab,
    setPage,
    setResponseInput: modalState.setResponseInput,
    setSectionInputValue: modalState.setSectionInputValue,
    setTickerInputValue: modalState.setTickerInputValue,
    toggleAllEntries: entryActions.toggleAllEntries,
    toggleAllSections: sectionActions.toggleAllSections,
    toggleEntry: entryActions.toggleEntry,
    toggleSection: sectionActions.toggleSection,
    toggleTheme: settingActions.toggleTheme,
    updatePromptTemplate: settingActions.updatePromptTemplate,
  };

  return (
    <StateManagerContext.Provider value={value}>
      {children}
    </StateManagerContext.Provider>
  );
}

export function useStateManager() {
  const context = useContext(StateManagerContext);

  if (!context) {
    throw new Error("useStateManager must be used within StateProvider.");
  }

  return context;
}
