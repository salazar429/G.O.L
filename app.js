// Datos
let obras = JSON.parse(localStorage.getItem('obras')) || [];
let obraActual = null;
let itemToDelete = null;
let historial = JSON.parse(localStorage.getItem('historial')) || [];
let searchTerm = '';
let filterType = 'all';

// Inicializar con datos de ejemplo si no hay obras
if (obras.length === 0) {
    obras = [{
        id: '1',
        titulo: 'Cien años de soledad',
        genero: 'Novela',
        descripcion: 'La historia de la familia Buendía',
        personajes: [
            {
                id: 'p1',
                nombre: 'José Arcadio',
                apellido: 'Buendía',
                genero: 'masculino',
                edad: '45',
                estado: 'muerto',
                avatar: '',
                descripcion: 'Fundador de Macondo',
                notas: 'Obsesionado con la alquimia',
                nacimiento: 1820,
                muerte: 1870,
                relaciones: []
            },
            {
                id: 'p2',
                nombre: 'Úrsula',
                apellido: 'Iguarán',
                genero: 'femenino',
                edad: '115',
                estado: 'muerto',
                avatar: '',
                descripcion: 'Matriarca de la familia',
                notas: 'Vivió más de 100 años',
                nacimiento: 1825,
                muerte: 1940,
                relaciones: []
            }
        ]
    }];
    saveToLocalStorage();
}

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
    if (historial.length > 50) historial.pop(); // Mantener solo últimos 50
    localStorage.setItem('historial', JSON.stringify(historial));
}

