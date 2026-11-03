/**
 * EduConecta - Lógica Principal de la Aplicación
 * Conexión de eventos, filtrado reactivo y manejo de estados
 */

// Estado global de la aplicación
let currentResourcesList = [...academicResources];
let currentRepoList = [...academicResources];
let currentExpertsList = [...expertMentors];
let currentCommunitiesList = [...academicCommunities];
let currentHomeFormatFilter = 'todos';
let currentRepoFormatFilter = 'todos';
let selectedMentorId = null;
let selectedUploadFile = null;

// Cargar datos sincronizados desde el backend Node.js
async function initBackendData() {
  try {
    const isHealthy = await EduConectaAPI.checkHealth();
    if (!isHealthy) return;

    const [resList, expList, commList, profileData, authUser] = await Promise.all([
      EduConectaAPI.getResources(),
      EduConectaAPI.getMentors(),
      EduConectaAPI.getCommunities(),
      EduConectaAPI.getProfile(),
      EduConectaAPI.getCurrentUser().catch(() => null)
    ]);

    if (resList && resList.length > 0) {
      academicResources.length = 0;
      academicResources.push(...resList);
      currentResourcesList = [...resList];
      currentRepoList = [...resList];
      renderHomeResources(currentResourcesList);
      renderRepoResources(currentRepoList);
    }

    if (expList && expList.length > 0) {
      expertMentors.length = 0;
      expertMentors.push(...expList);
      currentExpertsList = [...expList];
      renderExpertsView(currentExpertsList);
    }

    if (commList && commList.length > 0) {
      academicCommunities.length = 0;
      academicCommunities.push(...commList);
      currentCommunitiesList = [...commList];
      renderCommunitiesView(currentCommunitiesList);
    }

    if (authUser) {
      Object.assign(userProfile, authUser);
      renderProfileStats();
    } else if (profileData) {
      Object.assign(userProfile, profileData);
      renderProfileStats();
    }
    renderHeaderAuth();
  } catch (err) {
    console.info('Backend no disponible, ejecutando en modo local/mock:', err.message);
  }
}

// Inicialización de la Aplicación
document.addEventListener('DOMContentLoaded', () => {
  // Inicializar enrutador
  AppRouter.init();

  // Renderizar vistas con datos iniciales
  renderHomeResources(currentResourcesList);
  renderRepoResources(currentRepoList);
  renderExpertsView(currentExpertsList);
  renderCommunitiesView(currentCommunitiesList);
  renderProfileStats();
  renderHeaderAuth();

  // Conectar con backend Node.js
  initBackendData();

  // Conectar listeners de búsqueda y eventos
  setupEventListeners();
});

// Callback ejecutado cuando el enrutador cambia de vista
function onRouteChanged(viewName) {
  if (viewName === 'repositorio') {
    renderRepoResources(currentRepoList);
  } else if (viewName === 'mapa-expertos') {
    renderExpertsView(currentExpertsList);
  } else if (viewName === 'comunidades') {
    renderCommunitiesView(currentCommunitiesList);
  }
}

// Configurar listeners de interfaz
function setupEventListeners() {
  // Búsqueda en Inicio con debounce
  const homeSearchInput = document.getElementById('homeSearchInput');
  let searchTimer;
  if (homeSearchInput) {
    homeSearchInput.addEventListener('input', () => {
      clearTimeout(searchTimer);
      searchTimer = setTimeout(filterHomeResources, 250);
    });
  }

  // Búsqueda en Repositorio
  const repoSearchInput = document.getElementById('repoSearchInput');
  let repoSearchTimer;
  if (repoSearchInput) {
    repoSearchInput.addEventListener('input', () => {
      clearTimeout(repoSearchTimer);
      repoSearchTimer = setTimeout(filterRepoResources, 250);
    });
  }

  // Botón menú móvil
  const mobileToggleBtn = document.getElementById('mobileMenuToggle');
  const mobileDrawer = document.getElementById('mobileDrawer');
  if (mobileToggleBtn && mobileDrawer) {
    mobileToggleBtn.addEventListener('click', () => {
      mobileDrawer.classList.toggle('hidden');
    });
  }

  // Atajo global de teclado (Cmd+K / Ctrl+K o '/') para buscar
  document.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      focusGlobalSearch();
    } else if (e.key === '/' && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
      e.preventDefault();
      focusGlobalSearch();
    }
  });

  // Cerrar popover de notificaciones y menú de usuario al hacer clic fuera
  document.addEventListener('click', (e) => {
    const popover = document.getElementById('notificationPopover');
    const trigger = document.getElementById('notificationTriggerBtn');
    if (popover && !popover.classList.contains('hidden')) {
      if (!popover.contains(e.target) && !trigger?.contains(e.target)) {
        popover.classList.add('hidden');
      }
    }

    const userMenu = document.getElementById('userMenuPopover');
    const userMenuBtn = document.getElementById('userMenuBtn');
    if (userMenu && !userMenu.classList.contains('hidden')) {
      if (!userMenu.contains(e.target) && !userMenuBtn?.contains(e.target)) {
        userMenu.classList.add('hidden');
      }
    }
  });
}

