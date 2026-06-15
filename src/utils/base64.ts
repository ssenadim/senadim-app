interface Base64Result {
  value: string;
}

interface Base64Error {
  error: string;
}

export type Base64OperationResult = Base64Result | Base64Error;

function hasError(result: Base64OperationResult): result is Base64Error {
  return "error" in result;
}

export function encodeBase64(input: string): Base64OperationResult {
  try {
    const bytes = new TextEncoder().encode(input);
    let binary = "";
    const chunkSize = 8192;

    for (let index = 0; index < bytes.length; index += chunkSize) {
      const chunk = bytes.slice(index, index + chunkSize);
      binary += String.fromCharCode(...chunk);
    }

    return { value: btoa(binary) };
  } catch {
    return {
      error:
        "Encoding failed. Please check the input text and try again.",
    };
  }
}

export function decodeBase64(input: string): Base64OperationResult {
  const normalizedInput = input.replace(/\s/g, "");

  if (!normalizedInput) {
    return { error: "Enter a Base64 value before decoding." };
  }

  if (!/^[A-Za-z0-9+/]*={0,2}$/.test(normalizedInput)) {
    return {
      error:
        "Decoding failed because the value contains characters that are not valid in standard Base64.",
    };
  }

  if (normalizedInput.length % 4 === 1) {
    return {
      error:
        "Decoding failed because the Base64 length is invalid. Base64 values are grouped in blocks of four characters.",
    };
  }

  try {
    const paddedInput = normalizedInput.padEnd(
      normalizedInput.length + ((4 - (normalizedInput.length % 4)) % 4),
      "=",
    );
    const binary = atob(paddedInput);
    const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));
    const value = new TextDecoder("utf-8", { fatal: true }).decode(bytes);

    return { value };
  } catch {
    return {
      error:
        "Decoding failed because the input is not valid UTF-8 text after Base64 decoding.",
    };
  }
}

export function isBase64Error(
  result: Base64OperationResult,
): result is Base64Error {
  return hasError(result);
}
