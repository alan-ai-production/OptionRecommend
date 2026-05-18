import { useRef, useState } from "react";
import { Download, Settings, Trash2, Upload } from "lucide-react";
import { exportBackup, readBackupFile } from "../backup";
import { ImportChoiceModal } from "../components/Modal";
import { useStateManager } from "../state/StateManager";
import type { AppState } from "../types";

export function SettingsPage() {
  const {
    mergeImportedState,
    replaceImportedState,
    requestResetLocalData,
    state,
    updatePromptTemplate,
  } = useStateManager();
  const importInputRef = useRef<HTMLInputElement | null>(null);
  const [pendingImport, setPendingImport] = useState<AppState | null>(null);
  const [transferStatus, setTransferStatus] = useState<string | null>(null);
  const [transferError, setTransferError] = useState<string | null>(null);

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

    replaceImportedState(pendingImport);
    setPendingImport(null);
    setTransferError(null);
    setTransferStatus("Imported backup and replaced local data.");
  }

  function mergeImportedData() {
    if (!pendingImport) {
      return;
    }

    mergeImportedState(pendingImport);
    setPendingImport(null);
    setTransferError(null);
    setTransferStatus("Imported backup and merged ticker tabs.");
  }

  function resetLocalData() {
    requestResetLocalData(() => {
      setPendingImport(null);
      setTransferError(null);
      setTransferStatus("Local data reset to defaults.");
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
