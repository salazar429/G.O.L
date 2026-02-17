// Variables globales
let obras = JSON.parse(localStorage.getItem('obras')) || [];
let obraActual = null;
let tabActual = 'personajes';
let elementoAEliminar = null;

// Variables para el mapa
let nodos = [];
let lineas = [];
let arrastrando = null;
let offsetX, offsetY;

// Splash screen
setTimeout(() => {
    document.getElementById('splash').classList.add('hidden');
    setTimeout(() => {
        document.getElementById('splash').style.display = 'none';
        document.getElementById('appContainer').style.display = 'block';
    }, 500);
}, 2000);

// Mostrar obras
function mostrarObras() {
    const grid = document.getElementById('obrasGrid');
    if (obras.length === 0) {
        grid.innerHTML = '<div class="empty-message">📚 No hay obras. ¡Crea la primera!</div>';
        return;
    }
    
    grid.innerHTML = obras.map(obra => `
        <div class="obra-card" onclick="abrirObra('${obra.id}')">
            <button class="delete-btn" onclick="event.stopPropagation(); confirmarEliminarObra('${obra.id}')">×</button>
            <h3>${obra.titulo}</h3>
            <p>📖 ${obra.genero || 'Sin género'}</p>
            <p>👥 ${obra.personajes?.length || 0} personajes</p>
        </div>
    `).join('');
}

// Abrir obra
function abrirObra(obraId) {
    obraActual = obras.find(o => o.id === obraId);
    document.getElementById('obraTituloWindow').textContent = `📖 ${obraActual.titulo}`;
    document.getElementById('obraWindow').classList.add('active');
    mostrarPersonajes();
}

function cerrarObraWindow() {
    document.getElementById('obraWindow').classList.remove('active');
    obraActual = null;
}

// Modales
function mostrarModalObra() {
    document.getElementById('modalObra').classList.add('active');
}

function mostrarModalPersonaje(personaje = null) {
    if (!obraActual) return;
    
    if (personaje) {
        document.getElementById('modalPersonajeTitulo').textContent = '✏️ Editar Personaje';
        document.getElementById('personajeId').value = personaje.id;
        document.getElementById('personajeNombre').value = personaje.nombre;
        document.getElementById('personajeGenero').value = personaje.genero;
        document.getElementById('personajeEdad').value = personaje.edad;
    } else {
        document.getElementById('modalPersonajeTitulo').textContent = '👤 Nuevo Personaje';
        document.getElementById('personajeId').value = '';
        document.getElementById('personajeNombre').value = '';
        document.getElementById('personajeGenero').value = 'masculino';
        document.getElementById('personajeEdad').value = '';
    }
    
    document.getElementById('modalPersonaje').classList.add('active');
}

function mostrarModalRelacion(personaje) {
    if (!obraActual) return;
    
    document.getElementById('relacionOrigenId').value = personaje.id;
    
    const select = document.getElementById('personajeDestino');
    select.innerHTML = '<option value="">Seleccionar...</option>';
    
    obraActual.personajes.forEach(p => {
        if (p.id !== personaje.id) {
            select.innerHTML += `<option value="${p.id}">${p.nombre}</option>`;
        }
    });
    
    document.getElementById('modalRelacion').classList.add('active');
}

function cerrarModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
}

// Guardar obra
function guardarObra() {
    const titulo = document.getElementById('obraTitulo').value;
    if (!titulo) {
        alert('El título es obligatorio');
        return;
    }

    const nuevaObra = {
        id: Date.now().toString(),
        titulo,
        genero: document.getElementById('obraGenero').value,
        personajes: []
    };

    obras.push(nuevaObra);
    localStorage.setItem('obras', JSON.stringify(obras));
    
    document.getElementById('obraTitulo').value = '';
    document.getElementById('obraGenero').value = '';
    
    cerrarModal('modalObra');
    mostrarObras();
}

