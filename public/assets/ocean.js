// =========================================================
//  界外网球 · 3D 海洋页脚场景 (Three.js)
//  自动初始化所有 .ocean-footer 容器：
//  动画海洋 + 渐变天空 + 阳光 + 低多边形树木 +
//  网球场(含球网) + 两个男生打网球(挥拍/球往返)
// =========================================================
import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';

function makeRadialTexture(inner, outer) {
    const c = document.createElement('canvas');
    c.width = c.height = 128;
    const g = c.getContext('2d');
    const grd = g.createRadialGradient(64, 64, 0, 64, 64, 64);
    grd.addColorStop(0, inner);
    grd.addColorStop(0.4, outer);
    grd.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = grd;
    g.fillRect(0, 0, 128, 128);
    return new THREE.CanvasTexture(c);
}

function makeSkyTexture() {
    const c = document.createElement('canvas');
    c.width = 2; c.height = 256;
    const g = c.getContext('2d');
    const grd = g.createLinearGradient(0, 0, 0, 256);
    grd.addColorStop(0.0, '#9fdcff');
    grd.addColorStop(0.45, '#cdeeff');
    grd.addColorStop(0.75, '#eaf6ff');
    grd.addColorStop(1.0, '#fff3d6');
    g.fillStyle = grd;
    g.fillRect(0, 0, 2, 256);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
}

function makePlayer(shirt, skin) {
    const g = new THREE.Group();
    const matSkin = new THREE.MeshStandardMaterial({ color: skin, roughness: .8 });
    const matShirt = new THREE.MeshStandardMaterial({ color: shirt, roughness: .7 });
    const matDark = new THREE.MeshStandardMaterial({ color: 0x2b2b33, roughness: .9 });

    // 腿
    [-0.16, 0.16].forEach(x => {
        const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.1, 0.75, 12), matDark);
        leg.position.set(x, 0.38, 0);
        g.add(leg);
    });
    // 躯干
    const torso = new THREE.Mesh(new THREE.CapsuleGeometry(0.3, 0.7, 6, 14), matShirt);
    torso.position.set(0, 1.18, 0);
    g.add(torso);
    // 头
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.26, 20, 18), matSkin);
    head.position.set(0, 1.78, 0);
    g.add(head);
    // 头发
    const hair = new THREE.Mesh(new THREE.SphereGeometry(0.27, 20, 18, 0, Math.PI * 2, 0, Math.PI * 0.6),
        new THREE.MeshStandardMaterial({ color: 0x3a2a1a, roughness: 1 }));
    hair.position.set(0, 1.82, 0);
    g.add(hair);
    // 左臂（自然下垂）
    const armL = new THREE.Mesh(new THREE.CapsuleGeometry(0.09, 0.5, 4, 10), matShirt);
    armL.position.set(-0.4, 1.15, 0);
    armL.rotation.z = 0.25;
    g.add(armL);

    // 右臂（持拍）— 以肩为支点的 group
    const armR = new THREE.Group();
    armR.position.set(0.34, 1.45, 0.18);
    const upper = new THREE.Mesh(new THREE.CapsuleGeometry(0.09, 0.42, 4, 10), matShirt);
    upper.position.set(0, -0.22, 0.05);
    armR.add(upper);
    const fore = new THREE.Mesh(new THREE.CapsuleGeometry(0.08, 0.38, 4, 10), matSkin);
    fore.position.set(0, -0.52, 0.12);
    armR.add(fore);
    // 球拍
    const racket = new THREE.Group();
    racket.position.set(0, -0.72, 0.18);
    const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.34, 8), matDark);
    handle.position.y = -0.05;
    racket.add(handle);
    const headRing = new THREE.Mesh(new THREE.TorusGeometry(0.22, 0.03, 10, 24), new THREE.MeshStandardMaterial({ color: 0xc0392b, roughness: .5 }));
    headRing.position.y = 0.28;
    racket.add(headRing);
    const strings = new THREE.Mesh(new THREE.CircleGeometry(0.2, 20),
        new THREE.MeshStandardMaterial({ color: 0xffffff, transparent: true, opacity: 0.25, side: THREE.DoubleSide }));
    strings.position.y = 0.28;
    racket.add(strings);
    racket.rotation.x = -0.5;
    armR.add(racket);
    g.add(armR);

    g.userData.armR = armR;
    g.userData.swing = 0;
    return g;
}

function makeTree() {
    const t = new THREE.Group();
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.22, 1.1, 8),
        new THREE.MeshStandardMaterial({ color: 0x7a5230, roughness: 1 }));
    trunk.position.y = 0.55;
    t.add(trunk);
    const greens = [0x4caf50, 0x43a047, 0x66bb6a];
    for (let i = 0; i < 3; i++) {
        const cone = new THREE.Mesh(new THREE.ConeGeometry(0.9 - i * 0.22, 1.1, 9),
            new THREE.MeshStandardMaterial({ color: greens[i % 3], roughness: .9 }));
        cone.position.y = 1.1 + i * 0.55;
        t.add(cone);
    }
    return t;
}

