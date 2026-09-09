// ==========================================================================
// kaironInnova - 3D LiDAR Morphing Engine (Hero Section - Instant Load Edition)
// 100% Recognizable Oilfield Landmarks:
// 1. Refinería El Palito: Torre de Destilación + Gran Tanque Esférico (Hortonsphere) + Tuberías
// 2. Balancín Petrolero "Cabeza de Caballo" + Tanque de Crudo + Árbol de Navidad
// 3. Taladro de Perforación & Well Testing con Mechurrio de Llama Activa
// ==========================================================================

function initHeroLidar() {
    const canvas = document.getElementById('hero-lidar-canvas');
    if (!canvas) return;

    const TOTAL_POINTS = 3800;
    const container = canvas.parentElement;

    // Guaranteed dimensions
    const width = (container && container.clientWidth > 50) ? container.clientWidth : 500;
    const height = (container && container.clientHeight > 50) ? container.clientHeight : 440;

    // --- THREE.JS SCENE SETUP ---
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, width / height, 1, 2000);
    camera.position.set(0, 8, 300);

    const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

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

        // Fractionation Column (Left: X = -50, Y = -65 to +65, R = 22)
        const colX = -50;
        const colR = 22;
        const colH = 130;
        for (let i = 0; i < 1300; i++) {
            const y = -65 + (i / 1300) * colH;
            const angle = Math.random() * Math.PI * 2;
            const isSurface = Math.random() > 0.25;
            const r = isSurface ? colR + (Math.random() - 0.5) * 1.5 : Math.random() * colR;
            addPoint(colX + Math.cos(angle) * r, y, Math.sin(angle) * r);
        }
        for (let t = 0; t < 7; t++) {
            const ty = -60 + t * 20;
            for (let p = 0; p < 50; p++) {
                const angle = (p / 50) * Math.PI * 2;
                addPoint(colX + Math.cos(angle) * (colR + 3.5), ty, Math.sin(angle) * (colR + 3.5));
            }
        }
        for (let i = 0; i < 90; i++) {
            const vy = 65 + Math.random() * 12;
            addPoint(colX + (Math.random() - 0.5) * 6, vy, (Math.random() - 0.5) * 6);
        }

        // Spherical Hortonsphere Tank (Right: X = +50, Y = -5, R = 42)
        const sphereX = 50;
        const sphereY = -5;
        const sphereR = 42;
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
        for (let i = 0; i < 120; i++) {
            const angle = (i / 120) * Math.PI * 2;
            addPoint(sphereX + Math.cos(angle) * (sphereR + 3), sphereY, Math.sin(angle) * (sphereR + 3));
        }
        for (let leg = 0; leg < 8; leg++) {
            const angle = (leg / 8) * Math.PI * 2;
            const lx = sphereX + Math.cos(angle) * (sphereR * 0.88);
            const lz = Math.sin(angle) * (sphereR * 0.88);
            for (let p = 0; p < 40; p++) {
                const s = p / 40;
                const ly = sphereY - (sphereR * 0.4) - s * 40;
                addPoint(lx, Math.max(-65, ly), lz);
            }
        }

        // Interconnecting Pipe Manifold Bridge
        for (let pipe = 0; pipe < 3; pipe++) {
            const py = -40 + pipe * 30;
            for (let p = 0; p < 80; p++) {
                const s = p / 80;
                const px = colX + colR + s * (sphereX - sphereR - (colX + colR));
                const pz = (Math.random() - 0.5) * 5;
                addPoint(px, py + Math.sin(s * Math.PI) * 5, pz);
            }
        }

        while (idx < TOTAL_POINTS * 3) {
            const gx = (Math.random() - 0.5) * 220;
            const gz = (Math.random() - 0.5) * 120;
            addPoint(gx, -65 + (Math.random() - 0.5) * 2, gz);
        }

        return targets;
    }

    // =========================================================================
    // 2. FORMATION: BALANCÍN PETROLERO "CABEZA DE CABALLO" & TANQUE
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

        for (let i = 0; i < 450; i++) {
            const gx = -80 + Math.random() * 160;
            const gz = (Math.random() - 0.5) * 55;
            addPoint(gx, -65 + (Math.random() - 0.5) * 2, gz);
        }

        for (let i = 0; i < 750; i++) {
            const s = Math.random();
            const y = -65 + s * 77;
            const corner = Math.floor(Math.random() * 4);
            const spreadX = (1 - s) * 25;
            const spreadZ = (1 - s) * 20;

            const cx = (corner === 0 || corner === 1) ? spreadX : -spreadX;
            const cz = (corner === 0 || corner === 3) ? spreadZ : -spreadZ;
            addPoint(cx + (Math.random() - 0.5) * 2, y, cz + (Math.random() - 0.5) * 2);
        }

        for (let i = 0; i < 600; i++) {
            const s = Math.random();
            const bx = -52 + s * 94;
            const by = 16 + Math.sin(s * Math.PI) * 3.5;
            const bz = (Math.random() - 0.5) * 7;
            addPoint(bx, by, bz);
        }

        for (let i = 0; i < 550; i++) {
            const angle = -Math.PI / 2 + Math.random() * Math.PI;
            const r = 17 + Math.random() * 3;
            const hx = 43 + Math.cos(angle) * r * 1.15;
            const hy = 18 + Math.sin(angle) * r;
            const hz = (Math.random() - 0.5) * 5.5;
            addPoint(hx, hy, hz);
        }

        for (let i = 0; i < 350; i++) {
            const ry = -65 + Math.random() * 71;
            addPoint(62 + (Math.random() - 0.5) * 2, ry, (Math.random() - 0.5) * 2);
        }

        for (let i = 0; i < 280; i++) {
            const vy = -65 + Math.random() * 25;
            const vz = (Math.random() - 0.5) * 14;
            addPoint(62 + (Math.random() - 0.5) * 6, vy, vz);
        }

        for (let i = 0; i < 450; i++) {
            const cAngle = Math.random() * Math.PI * 2;
            const cr = 12 + Math.random() * 11;
            const cx = -52 + Math.cos(cAngle) * cr * 0.75;
            const cy = -18 + Math.sin(cAngle) * cr;
            const cz = (Math.random() - 0.5) * 10;
            addPoint(cx, cy, cz);
        }

        const tankX = -75;
        const tankR = 17;
        for (let i = 0; i < 350; i++) {
            const ty = -65 + Math.random() * 43;
            const tAngle = Math.random() * Math.PI * 2;
            addPoint(tankX + Math.cos(tAngle) * tankR, ty, Math.sin(tAngle) * tankR);
        }

        while (idx < TOTAL_POINTS * 3) {
            const ax = (Math.random() - 0.5) * 210;
            const az = (Math.random() - 0.5) * 100;
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

        for (let i = 0; i < 400; i++) {
            const x = (Math.random() - 0.5) * 54;
            const z = (Math.random() - 0.5) * 54;
            const y = -65 + Math.random() * 23;
            addPoint(x, y, z);
        }

        for (let i = 0; i < 200; i++) {
            const angle = Math.random() * Math.PI * 2;
            const r = 5.5 + Math.random() * 3.5;
            const y = -65 + Math.random() * 21;
            addPoint(Math.cos(angle) * r, y, Math.sin(angle) * r);
        }

        const towerBottomW = 25;
        const towerTopW = 11;
        for (let i = 0; i < 850; i++) {
            const t = Math.random();
            const y = -42 + t * 107;
            const w = (1 - t) * towerBottomW + t * towerTopW;

            const corner = Math.floor(Math.random() * 4);
            const cx = (corner === 0 || corner === 1) ? w : -w;
            const cz = (corner === 0 || corner === 3) ? w : -w;
            addPoint(cx + (Math.random() - 0.5) * 2, y, cz + (Math.random() - 0.5) * 2);
        }

        for (let tier = 0; tier < 5; tier++) {
            const ty = -30 + tier * 18;
            const tw = towerBottomW - tier * 2.5;
            for (let p = 0; p < 60; p++) {
                const angle = (p / 60) * Math.PI * 2;
                addPoint(Math.cos(angle) * tw, ty, Math.sin(angle) * tw);
            }
        }

        for (let i = 0; i < 200; i++) {
            const x = (Math.random() - 0.5) * (towerTopW * 2 + 2);
            const z = (Math.random() - 0.5) * (towerTopW * 2 + 2);
            const y = 65 + Math.random() * 10;
            addPoint(x, y, z);
        }

        for (let i = 0; i < 300; i++) {
            const y = -42 + Math.random() * 107;
            const angle = Math.random() * Math.PI * 2;
            addPoint(Math.cos(angle) * 3.5, y, Math.sin(angle) * 3.5);
        }

        for (let i = 0; i < 450; i++) {
            const s = Math.random();
            const bx = 25 + s * 60;
            const by = -42 + s * 52;
            const bz = (Math.random() - 0.5) * (7 * (1 - s * 0.5));
            addPoint(bx, by, bz);
        }

        for (let i = 0; i < 280; i++) {
            const fx = 85 + Math.random() * 20;
            const fy = 10 + Math.random() * 22;
            const fz = (Math.random() - 0.5) * 14;
            addPoint(fx, fy, fz);
        }

        for (let i = 0; i < 350; i++) {
            const sx = -32 - Math.random() * 43;
            const sy = -65 + Math.random() * 20;
            const sz = (Math.random() - 0.5) * 28;
            addPoint(sx, sy, sz);
        }

        while (idx < TOTAL_POINTS * 3) {
            const angle = Math.random() * Math.PI * 2;
            const r = 28 + Math.random() * 80;
            addPoint(Math.cos(angle) * r, -65, Math.sin(angle) * r);
        }

        return targets;
    }

    const formations = [
        generateRefinerySphereTargets(),
        generatePumpjackTargets(),
        generateWellTestingTargets()
    ];

    const geometry = new THREE.BufferGeometry();
    const currentPositions = new Float32Array(TOTAL_POINTS * 3);
    const colors = new Float32Array(TOTAL_POINTS * 3);

    const initialTargets = formations[0];
    for (let i = 0; i < TOTAL_POINTS * 3; i++) {
        currentPositions[i] = initialTargets[i];
    }

    const colorBottom = new THREE.Color(0x00e676);
    const colorTop = new THREE.Color(0x00f2fe);
    const colorFlame = new THREE.Color(0xffaa00);
    const tempColor = new THREE.Color();

    function updateColors(time) {
        for (let i = 0; i < TOTAL_POINTS; i++) {
            const x = currentPositions[i * 3];
            const y = currentPositions[i * 3 + 1];
            
            const t = Math.max(0, Math.min(1, (y + 65) / 140));
            tempColor.copy(colorBottom).lerp(colorTop, t);

            if (x > 82 && y > 6 && currentFormationIndex === 2) {
                tempColor.lerp(colorFlame, 0.75);
            }

            const wave = Math.sin(x * 0.04 + y * 0.03 + (time || 0) * 0.003) * 0.12;
            tempColor.r = Math.min(1, Math.max(0, tempColor.r + wave));
            tempColor.g = Math.min(1, Math.max(0, tempColor.g + wave));
            tempColor.b = Math.min(1, Math.max(0, tempColor.b + wave));

            colors[i * 3] = tempColor.r;
            colors[i * 3 + 1] = tempColor.g;
            colors[i * 3 + 2] = tempColor.b;
        }
    }
    updateColors(0);

    geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(currentPositions), 3));
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
        size: 5.5,
        vertexColors: true,
        map: createPointTexture(),
        transparent: true,
        opacity: 0.98,
        blending: THREE.AdditiveBlending,
        depthWrite: false
    });

    const pointCloud = new THREE.Points(geometry, material);
    scene.add(pointCloud);

    let currentFormationIndex = 0;
    let isMorphing = false;
    let sourcePositions = new Float32Array(TOTAL_POINTS * 3);
    let targetPositions = formations[0];
    const morphDuration = 1.8;
    let morphStartTime = 0;

    function triggerNextFormation() {
        currentFormationIndex = (currentFormationIndex + 1) % formations.length;
        sourcePositions.set(currentPositions);
        targetPositions = formations[currentFormationIndex];
        
        isMorphing = true;
        morphStartTime = performance.now();
    }

    setInterval(triggerNextFormation, 6200);

    function easeInOutCubic(x) {
        return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
    }

    let clock = new THREE.Clock();

    function handleResize() {
        if (!container || !renderer || !camera) return;
        const w = container.clientWidth || 500;
        const h = container.clientHeight || 440;
        if (w === 0 || h === 0) return;

        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
    }

    window.addEventListener('resize', handleResize);

    function animate() {
        requestAnimationFrame(animate);

        const delta = clock.getDelta();
        const now = performance.now();

        if (controls) controls.update();

        // Responsive aspect sync
        if (container && container.clientWidth > 50) {
            const currentAspect = container.clientWidth / container.clientHeight;
            if (Math.abs(camera.aspect - currentAspect) > 0.05) {
                handleResize();
            }
        }

        const posAttr = geometry.attributes.position;
        const arr = posAttr.array;

        if (isMorphing) {
            const elapsed = (now - morphStartTime) / (morphDuration * 1000);
            const t = Math.min(1.0, elapsed);
            const easedT = easeInOutCubic(t);

            const dispersionStrength = Math.sin(t * Math.PI) * 26.0;

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

                const curX = sx + (tx - sx) * easedT + seedX * dispersionStrength;
                const curY = sy + (ty - sy) * easedT + seedY * dispersionStrength;
                const curZ = sz + (tz - sz) * easedT + seedZ * dispersionStrength;

                currentPositions[idx3] = curX;
                currentPositions[idx3 + 1] = curY;
                currentPositions[idx3 + 2] = curZ;

                arr[idx3] = curX;
                arr[idx3 + 1] = curY;
                arr[idx3 + 2] = curZ;
            }

            posAttr.needsUpdate = true;
            updateColors(now);
            geometry.attributes.color.needsUpdate = true;

            if (t >= 1.0) {
                isMorphing = false;
                currentPositions.set(targetPositions);
            }
        } else {
            const time = now * 0.002;

            for (let i = 0; i < TOTAL_POINTS; i++) {
                const idx3 = i * 3;
                const bx = currentPositions[idx3];
                const by = currentPositions[idx3 + 1];
                const bz = currentPositions[idx3 + 2];

                let dy = Math.sin(time + i * 0.08) * 0.6;
                let dx = 0;
                let dz = 0;

                if (currentFormationIndex === 2 && bx > 82 && by > 8) {
                    dx = Math.sin(time * 5 + i) * 1.2;
                    dy = Math.cos(time * 4 + i) * 1.8;
                    dz = Math.sin(time * 4.5 + i) * 1.2;
                }

                arr[idx3] = bx + dx;
                arr[idx3 + 1] = by + dy;
                arr[idx3 + 2] = bz + dz;
            }

            posAttr.needsUpdate = true;
            updateColors(now);
            geometry.attributes.color.needsUpdate = true;
        }

        renderer.render(scene, camera);
    }

    animate();
    handleResize();

    console.log("⚡ Hero 3D LiDAR Engine initialized with guaranteed viewport render.");
}

// Auto-run on DOM ready or immediate
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initHeroLidar);
} else {
    initHeroLidar();
}
