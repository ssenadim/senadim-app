export type CompareFormat = "json" | "xml" | "yaml" | "java" | "csharp" | "text";

export interface CompareOptions {
  ignoreWhitespace: boolean;
  ignoreCase: boolean;
  ignoreFormatting: boolean;
}

export interface Difference {
  line: number;
  left: string;
  right: string;
}

export interface CompareResult {
  isIdentical: boolean;
  differences: Difference[];
  normalizedLeft: string;
  normalizedRight: string;
}

export const compareFormats: Array<{ label: string; value: CompareFormat }> = [
  { label: "JSON", value: "json" },
  { label: "XML", value: "xml" },
  { label: "YAML", value: "yaml" },
  { label: "Java", value: "java" },
  { label: "C#", value: "csharp" },
  { label: "Text", value: "text" },
];

export function supportsIgnoreFormatting(format: CompareFormat) {
  return format === "json" || format === "xml" || format === "yaml";
}

export function compareContent(
  left: string,
  right: string,
  format: CompareFormat,
  options: CompareOptions,
): CompareResult {
  const normalizedLeft = normalizeContent(left, format, options);
  const normalizedRight = normalizeContent(right, format, options);
  const leftLines = normalizedLeft.split("\n");
  const rightLines = normalizedRight.split("\n");
  const maxLines = Math.max(leftLines.length, rightLines.length);
  const differences: Difference[] = [];

  for (let index = 0; index < maxLines; index += 1) {
    const leftLine = leftLines[index] ?? "";
    const rightLine = rightLines[index] ?? "";

    if (leftLine !== rightLine) {
      differences.push({
        line: index + 1,
        left: leftLine,
        right: rightLine,
      });
    }
  }

  return {
    isIdentical: differences.length === 0,
    differences,
    normalizedLeft,
    normalizedRight,
  };
}

function normalizeContent(
  content: string,
  format: CompareFormat,
  options: CompareOptions,
) {
  let normalized = content.replace(/\r\n/g, "\n").trim();

  if (options.ignoreFormatting && supportsIgnoreFormatting(format)) {
    normalized = normalizeFormatting(normalized, format);
  }

  if (options.ignoreWhitespace) {
    normalized = normalized.replace(/\s+/g, "");
  }

  if (options.ignoreCase) {
    normalized = normalized.toLowerCase();
  }

  return normalized;
}

function normalizeFormatting(content: string, format: CompareFormat) {
  if (format === "json") {
    try {
      return JSON.stringify(JSON.parse(content));
    } catch {
      return content.replace(/\s+/g, "");
    }
  }

  if (format === "xml") {
    const parser = new DOMParser();
    const document = parser.parseFromString(content, "application/xml");

    if (document.querySelector("parsererror")) {
      return content.replace(/>\s+</g, "><").trim();
    }

    return new XMLSerializer()
      .serializeToString(document)
      .replace(/>\s+</g, "><")
      .trim();
  }

  return content
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .join("\n");
}
