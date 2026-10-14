const API = import.meta.env.VITE_API_URL || 'https://api.gtslagos.com';

async function request(path, { method = 'GET', body, auth = true, params } = {}) {
  let url = `${API}${path}`;
  if (params) {
    const qs = new URLSearchParams(params).toString();
    if (qs) url += (url.includes('?') ? '&' : '?') + qs;
  }

  const headers = { 'Content-Type': 'application/json' };
  if (auth) {
    const token = localStorage.getItem('lms_token');
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const text = await res.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = null;
  }

  if (!res.ok) {
    const message = (data && data.message) || `Request failed (${res.status})`;
    throw new Error(message);
  }
  return data;
}

export const api = {
  get: (path, opts = {}) => request(path, { ...opts, method: 'GET' }),
  post: (path, body, opts = {}) => request(path, { ...opts, method: 'POST', body }),
  patch: (path, body, opts = {}) => request(path, { ...opts, method: 'PATCH', body }),
};

export { API };
