import { useEffect, useRef, useState } from "react";
import { Alert, Badge, Button, Spinner, Textarea } from "flowbite-react";
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
import {
  downloadPlantUmlPng,
  downloadPlantUmlSvg,
  getPlantUmlExportFilename,
} from "../../../utils/plantumlExport";
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
node "Container Platform" {
  node "Pod" {
    artifact "Application Container"
  }
}
database "Application Database"
"Application Container" --> "Application Database"
@enduml`,
    outputLabel: "Diagram Type",
    output: "Deployment diagram",
  },
];

const templateCategories = [
  "General",
  "C4 Architecture",
  "Security & Identity",
  "Application Architecture",
  "Platform Engineering",
  "ISAQB Architecture",
] as const;

type PlantUmlTemplateCategory = (typeof templateCategories)[number];
type TemplateCategoryFilter = "All Templates" | PlantUmlTemplateCategory;

interface PlantUmlTemplate {
  id: string;
  name: string;
  category: PlantUmlTemplateCategory;
  description: string;
  source: string;
}

interface RenderedDiagram {
  filenameBase: string;
  url: string;
}

type RenderStatus = "idle" | "rendering" | "success" | "failure";

const plantUmlTemplates: PlantUmlTemplate[] = [
  {
    id: "sequence-diagram",
    name: "Sequence Diagram",
    category: "General",
    description:
      "Shows ordered interactions between participants in a process.",
    source: examples[0].input,
  },
  {
    id: "component-diagram",
    name: "Component Diagram",
    category: "General",
    description: "Maps software components and the dependencies between them.",
    source: examples[1].input,
  },
  {
    id: "deployment-diagram",
    name: "Deployment Diagram",
    category: "General",
    description: "Shows application artifacts deployed across runtime nodes.",
    source: examples[2].input,
  },
  {
    id: "context-diagram",
    name: "Context Diagram",
    category: "ISAQB Architecture",
    description: "Defines a system boundary and its external relationships.",
    source: `@startuml
actor "Customer" as Customer
rectangle "Main Application" as MainApp {
  rectangle "Web Portal" as Portal
}
cloud "Payment Provider" as Payment
cloud "Identity Service" as Identity
cloud "CRM System" as Crm

Customer --> Portal : uses
Portal --> Identity : authenticate user
Portal --> Payment : process payment
Portal --> Crm : synchronize customer data

note right of MainApp
System boundary:
Main Application
end note
@enduml`,
  },
  {
    id: "container-diagram",
    name: "Container Diagram",
    category: "ISAQB Architecture",
    description: "Maps application containers and their main data flows.",
    source: `@startuml
actor "Customer" as Customer
rectangle "Frontend" as Frontend
rectangle "API Gateway" as Gateway
rectangle "Backend Services" {
  rectangle "Customer Service" as CustomerService
  rectangle "Order Service" as OrderService
}
database "Application Database" as Database

Customer --> Frontend : browser access
Frontend --> Gateway : REST / HTTPS
Gateway --> CustomerService : customer API
Gateway --> OrderService : order API
CustomerService --> Database : read/write customers
OrderService --> Database : read/write orders
@enduml`,
  },
  {
    id: "runtime-view",
    name: "Runtime View",
    category: "ISAQB Architecture",
    description: "Traces a request across application services at runtime.",
    source: `@startuml
actor Customer
participant Frontend
participant "API Gateway" as Gateway
participant "Identity Service" as Identity
participant "Business Service" as Backend
database "Application Database" as Database

Customer -> Frontend : Submit request
Frontend -> Gateway : API request
Gateway -> Identity : Validate access token
Identity --> Gateway : Token valid
Gateway -> Backend : Forward request
Backend -> Database : Load and update data
Database --> Backend : Result
Backend --> Gateway : Response payload
Gateway --> Frontend : API response
Frontend --> Customer : Display result
@enduml`,
  },
  {
    id: "c4-context",
    name: "C4 Context",
    category: "C4 Architecture",
    description: "Shows a system, its users and its external dependencies.",
    source: `@startuml
