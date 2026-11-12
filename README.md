# CM Kerala — Chief Minister's Public Grievance Redressal Portal

> [!WARNING]
> **RECRUITMENT PROTOTYPE DISCLAIMER**
> This application is an evaluation/recruitment prototype built for assessment purposes. It is **NOT** an official Government of Kerala portal or affiliated with any government department or authority. Any government names, insignia, department titles, or contact information are used purely for demonstration and contextual scenario testing.

---

## 🏛️ Project Overview

The **Chief Minister's Public Grievance Redressal Portal (CM Kerala)** is an end-to-end digital governance platform connecting citizens directly with the Chief Minister's Office (CMO). The platform streamlines the entire grievance lifecycle: from online submission and Google Gemini AI-assisted triage to department allocation, field officer investigations, CMO oversight, and citizen satisfaction rating.

---

## 🚀 Key Features

- **Citizen Self-Service**: User registration, authenticated submission with document uploads (JPG, PNG, PDF), personalized tracking dashboard, rating feedback (1-5 stars), and case reopening.
- **Public Grievance Tracker**: Open tracking system using unique reference numbers (`GRV-YYYY-XXXXXX`) accessible without logging in.
- **Google Gemini 2.0 AI Triaging**: Automatic categorization, department recommendation, urgency scoring, and executive summary generation using `gemini-2.0-flash`.
- **Human-in-the-Loop Governance**: Strict administrative safety guard—AI never assigns or closes cases unilaterally; human CMO administrators retain full executive discretion.
- **CMO Administrative Console**: Real-time statewide analytics, multi-criteria filtering, department and officer delegation, priority escalation, and resolution verification.
- **Officer Workstation**: Department-specific assignment queue, investigation note logging, evidence upload, and final report submission.
- **Audit Trail & Timeline**: Immutable chronological status change logs tracking every state transition across the grievance lifecycle.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 19, Vite 6, React Router DOM v7, Native Semantic CSS with Design Tokens |
| **Backend** | FastAPI, Python 3.11+, SQLAlchemy 2.0 (ORM), Pydantic v2, Uvicorn (ASGI) |
| **Database** | PostgreSQL 14+ (UUID keys, foreign key constraints, relational indexing) |
| **AI Triaging** | Google Generative AI (Gemini 2.0 Flash via REST API with structured JSON output) |
| **Security** | OAuth2 Password Bearer, JWT (HMAC-SHA256), Passlib Bcrypt password hashing |

---

## ⚡ Quick Start Guide

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **Python**: 3.11.0 or higher
- **PostgreSQL**: 14.0 or higher

---

### 1. Backend Setup

```bash
# 1. Navigate to backend directory
cd backend

# 2. Create and activate Python virtual environment
python -m venv venv
# On Windows:
.\venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# 3. Install dependencies
pip install -r requirements.txt

# 4. Create environment file
copy .env.example .env    # Windows
# cp .env.example .env    # macOS/Linux

# 5. Create database in PostgreSQL
psql -U postgres -c "CREATE DATABASE cm_kerala;"

# 6. Seed database with departments, demo accounts, and sample grievances
python -m app.seed

# 7. Start the FastAPI backend server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```
- API Base URL: `http://localhost:8000`
- Interactive Swagger UI: `http://localhost:8000/docs`
- ReDoc API Documentation: `http://localhost:8000/redoc`

---

### 2. Frontend Setup

```bash
# 1. Open a new terminal and navigate to frontend directory
cd frontend

# 2. Install dependencies
npm install

# 3. Start the Vite development server
npm run dev
```
- Frontend Web App: `http://localhost:5173`

---

## 👥 Demo Accounts & Credentials

The seed script (`python -m app.seed`) generates pre-configured accounts for testing:

| Persona | Role | Email | Password | Department |
| :--- | :--- | :--- | :--- | :--- |
| **Arun Kumar** | Citizen | `citizen@demo.com` | `Demo@123` | N/A |
| **Dr. Priya Nair** | CMO Administrator | `cmo@demo.com` | `Demo@123` | Chief Minister's Office |
| **Rajesh Menon** | Department Officer | `officer@demo.com` | `Demo@123` | Public Works Dept (PWD) |
| **Lakshmi Pillai**| Department Officer | `officer2@demo.com` | `Demo@123` | Health Department |

