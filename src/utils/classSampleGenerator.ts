import type { DataModelLanguage } from "./dataModelGenerator";

interface ClassProperty {
  name: string;
  type: string;
}

interface ClassDefinition {
  name: string;
  properties: ClassProperty[];
  hasInheritance: boolean;
}

type ParseSuccess = {
  ok: true;
  classes: ClassDefinition[];
};

type SampleSuccess = {
  ok: true;
  json: string;
  rootClassName: string;
  warnings: string[];
};

type SampleFailure = {
  ok: false;
  error: string;
};

export type ClassSampleResult = SampleSuccess | SampleFailure;

export interface ClassSampleOptions {
  requireRootClass?: boolean;
  rootClassName?: string;
}

export function generateJsonSampleFromClass(
  source: string,
  language: DataModelLanguage,
  options: ClassSampleOptions = {},
): ClassSampleResult {
  if (!source.trim()) {
    return {
      ok: false,
      error: `Enter ${getLanguageLabel(language)} class source to generate a JSON sample.`,
    };
  }

  const parsed = parseClassDefinitions(source, language);

  if (!parsed.ok) {
    return parsed;
  }

  const requestedRoot = options.rootClassName?.trim();
  const rootClass = requestedRoot
    ? parsed.classes.find((modelClass) => modelClass.name === requestedRoot)
    : undefined;

  if (requestedRoot && !rootClass && options.requireRootClass) {
    return {
      ok: false,
      error: `Root class “${requestedRoot}” was not found in the source.`,
    };
  }

  const selectedRoot = rootClass ?? parsed.classes[0];
  const classesByName = new Map(
    parsed.classes.map((modelClass) => [modelClass.name, modelClass]),
  );
  const warnings = new Set<string>();
  const sample = buildClassSample(
    selectedRoot.name,
    language,
    classesByName,
    new Set(),
    warnings,
  );

  return {
    ok: true,
    json: JSON.stringify(sample, null, 2),
    rootClassName: selectedRoot.name,
    warnings: [...warnings],
  };
}

export function getFirstParsedClassName(
  source: string,
  language: DataModelLanguage,
) {
  const parsed = parseClassDefinitions(source, language);
  return parsed.ok ? parsed.classes[0].name : null;
}

function parseClassDefinitions(
  source: string,
  language: DataModelLanguage,
): ParseSuccess | SampleFailure {
  const normalizedSource = stripComments(source);
  const classPattern = /\bclass\s+([A-Za-z_][A-Za-z0-9_]*)\s*([^{};]*)\{/g;
  const classes: ClassDefinition[] = [];
  const classNames = new Set<string>();
  let match: RegExpExecArray | null;

  while ((match = classPattern.exec(normalizedSource))) {
    const name = match[1];
    const openingBraceIndex = classPattern.lastIndex - 1;
    const closingBraceIndex = findMatchingBrace(
      normalizedSource,
      openingBraceIndex,
    );

    if (closingBraceIndex === -1) {
      return {
        ok: false,
        error: `Class “${name}” has unmatched braces. Check the class structure.`,
      };
    }

    if (!classNames.has(name)) {
      const declarationTail = match[2];
      const body = normalizedSource.slice(
        openingBraceIndex + 1,
        closingBraceIndex,
      );
      classes.push({
        name,
        properties:
          language === "csharp"
            ? parseCsharpProperties(body)
            : parseJavaFields(body),
        hasInheritance:
          language === "csharp"
            ? /:\s*[A-Za-z_]/.test(declarationTail)
            : /\bextends\s+[A-Za-z_]/.test(declarationTail),
      });
      classNames.add(name);
    }

    classPattern.lastIndex = closingBraceIndex + 1;
  }

  if (classes.length === 0) {
    return {
      ok: false,
      error: `No supported ${getLanguageLabel(language)} class declaration was found.`,
    };
  }

  return { ok: true, classes };
}

function parseCsharpProperties(body: string): ClassProperty[] {
  const propertyPattern =
    /\bpublic\s+(?:(?:required|virtual|override|new|sealed)\s+)*([A-Za-z_][A-Za-z0-9_.]*(?:\s*<[^{};]+>)?(?:\[\])?\??)\s+([A-Za-z_][A-Za-z0-9_]*)\s*\{\s*get\s*;\s*(?:(?:private|protected|internal)\s+)?(?:set|init)\s*;\s*\}/g;
  const properties: ClassProperty[] = [];
  let match: RegExpExecArray | null;

  while ((match = propertyPattern.exec(body))) {
    properties.push({ type: normalizeType(match[1]), name: match[2] });
  }

  return properties;
}

function parseJavaFields(body: string): ClassProperty[] {
  const withoutAnnotations = body.replace(
    /@[A-Za-z_][A-Za-z0-9_.]*(?:\s*\([^)]*\))?\s*/g,
    "",
  );
  const fieldPattern =
    /\b((?:public|private|protected)\s+(?:(?:final|static|transient|volatile)\s+)*)((?:[A-Za-z_][A-Za-z0-9_.]*)(?:\s*<[^;{}()]+>)?(?:\[\])?)\s+([A-Za-z_][A-Za-z0-9_]*)\s*(?:=[^;]*)?;/g;
  const fields: ClassProperty[] = [];
  let match: RegExpExecArray | null;

  while ((match = fieldPattern.exec(withoutAnnotations))) {
    if (/\bstatic\b/.test(match[1])) {
      continue;
    }

    fields.push({ type: normalizeType(match[2]), name: match[3] });
  }

  return fields;
}

