// ============================================
// CONFIGURACIÓN INICIAL
// ============================================
let obras = JSON.parse(localStorage.getItem('obras')) || [];
let obraActual = null;
let itemToDelete = null;
let historial = JSON.parse(localStorage.getItem('historial')) || [];
let searchTerm = '';
let filterType = 'all';
let familiasExpandidas = {};

// ============================================
// RELACIONES Y SUS INVERSAS
// ============================================
const relacionesMap = {
    // Relaciones familiares directas
    'padre': { inversa: 'hijo', categoria: 'familiar', genero: 'masculino' },
    'madre': { inversa: 'hija', categoria: 'familiar', genero: 'femenino' },
    'hijo': { inversa: 'padre', categoria: 'familiar', genero: 'masculino' },
    'hija': { inversa: 'madre', categoria: 'familiar', genero: 'femenino' },
    
    // Hermanos
    'hermano': { inversa: 'hermano', categoria: 'hermano', genero: 'masculino' },
    'hermana': { inversa: 'hermana', categoria: 'hermana', genero: 'femenino' },
    
    // Tíos
    'tio': { inversa: 'sobrino', categoria: 'tio', genero: 'masculino' },
    'tia': { inversa: 'sobrina', categoria: 'tia', genero: 'femenino' },
    'sobrino': { inversa: 'tio', categoria: 'sobrino', genero: 'masculino' },
    'sobrina': { inversa: 'tia', categoria: 'sobrina', genero: 'femenino' },
    
    // Abuelos
    'abuelo': { inversa: 'nieto', categoria: 'abuelo', genero: 'masculino' },
    'abuela': { inversa: 'nieta', categoria: 'abuela', genero: 'femenino' },
    'nieto': { inversa: 'abuelo', categoria: 'nieto', genero: 'masculino' },
    'nieta': { inversa: 'abuela', categoria: 'nieta', genero: 'femenino' },
    
    // Bisabuelos
    'bisabuelo': { inversa: 'bisnieto', categoria: 'bisabuelo', genero: 'masculino' },
    'bisabuela': { inversa: 'bisnieta', categoria: 'bisabuela', genero: 'femenino' },
    'bisnieto': { inversa: 'bisabuelo', categoria: 'bisnieto', genero: 'masculino' },
    'bisnieta': { inversa: 'bisabuela', categoria: 'bisnieta', genero: 'femenino' },
    
    // Tatarabuelos
    'tatarabuelo': { inversa: 'tataranieto', categoria: 'tatarabuelo', genero: 'masculino' },
    'tatarabuela': { inversa: 'tataranieta', categoria: 'tatarabuela', genero: 'femenino' },
    'tataranieto': { inversa: 'tatarabuelo', categoria: 'tataranieto', genero: 'masculino' },
    'tataranieta': { inversa: 'tatarabuela', categoria: 'tataranieta', genero: 'femenino' },
    
    // Primos
    'primo': { inversa: 'primo', categoria: 'primo', genero: 'masculino' },
    'prima': { inversa: 'prima', categoria: 'prima', genero: 'femenino' },
    
    // Políticos
    'suegro': { inversa: 'yerno', categoria: 'suegro', genero: 'masculino' },
    'suegra': { inversa: 'nuera', categoria: 'suegra', genero: 'femenino' },
    'yerno': { inversa: 'suegro', categoria: 'yerno', genero: 'masculino' },
    'nuera': { inversa: 'suegra', categoria: 'nuera', genero: 'femenino' },
    'cuñado': { inversa: 'cuñado', categoria: 'cuñado', genero: 'masculino' },
    'cuñada': { inversa: 'cuñada', categoria: 'cuñada', genero: 'femenino' },
    
    // Parejas
    'esposo': { inversa: 'esposa', categoria: 'pareja', genero: 'masculino' },
    'esposa': { inversa: 'esposo', categoria: 'pareja', genero: 'femenino' },
    'novio': { inversa: 'novia', categoria: 'pareja', genero: 'masculino' },
    'novia': { inversa: 'novio', categoria: 'pareja', genero: 'femenino' },
    'amante': { inversa: 'amante', categoria: 'pareja', genero: 'ambos' },
    
    // Amistades
    'amigo': { inversa: 'amigo', categoria: 'amistad', genero: 'masculino' },
    'amiga': { inversa: 'amiga', categoria: 'amistad', genero: 'femenino' },
    
    // Enemistades
    'enemigo': { inversa: 'enemigo', categoria: 'enemistad', genero: 'masculino' },
    'enemiga': { inversa: 'enemiga', categoria: 'enemistad', genero: 'femenino' },
    
    // Mascotas
    'dueño': { inversa: 'mascota', categoria: 'mascota', genero: 'ambos' },
    'mascota': { inversa: 'dueño', categoria: 'mascota', genero: 'ambos' }
};

// ============================================
// DATOS DE EJEMPLO
// ============================================
if (obras.length === 0) {
    obras = [{
        id: '1',
        titulo: 'Los Pérez',
        genero: 'Familiar',
        descripcion: 'Historia de la familia Pérez',
        personajes: [
            {
                id: 'p1',
                nombre: 'Marcos',
                apellido: 'Pérez',
                genero: 'masculino',
                edad: '70',
                estado: 'vivo',
                tipo: 'persona',
                avatar: '',
                descripcion: 'Abuelo',
                notas: 'Fundador de la familia',
                nacimiento: 1950,
                muerte: '',
                relaciones: []
            },
            {
                id: 'p2',
                nombre: 'María',
                apellido: 'Pérez',
                genero: 'femenino',
                edad: '68',
                estado: 'viva',
                tipo: 'persona',
                avatar: '',
                descripcion: 'Abuela',
                notas: 'Matriarca',
                nacimiento: 1952,
                muerte: '',
                relaciones: []
            },
            {
                id: 'p3',
                nombre: 'Firulais',
                apellido: 'Pérez',
                genero: 'masculino',
                edad: '5',
                estado: 'vivo',
                tipo: 'mascota',
                especie: 'Perro',
                raza: 'Labrador',
                avatar: '',
                descripcion: 'Mascota familiar',
                notas: 'Le gusta jugar',
                relaciones: []
            }
        ]
    }];
    saveToLocalStorage();
}