function focusGlobalSearch() {
  if (window.location.hash !== '#inicio') {
    AppRouter.navigate('inicio');
  }
  const input = document.getElementById('homeSearchInput');
  if (input) {
    input.focus();
    input.select();
  }
}

function toggleNotificationDropdown() {
  const popover = document.getElementById('notificationPopover');
  if (popover) {
    popover.classList.toggle('hidden');
  }
}

function handleNewsletterSubmit(e) {
  e.preventDefault();
  const input = document.getElementById('newsletterEmailInput');
  const email = input?.value || '';
  if (input) input.value = '';
  showToastNotification('Suscripción activa', `Te notificaremos novedades a ${email || 'tu correo'}`);
}

// =========================================================================
// 1. RENDERIZADO DE VISTAS
// =========================================================================

function renderHomeResources(list) {
  const container = document.getElementById('homeResourcesContainer');
  const countBadge = document.getElementById('homeResourceCount');
  const emptyState = document.getElementById('homeEmptyState');

  if (!container) return;

  if (countBadge) {
    countBadge.textContent = `${list.length} recurso${list.length === 1 ? '' : 's'}`;
  }

  if (list.length === 0) {
    container.innerHTML = '';
    if (emptyState) emptyState.classList.remove('hidden');
    return;
  }

  if (emptyState) emptyState.classList.add('hidden');
  container.innerHTML = list.map(item => createResourceCardHtml(item)).join('');
}

function renderRepoResources(list) {
  const container = document.getElementById('repoResourcesContainer');
  if (!container) return;
  container.innerHTML = list.map(item => createResourceCardHtml(item)).join('');
}

function renderExpertsView(list) {
  const container = document.getElementById('expertsGridContainer');
  if (!container) return;
  container.innerHTML = list.map(exp => createExpertCardHtml(exp)).join('');
}

function renderCommunitiesView(list) {
  const container = document.getElementById('communitiesGridContainer');
  if (!container) return;
  container.innerHTML = list.map(comm => createCommunityCardHtml(comm)).join('');
}

function renderProfileStats() {
  const user = userProfile;
  const nameEl = document.getElementById('profileUserName');
  const degreeEl = document.getElementById('profileUserDegree');
  const pointsEl = document.getElementById('profilePointsVal');
  const uploadsEl = document.getElementById('profileUploadsVal');
  const downloadsEl = document.getElementById('profileDownloadsVal');

  if (nameEl) nameEl.textContent = user.name;
  if (degreeEl) degreeEl.textContent = `${user.degree} • ${user.cycle}`;
  if (pointsEl) pointsEl.textContent = user.points.toLocaleString();
  if (uploadsEl) uploadsEl.textContent = user.uploadsCount;
  if (downloadsEl) downloadsEl.textContent = user.downloadsReceived.toLocaleString();
}

// =========================================================================
// 2. FILTRADO Y BÚSQUEDA
// =========================================================================

