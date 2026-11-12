# User Guide — CM Kerala Grievance Redressal Portal

This user guide walks each role—**Citizens**, **Chief Minister's Office (CMO) Administrators**, and **Department Officers**—through standard operating workflows.

---

## 1. Citizen User Guide

### 1.1 Account Registration & Login
1. Click the **Register** button in the top navigation bar.
2. Complete the registration form with your Full Name, Email Address, Mobile Number, and create a secure password (minimum 6 characters).
3. Click **Create Account**. Once registered, you will be directed to the **Login** screen.
4. Enter your registered email address and password to access the **Citizen Dashboard**.

```
[Navigation Bar] -> [Register] -> Fill Profile -> [Create Account] -> [Login]
```

---

### 1.2 Lodging a Grievance
1. From your Citizen Dashboard or navigation menu, click **Submit Grievance** (or **Register Grievance**).
2. Complete the grievance submission form:
   - **District**: Select your district from the dropdown (e.g., Thiruvananthapuram, Ernakulam, Kozhikode).
   - **Category**: Select the issue domain (e.g., Road Maintenance, Water Supply, Public Health, Electricity).
   - **Subject**: Enter a clear, concise title summarizing the grievance.
   - **Description**: Provide specific facts—exact location, landmark, duration of the issue, and prior attempts to resolve it.
   - **Attachments** (Optional): Upload supporting photos, scanned letters, or PDF documents (up to 5MB).
3. Click **Submit Grievance**.
4. The system will generate your unique reference number (e.g., `GRV-2026-A1B2C3`). Note this down for tracking.

---

### 1.3 Tracking Your Grievance
You can track grievance progress via two channels:
- **Authenticated Dashboard**: Log in and visit **My Grievances** to see status badges, assigned departments, and last update timestamps for all your submissions. Click any entry to open the comprehensive chronological timeline.
- **Public Tracking**: Visit the public **Track Grievance** page (`/track`), enter your reference number (e.g., `GRV-2026-A1B2C3`), and view the current status and chronological history without logging in.

---

### 1.4 Providing Resolution Feedback
1. Once your grievance is marked **Resolved**, open the grievance detail page.
2. Under the **Citizen Feedback** section:
   - Click the interactive star widget to assign a satisfaction rating from 1 to 5 stars.
   - Enter qualitative feedback describing your experience or noting the quality of work performed.
3. Click **Submit Feedback**.

---

### 1.5 Requesting a Case Reopening
If the problem recurs or the department closed your grievance without satisfactory resolution:
1. Open the resolved grievance page.
2. Scroll to the **Reopen Grievance** section.
3. State specifically why the resolution was inadequate.
4. Click **Request Reopen**. The grievance status will change to `Reopened`, and the CMO will be alerted to re-evaluate the case.

---

## 2. CMO Administrator User Guide

### 2.1 Accessing the Administrative Dashboard
1. Log in with CMO administrative credentials (e.g., `cmo@demo.com` / `Demo@123`).
2. You will be automatically directed to the **CMO Dashboard** (`/cmo/dashboard`).
3. Key metrics on the overview include:
   - **Total Grievances** statewide
   - **Pending Triage** (`Submitted`)
   - **Under Investigation** (`In Progress`)
   - **Resolved Cases** & Redressal Rate
   - **High Priority Cases** requiring urgent oversight

---

### 2.2 Inspecting AI Triaging Suggestions
1. Click **Grievance Queue** (`/cmo/grievances`).
2. Filter cases by `Status: Submitted` to view newly registered petitions.
3. Click on any grievance to open the **CMO Grievance Detail View**.
4. Review the highlighted **AI Analysis Panel**:
   - **Suggested Department**: e.g., Public Works Department
   - **Suggested Priority**: Low / Medium / High
   - **Executive Summary**: 1–2 sentence synthesis prepared by Gemini 2.0
   - **AI Reasoning**: Justification based on public safety, emergency level, or jurisdiction
   - **Confidence Score**: Statistical indicator (e.g., 92%)

---

### 2.3 Assigning Grievances to Departments & Officers
1. In the **Assignment Box** on the grievance detail page:
   - Select the responsible **Department** (pre-selected based on AI recommendation or manually chosen).
   - Select the designated **Nodal Officer** from that department.
   - Confirm or adjust the **Priority Level** (`Low`, `Medium`, `High`).
   - Add administrative directives or deadlines in the **Assignment Remarks**.
2. Click **Assign Grievance**.
3. Status immediately shifts from `Submitted` to `Under Review`. The designated officer is notified in their workstation.

---

### 2.4 Reviewing Officer Resolution Reports
1. In the CMO Grievance Queue, filter by `Status: In Progress` or look for grievances flagged with submitted officer reports.
2. Open the grievance to inspect the **Officer's Action Taken Report**:
   - Investigation findings
   - Actions taken on the ground
   - Supporting evidence files (e.g., completion photos, inspection orders)
3. Under the **CMO Review Panel**, choose an administrative action:
   - **Approve**: Marks the grievance officially as `Resolved`.
   - **Request Further Action**: Sends the file back to the officer with specific instructions.
   - **Reject**: Invalidates the report and requests a fresh investigation.
4. Add remarks and click **Submit CMO Review**.

---

## 3. Department Officer User Guide

### 3.1 Viewing Assigned Workload
1. Log in using departmental officer credentials (e.g., `officer@demo.com` / `Demo@123`).
2. The **Officer Dashboard** displays:
   - Total Assigned Grievances
   - Pending Site Inspections
   - Reports Under CMO Review
   - Workload breakdown

---

### 3.2 Conducting Investigations & Updating Progress
1. Click on an active case in your assignments table.
2. Review citizen petition text, attached photos, and CMO assignment remarks.
3. Under **Investigation Updates**:
   - Enter preliminary site inspection findings in **Investigation Remarks**.
   - Log intermediate corrective steps in **Action Taken** (e.g., "Contractor notified", "Material dispatches scheduled").
4. Click **Save Progress**. This updates the case status to `In Progress` and informs the CMO that field action is underway.

---

### 3.3 Submitting Final Resolution Dossier
1. Once physical remediation is finished on site:
   - Enter comprehensive **Resolution Details** in the final report form.
   - Upload photographic proof of completion (e.g., repaired road section, restored water pipe).
2. Click **Submit Resolution Report**.
3. The report moves to the CMO review queue (`cmo_review_status: pending`) for final sign-off.
