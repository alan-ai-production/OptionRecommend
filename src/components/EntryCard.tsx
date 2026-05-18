import { ChevronDown, ChevronRight, Eye, MessageCircle, Table2, Trash2 } from "lucide-react";
import { parseSummaryMarkdownTable } from "../parser";
import type { Entry, ParsedTable } from "../types";
import { useStateManager } from "../state/StateManager";

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

export function EntryCard({
  entry,
  index,
  sectionId,
}: {
  entry: Entry;
  index: number;
  sectionId: string;
}) {
  const { openMarkdownPreview, openResponseModal, removeEntry, toggleEntry } = useStateManager();
  const table = parseSummaryMarkdownTable(entry.responseText);

  return (
    <section className={`entry-card ${entry.isCollapsed ? "collapsed" : ""}`}>
      <div className="entry-actions">
        <div className="entry-title-row">
          <button
            aria-expanded={!entry.isCollapsed}
            aria-label={`${entry.isCollapsed ? "Expand" : "Collapse"} entry ${index + 1}`}
            className="collapse-button compact"
            onClick={() => toggleEntry(sectionId, entry.id)}
            type="button"
          >
            {entry.isCollapsed ? (
              <ChevronRight aria-hidden="true" />
            ) : (
              <ChevronDown aria-hidden="true" />
            )}
          </button>
          <span className="entry-name">Entry {index + 1}</span>
        </div>
        {!entry.isCollapsed && (
          <>
            <button
              className="action-tile"
              onClick={() => openResponseModal(sectionId, entry)}
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
              onClick={() => removeEntry(sectionId, entry.id)}
              type="button"
            >
              <Trash2 aria-hidden="true" />
              <span>Remove</span>
            </button>
          </>
        )}
      </div>

      {!entry.isCollapsed && (
        <div className="entry-content">
          <ParsedTableView table={table} />
        </div>
      )}
    </section>
  );
}
