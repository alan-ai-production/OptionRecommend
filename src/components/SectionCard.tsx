import { ChevronDown, ChevronRight, ChevronsUpDown, FileText, Plus, Trash2 } from "lucide-react";
import type { DateSection } from "../types";
import { useStateManager } from "../state/StateManager";
import { EmptyState } from "./EmptyState";
import { EntryCard } from "./EntryCard";

export function SectionCard({ section }: { section: DateSection }) {
  const {
    addEntry,
    openRenameSection,
    removeSection,
    toggleAllEntries,
    toggleSection,
  } = useStateManager();
  const hasEntries = section.entries.length > 0;
  const hasExpandedEntries = section.entries.some((entry) => !entry.isCollapsed);
  const bulkEntryLabel = hasExpandedEntries ? "Collapse Entries" : "Expand Entries";

  return (
    <article className="section-card">
      <div className="section-header">
        <div className="section-title">
          <button
            aria-expanded={!section.isCollapsed}
            aria-label={`${section.isCollapsed ? "Expand" : "Collapse"} ${section.label}`}
            className="collapse-button"
            onClick={() => toggleSection(section.id)}
            type="button"
          >
            {section.isCollapsed ? (
              <ChevronRight aria-hidden="true" />
            ) : (
              <ChevronDown aria-hidden="true" />
            )}
          </button>
          <span className="round-icon">
            <FileText aria-hidden="true" />
          </span>
          <h3 onDoubleClick={() => openRenameSection(section)} title="Double click to rename">
            {section.label}
          </h3>
        </div>
        <div className="section-actions">
          <button
            className="secondary-button"
            disabled={!hasEntries}
            onClick={() => toggleAllEntries(section.id)}
            type="button"
          >
            <ChevronsUpDown aria-hidden="true" />
            <span>{bulkEntryLabel}</span>
          </button>
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

      {!section.isCollapsed && (
        <div className="entry-list">
          {section.entries.length > 0 ? (
            section.entries.map((entry, index) => (
              <EntryCard
                entry={entry}
                index={index}
                key={entry.id}
                sectionId={section.id}
              />
            ))
          ) : (
            <EmptyState
              title="No entries yet"
              detail="Add an entry to copy the prompt and paste a response."
            />
          )}
        </div>
      )}
    </article>
  );
}
