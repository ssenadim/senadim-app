import assert from "node:assert/strict";
import test from "node:test";
import {
  formatHtml,
  formatJson,
  formatXml,
  isFormatterFailure,
  minifyHtml,
  minifyJson,
  minifyXml,
} from "../src/utils/formatter.ts";

test("JSON diagnostics highlight the complete invalid value token", () => {
  const result = formatJson('{"A":AB2,"B":"BBB"}');

  assert.equal(isFormatterFailure(result), true);
  if (!isFormatterFailure(result)) {
    return;
  }

  assert.equal(
    result.diagnostic.message,
    "String values must be enclosed in double quotes.",
  );
  assert.equal(result.diagnostic.line, 1);
  assert.equal(result.diagnostic.column, 6);
  assert.equal(result.diagnostic.startOffset, 5);
  assert.equal(result.diagnostic.endOffset, 8);
  assert.equal(result.diagnostic.length, 3);
  assert.equal(result.diagnostic.type, "range");
});

test("quoted strings, numeric values, and boolean values remain valid JSON", () => {
  const quotedResult = formatJson('{"A":"AB2","B":"BBB"}');
  const primitiveResult = minifyJson('{"A":123,"B":true}');

  assert.deepEqual(quotedResult, {
    value: '{\n  "A": "AB2",\n  "B": "BBB"\n}',
  });
  assert.deepEqual(primitiveResult, { value: '{"A":123,"B":true}' });
});

test("strict JSON rejects trailing commas with a focused diagnostic", () => {
  const result = minifyJson('{"A":"test",}');

  assert.equal(isFormatterFailure(result), true);
  if (!isFormatterFailure(result)) {
    return;
  }

  assert.equal(result.diagnostic.code, "TRAILING_COMMA");
  assert.equal(
    result.diagnostic.message,
    "Trailing commas are not allowed in JSON.",
  );
  assert.equal(result.diagnostic.line, 1);
  assert.equal(result.diagnostic.column, 13);
});

test("incomplete JSON uses a concise user-facing message", () => {
  const result = formatJson('{"A":');

  assert.equal(isFormatterFailure(result), true);
  if (!isFormatterFailure(result)) {
    return;
  }

  assert.equal(
    result.diagnostic.message,
    "The JSON input appears to be incomplete.",
  );
  assert.equal(result.diagnostic.type, "position");
});

test("multiline JSON diagnostics report the invalid value line and range", () => {
  const input = '{\n  "A": "test",\n  "B": invalid\n}';
  const result = formatJson(input);

  assert.equal(isFormatterFailure(result), true);
  if (!isFormatterFailure(result)) {
    return;
  }

  assert.equal(result.diagnostic.line, 3);
  assert.equal(result.diagnostic.column, 8);
  assert.equal(
    input.slice(result.diagnostic.startOffset, result.diagnostic.endOffset),
    "invalid",
  );
});

test("strict JSON rejects comments and unquoted property names", () => {
  const commentResult = formatJson('{/* note */"A":1}');
  const propertyResult = formatJson("{A:1}");

  assert.equal(isFormatterFailure(commentResult), true);
  assert.equal(isFormatterFailure(propertyResult), true);
  if (
    !isFormatterFailure(commentResult) ||
    !isFormatterFailure(propertyResult)
  ) {
    return;
  }

  assert.equal(
    commentResult.diagnostic.message,
    "Comments are not allowed in strict JSON.",
  );
  assert.equal(
    propertyResult.diagnostic.message,
    "Property names must be enclosed in double quotes.",
  );
});

test("valid nested XML formats and minifies without diagnostics", () => {
  const input = "<customer><name>John</name></customer>";

  assert.deepEqual(formatXml(input), {
    value: "<customer>\n  <name>John</name>\n</customer>",
  });
  assert.deepEqual(minifyXml(input), { value: input });
});

test("mismatched XML tags return a parser-derived position diagnostic", () => {
  const result = formatXml("<customer><name>John</customer>");

  assert.equal(isFormatterFailure(result), true);
  if (!isFormatterFailure(result)) {
    return;
  }

  assert.equal(result.diagnostic.format, "xml");
  assert.equal(result.diagnostic.type, "position");
  assert.equal(result.diagnostic.line, 1);
  assert.equal(typeof result.diagnostic.column, "number");
  assert.equal(
    result.diagnostic.message,
    "Closing </customer> does not match the open <name> element.",
  );
});

test("unclosed XML elements return a parser-derived position diagnostic", () => {
  const result = minifyXml("<root><child>");

  assert.equal(isFormatterFailure(result), true);
  if (!isFormatterFailure(result)) {
    return;
  }

  assert.equal(result.diagnostic.format, "xml");
  assert.equal(result.diagnostic.type, "position");
  assert.equal(
    result.diagnostic.message,
    "Element <child> is missing a closing tag.",
  );
});

test("malformed XML attributes use a concise parser-derived message", () => {
  const result = formatXml('<root name="value></root>');

  assert.equal(isFormatterFailure(result), true);
  if (!isFormatterFailure(result)) {
    return;
  }

  assert.equal(
    result.diagnostic.message,
    "An attribute value is missing its closing quote.",
  );
  assert.equal(result.diagnostic.type, "position");
});

test("valid HTML keeps existing beautify and minify behavior", () => {
  const input = "<main><h1>Hello</h1><p>Welcome</p></main>";

  assert.deepEqual(formatHtml(input), {
    value: "<main>\n  <h1>Hello</h1>\n  <p>Welcome</p>\n</main>",
  });
  assert.deepEqual(minifyHtml(input), { value: input });
});

test("supported malformed HTML highlights an unclosed comment marker", () => {
  const input = "<main><!-- unfinished comment</main>";
  const result = formatHtml(input);

  assert.equal(isFormatterFailure(result), true);
  if (!isFormatterFailure(result)) {
    return;
  }

  assert.equal(result.diagnostic.format, "html");
  assert.equal(result.diagnostic.type, "range");
  assert.equal(
    input.slice(result.diagnostic.startOffset, result.diagnostic.endOffset),
    "<!--",
  );
  assert.match(result.diagnostic.message, /missing its closing/i);
});

test("recoverable HTML is not rejected using XML-style tag rules", () => {
  const result = formatHtml("<main><p>One<p>Two</main>");

  assert.equal(isFormatterFailure(result), false);
});

test("HTML script content is not misidentified as markup", () => {
  const result = minifyHtml(
    "<main><script>if (left < right) { run(); }</script></main>",
  );

  assert.equal(isFormatterFailure(result), false);
});