// Guardar personaje
function guardarPersonaje() {
    const id = document.getElementById('personajeId').value;
    const nombre = document.getElementById('personajeNombre').value;
    
    if (!nombre) {
        alert('El nombre es obligatorio');
        return;
    }

    if (id) {
        const personaje = obraActual.personajes.find(p => p.id === id);
        personaje.nombre = nombre;
        personaje.genero = document.getElementById('personajeGenero').value;
        personaje.edad = document.getElementById('personajeEdad').value;
    } else {
        const nuevoPersonaje = {
            id: Date.now().toString(),
            nombre,
            genero: document.getElementById('personajeGenero').value,
            edad: document.getElementById('personajeEdad').value,
            relaciones: []
        };
        
        if (!obraActual.personajes) obraActual.personajes = [];
        obraActual.personajes.push(nuevoPersonaje);
    }
    
    const index = obras.findIndex(o => o.id === obraActual.id);
    obras[index] = obraActual;
    localStorage.setItem('obras', JSON.stringify(obras));
    
    cerrarModal('modalPersonaje');
    mostrarPersonajes();
}

// Guardar relación
function guardarRelacion() {
    const origenId = document.getElementById('relacionOrigenId').value;
    const destinoId = document.getElementById('personajeDestino').value;
    const tipo = document.getElementById('tipoRelacion').value;
    
    if (!destinoId) {
        alert('Selecciona un personaje');
        return;
    }
    
    const origen = obraActual.personajes.find(p => p.id === origenId);
    
    if (!origen.relaciones) {
        origen.relaciones = [];
    }
    
    origen.relaciones.push({
        con: destinoId,
        tipo: tipo
    });
    
    const index = obras.findIndex(o => o.id === obraActual.id);
    obras[index] = obraActual;
    localStorage.setItem('obras', JSON.stringify(obras));
    
    cerrarModal('modalRelacion');
    mostrarPersonajes();
}

// Eliminar
function confirmarEliminarObra(obraId) {
    elementoAEliminar = { tipo: 'obra', id: obraId };
    document.getElementById('confirmarMensaje').textContent = '¿Eliminar esta obra?';
    document.getElementById('modalConfirmar').classList.add('active');
}

function confirmarEliminarPersonaje(personajeId) {
    elementoAEliminar = { tipo: 'personaje', id: personajeId };
    document.getElementById('confirmarMensaje').textContent = '¿Eliminar este personaje?';
    document.getElementById('modalConfirmar').classList.add('active');
}

function ejecutarEliminar() {
    if (elementoAEliminar.tipo === 'obra') {
        obras = obras.filter(o => o.id !== elementoAEliminar.id);
        localStorage.setItem('obras', JSON.stringify(obras));
        mostrarObras();
        if (obraActual?.id === elementoAEliminar.id) {
            cerrarObraWindow();
        }
    } else if (elementoAEliminar.tipo === 'personaje') {
        obraActual.personajes = obraActual.personajes.filter(p => p.id !== elementoAEliminar.id);
        
        obraActual.personajes.forEach(p => {
            if (p.relaciones) {
                p.relaciones = p.relaciones.filter(r => r.con !== elementoAEliminar.id);
            }
        });
        
        const index = obras.findIndex(o => o.id === obraActual.id);
        obras[index] = obraActual;
        localStorage.setItem('obras', JSON.stringify(obras));
        
        mostrarPersonajes();
    }
    
    cerrarModal('modalConfirmar');
    elementoAEliminar = null;
}

// Cambiar tabs
function cambiarTab(tab) {
    tabActual = tab;
    
    document.querySelectorAll('.tab').forEach((t, i) => {
        t.classList.toggle('active', i === (tab === 'personajes' ? 0 : 1));
    });
    
    document.getElementById('tabPersonajes').style.display = tab === 'personajes' ? 'block' : 'none';
    document.getElementById('tabMapa').style.display = tab === 'mapa' ? 'block' : 'none';
    
    if (tab === 'personajes') mostrarPersonajes();
    if (tab === 'mapa') mostrarMapa();
}

