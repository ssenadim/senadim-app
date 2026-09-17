import { DOMParser as XmlDomParser, XMLSerializer } from "@xmldom/xmldom";
import {
  parse as parseJsonWithDiagnostics,
  printParseErrorCode,
  type ParseError,
} from "jsonc-parser";
import type { ValidationDiagnostic } from "../types/validationDiagnostic";

export type FormatterType = "json" | "xml" | "html";

const jsonParseErrorCode = {
  InvalidSymbol: 1,
  InvalidNumberFormat: 2,
  PropertyNameExpected: 3,
  ValueExpected: 4,
  ColonExpected: 5,
  CommaExpected: 6,
  CloseBraceExpected: 7,
  CloseBracketExpected: 8,
  EndOfFileExpected: 9,
  InvalidCommentToken: 10,
  UnexpectedEndOfComment: 11,
  UnexpectedEndOfString: 12,
  UnexpectedEndOfNumber: 13,
  InvalidUnicode: 14,
  InvalidEscapeCharacter: 15,
  InvalidCharacter: 16,
} as const;

export interface FormatterSuccess {
  value: string;
}

export interface FormatterFailure {
  error: string;
  diagnostic: ValidationDiagnostic;
}

export type FormatterResult = FormatterSuccess | FormatterFailure;

export function isFormatterFailure(
  result: FormatterResult,
): result is FormatterFailure {
  return "error" in result;
}

export function formatJson(input: string): FormatterResult {
  const validation = validateJson(input);

  if (validation) {
    return validation;
  }

  return { value: JSON.stringify(JSON.parse(input), null, 2) };
}

export function minifyJson(input: string): FormatterResult {
  const validation = validateJson(input);

  if (validation) {
    return validation;
  }

  return { value: JSON.stringify(JSON.parse(input)) };
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

  return {
    value: restoreHtmlBlocks(prettifyHtml(compactHtml), protectedHtml.blocks),
  };
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
    return createFailure("html", "HTML input is empty.", {
      code: "EMPTY_INPUT",
      type: "general",
    });
  }

  const protectedHtml = maskHtmlBlocks(input);
  const unclosedCommentOffset = findUnclosedHtmlComment(protectedHtml);

  if (unclosedCommentOffset !== -1) {
    return createFailure(
      "html",
      "A comment is missing its closing --> marker.",
      createRangeDetails(input, unclosedCommentOffset, 4, "UNCLOSED_COMMENT"),
    );
  }

  return null;
}

function protectHtmlBlocks(html: string) {
  const blocks: string[] = [];
  const value = html.replace(
    /<(script|style)\b[^>]*>[\s\S]*?<\/\1\s*>/gi,
    (block) => {
      const placeholder = `@@HTML_BLOCK_${blocks.length}@@`;
      blocks.push(block);
      return placeholder;
    },
  );

  return { value, blocks };
}

function maskHtmlBlocks(html: string) {
  return html.replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1\s*>/gi, (block) =>
    " ".repeat(block.length),
  );
}

function findUnclosedHtmlComment(html: string) {
  let searchOffset = 0;

  while (searchOffset < html.length) {
    const commentStart = html.indexOf("<!--", searchOffset);
    if (commentStart === -1) {
      return -1;
    }

    const commentEnd = html.indexOf("-->", commentStart + 4);
    if (commentEnd === -1) {
      return commentStart;
    }

    searchOffset = commentEnd + 3;
  }

  return -1;
}