// Mostrar obras
function loadObras() {
    const grid = document.getElementById('obrasGrid');
    let obrasFiltradas = obras;
    
    // Aplicar filtros
    if (searchTerm) {
        obrasFiltradas = obrasFiltradas.filter(obra => 
            obra.titulo.toLowerCase().includes(searchTerm) ||
            obra.genero?.toLowerCase().includes(searchTerm) ||
            obra.descripcion?.toLowerCase().includes(searchTerm) ||
            obra.personajes?.some(p => 
                p.nombre.toLowerCase().includes(searchTerm) ||
                p.apellido?.toLowerCase().includes(searchTerm)
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
            <p>👥 ${obra.personajes?.length || 0} personajes</p>
        </div>
    `).join('');
}

// Filtrar contenido
function filterContent() {
    searchTerm = document.getElementById('searchInput').value.toLowerCase();
    filterType = document.getElementById('filterType').value;
    
    if (obraActual) {
        loadPersonajes();
    } else {
        loadObras();
    }
}

// Abrir obra
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
            `<option value="${p.id}">${p.nombre} ${p.apellido || ''}</option>`
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

// Cambiar pestañas
function switchTab(tab) {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    
    const tabIndex = {
        'lista': 0,
        'galeria': 1,
        'timeline': 2,
        'comparativa': 3
    }[tab];
    
    document.querySelectorAll('.tab')[tabIndex].classList.add('active');
    document.getElementById(tab + 'View').classList.add('active');
    
    if (tab === 'galeria') loadGaleria();
    if (tab === 'timeline') loadTimeline();
    if (tab === 'comparativa') updateComparison();
}

// Mostrar personajes (con filtros)
function loadPersonajes() {
    const grid = document.getElementById('personajesGrid');
    if (!obraActual?.personajes?.length) {
        grid.innerHTML = '<div class="empty-message"><span class="icon">👤</span>No hay personajes</div>';
        return;
    }

    let personajesFiltrados = obraActual.personajes;
    
    if (searchTerm && filterType !== 'obras') {
        personajesFiltrados = personajesFiltrados.filter(p => 
            p.nombre.toLowerCase().includes(searchTerm) ||
            p.apellido?.toLowerCase().includes(searchTerm) ||
            p.descripcion?.toLowerCase().includes(searchTerm) ||
            p.notas?.toLowerCase().includes(searchTerm)
        );
    }

    // Agrupar por apellido
    const porApellido = {};
    personajesFiltrados.forEach(p => {
        const apellido = p.apellido || 'Sin apellido';
        if (!porApellido[apellido]) porApellido[apellido] = [];
        porApellido[apellido].push(p);
    });

    grid.innerHTML = Object.entries(porApellido).map(([apellido, personajes]) => `
        <div class="familia-group">
            <h3 class="familia-titulo">🏠 Familia ${apellido}</h3>
            <div class="personajes-subgrid">
                ${personajes.map(p => createPersonajeCard(p)).join('')}
            </div>
        </div>
    `).join('');

    // Cargar relaciones después de crear las cards
    personajesFiltrados.forEach(p => {
        const container = document.getElementById(`relaciones-${p.id}`);
        if (container) {
            if (p.relaciones?.length) {
                container.innerHTML = p.relaciones.map(r => {
                    const destino = obraActual.personajes.find(d => d.id === r.con);
                    if (!destino) return '';
                    
                    let icon = '🔗';
                    if (r.tipo.includes('padre') || r.tipo.includes('madre')) icon = '👨‍👧';
                    else if (r.tipo.includes('hijo') || r.tipo.includes('hija')) icon = '👶';
                    else if (r.tipo.includes('herman')) icon = '🤝';
                    else if (r.tipo.includes('espos')) icon = '💍';
                    else if (r.tipo.includes('novi')) icon = '💕';
                    else if (r.tipo.includes('amant')) icon = '💔';
                    else if (r.tipo.includes('amig')) icon = '😊';
                    else if (r.tipo.includes('enem')) icon = '⚔️';
                    
                    return `
                        <div class="relacion-item ${r.tipo}">
                            <span class="relacion-icon">${icon}</span>
                            <span class="relacion-texto">
                                <strong>${destino.nombre} ${destino.apellido || ''}</strong>
                            </span>
                            <span class="relacion-tipo-badge">${r.tipo}</span>
                        </div>
                    `;
                }).join('');
            } else {
                container.innerHTML = '<div style="color: #a0aec0; font-size: 13px; text-align: center; padding: 10px;">Sin relaciones</div>';
            }
        }
    });
}

function createPersonajeCard(p) {
    const estadoIcon = p.estado === 'vivo' ? '💚' : '💀';
    const avatarHtml = p.avatar 
        ? `<img src="${p.avatar}" alt="${p.nombre}">`
        : `<span>${p.nombre.charAt(0)}</span>`;
    
    return `
        <div class="personaje-card" onclick="expandPersonaje('${p.id}')">
            <div class="personaje-header">
                <div class="personaje-avatar-mini">
                    ${avatarHtml}
                </div>
                <div>
                    <h3>${p.nombre} ${p.apellido || ''}</h3>
                    <div class="personaje-badges">
                        <span class="badge ${p.genero}">${p.genero === 'masculino' ? '👨' : '👩'}</span>
                        <span class="badge edad">🎂 ${p.edad || '?'}</span>
                        <span class="badge estado">${estadoIcon}</span>
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

// Galería
function loadGaleria() {
    const grid = document.getElementById('galeriaGrid');
    if (!obraActual?.personajes?.length) {
        grid.innerHTML = '<div class="empty-message">No hay personajes</div>';
        return;
    }

    grid.innerHTML = obraActual.personajes.map(p => {
        const estadoIcon = p.estado === 'vivo' ? '💚' : '💀';
        const avatarHtml = p.avatar 
            ? `<img src="${p.avatar}" alt="${p.nombre}">`
            : `<span>${p.nombre.charAt(0)}</span>`;
        
        return `
            <div class="galeria-item" onclick="expandPersonaje('${p.id}')">
                <div class="galeria-avatar">
                    ${avatarHtml}
                </div>
                <div class="galeria-nombre">${p.nombre} ${p.apellido || ''}</div>
                <div class="galeria-edad">${estadoIcon} ${p.edad || '?'} años</div>
            </div>
        `;
    }).join('');
}

// Línea de tiempo
let timelineOrder = 'asc';

function loadTimeline() {
    const container = document.getElementById('timelineContainer');
    if (!obraActual?.personajes?.length) {
        container.innerHTML = '<div class="empty-message">No hay personajes</div>';
        return;
    }

    const personajesConFecha = obraActual.personajes.filter(p => p.nacimiento);
    if (personajesConFecha.length === 0) {
        container.innerHTML = '<div class="empty-message">No hay personajes con fecha de nacimiento</div>';
        return;
    }

    const ordenados = personajesConFecha.sort((a, b) => 
        timelineOrder === 'asc' ? a.nacimiento - b.nacimiento : b.nacimiento - a.nacimiento
    );

    container.innerHTML = ordenados.map(p => {
        const muerteTexto = p.muerte ? ` - ${p.muerte}` : '';
        const estadoIcon = p.estado === 'vivo' ? '💚' : '💀';
        
        return `
            <div class="timeline-item">
                <div class="timeline-content" onclick="expandPersonaje('${p.id}')">
                    <strong>${p.nombre} ${p.apellido || ''}</strong>
                    <div>${estadoIcon} ${p.nacimiento}${muerteTexto}</div>
                    ${p.descripcion ? `<small>${p.descripcion.substring(0, 50)}...</small>` : ''}
                </div>
                <div class="timeline-year">${p.nacimiento}</div>
            </div>
        `;
    }).join('');
}

function sortTimeline(order) {
    timelineOrder = order;
    loadTimeline();
}

// Comparativa
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
            <h3>${p1.nombre} ${p1.apellido || ''}</h3>
            <div class="comparativa-item">
                <div class="comparativa-label">Género</div>
                <div class="comparativa-valor">${p1.genero === 'masculino' ? '👨 Hombre' : '👩 Mujer'}</div>
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
            ${p1.nacimiento ? `
                <div class="comparativa-item">
                    <div class="comparativa-label">Nacimiento</div>
                    <div class="comparativa-valor">${p1.nacimiento}</div>
                </div>
            ` : ''}
        </div>
        <div class="comparativa-columna">
            <h3>${p2.nombre} ${p2.apellido || ''}</h3>
            <div class="comparativa-item">
                <div class="comparativa-label">Género</div>
                <div class="comparativa-valor">${p2.genero === 'masculino' ? '👨 Hombre' : '👩 Mujer'}</div>
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
            ${p2.nacimiento ? `
                <div class="comparativa-item">
                    <div class="comparativa-label">Nacimiento</div>
                    <div class="comparativa-valor">${p2.nacimiento}</div>
                </div>
            ` : ''}
        </div>
    `;
}

// Expandir personaje
function expandPersonaje(id) {
    const p = obraActual.personajes.find(p => p.id === id);
    const container = document.getElementById('personajeExpandidoContent');
    
    const avatarHtml = p.avatar 
        ? `<img src="${p.avatar}" alt="${p.nombre}">`
        : `<span>${p.nombre.charAt(0)}</span>`;
    
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
                <h2>${p.nombre} ${p.apellido || ''}</h2>
                
                <div class="info-grid">
                    <div class="info-item">
                        <div class="info-label">Género</div>
                        <div class="info-value">${p.genero === 'masculino' ? '👨 Hombre' : '👩 Mujer'}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Edad</div>
                        <div class="info-value">${p.edad || '?'} años</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Estado</div>
                        <div class="info-value">${p.estado === 'vivo' ? '💚 Vivo' : '💀 Muerto'}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Nacimiento/Muerte</div>
                        <div class="info-value">${p.nacimiento || '?'} - ${p.muerte || 'Presente'}</div>
                    </div>
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

// Imprimir personaje
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

// Mostrar historial
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

// Importar/Exportar
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
            obras = imported;
        } else if (imported.obras) {
            obras = imported.obras;
        } else {
            obras = [imported];
        }
        
        saveToLocalStorage();
        addToHistorial('Importación', `Importadas ${obras.length} obras`);
        hideModal('importModal');
        loadObras();
        alert('Importación exitosa');
    } catch (e) {
        alert('Error al importar: JSON inválido');
    }
}

// Modales
function showModal(id) {
    document.getElementById(id).classList.add('active');
}

function hideModal(id) {
    document.getElementById(id).classList.remove('active');
}

function showRelacionModal(personajeId) {
    const select = document.getElementById('relacionDestino');
    select.innerHTML = obraActual.personajes
        .filter(p => p.id !== personajeId)
        .map(p => `<option value="${p.id}">${p.nombre} ${p.apellido || ''}</option>`)
        .join('');
    
    document.getElementById('relacionOrigenId').value = personajeId;
    showModal('relacionModal');
}

// Guardar obra
function saveObra() {
    const id = document.getElementById('obraId').value;
    const titulo = document.getElementById('obraTitulo').value;
    
    if (!titulo) return alert('El título es obligatorio');

    if (id) {
        // Editar
        const obra = obras.find(o => o.id === id);
        obra.titulo = titulo;
        obra.genero = document.getElementById('obraGenero').value;
        obra.descripcion = document.getElementById('obraDescripcion').value;
        addToHistorial('Edición', `Editada obra: ${titulo}`);
    } else {
        // Nueva
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

// Guardar personaje
function savePersonaje() {
    const id = document.getElementById('personajeId').value;
    const nombre = document.getElementById('personajeNombre').value;
    
    if (!nombre) return alert('El nombre es obligatorio');

    const personajeData = {
        nombre,
        apellido: document.getElementById('personajeApellido').value,
        genero: document.getElementById('personajeGenero').value,
        edad: document.getElementById('personajeEdad').value,
        estado: document.getElementById('personajeEstado').value,
        avatar: document.getElementById('personajeAvatar').value,
        descripcion: document.getElementById('personajeDescripcion').value,
        notas: document.getElementById('personajeNotas').value,
        nacimiento: document.getElementById('personajeNacimiento').value,
        muerte: document.getElementById('personajeMuerte').value
    };

    if (id) {
        // Editar
        const p = obraActual.personajes.find(p => p.id === id);
        Object.assign(p, personajeData);
        addToHistorial('Edición', `Editado personaje: ${nombre}`);
    } else {
        // Nuevo
        if (!obraActual.personajes) obraActual.personajes = [];
        obraActual.personajes.push({
            id: Date.now().toString(),
            ...personajeData,
            relaciones: []
        });
        addToHistorial('Creación', `Nuevo personaje: ${nombre}`);
    }

    updateObra();
    hideModal('personajeModal');
    clearPersonajeForm();
    loadPersonajes();
    if (document.getElementById('galeriaView').classList.contains('active')) loadGaleria();
    if (document.getElementById('timelineView').classList.contains('active')) loadTimeline();
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
}

// Guardar relación (con bidireccionalidad automática)
function saveRelacion() {
    const origenId = document.getElementById('relacionOrigenId').value;
    const destinoId = document.getElementById('relacionDestino').value;
    const tipo = document.getElementById('relacionTipo').value;

    if (!destinoId) return alert('Selecciona un personaje');

    const origen = obraActual.personajes.find(p => p.id === origenId);
    const destino = obraActual.personajes.find(p => p.id === destinoId);

    if (!origen.relaciones) origen.relaciones = [];
    if (!destino.relaciones) destino.relaciones = [];

    // Relación inversa
    let tipoInverso = '';
    const relacionesInversas = {
        'padre': 'hijo', 'madre': 'hija', 'hijo': 'padre', 'hija': 'madre',
        'hermano': 'hermano', 'hermana': 'hermana',
        'esposo': 'esposa', 'esposa': 'esposo',
        'novio': 'novia', 'novia': 'novio',
        'amante': 'amante',
        'amigo': 'amigo', 'amiga': 'amiga',
        'enemigo': 'enemigo', 'enemiga': 'enemiga'
    };
    tipoInverso = relacionesInversas[tipo];

    // Agregar relaciones
    origen.relaciones.push({ con: destinoId, tipo });
    
    const existeInversa = destino.relaciones.some(r => r.con === origenId);
    if (!existeInversa) {
        destino.relaciones.push({ con: origenId, tipo: tipoInverso });
    }

    addToHistorial('Relación', `${origen.nombre} es ${tipo} de ${destino.nombre}`);
    updateObra();
    hideModal('relacionModal');
    loadPersonajes();
}

// Editar personaje
function editPersonaje(id) {
    const p = obraActual.personajes.find(p => p.id === id);
    document.getElementById('personajeModalTitle').textContent = '✏️ Editar Personaje';
    document.getElementById('personajeId').value = p.id;
    document.getElementById('personajeNombre').value = p.nombre;
    document.getElementById('personajeApellido').value = p.apellido || '';
    document.getElementById('personajeGenero').value = p.genero;
    document.getElementById('personajeEdad').value = p.edad || '';
    document.getElementById('personajeEstado').value = p.estado || 'vivo';
    document.getElementById('personajeAvatar').value = p.avatar || '';
    document.getElementById('personajeDescripcion').value = p.descripcion || '';
    document.getElementById('personajeNotas').value = p.notas || '';
    document.getElementById('personajeNacimiento').value = p.nacimiento || '';
    document.getElementById('personajeMuerte').value = p.muerte || '';
    showModal('personajeModal');
}

// Confirmar eliminación
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
        
        addToHistorial('Eliminación', `Eliminado personaje: ${personaje.nombre}`);
        updateObra();
        loadPersonajes();
        if (document.getElementById('galeriaView').classList.contains('active')) loadGaleria();
        if (document.getElementById('timelineView').classList.contains('active')) loadTimeline();
    }
    hideModal('confirmModal');
}

function updateObra() {
    const index = obras.findIndex(o => o.id === obraActual.id);
    obras[index] = obraActual;
    saveToLocalStorage();
}

// Iniciar
loadObras();