function buildClassSample(
  className: string,
  language: DataModelLanguage,
  classesByName: Map<string, ClassDefinition>,
  classPath: Set<string>,
  warnings: Set<string>,
): unknown {
  if (classPath.has(className)) {
    warnings.add(`Recursive reference to ${className} was replaced with null.`);
    return null;
  }

  const modelClass = classesByName.get(className);

  if (!modelClass) {
    warnings.add(
      `Unknown referenced model: ${className}. Used an empty object.`,
    );
    return {};
  }

  if (modelClass.hasInheritance) {
    warnings.add(
      `Inheritance for ${className} was not expanded; only its declared members were used.`,
    );
  }

  if (modelClass.properties.length === 0) {
    warnings.add(`No supported properties were found in ${className}.`);
  }

  const nextPath = new Set(classPath);
  nextPath.add(className);
  const output: Record<string, unknown> = Object.create(null) as Record<
    string,
    unknown
  >;

  modelClass.properties.forEach((property) => {
    const preferredName =
      language === "csharp" ? toCamelCase(property.name) : property.name;
    const propertyName = getUniqueJsonPropertyName(output, preferredName);
    output[propertyName] = getTypeSample(
      property.type,
      language,
      classesByName,
      nextPath,
      warnings,
    );
  });

  return output;
}

function getTypeSample(
  sourceType: string,
  language: DataModelLanguage,
  classesByName: Map<string, ClassDefinition>,
  classPath: Set<string>,
  warnings: Set<string>,
): unknown {
  let type = normalizeType(sourceType);

  if (language === "csharp" && type.endsWith("?")) {
    type = type.slice(0, -1);
  }

  if (type.endsWith("[]")) {
    return [
      getTypeSample(
        type.slice(0, -2),
        language,
        classesByName,
        classPath,
        warnings,
      ),
    ];
  }

  const listItemType = getListItemType(type, language);

  if (listItemType) {
    return [
      getTypeSample(listItemType, language, classesByName, classPath, warnings),
    ];
  }

  if (type.includes("<") || type.includes(">")) {
    warnings.add(`Unsupported generic type: ${type}. Used an empty object.`);
    return {};
  }

  const primitive = getPrimitiveSample(type, language);

  if (primitive.matched) {
    return primitive.value;
  }

  const className = type.split(".").filter(Boolean).pop() ?? type;
  return buildClassSample(
    className,
    language,
    classesByName,
    classPath,
    warnings,
  );
}

