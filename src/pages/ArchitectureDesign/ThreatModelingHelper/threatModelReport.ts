import type { IdentifiedThreat } from "./threatIdentification";

export interface ThreatModelReportInput {
  projectName: string;
  applicationType: string;
  authentication: string;
  isInternetFacing: boolean;
  sensitiveData: readonly string[];
  threats: readonly IdentifiedThreat[];
}

export function generateThreatModelReport({
  projectName,
  applicationType,
  authentication,
  isInternetFacing,
  sensitiveData,
  threats,
}: ThreatModelReportInput): string {
  if (threats.length === 0) {
    return "";
  }

  const counts = {
    Critical: 0,
    High: 0,
    Medium: 0,
    Low: 0,
  };

  threats.forEach((threat) => {
    counts[threat.riskAssessment.riskLevel] += 1;
  });

  const lines = [
    "# Threat Model",
    "",
    "## Project Information",
    "",
    `- **Project Name:** ${escapeMarkdownInline(projectName.trim() || "Not provided")}`,
    `- **Application Type:** ${applicationType}`,
    `- **Authentication:** ${authentication}`,
    `- **Internet Facing:** ${isInternetFacing ? "Yes" : "No"}`,
    `- **Sensitive Data:** ${sensitiveData.length > 0 ? sensitiveData.join(", ") : "None selected"}`,
    "",
    "## Executive Summary",
    "",
    `- **Total Identified Threats:** ${threats.length}`,
    `- **Critical Threats:** ${counts.Critical}`,
    `- **High Threats:** ${counts.High}`,
    `- **Medium Threats:** ${counts.Medium}`,
    `- **Low Threats:** ${counts.Low}`,
    "",
    "## Identified Threats",
  ];

  threats.forEach((threat) => {
    lines.push(
      "",
      `### ${threat.title}`,
      "",
      `- **STRIDE Category:** ${threat.category}`,
      `- **Likelihood:** ${threat.riskAssessment.likelihood}`,
      `- **Impact:** ${threat.riskAssessment.impact}`,
      `- **Risk Level:** ${threat.riskAssessment.riskLevel}`,
      "",
      "#### Description",
      "",
      threat.explanation,
      "",
      "#### Why It Applies",
      "",
      threat.whyItApplies,
      "",
      "#### Recommended Mitigations",
      "",
      ...threat.recommendations.map((recommendation) => `- ${recommendation}`),
    );
  });

  return `${lines.join("\n")}\n`;
}

export function getThreatModelFilename(projectName: string): string {
  const slug = projectName
    .trim()
    .toLowerCase()
    .replace(/\u0131/g, "i")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80)
    .replace(/-+$/g, "");

  return slug ? `threat-model-${slug}.md` : "threat-model.md";
}

function escapeMarkdownInline(value: string) {
  return value.replace(/([\\`*_[\]<>])/g, "\\$1");
}
