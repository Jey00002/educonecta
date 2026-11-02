/**
 * EduConecta - Enrutador SPA (Single Page Application)
 * Manejo de navegación por vistas sin recargar la página
 */

const AppRouter = {
  views: ['inicio', 'repositorio', 'mapa-expertos', 'comunidades', 'perfil'],

  init() {
    // Escuchar cambios en la URL (botones atrás / adelante del navegador)
    window.addEventListener('popstate', () => {
      const target = window.location.hash.replace('#', '') || 'inicio';
      this.navigate(target, false);
    });

    // Cargar la vista inicial según la URL actual
    const initialView = window.location.hash.replace('#', '') || 'inicio';
    this.navigate(initialView, false);
  },

  navigate(viewName, updateHistory = true) {
    if (!this.views.includes(viewName)) {
      viewName = 'inicio';
    }

    // 1. Mostrar/ocultar contenedores de vista
    this.views.forEach(viewId => {
      const el = document.getElementById(`view-${viewId}`);
      if (el) {
        if (viewId === viewName) {
          el.classList.remove('hidden');
        } else {
          el.classList.add('hidden');
        }
      }

      // 2. Sincronizar enlaces de navegación de escritorio
      const desktopTab = document.getElementById(`nav-link-${viewId}`);
      if (desktopTab) {
        if (viewId === viewName) {
          desktopTab.classList.add('active');
        } else {
          desktopTab.classList.remove('active');
        }
      }

      // 3. Sincronizar enlaces de menú móvil
      const mobileTab = document.getElementById(`mobile-link-${viewId}`);
      if (mobileTab) {
        if (viewId === viewName) {
          mobileTab.classList.add('bg-brand-50', 'text-brand-600', 'font-semibold');
          mobileTab.classList.remove('text-slate-600');
        } else {
          mobileTab.classList.remove('bg-brand-50', 'text-brand-600', 'font-semibold');
          mobileTab.classList.add('text-slate-600');
        }
      }
    });

    // 4. Actualizar URL si corresponde
    if (updateHistory) {
      window.history.pushState(null, null, `#${viewName}`);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // 5. Hooks de renderizado al entrar a una vista
    if (typeof onRouteChanged === 'function') {
      onRouteChanged(viewName);
    }
  }
};
