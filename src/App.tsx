import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  CalendarPlus,
  Check,
  ClipboardCopy,
  FileText,
  Github,
  Home,
  MessageCircle,
  Moon,
  Eye,
  Plus,
  Settings,
  Sparkles,
  Sun,
  Table2,
  Trash2,
} from "lucide-react";
import {
  ConfirmModal,
  MarkdownPreviewModal,
  ResponseModal,
  SectionModal,
  TickerModal,
} from "./components/Modal";
import { ConsentModal } from "./components/ConsentModal";
import { SettingsPage } from "./pages/SettingsPage";
import { loadConsent, saveConsent } from "./consent";
import { loadState, saveState } from "./storage";
import type { AppState, ConfirmDialog, DateSection, Entry, ParsedTable, TickerTab } from "./types";
import { parseSummaryMarkdownTable } from "./parser";
import { DISCLAIMER } from "./components/disclaimer";

type Page = "home" | "settings";
type ModalKind = "ticker" | "section" | "response" | "markdown" | null;

type ResponseTarget = {
  sectionId: string;
  entryId: string;
};

function createId() {
  return crypto.randomUUID();
}

function todayLabel() {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date());
}

function replaceTicker(template: string, ticker: string) {
  return template.replaceAll("{{ticker}}", ticker);
}

function EmptyState({ title, detail }: { title: string; detail: string }) {
  return (
    <div className="empty-state">
      <Sparkles aria-hidden="true" />
      <strong>{title}</strong>
      <span>{detail}</span>
    </div>
  );
}

