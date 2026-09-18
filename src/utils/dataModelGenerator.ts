export type DataModelLanguage = "csharp" | "java";

type PrimitiveType = "string" | "integer" | "decimal" | "boolean" | "any";

type ModelType =
  | { kind: "primitive"; value: PrimitiveType }
  | { kind: "model"; className: string }
  | { kind: "list"; itemType: ModelType };

interface ModelProperty {
  csharpName: string;
  javaName: string;
  type: ModelType;
}

interface ModelClass {
  name: string;
  properties: ModelProperty[];
}

interface ModelContext {
  classes: ModelClass[];
  classNames: Set<string>;
  nestedShapeNames: Map<string, string>;
}

type GenerationSuccess = {
  ok: true;
  code: string;
};

type GenerationFailure = {
  ok: false;
  error: string;
};

export type DataModelGenerationResult = GenerationSuccess | GenerationFailure;

const identifierPattern = /^[A-Za-z_][A-Za-z0-9_]*$/;
const reservedIdentifiers = new Set([
  "abstract",
  "as",
  "base",
  "boolean",
  "break",
  "byte",
  "case",
  "catch",
  "char",
  "checked",
  "class",
  "const",
  "continue",
  "decimal",
  "default",
  "delegate",
  "do",
  "double",
  "else",
  "enum",
  "event",
  "explicit",
  "extends",
  "extern",
  "false",
  "final",
  "finally",
  "fixed",
  "float",
  "for",
  "foreach",
  "goto",
  "if",
  "implements",
  "implicit",
  "import",
  "in",
  "instanceof",
  "int",
  "interface",
  "internal",
  "is",
  "lock",
  "long",
  "namespace",
  "native",
  "new",
  "null",
  "object",
  "operator",
  "out",
  "override",
  "package",
  "params",
  "private",
  "protected",
  "public",
  "readonly",
  "record",
  "ref",
  "return",
  "sbyte",
  "sealed",
  "short",
  "sizeof",
  "stackalloc",
  "static",
  "strictfp",
  "string",
  "struct",
  "super",
  "switch",
  "synchronized",
  "this",
  "throw",
  "throws",
  "transient",
  "true",
  "try",
  "typeof",
  "uint",
  "ulong",
  "unchecked",
  "unsafe",
  "ushort",
  "using",
  "virtual",
  "void",
  "volatile",
  "while",
]);

export function generateDataModel(
  source: string,
  language: DataModelLanguage,
  rootClassName: string,
): DataModelGenerationResult {
  if (!source.trim()) {
    return { ok: false, error: "Enter JSON to generate a model." };
  }

  const classNameError = getRootClassNameError(rootClassName);

  if (classNameError) {
    return { ok: false, error: classNameError };
  }

  let parsed: unknown;

  try {
    parsed = JSON.parse(source) as unknown;
  } catch (error) {
    return { ok: false, error: getJsonErrorMessage(error, source) };
  }

  if (!isRecord(parsed)) {
    return {
      ok: false,
      error: "Use a JSON object at the root level to generate model classes.",
    };
  }

  const context: ModelContext = {
    classes: [],
    classNames: new Set(),
    nestedShapeNames: new Map(),
  };

  createClass(context, rootClassName, parsed, false);

  return {
    ok: true,
    code:
      language === "csharp"
        ? renderCsharp(context.classes)
        : renderJava(context.classes),
  };
}

export function getRootClassNameError(className: string): string | null {
  if (!className.trim()) {
    return "Enter a root class name.";
  }

  if (!identifierPattern.test(className)) {
    return "Use a class name that starts with a letter or underscore and contains only letters, numbers, or underscores.";
  }

  if (reservedIdentifiers.has(className)) {
    return `“${className}” is a reserved language keyword. Choose another class name.`;
  }

  return null;
}

function createClass(
  context: ModelContext,
  preferredName: string,
  value: Record<string, unknown>,
  allowShapeReuse: boolean,
) {
  const shape = getValueShape(value);

  if (allowShapeReuse) {
    const existingName = context.nestedShapeNames.get(shape);

    if (existingName) {
      return existingName;
    }
  }

  const name = getUniqueClassName(context, toClassName(preferredName));
  const modelClass: ModelClass = { name, properties: [] };
  context.classes.push(modelClass);
  context.classNames.add(name);

  if (allowShapeReuse) {
    context.nestedShapeNames.set(shape, name);
  }

  const usedCsharpNames = new Set<string>();
  const usedJavaNames = new Set<string>();

  modelClass.properties = Object.entries(value).map(([propertyName, item]) => ({
    csharpName: getUniqueMemberName(
      getCsharpPropertyName(propertyName),
      usedCsharpNames,
      name,
    ),
    javaName: getUniqueMemberName(
      getJavaFieldName(propertyName),
      usedJavaNames,
      name,
    ),
    type: inferType(context, propertyName, item),
  }));

  return name;
}

