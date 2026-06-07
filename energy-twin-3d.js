window.initEnergy3D = function(container) {
    console.log("🚀 Iniciando Motor 3D de Energías (Gemelo Red Eólica/Solar)...");
    if (!container) return;

    // --- SCENE SETUP ---
    const scene = new THREE.Scene();

    // --- CAMERA ---
    const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 1, 4000);
    camera.position.set(-450, 320, 500);

    // --- RENDERER ---
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    // --- ORBIT CONTROLS ---
    const controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.screenSpacePanning = false;
    controls.minDistance = 150;
    controls.maxDistance = 1500;
    controls.maxPolarAngle = Math.PI / 2 - 0.05;
    controls.target.set(0, 40, 0);
    controls.update();

    // --- LIGHTING ---
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0x00f2fe, 1.2); // Glowing cyan directional light
    sunLight.position.set(-300, 600, 300);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 1024;
    sunLight.shadow.mapSize.height = 1024;
    scene.add(sunLight);

    const purpleLight = new THREE.DirectionalLight(0xa855f7, 0.6); // Purple ambient accent
    purpleLight.position.set(300, 300, -300);
    scene.add(purpleLight);

    // --- INTERCEPT ADD FOR GROUP ROTATION ---
    const energyGroup = new THREE.Group();
    scene.add(energyGroup);
    const originalSceneAdd = scene.add;
    scene.add = function(obj) {
        if (obj.isLight) {
            originalSceneAdd.call(scene, obj);
        } else {
            energyGroup.add(obj);
        }
    };

    // --- MATERIALS (Holographic Green / Purple Theme) ---
    const matHill = new THREE.MeshStandardMaterial({ 
        color: 0x111827, // Dark slate
        roughness: 0.8,
        metalness: 0.1 
    });
    const matSteel = new THREE.MeshStandardMaterial({ 
        color: 0x1e293b, 
        roughness: 0.3, 
        metalness: 0.8,
        emissive: 0x00f2fe,
        emissiveIntensity: 0.1
    });
    const matSubstation = new THREE.MeshStandardMaterial({
        color: 0x0f172a,
        roughness: 0.5,
        metalness: 0.7
    });
    const matPanelSurface = new THREE.MeshStandardMaterial({
        color: 0x0369a1, // Deep blue solar cells
        roughness: 0.15,
        metalness: 0.9,
        emissive: 0x00f2fe,
        emissiveIntensity: 0.1
    });
    const matWireLine = new THREE.LineBasicMaterial({ color: 0xa855f7, transparent: true, opacity: 0.6 });
    const matSensorCyan = new THREE.MeshBasicMaterial({ color: 0x00f2fe });

    // --- GEOMETRY BUILDER ---

    // 1. Terrain Base (Lomas costeras isométricas)
    const baseGeo = new THREE.BoxGeometry(500, 6, 400);
    const baseMesh = new THREE.Mesh(baseGeo, matHill);
    baseMesh.position.set(0, -3, 0);
    baseMesh.receiveShadow = true;
    scene.add(baseMesh);

    // Dotted grid overlay
    const gridHelper = new THREE.GridHelper(480, 24, 0xa855f7, 0x374151);
    gridHelper.position.set(0, 0.5, 0);
    gridHelper.material.transparent = true;
    gridHelper.material.opacity = 0.12;
    scene.add(gridHelper);

    // 2. Wind Turbines (Aerogeneradores)
    const turbines = [];

    function createWindTurbine(x, z, sizeScale) {
        const tGroup = new THREE.Group();

        // Tower
        const height = 150 * sizeScale;
        const tower = new THREE.Mesh(new THREE.CylinderGeometry(2, 5, height, 8), matSteel);
        tower.position.y = height / 2;
        tower.castShadow = true;
        tGroup.add(tower);

        // Nacelle (Cabeza de turbina)
        const nacelle = new THREE.Mesh(new THREE.BoxGeometry(10, 8, 22), matSteel);
        nacelle.position.y = height;
        nacelle.position.z = 4;
        nacelle.castShadow = true;
        tGroup.add(nacelle);

        // Rotor Hub (Spinner)
        const hub = new THREE.Mesh(new THREE.CylinderGeometry(3, 3, 5, 8), matSteel);
        hub.rotation.x = Math.PI / 2;
        hub.position.set(0, height, 13);
        tGroup.add(hub);

        // Rotor Blades (3 blades, 120 degrees apart)
        const bladesGroup = new THREE.Group();
        bladesGroup.position.set(0, height, 14.5);
        
        const bladeLength = 70 * sizeScale;
        const bladeGeo = new THREE.BoxGeometry(2, bladeLength, 0.5);
        bladeGeo.translate(0, bladeLength / 2, 0); // Rotate around base

        for (let i = 0; i < 3; i++) {
            const blade = new THREE.Mesh(bladeGeo, matSteel);
            blade.rotation.z = (i / 3) * Math.PI * 2;
            bladesGroup.add(blade);
        }
        tGroup.add(bladesGroup);

        tGroup.position.set(x, 0, z);
        scene.add(tGroup);

        turbines.push({
            blades: bladesGroup,
            speed: 0.02 + Math.random() * 0.02
        });
    }

    // Place 3 wind turbines in the background/elevated zones
    createWindTurbine(-160, -90, 0.95);
    createWindTurbine(0, -110, 1.1);
    createWindTurbine(160, -80, 1.0);

    // 3. Solar Panel Arrays (Paneles Solares)
    function createSolarPanelRow(startX, startZ, count) {
        const rowGroup = new THREE.Group();

        for (let i = 0; i < count; i++) {
            const panelGroup = new THREE.Group();
            
            // Stand column
            const stand = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 12, 6), matSteel);
            stand.position.y = 6;
            panelGroup.add(stand);

            // Blue Solar Module
            const plate = new THREE.Mesh(new THREE.BoxGeometry(24, 2, 14), matPanelSurface);
            plate.position.y = 12;
            plate.rotation.x = Math.PI / 6; // Angled facing the sun
            plate.castShadow = true;
            panelGroup.add(plate);

            panelGroup.position.set(i * 35, 0, 0);
            rowGroup.add(panelGroup);
        }

        rowGroup.position.set(startX, 0, startZ);
        scene.add(rowGroup);
    }

    // Two rows of solar panels in the foreground
    createSolarPanelRow(-150, 60, 4);
    createSolarPanelRow(-110, 120, 4);

    // 4. Central Power Substation (Subestación y Transformadores)
    const subGroup = new THREE.Group();
    
    // Main building
    const bldg = new THREE.Mesh(new THREE.BoxGeometry(60, 24, 45), matSubstation);
    bldg.position.y = 12;
    bldg.castShadow = true;
    subGroup.add(bldg);

    // Main battery bank panels (glowing green/cyan stripes)
    const stripeMat = new THREE.MeshBasicMaterial({ color: 0x00f2fe });
    for (let s = 0; s < 3; s++) {
        const stripe = new THREE.Mesh(new THREE.BoxGeometry(2, 12, 35), stripeMat);
        stripe.position.set(29 + s * 0.5, 10, -10 + s * 10);
        subGroup.add(stripe);
    }

    // Cooling radiator blocks
    const rad = new THREE.Mesh(new THREE.BoxGeometry(20, 16, 25), matSteel);
    rad.position.set(-42, 8, 5);
    subGroup.add(rad);

    subGroup.position.set(120, 0, 60);
    scene.add(subGroup);

    // 5. Grid Connections (Lineas de corriente hacia la subestación)
    function createCableWire(x1, z1, x2, z2) {
        const p1 = new THREE.Vector3(x1, 10, z1);
        const p2 = new THREE.Vector3(x2, 10, z2);
        
        // Sagging catenary cable
        const mid = new THREE.Vector3((x1+x2)/2, 2, (z1+z2)/2);
        const curve = new THREE.CatmullRomCurve3([p1, mid, p2]);
        const curvePoints = curve.getPoints(20);
        
        const wireGeo = new THREE.BufferGeometry().setFromPoints(curvePoints);
        const wire = new THREE.Line(wireGeo, matWireLine);
        scene.add(wire);
        
        return curve;
    }

    const gridLines = [
        createCableWire(-160, -90, 120, 60),  // Turbine 1 to Substation
        createCableWire(0, -110, 120, 60),    // Turbine 2 to Substation
        createCableWire(160, -80, 120, 60),   // Turbine 3 to Substation
        createCableWire(-150, 60, 120, 60),   // Solar Row 1 to Substation
    ];

    // Restore original scene.add
    scene.add = originalSceneAdd;

    // --- GRID CURRENT EFFECT (PARTICLES FLOW) ---
    const particles = [];
    gridLines.forEach(lineCurve => {
        for (let i = 0; i < 4; i++) {
            const pMesh = new THREE.Mesh(new THREE.SphereGeometry(2.2, 8, 8), matSensorCyan);
            scene.add(pMesh);
            particles.push({
                mesh: pMesh,
                curve: lineCurve,
                progress: Math.random(),
                speed: 0.003 + Math.random() * 0.004
            });
        }
    });

    function updateGridParticles() {
        particles.forEach(p => {
            p.progress += p.speed;
            if (p.progress >= 1) p.progress = 0;
            const pos = p.curve.getPointAt(p.progress);
            p.mesh.position.copy(pos);
        });
    }

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

        // Return group to scroll-linked rotation smoothly if user is not dragging
        if (!isInteracting) {
            energyGroup.rotation.y = THREE.MathUtils.lerp(energyGroup.rotation.y, targetRotationY, 0.05);
        }

        // Rotate turbine blades
        turbines.forEach(t => {
            t.blades.rotation.z += t.speed;
        });

        // Pulsing indicators and flows
        updateGridParticles();

        controls.update();
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
