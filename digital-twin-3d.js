window.initRefinery3D = function(container) {
    console.log("🚀 Iniciando Motor 3D Inmersivo (El Palito - Zona 1 Alta Fidelidad)...");
    if (!container) return;

    // --- SCENE SETUP ---
    // Scene background is transparent to let CSS grid show through
    const scene = new THREE.Scene();

    // --- CAMERA ---
    // Perspective camera using container dimensions (set initially, updated on resize)
    const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 1, 6000);
    camera.position.set(-900, 700, 1100);

    // --- RENDERER ---
    // Enable alpha for transparency
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    // Tone mapping for more realistic color output
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;
    container.appendChild(renderer.domElement);

    // --- ORBIT CONTROLS (Replacing scroll-linked camera) ---
    const controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.screenSpacePanning = false;
    controls.minDistance = 200;
    controls.maxDistance = 2500;
    controls.maxPolarAngle = Math.PI / 2 - 0.05; // Don't go below ground level
    controls.target.set(100, 0, -100);
    controls.update();

    // --- LIGHTING (Neutral, no blue contamination) ---
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.65);
    scene.add(ambientLight);

    // Hemisphere light for natural ground/sky color split (warm sun + cool sky)
    const hemiLight = new THREE.HemisphereLight(0xfff5e6, 0x444444, 0.4);
    scene.add(hemiLight);

    const sunLight = new THREE.DirectionalLight(0xfff5e6, 1.0); // Warm white sun
    sunLight.position.set(-500, 1200, 800);
    sunLight.castShadow = true;
    sunLight.shadow.camera.left = -2000;
    sunLight.shadow.camera.right = 2000;
    sunLight.shadow.camera.top = 2000;
    sunLight.shadow.camera.bottom = -2000;
    sunLight.shadow.camera.far = 5000;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    scene.add(sunLight);

    // --- INTERCEPT ADD FOR GROUP ROTATION ---
    const refineryGroup = new THREE.Group();
    scene.add(refineryGroup);
    const originalSceneAdd = scene.add;
    scene.add = function(obj) {
        if (obj.isLight || obj.isPoints) {
            originalSceneAdd.call(scene, obj);
        } else {
            refineryGroup.add(obj);
        }
    };

    // --- MATERIALS (Neutral, no blue tint) ---
    const matLand = new THREE.MeshStandardMaterial({ color: 0x3d3d3d, roughness: 1.0 });
    const matSea = new THREE.MeshStandardMaterial({ color: 0x1a6b8a, roughness: 0.15, metalness: 0.1, transparent: true, opacity: 0.85 });
    const matLagoon = new THREE.MeshStandardMaterial({ color: 0x0a0a0a, roughness: 0.05, metalness: 0.9 });
    const matAsphalt = new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 0.95 });
    const matConcrete = new THREE.MeshStandardMaterial({ color: 0xc8c8c0, roughness: 0.85 });

    // Tank materials: Pure white, no blue tint
    const matTankWhite = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.75, metalness: 0.05 });
    const matTankRed = new THREE.MeshStandardMaterial({ color: 0xcc2222, roughness: 0.65, metalness: 0.1 });

    // Process zone metals
    const matSteel = new THREE.MeshStandardMaterial({ color: 0x888888, roughness: 0.45, metalness: 0.7 });
    const matDarkSteel = new THREE.MeshStandardMaterial({ color: 0x444444, roughness: 0.6, metalness: 0.5 });
    const matRustedSteel = new THREE.MeshStandardMaterial({ color: 0x8b6914, roughness: 0.9, metalness: 0.3 });
    const matPipe = new THREE.MeshStandardMaterial({ color: 0x999999, roughness: 0.4, metalness: 0.8 });

    // Line materials
    const matPipeLine = new THREE.LineBasicMaterial({ color: 0x666666 });
    const matScaffoldLine = new THREE.LineBasicMaterial({ color: 0x555555, transparent: true, opacity: 0.6 });

    // --- GEOGRAPHY & BASE ---
    // Sea
    const sea = new THREE.Mesh(new THREE.CylinderGeometry(1800, 1800, 10, 64), matSea);
    sea.position.set(2000, -5, -400);
    sea.receiveShadow = true;
    scene.add(sea);

    // Land
    const land = new THREE.Mesh(new THREE.BoxGeometry(3000, 8, 3000), matLand);
    land.position.set(-200, -4, 0);
    land.receiveShadow = true;
    scene.add(land);

    // Pier
    const pier = new THREE.Mesh(new THREE.BoxGeometry(800, 12, 30), matLand);
    pier.position.set(1200, 0, -800);
    pier.castShadow = true; pier.receiveShadow = true;
    scene.add(pier);

    // Highway
    const highway = new THREE.Mesh(new THREE.BoxGeometry(100, 10, 3000), matAsphalt);
    highway.position.set(-1100, -3, 0);
    highway.receiveShadow = true;
    scene.add(highway);

    // ==========================================================
    // ZONE 2: LAGOON + GAS SPHERES + ADMIN (Central & Foreground)
    // Faithful to the aerial photograph — egg/teardrop shape
    // ==========================================================

    // --- Lagoon Shape Generator (faithful rounded-trapezoidal geometry) ---
    // Straight western edge parallel to the highway, rounded corners, straight top/bottom, curved eastern boundary
    function createLagoonShape(scale) {
        scale = scale || 1;
        const s = new THREE.Shape();
        // Start at bottom-left corner, just after the rounded corner
        s.moveTo(-220 * scale, -100 * scale);
        // Left edge (straight, parallel to the road / Y-axis)
        s.lineTo(-220 * scale, 100 * scale);
        // Top-left corner (rounded)
        s.quadraticCurveTo(-220 * scale, 140 * scale, -180 * scale, 140 * scale);
        // Top edge (straight)
        s.lineTo(160 * scale, 140 * scale);
        // Right edge (large smooth curve bulging east)
        s.bezierCurveTo(240 * scale, 140 * scale, 300 * scale, 90 * scale, 300 * scale, 0 * scale);
        s.bezierCurveTo(300 * scale, -90 * scale, 240 * scale, -140 * scale, 160 * scale, -140 * scale);
        // Bottom edge (straight)
        s.lineTo(-180 * scale, -140 * scale);
        // Bottom-left corner (rounded)
        s.quadraticCurveTo(-220 * scale, -140 * scale, -220 * scale, -100 * scale);
        return s;
    }

    // --- Perimeter access road (widest layer, concrete) ---
    const lagoonRoadGeo = new THREE.ExtrudeGeometry(createLagoonShape(1.18), {
        depth: 2, bevelEnabled: false
    });
    lagoonRoadGeo.rotateX(-Math.PI / 2);
    const lagoonRoad = new THREE.Mesh(lagoonRoadGeo, matConcrete);
    lagoonRoad.position.set(50, -1, 80);
    lagoonRoad.rotation.y = -Math.PI / 9; // ~-20° tilt SW→NE
    lagoonRoad.receiveShadow = true;
    scene.add(lagoonRoad);

    // --- Berm / containment dike (medium layer, asphalt) ---
    const bermGeo = new THREE.ExtrudeGeometry(createLagoonShape(1.08), {
        depth: 5, bevelEnabled: false
    });
    bermGeo.rotateX(-Math.PI / 2);
    const berm = new THREE.Mesh(bermGeo, matAsphalt);
    berm.position.set(50, -1, 80);
    berm.rotation.y = -Math.PI / 9;
    berm.receiveShadow = true;
    scene.add(berm);

    // --- Water surface (exact lagoon shape, dark reflective) ---
    const lagoonWaterGeo = new THREE.ExtrudeGeometry(createLagoonShape(1.0), {
        depth: 4, bevelEnabled: false
    });
    lagoonWaterGeo.rotateX(-Math.PI / 2);
    const lagoon = new THREE.Mesh(lagoonWaterGeo, matLagoon);
    lagoon.position.set(50, 0, 80);
    lagoon.rotation.y = -Math.PI / 9;
    lagoon.receiveShadow = true;
    scene.add(lagoon);

    // --- GAS SPHERES (Horton Spheres) ---
    // In the photo: 2 white spheres south of the lagoon
    // Multi-leg support structure (~12 slender columns) as in real installations
    function createGasSphere(x, z, r) {
        const group = new THREE.Group();
        // Multi-leg support ring (12 slender columns)
        const legCount = 12;
        for (let leg = 0; leg < legCount; leg++) {
            const angle = (leg / legCount) * Math.PI * 2;
            const lx = Math.cos(angle) * r * 0.55;
            const lz = Math.sin(angle) * r * 0.55;
            const support = new THREE.Mesh(
                new THREE.CylinderGeometry(1.2, 1.2, r * 1.4, 6),
                matDarkSteel
            );
            support.position.set(lx, (r * 1.4) / 2, lz);
            support.castShadow = true;
            group.add(support);
        }
        // Concrete base pad
        const pad = new THREE.Mesh(
            new THREE.CylinderGeometry(r * 0.75, r * 0.75, 3, 16),
            matConcrete
        );
        pad.position.set(0, 1.5, 0);
        pad.receiveShadow = true;
        group.add(pad);
        // The sphere itself
        const sphere = new THREE.Mesh(new THREE.SphereGeometry(r, 32, 32), matTankWhite);
        sphere.position.set(0, r * 1.4 + r * 0.15, 0);
        sphere.castShadow = true; sphere.receiveShadow = true;
        group.add(sphere);
        // Equatorial inspection band
        const eqBand = new THREE.Mesh(
            new THREE.TorusGeometry(r, 1.2, 8, 32),
            matDarkSteel
        );
        eqBand.rotation.x = Math.PI / 2;
        eqBand.position.set(0, r * 1.4 + r * 0.15, 0);
        group.add(eqBand);
        // Vertical discharge pipe (runs through center)
        const dischargePipe = new THREE.Mesh(
            new THREE.CylinderGeometry(1.5, 1.5, r * 1.4, 8),
            matPipe
        );
        dischargePipe.position.set(0, (r * 1.4) / 2, 0);
        group.add(dischargePipe);
        // Top vent pipe
        const ventPipe = new THREE.Mesh(
            new THREE.CylinderGeometry(0.8, 0.8, r * 0.6, 6),
            matPipe
        );
        ventPipe.position.set(0, r * 1.4 + r * 2 * 0.15 + r + r * 0.15, 0);
        group.add(ventPipe);

        group.position.set(x, 0, z);
        scene.add(group);
        return group;
    }

    // Placed south of the lagoon, slightly right of center (matching photo)
    createGasSphere(120, 300, 30);
    createGasSphere(250, 290, 26);

    // --- ADMIN BUILDINGS & PARKING (Foreground, south of lagoon) ---
    function createAdminBuilding(x, z, w, d, h) {
        h = h || 20;
        const bldg = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), matConcrete);
        bldg.position.set(x, h / 2, z);
        bldg.castShadow = true; bldg.receiveShadow = true;
        scene.add(bldg);
    }

    // Main warehouse / workshop (large, low building at bottom-left of photo)
    createAdminBuilding(-400, 600, 160, 80, 25);
    createAdminBuilding(-200, 650, 120, 60, 18);
    // Smaller office buildings
    createAdminBuilding(0, 700, 80, 40, 15);
    createAdminBuilding(100, 680, 60, 50, 12);
    // Parking lots (flat dark rectangles)
    const parking1 = new THREE.Mesh(new THREE.BoxGeometry(200, 2, 100), matAsphalt);
    parking1.position.set(-300, 1, 700);
    parking1.receiveShadow = true;
    scene.add(parking1);
    const parking2 = new THREE.Mesh(new THREE.BoxGeometry(150, 2, 80), matAsphalt);
    parking2.position.set(200, 1, 720);
    parking2.receiveShadow = true;
    scene.add(parking2);

    // --- INTERNAL ROADS (connecting zones) ---
    // Road from highway to lagoon (running east from highway)
    const roadToLagoon = new THREE.Mesh(new THREE.BoxGeometry(500, 2, 30), matAsphalt);
    roadToLagoon.position.set(-600, 0.5, 400);
    roadToLagoon.receiveShadow = true;
    scene.add(roadToLagoon);
    // Road south of lagoon (running east-west)
    const roadSouth = new THREE.Mesh(new THREE.BoxGeometry(800, 2, 25), matAsphalt);
    roadSouth.position.set(100, 0.5, 450);
    roadSouth.receiveShadow = true;
    scene.add(roadSouth);


    // ===================================================================
    // ZONE 1: PROCESS AREA (Left block, X: -1000 to -400)
    // HIGH-FIDELITY industrial architecture
    // ===================================================================

    // --- GENERATOR: Distillation Column ---
    // Creates a tall column with maintenance platform rings and a conical top
    function createDistillationColumn(x, z, radius, height) {
        const group = new THREE.Group();

        // Main column body
        const body = new THREE.Mesh(
            new THREE.CylinderGeometry(radius, radius, height, 24),
            matSteel
        );
        body.position.set(0, height / 2, 0);
        body.castShadow = true; body.receiveShadow = true;
        group.add(body);

        // Conical top cap
        const cap = new THREE.Mesh(
            new THREE.ConeGeometry(radius, radius * 1.5, 24),
            matSteel
        );
        cap.position.set(0, height + radius * 0.75, 0);
        cap.castShadow = true;
        group.add(cap);

        // Platform rings every ~40 units of height
        const platformCount = Math.floor(height / 40);
        for (let i = 1; i <= platformCount; i++) {
            const ringY = i * 40;
            const ring = new THREE.Mesh(
                new THREE.TorusGeometry(radius + 3, 1.5, 8, 24),
                matDarkSteel
            );
            ring.rotation.x = Math.PI / 2;
            ring.position.set(0, ringY, 0);
            group.add(ring);

            // Small handrail posts on each platform (4 posts)
            for (let p = 0; p < 4; p++) {
                const angle = (p / 4) * Math.PI * 2;
                const postX = Math.cos(angle) * (radius + 5);
                const postZ = Math.sin(angle) * (radius + 5);
                const post = new THREE.Mesh(
                    new THREE.CylinderGeometry(0.5, 0.5, 8, 4),
                    matDarkSteel
                );
                post.position.set(postX, ringY + 4, postZ);
                group.add(post);
            }
        }

        group.position.set(x, 0, z);
        scene.add(group);
        return group;
    }

    // --- GENERATOR: Auxiliary Tower (Stripper / Absorber) ---
    function createAuxTower(x, z, radius, height) {
        const body = new THREE.Mesh(
            new THREE.CylinderGeometry(radius, radius, height, 16),
            matSteel
        );
        body.position.set(x, height / 2, z);
        body.castShadow = true; body.receiveShadow = true;
        scene.add(body);

        // Dome top
        const dome = new THREE.Mesh(
            new THREE.SphereGeometry(radius, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2),
            matSteel
        );
        dome.position.set(x, height, z);
        dome.scale.set(1, 0.4, 1);
        scene.add(dome);
    }

    // --- GENERATOR: Furnace / Heat Exchanger ---
    function createFurnace(x, z, w, d) {
        const h = 30 + Math.random() * 20;
        const furnace = new THREE.Mesh(
            new THREE.BoxGeometry(w, h, d),
            matRustedSteel
        );
        furnace.position.set(x, h / 2, z);
        furnace.castShadow = true; furnace.receiveShadow = true;
        scene.add(furnace);

        // Small chimney on top
        const chimney = new THREE.Mesh(
            new THREE.CylinderGeometry(2, 3, 20, 8),
            matDarkSteel
        );
        chimney.position.set(x, h + 10, z);
        chimney.castShadow = true;
        scene.add(chimney);
    }

    // --- GENERATOR: Pipe Rack ---
    // Creates horizontal pipe runs on elevated supports
    function createPipeRack(startX, startZ, endX, endZ, height) {
        const dx = endX - startX;
        const dz = endZ - startZ;
        const length = Math.sqrt(dx * dx + dz * dz);
        const angle = Math.atan2(dz, dx);
        const midX = (startX + endX) / 2;
        const midZ = (startZ + endZ) / 2;

        // Support columns along the rack
        const supportCount = Math.max(2, Math.floor(length / 60));
        for (let i = 0; i <= supportCount; i++) {
            const t = i / supportCount;
            const sx = startX + dx * t;
            const sz = startZ + dz * t;

            // Vertical support
            const support = new THREE.Mesh(
                new THREE.BoxGeometry(4, height, 4),
                matDarkSteel
            );
            support.position.set(sx, height / 2, sz);
            support.castShadow = true;
            scene.add(support);

            // Cross beam
            const beam = new THREE.Mesh(
                new THREE.BoxGeometry(20, 3, 3),
                matDarkSteel
            );
            beam.position.set(sx, height, sz);
            beam.rotation.y = angle;
            scene.add(beam);
        }

        // Multiple pipes running along the rack
        const pipeCount = 3 + Math.floor(Math.random() * 4);
        for (let p = 0; p < pipeCount; p++) {
            const offsetY = height + 2 + p * 3;
            const pipe = new THREE.Mesh(
                new THREE.CylinderGeometry(1.5, 1.5, length, 8),
                matPipe
            );
            pipe.position.set(midX, offsetY, midZ);
            pipe.rotation.z = Math.PI / 2;
            pipe.rotation.y = angle;
            scene.add(pipe);
        }
    }

    // --- GENERATOR: Flare Stack ---
    function createFlareStack(x, z, height) {
        // Tall thin stack
        const stack = new THREE.Mesh(
            new THREE.CylinderGeometry(3, 5, height, 8),
            matSteel
        );
        stack.position.set(x, height / 2, z);
        stack.castShadow = true;
        scene.add(stack);

        // Support lattice (3 diagonal braces)
        for (let i = 0; i < 3; i++) {
            const angle = (i / 3) * Math.PI * 2;
            const bx = Math.cos(angle) * 15;
            const bz = Math.sin(angle) * 15;

            const braceGeo = new THREE.BufferGeometry().setFromPoints([
                new THREE.Vector3(x + bx, 0, z + bz),
                new THREE.Vector3(x, height * 0.8, z)
            ]);
            const brace = new THREE.Line(braceGeo, matScaffoldLine);
            scene.add(brace);
        }

        // Fire tip (small glowing sphere)
        const fire = new THREE.Mesh(
            new THREE.SphereGeometry(5, 8, 8),
            new THREE.MeshBasicMaterial({ color: 0xff6600 })
        );
        fire.position.set(x, height + 3, z);
        scene.add(fire);

        // Fire light
        const fireLight = new THREE.PointLight(0xff6600, 0.8, 200);
        fireLight.position.set(x, height + 5, z);
        scene.add(fireLight);
    }

    // --- BUILD ZONE 1: PROCESS AREA (COMPACTED DESIGN) ---
    // Compacted rows parallel to the highway with tighter spacing (100 units instead of 150)
    // to match a realistic dense industrial complex structure layout.

    // ROW A: Main Distillation Units (tallest structures, closest to highway)
    createDistillationColumn(-850, -200, 18, 280);
    createDistillationColumn(-850, -100, 15, 220);
    createDistillationColumn(-850, 0, 20, 300);
    createDistillationColumn(-850, 100, 16, 250);

    // Auxiliary towers flanking the main columns
    createAuxTower(-830, -160, 8, 120);
    createAuxTower(-830, -50, 10, 140);
    createAuxTower(-830, 40, 7, 100);
    createAuxTower(-830, 130, 9, 130);
    createAuxTower(-875, -130, 6, 90);
    createAuxTower(-875, 60, 8, 110);

    // ROW B: Secondary processing (FCC, Reformer)
    createDistillationColumn(-750, -180, 22, 240);
    createDistillationColumn(-750, -70, 18, 200);
    createDistillationColumn(-750, 40, 20, 260);
    createDistillationColumn(-750, 130, 15, 180);

    createAuxTower(-730, -130, 10, 150);
    createAuxTower(-730, -20, 8, 120);
    createAuxTower(-730, 90, 12, 160);
    createAuxTower(-775, -120, 7, 100);
    createAuxTower(-775, 25, 9, 130);

    // ROW C: Tertiary processing (Alquilación, BTX)
    createDistillationColumn(-650, -160, 14, 180);
    createDistillationColumn(-650, -60, 16, 200);
    createDistillationColumn(-650, 30, 12, 160);
    createDistillationColumn(-650, 110, 18, 220);

    createAuxTower(-630, -110, 8, 110);
    createAuxTower(-630, -15, 6, 90);
    createAuxTower(-630, 75, 10, 140);
    createAuxTower(-670, -200, 7, 100);

    // FURNACES & HEAT EXCHANGERS (scattered at the base of the process rows)
    createFurnace(-800, -240, 50, 30);
    createFurnace(-780, -260, 40, 25);
    createFurnace(-720, -240, 60, 35);
    createFurnace(-680, -265, 45, 28);
    createFurnace(-800, 180, 55, 30);
    createFurnace(-740, 195, 40, 25);
    createFurnace(-650, 180, 50, 30);

    // PIPE RACKS (connecting the rows with exact alignment)
    createPipeRack(-850, -200, -750, -180, 40);
    createPipeRack(-750, -180, -650, -160, 40);
    createPipeRack(-850, 0, -750, 40, 35);
    createPipeRack(-750, 40, -650, 30, 35);
    createPipeRack(-850, 100, -750, 130, 30);
    createPipeRack(-750, 130, -650, 110, 30);

    // Cross-connections (perpendicular pipe racks running along the columns)
    createPipeRack(-850, -200, -850, 100, 45);
    createPipeRack(-750, -180, -750, 130, 40);
    createPipeRack(-650, -160, -650, 110, 35);

    // FLARE STACKS (2 tall ones at the outer edge of the process zone)
    createFlareStack(-900, -260, 350);
    createFlareStack(-900, 200, 300);

    // Dense ground-level industrial clutter between the rows
    for (let i = 0; i < 45; i++) {
        const w = 8 + Math.random() * 20;
        const h = 5 + Math.random() * 15;
        const d = 8 + Math.random() * 20;
        const block = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), matDarkSteel);
        block.position.set(
            -900 + Math.random() * 320,
            h / 2,
            -250 + Math.random() * 450
        );
        block.castShadow = true; block.receiveShadow = true;
        scene.add(block);
    }




    // ===================================================================
    // ZONE 3: TANK FARM (Right / coastal, organized rows)
    // Faithful to aerial photo: deliberate clusters along the coast
    // ===================================================================
    function createWhiteTank(x, z, r, h, isRojaRojita = false) {
        const tank = new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, 32), matTankWhite);
        tank.position.set(x, h / 2, z);
        tank.castShadow = true; tank.receiveShadow = true;
        scene.add(tank);

        const dome = new THREE.Mesh(
            new THREE.SphereGeometry(r, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2),
            matTankWhite
        );
        dome.position.set(x, h, z);
        dome.scale.set(1, 0.2, 1);
        dome.castShadow = true;
        scene.add(dome);

        if (isRojaRojita) {
            const band = new THREE.Mesh(
                new THREE.CylinderGeometry(r + 0.5, r + 0.5, h * 0.25, 32),
                matTankRed
            );
            band.position.set(x, h / 2, z);
            scene.add(band);
        }
    }

    // Dark crude tank (visible in photo — dark grey/black roofs)
    const matTankDark = new THREE.MeshStandardMaterial({ color: 0x2a2a2a, roughness: 0.8, metalness: 0.15 });
    function createDarkTank(x, z, r, h) {
        const tank = new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, 32), matTankDark);
        tank.position.set(x, h / 2, z);
        tank.castShadow = true; tank.receiveShadow = true;
        scene.add(tank);
        const roof = new THREE.Mesh(
            new THREE.CylinderGeometry(r, r, 2, 32),
            matDarkSteel
        );
        roof.position.set(x, h, z);
        scene.add(roof);
    }

    // Roja Rojita — massive anchor tank (southeast of lagoon)
    createWhiteTank(750, 200, 80, 60, true);

    // --- Coastal tank row (large tanks along the northern coastline) ---
    createWhiteTank(500, -500, 55, 45);
    createWhiteTank(620, -480, 60, 50);
    createWhiteTank(750, -450, 55, 45);
    createWhiteTank(880, -430, 50, 40);
    createWhiteTank(1000, -400, 55, 45);

    // --- Second row (medium tanks, inland from coast) ---
    createWhiteTank(520, -350, 45, 35);
    createWhiteTank(640, -330, 50, 40);
    createWhiteTank(770, -310, 45, 38);
    createWhiteTank(900, -290, 40, 35);

    // --- Third row (mixed, closer to lagoon) ---
    createWhiteTank(550, -180, 40, 32);
    createWhiteTank(660, -160, 35, 30);
    createWhiteTank(780, -140, 45, 35);

    // --- Dark crude oil tanks (2 visible in the photo) ---
    createDarkTank(500, -80, 50, 40);
    createDarkTank(630, -40, 45, 38);

    // --- Small product tanks near the Roja Rojita ---
    createWhiteTank(850, 50, 30, 25);
    createWhiteTank(920, 100, 35, 28);
    createWhiteTank(850, 180, 28, 22);

    // --- Containment berms between tank clusters ---
    for (let row = 0; row < 3; row++) {
        const bermWall = new THREE.Mesh(
            new THREE.BoxGeometry(550, 4, 3),
            matConcrete
        );
        bermWall.position.set(720, 2, -460 + row * 160);
        bermWall.receiveShadow = true;
        scene.add(bermWall);
    }
    // Perpendicular containment walls
    for (let col = 0; col < 4; col++) {
        const bermCol = new THREE.Mesh(
            new THREE.BoxGeometry(3, 4, 450),
            matConcrete
        );
        bermCol.position.set(500 + col * 160, 2, -280);
        bermCol.receiveShadow = true;
        scene.add(bermCol);
    }


    // ===================================================================
    // ZONE 5: PLANTA CENTRO (Distant Background)
    // ===================================================================
    function createPlantaCentroChimney(x, z) {
        const h = 500;
        const stack = new THREE.Mesh(new THREE.CylinderGeometry(15, 25, h, 16), matTankWhite);
        stack.position.set(x, h / 2, z);
        stack.castShadow = true;
        scene.add(stack);
        for (let i = 0; i < 2; i++) {
            const stripe = new THREE.Mesh(
                new THREE.CylinderGeometry(15 + (i * 0.5), 16 + (i * 0.5), 20, 16),
                matTankRed
            );
            stripe.position.set(x, h - 20 - (i * 50), z);
            scene.add(stripe);
        }
    }
    createPlantaCentroChimney(-900, -1400);
    createPlantaCentroChimney(-820, -1400);
    createPlantaCentroChimney(-740, -1400);


    // ===================================================================
    // PARTICLES: SMOKE SYSTEM
    // ===================================================================
    const canvas = document.createElement('canvas');
    canvas.width = 32; canvas.height = 32;
    const context = canvas.getContext('2d');
    const gradient = context.createRadialGradient(16, 16, 0, 16, 16, 16);
    gradient.addColorStop(0, 'rgba(255,255,255,1)');
    gradient.addColorStop(1, 'rgba(255,255,255,0)');
    context.fillStyle = gradient;
    context.fillRect(0, 0, 32, 32);
    const particleTexture = new THREE.CanvasTexture(canvas);

    const particleCount = 500;
    const smokeGeo = new THREE.BufferGeometry();
    const smokePos = new Float32Array(particleCount * 3);
    const smokeVelocities = [];

    for (let i = 0; i < particleCount; i++) {
        smokePos[i * 3] = 0; smokePos[i * 3 + 1] = -1000; smokePos[i * 3 + 2] = 0;
        smokeVelocities.push({
            x: (Math.random() - 0.5) * 2.0,
            y: 3 + Math.random() * 4,
            z: (Math.random() - 0.5) * 2.0,
            life: Math.random() * 100
        });
    }
    smokeGeo.setAttribute('position', new THREE.BufferAttribute(smokePos, 3));

    const smokeMat = new THREE.PointsMaterial({
        size: 30,
        map: particleTexture,
        color: 0xeeeeee,
        transparent: true,
        opacity: 0.18,
        depthWrite: false,
        blending: THREE.NormalBlending
    });
    const smokeSystem = new THREE.Points(smokeGeo, smokeMat);
    scene.add(smokeSystem);

    const emitters = [
        { x: -900, y: 500, z: -1400 }, // Planta Centro
        { x: -820, y: 500, z: -1400 },
        { x: -740, y: 500, z: -1400 },
        { x: -900, y: 350, z: -260 }, // Flare stack 1 (Updated to match compact stack pos)
        { x: -900, y: 300, z: 200 },  // Flare stack 2 (Updated to match compact stack pos)
        { x: -750, y: 240, z: -70 },  // FCC area (Updated to match compact FCC column pos)
    ];

    function updateSmoke() {
        const positions = smokeGeo.attributes.position.array;
        for (let i = 0; i < particleCount; i++) {
            let v = smokeVelocities[i];
            v.life -= 1;
            if (v.life <= 0) {
                let em = emitters[Math.floor(Math.random() * emitters.length)];
                positions[i * 3] = em.x;
                positions[i * 3 + 1] = em.y;
                positions[i * 3 + 2] = em.z;
                v.life = 100 + Math.random() * 50;
                v.x = (Math.random() - 0.5) * 2;
                v.y = 3 + Math.random() * 4;
                v.z = (Math.random() - 0.5) * 2;
            } else {
                positions[i * 3] += v.x;
                positions[i * 3 + 1] += v.y;
                positions[i * 3 + 2] += v.z;
                v.x += 0.08; // Wind
            }
        }
        smokeGeo.attributes.position.needsUpdate = true;
    }


    // Restore original scene.add
    scene.add = originalSceneAdd;

    // --- SCROLL PARALLAX LOGIC ---
    let isInteracting = false;
    let autoRealignmentTimeout;

    controls.addEventListener('start', () => {
        isInteracting = true;
        clearTimeout(autoRealignmentTimeout);
    });
    controls.addEventListener('end', () => {
        autoRealignmentTimeout = setTimeout(() => {
            isInteracting = false;
        }, 2500);
    });

    let targetRotationY = 0;

    const scrollHandler = () => {
        if (!container || !container.isConnected) {
            window.removeEventListener('scroll', scrollHandler);
            window.removeEventListener('resize', resizeHandler);
            return;
        }
        const rect = container.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        if (rect.bottom > 0 && rect.top < viewportHeight) {
            const totalScrollHeight = viewportHeight + rect.height;
            const scrollProgress = (viewportHeight - rect.top) / totalScrollHeight;
            targetRotationY = (scrollProgress - 0.5) * 0.5;
        }
    };
    window.addEventListener('scroll', scrollHandler);

    // --- ANIMATION LOOP ---
    function animate() {
        if (!container || !container.isConnected) {
            renderer.dispose();
            if (controls) controls.dispose();
            return;
        }
        requestAnimationFrame(animate);
        
        // Return refinery model to scroll-linked rotation smoothly
        if (!isInteracting) {
            refineryGroup.rotation.y = THREE.MathUtils.lerp(refineryGroup.rotation.y, targetRotationY, 0.05);
        }
        
        controls.update(); // Update OrbitControls dampings
        updateSmoke();
        renderer.render(scene, camera);
    }
    animate();

    // --- RESIZE HANDLER ---
    const resizeHandler = () => {
        if (!container || !container.isConnected) {
            window.removeEventListener('scroll', scrollHandler);
            window.removeEventListener('resize', resizeHandler);
            return;
        }
        const w = container.clientWidth;
        const h = container.clientHeight;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
    };
    window.addEventListener('resize', resizeHandler);

    return { controls, camera };
};