function inferType(
  context: ModelContext,
  propertyName: string,
  value: unknown,
): ModelType {
  if (value === null) {
    return primitive("any");
  }

  if (typeof value === "string") {
    return primitive("string");
  }

  if (typeof value === "boolean") {
    return primitive("boolean");
  }

  if (typeof value === "number") {
    return primitive(isSafeInt32(value) ? "integer" : "decimal");
  }

  if (Array.isArray(value)) {
    return {
      kind: "list",
      itemType: inferArrayItemType(context, propertyName, value),
    };
  }

  if (isRecord(value)) {
    return {
      kind: "model",
      className: createClass(context, propertyName, value, true),
    };
  }

  return primitive("any");
}

function inferArrayItemType(
  context: ModelContext,
  propertyName: string,
  items: unknown[],
): ModelType {
  if (items.length === 0 || items.some((item) => item === null)) {
    return primitive("any");
  }

  if (items.every((item) => typeof item === "string")) {
    return primitive("string");
  }

  if (items.every((item) => typeof item === "boolean")) {
    return primitive("boolean");
  }

  if (items.every((item) => typeof item === "number")) {
    return primitive(
      items.every((item) => isSafeInt32(item as number))
        ? "integer"
        : "decimal",
    );
  }

  if (items.every(isRecord)) {
    const firstShape = getValueShape(items[0]);

    if (items.every((item) => getValueShape(item) === firstShape)) {
      return {
        kind: "model",
        className: createClass(
          context,
          singularize(propertyName),
          items[0],
          true,
        ),
      };
    }
  }

  return primitive("any");
}

function primitive(value: PrimitiveType): ModelType {
  return { kind: "primitive", value };
}

function renderCsharp(classes: ModelClass[]) {
  const imports = classes.some((modelClass) =>
    modelClass.properties.some((property) => containsList(property.type)),
  )
    ? "using System.Collections.Generic;\n\n"
    : "";

  return `${imports}${classes.map(renderCsharpClass).join("\n\n")}`;
}

function renderCsharpClass(modelClass: ModelClass) {
  const properties = modelClass.properties
    .map(
      (property) =>
        `    public ${renderCsharpType(property.type)} ${property.csharpName} { get; set; }`,
    )
    .join("\n");

  return `public class ${modelClass.name}\n{${properties ? `\n${properties}\n` : "\n"}}`;
}

function renderCsharpType(type: ModelType): string {
  if (type.kind === "model") {
    return type.className;
  }

  if (type.kind === "list") {
    return `List<${renderCsharpType(type.itemType)}>`;
  }

  const typeNames: Record<PrimitiveType, string> = {
    string: "string",
    integer: "int",
    decimal: "double",
    boolean: "bool",
    any: "object",
  };

  return typeNames[type.value];
}

function renderJava(classes: ModelClass[]) {
  const imports = classes.some((modelClass) =>
    modelClass.properties.some((property) => containsList(property.type)),
  )
    ? "import java.util.List;\n\n"
    : "";

  return `${imports}${classes
    .map((modelClass, index) => renderJavaClass(modelClass, index === 0))
    .join("\n\n")}`;
}

function renderJavaClass(modelClass: ModelClass, isRoot: boolean) {
  const fields = modelClass.properties
    .map(
      (property) =>
        `    private ${renderJavaType(property.type)} ${property.javaName};`,
    )
    .join("\n");
  const accessors = modelClass.properties
    .map((property) => {
      const type = renderJavaType(property.type);
      const accessorName = toPascalCase(property.javaName);

      return `    public ${type} get${accessorName}() {\n        return ${property.javaName};\n    }\n\n    public void set${accessorName}(${type} ${property.javaName}) {\n        this.${property.javaName} = ${property.javaName};\n    }`;
    })
    .join("\n\n");
  const body = [fields, accessors].filter(Boolean).join("\n\n");

  return `${isRoot ? "public " : ""}class ${modelClass.name} {${body ? `\n${body}\n` : "\n"}}`;
}

