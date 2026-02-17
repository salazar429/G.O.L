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
    const destino = obraActual.personajes.find(p => p.id === destinoId);
    
    // Verificar que no sea una relación consigo mismo
    if (origenId === destinoId) {
        alert('No puedes relacionar un personaje consigo mismo');
        return;
    }
    
    // Inicializar array de relaciones si no existe
    if (!origen.relaciones) {
        origen.relaciones = [];
    }
    
    // Verificar si ya existe esta relación
    const relacionExistente = origen.relaciones.find(r => r.con === destinoId);
    if (relacionExistente) {
        alert('Esta relación ya existe');
        return;
    }
    
    // Añadir la relación
    origen.relaciones.push({
        con: destinoId,
        tipo: tipo
    });
    
    // Si es una relación de pareja (esposo/esposa/novio/novia/amante), añadir también la relación inversa
    if (tipo === 'esposo' || tipo === 'esposa' || tipo === 'novio' || tipo === 'novia' || tipo === 'amante') {
        if (!destino.relaciones) {
            destino.relaciones = [];
        }
        
        // Determinar el tipo inverso
        let tipoInverso = tipo;
        if (tipo === 'esposo') tipoInverso = 'esposa';
        else if (tipo === 'esposa') tipoInverso = 'esposo';
        else if (tipo === 'novio') tipoInverso = 'novia';
        else if (tipo === 'novia') tipoInverso = 'novio';
        
        destino.relaciones.push({
            con: origenId,
            tipo: tipoInverso
        });
    }
    
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
        // Eliminar el personaje
        obraActual.personajes = obraActual.personajes.filter(p => p.id !== elementoAEliminar.id);
        
        // Eliminar relaciones que apuntaban a este personaje
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

// Función para obtener el color según el tipo de relación
function getColorRelacion(tipo) {
    if (tipo === 'padre' || tipo === 'madre') return '#48bb78'; // Verde
    if (tipo === 'hermano' || tipo === 'hermana') return '#4299e1'; // Azul
    if (tipo === 'esposo' || tipo === 'esposa' || tipo === 'novio' || tipo === 'novia' || tipo === 'amante') return '#ed64a6'; // Rosa
    return '#718096'; // Gris
}

