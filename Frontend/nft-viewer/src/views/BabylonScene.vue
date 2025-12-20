<template>
  <canvas ref="bjsCanvas" style="width: 100%; height: 100%;"></canvas>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import {
  Engine, Scene, ArcRotateCamera, Vector3,
  HemisphericLight, PointLight, StandardMaterial,
  Color3, Texture, MeshBuilder
} from '@babylonjs/core';

// Define the component's props
const props = defineProps({
  imageUrl: String
});

// Create a reactive reference for the canvas element
const bjsCanvas = ref(null);

/**
 * Creates and initializes the Babylon.js scene.
 */
const createScene = (canvas, engine) => {
  const scene = new Scene(engine);

  // Set up the camera
  const camera = new ArcRotateCamera("camera", -Math.PI / 2, Math.PI / 2.5, 3, Vector3.Zero(), scene);
  camera.attachControl(canvas, true);

  // Add lighting to the scene
  const ambientLight = new HemisphericLight("ambientLight", new Vector3(0, 1, 0), scene);
  ambientLight.intensity = 0.5;
  const pointLight = new PointLight("pointLight", new Vector3(0, 1, -2), scene);
  pointLight.intensity = 0.8;

  return scene;
};

/**
 * Creates a plane mesh and applies a material to it.
 */
const createPlaneWithMaterial = (scene) => {
  const plane = MeshBuilder.CreatePlane("plane", { width: 1.6, height: 1 }, scene);
  const material = new StandardMaterial("material", scene);
  material.diffuseColor = new Color3(1, 1, 1); // Set to white to show full texture color
  plane.material = material;
  return { plane, material };
};

onMounted(() => {
  if (!bjsCanvas.value) return;

  // Initialize the engine and scene
  const engine = new Engine(bjsCanvas.value, true);
  const scene = createScene(bjsCanvas.value, engine);
  const { plane, material } = createPlaneWithMaterial(scene);

  // Watch for changes to the imageUrl prop and update the texture
  watch(() => props.imageUrl, (newUrl) => {
    if (newUrl) {
      material.diffuseTexture = new Texture(newUrl, scene);
    }
  }, { immediate: true }); // The "immediate: true" option runs the watcher on component mount

  // Run the render loop for continuous rendering and rotation
  engine.runRenderLoop(() => {
    scene.render();
    plane.rotation.y += 0.01;
  });

  // Handle window resizing
  window.addEventListener('resize', () => engine.resize());
});
</script>
