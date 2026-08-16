export interface MermaidTemplate {
  id: string;
  name: string;
  description: string;
  source: string;
}

const flowchartTemplate: MermaidTemplate = {
  id: "flowchart",
  name: "Flowchart",
  description: "Trace a customer request through a simple application flow.",
  source: `flowchart LR
Customer[Customer] --> WebPortal[Web Portal]
WebPortal --> ApiGateway[API Gateway]
ApiGateway --> BusinessService[Business Service]
BusinessService --> Database[(Application Database)]`,
};

export const mermaidTemplates: MermaidTemplate[] = [
  flowchartTemplate,
  {
    id: "sequence-diagram",
    name: "Sequence Diagram",
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
    id: "class-diagram",
    name: "Class Diagram",
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