function restoreHtmlBlocks(html: string, blocks: string[]) {
  return blocks.reduce(
    (result, block, index) => result.replace(`@@HTML_BLOCK_${index}@@`, block),
    html,
  );
}
function parseXml(input: string): FormatterResult {
  if (!input.trim()) {
    return createFailure("xml", "XML input is empty.", {
      code: "EMPTY_INPUT",
      type: "general",
    });
  }

  let parserDiagnostic: ValidationDiagnostic | null = null;

  try {
    const parser = new XmlDomParser({
      locator: true,
      onError: (level, message, context) => {
        if (parserDiagnostic) {
          return;
        }

        const locator = context?.locator as
          | { lineNumber?: number; columnNumber?: number }
          | undefined;
        parserDiagnostic = createPositionDiagnostic(
          input,
          "xml",
          getXmlDiagnosticMessage(message),
          locator?.lineNumber,
          locator?.columnNumber,
          `XML_${level.toUpperCase()}`,
        );
      },
    });
    const document = parser.parseFromString(input, "application/xml");

    if (parserDiagnostic) {
      return createFailureFromDiagnostic(parserDiagnostic);
    }

    return { value: new XMLSerializer().serializeToString(document) };
  } catch (error) {
    if (parserDiagnostic) {
      return createFailureFromDiagnostic(parserDiagnostic);
    }

    const locator = getXmlErrorLocator(error);
    return createFailureFromDiagnostic(
      createPositionDiagnostic(
        input,
        "xml",
        getXmlDiagnosticMessage(getErrorMessage(error)),
        locator?.lineNumber,
        locator?.columnNumber,
        "XML_FATAL_ERROR",
      ),
    );
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
  return /^<(area|base|br|col|embed|hr|img|input|link|meta|param|source|track|wbr)(\s|>)/i.test(
    token,
  );
}

function validateJson(input: string): FormatterFailure | null {
  const errors: ParseError[] = [];
  parseJsonWithDiagnostics(input, errors, {
    allowEmptyContent: false,
    allowTrailingComma: false,
    disallowComments: true,
  });

  if (errors.length === 0) {
    return null;
  }

  const diagnostic = createJsonDiagnostic(input, errors[0]);
  return createFailureFromDiagnostic(diagnostic);
}

export function createJsonDiagnostic(
  input: string,
  parseError: ParseError,
): ValidationDiagnostic {
  const isTrailingComma =
    (parseError.error === jsonParseErrorCode.PropertyNameExpected ||
      parseError.error === jsonParseErrorCode.ValueExpected) &&
    getPreviousNonWhitespaceCharacter(input, parseError.offset) === ",";
  const isUnexpectedEnd =
    parseError.offset >= input.trimEnd().length &&
    (parseError.error === jsonParseErrorCode.ValueExpected ||
      parseError.error === jsonParseErrorCode.PropertyNameExpected ||
      parseError.error === jsonParseErrorCode.CloseBraceExpected ||
      parseError.error === jsonParseErrorCode.CloseBracketExpected);
  const message = isTrailingComma
    ? "Trailing commas are not allowed in JSON."
    : isUnexpectedEnd
      ? "The JSON input appears to be incomplete."
      : getJsonDiagnosticMessage(input, parseError);
  const length = Math.max(
    parseError.length,
    parseError.offset < input.length ? 1 : 0,
  );

  return {
    message,
    severity: "error",
    format: "json",
    ...createRangeDetails(
      input,
      parseError.offset,
      length,
      isTrailingComma
        ? "TRAILING_COMMA"
        : printParseErrorCode(parseError.error),
    ),
  };
}

function getJsonDiagnosticMessage(input: string, parseError: ParseError) {
  switch (parseError.error) {
    case jsonParseErrorCode.InvalidSymbol: {
      const nextCharacter = getNextNonWhitespaceCharacter(
        input,
        parseError.offset + parseError.length,
      );
      return nextCharacter === ":"
        ? "Property names must be enclosed in double quotes."
        : "String values must be enclosed in double quotes.";
    }
    case jsonParseErrorCode.InvalidCommentToken:
    case jsonParseErrorCode.UnexpectedEndOfComment:
      return "Comments are not allowed in strict JSON.";
    case jsonParseErrorCode.UnexpectedEndOfString:
      return "The string is missing a closing double quote.";
    case jsonParseErrorCode.InvalidNumberFormat:
    case jsonParseErrorCode.UnexpectedEndOfNumber:
      return "The number is not valid JSON.";
    case jsonParseErrorCode.PropertyNameExpected:
      return "A property name enclosed in double quotes is required here.";
    case jsonParseErrorCode.ValueExpected:
      return "A JSON value is required here.";
    case jsonParseErrorCode.ColonExpected:
      return "A colon is required after the property name.";
    case jsonParseErrorCode.CommaExpected:
      return "A comma is required between JSON values.";
    case jsonParseErrorCode.CloseBraceExpected:
      return "The object is missing a closing brace.";
    case jsonParseErrorCode.CloseBracketExpected:
      return "The array is missing a closing bracket.";
    case jsonParseErrorCode.EndOfFileExpected:
      return "Unexpected content appears after the JSON value.";
    case jsonParseErrorCode.InvalidUnicode:
      return "The string contains an invalid Unicode escape sequence.";
    case jsonParseErrorCode.InvalidEscapeCharacter:
      return "The string contains an invalid escape character.";
    case jsonParseErrorCode.InvalidCharacter:
      return "The JSON contains an invalid character.";
    default:
      return "Please check the JSON syntax and try again.";
  }
}

function createRangeDetails(
  input: string,
  startOffset: number,
  length: number,
  code: string,
) {
  const safeStart = Math.max(0, Math.min(startOffset, input.length));
  const safeLength = Math.max(0, Math.min(length, input.length - safeStart));
  const location = getLineAndColumn(input, safeStart);

  return {
    ...location,
    startOffset: safeStart,
    endOffset: safeStart + safeLength,
    length: safeLength,
    code,
    type: safeLength > 0 ? ("range" as const) : ("position" as const),
  };
}

function createPositionDiagnostic(
  input: string,
  format: "xml",
  message: string,
  line?: number,
  column?: number,
  code?: string,
): ValidationDiagnostic {
  if (!line || !column) {
    return {
      message,
      severity: "error",
      format,
      code,
      type: "general",
    };
  }

  const startOffset = getOffsetFromLineAndColumn(input, line, column);
  return {
    message,
    severity: "error",
    format,
    line,
    column,
    startOffset,
    endOffset: startOffset,
    length: 0,
    code,
    type: "position",
  };
}

function createFailure(
  format: ValidationDiagnostic["format"],
  message: string,
  details: Partial<ValidationDiagnostic>,
): FormatterFailure {
  return createFailureFromDiagnostic({
    message,
    severity: "error",
    format,
    ...details,
  });
}

function createFailureFromDiagnostic(
  diagnostic: ValidationDiagnostic,
): FormatterFailure {
  return {
    error: `Invalid ${diagnostic.format.toUpperCase()}. ${diagnostic.message}`,
    diagnostic,
  };
}

function getLineAndColumn(input: string, offset: number) {
  const beforeOffset = input.slice(0, offset);
  const lines = beforeOffset.split(/\r\n|\r|\n/);

  return {
    line: lines.length,
    column: (lines[lines.length - 1]?.length ?? 0) + 1,
  };
}

function getOffsetFromLineAndColumn(
  input: string,
  line: number,
  column: number,
) {
  const lines = input.split(/\r\n|\r|\n/);
  const targetLine = Math.max(1, Math.min(line, lines.length));
  let offset = 0;

  for (let index = 0; index < targetLine - 1; index += 1) {
    offset += lines[index].length;
    const lineEnding = input.slice(offset).match(/^(\r\n|\r|\n)/)?.[0] ?? "";
    offset += lineEnding.length;
  }

  return Math.min(offset + Math.max(column - 1, 0), input.length);
}

function getPreviousNonWhitespaceCharacter(input: string, offset: number) {
  for (let index = offset - 1; index >= 0; index -= 1) {
    if (!/\s/.test(input[index])) {
      return input[index];
    }
  }

  return "";
}

function getNextNonWhitespaceCharacter(input: string, offset: number) {
  for (let index = offset; index < input.length; index += 1) {
    if (!/\s/.test(input[index])) {
      return input[index];
    }
  }

  return "";
}

function getXmlDiagnosticMessage(message: string) {
  const trimmedMessage = message.replace(/\s+/g, " ").trim();
  if (!trimmedMessage) {
    return "Please check the document structure and try again.";
  }

  const mismatchedTags = trimmedMessage.match(
    /Opening and ending tag mismatch:\s*["']([^"']+)["']\s*!=\s*["']([^"']+)["']/i,
  );
  if (mismatchedTags) {
    return `Closing </${mismatchedTags[2]}> does not match the open <${mismatchedTags[1]}> element.`;
  }

  const unclosedTags = trimmedMessage.match(/unclosed xml tag\(s\):\s*(.+)/i);
  if (unclosedTags) {
    const tagNames = unclosedTags[1]
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean);
    const tagName = tagNames[tagNames.length - 1];
    if (tagName) {
      return `Element <${tagName}> is missing a closing tag.`;
    }
  }

  if (/attribute value no end/i.test(trimmedMessage)) {
    return "An attribute value is missing its closing quote.";
  }

  if (/missing root element/i.test(trimmedMessage)) {
    return "The XML document is missing a root element.";
  }

  if (/Unexpected content outside root element/i.test(trimmedMessage)) {
    return "Content is not allowed outside the XML root element.";
  }

  return /[.!?]$/.test(trimmedMessage) ? trimmedMessage : `${trimmedMessage}.`;
}

function getXmlErrorLocator(error: unknown) {
  if (!(error instanceof Error) || !("locator" in error)) {
    return undefined;
  }

  return (
    error as Error & {
      locator?: { lineNumber?: number; columnNumber?: number };
    }
  ).locator;
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return "Please check the syntax and try again.";
}
