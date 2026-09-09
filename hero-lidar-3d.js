// ==========================================================================
// kaironInnova - 3D LiDAR Morphing Engine (Hero Viewport)
// Venezuelan & Oilfield High-Precision Landmarks:
// 1. Well Testing & Taladro de Perforación (Drilling Derrick + Flare Boom + BOP)
// 2. Buque Tanquero Petrolero (Oil Tanker Vessel + Deck Manifold + Bridge)
// 3. Balancín Petrolero & Campo Lago Guanoco (Pumpjack Horsehead + Christmas Tree + Tank)
// ==========================================================================

(function initHeroLidar() {
    const canvas = document.getElementById('hero-lidar-canvas');
    if (!canvas) return;

    const TOTAL_POINTS = 3600;

    // --- THREE.JS SCENE SETUP ---
    const scene = new THREE.Scene();
    const container = canvas.parentElement;

    // Center camera with generous FOV and target at (0, 0, 0)
    const camera = new THREE.PerspectiveCamera(42, container.clientWidth / container.clientHeight, 1, 2000);
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
        controls.enableZoom = false; // Prevents page scroll interference
        controls.enablePan = false;
        controls.autoRotate = true;
        controls.autoRotateSpeed = 1.1;
        controls.maxPolarAngle = Math.PI / 2 + 0.12;
        controls.minPolarAngle = Math.PI / 4;
        controls.target.set(0, 0, 0); // Perfectly centered at (0,0,0)
    }

    // =========================================================================
    // 1. FORMATION: WELL TESTING & TALADRO DE PERFORACIÓN
    // =========================================================================
    function generateWellTestingDerrickTargets() {
        const targets = new Float32Array(TOTAL_POINTS * 3);
        let idx = 0;

        function addPoint(x, y, z) {
            if (idx >= TOTAL_POINTS * 3) return;
            targets[idx++] = x;
            targets[idx++] = y;
            targets[idx++] = z;
        }

        // Substructure Base (-70 to -45)
        const baseW = 65;
        for (let i = 0; i < 400; i++) {
            const x = (Math.random() - 0.5) * baseW;
            const z = (Math.random() - 0.5) * baseW;
            const y = -70 + Math.random() * 25;
            addPoint(x, y, z);
        }

        // Blowout Preventer (BOP Stack) under drill floor
        for (let i = 0; i < 220; i++) {
            const angle = Math.random() * Math.PI * 2;
            const r = 6 + Math.random() * 4;
            const y = -68 + Math.random() * 22;
            addPoint(Math.cos(angle) * r, y, Math.sin(angle) * r);
        }

        // 4 Main Derrick Legs tapering from Y = -45 to Y = +65
        const towerBottomW = 28;
        const towerTopW = 11;
        const legPoints = 900;
        for (let i = 0; i < legPoints; i++) {
            const t = Math.random();
            const y = -45 + t * 110;
            const w = (1 - t) * towerBottomW + t * towerTopW;

            const corner = Math.floor(Math.random() * 4);
            const cx = (corner === 0 || corner === 1) ? w : -w;
            const cz = (corner === 0 || corner === 3) ? w : -w;
            const jx = (Math.random() - 0.5) * 2;
            const jz = (Math.random() - 0.5) * 2;
            addPoint(cx + jx, y, cz + jz);
        }

        // Derrick X-Bracing across 6 tiers
        const tiers = 6;
        for (let l = 0; l < tiers; l++) {
            const y1 = -45 + (l / tiers) * 110;
            const y2 = -45 + ((l + 1) / tiers) * 110;
            const w1 = (1 - l / tiers) * towerBottomW + (l / tiers) * towerTopW;
            const w2 = (1 - (l + 1) / tiers) * towerBottomW + ((l + 1) / tiers) * towerTopW;

            for (let p = 0; p < 75; p++) {
                const s = Math.random();
                const y = y1 + s * (y2 - y1);
                const side = Math.floor(Math.random() * 4);

                const x_start = (side === 0 || side === 1) ? w1 : -w1;
                const x_end = (side === 0 || side === 1) ? -w2 : w2;
                const z_pos = (side === 0 || side === 2) ? w1 : -w1;

                const curX = x_start + s * (x_end - x_start);
                addPoint(curX, y, z_pos + (Math.random() - 0.5) * 2.5);
            }
        }

        // Crown Block & Mast Top (Y = +65 to +78)
        for (let i = 0; i < 280; i++) {
            const x = (Math.random() - 0.5) * (towerTopW * 2 + 4);
            const z = (Math.random() - 0.5) * (towerTopW * 2 + 4);
            const y = 65 + Math.random() * 13;
            addPoint(x, y, z);
        }

        // Central Drill String & Kelly / Traveling Block
        for (let i = 0; i < 350; i++) {
            const y = -45 + Math.random() * 110;
            const angle = Math.random() * Math.PI * 2;
            const r = Math.random() * 3.5;
            addPoint(Math.cos(angle) * r, y, Math.sin(angle) * r);
        }

        // Well Testing Flare Boom (Brazo de Quemador Well Testing extending right)
        for (let i = 0; i < 420; i++) {
            const s = Math.random();
            const bx = 30 + s * 65; // from X=30 to X=95
            const by = -45 + s * 22; // angled upwards
            const bz = (Math.random() - 0.5) * (8 * (1 - s * 0.5));
            addPoint(bx, by + (Math.random() - 0.5) * 3, bz);
        }

        // Flare Burner Flame (Llama de gas en la punta del Well Testing)
        for (let i = 0; i < 180; i++) {
            const fx = 95 + Math.random() * 18;
            const fy = -23 + Math.random() * 16 + (fx - 95) * 0.3;
            const fz = (Math.random() - 0.5) * 12;
            addPoint(fx, fy, fz);
        }

        // Choke Manifold & Separator Skid (Left side)
        for (let i = 0; i < 320; i++) {
            const sx = -35 - Math.random() * 45; // X: -35 to -80
            const sy = -70 + Math.random() * 20;
            const sz = (Math.random() - 0.5) * 30;
            addPoint(sx, sy, sz);
        }

        // Ground base ring
        while (idx < TOTAL_POINTS * 3) {
            const angle = Math.random() * Math.PI * 2;
            const r = 30 + Math.random() * 85;
            addPoint(Math.cos(angle) * r, -70, Math.sin(angle) * r);
        }

        return targets;
    }

    // =========================================================================
    // 2. FORMATION: BUQUE TANQUERO PETROLERO (OIL TANKER)
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

        // Ship Hull (Length: X = -95 to +95, Depth: Y = -45 to -10, Beam: Z = -26 to +26)
        for (let i = 0; i < 1400; i++) {
            const t = Math.random(); // 0 to 1 along length
            const x = -95 + t * 190;
            
            // Beam profile (tapered bow at X > 50, tapered stern at X < -70)
            let beamFactor = 1.0;
            if (x > 50) beamFactor = Math.max(0.05, 1.0 - Math.pow((x - 50) / 45, 1.8));
            else if (x < -70) beamFactor = Math.max(0.3, 1.0 - Math.pow((Math.abs(x) - 70) / 25, 1.2));
            
            const maxZ = 25 * beamFactor;
            const z = (Math.random() - 0.5) * 2 * maxZ;
            
            // Keel to deck profile (U-shaped hull)
            const hullDepth = Math.pow(Math.abs(z) / (maxZ || 1), 2) * 10;
            const y = -42 + hullDepth + Math.random() * 28;
            addPoint(x, Math.min(-10, y), z);
        }

        // Main Cargo Deck Manifolds & Pipelines (X = -45 to +50, Y = -10 to -3)
        for (let pipe = 0; pipe < 4; pipe++) {
            const pz = -12 + pipe * 8;
            for (let p = 0; p < 130; p++) {
                const px = -45 + (p / 130) * 95;
                addPoint(px, -8 + (Math.random() - 0.5) * 2, pz + (Math.random() - 0.5) * 1.5);
            }
        }

        // Cargo Crane / Hose Handling Derrick (Midship X = 5, Y = -10 to +25)
        for (let i = 0; i < 220; i++) {
            const cy = -10 + Math.random() * 32;
            const angle = Math.random() * Math.PI * 2;
            const cr = Math.random() * 4;
            addPoint(5 + Math.cos(angle) * cr, cy, Math.sin(angle) * cr);
        }
        // Crane Boom arm
        for (let i = 0; i < 160; i++) {
            const s = Math.random();
            addPoint(5 + s * 30, 22 - s * 10, (Math.random() - 0.5) * 4);
        }

        // Navigation Bridge & Superstructure Castle at Stern (X = -82 to -52, Y = -10 to +42)
        for (let i = 0; i < 650; i++) {
            const bx = -82 + Math.random() * 30;
            const bz = (Math.random() - 0.5) * 36;
            const by = -10 + Math.random() * 50;
            addPoint(bx, by, bz);
        }

        // Exhaust Funnel / Chimney (X = -74, Y = +40 to +65)
        for (let i = 0; i < 200; i++) {
            const fy = 40 + Math.random() * 24;
            const fAngle = Math.random() * Math.PI * 2;
            const fr = Math.random() * 5;
            addPoint(-74 + Math.cos(fAngle) * fr, fy, Math.sin(fAngle) * fr);
        }

        // Radar Mast atop Bridge (X = -62, Y = +40 to +72)
        for (let i = 0; i < 160; i++) {
            const my = 40 + Math.random() * 32;
            addPoint(-62 + (Math.random() - 0.5) * 2, my, (Math.random() - 0.5) * 2);
        }
        // Radar Crossbars
        for (let i = 0; i < 100; i++) {
            const rz = (Math.random() - 0.5) * 22;
            addPoint(-62, 62 + (Math.random() - 0.5) * 2, rz);
        }

        // Sea Waterline Wave Ring
        while (idx < TOTAL_POINTS * 3) {
            const sx = (Math.random() - 0.5) * 230;
            const sz = (Math.random() - 0.5) * 110;
            addPoint(sx, -44 + (Math.random() - 0.5) * 2, sz);
        }

        return targets;
    }

    // =========================================================================
    // 3. FORMATION: BALANCÍN PETROLERO & CAMPO LAGO GUANOCO
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

        // Base frame & Guanoco Ground Platform (Y = -68)
        for (let i = 0; i < 450; i++) {
            const gx = -85 + Math.random() * 170;
            const gz = (Math.random() - 0.5) * 70;
            addPoint(gx, -68 + (Math.random() - 0.5) * 2.5, gz);
        }

        // Samson Post (Central A-Frame Tower: Y = -68 to +15, X around 0)
        for (let i = 0; i < 650; i++) {
            const s = Math.random();
            const y = -68 + s * 83; // from -68 to +15
            const leg = Math.floor(Math.random() * 3);
            
            let lx = 0, lz = 0;
            const spread = (1 - s) * 22;
            if (leg === 0) { lx = -spread; lz = -spread; }
            else if (leg === 1) { lx = -spread; lz = spread; }
            else { lx = spread * 1.1; lz = 0; }
            
            addPoint(lx + (Math.random() - 0.5) * 2.5, y, lz + (Math.random() - 0.5) * 2.5);
        }

        // Walking Beam (Viga Balancín: Y = +15 to +25, X = -55 to +42)
        for (let i = 0; i < 550; i++) {
            const s = Math.random();
            const bx = -55 + s * 97;
            const by = 18 + Math.sin(s * Math.PI) * 4;
            const bz = (Math.random() - 0.5) * 7;
            addPoint(bx, by, bz);
        }

        // Horsehead (Cabeza de Caballo at front: X = +42 to +65, Y = +5 to +36)
        for (let i = 0; i < 480; i++) {
            const angle = -Math.PI / 2 + Math.random() * Math.PI;
            const r = 16 + Math.random() * 3;
            const hx = 45 + Math.cos(angle) * r * 1.1;
            const hy = 20 + Math.sin(angle) * r;
            const hz = (Math.random() - 0.5) * 5;
            addPoint(hx, hy, hz);
        }

        // Bridle & Polished Rod into Wellhead (Vertical line at X = +62, Y = +8 down to -65)
        for (let i = 0; i < 300; i++) {
            const ry = -65 + Math.random() * 73;
            addPoint(62 + (Math.random() - 0.5) * 2, ry, (Math.random() - 0.5) * 2);
        }

        // Wellhead Christmas Tree (Árbol de Navidad con válvulas at X = +62, Y = -68 to -45)
        for (let i = 0; i < 220; i++) {
            const vy = -68 + Math.random() * 23;
            const vz = (Math.random() - 0.5) * 14;
            addPoint(62 + (Math.random() - 0.5) * 6, vy, vz);
        }

        // Crank Arm & Counterweights at Back (X = -55, Y = -42 to +8)
        for (let i = 0; i < 400; i++) {
            const cAngle = Math.random() * Math.PI * 2;
            const cr = 10 + Math.random() * 12;
            const cx = -55 + Math.cos(cAngle) * cr * 0.7;
            const cy = -20 + Math.sin(cAngle) * cr;
            const cz = (Math.random() - 0.5) * 10;
            addPoint(cx, cy, cz);
        }

        // Crude Storage Tank at Lago Guanoco (Left background: X = -95 to -65, Y = -68 to -30)
        const tankX = -80;
        const tankR = 16;
        for (let i = 0; i < 350; i++) {
            const ty = -68 + Math.random() * 38;
            const tAngle = Math.random() * Math.PI * 2;
            addPoint(tankX + Math.cos(tAngle) * tankR, ty, Math.sin(tAngle) * tankR);
        }

        // Asphalt reservoir ground fill
        while (idx < TOTAL_POINTS * 3) {
            const ax = (Math.random() - 0.5) * 210;
            const az = (Math.random() - 0.5) * 110;
            addPoint(ax, -68, az);
        }

        return targets;
    }

    // --- FORMATIONS ARRAY ---
    const formations = [
        generateWellTestingDerrickTargets(),
        generateOilTankerTargets(),
        generateGuanocoPumpjackTargets()
    ];

    // --- BUFFER GEOMETRY ---
    const geometry = new THREE.BufferGeometry();
    const currentPositions = new Float32Array(TOTAL_POINTS * 3);
    const colors = new Float32Array(TOTAL_POINTS * 3);

    // Initialise at formation 0
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
            // Y spans -70 to +80 -> normalize
            const t = Math.max(0, Math.min(1, (y + 70) / 150));
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
            // Subtle breathing idle oscillation
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

    console.log("⚡ Hero Well Testing, Petrolero & Guanoco 3D Engine active.");
})();
