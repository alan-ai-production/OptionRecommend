import type { FormEvent } from "react";
import type { ConfirmDialog, Entry, TickerTab } from "../types";
import type { ResponseTarget, UpdateState } from "./StateTypes";
import { createId } from "./stateUtils";

export function createEntryActions({
  activeTab,
  closeModal,
  responseInput,
  responseTarget,
  setConfirmDialog,
  updateState,
}: {
  activeTab: TickerTab | null;
  closeModal: () => void;
  responseInput: string;
  responseTarget: ResponseTarget | null;
  setConfirmDialog: (dialog: ConfirmDialog | null) => void;
  updateState: UpdateState;
}) {
  function addEntry(sectionId: string) {
    if (!activeTab) {
      return;
    }

    const entry: Entry = {
      id: createId(),
      createdAt: new Date().toISOString(),
      responseText: "",
      isCollapsed: false,
    };

    updateState((current) => ({
      ...current,
      tabs: current.tabs.map((tab) =>
        tab.id === activeTab.id
          ? {
            ...tab,
            sections: tab.sections.map((section) =>
              section.id === sectionId
                ? { ...section, isCollapsed: false, entries: [...section.entries, entry] }
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

  function toggleEntry(sectionId: string, entryId: string) {
    if (!activeTab) {
      return;
    }

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
                  entries: section.entries.map((entry) =>
                    entry.id === entryId
                      ? { ...entry, isCollapsed: !entry.isCollapsed }
                      : entry,
                  ),
                }
                : section,
            ),
          }
          : tab,
      ),
    }));
  }

  function toggleAllEntries(sectionId: string) {
    if (!activeTab) {
      return;
    }

    const targetSection = activeTab.sections.find((section) => section.id === sectionId);
    if (!targetSection || targetSection.entries.length === 0) {
      return;
    }

    const shouldCollapseEntries = targetSection.entries.some((entry) => !entry.isCollapsed);

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
                  isCollapsed: shouldCollapseEntries ? section.isCollapsed : false,
                  entries: section.entries.map((entry) => ({
                    ...entry,
                    isCollapsed: shouldCollapseEntries,
                  })),
                }
                : section,
            ),
          }
          : tab,
      ),
    }));
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

  return {
    addEntry,
    removeEntry,
    saveResponse,
    toggleAllEntries,
    toggleEntry,
  };
}
