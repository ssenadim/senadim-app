import { useEffect, useMemo, useState } from "react";
import { Alert, Button, Select, TextInput, Textarea } from "flowbite-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { HelpTooltip } from "../../../components/common/HelpTooltip";
import { ToolToast } from "../../../components/common/ToolToast";
import { ToolPageLayout } from "../../../components/layout/ToolPageLayout";
import { usePageTitle } from "../../../hooks/usePageTitle";
import type { ToolExample } from "../../../types/toolPage";
import type { ToastMessage, ToastTone } from "../../../types/toast";
import { readArchitectureNoteAdrHandoff } from "../../../utils/architectureNotes";
import { routePaths } from "../../../utils/routes";

type AdrStatus =
  | "Draft"
  | "Proposed"
  | "Accepted"
  | "Deprecated"
  | "Superseded"
  | "Rejected";

interface AdrForm {
  title: string;
  number: string;
  status: AdrStatus;
  decisionDate: string;
  author: string;
  stakeholders: string[];
  tags: string;
  drivers: string[];
  context: string;
  decision: string;
  alternatives: string;
  consequences: string;
  negativeConsequences: string;
}

interface AdrTemplate {
  title: string;
  form: AdrForm;
}

interface AdrTemplateGroup {
  category: string;
  templates: AdrTemplate[];
}

const decisionDrivers = [
  "Security",
  "Performance",
  "Scalability",
  "Availability",
  "Maintainability",
  "Operational Simplicity",
  "Compliance",
  "Cost",
  "Developer Experience",
  "Observability",
  "Reliability",
  "Portability",
];

const stakeholderOptions = [
  "Architecture Team",
  "Platform Team",
  "Security Team",
  "Development Team",
  "Operations Team",
];

const statusOptions: AdrStatus[] = [
  "Draft",
  "Proposed",
  "Accepted",
  "Deprecated",
  "Superseded",
  "Rejected",
];

function getTodayDate() {
  return new Date().toISOString().slice(0, 10);
}

const emptyForm: AdrForm = {
  title: "",
  number: "001",
  status: "Accepted",
  decisionDate: getTodayDate(),
  author: "",
  stakeholders: [],
  tags: "",
  drivers: [],
  context: "",
  decision: "",
  alternatives: "",
  consequences: "",
  negativeConsequences: "",
};

function createForm({
  title,
  status = "Accepted",
  author = "",
  stakeholders = [],
  tags = "",
  drivers,
  context,
  decision,
  alternatives,
  consequences,
  negativeConsequences = "",
}: Omit<
  AdrForm,
  | "number"
  | "status"
  | "decisionDate"
  | "author"
  | "stakeholders"
  | "tags"
  | "negativeConsequences"
> & {
  author?: string;
  negativeConsequences?: string;
  stakeholders?: string[];
  status?: AdrStatus;
  tags?: string;
}) {
  return {
    title,
    number: "001",
    status,
    decisionDate: getTodayDate(),
    author,
    stakeholders,
    tags,
    drivers,
    context,
    decision,
    alternatives,
    consequences,
    negativeConsequences,
  };
}

