# Option Recommend

Option Recommend is a browser-only workspace for organizing option recommendation prompts and pasted AI responses by ticker, date group, and entry.

All data is stored on your device in browser local storage. There is no backend account, sync service, or external API connection.

## Features

- Create ticker tabs such as `AAPL`, `TSLA`, or `SPY`.
- Add labeled sections inside each ticker, commonly used as date groups.
- Add entries inside each section.
- Copy a global prompt template with `{{ticker}}` replaced by the selected ticker.
- Paste response text into an entry.
- Automatically extract and display the first markdown table found in a response.
- Edit the global prompt template in Setting.
- Export and import local data backups.
- Merge imported tickers or replace all local data.
- Reset local app data to defaults.
- Toggle light and dark theme.
- First-visit disclaimer and essential local storage acknowledgement.

## Getting Started

Install dependencies:

```powershell
npm install
```

Run the development server:

```powershell
npm run dev
```

Build the static site:

```powershell
npm run build
```

Preview the production build:

```powershell
npm run preview
```

## How To Use

1. Open the app and acknowledge the first-visit disclaimer and storage notice.
2. Click the plus button in the Tab panel to create a ticker tab.
3. Use `Add Section` to create a labeled group, such as a date.
4. Click `Add Entry` inside a section.
5. Click `Copy Prompt` to copy the global prompt for the selected ticker.
6. Paste the copied prompt into your AI tool or research workflow.
7. Paste the response into an entry using the `Response` button.
8. If the response contains a markdown table, the app shows it in the entry.

## Response Table Format

The app extracts the first markdown table in the response. Example:

```md
| Risk Type | Strategy | Strike | Expiry | Entry Price Range | Stop Loss Range | Profit Target | Important notes |
| --- | --- | --- | --- | --- | --- | --- | --- |
```

If no valid markdown table is found, the response text is still saved, but the table area shows an empty state.

## Settings

The Setting page contains:

- Global prompt template editor.
- `{{ticker}}` placeholder support.
- Export backup.
- Import backup.
- Reset local app data.

## Backup And Transfer

Use `Export Backup` to download a backup of this app's local data.

- Modern browsers export a compressed `.orb.gz` file.
- Browsers without compression support export minified `.json`.
- Backup filenames include a Unix timestamp.

Use `Import Backup` to load a backup on the same or another device.

- `Replace All` replaces all current app data with the backup.
- `Merge Tickers` keeps current data and adds imported tickers.
- Duplicate imported ticker names are renamed with suffixes such as `AAPL-2`.

## Local Storage

The app uses browser local storage for essential app behavior:

- Saved tickers, sections, entries, and responses.
- Prompt template.
- Theme preference.
- Backup/import workflow state.
- First-visit acknowledgement.

The app does not use tracking cookies.

## Disclaimer

Option Recommend is for informational and educational purposes only. It does not provide financial, investment, legal, or tax advice and is not a recommendation to buy, sell, or hold any security, option, or financial product.

Trading options involves risk, including possible loss of principal. AI-generated content and pasted responses may be inaccurate, incomplete, outdated, or misleading. Always verify information independently, do your own research, and consult a qualified financial professional before making investment decisions.
