import type { Dispatch, FormEvent, SetStateAction } from "react";
import type { AppState, ConfirmDialog, DateSection, Entry, Page, TickerTab } from "../types";

export type ModalKind = "ticker" | "section" | "response" | "markdown" | null;

export type ResponseTarget = {
  sectionId: string;
  entryId: string;
};

export type UpdateState = (updater: (current: AppState) => AppState) => void;

export type StateManagerValue = {
  activeTab: TickerTab | null;
  confirmDialog: ConfirmDialog | null;
  copyStatus: string | null;
  editingSectionId: string | null;
  hasConsent: boolean;
  markdownPreview: string;
  modal: ModalKind;
  page: Page;
  responseInput: string;
  sectionError: string | null;
  sectionInput: string;
  state: AppState;
  tickerError: string | null;
  tickerInput: string;
  acceptConsent: () => void;
  addEntry: (sectionId: string) => void;
  clearConfirmDialog: () => void;
  closeModal: () => void;
  confirmDialogAction: () => void;
  copyPrompt: () => Promise<void>;
  createSection: (event: FormEvent) => void;
  createTicker: (event: FormEvent) => void;
  mergeImportedState: (importedState: AppState) => void;
  openCreateSectionModal: () => void;
  openMarkdownPreview: (entry: Entry) => void;
  openRenameSection: (section: DateSection) => void;
  openResponseModal: (sectionId: string, entry: Entry) => void;
  openTickerModal: () => void;
  removeEntry: (sectionId: string, entryId: string) => void;
  removeSection: (sectionId: string) => void;
  removeTab: (tabId: string) => void;
  replaceImportedState: (importedState: AppState) => void;
  requestResetLocalData: (onReset?: () => void) => void;
  saveResponse: (event: FormEvent) => void;
  selectTab: (tabId: string) => void;
  setPage: (page: Page) => void;
  setResponseInput: Dispatch<SetStateAction<string>>;
  setSectionInputValue: (value: string) => void;
  setTickerInputValue: (value: string) => void;
  toggleAllEntries: (sectionId: string) => void;
  toggleAllSections: () => void;
  toggleEntry: (sectionId: string, entryId: string) => void;
  toggleSection: (sectionId: string) => void;
  toggleTheme: () => void;
  updatePromptTemplate: (promptTemplate: string) => void;
};
