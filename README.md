# EduConecta - Plataforma de Gestión de Conocimiento Estudiantil

Plataforma universitaria colaborativa para la gestión de apuntes, exámenes resueltos, guías de laboratorio y tutorías entre pares, con backend modular en **Node.js + Express**.

---

## 📁 Estructura del Proyecto

El proyecto está organizado en frontend y backend desacoplados y modulares:

```
educonecta/
│
├── server.js                 # Servidor principal Node.js / Express
├── package.json              # Dependencias y scripts de ejecución
├── .env                      # Variables de entorno (PORT, NODE_ENV)
├── test-backend.js           # Suite de pruebas automatizadas del API
│
├── backend/                  # Arquitectura del Backend
│   ├── config/               # Configuración del servidor
│   ├── controllers/          # Controladores de lógica de negocio
│   │   ├── resources.controller.js
│   │   ├── mentors.controller.js
│   │   ├── communities.controller.js
│   │   ├── bookings.controller.js
│   │   └── profile.controller.js
│   ├── data/                 # Capa de persistencia
│   │   ├── database.js       # Gestor de base de datos con persistencia en disco
│   │   └── initial-data.json # Semilla de datos iniciales
│   ├── middlewares/          # Middlewares (Multer para uploads, error handling)
│   │   ├── errorHandler.js
│   │   └── upload.js
│   └── routes/               # Rutas RESTful agrupadas
│       ├── resources.routes.js
│       ├── mentors.routes.js
│       ├── communities.routes.js
│       ├── bookings.routes.js
│       ├── profile.routes.js
│       └── index.js
│
├── uploads/                  # Carpeta de almacenamiento para archivos subidos
│
├── index.html                # Maquetación semántica y vistas SPA
├── css/
│   └── styles.css            # Estilos CSS, variables de marca y animaciones
├── js/
│   ├── api.js                # Cliente HTTP para interactuar con la API REST
│   ├── data.js               # Modelos y datos locales con soporte offline
│   ├── components.js         # Generación dinámica de componentes UI
│   ├── router.js             # Enrutador SPA (hash routing)
│   └── app.js                # Inicialización, debounce y eventos
└── assets/                   # Recursos estáticos
```

---

## 🚀 Ejecución y Comandos

### 1. Iniciar el servidor Backend en Node.js
```bash
npm start
```
O en modo de desarrollo con recarga automática:
```bash
npm run dev
```

El servidor estará escuchando en:
```
http://localhost:3000
```

### 2. Ejecutar la suite de pruebas automatizadas
```bash
node test-backend.js
```

---

## 📡 Endpoints de la API REST

### Estado del Sistema
- `GET /api/health` - Verificación del estado y uptime del servidor

### Autenticación y Cuentas (`/api/auth`)
- `POST /api/auth/login` - Iniciar sesión (correo institucional `@utp.edu.pe` o código UTP + contraseña)
- `POST /api/auth/register` - Registro de nuevo estudiante con bono de bienvenida (+100 pts)
- `GET /api/auth/me` - Obtener datos del usuario autenticado (requiere token JWT)
- `POST /api/auth/logout` - Cierre de sesión

### Recursos Académicos (`/api/resources`)
- `GET /api/resources` - Listado con soporte de filtros (`search`, `course`, `cycle`, `category`, `sort`)
- `GET /api/resources/:id` - Detalle de un recurso específico
- `POST /api/resources` - Publicar nuevo recurso (soporta subida de archivos físicos `multipart/form-data` o JSON)
- `POST /api/resources/:id/download` - Incrementar descargas y obtener enlace del archivo
- `POST /api/resources/:id/rate` - Calificar recurso (1-5 estrellas)
- `DELETE /api/resources/:id` - Eliminar recurso

### Red de Tutores y Asesorías (`/api/mentors`)
- `GET /api/mentors` - Listado de tutores con filtro por especialidad y búsqueda
- `GET /api/mentors/:id` - Perfil de tutor
- `POST /api/mentors/:id/book` - Reservar una sesión de asesoría entre pares

### Comunidades Estudiantiles (`/api/communities`)
- `GET /api/communities` - Listado de grupos de estudio y comunidades
- `POST /api/communities` - Crear nueva comunidad
- `POST /api/communities/:id/toggle-membership` - Unirse o salir de una comunidad

### Perfil y Estadísticas (`/api/profile`)
- `GET /api/profile` - Perfil del usuario activo y sus aportes
- `PUT /api/profile` - Actualizar información del perfil
- `GET /api/profile/stats` - Estadísticas consolidadas de la plataforma
