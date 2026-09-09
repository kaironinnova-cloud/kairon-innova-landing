// ==========================================================================
// kaironInnova - 3D LiDAR Morphing Engine (Hero Viewport)
// 100% Recognizable Venezuelan Oil & Gas Industrial Landmarks:
// 1. Plataforma Marina Offshore con Helipuerto "H", Taladro y Mechurrio de Gas
// 2. Buque Tanquero Petrolero de Alta Mar (VLCC) con Manifold y Puente
// 3. Balancín Petrolero "Cabeza de Caballo" & Pozo Guanoco con Contrapesos
// ==========================================================================

(function initHeroLidar() {
    const canvas = document.getElementById('hero-lidar-canvas');
    if (!canvas) return;

    const TOTAL_POINTS = 3800;

    // --- THREE.JS SCENE SETUP ---
    const scene = new THREE.Scene();
    const container = canvas.parentElement;

    const camera = new THREE.PerspectiveCamera(40, container.clientWidth / container.clientHeight, 1, 2000);
    camera.position.set(0, 15, 340);

    const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // --- ORBIT CONTROLS ---
    let controls = null;
    if (typeof THREE.OrbitControls !== 'undefined') {
        controls = new THREE.OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;
        controls.enableZoom = false;
        controls.enablePan = false;
        controls.autoRotate = true;
        controls.autoRotateSpeed = 1.1;
        controls.maxPolarAngle = Math.PI / 2 + 0.12;
        controls.minPolarAngle = Math.PI / 4;
        controls.target.set(0, 0, 0);
    }

    // =========================================================================
    // 1. FORMATION: PLATAFORMA MARINA JACK-UP OFFSHORE (HELIPUERTO "H" + TALADRO + MECHURRIO)
    // =========================================================================
    function generateOffshorePlatformTargets() {
        const targets = new Float32Array(TOTAL_POINTS * 3);
        let idx = 0;

        function addPoint(x, y, z) {
            if (idx >= TOTAL_POINTS * 3) return;
            targets[idx++] = x;
            targets[idx++] = y;
            targets[idx++] = z;
        }

        // 3 Massive Cylindrical Jack-Up Legs in Seabed (Y = -70 to -15)
        const legPositions = [
            { x: -50, z: -35 },
            { x: -50, z: 35 },
            { x: 45, z: 0 }
        ];

        legPositions.forEach(pos => {
            // Spudcan circular footing at bottom
            for (let i = 0; i < 90; i++) {
                const angle = Math.random() * Math.PI * 2;
                const r = Math.random() * 16;
                addPoint(pos.x + Math.cos(angle) * r, -70 + (Math.random() - 0.5) * 4, pos.z + Math.sin(angle) * r);
            }
            // Vertical leg lattice cylinder
            for (let i = 0; i < 260; i++) {
                const y = -70 + (i / 260) * 55;
                const angle = Math.random() * Math.PI * 2;
                const r = 8 + (Math.random() - 0.5) * 1.5;
                addPoint(pos.x + Math.cos(angle) * r, y, pos.z + Math.sin(angle) * r);
            }
        });

        // Main Triangular Hull / Living Quarters Deck (Y = -15 to -5)
        for (let i = 0; i < 900; i++) {
            const u = Math.random();
            const v = Math.random();
            // Point in triangle between the 3 legs
            const w1 = 1 - Math.sqrt(u);
            const w2 = (1 - v) * Math.sqrt(u);
            const w3 = v * Math.sqrt(u);

            const px = w1 * -55 + w2 * -55 + w3 * 50;
            const pz = w1 * -40 + w2 * 40 + w3 * 0;
            const py = -16 + Math.random() * 10;
            addPoint(px, py, pz);
        }

        // Cantilevered Circular Helideck with "H" (Left side: X = -72, Z = 0, Y = -5 to 0)
        const heliX = -68;
        const heliZ = 0;
        const heliR = 24;
        // Circular perimeter & deck surface
        for (let i = 0; i < 380; i++) {
            const angle = Math.random() * Math.PI * 2;
            const r = Math.random() * heliR;
            addPoint(heliX + Math.cos(angle) * r, -5, heliZ + Math.sin(angle) * r);
        }
        // Distinctive "H" marking on helideck
        // Left bar of H
        for (let i = 0; i < 50; i++) {
            addPoint(heliX - 7, -4, heliZ - 10 + (i / 50) * 20);
        }
        // Right bar of H
        for (let i = 0; i < 50; i++) {
            addPoint(heliX + 7, -4, heliZ - 10 + (i / 50) * 20);
        }
        // Crossbar of H
        for (let i = 0; i < 40; i++) {
            addPoint(heliX - 7 + (i / 40) * 14, -4, heliZ);
        }

        // Offshore Drilling Derrick Mast (Cantilever position: X = 15, Z = 0, Y = -5 to +68)
        const derrickX = 15;
        const derrickZ = 0;
        const derrickBottomW = 18;
        const derrickTopW = 10;
        // 4 Legs
        for (let i = 0; i < 600; i++) {
            const t = Math.random();
            const y = -5 + t * 73;
            const w = (1 - t) * derrickBottomW + t * derrickTopW;

            const corner = Math.floor(Math.random() * 4);
            const cx = (corner === 0 || corner === 1) ? w : -w;
            const cz = (corner === 0 || corner === 3) ? w : -w;
            addPoint(derrickX + cx, y, derrickZ + cz);
        }
        // Horizontal Fingerboards & Top Drive
        for (let tier = 0; tier < 5; tier++) {
            const ty = 5 + tier * 13;
            for (let p = 0; p < 45; p++) {
                const angle = Math.random() * Math.PI * 2;
                addPoint(derrickX + Math.cos(angle) * 12, ty, derrickZ + Math.sin(angle) * 12);
            }
        }
        // Crown Block (flat top block)
        for (let i = 0; i < 120; i++) {
            const x = (Math.random() - 0.5) * (derrickTopW * 2);
            const z = (Math.random() - 0.5) * (derrickTopW * 2);
            addPoint(derrickX + x, 68 + Math.random() * 6, derrickZ + z);
        }

        // Gas Flare Boom & Burner (Angled truss extending to right: X = 35 to 88, Y = -10 to +35)
        for (let i = 0; i < 350; i++) {
            const s = Math.random();
            const fx = 35 + s * 53;
            const fy = -10 + s * 45;
            const fz = 15 + s * 15;
            addPoint(fx + (Math.random() - 0.5) * 3, fy + (Math.random() - 0.5) * 3, fz + (Math.random() - 0.5) * 3);
        }
        // Gas Flame at tip
        for (let i = 0; i < 180; i++) {
            const fx = 88 + Math.random() * 16;
            const fy = 35 + Math.random() * 15;
            const fz = 30 + (Math.random() - 0.5) * 10;
            addPoint(fx, fy, fz);
        }

        // Pedestal Deck Crane
        for (let i = 0; i < 180; i++) {
            const s = Math.random();
            addPoint(-20 + s * 25, -5 + s * 20, 25);
        }

        // Fill remaining with sea water waves around platform legs
        while (idx < TOTAL_POINTS * 3) {
            const angle = Math.random() * Math.PI * 2;
            const r = 30 + Math.random() * 85;
            addPoint(Math.cos(angle) * r, -70, Math.sin(angle) * r);
        }

        return targets;
    }

    // =========================================================================
    // 2. FORMATION: BUQUE TANQUERO PETROLERO DE ALTA MAR (VLCC CRUDE OIL TANKER)
    // =========================================================================
    function generateOilTankerTargets() {
        const targets = new Float32Array(TOTAL_POINTS * 3);
        let idx = 0;

        function addPoint(x, y, z) {
            if (idx >= TOTAL_POINTS * 3) return;
            targets[idx++] = x;
            targets[idx++] = y;
            targets[idx++] = z;
        }

        // Ship Hull (Length: X = -95 to +95, Depth: Y = -42 to -10, Beam: Z = -28 to +28)
        for (let i = 0; i < 1500; i++) {
            const t = Math.random();
            const x = -95 + t * 190;
            
            let beamFactor = 1.0;
            if (x > 50) beamFactor = Math.max(0.08, 1.0 - Math.pow((x - 50) / 45, 1.7));
            else if (x < -68) beamFactor = Math.max(0.35, 1.0 - Math.pow((Math.abs(x) - 68) / 27, 1.3));
            
            const maxZ = 27 * beamFactor;
            const z = (Math.random() - 0.5) * 2 * maxZ;
            
            const hullCurve = Math.pow(Math.abs(z) / (maxZ || 1), 2) * 12;
            const y = -40 + hullCurve + Math.random() * 28;
            addPoint(x, Math.min(-10, y), z);
        }

        // Bulbous Bow at front waterline (X = 85 to 98, Y = -40 to -24, Z = -10 to +10)
        for (let i = 0; i < 180; i++) {
            const bx = 85 + Math.random() * 13;
            const by = -38 + Math.random() * 14;
            const bz = (Math.random() - 0.5) * 14;
            addPoint(bx, by, bz);
        }

        // Cargo Deck Parallel Oil Manifolds (X = -45 to +50, Y = -8, 4 lines of pipes)
        for (let pipe = 0; pipe < 4; pipe++) {
            const pz = -14 + pipe * 9.5;
            for (let p = 0; p < 140; p++) {
                const px = -45 + (p / 140) * 95;
                addPoint(px, -7 + (Math.random() - 0.5) * 1.5, pz + (Math.random() - 0.5) * 1.2);
            }
        }

        // Midship Hose-Handling Cranes (X = 2, Y = -8 to +24)
        for (let i = 0; i < 200; i++) {
            const cy = -8 + Math.random() * 32;
            const angle = Math.random() * Math.PI * 2;
            addPoint(2 + Math.cos(angle) * 3, cy, Math.sin(angle) * 3);
        }
        for (let i = 0; i < 150; i++) {
            const s = Math.random();
            addPoint(2 + s * 28, 24 - s * 10, (Math.random() - 0.5) * 3.5);
        }

        // Multi-Tier Navigation Superstructure at Stern (X = -82 to -52, Y = -10 to +38, Z = -26 to +26)
        for (let i = 0; i < 750; i++) {
            const bx = -82 + Math.random() * 30;
            const bz = (Math.random() - 0.5) * 44; // Wide bridge wings
            const by = -10 + Math.random() * 46;
            addPoint(bx, by, bz);
        }

        // Twin Exhaust Funnels behind Bridge (X = -75, Y = +36 to +58)
        [-10, 10].forEach(fz => {
            for (let i = 0; i < 140; i++) {
                const fy = 36 + Math.random() * 22;
                const angle = Math.random() * Math.PI * 2;
                addPoint(-75 + Math.cos(angle) * 4.5, fy, fz + Math.sin(angle) * 4.5);
            }
        });

        // Radar Mast atop Bridge (X = -62, Y = +36 to +68)
        for (let i = 0; i < 140; i++) {
            const my = 36 + Math.random() * 32;
            addPoint(-62, my, (Math.random() - 0.5) * 2);
        }
        for (let i = 0; i < 80; i++) {
            const rz = (Math.random() - 0.5) * 24;
            addPoint(-62, 58, rz);
        }

        // Water Wake & Ocean Surface
        while (idx < TOTAL_POINTS * 3) {
            const sx = (Math.random() - 0.5) * 230;
            const sz = (Math.random() - 0.5) * 110;
            addPoint(sx, -42 + (Math.random() - 0.5) * 2, sz);
        }

        return targets;
    }

    // =========================================================================
    // 3. FORMATION: BALANCÍN PETROLERO "CABEZA DE CABALLO" & POZO LAGO GUANOCO
    // =========================================================================
    function generateGuanocoPumpjackTargets() {
        const targets = new Float32Array(TOTAL_POINTS * 3);
        let idx = 0;

        function addPoint(x, y, z) {
            if (idx >= TOTAL_POINTS * 3) return;
            targets[idx++] = x;
            targets[idx++] = y;
            targets[idx++] = z;
        }

        // Heavy I-Beam Steel Skid Frame on Ground (Y = -68, X = -85 to +85, Z = -30 to +30)
        for (let i = 0; i < 500; i++) {
            const gx = -85 + Math.random() * 170;
            const gz = (Math.random() - 0.5) * 60;
            addPoint(gx, -68 + (Math.random() - 0.5) * 2, gz);
        }

        // Samson Post (Central 4-Leg Heavy A-Frame: Y = -68 to +12, X around 0)
        for (let i = 0; i < 750; i++) {
            const s = Math.random();
            const y = -68 + s * 80;
            const corner = Math.floor(Math.random() * 4);
            const spreadX = (1 - s) * 26;
            const spreadZ = (1 - s) * 22;

            const cx = (corner === 0 || corner === 1) ? spreadX : -spreadX;
            const cz = (corner === 0 || corner === 3) ? spreadZ : -spreadZ;
            addPoint(cx + (Math.random() - 0.5) * 2.5, y, cz + (Math.random() - 0.5) * 2.5);
        }

        // Walking Beam (Heavy Rocking Beam: Y = +12 to +22, X = -55 to +45)
        for (let i = 0; i < 600; i++) {
            const s = Math.random();
            const bx = -55 + s * 100;
            const by = 16 + Math.sin(s * Math.PI) * 4;
            const bz = (Math.random() - 0.5) * 8;
            addPoint(bx, by, bz);
        }

        // Iconic Curved Horsehead (Cabeza de Caballo at front: X = +45 to +68, Y = +2 to +35)
        for (let i = 0; i < 550; i++) {
            const angle = -Math.PI / 2 + Math.random() * Math.PI;
            const r = 18 + Math.random() * 3.5;
            const hx = 45 + Math.cos(angle) * r * 1.15;
            const hy = 18 + Math.sin(angle) * r;
            const hz = (Math.random() - 0.5) * 6;
            addPoint(hx, hy, hz);
        }

        // Wireline Bridle & Polished Rod into Wellhead (Vertical line at X = +65, Y = +6 down to -65)
        for (let i = 0; i < 350; i++) {
            const ry = -65 + Math.random() * 72;
            addPoint(65 + (Math.random() - 0.5) * 2, ry, (Math.random() - 0.5) * 2);
        }

        // Wellhead Christmas Tree & Valves Cluster (X = +65, Y = -68 to -42)
        for (let i = 0; i < 280; i++) {
            const vy = -68 + Math.random() * 26;
            const vz = (Math.random() - 0.5) * 16;
            addPoint(65 + (Math.random() - 0.5) * 8, vy, vz);
        }

        // Twin Rotating Counterweights & Crank Arms at Back (X = -55, Y = -38 to +8)
        for (let i = 0; i < 450; i++) {
            const cAngle = Math.random() * Math.PI * 2;
            const cr = 12 + Math.random() * 12;
            const cx = -55 + Math.cos(cAngle) * cr * 0.75;
            const cy = -18 + Math.sin(cAngle) * cr;
            const cz = (Math.random() - 0.5) * 12;
            addPoint(cx, cy, cz);
        }

        // Asphalt Storage Tank at Lago Guanoco (Left background: X = -85 to -60, Y = -68 to -28)
        const tankX = -75;
        const tankR = 15;
        for (let i = 0; i < 350; i++) {
            const ty = -68 + Math.random() * 40;
            const tAngle = Math.random() * Math.PI * 2;
            addPoint(tankX + Math.cos(tAngle) * tankR, ty, Math.sin(tAngle) * tankR);
        }

        // Asphalt Ground Matrix
        while (idx < TOTAL_POINTS * 3) {
            const ax = (Math.random() - 0.5) * 220;
            const az = (Math.random() - 0.5) * 110;
            addPoint(ax, -68, az);
        }

        return targets;
    }

    // --- FORMATIONS ARRAY ---
    const formations = [
        generateOffshorePlatformTargets(),
        generateOilTankerTargets(),
        generateGuanocoPumpjackTargets()
    ];

    // --- BUFFER GEOMETRY ---
    const geometry = new THREE.BufferGeometry();
    const currentPositions = new Float32Array(TOTAL_POINTS * 3);
    const colors = new Float32Array(TOTAL_POINTS * 3);

    const initialTargets = formations[0];
    for (let i = 0; i < TOTAL_POINTS * 3; i++) {
        currentPositions[i] = initialTargets[i] + (Math.random() - 0.5) * 6;
    }

    const colorBottom = new THREE.Color(0x00e676); // Emerald Green
    const colorTop = new THREE.Color(0x00f2fe);    // Electric Cyan
    const tempColor = new THREE.Color();

    function updateColors() {
        for (let i = 0; i < TOTAL_POINTS; i++) {
            const y = currentPositions[i * 3 + 1];
            const t = Math.max(0, Math.min(1, (y + 70) / 145));
            tempColor.copy(colorBottom).lerp(colorTop, t);
            colors[i * 3] = tempColor.r;
            colors[i * 3 + 1] = tempColor.g;
            colors[i * 3 + 2] = tempColor.b;
        }
    }
    updateColors();

    geometry.setAttribute('position', new THREE.BufferAttribute(currentPositions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    function createPointTexture() {
        const size = 64;
        const cv = document.createElement('canvas');
        cv.width = size;
        cv.height = size;
        const ctx = cv.getContext('2d');

        const grad = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
        grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
        grad.addColorStop(0.25, 'rgba(0, 242, 254, 0.95)');
        grad.addColorStop(0.65, 'rgba(0, 230, 118, 0.35)');
        grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, size, size);

        return new THREE.CanvasTexture(cv);
    }

    const material = new THREE.PointsMaterial({
        size: 4.8,
        vertexColors: true,
        map: createPointTexture(),
        transparent: true,
        opacity: 0.96,
        blending: THREE.AdditiveBlending,
        depthWrite: false
    });

    const pointCloud = new THREE.Points(geometry, material);
    scene.add(pointCloud);

    // --- MORPHING TIMELINE ENGINE ---
    let currentFormationIndex = 0;
    let isMorphing = false;
    let sourcePositions = new Float32Array(TOTAL_POINTS * 3);
    let targetPositions = formations[0];
    const morphDuration = 1.6;
    let morphStartTime = 0;

    function triggerNextFormation() {
        currentFormationIndex = (currentFormationIndex + 1) % formations.length;
        sourcePositions.set(currentPositions);
        targetPositions = formations[currentFormationIndex];
        
        isMorphing = true;
        morphStartTime = performance.now();
    }

    setInterval(triggerNextFormation, 4800);

    function easeInOutCubic(x) {
        return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
    }

    let clock = new THREE.Clock();

    function animate() {
        requestAnimationFrame(animate);

        const delta = clock.getDelta();
        const now = performance.now();

        if (controls) controls.update();

        if (isMorphing) {
            const elapsed = (now - morphStartTime) / (morphDuration * 1000);
            const t = Math.min(1.0, elapsed);
            const easedT = easeInOutCubic(t);

            const dispersionStrength = Math.sin(t * Math.PI) * 24.0;

            const posAttr = geometry.attributes.position;
            const arr = posAttr.array;

            for (let i = 0; i < TOTAL_POINTS; i++) {
                const idx3 = i * 3;
                
                const seedX = Math.sin(i * 12.9898) * 1.4;
                const seedY = Math.cos(i * 78.233) * 1.4;
                const seedZ = Math.sin(i * 45.164) * 1.4;

                const sx = sourcePositions[idx3];
                const sy = sourcePositions[idx3 + 1];
                const sz = sourcePositions[idx3 + 2];

                const tx = targetPositions[idx3];
                const ty = targetPositions[idx3 + 1];
                const tz = targetPositions[idx3 + 2];

                arr[idx3] = sx + (tx - sx) * easedT + seedX * dispersionStrength;
                arr[idx3 + 1] = sy + (ty - sy) * easedT + seedY * dispersionStrength;
                arr[idx3 + 2] = sz + (tz - sz) * easedT + seedZ * dispersionStrength;
            }

            posAttr.needsUpdate = true;
            updateColors();
            geometry.attributes.color.needsUpdate = true;

            if (t >= 1.0) {
                isMorphing = false;
            }
        } else {
            const time = now * 0.0015;
            const posAttr = geometry.attributes.position;
            const arr = posAttr.array;

            for (let i = 0; i < TOTAL_POINTS; i += 4) {
                const idx3 = i * 3;
                arr[idx3 + 1] += Math.sin(time + i * 0.1) * 0.06;
            }
            posAttr.needsUpdate = true;
        }

        renderer.render(scene, camera);
    }

    animate();

    function handleResize() {
        if (!container || !renderer || !camera) return;
        const width = container.clientWidth;
        const height = container.clientHeight;
        if (width === 0 || height === 0) return;

        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
    }

    window.addEventListener('resize', handleResize);
    handleResize();

    console.log("⚡ Hero Offshore Platform, Oil Tanker & Guanoco 3D Engine active.");
})();