!includeurl https://raw.githubusercontent.com/plantuml-stdlib/C4-PlantUML/master/C4_Context.puml

LAYOUT_WITH_LEGEND()

Person(customer, "Customer", "Mobile banking customer")
System(mobileBanking, "Mobile Banking System", "Allows customers to manage accounts, payments and security settings")
System_Ext(identity, "Identity Service", "Identity and access management capability")
System_Ext(riskEngine, "Risk Engine", "Evaluates transaction and login risk")
System_Ext(notification, "Notification Service", "Sends transactional and security notifications")

Rel(customer, mobileBanking, "Uses", "Mobile app")
Rel(mobileBanking, identity, "Authenticates customers", "OIDC")
Rel(mobileBanking, riskEngine, "Checks transaction risk", "REST")
Rel(mobileBanking, notification, "Sends alerts", "Events / REST")

SHOW_LEGEND()
@enduml`,
  },
  {
    id: "c4-container",
    name: "C4 Container",
    category: "C4 Architecture",
    description: "Maps the applications and data stores within a system.",
    source: `@startuml
!includeurl https://raw.githubusercontent.com/plantuml-stdlib/C4-PlantUML/master/C4_Container.puml

LAYOUT_WITH_LEGEND()

Person(customer, "Customer", "Mobile banking customer")

System_Boundary(mobileBanking, "Mobile Banking System") {
  Container(mobileApp, "Mobile App", "iOS / Android", "Customer-facing mobile banking application")
  Container(apiGateway, "API Gateway", "API entry point", "Routes traffic and enforces API policies")
  Container(securityService, "Security Service", "Application service", "Handles authentication and customer security workflows")
  Container(riskEngine, "Risk Engine", "Application service", "Evaluates login and transaction risk")
  ContainerDb(applicationDatabase, "Application Database", "Relational database", "Stores customers, credentials metadata and security events")
  ContainerDb(cache, "Cache", "In-memory data store", "Caches sessions, tokens and short-lived security state")
}

Rel(customer, mobileApp, "Uses", "HTTPS")
Rel(mobileApp, apiGateway, "Calls APIs", "HTTPS / JSON")
Rel(apiGateway, securityService, "Delegates security operations", "REST")
Rel(apiGateway, riskEngine, "Requests risk decisions", "REST")
Rel(securityService, applicationDatabase, "Reads and writes customer security data", "SQL")
Rel(securityService, cache, "Caches sessions and token metadata", "Cache protocol")
Rel(riskEngine, applicationDatabase, "Stores risk decisions", "SQL")

SHOW_LEGEND()
@enduml`,
  },
  {
    id: "c4-component",
    name: "C4 Component",
    category: "C4 Architecture",
    description: "Details the internal components of an application container.",
    source: `@startuml
!includeurl https://raw.githubusercontent.com/plantuml-stdlib/C4-PlantUML/master/C4_Component.puml

LAYOUT_WITH_LEGEND()

Container_Boundary(customerSecurityService, "Security Service") {
  Component(authController, "Authentication Controller", "REST Controller", "Accepts login and token-related API requests")
  Component(authService, "Authentication Service", "Service", "Validates credentials and orchestrates security checks")
  Component(riskAdapter, "Risk Adapter", "Adapter", "Calls external risk analysis capabilities")
  Component(userRepository, "User Repository", "Repository", "Loads user security data")
}

System_Ext(riskEngine, "Risk Engine", "External risk scoring service")
ContainerDb(userDatabase, "Application Database", "Relational database", "Stores users and security events")

Rel(authController, authService, "Delegates authentication", "method call")
Rel(authService, userRepository, "Loads user", "method call")
Rel(userRepository, userDatabase, "Queries user data", "SQL")
Rel(authService, riskAdapter, "Requests risk evaluation", "method call")
Rel(riskAdapter, riskEngine, "Checks login risk", "REST")

