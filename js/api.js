/**
 * EduConecta - Cliente API REST para Backend Node.js
 * Gestiona llamadas HTTP asíncronas con fallback y autenticación JWT
 */

const EduConectaAPI = {
  baseUrl: '/api',
  tokenKey: 'educonecta_jwt_token',
  userKey: 'educonecta_user_data',

  // Obtener headers estándar con token de autorización si existe
  getHeaders(customHeaders = {}) {
    const headers = { ...customHeaders };
    const token = this.getAuthToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  },

  // Manejo de tokens en localStorage
  getAuthToken() {
    return localStorage.getItem(this.tokenKey);
  },

  setAuthToken(token) {
    if (token) {
      localStorage.setItem(this.tokenKey, token);
    } else {
      localStorage.removeItem(this.tokenKey);
    }
  },

  getLocalUser() {
    try {
      const u = localStorage.getItem(this.userKey);
      return u ? JSON.parse(u) : null;
    } catch {
      return null;
    }
  },

  setLocalUser(user) {
    if (user) {
      localStorage.setItem(this.userKey, JSON.stringify(user));
    } else {
      localStorage.removeItem(this.userKey);
    }
  },

  isAuthenticated() {
    return !!this.getAuthToken();
  },

  // --- AUTENTICACIÓN ---
  async login(identifier, password) {
    const res = await fetch(`${this.baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier, password })
    });

    const json = await res.json();
    if (!res.ok) {
      throw new Error(json.message || 'Error al iniciar sesión');
    }

    if (json.data && json.data.token) {
      this.setAuthToken(json.data.token);
      this.setLocalUser(json.data.user);
    }

    return json;
  },

  async register(userData) {
    const res = await fetch(`${this.baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });

    const json = await res.json();
    if (!res.ok) {
      throw new Error(json.message || 'Error en el registro');
    }

    if (json.data && json.data.token) {
      this.setAuthToken(json.data.token);
      this.setLocalUser(json.data.user);
    }

    return json;
  },

  async getCurrentUser() {
    const token = this.getAuthToken();
    if (!token) return null;

    try {
      const res = await fetch(`${this.baseUrl}/auth/me`, {
        headers: this.getHeaders()
      });
      if (!res.ok) {
        this.logout();
        return null;
      }
      const json = await res.json();
      this.setLocalUser(json.data);
      return json.data;
    } catch {
      return this.getLocalUser();
    }
  },

  logout() {
    this.setAuthToken(null);
    this.setLocalUser(null);
  },

  // --- SISTEMA Y RECURSOS ---
  async checkHealth() {
    try {
      const res = await fetch(`${this.baseUrl}/health`);
      return res.ok;
    } catch {
      return false;
    }
  },

  async getResources(filters = {}) {
    const params = new URLSearchParams();
    if (filters.search) params.append('search', filters.search);
    if (filters.course && filters.course !== 'todos') params.append('course', filters.course);
    if (filters.cycle && filters.cycle !== 'todos') params.append('cycle', filters.cycle);
    if (filters.category && filters.category !== 'todos') params.append('category', filters.category);
    if (filters.sort) params.append('sort', filters.sort);

    const queryString = params.toString() ? `?${params.toString()}` : '';
    const res = await fetch(`${this.baseUrl}/resources${queryString}`);
    if (!res.ok) throw new Error('Error al cargar recursos');
    const json = await res.json();
    return json.data;
  },

  async createResource(data, file = null) {
    let res;
    if (file) {
      const formData = new FormData();
      formData.append('title', data.title);
      formData.append('course', data.course);
      formData.append('cycle', data.cycle);
      formData.append('category', data.category);
      formData.append('description', data.description || '');
      formData.append('file', file);

      res = await fetch(`${this.baseUrl}/resources`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: formData
      });
    } else {
      res = await fetch(`${this.baseUrl}/resources`, {
        method: 'POST',
        headers: this.getHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify(data)
      });
    }

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Error al publicar recurso');
    }
    const json = await res.json();
    return json.data;
  },

  async downloadResource(id) {
    const res = await fetch(`${this.baseUrl}/resources/${id}/download`, {
      method: 'POST',
      headers: this.getHeaders()
    });
    if (!res.ok) throw new Error('Error al descargar recurso');
    return await res.json();
  },

  async rateResource(id, rating) {
    const res = await fetch(`${this.baseUrl}/resources/${id}/rate`, {
      method: 'POST',
      headers: this.getHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ rating })
    });
    if (!res.ok) throw new Error('Error al calificar recurso');
    return await res.json();
  },

  async getMentors(specialty = 'todos', search = '') {
    const params = new URLSearchParams();
    if (specialty && specialty !== 'todos') params.append('specialty', specialty);
    if (search) params.append('search', search);

    const queryString = params.toString() ? `?${params.toString()}` : '';
    const res = await fetch(`${this.baseUrl}/mentors${queryString}`);
    if (!res.ok) throw new Error('Error al obtener mentores');
    const json = await res.json();
    return json.data;
  },

  async bookMentor(mentorId, bookingData) {
    const res = await fetch(`${this.baseUrl}/mentors/${mentorId}/book`, {
      method: 'POST',
      headers: this.getHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(bookingData)
    });
    if (!res.ok) throw new Error('Error al solicitar asesoría');
    return await res.json();
  },

  async getCommunities() {
    const res = await fetch(`${this.baseUrl}/communities`);
    if (!res.ok) throw new Error('Error al obtener comunidades');
    const json = await res.json();
    return json.data;
  },

  async toggleCommunity(communityId) {
    const res = await fetch(`${this.baseUrl}/communities/${communityId}/toggle-membership`, {
      method: 'POST',
      headers: this.getHeaders()
    });
    if (!res.ok) throw new Error('Error al cambiar membresía');
    return await res.json();
  },

  async getProfile() {
    const res = await fetch(`${this.baseUrl}/profile`, {
      headers: this.getHeaders()
    });
    if (!res.ok) throw new Error('Error al cargar perfil');
    const json = await res.json();
    return json.data;
  },

  async getStats() {
    const res = await fetch(`${this.baseUrl}/profile/stats`);
    if (!res.ok) throw new Error('Error al cargar estadísticas');
    const json = await res.json();
    return json.data;
  }
};
