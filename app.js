// Variables globales
let obras = JSON.parse(localStorage.getItem('obras')) || [];
let obraActual = null;
let tabActual = 'personajes';
let elementoAEliminar = null;

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
    document.getElementById('tabArbol').style.display = tab === 'arbol' ? 'block' : 'none';
    
    if (tab === 'personajes') mostrarPersonajes();
    if (tab === 'arbol') mostrarArbol();
}

// Mostrar personajes
function mostrarPersonajes() {
    const grid = document.getElementById('personajesGrid');
    if (!obraActual?.personajes?.length) {
        grid.innerHTML = '<div class="empty-message">👤 No hay personajes</div>';
        return;
    }
    
    grid.innerHTML = obraActual.personajes.map(personaje => `
        <div class="personaje-card ${personaje.genero}">
            <div class="personaje-actions">
                <button class="btn-icon" onclick='mostrarModalPersonaje(${JSON.stringify(personaje).replace(/'/g, "\\'")})'>✏️</button>
            </div>
            <h4>${personaje.nombre}</h4>
            <p>🎂 ${personaje.edad || '?'} años</p>
            <button class="btn-relacion" onclick='mostrarModalRelacion(${JSON.stringify(personaje).replace(/'/g, "\\'")})'>+ Relación</button>
            <button class="btn-delete-personaje" onclick='confirmarEliminarPersonaje("${personaje.id}")'>Eliminar</button>
        </div>
    `).join('');
}

// Mostrar árbol genealógico
function mostrarArbol() {
    const contenedor = document.getElementById('arbolGenealogico');
    if (!obraActual?.personajes?.length) {
        contenedor.innerHTML = '<div class="empty-message">No hay personajes</div>';
        return;
    }
    
    // Encontrar padres (personajes que tienen hijos)
    const padres = new Set();
    const hijos = new Set();
    
    obraActual.personajes.forEach(p => {
        if (p.relaciones) {
            p.relaciones.forEach(r => {
                if (r.tipo === 'padre' || r.tipo === 'madre') {
                    padres.add(p.id);
                    hijos.add(r.con);
                }
            });
        }
    });
    
    let html = '<div class="familia">';
    
    // Generación de padres
    const padresArray = obraActual.personajes.filter(p => padres.has(p.id));
    if (padresArray.length > 0) {
        html += '<div class="generacion">';
        padresArray.forEach(p => {
            html += `
                <div class="personaje-nodo ${p.genero}">
                    <div class="icono ${p.genero}">👤</div>
                    <div class="nombre">${p.nombre}</div>
                    <div class="edad">${p.edad || '?'}</div>
                </div>
            `;
        });
        html += '</div>';
    }
    
    // Generación de hijos
    const hijosArray = obraActual.personajes.filter(p => hijos.has(p.id));
    if (hijosArray.length > 0) {
        html += '<div class="generacion">';
        hijosArray.forEach(h => {
            // Buscar padres de este hijo
            const padresDelHijo = obraActual.personajes.filter(p => 
                p.relaciones?.some(r => 
                    (r.tipo === 'padre' || r.tipo === 'madre') && r.con === h.id
                )
            );
            
            html += `
                <div class="personaje-nodo ${h.genero}">
                    <div class="icono ${h.genero}">👤</div>
                    <div class="nombre">${h.nombre}</div>
                    <div class="edad">${h.edad || '?'}</div>
            `;
            
            // Línea a padres
            if (padresDelHijo.length > 0) {
                html += '<div class="linea-padre"></div>';
            }
            
            // Línea entre hermanos
            const hermanos = hijosArray.filter(her => her.id !== h.id);
            if (hermanos.length > 0 && hijosArray.indexOf(h) < hijosArray.length - 1) {
                html += '<div class="linea-hermano"></div>';
            }
            
            html += '</div>';
        });
        html += '</div>';
    }
    
    // Personajes sin relaciones
    const solitarios = obraActual.personajes.filter(p => 
        !padres.has(p.id) && !hijos.has(p.id) && (!p.relaciones || p.relaciones.length === 0)
    );
    
    if (solitarios.length > 0) {
        html += '<div class="generacion">';
        html += '<div style="color: white; margin: 20px 0;">Personajes sin relaciones:</div>';
        solitarios.forEach(p => {
            html += `
                <div class="personaje-nodo ${p.genero}">
                    <div class="icono ${p.genero}">👤</div>
                    <div class="nombre">${p.nombre}</div>
                    <div class="edad">${p.edad || '?'}</div>
                </div>
            `;
        });
        html += '</div>';
    }
    
    html += '</div>';
    contenedor.innerHTML = html;
}

// Inicializar
mostrarObras();

// Cerrar modales al hacer click fuera
window.onclick = function(event) {
    if (event.target.classList.contains('modal')) {
        event.target.classList.remove('active');
    }
};
