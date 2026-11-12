# REST API Documentation — CM Kerala Grievance Redressal Portal

This document provides complete technical specifications for the RESTful API endpoints provided by the FastAPI application.

- **Base URL**: `http://localhost:8000`
- **Interactive OpenAPI Docs**: `http://localhost:8000/docs` (Swagger UI)
- **ReDoc Specification**: `http://localhost:8000/redoc`
- **Authentication**: Bearer Token in `Authorization` header (`Bearer <access_token>`)

---

## 1. Authentication Endpoints (`/auth`)

### 1.1 Register Citizen
- **Method / Path**: `POST /auth/register`
- **Auth Required**: None (Public)
- **Status Code**: `201 Created`

#### Request Body
```json
{
  "full_name": "Arun Kumar",
  "email": "citizen@demo.com",
  "mobile_number": "9876543210",
  "password": "Password@123",
  "confirm_password": "Password@123"
}
```

#### Response (`201 Created`)
```json
{
  "id": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
  "full_name": "Arun Kumar",
  "email": "citizen@demo.com",
  "mobile_number": "9876543210",
  "role": "citizen",
  "department_id": null,
  "is_active": true,
  "created_at": "2026-11-11T12:00:00Z"
}
```

---

### 1.2 User Login
- **Method / Path**: `POST /auth/login`
- **Auth Required**: None (Public)
- **Status Code**: `200 OK`

#### Request Body
```json
{
  "email": "cmo@demo.com",
  "password": "Demo@123"
}
```

