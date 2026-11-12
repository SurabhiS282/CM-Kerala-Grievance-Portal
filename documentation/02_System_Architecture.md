# System Architecture — CM Kerala Grievance Redressal Portal

This document details the architectural topology, component interactions, and end-to-end request flows of the CM Kerala Public Grievance Redressal Portal.

---

## 1. High-Level 3-Tier Architecture

The system is designed around a decoupled, three-tier architecture ensuring modularity, high scalability, and robust security:

1. **Presentation Tier (Frontend)**: Single Page Application (SPA) built with React and Vite, delivering high responsiveness, client-side route protection, and accessible government UI layouts.
2. **Application Tier (Backend API)**: Asynchronous RESTful service built with FastAPI, handling authentication, business logic, role-based authorization, file streaming, and AI orchestration.
3. **Data Tier (Persistence & Intelligence)**:
   - **PostgreSQL 14+**: Relational database handling ACID transactions, relational integrity, indexing, and audit history.
   - **Google Gemini 2.0 API**: External generative AI service for natural language complaint analysis and triaging.
   - **File System / Object Storage**: Media storage for uploaded citizen evidence and officer reports.

```mermaid
flowchart TD
    subgraph ClientLayer["Presentation Tier (Client Browser)"]
        CitizenUI["Citizen Portal\n(React + Vite)"]
        AdminUI["CMO Admin Dashboard\n(React + Vite)"]
        OfficerUI["Officer Workstation\n(React + Vite)"]
        PublicUI["Public Tracking & Info\n(React + Vite)"]
    end

    subgraph APILayer["Application Tier (FastAPI Gateway)"]
        Gateway["FastAPI Application Server\n(Uvicorn ASGI)"]
        AuthMiddleware["OAuth2 & JWT Auth\nRole Guard (RBAC)"]
        
        RouterAuth["/auth Router"]
        RouterGrievance["/grievances Router"]
        RouterCMO["/cmo Router"]
        RouterOfficer["/officer Router"]
        RouterAI["/ai Router"]
        RouterContact["/contact Router"]
        
        AIService["AI Orchestration Service\n(HTTPX Async Client)"]
        FileService["Attachment Handler\n(Multi-part Parser)"]
    end

    subgraph DataLayer["Data & External Services Tier"]
        PostgresDB[("PostgreSQL Database\n(SQLAlchemy ORM)")]
        FileStorage["Local / Shared Storage\n(/uploads Directory)"]
        GeminiAPI["Google Gemini 2.0 API\n(gemini-2.0-flash)"]
    end

    CitizenUI -->|HTTPS / JSON / JWT| Gateway
    AdminUI -->|HTTPS / JSON / JWT| Gateway
    OfficerUI -->|HTTPS / JSON / JWT| Gateway
    PublicUI -->|HTTPS / JSON| Gateway

    Gateway --> AuthMiddleware
    AuthMiddleware --> RouterAuth
    AuthMiddleware --> RouterGrievance
    AuthMiddleware --> RouterCMO
    AuthMiddleware --> RouterOfficer
    AuthMiddleware --> RouterAI
    AuthMiddleware --> RouterContact

    RouterGrievance --> FileService
    RouterGrievance --> AIService
    RouterOfficer --> FileService
    RouterAI --> AIService

    FileService --> FileStorage
    AIService -->|HTTPS REST| GeminiAPI

    RouterAuth --> PostgresDB
    RouterGrievance --> PostgresDB
    RouterCMO --> PostgresDB
    RouterOfficer --> PostgresDB
    RouterContact --> PostgresDB
```

---

## 2. Request Flow Sequence: Grievance Lifecycle

The following sequence diagram outlines the entire lifecycle of a citizen grievance: from submission and AI analysis to officer action and CMO approval.