// ============================================
// FUNCIONES PRINCIPALES
// ============================================

// Guardar en localStorage
function saveToLocalStorage() {
    localStorage.setItem('obras', JSON.stringify(obras));
}

// Añadir al historial
function addToHistorial(accion, detalles) {
    historial.unshift({
        fecha: new Date().toLocaleString(),
        accion,
        detalles
    });
    if (historial.length > 50) historial.pop();
    localStorage.setItem('historial', JSON.stringify(historial));
}

// ============================================
// BÚSQUEDA MEJORADA
// ============================================
function filterContent() {
    searchTerm = document.getElementById('searchInput').value.toLowerCase();
    filterType = document.getElementById('filterType').value;
    
    if (obraActual) {
        // Filtrar personajes de la obra actual
        const grid = document.getElementById('personajesGrid');
        if (!obraActual?.personajes?.length) {
            grid.innerHTML = '<div class="empty-message"><span class="icon">👤</span>No hay personajes</div>';
            return;
        }

        let personajesFiltrados = obraActual.personajes;
        
        if (searchTerm) {
            personajesFiltrados = personajesFiltrados.filter(p => 
                p.nombre.toLowerCase().includes(searchTerm) ||
                (p.apellido && p.apellido.toLowerCase().includes(searchTerm)) ||
                (p.descripcion && p.descripcion.toLowerCase().includes(searchTerm)) ||
                (p.notas && p.notas.toLowerCase().includes(searchTerm)) ||
                (p.tipo && p.tipo.toLowerCase().includes(searchTerm)) ||
                (p.especie && p.especie.toLowerCase().includes(searchTerm))
            );
        }

        // Agrupar por apellido
        const porApellido = {};
        const mascotas = [];
        
        personajesFiltrados.forEach(p => {
            if (p.tipo === 'mascota') {
                mascotas.push(p);
            } else {
                const apellido = p.apellido || 'Sin apellido';
                if (!porApellido[apellido]) porApellido[apellido] = [];
                porApellido[apellido].push(p);
            }
        });

        let html = '';
        
        // Mostrar familias
        Object.entries(porApellido).forEach(([apellido, personajes]) => {
            const expandida = familiasExpandidas[apellido] !== false;
            html += `
                <div class="familia-group">
                    <div class="familia-header" onclick="toggleFamilia('${apellido}')">
                        <h3 class="familia-titulo">
                            <span class="familia-toggle">${expandida ? '▼' : '▶'}</span>
                            🏠 Familia ${apellido} (${personajes.length})
                        </h3>
                    </div>
                    <div class="familia-content" id="familia-${apellido}" style="display: ${expandida ? 'block' : 'none'};">
                        <div class="personajes-subgrid">
                            ${personajes.map(p => createPersonajeCard(p)).join('')}
                        </div>
                    </div>
                </div>
            `;
        });

        // Mostrar mascotas
        if (mascotas.length > 0) {
            html += `
                <div class="familia-group">
                    <h3 class="familia-titulo">🐾 Mascotas (${mascotas.length})</h3>
                    <div class="personajes-subgrid">
                        ${mascotas.map(p => createPersonajeCard(p)).join('')}
                    </div>
                </div>
            `;
        }

        grid.innerHTML = html || '<div class="empty-message">No se encontraron personajes</div>';

        // Cargar relaciones después
        personajesFiltrados.forEach(p => {
            const container = document.getElementById(`relaciones-${p.id}`);
            if (container) {
                container.innerHTML = renderRelaciones(p);
            }
        });
        
    } else {
        // Filtrar obras
        loadObras();
    }
}

function toggleFamilia(apellido) {
    familiasExpandidas[apellido] = !familiasExpandidas[apellido];
    const content = document.getElementById(`familia-${apellido}`);
    const header = content.previousElementSibling;
    const toggle = header.querySelector('.familia-toggle');
    
    if (familiasExpandidas[apellido]) {
        content.style.display = 'block';
        toggle.textContent = '▼';
    } else {
        content.style.display = 'none';
        toggle.textContent = '▶';
    }
}

// ============================================
// RENDERIZADO DE RELACIONES
// ============================================
function renderRelaciones(p) {
    if (!p.relaciones?.length) {
        return '<div style="color: #a0aec0; font-size: 13px; text-align: center; padding: 10px;">Sin relaciones</div>';
    }

    return p.relaciones.map(r => {
        const destino = obraActual.personajes.find(d => d.id === r.con);
        if (!destino) return '';
        
        let icon = getRelacionIcon(r.tipo);
        
        return `
            <div class="relacion-item ${r.tipo}">
                <span class="relacion-icon">${icon}</span>
                <span class="relacion-texto">
                    <strong>${destino.nombre} ${destino.apellido || ''}</strong>
                    ${destino.tipo === 'mascota' ? '🐾' : ''}
                </span>
                <span class="relacion-tipo-badge">${r.tipo}</span>
            </div>
        `;
    }).join('');
}

