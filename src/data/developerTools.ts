import type { DeveloperTool } from "../types/tool";

export const developerTools: DeveloperTool[] = [
  {
    title: "Base64 Encoder / Decoder",
    description: "Encode and decode Base64 strings for quick API and token debugging.",
    category: "Encoding",
  },
  {
    title: "JWT Decoder",
    description: "Inspect JWT headers and payloads without sending sensitive data away.",
    category: "Security",
  },
  {
    title: "JSON Formatter",
    description: "Format, validate, and inspect JSON payloads with a readable structure.",
    category: "Data",
  },
  {
    title: "JSON Compare",
    description: "Compare JSON documents and identify structural or value-level differences.",
    category: "Data",
  },
  {
    title: "UUID Generator",
    description: "Generate identifiers for tests, fixtures, migrations, and mock data.",
    category: "Utilities",
  },
  {
    title: "Regex Tester",
    description: "Test regular expressions against sample strings with clear match feedback.",
    category: "Text",
  },
  {
    title: "Timestamp Converter",
    description: "Convert Unix timestamps and ISO dates across readable formats.",
    category: "Date & Time",
  },
];