const templateGroups: AdrTemplateGroup[] = [
  {
    category: "Architecture",
    templates: [
      {
        title: "Authentication Strategy",
        form: createForm({
          title: "Adopt Centralized Authentication Strategy",
          drivers: ["Security", "Compliance", "Developer Experience"],
          stakeholders: [
            "Architecture Team",
            "Security Team",
            "Development Team",
          ],
          tags: "identity, oidc, authentication",
          context:
            "Multiple applications need consistent authentication, session handling, token validation and auditability across web and API channels.",
          decision:
            "Adopt a centralized Authentication Service based on OpenID Connect and shared integration standards.",
          alternatives:
            "Keep application-specific authentication; build a custom Authentication Service; delegate authentication ownership to each product team.",
          consequences:
            "Authentication becomes consistent, auditable and easier to integrate across teams.",
          negativeConsequences:
            "Teams must align on token lifetimes, client registration, service ownership and operational runbooks.",
        }),
      },
      {
        title: "API Gateway Selection",
        form: createForm({
          title: "Introduce API Gateway for External APIs",
          drivers: ["Security", "Maintainability", "Observability"],
          stakeholders: [
            "Architecture Team",
            "Platform Team",
            "Development Team",
          ],
          tags: "api, gateway, integration",
          context:
            "Backend services expose APIs with inconsistent routing, authentication and observability patterns.",
          decision:
            "Introduce an API Gateway as the primary entry point for external API traffic.",
          alternatives:
            "Expose services directly; use ingress-only routing; implement gateway behavior in each backend service.",
          consequences:
            "Routing, API policies and cross-cutting controls become centralized.",
          negativeConsequences:
            "The API Gateway becomes a critical runtime dependency and requires strong operational ownership.",
        }),
      },
      {
        title: "Database Selection",
        form: createForm({
          title: "Use Application Database as Primary Relational Store",
          drivers: ["Maintainability", "Cost", "Reliability"],
          stakeholders: [
            "Architecture Team",
            "Development Team",
            "Operations Team",
          ],
          tags: "data, persistence, relational",
          context:
            "The application requires transactional consistency, relational queries and operationally familiar database technology.",
          decision:
            "Use an application database as the primary relational store for transactional application data.",
          alternatives:
            "Use a document database; use a managed proprietary database; split data across multiple specialized stores from the start.",
          consequences:
            "Teams gain mature relational capabilities, clear transactional boundaries and broad operational familiarity.",
          negativeConsequences:
            "Teams must design schema migration, backup, retention and scaling practices carefully.",
        }),
      },
      {
        title: "Event Driven Architecture",
        form: createForm({
          title: "Adopt Event Driven Architecture for Domain Events",
          status: "Proposed",
          drivers: ["Scalability", "Availability", "Reliability"],
          stakeholders: [
            "Architecture Team",
            "Development Team",
            "Operations Team",
          ],
          tags: "events, async, integration",
          context:
            "Several services need to react to business changes without tight synchronous coupling.",
          decision:
            "Publish domain events for important state changes and allow downstream services to consume them asynchronously.",
          alternatives:
            "Use synchronous REST callbacks; share database tables; schedule periodic polling jobs.",
          consequences:
            "Services become more decoupled and scalable, and business events become reusable integration points.",
          negativeConsequences:
            "Teams must handle eventual consistency, idempotency, replay behavior and event schema governance.",
        }),
      },
      {
        title: "Microservice Architecture",
        form: createForm({
          title: "Structure the Platform as Domain-Oriented Microservices",
          status: "Proposed",
          drivers: ["Scalability", "Maintainability", "Operational Simplicity"],
          stakeholders: [
            "Architecture Team",
            "Platform Team",
            "Development Team",
          ],
          tags: "microservices, domain, platform",
          context:
            "The platform contains several business domains with different release cycles and ownership boundaries.",
          decision:
            "Organize backend capabilities into domain-oriented microservices with explicit APIs and data ownership.",
          alternatives:
            "Keep a modular monolith; split by technical layers; create shared database-centric services.",
          consequences:
            "Domain ownership and independent delivery improve for teams with mature operational practices.",
          negativeConsequences:
            "Operational complexity, distributed tracing, API governance and runtime failure handling become more important.",
        }),
      },
    ],
  },
  {
    category: "Security",
    templates: [
      {
        title: "Identity Service Adoption",
        form: createForm({
          title: "Adopt an Enterprise Identity Service",
          drivers: ["Security", "Compliance", "Reliability"],
          stakeholders: [
            "Architecture Team",
            "Security Team",
            "Operations Team",
          ],
          tags: "identity, access-management, security",
          context:
            "The platform requires centralized identity and access management for web applications, APIs and service integrations.",
          decision:
            "Use an enterprise Identity Service for authentication, authorization, federation and token issuance.",
          alternatives:
            "Build a custom IAM service; use a managed cloud identity provider; keep application-specific authentication modules.",
          consequences:
            "Teams get standard OAuth2 and OpenID Connect capabilities through a shared enterprise capability.",
          negativeConsequences:
            "The identity platform must be operated reliably and governed consistently across teams.",
        }),
      },
      {
        title: "OAuth2 Provider Selection",
        form: createForm({
          title: "Standardize on OAuth2 and OpenID Connect Provider",
          drivers: ["Security", "Compliance", "Portability"],
          stakeholders: [
            "Architecture Team",
            "Security Team",
            "Development Team",
          ],
          tags: "oauth2, oidc, authorization",
          context:
            "Applications and APIs need a shared protocol for delegated authorization and identity claims.",
          decision:
            "Standardize authentication and API authorization on OAuth2 and OpenID Connect provider integration.",
          alternatives:
            "Use proprietary SSO protocols; implement custom bearer tokens; keep basic authentication for internal APIs.",
          consequences:
            "Security integration becomes standards-based and portable across applications.",
          negativeConsequences:
            "Teams must understand token validation, scopes, audiences and client configuration.",
        }),
      },
      {
        title: "PKCE Adoption",
        form: createForm({
          title: "Require PKCE for Browser and Mobile OAuth2 Clients",
          drivers: ["Security", "Compliance", "Simplicity"],
          context:
            "Public clients cannot safely store client secrets and need protection during Authorization Code Flow.",
          decision:
            "Require PKCE with S256 for browser-based and mobile OAuth2 clients.",
          alternatives:
            "Use implicit flow; issue static client secrets to public clients; use authorization code flow without PKCE.",
          consequences:
            "Authorization code interception risk is reduced, while client implementations must generate and store code verifiers correctly.",
        }),
      },
      {
        title: "DPoP Adoption",
        form: createForm({
          title: "Adopt DPoP for Proof-of-Possession Access Tokens",
          status: "Proposed",
          drivers: ["Security", "Compliance"],
          context:
            "Some APIs require stronger protection against bearer token replay and token theft scenarios.",
          decision:
            "Use DPoP for selected clients and APIs that need proof-of-possession access tokens.",
          alternatives:
            "Use bearer tokens only; require mTLS for all clients; reduce token lifetime without sender-constraining tokens.",
          consequences:
            "Replay protection improves, but client key management and resource server validation become more complex.",
        }),
      },
      {
        title: "PAR Adoption",
        form: createForm({
          title: "Use PAR for High-Trust Authorization Requests",
          status: "Proposed",
          drivers: ["Security", "Compliance", "Maintainability"],
          context:
            "Authorization requests may contain sensitive parameters and need stronger integrity before redirecting users.",
          decision:
            "Use Pushed Authorization Requests for clients and flows that require high assurance authorization request handling.",
          alternatives:
            "Send all authorization parameters through browser redirects; use signed request objects only; rely on short redirect URLs.",
          consequences:
            "Authorization requests become more robust and less exposed in the browser, but clients must support an additional back-channel request.",
        }),
      },
    ],
  },
  {
    category: "Platform Engineering",
    templates: [
      {
        title: "Container Platform Adoption",
        form: createForm({
          title: "Adopt a Container Platform for Application Workloads",
          drivers: ["Availability", "Scalability", "Maintainability"],
          context:
            "Teams need a standardized container platform for deploying and operating business applications.",
          decision:
            "Use a container platform as the primary runtime for containerized workloads.",
          alternatives:
            "Use unmanaged container orchestration; deploy directly to virtual machines; use separate platforms per team.",
          consequences:
            "Platform consistency and operational controls improve, but teams must invest in cluster operations, CI/CD and workload standards.",
        }),
      },
      {
        title: "Container Orchestration Platform",
        form: createForm({
          title: "Standardize on Container Orchestration",
          status: "Proposed",
          drivers: ["Scalability", "Availability", "Cost"],
          context:
            "Applications require portable orchestration, rollout automation and consistent runtime primitives.",
          decision:
            "Standardize container orchestration around portable platform capabilities.",
          alternatives:
            "Use virtual machines only; use proprietary application servers; keep per-team orchestration solutions.",
          consequences:
            "Runtime patterns become portable and consistent, while platform engineering skills and governance become necessary.",
        }),
      },
      {
        title: "Service Mesh Adoption",
        form: createForm({
          title: "Adopt Service Mesh for East-West Traffic Management",
          status: "Proposed",
          drivers: ["Security", "Availability", "Maintainability"],
          context:
            "Service-to-service traffic needs stronger control, telemetry and policy enforcement.",
          decision:
            "Adopt a service mesh for selected workloads that need mTLS, traffic shaping and service-level observability.",
          alternatives:
            "Implement cross-cutting traffic concerns in each service; use gateway-only controls; rely on network policies alone.",
          consequences:
            "Traffic management and observability improve, but operational complexity and sidecar/resource overhead must be managed.",
        }),
      },
    ],
  },
];

