"use strict";

const content = {
  campus: {
    label: "STUDENT SCENE", title: "Meet Maya", stage: "Campus life",
    description: "Maya is a fictional college student with type 1 diabetes. Explore her devices and follow the feedback loop through a day on campus.",
    parts: [
      ["Glucose monitor", "The wearable sensor sends glucose estimates and trends to the pump. The green pulses represent wireless data."],
      ["Insulin pump", "Maya wears the pump at her waist. Its controller uses CGM readings to adjust background insulin delivery."],
      ["Infusion site", "The tubing carries insulin to a soft cannula beneath the skin. Blue pulses show the delivery path."],
      ["Phone app", "Maya can check her glucose trend and see pump information on her phone. The pump runs the automated control algorithm."]
    ],
    moments: [
      ["Between classes", "While Maya crosses campus, the CGM keeps sending readings. The pump can adjust background delivery as her glucose trend changes."],
      ["Lunch break", "Maya checks her trend and uses her pump to give a meal bolus. The automated loop keeps updating as new readings arrive."],
      ["Study time", "During a study session, Maya can glance at the trend and respond to alerts while the pump continues adjusting background delivery."]
    ]
  },
  pump: {
    label: "DEVICE MODEL", title: "Tandem Mobi", stage: "Insulin pump",
    description: "A wearable insulin pump delivers background insulin and boluses through an infusion set. Open the cutaway to explore its components.",
    parts: [
      ["Outer housing", "The shell protects the pump electronics and drive system. The Mobi uses a companion mobile app for its on-screen controls."],
      ["Insulin cartridge", "This replaceable reservoir holds the insulin the pump delivers. The top connector joins the cartridge to the infusion tubing."],
      ["Tubing and infusion set", "Insulin travels through the tubing to the infusion site, where a small cannula delivers it under the skin."],
      ["Controller board", "The pump receives compatible CGM readings wirelessly. Control-IQ predicts glucose about 30 minutes ahead and can adjust background delivery or give an automatic correction when conditions are met."],
      ["Drive mechanism", "The drive moves insulin from the cartridge in controlled increments. Its geometry here is schematic."],
      ["Rechargeable battery", "The battery powers the electronics, wireless communication, and insulin delivery mechanism."]
    ]
  },
  cgm: {
    label: "DEVICE MODEL", title: "Dexcom G6", stage: "Glucose monitor",
    description: "A continuous glucose monitor estimates glucose in the fluid beneath the skin. The G6 transmitter sends a reading about every five minutes.",
    parts: [
      ["Transmitter", "The reusable transmitter snaps into the sensor pod and sends glucose estimates wirelessly to a compatible pump or display."],
      ["Sensor pod", "The disposable pod holds the sensing filament and provides the connection to the transmitter."],
      ["Adhesive patch", "The adhesive keeps the pod against the skin during wear."],
      ["Sensing filament", "A tiny filament beneath the skin responds to glucose in interstitial fluid, the fluid around cells."],
      ["Skin cross-section", "The filament sits beneath the surface. This illustrative section shows how it reaches the fluid around cells."]
    ]
  }
};

const element = (id) => document.getElementById(id);
const tabs = [...document.querySelectorAll("[data-scene]")];
let current = "campus";
let opened = false;
let chosen = -1;
let moment = 0;
let models;
let resetView = () => {};

function pressed(button, value) {
  button.setAttribute("aria-pressed", String(value));
}

function makeButton(parent, label, active, activate) {
  const button = document.createElement("button");
  button.textContent = label;
  pressed(button, active);
  button.addEventListener("click", activate);
  parent.append(button);
  return button;
}

function updateDetail() {
  const scene = content[current];
  const detail = scene.parts[chosen] || (current === "campus"
    ? scene.moments[moment]
    : ["Explore the model", "Select a numbered part in the model or in the list to see what it does."]);
  element("detailTitle").textContent = detail[0];
  element("detailText").textContent = detail[1];
  [...element("partList").children].forEach((button, index) => pressed(button, index === chosen));
}

