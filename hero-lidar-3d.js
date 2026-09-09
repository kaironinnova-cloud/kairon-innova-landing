// ==========================================================================
// kaironInnova - 3D LiDAR Morphing Engine (Hero Section)
// Ultra-Iconic Formations with High Visual Recognition & Particle Life:
// 1. Refinería El Palito: Torre de Destilación + Gran Tanque Esférico (Hortonsphere) + Tuberías
// 2. Balancín Petrolero "Cabeza de Caballo" + Tanque de Crudo + Árbol de Navidad
// 3. Taladro de Perforación & Well Testing con Mechurrio de Llama Activa
// ==========================================================================

(function initHeroLidar() {
    const canvas = document.getElementById('hero-lidar-canvas');
    if (!canvas) return;

    const TOTAL_POINTS = 4000;

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
        controls.autoRotateSpeed = 1.2;
        controls.maxPolarAngle = Math.PI / 2 + 0.12;
        controls.minPolarAngle = Math.PI / 4;
        controls.target.set(0, 0, 0);
    }

    // =========================================================================
    // 1. FORMATION: REFINERÍA & GRAN TANQUE ESFÉRICO (HORTONSPHERE) - EL PALITO
    // =========================================================================
    function generateRefinerySphereTargets() {
        const targets = new Float32Array(TOTAL_POINTS * 3);
        let idx = 0;

        function addPoint(x, y, z) {
            if (idx >= TOTAL_POINTS * 3) return;
            targets[idx++] = x;
            targets[idx++] = y;
            targets[idx++] = z;
        }

        // Tall Distillation Fractionation Column (Left: X = -52, Y = -65 to +65, R = 22)
        const colX = -52;
        const colR = 22;
        const colH = 130;
        for (let i = 0; i < 1400; i++) {
            const y = -65 + (i / 1400) * colH;
            const angle = Math.random() * Math.PI * 2;
            const isSurface = Math.random() > 0.25;
            const r = isSurface ? colR + (Math.random() - 0.5) * 1.5 : Math.random() * colR;
            addPoint(colX + Math.cos(angle) * r, y, Math.sin(angle) * r);
        }
        // Fractionation Trays / Rings on the column (every 18 units)
        for (let t = 0; t < 7; t++) {
            const ty = -60 + t * 20;
            for (let p = 0; p < 60; p++) {
                const angle = (p / 60) * Math.PI * 2;
                addPoint(colX + Math.cos(angle) * (colR + 4), ty, Math.sin(angle) * (colR + 4));
            }
        }
        // Column Top Vent / Flare cap
        for (let i = 0; i < 90; i++) {
            const vy = 65 + Math.random() * 12;
            addPoint(colX + (Math.random() - 0.5) * 6, vy, (Math.random() - 0.5) * 6);
        }

        // Large Spherical Gas / LPG Tank (Hortonsphere on Right: X = +52, Y = -5, R = 44)
        const sphereX = 52;
        const sphereY = -5;
        const sphereR = 44;
        for (let i = 0; i < 1200; i++) {
            const u = Math.random();
            const v = Math.random();
            const theta = u * 2.0 * Math.PI;
            const phi = Math.acos(2.0 * v - 1.0);
            const r = sphereR + (Math.random() - 0.5) * 1.5;
            
            const x = sphereX + r * Math.sin(phi) * Math.cos(theta);
            const y = sphereY + r * Math.sin(phi) * Math.sin(theta);
            const z = r * Math.cos(phi);
            addPoint(x, y, z);
        }
        // Equatorial Walkway / Railing Ring on Sphere
        for (let i = 0; i < 140; i++) {
            const angle = (i / 140) * Math.PI * 2;
            addPoint(sphereX + Math.cos(angle) * (sphereR + 3), sphereY, Math.sin(angle) * (sphereR + 3));
        }
        // 8 Equatorial Support Legs for the Sphere (reaching to ground Y = -65)
        for (let leg = 0; leg < 8; leg++) {
            const angle = (leg / 8) * Math.PI * 2;
            const lx = sphereX + Math.cos(angle) * (sphereR * 0.88);
            const lz = Math.sin(angle) * (sphereR * 0.88);
            for (let p = 0; p < 45; p++) {
                const s = p / 45;
                const ly = sphereY - (sphereR * 0.4) - s * 40;
                addPoint(lx, Math.max(-65, ly), lz);
            }
        }

        // Interconnecting Pipe Manifold Bridge between Column and Sphere (3 levels)
        for (let pipe = 0; pipe < 3; pipe++) {
            const py = -40 + pipe * 30;
            for (let p = 0; p < 90; p++) {
                const s = p / 90;
                const px = colX + colR + s * (sphereX - sphereR - (colX + colR));
                const pz = (Math.random() - 0.5) * 6;
                addPoint(px, py + Math.sin(s * Math.PI) * 6, pz);
            }
        }

        // Ground Platform & Pump Skid
        while (idx < TOTAL_POINTS * 3) {
            const gx = (Math.random() - 0.5) * 230;
            const gz = (Math.random() - 0.5) * 130;
            addPoint(gx, -65 + (Math.random() - 0.5) * 2, gz);
        }

        return targets;
    }

    // =========================================================================
    // 2. FORMATION: BALANCÍN PETROLERO "CABEZA DE CABALLO" & TANQUE DE CRUDO
    // =========================================================================
    function generatePumpjackTargets() {
        const targets = new Float32Array(TOTAL_POINTS * 3);
        let idx = 0;

        function addPoint(x, y, z) {
            if (idx >= TOTAL_POINTS * 3) return;
            targets[idx++] = x;
            targets[idx++] = y;
            targets[idx++] = z;
        }

        // Heavy I-Beam Steel Skid Frame on Ground (Y = -65)
        for (let i = 0; i < 500; i++) {
            const gx = -85 + Math.random() * 170;
            const gz = (Math.random() - 0.5) * 60;
            addPoint(gx, -65 + (Math.random() - 0.5) * 2, gz);
        }

        // Samson Post (Central 4-Leg Heavy A-Frame: Y = -65 to +12, X around 0)
        for (let i = 0; i < 800; i++) {
            const s = Math.random();
            const y = -65 + s * 77;
            const corner = Math.floor(Math.random() * 4);
            const spreadX = (1 - s) * 26;
            const spreadZ = (1 - s) * 22;

            const cx = (corner === 0 || corner === 1) ? spreadX : -spreadX;
            const cz = (corner === 0 || corner === 3) ? spreadZ : -spreadZ;
            addPoint(cx + (Math.random() - 0.5) * 2.5, y, cz + (Math.random() - 0.5) * 2.5);
        }

        // Walking Beam (Heavy Rocking Beam: Y = +12 to +22, X = -55 to +45)
        for (let i = 0; i < 650; i++) {
            const s = Math.random();
            const bx = -55 + s * 100;
            const by = 16 + Math.sin(s * Math.PI) * 4;
            const bz = (Math.random() - 0.5) * 8;
            addPoint(bx, by, bz);
        }

        // Iconic Curved Horsehead (Cabeza de Caballo at front: X = +45 to +68, Y = +2 to +35)
        for (let i = 0; i < 600; i++) {
            const angle = -Math.PI / 2 + Math.random() * Math.PI;
            const r = 18 + Math.random() * 3.5;
            const hx = 45 + Math.cos(angle) * r * 1.15;
            const hy = 18 + Math.sin(angle) * r;
            const hz = (Math.random() - 0.5) * 6;
            addPoint(hx, hy, hz);
        }

        // Wireline Bridle & Polished Rod into Wellhead (Vertical line at X = +65, Y = +6 down to -65)
        for (let i = 0; i < 350; i++) {
            const ry = -65 + Math.random() * 71;
            addPoint(65 + (Math.random() - 0.5) * 2, ry, (Math.random() - 0.5) * 2);
        }

        // Wellhead Christmas Tree & Valves Cluster (X = +65, Y = -65 to -40)
        for (let i = 0; i < 300; i++) {
            const vy = -65 + Math.random() * 25;
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

        // Crude Storage Tank (Left: X = -78, Y = -65 to -22, R = 18)
        const tankX = -78;
        const tankR = 18;
        for (let i = 0; i < 350; i++) {
            const ty = -65 + Math.random() * 43;
            const tAngle = Math.random() * Math.PI * 2;
            addPoint(tankX + Math.cos(tAngle) * tankR, ty, Math.sin(tAngle) * tankR);
        }

        while (idx < TOTAL_POINTS * 3) {
            const ax = (Math.random() - 0.5) * 220;
            const az = (Math.random() - 0.5) * 110;
            addPoint(ax, -65, az);
        }

        return targets;
    }

    // =========================================================================
    // 3. FORMATION: TALADRO DE PERFORACIÓN & WELL TESTING CON MECHURRIO
    // =========================================================================
    function generateWellTestingTargets() {
        const targets = new Float32Array(TOTAL_POINTS * 3);
        let idx = 0;

        function addPoint(x, y, z) {
            if (idx >= TOTAL_POINTS * 3) return;
            targets[idx++] = x;
            targets[idx++] = y;
            targets[idx++] = z;
        }

        // Elevated Drill Floor Substructure (X = -30 to +30, Y = -65 to -42)
        for (let i = 0; i < 450; i++) {
            const x = (Math.random() - 0.5) * 58;
            const z = (Math.random() - 0.5) * 58;
            const y = -65 + Math.random() * 23;
            addPoint(x, y, z);
        }

        // BOP Stack (Blowout Preventer under drill floor)
        for (let i = 0; i < 220; i++) {
            const angle = Math.random() * Math.PI * 2;
            const r = 6 + Math.random() * 4;
            const y = -65 + Math.random() * 21;
            addPoint(Math.cos(angle) * r, y, Math.sin(angle) * r);
        }

        // 4 Derrick Mast Legs (Y = -42 to +65)
        const towerBottomW = 26;
        const towerTopW = 12;
        for (let i = 0; i < 900; i++) {
            const t = Math.random();
            const y = -42 + t * 107;
            const w = (1 - t) * towerBottomW + t * towerTopW;

            const corner = Math.floor(Math.random() * 4);
            const cx = (corner === 0 || corner === 1) ? w : -w;
            const cz = (corner === 0 || corner === 3) ? w : -w;
            addPoint(cx + (Math.random() - 0.5) * 2, y, cz + (Math.random() - 0.5) * 2);
        }

        // Derrick Horizontal Fingerboards & Platforms
        for (let tier = 0; tier < 5; tier++) {
            const ty = -30 + tier * 18;
            const tw = towerBottomW - tier * 2.5;
            for (let p = 0; p < 70; p++) {
                const angle = (p / 70) * Math.PI * 2;
                addPoint(Math.cos(angle) * tw, ty, Math.sin(angle) * tw);
            }
        }

        // Square Crown Block at Top (Y = +65 to +75)
        for (let i = 0; i < 220; i++) {
            const x = (Math.random() - 0.5) * (towerTopW * 2 + 2);
            const z = (Math.random() - 0.5) * (towerTopW * 2 + 2);
            const y = 65 + Math.random() * 10;
            addPoint(x, y, z);
        }

        // Drill String / Kelly vertical core
        for (let i = 0; i < 300; i++) {
            const y = -42 + Math.random() * 107;
            const angle = Math.random() * Math.PI * 2;
            addPoint(Math.cos(angle) * 3.5, y, Math.sin(angle) * 3.5);
        }

        // Well Testing Flare Boom (Angled cantilever truss to right: X = 25 to 88, Y = -42 to +10)
        for (let i = 0; i < 450; i++) {
            const s = Math.random();
            const bx = 25 + s * 63;
            const by = -42 + s * 52;
            const bz = (Math.random() - 0.5) * (8 * (1 - s * 0.5));
            addPoint(bx, by, bz);
        }

        // Active Gas Flare Flame at tip (X = 88 to 108, Y = 10 to 32)
        for (let i = 0; i < 260; i++) {
            const fx = 88 + Math.random() * 20;
            const fy = 10 + Math.random() * 22;
            const fz = (Math.random() - 0.5) * 14;
            addPoint(fx, fy, fz);
        }

        // Choke Manifold & Separator Skid on left (X = -35 to -80, Y = -65 to -45)
        for (let i = 0; i < 350; i++) {
            const sx = -35 - Math.random() * 45;
            const sy = -65 + Math.random() * 20;
            const sz = (Math.random() - 0.5) * 30;
            addPoint(sx, sy, sz);
        }

        // Ground Matrix
        while (idx < TOTAL_POINTS * 3) {
            const angle = Math.random() * Math.PI * 2;
            const r = 30 + Math.random() * 85;
            addPoint(Math.cos(angle) * r, -65, Math.sin(angle) * r);
        }

        return targets;
    }

    // --- FORMATIONS ARRAY ---
    const formations = [
        generateRefinerySphereTargets(), // 1. Distillation Column + Spherical Hortonsphere Tank
        generatePumpjackTargets(),       // 2. Horsehead Pumpjack + Crude Tank
        generateWellTestingTargets()     // 3. Drilling Rig Derrick + Flare Boom Flame
    ];

    // --- BUFFER GEOMETRY ---
    const geometry = new THREE.BufferGeometry();
    const currentPositions = new Float32Array(TOTAL_POINTS * 3);
    const colors = new Float32Array(TOTAL_POINTS * 3);

    // Initialise at formation 0
    const initialTargets = formations[0];
    for (let i = 0; i < TOTAL_POINTS * 3; i++) {
        currentPositions[i] = initialTargets[i] + (Math.random() - 0.5) * 5;
    }

    const colorBottom = new THREE.Color(0x00e676); // Emerald Green
    const colorTop = new THREE.Color(0x00f2fe);    // Electric Cyan
    const colorFlame = new THREE.Color(0xffaa00);  // Gold / Orange for flame
    const tempColor = new THREE.Color();

    function updateColors(time) {
        for (let i = 0; i < TOTAL_POINTS; i++) {
            const x = currentPositions[i * 3];
            const y = currentPositions[i * 3 + 1];
            
            // Normalized height factor (Y from -65 to +75)
            const t = Math.max(0, Math.min(1, (y + 65) / 140));
            tempColor.copy(colorBottom).lerp(colorTop, t);

            // If particle is in the flare burner flame region (X > 85, Y > 5), add gold/amber warmth
            if (x > 85 && y > 5 && currentFormationIndex === 2) {
                tempColor.lerp(colorFlame, 0.7);
            }

            // Subtle luminous wave pulse across coordinates
            const wave = Math.sin(x * 0.04 + y * 0.03 + (time || 0) * 0.003) * 0.15;
            tempColor.r = Math.min(1, Math.max(0, tempColor.r + wave));
            tempColor.g = Math.min(1, Math.max(0, tempColor.g + wave));
            tempColor.b = Math.min(1, Math.max(0, tempColor.b + wave));

            colors[i * 3] = tempColor.r;
            colors[i * 3 + 1] = tempColor.g;
            colors[i * 3 + 2] = tempColor.b;
        }
    }
    updateColors(0);

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
        size: 5.0,
        vertexColors: true,
        map: createPointTexture(),
        transparent: true,
        opacity: 0.96,
        blending: THREE.AdditiveBlending,
        depthWrite: false
    });

    const pointCloud = new THREE.Points(geometry, material);
    scene.add(pointCloud);

    // --- MORPHING TIMELINE (EXTENDED DURATION: 6.2s PER STRUCTURE) ---
    let currentFormationIndex = 0;
    let isMorphing = false;
    let sourcePositions = new Float32Array(TOTAL_POINTS * 3);
    let targetPositions = formations[0];
    const morphDuration = 1.8; // Smooth 1.8s transition
    let morphStartTime = 0;

    function triggerNextFormation() {
        currentFormationIndex = (currentFormationIndex + 1) % formations.length;
        sourcePositions.set(currentPositions);
        targetPositions = formations[currentFormationIndex];
        
        isMorphing = true;
        morphStartTime = performance.now();
    }

    // Extended total cycle duration to 6200ms (1 extra second of display time)
    setInterval(triggerNextFormation, 6200);

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

            // Dynamic scan wave dispersion bell curve
            const dispersionStrength = Math.sin(t * Math.PI) * 26.0;

            const posAttr = geometry.attributes.position;
            const arr = posAttr.array;

            for (let i = 0; i < TOTAL_POINTS; i++) {
                const idx3 = i * 3;
                
                const seedX = Math.sin(i * 12.9898) * 1.5;
                const seedY = Math.cos(i * 78.233) * 1.5;
                const seedZ = Math.sin(i * 45.164) * 1.5;

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
            updateColors(now);
            geometry.attributes.color.needsUpdate = true;

            if (t >= 1.0) {
                isMorphing = false;
            }
        } else {
            // Active particle dynamics / breathing & flare flame flickering
            const time = now * 0.002;
            const posAttr = geometry.attributes.position;
            const arr = posAttr.array;

            // 1. Subtle breathing on structure nodes
            for (let i = 0; i < TOTAL_POINTS; i += 3) {
                const idx3 = i * 3;
                arr[idx3 + 1] += Math.sin(time + i * 0.08) * 0.07;
            }

            // 2. Active flame dancing if in formation 2 (Flare Boom)
            if (currentFormationIndex === 2) {
                for (let i = 0; i < TOTAL_POINTS; i++) {
                    const idx3 = i * 3;
                    if (arr[idx3] > 85 && arr[idx3 + 1] > 8) {
                        arr[idx3] += (Math.random() - 0.5) * 0.8;
                        arr[idx3 + 1] += Math.sin(time * 3 + i) * 0.6;
                        arr[idx3 + 2] += (Math.random() - 0.5) * 0.8;
                    }
                }
            }

            posAttr.needsUpdate = true;
            
            // Pulse colors gently
            updateColors(now);
            geometry.attributes.color.needsUpdate = true;
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

    console.log("⚡ Hero Refined 3D Engine: Spherical Tank Refinery, Pumpjack & Well Testing active (6.2s cycle).");
})();
