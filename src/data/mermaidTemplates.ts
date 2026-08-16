export const mermaidTemplateCategories = [
  "General",
  "C4 Architecture",
  "Security & Identity",
  "Application Architecture",
  "Platform Engineering",
  "ISAQB Architecture",
  "Mermaid Native",
] as const;

export type MermaidTemplateCategory =
  (typeof mermaidTemplateCategories)[number];

export interface MermaidTemplate {
  id: string;
  name: string;
  category: MermaidTemplateCategory;
  description: string;
  source: string;
}

const flowchartTemplate: MermaidTemplate = {
  id: "flowchart",
  name: "Flowchart",
  category: "Mermaid Native",
  description: "Trace a customer request through a simple application flow.",
  source: `flowchart LR
Customer["Customer"] --> WebPortal["Web Portal"]
WebPortal --> ApiGateway["API Gateway"]
ApiGateway --> BusinessService["Business Service"]
BusinessService --> Database[("Application Database")]`,
};

export const mermaidTemplates: MermaidTemplate[] = [
  flowchartTemplate,
  {
    id: "sequence-diagram",
    name: "Sequence Diagram",
    category: "General",
    description:
      "Show a concise authenticated request across application services.",
    source: `sequenceDiagram
actor Customer
participant MobileApp as Mobile App
participant ApiGateway as API Gateway
participant IdentityService as Identity Service
participant BusinessService as Business Service

Customer->>MobileApp: Submit request
MobileApp->>ApiGateway: Send request
ApiGateway->>IdentityService: Validate session
IdentityService-->>ApiGateway: Session valid
ApiGateway->>BusinessService: Process request
BusinessService-->>ApiGateway: Return result
ApiGateway-->>MobileApp: Return response
MobileApp-->>Customer: Display result`,
  },
  {
    id: "component-diagram",
    name: "Component Diagram",
    category: "General",
    description: "Map software components and their main dependencies.",
    source: `flowchart LR
WebPortal["Web Portal"] --> ApiGateway["API Gateway"]
ApiGateway --> IdentityService["Identity Service"]
ApiGateway --> BusinessService["Business Service"]
BusinessService --> ApplicationDatabase[("Application Database")]`,
  },
  {
    id: "deployment-diagram",
    name: "Deployment Diagram",
    category: "General",
    description: "Show an application artifact inside its runtime nodes.",
    source: `flowchart TB
subgraph Platform["Container Platform"]
  subgraph Pod["Application Pod"]
    ApplicationContainer["Application Container"]
  end
end
ApplicationDatabase[("Application Database")]
ApplicationContainer -->|"Reads and writes"| ApplicationDatabase`,
  },
  {
    id: "c4-context",
    name: "C4 Context",
    category: "C4 Architecture",
    description: "Show a system, its user, and external dependencies.",
    source: `flowchart LR
Customer["Customer"] -->|"Uses"| CustomerPlatform["Customer Service Platform"]
CustomerPlatform -->|"Authenticates customers"| IdentityService["Identity Service"]
CustomerPlatform -->|"Checks risk"| RiskEngine["Risk Engine"]
CustomerPlatform -->|"Sends alerts"| NotificationService["Notification Service"]`,
  },
  {
    id: "c4-container",
    name: "C4 Container",
    category: "C4 Architecture",
    description: "Map applications and data stores within a system boundary.",
    source: `flowchart LR
Customer["Customer"] -->|"Uses"| MobileApp
subgraph CustomerPlatform["Customer Service Platform"]
  MobileApp["Mobile App"] -->|"Calls APIs"| ApiGateway["API Gateway"]
  ApiGateway --> SecurityService["Security Service"]
  ApiGateway --> RiskEngine["Risk Engine"]
  SecurityService --> ApplicationDatabase[("Application Database")]
  SecurityService --> Cache[("Cache")]
  RiskEngine --> ApplicationDatabase
end`,
  },
  {
    id: "c4-component",
    name: "C4 Component",
    category: "C4 Architecture",
    description: "Detail the internal components of a service container.",
    source: `flowchart LR
subgraph SecurityService["Security Service"]
  AuthenticationController["Authentication Controller"] --> AuthenticationService["Authentication Service"]
  AuthenticationService --> UserRepository["User Repository"]
  AuthenticationService --> RiskAdapter["Risk Adapter"]
end
UserRepository --> ApplicationDatabase[("Application Database")]
RiskAdapter --> RiskEngine["Risk Engine"]`,
  },
  {
    id: "c4-code",
    name: "C4 Code",
    category: "C4 Architecture",
    description: "Show code-level classes and their dependencies.",
    source: `classDiagram
class AuthenticationController {
  +login(request)
}
class AuthenticationService {
  +authenticate(credentials)
}
class UserRepository {
  +findByUsername(username)
}

AuthenticationController --> AuthenticationService : uses
AuthenticationService --> UserRepository : loads user`,
  },
  {
    id: "oauth2-authorization-code-flow",
    name: "OAuth2 Authorization Code Flow",
    category: "Security & Identity",
    description: "Trace an authorization code and access-token exchange.",
    source: `sequenceDiagram
actor Customer
participant Client
participant AuthorizationService as Authorization Service
participant API

Customer->>Client: Start sign-in
Client->>AuthorizationService: Authorization request
AuthorizationService-->>Customer: Authenticate and request consent
AuthorizationService-->>Client: Authorization code
Client->>AuthorizationService: Exchange code
AuthorizationService-->>Client: Access token
Client->>API: Request with access token
API-->>Client: Protected response`,
  },
  {
    id: "par",
    name: "PAR",
    category: "Security & Identity",
    description:
      "Show pushed authorization parameters and request reference use.",
    source: `sequenceDiagram
actor Customer
participant Browser
participant Client
participant AuthorizationService as Authorization Service

Client->>AuthorizationService: Push authorization parameters
AuthorizationService-->>Client: Return request reference
Client-->>Browser: Continue with request reference
Customer->>Browser: Approve sign-in
Browser->>AuthorizationService: Authorization request by reference
AuthorizationService-->>Client: Authorization code`,
  },
  {
    id: "dpop",
    name: "DPoP",
    category: "Security & Identity",
    description: "Show proof-bound access token use at a protected API.",
    source: `sequenceDiagram
participant Client
participant AuthorizationService as Authorization Service
participant ProtectedAPI as Protected API

Client->>Client: Create DPoP proof
Client->>AuthorizationService: Token request and DPoP proof
AuthorizationService-->>Client: Proof-bound access token
Client->>ProtectedAPI: Access token and fresh DPoP proof
ProtectedAPI->>ProtectedAPI: Validate token and proof binding
ProtectedAPI-->>Client: Protected response`,
  },
  {
    id: "microservice-architecture",
    name: "Microservice Architecture",
    category: "Application Architecture",
    description: "Map services behind a gateway with data and event flows.",
    source: `flowchart LR
Client["Client"] --> ApiGateway["API Gateway"]
ApiGateway --> IdentityService["Identity Service"]
ApiGateway --> CustomerService["Customer Service"]
ApiGateway --> OrderService["Order Service"]
CustomerService --> CustomerDatabase[("Customer Database")]
OrderService --> OrderDatabase[("Order Database")]
OrderService -->|"Publishes events"| EventBus["Event Bus"]`,
  },
  {
    id: "event-driven-architecture",
    name: "Event Driven Architecture",
    category: "Application Architecture",
    description: "Show asynchronous publication and multiple event consumers.",
    source: `flowchart LR
BusinessService["Business Service"] -->|"Publishes event"| EventBus["Event Bus"]
EventBus -.->|"Delivers asynchronously"| DownstreamService["Downstream Service"]
EventBus -.->|"Delivers asynchronously"| NotificationService["Notification Service"]
DownstreamService --> ReadModel[("Read Model")]`,
  },
  {
    id: "openshift-deployment",
    name: "OpenShift Deployment",
    category: "Platform Engineering",
    description: "Map an application deployment within an OpenShift boundary.",
    source: `flowchart TB
Internet["Internet"] -->|"HTTPS"| Ingress
subgraph OpenShift["OpenShift"]
  Ingress["Ingress"] --> ApiGateway["API Gateway"]
  ApiGateway -->|"Validates token"| IdentityService["Identity Service"]
  ApiGateway -->|"Forwards request"| BusinessService["Business Service"]
  BusinessService --> ApplicationDatabase[("Application Database")]
end`,
  },
  {
    id: "event-bus-flow",
    name: "Event Bus Flow",
    category: "Platform Engineering",
    description: "Trace an event from producer through bus to consumer.",
    source: `flowchart LR
Producer["Producer"] -->|"Publishes event"| EventBus["Event Bus"]
EventBus -.->|"Delivers event"| Consumer["Consumer"]
Consumer -->|"Processes message"| Result["Processing Result"]`,
  },
  {
    id: "jvm-application-on-openshift",
    name: "JVM Application on OpenShift",
    category: "Platform Engineering",
    description: "Show a JVM workload and supporting platform services.",
    source: `flowchart TB
subgraph OpenShift["OpenShift"]
  subgraph ApplicationPod["Application Pod"]
    JvmContainer["JVM Container"] -->|"Runs"| JvmApplication["JVM Application"]
  end
  ConfigurationService["Configuration Service"] -->|"Runtime options"| JvmContainer
  SecretsService["Secrets Service"] -->|"Credentials"| JvmApplication
  JvmApplication -->|"Persists data"| PersistentStorage[("Persistent Storage")]
end`,
  },
  {
    id: "context-diagram",
    name: "Context Diagram",
    category: "ISAQB Architecture",
    description: "Define a system boundary and its external relationships.",
    source: `flowchart LR
Customer["Customer"] -->|"Uses"| WebPortal
subgraph MainApplication["Main Application"]
  WebPortal["Web Portal"]
end
WebPortal -->|"Authenticates user"| IdentityService["Identity Service"]
WebPortal -->|"Processes payment"| PaymentService["Payment Service"]
WebPortal -->|"Synchronizes customer data"| CustomerSystem["Customer System"]`,
  },
  {
    id: "container-diagram",
    name: "Container Diagram",
    category: "ISAQB Architecture",
    description: "Map application containers and their primary data flows.",
    source: `flowchart LR
Customer["Customer"] --> Frontend["Frontend"]
Frontend -->|"HTTPS"| ApiGateway["API Gateway"]
subgraph BackendServices["Backend Services"]
  CustomerService["Customer Service"]
  OrderService["Order Service"]
end
ApiGateway --> CustomerService
ApiGateway --> OrderService
CustomerService --> ApplicationDatabase[("Application Database")]
OrderService --> ApplicationDatabase`,
  },
  {
    id: "runtime-view",
    name: "Runtime View",
    category: "ISAQB Architecture",
    description: "Trace a request through application services at runtime.",
    source: `sequenceDiagram
actor Customer
participant Frontend
participant ApiGateway as API Gateway
participant IdentityService as Identity Service
participant BusinessService as Business Service
participant ApplicationDatabase as Application Database

Customer->>Frontend: Submit request
Frontend->>ApiGateway: API request
ApiGateway->>IdentityService: Validate access token
IdentityService-->>ApiGateway: Token valid
ApiGateway->>BusinessService: Forward request
BusinessService->>ApplicationDatabase: Load and update data
ApplicationDatabase-->>BusinessService: Result
BusinessService-->>Frontend: Response payload
Frontend-->>Customer: Display result`,
  },
  {
    id: "class-diagram",
    name: "Class Diagram",
    category: "Mermaid Native",
    description: "Model customers, accounts, and their recorded transactions.",
    source: `classDiagram
class Customer {
  +String customerId
  +openAccount()
}
class Account {
  +String accountId
  +Decimal balance
  +recordTransaction()
}
class Transaction {
  +String transactionId
  +Decimal amount
}

Customer "1" --> "0..*" Account : owns
Account "1" --> "0..*" Transaction : records`,
  },
  {
    id: "state-diagram",
    name: "State Diagram",
    category: "Mermaid Native",
    description:
      "Describe a straightforward account lifecycle and transitions.",
    source: `stateDiagram-v2
[*] --> Created
Created --> Pending : submit
Pending --> Active : approve
Active --> Suspended : suspend
Suspended --> Active : reinstate
Active --> Closed : close
Suspended --> Closed : close
Closed --> [*]`,
  },
  {
    id: "er-diagram",
    name: "ER Diagram",
    category: "Mermaid Native",
    description: "Map a small relational model for customers and accounts.",
    source: `erDiagram
CUSTOMER ||--o{ ACCOUNT : owns
ACCOUNT ||--o{ TRANSACTION : records

CUSTOMER {
  string customer_id PK
  string name
}
ACCOUNT {
  string account_id PK
  string customer_id FK
}
TRANSACTION {
  string transaction_id PK
  string account_id FK
  decimal amount
}`,
  },
  {
    id: "architecture-diagram",
    name: "Architecture Diagram",
    category: "Mermaid Native",
    description:
      "Connect generic application services in a compact system view.",
    source: `architecture-beta
service portal(internet)[Web Portal]
service gateway(server)[API Gateway]
service identity(server)[Identity Service]
service business(server)[Business Service]
service database(database)[Application Database]

portal:R --> L:gateway
gateway:R --> L:identity
gateway:B --> T:business
business:R --> L:database`,
  },
];

export const defaultMermaidTemplate = flowchartTemplate;