SHOW_LEGEND()
@enduml`,
  },
  {
    id: "c4-code",
    name: "C4 Code",
    category: "C4 Architecture",
    description: "Shows code-level elements and their relationships.",
    source: `@startuml
!includeurl https://raw.githubusercontent.com/plantuml-stdlib/C4-PlantUML/master/C4_Component.puml

LAYOUT_WITH_LEGEND()

Container_Boundary(codeView, "Security Service - Code View") {
  Component(authenticationController, "AuthenticationController", "Class", "Exposes login(request)")
  Component(authenticationService, "AuthenticationService", "Class", "Authenticates credentials and creates login result")
  Component(userRepository, "UserRepository", "Interface", "Finds users by username")
}

Rel(authenticationController, authenticationService, "Uses", "method call")
Rel(authenticationService, userRepository, "Loads user", "method call")

SHOW_LEGEND()
@enduml`,
  },
  {
    id: "oauth2-authorization-code-flow",
    name: "OAuth2 Authorization Code Flow",
    category: "Security & Identity",
    description: "Traces an authorization code exchange between core services.",
    source: `@startuml

actor Customer

participant "Web Portal" as WebPortal
participant "Identity Service" as IdentityService
participant "Business Service" as BusinessService

Customer -> WebPortal : Login
WebPortal -> IdentityService : Authorization Request
IdentityService -> WebPortal : Authorization Code
WebPortal -> BusinessService : Code
BusinessService -> IdentityService : Token Request
IdentityService -> BusinessService : Access Token

@enduml`,
  },
  {
    id: "par",
    name: "PAR",
    category: "Security & Identity",
    description: "Shows a pushed authorization request and its request URI.",
    source: `@startuml

actor Customer

participant Client
participant AuthorizationServer

Client -> AuthorizationServer : PAR Request
AuthorizationServer -> Client : request_uri

Client -> AuthorizationServer : Authorization Request (request_uri)

AuthorizationServer -> Customer : Authenticate

AuthorizationServer -> Client : Authorization Code

@enduml`,
  },
  {
    id: "dpop",
    name: "DPoP",
    category: "Security & Identity",
    description: "Shows proof-of-possession protection for access tokens.",
    source: `@startuml

actor Customer

participant Client
participant AuthorizationServer
participant ResourceServer

Client -> AuthorizationServer : Token Request + DPoP Proof

AuthorizationServer -> Client : Access Token (cnf)

Client -> ResourceServer : API Request + Access Token + DPoP Proof

ResourceServer -> ResourceServer : Validate Token + DPoP

ResourceServer -> Client : Protected Resource

@enduml`,
  },
  {
    id: "microservice-architecture",
    name: "Microservice Architecture",
    category: "Application Architecture",
    description: "Maps services behind an API gateway and their dependencies.",
    source: `@startuml
actor Customer
rectangle "API Gateway" as Gateway
rectangle "Identity Service" as Identity
rectangle "Business Service" as BusinessService
rectangle "Notification Service" as Notification
database "Application Database" as ApplicationDatabase

Customer --> Gateway
Gateway --> Identity
Gateway --> BusinessService
BusinessService --> Notification
BusinessService --> ApplicationDatabase
@enduml`,
  },
  {
    id: "event-driven-architecture",
    name: "Event Driven Architecture",
    category: "Application Architecture",
    description: "Shows event publication, consumption and read-model updates.",
    source: `@startuml
rectangle "Business Service" as Producer
queue "Event Bus" as EventBus
rectangle "Downstream Service" as Consumer
rectangle "Notification Service" as Notification
database "Read Model" as ReadModel

Producer --> EventBus : publish event
EventBus --> Consumer : consume
EventBus --> Notification : consume
Consumer --> ReadModel : update projection
@enduml`,
  },
  {
    id: "openshift-deployment",
    name: "OpenShift Deployment",
    category: "Platform Engineering",
    description: "Maps an application deployment on a container platform.",
    source: `@startuml
