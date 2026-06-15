export type PkceMethod = "S256" | "plain";

const verifierCharacters =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~";

export function generateCodeVerifier(length = 64) {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);

  return Array.from(bytes)
    .map((byte) => verifierCharacters[byte % verifierCharacters.length])
    .join("");
}

export async function generateCodeChallenge(
  verifier: string,
  method: PkceMethod,
) {
  if (method === "plain") {
    return verifier;
  }

  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(verifier),
  );

  return base64UrlEncode(new Uint8Array(digest));
}

export function validateVerifier(verifier: string) {
  if (!verifier.trim()) {
    return "Enter or generate a code verifier first.";
  }

  if (verifier.length < 43 || verifier.length > 128) {
    return "Code verifier must be between 43 and 128 characters.";
  }

  if (!/^[A-Za-z0-9\-._~]+$/.test(verifier)) {
    return "Code verifier contains unsupported characters.";
  }

  return "";
}

function base64UrlEncode(bytes: Uint8Array) {
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });

  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