function getRelacionIcon(tipo) {
    const iconMap = {
        'padre': '👨', 'madre': '👩', 'hijo': '👶', 'hija': '👧',
        'hermano': '🤝', 'hermana': '🤝',
        'tio': '👨‍👦', 'tia': '👩‍👧', 'sobrino': '🧒', 'sobrina': '👧',
        'abuelo': '👴', 'abuela': '👵', 'nieto': '👶', 'nieta': '👧',
        'bisabuelo': '👴', 'bisabuela': '👵', 'bisnieto': '👶', 'bisnieta': '👧',
        'tatarabuelo': '👴', 'tatarabuela': '👵', 'tataranieto': '👶', 'tataranieta': '👧',
        'primo': '👥', 'prima': '👥',
        'suegro': '👨', 'suegra': '👩', 'yerno': '👨', 'nuera': '👩', 'cuñado': '👨', 'cuñada': '👩',
        'esposo': '💍', 'esposa': '💍', 'novio': '💕', 'novia': '💕', 'amante': '💔',
        'amigo': '😊', 'amiga': '😊',
        'enemigo': '⚔️', 'enemiga': '⚔️',
        'dueño': '👤', 'mascota': '🐾'
    };
    return iconMap[tipo] || '🔗';
}

// ============================================
// CREAR CARD DE PERSONAJE
// ============================================
function createPersonajeCard(p) {
    const estadoIcon = p.estado === 'vivo' ? '💚' : '💀';
    const tipoIcon = p.tipo === 'mascota' ? '🐾' : '👤';
    const avatarHtml = p.avatar 
        ? `<img src="${p.avatar}" alt="${p.nombre}">`
        : `<span>${tipoIcon}</span>`;
    
    return `
        <div class="personaje-card" onclick="expandPersonaje('${p.id}')">
            <div class="personaje-header">
                <div class="personaje-avatar-mini">
                    ${avatarHtml}
                </div>
                <div>
                    <h3>${p.nombre} ${p.apellido || ''} ${p.tipo === 'mascota' ? '🐾' : ''}</h3>
                    <div class="personaje-badges">
                        <span class="badge ${p.genero}">${p.genero === 'masculino' ? '👨' : '👩'}</span>
                        <span class="badge edad">🎂 ${p.edad || '?'}</span>
                        <span class="badge estado">${estadoIcon}</span>
                        ${p.tipo === 'mascota' ? `<span class="badge mascota">🐾 ${p.especie || 'Mascota'}</span>` : ''}
                    </div>
                </div>
            </div>
            
            ${p.descripcion ? `<div class="personaje-descripcion">📝 ${p.descripcion.substring(0, 50)}${p.descripcion.length > 50 ? '...' : ''}</div>` : ''}
            
            <div class="personaje-actions" onclick="event.stopPropagation()">
                <button class="btn-relacion" onclick="showRelacionModal('${p.id}')">
                    <span>+</span> Relación
                </button>
                <button class="btn-editar" onclick="editPersonaje('${p.id}')">
                    ✏️ Editar
                </button>
                <button class="btn-eliminar" onclick="showConfirm('personaje', '${p.id}')">
                    × Eliminar
                </button>
            </div>

            <div class="relaciones-section" onclick="event.stopPropagation()">
                <div class="relaciones-title">🔗 RELACIONES</div>
                <div class="relaciones-list" id="relaciones-${p.id}"></div>
            </div>
        </div>
    `;
}

// ============================================
// MOSTRAR OBRAS
// ============================================
function loadObras() {
    const grid = document.getElementById('obrasGrid');
    let obrasFiltradas = obras;
    
    if (searchTerm) {
        obrasFiltradas = obrasFiltradas.filter(obra => 
            obra.titulo.toLowerCase().includes(searchTerm) ||
            (obra.genero && obra.genero.toLowerCase().includes(searchTerm)) ||
            (obra.descripcion && obra.descripcion.toLowerCase().includes(searchTerm)) ||
            obra.personajes?.some(p => 
                p.nombre.toLowerCase().includes(searchTerm) ||
                (p.apellido && p.apellido.toLowerCase().includes(searchTerm))
            )
        );
    }
    
    if (obrasFiltradas.length === 0) {
        grid.innerHTML = '<div class="empty-message"><span class="icon">📚</span>No se encontraron obras</div>';
        return;
    }

    grid.innerHTML = obrasFiltradas.map(obra => `
        <div class="obra-card" onclick="openObra('${obra.id}')">
            <button class="delete-btn" onclick="event.stopPropagation(); showConfirm('obra', '${obra.id}')">×</button>
            <h3>${obra.titulo}</h3>
            <p>📖 ${obra.genero || 'Sin género'}</p>
            <p>📝 ${obra.descripcion ? obra.descripcion.substring(0, 50) + '...' : 'Sin descripción'}</p>
            <p>👥 ${obra.personajes?.filter(p => p.tipo !== 'mascota').length || 0} personas</p>
            <p>🐾 ${obra.personajes?.filter(p => p.tipo === 'mascota').length || 0} mascotas</p>
        </div>
    `).join('');
}

// ============================================
// ABRIR OBRA
// ============================================
function openObra(id) {
    obraActual = obras.find(o => o.id === id);
    document.getElementById('obraTitle').textContent = obraActual.titulo;
    document.getElementById('mainContainer').style.display = 'none';
    document.getElementById('obraContainer').style.display = 'block';
    
    // Cargar selects de comparativa
    const compare1 = document.getElementById('compare1');
    const compare2 = document.getElementById('compare2');
    if (compare1 && compare2) {
        const options = obraActual.personajes.map(p => 
            `<option value="${p.id}">${p.nombre} ${p.apellido || ''} ${p.tipo === 'mascota' ? '🐾' : ''}</option>`
        ).join('');
        compare1.innerHTML = '<option value="">Seleccionar...</option>' + options;
        compare2.innerHTML = '<option value="">Seleccionar...</option>' + options;
    }
    
    switchTab('lista');
}

function backToObras() {
    document.getElementById('obraContainer').style.display = 'none';
    document.getElementById('mainContainer').style.display = 'block';
    obraActual = null;
    loadObras();
}

