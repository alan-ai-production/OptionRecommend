import {
  ConfirmModal,
  MarkdownPreviewModal,
  ResponseModal,
  SectionModal,
  TickerModal,
} from "./components/Modal";
import { AppFooter } from "./components/AppFooter";
import { AppNav } from "./components/AppNav";
import { ConsentModal } from "./components/ConsentModal";
import { HomePage } from "./pages/HomePage";
import { SettingsPage } from "./pages/SettingsPage";
import { useStateManager } from "./state/StateManager";

export default function App() {
  const {
    acceptConsent,
    clearConfirmDialog,
    closeModal,
    confirmDialog,
    confirmDialogAction,
    createSection,
    createTicker,
    editingSectionId,
    hasConsent,
    markdownPreview,
    modal,
    page,
    responseInput,
    saveResponse,
    sectionError,
    sectionInput,
    setResponseInput,
    setSectionInputValue,
    setTickerInputValue,
    tickerError,
    tickerInput,
  } = useStateManager();

  return (
    <div className="app-shell">
      <AppNav />

      {page === "home" ? <HomePage /> : <SettingsPage />}

      <AppFooter />

      {modal === "ticker" && (
        <TickerModal
          error={tickerError}
          value={tickerInput}
          onChange={setTickerInputValue}
          onClose={closeModal}
          onSubmit={createTicker}
        />
      )}

      {modal === "section" && (
        <SectionModal
          error={sectionError}
          placeholder={new Intl.DateTimeFormat("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          }).format(new Date())}
          submitIcon={editingSectionId ? "check" : "plus"}
          submitLabel={editingSectionId ? "Save Section" : "Create Section"}
          title={editingSectionId ? "Rename Section" : "Create Section"}
          value={sectionInput}
          onChange={setSectionInputValue}
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
          onCancel={clearConfirmDialog}
          onConfirm={confirmDialogAction}
        />
      )}

      {!hasConsent && <ConsentModal onAccept={acceptConsent} />}
    </div>
  );
}
