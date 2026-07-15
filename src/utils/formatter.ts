export type FormatterType = "json" | "xml" | "html";

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

export function formatHtml(input: string): FormatterResult {
  const validation = validateHtml(input);

  if (validation) {
    return validation;
  }

  const protectedHtml = protectHtmlBlocks(input);
  const compactHtml = protectedHtml.value.replace(/>\s+</g, "><").trim();

  return { value: restoreHtmlBlocks(prettifyHtml(compactHtml), protectedHtml.blocks) };
}

export function minifyHtml(input: string): FormatterResult {
  const validation = validateHtml(input);

  if (validation) {
    return validation;
  }

  const protectedHtml = protectHtmlBlocks(input);
  const minifiedHtml = protectedHtml.value.replace(/>\s+</g, "><").trim();

  return { value: restoreHtmlBlocks(minifiedHtml, protectedHtml.blocks) };
}
function validateHtml(input: string): FormatterFailure | null {
  if (!input.trim()) {
    return { error: "HTML input is empty." };
  }

  const protectedHtml = protectHtmlBlocks(input);
  const withoutComments = protectedHtml.value.replace(/<!--[\s\S]*?-->/g, "");

  if (withoutComments.includes("<!--")) {
    return { error: "Invalid HTML. A comment is missing its closing --> marker." };
  }

  const stack: string[] = [];
  const tagPattern = /<\/?([A-Za-z][\w:-]*)(?:\s[^<>]*?)?\/?\s*>/g;
  let match: RegExpExecArray | null;

  while ((match = tagPattern.exec(withoutComments))) {
    const token = match[0];
    const tagName = match[1].toLowerCase();
    const isClosingTag = token.startsWith("</");
    const isSelfClosing = /\/\s*>$/.test(token) || isHtmlVoidElement(token);

    if (isClosingTag) {
      const openingTag = stack.pop();
      if (openingTag !== tagName) {
        return { error: `Invalid HTML. Closing </${tagName}> does not match the expected tag.` };
      }
    } else if (!isSelfClosing) {
      stack.push(tagName);
    }
  }

  if (stack.length > 0) {
    return { error: `Invalid HTML. Missing closing </${stack[stack.length - 1]}> tag.` };
  }

  return null;
}

function protectHtmlBlocks(html: string) {
  const blocks: string[] = [];
  const value = html.replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1\s*>/gi, (block) => {
    const placeholder = `@@HTML_BLOCK_${blocks.length}@@`;
    blocks.push(block);
    return placeholder;
  });

  return { value, blocks };
}

function restoreHtmlBlocks(html: string, blocks: string[]) {
  return blocks.reduce(
    (result, block, index) => result.replace(`@@HTML_BLOCK_${index}@@`, block),
    html,
  );
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

function prettifyHtml(html: string) {
  const tokens = html.replace(/(>)(<)(\/*)/g, "$1\n$2$3").split("\n");
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
        !trimmedToken.startsWith("<!") &&
        !trimmedToken.endsWith("/>") &&
        !trimmedToken.includes("</") &&
        !isHtmlVoidElement(trimmedToken)
      ) {
        indentLevel += 1;
      }

      return line;
    })
    .join("\n");
}

function isHtmlVoidElement(token: string) {
  return /^<(area|base|br|col|embed|hr|img|input|link|meta|param|source|track|wbr)(\s|>)/i.test(token);
}
function getErrorMessage(error: unknown) {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return "Please check the syntax and try again.";
}
