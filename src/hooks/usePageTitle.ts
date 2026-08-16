import { useEffect } from "react";

const siteUrl = "https://freeshot.online";
const homeTitle = "Freeshot | Engineering Toolkit";

const pageDescriptions: Record<string, string> = {
  Home: "Freeshot is an engineering toolkit for developer productivity, platform engineering, and architecture and design workflows.",
  "About Freeshot":
    "Learn how Freeshot is evolving into a practical toolkit for developers, platform engineers, and software architects.",
  "Developer Productivity Tools":
    "Developer tools for formatting data, inspecting tokens, testing patterns, encoding values, and debugging everyday integration workflows.",
  "Base64 Encoder / Decoder":
    "Encode plain text as Base64 or decode Base64 values directly in the browser for development and integration troubleshooting.",
  "UUID Generator":
    "Generate one or more UUID v4 identifiers for APIs, databases, test fixtures, migrations, and distributed workflows.",
  "Data Formatter":
    "Format, validate, and minify JSON, XML, and HTML for API development, integrations, debugging, and web workflows.",
  "Configuration Converter":
    "Convert Properties configuration to JSON or YAML, or convert between JSON and YAML directly in the browser.",
  "Data Compare":
    "Compare JSON, XML, YAML, Java, C#, or plain text and reduce formatting noise to focus on meaningful differences.",
  "Timestamp Converter":
    "Convert Unix timestamps to readable dates, convert dates back to timestamps, and inspect values across time zones.",
  "JWT Decoder":
    "Decode JWT headers and payloads, inspect claims and timestamps, and troubleshoot tokens directly in the browser.",
  "Hash Generator":
    "Generate MD5, SHA-1, SHA-256, or SHA-512 hashes from text for development checks and data comparison workflows.",
  "Regex Tester":
    "Test regular expressions against sample text, configure matching flags, and inspect matches while developing validation rules.",
  "URL Encoder / Decoder":
    "Encode or decode URLs, query parameters, and reserved characters for API requests, redirects, and integration debugging.",
  "PKCE Generator":
    "Generate OAuth 2.0 PKCE code verifiers and S256 code challenges for authorization-code flow development and testing.",
  "Architecture & Design Tools":
    "Architecture tools for diagramming systems, documenting decisions, capturing design notes, and identifying security threats.",
  "PlantUML Viewer":
    "Write and render PlantUML diagrams from reusable architecture, sequence, deployment, and C4 modeling templates.",
  "Mermaid Viewer":
    "Create and preview Mermaid diagrams directly in your browser using text-based diagram definitions.",
  "ADR Generator":
    "Create structured Architecture Decision Records that capture context, options, decisions, consequences, and ownership.",
  "Architecture Notes":
    "Capture system context, integrations, security considerations, and open architecture questions in browser-based Markdown notes.",
  "Threat Modeling Helper":
    "Identify and prioritize STRIDE threats, review practical mitigations, and export a structured threat model report.",
  "Platform Engineering Tools":
    "Platform engineering tools for workload capacity planning, container resource sizing, autoscaling, storage, and JVM memory allocation.",
  "OpenShift Calculator":
    "Plan OpenShift workload capacity, pod resources, autoscaling, JVM memory, and persistent storage from practical inputs.",
  "JVM Memory Calculator":
    "Size JVM heap, metaspace, native memory, and safety headroom within a container memory limit.",
  "Architecture Notes Library":
    "Browse concise architecture notes about security, integration, and software design topics, with links to related Freeshot tools.",
  "DPoP Architecture Note":
    "Understand how Demonstrating Proof-of-Possession binds OAuth access tokens to a client key and reduces token replay risk.",
  "Page Not Found":
    "The requested page does not exist in Freeshot. Use the toolkit navigation to continue to an available engineering tool.",
};

function updateMeta(selector: string, content: string) {
  const element = document.querySelector<HTMLMetaElement>(selector);
  element?.setAttribute("content", content);
}

export function usePageTitle(title: string) {
  useEffect(() => {
    const documentTitle = title === "Home" ? homeTitle : `${title} | Freeshot`;
    const description = pageDescriptions[title] ?? pageDescriptions.Home;
    const canonicalUrl = `${siteUrl}${window.location.pathname}`;

    document.title = documentTitle;
    updateMeta('meta[name="description"]', description);
    updateMeta('meta[property="og:title"]', documentTitle);
    updateMeta('meta[property="og:description"]', description);
    updateMeta('meta[property="og:url"]', canonicalUrl);
    updateMeta('meta[name="twitter:title"]', documentTitle);
    updateMeta('meta[name="twitter:description"]', description);
    updateMeta(
      'meta[name="robots"]',
      title === "Page Not Found" ? "noindex, follow" : "index, follow",
    );
    document
      .querySelector<HTMLLinkElement>('link[rel="canonical"]')
      ?.setAttribute("href", canonicalUrl);
  }, [title]);
}
