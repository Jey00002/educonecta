const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');

const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const documents = [
  {
    fileName: 'solucionario-algoritmos-grafos-dijkstra.pdf',
    title: 'Guía y Solucionario: Algoritmos de Grafos y Árboles AVL',
    course: 'Algoritmos y Estructura de Datos (Ciclo IV)',
    author: 'Diego Valenzuela - Tutor Par Certificado',
    sections: [
      {
        heading: '1. Fundamentos Teóricos de Grafos Ponderados',
        text: 'Un grafo ponderado G = (V, E, W) consiste en un conjunto de vértices V, aristas E y una función de peso W: E -> R. Para encontrar el camino de menor costo desde un nodo origen a todos los demás vértices, el algoritmo de Dijkstra utiliza una cola de prioridad (Priority Queue) implementada comúnmente sobre un montículo binario (Min-Heap).'
      },
      {
        heading: '2. Análisis de Complejidad Asintótica Big-O',
        text: 'Con matriz de adyacencia: O(|V|^2).\nCon lista de adyacencia y Min-Heap binario: O((|V| + |E|) log |V|).\nCon Fibonacci Heap: O(|E| + |V| log |V|).'
      },
      {
        heading: '3. Problema Tipo Examen Resuelto Paso a Paso',
        text: 'Enunciado: Dado el grafo con nodos {A, B, C, D, E} y pesos w(A,B)=4, w(A,C)=2, w(B,C)=1, w(B,D)=5, w(C,D)=8, w(C,E)=10, w(D,E)=2.\nIteración 1: Distancia a A = 0. Vecinos: C (costo 2), B (costo 4).\nIteración 2: Extraer C (dist 2). Actualizar B: min(4, 2+1) = 3 a través de C.\nIteración 3: Extraer B (dist 3). Actualizar D: 3 + 5 = 8.\nResultado final de distancias mínimas: A:0, C:2, B:3, D:8, E:10.'
      },
      {
        heading: '4. Árboles AVL: Rotaciones de Rebalanceo',
        text: 'El factor de equilibrio se calcula como: FE = Altura(Subárbol Derecho) - Altura(Subárbol Izquierdo). Si |FE| > 1, el nodo está desbalanceado. Se aplican rotaciones simples (LL, RR) o rotaciones dobles (LR, RL) según el signo del hijo.'
      }
    ]
  },
  {
    fileName: 'solucionario-calculo-fisica-campos-magneticos.pdf',
    title: 'Solucionario Oficial: Ley de Ampère, Ley de Gauss y Ecuaciones Maxwell',
    course: 'Cálculo y Física Aplicada (Ciclo III)',
    author: 'Camila Navarro - Mentora Certificada',
    sections: [
      {
        heading: '1. Formulación Integral de la Ley de Ampère',
        text: 'La circulación del campo magnético B a lo largo de una curva cerrada C es proporcional a la corriente total neta que atraviesa la superficie delimitada por C: oint B . dl = mu_0 * I_encerrada.'
      },
      {
        heading: '2. Problema del Examen Parcial: Cable Coaxial',
        text: 'Un conductor cilíndrico de radio a transporta una corriente uniforme I. Para r < a: I_enc = I * (r^2 / a^2). Por lo tanto: B(2 * pi * r) = mu_0 * I * (r^2 / a^2) ==> B(r) = (mu_0 * I * r) / (2 * pi * a^2).\nPara r >= a: I_enc = I. Entonces B(r) = (mu_0 * I) / (2 * pi * r).'
      },
      {
        heading: '3. Ley de Faraday y Fuerza Electromotriz Inducida',
        text: 'fem = - d(Phi_B) / dt. El signo negativo proviene de la Ley de Lenz, indicando que el sentido de la corriente inducida se opone al cambio en el flujo magnético que la produce.'
      }
    ]
  },
  {
    fileName: 'guia-linux-concurrencia-posix-c.pdf',
    title: 'Manual de Laboratorio: Concurrencia POSIX Threads y Semáforos en Linux',
    course: 'Sistemas Operativos (Ciclo V)',
    author: 'Carlos Mendoza - Estudiante de Ingeniería de Software',
    sections: [
      {
        heading: '1. Creación y Sincronización de Hilos con pthread',
        text: 'Se utiliza pthread_create() para instanciar hilos ligeros dentro del mismo espacio de direcciones virtuales del proceso. Para sincronizar la terminación de los hilos se invoca pthread_join().'
      },
      {
        heading: '2. Exclusión Mutua con Mutex y Semáforos',
        text: 'pthread_mutex_lock(&lock) y pthread_mutex_unlock(&lock) previenen condiciones de carrera (Race Conditions) al acceder a variables compartidas en memoria.\nPara problemas de productor-consumidor se combinan sem_wait() y sem_post() de <semaphore.h>.'
      },
      {
        heading: '3. Detección y Prevención de Bloqueos Mutuos (Deadlocks)',
        text: 'Condiciones de Coffman: 1) Exclusión mutua, 2) Retención y espera, 3) No expropiación, 4) Espera circular. Romper la espera circular asignando un orden jerárquico estricto a la adquisición de cerrojos garantiza la ausencia de interbloqueos.'
      }
    ]
  },
  {
    fileName: 'cheat-sheet-sql-postgresql-avanzado.pdf',
    title: 'Cheat Sheet SQL Avanzado: Índices B-Tree, Triggers y Optimización ACID',
    course: 'Bases de Datos (Ciclo IV)',
    author: 'Andrea Flores - Especialista en Gestión de Datos',
    sections: [
      {
        heading: '1. Niveles de Aislamiento Transaccional ANSI SQL',
        text: 'Read Uncommitted: permite lecturas sucias (Dirty Reads).\nRead Committed (por defecto en PostgreSQL): previene Dirty Reads.\nRepeatable Read: previene lecturas no repetibles (Non-Repeatable Reads).\nSerializable: garantiza serializabilidad completa previniendo anomalías de serialización.'
      },
      {
        heading: '2. Creación y Uso de Procedimientos y Triggers',
        text: 'CREATE OR REPLACE FUNCTION actualizar_stock()\nRETURNS TRIGGER AS $$\nBEGIN\n  UPDATE productos SET stock = stock - NEW.cantidad WHERE id = NEW.producto_id;\n  RETURN NEW;\nEND;\n$$ LANGUAGE plpgsql;\n\nCREATE TRIGGER trg_descontar_stock AFTER INSERT ON detalle_orden FOR EACH ROW EXECUTE FUNCTION actualizar_stock();'
      },
      {
        heading: '3. Análisis de Rendimiento con EXPLAIN ANALYZE',
        text: 'Identificar Seq Scan en tablas voluminosas. Crear índices apropiados B-Tree para comparaciones de igualdad y rango, o GIN/GIST para búsquedas de texto completo (Full Text Search) y datos JSONB.'
      }
    ]
  },
  {
    fileName: 'guia-redes-cisco-ospf-vlan-trunking.pdf',
    title: 'Laboratorio Práctico de Redes: Enrutamiento OSPF y VLAN Trunking (802.1Q)',
    course: 'Redes y Telecomunicaciones (Ciclo VI)',
    author: 'Mateo Villacorta - CCNA Certified Student',
    sections: [
      {
        heading: '1. Configuración de Subinterfaces Router-on-a-Stick',
        text: 'interface GigabitEthernet0/0/0.10\n encapsulation dot1Q 10\n ip address 192.168.10.1 255.255.255.0\n!\ninterface GigabitEthernet0/0/0.20\n encapsulation dot1Q 20\n ip address 192.168.20.1 255.255.255.0'
      },
      {
        heading: '2. Enrutamiento Dinámico OSPFv2 de Área Única',
        text: 'router ospf 1\n router-id 1.1.1.1\n network 192.168.10.0 0.0.0.255 area 0\n network 192.168.20.0 0.0.0.255 area 0\n passive-interface GigabitEthernet0/0/0.10'
      },
      {
        heading: '3. Comandos de Diagnóstico y Verificación',
        text: 'show ip route (ver tabla de rutas OSPF identificadas con la letra O).\nshow ip ospf neighbor (verificar estado FULL/DR o FULL/BDR con routers adyacentes).\nshow interfaces trunk (verificar enlaces troncales activos en modo 802.1Q).'
      }
    ]
  },
  {
    fileName: 'resumen-microarquitectura-mips-pipeline.pdf',
    title: 'Compendio de Microarquitectura: Pipeline MIPS de 5 Etapas y Hazards',
    course: 'Arquitectura de Computadoras (Ciclo V)',
    author: 'Lucía Arismendi - Ciencias de la Computación',
    sections: [
      {
        heading: '1. Las 5 Etapas del Procesador Segmentado MIPS',
        text: 'IF (Instruction Fetch): Lectura de la instrucción de memoria con PC.\nID (Instruction Decode): Decodificación de instrucción y lectura de registros.\nEX (Execute): Operación de la ALU o cálculo de dirección efectiva.\nMEM (Memory Access): Lectura o escritura en memoria de datos.\nWB (Write Back): Escritura del resultado en el banco de registros.'
      },
      {
        heading: '2. Clasificación de Riesgos (Hazards) y Soluciones',
        text: 'Estructurales: Múltiples instrucciones compiten por el mismo recurso de hardware (solución: memorias separadas de datos e instrucciones Harvard).\nDe Datos: Una instrucción depende del resultado de una previa aún no completada (solución: Forwarding / Bypassing o inserción de burbujas stall).\nDe Control: Decisiones de salto condicional (branch) cuyo destino aún no se conoce (solución: predicción de saltos estática/dinámica o branch delay slot).'
      }
    ]
  }
];