function selectPart(index) {
  chosen = index;
  if ((current === "pump" && index >= 3) || (current === "cgm" && index >= 3)) {
    opened = true;
    pressed(element("actions").firstElementChild, true);
    element("actions").firstElementChild.textContent = "Close cutaway";
  }
  updateDetail();
}

function selectScene(name) {
  current = name;
  opened = false;
  chosen = -1;
  const scene = content[name];
  tabs.forEach((button) => pressed(button, button.dataset.scene === name));
  element("stageTitle").textContent = scene.stage;
  element("sectionType").textContent = scene.label;
  element("sceneTitle").textContent = scene.title;
  element("sceneDescription").textContent = scene.description;
  const actions = element("actions");
  const list = element("partList");
  actions.replaceChildren();
  list.replaceChildren();
  if (name === "campus") {
    scene.moments.forEach(([title], index) => makeButton(actions, title, index === moment, () => {
      moment = index;
      chosen = -1;
      [...actions.children].forEach((button, i) => pressed(button, i === moment));
      updateDetail();
    }));
  } else {
    const toggle = makeButton(actions, "Open cutaway", false, () => {
      opened = !opened;
      chosen = -1;
      pressed(toggle, opened);
      toggle.textContent = opened ? "Close cutaway" : "Open cutaway";
      updateDetail();
    });
  }
  scene.parts.forEach(([title], index) => {
    const button = makeButton(list, "", false, () => selectPart(index));
    const badge = document.createElement("span");
    const arrow = document.createElement("span");
    badge.textContent = index + 1;
    arrow.textContent = "↗";
    arrow.setAttribute("aria-hidden", "true");
    button.append(badge, document.createTextNode(title), arrow);
  });
  if (models) Object.entries(models).forEach(([key, model]) => { model.root.visible = key === name; });
  resetView();
  updateDetail();
}

tabs.forEach((button) => button.addEventListener("click", () => selectScene(button.dataset.scene)));
selectScene("campus");