// Mostrar personajes
function mostrarPersonajes() {
    const grid = document.getElementById('personajesGrid');
    if (!obraActual?.personajes?.length) {
        grid.innerHTML = '<div class="empty-message">👤 No hay personajes</div>';
        return;
    }
    
    grid.innerHTML = obraActual.personajes.map(personaje => {
        const personajeStr = JSON.stringify(personaje).replace(/'/g, "\\'").replace(/"/g, '&quot;');
        return `
        <div class="personaje-card ${personaje.genero}">
            <div class="personaje-actions">
                <button class="btn-icon" onclick='mostrarModalPersonaje(${personajeStr})'>✏️</button>
            </div>
            <h4>${personaje.nombre}</h4>
            <p>🎂 ${personaje.edad || '?'} años</p>
            <p>🔗 ${personaje.relaciones?.length || 0} relaciones</p>
            <button class="btn-relacion" onclick='mostrarModalRelacion(${personajeStr})'>+ Relación</button>
            <button class="btn-delete-personaje" onclick='confirmarEliminarPersonaje("${personaje.id}")'>Eliminar</button>
        </div>
    `}).join('');
}

// Función para obtener color según tipo de relación
function getColorRelacion(tipo) {
    const familiares = ['padre', 'madre', 'hijo', 'hija', 'hermano', 'hermana'];
    const parejas = ['esposo', 'esposa', 'novio', 'novia', 'amante'];
    const amistad = ['amigo', 'amiga'];
    const enemistad = ['enemigo', 'enemiga'];
    
    if (familiares.includes(tipo)) return '#48bb78';
    if (parejas.includes(tipo)) return '#ed64a6';
    if (amistad.includes(tipo)) return '#4299e1';
    if (enemistad.includes(tipo)) return '#f56565';
    return '#718096';
}

// Mostrar mapa de relaciones
function mostrarMapa() {
    const container = document.getElementById('mapaContainer');
    if (!obraActual?.personajes?.length) {
        container.innerHTML = '<div class="empty-message">No hay personajes para mostrar</div>';
        return;
    }
    
    container.innerHTML = '';
    nodos = [];
    lineas = [];
    
    const width = container.clientWidth || 800;
    const height = 600;
    
    // Posiciones iniciales en círculo
    const centroX = width / 2;
    const centroY = height / 2;
    const radio = Math.min(width, height) * 0.3;
    
    obraActual.personajes.forEach((personaje, index) => {
        const angulo = (index / obraActual.personajes.length) * Math.PI * 2;
        const x = centroX + radio * Math.cos(angulo);
        const y = centroY + radio * Math.sin(angulo);
        
        const nodo = crearNodo(personaje, x, y);
        container.appendChild(nodo);
        nodos.push(nodo);
    });
    
    // Crear líneas de relaciones
    obraActual.personajes.forEach(personaje => {
        if (personaje.relaciones) {
            personaje.relaciones.forEach(rel => {
                const origen = nodos.find(n => n.dataset.id === personaje.id);
                const destino = nodos.find(n => n.dataset.id === rel.con);
                
                if (origen && destino) {
                    const linea = crearLinea(origen, destino, rel.tipo);
                    container.appendChild(linea);
                    lineas.push(linea);
                }
            });
        }
    });
}

// Crear nodo de personaje
function crearNodo(personaje, x, y) {
    const div = document.createElement('div');
    div.className = `nodo-personaje ${personaje.genero}`;
    div.dataset.id = personaje.id;
    div.style.left = (x - 50) + 'px';
    div.style.top = (y - 40) + 'px';
    
    div.innerHTML = `
        <div class="icono ${personaje.genero}">👤</div>
        <div class="nombre">${personaje.nombre}</div>
        <div class="edad">${personaje.edad || '?'} años</div>
    `;
    
    // Hacer arrastrable
    div.addEventListener('mousedown', iniciarArrastre);
    
    return div;
}

