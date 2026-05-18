# Agent Notes: Option Recommend

## Project State

Option Recommend is a frontend-only Vite React + TypeScript app. It has two routes managed through a React Context state manager: Home and Setting. There is no backend, authentication, external API, or server-side data layer.

The app is designed as a local option-recommendation workspace:

- Tabs represent ticker symbols.
- Each ticker contains user-labeled sections, usually date groups.
- Each section contains entries.
- Entries store pasted response text and render the first markdown table found in that response.
- A global prompt template is edited in Setting and copied from the Home toolbar with `{{ticker}}` replaced by the active ticker.

## Important Files

- `src/App.tsx`: shell renderer for navigation, active page, footer, modals, confirmation dialog, and consent modal.
- `src/state/StateManager.tsx`: central React Context provider/hook that composes focused state modules and exposes `useStateManager()`.
- `src/state/TabState.ts`: ticker creation, selection, and removal actions.
- `src/state/SectionState.ts`: section create/rename/save, remove, and section collapse actions.
- `src/state/EntryState.ts`: entry add/remove, entry collapse, bulk entry collapse, and response-save actions.
- `src/state/ModalState.ts`: modal visibility, modal form values/errors, markdown preview, response target, and confirmation dialog state.
- `src/state/SettingState.ts`: theme, consent, prompt copy/update, backup import merge/replace, and reset-data actions.
- `src/state/StateTypes.ts`: shared state manager value and state helper types.
- `src/state/stateUtils.ts`: shared ID, date label, ticker replacement, and import-clone helpers.
- `src/pages/HomePage.tsx`: Home workspace layout, ticker sidebar, active ticker toolbar, and section list wiring.
- `src/pages/SettingsPage.tsx`: prompt template editing, backup export/import, merge/replace import, reset app data through `useStateManager`.
- `src/components/AppNav.tsx`: top navigation, GitHub link, brand button, and theme toggle through `useStateManager`.
- `src/components/AppFooter.tsx`: persistent footer disclaimer.
- `src/components/SectionCard.tsx`: section header/actions, section collapse, section rename trigger, and entry list rendering.
- `src/components/EntryCard.tsx`: entry controls, entry collapse, response actions, and parsed table rendering.
- `src/components/EmptyState.tsx`: shared empty-state presentation.
- `src/components/Modal.tsx`: shared modal components for ticker, section create/rename, response, confirmation, and import choice.
- `src/components/ConsentModal.tsx`: first-visit disclaimer and essential storage acknowledgement.
- `src/components/disclaimer.tsx`: shared financial and AI disclaimer text.
- `src/components/prompt.tsx`: default prompt template.
- `src/storage.ts`: app data localStorage load/save, default state, and compatibility normalization.
- `src/backup.ts`: compressed/minified backup export/import and backup validation.
- `src/consent.ts`: separate consent acknowledgement storage.
- `src/parser.ts`: first markdown table parser for response text.
- `src/styles.css`: global responsive styling, light/dark theme tokens, layout, modal, footer, and settings styles.

## Data And Storage

The app uses browser `localStorage` only.

- `optionRecommend:data`: main typed `AppState`.
- `optionRecommend:consent`: versioned first-visit disclaimer/storage acknowledgement.

Reset Data in Setting clears only `optionRecommend:data`, then restores the default app state. It intentionally keeps `optionRecommend:consent` so the first-visit modal does not immediately reappear.

`src/state/StateManager.tsx` owns the React Context boundary and calls `storage.ts` for persistence. Domain-specific state changes should live in the matching `src/state/*State.ts` file. Components should call `useStateManager()` for state-changing actions instead of passing action handlers down through multiple component layers.

## Core Types

Current state shape is defined in `src/types.ts`:

```ts
type AppState = {
  tabs: TickerTab[];
  promptTemplate: string;
  theme: "light" | "dark";
  activeTabId: string | null;
};
```

Backup imports are validated and normalized before they can replace or merge into current state.

## UX Notes

- The first-visit consent modal is gated: there is no close button; users acknowledge with `I Understand`.
- The footer disclaimer remains visible after acknowledgement.
- Dark mode uses black/charcoal surfaces with green retained as an action/accent color.
- Mobile ticker tabs are fixed-width horizontal scroll items to avoid expanding the page.
- Parsed markdown tables scroll horizontally inside their container.

## Commands

```powershell
npm install
npm run dev
npm run build
npm run preview
```

Use `npm run build` as the main verification command.

## Implementation Preferences

- Keep this frontend-only unless the user explicitly asks for a backend.
- Preserve localStorage compatibility when changing data shape; add normalization/defaults in `storage.ts` or `backup.ts`.
- Prefer small components when `App.tsx` grows.
- Reuse the shared modal system instead of browser `alert` or `confirm`.
- Keep mobile layout constrained and avoid page-level horizontal scrolling.
