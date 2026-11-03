const fs = require('fs');
const path = require('path');

const STORE_PATH = path.join(__dirname, 'store.json');
const INITIAL_DATA_PATH = path.join(__dirname, 'initial-data.json');

class Database {
  constructor() {
    this.data = null;
    this.init();
  }

  init() {
    try {
      if (fs.existsSync(STORE_PATH)) {
        const raw = fs.readFileSync(STORE_PATH, 'utf-8');
        this.data = JSON.parse(raw);
        if (!this.data.users) {
          const initialRaw = fs.readFileSync(INITIAL_DATA_PATH, 'utf-8');
          const initial = JSON.parse(initialRaw);
          this.data.users = initial.users || [];
          this.save();
        }
      } else {
        const initialRaw = fs.readFileSync(INITIAL_DATA_PATH, 'utf-8');
        this.data = JSON.parse(initialRaw);
        this.save();
      }
    } catch (error) {
      console.error('Error inicializando base de datos:', error);
      const initialRaw = fs.readFileSync(INITIAL_DATA_PATH, 'utf-8');
      this.data = JSON.parse(initialRaw);
    }
  }

  save() {
    try {
      fs.writeFileSync(STORE_PATH, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (error) {
      console.error('Error persistiendo base de datos en disco:', error);
    }
  }

  // --- RECURSOS ---
  getResources(filters = {}) {
    let list = [...this.data.resources];

    if (filters.search) {
      const q = filters.search.toLowerCase().trim();
      list = list.filter(r =>
        r.title.toLowerCase().includes(q) ||
        r.course.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q) ||
        r.category.toLowerCase().includes(q)
      );
    }

    if (filters.course && filters.course !== 'todos') {
      list = list.filter(r => r.course.toLowerCase() === filters.course.toLowerCase());
    }

    if (filters.cycle && filters.cycle !== 'todos') {
      list = list.filter(r => r.cycle.toLowerCase() === filters.cycle.toLowerCase());
    }

    if (filters.category && filters.category !== 'todos') {
      list = list.filter(r => r.category.toLowerCase() === filters.category.toLowerCase());
    }

    if (filters.type && filters.type !== 'todos') {
      list = list.filter(r => (r.resourceType || 'pdf').toLowerCase() === filters.type.toLowerCase());
    }

    if (filters.sort) {
      if (filters.sort === 'calificacion') {
        list.sort((a, b) => b.rating - a.rating);
      } else if (filters.sort === 'descargas') {
        list.sort((a, b) => b.downloadsCount - a.downloadsCount);
      } else if (filters.sort === 'recientes') {
        list.sort((a, b) => b.id - a.id);
      }
    }

    return list;
  }

  getResourceById(id) {
    const numId = Number(id);
    return this.data.resources.find(r => r.id === numId);
  }

  addResource(resourceData) {
    const newId = Date.now();
    const newDoc = {
      id: newId,
      title: resourceData.title || 'Sin título',
      course: resourceData.course || 'Algoritmos y Estructura de Datos',
      cycle: resourceData.cycle || 'Ciclo IV',
      category: resourceData.category || 'Apuntes y Resúmenes',
      authorName: resourceData.authorName || `${this.data.profile.name} (Tú)`,
      authorRole: resourceData.authorRole || this.data.profile.degree,
      authorAvatar: resourceData.authorAvatar || this.data.profile.avatar,
      rating: 5.0,
      reviewsCount: 1,
      downloadsCount: 0,
      fileFormat: resourceData.fileFormat || 'PDF',
      fileSize: resourceData.fileSize || '2.5 MB',
      fileUrl: resourceData.fileUrl || null,
      resourceType: resourceData.resourceType || 'pdf',
      youtubeUrl: resourceData.youtubeUrl || null,
      youtubeEmbedId: resourceData.youtubeEmbedId || null,
      githubUrl: resourceData.githubUrl || null,
      cloneCommand: resourceData.cloneCommand || null,
      stars: resourceData.stars || 0,
      date: 'Justo ahora',
      description: resourceData.description || 'Documento académico aportado por el estudiante.'
    };

    this.data.resources.unshift(newDoc);

    // Sumar estadísticas al perfil del usuario
    this.data.profile.points = (this.data.profile.points || 0) + 50;
    this.data.profile.uploadsCount = (this.data.profile.uploadsCount || 0) + 1;
    this.data.profile.myUploads.unshift({
      id: newId,
      title: newDoc.title,
      course: newDoc.course,
      downloads: 0,
      rating: 5.0,
      format: `${newDoc.fileFormat} (${newDoc.fileSize})`,
      date: 'Justo ahora'
    });

    this.save();
    return newDoc;
  }

  incrementDownloads(id) {
    const resource = this.getResourceById(id);
    if (!resource) return null;

    resource.downloadsCount = (resource.downloadsCount || 0) + 1;
    this.save();
    return resource;
  }

  rateResource(id, rating) {
    const resource = this.getResourceById(id);
    if (!resource) return null;

    const currentCount = resource.reviewsCount || 1;
    const currentRating = resource.rating || 5.0;
    const newCount = currentCount + 1;
    const newRating = Number((((currentRating * currentCount) + Number(rating)) / newCount).toFixed(1));

    resource.rating = newRating;
    resource.reviewsCount = newCount;
    this.save();
    return resource;
  }

  deleteResource(id) {
    const numId = Number(id);
    const index = this.data.resources.findIndex(r => r.id === numId);
    if (index === -1) return false;

    this.data.resources.splice(index, 1);
    this.data.profile.myUploads = this.data.profile.myUploads.filter(u => u.id !== numId);
    this.save();
    return true;
  }

  // --- MENTORES ---
  getMentors(filters = {}) {
    let list = [...this.data.mentors];

    if (filters.specialty && filters.specialty !== 'todos') {
      list = list.filter(m => m.specialty.toLowerCase() === filters.specialty.toLowerCase());
    }

    if (filters.search) {
      const q = filters.search.toLowerCase().trim();
      list = list.filter(m =>
        m.name.toLowerCase().includes(q) ||
        m.role.toLowerCase().includes(q) ||
        m.skills.some(s => s.toLowerCase().includes(q))
      );
    }

    return list;
  }

  getMentorById(id) {
    const numId = Number(id);
    return this.data.mentors.find(m => m.id === numId);
  }

  // --- COMUNIDADES ---
  getCommunities() {
    return this.data.communities;
  }

  toggleCommunityMembership(id) {
    const numId = Number(id);
    const community = this.data.communities.find(c => c.id === numId);
    if (!community) return null;

    community.isMember = !community.isMember;
    if (community.isMember) {
      community.members += 1;
    } else {
      community.members = Math.max(0, community.members - 1);
    }

    this.save();
    return community;
  }

  createCommunity(data) {
    const newCommunity = {
      id: Date.now(),
      name: data.name,
      faculty: data.faculty || 'Facultad General',
      members: 1,
      onlineCount: 1,
      type: data.type || 'Grupo de Estudio',
      description: data.description || '',
      isMember: true
    };
    this.data.communities.push(newCommunity);
    this.save();
    return newCommunity;
  }

  // --- ASESORÍAS / RESERVAS ---
  addBooking(bookingData) {
    if (!this.data.bookings) this.data.bookings = [];
    const newBooking = {
      id: Date.now(),
      mentorId: bookingData.mentorId || null,
      mentorName: bookingData.mentorName || 'Tutor Par',
      studentName: bookingData.studentName || this.data.profile.name,
      studentEmail: bookingData.studentEmail || 'usuario@educonecta.edu',
      topic: bookingData.topic || 'Dudas generales del curso',
      date: bookingData.date || new Date().toISOString().split('T')[0],
      time: bookingData.time || '18:00',
      status: 'Confirmada',
      createdAt: new Date().toISOString()
    };
    this.data.bookings.unshift(newBooking);

    // Incrementar sesiones del mentor si existe
    if (bookingData.mentorId) {
      const mentor = this.getMentorById(bookingData.mentorId);
      if (mentor) {
        mentor.sessions = (mentor.sessions || 0) + 1;
      }
    }

    this.save();
    return newBooking;
  }

  getBookings() {
    return this.data.bookings || [];
  }

  // --- PERFIL DE USUARIO ---
  getProfile() {
    return this.data.profile;
  }

  updateProfile(updates) {
    this.data.profile = {
      ...this.data.profile,
      ...updates
    };
    this.save();
    return this.data.profile;
  }

  // --- AUTENTICACIÓN Y USUARIOS ---
  findUserByEmailOrCode(identifier) {
    if (!identifier) return null;
    const cleanId = identifier.trim().toLowerCase();

    // 1. Buscar en lista de usuarios
    const user = (this.data.users || []).find(u =>
      (u.email && u.email.toLowerCase() === cleanId) ||
      (u.studentCode && u.studentCode.toLowerCase() === cleanId) ||
      (u.handle && u.handle.toLowerCase() === cleanId) ||
      (u.handle && u.handle.toLowerCase().replace('@', '') === cleanId) ||
      (cleanId.includes('alex') && u.name && u.name.toLowerCase().includes('alex'))
    );
    if (user) return user;

    // 2. Si es Alex Mendoza o coincide con el perfil activo
    if (this.data.profile) {
      const p = this.data.profile;
      if (
        (p.email && p.email.toLowerCase() === cleanId) ||
        (p.handle && p.handle.toLowerCase() === cleanId) ||
        (p.handle && p.handle.toLowerCase().replace('@', '') === cleanId) ||
        cleanId.includes('alex') ||
        cleanId === 'e20210042'
      ) {
        return {
          id: 1,
          email: p.email || 'alex.mendoza@educonecta.edu',
          studentCode: 'E20210042',
          passwordHash: '$2b$10$ZPF9Gfjqdn9PXKyj54WYU.91J49is9OaQ3dZWr/ikuVu9wylkv.8q',
          name: p.name || 'Alex Mendoza',
          handle: p.handle || '@alex.mendoza',
          initials: p.initials || 'AM',
          degree: p.degree || 'Ingeniería de Sistemas',
          cycle: p.cycle || 'VI ciclo',
          campus: p.campus || 'Lima Centro',
          points: p.points || 1240,
          level: p.level || 'Colaborador Activo',
          uploadsCount: p.uploadsCount || 18,
          downloadsReceived: p.downloadsReceived || 3420,
          averageRating: p.averageRating || 4.8,
          avatar: p.avatar || ''
        };
      }
    }

    return null;
  }

  findUserById(id) {
    const numId = Number(id);
    return (this.data.users || []).find(u => u.id === numId);
  }

  createUser(userData) {
    if (!this.data.users) this.data.users = [];
    const newId = Date.now();
    const newUser = {
      id: newId,
      email: userData.email.toLowerCase().trim(),
      studentCode: userData.studentCode ? userData.studentCode.toUpperCase().trim() : `U${newId.toString().slice(-8)}`,
      passwordHash: userData.passwordHash,
      name: userData.name.trim(),
      handle: `@${userData.name.toLowerCase().replace(/[^a-z0-9]/g, '.')}`,
      degree: userData.degree || 'Ingeniería de Sistemas e Informática',
      cycle: userData.cycle || 'Ciclo I',
      points: 100, // Bono de bienvenida
      level: 'Nivel 1: Nuevo Colaborador',
      uploadsCount: 0,
      downloadsReceived: 0,
      averageRating: 5.0,
      avatar: userData.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(userData.name)}`
    };

    this.data.users.push(newUser);
    this.save();
    return newUser;
  }

  updateUser(id, updates) {
    const user = this.findUserById(id);
    if (!user) return null;
    Object.assign(user, updates);
    this.save();
    return user;
  }

  // --- ESTADÍSTICAS GLOBALES ---
  getStats() {
    const totalDownloads = this.data.resources.reduce((acc, r) => acc + (r.downloadsCount || 0), 0);
    const totalResources = this.data.resources.length;
    const totalMentors = this.data.mentors.length;
    const totalCommunities = this.data.communities.length;
    const totalMembers = this.data.communities.reduce((acc, c) => acc + (c.members || 0), 0);

    return {
      totalResources,
      totalDownloads,
      totalMentors,
      totalCommunities,
      totalMembers,
      currentUserPoints: this.data.profile.points,
      currentUserLevel: this.data.profile.level
    };
  }
}

module.exports = new Database();