// ============================================
// PESTAÑAS
// ============================================
function switchTab(tab) {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    
    const tabIndex = {
        'lista': 0,
        'galeria': 1,
        'timeline': 2,
        'comparativa': 3,
        'mascotas': 4
    }[tab];
    
    document.querySelectorAll('.tab')[tabIndex].classList.add('active');
    document.getElementById(tab + 'View').classList.add('active');
    
    if (tab === 'galeria') loadGaleria();
    if (tab === 'timeline') loadTimeline();
    if (tab === 'comparativa') updateComparison();
    if (tab === 'mascotas') loadMascotas();
}

// ============================================
// LÍNEA DE TIEMPO
// ============================================
let timelineOrder = 'asc';

function loadTimeline() {
    const container = document.getElementById('timelineContainer');
    if (!obraActual?.personajes?.length) {
        container.innerHTML = '<div class="empty-message">No hay personajes</div>';
        return;
    }

    const personajesConFecha = obraActual.personajes.filter(p => p.nacimiento && p.tipo !== 'mascota');
    if (personajesConFecha.length === 0) {
        container.innerHTML = '<div class="empty-message">No hay personajes con fecha de nacimiento</div>';
        return;
    }

    // Calcular relaciones familiares complejas
    personajesConFecha.forEach(p => {
        p.relacionesComplejas = calcularRelacionesFamiliares(p);
    });

    const ordenados = personajesConFecha.sort((a, b) => 
        timelineOrder === 'asc' ? a.nacimiento - b.nacimiento : b.nacimiento - a.nacimiento
    );

    container.innerHTML = ordenados.map(p => {
        const muerteTexto = p.muerte ? ` - ${p.muerte}` : '';
        const estadoIcon = p.estado === 'vivo' ? '💚' : '💀';
        const relacionesTexto = p.relacionesComplejas.length > 0 
            ? `<small>${p.relacionesComplejas.join(' • ')}</small>` 
            : '';
        
        return `
            <div class="timeline-item">
                <div class="timeline-content" onclick="expandPersonaje('${p.id}')">
                    <strong>${p.nombre} ${p.apellido || ''}</strong>
                    <div>${estadoIcon} ${p.nacimiento}${muerteTexto}</div>
                    ${p.descripcion ? `<small>${p.descripcion.substring(0, 50)}...</small>` : ''}
                    ${relacionesTexto}
                </div>
                <div class="timeline-year">${p.nacimiento}</div>
            </div>
        `;
    }).join('');
}

// Calcular relaciones familiares complejas
function calcularRelacionesFamiliares(personaje) {
    const relaciones = [];
    
    // Buscar padres
    const padres = obraActual.personajes.filter(p => 
        p.relaciones?.some(r => r.con === personaje.id && (r.tipo === 'padre' || r.tipo === 'madre'))
    );
    
    // Buscar abuelos (padres de los padres)
    padres.forEach(padre => {
        const abuelos = obraActual.personajes.filter(ab => 
            ab.relaciones?.some(r => r.con === padre.id && (r.tipo === 'padre' || r.tipo === 'madre'))
        );
        abuelos.forEach(abuelo => {
            relaciones.push(`${abuelo.genero === 'masculino' ? 'Abuelo' : 'Abuela'}: ${abuelo.nombre}`);
        });
    });
    
    // Buscar tíos (hermanos de los padres)
    padres.forEach(padre => {
        const tios = obraActual.personajes.filter(t => 
            t.relaciones?.some(r => r.con === padre.id && (r.tipo === 'hermano' || r.tipo === 'hermana'))
        );
        tios.forEach(tio => {
            relaciones.push(`${tio.genero === 'masculino' ? 'Tío' : 'Tía'}: ${tio.nombre}`);
        });
    });
    
    return relaciones.slice(0, 3); // Limitar a 3 para no saturar
}

function sortTimeline(order) {
    timelineOrder = order;
    loadTimeline();
}

// ============================================
// MASCOTAS
// ============================================
function loadMascotas() {
    const grid = document.getElementById('mascotasGrid');
    if (!obraActual?.personajes?.length) {
        grid.innerHTML = '<div class="empty-message">No hay personajes</div>';
        return;
    }

    const mascotas = obraActual.personajes.filter(p => p.tipo === 'mascota');
    
    if (mascotas.length === 0) {
        grid.innerHTML = '<div class="empty-message">🐾 No hay mascotas registradas</div>';
        return;
    }

    grid.innerHTML = mascotas.map(p => {
        const avatarHtml = p.avatar 
            ? `<img src="${p.avatar}" alt="${p.nombre}">`
            : `<span>🐾</span>`;
        
        // Buscar dueño
        const dueno = obraActual.personajes.find(d => 
            d.relaciones?.some(r => r.con === p.id && r.tipo === 'mascota')
        );
        
        return `
            <div class="mascota-card" onclick="expandPersonaje('${p.id}')">
                <div class="mascota-avatar">
                    ${avatarHtml}
                </div>
                <div class="mascota-info">
                    <h3>${p.nombre}</h3>
                    <p>🐾 ${p.especie || 'Mascota'} • ${p.raza || ''}</p>
                    <p>🎂 ${p.edad || '?'} años</p>
                    ${dueno ? `<p>👤 Dueño: ${dueno.nombre}</p>` : ''}
                </div>
            </div>
        `;
    }).join('');
}

