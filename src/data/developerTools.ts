import type { CatalogTool } from "../types/tool";
import { routePaths } from "../utils/routes";

export const developerTools: CatalogTool[] = [
  {
    id: "base64-encoder-decoder",
    title: "Base64 Encoder / Decoder",
    description:
      "Encode and decode Base64 strings for quick API and token debugging.",
    category: "Encoding",
    keywords: ["base64", "encode", "decode", "binary"],
    path: routePaths.base64Tool,
    status: "available",
  },
  {
    id: "jwt-decoder",
    title: "JWT Decoder",
    description:
      "Inspect JWT headers and payloads without sending sensitive data away.",
    category: "Security",
    keywords: ["jwt", "token", "claims", "bearer"],
    path: routePaths.jwtDecoderTool,
    status: "available",
  },
  {
    id: "data-formatter",
    title: "Data Formatter",
    description:
      "Format, validate and transform structured data such as JSON, XML and HTML for APIs, integrations, web development and debugging.",
    category: "Data",
    keywords: ["json", "xml", "html", "format", "validate"],
    path: routePaths.formatterTool,
    status: "available",
  },
  {
    id: "configuration-converter",
    title: "Configuration Converter",
    description:
      "Convert Properties to JSON or YAML, and convert between JSON and YAML.",
    category: "Data",
    keywords: ["properties", "yaml", "json", "config", "application settings"],
    path: routePaths.configurationConverter,
    status: "available",
  },
  {
    id: "data-compare",
    title: "Data Compare",
    description: "Compare JSON, XML, YAML, Java, C# and plain text content.",
    category: "Data",
    keywords: ["diff", "compare", "json", "xml", "yaml"],
    path: routePaths.dataCompareTool,
    status: "available",
  },
  {
    id: "uuid-generator",
    title: "UUID Generator",
    description:
      "Generate identifiers for tests, fixtures, migrations, and mock data.",
    category: "Utilities",
    keywords: ["uuid", "guid", "identifier", "random"],
    path: routePaths.uuidTool,
    status: "available",
  },
  {
    id: "regex-tester",
    title: "Regex Tester",
    description:
      "Test regular expressions against sample text and inspect matches.",
    category: "Text",
    keywords: ["regex", "regular expression", "pattern", "match"],
    path: routePaths.regexTesterTool,
    status: "available",
  },
  {
    id: "timestamp-converter",
    title: "Timestamp Converter",
    description:
      "Convert Unix timestamps to human-readable dates and convert dates back to Unix timestamps.",
    category: "Date & Time",
    keywords: ["timestamp", "unix", "epoch", "date", "time"],
    path: routePaths.timestampTool,
    status: "available",
  },
  {
    id: "hash-generator",
    title: "Hash Generator",
    description: "Generate MD5, SHA1, SHA256 and SHA512 hashes.",
    category: "Security",
    keywords: ["hash", "md5", "sha1", "sha256", "sha512"],
    path: routePaths.hashGeneratorTool,
    status: "available",
  },
  {
    id: "url-encoder-decoder",
    title: "URL Encoder / Decoder",
    description:
      "Encode and decode URLs, query parameters and special characters.",
    category: "Encoding",
    keywords: ["url", "uri", "query", "percent encoding"],
    path: routePaths.urlEncoderDecoderTool,
    status: "available",
  },
  {
    id: "pkce-generator",
    title: "PKCE Generator",
    description: "Generate OAuth2 PKCE code verifiers and code challenges.",
    category: "Security",
    keywords: ["pkce", "oauth", "verifier", "challenge"],
    path: routePaths.pkceGeneratorTool,
    status: "available",
  },
];
