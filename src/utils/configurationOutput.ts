import type { ConfigurationFormat } from "./configurationConverter";

export interface TextStatistics {
  characters: number;
  lines: number;
}

export interface ConfigurationDownload {
  content: string;
  fileName: string;
  mimeType: string;
}

export function getTextStatistics(text: string): TextStatistics {
  return {
    characters: text.length,
    lines: text.length === 0 ? 0 : text.split(/\r\n|\r|\n/).length,
  };
}

export function formatTextStatistics(text: string) {
  const { characters, lines } = getTextStatistics(text);
  const characterLabel = characters === 1 ? "character" : "characters";
  const lineLabel = lines === 1 ? "line" : "lines";

  return `${characters} ${characterLabel} · ${lines} ${lineLabel}`;
}

export function getConfigurationDownload(
  content: string,
  format: ConfigurationFormat,
): ConfigurationDownload {
  return format === "json"
    ? {
        content,
        fileName: "configuration.json",
        mimeType: "application/json;charset=utf-8",
      }
    : {
        content,
        fileName: "configuration.yaml",
        mimeType: "application/yaml;charset=utf-8",
      };
}
