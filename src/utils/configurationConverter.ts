import { parse, stringify } from "yaml";

export type ConfigurationFormat = "json" | "yaml";
export type ConfigurationInputFormat = ConfigurationFormat | "properties";
export type PropertiesValueTypes = "infer" | "preserve";

export interface ConfigurationConversionOptions {
  expandDottedKeys?: boolean;
  propertiesValueTypes?: PropertiesValueTypes;
}

const jsonOutputFormats: readonly ConfigurationFormat[] = ["json"];
const yamlOutputFormats: readonly ConfigurationFormat[] = ["yaml"];
const propertiesOutputFormats: readonly ConfigurationFormat[] = [
  "yaml",
  "json",
];

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

type ParsedProperty = {
  key: string;
  value: string;
  lineNumber: number;
};

type LogicalPropertyLine = {
  value: string;
  lineNumber: number;
};

type PropertyParseResult =
  | { ok: true; value: Record<string, unknown> }
  | ConversionFailure;

export function convertConfiguration(
  source: string,
  inputFormat: ConfigurationInputFormat,
  outputFormat: ConfigurationFormat,
  options: ConfigurationConversionOptions = {},
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

  if (inputFormat === "properties") {
    return convertProperties(source, outputFormat, options);
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

export function getConfigurationFormatLabel(format: ConfigurationInputFormat) {
  if (format === "json") {
    return "JSON";
  }

  return format === "yaml" ? "YAML" : "Properties";
}

export function getSupportedOutputFormats(
  inputFormat: ConfigurationInputFormat,
): readonly ConfigurationFormat[] {
  if (inputFormat === "json") {
    return yamlOutputFormats;
  }

  return inputFormat === "yaml" ? jsonOutputFormats : propertiesOutputFormats;
}

function convertProperties(
  source: string,
  outputFormat: ConfigurationFormat,
  options: ConfigurationConversionOptions,
): ConfigurationConversionResult {
  const result = parseProperties(source, {
    expandDottedKeys: options.expandDottedKeys ?? true,
    valueTypes: options.propertiesValueTypes ?? "infer",
  });

  if (!result.ok) {
    return result;
  }

  try {
    return {
      ok: true,
      value:
        outputFormat === "json"
          ? JSON.stringify(result.value, null, 2)
          : stringify(result.value, { indent: 2, lineWidth: 0 }),
    };
  } catch {
    return {
      ok: false,
      error: `Properties could not be converted to ${getConfigurationFormatLabel(outputFormat)}.`,
    };
  }
}

function parseProperties(
  source: string,
  options: {
    expandDottedKeys: boolean;
    valueTypes: PropertiesValueTypes;
  },
): PropertyParseResult {
  const logicalLines = getLogicalPropertyLines(source);

  if (!logicalLines.ok) {
    return logicalLines;
  }

  const properties: ParsedProperty[] = [];
  const firstDefinitionByKey = new Map<string, number>();

  for (const line of logicalLines.value) {
    const trimmedStart = line.value.replace(/^[\t\f ]+/, "");

    if (
      !trimmedStart ||
      trimmedStart.startsWith("#") ||
      trimmedStart.startsWith("!")
    ) {
      continue;
    }

    const parsedLine = parsePropertyLine(trimmedStart, line.lineNumber);

    if (!parsedLine.ok) {
      return parsedLine;
    }

    const firstLine = firstDefinitionByKey.get(parsedLine.value.key);

    if (firstLine !== undefined) {
      return {
        ok: false,
        error: `Duplicate property "${parsedLine.value.key}" on line ${parsedLine.value.lineNumber}; first defined on line ${firstLine}.`,
      };
    }

    firstDefinitionByKey.set(parsedLine.value.key, parsedLine.value.lineNumber);
    properties.push(parsedLine.value);
  }

  const output: Record<string, unknown> = Object.create(null) as Record<
    string,
    unknown
  >;

  for (const property of properties) {
    const value =
      options.valueTypes === "preserve"
        ? property.value
        : inferPropertyValue(property.value);

    if (!options.expandDottedKeys) {
      output[property.key] = value;
      continue;
    }

    const conflict = setNestedProperty(output, property.key, value);

    if (conflict) {
      return { ok: false, error: conflict };
    }
  }

  return { ok: true, value: output };
}

function getLogicalPropertyLines(
  source: string,
): { ok: true; value: LogicalPropertyLine[] } | ConversionFailure {
  const physicalLines = source.replace(/\r\n?/g, "\n").split("\n");
  const logicalLines: LogicalPropertyLine[] = [];

  for (let index = 0; index < physicalLines.length; index += 1) {
    const lineNumber = index + 1;
    let value = physicalLines[index];
    const trimmedStart = value.replace(/^[\t\f ]+/, "");

    if (
      !trimmedStart ||
      trimmedStart.startsWith("#") ||
      trimmedStart.startsWith("!")
    ) {
      logicalLines.push({ value, lineNumber });
      continue;
    }

    while (hasContinuation(value)) {
      value = value.slice(0, -1);
      index += 1;

      if (index >= physicalLines.length) {
        return {
          ok: false,
          error: `Property continuation on line ${lineNumber} is incomplete.`,
        };
      }

      value += physicalLines[index].replace(/^[\t\f ]+/, "");
    }

    logicalLines.push({ value, lineNumber });
  }

  return { ok: true, value: logicalLines };
}

function hasContinuation(value: string) {
  let slashCount = 0;

  for (let index = value.length - 1; index >= 0; index -= 1) {
    if (value[index] !== "\\") {
      break;
    }

    slashCount += 1;
  }

  return slashCount % 2 === 1;
}

function parsePropertyLine(
  line: string,
  lineNumber: number,
): { ok: true; value: ParsedProperty } | ConversionFailure {
  let separatorIndex = -1;
  let separatorIsWhitespace = false;
  let escaped = false;

  for (let index = 0; index < line.length; index += 1) {
    const character = line[index];

    if (!escaped && character === "\\") {
      escaped = true;
      continue;
    }

    if (!escaped && (character === "=" || character === ":")) {
      separatorIndex = index;
      break;
    }

    if (!escaped && /[\t\f ]/.test(character)) {
      separatorIndex = index;
      separatorIsWhitespace = true;
      break;
    }

    escaped = false;
  }

  const keySource =
    separatorIndex === -1 ? line : line.slice(0, separatorIndex);
  let valueStart = separatorIndex === -1 ? line.length : separatorIndex + 1;

  if (separatorIsWhitespace) {
    while (/[\t\f ]/.test(line[valueStart] ?? "")) {
      valueStart += 1;
    }

    if (line[valueStart] === "=" || line[valueStart] === ":") {
      valueStart += 1;
    }
  }

  while (/[\t\f ]/.test(line[valueStart] ?? "")) {
    valueStart += 1;
  }

  const key = decodePropertyEscapes(keySource, lineNumber);

  if (!key.ok) {
    return key;
  }

  if (!key.value) {
    return {
      ok: false,
      error: `Property on line ${lineNumber} is missing a key.`,
    };
  }

  const value = decodePropertyEscapes(line.slice(valueStart), lineNumber);

  if (!value.ok) {
    return value;
  }

  return {
    ok: true,
    value: { key: key.value, value: value.value, lineNumber },
  };
}

function decodePropertyEscapes(
  source: string,
  lineNumber: number,
): { ok: true; value: string } | ConversionFailure {
  let decoded = "";

  for (let index = 0; index < source.length; index += 1) {
    const character = source[index];

    if (character !== "\\") {
      decoded += character;
      continue;
    }

    index += 1;
    const escaped = source[index];

    if (escaped === undefined) {
      return {
        ok: false,
        error: `Invalid escape sequence on property line ${lineNumber}.`,
      };
    }

    if (escaped === "u") {
      const hexadecimal = source.slice(index + 1, index + 5);

      if (!/^[0-9a-fA-F]{4}$/.test(hexadecimal)) {
        return {
          ok: false,
          error: `Invalid Unicode escape on property line ${lineNumber}.`,
        };
      }

      decoded += String.fromCharCode(Number.parseInt(hexadecimal, 16));
      index += 4;
      continue;
    }

    const commonEscapes: Record<string, string> = {
      t: "\t",
      n: "\n",
      r: "\r",
      f: "\f",
    };

    decoded += commonEscapes[escaped] ?? escaped;
  }

  return { ok: true, value: decoded };
}

function inferPropertyValue(value: string): unknown {
  if (value === "true") {
    return true;
  }

  if (value === "false") {
    return false;
  }

  if (value === "null") {
    return null;
  }

  const isInteger = /^-?(?:0|[1-9]\d*)$/.test(value);
  const isDecimal = /^-?(?:0|[1-9]\d*)\.\d+$/.test(value);

  if (isInteger || isDecimal) {
    const numberValue = Number(value);
    const keepsIntegerValue = !isInteger || Number.isSafeInteger(numberValue);

    if (
      Number.isFinite(numberValue) &&
      keepsIntegerValue &&
      String(numberValue) === value
    ) {
      return numberValue;
    }
  }

  return value;
}

function setNestedProperty(
  output: Record<string, unknown>,
  key: string,
  value: unknown,
): string | null {
  const segments = key.split(".");

  if (segments.some((segment) => !segment)) {
    return `Property "${key}" contains an empty dotted key segment.`;
  }

  let target = output;

  for (let index = 0; index < segments.length - 1; index += 1) {
    const segment = segments[index];
    const path = segments.slice(0, index + 1).join(".");
    const existing = target[segment];

    if (existing === undefined) {
      const nested: Record<string, unknown> = Object.create(null) as Record<
        string,
        unknown
      >;
      target[segment] = nested;
      target = nested;
      continue;
    }

    if (
      typeof existing !== "object" ||
      existing === null ||
      !isPlainObject(existing)
    ) {
      return `Property "${key}" conflicts with "${path}"; a key cannot be both a value and an object.`;
    }

    target = existing;
  }

  const leaf = segments[segments.length - 1];
  const existingLeaf = target[leaf];

  if (
    typeof existingLeaf === "object" &&
    existingLeaf !== null &&
    isPlainObject(existingLeaf)
  ) {
    return `Property "${key}" conflicts with nested properties at "${key}"; a key cannot be both a value and an object.`;
  }

  target[leaf] = value;
  return null;
}

function convertJsonToYaml(source: string): ConfigurationConversionResult {
  let value: unknown;

  try {
    value = JSON.parse(source) as unknown;
  } catch (error) {
    return {
      ok: false,
      error: getJsonErrorDetail(error, source),
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
  } catch (error) {
    return {
      ok: false,
      error: getYamlErrorDetail(error),
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

function getJsonErrorDetail(error: unknown, source: string) {
  const message = error instanceof Error ? error.message : "";
  const explicitLocation = message.match(
    /line\s+(\d+)(?:\s*,)?\s+column\s+(\d+)/i,
  );

  if (explicitLocation) {
    return `Check JSON syntax near line ${explicitLocation[1]}, column ${explicitLocation[2]}.`;
  }

  const positionMatch = message.match(/position\s+(\d+)/i);

  if (positionMatch) {
    const position = Number(positionMatch[1]);

    if (Number.isInteger(position) && position >= 0) {
      const { line, column } = getTextLocation(source, position);
      return `Check JSON syntax near line ${line}, column ${column}.`;
    }
  }

  return "Check JSON syntax, quotes, separators, and trailing commas.";
}

function getYamlErrorDetail(error: unknown) {
  if (typeof error === "object" && error !== null && "linePos" in error) {
    const linePositions = (error as { linePos?: unknown }).linePos;

    if (Array.isArray(linePositions)) {
      const firstPosition = linePositions[0] as
        | { line?: unknown; col?: unknown }
        | undefined;

      if (
        typeof firstPosition?.line === "number" &&
        typeof firstPosition.col === "number"
      ) {
        return `Check YAML syntax near line ${firstPosition.line}, column ${firstPosition.col}.`;
      }
    }
  }

  return "Check YAML syntax and indentation.";
}

function getTextLocation(source: string, position: number) {
  const beforePosition = source.slice(0, position);
  const lines = beforePosition.split(/\r\n|\r|\n/);

  return {
    line: lines.length,
    column: (lines[lines.length - 1]?.length ?? 0) + 1,
  };
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
