import { routePaths } from "../utils/routes";

export const siteMetadata = {
  name: "Freeshot",
  url: "https://freeshot.online",
  socialImageUrl: "https://freeshot.online/freeshot.svg",
} as const;

export interface PageMetadata {
  canonicalPath: string;
  description: string;
  documentTitle: string;
  noIndex?: boolean;
}

export const pageMetadataByTitle: Record<string, PageMetadata> = {
  Home: {
    canonicalPath: routePaths.home,
    documentTitle:
      "Freeshot | Architecture, Platform Engineering and Developer Tools",
    description:
      "Freeshot is a lightweight engineering toolkit for developer productivity, platform engineering, architecture design and practical daily workflows.",
  },
  "About Freeshot": {
    canonicalPath: routePaths.about,
    documentTitle: "About Freeshot | Engineering Toolkit",
    description:
      "Learn how Freeshot helps software engineers, platform engineers and architects solve practical problems with lightweight, vendor-neutral tools.",
  },
  "Developer Tools": {
    canonicalPath: routePaths.developerTools,
    documentTitle: "Developer Productivity Tools | Freeshot",
    description:
      "Explore browser-based developer tools for encoding, formatting, comparison, security, identifiers, timestamps and everyday engineering tasks.",
  },
  "Base64 Encoder / Decoder": {
    canonicalPath: routePaths.base64Tool,
    documentTitle: "Base64 Encoder and Decoder | Freeshot",
    description:
      "Encode text to Base64 or decode Base64 values locally in your browser for API, token and integration troubleshooting.",
  },
  "UUID Generator": {
    canonicalPath: routePaths.uuidTool,
    documentTitle: "UUID Generator | Freeshot",
    description:
      "Generate UUID values in your browser for tests, fixtures, migrations, mock data and application development workflows.",
  },
  "Data Formatter": {
    canonicalPath: routePaths.formatterTool,
    documentTitle: "JSON, XML and Data Formatter | Freeshot",
    description:
      "Format, validate and transform JSON, XML and HTML data in your browser for APIs, integrations, debugging and web development.",
  },
  "Data Compare": {
    canonicalPath: routePaths.dataCompareTool,
    documentTitle: "Data and Text Compare Tool | Freeshot",
    description:
      "Compare JSON, XML, YAML, Java, C# and plain text content side by side to identify differences during development and reviews.",
  },
  "Timestamp Converter": {
    canonicalPath: routePaths.timestampTool,
    documentTitle: "Unix Timestamp Converter | Freeshot",
    description:
      "Convert Unix timestamps to readable dates and transform dates back to Unix time with a lightweight browser-based utility.",
  },
  "JWT Decoder": {
    canonicalPath: routePaths.jwtDecoderTool,
    documentTitle: "JWT Decoder and Token Inspector | Freeshot",
    description:
      "Inspect JWT headers, payloads and claims locally in your browser without sending sensitive token data to a server.",
  },
  "Hash Generator": {
    canonicalPath: routePaths.hashGeneratorTool,
    documentTitle: "MD5 and SHA Hash Generator | Freeshot",
    description:
      "Generate MD5, SHA-1, SHA-256 and SHA-512 hashes in your browser for development, verification and testing workflows.",
  },
  "Regex Tester": {
    canonicalPath: routePaths.regexTesterTool,
    documentTitle: "Regular Expression Tester | Freeshot",
    description:
      "Test regular expressions against sample text and inspect matches quickly with a practical browser-based regex utility.",
  },
  "URL Encoder / Decoder": {
    canonicalPath: routePaths.urlEncoderDecoderTool,
    documentTitle: "URL Encoder and Decoder | Freeshot",
    description:
      "Encode and decode URLs, query parameters and special characters locally for web development and integration debugging.",
  },
  "PKCE Generator": {
    canonicalPath: routePaths.pkceGeneratorTool,
    documentTitle: "OAuth 2.0 PKCE Generator | Freeshot",
    description:
      "Generate OAuth 2.0 PKCE code verifiers and code challenges locally for secure authorization flow development and testing.",
  },
  "Architecture & Design": {
    canonicalPath: routePaths.architectureDesign,
    documentTitle: "Architecture and Design Tools | Freeshot",
    description:
      "Explore practical tools for architecture diagrams, PlantUML modeling, Architecture Decision Records and system documentation.",
  },
  "ADR Generator": {
    canonicalPath: routePaths.adrGenerator,
    documentTitle: "Architecture Decision Record Generator | Freeshot",
    description:
      "Create clear Architecture Decision Records with a structured template for decisions, context, alternatives and consequences.",
  },
  "PlantUML Viewer": {
    canonicalPath: routePaths.plantUmlViewer,
    documentTitle: "PlantUML Viewer and Architecture Templates | Freeshot",
    description:
      "Render PlantUML diagrams from source and start faster with reusable architecture, C4, security and platform templates.",
  },
  "Architecture Notes": {
    canonicalPath: routePaths.architectureNotes,
    documentTitle: "Software Architecture Notes | Freeshot",
    description:
      "Browse concise software architecture notes covering security protocols, integration patterns and practical engineering decisions.",
  },
  DPoP: {
    canonicalPath: routePaths.dpopArchitectureNote,
    documentTitle: "DPoP Architecture Note | Freeshot",
    description:
      "Understand OAuth 2.0 Demonstrating Proof of Possession concepts, request flows and architectural considerations for token security.",
  },
  "Platform Engineering": {
    canonicalPath: routePaths.platformEngineering,
    documentTitle: "Platform Engineering Tools | Freeshot",
    description:
      "Explore capacity planning, resource sizing and JVM memory utilities for cloud platforms, containers and infrastructure operations.",
  },
  "Container Platform Calculator Suite": {
    canonicalPath: routePaths.containerPlatformCalculator,
    documentTitle: "Container Platform Capacity Calculator | Freeshot",
    description:
      "Estimate container platform capacity, workload resources and infrastructure sizing for OpenShift and Kubernetes environments.",
  },
  "JVM Memory Calculator": {
    canonicalPath: routePaths.jvmMemoryCalculator,
    documentTitle: "JVM Memory Calculator for Containers | Freeshot",
    description:
      "Calculate practical JVM heap and non-heap memory settings for containerized Java applications and platform workloads.",
  },
  "Page Not Found": {
    canonicalPath: routePaths.home,
    documentTitle: "Page Not Found | Freeshot",
    description:
      "The requested Freeshot page could not be found. Return to the engineering toolkit to continue exploring available tools.",
    noIndex: true,
  },
};