// ============================================
// GALERÍA
// ============================================
function loadGaleria() {
    const grid = document.getElementById('galeriaGrid');
    if (!obraActual?.personajes?.length) {
        grid.innerHTML = '<div class="empty-message">No hay personajes</div>';
        return;
    }

    grid.innerHTML = obraActual.personajes.map(p => {
        const estadoIcon = p.estado === 'vivo' ? '💚' : '💀';
        const tipoIcon = p.tipo === 'mascota' ? '🐾' : '👤';
        const avatarHtml = p.avatar 
            ? `<img src="${p.avatar}" alt="${p.nombre}">`
            : `<span>${tipoIcon}</span>`;
        
        return `
            <div class="galeria-item" onclick="expandPersonaje('${p.id}')">
                <div class="galeria-avatar">
                    ${avatarHtml}
                </div>
                <div class="galeria-nombre">${p.nombre} ${p.apellido || ''}</div>
                <div class="galeria-edad">${estadoIcon} ${p.edad || '?'} años</div>
                ${p.tipo === 'mascota' ? '<div class="galeria-mascota">🐾 Mascota</div>' : ''}
            </div>
        `;
    }).join('');
}

// ============================================
// COMPARATIVA
// ============================================
function updateComparison() {
    const id1 = document.getElementById('compare1').value;
    const id2 = document.getElementById('compare2').value;
    const container = document.getElementById('comparisonContainer');

    if (!id1 || !id2) {
        container.innerHTML = '<div class="empty-message">Selecciona dos personajes para comparar</div>';
        return;
    }

    const p1 = obraActual.personajes.find(p => p.id === id1);
    const p2 = obraActual.personajes.find(p => p.id === id2);

    container.innerHTML = `
        <div class="comparativa-columna">
            <h3>${p1.nombre} ${p1.apellido || ''} ${p1.tipo === 'mascota' ? '🐾' : ''}</h3>
            <div class="comparativa-item">
                <div class="comparativa-label">Tipo</div>
                <div class="comparativa-valor">${p1.tipo === 'mascota' ? '🐾 Mascota' : '👤 Persona'}</div>
            </div>
            <div class="comparativa-item">
                <div class="comparativa-label">Género</div>
                <div class="comparativa-valor">${p1.genero === 'masculino' ? '👨 Hombre' : p1.genero === 'femenino' ? '👩 Mujer' : 'Otro'}</div>
            </div>
            <div class="comparativa-item">
                <div class="comparativa-label">Edad</div>
                <div class="comparativa-valor">${p1.edad || '?'} años</div>
            </div>
            <div class="comparativa-item">
                <div class="comparativa-label">Estado</div>
                <div class="comparativa-valor">${p1.estado === 'vivo' ? '💚 Vivo' : '💀 Muerto'}</div>
            </div>
            <div class="comparativa-item">
                <div class="comparativa-label">Relaciones</div>
                <div class="comparativa-valor">${p1.relaciones?.length || 0}</div>
            </div>
            ${p1.tipo === 'mascota' ? `
                <div class="comparativa-item">
                    <div class="comparativa-label">Especie</div>
                    <div class="comparativa-valor">${p1.especie || '?'}</div>
                </div>
                <div class="comparativa-item">
                    <div class="comparativa-label">Raza</div>
                    <div class="comparativa-valor">${p1.raza || '?'}</div>
                </div>
            ` : ''}
        </div>
        <div class="comparativa-columna">
            <h3>${p2.nombre} ${p2.apellido || ''} ${p2.tipo === 'mascota' ? '🐾' : ''}</h3>
            <div class="comparativa-item">
                <div class="comparativa-label">Tipo</div>
                <div class="comparativa-valor">${p2.tipo === 'mascota' ? '🐾 Mascota' : '👤 Persona'}</div>
            </div>
            <div class="comparativa-item">
                <div class="comparativa-label">Género</div>
                <div class="comparativa-valor">${p2.genero === 'masculino' ? '👨 Hombre' : p2.genero === 'femenino' ? '👩 Mujer' : 'Otro'}</div>
            </div>
            <div class="comparativa-item">
                <div class="comparativa-label">Edad</div>
                <div class="comparativa-valor">${p2.edad || '?'} años</div>
            </div>
            <div class="comparativa-item">
                <div class="comparativa-label">Estado</div>
                <div class="comparativa-valor">${p2.estado === 'vivo' ? '💚 Vivo' : '💀 Muerto'}</div>
            </div>
            <div class="comparativa-item">
                <div class="comparativa-label">Relaciones</div>
                <div class="comparativa-valor">${p2.relaciones?.length || 0}</div>
            </div>
            ${p2.tipo === 'mascota' ? `
                <div class="comparativa-item">
                    <div class="comparativa-label">Especie</div>
                    <div class="comparativa-valor">${p2.especie || '?'}</div>
                </div>
                <div class="comparativa-item">
                    <div class="comparativa-label">Raza</div>
                    <div class="comparativa-valor">${p2.raza || '?'}</div>
                </div>
            ` : ''}
        </div>
    `;
}