const examples: ToolExample[] = templateGroups
  .flatMap((group) => group.templates)
  .slice(0, 6)
  .map((template) => ({
    title: template.title,
    inputLabel: "Decision Topic",
    input: template.form.title,
    outputLabel: "Status",
    output: template.form.status,
  }));

function formatAdrNumber(value: string) {
  const cleanedValue = value.replace(/\D/g, "").slice(0, 4);
  return cleanedValue || "001";
}

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);
}

function buildAdrMarkdown(form: AdrForm) {
  const adrNumber = formatAdrNumber(form.number).padStart(3, "0");
  const title = form.title.trim() || "Untitled Architecture Decision";
  const drivers =
    form.drivers.length > 0
      ? form.drivers.map((driver) => `* ${driver}`).join("\n")
      : "* Not specified";
  const stakeholders =
    form.stakeholders.length > 0
      ? form.stakeholders.map((stakeholder) => `* ${stakeholder}`).join("\n")
      : "* Not specified";
  const tags = form.tags
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
  const tagLine =
    tags.length > 0
      ? tags.map((tag) => `\`${tag}\``).join(", ")
      : "Not specified";

  return [
    `# ADR-${adrNumber}: ${title}`,
    "",
    `**Status:** ${form.status}`,
    "",
    `**Decision Date:** ${form.decisionDate || getTodayDate()}`,
    "",
    form.author.trim()
      ? `**Author:** ${form.author.trim()}`
      : "**Author:** Not specified",
    "",
    "**Stakeholders**",
    "",
    stakeholders,
    "",
    `**Tags:** ${tagLine}`,
    "",
    "## Decision Drivers",
    "",
    drivers,
    "",
    "---",
    "",
    "## Context",
    "",
    form.context.trim() || "Describe the context for this decision.",
    "",
    "## Decision",
    "",
    form.decision.trim() || "Describe the decision.",
    "",
    "## Alternatives Considered",
    "",
    form.alternatives.trim() || "List alternatives considered.",
    "",
    "## Consequences",
    "",
    "### Positive",
    "",
    form.consequences.trim() ||
      "Describe expected benefits and positive outcomes.",
    "",
    "### Negative",
    "",
    form.negativeConsequences.trim() ||
      "Describe trade-offs, risks and follow-up responsibilities.",
  ].join("\n");
}

