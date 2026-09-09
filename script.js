document.addEventListener('DOMContentLoaded', () => {
    console.log("⚡ kaironInnova Corporate Platform Engine Initialized");

    // ===== 1. INITIALIZE AOS (Animate On Scroll) =====
    if (typeof AOS !== 'undefined') {
        AOS.init({
            duration: 750,
            easing: 'ease-out-cubic',
            once: true,
            offset: 40
        });
    }

    // ===== 2. MOBILE MENU =====
    const hamburger = document.getElementById('hamburger');
    const navLinksContainer = document.getElementById('nav-links');

    if (hamburger && navLinksContainer) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            navLinksContainer.classList.toggle('open');
            document.body.style.overflow = navLinksContainer.classList.contains('open') ? 'hidden' : '';
        });

        // Close menu when clicking a link
        const navLinks = navLinksContainer.querySelectorAll('.nav-link, .nav-login, .btn-nav-demo');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                hamburger.classList.remove('active');
                navLinksContainer.classList.remove('open');
                document.body.style.overflow = '';
            });
        });
    }

    // ===== 3. NAVBAR SCROLL EFFECT & SPY =====
    const navbar = document.getElementById('navbar');
    function handleNavbarScroll() {
        if (!navbar) return;
        if (window.scrollY > 30) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    }
    window.addEventListener('scroll', handleNavbarScroll, { passive: true });
    handleNavbarScroll();

    // Scroll spy
    const navLinks = document.querySelectorAll('.nav-link[href^="#"]');
    const spySections = Array.from(navLinks).map(link => {
        const id = link.getAttribute('href');
        return id && id !== '#' ? document.querySelector(id) : null;
    }).filter(Boolean);

    function updateActiveNavbar() {
        let activeLinkIndex = 0;
        const scrollPosition = window.scrollY + 140;

        spySections.forEach((section, index) => {
            if (section && scrollPosition >= section.offsetTop) {
                activeLinkIndex = index;
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
    window.addEventListener('scroll', updateActiveNavbar, { passive: true });
    updateActiveNavbar();

    // ===== 4. 3D CARD HOVER TILT (Subtle & Professional) =====
    const tiltCards = document.querySelectorAll('.telecom-service-card, .workflow-card, .how-card, .about-card, .kpi-card');
    tiltCards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const rotateX = ((centerY - y) / centerY) * 3.5;
            const rotateY = ((x - centerX) / centerX) * 3.5;
            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0)';
        });
    });

    // ===== 5. DIGITAL TWINS 3D SHOWROOM CAROUSEL =====
    const track = document.getElementById('carousel-track');
    const prevBtn = document.getElementById('carousel-prev');
    const nextBtn = document.getElementById('carousel-next');
    const dotsContainer = document.getElementById('carousel-dots');
    const showroomCarousel = document.querySelector('.showroom-carousel');
    const cards = track ? Array.from(track.children) : [];

    function getInitFunction(modelType) {
        if (modelType === 'refinery') return window.initRefinery3D;
        if (modelType === 'bridge') return window.initBridge3D;
        if (modelType === 'warehouse') return window.initWarehouse3D;
        if (modelType === 'separator') return window.initSeparator3D;
        if (modelType === 'energy') return window.initEnergy3D;
        return null;
    }

    let activeIndex = 0;
    const showroomInstances = new Map();
    let isShowroomVisible = false;

    if (track && showroomCarousel) {
        // Create navigation dots if container exists
        if (dotsContainer) {
            dotsContainer.innerHTML = '';
            cards.forEach((_, index) => {
                const dot = document.createElement('div');
                dot.classList.add('carousel-dot');
                if (index === 0) dot.classList.add('active');
                dot.addEventListener('click', () => {
                    goToSlide(index);
                });
                dotsContainer.appendChild(dot);
            });
        }

        function updateCarousel() {
            if (cards.length === 0) return;

            cards.forEach((card, index) => {
                if (index === activeIndex) {
                    card.classList.add('active-card');
                } else {
                    card.classList.remove('active-card');
                }
            });

            // Center active card
            const activeCard = cards[activeIndex];
            if (activeCard) {
                const viewportWidth = showroomCarousel.clientWidth;
                const cardWidth = activeCard.clientWidth;
                const gap = 24;
                const activeCardOffset = activeIndex * (cardWidth + gap);
                const translateOffset = activeCardOffset - (viewportWidth / 2) + (cardWidth / 2);
                track.style.transform = `translateX(-${translateOffset}px)`;
            }

            if (prevBtn) prevBtn.disabled = activeIndex === 0;
            if (nextBtn) nextBtn.disabled = activeIndex >= cards.length - 1;

            if (dotsContainer) {
                const dots = Array.from(dotsContainer.children);
                dots.forEach((dot, index) => {
                    dot.classList.toggle('active', index === activeIndex);
                });
            }

            // Pause/resume 3D rendering based on visibility
            cards.forEach((card, index) => {
                const canvasContainer = card.querySelector('.card-canvas');
                if (canvasContainer) {
                    canvasContainer.dataset.paused = (index === activeIndex && isShowroomVisible) ? "false" : "true";
                }
            });
        }

        function goToSlide(index) {
            activeIndex = Math.max(0, Math.min(index, cards.length - 1));
            updateCarousel();
        }

        if (prevBtn) prevBtn.addEventListener('click', () => goToSlide(activeIndex - 1));
        if (nextBtn) nextBtn.addEventListener('click', () => goToSlide(activeIndex + 1));

        cards.forEach((card, index) => {
            card.addEventListener('click', (e) => {
                if (!e.target.closest('.btn-showroom-action') && index !== activeIndex) {
                    goToSlide(index);
                }
            });
        });

        // Initialize 3D Scenes
        cards.forEach((card, index) => {
            const canvasContainer = card.querySelector('.card-canvas');
            if (!canvasContainer) return;

            let modelType = '';
            if (canvasContainer.id.includes('refinery')) modelType = 'refinery';
            else if (canvasContainer.id.includes('bridge')) modelType = 'bridge';
            else if (canvasContainer.id.includes('warehouse')) modelType = 'warehouse';
            else if (canvasContainer.id.includes('separator')) modelType = 'separator';
            else if (canvasContainer.id.includes('energy')) modelType = 'energy';

            // Stagger loading slightly to avoid GPU freezes
            setTimeout(() => {
                const initFn = getInitFunction(modelType);
                if (initFn && canvasContainer.innerHTML === '') {
                    canvasContainer.classList.add('webgl-active');
                    canvasContainer.dataset.paused = (index === activeIndex && isShowroomVisible) ? "false" : "true";

                    const instance = initFn(canvasContainer);
                    if (instance && instance.controls) {
                        instance.controls.autoRotate = true;
                        instance.controls.autoRotateSpeed = 1.2;
                    }
                    showroomInstances.set(index, instance);
                }
            }, index * 120);

            card.addEventListener('mouseenter', () => {
                const inst = showroomInstances.get(index);
                if (inst && inst.controls) inst.controls.autoRotateSpeed = 3.5;
            });
            card.addEventListener('mouseleave', () => {
                const inst = showroomInstances.get(index);
                if (inst && inst.controls) inst.controls.autoRotateSpeed = 1.2;
            });
        });

        const showroomObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                isShowroomVisible = entry.isIntersecting;
                updateCarousel();
            });
        }, { threshold: 0.1 });

        const showroomSection = document.getElementById('digital-twins-showroom');
        if (showroomSection) showroomObserver.observe(showroomSection);

        window.addEventListener('resize', updateCarousel);
        setTimeout(updateCarousel, 250);
    }

    // ===== 6. DCS FULL-SCREEN HOLOGRAM MODAL =====
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

        if (modalTitle) modalTitle.innerText = titleText || 'Simulador SCADA / Gemelo Digital 3D';
        modalOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';

        modalWebGLContainer.innerHTML = '';

        const initFn = getInitFunction(type);
        if (initFn) {
            modal3DInstance = initFn(modalWebGLContainer);
            if (modal3DInstance && modal3DInstance.controls) {
                modal3DInstance.controls.autoRotate = isModalRotating;
                modal3DInstance.controls.autoRotateSpeed = 1.0;
            }
        }

        startModalTelemetry();
        startModalLogs(type);
    };

    window.closeHologramModal = function() {
        if (!modalOverlay) return;
        modalOverlay.classList.remove('active');
        document.body.style.overflow = '';

        if (modalWebGLContainer) modalWebGLContainer.innerHTML = '';
        modal3DInstance = null;

        if (modalTelemetryTimer) cancelAnimationFrame(modalTelemetryTimer);
        if (modalLogsTimer) clearInterval(modalLogsTimer);
        if (modalConsole) modalConsole.innerHTML = '';
    };

    window.toggleModalRotation = function() {
        if (!modal3DInstance || !modal3DInstance.controls) return;
        isModalRotating = !isModalRotating;
        modal3DInstance.controls.autoRotate = isModalRotating;
        const btn = document.getElementById('btn-modal-rotate');
        if (btn) btn.innerText = `Autorotación: ${isModalRotating ? 'ON' : 'OFF'}`;
    };

    window.resetModalCamera = function() {
        if (!modal3DInstance || !modal3DInstance.controls || !modal3DInstance.camera) return;
        modal3DInstance.controls.reset();
        modal3DInstance.camera.position.set(-900, 700, 1100);
        modal3DInstance.controls.target.set(100, 0, -100);
        modal3DInstance.controls.update();
    };

    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modalOverlay && modalOverlay.classList.contains('active')) {
            closeHologramModal();
        }
    });

    // ===== 7. MODAL TELEMETRY OSCILLOSCOPE =====
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

            // Grid lines
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
            ctx.lineWidth = 1;
            const spacing = 24;
            for (let x = 0; x < w; x += spacing) {
                ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
            }
            for (let y = 0; y < h; y += spacing) {
                ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
            }

            // Primary Cyan telemetry wave
            ctx.beginPath();
            ctx.strokeStyle = '#00f2fe';
            ctx.lineWidth = 2;
            ctx.shadowColor = '#00f2fe';
            ctx.shadowBlur = 6;
            for (let x = 0; x < w; x++) {
                const primaryWave = Math.sin(x * 0.025 + timestamp * 0.0035) * 22;
                const noise = Math.sin(x * 0.08 - timestamp * 0.007) * 5;
                const y = h / 2 + primaryWave + noise;
                if (x === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.stroke();

            // Secondary Green AI prediction wave
            ctx.beginPath();
            ctx.strokeStyle = 'rgba(0, 230, 118, 0.8)';
            ctx.lineWidth = 1.5;
            ctx.shadowColor = '#00e676';
            ctx.shadowBlur = 4;
            for (let x = 0; x < w; x++) {
                const wave = Math.sin(x * 0.015 + timestamp * 0.002) * 30 * Math.cos(x * 0.002 + timestamp * 0.0005);
                const y = h / 2 - 8 + wave;
                if (x === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.stroke();
            ctx.shadowBlur = 0;

            modalTelemetryTimer = requestAnimationFrame(draw);
        }
        draw(0);
    }

    // ===== 8. SIMULATED AI DIAGNOSTIC STREAM =====
    const logMessages = {
        'refinery': [
            { text: "INICIALIZANDO MOTOR TERMODINÁMICO DE REFINERÍA...", type: "info" },
            { text: "CONEXIÓN ESTABLECIDA CON PLC SCADA EN EL PALITO", type: "success" },
            { text: "INGESTA SENSOR DE FLUJO: 140 MBD DETECTADO", type: "info" },
            { text: "PREDICCIÓN IA: Presión nominal estable en zona de tanques", type: "success" },
            { text: "ALERTA: Incremento de temperatura sutil en columna 12", type: "warn" },
            { text: "EJECUTANDO ACCIÓN AUTOMÁTICA n8n: Mitigando válvula...", type: "info" },
            { text: "AGENTE IA INDUSTRIAL: Nivel de fluidos reajustado a 48.2%", type: "success" },
            { text: "REGISTRO: Eficiencia general reevaluada al 98.4%", type: "success" }
        ],
        'bridge': [
            { text: "CONECTANDO SENSORES DE TENSIÓN EN TIRANTES PUENTE...", type: "info" },
            { text: "RED LORA-WAN ONLINE: 32 nodos estructurales conectados", type: "success" },
            { text: "ANÁLISIS DE FATIGA SÍSMICA: Frecuencia 2.4 Hz detectada", type: "info" },
            { text: "DIAGNÓSTICO: Flexión estructural controlada, tolerancia 99.8%", type: "success" },
            { text: "TELEMETRÍA EN TIEMPO REAL: Tensión nominal estable", type: "info" }
        ],
        'warehouse': [
            { text: "INICIANDO MAPEO ESPACIAL DE ALMACÉN AUTÓNOMO...", type: "info" },
            { text: "SISTEMA WMS/ERP SINCRONIZADO: 14,200 ítems indexados", type: "success" },
            { text: "AMR DRIVERS ONLINE: 12 unidades terrestres operativas", type: "success" },
            { text: "IA LOGÍSTICA: Trazando rutas óptimas de despacho", type: "info" }
        ],
        'separator': [
            { text: "CONECTANDO INGENIERÍA P&ID DE SEPARADOR QUÍMICO...", type: "info" },
            { text: "MEDICIÓN DE PRESIÓN VASIJA: 3.2 bar (Rango Nominal)", type: "info" },
            { text: "IA QUÍMICA: Analizando interfase Agua / Aceite / Gas", type: "info" },
            { text: "REGISTRO: Calidad de destilado final al 99.1%", type: "success" }
        ],
        'energy': [
            { text: "CONECTANDO AL CENTRO DE GESTIÓN SMART GRID...", type: "info" },
            { text: "GENERACIÓN TOTAL: 7.0 MW sincronizados a la red", type: "success" },
            { text: "IA SMART GRID: Estabilidad de red mantenida al 99.4%", type: "success" }
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

        for (let i = 0; i < 3; i++) {
            addLog();
        }
        modalLogsTimer = setInterval(addLog, 2800);
    }
});
