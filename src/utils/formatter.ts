export type FormatterType = "json" | "xml";

export interface FormatterSuccess {
  value: string;
}

export interface FormatterFailure {
  error: string;
}

export type FormatterResult = FormatterSuccess | FormatterFailure;

export function isFormatterFailure(
  result: FormatterResult,
): result is FormatterFailure {
  return "error" in result;
}

export function formatJson(input: string): FormatterResult {
  try {
    return { value: JSON.stringify(JSON.parse(input), null, 2) };
  } catch (error) {
    return {
      error: `Invalid JSON. ${getErrorMessage(error)}`,
    };
  }
}

export function minifyJson(input: string): FormatterResult {
  try {
    return { value: JSON.stringify(JSON.parse(input)) };
  } catch (error) {
    return {
      error: `Invalid JSON. ${getErrorMessage(error)}`,
    };
  }
}

export function formatXml(input: string): FormatterResult {
  const parsedXml = parseXml(input);

  if (isFormatterFailure(parsedXml)) {
    return parsedXml;
  }

  return { value: prettifyXml(parsedXml.value) };
}

export function minifyXml(input: string): FormatterResult {
  const parsedXml = parseXml(input);

  if (isFormatterFailure(parsedXml)) {
    return parsedXml;
  }

  return { value: parsedXml.value.replace(/>\s+</g, "><").trim() };
}

function parseXml(input: string): FormatterResult {
  try {
    const parser = new DOMParser();
    const document = parser.parseFromString(input, "application/xml");
    const parserError = document.querySelector("parsererror");

    if (parserError) {
      return {
        error:
          "Invalid XML. Please check for missing closing tags, malformed attributes, or invalid nesting.",
      };
    }

    return { value: new XMLSerializer().serializeToString(document) };
  } catch {
    return {
      error: "Invalid XML. Please check the document structure and try again.",
    };
  }
}

function prettifyXml(xml: string) {
  const compactXml = xml.replace(/>\s+</g, "><").trim();
  const tokens = compactXml.replace(/(>)(<)(\/*)/g, "$1\n$2$3").split("\n");
  let indentLevel = 0;

  return tokens
    .map((token) => {
      const trimmedToken = token.trim();

      if (trimmedToken.startsWith("</")) {
        indentLevel = Math.max(indentLevel - 1, 0);
      }

      const line = `${"  ".repeat(indentLevel)}${trimmedToken}`;

      if (
        trimmedToken.startsWith("<") &&
        !trimmedToken.startsWith("</") &&
        !trimmedToken.endsWith("/>") &&
        !trimmedToken.includes("</")
      ) {
        indentLevel += 1;
      }

      return line;
    })
    .join("\n");
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return "Please check the syntax and try again.";
}
