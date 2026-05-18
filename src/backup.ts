import { defaultState } from "./storage";
import type { AppState, DateSection, Entry, TickerTab } from "./types";

function createBackupFileName(extension: "orb.gz" | "json") {
  const timestamp = Math.floor(Date.now() / 1000);
  return `option-recommend-backup-${timestamp}.${extension}`;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function normalizeEntry(value: unknown): Entry {
  if (!isRecord(value)) {
    throw new Error("Invalid entry data.");
  }

  const { id, createdAt, responseText, isCollapsed } = value;
  if (typeof id !== "string" || typeof createdAt !== "string" || typeof responseText !== "string") {
    throw new Error("Invalid entry data.");
  }

  return {
    id,
    createdAt,
    responseText,
    isCollapsed: typeof isCollapsed === "boolean" ? isCollapsed : false,
  };
}

function normalizeSection(value: unknown): DateSection {
  if (!isRecord(value)) {
    throw new Error("Invalid section data.");
  }

  const { id, label, createdAt, entries, isCollapsed } = value;
  if (typeof id !== "string" || typeof label !== "string" || !Array.isArray(entries)) {
    throw new Error("Invalid section data.");
  }

  return {
    id,
    label,
    createdAt: typeof createdAt === "string" ? createdAt : undefined,
    entries: entries.map(normalizeEntry),
    isCollapsed: typeof isCollapsed === "boolean" ? isCollapsed : false,
  };
}

function normalizeTab(value: unknown): TickerTab {
  if (!isRecord(value)) {
    throw new Error("Invalid ticker data.");
  }

  const { id, ticker, sections } = value;
  if (typeof id !== "string" || typeof ticker !== "string" || !Array.isArray(sections)) {
    throw new Error("Invalid ticker data.");
  }

  return {
    id,
    ticker,
    sections: sections.map(normalizeSection),
  };
}

export function normalizeBackupState(value: unknown): AppState {
  if (!isRecord(value) || !Array.isArray(value.tabs)) {
    throw new Error("Backup file does not match this app.");
  }

  const tabs = value.tabs.map(normalizeTab);
  const activeTabId =
    typeof value.activeTabId === "string" && tabs.some((tab) => tab.id === value.activeTabId)
      ? value.activeTabId
      : tabs[0]?.id ?? null;

  return {
    tabs,
    promptTemplate:
      typeof value.promptTemplate === "string" ? value.promptTemplate : defaultState.promptTemplate,
    theme: value.theme === "dark" ? "dark" : "light",
    activeTabId,
  };
}

function downloadBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  anchor.click();
  URL.revokeObjectURL(url);
}

export async function exportBackup(state: AppState) {
  const json = JSON.stringify(state);

  if ("CompressionStream" in window) {
    const compressedStream = new Blob([json], {
      type: "application/json",
    })
      .stream()
      .pipeThrough(new CompressionStream("gzip"));
    const blob = await new Response(compressedStream).blob();
    const fileName = createBackupFileName("orb.gz");
    downloadBlob(blob, fileName);
    return { fileName, compressed: true };
  }

  const fileName = createBackupFileName("json");
  downloadBlob(
    new Blob([json], {
      type: "application/json",
    }),
    fileName,
  );
  return { fileName, compressed: false };
}

export async function readBackupFile(file: File): Promise<AppState> {
  const isCompressed = file.name.endsWith(".gz") || file.name.endsWith(".orb.gz");

  if (isCompressed) {
    if (!("DecompressionStream" in window)) {
      throw new Error("Compressed import is not supported in this browser. Import a JSON backup instead.");
    }

    const decompressedStream = file.stream().pipeThrough(new DecompressionStream("gzip"));
    const text = await new Response(decompressedStream).text();
    return normalizeBackupState(JSON.parse(text));
  }

  return normalizeBackupState(JSON.parse(await file.text()));
}