cloud "Internet" as Internet
node "Container Platform" {
  rectangle "Ingress" as Ingress
  rectangle "API Gateway" as Gateway
  rectangle "Identity Service" as IdentityService
  rectangle "Business Service" as BusinessService
  database "Application Database" as Database
}

Internet --> Ingress : HTTPS
Ingress --> Gateway : route traffic
Gateway --> IdentityService : validate token
Gateway --> BusinessService : forward API request
BusinessService --> Database : read/write data
@enduml`,
  },
  {
    id: "event-bus-flow",
    name: "Event Bus Flow",
    category: "Platform Engineering",
    description: "Traces an event from producer through bus to consumer.",
    source: `@startuml
rectangle "Producer" as Producer
queue "Event Bus" as EventBus
rectangle "Consumer" as Consumer

Producer --> EventBus : publish event
EventBus --> Consumer : consume event
Consumer --> Consumer : process message
@enduml`,
  },
  {
    id: "jvm-application-on-openshift",
    name: "JVM Application on OpenShift",
    category: "Platform Engineering",
    description: "Shows a JVM application and its platform dependencies.",
    source: `@startuml
node "Container Platform" {
  node "Application Pod" {
    rectangle "JVM Container" as Jvm
    rectangle "Java Application" as App
  }
  rectangle "Configuration Service" as Config
  rectangle "Secrets Service" as Secret
  database "Persistent Storage" as Storage
}