export function AdrGeneratorPage() {
  usePageTitle("ADR Generator");
  const location = useLocation();
  const navigate = useNavigate();
  const noteHandoff = useMemo(
    () => readArchitectureNoteAdrHandoff(location.state),
    [location.state],
  );

  const [form, setForm] = useState<AdrForm>(() =>
    noteHandoff
      ? {
          ...emptyForm,
          title: noteHandoff.title,
          tags: noteHandoff.tags.join(", "),
          context: noteHandoff.context,
        }
      : templateGroups[1].templates[0].form,
  );
  const [selectedTemplate, setSelectedTemplate] = useState(() =>
    noteHandoff ? "" : templateGroups[1].templates[0].title,
  );
  const [errorMessage, setErrorMessage] = useState("");
  const [toast, setToast] = useState<ToastMessage | null>(() =>
    noteHandoff
      ? {
          id: Date.now(),
          tone: "info",
          text: "Architecture note details added. Complete the ADR decision fields.",
        }
      : null,
  );

  useEffect(() => {
    if (!noteHandoff) return;

    navigate(
      {
        pathname: location.pathname,
        search: location.search,
        hash: location.hash,
      },
      { replace: true, state: null },
    );
  }, [
    location.hash,
    location.pathname,
    location.search,
    navigate,
    noteHandoff,
  ]);

  useEffect(() => {
    if (!toast) return;
    const timeoutId = window.setTimeout(() => setToast(null), 3200);
    return () => window.clearTimeout(timeoutId);
  }, [toast]);

  const markdown = useMemo(() => buildAdrMarkdown(form), [form]);

  function showToast(tone: ToastTone, text: string) {
    setToast({ id: Date.now(), tone, text });
  }

  function updateField(field: keyof AdrForm, value: string) {
    setSelectedTemplate("");
    setForm((current) => ({
      ...current,
      [field]: field === "status" ? (value as AdrStatus) : value,
    }));
  }

  function toggleDriver(driver: string) {
    setSelectedTemplate("");
    setForm((current) => ({
      ...current,
      drivers: current.drivers.includes(driver)
        ? current.drivers.filter((item) => item !== driver)
        : [...current.drivers, driver],
    }));
  }

  function toggleStakeholder(stakeholder: string) {
    setSelectedTemplate("");
    setForm((current) => ({
      ...current,
      stakeholders: current.stakeholders.includes(stakeholder)
        ? current.stakeholders.filter((item) => item !== stakeholder)
        : [...current.stakeholders, stakeholder],
    }));
  }

  function validateForm() {
    if (!form.title.trim()) return "Title is required to generate an ADR.";
    if (!form.context.trim())
      return "Context is required to explain the decision background.";
    if (!form.decision.trim())
      return "Decision is required to capture what was chosen.";
    if (!form.consequences.trim())
      return "Consequences are required to document the impact.";
    return "";
  }

  function handleGenerate() {
    const validationMessage = validateForm();

    if (validationMessage) {
      setErrorMessage(validationMessage);
      showToast("failure", "ADR needs a little more detail.");
      return;
    }

    setErrorMessage("");
    showToast("success", "Markdown preview refreshed.");
  }

  async function handleCopyMarkdown() {
    await navigator.clipboard.writeText(markdown);
    showToast("success", "ADR markdown copied.");
  }

  function handleDownloadMarkdown() {
    const adrNumber = formatAdrNumber(form.number).padStart(3, "0");
    const fileName = `ADR-${adrNumber}-${slugify(form.title || "architecture-decision")}.md`;
    const blob = new Blob([markdown], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(url);
    showToast("success", "ADR markdown downloaded.");
  }

  function handleClear() {
    setForm(emptyForm);
    setSelectedTemplate("");
    setErrorMessage("");
    showToast("info", "ADR form cleared.");
  }

  function handleTemplateSelect(template: AdrTemplate) {
    setForm(template.form);
    setSelectedTemplate(template.title);
    setErrorMessage("");
    showToast("info", `${template.title} template loaded.`);
  }

  function handleExampleSelect(example: ToolExample) {
    const selectedExample = templateGroups
      .flatMap((group) => group.templates)
      .find((template) => template.title === example.title);

    if (!selectedExample) return;
    handleTemplateSelect(selectedExample);
  }

  return (
    <ToolPageLayout
      title="ADR Generator"
      description="Create structured Architecture Decision Records that capture context, options, decisions, consequences, and ownership."
      breadcrumbs={[
        {
          label: "Architecture & Design",
          path: routePaths.architectureDesign,
        },
        { label: "ADR Generator" },
      ]}
      overviewTitle="What is an Architecture Decision Record?"
      overviewCollapsible
      overviewToggleLabel="What is an Architecture Decision Record?"
      overview={
        <div className="space-y-3">
          <p>
            An Architecture Decision Record documents an important design choice
            together with its context, considered options, consequences, and
            current status.
          </p>
          <p>
            Keeping ADRs concise gives future maintainers a durable explanation
            of why the decision was made and when it should be revisited.
          </p>
        </div>
      }
      inputTitle={null}
      inputs={
        <div className="space-y-5">
          <section className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-950">
            <div className="mb-4 flex items-center gap-2">
              <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
                ADR Templates
              </h2>
              <HelpTooltip
                title="ADR Templates"
                description="Select a starter ADR template to populate the form."
              />
            </div>
            <div className="grid gap-4 lg:grid-cols-3">
              {templateGroups.map((group) => (
                <TemplateGroup
                  key={group.category}
                  group={group}
                  selectedTemplate={selectedTemplate}
                  onSelect={handleTemplateSelect}
                />
              ))}
            </div>
          </section>

          {errorMessage ? <Alert color="failure">{errorMessage}</Alert> : null}

          <div className="grid gap-5 xl:grid-cols-[minmax(0,0.48fr)_minmax(0,0.52fr)]">
            <section className="min-w-0">
              <div className="mb-4 flex items-center gap-2">
                <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
                  ADR Details
                </h2>
                <HelpTooltip
                  title="ADR Details"
                  description="Fill in the decision information used to generate markdown."
                />
              </div>

              <div className="space-y-4">
                <div className="grid gap-4 lg:grid-cols-[1fr_9rem_12rem]">
                  <div>
                    <FieldLabel
                      htmlFor="adr-title"
                      label="Title"
                      help="Use a concise title that describes the architectural decision."
                    />
                    <TextInput
                      id="adr-title"
                      value={form.title}
                      onChange={(event) =>
                        updateField("title", event.target.value)
                      }
                      placeholder="Adopt an Enterprise Identity Service"
                    />
                  </div>
                  <div>
                    <FieldLabel
                      htmlFor="adr-number"
                      label="ADR Number"
                      help="Numeric ADR identifier used in the markdown heading."
                    />
                    <TextInput
                      id="adr-number"
                      value={form.number}
                      onChange={(event) =>
                        updateField(
                          "number",
                          formatAdrNumber(event.target.value),
                        )
                      }
                      placeholder="001"
                    />
                  </div>
                  <div>
                    <FieldLabel
                      htmlFor="adr-status"
                      label="Status"
                      help="Track the lifecycle state of the architecture decision."
                    />
                    <Select
                      id="adr-status"
                      value={form.status}
                      onChange={(event) =>
                        updateField("status", event.target.value)
                      }
                    >
                      {statusOptions.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </Select>
                  </div>
                </div>

                <div className="grid gap-4 lg:grid-cols-[11rem_1fr]">
                  <div>
                    <FieldLabel
                      htmlFor="adr-decision-date"
                      label="Decision Date"
                      help="Date when the decision was proposed, accepted or last reviewed."
                    />
                    <TextInput
                      id="adr-decision-date"
                      type="date"
                      value={form.decisionDate}
                      onChange={(event) =>
                        updateField("decisionDate", event.target.value)
                      }
                    />
                  </div>
                  <div>
                    <FieldLabel
                      htmlFor="adr-author"
                      label="Author"
                      help="Optional owner or author responsible for drafting this ADR."
                    />
                    <TextInput
                      id="adr-author"
                      value={form.author}
                      onChange={(event) =>
                        updateField("author", event.target.value)
                      }
                      placeholder="Architecture Team"
                    />
                  </div>
                </div>

                <div>
                  <div className="mb-2 flex items-center gap-2">
                    <p
                      id="adr-stakeholders-label"
                      className="text-sm font-semibold text-gray-900 dark:text-white"
                    >
                      Stakeholders
                    </p>
                    <HelpTooltip
                      title="Stakeholders"
                      description="Select teams that should review, own or be informed about this decision."
                    />
                  </div>
                  <div
                    className="flex flex-wrap gap-2"
                    role="group"
                    aria-labelledby="adr-stakeholders-label"
                  >
                    {stakeholderOptions.map((stakeholder) => (
                      <button
                        key={stakeholder}
                        type="button"
                        aria-pressed={form.stakeholders.includes(stakeholder)}
                        onClick={() => toggleStakeholder(stakeholder)}
                        className={[
                          "inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-600 dark:focus-visible:outline-cyan-400",
                          form.stakeholders.includes(stakeholder)
                            ? "border-cyan-500 bg-cyan-50 text-cyan-800 dark:border-cyan-400 dark:bg-cyan-950 dark:text-cyan-200"
                            : "border-gray-200 bg-white text-gray-700 hover:border-cyan-300 hover:text-cyan-700 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:border-cyan-700 dark:hover:text-cyan-300",
                        ].join(" ")}
                      >
                        {form.stakeholders.includes(stakeholder) ? (
                          <span aria-hidden="true">✓</span>
                        ) : null}
                        {stakeholder}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <FieldLabel
                    htmlFor="adr-tags"
                    label="Tags"
                    help="Optional comma-separated tags for search, ownership or documentation grouping."
                  />
                  <TextInput
                    id="adr-tags"
                    value={form.tags}
                    onChange={(event) =>
                      updateField("tags", event.target.value)
                    }
                    placeholder="identity, api, platform"
                  />
                </div>

                <div>
                  <div className="mb-2 flex items-center gap-2">
                    <p
                      id="adr-drivers-label"
                      className="text-sm font-semibold text-gray-900 dark:text-white"
                    >
                      Decision Drivers
                    </p>
                    <HelpTooltip
                      title="Decision Drivers"
                      description="Select the architectural forces that shaped this decision."
                    />
                  </div>
                  <div
                    className="flex flex-wrap gap-2"
                    role="group"
                    aria-labelledby="adr-drivers-label"
                  >
                    {decisionDrivers.map((driver) => (
                      <button
                        key={driver}
                        type="button"
                        aria-pressed={form.drivers.includes(driver)}
                        onClick={() => toggleDriver(driver)}
                        className={[
                          "inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-600 dark:focus-visible:outline-cyan-400",
                          form.drivers.includes(driver)
                            ? "border-cyan-500 bg-cyan-50 text-cyan-800 dark:border-cyan-400 dark:bg-cyan-950 dark:text-cyan-200"
                            : "border-gray-200 bg-white text-gray-700 hover:border-cyan-300 hover:text-cyan-700 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:border-cyan-700 dark:hover:text-cyan-300",
                        ].join(" ")}
                      >
                        {form.drivers.includes(driver) ? (
                          <span aria-hidden="true">✓</span>
                        ) : null}
                        {driver}
                      </button>
                    ))}
                  </div>
                </div>

                <AdrTextarea
                  id="adr-context"
                  label="Context"
                  value={form.context}
                  onChange={(value) => updateField("context", value)}
                  help="Describe the forces, constraints and background that led to this decision."
                />
                <AdrTextarea
                  id="adr-decision"
                  label="Decision"
                  value={form.decision}
                  onChange={(value) => updateField("decision", value)}
                  help="Describe the architectural decision that was made."
                />
                <AdrTextarea
                  id="adr-alternatives"
                  label="Alternatives Considered"
                  value={form.alternatives}
                  onChange={(value) => updateField("alternatives", value)}
                  help="List the realistic alternatives that were discussed."
                />
                <AdrTextarea
                  id="adr-consequences"
                  label="Positive Consequences"
                  value={form.consequences}
                  onChange={(value) => updateField("consequences", value)}
                  help="Document the expected benefits and positive outcomes."
                />
                <AdrTextarea
                  id="adr-negative-consequences"
                  label="Negative Consequences"
                  value={form.negativeConsequences}
                  onChange={(value) =>
                    updateField("negativeConsequences", value)
                  }
                  help="Document trade-offs, risks and follow-up responsibilities."
                />

                <div className="flex flex-wrap gap-2">
                  <Button color="blue" onClick={handleGenerate}>
                    Generate Markdown
                  </Button>
                  <Button color="light" onClick={handleCopyMarkdown}>
                    Copy Markdown
                  </Button>
                  <Button color="light" onClick={handleDownloadMarkdown}>
                    Download Markdown
                  </Button>
                  <Button color="light" onClick={handleClear}>
                    Clear
                  </Button>
                </div>
              </div>
            </section>

            <section className="min-w-0 rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-950">
              <div className="mb-4 flex items-center gap-2">
                <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
                  Markdown Preview
                </h2>
                <span className="rounded-md bg-cyan-100 px-2 py-1 text-xs font-semibold text-cyan-800 dark:bg-cyan-950 dark:text-cyan-200">
                  GitHub Flavored Markdown
                </span>
                <HelpTooltip
                  title="Markdown Preview"
                  description="Live markdown preview generated from the ADR details."
                />
              </div>
              <pre
                role="region"
                aria-label="Generated ADR Markdown"
                tabIndex={0}
                className="min-h-[36rem] w-full max-w-full overflow-x-auto overscroll-x-contain rounded-lg bg-white p-4 text-sm text-gray-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-600 dark:bg-gray-900 dark:text-gray-200 dark:focus-visible:outline-cyan-400"
              >
                {markdown}
              </pre>
              <div className="mt-4 rounded-lg border border-dashed border-gray-300 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                  Related Architecture Diagram
                </p>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  Coming Soon
                </p>
              </div>
            </section>
          </div>
        </div>
      }
      examples={examples}
      onExampleSelect={handleExampleSelect}
      notes={
        <ul className="list-disc space-y-2 pl-5 text-sm text-gray-600 dark:text-gray-300">
          <li>Keep ADRs short enough for teams to read during reviews.</li>
          <li>
            Document the context and trade-offs, not only the final choice.
          </li>
          <li>
            Use clear statuses so teams know whether a decision is still active.
          </li>
          <li>Prefer one important decision per ADR.</li>
          <li>
            Link ADRs from related architecture diagrams and platform standards.
          </li>
          <li>
            Capture working context before a formal decision in{" "}
            <Link
              to={routePaths.architectureNotesTool}
              className="font-medium text-cyan-700 hover:underline dark:text-cyan-300"
            >
              Architecture Notes
            </Link>
            .
          </li>
        </ul>
      }
      notesCollapsible
      toast={<ToolToast toast={toast} />}
    />
  );
}

function TemplateGroup({
  group,
  selectedTemplate,
  onSelect,
}: {
  group: AdrTemplateGroup;
  selectedTemplate: string;
  onSelect: (template: AdrTemplate) => void;
}) {
  return (
    <div>
      <p className="mb-2 text-xs font-semibold text-gray-500 uppercase dark:text-gray-400">
        {group.category}
      </p>
      <div
        className="flex flex-wrap gap-2"
        role="group"
        aria-label={`${group.category} ADR templates`}
      >
        {group.templates.map((template) => (
          <Button
            key={template.title}
            color={selectedTemplate === template.title ? "blue" : "light"}
            size="xs"
            aria-pressed={selectedTemplate === template.title}
            onClick={() => onSelect(template)}
          >
            {selectedTemplate === template.title ? (
              <span className="mr-1" aria-hidden="true">
                ✓
              </span>
            ) : null}
            {template.title}
          </Button>
        ))}
      </div>
    </div>
  );
}

function FieldLabel({
  htmlFor,
  label,
  help,
}: {
  htmlFor: string;
  label: string;
  help: string;
}) {
  return (
    <div className="mb-2 flex items-center gap-2">
      <label
        htmlFor={htmlFor}
        className="text-sm font-semibold text-gray-900 dark:text-white"
      >
        {label}
      </label>
      <HelpTooltip title={label} description={help} />
    </div>
  );
}

function AdrTextarea({
  id,
  label,
  value,
  onChange,
  help,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  help: string;
}) {
  return (
    <div>
      <FieldLabel htmlFor={id} label={label} help={help} />
      <Textarea
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        rows={3}
      />
    </div>
  );
}
