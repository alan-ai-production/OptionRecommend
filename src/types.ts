export type Theme = "light" | "dark";

export type Entry = {
  id: string;
  createdAt: string;
  responseText: string;
  isCollapsed?: boolean;
};

export type DateSection = {
  id: string;
  label: string;
  createdAt?: string;
  entries: Entry[];
  isCollapsed?: boolean;
};

export type TickerTab = {
  id: string;
  ticker: string;
  sections: DateSection[];
};

export type AppState = {
  tabs: TickerTab[];
  promptTemplate: string;
  theme: Theme;
  activeTabId: string | null;
};

export type ParsedTable = {
  headers: string[];
  rows: string[][];
};

export type ConfirmDialog = {
  title: string;
  message: string;
  confirmLabel: string;
  onConfirm: () => void;
};
