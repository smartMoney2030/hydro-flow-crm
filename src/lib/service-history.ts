export interface ServiceHistoryEntry {
  id: string;
  detail: string;
  at?: string;
  dateLabel?: string;
}

const months = [
  "january",
  "february",
  "march",
  "april",
  "may",
  "june",
  "july",
  "august",
  "september",
  "october",
  "november",
  "december",
];

const monthPattern = months.join("|");
const historyDatePattern = new RegExp(
  `\\b(?:` +
    `(?<isoYear>(?:19|20)\\d{2})[-/.](?<isoMonth>0?[1-9]|1[0-2])[-/.](?<isoDay>0?[1-9]|[12]\\d|3[01])` +
    `|(?<numericMonth>0?[1-9]|1[0-2])[/-](?<numericDay>0?[1-9]|[12]\\d|3[01])[/-](?<numericYear>(?:19|20)?\\d{2})` +
    `|(?<namedMonth>${monthPattern})\\.?\\s+(?<namedDay>\\d{1,2})(?:st|nd|rd|th)?[,]?\\s+(?<namedYear>(?:19|20)\\d{2})` +
    `|(?<yearFirst>(?:19|20)\\d{2})\\s+(?<yearFirstMonth>${monthPattern})\\.?` +
    `|(?<monthOnly>${monthPattern})\\.?\\s+(?<monthOnlyYear>(?:19|20)\\d{2})` +
    `)\\b`,
  "gi",
);

function validDate(year: string, month: string, day: string) {
  const value = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)));
  if (
    value.getUTCFullYear() !== Number(year) ||
    value.getUTCMonth() !== Number(month) - 1 ||
    value.getUTCDate() !== Number(day)
  ) {
    return undefined;
  }
  return value.toISOString();
}

function monthLabel(year: string, month: string) {
  return new Intl.DateTimeFormat("en-US", { month: "short", year: "numeric" }).format(
    new Date(Date.UTC(Number(year), Number(month) - 1, 1)),
  );
}

function normalizeYear(year: string) {
  if (year.length === 4) return year;
  return String(Number(year) >= 50 ? 1900 + Number(year) : 2000 + Number(year));
}

function dateFromMatch(match: RegExpMatchArray): Pick<ServiceHistoryEntry, "at" | "dateLabel"> {
  const groups = match.groups;
  if (!groups) return {};

  if (groups.isoYear) return { at: validDate(groups.isoYear, groups.isoMonth, groups.isoDay) };
  if (groups.numericYear) {
    return {
      at: validDate(normalizeYear(groups.numericYear), groups.numericMonth, groups.numericDay),
    };
  }
  if (groups.namedYear) {
    return {
      at: validDate(
        groups.namedYear,
        String(months.indexOf(groups.namedMonth.toLowerCase()) + 1),
        groups.namedDay,
      ),
    };
  }

  const year = groups.yearFirst || groups.monthOnlyYear;
  const monthName = groups.yearFirstMonth || groups.monthOnly;
  if (year && monthName) {
    const month = String(months.indexOf(monthName.toLowerCase()) + 1);
    return { at: validDate(year, month, "1"), dateLabel: monthLabel(year, month) };
  }

  return {};
}

export function parseServiceHistory(history?: string): ServiceHistoryEntry[] {
  if (!history?.trim()) return [];

  const dates = Array.from(history.matchAll(historyDatePattern));
  if (dates.length === 0) {
    return history
      .split(/\n+/)
      .map((detail) => detail.trim())
      .filter(Boolean)
      .map((detail, index) => ({ id: `history-${index}`, detail }));
  }

  return dates.map((date, index) => ({
    id: `history-${index}`,
    detail: history.slice(date.index, dates[index + 1]?.index).trim(),
    ...dateFromMatch(date),
  }));
}
