import { parse, stringify } from "yaml";

export type ConfigurationFormat = "json" | "yaml";

type ConversionSuccess = {
  ok: true;
  value: string;
};

type ConversionFailure = {
  ok: false;
  error: string;
};

export type ConfigurationConversionResult =
  | ConversionSuccess
  | ConversionFailure;

export function convertConfiguration(
  source: string,
  inputFormat: ConfigurationFormat,
  outputFormat: ConfigurationFormat,
): ConfigurationConversionResult {
  if (!source.trim()) {
    return {
      ok: false,
      error: `Enter ${getConfigurationFormatLabel(inputFormat)} configuration to convert.`,
    };
  }

  if (inputFormat === outputFormat) {
    return {
      ok: false,
      error: "Choose different input and output formats.",
    };
  }

  if (inputFormat === "json") {
    return convertJsonToYaml(source);
  }

  return convertYamlToJson(source);
}

export function isConfigurationConversionFailure(
  result: ConfigurationConversionResult,
): result is ConversionFailure {
  return !result.ok;
}

export function getConfigurationFormatLabel(format: ConfigurationFormat) {
  return format === "json" ? "JSON" : "YAML";
}

function convertJsonToYaml(source: string): ConfigurationConversionResult {
  let value: unknown;

  try {
    value = JSON.parse(source) as unknown;
  } catch {
    return {
      ok: false,
      error: "Invalid JSON. Check the syntax and try again.",
    };
  }

  try {
    return {
      ok: true,
      value: stringify(value, { indent: 2, lineWidth: 0 }),
    };
  } catch {
    return {
      ok: false,
      error: "This JSON value cannot be represented as YAML.",
    };
  }
}

function convertYamlToJson(source: string): ConfigurationConversionResult {
  let value: unknown;

  try {
    value = parse(source, { maxAliasCount: 100 }) as unknown;
  } catch {
    return {
      ok: false,
      error: "Invalid YAML. Check the syntax and indentation and try again.",
    };
  }

  if (!isJsonCompatible(value, new Set<object>())) {
    return {
      ok: false,
      error:
        "YAML contains a value or structure that cannot be represented as JSON.",
    };
  }

  try {
    return {
      ok: true,
      value: JSON.stringify(value, null, 2),
    };
  } catch {
    return {
      ok: false,
      error:
        "YAML contains a value or structure that cannot be represented as JSON.",
    };
  }
}

function isJsonCompatible(value: unknown, ancestors: Set<object>): boolean {
  if (
    value === null ||
    typeof value === "string" ||
    typeof value === "boolean"
  ) {
    return true;
  }

  if (typeof value === "number") {
    return Number.isFinite(value);
  }

  if (typeof value !== "object" || ancestors.has(value)) {
    return false;
  }

  ancestors.add(value);

  const isCompatible = Array.isArray(value)
    ? value.every((item) => isJsonCompatible(item, ancestors))
    : isPlainObject(value) &&
      Object.values(value).every((item) => isJsonCompatible(item, ancestors));

  ancestors.delete(value);
  return isCompatible;
}

function isPlainObject(value: object): value is Record<string, unknown> {
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}
