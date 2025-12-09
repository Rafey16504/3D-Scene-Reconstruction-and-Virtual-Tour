// =====================================================
//  LIBRARY INJECTION (THREE, GLTFLoader, OrbitControls)
// =====================================================
let THREE, GLTFLoader, OrbitControls;
let isPointerLocked = false;
let lookSensitivity = 0.002;
let yaw = 0;        // Left-right rotation
let pitch = 0;      // Up-down rotation
let moveForward = false;
let moveBackward = false;
let moveLeft = false;
let moveRight = false;

const speed = 0.07;          // walking speed
const lookSpeed = 0.002;     // mouse sensitivity
let pointerLocked = false;


export function setLibs(_THREE, _GLTFLoader, _OrbitControls) {
    THREE = _THREE;
    GLTFLoader = _GLTFLoader;
    OrbitControls = _OrbitControls;
}

// =====================================================
//  GLOBALS (no THREE.* objects here!)
// =====================================================
export let scene, camera, renderer, controls;
export let cameraNodes = [];

let raycaster;  // created in init()
let mouse;      // created in init()

// WASD state
let walkMode = false;
let keys = {};
const walkSpeed = 0.05;


// =====================================================
// INIT
// =====================================================
export function init() {

    // REQUIRE libs to be set
    console.log("THREE loaded?", THREE);
    console.log("GLTFLoader loaded?", GLTFLoader);
    console.log("OrbitControls loaded?", OrbitControls);

    // ---------------- SCENE ----------------
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x111111);

    // ---------------- CAMERA ----------------
    camera = new THREE.PerspectiveCamera(
        70,
        window.innerWidth / window.innerHeight,
        0.01,
        500
    );
    camera.position.set(0, 2, 5);

    // ---------------- RENDERER ----------------
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // ---------------- CONTROLS ----------------
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    // ---------------- LIGHT ----------------
    scene.add(new THREE.AmbientLight(0xffffff, 1.0));

    // ---------------- RAYCASTER + MOUSE ----------------
    raycaster = new THREE.Raycaster();
    mouse = new THREE.Vector2();

    // Enable pointer lock for mouse-look
renderer.domElement.addEventListener("click", () => {
    if (walkMode) {
        renderer.domElement.requestPointerLock();
    }
});

// Pointer lock change event
document.addEventListener("pointerlockchange", () => {
    isPointerLocked = (document.pointerLockElement === renderer.domElement);
});
renderer.domElement.addEventListener("click", () => {
    if (!walkMode) return;       // Only lock in walk mode
    if (document.pointerLockElement !== renderer.domElement) {
        renderer.domElement.requestPointerLock();
    }
});


document.addEventListener("pointerlockchange", () => {
    pointerLocked = (document.pointerLockElement === renderer.domElement);
});

renderer.domElement.addEventListener("pointerdown", (e) => {
    if (walkMode) {
        e.stopImmediatePropagation();
        return;
    }
}, { capture: true });

renderer.domElement.addEventListener("pointermove", (e) => {
    if (walkMode) {
        e.stopImmediatePropagation();
        return;
    }
}, { capture: true });

renderer.domElement.addEventListener("pointerup", (e) => {
    if (walkMode) {
        e.stopImmediatePropagation();
        return;
    }
}, { capture: true });


    // ---------------- EVENTS ----------------
    window.addEventListener("resize", handleResize);
    window.addEventListener("click", onClick);
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);

    console.log("Init complete");
}


// =====================================================
// WINDOW RESIZE
// =====================================================
function handleResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function onMouseMove(e) {
    if (!walkMode || !isPointerLocked) return;

    const movementX = e.movementX || 0;
    const movementY = e.movementY || 0;

    // Horizontal rotation (Y-axis)
    camera.rotation.y -= movementX * lookSensitivity;

    // Vertical rotation (X-axis)
    camera.rotation.x -= movementY * lookSensitivity;

    // Clamp vertical rotation to avoid flipping
    camera.rotation.x = Math.max(-Math.PI/2, Math.min(Math.PI/2, camera.rotation.x));
}

document.addEventListener("mousemove", onMouseMove);

document.addEventListener("mousemove", (event) => {
    if (!walkMode || !pointerLocked) return;

    yaw -= event.movementX * lookSpeed;
    pitch -= event.movementY * lookSpeed;

    // Clamp looking up/down so camera doesn’t flip over
    pitch = Math.max(-Math.PI/2, Math.min(Math.PI/2, pitch));

    camera.rotation.set(pitch, yaw, 0);
});

// =====================================================
// LOAD MODEL
// =====================================================
export function loadModel() {
    const loader = new GLTFLoader();

    loader.load("model/room_goodmodel.glb", (gltf) => {
        scene.add(gltf.scene);
        console.log("Model loaded");
    });
}


