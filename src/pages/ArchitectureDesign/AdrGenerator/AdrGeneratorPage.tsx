import { useEffect, useMemo, useState } from "react";
import { Alert, Button, Select, TextInput, Textarea } from "flowbite-react";
import { HelpTooltip } from "../../../components/common/HelpTooltip";
import { ToolToast } from "../../../components/common/ToolToast";
import { ToolPageLayout } from "../../../components/layout/ToolPageLayout";
import { usePageTitle } from "../../../hooks/usePageTitle";
import type { ToolExample } from "../../../types/toolPage";
import type { ToastMessage, ToastTone } from "../../../types/toast";
import { routePaths } from "../../../utils/routes";

type AdrStatus = "Proposed" | "Accepted" | "Deprecated" | "Superseded";

interface AdrForm {
  title: string;
  status: AdrStatus;
  context: string;
  decision: string;
  alternatives: string;
  consequences: string;
}

interface AdrExample {
  title: string;
  form: AdrForm;
}

const emptyForm: AdrForm = {
  title: "",
  status: "Accepted",
  context: "",
  decision: "",
  alternatives: "",
  consequences: "",
};

const adrExamples: AdrExample[] = [
  {
    title: "IAM Platform Selection",
    form: {
      title: "Use IAM-NGX as IAM Platform",
      status: "Accepted",
      context:
        "The platform requires centralized identity and access management for web applications, APIs and service integrations.",
      decision:
        "Use Keycloak as the IAM platform for authentication, authorization, federation and token issuance.",
      alternatives:
        "Build a custom IAM service; use a managed cloud identity provider; keep application-specific authentication modules.",
      consequences:
        "Teams get standard OAuth2 and OpenID Connect capabilities, but must operate Keycloak reliably and define shared realm governance.",
    },
  },
  {
    title: "API Gateway Selection",
    form: {
      title: "Introduce API Gateway for External APIs",
      status: "Accepted",
      context:
        "Multiple backend services expose APIs with inconsistent routing, security and observability patterns.",
      decision:
        "Introduce an API Gateway as the primary entry point for external API traffic.",
      alternatives:
        "Expose services directly; implement routing in each service; use ingress-only routing.",
      consequences:
        "Centralized routing and policy enforcement improve consistency, while the gateway becomes a critical operational dependency.",
    },
  },
  {
    title: "Event Driven Architecture Adoption",
    form: {
      title: "Adopt Event Driven Architecture for Domain Events",
      status: "Proposed",
      context:
        "Several services need to react to business changes without tight synchronous coupling.",
      decision:
        "Publish domain events for important state changes and allow downstream services to consume them asynchronously.",
      alternatives:
        "Use synchronous REST callbacks; share database tables; schedule periodic polling jobs.",
      consequences:
        "Services become more decoupled and scalable, but teams must handle eventual consistency, idempotency and event schema governance.",
    },
  },
];

const examples: ToolExample[] = adrExamples.map((example) => ({
  title: example.title,
  inputLabel: "Decision Topic",
  input: example.form.title,
  outputLabel: "Status",
  output: example.form.status,
}));

const statusOptions: AdrStatus[] = [
  "Proposed",
  "Accepted",
  "Deprecated",
  "Superseded",
];

function buildAdrMarkdown(form: AdrForm) {
  return [
    "# ADR-001",
    "",
    "## Title",
    "",
    form.title.trim(),
    "",
    "## Status",
    "",
    form.status,
    "",
    "## Context",
    "",
    form.context.trim(),
    "",
    "## Decision",
    "",
    form.decision.trim(),
    "",
    "## Alternatives Considered",
    "",
    form.alternatives.trim(),
    "",
    "## Consequences",
    "",
    form.consequences.trim(),
  ].join("\n");
}

