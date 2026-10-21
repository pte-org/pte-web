import * as THREE from "three";
import { ceramic, mesh } from "./primitives.js";

const LOGO = Object.freeze({
  scale: 0.0025,
  centerX: 237,
  centerY: 281,
  depth: 0.22,
  bevelSize: 0.012,
  bevelThickness: 0.012,
  bevelSegments: 4,
  cyan: 0x00beef,
  blue: 0x006fff,
  royal: 0x004fff,
});

// Partition the reference into adjoining solids so shared folds do not overlap.
const OUTER_RING = [
  ["M", 0, 0],
  ["L", 273, 0],
  ["C", 384, 0, 474, 87, 474, 198],
  ["C", 474, 309, 386, 389, 273, 389],
  ["L", 200, 389],
  ["L", 200, 308],
  ["C", 200, 333, 213, 350, 233, 350],
  ["C", 319, 350, 384, 291, 384, 215],
  ["C", 384, 137, 300, 60, 217, 49],
  ["L", 50, 49],
  ["C", 23, 49, 0, 29, 0, 0],
  ["Z"],
];

const BACK_STEM = [
  ["M", 91, 76],
  ["L", 145, 76],
  ["C", 120, 76, 102, 90, 102, 108],
  ["L", 102, 449],
  ["C", 102, 468, 108, 480, 122, 493],
  ["L", 200, 562],
  ["L", 64, 443],
  ["C", 49, 429, 42, 415, 42, 393],
  ["L", 42, 126],
  ["C", 42, 99, 64, 76, 91, 76],
  ["Z"],
];

const INNER_FOLD = [
  ["M", 217, 49],
  ["C", 300, 60, 384, 137, 384, 215],
  ["C", 384, 291, 319, 350, 233, 350],
  ["C", 255, 346, 267, 332, 267, 309],
  ["L", 267, 111],
  ["C", 267, 81, 247, 49, 217, 49],
  ["Z"],
];

const FRONT_STEM = [
  ["M", 145, 76],
  ["C", 176, 76, 200, 101, 200, 132],
  ["L", 200, 562],
  ["L", 122, 493],
  ["C", 108, 480, 102, 468, 102, 449],
  ["L", 102, 108],
  ["C", 102, 90, 120, 76, 145, 76],
  ["Z"],
];

const buildShape = (commands) => {
  const shape = new THREE.Shape();
  const point = (x, y) => [(x - LOGO.centerX) * LOGO.scale, (LOGO.centerY - y) * LOGO.scale];
  for (const [command, ...coordinates] of commands) {
    if (command === "M") shape.moveTo(...point(...coordinates));
    if (command === "L") shape.lineTo(...point(...coordinates));
    if (command === "C") {
      shape.bezierCurveTo(
        ...point(coordinates[0], coordinates[1]),
        ...point(coordinates[2], coordinates[3]),
        ...point(coordinates[4], coordinates[5]),
      );
    }
    if (command === "Z") shape.closePath();
  }
  return shape;
};

const createRibbon = (commands, name, offset, palette) => {
  const geometry = new THREE.ExtrudeGeometry(buildShape(commands), {
    depth: LOGO.depth,
    steps: 1,
    curveSegments: 40,
    bevelEnabled: true,
    bevelSize: LOGO.bevelSize,
    bevelThickness: LOGO.bevelThickness,
    bevelSegments: LOGO.bevelSegments,
  });
  geometry.translate(0, 0, -LOGO.depth / 2);
  const positions = geometry.getAttribute("position");
  const colors = new Float32Array(positions.count * 3);
  const start = new THREE.Color(palette[0]);
  const end = new THREE.Color(palette[1]);
  const color = new THREE.Color();
  for (let index = 0; index < positions.count; index += 1) {
    const x = positions.getX(index) / LOGO.scale + LOGO.centerX;
    const y = LOGO.centerY - positions.getY(index) / LOGO.scale;
    const blend = THREE.MathUtils.clamp((x / 474) * 0.7 + (y / 562) * 0.3, 0, 1);
    color
      .copy(start)
      .lerp(end, blend)
      .toArray(colors, index * 3);
  }
  geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  geometry.computeBoundingBox();
  // Preserve the source logo's saturated blues while retaining physically lit bevels.
  const face = ceramic(0xffffff, {
    vertexColors: true,
    roughness: 0.23,
    metalness: 0,
    clearcoat: 0.15,
    specularIntensity: 0.1,
    envMapIntensity: 0.6,
    toneMapped: false,
  });
  const edge = ceramic(palette[1], {
    roughness: 0.28,
    metalness: 0,
    clearcoat: 0.2,
    specularIntensity: 0.2,
    envMapIntensity: 0.6,
    toneMapped: false,
  });
  const ribbon = mesh(geometry, [face, edge], [0, 0, offset]);
  ribbon.name = name;
  return ribbon;
};

/** @returns {THREE.Group} */
export const createBrandMonogram = () => {
  const group = new THREE.Group();
  group.name = "pte-brand-monogram";
  group.add(createRibbon(OUTER_RING, "outer-blue-ribbon", 0, [LOGO.blue, LOGO.royal]));
  group.add(createRibbon(BACK_STEM, "cyan-back-stem", 0, [LOGO.cyan, LOGO.blue]));
  // Small depth offsets preserve the folded ribbon seams when viewed from the side.
  group.add(createRibbon(INNER_FOLD, "cyan-inner-fold", 0.008, [LOGO.blue, LOGO.cyan]));
  group.add(createRibbon(FRONT_STEM, "front-blue-stem", 0.016, [LOGO.blue, LOGO.royal]));
  group.rotation.y = 0.28;
  return group;
};
