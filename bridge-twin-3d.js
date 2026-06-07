window.initBridge3D = function(container) {
    console.log("🚀 Iniciando Motor 3D Civil (Gemelo Digital Puente)...");
    if (!container) return;

    // --- SCENE SETUP ---
    const scene = new THREE.Scene();
    
    // --- CAMERA ---
    const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 1, 4000);
    camera.position.set(-700, 400, 600);

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
    controls.target.set(0, 80, 0);
    controls.update();

    // --- LIGHTING ---
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0x00f2fe, 1.2); // Glowing cyan directional light
    sunLight.position.set(-300, 800, 300);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 1024;
    sunLight.shadow.mapSize.height = 1024;
    scene.add(sunLight);

    const purpleLight = new THREE.DirectionalLight(0xa855f7, 0.8); // Purple backlight accent
    purpleLight.position.set(300, 400, -300);
    scene.add(purpleLight);

    // --- INTERCEPT ADD FOR GROUP ROTATION ---
    const bridgeGroup = new THREE.Group();
    scene.add(bridgeGroup);
    const originalSceneAdd = scene.add;
    scene.add = function(obj) {
        if (obj.isLight) {
            originalSceneAdd.call(scene, obj);
        } else {
            bridgeGroup.add(obj);
        }
    };

    // --- MATERIALS (Holographic Sci-Fi Theme) ---
    const matSteel = new THREE.MeshStandardMaterial({ 
        color: 0x1a233a, 
        roughness: 0.2, 
        metalness: 0.9,
        emissive: 0x00f2fe,
        emissiveIntensity: 0.15
    });
    const matDarkSteel = new THREE.MeshStandardMaterial({ 
        color: 0x07080a, 
        roughness: 0.4, 
        metalness: 0.8 
    });
    const matConcrete = new THREE.MeshStandardMaterial({ 
        color: 0x1f2937, 
        roughness: 0.8,
        emissive: 0xa855f7,
        emissiveIntensity: 0.08
    });
    const matSensorGlow = new THREE.MeshBasicMaterial({ color: 0xff0055 }); // Pulsing red sensors
    const matSensorCyan = new THREE.MeshBasicMaterial({ color: 0x00f2fe }); // Pulsing cyan sensors
    
    // Lines
    const matCableLine = new THREE.LineBasicMaterial({ color: 0x00f2fe, linewidth: 2 });
    const matHangerLine = new THREE.LineBasicMaterial({ color: 0x555555, transparent: true, opacity: 0.6 });

    // --- PROCEDURAL BRIDGE BUILDER ---

    // 1. Pylons (Towers)
    function createPylon(x, z) {
        const group = new THREE.Group();
        // Left column
        const col1 = new THREE.Mesh(new THREE.BoxGeometry(12, 220, 12), matSteel);
        col1.position.set(-20, 110, 0);
        col1.castShadow = true; col1.receiveShadow = true;
        group.add(col1);
        // Right column
        const col2 = new THREE.Mesh(new THREE.BoxGeometry(12, 220, 12), matSteel);
        col2.position.set(20, 110, 0);
        col2.castShadow = true; col2.receiveShadow = true;
        group.add(col2);
        // Cross beams / trusses
        for (let y = 40; y <= 200; y += 50) {
            const beam = new THREE.Mesh(new THREE.BoxGeometry(40, 8, 8), matDarkSteel);
            beam.position.set(0, y, 0);
            group.add(beam);
            
            // X-bracing truss details
            if (y < 200) {
                const b1 = new THREE.Mesh(new THREE.BoxGeometry(42, 2, 2), matSteel);
                b1.position.set(0, y + 25, 0);
                b1.rotation.z = Math.PI / 5;
                group.add(b1);
                const b2 = new THREE.Mesh(new THREE.BoxGeometry(42, 2, 2), matSteel);
                b2.position.set(0, y + 25, 0);
                b2.rotation.z = -Math.PI / 5;
                group.add(b2);
            }
        }
        group.position.set(x, 0, z);
        scene.add(group);
        return group;
    }

    createPylon(-250, 0);
    createPylon(250, 0);

    // 2. Roadway / Deck
    const deckGeo = new THREE.BoxGeometry(900, 8, 50);
    const deck = new THREE.Mesh(deckGeo, matConcrete);
    deck.position.set(0, 50, 0);
    deck.receiveShadow = true; deck.castShadow = true;
    scene.add(deck);

    // Sub-deck truss support (horizontal lines under the bridge)
    const trussSupport = new THREE.Mesh(new THREE.BoxGeometry(900, 4, 46), matDarkSteel);
    trussSupport.position.set(0, 44, 0);
    scene.add(trussSupport);

    // 3. Main Suspension Cables (Catenary Curves)
    // Left side main cable (Z = -22)
    const pointsLeft = [
        new THREE.Vector3(-450, 50, -22),
        new THREE.Vector3(-250, 215, -22),
        new THREE.Vector3(0, 65, -22),
        new THREE.Vector3(250, 215, -22),
        new THREE.Vector3(450, 50, -22)
    ];
    const curveLeft = new THREE.CatmullRomCurve3(pointsLeft);
    const curvePointsLeft = curveLeft.getPoints(100);
    const cableGeoLeft = new THREE.BufferGeometry().setFromPoints(curvePointsLeft);
    const cableLeft = new THREE.Line(cableGeoLeft, matCableLine);
    scene.add(cableLeft);

    // Right side main cable (Z = 22)
    const pointsRight = pointsLeft.map(p => new THREE.Vector3(p.x, p.y, 22));
    const curveRight = new THREE.CatmullRomCurve3(pointsRight);
    const curvePointsRight = curveRight.getPoints(100);
    const cableGeoRight = new THREE.BufferGeometry().setFromPoints(curvePointsRight);
    const cableRight = new THREE.Line(cableGeoRight, matCableLine);
    scene.add(cableRight);

    // 4. Vertical Hangers (cables connecting main cable to deck)
    const hangerCount = 30;
    for (let i = 0; i <= hangerCount; i++) {
        const x = -380 + i * 26;
        if (Math.abs(x - (-250)) < 15 || Math.abs(x - 250) < 15) continue; // Skip where towers stand

        const t = (x + 450) / 900;
        const cablePtLeft = curveLeft.getPointAt(t);
        const cablePtRight = curveRight.getPointAt(t);

        // Left Hanger Line
        const hGeoLeft = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(x, 50, -22),
            cablePtLeft
        ]);
        const hangerLeft = new THREE.Line(hGeoLeft, matHangerLine);
        scene.add(hangerLeft);

        // Right Hanger Line
        const hGeoRight = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(x, 50, 22),
            cablePtRight
        ]);
        const hangerRight = new THREE.Line(hGeoRight, matHangerLine);
        scene.add(hangerRight);
    }

    // --- SENSOR NODES (Pulsing visual markers) ---
    const sensors = [];
    function addSensor(x, y, z, type) {
        const geo = new THREE.SphereGeometry(4, 16, 16);
        const mat = type === 'stress' ? matSensorGlow : matSensorCyan;
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.set(x, y, z);
        scene.add(mesh);
        sensors.push({
            mesh: mesh,
            baseScale: 1.0,
            phase: Math.random() * Math.PI * 2
        });
    }

    // Add sensor nodes on towers and span centers
    addSensor(0, 54, 0, 'stress');       // Span center load sensor
    addSensor(-250, 218, 0, 'weather');  // Tower 1 top anemometer
    addSensor(250, 218, 0, 'weather');   // Tower 2 top anemometer
    addSensor(-125, 54, -22, 'stress');  // Mid-span stress gauge
    addSensor(125, 54, 22, 'stress');    // Mid-span stress gauge
    addSensor(-250, 54, -22, 'weather'); // Foundation tilt sensor
    addSensor(250, 54, 22, 'weather');   // Foundation tilt sensor

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
        
        // Return bridge model to scroll-linked rotation smoothly
        if (!isInteracting) {
            bridgeGroup.rotation.y = THREE.MathUtils.lerp(bridgeGroup.rotation.y, targetRotationY, 0.05);
        }

        controls.update();

        // Pulse the sensor scales to represent active data transmissions
        const time = Date.now() * 0.005;
        sensors.forEach(s => {
            s.mesh.scale.setScalar(1 + Math.sin(time + s.phase) * 0.35);
        });

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
