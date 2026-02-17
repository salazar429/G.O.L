// Variables globales
let obras = JSON.parse(localStorage.getItem('obras')) || [];
let obraActual = null;
let tabActual = 'personajes';
let personajeSeleccionado = null;
let relacionTemporal = {};
let elementoAEliminar = null;
let personajeFoco = null; // Para el árbol: personaje en foco

// Cargar splash y luego mostrar app
document.addEventListener('DOMContentLoaded', () => {
    // Cargar splash
    fetch('splash.html')
        .then(response => response.text())
        .then(html => {
            document.getElementById('splash-container').innerHTML = html;
            
            // Ocultar splash después de 2 segundos
            setTimeout(() => {
                document.getElementById('splash-container').style.display = 'none';
                document.getElementById('appContainer').style.display = 'block';
            }, 2000);
        });
    
    mostrarObras();
});

// Mostrar obras
function mostrarObras() {
    const grid = document.getElementById('obrasGrid');
    if (obras.length === 0) {
        grid.innerHTML = '<div class="empty-message"><span style="font-size: 48px;">📚</span><br>No hay obras. ¡Crea la primera!</div>';
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

// Eliminar obra
function confirmarEliminarObra(obraId) {
    elementoAEliminar = { tipo: 'obra', id: obraId };
    document.getElementById('confirmarMensaje').textContent = '¿Estás seguro de eliminar esta obra? Se eliminarán todos sus personajes.';
    document.getElementById('modalConfirmar').classList.add('active');
}

// Abrir obra
function abrirObra(obraId) {
    obraActual = obras.find(o => o.id === obraId);
    personajeFoco = null; // Resetear foco al abrir obra
    document.getElementById('obraTituloWindow').textContent = `📖 ${obraActual.titulo}`;
    document.getElementById('obraWindow').classList.add('active');
    mostrarPersonajes();
    mostrarLeyenda();
}

function cerrarObraWindow() {
    document.getElementById('obraWindow').classList.remove('active');
    obraActual = null;
    personajeFoco = null;
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
        document.getElementById('personajeDescripcion').value = personaje.descripcion;
    } else {
        document.getElementById('modalPersonajeTitulo').textContent = '👤 Nuevo Personaje';
        document.getElementById('personajeId').value = '';
        document.getElementById('personajeNombre').value = '';
        document.getElementById('personajeGenero').value = 'masculino';
        document.getElementById('personajeEdad').value = '';
        document.getElementById('personajeDescripcion').value = '';
    }
    
    document.getElementById('modalPersonaje').classList.add('active');
}

function mostrarModalRelacion(personaje) {
    personajeSeleccionado = personaje;
    relacionTemporal = {};
    
    document.getElementById('relacionPaso1').style.display = 'block';
    document.getElementById('relacionPaso2').style.display = 'none';
    
    const otrosPersonajes = obraActual.personajes.filter(p => p.id !== personaje.id);
    
    if (otrosPersonajes.length === 0) {
        alert('No hay otros personajes. Crea más personajes primero.');
        return;
    }
    
    const selector = document.getElementById('selectorPersonajes');
    selector.innerHTML = otrosPersonajes.map(p => `
        <div class="personaje-opcion ${p.genero}" onclick="seleccionarPersonajeRelacion('${p.id}')">
            <strong>${p.nombre}</strong><br>
            <small>${p.genero}</small>
        </div>
    `).join('');
    
    document.getElementById('modalRelacion').classList.add('active');
}

function seleccionarPersonajeRelacion(personajeId) {
    relacionTemporal.con = personajeId;
    const personajeDestino = obraActual.personajes.find(p => p.id === personajeId);
    
    document.getElementById('relacionPaso1').style.display = 'none';
    document.getElementById('relacionPaso2').style.display = 'block';
    
    const titulo = document.getElementById('relacionTituloPaso2');
    titulo.innerHTML = `¿Qué relación tiene <strong style="color: #667eea;">${personajeSeleccionado.nombre}</strong> con <strong style="color: #667eea;">${personajeDestino.nombre}</strong>?`;
    
    const select = document.getElementById('tipoRelacion');
    select.innerHTML = '';
    
    const opciones = personajeSeleccionado.genero === 'masculino' ? [
        ['padre', '👨 Padre'],
        ['hermano', '🤝 Hermano'],
        ['hijo', '🧒 Hijo'],
        ['esposo', '💍 Esposo'],
        ['novio', '💕 Novio'],
        ['amante', '💔 Amante'],
        ['amigo', '😊 Amigo'],
        ['enemigo', '⚔️ Enemigo'],
        ['tio', '👨‍👦 Tío'],
        ['abuelo', '👴 Abuelo'],
        ['primo', '👥 Primo']
    ] : [
        ['madre', '👩 Madre'],
        ['hermana', '🤝 Hermana'],
        ['hija', '👧 Hija'],
        ['esposa', '💍 Esposa'],
        ['novia', '💕 Novia'],
        ['amante', '💔 Amante'],
        ['amiga', '😊 Amiga'],
        ['enemiga', '⚔️ Enemiga'],
        ['tia', '👩‍👧 Tía'],
        ['abuela', '👵 Abuela'],
        ['prima', '👥 Prima']
    ];
    
    opciones.forEach(([valor, texto]) => {
        const option = document.createElement('option');
        option.value = valor;
        option.textContent = texto;
        select.appendChild(option);
    });
}

function guardarRelacion() {
    const tipo = document.getElementById('tipoRelacion').value;
    
    if (!personajeSeleccionado.relaciones) {
        personajeSeleccionado.relaciones = [];
    }
    
    personajeSeleccionado.relaciones.push({
        con: relacionTemporal.con,
        tipo: tipo
    });
    
    const index = obras.findIndex(o => o.id === obraActual.id);
    obras[index] = obraActual;
    localStorage.setItem('obras', JSON.stringify(obras));
    
    cerrarModal('modalRelacion');
    
    mostrarPersonajes();
    if (tabActual === 'relaciones') mostrarRelaciones();
    if (tabActual === 'arbol') mostrarArbol();
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
        descripcion: document.getElementById('obraDescripcion').value,
        personajes: [],
        fechaCreacion: new Date().toISOString()
    };

    obras.push(nuevaObra);
    localStorage.setItem('obras', JSON.stringify(obras));
    
    document.getElementById('obraTitulo').value = '';
    document.getElementById('obraGenero').value = '';
    document.getElementById('obraDescripcion').value = '';
    
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
        personaje.descripcion = document.getElementById('personajeDescripcion').value;
    } else {
        const nuevoPersonaje = {
            id: Date.now().toString(),
            nombre,
            genero: document.getElementById('personajeGenero').value,
            edad: document.getElementById('personajeEdad').value,
            descripcion: document.getElementById('personajeDescripcion').value,
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
    
    document.getElementById('personajeId').value = '';
    document.getElementById('personajeNombre').value = '';
}

// Eliminar personaje
function confirmarEliminarPersonaje(personajeId) {
    elementoAEliminar = { tipo: 'personaje', id: personajeId };
    document.getElementById('confirmarMensaje').textContent = '¿Estás seguro de eliminar este personaje?';
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
        if (tabActual === 'relaciones') mostrarRelaciones();
        if (tabActual === 'arbol') mostrarArbol();
    }
    
    cerrarModal('modalConfirmar');
    elementoAEliminar = null;
}

