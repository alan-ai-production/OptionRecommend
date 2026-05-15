import type { FormEvent, ReactNode } from "react";
import { useRef } from "react";
import { Check, Plus, Upload, X } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export function Modal({
  title,
  children,
  onClose,
  showCloseButton = true,
  className = "",
}: {
  title: string;
  children: ReactNode;
  onClose: () => void;
  showCloseButton?: boolean;
  className?: string;
}) {
  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <section
        aria-modal="true"
        className={`modal${className ? ` ${className}` : ""}`}
        role="dialog"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="modal-header">
          <h2>{title}</h2>
          {showCloseButton ? (
            <button className="icon-button" onClick={onClose} type="button">
              <X aria-hidden="true" />
              <span className="sr-only">Close</span>
            </button>
          ) : null}
        </div>
        {children}
      </section>
    </div>
  );
}

export function TickerModal({
  value,
  error,
  onChange,
  onClose,
  onSubmit,
}: {
  value: string;
  error: string | null;
  onChange: (value: string) => void;
  onClose: () => void;
  onSubmit: (event: FormEvent) => void;
}) {
  return (
    <Modal title="Create Ticker Tab" onClose={onClose}>
      <form className="modal-form" onSubmit={onSubmit}>
        <label className="field">
          <span>Ticker symbol</span>
          <input
            autoFocus
            maxLength={12}
            onChange={(event) => onChange(event.target.value)}
            placeholder="AAPL"
            value={value}
          />
        </label>
        {error ? <p className="form-error">{error}</p> : null}
        <button className="primary-button full" type="submit">
          <Plus aria-hidden="true" />
          <span>Create Tab</span>
        </button>
      </form>
    </Modal>
  );
}

export function SectionModal({
  value,
  error,
  placeholder,
  onChange,
  onClose,
  onSubmit,
}: {
  value: string;
  error: string | null;
  placeholder: string;
  onChange: (value: string) => void;
  onClose: () => void;
  onSubmit: (event: FormEvent) => void;
}) {
  return (
    <Modal title="Create Section" onClose={onClose}>
      <form className="modal-form" onSubmit={onSubmit}>
        <label className="field">
          <span>Section label</span>
          <input
            autoFocus
            onChange={(event) => onChange(event.target.value)}
            placeholder={placeholder}
            value={value}
          />
        </label>
        {error ? <p className="form-error">{error}</p> : null}
        <button className="primary-button full" type="submit">
          <Plus aria-hidden="true" />
          <span>Create Section</span>
        </button>
      </form>
    </Modal>
  );
}

export function ResponseModal({
  value,
  onChange,
  onClose,
  onSubmit,
}: {
  value: string;
  onChange: (value: string) => void;
  onClose: () => void;
  onSubmit: (event: FormEvent) => void;
}) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  async function importMarkdownFile(file: File | undefined) {
    if (!file) {
      return;
    }

    onChange(await file.text());
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  return (
    <Modal title="Paste Response" onClose={onClose}>
      <form className="modal-form" onSubmit={onSubmit}>
        <div className="modal-inline-actions">
          <button
            className="secondary-button"
            onClick={() => fileInputRef.current?.click()}
            type="button"
          >
            <Upload aria-hidden="true" />
            <span>Upload Markdown</span>
          </button>
          <input
            ref={fileInputRef}
            accept=".md,.markdown,text/markdown,text/plain"
            className="file-input"
            onChange={(event) => importMarkdownFile(event.target.files?.[0])}
            type="file"
          />
        </div>
        <label className="field">
          <span>Response text</span>
          <textarea
            autoFocus
            className="response-area"
            onChange={(event) => onChange(event.target.value)}
            placeholder="Paste a response with a markdown table..."
            value={value}
          />
        </label>
        <button className="primary-button full" type="submit">
          <Check aria-hidden="true" />
          <span>Save Response</span>
        </button>
      </form>
    </Modal>
  );
}

export function MarkdownPreviewModal({
  value,
  onClose,
}: {
  value: string;
  onClose: () => void;
}) {
  return (
    <Modal className="modal-wide" title="Response Preview" onClose={onClose}>
      <div className="markdown-preview">
        {value.trim() ? (
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{value}</ReactMarkdown>
        ) : (
          <p>No response text has been saved for this entry.</p>
        )}
      </div>
    </Modal>
  );
}

export function ConfirmModal({
  title,
  message,
  confirmLabel,
  onCancel,
  onConfirm,
}: {
  title: string;
  message: string;
  confirmLabel: string;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <Modal title={title} onClose={onCancel}>
      <div className="confirm-content">
        <p>{message}</p>
        <div className="confirm-actions">
          <button className="secondary-button" onClick={onCancel} type="button">
            Cancel
          </button>
          <button className="danger-button" onClick={onConfirm} type="button">
            {confirmLabel}
          </button>
        </div>
      </div>
    </Modal>
  );
}

export function ImportChoiceModal({
  tabCount,
  onCancel,
  onMerge,
  onReplace,
}: {
  tabCount: number;
  onCancel: () => void;
  onMerge: () => void;
  onReplace: () => void;
}) {
  return (
    <Modal title="Import Backup" onClose={onCancel}>
      <div className="confirm-content">
        <p>
          This backup contains {tabCount} ticker {tabCount === 1 ? "tab" : "tabs"}. Choose how it should be added to
          this device.
        </p>
        <div className="confirm-actions import-actions">
          <button className="secondary-button" onClick={onCancel} type="button">
            Cancel
          </button>
          <button className="secondary-button" onClick={onMerge} type="button">
            Merge Tickers
          </button>
          <button className="danger-button" onClick={onReplace} type="button">
            Replace All
          </button>
        </div>
      </div>
    </Modal>
  );
}
