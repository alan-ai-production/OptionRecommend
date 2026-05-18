import { useState } from "react";
import type { ConfirmDialog, DateSection, Entry } from "../types";
import type { ModalKind, ResponseTarget } from "./StateTypes";
import { todayLabel } from "./stateUtils";

export function useModalState() {
  const [modal, setModal] = useState<ModalKind>(null);
  const [tickerInput, setTickerInput] = useState("");
  const [sectionInput, setSectionInput] = useState(todayLabel());
  const [tickerError, setTickerError] = useState<string | null>(null);
  const [sectionError, setSectionError] = useState<string | null>(null);
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null);
  const [responseTarget, setResponseTarget] = useState<ResponseTarget | null>(null);
  const [responseInput, setResponseInput] = useState("");
  const [markdownPreview, setMarkdownPreview] = useState("");
  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialog | null>(null);

  function closeModal() {
    setModal(null);
    setTickerInput("");
    setSectionInput(todayLabel());
    setTickerError(null);
    setSectionError(null);
    setEditingSectionId(null);
    setResponseTarget(null);
    setResponseInput("");
    setMarkdownPreview("");
  }

  function openTickerModal() {
    setTickerInput("");
    setModal("ticker");
  }

  function openCreateSectionModal() {
    setSectionInput(todayLabel());
    setEditingSectionId(null);
    setModal("section");
  }

  function openRenameSection(section: DateSection) {
    setEditingSectionId(section.id);
    setSectionInput(section.label);
    setSectionError(null);
    setModal("section");
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

  function setTickerInputValue(value: string) {
    setTickerInput(value);
    setTickerError(null);
  }

  function setSectionInputValue(value: string) {
    setSectionInput(value);
    setSectionError(null);
  }

  function confirmDialogAction() {
    confirmDialog?.onConfirm();
    setConfirmDialog(null);
  }

  return {
    confirmDialog,
    editingSectionId,
    markdownPreview,
    modal,
    responseInput,
    responseTarget,
    sectionError,
    sectionInput,
    tickerError,
    tickerInput,
    closeModal,
    openCreateSectionModal,
    openMarkdownPreview,
    openRenameSection,
    openResponseModal,
    openTickerModal,
    clearConfirmDialog: () => setConfirmDialog(null),
    confirmDialogAction,
    setResponseInput,
    setSectionError,
    setSectionInputValue,
    setConfirmDialog,
    setTickerError,
    setTickerInputValue,
  };
}