// Cambiar tabs
function cambiarTab(tab) {
    tabActual = tab;
    document.querySelectorAll('.tab').forEach((t, i) => {
        t.classList.toggle('active', 
            (i === 0 && tab === 'personajes') ||
            (i === 1 && tab === 'relaciones') ||
            (i === 2 && tab === 'arbol')
        );
    });

    document.getElementById('tabPersonajes').style.display = tab === 'personajes' ? 'block' : 'none';
    document.getElementById('tabRelaciones').style.display = tab === 'relaciones' ? 'block' : 'none';
    document.getElementById('tabArbol').style.display = tab === 'arbol' ? 'block' : 'none';

    if (tab === 'personajes') mostrarPersonajes();
    if (tab === 'relaciones') mostrarRelaciones();
    if (tab === 'arbol') mostrarArbol();
}

// Mostrar personajes
function mostrarPersonajes() {
    const grid = document.getElementById('personajesGrid');
    if (!obraActual?.personajes?.length) {
        grid.innerHTML = '<div class="empty-message"><span style="font-size: 48px;">👤</span><br>No hay personajes. ¡Crea el primero!</div>';
        return;
    }

    grid.innerHTML = obraActual.personajes.map(personaje => {
        const personajeStr = JSON.stringify(personaje).replace(/"/g, '&quot;');
        return `
        <div class="personaje-card ${personaje.genero}">
            <div class="personaje-actions">
                <button class="btn-icon" onclick='mostrarModalPersonaje(${personajeStr})'>✏️</button>
            </div>
            <h4>${personaje.nombre}</h4>
            <p>🎂 ${personaje.edad || '?'} años</p>
            <p>📝 ${personaje.descripcion || 'Sin descripción'}</p>
            <span class="genero-badge ${personaje.genero}">
                ${personaje.genero === 'masculino' ? '👨 Hombre' : '👩 Mujer'}
            </span>
            <button class="btn-relacion" onclick='mostrarModalRelacion(${personajeStr})'>+ Relación</button>
            <button class="btn-delete-personaje" onclick='confirmarEliminarPersonaje("${personaje.id}")'>Eliminar</button>
        </div>
    `}).join('');
}

// Mostrar relaciones
function mostrarRelaciones() {
    const container = document.getElementById('relacionesList');
    if (!obraActual?.personajes?.length) {
        container.innerHTML = '<div class="empty-message">No hay personajes</div>';
        return;
    }

    let relacionesEncontradas = false;
    let html = '<div style="display: flex; flex-direction: column; gap: 15px;">';
    
    obraActual.personajes.forEach(p => {
        if (p.relaciones?.length) {
            p.relaciones.forEach(r => {
                const destino = obraActual.personajes.find(d => d.id === r.con);
                if (destino) {
                    relacionesEncontradas = true;
                    html += `
                        <div class="personaje-card" style="margin-bottom: 0;">
                            <div style="display: flex; align-items: center; justify-content: space-between;">
                                <div style="flex: 1; text-align: center;">
                                    <strong>${p.nombre}</strong>
                                </div>
                                <div style="flex: 0 0 auto; padding: 0 20px;">
                                    <span style="background: #e2e8f0; padding: 5px 10px; border-radius: 15px;">
                                        ${r.tipo}
                                    </span>
                                </div>
                                <div style="flex: 1; text-align: center;">
                                    <strong>${destino.nombre}</strong>
                                </div>
                            </div>
                        </div>
                    `;
                }
            });
        }
    });
    
    html += '</div>';
    container.innerHTML = relacionesEncontradas ? html : '<div class="empty-message">No hay relaciones definidas</div>';
}

// Mostrar leyenda
function mostrarLeyenda() {
    const leyenda = document.getElementById('leyendaArbol');
    leyenda.innerHTML = `
        <div class="leyenda-item">
            <div class="color-box" style="background: #48bb78;"></div>
            <span>Familiar (línea sólida)</span>
        </div>
        <div class="leyenda-item">
            <div class="color-box" style="background: #ed64a6;"></div>
            <span>Pareja (línea sólida)</span>
        </div>
        <div class="leyenda-item">
            <div class="linea-muestra punteada" style="border-color: #4299e1;"></div>
            <span>Amistad (línea punteada)</span>
        </div>
        <div class="leyenda-item">
            <div class="linea-muestra punteada" style="border-color: #f56565;"></div>
            <span>Enemistad (línea punteada)</span>
        </div>
        <div class="leyenda-item">
            <div class="linea-muestra punteada" style="border-color: #718096;"></div>
            <span>Otras (línea punteada)</span>
        </div>
        <div class="leyenda-item">
            <span style="font-size: 12px;">👆 Click en personaje para ver sus relaciones</span>
        </div>
        <div class="leyenda-item">
            <span style="font-size: 12px;">👆 Doble click para volver a vista general</span>
        </div>
    `;
}

// Obtener clase CSS según tipo de relación
function getClasePorRelacion(tipo) {
    const familiares = ['padre', 'madre', 'hijo', 'hija', 'hermano', 'hermana', 'tio', 'tia', 'abuelo', 'abuela', 'primo', 'prima'];
    const parejas = ['esposo', 'esposa', 'novio', 'novia', 'amante'];
    const amistad = ['amigo', 'amiga'];
    const enemistad = ['enemigo', 'enemiga'];
    
    if (familiares.includes(tipo)) return 'linea-familiar';
    if (parejas.includes(tipo)) return 'linea-pareja';
    if (amistad.includes(tipo)) return 'linea-amistad';
    if (enemistad.includes(tipo)) return 'linea-enemistad';
    return 'linea-default';
}

// Mostrar árbol de relaciones
function mostrarArbol() {
    const contenedor = document.getElementById('arbolGenealogico');
    if (!obraActual?.personajes?.length) {
        contenedor.innerHTML = '<div class="empty-message">No hay personajes</div>';
        return;
    }

    let personajesAMostrar = personajeFoco ? 
        [personajeFoco, ...obtenerRelacionados(personajeFoco)] : 
        obraActual.personajes;

    let html = '<div class="red-relaciones">';
    
    if (personajeFoco) {
        html += `<div style="text-align: center; color: white; margin-bottom: 20px;">
            Mostrando relaciones de <strong>${personajeFoco.nombre}</strong> 
            <button class="btn-back" style="display: inline-block; width: auto; margin-left: 10px;" onclick="personajeFoco=null; mostrarArbol()">Ver todos</button>
        </div>`;
    }
    
    // Mostrar cada personaje con sus conexiones
    personajesAMostrar.forEach(personaje => {
        if (!personaje) return;
        
        html += `
            <div class="nodo-principal">
                <div class="personaje-icono ${personaje.genero}" 
                     onclick="seleccionarEnArbol('${personaje.id}')"
                     ondblclick="enfocarPersonaje('${personaje.id}')">
                    <div class="icono-persona ${personaje.genero}">👤</div>
                    <div class="nombre">${personaje.nombre}</div>
                    <div class="edad">${personaje.edad || '?'} años</div>
                </div>
            </div>
        `;
        
        if (personaje.relaciones?.length) {
            html += '<div class="conexiones-grid">';
            
            personaje.relaciones.forEach(rel => {
                const destino = obraActual.personajes.find(p => p.id === rel.con);
                if (destino && (!personajeFoco || personajeFoco.id === personaje.id || personajeFoco.id === destino.id)) {
                    const claseLinea = getClasePorRelacion(rel.tipo);
                    
                    html += `
                        <div class="relacion-grupo">
                            <div class="linea-vertical ${claseLinea}"></div>
                            <div class="linea-horizontal-container">
                                <div class="linea-horizontal ${claseLinea}"></div>
                                <span style="color: white; background: #4a5568; padding: 3px 8px; border-radius: 12px; font-size: 12px;">
                                    ${rel.tipo}
                                </span>
                                <div class="linea-horizontal ${claseLinea}"></div>
                            </div>
                            <div class="personaje-icono ${destino.genero}" 
                                 onclick="seleccionarEnArbol('${destino.id}')"
                                 ondblclick="enfocarPersonaje('${destino.id}')">
                                <div class="icono-persona ${destino.genero}">👤</div>
                                <div class="nombre">${destino.nombre}</div>
                                <div class="edad">${destino.edad || '?'} años</div>
                            </div>
                        </div>
                    `;
                }
            });
            
            html += '</div>';
        }
        
        html += '<div style="border-bottom: 2px dashed #4a5568; margin: 30px 0;"></div>';
    });
    
    html += '</div>';
    contenedor.innerHTML = html;
}

// Obtener personajes relacionados con uno dado
function obtenerRelacionados(personaje) {
    const relacionados = new Set();
    if (!personaje.relaciones) return [];
    
    personaje.relaciones.forEach(rel => {
        const destino = obraActual.personajes.find(p => p.id === rel.con);
        if (destino) relacionados.add(destino);
    });
    
    obraActual.personajes.forEach(p => {
        if (p.relaciones) {
            p.relaciones.forEach(rel => {
                if (rel.con === personaje.id) {
                    relacionados.add(p);
                }
            });
        }
    });
    
    return Array.from(relacionados);
}

// Enfocar un personaje en el árbol
function enfocarPersonaje(personajeId) {
    personajeFoco = obraActual.personajes.find(p => p.id === personajeId);
    mostrarArbol();
}

function seleccionarEnArbol(personajeId) {
    document.querySelectorAll('.personaje-icono').forEach(n => {
        n.classList.remove('seleccionado');
    });
    event.currentTarget.classList.add('seleccionado');
}

// Cerrar modales al hacer click fuera
window.onclick = function(event) {
    if (event.target.classList.contains('modal')) {
        event.target.classList.remove('active');
    }
};