// ============================================
// EXPANDIR PERSONAJE
// ============================================
function expandPersonaje(id) {
    const p = obraActual.personajes.find(p => p.id === id);
    const container = document.getElementById('personajeExpandidoContent');
    
    const avatarHtml = p.avatar 
        ? `<img src="${p.avatar}" alt="${p.nombre}">`
        : `<span>${p.tipo === 'mascota' ? '🐾' : '👤'}</span>`;
    
    const relacionesHtml = p.relaciones?.map(r => {
        const destino = obraActual.personajes.find(d => d.id === r.con);
        return destino ? `<li>${r.tipo} de <strong>${destino.nombre} ${destino.apellido || ''}</strong></li>` : '';
    }).join('') || '<li>Sin relaciones</li>';
    
    const citasHtml = p.notas ? p.notas.split('\n').map(cita => 
        cita.trim() ? `<div class="cita-item">"${cita}"</div>` : ''
    ).join('') : '<p>No hay citas guardadas</p>';
    
    container.innerHTML = `
        <div class="personaje-expandido">
            <div class="personaje-expandido-avatar">
                ${avatarHtml}
            </div>
            <div class="personaje-expandido-info">
                <h2>${p.nombre} ${p.apellido || ''} ${p.tipo === 'mascota' ? '🐾' : ''}</h2>
                
                <div class="info-grid">
                    <div class="info-item">
                        <div class="info-label">Tipo</div>
                        <div class="info-value">${p.tipo === 'mascota' ? '🐾 Mascota' : '👤 Persona'}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Género</div>
                        <div class="info-value">${p.genero === 'masculino' ? '👨 Hombre' : p.genero === 'femenino' ? '👩 Mujer' : 'Otro'}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Edad</div>
                        <div class="info-value">${p.edad || '?'} años</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Estado</div>
                        <div class="info-value">${p.estado === 'vivo' ? '💚 Vivo' : '💀 Muerto'}</div>
                    </div>
                    ${p.tipo === 'mascota' ? `
                        <div class="info-item">
                            <div class="info-label">Especie</div>
                            <div class="info-value">${p.especie || '?'}</div>
                        </div>
                        <div class="info-item">
                            <div class="info-label">Raza</div>
                            <div class="info-value">${p.raza || '?'}</div>
                        </div>
                    ` : ''}
                    ${p.nacimiento ? `
                        <div class="info-item">
                            <div class="info-label">Nacimiento/Muerte</div>
                            <div class="info-value">${p.nacimiento || '?'} - ${p.muerte || 'Presente'}</div>
                        </div>
                    ` : ''}
                </div>
                
                <div class="info-item">
                    <div class="info-label">Descripción</div>
                    <div class="info-value">${p.descripcion || 'Sin descripción'}</div>
                </div>
                
                <div class="info-item">
                    <div class="info-label">Relaciones</div>
                    <ul class="info-value" style="margin-left: 20px;">
                        ${relacionesHtml}
                    </ul>
                </div>
                
                <div class="citas-section">
                    <div class="info-label">📝 Notas y citas</div>
                    ${citasHtml}
                </div>
            </div>
        </div>
    `;
    
    showModal('personajeExpandidoModal');
}

// ============================================
// IMPRIMIR PERSONAJE
// ============================================
function printPersonaje() {
    const content = document.getElementById('personajeExpandidoContent').innerHTML;
    const ventana = window.open('', '_blank');
    ventana.document.write(`
        <html>
            <head>
                <title>Ficha de personaje</title>
                <style>
                    body { font-family: Arial; padding: 40px; }
                    .ficha { max-width: 800px; margin: 0 auto; }
                    .info-grid { display: grid; grid-template-columns: repeat(2,1fr); gap: 15px; margin: 20px 0; }
                    .info-item { background: #f5f5f5; padding: 10px; border-radius: 5px; }
                    .cita-item { background: #f9f9f9; padding: 10px; margin: 5px 0; border-left: 4px solid #667eea; }
                    @media print {
                        body { padding: 0; }
                        button { display: none; }
                    }
                </style>
            </head>
            <body>
                <div class="ficha">
                    ${content}
                </div>
                <button onclick="window.print()" style="margin-top: 20px; padding: 10px 20px;">🖨️ Imprimir</button>
            </body>
        </html>
    `);
}

// ============================================
// MOSTRAR HISTORIAL
// ============================================
function showHistorial() {
    const list = document.getElementById('historialList');
    list.innerHTML = historial.map(h => `
        <div class="historial-item">
            <div class="historial-fecha">${h.fecha}</div>
            <div class="historial-accion">${h.accion}</div>
            <div style="font-size: 12px; color: #718096;">${h.detalles}</div>
        </div>
    `).join('') || '<div class="empty-message">No hay historial</div>';
    
    showModal('historialModal');
}

// ============================================
// IMPORTAR/EXPORTAR
// ============================================
function showImportModal() {
    showModal('importModal');
}

function exportObras() {
    const dataStr = JSON.stringify(obras, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `obras_${new Date().toISOString().slice(0,10)}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    addToHistorial('Exportación', `Exportadas ${obras.length} obras`);
}

function exportPersonajes() {
    if (!obraActual) return;
    
    const dataStr = JSON.stringify(obraActual.personajes, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `personajes_${obraActual.titulo}_${new Date().toISOString().slice(0,10)}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    addToHistorial('Exportación', `Exportados ${obraActual.personajes.length} personajes de ${obraActual.titulo}`);
}

function handleFileImport() {
    const file = document.getElementById('importFile').files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            document.getElementById('importJson').value = e.target.result;
        };
        reader.readAsText(file);
    }
}

function importFromText() {
    try {
        const json = document.getElementById('importJson').value;
        const imported = JSON.parse(json);
        
        if (Array.isArray(imported)) {
            if (imported[0]?.titulo) {
                // Son obras
                obras = imported;
            } else {
                // Son personajes
                if (obraActual) {
                    obraActual.personajes = imported;
                    updateObra();
                }
            }
        } else if (imported.obras) {
            obras = imported.obras;
        } else {
            obras = [imported];
        }
        
        saveToLocalStorage();
        addToHistorial('Importación', `Importados datos`);
        hideModal('importModal');
        if (obraActual) {
            loadPersonajes();
        } else {
            loadObras();
        }
        alert('Importación exitosa');
    } catch (e) {
        alert('Error al importar: JSON inválido');
    }
}

// ============================================
// MODALES
// ============================================
function showModal(id) {
    document.getElementById(id).classList.add('active');
}

function hideModal(id) {
    document.getElementById(id).classList.remove('active');
}