function renderJavaType(type: ModelType): string {
  if (type.kind === "model") {
    return type.className;
  }

  if (type.kind === "list") {
    return `List<${renderJavaCollectionType(type.itemType)}>`;
  }

  const typeNames: Record<PrimitiveType, string> = {
    string: "String",
    integer: "int",
    decimal: "double",
    boolean: "boolean",
    any: "Object",
  };

  return typeNames[type.value];
}

function renderJavaCollectionType(type: ModelType) {
  if (type.kind === "primitive") {
    const boxedTypes: Record<PrimitiveType, string> = {
      string: "String",
      integer: "Integer",
      decimal: "Double",
      boolean: "Boolean",
      any: "Object",
    };

    return boxedTypes[type.value];
  }

  return renderJavaType(type);
}

function containsList(type: ModelType): boolean {
  return type.kind === "list";
}

function getCsharpPropertyName(source: string) {
  const name = toPascalCase(source) || "Property";
  return startsWithNumber(name) ? `Value${name}` : name;
}

function getJavaFieldName(source: string) {
  const pascalName = toPascalCase(source) || "Property";
  let name = `${pascalName.charAt(0).toLowerCase()}${pascalName.slice(1)}`;

  if (startsWithNumber(name)) {
    name = `value${name}`;
  }

  return reservedIdentifiers.has(name) ? `${name}Value` : name;
}

function toClassName(source: string) {
  const name = toPascalCase(source) || "Model";
  return startsWithNumber(name) ? `Model${name}` : name;
}

function toPascalCase(source: string) {
  return source
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1 $2")
    .split(/[^A-Za-z0-9]+/)
    .filter(Boolean)
    .map(
      (part) => `${part.charAt(0).toUpperCase()}${part.slice(1).toLowerCase()}`,
    )
    .join("");
}

function singularize(source: string) {
  if (/(sses|shes|ches|xes|zes)$/i.test(source)) {
    return source.slice(0, -2);
  }

  if (/[^aeiou]ies$/i.test(source)) {
    return `${source.slice(0, -3)}y`;
  }

  if (/s$/i.test(source) && !/ss$/i.test(source)) {
    return source.slice(0, -1);
  }

  return source;
}

function getUniqueClassName(context: ModelContext, preferredName: string) {
  let candidate = preferredName;
  let suffix = 2;

  while (context.classNames.has(candidate)) {
    candidate = `${preferredName}${suffix}`;
    suffix += 1;
  }

  return candidate;
}

function getUniqueMemberName(
  preferredName: string,
  usedNames: Set<string>,
  className: string,
) {
  const safeName =
    preferredName === className ? `${preferredName}Value` : preferredName;
  let candidate = safeName;
  let suffix = 2;

  while (usedNames.has(candidate)) {
    candidate = `${safeName}${suffix}`;
    suffix += 1;
  }

  usedNames.add(candidate);
  return candidate;
}

function getValueShape(value: unknown): string {
  if (value === null) {
    return "null";
  }

  if (typeof value === "number") {
    return isSafeInt32(value) ? "integer" : "decimal";
  }

  if (typeof value !== "object") {
    return typeof value;
  }

  if (Array.isArray(value)) {
    const shapes = [...new Set(value.map(getValueShape))].sort();
    return `[${shapes.join("|")}]`;
  }

  if (isRecord(value)) {
    return `{${Object.keys(value)
      .sort()
      .map((key) => `${JSON.stringify(key)}:${getValueShape(value[key])}`)
      .join(",")}}`;
  }

  return "unknown";
}

function isSafeInt32(value: number) {
  return (
    Number.isSafeInteger(value) &&
    value >= -2_147_483_648 &&
    value <= 2_147_483_647
  );
}

function startsWithNumber(value: string) {
  return /^\d/.test(value);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getJsonErrorMessage(error: unknown, source: string) {
  const message = error instanceof Error ? error.message : "";
  const positionMatch = message.match(/position\s+(\d+)/i);

  if (positionMatch) {
    const position = Number(positionMatch[1]);
    const lines = source.slice(0, position).split(/\r\n|\r|\n/);
    return `Check JSON syntax near line ${lines.length}, column ${(lines[lines.length - 1]?.length ?? 0) + 1}.`;
  }

  const lineColumnMatch = message.match(
    /line\s+(\d+)(?:\s*,)?\s+column\s+(\d+)/i,
  );

  if (lineColumnMatch) {
    return `Check JSON syntax near line ${lineColumnMatch[1]}, column ${lineColumnMatch[2]}.`;
  }

  return "Check JSON syntax, quotes, separators, and trailing commas.";
}
