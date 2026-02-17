// Variables globales
let obras = JSON.parse(localStorage.getItem('obras')) || [];
let obraActual = null;
let tabActual = 'personajes';
let elementoAEliminar = null;

// Variables para la constelación
let canvas, ctx;
let personajes = [];
let animacionFrame;
let hoveredPersonaje = null;
let selectedPersonaje = null;
let mouseX = 0, mouseY = 0;
let constelacionIniciada = false;

// Splash screen
setTimeout(() => {
    document.getElementById('splash').classList.add('hidden');
    setTimeout(() => {
        document.getElementById('splash').style.display = 'none';
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
    constelacionIniciada = false; // Resetear cuando se abre nueva obra
}

function cerrarObraWindow() {
    document.getElementById('obraWindow').classList.remove('active');
    obraActual = null;
    if (animacionFrame) {
        cancelAnimationFrame(animacionFrame);
        animacionFrame = null;
    }
    constelacionIniciada = false;
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
    if (tabActual === 'constelacion') {
        iniciarConstelacion();
    }
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
    
    // Verificar si ya existe la relación
    const existe = origen.relaciones.some(r => r.con === destinoId);
    if (!existe) {
        origen.relaciones.push({
            con: destinoId,
            tipo: tipo
        });
        
        const index = obras.findIndex(o => o.id === obraActual.id);
        obras[index] = obraActual;
        localStorage.setItem('obras', JSON.stringify(obras));
    }
    
    cerrarModal('modalRelacion');
    mostrarPersonajes();
    if (tabActual === 'constelacion') {
        iniciarConstelacion();
    }
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
        if (tabActual === 'constelacion') {
            iniciarConstelacion();
        }
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
    document.getElementById('tabConstelacion').style.display = tab === 'constelacion' ? 'block' : 'none';
    
    if (tab === 'personajes') {
        mostrarPersonajes();
    } else if (tab === 'constelacion') {
        // Pequeño retraso para asegurar que el DOM está listo
        setTimeout(() => {
            iniciarConstelacion();
        }, 100);
    }
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

// Iniciar constelación
function iniciarConstelacion() {
    console.log('Iniciando constelación...');
    
    if (!obraActual) {
        console.log('No hay obra actual');
        return;
    }
    
    if (!obraActual.personajes || obraActual.personajes.length === 0) {
        console.log('No hay personajes');
        const container = document.getElementById('constelacionContainer');
        if (container) {
            container.innerHTML = '<div class="empty-message">👤 No hay personajes para mostrar</div>';
        }
        return;
    }
    
    // Obtener canvas
    canvas = document.getElementById('constelacionCanvas');
    if (!canvas) {
        console.log('Canvas no encontrado');
        return;
    }
    
    console.log('Canvas encontrado, dimensiones:', canvas.clientWidth, canvas.clientHeight);
    
    // Ajustar tamaño del canvas
    canvas.width = canvas.clientWidth || 800;
    canvas.height = canvas.clientHeight || 600;
    
    ctx = canvas.getContext('2d');
    
    // Inicializar posiciones de personajes si es necesario
    if (!constelacionIniciada || personajes.length === 0) {
        console.log('Inicializando posiciones de personajes');
        personajes = obraActual.personajes.map(p => ({
            ...p,
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            vx: (Math.random() - 0.5) * 0.5,
            vy: (Math.random() - 0.5) * 0.5,
            radius: 40
        }));
        constelacionIniciada = true;
    }
    
    // Eventos del mouse
    canvas.addEventListener('mousemove', manejarMouseMove);
    canvas.addEventListener('click', manejarClick);
    canvas.addEventListener('mouseleave', () => {
        hoveredPersonaje = null;
    });
    
    // Iniciar animación
    if (animacionFrame) {
        cancelAnimationFrame(animacionFrame);
    }
    animar();
}

function manejarMouseMove(e) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    mouseX = (e.clientX - rect.left) * scaleX;
    mouseY = (e.clientY - rect.top) * scaleY;
    
    // Detectar personaje bajo el mouse
    hoveredPersonaje = null;
    for (let i = personajes.length - 1; i >= 0; i--) {
        const p = personajes[i];
        const dx = mouseX - p.x;
        const dy = mouseY - p.y;
        const distancia = Math.sqrt(dx * dx + dy * dy);
        
        if (distancia < p.radius) {
            hoveredPersonaje = p;
            break;
        }
    }
}

function manejarClick() {
    if (hoveredPersonaje) {
        selectedPersonaje = hoveredPersonaje === selectedPersonaje ? null : hoveredPersonaje;
    }
}

// Animar constelación
function animar() {
    if (!ctx || !canvas) {
        console.log('Contexto o canvas no disponible');
        return;
    }
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Dibujar estrellas de fondo
    ctx.fillStyle = 'white';
    for (let i = 0; i < 50; i++) {
        const x = (i * 37) % canvas.width;
        const y = (i * 73) % canvas.height;
        ctx.beginPath();
        ctx.arc(x, y, 1, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${0.3 + Math.sin(Date.now() * 0.001 + i) * 0.2})`;
        ctx.fill();
    }
    
    // Dibujar líneas de relaciones
    personajes.forEach(p => {
        if (p.relaciones && p.relaciones.length > 0) {
            p.relaciones.forEach(rel => {
                const destino = personajes.find(d => d.id === rel.con);
                if (destino) {
                    ctx.beginPath();
                    ctx.moveTo(p.x, p.y);
                    ctx.lineTo(destino.x, destino.y);
                    
                    // Color según tipo de relación
                    let color;
                    if (['padre', 'madre', 'hijo', 'hija', 'hermano', 'hermana'].includes(rel.tipo)) {
                        color = '#48bb78';
                    } else if (['esposo', 'esposa', 'novio', 'novia', 'amante'].includes(rel.tipo)) {
                        color = '#ed64a6';
                    } else if (['amigo', 'amiga'].includes(rel.tipo)) {
                        color = '#4299e1';
                    } else if (['enemigo', 'enemiga'].includes(rel.tipo)) {
                        color = '#f56565';
                    } else {
                        color = '#718096';
                    }
                    
                    ctx.strokeStyle = color;
                    ctx.lineWidth = (selectedPersonaje === p || selectedPersonaje === destino) ? 3 : 1.5;
                    ctx.shadowColor = color;
                    ctx.shadowBlur = (selectedPersonaje === p || selectedPersonaje === destino) ? 15 : 5;
                    ctx.stroke();
                }
            });
        }
    });
    
    ctx.shadowBlur = 0;
    
    // Dibujar personajes
    personajes.forEach(p => {
        // Actualizar posiciones
        p.x += p.vx;
        p.y += p.vy;
        
        // Rebotar en bordes
        if (p.x < p.radius || p.x > canvas.width - p.radius) {
            p.vx *= -0.9;
            p.x = Math.max(p.radius, Math.min(canvas.width - p.radius, p.x));
        }
        if (p.y < p.radius || p.y > canvas.height - p.radius) {
            p.vy *= -0.9;
            p.y = Math.max(p.radius, Math.min(canvas.height - p.radius, p.y));
        }
        
        // Atracción suave hacia el centro
        const centroX = canvas.width / 2;
        const centroY = canvas.height / 2;
        const dx = centroX - p.x;
        const dy = centroY - p.y;
        p.vx += dx * 0.0005;
        p.vy += dy * 0.0005;
        
        // Limitar velocidad
        const velocidad = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
        if (velocidad > 2) {
            p.vx *= 0.98;
            p.vy *= 0.98;
        }
        
        // Círculo exterior
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        
        // Gradiente según género
        const gradient = ctx.createRadialGradient(p.x - 5, p.y - 5, 5, p.x, p.y, p.radius);
        if (p.genero === 'masculino') {
            gradient.addColorStop(0, '#4299e1');
            gradient.addColorStop(1, '#2b6cb0');
        } else {
            gradient.addColorStop(0, '#ed64a6');
            gradient.addColorStop(1, '#d53f8c');
        }
        
        ctx.fillStyle = gradient;
        ctx.shadowColor = p.genero === 'masculino' ? '#4299e1' : '#ed64a6';
        ctx.shadowBlur = hoveredPersonaje === p ? 25 : 15;
        ctx.fill();
        
        // Borde si está seleccionado
        if (selectedPersonaje === p) {
            ctx.strokeStyle = 'white';
            ctx.lineWidth = 3;
            ctx.shadowBlur = 20;
            ctx.shadowColor = 'white';
            ctx.stroke();
        }
        
        // Icono de persona
        ctx.font = '24px Arial';
        ctx.fillStyle = 'white';
        ctx.shadowBlur = 10;
        ctx.shadowColor = 'rgba(0,0,0,0.5)';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('👤', p.x, p.y - 5);
        
        // Nombre
        ctx.font = 'bold 12px Arial';
        ctx.fillStyle = 'white';
        ctx.shadowBlur = 5;
        ctx.fillText(p.nombre.split(' ')[0], p.x, p.y + 20);
        
        // Edad
        ctx.font = '10px Arial';
        ctx.fillStyle = 'rgba(255,255,255,0.8)';
        ctx.fillText(p.edad + ' años', p.x, p.y + 35);
    });
    
    // Tooltip
    if (hoveredPersonaje && hoveredPersonaje !== selectedPersonaje) {
        ctx.font = '14px Arial';
        ctx.fillStyle = 'white';
        ctx.shadowBlur = 10;
        ctx.shadowColor = 'black';
        ctx.fillText(hoveredPersonaje.nombre, mouseX, mouseY - 20);
        
        if (hoveredPersonaje.relaciones && hoveredPersonaje.relaciones.length > 0) {
            ctx.font = '12px Arial';
            ctx.fillStyle = '#A0AEC0';
            ctx.fillText(hoveredPersonaje.relaciones.length + ' relaciones', mouseX, mouseY);
        }
    }
    
    animacionFrame = requestAnimationFrame(animar);
}

// Función para color de relación
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

// Inicializar
mostrarObras();

// Cerrar modales al hacer click fuera
window.onclick = function(event) {
    if (event.target.classList.contains('modal')) {
        event.target.classList.remove('active');
    }
};

// Ajustar canvas al cambiar tamaño
window.addEventListener('resize', () => {
    if (tabActual === 'constelacion' && canvas) {
        canvas.width = canvas.clientWidth;
        canvas.height = canvas.clientHeight;
    }
});