```mermaid
sequenceDiagram
    autonumber
    actor Citizen as Citizen
    participant FE as React Frontend
    participant API as FastAPI Backend
    participant AI as Gemini 2.0 API
    participant DB as PostgreSQL DB
    actor CMO as CMO Administrator
    actor Officer as Department Officer

    %% STEP 1: Submission
    Citizen->>FE: Fill form, attach files & Submit
    FE->>API: POST /grievances/ (Multipart Form Data + JWT)
    API->>API: Validate file type & size (<5MB)
    API->>DB: INSERT into grievances (Status: 'Submitted')
    API->>DB: INSERT into grievance_history
    
    %% STEP 2: Asynchronous AI Triage
    rect rgb(240, 248, 255)
        Note over API,AI: Asynchronous AI Triage
        API->>AI: POST /models/gemini-2.0-flash:generateContent
        AI-->>API: JSON {department, priority, summary, reason, confidence}
        API->>DB: UPDATE grievances (Set AI suggestions)
    end
    API-->>FE: Return 201 Created {reference_number, status}
    FE-->>Citizen: Display Confirmation & Reference Code

    %% STEP 3: CMO Review & Assignment
    CMO->>FE: Open CMO Dashboard
    FE->>API: GET /cmo/grievances?status=Submitted
    API->>DB: Query pending grievances with AI suggestions
    DB-->>API: Grievances data
    API-->>FE: Render grievance list with AI predictions
    CMO->>FE: Select Officer & Click Assign
    FE->>API: POST /cmo/grievances/{id}/assign {dept_id, officer_id, priority}
    API->>DB: UPDATE grievances (Status: 'Under Review', Priority)
    API->>DB: INSERT into department_assignments
    API->>DB: INSERT into grievance_history ('Submitted' -> 'Under Review')
    API-->>FE: Assignment Confirmed

    %% STEP 4: Officer Investigation & Report
    Officer->>FE: Login & view assignments
    FE->>API: GET /officer/assignments
    API->>DB: Query active assignments for officer
    DB-->>API: Assignments list
    API-->>FE: Render assigned tasks
    Officer->>FE: Update remarks & Submit Resolution Report
    FE->>API: POST /officer/assignments/{id}/submit-report
    API->>DB: UPDATE department_assignments (cmo_review_status: 'pending')
    API->>DB: UPDATE grievances (Status: 'In Progress')
    API->>DB: INSERT into grievance_history ('Under Review' -> 'In Progress')
    API-->>FE: Report Submitted

    %% STEP 5: CMO Approval & Resolution
    CMO->>FE: Open Review Queue & Inspect Officer Report
    FE->>API: POST /cmo/grievances/{id}/review-report {decision: 'approved'}
    API->>DB: UPDATE department_assignments (cmo_review_status: 'approved')
    API->>DB: UPDATE grievances (Status: 'Resolved')
    API->>DB: INSERT into grievance_history ('In Progress' -> 'Resolved')
    API-->>FE: Resolution Published

    %% STEP 6: Citizen Feedback
    Citizen->>FE: Track grievance & view resolution
    Citizen->>FE: Submit Rating (5 Stars) & Comments
    FE->>API: POST /grievances/{id}/feedback
    API->>DB: UPDATE grievances (feedback_rating, feedback_comments)
    API-->>FE: Feedback Recorded
```

---

## 3. Component Deep Dive

### 3.1 Presentation Layer (Frontend)
- **Vite Bundler**: Ensures sub-second hot module reloading (HMR) and optimized static asset chunking.
- **State Management**:
  - `AuthContext`: Centralized React context storing the JWT token, decoded user profile, and session state persisted in `localStorage`.
  - Component-level state with `useState` and `useEffect` for data fetching, dynamic filters, and pagination.
- **Design Tokens**: Standardized CSS custom properties in `index.css` guarantee visual consistency across portals without third-party CSS overhead.
- **Route Guards**: `ProtectedRoute` component intercepts unauthorized navigation and evaluates allowed role matrices before rendering protected view trees.

### 3.2 Application Layer (FastAPI Backend)
- **Asynchronous Architecture**: Leverages Python's `asyncio` loop to serve concurrent requests with high throughput.
- **Pydantic Validation**: Strong request/response typing prevents malformed inputs and automatic serialization errors.
- **Security & Password Hashing**:
  - Bcrypt algorithm via `passlib` protects stored credentials.
  - Signed JWT tokens (`HS256`) with configurable expiration enforce stateless authentication.
- **File Upload Engine**: Enforces whitelist checks against MIME types (`image/jpeg`, `image/png`, `application/pdf`, docx) and enforces a strict 5 MB file size boundary.

### 3.3 Persistence Layer (PostgreSQL)
- **Relational Integrity**: Foreign key constraints cascade appropriately to maintain integrity across grievances, historical logs, and department assignments.
- **Indexing Strategy**:
  - Unique index on `users.email`.
  - Unique index on `departments.code`.
  - Unique and query-optimized index on `grievances.reference_number`.
  - Foreign key indexing on `grievances.citizen_id`, `department_assignments.officer_id`, and `grievance_history.grievance_id`.

### 3.4 Intelligence Layer (Gemini AI Service)
- **Provider**: Google Generative AI via HTTP REST API (`https://generativelanguage.googleapis.com/v1beta`).
- **Model**: `gemini-2.0-flash`.
- **Fault-Tolerance**:
  - Graceful fallback: If the external API times out, fails rate limiting (HTTP 429), or receives malformed data, the grievance is saved successfully with clear error indicators.
  - Manual Retry: CMO administrators have an explicit `/ai/analyze/{id}/retry` endpoint to re-trigger analysis on demand.
