# Setup & Testing Guide — CM Kerala Grievance Redressal Portal

This guide provides step-by-step instructions for setting up, configuring, seeding, and testing the CM Kerala Grievance Redressal Portal across both local development and testing environments.

---

## 1. Prerequisites

Ensure your development machine has the following dependencies installed:

| Requirement | Minimum Version | Recommended Version | Verification Command |
| :--- | :--- | :--- | :--- |
| **Node.js** | `v18.0.0` | `v20.x LTS` | `node -v` |
| **npm** | `v9.0.0` | `v10.x` | `npm -v` |
| **Python** | `3.11.0` | `3.11.x` or `3.12.x` | `python --version` |
| **PostgreSQL** | `14.0` | `15.x` or `16.x` | `psql --version` |
| **Git** | `2.x` | Latest | `git --version` |

---

## 2. Backend Setup (FastAPI + PostgreSQL)

### Step 2.1: Navigate and Create Virtual Environment
Open a terminal in the project root:
```bash
cd backend
python -m venv venv

# Windows (Command Prompt or PowerShell)
.\venv\Scripts\activate

# macOS / Linux
source venv/bin/activate
```

### Step 2.2: Install Python Dependencies
```bash
pip install --upgrade pip
pip install -r requirements.txt
```

### Step 2.3: Configure PostgreSQL Database
1. Launch the PostgreSQL command line or pgAdmin:
   ```bash
   psql -U postgres
   ```
2. Create the target database:
   ```sql
   CREATE DATABASE cm_kerala;
   \q
   ```

### Step 2.4: Environment Configuration
Create a `.env` file in `backend/` by copying `.env.example`:
```bash
# Windows
copy .env.example .env

# macOS / Linux
cp .env.example .env
```

Ensure the configuration settings in `backend/.env` match your environment:
```ini
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/cm_kerala
SECRET_KEY=dev-secret-key-change-in-production-random-string
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440
AI_API_KEY=your_gemini_api_key_here
AI_MODEL_NAME=gemini-2.0-flash
AI_API_URL=https://generativelanguage.googleapis.com/v1beta
UPLOAD_DIR=uploads
```
*(Note: If `AI_API_KEY` is left blank, the portal still functions normally; AI analysis will gracefully return a key missing notice without failing transactions).*

### Step 2.5: Seed the Database
Populate the database with standard Kerala departments, test users, sample grievances, and workflow history:
```bash
python -m app.seed
```
*Output: `Database tables created. Seeding completed successfully!`*

### Step 2.6: Launch the Backend Server
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```
- API Root: `http://localhost:8000`
- Interactive Swagger UI: `http://localhost:8000/docs`

---

## 3. Frontend Setup (React + Vite)

### Step 3.1: Navigate to Frontend Directory
Open a separate terminal window:
```bash
cd frontend
```

### Step 3.2: Install NPM Packages
```bash
npm install
```

### Step 3.3: Launch the Development Server
```bash
npm run dev
```
The React application will be available at: `http://localhost:5173`

---

## 4. Demo Credentials & Pre-Seeded Accounts

The seed script creates ready-to-test accounts representing each role in the grievance ecosystem:

| Persona | Role | Email | Password | Department |
| :--- | :--- | :--- | :--- | :--- |
| **Arun Kumar** | Citizen | `citizen@demo.com` | `Demo@123` | N/A |
| **Dr. Priya Nair** | CMO Admin | `cmo@demo.com` | `Demo@123` | Chief Minister's Office |
| **Rajesh Menon** | Department Officer | `officer@demo.com` | `Demo@123` | Public Works Dept (PWD) |
| **Lakshmi Pillai**| Department Officer | `officer2@demo.com` | `Demo@123` | Health Department |

---

## 5. End-to-End Verification Test Cases

Execute the following test cases to verify the entire system functionality:

| ID | Test Scenario | Steps | Expected Result |
| :--- | :--- | :--- | :--- |
| **TC-01** | Citizen Registration | Navigate to `/register`, submit details with mismatched passwords. | Client displays validation error: "Passwords do not match". |
| **TC-02** | Citizen Login | Navigate to `/login`, submit `citizen@demo.com` / `Demo@123`. | JWT token stored; user redirected to `/citizen/dashboard`. |
| **TC-03** | Submit Grievance | As citizen, navigate to `/citizen/submit`, fill all fields, attach image, submit. | Grievance created; reference code displayed (`GRV-2026-XXXXXX`); appears in list. |
| **TC-04** | Public Grievance Tracking | Logout, visit `/track`, input the generated reference code. | Public tracking displays district, status, timeline, without revealing private citizen data. |
| **TC-05** | CMO Grievance Review & Assignment | Login as `cmo@demo.com`, navigate to `/cmo/grievances`, select new grievance, review AI suggestion, assign to PWD officer `officer@demo.com`. | Status updates to `Under Review`; assignment logged in history. |
| **TC-06** | Officer Investigation & Report | Login as `officer@demo.com`, navigate to `/officer/dashboard`, open assigned grievance, enter investigation notes, submit resolution report. | Assignment updates with resolution report; status advances to `In Progress`. |
| **TC-07** | CMO Report Review & Closure | Login as `cmo@demo.com`, open officer report review queue, select "Approved", submit. | Grievance status transitions to `Resolved`; completion recorded in audit trail. |
| **TC-08** | Citizen Rating & Feedback | Login as `citizen@demo.com`, open the resolved grievance, submit 5-star rating and comment. | Rating is saved; stars and review remarks display on detail view. |
| **TC-09** | Reopen Grievance | As citizen on resolved grievance, click "Reopen Grievance", submit reason. | Status changes to `Reopened`; CMO dashboard flags case for reconsideration. |
| **TC-10** | Public Contact Form | Visit `/contact`, fill name, email, subject, message, submit. | Form submits successfully; record saved in `contact_enquiries` table. |
