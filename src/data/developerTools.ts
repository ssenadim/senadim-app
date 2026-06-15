import type { DeveloperTool } from "../types/tool";
import { routePaths } from "../utils/routes";

export const developerTools: DeveloperTool[] = [
  {
    title: "Base64 Encoder / Decoder",
    description: "Encode and decode Base64 strings for quick API and token debugging.",
    category: "Encoding",
    path: routePaths.base64Tool,
    status: "available",
  },
  {
    title: "JWT Decoder",
    description: "Inspect JWT headers and payloads without sending sensitive data away.",
    category: "Security",
    path: routePaths.jwtDecoderTool,
    status: "available",
  },
  {
    title: "JSON & XML Formatter",
    description:
      "Format, validate, and minify JSON or XML payloads for APIs, integrations, logs, and debugging.",
    category: "Data",
    path: routePaths.formatterTool,
    status: "available",
  },
  {
    title: "Data Compare",
    description: "Compare JSON, XML, YAML, Java, C# and plain text content.",
    category: "Data",
    path: routePaths.dataCompareTool,
    status: "available",
  },
  {
    title: "UUID Generator",
    description: "Generate identifiers for tests, fixtures, migrations, and mock data.",
    category: "Utilities",
    path: routePaths.uuidTool,
    status: "available",
  },
  {
    title: "Regex Tester",
    description: "Test regular expressions against sample text and inspect matches.",
    category: "Text",
    path: routePaths.regexTesterTool,
    status: "available",
  },
  {
    title: "Timestamp Converter",
    description:
      "Convert Unix timestamps to human-readable dates and convert dates back to Unix timestamps.",
    category: "Date & Time",
    path: routePaths.timestampTool,
    status: "available",
  },
  {
    title: "Hash Generator",
    description: "Generate MD5, SHA1, SHA256 and SHA512 hashes.",
    category: "Security",
    path: routePaths.hashGeneratorTool,
    status: "available",
  },
];
