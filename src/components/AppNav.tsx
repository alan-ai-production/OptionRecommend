import { Github, Home, Moon, Settings, Sparkles, Sun } from "lucide-react";
import { useStateManager } from "../state/StateManager";

export function AppNav() {
  const { page, setPage, state, toggleTheme } = useStateManager();

  return (
    <header className="top-bar">
      <div className="brand-group">
        <button className="brand" type="button" onClick={() => setPage("home")}>
          <span className="brand-mark" aria-hidden="true">
            <Sparkles size={30} />
          </span>
          <span>Option Recommend</span>
        </button>

        <a
          className="github-button"
          href="https://github.com/alan-ai-production/OptionRecommend"
          aria-label="GitHub placeholder"
          rel="noreferrer"
          target="_blank"
        >
          <Github aria-hidden="true" />
          <span>Github</span>
        </a>
      </div>

      <nav className="page-tabs" aria-label="Main navigation">
        <button
          className={page === "home" ? "active" : ""}
          onClick={() => setPage("home")}
          type="button"
        >
          <Home aria-hidden="true" />
          <span>Home</span>
        </button>
        <button
          className={page === "settings" ? "active" : ""}
          onClick={() => setPage("settings")}
          type="button"
        >
          <Settings aria-hidden="true" />
          <span>Setting</span>
        </button>
      </nav>

      <div className="header-actions">
        <button className="icon-button" onClick={toggleTheme} type="button">
          {state.theme === "dark" ? <Sun aria-hidden="true" /> : <Moon aria-hidden="true" />}
          <span className="sr-only">Toggle theme</span>
        </button>
      </div>
    </header>
  );
}