#### Response (`200 OK`)
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "user": {
    "id": "e0b8fb7b-f9e4-44aa-863a-43187b8f2c69",
    "full_name": "Dr. Priya Nair",
    "email": "cmo@demo.com",
    "mobile_number": "9876543211",
    "role": "cmo_admin",
    "department_id": null,
    "is_active": true,
    "created_at": "2026-11-11T12:00:00Z"
  }
}
```

---

### 1.3 Get Current User Profile
- **Method / Path**: `GET /auth/me`
- **Auth Required**: Bearer Token (`citizen`, `cmo_admin`, `officer`)
- **Status Code**: `200 OK`

#### Response (`200 OK`)
```json
{
  "id": "e0b8fb7b-f9e4-44aa-863a-43187b8f2c69",
  "full_name": "Dr. Priya Nair",
  "email": "cmo@demo.com",
  "mobile_number": "9876543211",
  "role": "cmo_admin",
  "department_id": null,
  "is_active": true,
  "created_at": "2026-11-11T12:00:00Z"
}
```

---

## 2. Departments Endpoints (`/departments`)

### 2.1 List All Active Departments
- **Method / Path**: `GET /departments/`
- **Auth Required**: None (Public)
- **Status Code**: `200 OK`

#### Response (`200 OK`)
```json
[
  {
    "id": "1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d",
    "name": "Public Works Department",
    "code": "PWD",
    "description": "Responsible for roads, bridges, and public infrastructure",
    "is_active": true
  },
  {
    "id": "2b3c4d5e-6f7a-8b9c-0d1e-2f3a4b5c6d7e",
    "name": "Health Department",
    "code": "HEALTH",
    "description": "Manages hospitals, clinics, and public health services",
    "is_active": true
  }
]
```

---

## 3. Grievances Endpoints (`/grievances`)

### 3.1 Create Grievance
- **Method / Path**: `POST /grievances/`
- **Auth Required**: Bearer Token (`citizen`)
- **Content-Type**: `multipart/form-data`
- **Status Code**: `201 Created`

#### Form Fields
- `district` (string): e.g. "Thiruvananthapuram"
- `category` (string): e.g. "Road Maintenance"
- `subject` (string): "Pothole on MG Road"
- `description` (string): "Dangerous pothole causing severe traffic congestion..."
- `files` (array of binary files, optional): Max 5MB each.

#### Response (`201 Created`)
```json
{
  "id": "7f8b9c0d-1e2f-3a4b-5c6d-7e8f9a0b1c2d",
  "reference_number": "GRV-2026-A1B2C3",
  "citizen_id": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
  "district": "Thiruvananthapuram",
  "category": "Road Maintenance",
  "subject": "Pothole on MG Road",
  "description": "Dangerous pothole causing severe traffic congestion...",
  "status": "Submitted",
  "priority": "High",
  "ai_department_id": "1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d",
  "assigned_department_id": null,
  "created_at": "2026-11-11T14:30:00Z"
}
```

---

### 3.2 List My Grievances
- **Method / Path**: `GET /grievances/my`
- **Auth Required**: Bearer Token (`citizen`)
- **Status Code**: `200 OK`

#### Response (`200 OK`)
```json
[
  {
    "id": "7f8b9c0d-1e2f-3a4b-5c6d-7e8f9a0b1c2d",
    "reference_number": "GRV-2026-A1B2C3",
    "district": "Thiruvananthapuram",
    "category": "Road Maintenance",
    "subject": "Pothole on MG Road",
    "status": "In Progress",
    "priority": "High",
    "created_at": "2026-11-11T14:30:00Z",
    "assigned_department_name": "Public Works Department"
  }
]
```

---

### 3.3 Public Track Grievance
- **Method / Path**: `GET /grievances/track/{reference_number}`
- **Auth Required**: None (Public)
- **Status Code**: `200 OK`

#### Response (`200 OK`)
```json
{
  "reference_number": "GRV-2026-A1B2C3",
  "district": "Thiruvananthapuram",
  "category": "Road Maintenance",
  "subject": "Pothole on MG Road",
  "description": "Dangerous pothole causing severe traffic congestion...",
  "status": "In Progress",
  "priority": "High",
  "department_name": "Public Works Department",
  "created_at": "2026-11-11T14:30:00Z",
  "due_at": "2026-11-26T14:30:00Z",
  "history": [
    {
      "previous_status": null,
      "new_status": "Submitted",
      "remarks": "Grievance submitted by citizen",
      "created_at": "2026-11-11T14:30:00Z"
    },
    {
      "previous_status": "Submitted",
      "new_status": "Under Review",
      "remarks": "Assigned to Public Works Department",
      "created_at": "2026-11-11T15:00:00Z"
    }
  ]
}
```

---

### 3.4 Get Grievance Details
- **Method / Path**: `GET /grievances/{id}`
- **Auth Required**: Bearer Token (`citizen` owner, `cmo_admin`, `officer`)
- **Status Code**: `200 OK`

#### Response (`200 OK`)
```json
{
  "id": "7f8b9c0d-1e2f-3a4b-5c6d-7e8f9a0b1c2d",
  "reference_number": "GRV-2026-A1B2C3",
  "citizen_id": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
  "citizen_name": "Arun Kumar",
  "district": "Thiruvananthapuram",
  "category": "Road Maintenance",
  "subject": "Pothole on MG Road",
  "description": "Dangerous pothole causing severe traffic congestion...",
  "status": "In Progress",
  "priority": "High",
  "ai_summary": "Dangerous road defect with accident hazard.",
  "ai_reason": "Road safety risk requires immediate PWD attention.",
  "ai_confidence": 0.92,
  "assigned_department_name": "Public Works Department",
  "attachments": [],
  "assignments": []
}
```

---

### 3.5 Submit Feedback
- **Method / Path**: `POST /grievances/{id}/feedback`
- **Auth Required**: Bearer Token (`citizen` owner)
- **Status Code**: `200 OK`

#### Request Body
```json
{
  "rating": 5,
  "comments": "Prompt resolution by PWD road division. Very satisfied."
}
```

#### Response (`200 OK`)
```json
{
  "message": "Feedback submitted successfully"
}
```

---

### 3.6 Reopen Grievance
- **Method / Path**: `POST /grievances/{id}/reopen`
- **Auth Required**: Bearer Token (`citizen` owner)
- **Status Code**: `200 OK`

#### Request Body
```json
{
  "reason": "The pothole was filled with loose gravel which washed away during rains."
}
```

#### Response (`200 OK`)
```json
{
  "message": "Grievance reopened successfully"
}
```

---

## 4. CMO Administration Endpoints (`/cmo`)

### 4.1 Dashboard Overview Stats
- **Method / Path**: `GET /cmo/dashboard/stats`
- **Auth Required**: Bearer Token (`cmo_admin`)
- **Status Code**: `200 OK`

#### Response (`200 OK`)
```json
{
  "total": 1247,
  "submitted": 45,
  "under_review": 62,
  "in_progress": 120,
  "resolved": 985,
  "reopened": 35,
  "high_priority": 88
}
```

---

### 4.2 List Statewide Grievances (with Filtering)
- **Method / Path**: `GET /cmo/grievances`
- **Auth Required**: Bearer Token (`cmo_admin`)
- **Query Parameters**:
  - `status` (string, optional): e.g. `Submitted`
  - `priority` (string, optional): `High` | `Medium` | `Low`
  - `department_id` (uuid, optional)
  - `district` (string, optional)
  - `search` (string, optional): query on subject or reference number
  - `skip` (int, default 0), `limit` (int, default 50)
- **Status Code**: `200 OK`

---

### 4.3 Assign Grievance
- **Method / Path**: `POST /cmo/grievances/{id}/assign`
- **Auth Required**: Bearer Token (`cmo_admin`)
- **Status Code**: `200 OK`

#### Request Body
```json
{
  "department_id": "1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d",
  "officer_id": "3c4d5e6f-7a8b-9c0d-1e2f-3a4b5c6d7e8f",
  "priority": "High",
  "remarks": "Expedite inspection before monsoon onset."
}
```

#### Response (`200 OK`)
```json
{
  "message": "Grievance assigned successfully"
}
```

---

### 4.4 Review Officer Resolution Report
- **Method / Path**: `POST /cmo/grievances/{id}/review-report`
- **Auth Required**: Bearer Token (`cmo_admin`)
- **Status Code**: `200 OK`

#### Request Body
```json
{
  "decision": "approved",
  "remarks": "Road patching verified with photo proof. Case closed."
}
```
*(Decisions: `'approved'`, `'rejected'`, `'further_action'`)*

#### Response (`200 OK`)
```json
{
  "message": "Report reviewed successfully. Grievance status updated."
}
```

---

### 4.5 Escalate Priority
- **Method / Path**: `POST /cmo/grievances/{id}/escalate`
- **Auth Required**: Bearer Token (`cmo_admin`)
- **Status Code**: `200 OK`

#### Request Body
```json
{
  "priority": "High",
  "reason": "Escalated due to ministerial inquiry."
}
```

---

### 4.6 List Department Officers
- **Method / Path**: `GET /cmo/officers`
- **Auth Required**: Bearer Token (`cmo_admin`)
- **Query Parameter**: `department_id` (uuid, optional)
- **Status Code**: `200 OK`

---

## 5. Officer Endpoints (`/officer`)

### 5.1 List Assigned Grievances
- **Method / Path**: `GET /officer/assignments`
- **Auth Required**: Bearer Token (`officer`)
- **Status Code**: `200 OK`

---

### 5.2 Get Assignment Details
- **Method / Path**: `GET /officer/assignments/{id}`
- **Auth Required**: Bearer Token (`officer`)
- **Status Code**: `200 OK`

---

### 5.3 Update Field Investigation
- **Method / Path**: `POST /officer/assignments/{id}/update`
- **Auth Required**: Bearer Token (`officer`)
- **Status Code**: `200 OK`

#### Request Body
```json
{
  "investigation_remarks": "Site inspection conducted with Assistant Engineer.",
  "action_taken": "Bituminous patch work scheduled for tomorrow morning."
}
```

---

### 5.4 Submit Final Resolution Report
- **Method / Path**: `POST /officer/assignments/{id}/submit-report`
- **Auth Required**: Bearer Token (`officer`)
- **Content-Type**: `multipart/form-data`
- **Status Code**: `200 OK`

#### Form Fields
- `action_taken` (string): Detailed summary of action
- `resolution_details` (string): Final findings and compliance notes
- `files` (array of binary files, optional): Before/after photos, completion certificates.

---

### 5.5 Officer Dashboard Statistics
- **Method / Path**: `GET /officer/dashboard/stats`
- **Auth Required**: Bearer Token (`officer`)
- **Status Code**: `200 OK`

#### Response (`200 OK`)
```json
{
  "total": 14,
  "pending": 3,
  "in_progress": 7,
  "submitted": 4
}
```

---

## 6. AI Triaging Endpoints (`/ai`)

### 6.1 Test / Ad-Hoc AI Analysis
- **Method / Path**: `POST /ai/analyze`
- **Auth Required**: Bearer Token (`cmo_admin`)
- **Status Code**: `200 OK`

#### Request Body
```json
{
  "subject": "Contaminated drinking water in Ward 4",
  "description": "Pipeline broken near water tank resulting in brown muddy water."
}
```

#### Response (`200 OK`)
```json
{
  "department": "Water Resources Department",
  "category": "Water Supply Quality",
  "priority": "High",
  "summary": "Ward 4 drinking pipeline rupture causing contaminated water supply.",
  "reason": "Contaminated drinking water presents immediate public health emergency.",
  "confidence": 0.94,
  "error": null
}
```

---

### 6.2 Retry AI Analysis for Grievance
- **Method / Path**: `POST /ai/analyze/{grievance_id}/retry`
- **Auth Required**: Bearer Token (`cmo_admin`)
- **Status Code**: `200 OK`

---

## 7. Public Contact Enquiry (`/contact`)

### 7.1 Submit Public Contact Enquiry
- **Method / Path**: `POST /contact/`
- **Auth Required**: None (Public)
- **Status Code**: `201 Created`

#### Request Body
```json
{
  "name": "Kavitha R.",
  "email": "kavitha@example.com",
  "subject": "Inquiry regarding district helpline",
  "message": "Could you provide the toll-free grievance contact for Kozhikode?"
}
```

#### Response (`201 Created`)
```json
{
  "message": "Your enquiry has been submitted successfully"
}
```