// Crear línea entre nodos
function crearLinea(origen, destino, tipo) {
    const linea = document.createElement('div');
    linea.className = 'linea-relacion';
    
    const rect1 = origen.getBoundingClientRect();
    const rect2 = destino.getBoundingClientRect();
    const container = document.getElementById('mapaContainer').getBoundingClientRect();
    
    const x1 = rect1.left + rect1.width/2 - container.left;
    const y1 = rect1.top + rect1.height/2 - container.top;
    const x2 = rect2.left + rect2.width/2 - container.left;
    const y2 = rect2.top + rect2.height/2 - container.top;
    
    const distancia = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
    const angulo = Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;
    
    linea.style.width = distancia + 'px';
    linea.style.left = x1 + 'px';
    linea.style.top = y1 + 'px';
    linea.style.transform = `rotate(${angulo}deg)`;
    linea.style.background = getColorRelacion(tipo);
    linea.dataset.tipo = tipo;
    
    // Tooltip al hover
    linea.addEventListener('mouseenter', (e) => {
        const tooltip = document.createElement('div');
        tooltip.className = 'tooltip';
        tooltip.textContent = tipo;
        tooltip.style.left = e.pageX + 'px';
        tooltip.style.top = (e.pageY - 30) + 'px';
        document.body.appendChild(tooltip);
        
        linea.addEventListener('mouseleave', () => {
            document.querySelector('.tooltip')?.remove();
        });
    });
    
    return linea;
}

// Iniciar arrastre
function iniciarArrastre(e) {
    arrastrando = e.target.closest('.nodo-personaje');
    if (!arrastrando) return;
    
    const rect = arrastrando.getBoundingClientRect();
    offsetX = e.clientX - rect.left;
    offsetY = e.clientY - rect.top;
    
    document.addEventListener('mousemove', arrastrar);
    document.addEventListener('mouseup', detenerArrastre);
}

// Arrastrar nodo
function arrastrar(e) {
    if (!arrastrando) return;
    
    const container = document.getElementById('mapaContainer');
    const containerRect = container.getBoundingClientRect();
    
    let x = e.clientX - containerRect.left - offsetX;
    let y = e.clientY - containerRect.top - offsetY;
    
    // Limitar al contenedor
    x = Math.max(0, Math.min(x, containerRect.width - arrastrando.offsetWidth));
    y = Math.max(0, Math.min(y, containerRect.height - arrastrando.offsetHeight));
    
    arrastrando.style.left = x + 'px';
    arrastrando.style.top = y + 'px';
    
    // Actualizar líneas
    actualizarLineas();
}

// Detener arrastre
function detenerArrastre() {
    arrastrando = null;
    document.removeEventListener('mousemove', arrastrar);
    document.removeEventListener('mouseup', detenerArrastre);
}

// Actualizar líneas después de mover nodos
function actualizarLineas() {
    lineas.forEach(linea => linea.remove());
    lineas = [];
    
    obraActual.personajes.forEach(personaje => {
        if (personaje.relaciones) {
            personaje.relaciones.forEach(rel => {
                const origen = nodos.find(n => n.dataset.id === personaje.id);
                const destino = nodos.find(n => n.dataset.id === rel.con);
                
                if (origen && destino) {
                    const linea = crearLinea(origen, destino, rel.tipo);
                    document.getElementById('mapaContainer').appendChild(linea);
                    lineas.push(linea);
                }
            });
        }
    });
}

// Reorganizar mapa en círculo
function reorganizarMapa() {
    const container = document.getElementById('mapaContainer');
    const width = container.clientWidth || 800;
    const height = 600;
    
    const centroX = width / 2;
    const centroY = height / 2;
    const radio = Math.min(width, height) * 0.3;
    
    nodos.forEach((nodo, index) => {
        const angulo = (index / nodos.length) * Math.PI * 2;
        const x = centroX + radio * Math.cos(angulo) - nodo.offsetWidth/2;
        const y = centroY + radio * Math.sin(angulo) - nodo.offsetHeight/2;
        
        nodo.style.left = x + 'px';
        nodo.style.top = y + 'px';
    });
    
    actualizarLineas();
}

// Inicializar
mostrarObras();

// Cerrar modales al hacer click fuera
window.onclick = function(event) {
    if (event.target.classList.contains('modal')) {
        event.target.classList.remove('active');
    }
};

// Ajustar mapa al cambiar tamaño
window.addEventListener('resize', () => {
    if (tabActual === 'mapa' && obraActual?.personajes?.length) {
        reorganizarMapa();
    }
});
