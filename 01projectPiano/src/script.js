import "./style.css";
import * as dat from "lil-gui";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";

/**
 * Base
 */
// Debug
const gui = new dat.GUI({
  width: 400,
});

// Canvas
const canvas = document.querySelector("canvas.webgl");

// Scene
const scene = new THREE.Scene();

/**
 * Loaders
 */
// Texture loader
const textureLoader = new THREE.TextureLoader();

// Draco loader
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath("draco/");

// GLTF loader
const gltfLoader = new GLTFLoader();
gltfLoader.setDRACOLoader(dracoLoader);

/**
 * Object
 */
// const cube = new THREE.Mesh(
//   new THREE.BoxGeometry(1, 1, 1),
//   new THREE.MeshBasicMaterial()
// );
// scene.add(cube);

/**
 * Texture Piano
 */
// const pianoBakedTexture = textureLoader.load("bakedPiano.jpg");

/**
 * Material Piano
 */
// const pianoBakedMaterial = new THREE.MeshBasicMaterial({
//   map: pianoBakedTexture,
// });
const pianoBase = new THREE.MeshBasicMaterial({
  color: 0xe77340,
});
const pianoWhiteKey = new THREE.MeshBasicMaterial({
  color: 0xffffff,
});
const pianoBlackKey = new THREE.MeshBasicMaterial({
  color: 0x000000,
});
/**
 * Model Piano
 */
// let pianoKeyborad = [
//   "w",
//   "e",
//   "r",
//   "a",
//   "s",
//   "d",
//   "f",
//   "u",
//   "i",
//   "o",
//   "h",
//   "j",
//   "k",
//   "l",
//   "1",
//   "2",
//   "3",
//   "4",
//   "5",
//   "6",
//   "7",
//   "8",
//   "9",
//   "0",
// ];
let pianoKeyborad = [
  "q",
  "w",
  "e",
  "r",
  "t",
  "y",
  "u",
  "i",
  "o",
  "p",
  "l",
  "k",
  "j",
  "h",
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "0",
];

const pianoGltf = function (gltf) {
  const pianoKeyAudios = [];

  // --- Add material ---
  // gltf.scene.children.map((child) => {
  //   child.material = pianoBakedMaterial;
  // });
  gltf.scene.children.map((child) => {
    if (!child.name.startsWith("pianoNote")) {
      child.material = pianoBase;
    }
  });

  // Adjust position
  gltf.scene.position.x = -1.5;
  gltf.scene.position.z = 1;

  // --- Using piano key model's names to get piano key models and audios---
  const filteredPianoNote = gltf.scene.children.filter((child) =>
    child.name.startsWith("pianoNote")
  );
  const pianoKeyModels = filteredPianoNote.sort(
    (a, b) => a.name.slice(9) - b.name.slice(9)
  );

  filteredPianoNote.forEach((child, i) => {
    pianoKeyAudios.push(new Audio(`./pianoNotes/${child.name}.mp3`));
    if (i >= 0 && i <= 13) {
      child.material = pianoWhiteKey;
    } else {
      child.material = pianoBlackKey;
    }
  });

  // --- Press keyboard to get piano note sound ---
  // --- BUG1 uninterrupted tap key model position will not return its original position(原因：keydown repeat is trigged many times -> 解决：不要用settimeout，用keydown和keyup，并且不执行keydown event 如果repeat===true) ---
  // --- BUG2 同时按几个键，有时候同时发声音，有时候单独发个别音，尤其是do mi sol) ---

  const pianoKeydownEvent = function (e) {
    if (e.repeat) return; // if repeat, finishing keydown event.
    pianoKeyborad.find((k, i) => {
      if (k === e.key) {
        pianoKeyAudios[i].currentTime = 0; // rewind to the start
        pianoKeyAudios[i].play();

        pianoKeyModels[i].position.y -= 0.05;
        // console.log(pianoKeyModels[i].position.y);
      }
    });
  };

  const pianoKeyupEvent = function (e) {
    pianoKeyborad.find((k, i) => {
      if (k === e.key) {
        pianoKeyModels[i].position.y += 0.05;
        // console.log(pianoKeyModels[i].position.y);
      }
    });
  };

  window.addEventListener("keydown", pianoKeydownEvent);
  window.addEventListener("keyup", pianoKeyupEvent);

  scene.add(gltf.scene);

  // console.log(pianoKeyModels);
  // console.log(pianoKeyborad);
};

gltfLoader.load("piano.glb", pianoGltf);

/**
 * Sizes
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

window.addEventListener("resize", () => {
  // Update sizes
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  // Update camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  // Update renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(
  45,
  sizes.width / sizes.height,
  0.1,
  100
);
camera.position.x = 4;
camera.position.y = 2;
camera.position.z = 4;
scene.add(camera);

// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  antialias: true,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

/**
 * Animate
 */
const clock = new THREE.Clock();

const tick = () => {
  const elapsedTime = clock.getElapsedTime();

  // Update controls
  controls.update();

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();