Config --> Jvm : JAVA_OPTS
Secret --> App : credentials
Jvm --> App : run application
App --> Storage : persist data
@enduml`,
  },
];

export function PlantUmlViewerPage() {
  usePageTitle("PlantUML Viewer");

  const [source, setSource] = useState(defaultSource);
  const [selectedTemplateId, setSelectedTemplateId] = useState("");
  const [activeTemplateCategory, setActiveTemplateCategory] =
    useState<TemplateCategoryFilter>("All Templates");
  const [renderedDiagram, setRenderedDiagram] =
    useState<RenderedDiagram | null>(null);
  const [status, setStatus] = useState<RenderStatus>("idle");
  const [error, setError] = useState("");
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const [exportInProgress, setExportInProgress] = useState<
    "svg" | "png" | null
  >(null);
  const renderRequestId = useRef(0);

  const canExportDiagram = status === "success" && renderedDiagram !== null;
  const selectedTemplateName =
    plantUmlTemplates.find((template) => template.id === selectedTemplateId)
      ?.name ?? "";
  const visibleTemplates =
    activeTemplateCategory === "All Templates"
      ? plantUmlTemplates
      : plantUmlTemplates.filter(
          (template) => template.category === activeTemplateCategory,
        );

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
    const requestId = ++renderRequestId.current;

    if (validationMessage) {
      setRenderedDiagram(null);
      setStatus("failure");
      setError(validationMessage);
      showToast("failure", "PlantUML source needs attention.");
      return;
    }

    setRenderedDiagram(null);
    setStatus("rendering");
    setError("");

    try {
      const encodedSource = await encodePlantUmlSource(source);
      if (requestId !== renderRequestId.current) return;

      setRenderedDiagram({
        filenameBase: getPlantUmlExportFilename(
          source,
          selectedTemplateName,
          "svg",
        ).replace(/\.svg$/, ""),
        url: `https://www.plantuml.com/plantuml/svg/${encodedSource}`,
      });
    } catch {
      if (requestId !== renderRequestId.current) return;

      setRenderedDiagram(null);
      setStatus("failure");
      setError(
        "The diagram could not be prepared. Check your browser support and try again.",
      );
      showToast("failure", "Render failed.");
    }
  }

  async function handleCopySource() {
    if (!source.trim()) {
      showToast("failure", "There is no PlantUML source to copy.");
      return;
    }

    try {
      await navigator.clipboard.writeText(source);
      showToast("success", "PlantUML source copied.");
    } catch {
      showToast("failure", "Copy failed. Please copy the source manually.");
    }
  }

  async function handleDownloadSvg() {
    if (!canExportDiagram || !renderedDiagram) return;

    setExportInProgress("svg");
    try {
      await downloadPlantUmlSvg(
        renderedDiagram.url,
        `${renderedDiagram.filenameBase}.svg`,
      );
      showToast("success", "SVG downloaded.");
    } catch {
      showToast("failure", "SVG export failed. Please try again.");
    } finally {
      setExportInProgress(null);
    }
  }

  async function handleDownloadPng() {
    if (!canExportDiagram || !renderedDiagram) return;

    setExportInProgress("png");
    try {
      await downloadPlantUmlPng(
        renderedDiagram.url,
        `${renderedDiagram.filenameBase}.png`,
      );
      showToast("success", "PNG downloaded.");
    } catch {
      showToast("failure", "PNG export failed. Please try again.");
    } finally {
      setExportInProgress(null);
    }
  }

  function handleClear() {
    renderRequestId.current += 1;
    setSource("");
    setSelectedTemplateId("");
    setRenderedDiagram(null);
    setStatus("idle");
    setError("");
    showToast("info", "PlantUML source cleared.");
  }

  function handleExampleSelect(example: ToolExample) {
    renderRequestId.current += 1;
    setSource(example.input);
    setSelectedTemplateId("");
    setRenderedDiagram(null);
    setStatus("idle");
    setError("");
    showToast("info", `${example.title} loaded.`);
  }

  function handleTemplateSelect(template: PlantUmlTemplate) {
    renderRequestId.current += 1;
    setSource(template.source);
    setSelectedTemplateId(template.id);
    setRenderedDiagram(null);
    setStatus("idle");
    setError("");
    showToast("info", `${template.name} template loaded.`);
  }

  return (
    <ToolPageLayout
      title="PlantUML Viewer"
      description="Render PlantUML diagrams from source code."
      breadcrumbs={[
        {
          label: "Architecture & Design",
          path: routePaths.architectureDesign,
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
      inputTitle={null}
      inputs={
        <div className="space-y-5">
          <section
            className="min-w-0 rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-950"
            aria-labelledby="plantuml-templates-heading"
          >
            <div className="flex min-w-0 flex-col gap-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <h2
                    id="plantuml-templates-heading"
                    className="text-sm font-semibold text-gray-900 dark:text-white"
                  >
                    Templates
                  </h2>
                  <HelpTooltip
                    title="PlantUML Templates"
                    description="Choose a starter template to replace the editor content."
                  />
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {visibleTemplates.length} template
                  {visibleTemplates.length === 1 ? "" : "s"}
                </p>
              </div>
              <div
                className="flex max-w-full gap-2 overflow-x-auto pb-1"
                role="group"
                aria-label="Filter PlantUML templates by category"
              >
                {(["All Templates", ...templateCategories] as const).map(
                  (category) => {
                    const isActive = activeTemplateCategory === category;

                    return (
                      <Button
                        key={category}
                        color={isActive ? "blue" : "light"}
                        size="xs"
                        className="shrink-0"
                        aria-pressed={isActive}
                        onClick={() => setActiveTemplateCategory(category)}
                      >
                        {isActive ? (
                          <span className="mr-1" aria-hidden="true">
                            ✓
                          </span>
                        ) : null}
                        {category}
                      </Button>
                    );
                  },
                )}
              </div>
              <div className="grid max-h-[26rem] min-w-0 gap-3 overflow-y-auto overscroll-contain pr-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {visibleTemplates.map((template) => (
                  <TemplateCard
                    key={template.id}
                    template={template}
                    isSelected={selectedTemplateId === template.id}
                    onSelect={handleTemplateSelect}
                  />
                ))}
              </div>
            </div>
          </section>

          <div className="grid min-w-0 gap-5 xl:grid-cols-[minmax(0,0.45fr)_minmax(0,0.55fr)]">
            <section
              className="min-w-0 rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900"
              aria-labelledby="plantuml-source-label"
            >
              <div className="mb-2 flex items-center gap-2">
                <label
                  htmlFor="plantuml-source"
                  id="plantuml-source-label"
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
                  renderRequestId.current += 1;
                  setSource(event.target.value);
                  setSelectedTemplateId("");
                  setRenderedDiagram(null);
                  setStatus("idle");
                  setError("");
                }}
                rows={18}
                wrap="off"
                spellCheck={false}
                aria-describedby={
                  error
                    ? "plantuml-source-guidance plantuml-render-error"
                    : "plantuml-source-guidance"
                }
                aria-invalid={Boolean(error && validatePlantUmlSource(source))}
                className="min-h-[28rem] max-w-full resize-y overflow-auto font-mono whitespace-pre"
                placeholder={`@startuml
Alice -> Bob : Hello
@enduml`}
              />
              <p
                id="plantuml-source-guidance"
                className="mt-2 text-xs text-gray-500 dark:text-gray-400"
              >
                Editing the source clears the current preview. Render again to
                refresh exports.
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <Button
                  color="blue"
                  disabled={status === "rendering"}
                  onClick={handleRender}
                >
                  {status === "rendering" ? "Rendering…" : "Render Diagram"}
                </Button>
                <Button
                  color="light"
                  disabled={!source.trim()}
                  onClick={handleCopySource}
                >
                  Copy PlantUML Source
                </Button>
                <Button color="light" onClick={handleClear}>
                  Clear
                </Button>
              </div>
            </section>

            <section
              className="min-w-0 rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-950"
              aria-labelledby="plantuml-preview-heading"
              aria-busy={status === "rendering"}
            >
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <h2
                    id="plantuml-preview-heading"
                    className="text-sm font-semibold text-gray-900 dark:text-white"
                  >
                    Diagram Preview
                  </h2>
                  <HelpTooltip
                    title="Diagram Preview"
                    description="Rendered PlantUML diagram output. Rendering happens when you click Render Diagram."
                  />
                </div>
                <div className="flex max-w-full flex-wrap items-center justify-end gap-2">
                  <RenderStatusBadge status={status} />
                  <Button
                    color="light"
                    size="xs"
                    disabled={!canExportDiagram || exportInProgress !== null}
                    aria-describedby="plantuml-export-status"
                    onClick={handleDownloadSvg}
                  >
                    {exportInProgress === "svg"
                      ? "Downloading SVG…"
                      : "Download SVG"}
                  </Button>
                  <Button
                    color="light"
                    size="xs"
                    disabled={!canExportDiagram || exportInProgress !== null}
                    aria-describedby="plantuml-export-status"
                    onClick={handleDownloadPng}
                  >
                    {exportInProgress === "png"
                      ? "Downloading PNG…"
                      : "Download PNG"}
                  </Button>
                </div>
              </div>

              <p
                id="plantuml-export-status"
                className="sr-only"
                aria-live="polite"
              >
                {canExportDiagram
                  ? "SVG and PNG downloads are available."
                  : "Render a valid diagram to enable SVG and PNG downloads."}
              </p>

              {error ? (
                <Alert id="plantuml-render-error" color="failure" role="alert">
                  <span className="font-semibold">Preview unavailable.</span>{" "}
                  {error}
                </Alert>
              ) : null}

              {renderedDiagram ? (
                <div className="mt-4 max-h-[42rem] min-h-96 max-w-full overflow-auto overscroll-contain rounded-lg bg-white p-4 dark:bg-gray-900">
                  {status === "rendering" ? (
                    <div className="flex min-h-[22rem] flex-col items-center justify-center gap-3 text-sm text-gray-600 dark:text-gray-300">
                      <Spinner aria-label="Loading diagram preview" size="lg" />
                      <span>Loading diagram preview…</span>
                    </div>
                  ) : null}
                  <div
                    className={
                      status === "rendering"
                        ? "sr-only"
                        : "flex min-w-full justify-center"
                    }
                  >
                    <img
                      src={renderedDiagram.url}
                      alt="Rendered PlantUML diagram"
                      className="block max-w-none"
                      onError={() => {
                        setRenderedDiagram(null);
                        setStatus("failure");
                        setError(
                          "The render service could not load the diagram. Check the source or try again.",
                        );
                        showToast("failure", "Render failed.");
                      }}
                      onLoad={() => {
                        setStatus("success");
                        showToast("success", "Diagram rendered.");
                      }}
                    />
                  </div>
                </div>
              ) : status === "rendering" ? (
                <PreviewState>
                  <Spinner aria-label="Rendering diagram" size="lg" />
                  <span>Rendering diagram…</span>
                </PreviewState>
              ) : status === "failure" ? (
                <PreviewState>
                  Preview cleared. Update the source and render again.
                </PreviewState>
              ) : (
                <PreviewState>
                  {source.trim()
                    ? "Ready to render. Select Render Diagram to create the preview."
                    : "Add PlantUML source or choose a template to begin."}
                </PreviewState>
              )}
            </section>
          </div>
        </div>
      }
      examples={examples}
      onExampleSelect={handleExampleSelect}
      notes={
        <ul className="list-disc space-y-2 pl-5 text-sm text-gray-600 dark:text-gray-300">
          <li>
            Rendering is triggered manually; real-time rendering is not enabled.
          </li>
          <li>
            PlantUML syntax errors are displayed by the rendering service.
          </li>
          <li>
            Keep sensitive architecture details out of externally rendered
            diagrams.
          </li>
        </ul>
      }
      notesCollapsible
      toast={<ToolToast toast={toast} />}
    />
  );
}