// ============================================
// MODAL RELACIÓN CON FILTRO POR GÉNERO
// ============================================
function showRelacionModal(personajeId) {
    const origen = obraActual.personajes.find(p => p.id === personajeId);
    const select = document.getElementById('relacionDestino');
    const tipoSelect = document.getElementById('relacionTipo');
    
    // Filtrar opciones de relación según género
    tipoSelect.innerHTML = '';
    const opciones = Object.entries(relacionesMap)
        .filter(([tipo, data]) => 
            data.genero === 'ambos' || 
            data.genero === origen.genero ||
            (origen.tipo === 'mascota' && tipo === 'dueño')
        )
        .map(([tipo, data]) => `<option value="${tipo}">${getRelacionIcon(tipo)} ${tipo}</option>`)
        .join('');
    
    tipoSelect.innerHTML = opciones;
    
    // Llenar destino
    select.innerHTML = obraActual.personajes
        .filter(p => p.id !== personajeId)
        .map(p => `<option value="${p.id}">${p.nombre} ${p.apellido || ''} ${p.tipo === 'mascota' ? '🐾' : ''}</option>`)
        .join('');
    
    document.getElementById('relacionOrigenId').value = personajeId;
    showModal('relacionModal');
}

// ============================================
// GUARDAR OBRA
// ============================================
function saveObra() {
    const id = document.getElementById('obraId').value;
    const titulo = document.getElementById('obraTitulo').value;
    
    if (!titulo) return alert('El título es obligatorio');

    if (id) {
        const obra = obras.find(o => o.id === id);
        obra.titulo = titulo;
        obra.genero = document.getElementById('obraGenero').value;
        obra.descripcion = document.getElementById('obraDescripcion').value;
        addToHistorial('Edición', `Editada obra: ${titulo}`);
    } else {
        obras.push({
            id: Date.now().toString(),
            titulo,
            genero: document.getElementById('obraGenero').value,
            descripcion: document.getElementById('obraDescripcion').value,
            personajes: []
        });
        addToHistorial('Creación', `Nueva obra: ${titulo}`);
    }

    saveToLocalStorage();
    document.getElementById('obraTitulo').value = '';
    document.getElementById('obraGenero').value = '';
    document.getElementById('obraDescripcion').value = '';
    hideModal('obraModal');
    loadObras();
}

// ============================================
// GUARDAR PERSONAJE
// ============================================
function savePersonaje() {
    const id = document.getElementById('personajeId').value;
    const nombre = document.getElementById('personajeNombre').value;
    const tipo = document.getElementById('personajeTipo').value;
    
    if (!nombre) return alert('El nombre es obligatorio');

    const personajeData = {
        nombre,
        apellido: document.getElementById('personajeApellido').value,
        genero: document.getElementById('personajeGenero').value,
        edad: document.getElementById('personajeEdad').value,
        estado: document.getElementById('personajeEstado').value,
        tipo: tipo,
        avatar: document.getElementById('personajeAvatar').value,
        descripcion: document.getElementById('personajeDescripcion').value,
        notas: document.getElementById('personajeNotas').value
    };

    if (tipo === 'mascota') {
        personajeData.especie = document.getElementById('mascotaEspecie').value;
        personajeData.raza = document.getElementById('mascotaRaza').value;
    } else {
        personajeData.nacimiento = document.getElementById('personajeNacimiento').value;
        personajeData.muerte = document.getElementById('personajeMuerte').value;
    }

    if (id) {
        const p = obraActual.personajes.find(p => p.id === id);
        Object.assign(p, personajeData);
        addToHistorial('Edición', `Editado ${tipo}: ${nombre}`);
    } else {
        if (!obraActual.personajes) obraActual.personajes = [];
        obraActual.personajes.push({
            id: Date.now().toString(),
            ...personajeData,
            relaciones: []
        });
        addToHistorial('Creación', `Nuevo ${tipo}: ${nombre}`);
    }

    updateObra();
    hideModal('personajeModal');
    clearPersonajeForm();
    filterContent(); // Usar filterContent en lugar de loadPersonajes
    if (document.getElementById('galeriaView').classList.contains('active')) loadGaleria();
    if (document.getElementById('timelineView').classList.contains('active')) loadTimeline();
    if (document.getElementById('mascotasView').classList.contains('active')) loadMascotas();
}

function clearPersonajeForm() {
    document.getElementById('personajeId').value = '';
    document.getElementById('personajeNombre').value = '';
    document.getElementById('personajeApellido').value = '';
    document.getElementById('personajeEdad').value = '';
    document.getElementById('personajeAvatar').value = '';
    document.getElementById('personajeDescripcion').value = '';
    document.getElementById('personajeNotas').value = '';
    document.getElementById('personajeNacimiento').value = '';
    document.getElementById('personajeMuerte').value = '';
    document.getElementById('mascotaEspecie').value = '';
    document.getElementById('mascotaRaza').value = '';
}

// ============================================
// GUARDAR RELACIÓN CON INVERSAS AUTOMÁTICAS
// ============================================
function saveRelacion() {
    const origenId = document.getElementById('relacionOrigenId').value;
    const destinoId = document.getElementById('relacionDestino').value;
    const tipo = document.getElementById('relacionTipo').value;

    if (!destinoId) return alert('Selecciona un personaje');

    const origen = obraActual.personajes.find(p => p.id === origenId);
    const destino = obraActual.personajes.find(p => p.id === destinoId);

    if (!origen.relaciones) origen.relaciones = [];
    if (!destino.relaciones) destino.relaciones = [];

    // Obtener relación inversa
    const tipoInverso = relacionesMap[tipo]?.inversa || tipo;

    // Agregar relaciones
    origen.relaciones.push({ con: destinoId, tipo });
    
    const existeInversa = destino.relaciones.some(r => r.con === origenId);
    if (!existeInversa) {
        destino.relaciones.push({ con: origenId, tipo: tipoInverso });
    }

    // Calcular relaciones automáticas (tíos, abuelos, etc.)
    calcularRelacionesAutomaticas(origen, destino, tipo);

    addToHistorial('Relación', `${origen.nombre} es ${tipo} de ${destino.nombre}`);
    updateObra();
    hideModal('relacionModal');
    filterContent(); // Usar filterContent en lugar de loadPersonajes
}

