import type { ArchitectureNoteTemplate } from "../types/architectureNote";

export const architectureNoteTemplates = [
  {
    name: "System Overview",
    description: "Summarize a system's purpose, boundaries and key parts.",
    title: "System Overview",
    type: "System Overview",
    suggestedTags: ["system", "overview"],
    content: `# System Overview

## Purpose

## Main Components

## External Dependencies

## Data Flow

## Security Considerations

## Open Questions
`,
  },
  {
    name: "Integration Notes",
    description: "Capture an integration's contract, flow and failure modes.",
    title: "Integration Notes",
    type: "Integration",
    suggestedTags: ["integration", "interface"],
    content: `# Integration Notes

## Purpose

## Systems Involved

## Interface and Data Contract

## Authentication and Authorization

## Failure Handling

## Observability

## Open Questions
`,
  },
  {
    name: "Security Review",
    description:
      "Record assets, trust boundaries, controls and residual risks.",
    title: "Security Review",
    type: "Security",
    suggestedTags: ["security", "risk-review"],
    content: `# Security Review

## Scope

## Assets and Sensitive Data

## Trust Boundaries

## Threats and Abuse Cases

## Security Controls

## Residual Risks

## Follow-up Actions
`,
  },
  {
    name: "Data Flow Notes",
    description: "Describe how data enters, moves through and leaves a system.",
    title: "Data Flow Notes",
    type: "Data",
    suggestedTags: ["data-flow", "data"],
    content: `# Data Flow Notes

## Scope

## Data Sources

## Processing Steps

## Storage and Retention

## Data Destinations

## Privacy and Access Controls

## Open Questions
`,
  },
  {
    name: "Deployment Notes",
    description: "Outline deployment topology, configuration and recovery.",
    title: "Deployment Notes",
    type: "Deployment",
    suggestedTags: ["deployment", "infrastructure"],
    content: `# Deployment Notes

## Environments

## Deployment Topology

## Configuration and Secrets

## Release Process

## Rollback and Recovery

## Dependencies

## Open Questions
`,
  },
  {
    name: "Operational Notes",
    description: "Capture runtime ownership, monitoring and response guidance.",
    title: "Operational Notes",
    type: "Operations",
    suggestedTags: ["operations", "reliability"],
    content: `# Operational Notes

## Service Ownership

## Availability Expectations

## Monitoring and Alerts

## Common Failure Modes

## Recovery Procedures

## Capacity and Scaling

## Open Questions
`,
  },
  {
    name: "Open Questions",
    description: "Track unresolved architecture questions and next steps.",
    title: "Open Architecture Questions",
    type: "Open Question",
    suggestedTags: ["open-question", "follow-up"],
    content: `# Open Architecture Questions

## Context

## Questions

1. 

## Known Constraints

## Information Needed

## Owners and Next Steps
`,
  },
] as const satisfies readonly ArchitectureNoteTemplate[];
