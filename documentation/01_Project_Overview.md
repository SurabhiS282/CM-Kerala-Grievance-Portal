# CM Kerala — Chief Minister's Public Grievance Redressal Portal

> [!WARNING]
> **RECRUITMENT PROTOTYPE DISCLAIMER**
> This application is an assessment/recruitment prototype built for evaluation purposes. It is **NOT** an official Government of Kerala portal or affiliated with any government department or authority. Any government names, insignia, department titles, or contact information are used purely for demonstration and contextual scenario testing.

---

## 1. Executive Summary

The **Chief Minister's Public Grievance Redressal Portal (CM Kerala)** is an end-to-end digital governance platform engineered to connect citizens directly with the Chief Minister's Office (CMO). The platform streamlines the lifecycle of public grievances—from online submission and AI-assisted classification to department assignment, multi-tier officer investigations, CMO oversight, and citizen closure feedback.

By transitioning from fragmented paper representations and unmonitored email complaints into a centralized, transparent web application, the portal establishes accountability, transparency, and rapid redressal for citizen concerns across all 14 districts of Kerala.

---

## 2. Problem Statement

Public administration across Indian states faces systemic challenges when handling citizen grievances:

1. **Information Silos and Bureaucratic Delays**: Petitions submitted in person or via local offices are easily misplaced, untracked, or delayed in departmental handoffs.
2. **Lack of Citizen Visibility**: Citizens rarely have visibility into which official is investigating their case, what actions have been undertaken, or realistic timelines for resolution.
3. **Manual Triage Bottlenecks at the CMO**: The Chief Minister's Secretariat receives thousands of daily petitions. Manually cataloging, assessing priority, and deciding departmental jurisdictions drains administrative bandwidth.
4. **Weak Accountability & Closure Loops**: Many grievances are marked "disposed" without genuine resolution or verification from the aggrieved citizen.
5. **No Data-Driven Governance**: Senior leadership lacks aggregated intelligence to pinpoint recurring civic failures (e.g., repeating road defects in a specific municipality or chronic hospital supply shortages).

---

## 3. Project Objectives

- **Citizen Empowerment**: Offer an intuitive, mobile-friendly interface for citizens to lodge grievances 24/7 with zero red tape and attach photographic/documentary evidence.
- **Transparent Lifecycle Tracking**: Provide an open reference tracking mechanism (`GRV-YYYY-XXXXXX`) allowing real-time status visibility without mandatory portal sign-in.
- **AI-Powered Administrative Decision Support**: Harness Google Gemini 2.0 to parse unstructured citizen complaints, evaluate urgency/sentiment, extract core summaries, and recommend appropriate handling departments with confidence scores.
- **Strict Human-in-the-Loop Governance**: Guarantee that artificial intelligence never makes unilateral administrative decisions—AI suggestions remain advisory, while CMO administrators retain final authority.
- **Rigorous Multi-Department Workflow**: Enable smooth delegation from CMO to specific departmental nodal officers, supporting structured investigation notes, resolution reports, and CMO approval cycles.
- **Citizen Feedback & Reopening**: Empower citizens to rate resolution quality (1 to 5 stars) and submit formal reopen requests if the resolution is inadequate.

---

## 4. Scope

### In Scope
- Web-based responsive portal (Desktop, Tablet, Mobile).
- Role-Based Access Control (RBAC) with three primary personas: **Citizen**, **CMO Administrator**, and **Department Officer**.
- End-to-end grievance lifecycle management:
  - Submission & automated reference generation
  - AI triaging & department recommendation
  - CMO assignment and priority elevation
  - Officer field investigation & report filing
  - CMO report review (Approve, Reject, Request Further Action)
  - Citizen rating and feedback loop
- Public reference tracking system.
- Public information pages (About, How It Works, Departments, FAQ, Contact).
- File upload support for attachments (JPG, PNG, PDF up to 5MB).
- Audit trail via chronological status history.

### Out of Scope (Future Phases)
- SMS Gateway / WhatsApp chatbot integration.
- Aadhaar biometric e-KYC integration.
- Native mobile applications (iOS/Android).
- Payment gateway for RTI filings.

---

## 5. Key Features