// =====================================================
// LOAD CAMERA NODES
// =====================================================
export async function loadCameras() {
    try {
        const res = await fetch("./cameras/cameras.json");
        const data = await res.json();

        const cams = data.document.chunk.cameras.camera;

        const sphereGeo = new THREE.SphereGeometry(0.12, 16, 16);
        const sphereMat = new THREE.MeshBasicMaterial({ color: 0x00ff00 });

        cams.forEach(cam => {

            // ---- 1) Skip cameras that have no transform ----
            if (!cam.transform) {
                // console.log("Skipping, no transform:", cam);
                return;
            }

            let vals = null;

            // ---- 2) transform may be an array of numbers ----
            if (Array.isArray(cam.transform)) {
                vals = cam.transform;

            // ---- 3) transform may be stored as "#text" ----
            } else if (typeof cam.transform["#text"] === "string") {
                vals = cam.transform["#text"]
                    .trim()
                    .split(/\s+/)
                    .map(Number);

            // ---- 4) transform may be stored as "value" ----
            } else if (typeof cam.transform.value === "string") {
                vals = cam.transform.value
                    .trim()
                    .split(/\s+/)
                    .map(Number);
            }

            // If still invalid, skip
            if (!vals || vals.length !== 16 || vals.some(isNaN)) {
                console.warn("Invalid transform for camera", cam);
                return;
            }

            // Build Matrix4
            const mat4 = new THREE.Matrix4().fromArray(vals);

            // Create sphere node
            const node = new THREE.Mesh(sphereGeo, sphereMat);
            node.applyMatrix4(mat4);
            node.userData.cam = cam;

            scene.add(node);
            cameraNodes.push(node);
        });

        console.log("Loaded VALID camera nodes:", cameraNodes.length);

    } catch (err) {
        console.error("Camera load error:", err);
    }
}



// =====================================================
// CLICK TO TELEPORT
// =====================================================
function onClick(event) {

    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);

    const hits = raycaster.intersectObjects(cameraNodes);

    if (hits.length > 0) {
        goToCamera(hits[0].object.userData.cam);
    }
}


// =====================================================
// TELEPORT ANIMATION
// =====================================================
function goToCamera(cam) {

    let vals = extractTransform(cam);  // use your transform parser
    if (!vals) return;

    const mat4 = new THREE.Matrix4().fromArray(vals);

    const targetPos = new THREE.Vector3().setFromMatrixPosition(mat4);
    const targetQuat = new THREE.Quaternion().setFromRotationMatrix(mat4);

    const startPos = camera.position.clone();
    const startQuat = camera.quaternion.clone();

    const duration = 1.2;
    const startTime = performance.now();

    function animateMove() {
        const t = Math.min((performance.now() - startTime) / (duration * 1000), 1);

        camera.position.lerpVectors(startPos, targetPos, t);
        camera.quaternion.slerpQuaternions(startQuat, targetQuat, t);

        if (t < 1) requestAnimationFrame(animateMove);
    }

    animateMove();
}




// =====================================================
// WALK MODE (WASD)
// =====================================================
function onKeyDown(event) {
    switch (event.key.toLowerCase()) {
        case "w": moveForward = true; break;
        case "s": moveBackward = true; break;
        case "a": moveLeft = true; break;
        case "d": moveRight = true; break;
        case "f":
            walkMode = !walkMode;
            controls.enabled = !walkMode;
            console.log("Walk Mode:", walkMode ? "ON" : "OFF");
            break;
    }
}

function onKeyUp(event) {
    switch (event.key.toLowerCase()) {
        case "w": moveForward = false; break;
        case "s": moveBackward = false; break;
        case "a": moveLeft = false; break;
        case "d": moveRight = false; break;
    }
}


function updateWalkMode() {
    if (!walkMode) return;

    const forward = new THREE.Vector3(
        Math.sin(yaw),
        0,
        Math.cos(yaw)
    );

    const right = new THREE.Vector3(
        Math.sin(yaw + Math.PI / 2),
        0,
        Math.cos(yaw + Math.PI / 2)
    );

    let moveDir = new THREE.Vector3();

    if (moveForward)  moveDir.add(forward);
    if (moveBackward) moveDir.sub(forward);
    if (moveLeft)     moveDir.sub(right);
    if (moveRight)    moveDir.add(right);

    if (moveDir.lengthSq() > 0) {
        moveDir.normalize();
        camera.position.addScaledVector(moveDir, speed);
    }
}



// =====================================================
// ANIMATION LOOP
// =====================================================
export function animate() {
    requestAnimationFrame(animate);

    if (controls.enabled) controls.update();

    if (walkMode) updateWalkMode();


    renderer.render(scene, camera);
}