---

## 📁 Project Structure

```
CM_Kerala_Project/
├── backend/
│   ├── app/
│   │   ├── models/             # SQLAlchemy ORM database models
│   │   │   ├── assignment.py   # Department assignments & reports
│   │   │   ├── attachment.py   # Uploaded document metadata
│   │   │   ├── contact.py      # Public contact inquiries
│   │   │   ├── department.py   # Government departments
│   │   │   ├── grievance.py    # Grievances & audit history
│   │   │   └── user.py         # User accounts & RBAC roles
│   │   ├── routers/            # FastAPI route controllers
│   │   │   ├── ai_router.py    # AI test & retry endpoints
│   │   │   ├── auth.py         # Registration, login, profile
│   │   │   ├── cmo.py          # CMO administration & oversight
│   │   │   ├── contact.py      # Public contact inquiries
│   │   │   ├── departments.py  # Department directory
│   │   │   ├── grievances.py   # Citizen grievance lifecycle
│   │   │   └── officer.py      # Officer investigation workflows
│   │   ├── schemas/            # Pydantic data validation schemas
│   │   ├── services/           # Business logic & external clients
│   │   │   ├── ai_service.py   # Google Gemini 2.0 integration
│   │   │   └── auth_service.py # JWT & Bcrypt security
│   │   ├── config.py           # Settings from environment variables
│   │   ├── database.py         # SQLAlchemy engine & session factory
│   │   ├── main.py             # FastAPI application entrypoint
│   │   └── seed.py             # Database seeder script
│   ├── requirements.txt        # Python package dependencies
│   └── uploads/                # File storage for attachments
├── frontend/
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   │   ├── Footer.jsx      # Portal footer & disclaimer
│   │   │   ├── Navbar.jsx      # Navigation bar & auth actions
│   │   │   ├── ProtectedRoute.jsx # RBAC route guard
│   │   │   └── UI.jsx          # Badges, spinners, stat cards
│   │   ├── context/
│   │   │   └── AuthContext.jsx # React authentication context
│   │   ├── pages/              # View pages & route screens
│   │   │   ├── citizen/        # Citizen dashboard & submission
│   │   │   ├── cmo/            # CMO dashboard & review queue
│   │   │   ├── officer/        # Officer dashboard & task handling
│   │   │   ├── About.jsx       # Mission & portal overview
│   │   │   ├── Contact.jsx     # Contact enquiry form
│   │   │   ├── Departments.jsx # Department directory
│   │   │   ├── FAQ.jsx         # Accordion FAQ guide
│   │   │   ├── Home.jsx        # Landing page with stats & steps
│   │   │   ├── HowItWorks.jsx  # Process explanation
│   │   │   ├── Login.jsx       # Authentication sign-in
│   │   │   ├── Register.jsx    # Citizen self-registration
│   │   │   └── Track.jsx       # Public tracking page
│   │   ├── services/
│   │   │   └── api.js          # Centralized fetch API client
│   │   ├── App.jsx             # React router configuration
│   │   ├── index.css           # Government design system styles
│   │   └── main.jsx            # React root entrypoint
│   ├── package.json            # Node.js dependencies
│   └── vite.config.js          # Vite build configuration
├── documentation/              # In-depth architectural & user guides
│   ├── 01_Project_Overview.md   # Scope, problem statement, objectives
│   ├── 02_System_Architecture.md# 3-tier architecture & request sequence
│   ├── 03_Database_Design.md   # ER diagram & 7-table schema specs
│   ├── 04_API_Documentation.md # REST endpoints with payloads
│   ├── 05_AI_Integration.md    # Gemini prompt, schema, & safeguards
│   ├── 06_Setup_and_Testing.md # Installation, seeding, & test cases
│   └── 07_User_Guide.md        # Step-by-step role operation guides
├── .env.example                # Example environment variables
└── README.md                   # This project guide
```

---

## 🔌 API Overview

