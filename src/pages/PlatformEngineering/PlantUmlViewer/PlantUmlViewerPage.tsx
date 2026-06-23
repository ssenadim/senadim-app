import { useEffect, useState } from "react";
import { Alert, Badge, Button, Textarea } from "flowbite-react";
import { HelpTooltip } from "../../../components/common/HelpTooltip";
import { ToolToast } from "../../../components/common/ToolToast";
import { ToolPageLayout } from "../../../components/layout/ToolPageLayout";
import { usePageTitle } from "../../../hooks/usePageTitle";
import type { ToolExample } from "../../../types/toolPage";
import type { ToastMessage, ToastTone } from "../../../types/toast";
import {
  encodePlantUmlSource,
  validatePlantUmlSource,
} from "../../../utils/plantuml";
import { routePaths } from "../../../utils/routes";

const defaultSource = `@startuml

Alice -> Bob : Hello

@enduml`;

const examples: ToolExample[] = [
  {
    title: "Sequence Diagram",
    inputLabel: "Source",
    input: `@startuml
Alice -> Bob : Authenticate
Bob --> Alice : Token
@enduml`,
    outputLabel: "Diagram Type",
    output: "Sequence diagram",
  },
  {
    title: "Component Diagram",
    inputLabel: "Source",
    input: `@startuml
[Web App] --> [API Gateway]
[API Gateway] --> [Identity Service]
[API Gateway] --> [Orders API]
@enduml`,
    outputLabel: "Diagram Type",
    output: "Component diagram",
  },
  {
    title: "Deployment Diagram",
    inputLabel: "Source",
    input: `@startuml
node "OpenShift" {
  node "Pod" {
    artifact "Application Container"
  }
}
database "PostgreSQL"
"Application Container" --> "PostgreSQL"
@enduml`,
    outputLabel: "Diagram Type",
    output: "Deployment diagram",
  },
];

interface PlantUmlTemplate {
  title: string;
  source: string;
}

interface PlantUmlTemplateGroup {
  category: string;
  templates: PlantUmlTemplate[];
}

const templateGroups: PlantUmlTemplateGroup[] = [
  {
    category: "General",
    templates: [
      {
        title: "Sequence Diagram",
        source: examples[0].input,
      },
      {
        title: "Component Diagram",
        source: examples[1].input,
      },
      {
        title: "Deployment Diagram",
        source: examples[2].input,
      },
    ],
  },
  {
    category: "Architecture",
    templates: [
      {
        title: "OAuth2 Authorization Code Flow",
        source: `@startuml

actor User

participant Browser
participant Keycloak
participant Application

User -> Browser : Login
Browser -> Keycloak : Authorization Request
Keycloak -> Browser : Authorization Code
Browser -> Application : Code
Application -> Keycloak : Token Request
Keycloak -> Application : Access Token

@enduml`,
      },
      {
        title: "Microservice Architecture",
        source: `@startuml
actor Client
rectangle "API Gateway" as Gateway
rectangle "Identity Service" as Identity
rectangle "Order Service" as Orders
rectangle "Payment Service" as Payments
database "Orders DB" as OrdersDb
database "Payments DB" as PaymentsDb

Client --> Gateway
Gateway --> Identity
Gateway --> Orders
Orders --> Payments
Orders --> OrdersDb
Payments --> PaymentsDb
@enduml`,
      },
      {
        title: "Event Driven Architecture",
        source: `@startuml
rectangle "Order Service" as Producer
queue "orders.created" as Topic
rectangle "Inventory Service" as Inventory
rectangle "Notification Service" as Notification
database "Read Model" as ReadModel

Producer --> Topic : publish event
Topic --> Inventory : consume
Topic --> Notification : consume
Inventory --> ReadModel : update projection
@enduml`,
      },
    ],
  },
  {
    category: "Platform Engineering",
    templates: [
      {
        title: "OpenShift Deployment",
        source: `@startuml
cloud "Internet" as Internet
node "OpenShift Cluster" {
  rectangle "Ingress / Route" as Ingress
  rectangle "API Gateway" as Gateway
  rectangle "Keycloak" as Keycloak
  rectangle "Backend Service" as Backend
  database "PostgreSQL" as Database
}

Internet --> Ingress : HTTPS
Ingress --> Gateway : route traffic
Gateway --> Keycloak : validate token
Gateway --> Backend : forward API request
Backend --> Database : read/write data
@enduml`,
      },
      {
        title: "Kafka Event Flow",
        source: `@startuml
rectangle "Producer" as Producer
queue "Kafka Topic" as Topic
rectangle "Consumer" as Consumer

Producer --> Topic : publish event
Topic --> Consumer : consume event
Consumer --> Consumer : process message
@enduml`,
      },
      {
        title: "JVM Application on OpenShift",
        source: `@startuml
node "OpenShift Cluster" {
  node "Application Pod" {
    rectangle "JVM Container" as Jvm
    rectangle "Spring Boot App" as App
  }
  rectangle "ConfigMap" as Config
  rectangle "Secret" as Secret
  database "Persistent Storage" as Storage
}

Config --> Jvm : JAVA_OPTS
Secret --> App : credentials
Jvm --> App : run application
App --> Storage : persist data
@enduml`,
      },
    ],
  },
];