function filterHomeResources() {
  const query = (document.getElementById('homeSearchInput')?.value || '').toLowerCase().trim();
  const courseFilter = document.getElementById('homeCourseFilter')?.value || 'todos';
  const cycleFilter = document.getElementById('homeCycleFilter')?.value || 'todos';
  const topicFilter = document.getElementById('homeTopicFilter')?.value || 'todos';

  currentResourcesList = academicResources.filter(item => {
    const matchesQuery = !query || 
      item.title.toLowerCase().includes(query) ||
      item.course.toLowerCase().includes(query) ||
      item.authorName.toLowerCase().includes(query) ||
      item.description.toLowerCase().includes(query) ||
      (item.tags && item.tags.some(t => t.toLowerCase().includes(query)));

    const matchesCourse = (courseFilter === 'todos') || (item.course === courseFilter);
    const matchesCycle = (cycleFilter === 'todos') || (item.cycle === cycleFilter);
    const matchesTopic = (topicFilter === 'todos') || (item.category === topicFilter);
    const matchesFormat = (currentHomeFormatFilter === 'todos') || ((item.resourceType || 'pdf') === currentHomeFormatFilter);

    return matchesQuery && matchesCourse && matchesCycle && matchesTopic && matchesFormat;
  });

  sortHomeResources();
}

function filterResourcesByFormat(format, btn) {
  currentHomeFormatFilter = format;

  document.querySelectorAll('#view-inicio .format-filter-pill').forEach(pill => {
    pill.classList.remove('active');
  });
  if (btn) btn.classList.add('active');

  filterHomeResources();
}

function sortHomeResources() {
  const sortOption = document.getElementById('homeSortSelect')?.value || 'calificacion';

  if (sortOption === 'calificacion') {
    currentResourcesList.sort((a, b) => b.rating - a.rating);
  } else if (sortOption === 'descargas') {
    currentResourcesList.sort((a, b) => b.downloadsCount - a.downloadsCount);
  } else if (sortOption === 'recientes') {
    currentResourcesList.sort((a, b) => b.id - a.id);
  }

  renderHomeResources(currentResourcesList);
}

function filterRepoByFormat(format, btn) {
  currentRepoFormatFilter = format;

  document.querySelectorAll('#view-repositorio .format-filter-pill').forEach(pill => {
    pill.classList.remove('active');
  });
  if (btn) btn.classList.add('active');

  filterRepoResources();
}

function filterRepoResources() {
  const query = (document.getElementById('repoSearchInput')?.value || '').toLowerCase().trim();
  const course = document.getElementById('repoCourseFilter')?.value || 'todos';
  const category = document.getElementById('repoCategoryFilter')?.value || 'todos';

  currentRepoList = academicResources.filter(item => {
    const matchesQuery = !query || 
      item.title.toLowerCase().includes(query) || 
      item.course.toLowerCase().includes(query) || 
      item.description.toLowerCase().includes(query) ||
      (item.tags && item.tags.some(t => t.toLowerCase().includes(query)));

    const matchesCourse = (course === 'todos') || (item.course === course);
    const matchesCategory = (category === 'todos') || (item.category === category);
    const matchesFormat = (currentRepoFormatFilter === 'todos') || ((item.resourceType || 'pdf') === currentRepoFormatFilter);

    return matchesQuery && matchesCourse && matchesCategory && matchesFormat;
  });

  renderRepoResources(currentRepoList);
}

function applyQuickTag(tagName) {
  const input = document.getElementById('homeSearchInput');
  if (input) {
    input.value = tagName;
    filterHomeResources();
  }
}

function resetAllHomeFilters() {
  const searchInput = document.getElementById('homeSearchInput');
  const courseFilter = document.getElementById('homeCourseFilter');
  const cycleFilter = document.getElementById('homeCycleFilter');
  const topicFilter = document.getElementById('homeTopicFilter');

  if (searchInput) searchInput.value = '';
  if (courseFilter) courseFilter.value = 'todos';
  if (cycleFilter) cycleFilter.value = 'todos';
  if (topicFilter) topicFilter.value = 'todos';
  currentHomeFormatFilter = 'todos';

  document.querySelectorAll('#view-inicio .format-filter-pill').forEach((pill, idx) => {
    if (idx === 0) pill.classList.add('active');
    else pill.classList.remove('active');
  });

  currentResourcesList = [...academicResources];
  sortHomeResources();
}

