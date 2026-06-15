export interface UrlEncodingSuccess {
  value: string;
}

export interface UrlEncodingFailure {
  error: string;
}

export type UrlEncodingResult = UrlEncodingSuccess | UrlEncodingFailure;

export function isUrlEncodingFailure(
  result: UrlEncodingResult,
): result is UrlEncodingFailure {
  return "error" in result;
}

export function encodeUrlValue(input: string): UrlEncodingResult {
  if (!input) {
    return { error: "Enter a URL, query string, or text value first." };
  }

  try {
    return { value: encodeURIComponent(input) };
  } catch {
    return { error: "Encoding failed. Please check the input value." };
  }
}

export function decodeUrlValue(input: string): UrlEncodingResult {
  if (!input) {
    return { error: "Enter an encoded value before decoding." };
  }

  try {
    return { value: decodeURIComponent(input) };
  } catch {
    return {
      error:
        "Decoding failed because the value contains malformed percent-encoding.",
    };
  }
}
