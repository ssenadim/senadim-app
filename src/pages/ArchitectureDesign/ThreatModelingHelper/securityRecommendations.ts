import type {
  StrideCategory,
  ThreatModelContext,
} from "./threatIdentification";

const categoryRecommendations: Record<StrideCategory, readonly string[]> = {
  Spoofing: [
    "Validate credentials and authentication artifacts on every protected request.",
    "Use short-lived credentials or sessions and enforce expiration server-side.",
    "Use multi-factor authentication for higher-impact access where appropriate.",
    "Handle sessions with secure, unpredictable identifiers and explicit expiration.",
  ],
  Tampering: [
    "Validate and normalize untrusted input before processing it.",
    "Apply authorization before every state-changing operation.",
    "Use integrity checks when data or messages cross trust boundaries.",
  ],
  Repudiation: [
    "Record actor, action, resource, outcome, and timestamp for security-relevant operations.",
    "Protect audit records from unauthorized modification and deletion.",
    "Propagate correlation identifiers across related operations.",
  ],
  "Information Disclosure": [
    "Use transport security for all sensitive data in transit.",
    "Protect sensitive data at rest when storage is involved.",
    "Return only the data fields required by the caller.",
  ],
  "Denial of Service": [
    "Apply per-client rate limits to exposed operations.",
    "Define request body and upload size limits.",
    "Set timeouts for network and application operations.",
    "Bound concurrency and resource use for expensive operations.",
  ],
  "Elevation of Privilege": [
    "Enforce authorization server-side for every protected operation.",
    "Grant identities only the permissions required for their responsibilities.",
    "Separate administrative operations from standard user capabilities.",
    "Derive roles and permissions from trusted server-side data, not client input.",
  ],
};

interface ContextRecommendationRule {
  categories: readonly StrideCategory[];
  applies: (context: ThreatModelContext) => boolean;
  recommendations: readonly string[];
}

const contextRecommendationRules: readonly ContextRecommendationRule[] = [
  {
    categories: ["Tampering"],
    applies: ({ isInternetFacing }) => isInternetFacing,
    recommendations: [
      "Reject unexpected request shapes before state-changing logic runs.",
      "Use transport security on every internet-exposed endpoint.",
    ],
  },
  {
    categories: ["Denial of Service"],
    applies: ({ isInternetFacing }) => isInternetFacing,
    recommendations: [
      "Expose only the endpoints and methods required by external clients.",
    ],
  },
  {
    categories: ["Information Disclosure"],
    applies: ({ sensitiveData }) => sensitiveData.length > 0,
    recommendations: [
      "Keep secrets and sensitive values out of application and audit logs.",
      "Restrict sensitive-data access to the minimum required identities and services.",
    ],
  },
  {
    categories: ["Information Disclosure"],
    applies: ({ sensitiveData }) => sensitiveData.includes("Credentials"),
    recommendations: [
      "Store credentials only in protected forms and never include raw values in logs.",
    ],
  },
  {
    categories: ["Spoofing"],
    applies: ({ authentication }) =>
      authentication === "OAuth2 / OpenID Connect",
    recommendations: [
      "Validate token signatures, issuer, audience, and expiration before accepting identity.",
      "Keep access-token lifetimes short and handle expiration explicitly.",
    ],
  },
  {
    categories: ["Elevation of Privilege"],
    applies: ({ authentication }) =>
      authentication === "OAuth2 / OpenID Connect",
    recommendations: [
      "Validate required scopes and roles from trusted token claims for every protected operation.",
    ],
  },
  {
    categories: ["Spoofing"],
    applies: ({ authentication }) => authentication === "API Key",
    recommendations: [
      "Store API keys outside source code and client-visible configuration.",
      "Rotate API keys and invalidate replaced keys.",
    ],
  },
  {
    categories: ["Elevation of Privilege"],
    applies: ({ authentication }) => authentication === "API Key",
    recommendations: [
      "Restrict each API key to the operations and data it requires.",
    ],
  },
  {
    categories: ["Spoofing"],
    applies: ({ authentication }) => authentication === "Certificate",
    recommendations: [
      "Validate certificate chains, names, expiration, and configured trust anchors.",
      "Define certificate renewal and expiration handling.",
    ],
  },
  {
    categories: ["Elevation of Privilege"],
    applies: ({ authentication }) => authentication === "Certificate",
    recommendations: [
      "Map trusted certificate identities to explicit permissions.",
    ],
  },
  {
    categories: ["Spoofing"],
    applies: ({ authentication }) => authentication === "Username / Password",
    recommendations: [
      "Store passwords with a modern adaptive one-way hashing scheme.",
      "Throttle repeated authentication attempts.",
    ],
  },
  {
    categories: ["Tampering"],
    applies: ({ applicationType }) => applicationType === "REST API",
    recommendations: [
      "Allow only expected HTTP methods, content types, and request shapes.",
    ],
  },
];

export function getSecurityRecommendations(
  category: StrideCategory,
  context: ThreatModelContext,
): string[] {
  const contextRecommendations = contextRecommendationRules
    .filter(
      (rule) => rule.categories.includes(category) && rule.applies(context),
    )
    .flatMap((rule) => rule.recommendations);

  return [
    ...new Set([
      ...categoryRecommendations[category],
      ...contextRecommendations,
    ]),
  ];
}