// Mostrar árbol genealógico
function mostrarArbol() {
    const contenedor = document.getElementById('arbolGenealogico');
    if (!obraActual?.personajes?.length) {
        contenedor.innerHTML = '<div class="empty-message">No hay personajes</div>';
        return;
    }
    
    let html = '<div class="arbol">';
    
    // Crear un mapa de relaciones para fácil acceso
    const relacionesMap = {};
    obraActual.personajes.forEach(p => {
        relacionesMap[p.id] = p.relaciones || [];
    });
    
    // Encontrar familias (grupos conectados por relaciones)
    const familias = [];
    const visitados = new Set();
    
    obraActual.personajes.forEach(personaje => {
        if (visitados.has(personaje.id)) return;
        
        // BFS para encontrar todos los conectados
        const cola = [personaje];
        const familia = new Set();
        familia.add(personaje.id);
        
        while (cola.length > 0) {
            const actual = cola.shift();
            visitados.add(actual.id);
            
            // Buscar relacionados
            if (relacionesMap[actual.id]) {
                relacionesMap[actual.id].forEach(rel => {
                    if (!familia.has(rel.con)) {
                        familia.add(rel.con);
                        const relacionado = obraActual.personajes.find(p => p.id === rel.con);
                        if (relacionado && !visitados.has(relacionado.id)) {
                            cola.push(relacionado);
                        }
                    }
                });
            }
        }
        
        familias.push(Array.from(familia).map(id => obraActual.personajes.find(p => p.id === id)));
    });
    
    // Mostrar cada familia
    familias.forEach((familia, index) => {
        html += `<div class="familia" style="margin-bottom: 40px;">`;
        html += `<h3 style="color: white; margin-bottom: 20px;">Familia ${index + 1}</h3>`;
        
        // Encontrar padres (personajes que tienen hijos)
        const padres = familia.filter(p => 
            relacionesMap[p.id]?.some(r => r.tipo === 'padre' || r.tipo === 'madre')
        );
        
        // Encontrar hijos (personajes que tienen padres)
        const hijos = familia.filter(p => {
            // Verificar si alguien es padre/madre de este personaje
            return familia.some(otro => 
                relacionesMap[otro.id]?.some(r => 
                    (r.tipo === 'padre' || r.tipo === 'madre') && r.con === p.id
                )
            );
        });
        
        // Encontrar parejas
        const parejas = [];
        familia.forEach(p => {
            relacionesMap[p.id]?.forEach(r => {
                if (r.tipo === 'esposo' || r.tipo === 'esposa' || r.tipo === 'novio' || r.tipo === 'novia' || r.tipo === 'amante') {
                    if (p.id < r.con) { // Evitar duplicados
                        const pareja = familia.find(f => f.id === r.con);
                        if (pareja) {
                            parejas.push({ p1: p, p2: pareja, tipo: r.tipo });
                        }
                    }
                }
            });
        });
        
        // Mostrar generación de padres
        if (padres.length > 0) {
            html += '<div class="generacion">';
            padres.forEach(p => {
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
        
        // Mostrar parejas
        if (parejas.length > 0) {
            html += '<div class="generacion">';
            parejas.forEach(({p1, p2, tipo}) => {
                html += `
                    <div style="display: flex; gap: 10px; align-items: center;">
                        <div class="personaje-nodo ${p1.genero}">
                            <div class="icono ${p1.genero}">👤</div>
                            <div class="nombre">${p1.nombre}</div>
                            <div class="edad">${p1.edad || '?'}</div>
                        </div>
                        <div style="color: ${getColorRelacion(tipo)}; font-weight: bold;">❤️</div>
                        <div class="personaje-nodo ${p2.genero}">
                            <div class="icono ${p2.genero}">👤</div>
                            <div class="nombre">${p2.nombre}</div>
                            <div class="edad">${p2.edad || '?'}</div>
                        </div>
                    </div>
                `;
            });
            html += '</div>';
        }
        
        // Mostrar generación de hijos
        if (hijos.length > 0) {
            html += '<div class="generacion">';
            
            // Agrupar hijos por padres
            hijos.forEach(h => {
                // Encontrar padres de este hijo
                const padresDelHijo = familia.filter(p => 
                    relacionesMap[p.id]?.some(r => 
                        (r.tipo === 'padre' || r.tipo === 'madre') && r.con === h.id
                    )
                );
                
                // Encontrar hermanos (personajes que comparten al menos un padre)
                const hermanos = hijos.filter(her => {
                    if (her.id === h.id) return false;
                    
                    // Verificar si comparten algún padre
                    return padresDelHijo.some(p => 
                        relacionesMap[p.id]?.some(r => 
                            (r.tipo === 'padre' || r.tipo === 'madre') && r.con === her.id
                        )
                    );
                });
                
                html += `
                    <div class="personaje-nodo ${h.genero}" style="position: relative;">
                        <div class="icono ${h.genero}">👤</div>
                        <div class="nombre">${h.nombre}</div>
                        <div class="edad">${h.edad || '?'}</div>
                `;
                
                // Línea a padres
                if (padresDelHijo.length > 0) {
                    html += `<div class="linea-padre" style="background: #48bb78;"></div>`;
                }
                
                // Línea a hermanos (solo si hay hermanos)
                if (hermanos.length > 0) {
                    html += `<div class="linea-hermano" style="background: #4299e1;"></div>`;
                }
                
                html += '</div>';
            });
            
            html += '</div>';
        }
        
        html += '</div>';
    });
    
    // Personajes sin relaciones
    const solitarios = obraActual.personajes.filter(p => {
        return !relacionesMap[p.id] || relacionesMap[p.id].length === 0;
    });
    
    if (solitarios.length > 0) {
        html += '<div class="familia">';
        html += '<h3 style="color: white; margin-bottom: 20px;">Personajes sin relaciones</h3>';
        html += '<div class="generacion">';
        solitarios.forEach(p => {
            html += `
                <div class="personaje-nodo ${p.genero}">
                    <div class="icono ${p.genero}">👤</div>
                    <div class="nombre">${p.nombre}</div>
                    <div class="edad">${p.edad || '?'}</div>
                </div>
            `;
        });
        html += '</div></div>';
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
