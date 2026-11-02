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

// Renderizar tarjeta de recurso académico multiformato (Craft Design)
function createResourceCardHtml(item) {
  const type = item.resourceType || 'pdf';

  let typeBadgeHtml = '';
  let mediaPreviewHtml = '';
  let ctaButtonsHtml = '';
  let cardClass = 'edu-card flex flex-col justify-between overflow-hidden group';

  if (type === 'video') {
    cardClass = 'edu-card edu-card-video flex flex-col justify-between overflow-hidden group';
    typeBadgeHtml = `
      <span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10.5px] font-bold bg-rose-50 text-rose-700 border border-rose-200 shadow-2xs">
        <i class="ri-youtube-fill text-rose-600 text-xs"></i> Video Clase
      </span>
    `;

    mediaPreviewHtml = `
      <div class="relative rounded-xl overflow-hidden mb-3 aspect-video bg-slate-950 group/video cursor-pointer border border-slate-900/10 shadow-xs" onclick="openMediaModal(${item.id})">
        <img src="${item.thumbnailUrl || 'https://images.unsplash.com/photo-1516116211227-bbc13c749013?auto=format&fit=crop&q=80&w=600'}" alt="${item.title}" class="w-full h-full object-cover group-hover/video:scale-105 transition-transform duration-300">
        <div class="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent flex items-center justify-center">
          <div class="w-11 h-11 rounded-full bg-rose-600 text-white flex items-center justify-center shadow-lg shadow-rose-900/40 group-hover/video:scale-110 transition-transform">
            <i class="ri-play-fill text-xl ml-0.5"></i>
          </div>
        </div>
        <span class="absolute bottom-2 right-2 px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-black/80 text-white backdrop-blur-xs flex items-center gap-1 border border-white/10">
          <i class="ri-time-line text-[11px]"></i> ${item.fileSize}
        </span>
      </div>
    `;

    ctaButtonsHtml = `
      <button 
        onclick="openMediaModal(${item.id})"
        class="btn-primary text-xs shrink-0 bg-rose-600 hover:bg-rose-700 text-white border-rose-600 shadow-xs"
        title="Ver video clase en reproductor universitario"
      >
        <i class="ri-play-circle-line text-sm"></i>
        <span>Ver Clase</span>
      </button>
    `;
  } else if (type === 'repo') {
    cardClass = 'edu-card edu-card-repo flex flex-col justify-between overflow-hidden group';
    typeBadgeHtml = `
      <span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10.5px] font-bold bg-slate-900 text-white shadow-2xs">
        <i class="ri-github-fill text-xs"></i> GitHub Repo
      </span>
    `;

    mediaPreviewHtml = `
      <div class="terminal-window mb-3">
        <div class="terminal-header">
          <div class="flex items-center gap-1.5">
            <span class="terminal-dot bg-rose-500/80"></span>
            <span class="terminal-dot bg-amber-500/80"></span>
            <span class="terminal-dot bg-emerald-500/80"></span>
            <span class="ml-2 font-mono text-[10px] text-slate-400 font-medium">${item.language || 'git-repo'}</span>
          </div>
          <span class="flex items-center gap-1 font-mono text-[10px] text-amber-300 font-bold">
            <i class="ri-star-fill text-[11px]"></i> ${item.stars || 148}
          </span>
        </div>
        <div class="terminal-body flex items-center justify-between py-2 px-3 bg-[#090d14]">
          <code class="text-[11px] text-emerald-400 font-mono truncate max-w-[210px] select-all">$ ${item.cloneCommand || 'git clone ' + item.githubUrl}</code>
          <button 
            onclick="copyCloneCommand('${item.cloneCommand || 'git clone ' + item.githubUrl}', this)" 
            class="text-slate-400 hover:text-white p-1 rounded transition text-xs focus:outline-none" 
            title="Copiar comando git clone"
          >
            <i class="ri-file-copy-line"></i>
          </button>
        </div>
      </div>
    `;

    ctaButtonsHtml = `
      <div class="flex items-center gap-1.5 shrink-0">
        <button 
          onclick="copyCloneCommand('${item.cloneCommand || 'git clone ' + item.githubUrl}', this)"
          class="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs transition"
          title="Copiar comando git clone"
        >
          <i class="ri-file-copy-line"></i>
        </button>
        <a 
          href="${item.githubUrl || 'https://github.com'}" 
          target="_blank" 
          rel="noopener noreferrer" 
          class="btn-primary text-xs bg-slate-900 hover:bg-slate-800 text-white border-slate-900 shadow-xs"
          title="Abrir repositorio en GitHub"
        >
          <i class="ri-github-fill text-sm"></i>
          <span>Código</span>
        </a>
      </div>
    `;
  } else if (type === 'lab') {
    typeBadgeHtml = `
      <span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10.5px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-2xs">
        <i class="ri-flask-line text-emerald-600 text-xs"></i> Guía Lab
      </span>
    `;

    mediaPreviewHtml = `
      <div class="p-3 mb-3 bg-gradient-to-r from-emerald-50/70 via-emerald-50/40 to-teal-50/30 rounded-xl border border-emerald-200/60 flex items-center justify-between">
        <div class="flex items-center gap-2.5">
          <div class="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold shadow-xs">
            <i class="ri-flask-line text-base"></i>
          </div>
          <div>
            <span class="text-[11px] font-bold text-slate-800 block">Guía Práctica UTP</span>
            <span class="text-[10px] text-slate-500 font-medium">${item.fileFormat} • ${item.fileSize}</span>
          </div>
        </div>
        <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-white text-emerald-700 border border-emerald-200 shadow-2xs">
          <i class="ri-shield-check-fill text-emerald-600"></i> Práctica Real
        </span>
      </div>
    `;

    ctaButtonsHtml = `
      <button 
        onclick="handleDownloadResource(${item.id}, '${item.title.replace(/'/g, "\\'")}', '${item.fileSize}')"
        class="btn-primary text-xs shrink-0"
        title="Descargar guía de laboratorio y archivos adjuntos"
      >
        <i class="ri-download-2-line"></i>
        <span>Descargar</span>
      </button>
    `;
  } else {
    cardClass = 'edu-card edu-card-pdf flex flex-col justify-between overflow-hidden group';
    typeBadgeHtml = `
      <span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10.5px] font-bold bg-blue-50 text-brand-700 border border-blue-200 shadow-2xs">
        <i class="ri-file-text-line text-brand-600 text-xs"></i> Solucionario PDF
      </span>
    `;

    mediaPreviewHtml = `
      <div class="p-3 mb-3 bg-gradient-to-r from-blue-50/80 via-blue-50/40 to-indigo-50/30 rounded-xl border border-blue-200/60 flex items-center justify-between">
        <div class="flex items-center gap-2.5">
          <div class="w-8 h-8 rounded-lg bg-brand-600 text-white flex items-center justify-center font-bold shadow-xs">
            <i class="ri-file-pdf-2-line text-base"></i>
          </div>
          <div>
            <span class="text-[11px] font-bold text-slate-800 block">Documento Resuelto</span>
            <span class="text-[10px] text-slate-500 font-medium">${item.fileFormat} • ${item.fileSize}</span>
          </div>
        </div>
        <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-white text-brand-700 border border-blue-200 shadow-2xs">
          <i class="ri-checkbox-circle-fill text-brand-600"></i> Verificado
        </span>
      </div>
    `;

    ctaButtonsHtml = `
      <button 
        onclick="handleDownloadResource(${item.id}, '${item.title.replace(/'/g, "\\'")}', '${item.fileSize}')"
        class="btn-primary text-xs shrink-0"
        title="Descargar documento académico oficial"
      >
        <i class="ri-download-2-line"></i>
        <span>Descargar</span>
      </button>
    `;
  }

  const tagsHtml = (item.tags || []).map(t => `<span class="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 text-slate-600 border border-slate-200/50">#${t}</span>`).join(' ');

  return `
    <article class="${cardClass}">
      <div class="p-5">
        <div class="flex items-center justify-between gap-2 mb-3">
          <span class="badge-course">
            <i class="ri-book-open-line text-brand-600"></i>
            <span class="truncate max-w-[160px]">${item.course}</span>
          </span>
          <div class="flex items-center gap-1.5">
            ${typeBadgeHtml}
            <span class="badge-cycle">${item.cycle}</span>
          </div>
        </div>

        ${mediaPreviewHtml}

        <h3 class="text-base font-bold text-slate-900 group-hover:text-brand-600 transition-colors leading-snug line-clamp-2 cursor-pointer" onclick="openMediaModal(${item.id})">
          ${item.title}
        </h3>

        <p class="text-xs text-slate-500 mt-2 line-clamp-2 leading-relaxed">
          ${item.description}
        </p>

        <div class="mt-3 flex flex-wrap items-center gap-1.5">
          ${tagsHtml}
        </div>

        <div class="mt-3.5 flex items-center justify-between text-[11px] text-slate-400 font-medium pt-2 border-t border-slate-100">
          <span class="inline-flex items-center gap-1.5 text-slate-600 font-semibold bg-slate-100 px-2 py-0.5 rounded">
            <i class="ri-attachment-line"></i>
            ${item.fileFormat} • ${(item.fileSize || '').replace(/⭐|★/g, 'stars').trim()}
          </span>
          <span class="flex items-center gap-1"><i class="ri-download-cloud-line text-slate-400"></i> ${item.downloadsCount}</span>
        </div>
      </div>

      <div class="px-5 py-3.5 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between gap-3 mt-auto">
        <div class="flex items-center gap-2.5 min-w-0">
          <img src="${item.authorAvatar}" alt="${item.authorName}" class="w-8 h-8 rounded-full object-cover ring-2 ring-slate-200/80 shrink-0">
          <div class="min-w-0">
            <p class="text-xs font-bold text-slate-800 truncate">${item.authorName}</p>
            <div class="flex items-center gap-1 mt-0.5">
              <div class="flex items-center gap-0.5">${renderStarRating(item.rating)}</div>
              <span class="text-[11px] font-bold text-slate-700 ml-1">${item.rating.toFixed(1)}</span>
              <span class="text-[10px] text-slate-400">(${item.reviewsCount})</span>
            </div>
          </div>
        </div>

        ${ctaButtonsHtml}
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
            <div class="relative">
              <img src="${mentor.avatar}" alt="${mentor.name}" class="w-12 h-12 rounded-xl object-cover ring-2 ring-slate-100">
              <span class="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full"></span>
            </div>
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
          <span class="px-2 py-0.5 rounded-md text-[10px] font-bold bg-brand-50 text-brand-700 border border-brand-200">
            ${mentor.points}
          </span>
        </div>

        <div class="mb-3">
          <p class="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Áreas de Dominio:</p>
          <div class="flex flex-wrap gap-1.5">
            ${mentor.skills.map(skill => `<span class="px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200/60">${skill}</span>`).join('')}
          </div>
        </div>

        <div class="bg-slate-50 rounded-xl p-2.5 text-[11px] text-slate-500 flex items-center justify-between mb-4 border border-slate-200/60">
          <span class="flex items-center gap-1.5 font-medium"><i class="ri-time-line text-brand-600"></i> ${mentor.schedule}</span>
          <span class="font-bold text-slate-700">${mentor.sessions} sesiones</span>
        </div>
      </div>

      <button onclick="openBookingModal(${mentor.id}, '${mentor.name.replace(/'/g, "\\'")}')" class="btn-primary w-full text-xs">
        <i class="ri-calendar-check-line"></i>
        <span>Solicitar Asesoría Par</span>
      </button>
    </div>
  `;
}

