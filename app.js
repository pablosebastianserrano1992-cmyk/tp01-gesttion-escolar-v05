// Lógica Principal - Sistema de Gestión Escolar PWA (Paso 7 Integrado)
document.addEventListener('DOMContentLoaded', () => {
    let datos = JSON.parse(localStorage.getItem('escuela_db')) || {
        cursos: [],
        alumnos: [],
        docentes: [],
        asignaciones: []
    };

    function guardarDatos() {
        localStorage.setItem('escuela_db', JSON.stringify(datos));
        actualizarEstadisticas();
        renderizarTablas();
        cargarSelects();
    }

    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('./sw.js')
            .then(reg => console.log('Service Worker registrado:', reg.scope))
            .catch(err => console.error('Error al registrar Service Worker:', err));
    }

    // Aviso discreto de conexión (Online / Offline) - PASO 7
    const avisoOffline = document.getElementById('aviso-offline');
    function verificarConexion() {
        if (!navigator.onLine) {
            avisoOffline.style.display = 'block';
        } else {
            avisoOffline.style.display = 'none';
        }
    }
    window.addEventListener('online', verificarConexion);
    window.addEventListener('offline', verificarConexion);
    verificarConexion();

    const formLogin = document.getElementById('form-login');
    const pantallaLogin = document.getElementById('pantalla-login');
    const appContenido = document.getElementById('app-contenido');
    const loginError = document.getElementById('login-error');

    if (sessionStorage.getItem('sesion_activa') === 'true') {
        pantallaLogin.style.display = 'none';
        appContenido.style.display = 'block';
        actualizarEstadisticas();
        renderizarTablas();
        cargarSelects();
    }

    formLogin.addEventListener('submit', (e) => {
        e.preventDefault();
        const u = document.getElementById('login-usuario').value;
        const p = document.getElementById('login-password').value;

        if (u === 'admin' && p === '1234') {
            sessionStorage.setItem('sesion_activa', 'true');
            pantallaLogin.style.display = 'none';
            appContenido.style.display = 'block';
            actualizarEstadisticas();
            renderizarTablas();
            cargarSelects();
        } else {
            loginError.style.display = 'block';
        }
    });

    document.getElementById('btn-logout').addEventListener('click', () => {
        sessionStorage.removeItem('sesion_activa');
        location.reload();
    });

    const navButtons = document.querySelectorAll('.nav-btn[data-seccion]');
    const secciones = document.querySelectorAll('.seccion-app');

    navButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const objetivo = btn.getAttribute('data-seccion');
            navButtons.forEach(b => b.classList.remove('active'));
            secciones.forEach(s => s.classList.remove('active'));

            btn.classList.add('active');
            document.getElementById(`seccion-${objetivo}`).classList.add('active');
        });
    });

    document.getElementById('form-curso').addEventListener('submit', (e) => {
        e.preventDefault();
        const id = document.getElementById('curso-id').value;
        const nombre = document.getElementById('curso-nombre').value.trim();
        const anio = document.getElementById('curso-anio').value;

        if (id) {
            const index = datos.cursos.findIndex(c => c.id === id);
            if (index !== -1) datos.cursos[index] = { id, nombre, anio };
        } else {
            datos.cursos.push({ id: Date.now().toString(), nombre, anio });
        }

        e.target.reset();
        document.getElementById('curso-id').value = '';
        guardarDatos();
    });

    document.getElementById('form-alumno').addEventListener('submit', (e) => {
        e.preventDefault();
        const id = document.getElementById('alumno-id').value;
        const nombre = document.getElementById('alumno-nombre').value.trim();
        const legajo = document.getElementById('alumno-legajo').value.trim();
        const cursoId = document.getElementById('alumno-curso').value;

        if (id) {
            const index = datos.alumnos.findIndex(a => a.id === id);
            if (index !== -1) datos.alumnos[index] = { id, nombre, legajo, cursoId };
        } else {
            datos.alumnos.push({ id: Date.now().toString(), nombre, legajo, cursoId });
        }

        e.target.reset();
        document.getElementById('alumno-id').value = '';
        guardarDatos();
    });

    document.getElementById('form-docente').addEventListener('submit', (e) => {
        e.preventDefault();
        const id = document.getElementById('docente-id').value;
        const nombre = document.getElementById('docente-nombre').value.trim();
        const email = document.getElementById('docente-email').value.trim();

        if (id) {
            const index = datos.docentes.findIndex(d => d.id === d.id);
            if (index !== -1) datos.docentes[index] = { id, nombre, email };
        } else {
            datos.docentes.push({ id: Date.now().toString(), nombre, email });
        }

        e.target.reset();
        document.getElementById('docente-id').value = '';
        guardarDatos();
    });

    document.getElementById('form-asignacion').addEventListener('submit', (e) => {
        e.preventDefault();
        const id = document.getElementById('asignacion-id').value;
        const materia = document.getElementById('asignacion-materia').value.trim();
        const docenteId = document.getElementById('asignacion-docente').value;
        const cursoId = document.getElementById('asignacion-curso').value;
        const horas = document.getElementById('asignacion-horas').value;

        if (id) {
            const index = datos.asignaciones.findIndex(a => a.id === id);
            if (index !== -1) datos.asignaciones[index] = { id, materia, docenteId, cursoId, horas };
        } else {
            datos.asignaciones.push({ id: Date.now().toString(), materia, docenteId, cursoId, horas });
        }

        e.target.reset();
        document.getElementById('asignacion-id').value = '';
        guardarDatos();
    });

    function renderizarTablas() {
        const tbodyCursos = document.getElementById('tabla-cursos-body');
        tbodyCursos.innerHTML = datos.cursos.map(c => `
            <tr>
                <td>${c.nombre}</td>
                <td>${c.anio}º Año</td>
                <td><button onclick="eliminarItem('cursos', '${c.id}')" class="btn btn-danger">Eliminar</button></td>
            </tr>
        `).join('');

        const tbodyAlumnos = document.getElementById('tabla-alumnos-body');
        tbodyAlumnos.innerHTML = datos.alumnos.map(a => {
            const curso = datos.cursos.find(c => c.id === a.cursoId);
            return `
                <tr>
                    <td>${a.legajo}</td>
                    <td>${a.nombre}</td>
                    <td>${curso ? curso.nombre : 'Sin asignar'}</td>
                    <td><button onclick="eliminarItem('alumnos', '${a.id}')" class="btn btn-danger">Eliminar</button></td>
                </tr>
            `;
        }).join('');

        const tbodyDocentes = document.getElementById('tabla-docentes-body');
        tbodyDocentes.innerHTML = datos.docentes.map(d => `
            <tr>
                <td>${d.nombre}</td>
                <td>${d.email}</td>
                <td><button onclick="eliminarItem('docentes', '${d.id}')" class="btn btn-danger">Eliminar</button></td>
            </tr>
        `).join('');

        const tbodyAsig = document.getElementById('tabla-asignaciones-body');
        tbodyAsig.innerHTML = datos.asignaciones.map(a => {
            const doc = datos.docentes.find(d => d.id === a.docenteId);
            const cur = datos.cursos.find(c => c.id === a.cursoId);
            return `
                <tr>
                    <td>${a.materia}</td>
                    <td>${doc ? doc.nombre : 'N/A'}</td>
                    <td>${cur ? cur.nombre : 'N/A'}</td>
                    <td>${a.horas} hs</td>
                    <td><button onclick="eliminarItem('asignaciones', '${a.id}')" class="btn btn-danger">Eliminar</button></td>
                </tr>
            `;
        }).join('');
    }

    window.eliminarItem = function(coleccion, id) {
        datos[coleccion] = datos[coleccion].filter(item => item.id !== id);
        guardarDatos();
    };

    function cargarSelects() {
        const selectCursoAlumno = document.getElementById('alumno-curso');
        const selectCursoAsig = document.getElementById('asignacion-curso');
        const selectDocenteAsig = document.getElementById('asignacion-docente');

        const opcionesCursos = datos.cursos.map(c => `<option value="${c.id}">${c.nombre}</option>`).join('');
        const opcionesDocentes = datos.docentes.map(d => `<option value="${d.id}">${d.nombre}</option>`).join('');

        selectCursoAlumno.innerHTML = '<option value="">Seleccione un Curso...</option>' + opcionesCursos;
        selectCursoAsig.innerHTML = '<option value="">Seleccione un Curso...</option>' + opcionesCursos;
        selectDocenteAsig.innerHTML = '<option value="">Seleccione un Docente...</option>' + opcionesDocentes;
    }

    function actualizarEstadisticas() {
        document.getElementById('stat-cursos').textContent = datos.cursos.length;
        document.getElementById('stat-alumnos').textContent = datos.alumnos.length;
        document.getElementById('stat-docentes').textContent = datos.docentes.length;
        document.getElementById('stat-asignaciones').textContent = datos.asignaciones.length;
    }

    // Exportación inteligente (Paso 7: navigator.share o descarga normal)
    document.getElementById('btn-exportar').addEventListener('click', async () => {
        const str = JSON.stringify(datos, null, 2);
        const blob = new Blob([str], { type: 'application/json' });
        const nombreArchivo = `escuela-datos-${new Date().toISOString().slice(0,10)}.json`;
        const archivo = new File([blob], nombreArchivo, { type: 'application/json' });

        if (navigator.canShare && navigator.canShare({ files: [archivo] })) {
            try {
                await navigator.share({
                    files: [archivo],
                    title: 'Copia de Seguridad - Gestión Escolar',
                    text: 'Respaldo de datos del sistema escolar.'
                });
                return;
            } catch (err) {
                if (err.name !== 'AbortError') {
                    console.log('Error al compartir, descargando de forma tradicional...', err);
                } else {
                    return;
                }
            }
        }

        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = nombreArchivo;
        a.click();
        URL.revokeObjectURL(url);
    });

    document.getElementById('input-importar').addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (evt) => {
            try {
                const nuevosDatos = JSON.parse(evt.target.result);
                if (nuevosDatos.cursos && nuevosDatos.alumnos && nuevosDatos.docentes) {
                    datos = nuevosDatos;
                    guardarDatos();
                    alert('¡Datos importados con éxito!');
                } else {
                    alert('El archivo JSON no tiene el formato correcto de la escuela.');
                }
            } catch (err) {
                alert('Error al leer el archivo JSON.');
            }
        };
        reader.readAsText(file);
    });
});
