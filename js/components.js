/**
 * EduConecta - Componentes y Renderizado Visual
 * Generación de tarjetas, modales, estrellas y notificaciones toast
 */

// Generador de estrellas de calificación con Remix Icon
function renderStarRating(rating) {
  const fullStars = Math.floor(rating);
  const hasHalf = rating % 1 >= 0.5;
  let html = '';

  for (let i = 0; i < fullStars; i++) {
    html += '<i class="ri-star-fill text-amber-400 text-xs"></i>';
  }
  if (hasHalf) {
    html += '<i class="ri-star-half-fill text-amber-400 text-xs"></i>';
  }
  const emptyStars = 5 - fullStars - (hasHalf ? 1 : 0);
  for (let i = 0; i < emptyStars; i++) {
    html += '<i class="ri-star-line text-slate-300 text-xs"></i>';
  }
  return html;
}

// Helper para obtener iniciales del autor
function getInitials(name) {
  if (!name) return 'UT';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

// Helper para color de banner superior (Figma Figura 14)
function getResourceBannerClass(item) {
  const type = item.resourceType || 'pdf';
  if (type === 'video') return 'card-header-red';
  if (type === 'repo') return 'card-header-blue';
  if (item.category === 'Guías de Laboratorio' || type === 'lab') return 'card-header-teal';
  if (item.category === 'Exámenes y Prácticas') return 'card-header-amber';
  if (item.category === 'Proyectos y Código') return 'card-header-purple';
  const colors = ['card-header-red', 'card-header-blue', 'card-header-purple', 'card-header-teal', 'card-header-amber', 'card-header-green'];
  return colors[(item.id || 0) % colors.length];
}

// Helper para etiqueta de categoría (Figma Figura 14)
function getResourceCategoryLabel(item) {
  const type = item.resourceType || 'pdf';
  if (type === 'video') return 'VIDEO CLASE';
  if (type === 'repo') return 'CÓDIGO';
  if (type === 'lab') return 'LABORATORIO';
  if (item.category === 'Apuntes y Resúmenes') return 'APUNTES';
  if (item.category === 'Exámenes y Prácticas') return 'EXAMEN';
  if (item.category === 'Guías de Laboratorio') return 'GUÍA LAB';
  return 'GUÍA';
}

// Helper para icono central (Figma Figura 14)
function getResourceCenterIcon(item) {
  const type = item.resourceType || 'pdf';
  if (type === 'video') return '<i class="ri-play-circle-line text-3xl text-white"></i>';
  if (type === 'repo') return '<i class="ri-git-branch-line text-3xl text-white"></i>';
  if (type === 'lab') return '<i class="ri-flask-line text-3xl text-white"></i>';
  return '<i class="ri-file-text-line text-3xl text-white"></i>';
}

// Alternar favorito de un recurso
function toggleFavorite(btn, id) {
  const icon = btn.querySelector('i');
  if (icon) {
    if (icon.classList.contains('ri-heart-line')) {
      icon.classList.remove('ri-heart-line');
      icon.classList.add('ri-heart-fill', 'text-rose-400');
      showToastNotification('Guardado en favoritos', 'Recurso añadido a tu colección de estudio.');
    } else {
      icon.classList.remove('ri-heart-fill', 'text-rose-400');
      icon.classList.add('ri-heart-line');
      showToastNotification('Eliminado de favoritos', 'Recurso quitado de tu colección.');
    }
  }
}

// Abrir sala de comunidad
function openCommunityRoom(id) {
  const comm = (window.academicCommunities || []).find(c => c.id === id);
  showToastNotification(`Comunidad: ${comm ? comm.name : 'EduConecta'}`, `Conectando con la sala de debate y recursos compartidos.`);
}

// Renderizar tarjeta de recurso académico (Figma Figura 14)
function createResourceCardHtml(item) {
  const bannerClass = getResourceBannerClass(item);
  const categoryTag = getResourceCategoryLabel(item);
  const centerIcon = getResourceCenterIcon(item);
  const initials = getInitials(item.authorName);

  return `
    <article class="figma-resource-card">
      <!-- Header Banner Figma con Categoría, Icono e Icono de Guardar -->
      <div class="card-header-banner ${bannerClass}">
        <div class="absolute top-3 left-3">
          <span class="px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase bg-white/20 backdrop-blur-sm text-white border border-white/20">
            ${categoryTag}
          </span>
        </div>

        <div class="flex items-center justify-center cursor-pointer group" onclick="openMediaModal(${item.id})">
          <div class="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center group-hover:scale-110 transition-transform">
            ${centerIcon}
          </div>
        </div>

        <div class="absolute top-3 right-3">
          <button onclick="toggleFavorite(this, ${item.id})" class="w-7 h-7 rounded-full bg-black/20 hover:bg-black/40 text-white/90 hover:text-white flex items-center justify-center transition" title="Guardar en favoritos">
            <i class="ri-heart-line text-sm"></i>
          </button>
        </div>
      </div>

      <!-- Cuerpo de la Tarjeta Figma -->
      <div class="p-4 flex-1 flex flex-col justify-between">
        <div>
          <!-- Pills de Curso y Ciclo -->
          <div class="flex items-center gap-1.5 flex-wrap mb-2">
            <span class="px-2 py-0.5 rounded text-[11px] font-semibold bg-red-50 text-red-700">
              ${item.course}
            </span>
            <span class="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-600">
              ${item.cycle}
            </span>
          </div>

          <!-- Título y Descripción -->
          <h3 class="text-sm font-bold text-slate-900 leading-snug line-clamp-2 hover:text-red-600 transition cursor-pointer" onclick="openMediaModal(${item.id})">
            ${item.title}
          </h3>

          <p class="text-xs text-slate-500 mt-1.5 line-clamp-2 leading-relaxed">
            ${item.description}
          </p>

          <!-- Autor con Iniciales circulares (Figma) -->
          <div class="mt-3 flex items-center gap-2">
            <div class="w-6 h-6 rounded-full bg-red-100 text-red-700 font-bold text-[10px] flex items-center justify-center shrink-0">
              ${initials}
            </div>
            <span class="text-xs font-medium text-slate-700 truncate">${item.authorName}</span>
          </div>
        </div>

        <!-- Footer con Calificación, Descargas y Enlace 'Ver recurso >' -->
        <div class="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-xs">
          <span class="text-slate-500 font-medium flex items-center gap-1">
            <i class="ri-star-fill text-amber-400 text-xs"></i>
            <strong class="text-slate-700 font-semibold">${item.rating.toFixed(1)}</strong>
            <span>· ${item.downloadsCount} descargas</span>
          </span>

          <button onclick="openMediaModal(${item.id})" class="text-xs font-semibold text-red-600 hover:text-red-700 flex items-center gap-0.5 group">
            <span>Ver recurso</span>
            <i class="ri-arrow-right-s-line text-sm group-hover:translate-x-0.5 transition-transform"></i>
          </button>
        </div>
      </div>
    </article>
  `;
}

// Renderizar tarjeta de Tutor Experto
function createExpertCardHtml(mentor) {
  return `
    <div class="edu-card p-5 flex flex-col justify-between">
      <div>
        <div class="flex items-start justify-between gap-3 mb-4">
          <div class="flex items-center gap-3">
            <img src="${mentor.avatar}" alt="${mentor.name}" class="w-11 h-11 rounded-lg object-cover ring-1 ring-slate-200">
            <div>
              <div class="flex items-center gap-1.5">
                <h4 class="text-sm font-bold text-slate-900">${mentor.name}</h4>
                <i class="ri-verified-badge-fill text-brand-600 text-sm"></i>
              </div>
              <p class="text-xs text-slate-500 font-medium">${mentor.role} • ${mentor.cycle}</p>
              <div class="flex items-center gap-1 mt-0.5">
                <i class="ri-star-fill text-amber-400 text-xs"></i>
                <span class="text-xs font-bold text-slate-800">${mentor.rating}</span>
                <span class="text-[10px] text-slate-400">(${mentor.reviews} asesorías)</span>
              </div>
            </div>
          </div>
          <span class="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
            ${mentor.points}
          </span>
        </div>

        <div class="mb-3">
          <p class="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Áreas de Dominio:</p>
          <div class="flex flex-wrap gap-1.5">
            ${mentor.skills.map(skill => `<span class="px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200/60">${skill}</span>`).join('')}
          </div>
        </div>

        <div class="bg-slate-50 rounded-lg p-2.5 text-[11px] text-slate-500 flex items-center justify-between mb-4 border border-slate-200">
          <span class="flex items-center gap-1.5 font-medium"><i class="ri-time-line text-slate-400"></i> ${mentor.schedule}</span>
          <span class="font-semibold text-slate-700">${mentor.sessions} sesiones</span>
        </div>
      </div>

      <button onclick="openBookingModal(${mentor.id}, '${mentor.name.replace(/'/g, "\\'")}')" class="btn-primary w-full text-xs">
        <i class="ri-calendar-check-line"></i>
        <span>Solicitar Asesoría</span>
      </button>
    </div>
  `;
}

// Renderizar tarjeta de Comunidad de Práctica (Figma Figura 16)
function createCommunityCardHtml(community) {
  let bannerClass = 'card-header-red';
  if (community.bannerColor === 'blue') bannerClass = 'card-header-blue';
  else if (community.bannerColor === 'purple') bannerClass = 'card-header-purple';
  else if (community.bannerColor === 'dark') bannerClass = 'card-header-dark';

  return `
    <div class="figma-cop-card">
      <div class="cop-banner ${bannerClass}">
        <div class="cop-badge-code">
          ${community.code || 'EC'}
        </div>
        <span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-white/20 text-white backdrop-blur-sm border border-white/20">
          ${community.type === 'Club Técnico' ? 'Club Técnico' : 'Comunidad Oficial'}
        </span>
      </div>

      <div class="p-5 flex-1 flex flex-col justify-between">
        <div>
          <h3 class="text-base font-bold text-slate-900">${community.name}</h3>
          <p class="text-xs text-red-600 font-semibold mt-0.5">${community.faculty}</p>
          <p class="text-xs text-slate-500 mt-2 leading-relaxed">${community.description}</p>

          <!-- Clúster de miembros -->
          <div class="mt-4 flex items-center gap-2">
            <div class="flex -space-x-1.5 overflow-hidden">
              <div class="inline-block h-6 w-6 rounded-full ring-2 ring-white bg-slate-800 text-white text-[9px] font-bold flex items-center justify-center">AM</div>
              <div class="inline-block h-6 w-6 rounded-full ring-2 ring-white bg-red-600 text-white text-[9px] font-bold flex items-center justify-center">DV</div>
              <div class="inline-block h-6 w-6 rounded-full ring-2 ring-white bg-blue-600 text-white text-[9px] font-bold flex items-center justify-center">CN</div>
            </div>
            <span class="text-xs text-slate-500 font-medium">+${community.members.toLocaleString()} miembros</span>
          </div>

          <div class="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-medium">
            <span><i class="ri-user-follow-line text-slate-400"></i> ${community.onlineCount} activos hoy</span>
            <span><i class="ri-chat-3-line text-slate-400"></i> ${community.postsCount || 42} aportes</span>
          </div>
        </div>

        <div class="mt-4 pt-3 flex items-center gap-2">
          <button 
            onclick="toggleCommunityMembership(${community.id})" 
            class="flex-1 py-2 px-3 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
              community.isMember 
                ? 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200' 
                : 'bg-red-600 text-white hover:bg-red-700'
            }"
          >
            <i class="${community.isMember ? 'ri-check-line text-emerald-600' : 'ri-user-add-line'}"></i>
            <span>${community.isMember ? 'Miembro' : 'Unirme'}</span>
          </button>
          <button 
            onclick="openCommunityRoom(${community.id})" 
            class="py-2 px-3 rounded-lg text-xs font-semibold border border-slate-200 text-slate-700 hover:bg-slate-50 transition"
          >
            Explorar
          </button>
        </div>
      </div>
    </div>
  `;
}

// Renderizar modal de vista previa multimedia (YouTube, GitHub, PDF)
function renderResourcePreviewContent(item) {
  const type = item.resourceType || 'pdf';

  let mediaBody = '';

  if (type === 'video') {
    mediaBody = `
      <div class="bg-black">
        <iframe 
          src="https://www.youtube-nocookie.com/embed/${item.youtubeEmbedId || 'bZkzH5x0Ikk'}?autoplay=1" 
          title="${item.title}" 
          class="w-full aspect-video border-b border-slate-800" 
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
          allowfullscreen
        ></iframe>
      </div>
      <div class="p-6">
        <div class="flex items-center justify-between gap-3 mb-2">
          <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
            <i class="ri-youtube-fill text-rose-600"></i> Video Clase Grabada • ${item.fileSize}
          </span>
          <span class="text-xs text-slate-500 font-semibold flex items-center gap-1">
            <i class="ri-eye-line"></i> ${item.downloadsCount} reproducciones
          </span>
        </div>

        <h3 class="text-lg font-bold text-slate-900 leading-snug">${item.title}</h3>
        <p class="text-xs text-slate-600 mt-2 leading-relaxed">${item.description}</p>

        <!-- Notas del Tutor y Recursos de la Sesión -->
        <div class="mt-4 p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2">
          <p class="font-bold text-slate-800 flex items-center gap-1.5">
            <i class="ri-file-list-3-line text-brand-600"></i> Material y Enlaces de la Clase:
          </p>
          <div class="flex flex-wrap gap-2 pt-1">
            <a href="${item.youtubeUrl || '#'}" target="_blank" rel="noopener noreferrer" class="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-rose-600 font-bold hover:bg-rose-50 flex items-center gap-1.5 transition">
              <i class="ri-external-link-line"></i> Abrir en YouTube
            </a>
            <button onclick="handleDownloadResource(${item.id}, '${item.title.replace(/'/g, "\\'")}', 'Diapositivas PDF')" class="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 font-bold hover:bg-slate-100 flex items-center gap-1.5 transition">
              <i class="ri-download-2-line text-brand-600"></i> Descargar Diapositivas (PDF)
            </button>
          </div>
        </div>
      </div>
    `;
  } else if (type === 'repo') {
    mediaBody = `
      <div class="bg-slate-900 p-6 text-white border-b border-slate-800">
        <div class="flex items-center justify-between gap-3 mb-3">
          <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-white/10 text-white border border-white/20">
            <i class="ri-github-fill text-lg"></i> Repositorio de Código Fuente
          </span>
          <span class="text-xs font-bold text-amber-400 flex items-center gap-1 bg-amber-400/10 px-2 py-0.5 rounded-md border border-amber-400/20">
            <i class="ri-star-fill text-xs"></i> ${item.stars || 148} estrellas en GitHub
          </span>
        </div>

        <h3 class="text-lg font-bold text-white leading-snug">${item.title}</h3>
        <p class="text-xs text-slate-300 mt-2 leading-relaxed">${item.description}</p>

        <!-- Comando para clonar -->
        <div class="mt-4">
          <p class="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Clonar Repositorio Localmente:</p>
          <div class="flex items-center gap-2 bg-slate-950 p-2.5 rounded-xl border border-slate-800 font-mono text-xs text-emerald-400">
            <span class="truncate flex-1">${item.cloneCommand || 'git clone ' + item.githubUrl}</span>
            <button onclick="copyCloneCommand('${item.cloneCommand || 'git clone ' + item.githubUrl}')" class="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-sans text-xs font-bold transition flex items-center gap-1 shrink-0">
              <i class="ri-file-copy-line"></i> Copiar
            </button>
          </div>
        </div>
      </div>

      <div class="p-6">
        <div class="flex items-center justify-between gap-3 mb-4">
          <div class="flex items-center gap-2 text-xs text-slate-600">
            <span class="font-bold text-slate-800">Lenguaje Principal:</span>
            <span class="px-2 py-0.5 bg-slate-100 rounded-md font-mono text-slate-700 font-bold">${item.language || 'Java / Python'}</span>
          </div>
          <a href="${item.githubUrl || 'https://github.com'}" target="_blank" rel="noopener noreferrer" class="btn-primary text-xs bg-slate-900 hover:bg-slate-800 border-slate-900">
            <i class="ri-github-fill text-base"></i> Abrir en GitHub Oficial
          </a>
        </div>

        <div class="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs">
          <p class="font-bold text-slate-800 mb-1 flex items-center gap-1.5">
            <i class="ri-check-double-line text-emerald-600"></i> Estructura del Proyecto Incluida:
          </p>
          <ul class="list-disc list-inside text-slate-600 space-y-1 pl-1">
            <li>Código fuente completo con separación de capas y documentación.</li>
            <li>Archivos Dockerfile y docker-compose.yml para ejecución en 1 paso.</li>
            <li>Pruebas unitarias automatizadas y datos semilla de prueba.</li>
          </ul>
        </div>
      </div>
    `;
  } else {
    mediaBody = `
      <div class="bg-gradient-to-r from-brand-800 via-brand-700 to-brand-600 p-6 text-white">
        <div class="flex items-center justify-between gap-3 mb-2">
          <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-white/15 text-white border border-white/20">
            <i class="ri-file-text-line"></i> ${type === 'lab' ? 'Guía de Laboratorio' : 'Documento Académico'}
          </span>
          <span class="text-xs text-blue-100 font-semibold">${item.fileFormat} • ${item.fileSize}</span>
        </div>
        <h3 class="text-lg font-bold text-white leading-snug">${item.title}</h3>
        <p class="text-xs text-blue-100 mt-2 leading-relaxed">${item.description}</p>
      </div>

      <div class="p-6">
        <div class="grid grid-cols-2 gap-3 mb-4 text-xs">
          <div class="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <p class="text-slate-400 font-bold text-[10px] uppercase tracking-wider">Curso Oficial</p>
            <p class="font-bold text-slate-800 mt-0.5">${item.course}</p>
          </div>
          <div class="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <p class="text-slate-400 font-bold text-[10px] uppercase tracking-wider">Nivel y Ciclo</p>
            <p class="font-bold text-slate-800 mt-0.5">${item.cycle}</p>
          </div>
        </div>

        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
          <div class="text-xs text-slate-500">
            <p class="font-semibold text-slate-700">Verificado por la comunidad estudiantil</p>
            <p class="text-[11px] text-slate-400 mt-0.5">${item.downloadsCount} descargas registradas</p>
          </div>
          <div class="flex items-center gap-2">
            ${item.fileUrl ? `<a href="${item.fileUrl}" target="_blank" class="btn-secondary text-xs py-2 px-3 flex items-center gap-1.5"><i class="ri-eye-line text-brand-600"></i><span>Leer PDF</span></a>` : ''}
            <button onclick="handleDownloadResource(${item.id}, '${item.title.replace(/'/g, "\\'")}', '${item.fileSize}')" class="btn-primary text-xs py-2.5 px-4 shadow-sm">
              <i class="ri-download-2-line text-sm"></i>
              <span>Descargar Archivo</span>
            </button>
          </div>
        </div>
      </div>
    `;
  }

  // Footer con información del autor y widget de calificación con estrellas
  return `
    <div class="relative">
      <button onclick="closeMediaModal()" class="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center transition focus:outline-none">
        <i class="ri-close-line text-lg"></i>
      </button>

      ${mediaBody}

      <!-- Barra de Autor y Calificación Interactiva -->
      <div class="px-6 py-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div class="flex items-center gap-3">
          <img src="${item.authorAvatar}" alt="${item.authorName}" class="w-10 h-10 rounded-full object-cover ring-2 ring-slate-200 shrink-0">
          <div>
            <p class="text-xs font-bold text-slate-900">${item.authorName}</p>
            <p class="text-[11px] text-slate-500">${item.authorRole}</p>
          </div>
        </div>

        <!-- Calificación con Estrellas Clickables -->
        <div class="flex items-center gap-2">
          <span class="text-xs font-bold text-slate-700">Calificar:</span>
          <div class="flex items-center gap-1 cursor-pointer" title="Califica este material">
            <i onclick="submitRating(${item.id}, 1)" class="ri-star-fill text-amber-400 hover:scale-125 transition-transform text-sm"></i>
            <i onclick="submitRating(${item.id}, 2)" class="ri-star-fill text-amber-400 hover:scale-125 transition-transform text-sm"></i>
            <i onclick="submitRating(${item.id}, 3)" class="ri-star-fill text-amber-400 hover:scale-125 transition-transform text-sm"></i>
            <i onclick="submitRating(${item.id}, 4)" class="ri-star-fill text-amber-400 hover:scale-125 transition-transform text-sm"></i>
            <i onclick="submitRating(${item.id}, 5)" class="ri-star-fill text-amber-400 hover:scale-125 transition-transform text-sm"></i>
          </div>
          <span class="text-xs font-bold text-slate-800 ml-1">${item.rating.toFixed(1)} / 5</span>
        </div>
      </div>
    </div>
  `;
}
function showToastNotification(title, message) {
  const container = document.getElementById('toastContainer');
  const titleEl = document.getElementById('toastTitle');
  const messageEl = document.getElementById('toastMessage');

  if (!container || !titleEl || !messageEl) return;

  titleEl.textContent = title;
  messageEl.textContent = message;

  container.classList.remove('translate-y-24', 'opacity-0');
  container.classList.add('translate-y-0', 'opacity-100');

  setTimeout(() => {
    container.classList.add('translate-y-24', 'opacity-0');
    container.classList.remove('translate-y-0', 'opacity-100');
  }, 3500);
}
