import type { FormEvent } from "react";
import type { AppState, ConfirmDialog, DateSection, TickerTab } from "../types";
import type { UpdateState } from "./StateTypes";
import { createId } from "./stateUtils";

export function createSectionActions({
  activeTab,
  closeModal,
  editingSectionId,
  sectionInput,
  setConfirmDialog,
  setSectionError,
  updateState,
}: {
  activeTab: TickerTab | null;
  closeModal: () => void;
  editingSectionId: string | null;
  sectionInput: string;
  setConfirmDialog: (dialog: ConfirmDialog | null) => void;
  setSectionError: (error: string | null) => void;
  updateState: UpdateState;
}) {
  function createSection(event: FormEvent) {
    event.preventDefault();
    const label = sectionInput.trim();
    if (!activeTab || !label) {
      setSectionError("Enter a section label.");
      return;
    }

    if (
      activeTab.sections.some(
        (section) =>
          section.id !== editingSectionId && section.label.toLowerCase() === label.toLowerCase(),
      )
    ) {
      setSectionError("That section label already exists for this ticker.");
      return;
    }

    if (editingSectionId) {
      updateState((current) => ({
        ...current,
        tabs: current.tabs.map((tab) =>
          tab.id === activeTab.id
            ? {
              ...tab,
              sections: tab.sections.map((section) =>
                section.id === editingSectionId ? { ...section, label } : section,
              ),
            }
            : tab,
        ),
      }));
      closeModal();
      return;
    }

    const section: DateSection = {
      id: createId(),
      label,
      createdAt: new Date().toISOString(),
      entries: [],
      isCollapsed: false,
    };

    updateState((current) => ({
      ...current,
      tabs: current.tabs.map((tab) =>
        tab.id === activeTab.id ? { ...tab, sections: [section, ...tab.sections] } : tab,
      ),
    }));
    closeModal();
  }

  function toggleSection(sectionId: string) {
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
                ? { ...section, isCollapsed: !section.isCollapsed }
                : section,
            ),
          }
          : tab,
      ),
    }));
  }

  function toggleAllSections() {
    if (!activeTab || activeTab.sections.length === 0) {
      return;
    }

    const shouldCollapseSections = activeTab.sections.some((section) => !section.isCollapsed);

    updateState((current: AppState) => ({
      ...current,
      tabs: current.tabs.map((tab) =>
        tab.id === activeTab.id
          ? {
            ...tab,
            sections: tab.sections.map((section) => ({
              ...section,
              isCollapsed: shouldCollapseSections,
            })),
          }
          : tab,
      ),
    }));
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

  return {
    createSection,
    removeSection,
    toggleAllSections,
    toggleSection,
  };
}
