(function initLidarBackground() {
    console.log("🚀 Iniciando Motor LiDAR 3D (Fondo Nube de Puntos de Alta Fidelidad)...");
    const canvas = document.getElementById('warp-canvas');
    if (!canvas) return;

    // --- RESPONSIVE MOBILE DETECTION ---
    const isMobile = window.innerWidth < 768;
    const particleSize = isMobile ? 5.2 : 3.5;

    // --- SCENE SETUP ---
    const scene = new THREE.Scene();

    // --- CAMERA ---
    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 2000);
    camera.position.set(0, 300, 400);

    // --- RENDERER ---
    const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // --- PROCEDURAL POINT CLOUD GENERATOR ---
    const particlesData = [];
    let pIndex = 0;

    // Helper to register a standard particle with volumetric vertical gradient
    function addParticle(x, y, z, worldXCenter, worldYCenter, worldZCenter, baseColorHex) {
        // Mobile performance optimization: drop 25% of background points on mobile to maintain 60 FPS
        if (isMobile && Math.random() > 0.75) return;

        const idx = pIndex;
        pIndex++;

        // Y-gradient color logic: Purple (#a855f7) at the bottom to Cyan (#00f2fe) at the top
        let t = (y + 80) / 200;
        t = Math.max(0, Math.min(1, t));
        const colorBase = new THREE.Color(0xa855f7); // Deep Purple
        const colorTop = new THREE.Color(0x00f2fe);  // Neon Cyan
        const baseColor = colorBase.clone().lerp(colorTop, t);
        
        const baseX = worldXCenter + x;
        const baseY = y;
        const baseZ = worldZCenter + z;
        const worldY = worldYCenter + y;

        const chaosX = (Math.random() - 0.5) * 350;
        const chaosY = (Math.random() - 0.5) * 150;
        const chaosZ = (Math.random() - 0.5) * 350;

        particlesData.push({
            idx: idx,
            baseX: baseX,
            baseY: baseY,
            baseZ: baseZ,
            worldY: worldY,
            chaosX: chaosX,
            chaosY: chaosY,
            chaosZ: chaosZ,
            baseColor: baseColor,
            isBlade: false,
            isCar: false
        });
    }

    // Helper to register an animated rotating blade particle (for wind turbines)
    function addBladeParticle(tx, ty, tz, worldXCenter, worldYCenter, worldZCenter, bladeLength, angleOffset, baseColorHex) {
        if (isMobile && Math.random() > 0.75) return;

        const idx = pIndex;
        pIndex++;

        const x = tx + bladeLength * Math.cos(angleOffset);
        const y = ty + bladeLength * Math.sin(angleOffset);
        const z = tz;

        // Y-gradient color logic
        let t = (y + 80) / 200;
        t = Math.max(0, Math.min(1, t));
        const colorBase = new THREE.Color(0xa855f7);
        const colorTop = new THREE.Color(0x00f2fe);
        const baseColor = colorBase.clone().lerp(colorTop, t);
        
        const baseX = worldXCenter + x;
        const baseY = y;
        const baseZ = worldZCenter + z;
        const worldY = worldYCenter + y;

        const chaosX = (Math.random() - 0.5) * 350;
        const chaosY = (Math.random() - 0.5) * 150;
        const chaosZ = (Math.random() - 0.5) * 350;

        particlesData.push({
            idx: idx,
            baseX: baseX,
            baseY: baseY,
            baseZ: baseZ,
            worldY: worldY,
            chaosX: chaosX,
            chaosY: chaosY,
            chaosZ: chaosZ,
            baseColor: baseColor,
            
            isBlade: true,
            isCar: false,
            hubX: worldXCenter + tx,
            hubY: worldYCenter + ty,
            hubZ: worldZCenter + tz,
            bladeLength: bladeLength,
            bladeAngleOffset: angleOffset
        });
    }

    // Helper to register a moving vehicle particle along the bridge calzada
    function addCarParticle(x, y, z, worldXCenter, worldYCenter, worldZCenter, carSpeed, carOffset) {
        if (isMobile && Math.random() > 0.6) return; // Reduce car count on mobile

        const idx = pIndex;
        pIndex++;

        // Y-gradient color logic
        let t = (y + 80) / 200;
        t = Math.max(0, Math.min(1, t));
        const colorBase = new THREE.Color(0xa855f7);
        const colorTop = new THREE.Color(0x00f2fe);
        const baseColor = colorBase.clone().lerp(colorTop, t);
        
        const baseX = worldXCenter + x;
        const baseY = y;
        const baseZ = worldZCenter + z;
        const worldY = worldYCenter + y;

        particlesData.push({
            idx: idx,
            baseX: baseX,
            baseY: baseY,
            baseZ: baseZ,
            worldY: worldY,
            chaosX: 0,
            chaosY: 0,
            chaosZ: 0,
            baseColor: baseColor,
            isBlade: false,
            isCar: true,
            carSpeed: carSpeed,
            carOffset: carOffset,
            localXCenter: worldXCenter
        });
    }

    // ==========================================
    // --- STRUCTURE 1: REFINERY (X=0, Y=300, Z=0) ---
    // ==========================================
    const refineryYCenter = 300;
    
    // 1. Floor Grid (300 points)
    for (let k = 0; k < 150; k++) {
        const color = Math.random() > 0.4 ? 0x00f2fe : 0xa855f7;
        let lineIdx = Math.floor(k / 15);
        let ptIdx = k % 15;
        let x = -120 + ptIdx * 17.14;
        let y = -80;
        let z = -120 + lineIdx * 26.6;
        addParticle(x, y, z, 0, refineryYCenter, 0, color);
    }
    for (let k = 0; k < 150; k++) {
        const color = Math.random() > 0.4 ? 0x00f2fe : 0xa855f7;
        let lineIdx = Math.floor(k / 15);
        let ptIdx = k % 15;
        let x = -120 + lineIdx * 26.6;
        let y = -80;
        let z = -120 + ptIdx * 17.14;
        addParticle(x, y, z, 0, refineryYCenter, 0, color);
    }

    // 2. Hyperbolic Cooling Tower (500 points)
    // Center: X = -70, Z = -40
    for (let k = 0; k < 300; k++) {
        const color = Math.random() > 0.4 ? 0x00f2fe : 0xa855f7;
        let ringIdx = Math.floor(k / 15);
        let ptIdx = k % 15;
        let y = -80 + ringIdx * 10.5;
        let theta = ptIdx * (Math.PI * 2 / 15);
        let r = 22 + 0.002 * Math.pow(y - 20, 2);
        let x = -70 + r * Math.cos(theta);
        let z = -40 + r * Math.sin(theta);
        addParticle(x, y, z, 0, refineryYCenter, 0, color);
    }
    for (let k = 0; k < 200; k++) {
        const color = Math.random() > 0.4 ? 0x00f2fe : 0xa855f7;
        let ribIdx = Math.floor(k / 20);
        let ptIdx = k % 20;
        let y = -80 + ptIdx * 10.5;
        let theta = ribIdx * (Math.PI * 2 / 10);
        let r = 22 + 0.002 * Math.pow(y - 20, 2);
        let x = -70 + r * Math.cos(theta);
        let z = -40 + r * Math.sin(theta);
        addParticle(x, y, z, 0, refineryYCenter, 0, color);
    }

    // 3. Tall Distillation Column (500 points)
    // Center: X = 40, Z = 40
    // Cylinder rings: 270 points
    for (let k = 0; k < 270; k++) {
        const color = Math.random() > 0.4 ? 0x00f2fe : 0xa855f7;
        let ringIdx = Math.floor(k / 15);
        let ptIdx = k % 15;
        let y = -80 + ringIdx * 11.1;
        let theta = ptIdx * (Math.PI * 2 / 15);
        let r = 16;
        let x = 40 + r * Math.cos(theta);
        let z = 40 + r * Math.sin(theta);
        addParticle(x, y, z, 0, refineryYCenter, 0, color);
    }
    // Vertical struts: 120 points
    for (let k = 0; k < 120; k++) {
        const color = Math.random() > 0.4 ? 0x00f2fe : 0xa855f7;
        let strutIdx = Math.floor(k / 20);
        let ptIdx = k % 20;
        let y = -80 + ptIdx * 10.0;
        let theta = strutIdx * (Math.PI * 2 / 6);
        let r = 16;
        let x = 40 + r * Math.cos(theta);
        let z = 40 + r * Math.sin(theta);
        addParticle(x, y, z, 0, refineryYCenter, 0, color);
    }
    // Dome cap: 90 points
    for (let k = 0; k < 90; k++) {
        const color = Math.random() > 0.4 ? 0x00f2fe : 0xa855f7;
        let ringIdx = Math.floor(k / 15);
        let ptIdx = k % 15;
        let dy = ringIdx * 2.66;
        let y = 110 + dy;
        let theta = ptIdx * (Math.PI * 2 / 15);
        let r = Math.sqrt(Math.max(0, 256 - dy * dy));
        let x = 40 + r * Math.cos(theta);
        let z = 40 + r * Math.sin(theta);
        addParticle(x, y, z, 0, refineryYCenter, 0, color);
    }
    // Antenna: 20 points
    for (let k = 0; k < 20; k++) {
        const color = Math.random() > 0.4 ? 0x00f2fe : 0xa855f7;
        addParticle(40, 126 + k * 1.5, 40, 0, refineryYCenter, 0, color);
    }
    // 3b. Spiraling Spiral Staircase Detail around the Column (120 points)
    for (let k = 0; k < 120; k++) {
        let t = k / 120;
        let y = -80 + t * 190;
        let theta = t * (Math.PI * 8); // 4 full turns
        let r = 18.5; // Slightly larger radius than cylinder (r=16)
        let x = 40 + r * Math.cos(theta);
        let z = 40 + r * Math.sin(theta);
        addParticle(x, y, z, 0, refineryYCenter, 0, 0x00f2fe);
    }

    // 4. Spherical Gas Storage Tank (400 points)
    // Center: X = 50, Y = -10, Z = -50. Radius = 30
    for (let k = 0; k < 300; k++) {
        const color = Math.random() > 0.4 ? 0x00f2fe : 0xa855f7;
        let ringIdx = Math.floor(k / 25);
        let ptIdx = k % 25;
        let dy = -26 + ringIdx * 4.73;
        let y = -10 + dy;
        let theta = ptIdx * (Math.PI * 2 / 25);
        let r = Math.sqrt(Math.max(0, 900 - dy * dy));
        let x = 50 + r * Math.cos(theta);
        let z = -50 + r * Math.sin(theta);
        addParticle(x, y, z, 0, refineryYCenter, 0, color);
    }
    // 4 Legs: 100 points
    const legAnglesRefinery = [Math.PI/4, 3*Math.PI/4, 5*Math.PI/4, 7*Math.PI/4];
    for (let k = 0; k < 100; k++) {
        const color = Math.random() > 0.4 ? 0x00f2fe : 0xa855f7;
        let legIdx = Math.floor(k / 25);
        let ptIdx = k % 25;
        let theta = legAnglesRefinery[legIdx];
        let legX = 50 + 25 * Math.cos(theta);
        let legZ = -50 + 25 * Math.sin(theta);
        let y = -26 - ptIdx * 2.16;
        addParticle(legX, y, legZ, 0, refineryYCenter, 0, color);
    }
    // 4b. Cross Bracing (X-trusses) between Sphere Legs (80 points)
    for (let leg = 0; leg < 4; leg++) {
        let t1 = legAnglesRefinery[leg];
        let t2 = legAnglesRefinery[(leg + 1) % 4];
        let x1 = 50 + 25 * Math.cos(t1);
        let z1 = -50 + 25 * Math.sin(t1);
        let x2 = 50 + 25 * Math.cos(t2);
        let z2 = -50 + 25 * Math.sin(t2);
        for (let pt = 0; pt < 10; pt++) {
            let frac = pt / 10;
            let y1 = -26 - frac * 54;
            let bx = x1 + frac * (x2 - x1);
            let bz = z1 + frac * (z2 - z1);
            addParticle(bx, y1, bz, 0, refineryYCenter, 0, 0xa855f7);
            let y2 = -80 + frac * 54;
            addParticle(bx, y2, bz, 0, refineryYCenter, 0, 0xa855f7);
        }
    }

    // 5. Connecting Pipes & Chimney (300 points)
    // Chimney stack: X = -110, Z = 60 (100 points)
    for (let k = 0; k < 100; k++) {
        const color = Math.random() > 0.4 ? 0x00f2fe : 0xa855f7;
        let ringIdx = Math.floor(k / 5);
        let ptIdx = k % 5;
        let y = -80 + ringIdx * 11.0;
        let theta = ptIdx * (Math.PI * 2 / 5);
        let r = 8;
        let x = -110 + r * Math.cos(theta);
        let z = 60 + r * Math.sin(theta);
        addParticle(x, y, z, 0, refineryYCenter, 0, color);
    }
    // 5b. Chimney Steam Flow (80 points)
    for (let k = 0; k < 80; k++) {
        let t = Math.random();
        let y = 140 + t * 45;
        let r = 8 + t * 14;
        let theta = Math.random() * Math.PI * 2;
        let x = -110 + r * Math.cos(theta);
        let z = 60 + r * Math.sin(theta);
        addParticle(x, y, z, 0, refineryYCenter, 0, 0x00f2fe);
    }
    // Pipe 1 (100 points)
    for (let k = 0; k < 100; k++) {
        const color = Math.random() > 0.4 ? 0x00f2fe : 0xa855f7;
        let x = 0, y = 10, z = 0;
        if (k < 60) {
            x = -70 + k * (110 / 60);
            z = -40;
        } else {
            x = 40;
            z = -40 + (k - 60) * (80 / 40);
        }
        addParticle(x, y, z, 0, refineryYCenter, 0, color);
    }
    // Pipe 2 (100 points)
    for (let k = 0; k < 100; k++) {
        const color = Math.random() > 0.4 ? 0x00f2fe : 0xa855f7;
        let t = k / 100;
        let x = 40 + t * 10;
        let y = -30;
        let z = 40 - t * 90;
        addParticle(x, y, z, 0, refineryYCenter, 0, color);
    }
    // 5c. Multi-level Pipe Rack (120 points)
    for (let h = 0; h < 3; h++) {
        let y = -60 + h * 25;
        for (let k = 0; k < 20; k++) {
            let t = k / 20;
            addParticle(-50 + t * 100, y, -20, 0, refineryYCenter, 0, 0x00f2fe);
            addParticle(-50 + t * 100, y, 20, 0, refineryYCenter, 0, 0xa855f7);
        }
    }

    // ==========================================
    // --- STRUCTURE 2: BRIDGE (X=450, Y=-400, Z=-120) ---
    // ==========================================
    const bridgeYCenter = -400;

    // 1. Water Grid (300 points)
    for (let k = 0; k < 150; k++) {
        const color = Math.random() > 0.5 ? 0x00f2fe : 0xa855f7;
        let lineIdx = Math.floor(k / 30);
        let ptIdx = k % 30;
        let x = -250 + ptIdx * 17.24;
        let y = -100;
        let z = -60 + lineIdx * 30;
        addParticle(x, y, z, 450, bridgeYCenter, -120, color);
    }
    for (let k = 0; k < 150; k++) {
        const color = Math.random() > 0.5 ? 0x00f2fe : 0xa855f7;
        let lineIdx = Math.floor(k / 15);
        let ptIdx = k % 15;
        let x = -250 + lineIdx * 55.5;
        let y = -100;
        let z = -60 + ptIdx * 8.57;
        addParticle(x, y, z, 450, bridgeYCenter, -120, color);
    }

    // 2. Towers with X-bracing (600 points)
    const towerXs = [-120, 120];
    for (let tIdx = 0; tIdx < 2; tIdx++) {
        let x0 = towerXs[tIdx];
        // Pillars (z = -30, z = 30) - ahusados (tapered)
        for (let k = 0; k < 80; k++) {
            let y = -100 + k * 3.125;
            let factor = (y - (-100)) / 250; // 0 to 1
            let zOffset = 30 - factor * 14;   // Narrows from 30 to 16
            addParticle(x0, y, -zOffset, 450, bridgeYCenter, -120, 0x00f2fe);
            addParticle(x0, y, zOffset, 450, bridgeYCenter, -120, 0x00f2fe);
        }
        // Beams (y = -20, 60, 140)
        const beamYs = [-20, 60, 140];
        for (let b = 0; b < 3; b++) {
            let by = beamYs[b];
            let factor = (by - (-100)) / 250;
            let zOffset = 30 - factor * 14;
            for (let k = 0; k < 20; k++) {
                let z = -zOffset + k * (zOffset * 2 / 20);
                addParticle(x0, by, z, 450, bridgeYCenter, -120, 0x00f2fe);
            }
        }
        // Lower X (y from -20 to 60)
        for (let k = 0; k < 20; k++) {
            let t = k / 20;
            let y = -20 + t * 80;
            // Interpolate zOffset based on y
            let zOffsetStart = 30 - ((-20 - (-100)) / 250) * 14;
            let zOffsetEnd = 30 - ((60 - (-100)) / 250) * 14;
            let zOffsetCurrent = zOffsetStart + t * (zOffsetEnd - zOffsetStart);
            let z1 = -zOffsetCurrent + t * (zOffsetCurrent * 2);
            let z2 = zOffsetCurrent - t * (zOffsetCurrent * 2);
            addParticle(x0, y, z1, 450, bridgeYCenter, -120, 0xa855f7);
            addParticle(x0, y, z2, 450, bridgeYCenter, -120, 0xa855f7);
        }
        // Upper X (y from 60 to 140)
        for (let k = 0; k < 20; k++) {
            let t = k / 20;
            let y = 60 + t * 80;
            let zOffsetStart = 30 - ((60 - (-100)) / 250) * 14;
            let zOffsetEnd = 30 - ((140 - (-100)) / 250) * 14;
            let zOffsetCurrent = zOffsetStart + t * (zOffsetEnd - zOffsetStart);
            let z1 = -zOffsetCurrent + t * (zOffsetCurrent * 2);
            let z2 = zOffsetCurrent - t * (zOffsetCurrent * 2);
            addParticle(x0, y, z1, 450, bridgeYCenter, -120, 0xa855f7);
            addParticle(x0, y, z2, 450, bridgeYCenter, -120, 0xa855f7);
        }
    }

    // 3. Main Suspension Cables (400 points)
    const cableZs = [-30, 30];
    for (let czIdx = 0; czIdx < 2; czIdx++) {
        let cz = cableZs[czIdx];
        for (let k = 0; k < 200; k++) {
            const color = Math.random() > 0.5 ? 0x00f2fe : 0xa855f7;
            let x = -250 + k * 2.5;
            let y = 0;
            if (x < -120) {
                y = -40 + 190 * (x + 250) / 130;
            } else if (x <= 120) {
                y = Math.pow(x / 120, 2) * 150;
            } else {
                y = 150 - 190 * (x - 120) / 130;
            }
            addParticle(x, y, cz, 450, bridgeYCenter, -120, color);
        }
    }

    // 4. Vertical Hangers (304 points)
    for (let hIdx = 0; hIdx < 19; hIdx++) {
        let x = -108 + hIdx * 12;
        let cableY = Math.pow(x / 120, 2) * 150;
        for (let side = 0; side < 2; side++) {
            let z = side === 0 ? -30 : 30;
            for (let pt = 0; pt < 8; pt++) {
                const color = Math.random() > 0.5 ? 0x00f2fe : 0xa855f7;
                let y = -20 + pt * (cableY - (-20)) / 8;
                addParticle(x, y, z, 450, bridgeYCenter, -120, color);
            }
        }
    }

    // 5. Bridge Deck & Deck Crossbeams (380 points)
    const deckZs = [-35, -12, 12, 35];
    for (let line = 0; line < 4; line++) {
        let z = deckZs[line];
        for (let k = 0; k < 80; k++) {
            const color = Math.random() > 0.5 ? 0x00f2fe : 0xa855f7;
            let x = -250 + k * 6.33;
            let y = -20;
            addParticle(x, y, z, 450, bridgeYCenter, -120, color);
        }
    }
    for (let c = 0; c < 20; c++) {
        let x = -250 + c * 26.3;
        for (let k = 0; k < 3; k++) {
            const color = Math.random() > 0.5 ? 0x00f2fe : 0xa855f7;
            let z = -35 + k * 23.3;
            let y = -20;
            addParticle(x, y, z, 450, bridgeYCenter, -120, color);
        }
    }

    // 5b. Under-deck Truss Bracing Support (X-truss under deck) (160 points)
    for (let c = 0; c < 20; c++) {
        let x1 = -250 + c * 26.3;
        let x2 = -250 + (c + 1) * 26.3;
        if (x2 > 250) x2 = 250;
        for (let pt = 0; pt < 4; pt++) {
            let t = pt / 4;
            let cx = x1 + t * (x2 - x1);
            let cz1 = -35 + t * 70;
            addParticle(cx, -24, cz1, 450, bridgeYCenter, -120, 0xa855f7);
            let cz2 = 35 - t * 70;
            addParticle(cx, -24, cz2, 450, bridgeYCenter, -120, 0xa855f7);
        }
    }

    // 6. Dynamic Vehicle Flow (48 points)
    // 3 cars moving left-to-right (Z = -10) and 3 moving right-to-left (Z = 10)
    for (let car = 0; car < 6; car++) {
        let z = car < 3 ? -10 : 10;
        let speed = car < 3 ? (25 + car * 10) : -(25 + (car - 3) * 10);
        let offset = car * 85;
        // Each vehicle is represented by a cluster of 8 particles
        for (let pt = 0; pt < 8; pt++) {
            let dx = (pt % 4) * 2.5; // length
            let dy = Math.floor(pt / 4) * 2.0; // height
            addCarParticle(dx, -18 + dy, z, 450, bridgeYCenter, -120, speed, offset);
        }
    }

    // ==========================================
    // --- STRUCTURE 3: WAREHOUSE (X=-450, Y=-1100, Z=150) ---
    // ==========================================
    const warehouseYCenter = -1100;

    // 1. Building Envelope (570 points)
    const wallZs = [-100, 100];
    for (let w = 0; w < 2; w++) {
        let z = wallZs[w];
        // Floor line
        for (let k = 0; k < 20; k++) {
            const color = Math.random() > 0.3 ? 0x00f2fe : 0xa855f7;
            let x = -80 + k * 8.42;
            addParticle(x, -80, z, -450, warehouseYCenter, 150, color);
        }
        // Roof slopes
        for (let k = 0; k < 15; k++) {
            const color = Math.random() > 0.3 ? 0x00f2fe : 0xa855f7;
            let t = k / 15;
            let x1 = -80 + t * 80;
            let y1 = 40 + t * 40;
            let x2 = t * 80;
            let y2 = 80 - t * 40;
            addParticle(x1, y1, z, -450, warehouseYCenter, 150, color);
            addParticle(x2, y2, z, -450, warehouseYCenter, 150, color);
        }
        // Pillars
        const pillarsXs = [-80, -40, 0, 40, 80];
        for (let pIdx = 0; pIdx < 5; pIdx++) {
            let px = pillarsXs[pIdx];
            let topY = px === 0 ? 80 : (Math.abs(px) === 40 ? 60 : 40);
            for (let k = 0; k < 15; k++) {
                const color = Math.random() > 0.3 ? 0x00f2fe : 0xa855f7;
                let y = -80 + k * (topY - (-80)) / 15;
                addParticle(px, y, z, -450, warehouseYCenter, 150, color);
            }
        }
    }
    const wallXs = [-80, 80];
    for (let w = 0; w < 2; w++) {
        let x = wallXs[w];
        // Eaves lines
        for (let k = 0; k < 40; k++) {
            const color = Math.random() > 0.3 ? 0x00f2fe : 0xa855f7;
            let z = -100 + k * 5.12;
            addParticle(x, 40, z, -450, warehouseYCenter, 150, color);
        }
        // Floor lines
        for (let k = 0; k < 40; k++) {
            const color = Math.random() > 0.3 ? 0x00f2fe : 0xa855f7;
            let z = -100 + k * 5.12;
            addParticle(x, -80, z, -450, warehouseYCenter, 150, color);
        }
        // Side wall posts
        for (let pIdx = 1; pIdx < 5; pIdx++) {
            let z = -100 + pIdx * 40;
            for (let k = 0; k < 15; k++) {
                const color = Math.random() > 0.3 ? 0x00f2fe : 0xa855f7;
                let y = -80 + k * 8.0;
                addParticle(x, y, z, -450, warehouseYCenter, 150, color);
            }
        }
    }
    // Ridge line
    for (let k = 0; k < 40; k++) {
        const color = Math.random() > 0.3 ? 0x00f2fe : 0xa855f7;
        let z = -100 + k * 5.12;
        addParticle(0, 80, z, -450, warehouseYCenter, 150, color);
    }

    // 2. Shelving Units (Rack 1 and 2, 720 points total)
    function generateWarehouseRack(rxCenter) {
        const shelfZs = [-60, -20, 20, 60];
        const shelfYs = [-80, -40, 0, 30];
        // Uprights
        for (let szIdx = 0; szIdx < 4; szIdx++) {
            let rz = shelfZs[szIdx];
            for (let side = 0; side < 2; side++) {
                let rx = rxCenter + (side === 0 ? -6 : 6);
                for (let k = 0; k < 15; k++) {
                    const color = Math.random() > 0.3 ? 0x00f2fe : 0xa855f7;
                    let y = -80 + k * 7.85;
                    addParticle(rx, y, rz, -450, warehouseYCenter, 150, color);
                }
            }
        }
        // Longitudinal beams
        for (let syIdx = 0; syIdx < 4; syIdx++) {
            let ry = shelfYs[syIdx];
            for (let side = 0; side < 2; side++) {
                let rx = rxCenter + (side === 0 ? -6 : 6);
                for (let k = 0; k < 30; k++) {
                    const color = Math.random() > 0.3 ? 0x00f2fe : 0xa855f7;
                    let rz = -60 + k * 4.13;
                    addParticle(rx, ry, rz, -450, warehouseYCenter, 150, color);
                }
            }
        }
    }
    generateWarehouseRack(-35);
    generateWarehouseRack(35);

    // 3. Cargo Boxes (480 points)
    function addWarehouseBox(bx, by, bz) {
        // Draw wireframe of a cargo box (24 points)
        // Edges along X
        for (let dy of [-4, 4]) {
            for (let dz of [-4, 4]) {
                for (let t = 0; t < 2; t++) {
                    const color = Math.random() > 0.3 ? 0x00f2fe : 0xa855f7;
                    let px = bx - 2 + t * 4;
                    addParticle(px, by + dy, bz + dz, -450, warehouseYCenter, 150, color);
                }
            }
        }
        // Edges along Y
        for (let dx of [-4, 4]) {
            for (let dz of [-4, 4]) {
                for (let t = 0; t < 2; t++) {
                    const color = Math.random() > 0.3 ? 0x00f2fe : 0xa855f7;
                    let py = by - 2 + t * 4;
                    addParticle(bx + dx, py, bz + dz, -450, warehouseYCenter, 150, color);
                }
            }
        }
        // Edges along Z
        for (let dx of [-4, 4]) {
            for (let dy of [-4, 4]) {
                for (let t = 0; t < 2; t++) {
                    const color = Math.random() > 0.3 ? 0x00f2fe : 0xa855f7;
                    let pz = bz - 2 + t * 4;
                    addParticle(bx + dx, by + dy, pz, -450, warehouseYCenter, 150, color);
                }
            }
        }
    }

    // Place 20 cargo boxes
    const boxLocations = [
        // Rack 1
        {x: -35, y: -40, z: -40}, {x: -35, y: -40, z: 0}, {x: -35, y: -40, z: 40},
        {x: -35, y: 0, z: -20}, {x: -35, y: 0, z: 20},
        {x: -35, y: 30, z: -40}, {x: -35, y: 30, z: 40},
        // Rack 2
        {x: 35, y: -40, z: -20}, {x: 35, y: -40, z: 20},
        {x: 35, y: 0, z: -40}, {x: 35, y: 0, z: 0}, {x: 35, y: 0, z: 40},
        {x: 35, y: 30, z: -20}, {x: 35, y: 30, z: 20},
        // Floor
        {x: 0, y: -76, z: -40}, {x: 0, y: -76, z: 0}, {x: 0, y: -76, z: 40},
        {x: -12, y: -76, z: -70}, {x: 12, y: -76, z: 70}, {x: 0, y: -76, z: -70}
    ];
    for (let i = 0; i < 20; i++) {
        let loc = boxLocations[i];
        addWarehouseBox(loc.x, loc.y, loc.z);
    }

    // 4. Floor Grid Lines & Aisles (230 points)
    for (let k = 0; k < 90; k++) {
        const color = Math.random() > 0.3 ? 0x00f2fe : 0xa855f7;
        let lineIdx = Math.floor(k / 30);
        let ptIdx = k % 30;
        let x = -50 + lineIdx * 50;
        let z = -90 + ptIdx * 6.2;
        addParticle(x, -80, z, -450, warehouseYCenter, 150, color);
    }
    for (let k = 0; k < 120; k++) {
        const color = Math.random() > 0.3 ? 0x00f2fe : 0xa855f7;
        let lineIdx = Math.floor(k / 12);
        let ptIdx = k % 12;
        let z = -80 + lineIdx * 16.0;
        let x = -70 + ptIdx * 12.72;
        addParticle(x, -80, z, -450, warehouseYCenter, 150, color);
    }
    // 4b. Roof Truss Diagonal Bracings (80 points)
    const trussZs = [-100, -50, 0, 50, 100];
    for (let tz of trussZs) {
        for (let k = 0; k < 8; k++) {
            let t = k / 8;
            let lx = -80 + t * 80;
            let ly = 40 + t * 40;
            addParticle(lx, ly - 4, tz, -450, warehouseYCenter, 150, 0x00f2fe);
            let rx = 80 - t * 80;
            let ry = 40 + t * 40;
            addParticle(rx, ry - 4, tz, -450, warehouseYCenter, 150, 0x00f2fe);
        }
    }

    // 4c. Forklift in Central Aisle (32 points)
    for (let k = 0; k < 20; k++) {
        let dx = (k % 3) * 3 - 3;
        let dy = Math.floor(k / 3) * 3;
        let dz = Math.floor(k / 9) * 3 - 3;
        addParticle(dx, -76 + dy, 20 + dz, -450, warehouseYCenter, 150, 0xa855f7);
    }
    for (let k = 0; k < 6; k++) {
        let dy = k * 3;
        addParticle(-3, -76 + dy, 25, -450, warehouseYCenter, 150, 0x00f2fe);
        addParticle(3, -76 + dy, 25, -450, warehouseYCenter, 150, 0x00f2fe);
    }

    // ==========================================
    // --- STRUCTURE 4: SEPARATOR (X=400, Y=-1800, Z=-200) ---
    // ==========================================
    const separatorYCenter = -1800;

    // 1. Floor Grid (300 points)
    for (let k = 0; k < 150; k++) {
        const color = Math.random() > 0.4 ? 0x00f2fe : 0xa855f7;
        let lineIdx = Math.floor(k / 15);
        let ptIdx = k % 15;
        let x = -120 + ptIdx * 17.14;
        let y = -80;
        let z = -120 + lineIdx * 26.6;
        addParticle(x, y, z, 400, separatorYCenter, -200, color);
    }
    for (let k = 0; k < 150; k++) {
        const color = Math.random() > 0.4 ? 0x00f2fe : 0xa855f7;
        let lineIdx = Math.floor(k / 15);
        let ptIdx = k % 15;
        let x = -120 + lineIdx * 26.6;
        let y = -80;
        let z = -120 + ptIdx * 17.14;
        addParticle(x, y, z, 400, separatorYCenter, -200, color);
    }

    // 2. Cylinder Body & Caps (960 points)
    // Cylinder rings: 600 points
    for (let k = 0; k < 600; k++) {
        const color = Math.random() > 0.4 ? 0x00f2fe : 0xa855f7;
        let ringIdx = Math.floor(k / 30);
        let ptIdx = k % 30;
        let x = -80 + ringIdx * 8.42;
        let theta = ptIdx * (Math.PI * 2 / 30);
        let r = 40;
        let y = 10 + r * Math.cos(theta);
        let z = r * Math.sin(theta);
        addParticle(x, y, z, 400, separatorYCenter, -200, color);
    }
    // Cylinder longitudinal lines: 120 points
    for (let k = 0; k < 120; k++) {
        const color = Math.random() > 0.4 ? 0x00f2fe : 0xa855f7;
        let lineIdx = Math.floor(k / 20);
        let ptIdx = k % 20;
        let x = -80 + ptIdx * 8.42;
        let theta = lineIdx * (Math.PI * 2 / 6);
        let r = 40;
        let y = 10 + r * Math.cos(theta);
        let z = r * Math.sin(theta);
        addParticle(x, y, z, 400, separatorYCenter, -200, color);
    }
    // Left Cap: 120 points
    for (let k = 0; k < 120; k++) {
        const color = Math.random() > 0.4 ? 0x00f2fe : 0xa855f7;
        let ringIdx = Math.floor(k / 20);
        let ptIdx = k % 20;
        let dx = ringIdx * 6.66;
        let x = -80 - dx;
        let theta = ptIdx * (Math.PI * 2 / 20);
        let r = Math.sqrt(Math.max(0, 1600 - dx * dx));
        let y = 10 + r * Math.cos(theta);
        let z = r * Math.sin(theta);
        addParticle(x, y, z, 400, separatorYCenter, -200, color);
    }
    // Right Cap: 120 points
    for (let k = 0; k < 120; k++) {
        const color = Math.random() > 0.4 ? 0x00f2fe : 0xa855f7;
        let ringIdx = Math.floor(k / 20);
        let ptIdx = k % 20;
        let dx = ringIdx * 6.66;
        let x = 80 + dx;
        let theta = ptIdx * (Math.PI * 2 / 20);
        let r = Math.sqrt(Math.max(0, 1600 - dx * dx));
        let y = 10 + r * Math.cos(theta);
        let z = r * Math.sin(theta);
        addParticle(x, y, z, 400, separatorYCenter, -200, color);
    }

    // 3. Saddle Supports & Bases (300 points)
    const saddleXsSeparator = [-50, 50];
    for (let s = 0; s < 2; s++) {
        let sx = saddleXsSeparator[s];
        // Cradle arc
        for (let k = 0; k < 30; k++) {
            const color = Math.random() > 0.4 ? 0x00f2fe : 0xa855f7;
            let theta = Math.PI + 0.5 + (k / 30) * (Math.PI - 1.0);
            let r = 40;
            let y = 10 + r * Math.sin(theta);
            let z = r * Math.cos(theta);
            addParticle(sx, y, z, 400, separatorYCenter, -200, color);
        }
        // Pillars
        for (let k = 0; k < 30; k++) {
            const color = Math.random() > 0.4 ? 0x00f2fe : 0xa855f7;
            let y = -20 - k * 2.0;
            addParticle(sx, y, -25, 400, separatorYCenter, -200, color);
        }
        for (let k = 0; k < 30; k++) {
            const color = Math.random() > 0.4 ? 0x00f2fe : 0xa855f7;
            let y = -20 - k * 2.0;
            addParticle(sx, y, 25, 400, separatorYCenter, -200, color);
        }
    }
    // Anchor beams
    for (let k = 0; k < 60; k++) {
        const color = Math.random() > 0.4 ? 0x00f2fe : 0xa855f7;
        let z = -30 + k * 1.0;
        addParticle(-50, -80, z, 400, separatorYCenter, -200, color);
        addParticle(50, -80, z, 400, separatorYCenter, -200, color);
    }

    // 4. Piping & Valves & Gauges (440 points)
    // Inlet (75 points)
    for (let k = 0; k < 75; k++) {
        const color = Math.random() > 0.4 ? 0x00f2fe : 0xa855f7;
        let x = 0, y = 10, z = 0;
        if (k < 35) {
            x = -120 - k * 0.85;
            y = 10;
        } else {
            x = -150;
            y = 10 - (k - 35) * 2.25;
        }
        addParticle(x, y, z, 400, separatorYCenter, -200, color);
    }
    // Inlet Nozzle Flange (15 points)
    for (let k = 0; k < 15; k++) {
        let theta = k * (Math.PI * 2 / 15);
        let r = 8;
        addParticle(-120, 10 + r * Math.cos(theta), r * Math.sin(theta), 400, separatorYCenter, -200, 0x00f2fe);
    }
    // Top outlet (75 points)
    for (let k = 0; k < 75; k++) {
        const color = Math.random() > 0.4 ? 0x00f2fe : 0xa855f7;
        let x = 0, y = 0, z = 0;
        if (k < 35) {
            x = 0;
            y = 50 + k * 1.42;
        } else {
            x = (k - 35) * 2.5;
            y = 100;
        }
        addParticle(x, y, z, 400, separatorYCenter, -200, color);
    }
    // Circular Pressure Gauge on Front Face (40 points)
    for (let k = 0; k < 30; k++) {
        let theta = k * (Math.PI * 2 / 30);
        let r = 12;
        let y = 25 + r * Math.cos(theta);
        let z = 40 + r * Math.sin(theta);
        addParticle(0, y, z, 400, separatorYCenter, -200, 0x00f2fe);
    }
    // Gauge Needle (10 points)
    for (let k = 0; k < 10; k++) {
        let len = k * 1.0;
        let y = 25 + len * Math.cos(Math.PI / 4);
        let z = 40 + len * Math.sin(Math.PI / 4);
        addParticle(0, y, z, 400, separatorYCenter, -200, 0xa855f7);
    }
    // Bottom outlet (50 points)
    for (let k = 0; k < 50; k++) {
        const color = Math.random() > 0.4 ? 0x00f2fe : 0xa855f7;
        addParticle(0, -30 - k * 1.0, 0, 400, separatorYCenter, -200, color);
    }
    // Level glass: nozzles (30 points) + tube (40 points) = 70 points
    for (let k = 0; k < 15; k++) {
        const color = Math.random() > 0.4 ? 0x00f2fe : 0xa855f7;
        let t = k / 15;
        addParticle(30, 30, 40 + t * 5, 400, separatorYCenter, -200, color);
        addParticle(30, -10, 40 + t * 5, 400, separatorYCenter, -200, color);
    }
    for (let k = 0; k < 40; k++) {
        const color = Math.random() > 0.4 ? 0x00f2fe : 0xa855f7;
        addParticle(30, -10 + k * 1.0, 45, 400, separatorYCenter, -200, color);
    }
    // Safety bypass loop (170 points)
    for (let k = 0; k < 170; k++) {
        const color = Math.random() > 0.4 ? 0x00f2fe : 0xa855f7;
        let theta = (k / 170) * Math.PI;
        let r = 25;
        let x = -40 + r * Math.cos(theta);
        let y = 50 + r * Math.sin(theta);
        let z = 10;
        addParticle(x, y, z, 400, separatorYCenter, -200, color);
    }

    // ==========================================
    // --- STRUCTURE 5: ENERGY GRID (X=-400, Y=-2500, Z=120) ---
    // ==========================================
    const energyYCenter = -2500;

    // 1. Floor Grid (300 points)
    for (let k = 0; k < 150; k++) {
        const color = Math.random() > 0.4 ? 0x00f2fe : 0xa855f7;
        let lineIdx = Math.floor(k / 15);
        let ptIdx = k % 15;
        let x = -120 + ptIdx * 17.14;
        let y = -80;
        let z = -120 + lineIdx * 26.6;
        addParticle(x, y, z, -400, energyYCenter, 120, color);
    }
    for (let k = 0; k < 150; k++) {
        const color = Math.random() > 0.4 ? 0x00f2fe : 0xa855f7;
        let lineIdx = Math.floor(k / 15);
        let ptIdx = k % 15;
        let x = -120 + lineIdx * 26.6;
        let y = -80;
        let z = -120 + ptIdx * 17.14;
        addParticle(x, y, z, -400, energyYCenter, 120, color);
    }

    // 2. Wind Turbines (Rotating Blades, 520 points)
    const turbineXs = [-100, 100];
    const turbineZs = [-30, 30];
    for (let t = 0; t < 2; t++) {
        let tx = turbineXs[t];
        let tz = turbineZs[t];
        
        // Tower rings
        for (let k = 0; k < 100; k++) {
            const color = Math.random() > 0.4 ? 0x00f2fe : 0xa855f7;
            let ringIdx = Math.floor(k / 5);
            let ptIdx = k % 5;
            let y = -80 + ringIdx * 8.5;
            let r = 7 - (ringIdx / 20) * 4.5;
            let theta = ptIdx * (Math.PI * 2 / 5);
            let px = tx + r * Math.cos(theta);
            let pz = tz + r * Math.sin(theta);
            addParticle(px, y, pz, -400, energyYCenter, 120, color);
        }
        // Nacelle
        for (let k = 0; k < 40; k++) {
            const color = Math.random() > 0.4 ? 0x00f2fe : 0xa855f7;
            let dx = (k & 1) ? 6 : -6;
            let dy = (k & 2) ? 4 : -4;
            let dz = (k & 4) ? 10 : -10;
            addParticle(tx + dx, 90 + dy, tz + dz, -400, energyYCenter, 120, color);
        }
        // Blades (rotating)
        for (let b = 0; b < 3; b++) {
            let angleOffset = b * (Math.PI * 2 / 3);
            for (let pIdx = 0; pIdx < 40; pIdx++) {
                const color = Math.random() > 0.4 ? 0x00f2fe : 0xa855f7;
                let len = 5 + pIdx * 1.25;
                addBladeParticle(tx, 90, tz, -400, energyYCenter, 120, len, angleOffset, color);
            }
        }
    }

    // 3. Transmission Pylon (600 points)
    // 4 Corner legs: 160 points
    for (let leg = 0; leg < 4; leg++) {
        let dxSign = (leg & 1) ? 1 : -1;
        let dzSign = (leg & 2) ? 1 : -1;
        for (let k = 0; k < 40; k++) {
            const color = Math.random() > 0.4 ? 0x00f2fe : 0xa855f7;
            let t = k / 40;
            let y = -80 + t * 180;
            let w = 25 + t * (5 - 25);
            let px = dxSign * w;
            let pz = 60 + dzSign * w;
            addParticle(px, y, pz, -400, energyYCenter, 120, color);
        }
    }
    // 3 Crossarms + Hanging Insulators: 180 points
    const armYs = [40, 70, 95];
    const armWs = [42, 36, 30];
    for (let a = 0; a < 3; a++) {
        let ay = armYs[a];
        let aw = armWs[a];
        for (let k = 0; k < 40; k++) {
            const color = Math.random() > 0.4 ? 0x00f2fe : 0xa855f7;
            let px = -aw + k * (aw * 2 / 40);
            addParticle(px, ay, 60, -400, energyYCenter, 120, color);
        }
        for (let side = 0; side < 2; side++) {
            let tipX = side === 0 ? -aw : aw;
            for (let k = 0; k < 10; k++) {
                const color = Math.random() > 0.4 ? 0x00f2fe : 0xa855f7;
                addParticle(tipX, ay - k * 2.5, 60, -400, energyYCenter, 120, color);
            }
        }
    }
    // Lattice diagonals: 260 points
    const levelsPylon = [-80, -35, 10, 55, 100];
    for (let L = 0; L < 4; L++) {
        let yLow = levelsPylon[L];
        let yHigh = levelsPylon[L+1];
        let tLow = (yLow - (-80)) / 180;
        let tHigh = (yHigh - (-80)) / 180;
        let wLow = 25 + tLow * (5 - 25);
        let wHigh = 25 + tHigh * (5 - 25);
        for (let k = 0; k < 16; k++) {
            const color = Math.random() > 0.4 ? 0x00f2fe : 0xa855f7;
            let t = k / 16;
            let y = yLow + t * (yHigh - yLow);
            let z = 60 + (wLow + t * (wHigh - wLow));
            let x1 = -wLow + t * (wHigh + wLow);
            let x2 = wLow - t * (wHigh + wLow);
            addParticle(x1, y, z, -400, energyYCenter, 120, color);
            addParticle(x2, y, z, -400, energyYCenter, 120, color);
            
            let zB = 60 - (wLow + t * (wHigh - wLow));
            addParticle(x1, y, zB, -400, energyYCenter, 120, color);
            addParticle(x2, y, zB, -400, energyYCenter, 120, color);
        }
    }

    // 3b. Substation Transformers (80 points)
    // Transformer 1: X = -50, Z = 90
    for (let k = 0; k < 40; k++) {
        let dx = (k % 4) * 3 - 4.5;
        let dy = Math.floor(k / 4) * 3 - 80;
        let dz = Math.floor(k / 16) * 3 + 90;
        addParticle(dx - 50, dy, dz, -400, energyYCenter, 120, 0x00f2fe);
    }
    // Transformer 2: X = 50, Z = 90
    for (let k = 0; k < 40; k++) {
        let dx = (k % 4) * 3 - 4.5;
        let dy = Math.floor(k / 4) * 3 - 80;
        let dz = Math.floor(k / 16) * 3 + 90;
        addParticle(dx + 50, dy, dz, -400, energyYCenter, 120, 0x00f2fe);
    }

    // 4. Solar Panels (225 points)
    const panelXs = [-90, -45, 0, 45, 90];
    for (let p = 0; p < 5; p++) {
        let px = panelXs[p];
        let pz = -60;
        // Panel grid (25 points)
        for (let r = 0; r < 5; r++) {
            for (let c = 0; c < 5; c++) {
                const color = Math.random() > 0.4 ? 0x00f2fe : 0xa855f7;
                let dx = -10 + c * 5;
                let dz = -10 + r * 5;
                let dy = dz * 0.46;
                addParticle(px + dx, -50 + dy, pz + dz, -400, energyYCenter, 120, color);
            }
        }
        // Legs (20 points)
        const cornersX = [-10, 10];
        const cornersZ = [-10, 10];
        for (let cx = 0; cx < 2; cx++) {
            for (let cz = 0; cz < 2; cz++) {
                let lx = px + cornersX[cx];
                let lz = pz + cornersZ[cz];
                let lyStart = -50 + cornersZ[cz] * 0.46;
                for (let k = 0; k < 5; k++) {
                    const color = Math.random() > 0.4 ? 0x00f2fe : 0xa855f7;
                    let y = lyStart - k * (lyStart - (-80)) / 5;
                    addParticle(lx, y, lz, -400, energyYCenter, 120, color);
                }
            }
        }
    }

    // 5. Catenary Electrical Wires & Remaining Sparks (355 points)
    // Wire 1: Turbine 1 to Pylon
    for (let k = 0; k < 100; k++) {
        const color = Math.random() > 0.4 ? 0x00f2fe : 0xa855f7;
        let t = k / 100;
        let x = -100 + t * 100;
        let z = -30 + t * 90;
        let y = 90 + (1 - t) * 0 - t * 20 + Math.pow(t - 0.5, 2) * 40;
        addParticle(x, y, z, -400, energyYCenter, 120, color);
    }
    // Wire 2: Turbine 2 to Pylon
    for (let k = 0; k < 100; k++) {
        const color = Math.random() > 0.4 ? 0x00f2fe : 0xa855f7;
        let t = k / 100;
        let x = 100 - t * 100;
        let z = 30 + t * 30;
        let y = 90 + (1 - t) * 0 - t * 20 + Math.pow(t - 0.5, 2) * 40;
        addParticle(x, y, z, -400, energyYCenter, 120, color);
    }
    // Sparks to hit exactly 2000 points
    for (let k = 0; k < 159; k++) {
        const color = Math.random() > 0.4 ? 0x00f2fe : 0xa855f7;
        let x = (Math.random() - 0.5) * 250;
        let y = -80 + Math.random() * 180;
        let z = (Math.random() - 0.5) * 150;
        addParticle(x, y, z, -400, energyYCenter, 120, color);
    }


    // =============================================
    // TRANSITION CONNECTION SPARKS (2000 particles total)
    // =============================================
    const transitionRanges = [
        { min: -300, max: 200 },    // Refinery -> Bridge
        { min: -1000, max: -500 },  // Bridge -> Warehouse
        { min: -1700, max: -1200 }, // Warehouse -> Separator
        { min: -2400, max: -1900 }  // Separator -> Energy Grid
    ];

    transitionRanges.forEach(range => {
        for (let k = 0; k < 500; k++) {
            const colorHex = Math.random() > 0.5 ? 0x00f2fe : 0xa855f7;
            const x = (Math.random() - 0.5) * 400;
            const y = range.min + Math.random() * (range.max - range.min);
            const z = (Math.random() - 0.5) * 300;
            
            const idx = pIndex;
            pIndex++;
            const baseColor = new THREE.Color(colorHex);
            particlesData.push({
                idx: idx,
                baseX: x,
                baseY: y,
                baseZ: z,
                worldY: y,
                chaosX: 0,
                chaosY: 0,
                chaosZ: 0,
                baseColor: baseColor,
                isBlade: false,
                isSpark: true,
                sparkSpeed: 0.2 + Math.random() * 0.8,
                sparkPhase: Math.random() * Math.PI * 2
            });
        }
    });

    const totalParticles = particlesData.length;

    // --- Per-particle physics and animation state ---
    const particleState = [];
    for (let i = 0; i < totalParticles; i++) {
        particleState.push({
            mouseDispX: 0,
            mouseDispY: 0,
            mouseDispZ: 0
        });
    }

    // --- Buffer geometry for all 12,000 particles ---
    const positions = new Float32Array(totalParticles * 3);
    const colors = new Float32Array(totalParticles * 3);

    for (let i = 0; i < totalParticles; i++) {
        const p = particlesData[i];
        positions[i * 3]     = p.baseX;
        positions[i * 3 + 1] = p.worldY;
        positions[i * 3 + 2] = p.baseZ;
        colors[i * 3]     = p.baseColor.r;
        colors[i * 3 + 1] = p.baseColor.g;
        colors[i * 3 + 2] = p.baseColor.b;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    // Create a circular glowing particle texture in canvas
    function createCircleTexture() {
        const c = document.createElement('canvas');
        c.width = 16;
        c.height = 16;
        const ctx = c.getContext('2d');
        const grad = ctx.createRadialGradient(8, 8, 0, 8, 8, 8);
        grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
        grad.addColorStop(0.3, 'rgba(255, 255, 255, 0.8)');
        grad.addColorStop(0.6, 'rgba(255, 255, 255, 0.15)');
        grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 16, 16);
        return new THREE.CanvasTexture(c);
    }

    const material = new THREE.PointsMaterial({
        size: particleSize,
        map: createCircleTexture(),
        vertexColors: true,
        transparent: true,
        opacity: 0.85,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        sizeAttenuation: true
    });

    const pointCloud = new THREE.Points(geometry, material);
    scene.add(pointCloud);

    // --- MOUSE INTERACTION TRACKING ---
    const mouse = new THREE.Vector2(-9999, -9999);
    const mouse3D = new THREE.Vector3();
    const raycaster = new THREE.Raycaster();
    let mouseActive = false;

    canvas.addEventListener('mousemove', (e) => {
        const rect = canvas.getBoundingClientRect();
        mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
        mouseActive = true;
    });

    canvas.addEventListener('mouseleave', () => {
        mouseActive = false;
        mouse.x = -9999;
        mouse.y = -9999;
    });

    function updateMouse3D() {
        if (!mouseActive) return;
        raycaster.setFromCamera(mouse, camera);
        const planeNormal = new THREE.Vector3(0, 0, 1).applyQuaternion(camera.quaternion);
        const focusPoint = new THREE.Vector3(currentCameraX, currentCameraY, currentCameraZ);
        const plane = new THREE.Plane().setFromNormalAndCoplanarPoint(planeNormal, focusPoint);
        raycaster.ray.intersectPlane(plane, mouse3D);
    }

    // --- SCROLL INTERPOLATION & CAMERA ---
    let currentCameraX = 0;
    let currentCameraY = isMobile ? 410 : 300;
    let currentCameraZ = 0;

    const keyframes = [
        { x: -160, y: isMobile ? 410 : 300, z: 0 },      // 0: Hero (Refinery right)
        { x: 160, y: isMobile ? 410 : 300, z: 0 },       // 1: Digital Twin (Refinery left)
        { x: 450, y: -400, z: -120 },   // 2: Civil Twin (Bridge)
        { x: -450, y: -1100, z: 150 },  // 3: Warehouse Twin (Warehouse)
        { x: 400, y: -1800, z: -200 },  // 4: Separator Twin (Separator)
        { x: -400, y: -2500, z: 120 }   // 5: Energy Grid (Turbines/Pylon)
    ];

    let secHero, secDigitalTwin, secCivil, secWarehouse, secSeparator, secEnergy;

    function cacheSectionElements() {
        secHero = document.getElementById('hero');
        secDigitalTwin = document.getElementById('digital-twin');
        secCivil = document.getElementById('civil-twin-section');
        secWarehouse = document.getElementById('warehouse-twin-section');
        secSeparator = document.getElementById('separator-twin-section');
        secEnergy = document.getElementById('energy-twin-section');
    }

    let currentProgress = -1.0;

    function getInterpolatedPosition() {
        if (!secHero || !secDigitalTwin || !secCivil || !secWarehouse || !secSeparator || !secEnergy) {
            cacheSectionElements();
        }

        const y0 = secHero ? secHero.offsetTop : 0;
        const y1 = secDigitalTwin ? secDigitalTwin.offsetTop : 1800;
        const y2 = secCivil ? secCivil.offsetTop : 3000;
        const y3 = secWarehouse ? secWarehouse.offsetTop : 4200;
        const y4 = secSeparator ? secSeparator.offsetTop : 5400;
        const y5 = secEnergy ? secEnergy.offsetTop : 6600;

        const currentScroll = window.scrollY;
        let targetProgress = -1.0;

        if (currentScroll < y1) {
            // Hero -> Digital Twin (linear transition from -1.0 to 0.0)
            targetProgress = -1.0 + Math.max(0, Math.min(1, currentScroll / (y1 || 1)));
        } else {
            // Segment routing based on scroll position between consecutive twin sections
            let start = 0;
            let end = 0;
            let s = 1;

            if (currentScroll < y2) {
                s = 1;
                start = y1;
                end = y2;
            } else if (currentScroll < y3) {
                s = 2;
                start = y2;
                end = y3;
            } else if (currentScroll < y4) {
                s = 3;
                start = y3;
                end = y4;
            } else {
                s = 4;
                start = y4;
                end = y5;
            }

            const mid = (start + end) / 2;
            const W = Math.min(350, 0.35 * (end - start));
            const baseProgress = s - 1;

            if (currentScroll < mid - W) {
                targetProgress = baseProgress;
            } else if (currentScroll > mid + W) {
                targetProgress = baseProgress + 1.0;
            } else {
                const tSegment = (currentScroll - (mid - W)) / (2 * W || 1);
                const mu = (1 - Math.cos(tSegment * Math.PI)) / 2;
                targetProgress = baseProgress + mu;
            }
        }

        // Apply smooth inertia to the progress value for a gradual camera pan (factor 0.05).
        currentProgress = THREE.MathUtils.lerp(currentProgress, targetProgress, 0.05);

        let index = 0;
        let nextIndex = 0;
        let morphMu = 0;
        let cameraPos = { x: 0, y: 0, z: 0 };

        if (currentProgress < 0) {
            // Camera pans from Refinery right to Refinery left
            const tCam = currentProgress + 1.0;
            const muCam = (1 - Math.cos(tCam * Math.PI)) / 2;
            index = 0;
            nextIndex = 0;
            morphMu = 0;
            cameraPos.x = keyframes[0].x + (keyframes[1].x - keyframes[0].x) * muCam;
            cameraPos.y = keyframes[0].y + (keyframes[1].y - keyframes[0].y) * muCam;
            cameraPos.z = keyframes[0].z + (keyframes[1].z - keyframes[0].z) * muCam;
        } else {
            // Camera pans between shapes Y-coordinates
            index = Math.floor(currentProgress);
            nextIndex = Math.min(4, index + 1);
            morphMu = currentProgress - index;

            const k0 = keyframes[index + 1];
            const k1 = keyframes[nextIndex + 1] || keyframes[index + 1];

            cameraPos.x = k0.x + (k1.x - k0.x) * morphMu;
            cameraPos.y = k0.y + (k1.y - k0.y) * morphMu;
            cameraPos.z = k0.z + (k1.z - k0.z) * morphMu;
        }

        return {
            x: cameraPos.x,
            y: cameraPos.y,
            z: cameraPos.z
        };
    }

    // --- ANIMATION LOOP ---
    function animate() {
        requestAnimationFrame(animate);

        const pathData = getInterpolatedPosition();

        currentCameraX = THREE.MathUtils.lerp(currentCameraX, pathData.x, 0.05);
        currentCameraY = THREE.MathUtils.lerp(currentCameraY, pathData.y, 0.05);
        currentCameraZ = THREE.MathUtils.lerp(currentCameraZ, pathData.z, 0.05);

        // Responsive camera distance based on aspect ratio (Z-zooming on mobile)
        const aspect = window.innerWidth / window.innerHeight;
        let zDistance = 420;
        if (aspect < 1.0) {
            zDistance = 420 * (1.25 / aspect); // Zoom out dynamically to fit structures
            zDistance = Math.max(420, Math.min(800, zDistance)); // Clamp
        }

        camera.position.x = currentCameraX + Math.sin(Date.now() * 0.0003) * 60;
        camera.position.y = currentCameraY;
        camera.position.z = currentCameraZ + zDistance + Math.cos(Date.now() * 0.0003) * 40;
        camera.lookAt(currentCameraX, currentCameraY, currentCameraZ);

        updateMouse3D();

        const positionsAttr = geometry.attributes.position.array;
        const colorsAttr = geometry.attributes.color.array;
        const time = Date.now() * 0.001;

        for (let i = 0; i < totalParticles; i++) {
            const p = particlesData[i];
            const state = particleState[i];

            // --- Base position ---
            let px = p.baseX;
            let py = p.worldY;
            let pz = p.baseZ;

            // --- Apply turbine rotation if applicable ---
            if (p.isBlade) {
                const angle = time * 1.8 + p.bladeAngleOffset;
                px = p.hubX + p.bladeLength * Math.cos(angle);
                py = p.hubY + p.bladeLength * Math.sin(angle);
                pz = p.hubZ;
            }

            // --- Apply vehicle movement if applicable ---
            if (p.isCar) {
                let localX = ((p.carSpeed * time + p.carOffset) % 500) - 250;
                px = p.localXCenter + localX;
            }

            // --- Mouse repulsion / manipulation ---
            if (mouseActive && mouse3D.x !== undefined) {
                const dx = px - mouse3D.x;
                const dy = py - mouse3D.y;
                const dz = pz - mouse3D.z;
                const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
                const repulsionRadius = 120;
                if (dist < repulsionRadius && dist > 0.1) {
                    const force = (1.0 - dist / repulsionRadius) * 65;
                    state.mouseDispX += (dx / dist) * force * 0.15;
                    state.mouseDispY += (dy / dist) * force * 0.15;
                    state.mouseDispZ += (dz / dist) * force * 0.15;
                }
            }
            state.mouseDispX *= 0.92;
            state.mouseDispY *= 0.92;
            state.mouseDispZ *= 0.92;

            // --- Floating drift / ambient noise ---
            let floatX = 0;
            let floatY = 0;
            let floatZ = 0;

            if (p.isSpark) {
                // Sparks float/drift with a larger and smoother motion to simulate a digital fluid flow
                floatX = Math.sin(time * 0.5 * p.sparkSpeed + p.sparkPhase) * 18.0;
                floatY = Math.cos(time * 0.3 * p.sparkSpeed + p.sparkPhase) * 12.0;
                floatZ = Math.sin(time * 0.4 * p.sparkSpeed + p.sparkPhase) * 18.0;
            } else {
                // Normal structural particles float sutilmente in place
                floatX = Math.sin(time * 0.8 + py * 0.015) * 2.0;
                floatY = Math.cos(time * 0.8 + py * 0.015) * 1.0;
                floatZ = Math.sin(time * 0.6 + py * 0.02) * 2.0;
            }

            // --- Update final positions ---
            positionsAttr[i * 3]     = px + floatX + state.mouseDispX;
            positionsAttr[i * 3 + 1] = py + floatY + state.mouseDispY;
            positionsAttr[i * 3 + 2] = pz + floatZ + state.mouseDispZ;

            // --- Color: keep original structure color, sparks pulse sutilmente ---
            let cr = p.baseColor.r;
            let cg = p.baseColor.g;
            let cb = p.baseColor.b;

            if (p.isSpark) {
                const pulse = 0.7 + Math.sin(time * 1.5 * p.sparkSpeed + p.sparkPhase) * 0.3;
                cr *= pulse;
                cg *= pulse;
                cb *= pulse;
            }

            colorsAttr[i * 3]     = cr;
            colorsAttr[i * 3 + 1] = cg;
            colorsAttr[i * 3 + 2] = cb;
        }

        geometry.attributes.position.needsUpdate = true;
        geometry.attributes.color.needsUpdate = true;

        renderer.render(scene, camera);
    }
    animate();

    // --- RESIZE HANDLER ---
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });

})();
