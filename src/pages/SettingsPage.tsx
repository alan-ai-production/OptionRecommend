import { useRef, useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import { Download, Settings, Trash2, Upload } from "lucide-react";
import { exportBackup, readBackupFile } from "../backup";
import { ImportChoiceModal } from "../components/Modal";
import { defaultState, STORAGE_KEY } from "../storage";
import type { AppState, ConfirmDialog, TickerTab } from "../types";

function createId() {
  return crypto.randomUUID();
}

function createUniqueTicker(ticker: string, usedTickers: Set<string>) {
  let candidate = ticker;
  let suffix = 2;

  while (usedTickers.has(candidate.toLowerCase())) {
    candidate = `${ticker}-${suffix}`;
    suffix += 1;
  }

  usedTickers.add(candidate.toLowerCase());
  return candidate;
}

function cloneImportedTab(tab: TickerTab, ticker: string): TickerTab {
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

export function SettingsPage({
  state,
  setState,
  setConfirmDialog,
}: {
  state: AppState;
  setState: Dispatch<SetStateAction<AppState>>;
  setConfirmDialog: Dispatch<SetStateAction<ConfirmDialog | null>>;
}) {
  const importInputRef = useRef<HTMLInputElement | null>(null);
  const [pendingImport, setPendingImport] = useState<AppState | null>(null);
  const [transferStatus, setTransferStatus] = useState<string | null>(null);
  const [transferError, setTransferError] = useState<string | null>(null);

  function updatePromptTemplate(promptTemplate: string) {
    setState((current) => ({ ...current, promptTemplate }));
  }

  async function handleExportBackup() {
    setTransferError(null);
    setTransferStatus("Preparing backup...");

    try {
      const result = await exportBackup(state);
      setTransferStatus(
        result.compressed
          ? `Exported compressed backup: ${result.fileName}`
          : `Exported JSON backup: ${result.fileName}`,
      );
    } catch {
      setTransferStatus(null);
      setTransferError("Could not export backup. Try again in this browser.");
    }
  }

  async function handleImportBackup(file: File | undefined) {
    if (!file) {
      return;
    }

    setTransferError(null);
    setTransferStatus("Reading backup...");

    try {
      const importedState = await readBackupFile(file);
      setPendingImport(importedState);
      setTransferStatus(`Backup ready: ${importedState.tabs.length} ticker tabs found.`);
    } catch (error) {
      setPendingImport(null);
      setTransferStatus(null);
      setTransferError(error instanceof Error ? error.message : "Could not import backup file.");
    } finally {
      if (importInputRef.current) {
        importInputRef.current.value = "";
      }
    }
  }

  function replaceWithImportedData() {
    if (!pendingImport) {
      return;
    }

    setState(pendingImport);
    setPendingImport(null);
    setTransferError(null);
    setTransferStatus("Imported backup and replaced local data.");
  }

  function mergeImportedData() {
    if (!pendingImport) {
      return;
    }

    setState((current) => {
      const usedTickers = new Set(current.tabs.map((tab) => tab.ticker.toLowerCase()));
      const importedTabs = pendingImport.tabs.map((tab) =>
        cloneImportedTab(tab, createUniqueTicker(tab.ticker, usedTickers)),
      );

      return {
        ...current,
        tabs: [...current.tabs, ...importedTabs],
        activeTabId: current.activeTabId ?? current.tabs[0]?.id ?? importedTabs[0]?.id ?? null,
      };
    });
    setPendingImport(null);
    setTransferError(null);
    setTransferStatus("Imported backup and merged ticker tabs.");
  }

  function resetLocalData() {
    setConfirmDialog({
      title: "Reset local data?",
      message:
        "This will clear this app's saved tabs, sections, entries, prompt template, theme, and restore the default state.",
      confirmLabel: "Reset Data",
      onConfirm: () => {
        localStorage.removeItem(STORAGE_KEY);
        setPendingImport(null);
        setTransferError(null);
        setTransferStatus("Local data reset to defaults.");
        setState({
          ...defaultState,
          tabs: [],
          activeTabId: null,
        });
      },
    });
  }

  return (
    <main className="settings-page">
      <section className="settings-panel">
        <div className="settings-heading">
          <span className="round-icon">
            <Settings aria-hidden="true" />
          </span>
          <div>
            <span className="eyebrow">Prompt Defaults</span>
            <h1>Global Prompt Template</h1>
          </div>
        </div>
        <label className="field">
          <span>Prompt template</span>
          <textarea
            value={state.promptTemplate}
            onChange={(event) => updatePromptTemplate(event.target.value)}
            spellCheck="true"
          />
        </label>
        <p className="hint">
          Use <code>{"{{ticker}}"}</code> where the active ticker symbol should appear.
        </p>

        <div className="transfer-panel">
          <div>
            <span className="eyebrow">Data Transfer</span>
            <h2>Backup Local Data</h2>
            <p>Export a compact backup file or import one from another device.</p>
          </div>
          <div className="transfer-actions">
            <button className="secondary-button" onClick={handleExportBackup} type="button">
              <Download aria-hidden="true" />
              <span>Export Backup</span>
            </button>
            <button
              className="primary-button"
              onClick={() => importInputRef.current?.click()}
              type="button"
            >
              <Upload aria-hidden="true" />
              <span>Import Backup</span>
            </button>
            <button className="danger-button" onClick={resetLocalData} type="button">
              <Trash2 aria-hidden="true" />
              <span>Reset Data</span>
            </button>
            <input
              ref={importInputRef}
              accept=".orb.gz,.gz,.json,application/json"
              className="file-input"
              onChange={(event) => handleImportBackup(event.target.files?.[0])}
              type="file"
            />
          </div>
          {transferStatus ? <p className="transfer-status">{transferStatus}</p> : null}
          {transferError ? <p className="transfer-status error">{transferError}</p> : null}
        </div>
      </section>

      {pendingImport && (
        <ImportChoiceModal
          tabCount={pendingImport.tabs.length}
          onCancel={() => {
            setPendingImport(null);
            setTransferStatus(null);
          }}
          onMerge={mergeImportedData}
          onReplace={replaceWithImportedData}
        />
      )}
    </main>
  );
}