function start3D() {
  const T = THREE;
  const vector = (x, y, z) => new T.Vector3(x, y, z);
  const viewport = element("viewport");
  const renderer = new T.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.outputColorSpace = T.SRGBColorSpace;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = T.PCFSoftShadowMap;
  const canvas = renderer.domElement;
  canvas.tabIndex = 0;
  canvas.setAttribute("aria-label", "3D model. Use arrow keys to rotate, plus and minus to zoom, or Home to reset.");
  viewport.prepend(canvas);

  const scene = new T.Scene();
  const camera = new T.PerspectiveCamera(36, 1, 0.1, 100);
  scene.add(new T.HemisphereLight(0xfff5df, 0x526860, 2.1));
  const sun = new T.DirectionalLight(0xffebcd, 3.1);
  sun.position.set(-4, 8, 6);
  sun.castShadow = true;
  sun.shadow.mapSize.set(1024, 1024);
  Object.assign(sun.shadow.camera, { left: -6, right: 6, top: 6, bottom: -6 });
  sun.shadow.normalBias = 0.035;
  scene.add(sun);
  const rim = new T.DirectionalLight(0xc4f2ff, 1.2);
  rim.position.set(6, 4, -4);
  scene.add(rim);

  const material = (color, properties = {}) => new T.MeshStandardMaterial({ color, roughness: 0.62, ...properties });
  const colors = {
    dark: material(0x25292c, { roughness: 0.34 }), gray: material(0x444d52),
    silver: material(0xb0bfc3, { metalness: 0.45, roughness: 0.31 }),
    white: material(0xf7f6ef), patch: material(0xded8ce), aqua: material(0x70d1df),
    glass: material(0xd2f1f2, { transparent: true, opacity: 0.36, depthWrite: false }),
    green: material(0x266654), gold: material(0xdbac56, { metalness: 0.35 }),
    skin: material(0xad6444), hair: material(0x30201c), jacket: material(0x356b58),
    shirt: material(0xede2c5), jeans: material(0x3b4d61), shoe: material(0xefe9d9),
    brick: material(0xc17d5e), stone: material(0xf1dec2), window: material(0x507774),
    grass: material(0x8ba480), ground: material(0xcabfa9)
  };

  function group(parent, x = 0, y = 0, z = 0) {
    const node = new T.Group();
    parent.add(node);
    node.position.set(x, y, z);
    return node;
  }

  function mesh(parent, geometry, finish, x, y, z) {
    const node = new T.Mesh(geometry, finish);
    node.position.set(x, y, z);
    node.castShadow = !finish.transparent;
    node.receiveShadow = true;
    parent.add(node);
    return node;
  }

  function rounded(parent, w, h, d, radius, finish, x = 0, y = 0, z = 0) {
    const a = w / 2, b = h / 2, r = radius;
    const shape = new T.Shape();
    shape.moveTo(-a + r, -b);
    shape.lineTo(a - r, -b);
    shape.quadraticCurveTo(a, -b, a, -b + r);
    shape.lineTo(a, b - r);
    shape.quadraticCurveTo(a, b, a - r, b);
    shape.lineTo(-a + r, b);
    shape.quadraticCurveTo(-a, b, -a, b - r);
    shape.lineTo(-a, -b + r);
    shape.quadraticCurveTo(-a, -b, -a + r, -b);
    const bevel = Math.min(d * 0.16, 0.038);
    const geometry = new T.ExtrudeGeometry(shape, {
      depth: d - 2 * bevel, bevelEnabled: true, bevelSize: bevel,
      bevelThickness: bevel, bevelSegments: 3, curveSegments: 8, steps: 1
    });
    geometry.translate(0, 0, -d / 2 + bevel);
    return mesh(parent, geometry, finish, x, y, z);
  }

  function ball(parent, finish, x, y, z, sx, sy = sx, sz = sx) {
    const node = mesh(parent, new T.SphereGeometry(1, 24, 16), finish, x, y, z);
    node.scale.set(sx, sy, sz);
    return node;
  }

  function rod(parent, start, end, radius, finish, tip = radius) {
    const a = vector(...start), b = vector(...end), axis = b.clone().sub(a);
    const middle = a.clone().lerp(b, 0.5);
    const node = mesh(parent, new T.CylinderGeometry(tip, radius, axis.length(), 24), finish, ...middle.toArray());
    node.quaternion.setFromUnitVectors(vector(0, 1, 0), axis.normalize());
    return node;
  }

  function path(parent, points, radius, finish) {
    const curve = new T.CatmullRomCurve3(points.map((point) => vector(...point)));
    mesh(parent, new T.TubeGeometry(curve, 48, radius, 9, false), finish, 0, 0, 0);
    return curve;
  }

  function texture(width, height, paint) {
    const surface = document.createElement("canvas");
    surface.width = width;
    surface.height = height;
    paint(surface.getContext("2d"));
    const map = new T.CanvasTexture(surface);
    map.colorSpace = T.SRGBColorSpace;
    return map;
  }

  function label(parent, title, width, x, y, z, ink = "#233637") {
    const map = texture(512, 100, (ctx) => {
      ctx.fillStyle = ink;
      ctx.font = "bold 54px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(title, 256, 50);
    });
    const plane = new T.Mesh(new T.PlaneGeometry(width, width * 100 / 512),
      new T.MeshBasicMaterial({ map, transparent: true, depthWrite: false }));
    plane.position.set(x, y, z);
    parent.add(plane);
  }

  const badgeMaps = [];
  function marker(parent, list, index, x, y, z, size = 0.27) {
    badgeMaps[index] ||= texture(128, 128, (ctx) => {
      ctx.fillStyle = "#225747";
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 8;
      ctx.beginPath();
      ctx.arc(64, 64, 54, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 64px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(index + 1, 64, 67);
    });
    const sprite = new T.Sprite(new T.SpriteMaterial({
      map: badgeMaps[index], depthTest: false, depthWrite: false
    }));
    sprite.userData.part = index;
    sprite.position.set(x, y, z);
    sprite.scale.set(size, size, 1);
    sprite.renderOrder = 10;
    parent.add(sprite);
    list.push(sprite);
    return sprite;
  }

  function platform(parent, radius, top, base) {
    rod(parent, [0, top - 0.22, 0], [0, top, 0], radius, base);
  }

  function pumpBody(parent) {
    rounded(parent, 1.48, 1.9, 0.38, 0.2, colors.dark, 0, 0, -0.25);
    rounded(parent, 1.42, 1.05, 0.23, 0.12, colors.dark, 0, -0.39, 0.18);
    rounded(parent, 0.53, 0.85, 0.25, 0.08, colors.dark, -0.43, 0.53, 0.15);
    rounded(parent, 0.75, 0.74, 0.27, 0.12, colors.glass, 0.29, 0.56, 0.14);
    rounded(parent, 0.58, 0.46, 0.12, 0.09, colors.aqua, 0.29, 0.44, 0.15);
    rod(parent, [0.34, 0.82, 0.15], [0.34, 1.13, 0.15], 0.10, colors.silver);
  }

  function pumpModel() {
    const root = group(scene), markers = [];
    platform(root, 2.25, -1.28, colors.ground);
    pumpBody(root);
    const cover = group(root);
    rounded(cover, 1.43, 1.06, 0.12, 0.12, colors.dark, 0, -0.39, 0.36);
    rounded(cover, 0.53, 0.86, 0.11, 0.09, colors.dark, -0.43, 0.51, 0.34);
    label(cover, "MOBI", 0.63, -0.12, -0.55, 0.428, "#e6ecec");
    ball(cover, colors.aqua, -0.48, -0.05, 0.425, 0.032);
    marker(cover, markers, 0, -0.54, -0.63, 0.57);
    marker(root, markers, 1, 0.64, 0.65, 0.49);
    const internals = group(root, 0, 0, 0.36);
    rounded(internals, 1.24, 0.89, 0.09, 0.11, colors.green, 0, -0.38);
    rounded(internals, 0.31, 0.29, 0.08, 0.035, colors.dark, -0.38, -0.32, 0.075);
    for (let i = 0; i < 5; i++) {
      rounded(internals, 0.022, 0.085, 0.02, 0.005, colors.gold, -0.49 + i * 0.055, -0.52, 0.063);
      rounded(internals, 0.022, 0.085, 0.02, 0.005, colors.gold, -0.49 + i * 0.055, -0.12, 0.063);
    }
    rounded(internals, 0.39, 0.50, 0.115, 0.055, colors.silver, 0.34, -0.55, 0.09);
    rod(internals, [0.30, -0.26, 0.14], [0.30, 0.16, 0.14], 0.1, colors.gold);
    for (let i = 0; i < 5; i++) {
      rod(internals, [0.30, -0.22 + i * 0.066, 0.14], [0.30, -0.19 + i * 0.066, 0.14], 0.125, colors.silver);
    }
    marker(internals, markers, 3, -0.48, -0.23, 0.37);
    marker(internals, markers, 4, 0.36, 0.12, 0.37);
    marker(internals, markers, 5, 0.37, -0.68, 0.37);
    const tube = path(root, [[0.34,1.13,0.15],[0.56,1.53,0.2],[1.23,1.32,0.22],[1.52,0.55,0.27],[1.43,-0.48,0.35],[1.55,-0.92,0.43]], 0.026, colors.aqua);
    rod(root, [1.55,-1.24,0.43], [1.55,-1.1,0.43], 0.29, colors.patch);
    rod(root, [1.55,-1.1,0.43], [1.55,-0.97,0.43], 0.15, colors.white);
    marker(root, markers, 2, 1.73, -0.55, 0.51);
    return { root, markers, cover, internals, tube };
  }

  function cgmShell(parent) {
    rounded(parent, 2.12, 1.15, 0.12, 0.53, colors.patch, 0, 0, 0);
    rounded(parent, 1.62, 0.76, 0.15, 0.32, colors.silver, 0.06, 0.04, 0.13);
    rounded(parent, 1.44, 0.62, 0.19, 0.29, colors.white, 0.08, 0.05, 0.29);
  }

  function cgmModel() {
    const root = group(scene), markers = [];
    platform(root, 2.2, -1.42, colors.ground);
    const skin = group(root, 0, -0.21, -0.23);
    rounded(skin, 2.78, 1.83, 0.34, 0.21, material(0xf5b98f));
    rounded(skin, 2.74, 1.77, 0.12, 0.2, material(0xe8a17d), 0, 0, -0.21);
    rounded(skin, 2.68, 1.70, 0.13, 0.19, material(0xf1c270), 0, 0, -0.32);
    const patch = group(root);
    rounded(patch, 2.12, 1.15, 0.12, 0.53, colors.patch);
    for (let row = -2; row <= 2; row++) {
      for (let col = -6; col <= 6; col++) {
        if (Math.abs(col) + Math.abs(row) > 7) continue;
        ball(patch, colors.white, col * 0.147, row * 0.196, 0.064, 0.012);
      }
    }
    marker(patch, markers, 2, -1.02, -0.27, 0.17);
    const pod = group(root, 0, 0, 0.13);
    rounded(pod, 1.62, 0.76, 0.15, 0.32, colors.silver, 0.06, 0.04, 0);
    rounded(pod, 1.29, 0.47, 0.04, 0.21, colors.gray, 0.08, 0.04, 0.081);
    for (let i = 0; i < 3; i++) ball(pod, colors.gold, -0.24 + i * 0.13, 0.04, 0.11, 0.038, 0.038, 0.02);
    marker(pod, markers, 1, 0.78, -0.23, 0.22);
    const cover = group(root, 0, 0, 0.29);
    rounded(cover, 1.44, 0.62, 0.19, 0.29, colors.white, 0.08, 0.05, 0);
    label(cover, "dexcom G6", 0.97, 0.07, 0.05, 0.097);
    marker(cover, markers, 0, 0.66, 0.33, 0.19);
    const internals = group(root);
    path(internals, [[0.12,-0.06,0.11],[0.12,-0.33,-0.17],[0.18,-0.68,-0.27]], 0.027, colors.gold);
    marker(internals, markers, 3, 0.15, -0.63, 0.19);
    marker(internals, markers, 4, 1.22, -0.80, 0.02);
    return { root, markers, cover, internals, pod, patch };
  }

  function campusModel() {
    const root = group(scene), markers = [];
    platform(root, 2.86, 0, colors.grass);
    const plaza = rod(root, [0,-0.026,0.36], [0,0.016,0.36], 2.05, colors.ground);
    plaza.scale.z = 0.69;
    const library = group(root, -1.18, 0, -1.25);
    rounded(library, 2.10, 1.03, 0.79, 0.055, colors.brick, 0, 0.55, 0);
    rounded(library, 2.22, 0.13, 0.91, 0.035, colors.stone, 0, 1.10, 0);
    rounded(library, 0.42, 0.72, 0.05, 0.045, colors.window, 0, 0.38, 0.42);
    for (const x of [-0.73, -0.4, 0.4, 0.73]) {
      rounded(library, 0.20, 0.43, 0.05, 0.03, colors.stone, x, 0.59, 0.41);
      rounded(library, 0.14, 0.35, 0.02, 0.02, colors.window, x, 0.59, 0.445);
    }
    label(library, "CAMPUS LIBRARY", 1.08, 0, 0.94, 0.42, "#fff4d9");
    for (const [x, z, scale] of [[1.92,-1.05,1],[-2.17,0.18,0.78],[1.9,0.72,0.53]]) {
      rod(root, [x,0,z], [x,0.85 * scale,z], 0.08 * scale, colors.hair);
      ball(root, colors.jacket, x, 1.03 * scale, z, 0.47 * scale, 0.6 * scale, 0.46 * scale);
      ball(root, colors.grass, x - 0.20 * scale, 0.98 * scale, z + 0.14 * scale, 0.33 * scale);
    }

    const student = group(root, 0.36, 0.03, 0.72);
    rounded(student, 0.68, 0.91, 0.39, 0.17, colors.jacket, 0, 1.58, 0);
    rounded(student, 0.31, 0.77, 0.065, 0.1, colors.shirt, 0, 1.59, 0.21);
    rounded(student, 0.55, 0.33, 0.33, 0.13, colors.jeans, 0, 1.08, 0);
    for (const side of [-1, 1]) {
      rod(student, [side * 0.145,1.12,0], [side * 0.20,0.21,0.03], 0.122, colors.jeans, 0.156);
      rounded(student, 0.25, 0.17, 0.42, 0.074, colors.shoe, side * 0.20, 0.11, 0.13);
    }
    rod(student, [0,1.96,0], [0,2.17,0], 0.105, colors.skin);
    ball(student, colors.hair, 0, 2.30, -0.055, 0.31, 0.39, 0.245);
    ball(student, colors.hair, 0.11, 2.59, -0.13, 0.20, 0.18, 0.19);
    ball(student, colors.skin, 0, 2.29, 0.075, 0.254, 0.305, 0.226);
    for (const side of [-1, 1]) {
      ball(student, colors.hair, side * 0.091, 2.32, 0.285, 0.025, 0.017, 0.015);
      ball(student, colors.skin, side * 0.25, 2.28, 0.086, 0.045, 0.071, 0.046);
      ball(student, colors.gold, side * 0.26, 2.23, 0.122, 0.022);
    }
    ball(student, colors.skin, 0, 2.263, 0.30, 0.046, 0.038, 0.04);
    path(student, [[-0.071,2.205,0.279],[0,2.184,0.289],[0.071,2.205,0.279]], 0.011, colors.hair);
    ball(student, colors.hair, -0.046, 2.51, 0.122, 0.26, 0.11, 0.17).rotation.z = 0.28;
    rounded(student, 0.63, 0.76, 0.31, 0.17, colors.gold, 0, 1.61, -0.30);
    for (const side of [-1, 1]) {
      path(student, [[side*0.22,1.25,0.19],[side*0.24,1.58,0.25],[side*0.23,1.92,0.18],[side*0.23,2.02,-0.07],[side*0.23,1.88,-0.39]], 0.039, colors.gold);
    }
    rod(student, [-0.33,1.86,0], [-0.49,1.46,0.08], 0.102, colors.jacket, 0.121);
    rod(student, [-0.49,1.46,0.08], [-0.43,1.18,0.20], 0.072, colors.skin, 0.065);
    ball(student, colors.skin, -0.43, 1.16, 0.20, 0.08);
    rod(student, [0.33,1.86,0], [0.50,1.52,0.12], 0.103, colors.jacket, 0.124);
    rod(student, [0.50,1.52,0.12], [0.57,1.66,0.46], 0.071, colors.skin, 0.064);
    ball(student, colors.skin, 0.57, 1.66, 0.47, 0.087);
    const phone = group(student, 0.58, 1.75, 0.48);
    phone.rotation.z = -0.16;
    rounded(phone, 0.22, 0.39, 0.058, 0.041, colors.dark);
    rounded(phone, 0.176, 0.325, 0.012, 0.025, colors.white, 0, 0, 0.033);
    path(phone, [[-0.067,-0.04,0.045],[-0.023,-0.02,0.045],[0.015,-0.052,0.045],[0.069,0.011,0.045]], 0.009, colors.green);

    const monitor = group(student, -0.40, 1.70, 0.103);
    monitor.scale.setScalar(0.138);
    cgmShell(monitor);
    const pump = group(student, 0.29, 1.08, 0.215);
    pump.scale.setScalar(0.17);
    pumpBody(pump);
    rounded(student, 0.22, 0.16, 0.038, 0.068, colors.patch, -0.045, 1.18, 0.24);
    rounded(student, 0.105, 0.08, 0.048, 0.035, colors.white, -0.045, 1.18, 0.269);
    const wireless = path(student, [[-0.41,1.7,0.17],[-0.62,1.35,0.28],[-0.24,0.90,0.40],[0.18,0.90,0.38],[0.29,1.08,0.29]], 0.008,
      material(0x49b677, { transparent: true, opacity: 0.45 }));
    const delivery = path(student, [[0.35,1.27,0.24],[0.24,1.38,0.34],[0.06,1.33,0.38],[-0.045,1.18,0.29]], 0.016, colors.aqua);
    marker(student, markers, 0, -0.63, 1.84, 0.32, 0.22);
    marker(student, markers, 1, 0.47, 0.96, 0.44, 0.22);
    marker(student, markers, 2, -0.21, 1.19, 0.43, 0.22);
    marker(student, markers, 3, 0.82, 1.81, 0.52, 0.22);

    const props = [group(root, -1.31, 0.03, 0.82), group(root, -1.31, 0.03, 0.82), group(root, -1.31, 0.03, 0.82)];
    const bench = props[0];
    for (const x of [-0.43,0.43]) rod(bench, [x,0,0], [x,0.31,0], 0.046, colors.gray);
    rounded(bench, 1.15, 0.11, 0.41, 0.035, colors.brick, 0, 0.33, 0);
    rounded(bench, 1.15, 0.27, 0.09, 0.035, colors.brick, 0, 0.53, -0.17);
    for (const prop of props.slice(1)) {
      rod(prop, [0,0,0], [0,0.69,0], 0.074, colors.gray);
      rod(prop, [0,0.65,0], [0,0.74,0], 0.46, colors.stone);
    }
    rod(props[1], [0,0.74,0], [0,0.78,0], 0.22, colors.white);
    const sandwich = rounded(props[1], 0.28, 0.21, 0.13, 0.06, colors.gold, 0, 0.85, 0);
    sandwich.rotation.x = -Math.PI / 2;
    const book = rounded(props[2], 0.42, 0.31, 0.07, 0.027, colors.jacket, 0, 0.79, 0);
    book.rotation.x = -Math.PI / 2;
    const pulses = [wireless, delivery].map((curve, index) => ({
      curve, beads: Array.from({ length: 3 }, () => ball(student, material(index ? 0x36baff : 0x6bec98, {
        emissive: index ? 0x08699d : 0x23864a, emissiveIntensity: 0.65
      }), 0, 0, 0, 0.034))
    }));
    return { root, markers, props, pulses };
  }

  models = { campus: campusModel(), pump: pumpModel(), cgm: cgmModel() };
  const ray = new T.Raycaster();
  const target = new T.Vector3();
  const keys = { ArrowLeft: [-0.15,0], ArrowRight: [0.15,0], ArrowUp: [0,-0.13], ArrowDown: [0,0.13] };
  let heading, tilt, zoom;
  const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
  const pointers = new Map();
  let movement = 0;

  resetView = () => {
    heading = current === "campus" ? 0.36 : 0.35;
    tilt = current === "campus" ? 0.25 : 0.22;
    zoom = 1;
  };

  function changeZoom(factor) {
    zoom = T.MathUtils.clamp(zoom * factor, 0.47, 1.75);
  }

  function orbit(dx, dy) {
    heading -= dx;
    tilt = T.MathUtils.clamp(tilt + dy, -1.16, 1.39);
  }

  function pick(event) {
    const bounds = canvas.getBoundingClientRect();
    const point = new T.Vector2(
      (event.clientX - bounds.left) / bounds.width * 2 - 1,
      1 - (event.clientY - bounds.top) / bounds.height * 2
    );
    ray.setFromCamera(point, camera);
    const candidates = models[current].markers.filter((badge) => badge.visible && badge.parent.visible);
    const hit = ray.intersectObjects(candidates, false)[0];
    if (hit) selectPart(hit.object.userData.part);
  }

  canvas.addEventListener("pointerdown", (event) => {
    if (event.button !== 0) return;
    if (!pointers.size) movement = 0;
    if (pointers.size) movement = 10;
    pointers.set(event.pointerId, [event.clientX, event.clientY]);
    canvas.setPointerCapture(event.pointerId);
  });
  canvas.addEventListener("pointermove", (event) => {
    const previous = pointers.get(event.pointerId);
    if (!previous) return;
    const dx = event.clientX - previous[0], dy = event.clientY - previous[1];
    movement += Math.hypot(dx, dy);
    const next = [event.clientX, event.clientY];
    if (pointers.size === 2) {
      const other = [...pointers].find(([id]) => id !== event.pointerId)[1];
      const before = Math.hypot(previous[0] - other[0], previous[1] - other[1]);
      const after = Math.hypot(next[0] - other[0], next[1] - other[1]);
      if (before > 3 && after > 3) changeZoom(before / after);
    } else if (pointers.size === 1) orbit(dx * 0.008, dy * 0.008);
    pointers.set(event.pointerId, next);
  });
  canvas.addEventListener("pointerup", (event) => {
    if (pointers.has(event.pointerId) && movement < 5) pick(event);
    pointers.delete(event.pointerId);
  });
  canvas.addEventListener("lostpointercapture", (event) => pointers.delete(event.pointerId));
  canvas.addEventListener("wheel", (event) => {
    event.preventDefault();
    changeZoom(Math.exp(Math.max(-200, Math.min(200, event.deltaY)) * 0.0015));
  }, { passive: false });
  canvas.addEventListener("keydown", (event) => {
    if (keys[event.key]) orbit(...keys[event.key]);
    else if (event.key === "+" || event.key === "=") changeZoom(0.85);
    else if (event.key === "-") changeZoom(1.18);
    else if (event.key === "Home") resetView();
    else return;
    event.preventDefault();
  });
  element("zoomIn").onclick = () => changeZoom(0.85);
  element("zoomOut").onclick = () => changeZoom(1.18);
  element("reset").onclick = () => resetView();
  canvas.addEventListener("webglcontextlost", (event) => {
    event.preventDefault();
    element("renderError").hidden = false;
  });
  canvas.addEventListener("webglcontextrestored", () => { element("renderError").hidden = true; });

  function resize() {
    const width = viewport.clientWidth, height = viewport.clientHeight;
    if (!width || !height) return;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height, false);
  }
  new ResizeObserver(resize).observe(viewport);
  resize();
  selectScene(current);

  function render(milliseconds) {
    const model = models[current];
    const campus = current === "campus";
    const fit = Math.max(1, 1.22 / camera.aspect);
    const distance = (campus ? 8.9 : 6.9) * zoom * fit;
    target.set(0, campus ? 1.15 : -0.03, 0);
    camera.position.set(
      target.x + distance * Math.sin(heading) * Math.cos(tilt),
      target.y + distance * Math.sin(tilt),
      target.z + distance * Math.cos(heading) * Math.cos(tilt)
    );
    camera.lookAt(target);
    const speed = reducedMotion.matches ? 1 : 0.14;
    if (campus) {
      model.props.forEach((prop, i) => { prop.visible = moment === i; });
      model.pulses.forEach(({ curve, beads }, i) => beads.forEach((bead, j) => {
        const phase = reducedMotion.matches ? 0 : milliseconds * (i ? 0.00048 : 0.00026);
        bead.position.copy(curve.getPointAt((phase + j / beads.length) % 1));
      }));
    } else {
      model.internals.visible = opened;
      if (current === "pump") {
        model.cover.position.x = T.MathUtils.lerp(model.cover.position.x, opened ? -1.39 : 0, speed);
        model.cover.position.z = T.MathUtils.lerp(model.cover.position.z, opened ? 0.30 : 0, speed);
      } else {
        model.cover.position.y = T.MathUtils.lerp(model.cover.position.y, opened ? 0.97 : 0, speed);
        model.cover.position.z = T.MathUtils.lerp(model.cover.position.z, opened ? 0.87 : 0.29, speed);
        model.pod.position.y = T.MathUtils.lerp(model.pod.position.y, opened ? 0.33 : 0, speed);
        model.pod.position.z = T.MathUtils.lerp(model.pod.position.z, opened ? 0.49 : 0.13, speed);
        model.patch.position.z = T.MathUtils.lerp(model.patch.position.z, opened ? 0.18 : 0, speed);
      }
    }
    model.markers.forEach((badge) => {
      badge.material.color.set(badge.userData.part === chosen ? 0xffd76f : 0xffffff);
    });
    renderer.render(scene, camera);
  }
  renderer.setAnimationLoop(render);
}

try {
  start3D();
} catch (error) {
  element("renderError").hidden = false;
  for (const id of ["zoomIn", "zoomOut", "reset"]) element(id).disabled = true;
  console.error(error);
}
