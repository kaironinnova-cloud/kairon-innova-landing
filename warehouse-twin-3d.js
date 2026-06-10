window.initWarehouse3D = function(container) {
    console.log("🚀 Iniciando Motor 3D Logístico (Gemelo Digital Almacén)...");
    if (!container) return;

    // --- SCENE SETUP ---
    const scene = new THREE.Scene();

    // --- CAMERA ---
    const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 1, 4000);
    camera.position.set(-600, 450, 650);

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
    controls.minDistance = 200;
    controls.maxDistance = 2000;
    controls.maxPolarAngle = Math.PI / 2 - 0.05;
    controls.target.set(0, 60, 0);
    controls.update();

    // --- LIGHTING ---
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.55);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0x00f2fe, 1.0); // Cyan main light
    sunLight.position.set(-300, 600, 300);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 1024;
    sunLight.shadow.mapSize.height = 1024;
    scene.add(sunLight);

    const purpleLight = new THREE.DirectionalLight(0xa855f7, 0.7); // Purple accent light
    purpleLight.position.set(300, 400, -300);
    scene.add(purpleLight);

    // --- INTERCEPT ADD FOR GROUP ROTATION ---
    const warehouseGroup = new THREE.Group();
    scene.add(warehouseGroup);
    const originalSceneAdd = scene.add;
    scene.add = function(obj) {
        if (obj.isLight) {
            originalSceneAdd.call(scene, obj);
        } else {
            warehouseGroup.add(obj);
        }
    };

    // --- MATERIALS (Futuristic Sci-Fi Theme) ---
    const matRackSteel = new THREE.MeshStandardMaterial({ 
        color: 0x1f2937, 
        roughness: 0.3, 
        metalness: 0.8 
    });
    const matFloor = new THREE.MeshStandardMaterial({ 
        color: 0x111827, 
        roughness: 0.8,
        metalness: 0.2
    });
    const matAmrBody = new THREE.MeshStandardMaterial({ 
        color: 0x00f2fe, 
        roughness: 0.2, 
        metalness: 0.9,
        emissive: 0x00f2fe,
        emissiveIntensity: 0.1
    });
    const matDarkSteel = new THREE.MeshStandardMaterial({ 
        color: 0x0f172a, 
        roughness: 0.5, 
        metalness: 0.7 
    });
    const matSensorGlow = new THREE.MeshBasicMaterial({ color: 0x00f2fe });
    const matRobotStatus = new THREE.MeshBasicMaterial({ color: 0x10b981 }); // Green online indicator

    // Package colors (Figma palette)
    const packageMaterials = [
        new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.6 }), // Orange
        new THREE.MeshStandardMaterial({ color: 0x2563eb, roughness: 0.7 }), // Blue
        new THREE.MeshStandardMaterial({ color: 0x4b5563, roughness: 0.8 }), // Grey
        new THREE.MeshStandardMaterial({ color: 0xa855f7, roughness: 0.6 }), // Purple
        new THREE.MeshStandardMaterial({ color: 0x059669, roughness: 0.7 })  // Green
    ];

    // --- PROCEDURAL WAREHOUSE BUILDER ---

    // 1. Floor Base
    const floorGeo = new THREE.BoxGeometry(600, 4, 400);
    const floorMesh = new THREE.Mesh(floorGeo, matFloor);
    floorMesh.position.set(0, -2, 0);
    floorMesh.receiveShadow = true;
    scene.add(floorMesh);

    // Grid Overlay
    const gridHelper = new THREE.GridHelper(580, 20, 0x00f2fe, 0x374151);
    gridHelper.position.set(0, 0.5, 0);
    gridHelper.material.transparent = true;
    gridHelper.material.opacity = 0.15;
    scene.add(gridHelper);

    // 2. High-Density Racks / Shelves
    function createWarehouseRack(x, z, length, height, depth) {
        const group = new THREE.Group();

        // Vertical corner poles (4 poles)
        const poleGeo = new THREE.BoxGeometry(4, height, 4);
        const p1 = new THREE.Mesh(poleGeo, matRackSteel); p1.position.set(-length/2, height/2, -depth/2);
        const p2 = new THREE.Mesh(poleGeo, matRackSteel); p2.position.set(length/2, height/2, -depth/2);
        const p3 = new THREE.Mesh(poleGeo, matRackSteel); p3.position.set(-length/2, height/2, depth/2);
        const p4 = new THREE.Mesh(poleGeo, matRackSteel); p4.position.set(length/2, height/2, depth/2);
        group.add(p1, p2, p3, p4);

        // Shelf levels (3 levels)
        const levelCount = 3;
        for (let level = 1; level <= levelCount; level++) {
            const y = (level / levelCount) * height - 8;
            const shelf = new THREE.Mesh(new THREE.BoxGeometry(length, 2, depth), matRackSteel);
            shelf.position.set(0, y, 0);
            group.add(shelf);

            // Populating shelves with packages
            const boxCount = 5;
            for (let b = 0; b < boxCount; b++) {
                // Keep some spots empty for realism
                if (Math.random() > 0.85) continue;

                const boxW = 12 + Math.random() * 8;
                const boxH = 12 + Math.random() * 6;
                const boxD = depth - 8;

                const boxMat = packageMaterials[Math.floor(Math.random() * packageMaterials.length)];
                const boxMesh = new THREE.Mesh(new THREE.BoxGeometry(boxW, boxH, boxD), boxMat);
                
                const bx = -length/2 + 15 + b * (length / boxCount);
                boxMesh.position.set(bx, y + boxH/2 + 1, (Math.random() - 0.5) * 4);
                boxMesh.castShadow = true;
                boxMesh.receiveShadow = true;
                group.add(boxMesh);
            }
        }

        group.position.set(x, 0, z);
        scene.add(group);
        return group;
    }

    // Two parallel rows of racks
    createWarehouseRack(-100, -90, 320, 140, 40);
    createWarehouseRack(-100, 90, 320, 140, 40);

    // 3. Loading Dock / Shipping Area
    const dockPad = new THREE.Mesh(new THREE.BoxGeometry(100, 2, 160), matDarkSteel);
    dockPad.position.set(200, 1, 0);
    dockPad.receiveShadow = true;
    scene.add(dockPad);

    // Dock outline (glowing neon lines)
    const dockOutlineGeo = new THREE.BoxGeometry(102, 1, 162);
    const dockOutlineMat = new THREE.MeshBasicMaterial({ color: 0x00f2fe, wireframe: true });
    const dockOutline = new THREE.Mesh(dockOutlineGeo, dockOutlineMat);
    dockOutline.position.set(200, 2, 0);
    scene.add(dockOutline);

    // Shipping cargo box piles at dock
    function createCargoPile(x, z, size) {
        const box = new THREE.Mesh(new THREE.BoxGeometry(size, size, size), packageMaterials[2]);
        box.position.set(x, size/2 + 1, z);
        box.castShadow = true;
        scene.add(box);
    }
    createCargoPile(220, -50, 24);
    createCargoPile(220, -25, 20);
    createCargoPile(220, 40, 22);

    // 4. Autonomous Mobile Robot (AMR)
    const amrGroup = new THREE.Group();
    // AMR Chassis
    const chassis = new THREE.Mesh(new THREE.BoxGeometry(42, 12, 34), matDarkSteel);
    chassis.position.y = 6;
    chassis.castShadow = true;
    amrGroup.add(chassis);

    // Glowing cover plate
    const cover = new THREE.Mesh(new THREE.BoxGeometry(38, 2, 30), matAmrBody);
    cover.position.y = 13;
    amrGroup.add(cover);

    // Glowing status dot
    const amrStatus = new THREE.Mesh(new THREE.SphereGeometry(3, 8, 8), matRobotStatus);
    amrStatus.position.set(-14, 15, 0);
    amrGroup.add(amrStatus);

    // Loaded package carried by AMR (moves with it)
    const carriedPackage = new THREE.Mesh(new THREE.BoxGeometry(25, 20, 25), packageMaterials[0]); // Orange package
    carriedPackage.position.set(4, 24, 0);
    carriedPackage.castShadow = true;
    amrGroup.add(carriedPackage);

    amrGroup.position.set(-180, 0, 0);
    scene.add(amrGroup);

    // 5. Quadcopter Drone Picker
    const droneGroup = new THREE.Group();
    
    // Central pod
    const droneBody = new THREE.Mesh(new THREE.CylinderGeometry(10, 10, 4, 12), matDarkSteel);
    droneBody.position.y = 0;
    droneGroup.add(droneBody);

    const droneCap = new THREE.Mesh(new THREE.SphereGeometry(8, 12, 12), matAmrBody);
    droneCap.position.y = 2;
    droneCap.scale.set(1, 0.4, 1);
    droneGroup.add(droneCap);

    // Drone 4 arms (X-configuration)
    const armGeo = new THREE.BoxGeometry(34, 1.5, 3);
    
    const arm1 = new THREE.Mesh(armGeo, matRackSteel);
    arm1.rotation.y = Math.PI / 4;
    droneGroup.add(arm1);

    const arm2 = new THREE.Mesh(armGeo, matRackSteel);
    arm2.rotation.y = -Math.PI / 4;
    droneGroup.add(arm2);

    // Rotors (4 circles at arm tips)
    const rotorGeo = new THREE.TorusGeometry(6, 0.5, 4, 16);
    const rotorMat = new THREE.MeshBasicMaterial({ color: 0x555555, transparent: true, opacity: 0.8 });
    const rotors = [];

    const offsets = [
        { x: 12, z: 12 }, { x: -12, z: 12 },
        { x: 12, z: -12 }, { x: -12, z: -12 }
    ];

    offsets.forEach(offset => {
        const rotor = new THREE.Mesh(rotorGeo, rotorMat);
        rotor.rotation.x = Math.PI / 2;
        rotor.position.set(offset.x, 2, offset.z);
        droneGroup.add(rotor);
        rotors.push(rotor);
    });

    // Package carried by drone
    const dronePackage = new THREE.Mesh(new THREE.BoxGeometry(12, 10, 12), packageMaterials[3]); // Purple package
    dronePackage.position.y = -8;
    dronePackage.castShadow = true;
    droneGroup.add(dronePackage);

    scene.add(droneGroup);

    // 6. Drone Flight Trajectory Path (Glowing dashed spline)
    const dronePathPoints = [
        new THREE.Vector3(-150, 160, -70), // High at Rack 1
        new THREE.Vector3(-50, 110, 30),   // Crossover
        new THREE.Vector3(50, 120, -30),   // Middle swing
        new THREE.Vector3(200, 52, 0)      // Landing pad at dock
    ];
    const droneCurve = new THREE.CatmullRomCurve3(dronePathPoints);
    const curvePoints = droneCurve.getPoints(60);
    const curveGeo = new THREE.BufferGeometry().setFromPoints(curvePoints);
    // Dashed glowing path
    const curveMat = new THREE.LineDashedMaterial({
        color: 0x00f2fe,
        dashSize: 10,
        gapSize: 6,
        transparent: true,
        opacity: 0.45
    });
    const pathLine = new THREE.Line(curveGeo, curveMat);
    pathLine.computeLineDistances();
    scene.add(pathLine);

    // Restore original scene.add
    scene.add = originalSceneAdd;

    // --- SCROLL CHOREOGRAPHY LOGIC ---
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
    let targetScrollProgress = 0;
    let currentScrollProgress = 0;

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
            const scrollProgressVal = (viewportHeight - rect.top) / totalScrollHeight;
            targetRotationY = (scrollProgressVal - 0.5) * 0.5;
            targetScrollProgress = Math.max(0, Math.min(1, scrollProgressVal));
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

        if (container.dataset.paused === "true") {
            return;
        }

        currentScrollProgress = THREE.MathUtils.lerp(currentScrollProgress, targetScrollProgress, 0.05);

        if (!isInteracting) {
            warehouseGroup.rotation.y = THREE.MathUtils.lerp(warehouseGroup.rotation.y, targetRotationY, 0.05);
        }

        const amrX = -180 + currentScrollProgress * 360;
        amrGroup.position.x = amrX;
        const time = Date.now() * 0.003;
        amrStatus.scale.setScalar(1 + Math.sin(time) * 0.25);

        const dronePos = droneCurve.getPointAt(currentScrollProgress);
        droneGroup.position.copy(dronePos);

        rotors.forEach((rotor, idx) => {
            rotor.rotation.z += (idx % 2 === 0 ? 0.35 : -0.35);
        });

        droneGroup.position.y += Math.sin(Date.now() * 0.005) * 2.0;

        if (currentScrollProgress > 0.9) {
            const factor = Math.max(0, (1.0 - currentScrollProgress) / 0.1);
            dronePackage.scale.setScalar(factor);
        } else {
            dronePackage.scale.setScalar(1.0);
        }

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
