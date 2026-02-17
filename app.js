// Datos
let obras = JSON.parse(localStorage.getItem('obras')) || [];
let obraActual = null;
let itemToDelete = null;

// Splash
setTimeout(() => {
    document.getElementById('splash').classList.add('hidden');
    document.getElementById('mainContainer').style.display = 'block';
}, 1500);

// Mostrar obras
function loadObras() {
    const grid = document.getElementById('obrasGrid');
    if (obras.length === 0) {
        grid.innerHTML = '<div class="empty-message"><span class="icon">📚</span>No hay obras. ¡Crea la primera!</div>';
        return;
    }

    grid.innerHTML = obras.map(obra => `
        <div class="obra-card" onclick="openObra('${obra.id}')">
            <button class="delete-btn" onclick="event.stopPropagation(); showConfirm('obra', '${obra.id}')">×</button>
            <h3>${obra.titulo}</h3>
            <p>📖 ${obra.genero || 'Sin género'}</p>
            <p>📝 ${obra.descripcion ? obra.descripcion.substring(0, 50) + '...' : 'Sin descripción'}</p>
            <p>👥 ${obra.personajes?.length || 0} personajes</p>
        </div>
    `).join('');
}

// Abrir obra
function openObra(id) {
    obraActual = obras.find(o => o.id === id);
    document.getElementById('obraTitle').textContent = obraActual.titulo;
    document.getElementById('mainContainer').style.display = 'none';
    document.getElementById('obraContainer').style.display = 'block';
    loadPersonajes();
}

function backToObras() {
    document.getElementById('obraContainer').style.display = 'none';
    document.getElementById('mainContainer').style.display = 'block';
    obraActual = null;
}

// Mostrar personajes
function loadPersonajes() {
    const grid = document.getElementById('personajesGrid');
    if (!obraActual?.personajes?.length) {
        grid.innerHTML = '<div class="empty-message"><span class="icon">👤</span>No hay personajes. ¡Crea el primero!</div>';
        return;
    }

    grid.innerHTML = obraActual.personajes.map(p => `
        <div class="personaje-card">
            <div class="personaje-header">
                <h3>${p.nombre}</h3>
                <div class="personaje-badges">
                    <span class="badge ${p.genero}">${p.genero === 'masculino' ? '👨 Hombre' : '👩 Mujer'}</span>
                    <span class="badge edad">🎂 ${p.edad || '?'}</span>
                </div>
            </div>
            
            ${p.descripcion ? `<div class="personaje-descripcion">📝 ${p.descripcion}</div>` : ''}
            
            <div class="personaje-actions">
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

            <div class="relaciones-section">
                <div class="relaciones-title">🔗 RELACIONES</div>
                <div class="relaciones-list" id="relaciones-${p.id}"></div>
            </div>
        </div>
    `).join('');

    // Mostrar relaciones de cada personaje
    obraActual.personajes.forEach(p => {
        const container = document.getElementById(`relaciones-${p.id}`);
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
                            <strong>${destino.nombre}</strong>
                        </span>
                        <span class="relacion-tipo-badge">${r.tipo}</span>
                    </div>
                `;
            }).join('');
        } else {
            container.innerHTML = '<div style="color: #a0aec0; font-size: 13px; text-align: center; padding: 10px;">Sin relaciones</div>';
        }
    });
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
        .map(p => `<option value="${p.id}">${p.nombre}</option>`)
        .join('');
    
    document.getElementById('relacionOrigenId').value = personajeId;
    showModal('relacionModal');
}

// Guardar obra
function saveObra() {
    const titulo = document.getElementById('obraTitulo').value;
    if (!titulo) return alert('El título es obligatorio');

    obras.push({
        id: Date.now().toString(),
        titulo,
        genero: document.getElementById('obraGenero').value,
        descripcion: document.getElementById('obraDescripcion').value,
        personajes: []
    });

    localStorage.setItem('obras', JSON.stringify(obras));
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

    if (id) {
        // Editar
        const p = obraActual.personajes.find(p => p.id === id);
        p.nombre = nombre;
        p.genero = document.getElementById('personajeGenero').value;
        p.edad = document.getElementById('personajeEdad').value;
        p.descripcion = document.getElementById('personajeDescripcion').value;
    } else {
        // Nuevo
        if (!obraActual.personajes) obraActual.personajes = [];
        obraActual.personajes.push({
            id: Date.now().toString(),
            nombre,
            genero: document.getElementById('personajeGenero').value,
            edad: document.getElementById('personajeEdad').value,
            descripcion: document.getElementById('personajeDescripcion').value,
            relaciones: []
        });
    }

    updateObra();
    hideModal('personajeModal');
    document.getElementById('personajeId').value = '';
    document.getElementById('personajeNombre').value = '';
    document.getElementById('personajeEdad').value = '';
    document.getElementById('personajeDescripcion').value = '';
    loadPersonajes();
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
    switch(tipo) {
        case 'padre': tipoInverso = 'hijo'; break;
        case 'madre': tipoInverso = 'hija'; break;
        case 'hijo': tipoInverso = 'padre'; break;
        case 'hija': tipoInverso = 'madre'; break;
        case 'hermano': tipoInverso = 'hermano'; break;
        case 'hermana': tipoInverso = 'hermana'; break;
        case 'esposo': tipoInverso = 'esposa'; break;
        case 'esposa': tipoInverso = 'esposo'; break;
        case 'novio': tipoInverso = 'novia'; break;
        case 'novia': tipoInverso = 'novio'; break;
        case 'amante': tipoInverso = 'amante'; break;
        case 'amigo': tipoInverso = 'amigo'; break;
        case 'amiga': tipoInverso = 'amiga'; break;
        case 'enemigo': tipoInverso = 'enemigo'; break;
        case 'enemiga': tipoInverso = 'enemiga'; break;
    }

    // Agregar relaciones
    origen.relaciones.push({ con: destinoId, tipo });
    
    // Evitar duplicados en la relación inversa
    const existeInversa = destino.relaciones.some(r => r.con === origenId);
    if (!existeInversa) {
        destino.relaciones.push({ con: origenId, tipo: tipoInverso });
    }

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
    document.getElementById('personajeGenero').value = p.genero;
    document.getElementById('personajeEdad').value = p.edad;
    document.getElementById('personajeDescripcion').value = p.descripcion || '';
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
        obras = obras.filter(o => o.id !== itemToDelete.id);
        localStorage.setItem('obras', JSON.stringify(obras));
        if (obraActual?.id === itemToDelete.id) backToObras();
        loadObras();
    } else {
        // Eliminar personaje y sus relaciones
        obraActual.personajes = obraActual.personajes.filter(p => p.id !== itemToDelete.id);
        
        // Eliminar relaciones que apuntaban a este personaje
        obraActual.personajes.forEach(p => {
            if (p.relaciones) {
                p.relaciones = p.relaciones.filter(r => r.con !== itemToDelete.id);
            }
        });
        
        updateObra();
        loadPersonajes();
    }
    hideModal('confirmModal');
}

function updateObra() {
    const index = obras.findIndex(o => o.id === obraActual.id);
    obras[index] = obraActual;
    localStorage.setItem('obras', JSON.stringify(obras));
}

// Iniciar
loadObras();