function initScene(container) {
    if (container.dataset.oceanInit) return;
    container.dataset.oceanInit = '1';

    let renderer;
    try {
        renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    } catch (e) {
        container.style.background = 'linear-gradient(180deg,#bfe9ff,#7fc9f5 60%,#4aa3e0)';
        return;
    }
    const getSize = () => ({ w: container.clientWidth || window.innerWidth, h: container.clientHeight || 480 });
    let { w, h } = getSize();
    renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
    renderer.setSize(w, h);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.background = makeSkyTexture();
    scene.fog = new THREE.Fog(0xbfe9ff, 22, 46);

    const camera = new THREE.PerspectiveCamera(46, w / h, 0.1, 200);
    camera.position.set(7.5, 4.6, 11.5);
    camera.lookAt(0, 0.9, 0);

    // 灯光
    const hemi = new THREE.HemisphereLight(0xbfe9ff, 0x6b8f3a, 0.7);
    scene.add(hemi);
    const sun = new THREE.DirectionalLight(0xfff3d6, 1.5);
    sun.position.set(13, 11, -12);
    scene.add(sun);
    scene.add(new THREE.AmbientLight(0xffffff, 0.25));

    // 太阳（发光球 + 光晕）
    const sunMesh = new THREE.Mesh(new THREE.SphereGeometry(0.9, 24, 24),
        new THREE.MeshBasicMaterial({ color: 0xfff2c0 }));
    sunMesh.position.set(13, 11, -16);
    scene.add(sunMesh);
    const glow = new THREE.Sprite(new THREE.SpriteMaterial({
        map: makeRadialTexture('rgba(255,245,200,0.95)', 'rgba(255,220,120,0.5)'),
        transparent: true, blending: THREE.AdditiveBlending, depthWrite: false
    }));
    glow.scale.set(9, 9, 1);
    glow.position.copy(sunMesh.position);
    scene.add(glow);

    // 海洋
    const oceanGeo = new THREE.PlaneGeometry(80, 80, 64, 64);
    oceanGeo.rotateX(-Math.PI / 2);
    const oceanMat = new THREE.MeshStandardMaterial({
        color: 0x2f9fd0, roughness: 0.32, metalness: 0.15, transparent: true, opacity: 0.94
    });
    const ocean = new THREE.Mesh(oceanGeo, oceanMat);
    ocean.position.y = -0.7;
    scene.add(ocean);
    const basePos = oceanGeo.attributes.position.array.slice();

    // 岛屿（球场基座）
    const island = new THREE.Mesh(new THREE.CylinderGeometry(8.6, 7.8, 1.3, 40),
        new THREE.MeshStandardMaterial({ color: 0xe9d8a6, roughness: 1 }));
    island.position.y = -0.65;
    scene.add(island);

    // 球场地面
    const courtW = 6.2, courtL = 13;
    const court = new THREE.Mesh(new THREE.BoxGeometry(courtW, 0.08, courtL),
        new THREE.MeshStandardMaterial({ color: 0x3f8f4f, roughness: .9 }));
    court.position.y = 0.04;
    scene.add(court);
    // 球场线
    const lineMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: .8 });
    const addLine = (w, l, x, z) => {
        const m = new THREE.Mesh(new THREE.BoxGeometry(w, 0.09, l), lineMat);
        m.position.set(x, 0.09, z); scene.add(m);
    };
    addLine(courtW, 0.08, 0, courtL / 2 - 0.2);     // 端线
    addLine(courtW, 0.08, 0, -courtL / 2 + 0.2);
    addLine(0.08, courtL, -courtW / 2 + 0.2, 0);     // 边线
    addLine(0.08, courtL, courtW / 2 - 0.2, 0);
    addLine(0.08, courtL * 0.5, 0, 0);               // 中线
    // 球网
    const net = new THREE.Mesh(new THREE.BoxGeometry(courtW + 0.4, 0.7, 0.05),
        new THREE.MeshStandardMaterial({ color: 0xeeeeee, transparent: true, opacity: 0.55 }));
    net.position.set(0, 0.45, 0);
    scene.add(net);
    [-1, 1].forEach(s => {
        const post = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.85, 8),
            new THREE.MeshStandardMaterial({ color: 0xdddddd }));
        post.position.set(s * (courtW / 2 + 0.2), 0.5, 0);
        scene.add(post);
    });

    // 树木
    const treePos = [[-7, -3], [7, -2], [-6.5, 4], [6.8, 4.5], [-3, -6.5], [3.5, 6.5], [0, -7]];
    treePos.forEach(([x, z]) => {
        const tr = makeTree();
        tr.position.set(x, 0, z);
        const s = 0.9 + Math.random() * 0.4;
        tr.scale.setScalar(s);
        tr.rotation.y = Math.random() * Math.PI;
        scene.add(tr);
    });

    // 两个男生
    const pA = makePlayer(0x5B4B8A, 0xf0c39b);
    pA.position.set(0, 0, -courtL / 2 + 1.6);
    scene.add(pA);
    const pB = makePlayer(0x2d8a4e, 0xe6b48a);
    pB.position.set(0, 0, courtL / 2 - 1.6);
    pB.rotation.y = Math.PI;
    scene.add(pB);

    // 网球
    const ball = new THREE.Mesh(new THREE.SphereGeometry(0.18, 16, 14),
        new THREE.MeshStandardMaterial({ color: 0xc6df00, roughness: .5, emissive: 0x556b00, emissiveIntensity: .2 }));
    scene.add(ball);

    const racketA = new THREE.Vector3(0.34, 1.1, -courtL / 2 + 1.6 + 0.5);
    const racketB = new THREE.Vector3(0.34, 1.1, courtL / 2 - 1.6 - 0.5);

    function worldRacket(p) {
        const v = new THREE.Vector3(0.34, 1.05, 0.6);
        if (p === pB) v.z = -0.6;
        p.localToWorld(v);
        return v;
    }

    // 动画状态
    let running = true;
    const clock = new THREE.Clock();
    let phase = 0;          // 0..2 往返
    const speed = 0.32;

    function triggerSwing(p) { p.userData.swing = 1; }

    function animate() {
        if (!running) return;
        requestAnimationFrame(animate);
        const dt = Math.min(clock.getDelta(), 0.05);
        const t = clock.elapsedTime;

        // 海浪
        const pos = oceanGeo.attributes.position.array;
        for (let i = 0; i < pos.length; i += 3) {
            const x = basePos[i], z = basePos[i + 2];
            pos[i + 1] = Math.sin(x * 0.3 + t * 1.1) * 0.16
                       + Math.sin(z * 0.42 + t * 0.9) * 0.12
                       + Math.sin((x + z) * 0.2 + t * 1.4) * 0.08;
        }
        oceanGeo.attributes.position.needsUpdate = true;
        oceanGeo.computeVertexNormals();

        // 球往返
        phase += dt * speed;
        if (phase >= 2) phase -= 2;
        const going = phase < 1;
        const p = going ? phase : phase - 1;
        const start = going ? worldRacket(pA) : worldRacket(pB);
        const end = going ? worldRacket(pB) : worldRacket(pA);
        ball.position.lerpVectors(start, end, p);
        ball.position.y += Math.sin(p * Math.PI) * 2.6 + 0.2;
        // 触发挥拍：球到达接球方附近
        if (going && p > 0.82) { if (!pB.userData._hit) { triggerSwing(pB); pB.userData._hit = true; } }
        if (!going && p > 0.82) { if (!pA.userData._hit) { triggerSwing(pA); pA.userData._hit = true; } }
        if (p < 0.1) { pA.userData._hit = false; pB.userData._hit = false; }

        // 挥拍动画（手臂摆动）
        [pA, pB].forEach(p => {
            if (p.userData.swing > 0) {
                p.userData.swing = Math.max(0, p.userData.swing - dt * 2.2);
                const s = Math.sin(p.userData.swing * Math.PI);
                p.userData.armR.rotation.x = -1.1 + s * 2.0;
                p.userData.armR.rotation.z = -0.3 + s * 0.6;
                p.rotation.y += (p === pB ? -1 : 1) * s * 0.04;
            } else {
                p.userData.armR.rotation.x += (0 - p.userData.armR.rotation.x) * 0.1;
                p.userData.armR.rotation.z += (-0.1 - p.userData.armR.rotation.z) * 0.1;
            }
        });

        // 太阳轻微闪烁
        glow.material.opacity = 0.85 + Math.sin(t * 1.5) * 0.1;

        renderer.render(scene, camera);
    }
    animate();

    // 视口/可见性暂停
    const io = new IntersectionObserver(es => {
        es.forEach(e => {
            running = e.isIntersecting;
            if (running) { clock.getDelta(); animate(); }
        });
    }, { threshold: 0.05 });
    io.observe(container);
    document.addEventListener('visibilitychange', () => {
        running = !document.hidden && (container.getBoundingClientRect().top < window.innerHeight);
        if (running) { clock.getDelta(); animate(); }
    });

    // 自适应
    window.addEventListener('resize', () => {
        const s = getSize();
        camera.aspect = s.w / s.h; camera.updateProjectionMatrix();
        renderer.setSize(s.w, s.h);
    });
}

function boot() {
    document.querySelectorAll('.ocean-footer').forEach(initScene);
}
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
} else { boot(); }