export function PlantUmlViewerPage() {
  usePageTitle("PlantUML Viewer");

  const [source, setSource] = useState(defaultSource);
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [diagramUrl, setDiagramUrl] = useState("");
  const [status, setStatus] = useState<"idle" | "success" | "failure">("idle");
  const [error, setError] = useState("");
  const [toast, setToast] = useState<ToastMessage | null>(null);

  useEffect(() => {
    if (!toast) return;
    const timeoutId = window.setTimeout(() => setToast(null), 3200);
    return () => window.clearTimeout(timeoutId);
  }, [toast]);

  function showToast(tone: ToastTone, text: string) {
    setToast({ id: Date.now(), tone, text });
  }

  async function handleRender() {
    const validationMessage = validatePlantUmlSource(source);

    if (validationMessage) {
      setDiagramUrl("");
      setStatus("failure");
      setError(validationMessage);
      showToast("failure", "PlantUML source needs attention.");
      return;
    }

    try {
      const encodedSource = await encodePlantUmlSource(source);
      setDiagramUrl(`https://www.plantuml.com/plantuml/svg/${encodedSource}`);
      setStatus("success");
      setError("");
      showToast("success", "Diagram rendered.");
    } catch (renderError) {
      const message =
        renderError instanceof Error
          ? renderError.message
          : "The diagram could not be rendered. Please check the source and try again.";

      setDiagramUrl("");
      setStatus("failure");
      setError(message);
      showToast("failure", "Render failed.");
    }
  }

  async function handleCopySource() {
    if (!source.trim()) {
      showToast("failure", "There is no PlantUML source to copy.");
      return;
    }

    await navigator.clipboard.writeText(source);
    showToast("success", "PlantUML source copied.");
  }

  function handleClear() {
    setSource("");
    setSelectedTemplate("");
    setDiagramUrl("");
    setStatus("idle");
    setError("");
    showToast("info", "PlantUML source cleared.");
  }

  function handleExampleSelect(example: ToolExample) {
    setSource(example.input);
    setSelectedTemplate("");
    setDiagramUrl("");
    setStatus("idle");
    setError("");
    showToast("info", `${example.title} loaded.`);
  }

  function handleTemplateSelect(template: PlantUmlTemplate) {
    setSource(template.source);
    setSelectedTemplate(template.title);
    setDiagramUrl("");
    setStatus("idle");
    setError("");
    showToast("info", `${template.title} template loaded.`);
  }

  return (
    <ToolPageLayout
      title="PlantUML Viewer"
      description="Render PlantUML diagrams from source code."
      breadcrumbs={[
        {
          label: "Platform Engineering Tools",
          path: routePaths.platformEngineering,
        },
        { label: "PlantUML Viewer" },
      ]}
      overviewTitle="What is PlantUML?"
      overviewCollapsible
      overviewToggleLabel="What is PlantUML?"
      overview={
        <div className="space-y-3">
          <p>PlantUML is a text-based diagram language.</p>
          <p>
            It can generate sequence, class, component and deployment diagrams.
          </p>
          <p>
            It is commonly used in architecture and engineering documentation.
          </p>
        </div>
      }
      inputs={
        <div className="grid gap-5 xl:grid-cols-2">
          <section>
            <div className="mb-5 rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-950">
              <div className="mb-3 flex items-center gap-2">
                <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
                  Templates
                </h2>
                <HelpTooltip
                  title="PlantUML Templates"
                  description="Choose a starter template to replace the editor content."
                />
              </div>
              <div className="grid gap-4">
                {templateGroups.map((group) => (
                  <TemplateGroup
                    key={group.category}
                    group={group}
                    selectedTemplate={selectedTemplate}
                    onSelect={handleTemplateSelect}
                  />
                ))}
              </div>
            </div>

            <div className="mb-2 flex items-center gap-2">
              <label
                htmlFor="plantuml-source"
                className="text-sm font-semibold text-gray-900 dark:text-white"
              >
                PlantUML Source
              </label>
              <HelpTooltip
                title="PlantUML Source"
                description="Enter PlantUML text between @startuml and @enduml markers."
                exampleInput="@startuml Alice -> Bob : Hello @enduml"
                exampleOutput="Rendered sequence diagram"
              />
            </div>
            <Textarea
              id="plantuml-source"
              value={source}
              onChange={(event) => {
                setSource(event.target.value);
                setSelectedTemplate("");
              }}
              rows={18}
              className="font-mono"
              placeholder={`@startuml
Alice -> Bob : Hello
@enduml`}
            />
            <div className="mt-4 flex flex-wrap gap-2">
              <Button color="blue" onClick={handleRender}>
                Render Diagram
              </Button>
              <Button color="light" onClick={handleCopySource}>
                Copy Source
              </Button>
              <Button color="light" onClick={handleClear}>
                Clear
              </Button>
            </div>
          </section>

          <section className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-950">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
                  Diagram Preview
                </h2>
                <HelpTooltip
                  title="Diagram Preview"
                  description="Rendered PlantUML diagram output. Rendering happens when you click Render Diagram."
                />
              </div>
              <RenderStatusBadge status={status} />
            </div>

            {error ? (
              <Alert color="failure">
                <span className="font-semibold">Render Failure.</span> {error}
              </Alert>
            ) : null}

            {diagramUrl ? (
              <div className="mt-4 flex min-h-96 items-center justify-center overflow-auto rounded-lg bg-white p-4 dark:bg-gray-900">
                <img
                  src={diagramUrl}
                  alt="Rendered PlantUML diagram"
                  className="max-h-[640px] max-w-full"
                  onError={() => {
                    setStatus("failure");
                    setError(
                      "The PlantUML render service could not load the diagram. Check the source or try again later.",
                    );
                  }}
                  onLoad={() => setStatus("success")}
                />
              </div>
            ) : (
              <div className="mt-4 flex min-h-96 items-center justify-center rounded-lg border border-dashed border-gray-300 bg-white p-6 text-center text-sm text-gray-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400">
                Enter PlantUML source and click Render Diagram to preview it here.
              </div>
            )}
          </section>
        </div>
      }
      examples={examples}
      onExampleSelect={handleExampleSelect}
      notes={
        <ul className="list-disc space-y-2 pl-5 text-sm text-gray-600 dark:text-gray-300">
          <li>Rendering is triggered manually; real-time rendering is not enabled.</li>
          <li>PlantUML syntax errors are displayed by the rendering service.</li>
          <li>Keep sensitive architecture details out of externally rendered diagrams.</li>
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
  group: PlantUmlTemplateGroup;
  selectedTemplate: string;
  onSelect: (template: PlantUmlTemplate) => void;
}) {
  return (
    <div>
      <p className="mb-2 text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">
        {group.category}
      </p>
      <div className="flex flex-wrap gap-2">
        {group.templates.map((template) => (
          <Button
            key={template.title}
            color={selectedTemplate === template.title ? "blue" : "light"}
            size="xs"
            onClick={() => onSelect(template)}
          >
            {template.title}
          </Button>
        ))}
      </div>
    </div>
  );
}

function RenderStatusBadge({
  status,
}: {
  status: "idle" | "success" | "failure";
}) {
  if (status === "success") {
    return <Badge color="success">Render Success</Badge>;
  }

  if (status === "failure") {
    return <Badge color="failure">Render Failure</Badge>;
  }

  return <Badge color="gray">Not Rendered</Badge>;
}
