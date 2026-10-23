const BASE = '/api';

function getToken() {
  return localStorage.getItem('token');
}

async function request(path, { method = 'GET', body, isForm = false } = {}) {
  const headers = {};
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  if (!isForm && body) headers['Content-Type'] = 'application/json';

  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: isForm ? body : body ? JSON.stringify(body) : undefined,
  });

  if (res.status === 204) return null;

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    throw new Error((data && data.error) || `Request failed (${res.status})`);
  }

  return data;
}

export const api = {
  register: (email, password, name) => request('/auth/register', { method: 'POST', body: { email, password, name } }),
  login: (email, password) => request('/auth/login', { method: 'POST', body: { email, password } }),

  tailor: (formData) => request('/tailor', { method: 'POST', body: formData, isForm: true }),

  getHistory: () => request('/history'),
  getVersion: (id) => request(`/history/${id}`),
  deleteVersion: (id) => request(`/history/${id}`, { method: 'DELETE' }),

  exportUrl: (id, doc, format) => {
    const token = getToken();
    return `${BASE}/export/${id}/${doc}/${format}?token=${encodeURIComponent(token || '')}`;
  },
};

export { getToken };