function TemplateCard({
  template,
  isSelected,
  onSelect,
}: {
  template: PlantUmlTemplate;
  isSelected: boolean;
  onSelect: (template: PlantUmlTemplate) => void;
}) {
  return (
    <article
      className={`flex min-w-0 flex-col rounded-lg border bg-white p-3 dark:bg-gray-900 ${
        isSelected
          ? "border-blue-500 ring-1 ring-blue-500 dark:border-blue-400 dark:ring-blue-400"
          : "border-gray-200 dark:border-gray-700"
      }`}
    >
      <div className="mb-2 flex min-w-0 items-start justify-between gap-2">
        <p className="min-w-0 text-xs font-semibold text-gray-500 uppercase dark:text-gray-400">
          {template.category}
        </p>
        {isSelected ? <Badge color="info">In Editor</Badge> : null}
      </div>
      <h3 className="text-sm font-semibold break-words text-gray-900 dark:text-white">
        {template.name}
      </h3>
      <p className="mt-1 mb-3 text-xs text-gray-600 dark:text-gray-300">
        {template.description}
      </p>
      <Button
        color={isSelected ? "blue" : "light"}
        size="xs"
        className="mt-auto self-start"
        aria-label={`Use ${template.name} template`}
        aria-pressed={isSelected}
        onClick={() => onSelect(template)}
      >
        Use Template
      </Button>
    </article>
  );
}

function PreviewState({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-4 flex min-h-96 flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-gray-300 bg-white p-6 text-center text-sm text-gray-600 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300">
      {children}
    </div>
  );
}

function RenderStatusBadge({ status }: { status: RenderStatus }) {
  if (status === "success") {
    return <Badge color="success">Render Success</Badge>;
  }

  if (status === "failure") {
    return <Badge color="failure">Render Failure</Badge>;
  }

  if (status === "rendering") {
    return <Badge color="info">Rendering</Badge>;
  }

  return <Badge color="gray">Not Rendered</Badge>;
}
