document.addEventListener('DOMContentLoaded', () => {
    // ===== INITIALIZE AOS (Animate On Scroll) =====
    AOS.init({
        duration: 800,
        easing: 'ease-out-cubic',
        once: true,
        offset: 50
    });

    // ===== MOBILE MENU =====
    const hamburger = document.getElementById('hamburger');
    const navLinksContainer = document.getElementById('nav-links');

    if (hamburger && navLinksContainer) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            navLinksContainer.classList.toggle('open');
            document.body.style.overflow = navLinksContainer.classList.contains('open') ? 'hidden' : '';
        });

        // Close menu when clicking a link
        const navLinks = navLinksContainer.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                hamburger.classList.remove('active');
                navLinksContainer.classList.remove('open');
                document.body.style.overflow = '';
            });
        });
    }

    // ===== NAVBAR SCROLL EFFECT =====
    const navbar = document.getElementById('navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.style.background = 'rgba(15, 17, 21, 0.8)';
            navbar.style.boxShadow = '0 4px 30px rgba(0, 0, 0, 0.1)';
        } else {
            navbar.style.background = 'rgba(15, 17, 21, 0.4)';
            navbar.style.boxShadow = 'none';
        }
    });

    // ===== NAVBAR SCROLL SPY =====
    const navLinks = document.querySelectorAll('.nav-link');
    const spySections = Array.from(navLinks).map(link => document.querySelector(link.getAttribute('href')));

    function updateActiveNavbar() {
        let activeLinkIndex = 0;
        const scrollPosition = window.scrollY + 120; // Offset for navbar height

        spySections.forEach((section, index) => {
            if (section) {
                const top = section.offsetTop;
                if (scrollPosition >= top) {
                    activeLinkIndex = index;
                }
            }
        });

        navLinks.forEach((link, index) => {
            if (index === activeLinkIndex) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    }

    window.addEventListener('scroll', updateActiveNavbar);
    updateActiveNavbar(); // Initial run





    // ===== 3D SECTION TRANSITIONS ON SCROLL =====
    const allSections = document.querySelectorAll('section');

    function animate3DSections() {
        const viewportHeight = window.innerHeight;
        const viewportCenter = viewportHeight / 2;

        allSections.forEach(sec => {
            const rect = sec.getBoundingClientRect();
            
            // Skip sections completely outside of view for rendering performance
            if (rect.bottom < -50 || rect.top > viewportHeight + 50) return;

            const secCenter = rect.top + rect.height / 2;
            
            // Normalized distance from viewport center (range -1 to 1)
            const distance = (secCenter - viewportCenter) / (viewportHeight + rect.height / 2);
            const clampedDistance = Math.max(-1, Math.min(1, distance));

            // Smooth eased factor using sine wave for more fluid transitions
            const easedFactor = Math.sin(clampedDistance * Math.PI / 2);

            // Calculate tilt angle (rotateX) and depth translation (translateZ)
            const angle = easedFactor * 5; // Max tilt: 5 degrees (subtler & more readable)
            const zDepth = -Math.abs(easedFactor) * 40; // Max depth push-back: -40px
            const opacity = 1 - Math.abs(easedFactor) * 0.25; // Slight fading on margins

            sec.style.transform = `perspective(1600px) rotateX(${angle}deg) translateZ(${zDepth}px)`;
            sec.style.opacity = opacity;
        });
    }

    window.addEventListener('scroll', animate3DSections);
    animate3DSections(); // Initial run


    // ===== 3D CARD HOVER TILT =====
    const tiltCards = document.querySelectorAll('.service-card, .workflow-card, .how-card, .contact-form-wrapper');
    
    tiltCards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            // Map mouse coordinates relative to card center to a max tilt of 6 degrees
            const rotateX = ((centerY - y) / centerY) * 6;
            const rotateY = ((x - centerX) / centerX) * 6;
            
            card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.025, 1.025, 1.025)`;
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = `perspective(800px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
        });
    });
    // ===== DIGITAL TWINS CAROUSEL GALLERY WITH FOCUSED EXPANSION =====
    const track = document.getElementById('carousel-track');
    const prevBtn = document.getElementById('carousel-prev');
    const nextBtn = document.getElementById('carousel-next');
    const dotsContainer = document.getElementById('carousel-dots');
    const showroomCarousel = document.querySelector('.showroom-carousel');
    const cards = track ? Array.from(track.children) : [];
    
    const initFunctions = {
        'refinery': window.initRefinery3D,
        'bridge': window.initBridge3D,
        'warehouse': window.initWarehouse3D,
        'separator': window.initSeparator3D,
        'energy': window.initEnergy3D
    };

    let activeIndex = 0;
    const showroomInstances = new Map();

    if (track && prevBtn && nextBtn && dotsContainer && showroomCarousel) {
        // Create dots dynamically
        cards.forEach((_, index) => {
            const dot = document.createElement('div');
            dot.classList.add('carousel-dot');
            if (index === 0) dot.classList.add('active');
            dot.addEventListener('click', () => {
                goToSlide(index);
            });
            dotsContainer.appendChild(dot);
        });

        const dots = Array.from(dotsContainer.children);

        function updateCarousel() {
            if (cards.length === 0) return;
            
            // Remove active class from all cards
            cards.forEach((card) => {
                card.classList.remove('active-card');
            });

            // Add active class to focused card
            const activeCard = cards[activeIndex];
            activeCard.classList.add('active-card');

            // Centering calculation:
            // Translate track so that the activeCard is in the center of the showroomCarousel viewport
            const viewportWidth = showroomCarousel.clientWidth;
            const cardWidth = activeCard.clientWidth;
            const gap = 30; // Gap between cards in CSS
            
            // Calculate active card offset relative to the track start
            const activeCardOffset = activeIndex * (cardWidth + gap);
            
            // Translate offset to center the active card perfectly
            const translateOffset = activeCardOffset - (viewportWidth / 2) + (cardWidth / 2);
            
            track.style.transform = `translateX(-${translateOffset}px)`;

            // Update buttons
            prevBtn.disabled = activeIndex === 0;
            nextBtn.disabled = activeIndex >= cards.length - 1;

            // Update active dots
            dots.forEach((dot, index) => {
                if (index === activeIndex) {
                    dot.classList.add('active');
                } else {
                    dot.classList.remove('active');
                }
            });
        }

        function goToSlide(index) {
            activeIndex = Math.max(0, Math.min(index, cards.length - 1));
            updateCarousel();
        }

        prevBtn.addEventListener('click', () => {
            goToSlide(activeIndex - 1);
        });

        nextBtn.addEventListener('click', () => {
            goToSlide(activeIndex + 1);
        });

        // Click on inactive card focuses it
        cards.forEach((card, index) => {
            card.addEventListener('click', (e) => {
                if (!e.target.closest('.btn-showroom-action') && index !== activeIndex) {
                    goToSlide(index);
                }
            });
        });

        // CASCADING STAGGERED INITIALIZATION OF ALL 5 3D SCENES
        cards.forEach((card, index) => {
            const canvasContainer = card.querySelector('.card-canvas');
            if (!canvasContainer) return;
            
            let modelType = '';
            if (canvasContainer.id.includes('refinery')) modelType = 'refinery';
            else if (canvasContainer.id.includes('bridge')) modelType = 'bridge';
            else if (canvasContainer.id.includes('warehouse')) modelType = 'warehouse';
            else if (canvasContainer.id.includes('separator')) modelType = 'separator';
            else if (canvasContainer.id.includes('energy')) modelType = 'energy';

            // Stagger loading delay by 150ms per card to protect CPU from load spikes
            setTimeout(() => {
                if (modelType && initFunctions[modelType] && canvasContainer.innerHTML === '') {
                    canvasContainer.classList.add('webgl-active');
                    const instance = initFunctions[modelType](canvasContainer);
                    
                    // Enable autoRotate inside card viewports for continuous dynamic preview
                    if (instance && instance.controls) {
                        instance.controls.autoRotate = true;
                        instance.controls.autoRotateSpeed = 1.5;
                    }
                    
                    // Store instance reference
                    showroomInstances.set(index, instance);
                }
            }, index * 150);

            // HOVER PREMIUM: Accelerate rotation on hover, decelerate on leave
            card.addEventListener('mouseenter', () => {
                const inst = showroomInstances.get(index);
                if (inst && inst.controls) {
                    inst.controls.autoRotateSpeed = 4.5;
                }
            });
            card.addEventListener('mouseleave', () => {
                const inst = showroomInstances.get(index);
                if (inst && inst.controls) {
                    inst.controls.autoRotateSpeed = 1.5;
                }
            });
        });

        window.addEventListener('resize', updateCarousel);
        
        // Initial setup with a slight delay to ensure layouts are settled
        setTimeout(updateCarousel, 200);
    }


    // ===== DCS SIMULATION FULL-SCREEN HOLOGRAM MODAL =====
    const modalOverlay = document.getElementById('hologram-modal');
    const modalTitle = document.getElementById('modal-title-text');
    const modalWebGLContainer = document.getElementById('modal-webgl-container');
    const modalConsole = document.getElementById('modal-console-logs');
    
    let modal3DInstance = null;
    let modalTelemetryTimer = null;
    let modalLogsTimer = null;
    let isModalRotating = true;

    window.openHologramModal = function(type, titleText) {
        if (!modalOverlay || !modalWebGLContainer) return;
        
        if (modalTitle) {
            modalTitle.innerText = titleText;
        }

        // Show modal overlay
        modalOverlay.classList.add('active');
        document.body.style.overflow = 'hidden'; // Lock background scroll

        // Clean WebGL container
        modalWebGLContainer.innerHTML = '';

        // Initialize 3D Model in modal container
        if (type && initFunctions[type]) {
            modal3DInstance = initFunctions[type](modalWebGLContainer);
            if (modal3DInstance && modal3DInstance.controls) {
                modal3DInstance.controls.autoRotate = isModalRotating;
                modal3DInstance.controls.autoRotateSpeed = 1.0;
            }
        }

        // Start telemetry and AI console logs loops
        startModalTelemetry();
        startModalLogs(type);
    };

    window.closeHologramModal = function() {
        if (!modalOverlay) return;
        
        modalOverlay.classList.remove('active');
        document.body.style.overflow = ''; // Unlock scroll

        // Clear WebGL container to trigger self-destruction in the model script
        if (modalWebGLContainer) {
            modalWebGLContainer.innerHTML = '';
        }
        modal3DInstance = null;

        // Clear timers
        if (modalTelemetryTimer) cancelAnimationFrame(modalTelemetryTimer);
        if (modalLogsTimer) clearInterval(modalLogsTimer);
        
        if (modalConsole) {
            modalConsole.innerHTML = '';
        }
    };

    window.toggleModalRotation = function() {
        if (!modal3DInstance || !modal3DInstance.controls) return;
        isModalRotating = !isModalRotating;
        modal3DInstance.controls.autoRotate = isModalRotating;
        
        const btn = document.getElementById('btn-modal-rotate');
        if (btn) {
            btn.innerText = `Autorotación: ${isModalRotating ? 'ON' : 'OFF'}`;
        }
    };

    window.resetModalCamera = function() {
        if (!modal3DInstance || !modal3DInstance.controls || !modal3DInstance.camera) return;
        
        modal3DInstance.controls.reset();
        
        // Restore defaults
        modal3DInstance.camera.position.set(-900, 700, 1100);
        modal3DInstance.controls.target.set(100, 0, -100);
        modal3DInstance.controls.update();
    };

    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modalOverlay && modalOverlay.classList.contains('active')) {
            closeHologramModal();
        }
    });


    // ===== 2D CANVAS TELEMETRY GENERATOR =====
    
    // 1. Scroll-down sections mini charts
    const miniCharts = document.querySelectorAll('.telemetry-mini-chart');
    const miniChartsInstances = [];

    miniCharts.forEach(canvas => {
        const ctx = canvas.getContext('2d');
        const type = canvas.dataset.type || 'bridge';
        
        function resizeCanvas() {
            canvas.width = canvas.parentElement.clientWidth;
            canvas.height = canvas.parentElement.clientHeight;
        }
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        miniChartsInstances.push({
            canvas: canvas,
            ctx: ctx,
            type: type,
            offset: Math.random() * 100
        });
    });

    let miniChartsFrame = null;
    function animateMiniCharts(time) {
        miniChartsInstances.forEach(item => {
            const ctx = item.ctx;
            const w = item.canvas.width;
            const h = item.canvas.height;
            if (w === 0 || h === 0) return;

            ctx.clearRect(0, 0, w, h);
            
            // Draw grid lines
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
            ctx.lineWidth = 1;
            const gridSpacing = 20;
            for (let x = 0; x < w; x += gridSpacing) {
                ctx.beginPath();
                ctx.moveTo(x, 0);
                ctx.lineTo(x, h);
                ctx.stroke();
            }
            for (let y = 0; y < h; y += gridSpacing) {
                ctx.beginPath();
                ctx.moveTo(0, y);
                ctx.lineTo(w, y);
                ctx.stroke();
            }

            // Draw data wave
            ctx.beginPath();
            ctx.lineWidth = 1.5;
            
            if (item.type === 'bridge') {
                // Bridge: high-frequency small vibrations
                ctx.strokeStyle = '#a855f7'; // Purple
                ctx.shadowColor = '#a855f7';
                ctx.shadowBlur = 4;
                for (let x = 0; x < w; x++) {
                    const noise = Math.sin(x * 0.08 + time * 0.005) * 6 + Math.sin(x * 0.2 + time * 0.01) * 2;
                    const y = h / 2 + noise;
                    if (x === 0) ctx.moveTo(x, y);
                    else ctx.lineTo(x, y);
                }
            } 
            else if (item.type === 'warehouse') {
                // Warehouse: step pulse shapes
                ctx.strokeStyle = '#00f2fe'; // Cyan
                ctx.shadowColor = '#00f2fe';
                ctx.shadowBlur = 4;
                for (let x = 0; x < w; x++) {
                    const pulse = Math.sin(x * 0.02 + time * 0.003) > 0.6 ? 20 : 0;
                    const noise = Math.sin(x * 0.1 + time * 0.01) * 2;
                    const y = h / 2 - 10 + pulse + noise;
                    if (x === 0) ctx.moveTo(x, y);
                    else ctx.lineTo(x, y);
                }
            } 
            else if (item.type === 'separator') {
                // Separator: slow fluid level waves
                ctx.strokeStyle = '#f97316'; // Orange
                ctx.shadowColor = '#f97316';
                ctx.shadowBlur = 4;
                for (let x = 0; x < w; x++) {
                    const wave = Math.sin(x * 0.01 + time * 0.001) * 12 + Math.cos(x * 0.03 + time * 0.002) * 4;
                    const y = h / 2 + wave;
                    if (x === 0) ctx.moveTo(x, y);
                    else ctx.lineTo(x, y);
                }
            } 
            else if (item.type === 'energy') {
                // Energy: grid spikes
                ctx.strokeStyle = '#10b981'; // Green
                ctx.shadowColor = '#10b981';
                ctx.shadowBlur = 4;
                for (let x = 0; x < w; x++) {
                    const cycle = Math.sin(x * 0.04 + time * 0.004) * 15 * Math.sin(time * 0.0005);
                    const y = h / 2 + cycle;
                    if (x === 0) ctx.moveTo(x, y);
                    else ctx.lineTo(x, y);
                }
            }
            
            ctx.stroke();
            ctx.shadowBlur = 0;
        });
        
        miniChartsFrame = requestAnimationFrame(animateMiniCharts);
    }
    animateMiniCharts(0);


    // 2. Modal Large Oscilloscope Chart
    function startModalTelemetry() {
        const canvas = document.getElementById('telemetry-chart-canvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        
        function resize() {
            canvas.width = canvas.parentElement.clientWidth;
            canvas.height = canvas.parentElement.clientHeight || 170;
        }
        resize();

        function draw(timestamp) {
            const w = canvas.width;
            const h = canvas.height;
            if (w === 0 || h === 0) return;
            ctx.clearRect(0, 0, w, h);

            // Draw grid lines
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.025)';
            ctx.lineWidth = 1;
            const spacing = 25;
            for (let x = 0; x < w; x += spacing) {
                ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
            }
            for (let y = 0; y < h; y += spacing) {
                ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
            }

            // Draw Cyan wave (primary telemetry)
            ctx.beginPath();
            ctx.strokeStyle = '#00f2fe';
            ctx.lineWidth = 2;
            ctx.shadowColor = '#00f2fe';
            ctx.shadowBlur = 8;
            for (let x = 0; x < w; x++) {
                const primaryWave = Math.sin(x * 0.025 + timestamp * 0.004) * 25;
                const secondaryNoise = Math.sin(x * 0.08 - timestamp * 0.008) * 6;
                const y = h / 2 + primaryWave + secondaryNoise;
                if (x === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.stroke();

            // Draw Purple wave (AI model line)
            ctx.beginPath();
            ctx.strokeStyle = 'rgba(168, 85, 247, 0.65)';
            ctx.lineWidth = 1.5;
            ctx.shadowColor = '#a855f7';
            ctx.shadowBlur = 5;
            for (let x = 0; x < w; x++) {
                const wave = Math.sin(x * 0.015 + timestamp * 0.002) * 35 * Math.cos(x * 0.002 + timestamp * 0.0005);
                const y = h / 2 - 10 + wave;
                if (x === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.stroke();
            ctx.shadowBlur = 0;

            modalTelemetryTimer = requestAnimationFrame(draw);
        }
        draw(0);
    }


    // ===== SIMULATED AI DIAGNOSTIC LOGS ENGINE =====
    const logMessages = {
        'refinery': [
            { text: "INICIALIZANDO MOTOR TERMODINÁMICO DE REFINERÍA...", type: "info" },
            { text: "CONEXIÓN ESTABLECIDA CON PLC SCADA EN EL PALITO", type: "success" },
            { text: "INGESTA SENSOR DE FLUJO: 140 MBD DETECTADO", type: "info" },
            { text: "PREDICCIÓN IA: Presión nominal estable en zona de tanques", type: "success" },
            { text: "ALERTA: Incremento de temperatura sutil en columna 12", type: "warn" },
            { text: "EJECUTANDO ACCIÓN AUTOMÁTICA n8n: Mitigando válvula...", type: "info" },
            { text: "AGENTE IA INDUSTRIAL: Nivel de fluidos reajustado a 48.2%", type: "success" },
            { text: "OPTIMIZACIÓN DE ENERGÍA COGENERADA EN PROCESO", type: "info" },
            { text: "REGISTRO: Eficiencia general reevaluada al 98.4%", type: "success" }
        ],
        'bridge': [
            { text: "CONECTANDO SENSORES DE TENSIÓN EN TIRANTES PUENTE...", type: "info" },
            { text: "RED LORA-WAN ONLINE: 32 nodos estructurales conectados", type: "success" },
            { text: "ANÁLISIS DE FATIGA SÍSMICA: Frecuencia 2.4 Hz detectada", type: "info" },
            { text: "ALERTA: Racha de viento de 45 km/h ejerce flexión transversal", type: "warn" },
            { text: "IA ESTRUCTURAL: Ajustando amortiguadores de masa sintonizados", type: "info" },
            { text: "DIAGNÓSTICO: Flexión estructural controlada, tolerancia 99.8%", type: "success" },
            { text: "MONITOREO DE DESPLAZAMIENTO: Calzada dentro del rango seguro", type: "success" },
            { text: "TELEMETRÍA EN TIEMPO REAL: Tensión nominal estable", type: "info" }
        ],
        'warehouse': [
            { text: "INICIANDO MAPEO ESPACIAL DE ALMACÉN AUTÓNOMO...", type: "info" },
            { text: "SISTEMA WMS/ERP SINCRONIZADO: 14,200 ítems indexados", type: "success" },
            { text: "AMR DRIVERS ONLINE: 12 unidades terrestres operativas", type: "success" },
            { text: "IA LOGÍSTICA: Trazando rutas óptimas para evadir colisiones", type: "info" },
            { text: "ALERTA: Obstrucción detectada en pasillo B-04", type: "warn" },
            { text: "REROUTING AUTOMÁTICO: AMR 04 reencaminado vía pasillo C-01", type: "info" },
            { text: "DRONES DE EXTRACCIÓN: Batería promedio a 92.1%", type: "success" },
            { text: "REGISTRO: Productividad logística incrementada +12%", type: "success" }
        ],
        'separator': [
            { text: "CONECTANDO INGENIERÍA P&ID DE SEPARADOR QUÍMICO...", type: "info" },
            { text: "MONITOR DE NIVEL: Válvula reguladora LV calibrada", type: "success" },
            { text: "MEDICIÓN DE PRESIÓN VASIJA: 3.2 bar (Rango Nominal)", type: "info" },
            { text: "IA QUÍMICA: Analizando interfase Agua / Aceite / Gas", type: "info" },
            { text: "PREDICIENDO TIEMPO DE RESIDENCIA: Tolerancia normal", type: "success" },
            { text: "ALERTA: Turbulencia leve detectada en entrada trifásica", type: "warn" },
            { text: "MITIGACIÓN DE ESPUMA EN PROCESO: Adición antiespumante...", type: "info" },
            { text: "REGISTRO: Calidad de destilado final al 99.1%", type: "success" }
        ],
        'energy': [
            { text: "CONECTANDO AL CENTRO DE GESTIÓN SMART GRID...", type: "info" },
            { text: "TURBINAS EÓLICAS: Generación eólica estable a 4.2 MW", type: "success" },
            { text: "GRID SOLAR: Captación fotovoltaica normal a 2.8 MW", type: "success" },
            { text: "BATERÍAS DE SUBESTACIÓN: Almacenado al 94.6%", type: "info" },
            { text: "ALERTA: Fluctuación de demanda detectada en Nodo Este", type: "warn" },
            { text: "REDISTRIBUCIÓN INTELIGENTE: Derivando carga excedente solar", type: "info" },
            { text: "IA SMART GRID: Estabilidad de red mantenida con 98.1% de eficiencia", type: "success" }
        ]
    };

    function startModalLogs(type) {
        if (!modalConsole) return;
        modalConsole.innerHTML = '';
        
        const logs = logMessages[type] || logMessages['refinery'];
        let logIndex = 0;

        function addLog() {
            const log = logs[logIndex];
            const line = document.createElement('div');
            line.classList.add('console-line', log.type);
            
            const timestamp = new Date().toLocaleTimeString();
            line.innerHTML = `<span class="timestamp">[${timestamp}]</span>${log.text}`;
            
            modalConsole.appendChild(line);
            modalConsole.scrollTop = modalConsole.scrollHeight;

            logIndex = (logIndex + 1) % logs.length;
        }

        // Add initial logs
        for(let i = 0; i < 3; i++) {
            addLog();
        }

        modalLogsTimer = setInterval(addLog, 2800);
    }

    console.log('%c⚡ kaironInnova.com (Impeccable Edition) loaded successfully', 'color: #f97316; font-size: 14px; font-weight: bold;');
});