// Modal de Previsualización Multimedia (YouTube, GitHub, PDF)
function openMediaModal(resourceId) {
  const item = academicResources.find(r => r.id === Number(resourceId));
  if (!item) return;

  const modal = document.getElementById('resourcePreviewModal');
  const content = document.getElementById('resourcePreviewContent');

  if (modal && content) {
    content.innerHTML = renderResourcePreviewContent(item);
    modal.classList.remove('hidden');
  }
}

function closeMediaModal() {
  const modal = document.getElementById('resourcePreviewModal');
  const content = document.getElementById('resourcePreviewContent');
  if (content) content.innerHTML = '';
  if (modal) modal.classList.add('hidden');
}

function copyCloneCommand(cmd, btnEl) {
  navigator.clipboard.writeText(cmd).then(() => {
    showToastNotification('Comando Copiado', `${cmd}`);
    if (btnEl) {
      const origHtml = btnEl.innerHTML;
      btnEl.innerHTML = '<i class="ri-check-line text-emerald-400"></i>';
      btnEl.classList.add('scale-110');
      setTimeout(() => {
        btnEl.innerHTML = origHtml;
        btnEl.classList.remove('scale-110');
      }, 1800);
    }
  }).catch(() => {
    prompt('Copia el comando git clone:', cmd);
  });
}

async function submitRating(resourceId, stars) {
  try {
    const res = await EduConectaAPI.rateResource(resourceId, stars);
    const item = academicResources.find(r => r.id === Number(resourceId));
    if (item && res && res.data) {
      item.rating = res.data.rating;
      item.reviewsCount = res.data.reviewsCount;
    }
    if (item) {
      const content = document.getElementById('resourcePreviewContent');
      if (content) content.innerHTML = renderResourcePreviewContent(item);
    }
    renderHomeResources(currentResourcesList);
    renderRepoResources(currentRepoList);
    showToastNotification('¡Calificación guardada!', `Has asignado ${stars} estrellas a este recurso.`);
  } catch (e) {
    showToastNotification('Calificación registrada', `Asignaste ${stars} estrellas.`);
  }
}

function filterMentorsBySpecialty(specialty, event) {
  document.querySelectorAll('.mentor-filter-pill').forEach(pill => {
    pill.classList.remove('bg-brand-600', 'text-white');
    pill.classList.add('bg-slate-100', 'text-slate-600');
  });

  if (event && event.currentTarget) {
    event.currentTarget.classList.remove('bg-slate-100', 'text-slate-600');
    event.currentTarget.classList.add('bg-brand-600', 'text-white');
  }

  if (specialty === 'todos') {
    currentExpertsList = [...expertMentors];
  } else {
    currentExpertsList = expertMentors.filter(m => m.specialty === specialty);
  }

  renderExpertsView(currentExpertsList);
}

// =========================================================================
// 3. INTERACCIONES (DESCARGAS, ASESORÍAS, GRUPOS)
// =========================================================================