// Renderizar tarjeta de Comunidad
function createCommunityCardHtml(community) {
  return `
    <div class="edu-card p-5 flex flex-col justify-between">
      <div>
        <div class="flex items-center justify-between gap-2 mb-2">
          <span class="text-[10px] font-bold uppercase tracking-wider text-brand-700 bg-brand-50 px-2.5 py-0.5 rounded-md border border-brand-200">
            ${community.type}
          </span>
          <span class="flex items-center gap-1.5 text-[11px] font-bold text-emerald-600">
            <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            ${community.onlineCount} en línea
          </span>
        </div>

        <h3 class="text-base font-bold text-slate-900 mt-1">${community.name}</h3>
        <p class="text-xs text-brand-700 font-medium mt-0.5">${community.faculty}</p>
        <p class="text-xs text-slate-500 mt-2 leading-relaxed">${community.description}</p>
        
        <div class="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-medium">
          <span class="flex items-center gap-1.5"><i class="ri-group-line text-slate-400"></i> ${community.members.toLocaleString()} miembros</span>
          <span class="flex items-center gap-1 text-emerald-600 font-semibold"><i class="ri-broadcast-line"></i> Sala Activa</span>
        </div>
      </div>

      <button 
        onclick="toggleCommunityMembership(${community.id})" 
        class="mt-4 w-full py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
          community.isMember 
            ? 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200' 
            : 'btn-primary'
        }"
      >
        <i class="${community.isMember ? 'ri-check-line text-emerald-600' : 'ri-user-add-line'}"></i>
        <span>${community.isMember ? 'Miembro Activo' : 'Unirme a la Comunidad'}</span>
      </button>
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