export function AdrGeneratorPage() {
  usePageTitle("ADR Generator");

  const [form, setForm] = useState<AdrForm>({
    ...emptyForm,
    title: "Use Keycloak as IAM Platform",
  });
  const [markdown, setMarkdown] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [toast, setToast] = useState<ToastMessage | null>(null);

  useEffect(() => {
    if (!toast) return;
    const timeoutId = window.setTimeout(() => setToast(null), 3200);
    return () => window.clearTimeout(timeoutId);
  }, [toast]);

  const isMarkdownAvailable = useMemo(() => markdown.trim().length > 0, [markdown]);

  function showToast(tone: ToastTone, text: string) {
    setToast({ id: Date.now(), tone, text });
  }

  function updateField(field: keyof AdrForm, value: string) {
    setForm((current) => ({
      ...current,
      [field]: field === "status" ? (value as AdrStatus) : value,
    }));
  }

  function validateForm() {
    if (!form.title.trim()) return "Title is required to generate an ADR.";
    if (!form.context.trim()) return "Context is required to explain the decision background.";
    if (!form.decision.trim()) return "Decision is required to capture what was chosen.";
    if (!form.consequences.trim()) return "Consequences are required to document the impact.";
    return "";
  }

  function handleGenerate() {
    const validationMessage = validateForm();

    if (validationMessage) {
      setErrorMessage(validationMessage);
      showToast("failure", "ADR needs a little more detail.");
      return;
    }

    setMarkdown(buildAdrMarkdown(form));
    setErrorMessage("");
    showToast("success", "ADR markdown generated.");
  }

  async function handleCopyMarkdown() {
    if (!isMarkdownAvailable) {
      showToast("failure", "Generate an ADR before copying markdown.");
      return;
    }

    await navigator.clipboard.writeText(markdown);
    showToast("success", "ADR markdown copied.");
  }

  function handleClear() {
    setForm(emptyForm);
    setMarkdown("");
    setErrorMessage("");
    showToast("info", "ADR form cleared.");
  }

  function handleExampleSelect(example: ToolExample) {
    const selectedExample = adrExamples.find((item) => item.title === example.title);

    if (!selectedExample) return;

    setForm(selectedExample.form);
    setMarkdown("");
    setErrorMessage("");
    showToast("info", `${selectedExample.title} example loaded.`);
  }

  return (
    <ToolPageLayout
      title="ADR Generator"
      description="Create Architecture Decision Records using a structured template."
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
          <p>ADRs document important architectural decisions.</p>
          <p>ADRs capture context, decision and consequences.</p>
          <p>ADRs help teams understand why decisions were made.</p>
        </div>
      }
      inputs={
        <div className="space-y-5">
          {errorMessage ? <Alert color="failure">{errorMessage}</Alert> : null}

          <div className="grid gap-4 lg:grid-cols-[1fr_14rem]">
            <div>
              <div className="mb-2 flex items-center gap-2">
                <label
                  htmlFor="adr-title"
                  className="text-sm font-semibold text-gray-900 dark:text-white"
                >
                  Title
                </label>
                <HelpTooltip
                  title="ADR Title"
                  description="Use a concise title that describes the architectural decision."
                  exampleInput="Use Keycloak as IAM Platform"
                  exampleOutput="ADR title"
                />
              </div>
              <TextInput
                id="adr-title"
                value={form.title}
                onChange={(event) => updateField("title", event.target.value)}
                placeholder="Use Keycloak as IAM Platform"
              />
            </div>

            <div>
              <div className="mb-2 flex items-center gap-2">
                <label
                  htmlFor="adr-status"
                  className="text-sm font-semibold text-gray-900 dark:text-white"
                >
                  Status
                </label>
                <HelpTooltip
                  title="ADR Status"
                  description="Track whether the decision is proposed, accepted, deprecated or superseded."
                />
              </div>
              <Select
                id="adr-status"
                value={form.status}
                onChange={(event) => updateField("status", event.target.value)}
              >
                {statusOptions.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </Select>
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
            label="Consequences"
            value={form.consequences}
            onChange={(value) => updateField("consequences", value)}
            help="Document the expected benefits, trade-offs and follow-up responsibilities."
          />

          <div className="flex flex-wrap gap-2">
            <Button color="blue" onClick={handleGenerate}>
              Generate ADR
            </Button>
            <Button color="light" onClick={handleCopyMarkdown}>
              Copy Markdown
            </Button>
            <Button color="light" onClick={handleClear}>
              Clear
            </Button>
          </div>
        </div>
      }
      outputs={
        <div>
          <div className="mb-2 flex items-center gap-2">
            <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
              Markdown Output
            </h2>
            <HelpTooltip
              title="Markdown Output"
              description="Generated Architecture Decision Record in markdown format."
            />
          </div>
          <pre className="min-h-96 overflow-x-auto rounded-lg bg-gray-50 p-4 text-sm text-gray-800 dark:bg-gray-950 dark:text-gray-200">
            {markdown || "Generate an ADR to preview markdown output here."}
          </pre>
        </div>
      }
      examples={examples}
      onExampleSelect={handleExampleSelect}
      notes={
        <ul className="list-disc space-y-2 pl-5 text-sm text-gray-600 dark:text-gray-300">
          <li>Keep ADRs short enough for teams to read during reviews.</li>
          <li>Document the context and trade-offs, not only the final choice.</li>
          <li>Use clear statuses so teams know whether a decision is still active.</li>
          <li>Link ADRs from related architecture diagrams and platform standards.</li>
        </ul>
      }
      notesCollapsible
      toast={<ToolToast toast={toast} />}
    />
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
      <div className="mb-2 flex items-center gap-2">
        <label
          htmlFor={id}
          className="text-sm font-semibold text-gray-900 dark:text-white"
        >
          {label}
        </label>
        <HelpTooltip title={label} description={help} />
      </div>
      <Textarea
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        rows={4}
      />
    </div>
  );
}