async function handleDownloadResource(id, title, size) {
  try {
    if (id) {
      await EduConectaAPI.downloadResource(id);
      const item = academicResources.find(r => r.id === Number(id));
      if (item && item.fileUrl) {
        const link = document.createElement('a');
        link.href = item.fileUrl;
        link.download = item.fileUrl.split('/').pop() || `${title.replace(/[^a-zA-Z0-9_-]/g, '_')}.pdf`;
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    }
  } catch (e) {
    console.warn('Registro de descarga en backend omitido:', e.message);
  }
  showToastNotification('Descarga iniciada con éxito', `${title} (${size || 'PDF'})`);
}

async function toggleCommunityMembership(communityId) {
  const group = currentCommunitiesList.find(c => c.id === communityId);
  if (!group) return;

  try {
    const res = await EduConectaAPI.toggleCommunity(communityId);
    if (res && res.data) {
      group.isMember = res.data.isMember;
      group.members = res.data.members;
    } else {
      group.isMember = !group.isMember;
      group.members += group.isMember ? 1 : -1;
    }
  } catch (e) {
    group.isMember = !group.isMember;
    group.members += group.isMember ? 1 : -1;
  }

  if (group.isMember) {
    showToastNotification('¡Bienvenido a la comunidad!', `Te has unido al grupo de ${group.name}`);
  } else {
    showToastNotification('Has salido de la comunidad', `Ya no eres miembro de ${group.name}`);
  }

  renderCommunitiesView(currentCommunitiesList);
}

// Modal de Asesoría Par
function openBookingModal(mentorId, mentorName) {
  selectedMentorId = mentorId;
  const modal = document.getElementById('bookingModal');
  const mentorNameEl = document.getElementById('bookingMentorTargetName');

  if (mentorNameEl) mentorNameEl.textContent = mentorName;
  if (modal) {
    modal.classList.remove('hidden');
  }
}

function closeBookingModal() {
  const modal = document.getElementById('bookingModal');
  if (modal) modal.classList.add('hidden');
}

async function handleBookingSubmit(event) {
  event.preventDefault();
  const topic = document.getElementById('bookingTopicInput')?.value || 'Asesoría general';
  const day = document.getElementById('bookingDaySelect')?.value || 'Próxima sesión';
  const time = document.getElementById('bookingTimeSelect')?.value || '18:00';

  try {
    if (selectedMentorId) {
      await EduConectaAPI.bookMentor(selectedMentorId, {
        studentName: userProfile.name,
        studentEmail: `${userProfile.handle.replace('@', '')}@educonecta.edu`,
        topic: topic,
        date: day,
        time: time
      });
    }
  } catch (e) {
    console.warn('Reserva offline:', e.message);
  }

  closeBookingModal();
  showToastNotification('Solicitud enviada al tutor', 'Recibirás la confirmación y enlace de sala en tu correo institucional.');
}

// Modal de Subida de Recursos
function openUploadModal() {
  const modal = document.getElementById('uploadResourceModal');
  selectedUploadFile = null;
  const fileLabel = document.getElementById('uploadFileLabel');
  if (fileLabel) fileLabel.textContent = 'Arrastra tu archivo PDF, ZIP o DOCX aquí';
  if (modal) modal.classList.remove('hidden');
}

function closeUploadModal() {
  const modal = document.getElementById('uploadResourceModal');
  selectedUploadFile = null;
  if (modal) modal.classList.add('hidden');
}

function handleFileSelected(input) {
  if (input.files && input.files[0]) {
    selectedUploadFile = input.files[0];
    const fileLabel = document.getElementById('uploadFileLabel');
    if (fileLabel) {
      fileLabel.innerHTML = `Archivo seleccionado: <span class="text-brand-600 font-bold">${selectedUploadFile.name}</span> (${(selectedUploadFile.size / 1024 / 1024).toFixed(2)} MB)`;
    }
  }
}

async function handleUploadSubmit(event) {
  event.preventDefault();
  const title = document.getElementById('uploadTitleInput')?.value || '';
  const course = document.getElementById('uploadCourseSelect')?.value || 'Algoritmos y Estructura de Datos';
  const cycle = document.getElementById('uploadCycleSelect')?.value || 'Ciclo IV';
  const category = document.getElementById('uploadCategorySelect')?.value || 'Apuntes y Resúmenes';

  let newDoc = null;

  try {
    newDoc = await EduConectaAPI.createResource({
      title,
      course,
      cycle,
      category,
      description: 'Documento académico verificado aportado recientemente por el usuario.'
    }, selectedUploadFile);
  } catch (e) {
    console.warn('Subida en backend falló o sin red, creando local:', e.message);
    newDoc = {
      id: Date.now(),
      title: title,
      course: course,
      cycle: cycle,
      category: category,
      authorName: `${userProfile.name} (Tú)`,
      authorRole: userProfile.degree,
      authorAvatar: userProfile.avatar,
      rating: 5.0,
      reviewsCount: 1,
      downloadsCount: 0,
      fileFormat: selectedUploadFile ? selectedUploadFile.name.split('.').pop().toUpperCase() : 'PDF',
      fileSize: selectedUploadFile ? `${(selectedUploadFile.size / 1024 / 1024).toFixed(1)} MB` : '3.4 MB',
      date: 'Justo ahora',
      description: 'Documento académico verificado aportado recientemente por el usuario.'
    };
  }

  if (newDoc) {
    academicResources.unshift(newDoc);
    currentResourcesList.unshift(newDoc);
    currentRepoList.unshift(newDoc);

    userProfile.points = (userProfile.points || 0) + 50;
    userProfile.uploadsCount = (userProfile.uploadsCount || 0) + 1;
    renderProfileStats();

    renderHomeResources(currentResourcesList);
    renderRepoResources(currentRepoList);
  }

  closeUploadModal();
  showToastNotification('¡Aporte subido correctamente!', `${title} (+50 pts de contribución académica)`);
}

// Pestañas internas de Perfil
function switchProfileTab(tabName, event) {
  document.querySelectorAll('.profile-tab-button').forEach(btn => {
    btn.classList.remove('border-brand-600', 'text-brand-600', 'font-bold');
    btn.classList.add('border-transparent', 'text-slate-500', 'font-medium');
  });

  if (event && event.currentTarget) {
    event.currentTarget.classList.remove('border-transparent', 'text-slate-500', 'font-medium');
    event.currentTarget.classList.add('border-brand-600', 'text-brand-600', 'font-bold');
  }

  document.querySelectorAll('.profile-subtab-panel').forEach(panel => {
    panel.classList.add('hidden');
  });

  const targetPanel = document.getElementById(`profileTab-${tabName}`);
  if (targetPanel) targetPanel.classList.remove('hidden');
}

// =========================================================================
// 4. MÓDULO DE AUTENTICACIÓN (INICIO DE SESIÓN, REGISTRO, PERFIL)
// =========================================================================

function renderHeaderAuth() {
  const container = document.getElementById('headerAuthContainer');
  const mobileContainer = document.getElementById('mobileAuthContainer');
  const user = EduConectaAPI.getLocalUser() || (EduConectaAPI.isAuthenticated() ? userProfile : null);

  if (container) {
    if (user) {
      container.innerHTML = `
        <div class="flex items-center gap-2">
          <!-- Insignia de Puntos -->
          <span class="hidden lg:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
            <i class="ri-copper-coin-line text-amber-500"></i>
            <span>${(user.points || userProfile.points || 0).toLocaleString()} pts</span>
          </span>

          <!-- Botón de Menú de Usuario -->
          <div class="relative">
            <button 
              id="userMenuBtn"
              onclick="toggleUserMenu()"
              class="flex items-center gap-2 pl-1.5 pr-2.5 py-1 rounded-full hover:bg-slate-100 border border-slate-200/90 transition-all focus:outline-none"
              title="Cuenta de ${user.name}"
            >
              <div class="relative">
                ${(user.avatar || userProfile.avatar) ? 
                  `<img src="${user.avatar || userProfile.avatar}" alt="${user.name}" class="w-7 h-7 rounded-full object-cover">` : 
                  `<div class="w-7 h-7 rounded-full bg-gradient-to-tr from-[#92734a] to-[#c7a97b] text-white font-bold text-[11px] flex items-center justify-center">${user.initials || 'AM'}</div>`
                }
                <span class="absolute bottom-0 right-0 w-2 h-2 bg-emerald-500 border border-white rounded-full"></span>
              </div>
              <div class="text-left hidden sm:block">
                <p class="text-xs font-bold text-slate-800 leading-none truncate max-w-[110px]">${user.name.split(' ')[0]} ${user.name.split(' ')[1] ? user.name.split(' ')[1][0] + '.' : ''}</p>
                <p class="text-[10px] text-slate-400 font-medium leading-none mt-0.5">${user.cycle || 'Ciclo VII'}</p>
              </div>
              <i class="ri-arrow-down-s-line text-slate-400 text-xs"></i>
            </button>

            <!-- Dropdown Popover de Usuario -->
            <div id="userMenuPopover" class="user-menu-popover hidden">
              <div class="p-3.5 border-b border-slate-100 bg-slate-50/70">
                <p class="text-xs font-bold text-slate-900">${user.name}</p>
                <p class="text-[11px] text-slate-500 truncate">${user.email || user.handle || '@estudiante'}</p>
                <span class="inline-flex items-center gap-1 mt-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-brand-50 text-brand-700 border border-brand-200">
                  <i class="ri-award-line"></i> ${user.level || userProfile.level || 'Colaborador'}
                </span>
              </div>
              <div class="py-1 text-xs">
                <button onclick="AppRouter.navigate('perfil'); toggleUserMenu();" class="w-full text-left px-3.5 py-2 text-slate-700 hover:bg-slate-50 hover:text-brand-600 flex items-center gap-2">
                  <i class="ri-user-3-line text-slate-400"></i> Mi Perfil y Logros
                </button>
                <button onclick="openUploadModal(); toggleUserMenu();" class="w-full text-left px-3.5 py-2 text-slate-700 hover:bg-slate-50 hover:text-brand-600 flex items-center gap-2">
                  <i class="ri-upload-cloud-line text-slate-400"></i> Subir Apunte o Guía
                </button>
              </div>
              <div class="p-1 border-t border-slate-100 bg-slate-50/50">
                <button onclick="handleLogout()" class="w-full text-left px-3 py-2 rounded-lg text-rose-600 hover:bg-rose-50 text-xs font-bold flex items-center gap-2 transition">
                  <i class="ri-logout-box-r-line"></i> Cerrar Sesión
                </button>
              </div>
            </div>
          </div>
        </div>
      `;
    } else {
      container.innerHTML = `
        <div class="flex items-center gap-2">
          <button onclick="openLoginModal()" class="btn-secondary text-xs py-2 px-3 sm:px-3.5">
            <i class="ri-login-box-line"></i>
            <span>Iniciar Sesión</span>
          </button>
          <button onclick="openRegisterModal()" class="btn-primary text-xs py-2 px-3 sm:px-3.5 hidden sm:inline-flex">
            <i class="ri-user-add-line"></i>
            <span>Registrarse</span>
          </button>
        </div>
      `;
    }
  }

  if (mobileContainer) {
    if (user) {
      mobileContainer.innerHTML = `
        <button onclick="AppRouter.navigate('perfil'); document.getElementById('mobileDrawer').classList.add('hidden');" class="w-full text-left px-3 py-2 rounded-lg text-xs font-bold text-slate-800 hover:bg-slate-50 flex items-center justify-between">
          <span class="flex items-center gap-2"><i class="ri-user-line text-brand-600"></i> ${user.name}</span>
          <span class="text-[10px] text-amber-600 font-bold bg-amber-50 px-2 py-0.5 rounded-full">${(user.points || 0).toLocaleString()} pts</span>
        </button>
        <button onclick="handleLogout()" class="w-full text-left px-3 py-2 rounded-lg text-xs font-bold text-rose-600 hover:bg-rose-50 flex items-center gap-2 mt-1">
          <i class="ri-logout-box-r-line"></i> Cerrar Sesión
        </button>
      `;
    } else {
      mobileContainer.innerHTML = `
        <button onclick="openLoginModal(); document.getElementById('mobileDrawer').classList.add('hidden');" class="btn-secondary w-full text-xs py-2 mb-1.5">
          <i class="ri-login-box-line"></i> Iniciar Sesión
        </button>
        <button onclick="openRegisterModal(); document.getElementById('mobileDrawer').classList.add('hidden');" class="btn-primary w-full text-xs py-2">
          <i class="ri-user-add-line"></i> Crear Cuenta Institucional
        </button>
      `;
    }
  }
}

function toggleUserMenu() {
  const popover = document.getElementById('userMenuPopover');
  if (popover) popover.classList.toggle('hidden');
}

function openLoginModal() {
  const modal = document.getElementById('authModal');
  if (modal) {
    switchAuthTab('login');
    hideAuthError();
    modal.classList.remove('hidden');
  }
}

function openRegisterModal() {
  const modal = document.getElementById('authModal');
  if (modal) {
    switchAuthTab('register');
    hideAuthError();
    modal.classList.remove('hidden');
  }
}

function closeAuthModal() {
  const modal = document.getElementById('authModal');
  if (modal) modal.classList.add('hidden');
}

function switchAuthTab(tab) {
  const tabLogin = document.getElementById('authTabLogin');
  const tabRegister = document.getElementById('authTabRegister');
  const formLogin = document.getElementById('loginForm');
  const formRegister = document.getElementById('registerForm');

  hideAuthError();

  if (tab === 'login') {
    tabLogin?.classList.add('active');
    tabRegister?.classList.remove('active');
    formLogin?.classList.remove('hidden');
    formRegister?.classList.add('hidden');
  } else {
    tabRegister?.classList.add('active');
    tabLogin?.classList.remove('active');
    formRegister?.classList.remove('hidden');
    formLogin?.classList.add('hidden');
  }
}

function togglePasswordVisibility(inputId, btn) {
  const input = document.getElementById(inputId);
  if (!input) return;
  const isPass = input.type === 'password';
  input.type = isPass ? 'text' : 'password';
  btn.innerHTML = isPass ? '<i class="ri-eye-off-line text-sm"></i>' : '<i class="ri-eye-line text-sm"></i>';
}

function fillQuickDemoLogin(email, password, autoSubmit = true) {
  const idInput = document.getElementById('loginIdentifier');
  const passInput = document.getElementById('loginPassword');
  if (idInput && passInput) {
    idInput.value = email;
    passInput.value = password;
  }
  if (autoSubmit) {
    const form = document.getElementById('loginForm');
    if (form) {
      if (typeof form.requestSubmit === 'function') {
        form.requestSubmit();
      } else {
        const btn = document.getElementById('loginSubmitBtn');
        if (btn) btn.click();
      }
    }
  }
}

function showAuthError(msg) {
  const alertEl = document.getElementById('authAlertError');
  const msgEl = document.getElementById('authAlertErrorMsg');
  if (alertEl && msgEl) {
    msgEl.textContent = msg;
    alertEl.classList.remove('hidden');
  }
}

function hideAuthError() {
  const alertEl = document.getElementById('authAlertError');
  if (alertEl) alertEl.classList.add('hidden');
}

async function handleLoginSubmit(event) {
  event.preventDefault();
  const idInput = document.getElementById('loginIdentifier');
  const passInput = document.getElementById('loginPassword');
  const submitBtn = document.getElementById('loginSubmitBtn');

  const identifier = idInput?.value || '';
  const password = passInput?.value || '';

  hideAuthError();
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="ri-loader-4-line animate-spin text-base"></i> Verificando credenciales...';
  }

  try {
    const res = await EduConectaAPI.login(identifier, password);
    const user = res.data.user;

    Object.assign(userProfile, user);
    renderProfileStats();
    renderHeaderAuth();
    closeAuthModal();

    showToastNotification('¡Sesión iniciada con éxito!', `Bienvenido(a) a EduConecta, ${user.name}`);
  } catch (err) {
    showAuthError(err.message || 'Error al iniciar sesión. Verifica tu correo y contraseña.');
  } finally {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = '<i class="ri-login-circle-line text-base"></i> <span>Acceder a la Plataforma</span>';
    }
  }
}

