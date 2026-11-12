const API_URL = 'http://localhost:8000';

// Helper to get auth token
function getToken() {
  return localStorage.getItem('token');
}

// Helper for API calls
async function apiFetch(endpoint, options = {}) {
  const token = getToken();
  const headers = { ...options.headers };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Only set Content-Type for JSON requests (not FormData)
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
    throw new Error('Session expired');
  }

  return response;
}

// --- Auth ---
export async function register(data) {
  const res = await apiFetch('/auth/register', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return res;
}

export async function login(email, password) {
  const res = await apiFetch('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  return res;
}

export async function getMe() {
  const res = await apiFetch('/auth/me');
  return res;
}

// --- Departments ---
export async function getDepartments() {
  const res = await apiFetch('/departments/');
  return res.json();
}

// --- Grievances (Citizen) ---
export async function submitGrievance(formData) {
  const res = await apiFetch('/grievances/', {
    method: 'POST',
    body: formData, // FormData for file upload
  });
  return res;
}

export async function getMyGrievances() {
  const res = await apiFetch('/grievances/my');
  return res.json();
}

export async function trackGrievance(refNumber) {
  const res = await apiFetch(`/grievances/track/${refNumber}`);
  return res;
}

export async function getGrievanceDetail(id) {
  const res = await apiFetch(`/grievances/${id}`);
  return res;
}

export async function getGrievanceHistory(id) {
  const res = await apiFetch(`/grievances/${id}/history`);
  return res.json();
}

export async function submitFeedback(id, data) {
  const res = await apiFetch(`/grievances/${id}/feedback`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return res;
}

export async function reopenGrievance(id) {
  const res = await apiFetch(`/grievances/${id}/reopen`, {
    method: 'POST',
  });
  return res;
}

// --- CMO ---
export async function getCMOStats() {
  const res = await apiFetch('/cmo/dashboard/stats');
  return res.json();
}

export async function getCMOGrievances(filters = {}) {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, val]) => {
    if (val) params.append(key, val);
  });
  const res = await apiFetch(`/cmo/grievances?${params.toString()}`);
  return res.json();
}

export async function getCMOGrievanceDetail(id) {
  const res = await apiFetch(`/cmo/grievances/${id}`);
  return res.json();
}

export async function assignGrievance(id, data) {
  const res = await apiFetch(`/cmo/grievances/${id}/assign`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return res;
}

export async function updateGrievanceStatus(id, data) {
  const res = await apiFetch(`/cmo/grievances/${id}/status`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return res;
}

export async function reviewReport(id, data) {
  const res = await apiFetch(`/cmo/grievances/${id}/review-report`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return res;
}

export async function escalateGrievance(id, data = {}) {
  const res = await apiFetch(`/cmo/grievances/${id}/escalate`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return res;
}

export async function getOfficers(departmentId = null) {
  const params = departmentId ? `?department_id=${departmentId}` : '';
  const res = await apiFetch(`/cmo/officers${params}`);
  return res.json();
}

// --- Officer ---
export async function getOfficerAssignments() {
  const res = await apiFetch('/officer/assignments');
  return res.json();
}

export async function getOfficerAssignment(id) {
  const res = await apiFetch(`/officer/assignments/${id}`);
  return res.json();
}

export async function updateAssignment(id, data) {
  const res = await apiFetch(`/officer/assignments/${id}/update`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return res;
}

export async function submitOfficerReport(id, formData) {
  const res = await apiFetch(`/officer/assignments/${id}/submit-report`, {
    method: 'POST',
    body: formData,
  });
  return res;
}

export async function getOfficerStats() {
  const res = await apiFetch('/officer/dashboard/stats');
  return res.json();
}

// --- AI ---
export async function retryAIAnalysis(grievanceId) {
  const res = await apiFetch(`/ai/analyze/${grievanceId}/retry`, {
    method: 'POST',
  });
  return res;
}

// --- Contact ---
export async function submitContact(data) {
  const res = await apiFetch('/contact/', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return res;
}

