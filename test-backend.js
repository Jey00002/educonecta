const http = require('http');

async function testEndpoint(name, path, options = {}) {
  return new Promise((resolve, reject) => {
    const req = http.request(`http://localhost:3000${path}`, options, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, raw: data });
        }
      });
    });

    req.on('error', err => reject(err));
    if (options.body) {
      req.write(options.body);
    }
    req.end();
  });
}

async function runTests() {
  console.log('--- Probando Backend EduConecta ---');

  // 1. Health check
  const health = await testEndpoint('Health Check', '/api/health');
  console.log('✓ GET /api/health:', health.status, health.data.status);
  if (health.status !== 200) throw new Error('Health falló');

  // 1.1 Auth Login
  const loginPayload = JSON.stringify({ identifier: 'valeria.mendoza@utp.edu.pe', password: 'utp12345' });
  const loginRes = await testEndpoint('Login', '/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(loginPayload) },
    body: loginPayload
  });
  console.log('✓ POST /api/auth/login:', loginRes.status, 'Token obtenido:', !!loginRes.data.data?.token);
  if (loginRes.status !== 200 || !loginRes.data.data?.token) throw new Error('Login falló');
  const userToken = loginRes.data.data.token;

  // 1.2 Auth Me
  const meRes = await testEndpoint('Me', '/api/auth/me', {
    headers: { 'Authorization': `Bearer ${userToken}` }
  });
  console.log('✓ GET /api/auth/me:', meRes.status, 'Usuario autenticado:', meRes.data.data?.name);
  if (meRes.status !== 200 || !meRes.data.data?.email) throw new Error('Me falló');

  // 2. Resources list
  const resources = await testEndpoint('Get Resources', '/api/resources');
  console.log('✓ GET /api/resources:', resources.status, 'Total recursos:', resources.data.count);
  if (resources.status !== 200 || resources.data.count < 1) throw new Error('Recursos falló');

  // 3. Mentors list
  const mentors = await testEndpoint('Get Mentors', '/api/mentors');
  console.log('✓ GET /api/mentors:', mentors.status, 'Total mentores:', mentors.data.count);
  if (mentors.status !== 200 || mentors.data.count < 1) throw new Error('Mentores falló');

  // 4. Communities list
  const communities = await testEndpoint('Get Communities', '/api/communities');
  console.log('✓ GET /api/communities:', communities.status, 'Total comunidades:', communities.data.count);
  if (communities.status !== 200 || communities.data.count < 1) throw new Error('Comunidades falló');

  // 5. User Profile
  const profile = await testEndpoint('Get Profile', '/api/profile');
  console.log('✓ GET /api/profile:', profile.status, 'Usuario:', profile.data.data.name);
  if (profile.status !== 200) throw new Error('Perfil falló');

  // 6. Stats
  const stats = await testEndpoint('Get Stats', '/api/profile/stats');
  console.log('✓ GET /api/profile/stats:', stats.status, stats.data.data);
  if (stats.status !== 200) throw new Error('Stats falló');

  // 7. Create Resource
  const newResPayload = JSON.stringify({
    title: 'Prueba de Arquitectura Backend Node.js',
    course: 'Sistemas Operativos',
    cycle: 'Ciclo V',
    category: 'Proyectos y Código',
    description: 'Documento subido en test de integración.'
  });
  const postResource = await testEndpoint('Post Resource', '/api/resources', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(newResPayload)
    },
    body: newResPayload
  });
  console.log('✓ POST /api/resources:', postResource.status, 'Nuevo id:', postResource.data.data?.id);
  if (postResource.status !== 201) throw new Error('Crear recurso falló');

  // 8. Download Resource
  const createdId = postResource.data.data.id;
  const downloadRes = await testEndpoint('Download', `/api/resources/${createdId}/download`, { method: 'POST' });
  console.log('✓ POST /api/resources/:id/download:', downloadRes.status, 'Descargas:', downloadRes.data.data?.downloadsCount);
  if (downloadRes.status !== 200 || downloadRes.data.data.downloadsCount !== 1) throw new Error('Download falló');

  // 9. Book Mentoring session
  const bookPayload = JSON.stringify({
    studentName: 'Juan Pérez',
    studentEmail: 'juan.perez@utp.edu.pe',
    topic: 'Consulta sobre grafos y matrices',
    date: '2026-11-05',
    time: '19:00'
  });
  const bookRes = await testEndpoint('Book Mentor', '/api/mentors/1/book', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(bookPayload)
    },
    body: bookPayload
  });
  console.log('✓ POST /api/mentors/1/book:', bookRes.status, 'Reserva confirmada:', bookRes.data.data?.id);
  if (bookRes.status !== 201) throw new Error('Reserva falló');

  // 10. Toggle Community
  const commToggle = await testEndpoint('Toggle Community', '/api/communities/2/toggle-membership', { method: 'POST' });
  console.log('✓ POST /api/communities/2/toggle-membership:', commToggle.status, 'Nuevo estado:', commToggle.data.data?.isMember);
  if (commToggle.status !== 200) throw new Error('Toggle comunidad falló');

  console.log('\n🎉 ¡TODAS LAS PRUEBAS DEL BACKEND PASARON EXITOSAMENTE!');
}

// Iniciar servidor temporal para pruebas
const server = require('./server');
setTimeout(() => {
  runTests()
    .then(() => {
      process.exit(0);
    })
    .catch(err => {
      console.error('Error en pruebas:', err);
      process.exit(1);
    });
}, 500);
