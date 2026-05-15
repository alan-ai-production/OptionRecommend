import type { ParsedTable } from "./types";

const separatorPattern = /^\s*\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|?\s*$/;

function splitTableRow(line: string): string[] {
  return line
    .trim()
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((cell) => cell.trim());
}

function parseFirstMarkdownTableFromLines(lines: string[]): ParsedTable | null {
  for (let index = 0; index < lines.length - 1; index += 1) {
    const headerLine = lines[index];
    const separatorLine = lines[index + 1];

    if (!headerLine.includes("|") || !separatorPattern.test(separatorLine)) {
      continue;
    }

    const headers = splitTableRow(headerLine);
    if (headers.length < 2 || headers.some((header) => header.length === 0)) {
      continue;
    }

    const rows: string[][] = [];
    for (let rowIndex = index + 2; rowIndex < lines.length; rowIndex += 1) {
      const rowLine = lines[rowIndex];
      if (!rowLine.includes("|") || rowLine.trim().length === 0) {
        break;
      }

      const row = splitTableRow(rowLine);
      if (row.length !== headers.length) {
        break;
      }

      rows.push(row);
    }

    return { headers, rows };
  }

  return null;
}

export function parseFirstMarkdownTable(text: string): ParsedTable | null {
  return parseFirstMarkdownTableFromLines(text.split(/\r?\n/));
}

export function parseSummaryMarkdownTable(text: string): ParsedTable | null {
  const lines = text.split(/\r?\n/);
  const summaryHeadingIndex = lines.findIndex((line) =>
    /^#{1,6}\s+.*\bsummary\b/i.test(line.trim()),
  );

  if (summaryHeadingIndex === -1) {
    return parseFirstMarkdownTableFromLines(lines);
  }

  return parseFirstMarkdownTableFromLines(lines.slice(summaryHeadingIndex + 1));
}