function getPrimitiveSample(
  sourceType: string,
  language: DataModelLanguage,
): { matched: true; value: unknown } | { matched: false } {
  const type = sourceType.split(".").filter(Boolean).pop() ?? sourceType;

  if (language === "csharp") {
    const normalizedType = type.toLowerCase();

    if (["string", "char"].includes(normalizedType)) {
      return { matched: true, value: "" };
    }

    if (
      [
        "byte",
        "sbyte",
        "short",
        "ushort",
        "int",
        "uint",
        "long",
        "ulong",
        "float",
        "double",
        "decimal",
      ].includes(normalizedType)
    ) {
      return { matched: true, value: 0 };
    }

    if (["bool", "boolean"].includes(normalizedType)) {
      return { matched: true, value: false };
    }

    if (["datetime", "datetimeoffset"].includes(normalizedType)) {
      return { matched: true, value: "1970-01-01T00:00:00Z" };
    }

    if (normalizedType === "guid") {
      return {
        matched: true,
        value: "00000000-0000-0000-0000-000000000000",
      };
    }

    if (["object", "dynamic"].includes(normalizedType)) {
      return { matched: true, value: {} };
    }

    return { matched: false };
  }

  if (["String", "string", "char", "Character"].includes(type)) {
    return { matched: true, value: "" };
  }

  if (
    [
      "byte",
      "Byte",
      "short",
      "Short",
      "int",
      "Integer",
      "long",
      "Long",
      "float",
      "Float",
      "double",
      "Double",
      "BigDecimal",
      "BigInteger",
    ].includes(type)
  ) {
    return { matched: true, value: 0 };
  }

  if (["boolean", "Boolean"].includes(type)) {
    return { matched: true, value: false };
  }

  if (type === "Object") {
    return { matched: true, value: {} };
  }

  return { matched: false };
}

function getListItemType(type: string, language: DataModelLanguage) {
  const pattern =
    language === "csharp"
      ? /^(?:System\.Collections\.Generic\.)?List\s*<\s*(.+)\s*>$/
      : /^(?:java\.util\.)?List\s*<\s*(.+)\s*>$/;
  return type.match(pattern)?.[1]?.trim() ?? null;
}

function findMatchingBrace(source: string, openingBraceIndex: number) {
  let depth = 0;
  let quote: '"' | "'" | null = null;
  let escaped = false;

  for (let index = openingBraceIndex; index < source.length; index += 1) {
    const character = source[index];

    if (quote) {
      if (!escaped && character === quote) {
        quote = null;
      }

      escaped = !escaped && character === "\\";
      continue;
    }

    if (character === '"' || character === "'") {
      quote = character;
      escaped = false;
      continue;
    }

    if (character === "{") {
      depth += 1;
    } else if (character === "}") {
      depth -= 1;

      if (depth === 0) {
        return index;
      }
    }
  }

  return -1;
}

function stripComments(source: string) {
  return source
    .replace(/\/\*[\s\S]*?\*\//g, " ")
    .replace(/(^|[^:])\/\/.*$/gm, "$1");
}

function normalizeType(type: string) {
  return type.replace(/\s+/g, " ").trim();
}

function toCamelCase(value: string) {
  return value
    ? `${value.charAt(0).toLowerCase()}${value.slice(1)}`
    : "property";
}

function getUniqueJsonPropertyName(
  output: Record<string, unknown>,
  preferredName: string,
) {
  let candidate = preferredName || "property";
  let suffix = 2;

  while (Object.prototype.hasOwnProperty.call(output, candidate)) {
    candidate = `${preferredName}${suffix}`;
    suffix += 1;
  }

  return candidate;
}

function getLanguageLabel(language: DataModelLanguage) {
  return language === "csharp" ? "C#" : "Java";
}