| Group | Method | Endpoint | Access | Purpose |
| :--- | :--- | :--- | :--- | :--- |
| **Auth** | `POST` | `/auth/register` | Public | Register new citizen account |
| **Auth** | `POST` | `/auth/login` | Public | Authenticate user & return JWT token |
| **Auth** | `GET` | `/auth/me` | Authenticated | Fetch current profile |
| **Departments** | `GET` | `/departments/` | Public | List all active state departments |
| **Grievances** | `POST` | `/grievances/` | Citizen | Submit new grievance with attachments |
| **Grievances** | `GET` | `/grievances/my` | Citizen | List citizen's filed grievances |
| **Grievances** | `GET` | `/grievances/track/{ref}` | Public | Track grievance status without login |
| **Grievances** | `GET` | `/grievances/{id}` | Authenticated | View grievance detail & history |
| **Grievances** | `POST` | `/grievances/{id}/feedback` | Citizen | Submit satisfaction score (1–5) & review |
| **Grievances** | `POST` | `/grievances/{id}/reopen` | Citizen | Request case reopening |
| **CMO** | `GET` | `/cmo/dashboard/stats` | CMO Admin | Aggregated statewide statistics |
| **CMO** | `GET` | `/cmo/grievances` | CMO Admin | Filtered statewide grievance queue |
| **CMO** | `POST` | `/cmo/grievances/{id}/assign` | CMO Admin | Assign grievance to department & officer |
| **CMO** | `POST` | `/cmo/grievances/{id}/review-report` | CMO Admin | Review & approve/reject officer report |
| **CMO** | `POST` | `/cmo/grievances/{id}/escalate` | CMO Admin | Escalate grievance priority level |
| **CMO** | `GET` | `/cmo/officers` | CMO Admin | List nodal officers by department |
| **Officer** | `GET` | `/officer/assignments` | Officer | List assignments assigned to officer |
| **Officer** | `POST` | `/officer/assignments/{id}/update` | Officer | Update field investigation progress |
| **Officer** | `POST` | `/officer/assignments/{id}/submit-report` | Officer | Submit resolution report with evidence |
| **Officer** | `GET` | `/officer/dashboard/stats` | Officer | View personal officer metrics |
| **AI** | `POST` | `/ai/analyze` | CMO Admin | Run ad-hoc AI analysis on text |
| **AI** | `POST` | `/ai/analyze/{id}/retry` | CMO Admin | Retry AI triaging for a grievance |
| **Contact** | `POST` | `/contact/` | Public | Submit public contact message |

---

## 🤖 AI Integration Note

The portal utilizes Google's **`gemini-2.0-flash`** model to process citizen petitions. During submission, an asynchronous background request sends the grievance subject and description to the Gemini API. The model responds with:
- Target department recommendation
- Sub-category classification
- Priority assessment (`Low`, `Medium`, `High`)
- Executive summary (1–2 sentences)
- Contextual rationale and confidence rating

**Ethical Safeguard**: AI suggestions are stored separately from official assignments. A human administrator in the Chief Minister's Office must review the AI advisory proposal and explicitly authorize department routing and priority assignments.

---

## 📚 Documentation References

For full technical specifications, refer to the documents in the `documentation/` directory:
- [01_Project_Overview.md](documentation/01_Project_Overview.md) — Problem statement, goals, scope, and RBAC matrix.
- [02_System_Architecture.md](documentation/02_System_Architecture.md) — 3-tier architecture, component roles, and sequence diagrams.
- [03_Database_Design.md](documentation/03_Database_Design.md) — PostgreSQL ER diagram and complete 7-table schema specifications.
- [04_API_Documentation.md](documentation/04_API_Documentation.md) — Comprehensive REST API guide with payload examples.
- [05_AI_Integration.md](documentation/05_AI_Integration.md) — Prompt engineering, schemas, safeguards, and fallback handling.
- [06_Setup_and_Testing.md](documentation/06_Setup_and_Testing.md) — Step-by-step installation, database seeding, and verification test cases.
- [07_User_Guide.md](documentation/07_User_Guide.md) — Comprehensive operational manuals for Citizens, CMO, and Officers.