async function handleRegisterSubmit(event) {
  event.preventDefault();
  const name = document.getElementById('registerName')?.value || '';
  const code = document.getElementById('registerCode')?.value || '';
  const cycle = document.getElementById('registerCycle')?.value || 'Ciclo I';
  const degree = document.getElementById('registerDegree')?.value || 'Ingeniería';
  const email = document.getElementById('registerEmail')?.value || '';
  const password = document.getElementById('registerPassword')?.value || '';
  const submitBtn = document.getElementById('registerSubmitBtn');

  hideAuthError();
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="ri-loader-4-line animate-spin text-base"></i> Creando cuenta institucional...';
  }

  try {
    const res = await EduConectaAPI.register({
      name,
      studentCode: code,
      cycle,
      degree,
      email,
      password
    });
    const user = res.data.user;

    Object.assign(userProfile, user);
    renderProfileStats();
    renderHeaderAuth();
    closeAuthModal();

    showToastNotification('¡Cuenta creada exitosamente!', `Te has unido a EduConecta (+100 pts de bienvenida)`);
  } catch (err) {
    showAuthError(err.message || 'Error al registrar la cuenta.');
  } finally {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = '<i class="ri-user-add-line text-base"></i> <span>Crear mi Cuenta (+100 pts)</span>';
    }
  }
}

function handleLogout() {
  EduConectaAPI.logout();
  const userMenu = document.getElementById('userMenuPopover');
  if (userMenu) userMenu.classList.add('hidden');
  renderHeaderAuth();
  showToastNotification('Sesión finalizada', 'Has cerrado sesión correctamente.');
}
