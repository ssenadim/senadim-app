export type RegexFlag = "g" | "i" | "m" | "s";

export interface RegexMatch {
  value: string;
  index: number;
  endIndex: number;
}

export interface RegexResult {
  matches: RegexMatch[];
}

export interface RegexFailure {
  error: string;
}

export type RegexTestResult = RegexResult | RegexFailure;

export const regexFlags: Array<{ label: string; value: RegexFlag }> = [
  { label: "g", value: "g" },
  { label: "i", value: "i" },
  { label: "m", value: "m" },
  { label: "s", value: "s" },
];

export const commonPatterns = [
  { label: "Email", pattern: "[\\w.-]+@[\\w.-]+\\.\\w+" },
  { label: "URL", pattern: "https?:\\/\\/[^\\s]+" },
  { label: "UUID", pattern: "[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}" },
  { label: "JWT", pattern: "eyJ[A-Za-z0-9_-]+\\.[A-Za-z0-9_-]+\\.[A-Za-z0-9_-]+" },
  { label: "IPv4", pattern: "\\b(?:\\d{1,3}\\.){3}\\d{1,3}\\b" },
  { label: "IPv6", pattern: "\\b(?:[0-9a-fA-F]{1,4}:){2,7}[0-9a-fA-F]{1,4}\\b" },
  { label: "Strong Password", pattern: "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[^A-Za-z\\d]).{8,}$" },
  { label: "Turkish Mobile Number", pattern: "^(?:\\+90|0)?5\\d{9}$" },
  { label: "TCKN", pattern: "^[1-9]\\d{10}$" },
];

export function isRegexFailure(result: RegexTestResult): result is RegexFailure {
  return "error" in result;
}

export function testRegex(
  pattern: string,
  text: string,
  flags: RegexFlag[],
): RegexTestResult {
  if (!pattern.trim()) {
    return { error: "Enter a regex pattern before testing." };
  }

  if (!text) {
    return { error: "Enter test text before running the regex." };
  }

  try {
    const normalizedFlags = Array.from(new Set(["g", ...flags])).join("");
    const regex = new RegExp(pattern, normalizedFlags);
    const matches: RegexMatch[] = [];
    let match = regex.exec(text);

    while (match) {
      matches.push({
        value: match[0],
        index: match.index,
        endIndex: match.index + match[0].length,
      });

      if (match[0] === "") {
        regex.lastIndex += 1;
      }

      match = regex.exec(text);
    }

    return { matches };
  } catch (error) {
    return {
      error:
        error instanceof Error
          ? `Invalid regex syntax. ${error.message}`
          : "Invalid regex syntax.",
    };
  }
}