function generatePDF(docData) {
  return new Promise((resolve, reject) => {
    const filePath = path.join(uploadsDir, docData.fileName);
    const doc = new PDFDocument({
      size: 'A4',
      margin: 45,
      info: {
        Title: docData.title,
        Author: docData.author,
        Subject: docData.course,
        Keywords: 'EduConecta, Solucionario, Examen, Universidad'
      }
    });

    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    // Barra superior decorativa institucional
    doc.rect(0, 0, doc.page.width, 10).fill('#dc2626');

    // Header institucional
    doc.fontSize(10).font('Helvetica-Bold').fillColor('#dc2626').text('EDUCONECTA PLATAFORMA UNIVERSITARIA', 45, 25);
    doc.fontSize(8).font('Helvetica').fillColor('#64748b').text('Repositorio Académico Verificado | Periodo 2026', 45, 38);

    doc.moveTo(45, 52).lineTo(doc.page.width - 45, 52).strokeColor('#e2e8f0').stroke();

    // Título Principal
    doc.moveDown(1.5);
    doc.fontSize(16).font('Helvetica-Bold').fillColor('#0f172a').text(docData.title, 45, 65, { width: doc.page.width - 90 });

    // Meta datos del documento
    doc.moveDown(0.5);
    doc.fontSize(9).font('Helvetica-Bold').fillColor('#dc2626').text(docData.course);
    doc.fontSize(8).font('Helvetica').fillColor('#475569').text(`Aporte de: ${docData.author} | Revisión y Validación Estudiantil Aprobada`);

    doc.moveDown(1);
    doc.rect(45, doc.y, doc.page.width - 90, 22).fillAndStroke('#eff6ff', '#bfdbfe');
    doc.fillColor('#004494').fontSize(8).font('Helvetica-Bold').text('  MATERIAL OFICIAL VERIFICADO • ACCESO LIBRE PARA ESTUDIANTES', 50, doc.y - 16);

    doc.moveDown(1.5);

    // Secciones con contenido real
    docData.sections.forEach((sec, idx) => {
      doc.moveDown(0.8);
      doc.fontSize(11).font('Helvetica-Bold').fillColor('#0f172a').text(sec.heading);
      doc.moveDown(0.3);
      doc.fontSize(9).font('Helvetica').fillColor('#334155').text(sec.text, {
        align: 'justify',
        lineGap: 3
      });
    });

    // Pie de página institucional
    const footerY = doc.page.height - 40;
    doc.moveTo(45, footerY - 5).lineTo(doc.page.width - 45, footerY - 5).strokeColor('#e2e8f0').stroke();
    doc.fontSize(7).font('Helvetica').fillColor('#94a3b8').text('EduConecta 2026 - Plataforma Universitaria Colaborativa. Documento generado para fines académicos.', 45, footerY, { align: 'center' });

    doc.end();
    stream.on('finish', () => {
      console.log(`✓ PDF generado: ${docData.fileName}`);
      resolve(filePath);
    });
    stream.on('error', reject);
  });
}

async function run() {
  console.log('Generando documentos PDF reales en /uploads...');
  for (const doc of documents) {
    await generatePDF(doc);
  }
  console.log('¡Todos los archivos PDF reales fueron generados exitosamente!');
}

run().catch(console.error);
