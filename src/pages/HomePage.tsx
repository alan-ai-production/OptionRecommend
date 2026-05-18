import { CalendarPlus, Check, ChevronsUpDown, ClipboardCopy, FileText, Plus, Trash2 } from "lucide-react";
import { EmptyState } from "../components/EmptyState";
import { SectionCard } from "../components/SectionCard";
import { useStateManager } from "../state/StateManager";

export function HomePage() {
  const {
    activeTab,
    copyPrompt,
    copyStatus,
    openCreateSectionModal,
    openTickerModal,
    removeTab,
    selectTab,
    state,
    toggleAllSections,
  } = useStateManager();

  return (
    <main className="workspace">
      <aside className="ticker-panel">
        <div className="panel-heading">
          <h1>Tab</h1>
          <button className="icon-button soft" onClick={openTickerModal} type="button">
            <Plus aria-hidden="true" />
            <span className="sr-only">Add ticker</span>
          </button>
        </div>

        <div className="ticker-list" role="tablist" aria-label="Ticker tabs">
          {state.tabs.map((tab) => (
            <div className={`ticker-item ${tab.id === activeTab?.id ? "active" : ""}`} key={tab.id}>
              <button
                className="ticker-tab"
                onClick={() => selectTab(tab.id)}
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
                <button
                  className="secondary-button"
                  disabled={activeTab.sections.length === 0}
                  onClick={toggleAllSections}
                  type="button"
                >
                  <ChevronsUpDown aria-hidden="true" />
                  <span>
                    {activeTab.sections.some((section) => !section.isCollapsed)
                      ? "Collapse Sections"
                      : "Expand Sections"}
                  </span>
                </button>
                <button className="secondary-button" onClick={copyPrompt} type="button">
                  {copyStatus === activeTab.ticker ? (
                    <Check aria-hidden="true" />
                  ) : (
                    <ClipboardCopy aria-hidden="true" />
                  )}
                  <span>{copyStatus === activeTab.ticker ? "Copied" : "Copy Prompt"}</span>
                </button>
                <button className="primary-button" onClick={openCreateSectionModal} type="button">
                  <CalendarPlus aria-hidden="true" />
                  <span>Add Section</span>
                </button>
              </div>
            </div>

            <div className="section-list">
              {activeTab.sections.length > 0 ? (
                activeTab.sections.map((section) => (
                  <SectionCard key={section.id} section={section} />
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
  );
}
