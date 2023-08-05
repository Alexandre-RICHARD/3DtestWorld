const movementSpeed = 1.4;
const mouseSensibility = 0.03;
const deadZone = 2;
const axisSize = 100;
const surfaceSize = 64;
const textureSize = 16;

// Set up scene, camera and renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);
camera.position.set(0, 0, 50);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor("#777777");
document.body.appendChild(renderer.domElement);

// Load texture and create infinite plane
const textureLoader = new THREE.TextureLoader();
const texture = textureLoader.load("./testTexture.jpg");

texture.repeat.x = surfaceSize / textureSize;
texture.repeat.z = surfaceSize / textureSize;

const geometry = new THREE.PlaneBufferGeometry(surfaceSize, surfaceSize, surfaceSize - 1, surfaceSize - 1);
const material = new THREE.MeshBasicMaterial({
    map: texture,
    side: THREE.DoubleSide,
});
const plane = new THREE.Mesh(geometry, material);
plane.position.y = 0;
scene.add(plane);

const redMaterial = new THREE.LineBasicMaterial({
    color: 0xff0000,
    linewidth: axisSize,
}); // Matériau rouge pour l'axe x
const greenMaterial = new THREE.LineBasicMaterial({
    color: 0x00ff00,
    linewidth: axisSize,
}); // Matériau vert pour l'axe y
const blueMaterial = new THREE.LineBasicMaterial({
    color: 0x0000ff,
    linewidth: axisSize,
}); // Matériau bleu pour l'axe z

const xGeometry = new THREE.Geometry();
xGeometry.vertices.push(new THREE.Vector3(-500, 0, 0)); // Point de départ de l'axe x
xGeometry.vertices.push(new THREE.Vector3(500, 0, 0)); // Point d'arrivée de l'axe x

const yGeometry = new THREE.Geometry();
yGeometry.vertices.push(new THREE.Vector3(0, -500, 0)); // Point de départ de l'axe y
yGeometry.vertices.push(new THREE.Vector3(0, 500, 0)); // Point d'arrivée de l'axe y

const zGeometry = new THREE.Geometry();
zGeometry.vertices.push(new THREE.Vector3(0, 0, -500)); // Point de départ de l'axe z
zGeometry.vertices.push(new THREE.Vector3(0, 0, 500)); // Point d'arrivée de l'axe z

const xAxis = new THREE.Line(xGeometry, redMaterial);
const yAxis = new THREE.Line(yGeometry, greenMaterial);
const zAxis = new THREE.Line(zGeometry, blueMaterial);

scene.add(xAxis);
scene.add(yAxis);
scene.add(zAxis);

// Set up key presses
const keysPressed = {};

document.addEventListener("keydown", (event) => {
    keysPressed[event.code] = true;
});

document.addEventListener("keyup", (event) => {
    keysPressed[event.code] = false;
});

// Update camera position based on key presses
function updateCameraPosition() {
    // Calculate camera movement based on key presses
    let movement = new THREE.Vector3();
    if (keysPressed["KeyW"]) {
        movement.z -= movementSpeed;
    }
    if (keysPressed["KeyS"]) {
        movement.z += movementSpeed;
    }
    if (keysPressed["KeyA"]) {
        movement.x -= movementSpeed;
    }
    if (keysPressed["KeyD"]) {
        movement.x += movementSpeed;
    }
    if (keysPressed["Space"]) {
        movement.y += movementSpeed;
    }
    if (keysPressed["KeyQ"]) {
        movement.y -= movementSpeed;
    }

    // Rotate movement vector based on camera rotation
    movement.applyQuaternion(camera.quaternion);

    // Update camera position
    camera.position.add(movement);
}

let isMouseOut = false;

document.addEventListener("mouseout", (event) => {
    isMouseOut = true;
});

document.addEventListener("mouseenter", (event) => {
    isMouseOut = false;
});

let isMouseControlEnabled = true;

document.addEventListener("keydown", (event) => {
    if (event.code === "KeyI") {
        isMouseControlEnabled = !isMouseControlEnabled;
        if (isMouseControlEnabled) {
            document.body.style.cursor = "none";
        } else {
            document.body.style.cursor = "default";
        }
    }
});

let mouseX = 0;
let mouseY = 0;
let prevMouseX = 0;
let prevMouseY = 0;

document.addEventListener("mousemove", (event) => {
    prevMouseX = mouseX;
    prevMouseY = mouseY;
    mouseX = event.clientX;
    mouseY = event.clientY;
});

function updateCameraRotation() {
    if (!isMouseOut && isMouseControlEnabled) {
        const dx = -(mouseX - prevMouseX);
        const dy = -(mouseY - prevMouseY);

        if (
            Math.abs(dx) > deadZone ||
            Math.abs(dy) > deadZone
        ) {
            camera.rotation.y += dx * mouseSensibility;
            camera.rotation.x += dy * mouseSensibility;
        }
    }
}

// Start rendering loop
function render() {
    requestAnimationFrame(render);
    updateCameraPosition();
    updateCameraRotation();
    renderer.render(scene, camera);
}

render();
