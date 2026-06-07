window.initSeparator3D = function(container) {
    console.log("🚀 Iniciando Motor 3D Químico (Gemelo Separador de 3 Fases)...");
    if (!container) return;

    // --- SCENE SETUP ---
    const scene = new THREE.Scene();

    // --- CAMERA ---
    const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 1, 4000);
    camera.position.set(-400, 300, 450);

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
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.65);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xffffff, 1.0); // Warm sun
    sunLight.position.set(-200, 500, 200);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 1024;
    sunLight.shadow.mapSize.height = 1024;
    scene.add(sunLight);

    const purpleLight = new THREE.DirectionalLight(0xa855f7, 0.5); // Back purple accent
    purpleLight.position.set(200, 300, -200);
    scene.add(purpleLight);

    // --- INTERCEPT ADD FOR GROUP ROTATION ---
    const separatorGroup = new THREE.Group();
    scene.add(separatorGroup);
    const originalSceneAdd = scene.add;
    scene.add = function(obj) {
        if (obj.isLight) {
            originalSceneAdd.call(scene, obj);
        } else {
            separatorGroup.add(obj);
        }
    };

    // --- MATERIALS (Industrial High-Tech / Glass Theme) ---
    const matSteel = new THREE.MeshStandardMaterial({ 
        color: 0x888888, 
        roughness: 0.35, 
        metalness: 0.8 
    });
    const matDarkSteel = new THREE.MeshStandardMaterial({ 
        color: 0x333333, 
        roughness: 0.5, 
        metalness: 0.7 
    });
    const matBronze = new THREE.MeshStandardMaterial({
        color: 0xb45309,
        roughness: 0.4,
        metalness: 0.8
    });
    const matGlassShell = new THREE.MeshPhysicalMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.22,
        roughness: 0.1,
        metalness: 0.1,
        transmission: 0.9,
        ior: 1.5,
        side: THREE.DoubleSide,
        depthWrite: false
    });
    const matWater = new THREE.MeshStandardMaterial({
        color: 0x0284c7, // Sky Blue
        transparent: true,
        opacity: 0.7,
        roughness: 0.2,
        metalness: 0.1
    });
    const matOil = new THREE.MeshStandardMaterial({
        color: 0xd97706, // Golden Amber
        transparent: true,
        opacity: 0.75,
        roughness: 0.1,
        metalness: 0.2
    });
    const matMistPad = new THREE.MeshStandardMaterial({
        color: 0xaaaaaa,
        wireframe: true
    });
    
    // Status indicators
    const matGlowCyan = new THREE.MeshBasicMaterial({ color: 0x00f2fe });
    const matGlowRed = new THREE.MeshBasicMaterial({ color: 0xef4444 });

    // --- GEOMETRY BUILDER (3-Phase Separator) ---

    // 1. Saddles / Supports (Soportes metálicos de base)
    const saddleGeo = new THREE.BoxGeometry(20, 25, 120);
    const saddle1 = new THREE.Mesh(saddleGeo, matDarkSteel);
    saddle1.position.set(-100, 12.5, 0);
    scene.add(saddle1);

    const saddle2 = new THREE.Mesh(saddleGeo, matDarkSteel);
    saddle2.position.set(100, 12.5, 0);
    scene.add(saddle2);

    // Concrete base pad
    const pad = new THREE.Mesh(new THREE.BoxGeometry(320, 4, 150), matDarkSteel);
    pad.position.set(0, -2, 0);
    scene.add(pad);

    // 2. Main Vessel Cylinder (Tanque horizontal)
    const vesselRadius = 55;
    const vesselLength = 240;

    // Outer Glass Cylinder (Showcasing the inner separation process)
    const shellGeo = new THREE.CylinderGeometry(vesselRadius, vesselRadius, vesselLength, 32, 1, true);
    shellGeo.rotateZ(Math.PI / 2);
    const shell = new THREE.Mesh(shellGeo, matGlassShell);
    shell.position.set(0, 80, 0);
    scene.add(shell);

    // End Caps (Semi-spheres on left and right ends)
    const capLeftGeo = new THREE.SphereGeometry(vesselRadius, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2);
    capLeftGeo.rotateZ(Math.PI / 2);
    const capLeft = new THREE.Mesh(capLeftGeo, matSteel);
    capLeft.position.set(-vesselLength/2, 80, 0);
    scene.add(capLeft);

    const capRightGeo = new THREE.SphereGeometry(vesselRadius, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2);
    capRightGeo.rotateZ(-Math.PI / 2);
    const capRight = new THREE.Mesh(capRightGeo, matSteel);
    capRight.position.set(vesselLength/2, 80, 0);
    scene.add(capRight);

    // 3. Internal Parts (Weir / Vertedero divider)
    // Vertical weir separating oil settling chamber on the right
    const weirHeight = 35;
    const weirGeo = new THREE.BoxGeometry(4, weirHeight, vesselRadius * 1.8);
    const weir = new THREE.Mesh(weirGeo, matSteel);
    weir.position.set(40, 80 - vesselRadius + weirHeight/2 + 2, 0);
    scene.add(weir);

    // 4. Fluids (Water and Oil phases inside)
    // Left Chamber - Water Phase (Bottom layer, X: -vesselLength/2 to 40)
    const waterLength = vesselLength/2 + 40;
    const waterHeight = 22;
    const waterGeo = new THREE.BoxGeometry(waterLength, waterHeight, vesselRadius * 1.75);
    const waterMesh = new THREE.Mesh(waterGeo, matWater);
    waterMesh.position.set(-vesselLength/4 + 20, 80 - vesselRadius + waterHeight/2 + 1, 0);
    scene.add(waterMesh);

    // Left Chamber - Oil Phase (Top layer sitting on water, X: -vesselLength/2 to 40)
    const oilHeightLeft = 16;
    const oilGeoLeft = new THREE.BoxGeometry(waterLength, oilHeightLeft, vesselRadius * 1.72);
    const oilMeshLeft = new THREE.Mesh(oilGeoLeft, matOil);
    oilMeshLeft.position.set(-vesselLength/4 + 20, 80 - vesselRadius + waterHeight + oilHeightLeft/2 + 1, 0);
    scene.add(oilMeshLeft);

    // Right Chamber - Oil Settling Basin (Only oil, X: 40 to vesselLength/2)
    const oilLengthRight = vesselLength/2 - 40;
    const oilHeightRight = 24; // Weir overflows, so height is lower than weir height
    const oilGeoRight = new THREE.BoxGeometry(oilLengthRight, oilHeightRight, vesselRadius * 1.75);
    const oilMeshRight = new THREE.Mesh(oilGeoRight, matOil);
    oilMeshRight.position.set(vesselLength/4 + 20, 80 - vesselRadius + oilHeightRight/2 + 1, 0);
    scene.add(oilMeshRight);

    // 5. Anti-Mist Pad (Almohadilla anti-niebla at top right)
    const mistGeo = new THREE.BoxGeometry(35, 20, vesselRadius * 1.5);
    const mistPad = new THREE.Mesh(mistGeo, matMistPad);
    mistPad.position.set(90, 110, 0);
    scene.add(mistPad);

    // 6. PIPING SYSTEM (P&ID Entradas y Salidas)
    // Inlet Pipe (Left top - Entrada de 3 fases)
    const inletPipe1 = new THREE.Mesh(new THREE.CylinderGeometry(8, 8, 50, 16), matSteel);
    inletPipe1.position.set(-90, 145, 0);
    scene.add(inletPipe1);
    
    const inletPipe2 = new THREE.Mesh(new THREE.CylinderGeometry(8, 8, 120, 16), matSteel);
    inletPipe2.rotation.z = Math.PI / 2;
    inletPipe2.position.set(-150, 170, 0);
    scene.add(inletPipe2);

    // Gas Outlet Pipe (Top right - Salida de Vapor)
    const gasPipe1 = new THREE.Mesh(new THREE.CylinderGeometry(6, 6, 40, 16), matSteel);
    gasPipe1.position.set(90, 145, 0);
    scene.add(gasPipe1);

    const gasPipe2 = new THREE.Mesh(new THREE.CylinderGeometry(6, 6, 80, 16), matSteel);
    gasPipe2.rotation.z = Math.PI / 2;
    gasPipe2.position.set(130, 165, 0);
    scene.add(gasPipe2);

    // Water Outlet Pipe (Bottom left - Salida de Agua)
    const waterOutPipe1 = new THREE.Mesh(new THREE.CylinderGeometry(6, 6, 60, 16), matSteel);
    waterOutPipe1.position.set(-80, 5, 0);
    scene.add(waterOutPipe1);

    const waterOutPipe2 = new THREE.Mesh(new THREE.CylinderGeometry(6, 6, 120, 16), matSteel);
    waterOutPipe2.rotation.z = Math.PI / 2;
    waterOutPipe2.position.set(-140, -25, 0);
    scene.add(waterOutPipe2);

    // Oil Outlet Pipe (Bottom right - Salida de Aceite)
    const oilOutPipe1 = new THREE.Mesh(new THREE.CylinderGeometry(6, 6, 60, 16), matSteel);
    oilOutPipe1.position.set(90, 5, 0);
    scene.add(oilOutPipe1);

    const oilOutPipe2 = new THREE.Mesh(new THREE.CylinderGeometry(6, 6, 100, 16), matSteel);
    oilOutPipe2.rotation.z = Math.PI / 2;
    oilOutPipe2.position.set(140, -25, 0);
    scene.add(oilOutPipe2);

    // 7. VALVES & INSTRUMENTS (Válvulas LV, Transmisores LT, LC)
    function createControlValve(x, y, z, colorHex) {
        const group = new THREE.Group();
        // Valve Body (Flanges & Spherical gate)
        const flange = new THREE.Mesh(new THREE.SphereGeometry(12, 16, 16), matDarkSteel);
        group.add(flange);
        
        // Actuator neck
        const neck = new THREE.Mesh(new THREE.CylinderGeometry(3, 3, 16, 8), matSteel);
        neck.position.y = 10;
        group.add(neck);

        // Diaphragm Top (Champiñón de válvula de control)
        const top = new THREE.Mesh(new THREE.CylinderGeometry(14, 14, 6, 16), new THREE.MeshStandardMaterial({ color: colorHex }));
        top.position.y = 18;
        group.add(top);

        group.position.set(x, y, z);
        scene.add(group);
        return group;
    }

    createControlValve(-80, -10, 0, 0xef4444); // Water control valve (LV) - Red
    createControlValve(90, -10, 0, 0xd97706);  // Oil control valve (LV) - Amber

    // Level transmitter indicators (LT / LC circles floating near pipes)
    function createTransmitterDial(x, y, z, label) {
        const dial = new THREE.Mesh(new THREE.CylinderGeometry(10, 10, 4, 16), matBronze);
        dial.rotation.x = Math.PI / 2;
        dial.position.set(x, y, z);
        scene.add(dial);

        const face = new THREE.Mesh(new THREE.CylinderGeometry(8, 8, 1, 16), new THREE.MeshBasicMaterial({ color: 0xeeeeee }));
        face.rotation.x = Math.PI / 2;
        face.position.set(x, y + 2, z);
        scene.add(face);
        
        // Glowing status bulb on dial
        const bulb = new THREE.Mesh(new THREE.SphereGeometry(1.5, 8, 8), matGlowCyan);
        bulb.position.set(x + 5, y + 2.5, z);
        scene.add(bulb);
    }
    createTransmitterDial(-140, 60, 0); // LC Dial left
    createTransmitterDial(140, 60, 0);  // LT Dial right

    // Restore original scene.add
    scene.add = originalSceneAdd;

    // --- PIPELINE PARTICLE EFFECTS (FLOW SIMULATOR) ---
    // Tiny glowing sphere particles to represent liquid flow
    const particles = [];
    const particleCount = 25;
    
    for (let i = 0; i < particleCount; i++) {
        const geo = new THREE.SphereGeometry(1.8, 8, 8);
        const isWater = Math.random() > 0.5;
        const mat = new THREE.MeshBasicMaterial({
            color: isWater ? 0x38bdf8 : 0xf59e0b,
            transparent: true,
            opacity: 0.9
        });
        const mesh = new THREE.Mesh(geo, mat);
        scene.add(mesh);
        
        particles.push({
            mesh: mesh,
            type: isWater ? 'water' : 'oil',
            speed: 0.8 + Math.random() * 0.8,
            progress: Math.random()
        });
    }

    function updateParticles() {
        particles.forEach(p => {
            p.progress += 0.005 * p.speed;
            if (p.progress >= 1) p.progress = 0;

            // Animate along pipes
            if (p.type === 'water') {
                // Flow down left water outlet
                const py = 5 - p.progress * 30; // Downward
                p.mesh.position.set(-80, py, 0);
            } else {
                // Flow down right oil outlet
                const py = 5 - p.progress * 30; // Downward
                p.mesh.position.set(90, py, 0);
            }
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

        if (!isInteracting) {
            separatorGroup.rotation.y = THREE.MathUtils.lerp(separatorGroup.rotation.y, targetRotationY, 0.05);
        }

        const time = Date.now() * 0.002;
        waterMesh.position.y = (80 - vesselRadius + waterHeight/2 + 1) + Math.sin(time) * 0.4;
        oilMeshLeft.position.y = (80 - vesselRadius + waterHeight + oilHeightLeft/2 + 1) + Math.sin(time + 1) * 0.3;
        oilMeshRight.position.y = (80 - vesselRadius + oilHeightRight/2 + 1) + Math.sin(time + 2) * 0.4;

        updateParticles();
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
