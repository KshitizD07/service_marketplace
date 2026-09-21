# Backend Technical Documentation Suite
## Service Marketplace & Booking Platform

Welcome to the backend technical documentation for the Service Marketplace & Booking Platform. This suite contains the complete system design, architecture specifications, relational data models, API contracts, workflow diagrams, and developer task checklists.

---

## Documentation Navigation

| Document | Description | Key Contents |
| :--- | :--- | :--- |
| **[01. System Design](file:///C:/Users/kshit/cs/service-marketplace/docs/backend/01_SYSTEM_DESIGN.md)** | High-level system architecture & context | System topology, subsystems, scaling, concurrency, security |
| **[02. Architecture & Patterns](file:///C:/Users/kshit/cs/service-marketplace/docs/backend/02_ARCHITECTURE_AND_PATTERNS.md)** | Layered software design & code standards | Controller-Service-Repository, request lifecycle, error handling |
| **[03. Database Design](file:///C:/Users/kshit/cs/service-marketplace/docs/backend/03_DATABASE_DESIGN.md)** | Relational schema & indexing strategy | Mermaid ER diagram, full table DDL, constraints, query indexes |
| **[04. API Specification](file:///C:/Users/kshit/cs/service-marketplace/docs/backend/04_API_SPECIFICATION.md)** | Exhaustive REST API contract | Endpoints, HTTP methods, request bodies, response schemas |
| **[05. Workflows & Diagrams](file:///C:/Users/kshit/cs/service-marketplace/docs/backend/05_WORKFLOWS_AND_DIAGRAMS.md)** | Interaction sequence diagrams & state machines | Auth flow, booking conflict detection, state transitions, reviews |
| **[06. Dev Implementation Checklist](file:///C:/Users/kshit/cs/service-marketplace/docs/backend/06_DEV_IMPLEMENTATION_CHECKLIST.md)** | Phased developer task breakdown | Task-by-task sprint guide for building the backend |

---

## Quick Reference: Tech Stack

- **Runtime:** Node.js (v18+)
- **Framework:** Express.js (v5)
- **Database:** MySQL (v8.0+) via `mysql2/promise` connection pooling
- **Authentication:** Stateless JWT (`jsonwebtoken`) & `bcryptjs`
- **Architecture:** Controller-Service Layered Monolith
