// ==========================================================================
// kaironInnova - 3D LiDAR Morphing Point Cloud Engine (Hero Floating Background)
// Formations:
// 1. Drilling Derrick / Oilfield Taladro
// 2. Refinery Distillation Column & Spherical Tank (El Palito)
// 3. Telecommunications Network & Satellite Core
// ==========================================================================

(function initHeroLidar() {
    const canvas = document.getElementById('hero-lidar-canvas');
    if (!canvas) return;

    const TOTAL_POINTS = 3200;

    // --- THREE.JS SCENE SETUP ---
    const scene = new THREE.Scene();
    const container = canvas.parentElement;

    const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 1, 2000);
    camera.position.set(0, 110, 360);

    const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // --- CONTROLS ---
    let controls = null;
    if (typeof THREE.OrbitControls !== 'undefined') {
        controls = new THREE.OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;
        controls.enableZoom = false; // Rock-stable Hero layout
        controls.enablePan = false;
        controls.autoRotate = true;
        controls.autoRotateSpeed = 1.3;
        controls.maxPolarAngle = Math.PI / 2 + 0.15;
        controls.minPolarAngle = Math.PI / 4;
        controls.target.set(0, 50, 0);
    }

    // --- 1. FORMATION: DRILLING DERRICK (Taladro Petrolero) ---
    function generateDerrickTargets() {
        const targets = new Float32Array(TOTAL_POINTS * 3);
        let idx = 0;

        function addPoint(x, y, z) {
            if (idx >= TOTAL_POINTS * 3) return;
            targets[idx++] = x;
            targets[idx++] = y;
            targets[idx++] = z;
        }

        // Base substructure
        const baseW = 110;
        const baseH = 24;
        for (let i = 0; i < 450; i++) {
            const x = (Math.random() - 0.5) * baseW;
            const z = (Math.random() - 0.5) * baseW;
            const y = Math.random() * baseH;
            addPoint(x, y, z);
        }

        // 4 Main corner legs
        const towerH = 220;
        const topW = 28;
        const legPoints = 900;
        for (let i = 0; i < legPoints; i++) {
            const t = Math.random();
            const y = baseH + t * towerH;
            const w = (1 - t) * (baseW * 0.45) + t * (topW * 0.5);
            
            const corner = Math.floor(Math.random() * 4);
            const cx = (corner === 0 || corner === 1) ? w : -w;
            const cz = (corner === 0 || corner === 3) ? w : -w;
            
            const jx = (Math.random() - 0.5) * 3;
            const jz = (Math.random() - 0.5) * 3;
            addPoint(cx + jx, y, cz + jz);
        }

        // Cross-bracing (K-bars / X-bracing)
        const braceLevels = 7;
        for (let l = 0; l < braceLevels; l++) {
            const y1 = baseH + (l / braceLevels) * towerH;
            const y2 = baseH + ((l + 1) / braceLevels) * towerH;
            const w1 = (1 - l / braceLevels) * (baseW * 0.45) + (l / braceLevels) * (topW * 0.5);
            const w2 = (1 - (l + 1) / braceLevels) * (baseW * 0.45) + ((l + 1) / braceLevels) * (topW * 0.5);

            for (let p = 0; p < 80; p++) {
                const s = Math.random();
                const y = y1 + s * (y2 - y1);
                const side = Math.floor(Math.random() * 4);
                
                const x_start = (side === 0 || side === 1) ? w1 : -w1;
                const x_end = (side === 0 || side === 1) ? -w2 : w2;
                const z_pos = (side === 0 || side === 2) ? w1 : -w1;

                const curX = x_start + s * (x_end - x_start);
                addPoint(curX, y, z_pos + (Math.random() - 0.5) * 3);
            }
        }

        // Central drill string
        for (let i = 0; i < 400; i++) {
            const y = Math.random() * (towerH + baseH);
            const angle = Math.random() * Math.PI * 2;
            const r = Math.random() * 5;
            addPoint(Math.cos(angle) * r, y, Math.sin(angle) * r);
        }

        // Crown block at top
        for (let i = 0; i < 350; i++) {
            const x = (Math.random() - 0.5) * (topW + 10);
            const z = (Math.random() - 0.5) * (topW + 10);
            const y = baseH + towerH + Math.random() * 18;
            addPoint(x, y, z);
        }

        // Ground scanning ring
        while (idx < TOTAL_POINTS * 3) {
            const angle = Math.random() * Math.PI * 2;
            const r = 40 + Math.random() * 110;
            addPoint(Math.cos(angle) * r, 0, Math.sin(angle) * r);
        }

        return targets;
    }

    // --- 2. FORMATION: REFINERY FRACTIONATION COLUMN & SPHERICAL TANK ---
    function generateRefineryTargets() {
        const targets = new Float32Array(TOTAL_POINTS * 3);
        let idx = 0;

        function addPoint(x, y, z) {
            if (idx >= TOTAL_POINTS * 3) return;
            targets[idx++] = x;
            targets[idx++] = y;
            targets[idx++] = z;
        }

        // Distillation Column (Left)
        const colX = -48;
        const colR = 28;
        const colH = 230;
        for (let i = 0; i < 1300; i++) {
            const y = Math.random() * colH;
            const angle = Math.random() * Math.PI * 2;
            const isSurface = Math.random() > 0.25;
            const r = isSurface ? colR + (Math.random() - 0.5) * 2 : Math.random() * colR;
            addPoint(colX + Math.cos(angle) * r, y, Math.sin(angle) * r);
        }

        // Spherical LPG Tank (Right)
        const sphereX = 58;
        const sphereY = 65;
        const sphereR = 50;
        for (let i = 0; i < 1000; i++) {
            const u = Math.random();
            const v = Math.random();
            const theta = u * 2.0 * Math.PI;
            const phi = Math.acos(2.0 * v - 1.0);
            const r = sphereR + (Math.random() - 0.5) * 2;
            
            const x = sphereX + r * Math.sin(phi) * Math.cos(theta);
            const y = sphereY + r * Math.sin(phi) * Math.sin(theta);
            const z = r * Math.cos(phi);
            addPoint(x, y, z);
        }

        // Legs for sphere
        for (let leg = 0; leg < 6; leg++) {
            const angle = (leg / 6) * Math.PI * 2;
            const lx = sphereX + Math.cos(angle) * (sphereR * 0.85);
            const lz = Math.sin(angle) * (sphereR * 0.85);
            for (let p = 0; p < 45; p++) {
                const y = (p / 45) * (sphereY * 0.9);
                addPoint(lx, y, lz);
            }
        }

        // Connecting pipe manifolds
        for (let pipe = 0; pipe < 3; pipe++) {
            const py = 35 + pipe * 45;
            for (let p = 0; p < 90; p++) {
                const s = p / 90;
                const px = colX + colR + s * (sphereX - sphereR - (colX + colR));
                const pz = (Math.random() - 0.5) * 6;
                addPoint(px, py + Math.sin(s * Math.PI) * 9, pz);
            }
        }

        while (idx < TOTAL_POINTS * 3) {
            const gx = (Math.random() - 0.5) * 240;
            const gz = (Math.random() - 0.5) * 150;
            addPoint(gx, 0, gz);
        }

        return targets;
    }

    // --- 3. FORMATION: TELECOM NETWORK MESH & SATELLITE CORE ---
    function generateTelecomMeshTargets() {
        const targets = new Float32Array(TOTAL_POINTS * 3);
        let idx = 0;

        function addPoint(x, y, z) {
            if (idx >= TOTAL_POINTS * 3) return;
            targets[idx++] = x;
            targets[idx++] = y;
            targets[idx++] = z;
        }

        // Central Mesh Globe Core
        const coreR = 72;
        const coreY = 100;
        for (let i = 0; i < 1300; i++) {
            const u = Math.random();
            const v = Math.random();
            const theta = u * 2.0 * Math.PI;
            const phi = Math.acos(2.0 * v - 1.0);
            
            const isRing = (Math.floor(phi * 6) % 2 === 0);
            const r = isRing ? coreR : (coreR * 0.96);
            
            const x = r * Math.sin(phi) * Math.cos(theta);
            const y = coreY + r * Math.sin(phi) * Math.sin(theta);
            const z = r * Math.cos(phi);
            addPoint(x, y, z);
        }

        // 2 Orbiting Satellite / Fiber Relay Rings
        const ring1R = 120;
        for (let i = 0; i < 700; i++) {
            const angle = (i / 700) * Math.PI * 2;
            const rx = Math.cos(angle) * ring1R;
            const ry = Math.sin(angle) * ring1R * 0.45;
            const rz = Math.sin(angle) * ring1R * 0.85;
            
            const x = rx;
            const y = coreY + ry * Math.cos(0.4) - rz * Math.sin(0.4);
            const z = ry * Math.sin(0.4) + rz * Math.cos(0.4);
            addPoint(x + (Math.random() - 0.5) * 4, y + (Math.random() - 0.5) * 4, z);
        }

        const ring2R = 135;
        for (let i = 0; i < 600; i++) {
            const angle = (i / 600) * Math.PI * 2;
            const rx = Math.cos(angle) * ring2R;
            const ry = Math.sin(angle) * ring2R * 0.35;
            const rz = Math.sin(angle) * ring2R * 0.9;
            
            const x = rx * Math.cos(0.6) + rz * Math.sin(0.6);
            const y = coreY + ry;
            const z = -rx * Math.sin(0.6) + rz * Math.cos(0.6);
            addPoint(x + (Math.random() - 0.5) * 4, y + (Math.random() - 0.5) * 4, z);
        }

        // Radial beam pulses
        for (let beam = 0; beam < 14; beam++) {
            const phi = Math.random() * Math.PI;
            const theta = Math.random() * Math.PI * 2;
            const dirX = Math.sin(phi) * Math.cos(theta);
            const dirY = Math.sin(phi) * Math.sin(theta);
            const dirZ = Math.cos(phi);
            
            for (let p = 0; p < 28; p++) {
                const dist = coreR + (p / 28) * 80;
                addPoint(dirX * dist, coreY + dirY * dist, dirZ * dist);
            }
        }

        while (idx < TOTAL_POINTS * 3) {
            const gx = (Math.random() - 0.5) * 200;
            const gz = (Math.random() - 0.5) * 200;
            addPoint(gx, 0, gz);
        }

        return targets;
    }

    const formations = [
        generateDerrickTargets(),
        generateRefineryTargets(),
        generateTelecomMeshTargets()
    ];

    // --- BUFFER GEOMETRY INITIALIZATION ---
    const geometry = new THREE.BufferGeometry();
    const currentPositions = new Float32Array(TOTAL_POINTS * 3);
    const colors = new Float32Array(TOTAL_POINTS * 3);

    const initialTargets = formations[0];
    for (let i = 0; i < TOTAL_POINTS * 3; i++) {
        currentPositions[i] = initialTargets[i] + (Math.random() - 0.5) * 8;
    }

    const colorBottom = new THREE.Color(0x00e676); // Emerald Green
    const colorTop = new THREE.Color(0x00f2fe);    // Electric Cyan
    const tempColor = new THREE.Color();

    function updateColors() {
        for (let i = 0; i < TOTAL_POINTS; i++) {
            const y = currentPositions[i * 3 + 1];
            const t = Math.max(0, Math.min(1, y / 240));
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
        size: 4.6,
        vertexColors: true,
        map: createPointTexture(),
        transparent: true,
        opacity: 0.95,
        blending: THREE.AdditiveBlending,
        depthWrite: false
    });

    const pointCloud = new THREE.Points(geometry, material);
    scene.add(pointCloud);

    // --- MORPHING ENGINE ---
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

    setInterval(triggerNextFormation, 4600);

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

            const dispersionStrength = Math.sin(t * Math.PI) * 28.0;

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
                arr[idx3 + 1] += Math.sin(time + i * 0.1) * 0.07;
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

    console.log("⚡ Hero Seamless 3D Point Cloud Engine active.");
})();
