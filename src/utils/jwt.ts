export interface DecodedJwt {
  header: Record<string, unknown>;
  payload: Record<string, unknown>;
  signature: string;
}

export interface JwtWarning {
  title: string;
  description: string;
}

export interface JwtClaimEntry {
  key: string;
  value: string;
}

export interface JwtFailure {
  error: string;
}

export type JwtDecodeResult = DecodedJwt | JwtFailure;

export function isJwtFailure(result: JwtDecodeResult): result is JwtFailure {
  return "error" in result;
}

export function decodeJwt(token: string): JwtDecodeResult {
  const parts = token.trim().split(".");

  if (parts.length !== 3) {
    return { error: "JWT must contain header, payload, and signature parts." };
  }

  try {
    return {
      header: JSON.parse(decodeBase64Url(parts[0])) as Record<string, unknown>,
      payload: JSON.parse(decodeBase64Url(parts[1])) as Record<string, unknown>,
      signature: parts[2],
    };
  } catch {
    return { error: "JWT could not be decoded. Check that the token is valid." };
  }
}

export function getStringClaim(payload: Record<string, unknown>, key: string) {
  const value = payload[key];

  if (typeof value === "string") {
    return value;
  }

  if (typeof value === "number") {
    return value.toString();
  }

  if (Array.isArray(value)) {
    return value.join(", ");
  }

  return "";
}

export function getTokenStatus(payload: Record<string, unknown>) {
  const nowSeconds = Math.floor(Date.now() / 1000);
  const exp = getNumericClaim(payload, "exp");
  const nbf = getNumericClaim(payload, "nbf");

  if (exp && exp < nowSeconds) {
    return "Expired";
  }

  if (nbf && nbf > nowSeconds) {
    return "Not Yet Valid";
  }

  if (exp || nbf || getNumericClaim(payload, "iat")) {
    return "Active";
  }

  return "Unknown";
}

export function getNumericClaim(payload: Record<string, unknown>, key: string) {
  const value = payload[key];

  if (typeof value === "number") {
    return value;
  }

  if (typeof value === "string" && /^\d+$/.test(value)) {
    return Number(value);
  }

  return null;
}

export function getSecurityWarnings(decoded: DecodedJwt) {
  const warnings: JwtWarning[] = [];

  if (decoded.header.alg === "none") {
    warnings.push({
      title: "alg=none",
      description: "This token declares no signing algorithm.",
    });
  }

  if (!getNumericClaim(decoded.payload, "exp")) {
    warnings.push({
      title: "Missing exp",
      description: "This token does not declare an expiration time.",
    });
  }

  if (!decoded.header.typ) {
    warnings.push({
      title: "Missing typ",
      description: "This token header does not declare a token type.",
    });
  }

  return warnings;
}

export function getClaimEntries(decoded: DecodedJwt) {
  return [
    ...flattenClaims("header", decoded.header),
    ...flattenClaims("payload", decoded.payload),
  ];
}

export function formatJwtDate(seconds: number, timeZone?: string) {
  return new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
    timeZone,
  })
    .format(new Date(seconds * 1000))
    .replace(",", "");
}

export function extractRolesAndScopes(payload: Record<string, unknown>) {
  const values: string[] = [];
  collectValue(values, payload.roles);
  collectValue(values, getNested(payload, ["realm_access", "roles"]));
  collectResourceRoles(values, payload.resource_access);
  collectValue(values, payload.scope);
  collectValue(values, payload.scp);

  return Array.from(new Set(values));
}

function decodeBase64Url(value: string) {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(
    normalized.length + ((4 - (normalized.length % 4)) % 4),
    "=",
  );
  const binary = atob(padded);
  const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));

  return new TextDecoder().decode(bytes);
}

function collectValue(target: string[], value: unknown) {
  if (typeof value === "string") {
    target.push(...value.split(" ").filter(Boolean));
  } else if (Array.isArray(value)) {
    target.push(...value.map(String));
  }
}

function collectResourceRoles(target: string[], value: unknown) {
  if (!value || typeof value !== "object") {
    return;
  }

  Object.values(value).forEach((resource) => {
    if (resource && typeof resource === "object" && "roles" in resource) {
      collectValue(target, resource.roles);
    }
  });
}

function flattenClaims(
  prefix: string,
  source: Record<string, unknown>,
): JwtClaimEntry[] {
  return Object.entries(source).flatMap(([key, value]) => {
    const path = `${prefix}.${key}`;

    if (value && typeof value === "object" && !Array.isArray(value)) {
      return flattenClaims(path, value as Record<string, unknown>);
    }

    return [{ key: path, value: Array.isArray(value) ? value.join(", ") : String(value) }];
  });
}

function getNested(source: Record<string, unknown>, path: string[]) {
  return path.reduce<unknown>((current, key) => {
    if (current && typeof current === "object" && key in current) {
      return (current as Record<string, unknown>)[key];
    }

    return undefined;
  }, source);
}