function ParsedTableView({ table }: { table: ParsedTable | null }) {
  if (!table) {
    return (
      <div className="table-empty">
        <Table2 aria-hidden="true" />
        <span>No data to be displayed.</span>
      </div>
    );
  }

  return (
    <div className="table-scroll" aria-label="Parsed response table">
      <table>
        <thead>
          <tr>
            {table.headers.map((header) => (
              <th key={header}>{header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {table.rows.length > 0 ? (
            table.rows.map((row, rowIndex) => (
              <tr key={`${row.join("-")}-${rowIndex}`}>
                {row.map((cell, cellIndex) => (
                  <td key={`${cell}-${cellIndex}`}>{cell}</td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={table.headers.length}>Table headers found, but no rows were provided.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default function App() {
  const [state, setState] = useState<AppState>(() => loadState());
  const [page, setPage] = useState<Page>("home");
  const [modal, setModal] = useState<ModalKind>(null);
  const [tickerInput, setTickerInput] = useState("");
  const [sectionInput, setSectionInput] = useState(todayLabel());
  const [tickerError, setTickerError] = useState<string | null>(null);
  const [sectionError, setSectionError] = useState<string | null>(null);
  const [responseTarget, setResponseTarget] = useState<ResponseTarget | null>(null);
  const [responseInput, setResponseInput] = useState("");
  const [markdownPreview, setMarkdownPreview] = useState("");
  const [copyStatus, setCopyStatus] = useState<string | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialog | null>(null);
  const [hasConsent, setHasConsent] = useState(() => loadConsent() !== null);

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

  function closeModal() {
    setModal(null);
    setTickerInput("");
    setSectionInput(todayLabel());
    setTickerError(null);
    setSectionError(null);
    setResponseTarget(null);
    setResponseInput("");
    setMarkdownPreview("");
  }

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

  function createSection(event: FormEvent) {
    event.preventDefault();
    const label = sectionInput.trim();
    if (!activeTab || !label) {
      setSectionError("Enter a section label.");
      return;
    }

    if (activeTab.sections.some((section) => section.label.toLowerCase() === label.toLowerCase())) {
      setSectionError("That section label already exists for this ticker.");
      return;
    }

    const section: DateSection = {
      id: createId(),
      label,
      entries: [],
    };

    updateState((current) => ({
      ...current,
      tabs: current.tabs.map((tab) =>
        tab.id === activeTab.id ? { ...tab, sections: [...tab.sections, section] } : tab,
      ),
    }));
    closeModal();
  }

  function removeSection(sectionId: string) {
    if (!activeTab) {
      return;
    }

    const sectionToRemove = activeTab.sections.find((section) => section.id === sectionId);
    if (!sectionToRemove) {
      return;
    }

    setConfirmDialog({
      title: `Remove ${sectionToRemove.label}?`,
      message: "This will delete the section and every entry inside it.",
      confirmLabel: "Remove Section",
      onConfirm: () => {
        updateState((current) => ({
          ...current,
          tabs: current.tabs.map((tab) =>
            tab.id === activeTab.id
              ? { ...tab, sections: tab.sections.filter((section) => section.id !== sectionId) }
              : tab,
          ),
        }));
      },
    });
  }

  function addEntry(sectionId: string) {
    if (!activeTab) {
      return;
    }

    const entry: Entry = {
      id: createId(),
      createdAt: new Date().toISOString(),
      responseText: "",
    };

    updateState((current) => ({
      ...current,
      tabs: current.tabs.map((tab) =>
        tab.id === activeTab.id
          ? {
            ...tab,
            sections: tab.sections.map((section) =>
              section.id === sectionId
                ? { ...section, entries: [...section.entries, entry] }
                : section,
            ),
          }
          : tab,
      ),
    }));
  }

  function removeEntry(sectionId: string, entryId: string) {
    if (!activeTab) {
      return;
    }

    setConfirmDialog({
      title: "Remove this entry?",
      message: "This will delete the saved response text and parsed table for this entry.",
      confirmLabel: "Remove Entry",
      onConfirm: () => {
        updateState((current) => ({
          ...current,
          tabs: current.tabs.map((tab) =>
            tab.id === activeTab.id
              ? {
                ...tab,
                sections: tab.sections.map((section) =>
                  section.id === sectionId
                    ? {
                      ...section,
                      entries: section.entries.filter((entry) => entry.id !== entryId),
                    }
                    : section,
                ),
              }
              : tab,
          ),
        }));
      },
    });
  }

  async function copyPrompt() {
    if (!activeTab) {
      return;
    }

    const prompt = replaceTicker(state.promptTemplate, activeTab.ticker);
    await navigator.clipboard.writeText(prompt);
    setCopyStatus(activeTab.ticker);
    window.setTimeout(() => setCopyStatus(null), 1800);
  }

  function openResponseModal(sectionId: string, entry: Entry) {
    setResponseTarget({ sectionId, entryId: entry.id });
    setResponseInput(entry.responseText);
    setModal("response");
  }

  function openMarkdownPreview(entry: Entry) {
    setMarkdownPreview(entry.responseText);
    setModal("markdown");
  }

  function saveResponse(event: FormEvent) {
    event.preventDefault();
    if (!activeTab || !responseTarget) {
      return;
    }

    updateState((current) => ({
      ...current,
      tabs: current.tabs.map((tab) =>
        tab.id === activeTab.id
          ? {
            ...tab,
            sections: tab.sections.map((section) =>
              section.id === responseTarget.sectionId
                ? {
                  ...section,
                  entries: section.entries.map((entry) =>
                    entry.id === responseTarget.entryId
                      ? { ...entry, responseText: responseInput }
                      : entry,
                  ),
                }
                : section,
            ),
          }
          : tab,
      ),
    }));
    closeModal();
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

  return (
    <div className="app-shell">
      <header className="top-bar">
        <div className="brand-group">
          <button className="brand" type="button" onClick={() => setPage("home")}>
            <span className="brand-mark" aria-hidden="true">
              <Sparkles size={30} />
            </span>
            <span>Option Recommend</span>
          </button>

          <a
            className="github-button"
            href="https://github.com/alan-ai-production/OptionRecommend"
            aria-label="GitHub placeholder"
            rel="noreferrer"
            target="_blank"
          >
            <Github aria-hidden="true" />
            <span>Github</span>
          </a>
        </div>

        <nav className="page-tabs" aria-label="Main navigation">
          <button
            className={page === "home" ? "active" : ""}
            onClick={() => setPage("home")}
            type="button"
          >
            <Home aria-hidden="true" />
            <span>Home</span>
          </button>
          <button
            className={page === "settings" ? "active" : ""}
            onClick={() => setPage("settings")}
            type="button"
          >
            <Settings aria-hidden="true" />
            <span>Setting</span>
          </button>
        </nav>

        <div className="header-actions">
          <button className="icon-button" onClick={toggleTheme} type="button">
            {state.theme === "dark" ? <Sun aria-hidden="true" /> : <Moon aria-hidden="true" />}
            <span className="sr-only">Toggle theme</span>
          </button>
        </div>
      </header>

      {page === "home" ? (
        <main className="workspace">
          <aside className="ticker-panel">
            <div className="panel-heading">
              <h1>Tab</h1>
              <button
                className="icon-button soft"
                onClick={() => {
                  setTickerInput("");
                  setModal("ticker");
                }}
                type="button"
              >
                <Plus aria-hidden="true" />
                <span className="sr-only">Add ticker</span>
              </button>
            </div>

            <div className="ticker-list" role="tablist" aria-label="Ticker tabs">
              {state.tabs.map((tab) => (
                <div className={`ticker-item ${tab.id === activeTab?.id ? "active" : ""}`} key={tab.id}>
                  <button
                    className="ticker-tab"
                    onClick={() => updateState((current) => ({ ...current, activeTabId: tab.id }))}
                    role="tab"
                    type="button"
                  >
                    <FileText aria-hidden="true" />
                    <span>{tab.ticker}</span>
                  </button>
                  <button
                    className="tab-trash-button"
                    onClick={() => removeTab(tab.id)}
                    type="button"
                    aria-label={`Remove ${tab.ticker}`}
                  >
                    <Trash2 aria-hidden="true" size={18} />
                  </button>
                </div>
              ))}
            </div>
          </aside>

          <section className="content-panel">
            {activeTab ? (
              <>
                <div className="content-toolbar">
                  <div className="title-card">
                    <span className="round-icon">
                      <FileText aria-hidden="true" />
                    </span>
                    <div>
                      <span className="eyebrow">Ticker</span>
                      <h2>{activeTab.ticker}</h2>
                    </div>
                  </div>

                  <div className="toolbar-actions">
                    <button className="secondary-button" onClick={copyPrompt} type="button">
                      {copyStatus === activeTab.ticker ? (
                        <Check aria-hidden="true" />
                      ) : (
                        <ClipboardCopy aria-hidden="true" />
                      )}
                      <span>{copyStatus === activeTab.ticker ? "Copied" : "Copy Prompt"}</span>
                    </button>
                    <button
                      className="primary-button"
                      onClick={() => {
                        setSectionInput(todayLabel());
                        setModal("section");
                      }}
                      type="button"
                    >
                      <CalendarPlus aria-hidden="true" />
                      <span>Add Section</span>
                    </button>
                  </div>
                </div>

                <div className="section-list">
                  {activeTab.sections.length > 0 ? (
                    activeTab.sections.map((section) => (
                      <article className="section-card" key={section.id}>
                        <div className="section-header">
                          <div className="section-title">
                            <span className="round-icon">
                              <FileText aria-hidden="true" />
                            </span>
                            <h3>{section.label}</h3>
                          </div>
                          <div className="section-actions">
                            <button
                              className="secondary-button"
                              onClick={() => addEntry(section.id)}
                              type="button"
                            >
                              <Plus aria-hidden="true" />
                              <span>Add Entry</span>
                            </button>
                            <button
                              className="danger-button"
                              onClick={() => removeSection(section.id)}
                              type="button"
                            >
                              <Trash2 aria-hidden="true" />
                              <span>Remove Section</span>
                            </button>
                          </div>
                        </div>

                        <div className="entry-list">
                          {section.entries.length > 0 ? (
                            section.entries.map((entry, index) => {
                              const table = parseSummaryMarkdownTable(entry.responseText);

                              return (
                                <section className="entry-card" key={entry.id}>
                                  <div className="entry-actions">
                                    <span className="entry-name">Entry {index + 1}</span>
                                    <button
                                      className="action-tile"
                                      onClick={() => openResponseModal(section.id, entry)}
                                      type="button"
                                    >
                                      <MessageCircle aria-hidden="true" />
                                      <span>Response</span>
                                    </button>
                                    <button
                                      className="action-tile"
                                      disabled={!entry.responseText.trim()}
                                      onClick={() => openMarkdownPreview(entry)}
                                      type="button"
                                    >
                                      <Eye aria-hidden="true" />
                                      <span>View</span>
                                    </button>
                                    <button
                                      className="danger-button compact"
                                      onClick={() => removeEntry(section.id, entry.id)}
                                      type="button"
                                    >
                                      <Trash2 aria-hidden="true" />
                                      <span>Remove</span>
                                    </button>
                                  </div>

                                  <div className="entry-content">
                                    <ParsedTableView table={table} />
                                  </div>
                                </section>
                              );
                            })
                          ) : (
                            <EmptyState
                              title="No entries yet"
                              detail="Add an entry to copy the prompt and paste a response."
                            />
                          )}
                        </div>
                      </article>
                    ))
                  ) : (
                    <EmptyState
                      title="No sections yet"
                      detail="Add a section label, then create entries inside it."
                    />
                  )}
                </div>
              </>
            ) : (
              <EmptyState
                title="Create your first ticker"
                detail="Use the plus button in the tab panel to start a recommendation workspace."
              />
            )}
          </section>
        </main>
      ) : (
        <SettingsPage
          setConfirmDialog={setConfirmDialog}
          setState={setState}
          state={state}
        />
      )}

      <footer className="site-footer">
        <section className="footer-disclaimer" aria-label="Disclaimer">
          <h2>Disclaimer</h2>
          <p>
            {DISCLAIMER}
          </p>
        </section>
      </footer>

      {modal === "ticker" && (
        <TickerModal
          error={tickerError}
          value={tickerInput}
          onChange={(value) => {
            setTickerInput(value);
            setTickerError(null);
          }}
          onClose={closeModal}
          onSubmit={createTicker}
        />
      )}

      {modal === "section" && (
        <SectionModal
          error={sectionError}
          placeholder={todayLabel()}
          value={sectionInput}
          onChange={(value) => {
            setSectionInput(value);
            setSectionError(null);
          }}
          onClose={closeModal}
          onSubmit={createSection}
        />
      )}

      {modal === "response" && (
        <ResponseModal
          value={responseInput}
          onChange={setResponseInput}
          onClose={closeModal}
          onSubmit={saveResponse}
        />
      )}

      {modal === "markdown" && (
        <MarkdownPreviewModal
          value={markdownPreview}
          onClose={closeModal}
        />
      )}

      {confirmDialog && (
        <ConfirmModal
          confirmLabel={confirmDialog.confirmLabel}
          message={confirmDialog.message}
          title={confirmDialog.title}
          onCancel={() => setConfirmDialog(null)}
          onConfirm={() => {
            confirmDialog.onConfirm();
            setConfirmDialog(null);
          }}
        />
      )}

      {!hasConsent && <ConsentModal onAccept={acceptConsent} />}

    </div>
  );
}
