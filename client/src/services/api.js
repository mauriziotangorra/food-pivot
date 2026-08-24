import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

const client = axios.create({ baseURL: API_BASE });

client.interceptors.request.use((config) => {
  const token = localStorage.getItem('ifp_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

let onUnauthorized = null;
export function setUnauthorizedHandler(fn) {
  onUnauthorized = fn;
}

client.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401 && onUnauthorized) onUnauthorized();
    return Promise.reject(error);
  }
);

export function attachmentUrl(url) {
  const token = localStorage.getItem('ifp_token');
  const base = url.startsWith('http') ? url : `${API_BASE}${url}`;
  return `${base}${base.includes('?') ? '&' : '?'}token=${encodeURIComponent(token || '')}`;
}

export const authApi = {
  login: (email, password) => client.post('/auth/login', { email, password }).then((r) => r.data),
  me: () => client.get('/auth/me').then((r) => r.data),
};

export const usersApi = {
  list: () => client.get('/users').then((r) => r.data),
  create: (payload) => client.post('/users', payload).then((r) => r.data),
  setActive: (id, isActive) => client.patch(`/users/${id}/active`, { isActive }).then((r) => r.data),
};

export const ticketsApi = {
  list: (params) => client.get('/tickets', { params }).then((r) => r.data),
  get: (id) => client.get(`/tickets/${id}`).then((r) => r.data),
  create: (payload) => client.post('/tickets', payload).then((r) => r.data),
  update: (id, payload) => client.put(`/tickets/${id}`, payload).then((r) => r.data),
  remove: (id) => client.delete(`/tickets/${id}`).then((r) => r.data),
  addFollowUp: (id, text) => client.post(`/tickets/${id}/followups`, { text }).then((r) => r.data),
  uploadAttachment: (id, type, file) => {
    const form = new FormData();
    form.append('file', file);
    return client
      .post(`/tickets/${id}/attachments`, form, {
        params: { type },
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then((r) => r.data);
  },
  removeAttachment: (ticketId, attachmentId) =>
    client.delete(`/tickets/${ticketId}/attachments/${attachmentId}`).then((r) => r.data),
};

export default client;
