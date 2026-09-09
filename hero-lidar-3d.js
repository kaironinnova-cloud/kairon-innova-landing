// ==========================================================================
// kaironInnova - 3D LiDAR Morphing Point Cloud Engine
// Ultra-Realistic Industrial Oilfield Formations:
// 1. Complejo de Refinación & Gran Tanque Esférico (Hortonsphere)
// 2. Balancín Petrolero "Cabeza de Caballo" (Walking Beam Pumpjack & Tank)
// 3. Taladro de Perforación de Campo & Well Testing con Mechurrio Activo
// ==========================================================================

let isHeroLidarInitialized = false;

function initHeroLidar() {
    if (isHeroLidarInitialized) return;

    if (typeof THREE === 'undefined') {
        const checkTimer = setInterval(function() {
            if (typeof THREE !== 'undefined' && !isHeroLidarInitialized) {
                clearInterval(checkTimer);
                initHeroLidar();
            }
        }, 50);
        return;
    }

    const canvas = document.getElementById('hero-lidar-canvas');
    if (!canvas) return;

    isHeroLidarInitialized = true;

    const TOTAL_POINTS = 4200;
    const container = canvas.parentElement;

    // Viewport dimensions
    const rect = container ? container.getBoundingClientRect() : { width: 500, height: 460 };
    const width = rect.width > 50 ? rect.width : 500;
    const height = rect.height > 50 ? rect.height : 460;

    // --- THREE.JS SCENE SETUP ---
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, width / height, 1, 2000);
    camera.position.set(0, 8, 320);

    const renderer = new THREE.WebGLRenderer({ 
        canvas: canvas, 
        antialias: true, 
        alpha: true 
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

    // --- ORBIT CONTROLS (Gentle, majestic auto-rotation) ---
    let controls = null;
    try {
        if (typeof THREE.OrbitControls !== 'undefined') {
            controls = new THREE.OrbitControls(camera, renderer.domElement);
            controls.enableDamping = true;
            controls.dampingFactor = 0.05;
            controls.enableZoom = false;
            controls.enablePan = false;
            controls.autoRotate = true;
            controls.autoRotateSpeed = 0.65; // Slow, majestic panoramic turn
            controls.maxPolarAngle = Math.PI / 2 + 0.12;
            controls.minPolarAngle = Math.PI / 4;
            controls.target.set(0, 0, 0);
        }
    } catch(e) {
        console.warn("OrbitControls init note:", e);
    }

    // =========================================================================
    // 1. FORMATION: COMPLEJO DE REFINACIÓN & TANQUE ESFÉRICO HORTONSPHERE
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

        // --- A. Columna de Fraccionamiento / Destilación (Izquierda, X = -56) ---
        const colX = -56;
        const colR = 21;
        const colBottomY = -65;
        const colTopY = 68;
        const colH = colTopY - colBottomY;

        // Cilindro principal (superficie con anillos horizontales y costuras)
        for (let i = 0; i < 1100; i++) {
            const y = colBottomY + (i / 1100) * colH;
            const angle = (i * 0.45) % (Math.PI * 2);
            const r = colR + (Math.random() - 0.5) * 1.0;
            addPoint(colX + Math.cos(angle) * r, y, Math.sin(angle) * r);
        }

        // 7 Platos de fraccionamiento con barandas perimetrales (Catwalks circulares)
        const trays = [-50, -32, -14, 4, 22, 40, 58];
        trays.forEach(ty => {
            for (let p = 0; p < 50; p++) {
                const angle = (p / 50) * Math.PI * 2;
                addPoint(colX + Math.cos(angle) * (colR + 4.5), ty, Math.sin(angle) * (colR + 4.5));
                if (p % 5 === 0) {
                    addPoint(colX + Math.cos(angle) * (colR + 4.5), ty + 3.5, Math.sin(angle) * (colR + 4.5));
                }
            }
        });

        // Cúpula superior (Domo semiesférico)
        for (let i = 0; i < 120; i++) {
            const u = Math.random();
            const theta = Math.random() * Math.PI * 2;
            const r = colR * Math.sqrt(1 - u * u);
            const dy = u * 9;
            addPoint(colX + Math.cos(theta) * r, colTopY + dy, Math.sin(theta) * r);
        }

        // Tubería vertical de venteo superior
        for (let i = 0; i < 50; i++) {
            const vy = colTopY + 9 + (i / 50) * 15;
            addPoint(colX + (Math.random() - 0.5) * 2.5, vy, (Math.random() - 0.5) * 2.5);
        }

        // Tubería de alimentación externa (Riser vertical con codos)
        for (let i = 0; i < 180; i++) {
            const ry = colBottomY + (i / 180) * 110;
            addPoint(colX + colR + 5, ry, 0);
        }

        // Escalera de gato con aros de seguridad
        for (let i = 0; i < 140; i++) {
            const ly = colBottomY + (i / 140) * 120;
            addPoint(colX - colR - 3.5, ly, (Math.random() - 0.5) * 4);
        }

        // --- B. Gran Tanque Esférico Hortonsphere (Derecha, X = +52, Y = 0, R = 44) ---
        const sphereX = 52;
        const sphereY = 0;
        const sphereR = 44;

        // Distribución esférica de alta fidelidad (Fibonacci spiral en superficie)
        const goldenRatio = (1 + Math.sqrt(5)) / 2;
        for (let i = 0; i < 1150; i++) {
            const theta = 2 * Math.PI * i / goldenRatio;
            const phi = Math.acos(1 - 2 * (i + 0.5) / 1150);
            const r = sphereR + (Math.random() - 0.5) * 1.0;
            const x = sphereX + r * Math.sin(phi) * Math.cos(theta);
            const y = sphereY + r * Math.cos(phi);
            const z = r * Math.sin(phi) * Math.sin(theta);
            addPoint(x, y, z);
        }

        // Pasarela circular ecuatorial con barandilla (Equator walkway)
        for (let p = 0; p < 130; p++) {
            const angle = (p / 130) * Math.PI * 2;
            const px = sphereX + Math.cos(angle) * (sphereR + 4.5);
            const pz = Math.sin(angle) * (sphereR + 4.5);
            addPoint(px, sphereY, pz);
            addPoint(px, sphereY + 3.8, pz);
        }

        // 8 Columnas tubulares de soporte verticales hasta el suelo con placas base
        for (let leg = 0; leg < 8; leg++) {
            const angle = (leg / 8) * Math.PI * 2;
            const lx = sphereX + Math.cos(angle) * (sphereR * 0.88);
            const lz = Math.sin(angle) * (sphereR * 0.88);
            for (let p = 0; p < 45; p++) {
                const s = p / 45;
                const ly = sphereY - (sphereR * 0.35) - s * 38;
                addPoint(lx, Math.max(-65, ly), lz);
            }
            for (let b = 0; b < 6; b++) {
                addPoint(lx + (Math.random() - 0.5) * 5, -65, lz + (Math.random() - 0.5) * 5);
            }
        }

        // Cruces diagonales de arriostramiento en X entre patas adyacentes (Signature Hortonsphere X-bracing)
        for (let leg = 0; leg < 8; leg++) {
            const a1 = (leg / 8) * Math.PI * 2;
            const a2 = ((leg + 1) / 8) * Math.PI * 2;
            const x1 = sphereX + Math.cos(a1) * (sphereR * 0.88);
            const z1 = Math.sin(a1) * (sphereR * 0.88);
            const x2 = sphereX + Math.cos(a2) * (sphereR * 0.88);
            const z2 = Math.sin(a2) * (sphereR * 0.88);
            const yTop = sphereY - 16;
            const yBottom = -64;

            for (let b = 0; b < 18; b++) {
                const s = b / 18;
                addPoint(x1 + s * (x2 - x1), yTop + s * (yBottom - yTop), z1 + s * (z2 - z1));
                addPoint(x1 + s * (x2 - x1), yBottom + s * (yTop - yBottom), z1 + s * (z2 - z1));
            }
        }

        // Plataforma superior y venteo del domo
        for (let p = 0; p < 50; p++) {
            const angle = (p / 50) * Math.PI * 2;
            addPoint(sphereX + Math.cos(angle) * 11, sphereY + sphereR + 1, Math.sin(angle) * 11);
        }

        // --- C. Racks de Tuberías Interconectadas (Puente de Tuberías) ---
        const pipeLevels = [-42, -24, -6];
        pipeLevels.forEach((py) => {
            for (let p = 0; p < 80; p++) {
                const s = p / 80;
                const px = colX + colR + s * (sphereX - sphereR - (colX + colR));
                const pz = Math.sin(s * Math.PI * 2) * 3;
                addPoint(px, py, pz);
            }
        });

        // Trestles / Pilares de soporte de tuberías
        for (let trestle = 0; trestle < 3; trestle++) {
            const tx = colX + colR + 18 + trestle * 19;
            for (let ty = -65; ty <= -6; ty += 4) {
                addPoint(tx, ty, -4);
                addPoint(tx, ty, 4);
            }
        }

        // --- D. Suelo Industrial / Pavimento de Hormigón ---
        while (idx < TOTAL_POINTS * 3) {
            const gx = -95 + Math.random() * 190;
            const gz = (Math.random() - 0.5) * 110;
            addPoint(gx, -65, gz);
        }

        return targets;
    }

    // =========================================================================
    // 2. FORMATION: BALANCÍN PETROLERO "CABEZA DE CABALLO"
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

        // --- A. Base de Patín y Viga Trineo (Ground Skid) ---
        for (let i = 0; i < 350; i++) {
            const gx = -80 + Math.random() * 165;
            const side = Math.random() > 0.5 ? 20 : -20;
            addPoint(gx, -65, side + (Math.random() - 0.5) * 4);
        }
        for (let cross = 0; cross < 6; cross++) {
            const cx = -75 + cross * 28;
            for (let z = -20; z <= 20; z += 3) {
                addPoint(cx, -65, z);
            }
        }

        // --- B. Torre Central Samson Post (Trípode/Pirámide A-Frame) ---
        const samsonBaseW = 28;
        const samsonBaseD = 22;
        const samsonTopW = 7;
        const samsonTopD = 7;

        for (let leg = 0; leg < 4; leg++) {
            const signX = (leg === 0 || leg === 1) ? 1 : -1;
            const signZ = (leg === 0 || leg === 3) ? 1 : -1;
            for (let p = 0; p < 130; p++) {
                const s = p / 130;
                const y = -65 + s * 80;
                const wx = (1 - s) * samsonBaseW + s * samsonTopW;
                const wz = (1 - s) * samsonBaseD + s * samsonTopD;
                addPoint(signX * wx, y, signZ * wz);
            }
        }

        // 3 Niveles de travesaños horizontales y tirantes en X en el Samson Post
        const samsonLevels = [-44, -22, -2];
        samsonLevels.forEach((ly) => {
            const s = (ly + 65) / 80;
            const wx = (1 - s) * samsonBaseW + s * samsonTopW;
            const wz = (1 - s) * samsonBaseD + s * samsonTopD;
            for (let p = 0; p < 36; p++) {
                const frac = (p / 36) * 4;
                if (frac < 1) addPoint(-wx + frac * 2 * wx, ly, wz);
                else if (frac < 2) addPoint(wx, ly, wz - (frac - 1) * 2 * wz);
                else if (frac < 3) addPoint(wx - (frac - 2) * 2 * wx, ly, -wz);
                else addPoint(-wx, ly, -wz + (frac - 3) * 2 * wz);
            }
        });

        // Chumacera central / Sillín de rodamiento (Center Bearing Saddle)
        for (let i = 0; i < 80; i++) {
            addPoint((Math.random() - 0.5) * 12, 15 + Math.random() * 4, (Math.random() - 0.5) * 12);
        }

        // --- C. Viga Balancín (Walking Beam I-Beam) ---
        const beamStartX = -55;
        const beamEndX = 48;
        const beamLen = beamEndX - beamStartX;

        for (let i = 0; i < 550; i++) {
            const s = i / 550;
            const bx = beamStartX + s * beamLen;
            const by = 16.5;
            const part = i % 3;
            if (part === 0) addPoint(bx, by + 4, (Math.random() - 0.5) * 7);
            else if (part === 1) addPoint(bx, by - 4, (Math.random() - 0.5) * 7);
            else addPoint(bx, by + (Math.random() - 0.5) * 7, (Math.random() - 0.5) * 2);
        }

        // --- D. Cabeza de Caballo (Horsehead Arc - FRONT, X = +48 a +72, Y = +2 a +36) ---
        const hhCenter = { x: 48, y: 16.5 };
        const hhRadius = 22;

        for (let i = 0; i < 450; i++) {
            const angle = -Math.PI / 2.3 + (i / 450) * (Math.PI * 0.88);
            const hx = hhCenter.x + Math.cos(angle) * hhRadius;
            const hy = hhCenter.y + Math.sin(angle) * hhRadius;
            addPoint(hx, hy, (Math.random() - 0.5) * 5.5);
            if (i % 4 === 0) {
                const s = Math.random();
                addPoint(hhCenter.x + s * (hx - hhCenter.x), hhCenter.y + s * (hy - hhCenter.y), 0);
            }
        }

        // Cables de suspensión flexibles (Bridle Cables - Caída vertical)
        for (let p = 0; p < 160; p++) {
            const y = -14 + (p / 160) * 44;
            addPoint(69, y, -2.5);
            addPoint(69, y, 2.5);
        }

        // Barra transversal de enganche (Carrier Bar)
        for (let z = -6; z <= 6; z += 1.5) {
            addPoint(69, -14, z);
        }

        // Vástago pulido (Polished Rod) que baja directamente al pozo
        for (let p = 0; p < 180; p++) {
            const y = -65 + (p / 180) * 51;
            addPoint(69, y, 0);
        }

        // Cabezal de Pozo y Árbol de Navidad (Wellhead Christmas Tree, X = 69, Y = -65 a -25)
        for (let i = 0; i < 260; i++) {
            const y = -65 + Math.random() * 40;
            const angle = Math.random() * Math.PI * 2;
            const r = 4.5 + (Math.random() - 0.5) * 2.0;
            addPoint(69 + Math.cos(angle) * r, y, Math.sin(angle) * r);
        }
        for (let v = 0; v < 3; v++) {
            const vy = -56 + v * 12;
            for (let z = -14; z <= 14; z += 2) {
                addPoint(69, vy, z);
            }
        }

        // --- E. Manivela, Bielas y Contrapesos Giratorios (Rear Crank & Counterweights, X = -45) ---
        const crankX = -45;
        const crankCenterY = -18;
        const crankR = 17;

        for (let side = -1; side <= 1; side += 2) {
            const cz = side * 9;
            for (let p = 0; p < 220; p++) {
                const angle = (p / 220) * Math.PI * 2;
                const r = 7 + Math.random() * crankR;
                if (Math.cos(angle) > -0.3) {
                    addPoint(crankX + Math.cos(angle) * r, crankCenterY + Math.sin(angle) * r, cz);
                }
            }
        }

        // Bielas (Pitman Arms) conectando los contrapesos a la cola de la viga
        for (let p = 0; p < 130; p++) {
            const s = p / 130;
            const px = crankX + s * (beamStartX - crankX);
            const py = crankCenterY + s * (16.5 - crankCenterY);
            addPoint(px, py, -9);
            addPoint(px, py, 9);
        }

        // Caja reductora de engranajes (Gearbox on skid)
        for (let i = 0; i < 180; i++) {
            const gx = crankX - 6 + Math.random() * 12;
            const gy = -65 + Math.random() * 32;
            const gz = (Math.random() - 0.5) * 20;
            addPoint(gx, gy, gz);
        }

        // --- F. Tanque Cilíndrico de Crudo Adyacente (Izquierda, X = -78, Z = +24) ---
        const tankX = -78;
        const tankZ = 24;
        const tankR = 19;
        const tankBottomY = -65;
        const tankTopY = -18;

        for (let i = 0; i < 450; i++) {
            const y = tankBottomY + (i / 450) * (tankTopY - tankBottomY);
            const angle = Math.random() * Math.PI * 2;
            addPoint(tankX + Math.cos(angle) * tankR, y, tankZ + Math.sin(angle) * tankR);
        }
        for (let i = 0; i < 160; i++) {
            const u = Math.random();
            const angle = Math.random() * Math.PI * 2;
            const r = tankR * Math.sqrt(u);
            const cy = tankTopY + (1 - u) * 4.5;
            addPoint(tankX + Math.cos(angle) * r, cy, tankZ + Math.sin(angle) * r);
        }

        // --- G. Relleno y Plataforma de Suelo ---
        while (idx < TOTAL_POINTS * 3) {
            const gx = -95 + Math.random() * 190;
            const gz = (Math.random() - 0.5) * 105;
            addPoint(gx, -65, gz);
        }

        return targets;
    }

    // =========================================================================
    // 3. FORMATION: TALADRO DE PERFORACIÓN DE CAMPO & WELL TESTING
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

        // --- A. Subestructura Elevada y Piso de Perforación (Drill Floor) ---
        const rigX = -10;
        const subW = 26;
        const subD = 24;
        const floorY = -35;

        for (let leg = 0; leg < 4; leg++) {
            const sx = (leg === 0 || leg === 1) ? rigX + subW : rigX - subW;
            const sz = (leg === 0 || leg === 3) ? subD : -subD;
            for (let y = -65; y <= floorY; y += 1.8) {
                addPoint(sx, y, sz);
            }
        }

        for (let p = 0; p < 180; p++) {
            const fx = rigX - subW + Math.random() * (subW * 2);
            const fz = -subD + Math.random() * (subD * 2);
            addPoint(fx, floorY, fz);
        }
        for (let p = 0; p < 70; p++) {
            const angle = (p / 70) * Math.PI * 2;
            addPoint(rigX + Math.cos(angle) * (subW + 1), floorY + 4, Math.sin(angle) * (subD + 1));
        }

        for (let i = 0; i < 200; i++) {
            const y = -65 + Math.random() * 28;
            const angle = Math.random() * Math.PI * 2;
            const r = 6 + (Math.random() - 0.5) * 2;
            addPoint(rigX + Math.cos(angle) * r, y, Math.sin(angle) * r);
        }

        // --- B. Torre / Mástil de Perforación Piramidal Enrejado (Derrick) ---
        const mastBottomW = 20;
        const mastTopW = 7.5;
        const mastBottomY = floorY;
        const mastTopY = 74;
        const mastH = mastTopY - mastBottomY;

        for (let leg = 0; leg < 4; leg++) {
            const signX = (leg === 0 || leg === 1) ? 1 : -1;
            const signZ = (leg === 0 || leg === 3) ? 1 : -1;
            for (let p = 0; p < 180; p++) {
                const s = p / 180;
                const y = mastBottomY + s * mastH;
                const w = (1 - s) * mastBottomW + s * mastTopW;
                addPoint(rigX + signX * w, y, signZ * w);
            }
        }

        const derrickTiers = 7;
        for (let tier = 0; tier < derrickTiers; tier++) {
            const s1 = tier / derrickTiers;
            const s2 = (tier + 1) / derrickTiers;
            const y1 = mastBottomY + s1 * mastH;
            const y2 = mastBottomY + s2 * mastH;
            const w1 = (1 - s1) * mastBottomW + s1 * mastTopW;
            const w2 = (1 - s2) * mastBottomW + s2 * mastTopW;

            for (let p = 0; p < 36; p++) {
                const frac = (p / 36) * 4;
                if (frac < 1) addPoint(rigX - w1 + frac * 2 * w1, y1, w1);
                else if (frac < 2) addPoint(rigX + w1, y1, w1 - (frac - 1) * 2 * w1);
                else if (frac < 3) addPoint(rigX + w1 - (frac - 2) * 2 * w1, y1, -w1);
                else addPoint(rigX - w1, y1, -w1 + (frac - 3) * 2 * w1);
            }

            for (let d = 0; d < 16; d++) {
                const t = d / 16;
                const y = y1 + t * (y2 - y1);
                const wx = (1 - t) * w1 + t * w2;
                addPoint(rigX - wx + 2 * t * wx, y, wx);
                addPoint(rigX + wx - 2 * t * wx, y, wx);
                addPoint(rigX + wx, y, -wx + 2 * t * wx);
                addPoint(rigX + wx, y, wx - 2 * t * wx);
            }
        }

        for (let i = 0; i < 140; i++) {
            const cx = rigX + (Math.random() - 0.5) * (mastTopW * 2 + 3);
            const cy = mastTopY + Math.random() * 8;
            const cz = (Math.random() - 0.5) * (mastTopW * 2 + 3);
            addPoint(cx, cy, cz);
        }

        for (let p = 0; p < 220; p++) {
            const y = -65 + (p / 220) * 135;
            addPoint(rigX, y, 0);
        }
        for (let i = 0; i < 90; i++) {
            addPoint(rigX + (Math.random() - 0.5) * 5, 20 + Math.random() * 14, (Math.random() - 0.5) * 5);
        }

        // --- C. Mechurrio de Well Testing (Cantilever Flare Boom) ---
        const boomStartX = 16;
        const boomStartY = -35;
        const boomEndX = 92;
        const boomEndY = 10;
        const boomLen = boomEndX - boomStartX;

        for (let p = 0; p < 260; p++) {
            const s = p / 260;
            const bx = boomStartX + s * boomLen;
            const by = boomStartY + s * (boomEndY - boomStartY);
            const spread = (1 - s * 0.4) * 4.5;
            addPoint(bx, by + spread, 0);
            addPoint(bx, by - spread, -spread);
            addPoint(bx, by - spread, spread);
        }

        for (let i = 0; i < 180; i++) {
            const s = Math.random();
            const bx = boomStartX + s * boomLen;
            const by = boomStartY + s * (boomEndY - boomStartY);
            const r = (Math.random() - 0.5) * 5;
            addPoint(bx, by + r, (Math.random() - 0.5) * 5);
        }

        for (let p = 0; p < 45; p++) {
            addPoint(boomEndX + (p / 45) * 6, boomEndY + (Math.random() - 0.5) * 3, (Math.random() - 0.5) * 3);
        }

        // --- D. Llama Activa Ondulante de Well Testing ---
        for (let i = 0; i < 340; i++) {
            const s = Math.random();
            const fx = 96 + s * 19 + Math.sin(s * Math.PI * 3) * 3;
            const fy = 11 + s * 27 + (Math.random() - 0.5) * 4;
            const fz = (Math.random() - 0.5) * (14 * (1 - s * 0.3));
            addPoint(fx, fy, fz);
        }

        // --- E. Unidad de Separación Trifásica (Separator Skid on Left, X = -58) ---
        const sepX = -58;
        const sepY = -52;
        const sepLen = 34;
        const sepR = 9;

        for (let i = 0; i < 380; i++) {
            const x = sepX - sepLen / 2 + Math.random() * sepLen;
            const angle = Math.random() * Math.PI * 2;
            addPoint(x, sepY + Math.cos(angle) * sepR, Math.sin(angle) * sepR);
        }
        for (let side = -1; side <= 1; side += 2) {
            const hx = sepX + side * (sepLen / 2);
            for (let p = 0; p < 80; p++) {
                const u = Math.random();
                const angle = Math.random() * Math.PI * 2;
                const r = sepR * Math.sqrt(1 - u * u);
                addPoint(hx + side * (u * 4.5), sepY + Math.cos(angle) * r, Math.sin(angle) * r);
            }
        }

        // --- F. Relleno y Suelo ---
        while (idx < TOTAL_POINTS * 3) {
            const gx = -95 + Math.random() * 190;
            const gz = (Math.random() - 0.5) * 105;
            addPoint(gx, -65, gz);
        }

        return targets;
    }

    // =========================================================================
    // STATE MACHINE & BUFFER INITIALIZATION
    // =========================================================================
    const formations = [
        generateRefinerySphereTargets(),
        generatePumpjackTargets(),
        generateWellTestingTargets()
    ];

    let currentFormationIndex = 0;
    let isMorphing = false;
    let sourcePositions = new Float32Array(TOTAL_POINTS * 3);
    let targetPositions = formations[0];
    const morphDuration = 2.8; // 2.8s transición suave y perceptible
    let morphStartTime = 0;

    const geometry = new THREE.BufferGeometry();
    const currentPositions = new Float32Array(TOTAL_POINTS * 3);
    const colors = new Float32Array(TOTAL_POINTS * 3);

    const initialTargets = formations[0];
    for (let i = 0; i < TOTAL_POINTS * 3; i++) {
        currentPositions[i] = initialTargets[i];
    }

    const colorBottom = new THREE.Color(0x00e676); // Emerald Green
    const colorTop = new THREE.Color(0x00f2fe);    // Electric Cyber Cyan
    const colorFlameCore = new THREE.Color(0xffaa00); // Luminous Amber Gold
    const colorFlameTip = new THREE.Color(0xff4500);  // Vivid Flame Orange
    const tempColor = new THREE.Color();

    function updateColors(time) {
        for (let i = 0; i < TOTAL_POINTS; i++) {
            const x = currentPositions[i * 3];
            const y = currentPositions[i * 3 + 1];
            
            const t = Math.max(0, Math.min(1, (y + 65) / 139));
            tempColor.copy(colorBottom).lerp(colorTop, t);

            if (x > 92 && y > 8 && currentFormationIndex === 2) {
                const flameRatio = Math.min(1, Math.max(0, (y - 10) / 26));
                tempColor.copy(colorFlameCore).lerp(colorFlameTip, flameRatio);
            }

            const wave = Math.sin(x * 0.035 + y * 0.025 + (time || 0) * 0.002) * 0.12;
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
        grad.addColorStop(0, 'rgba(255, 255, 255, 1.0)');
        grad.addColorStop(0.25, 'rgba(0, 242, 254, 0.95)');
        grad.addColorStop(0.65, 'rgba(0, 230, 118, 0.4)');
        grad.addColorStop(1.0, 'rgba(0, 0, 0, 0.0)');

        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, size, size);

        return new THREE.CanvasTexture(cv);
    }

    const material = new THREE.PointsMaterial({
        size: 5.4,
        vertexColors: true,
        map: createPointTexture(),
        transparent: true,
        opacity: 0.95,
        blending: THREE.AdditiveBlending,
        depthWrite: false
    });

    const pointCloud = new THREE.Points(geometry, material);
    scene.add(pointCloud);

    function triggerNextFormation() {
        currentFormationIndex = (currentFormationIndex + 1) % formations.length;
        sourcePositions.set(currentPositions);
        targetPositions = formations[currentFormationIndex];
        
        isMorphing = true;
        morphStartTime = performance.now();
    }

    // Intervalo de 10.5 segundos (7.7s de exhibición pausada + 2.8s de metamorfosis)
    setInterval(triggerNextFormation, 10500);

    function easeInOutCubic(x) {
        return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
    }

    let clock = new THREE.Clock();

    function handleResize() {
        if (!container || !renderer || !camera) return;
        const rect = container.getBoundingClientRect();
        const w = rect.width > 50 ? rect.width : 500;
        const h = rect.height > 50 ? rect.height : 460;

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

        const posAttr = geometry.attributes.position;
        const arr = posAttr.array;

        if (isMorphing) {
            const elapsed = (now - morphStartTime) / (morphDuration * 1000);
            const t = Math.min(1.0, elapsed);
            const easedT = easeInOutCubic(t);

            const dispersionStrength = Math.sin(t * Math.PI) * 22.0;

            for (let i = 0; i < TOTAL_POINTS; i++) {
                const idx3 = i * 3;
                
                const seedX = Math.sin(i * 12.9898) * 1.3;
                const seedY = Math.cos(i * 78.233) * 1.3;
                const seedZ = Math.sin(i * 45.164) * 1.3;

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
            const time = now * 0.0015;

            if (currentFormationIndex === 1) {
                // Dinámica realista de bombeo del balancín (stroke de ~3.6 segundos)
                const pumpAngle = Math.sin(time * 1.7) * 0.042;
                const cosA = Math.cos(pumpAngle);
                const sinA = Math.sin(pumpAngle);
                const pivotX = 0;
                const pivotY = 16.5;

                for (let i = 0; i < TOTAL_POINTS; i++) {
                    const idx3 = i * 3;
                    const bx = currentPositions[idx3];
                    const by = currentPositions[idx3 + 1];
                    const bz = currentPositions[idx3 + 2];

                    if (bx > -56 && bx < 74 && by > 0) {
                        const relX = bx - pivotX;
                        const relY = by - pivotY;
                        arr[idx3] = pivotX + relX * cosA - relY * sinA;
                        arr[idx3 + 1] = pivotY + relX * sinA + relY * cosA;
                        arr[idx3 + 2] = bz;
                    } 
                    else if (bx > 67 && bx < 71 && by > -65) {
                        const verticalStroke = Math.sin(time * 1.7) * 3.8;
                        arr[idx3] = bx;
                        arr[idx3 + 1] = by + verticalStroke;
                        arr[idx3 + 2] = bz;
                    }
                    else {
                        arr[idx3] = bx;
                        arr[idx3 + 1] = by;
                        arr[idx3 + 2] = bz;
                    }
                }
            } else if (currentFormationIndex === 2) {
                // Dinámica de oscilación de la llama del mechurrio
                for (let i = 0; i < TOTAL_POINTS; i++) {
                    const idx3 = i * 3;
                    const bx = currentPositions[idx3];
                    const by = currentPositions[idx3 + 1];
                    const bz = currentPositions[idx3 + 2];

                    if (bx > 92 && by > 8) {
                        const wind = Math.sin(time * 4 + i) * 1.6;
                        const rise = Math.cos(time * 5 + i * 2) * 1.8;
                        arr[idx3] = bx + wind;
                        arr[idx3 + 1] = by + rise;
                        arr[idx3 + 2] = bz + Math.sin(time * 3 + i) * 1.2;
                    } else {
                        const vib = Math.sin(time * 2 + i * 0.1) * 0.15;
                        arr[idx3] = bx;
                        arr[idx3 + 1] = by + vib;
                        arr[idx3 + 2] = bz;
                    }
                }
            } else {
                // Dinámica de flujo en tuberías de refinería
                for (let i = 0; i < TOTAL_POINTS; i++) {
                    const idx3 = i * 3;
                    const bx = currentPositions[idx3];
                    const by = currentPositions[idx3 + 1];
                    const bz = currentPositions[idx3 + 2];

                    if (bx > -35 && bx < 10 && by > -45 && by < 0) {
                        const pulse = Math.sin(time * 3 + bx * 0.15) * 0.4;
                        arr[idx3] = bx;
                        arr[idx3 + 1] = by + pulse;
                        arr[idx3 + 2] = bz;
                    } else {
                        arr[idx3] = bx;
                        arr[idx3 + 1] = by;
                        arr[idx3 + 2] = bz;
                    }
                }
            }

            posAttr.needsUpdate = true;
            updateColors(now);
            geometry.attributes.color.needsUpdate = true;
        }

        renderer.render(scene, camera);
    }

    animate();
    handleResize();

    console.log("⚡ kaironInnova 3D LiDAR Engine: Formaciones petroleras ultra-realistas activas (10.5s ciclo).");
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initHeroLidar);
} else {
    initHeroLidar();
}
window.addEventListener('load', initHeroLidar);