// Calcular relaciones automáticas (tíos, abuelos, etc.)
function calcularRelacionesAutomaticas(origen, destino, tipo) {
    // Si A es hermano de B y B es padre de C, entonces A es tío de C
    if ((tipo === 'hermano' || tipo === 'hermana') && destino.relaciones) {
        const hijosDeDestino = obraActual.personajes.filter(p => 
            p.relaciones?.some(r => 
                r.con === destino.id && (r.tipo === 'hijo' || r.tipo === 'hija')
            )
        );
        
        hijosDeDestino.forEach(hijo => {
            if (!hijo.relaciones) hijo.relaciones = [];
            const relacionTio = origen.genero === 'masculino' ? 'tio' : 'tia';
            hijo.relaciones.push({ con: origen.id, tipo: relacionTio });
            
            if (!origen.relaciones) origen.relaciones = [];
            const relacionSobrino = hijo.genero === 'masculino' ? 'sobrino' : 'sobrina';
            origen.relaciones.push({ con: hijo.id, tipo: relacionSobrino });
        });
    }
    
    // Si A es padre de B y B es padre de C, entonces A es abuelo de C
    if ((tipo === 'hijo' || tipo === 'hija') && destino.relaciones) {
        const padresDeOrigen = obraActual.personajes.filter(p => 
            p.relaciones?.some(r => 
                r.con === origen.id && (r.tipo === 'padre' || r.tipo === 'madre')
            )
        );
        
        padresDeOrigen.forEach(abuelo => {
            if (!abuelo.relaciones) abuelo.relaciones = [];
            const relacionAbuelo = abuelo.genero === 'masculino' ? 'abuelo' : 'abuela';
            abuelo.relaciones.push({ con: destino.id, tipo: relacionAbuelo });
            
            if (!destino.relaciones) destino.relaciones = [];
            const relacionNieto = destino.genero === 'masculino' ? 'nieto' : 'nieta';
            destino.relaciones.push({ con: abuelo.id, tipo: relacionNieto });
        });
    }
}

// ============================================
// EDITAR PERSONAJE
// ============================================
function editPersonaje(id) {
    const p = obraActual.personajes.find(p => p.id === id);
    document.getElementById('personajeModalTitle').textContent = '✏️ Editar Personaje';
    document.getElementById('personajeId').value = p.id;
    document.getElementById('personajeNombre').value = p.nombre;
    document.getElementById('personajeApellido').value = p.apellido || '';
    document.getElementById('personajeGenero').value = p.genero;
    document.getElementById('personajeEdad').value = p.edad || '';
    document.getElementById('personajeEstado').value = p.estado || 'vivo';
    document.getElementById('personajeTipo').value = p.tipo || 'persona';
    document.getElementById('personajeAvatar').value = p.avatar || '';
    document.getElementById('personajeDescripcion').value = p.descripcion || '';
    document.getElementById('personajeNotas').value = p.notas || '';
    document.getElementById('personajeNacimiento').value = p.nacimiento || '';
    document.getElementById('personajeMuerte').value = p.muerte || '';
    document.getElementById('mascotaEspecie').value = p.especie || '';
    document.getElementById('mascotaRaza').value = p.raza || '';
    
    // Mostrar/ocultar campos según tipo
    toggleTipoCampos();
    
    showModal('personajeModal');
}

// ============================================
// TOGGLE CAMPOS SEGÚN TIPO
// ============================================
function toggleTipoCampos() {
    const tipo = document.getElementById('personajeTipo').value;
    const personaFields = document.getElementById('personaFields');
    const mascotaFields = document.getElementById('mascotaFields');
    
    if (tipo === 'mascota') {
        personaFields.style.display = 'none';
        mascotaFields.style.display = 'block';
    } else {
        personaFields.style.display = 'block';
        mascotaFields.style.display = 'none';
    }
}

// ============================================
// CONFIRMAR ELIMINACIÓN
// ============================================
function showConfirm(tipo, id) {
    itemToDelete = { tipo, id };
    document.getElementById('confirmMessage').textContent = 
        tipo === 'obra' ? '¿Eliminar esta obra? Se borrarán todos sus personajes.' : '¿Eliminar este personaje?';
    showModal('confirmModal');
}

function confirmDelete() {
    if (itemToDelete.tipo === 'obra') {
        const obra = obras.find(o => o.id === itemToDelete.id);
        obras = obras.filter(o => o.id !== itemToDelete.id);
        addToHistorial('Eliminación', `Eliminada obra: ${obra.titulo}`);
        saveToLocalStorage();
        if (obraActual?.id === itemToDelete.id) backToObras();
        loadObras();
    } else {
        const personaje = obraActual.personajes.find(p => p.id === itemToDelete.id);
        obraActual.personajes = obraActual.personajes.filter(p => p.id !== itemToDelete.id);
        
        obraActual.personajes.forEach(p => {
            if (p.relaciones) {
                p.relaciones = p.relaciones.filter(r => r.con !== itemToDelete.id);
            }
        });
        
        addToHistorial('Eliminación', `Eliminado ${personaje.tipo}: ${personaje.nombre}`);
        updateObra();
        filterContent(); // Usar filterContent en lugar de loadPersonajes
        if (document.getElementById('galeriaView').classList.contains('active')) loadGaleria();
        if (document.getElementById('timelineView').classList.contains('active')) loadTimeline();
        if (document.getElementById('mascotasView').classList.contains('active')) loadMascotas();
    }
    hideModal('confirmModal');
}

function updateObra() {
    const index = obras.findIndex(o => o.id === obraActual.id);
    obras[index] = obraActual;
    saveToLocalStorage();
}

// ============================================
// INICIALIZAR
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    loadObras();
    
    // Configurar evento de búsqueda en tiempo real
    document.getElementById('searchInput').addEventListener('input', filterContent);
    document.getElementById('filterType').addEventListener('change', filterContent);
});
