// Cena WebGL do hero: réplica 3D da composição original (images/pills.png) —
// duas metades de cápsula que ABREM com animação ao entrar na tela, granulado
// caindo entre elas, e interação: arraste para girar, clique para reabrir.
// Módulo independente de main.js — se qualquer checagem de capacidade falhar,
// o <img id="hero-pills-fallback"> original continua visível.
(async () => {
  const canvas = document.getElementById("hero-canvas");
  const fallbackImg = document.getElementById("hero-pills-fallback");
  const heroVisual = document.querySelector(".hero-visual");
  if (!canvas || !fallbackImg || !heroVisual) return;

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isCoarsePointer = window.matchMedia("(pointer: coarse)").matches;

  const supportsWebGL = (() => {
    try {
      const test = document.createElement("canvas");
      return !!(test.getContext("webgl2") || test.getContext("webgl"));
    } catch (e) {
      return false;
    }
  })();
  if (!supportsWebGL) return;

  let THREE, RoomEnvironment;
  try {
    [THREE, { RoomEnvironment }] = await Promise.all([
      import("three"),
      import("three/addons/environments/RoomEnvironment.js"),
    ]);
  } catch (e) {
    return; // CDN indisponível — fica no fallback estático
  }

  const ORANGE = 0xff6b3d;
  const CREAM = 0xfbfaf8;
  const easeOutCubic = (x) => 1 - Math.pow(1 - x, 3);
  const clamp01 = (x) => Math.min(1, Math.max(0, x));

  const scene = new THREE.Scene(); // sem background: canvas transparente, mostra o .hero-glow atrás

  // FOV estreito (tele) + distância longa: a cápsula preenche o quadro quase de ponta a
  // ponta, como no pills.png original, sem o efeito "olho de peixe" de uma câmera próxima.
  const camera = new THREE.PerspectiveCamera(17, 1, 0.1, 50);
  camera.position.set(0, 0, 10.5);

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
    powerPreference: "high-performance",
  });
  // teto de pixel ratio mais baixo em touch: menos carga de GPU/bateria em celulares
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, isCoarsePointer ? 1.5 : 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1;

  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.3).texture;

  const key = new THREE.DirectionalLight(0xfff6ee, 1.15);
  key.position.set(3, 6, 7);
  scene.add(key);

  const fill = new THREE.HemisphereLight(0xffe9dd, 0x241812, 0.5);
  scene.add(fill);

  const rim = new THREE.PointLight(0xff8a5c, 0.9, 20, 2);
  rim.position.set(-5, -1, -3);
  scene.add(rim);

  function shellMaterial(colorHex) {
    return new THREE.MeshPhysicalMaterial({
      color: colorHex,
      roughness: 0.4,
      metalness: 0,
      clearcoat: 0.35,
      clearcoatRoughness: 0.45,
      envMapIntensity: 0.6,
      side: THREE.DoubleSide,
    });
  }

  function beadMaterial(colorHex) {
    return new THREE.MeshPhysicalMaterial({
      color: colorHex,
      roughness: 0.38,
      metalness: 0,
      clearcoat: 0.3,
      clearcoatRoughness: 0.4,
      envMapIntensity: 0.6,
    });
  }

  // Metade de cápsula oca: cúpula (hemisfério) + tubo aberto nas duas pontas,
  // formando um "copo" com abertura visível (lado interno também sombreado via DoubleSide).
  function makeCapsuleHalf(radius, tubeLength, colorHex) {
    const group = new THREE.Group();
    const material = shellMaterial(colorHex);

    const dome = new THREE.Mesh(
      new THREE.SphereGeometry(radius, 28, 16, 0, Math.PI * 2, 0, Math.PI / 2),
      material
    );
    dome.position.y = tubeLength / 2;
    group.add(dome);

    const tube = new THREE.Mesh(
      new THREE.CylinderGeometry(radius, radius, tubeLength, 28, 1, true),
      material
    );
    group.add(tube);

    return group;
  }

  const root = new THREE.Group(); // gira com drag/parallax
  scene.add(root);

  const RADIUS = 0.52;
  const TUBE = 1.05;
  const TILT = 0.62; // rad — abertura final das duas metades em "V"

  const left = makeCapsuleHalf(RADIUS, TUBE, CREAM);
  const right = makeCapsuleHalf(RADIUS, TUBE, ORANGE);
  root.add(left, right);

  // Estados fechado → aberto, interpolados por "openT" (0 = cápsula fechada e inteira, 1 = aberta).
  const CLOSED = {
    left: { pos: new THREE.Vector3(0, 0.525, -0.04), rot: 0 },
    right: { pos: new THREE.Vector3(0, -0.525, 0.04), rot: Math.PI },
  };
  const OPEN = {
    left: { pos: new THREE.Vector3(-1.05, 0.65, 0), rot: TILT },
    right: { pos: new THREE.Vector3(1.05, 0.65, 0.1), rot: -TILT },
  };

  const halves = [
    { mesh: left, closed: CLOSED.left, open: OPEN.left, swayAmp: 0.025, swaySpeed: 0.38, swayPhase: 0 },
    { mesh: right, closed: CLOSED.right, open: OPEN.right, swayAmp: 0.028, swaySpeed: 0.33, swayPhase: 1.1 },
  ];

  // Granulado: nasce escondido entre as duas metades e "cai" para a posição final conforme abre.
  const beadFinalSpots = [
    [-0.5, 0.05, 0.25],
    [0.58, -0.05, 0.15],
    [-0.15, -0.25, 0.3],
    [0.2, -0.32, -0.1],
    [-0.35, -0.55, 0.1],
    [0.1, -0.68, 0.3],
    [0.42, -0.6, -0.2],
    [-0.1, -0.95, -0.1],
    [0.25, -1.1, 0.15],
    [-0.3, -1.25, 0.2],
    [0.0, -1.5, 0],
  ];

  const beads = [];
  beadFinalSpots.forEach(([x, y, z], i) => {
    const r = 0.085 + Math.random() * 0.04;
    const mesh = new THREE.Mesh(new THREE.SphereGeometry(r, 16, 16), beadMaterial(CREAM));
    mesh.scale.setScalar(0.001);
    root.add(mesh);
    beads.push({
      mesh,
      hidden: new THREE.Vector3(0, 0.1, 0),
      final: new THREE.Vector3(x, y, z),
      delay: i * 0.035,
      floatSpeed: 0.5 + Math.random() * 0.35,
      floatAmp: 0.05 + Math.random() * 0.04,
      floatPhase: Math.random() * Math.PI * 2,
      spinSpeed: (Math.random() - 0.5) * 0.5,
    });
  });

  function resize() {
    const rect = heroVisual.getBoundingClientRect();
    const w = Math.max(rect.width, 1);
    const h = Math.max(rect.height, 1);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h, false);
  }
  resize();
  window.addEventListener("resize", resize);

  // --- Interação ---
  // Parallax de mouse (ambiente, desligado em reduced-motion).
  const pointerTarget = { x: 0, y: 0 };
  const pointerCurrent = { x: 0, y: 0 };
  if (!reduceMotion) {
    window.addEventListener(
      "pointermove",
      (e) => {
        pointerTarget.x = (e.clientX / window.innerWidth) * 2 - 1;
        pointerTarget.y = (e.clientY / window.innerHeight) * 2 - 1;
      },
      { passive: true }
    );
  }

  // Arraste para girar (ação direta do usuário — mantido mesmo em reduced-motion)
  // + clique (sem arrastar) para fechar e reabrir a cápsula de novo.
  canvas.style.touchAction = "none";
  canvas.classList.add("is-draggable");

  const dragOffset = { x: 0, y: 0 };
  const dragVelocity = { x: 0, y: 0 };
  let isDragging = false;
  let dragMoved = 0;
  let lastPointer = { x: 0, y: 0, t: 0 };

  canvas.addEventListener("pointerdown", (e) => {
    isDragging = true;
    dragMoved = 0;
    dragVelocity.x = 0;
    dragVelocity.y = 0;
    lastPointer = { x: e.clientX, y: e.clientY, t: performance.now() };
    canvas.setPointerCapture(e.pointerId);
    canvas.classList.add("is-dragging");
  });

  canvas.addEventListener("pointermove", (e) => {
    if (!isDragging) return;
    const dx = e.clientX - lastPointer.x;
    const dy = e.clientY - lastPointer.y;
    dragMoved += Math.abs(dx) + Math.abs(dy);
    dragOffset.x += dx * 0.006;
    dragOffset.y += dy * 0.006;
    const now = performance.now();
    const dt = Math.max(now - lastPointer.t, 1);
    dragVelocity.x = dx / dt;
    dragVelocity.y = dy / dt;
    lastPointer = { x: e.clientX, y: e.clientY, t: now };
  });

  function endDrag() {
    if (!isDragging) return;
    isDragging = false;
    canvas.classList.remove("is-dragging");
    if (dragMoved < 6) triggerReplay();
  }
  canvas.addEventListener("pointerup", endDrag);
  canvas.addEventListener("pointercancel", endDrag);

  // --- Abrir/fechar ---
  let openT = reduceMotion ? 1 : 0;
  let targetOpenT = reduceMotion ? 1 : 0;
  let awaitingReopen = false;
  let introScheduled = false;

  function triggerReplay() {
    if (targetOpenT !== 1 || openT < 0.9) return; // só reabre se já estiver aberta
    targetOpenT = 0;
    awaitingReopen = true;
  }

  const clock = new THREE.Clock();
  let elapsed = 0;
  let rafId = null;
  let running = false;

  function animate() {
    rafId = requestAnimationFrame(animate);
    const dt = Math.min(clock.getDelta(), 0.1);
    elapsed += dt;

    // abrir/fechar: suavização exponencial independente de frame rate
    const openRate = reduceMotion ? 12 : 3.4;
    openT += (targetOpenT - openT) * (1 - Math.exp(-openRate * dt));
    if (awaitingReopen && openT < 0.02) {
      awaitingReopen = false;
      targetOpenT = 1;
    }

    halves.forEach(({ mesh, closed, open, swayAmp, swaySpeed, swayPhase }) => {
      mesh.position.lerpVectors(closed.pos, open.pos, openT);
      const sway = reduceMotion ? 0 : Math.sin(elapsed * swaySpeed + swayPhase) * swayAmp * openT;
      mesh.rotation.z = closed.rot + (open.rot - closed.rot) * openT + sway;
    });

    beads.forEach(({ mesh, hidden, final, delay, floatSpeed, floatAmp, floatPhase, spinSpeed }) => {
      const localT = clamp01((openT - 0.3 - delay) / 0.55);
      const eased = easeOutCubic(localT);
      const pos = hidden.clone().lerp(final, eased);
      if (!reduceMotion) {
        pos.y += Math.sin(elapsed * floatSpeed + floatPhase) * floatAmp * eased;
      }
      mesh.position.copy(pos);
      mesh.scale.setScalar(Math.max(eased, 0.001));
      if (!reduceMotion) mesh.rotation.y += spinSpeed * 0.01;
    });

    // parallax ambiente (só quando não está sendo arrastado)
    if (!reduceMotion && !isDragging) {
      pointerCurrent.x += (pointerTarget.x - pointerCurrent.x) * 0.04;
      pointerCurrent.y += (pointerTarget.y - pointerCurrent.y) * 0.04;
    }

    // inércia + retorno suave do arraste quando solto
    if (!isDragging) {
      dragOffset.x += dragVelocity.x * dt * 40;
      dragOffset.y += dragVelocity.y * dt * 40;
      const decay = Math.exp(-3 * dt);
      dragVelocity.x *= decay;
      dragVelocity.y *= decay;
      dragOffset.x += (0 - dragOffset.x) * (1 - Math.exp(-2.2 * dt));
      dragOffset.y += (0 - dragOffset.y) * (1 - Math.exp(-2.2 * dt));
    }
    dragOffset.x = Math.max(-1.1, Math.min(1.1, dragOffset.x));
    dragOffset.y = Math.max(-0.8, Math.min(0.8, dragOffset.y));

    root.rotation.y = pointerCurrent.x * 0.2 + dragOffset.x;
    root.rotation.x = -pointerCurrent.y * 0.12 + dragOffset.y;

    renderer.render(scene, camera);
  }

  function start() {
    if (!introScheduled) {
      introScheduled = true;
      if (!reduceMotion) {
        setTimeout(() => {
          targetOpenT = 1;
        }, 300); // pequena pausa dramática antes de abrir
      }
    }
    if (running) return;
    running = true;
    clock.start();
    animate();
  }

  function stop() {
    running = false;
    if (rafId !== null) cancelAnimationFrame(rafId);
    rafId = null;
  }

  // Pausa o loop quando o hero sai da viewport (economia real de GPU/CPU, não só visual).
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => (entry.isIntersecting ? start() : stop()));
    },
    { threshold: 0.05 }
  );
  io.observe(document.querySelector(".hero"));

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) stop();
    else if (!document.hidden && heroVisual.getBoundingClientRect().bottom > 0) start();
  });

  // Sucesso: esconde o PNG, o canvas assume.
  fallbackImg.classList.add("is-hidden");
  canvas.classList.add("is-ready");
})();
