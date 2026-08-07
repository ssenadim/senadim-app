import type {
  StrideCategory,
  ThreatModelContext,
} from "./threatIdentification";

export type RiskRating = "Low" | "Medium" | "High";
export type RiskLevel = RiskRating | "Critical";

export interface RiskAssessment {
  likelihood: RiskRating;
  impact: RiskRating;
  riskLevel: RiskLevel;
  explanation: string;
}

export const riskMatrix: Record<RiskRating, Record<RiskRating, RiskLevel>> = {
  Low: {
    Low: "Low",
    Medium: "Low",
    High: "Medium",
  },
  Medium: {
    Low: "Low",
    Medium: "Medium",
    High: "High",
  },
  High: {
    Low: "Medium",
    Medium: "High",
    High: "Critical",
  },
};

interface AssessmentRule {
  points: number;
  applies: (category: StrideCategory, context: ThreatModelContext) => boolean;
  reason: (context: ThreatModelContext) => string;
}

const likelihoodRules: readonly AssessmentRule[] = [
  {
    points: 1,
    applies: (_category, { isInternetFacing }) => isInternetFacing,
    reason: () => "the application is internet-facing",
  },
  {
    points: 1,
    applies: (category, { authentication }) =>
      category === "Spoofing" && authentication !== "None",
    reason: () => "authenticated identities can be targeted",
  },
  {
    points: 1,
    applies: (category, { sensitiveData }) =>
      category === "Information Disclosure" && sensitiveData.length > 0,
    reason: () => "the project processes sensitive data",
  },
  {
    points: 1,
    applies: (category, { applicationType, isInternetFacing }) =>
      applicationType === "REST API" &&
      isInternetFacing &&
      (category === "Tampering" || category === "Denial of Service"),
    reason: () => "the REST API is externally accessible",
  },
  {
    points: 1,
    applies: (category, { authentication }) =>
      authentication === "None" &&
      (category === "Spoofing" || category === "Elevation of Privilege"),
    reason: () => "protected access does not use authentication",
  },
];

const impactRules: readonly AssessmentRule[] = [
  {
    points: 2,
    applies: (_category, { sensitiveData }) =>
      sensitiveData.some((dataType) =>
        ["Financial Data", "Credentials", "Health Data"].includes(dataType),
      ),
    reason: ({ sensitiveData }) =>
      `the project handles ${formatList(
        sensitiveData.filter((dataType) =>
          ["Financial Data", "Credentials", "Health Data"].includes(dataType),
        ),
      )}`,
  },
  {
    points: 1,
    applies: (_category, { sensitiveData }) =>
      sensitiveData.some((dataType) =>
        ["Personal Data", "Internal Business Data"].includes(dataType),
      ),
    reason: ({ sensitiveData }) =>
      `the project handles ${formatList(
        sensitiveData.filter((dataType) =>
          ["Personal Data", "Internal Business Data"].includes(dataType),
        ),
      )}`,
  },
  {
    points: 2,
    applies: (category) => category === "Elevation of Privilege",
    reason: () => "the threat could grant access beyond intended privileges",
  },
  {
    points: 1,
    applies: (category, { sensitiveData }) =>
      category === "Information Disclosure" && sensitiveData.length > 0,
    reason: () => "the threat could expose selected sensitive data",
  },
];

const riskPriority: Record<RiskLevel, number> = {
  Low: 0,
  Medium: 1,
  High: 2,
  Critical: 3,
};

export function assessThreatRisk(
  category: StrideCategory,
  context: ThreatModelContext,
): RiskAssessment {
  const likelihoodResult = applyRules(likelihoodRules, category, context);
  const impactResult = applyRules(impactRules, category, context);
  const riskLevel = riskMatrix[likelihoodResult.rating][impactResult.rating];

  return {
    likelihood: likelihoodResult.rating,
    impact: impactResult.rating,
    riskLevel,
    explanation: buildExplanation(likelihoodResult, impactResult, riskLevel),
  };
}

export function sortThreatsByRisk<T extends { riskAssessment: RiskAssessment }>(
  threats: readonly T[],
): T[] {
  return threats
    .map((threat, index) => ({ threat, index }))
    .sort(
      (left, right) =>
        riskPriority[right.threat.riskAssessment.riskLevel] -
          riskPriority[left.threat.riskAssessment.riskLevel] ||
        left.index - right.index,
    )
    .map(({ threat }) => threat);
}

function applyRules(
  rules: readonly AssessmentRule[],
  category: StrideCategory,
  context: ThreatModelContext,
) {
  const matchingRules = rules.filter((rule) => rule.applies(category, context));
  const points = matchingRules.reduce((total, rule) => total + rule.points, 0);

  return {
    rating: ratingFromPoints(points),
    reasons: matchingRules.map((rule) => rule.reason(context)),
  };
}

function ratingFromPoints(points: number): RiskRating {
  if (points >= 2) {
    return "High";
  }

  if (points === 1) {
    return "Medium";
  }

  return "Low";
}

function buildExplanation(
  likelihood: { rating: RiskRating; reasons: string[] },
  impact: { rating: RiskRating; reasons: string[] },
  riskLevel: RiskLevel,
) {
  return `Likelihood is ${likelihood.rating} because ${formatReasons(
    likelihood.reasons,
    "no likelihood-increasing project conditions apply",
  )}. Impact is ${impact.rating} because ${formatReasons(
    impact.reasons,
    "no impact-increasing project conditions apply",
  )}. The matrix maps these values to ${riskLevel} risk.`;
}

function formatReasons(reasons: readonly string[], fallback: string) {
  return reasons.length > 0 ? formatList(reasons) : fallback;
}

function formatList(items: readonly string[]) {
  if (items.length <= 1) {
    return items[0] ?? "";
  }

  if (items.length === 2) {
    return `${items[0]} and ${items[1]}`;
  }

  return `${items.slice(0, -1).join(", ")}, and ${items[items.length - 1]}`;
}
