import { getSecurityRecommendations } from "./securityRecommendations";
export const strideCategories = [
  "Spoofing",
  "Tampering",
  "Repudiation",
  "Information Disclosure",
  "Denial of Service",
  "Elevation of Privilege",
] as const;

export type StrideCategory = (typeof strideCategories)[number];

export interface ThreatModelContext {
  applicationType: string;
  authentication: string;
  sensitiveData: readonly string[];
  isInternetFacing: boolean;
}

export interface IdentifiedThreat {
  id: string;
  title: string;
  category: StrideCategory;
  explanation: string;
  whyItApplies: string;
  recommendations: readonly string[];
}

interface ThreatRule {
  id: string;
  category: StrideCategory;
  applies: (context: ThreatModelContext) => boolean;
  identify: (
    context: ThreatModelContext,
  ) => Omit<IdentifiedThreat, "id" | "category" | "recommendations">;
}

const threatRules: readonly ThreatRule[] = [
  {
    id: "identity-impersonation",
    category: "Spoofing",
    applies: ({ authentication }) => authentication !== "None",
    identify: ({ applicationType, authentication, isInternetFacing }) => ({
      title: "Identity Impersonation",
      explanation:
        "An attacker presents stolen or forged authentication material as a legitimate identity.",
      whyItApplies: `This ${formatApplicationType(applicationType)} uses ${authentication} authentication${isInternetFacing ? " on an internet-facing interface" : ""}, so its protected operations depend on the authenticity of presented identities.`,
    }),
  },
  {
    id: "external-request-tampering",
    category: "Tampering",
    applies: ({ isInternetFacing }) => isInternetFacing,
    identify: ({ applicationType }) => ({
      title:
        applicationType === "REST API"
          ? "API Request Tampering"
          : "External Input Tampering",
      explanation:
        "An attacker alters requests or input data before the application processes them.",
      whyItApplies: `This internet-facing ${formatApplicationType(applicationType)} accepts input from untrusted external clients.`,
    }),
  },
  {
    id: "disputed-authenticated-actions",
    category: "Repudiation",
    applies: ({ authentication }) => authentication !== "None",
    identify: ({ applicationType, authentication }) => ({
      title: "Disputed Authenticated Actions",
      explanation:
        "A user or service denies performing an operation attributed to its identity.",
      whyItApplies: `This ${formatApplicationType(applicationType)} performs operations under identities authenticated with ${authentication}.`,
    }),
  },
  {
    id: "sensitive-data-exposure",
    category: "Information Disclosure",
    applies: ({ sensitiveData }) => sensitiveData.length > 0,
    identify: ({ applicationType, sensitiveData }) => ({
      title: "Sensitive Data Exposure",
      explanation:
        "Sensitive information is accessed or revealed to an unintended party.",
      whyItApplies: `This ${formatApplicationType(applicationType)} handles ${formatList(sensitiveData)}, making unauthorized disclosure relevant to its data flows.`,
    }),
  },
  {
    id: "public-interface-resource-exhaustion",
    category: "Denial of Service",
    applies: ({ isInternetFacing }) => isInternetFacing,
    identify: ({ applicationType }) => ({
      title: "Public Interface Resource Exhaustion",
      explanation:
        "Repeated or expensive requests consume finite capacity and prevent legitimate use.",
      whyItApplies: `This ${formatApplicationType(applicationType)} is reachable from the internet, allowing untrusted clients to invoke its exposed interfaces.`,
    }),
  },
  {
    id: "unauthorized-privilege-use",
    category: "Elevation of Privilege",
    applies: ({ authentication }) => authentication !== "None",
    identify: ({ applicationType, authentication }) => ({
      title: "Unauthorized Privilege Use",
      explanation:
        "An authenticated identity performs operations beyond its intended level of access.",
      whyItApplies: `This ${formatApplicationType(applicationType)} accepts identities authenticated with ${authentication}, and those identities may attempt operations outside their intended access.`,
    }),
  },
];

export function identifyThreats(
  context: ThreatModelContext,
): IdentifiedThreat[] {
  return threatRules
    .filter((rule) => rule.applies(context))
    .map((rule) => ({
      id: rule.id,
      category: rule.category,
      ...rule.identify(context),
      recommendations: getSecurityRecommendations(rule.category, context),
    }));
}

function formatApplicationType(applicationType: string) {
  return applicationType.toLowerCase();
}

function formatList(items: readonly string[]) {
  if (items.length <= 1) {
    return items[0] ?? "sensitive data";
  }

  if (items.length === 2) {
    return `${items[0]} and ${items[1]}`;
  }

  return `${items.slice(0, -1).join(", ")}, and ${items[items.length - 1]}`;
}
