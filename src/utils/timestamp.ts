export type TimestampUnit = "seconds" | "milliseconds";
export type TimestampTimezone = "utc" | "local" | "istanbul";

export interface TimestampDateResult {
  unit: TimestampUnit;
  utc: string;
  local: string;
  istanbul: string;
}

export interface DateTimestampResult {
  seconds: string;
  milliseconds: string;
}

export interface TimestampFailure {
  error: string;
}

export type TimestampResult<T> = T | TimestampFailure;

export function isTimestampFailure<T>(
  result: TimestampResult<T>,
): result is TimestampFailure {
  return typeof result === "object" && result !== null && "error" in result;
}

export function convertTimestampToDate(input: string): TimestampResult<TimestampDateResult> {
  const trimmedInput = input.trim();

  if (!trimmedInput) {
    return { error: "Enter a timestamp value before converting." };
  }

  if (!/^-?\d+$/.test(trimmedInput)) {
    return { error: "Timestamp must be a numeric value in seconds or milliseconds." };
  }

  const numericValue = Number(trimmedInput);
  const unit: TimestampUnit = Math.abs(numericValue) >= 100000000000 ? "milliseconds" : "seconds";
  const milliseconds = unit === "seconds" ? numericValue * 1000 : numericValue;
  const date = new Date(milliseconds);

  if (Number.isNaN(date.getTime())) {
    return { error: "Timestamp is outside the supported date range." };
  }

  return {
    unit,
    utc: formatDate(date, "UTC"),
    local: formatDate(date),
    istanbul: formatDate(date, "Europe/Istanbul"),
  };
}

export function convertDateToTimestamp(
  input: string,
  timezone: TimestampTimezone,
): TimestampResult<DateTimestampResult> {
  const trimmedInput = input.trim();

  if (!trimmedInput) {
    return { error: "Enter a date and time before converting." };
  }

  const normalizedInput = normalizeDateInput(trimmedInput);
  const date =
    timezone === "istanbul"
      ? parseIstanbulDate(normalizedInput)
      : new Date(timezone === "utc" ? `${normalizedInput}Z` : normalizedInput);

  if (Number.isNaN(date.getTime())) {
    return {
      error:
        "Invalid date. Use a format like 2025-07-15 15:00:00 or 2025-07-15T15:00:00.",
    };
  }

  return {
    seconds: Math.floor(date.getTime() / 1000).toString(),
    milliseconds: date.getTime().toString(),
  };
}

export function getCurrentTimestamps(): DateTimestampResult {
  const now = Date.now();

  return {
    seconds: Math.floor(now / 1000).toString(),
    milliseconds: now.toString(),
  };
}

export function getUnitLabel(unit: TimestampUnit) {
  return unit === "seconds"
    ? "Unix Timestamp (Seconds)"
    : "Unix Timestamp (Milliseconds)";
}

function normalizeDateInput(input: string) {
  return input.replace(" ", "T");
}

function parseIstanbulDate(input: string) {
  const match = input.match(
    /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?$/,
  );

  if (!match) {
    return new Date(input);
  }

  const [, year, month, day, hour, minute, second = "00"] = match;
  const utcMilliseconds = Date.UTC(
    Number(year),
    Number(month) - 1,
    Number(day),
    Number(hour) - 3,
    Number(minute),
    Number(second),
  );

  return new Date(utcMilliseconds);
}

function formatDate(date: Date, timeZone?: string) {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
    timeZone,
  });

  return formatter.format(date).replace(",", "");
}