| Module | Features |
| :--- | :--- |
| **Citizen Portal** | Self-service registration & JWT authentication; grievance submission with district/category picking; file attachments upload; personal grievance tracker; detailed timeline viewer; satisfaction rating (1–5 stars) & review submission; reopen request mechanism. |
| **CMO Administrative Console** | Comprehensive statistics (Total, In Progress, Resolved, Critical); multi-criteria filtering (status, district, department, priority, text query); AI triage panel inspection; departmental & officer assignment; status override & priority escalation; report verification workflow. |
| **Officer Portal** | Department-filtered assignment inbox; active case review; field investigation documentation; action-taken logging; evidence attachment; final resolution report submission to CMO. |
| **AI Triaging Engine** | Asynchronous Google Gemini 2.0 Flash integration; department routing prediction; priority calculation (Low, Medium, High); automatic executive summary generation; reasoning and confidence scoring. |
| **Public Transparency** | Non-authenticated reference number tracking; published directory of state departments; dynamic contact submission; interactive FAQ accordion. |

---

## 6. Technology Stack

### Frontend Architecture
- **Framework**: React 19 + Vite 6
- **Routing**: React Router DOM (v7)
- **Styling**: Pure semantic CSS with Government of Kerala design language tokens (Navy `#1a365d`, Kerala Emerald `#047857`, Slate `#1e293b`). Responsive CSS Grid and Flexbox with zero heavy external UI libraries.
- **Icons & Typography**: Inter font family; system emoji & SVG icons.
- **HTTP Client**: Native Fetch API with centralized request interceptors and token management.

### Backend Architecture
- **Framework**: FastAPI (Python 3.11+)
- **ORM**: SQLAlchemy 2.0 (Mapped Column style)
- **Database Driver**: Psycopg2 / Asyncpg compatible with PostgreSQL 14+
- **Data Validation & Schemas**: Pydantic v2
- **Authentication**: OAuth2 Password Bearer with JWT (HMAC-SHA256) and Passlib Bcrypt password hashing.
- **HTTP Client**: HTTPX (async client for external AI calls).

### Database Engine
- **RDBMS**: PostgreSQL 14+ (Relational schema with UUID primary keys, indexed reference codes, foreign key constraints, and relational history tables).

### Artificial Intelligence Integration
- **LLM Provider**: Google Generative AI (Gemini REST API)
- **Model**: `gemini-2.0-flash`
- **Output Format**: Enforced structured JSON format via system prompt directives.

---

## 7. Role-Based Access Control (RBAC)

The system enforces strict RBAC across both the API gateway and client routing:

```
                  ┌──────────────────────────────────────────────┐
                  │                 User Roles                   │
                  └──────────────────────┬───────────────────────┘
                                         │
         ┌───────────────────────────────┼───────────────────────────────┐
         ▼                               ▼                               ▼
  ┌───────────────┐              ┌───────────────┐              ┌────────────────┐
  │    Citizen    │              │   CMO Admin   │              │    Officer     │
  └──────┬────────┘              └───────┬───────┘              └────────┬───────┘
         │                               │                               │
  • Register & Login              • Oversee all State             • View assigned
  • Submit Grievance                Grievances                      cases only
  • Upload Documents              • Filter & Escalate             • Record field
  • Track Progress                • Review AI suggestions           investigation
  • Rate Resolution               • Assign to Officers            • Submit Action
  • Request Reopen                • Review/Approve Reports          Taken Report
```

1. **Citizen (`citizen`)**:
   - Represents the general public.
   - Restricted to viewing and acting only on grievances they authored.
   - Can submit grievances, upload attachments, view progress timelines, submit satisfaction scores, and request grievance reopenings.

2. **CMO Administrator (`cmo_admin`)**:
   - Super-administrative authority situated within the Chief Minister's Secretariat.
   - Has full statewide visibility over all grievances across all departments and districts.
   - Inspects AI recommendations and assigns cases to specific departments and nodal officers.
   - Approves, rejects, or requests revisions on officer resolution reports.
   - Manages state-level escalations and administrative overrides.

3. **Department Officer (`officer`)**:
   - Nodal officer belonging to a specific department (e.g., PWD, Health, Education).
   - Restricted strictly to grievances explicitly assigned to their department/account.
   - Updates investigation progress, uploads department reports, and submits final resolution dossiers to the CMO.
