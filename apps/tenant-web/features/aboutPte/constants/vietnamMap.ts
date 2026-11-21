/**
 * Simplified Vietnam outline for an illustrative map (not survey-accurate), as [longitude, latitude] points
 * traced clockwise from the north-west border. Includes the Hoang Sa and Truong Sa archipelagos.
 */
export type LonLat = readonly [number, number];

export const MAP_BOUNDS = { west: 101.8, east: 116.2, north: 23.6, south: 8.2 } as const;
export const MAP_SCALE = 30;

export const project = ([lon, lat]: LonLat): [number, number] => [
  (lon - MAP_BOUNDS.west) * MAP_SCALE,
  (MAP_BOUNDS.north - lat) * MAP_SCALE,
];

export const MAP_WIDTH = (MAP_BOUNDS.east - MAP_BOUNDS.west) * MAP_SCALE;
export const MAP_HEIGHT = (MAP_BOUNDS.north - MAP_BOUNDS.south) * MAP_SCALE;

export const MAINLAND: readonly LonLat[] = [
  [102.15, 22.4], [102.9, 22.8], [103.5, 22.6], [104.0, 22.8], [104.8, 22.9], [105.3, 23.35], [105.9, 22.95],
  [106.6, 22.85], [106.7, 22.35], [107.4, 21.75], [108.0, 21.55], [107.35, 21.05], [106.75, 20.75], [106.25, 20.1],
  [105.95, 19.45], [105.75, 18.75], [106.4, 18.05], [107.1, 17.05], [107.6, 16.45], [108.2, 16.05], [108.8, 15.3],
  [109.2, 13.8], [109.4, 12.6], [109.2, 12.2], [109.2, 11.85], [108.9, 11.3], [108.1, 10.9], [107.1, 10.35],
  [106.75, 10.0], [106.45, 9.5], [106.0, 9.25], [105.4, 8.8], [104.8, 8.6], [104.8, 9.5], [105.1, 10.0],
  [104.5, 10.4], [105.1, 10.9], [105.9, 11.0], [106.4, 11.7], [107.5, 12.3], [107.6, 13.5], [107.5, 14.6],
  [107.7, 15.3], [107.2, 16.0], [106.6, 16.6], [105.6, 17.8], [104.9, 18.5], [104.2, 19.2], [104.5, 19.6],
  [104.1, 20.0], [103.2, 20.8], [102.7, 21.2], [102.2, 21.9],
];

/** Small islands drawn as dots: Phu Quoc, and the Hoang Sa (Paracel) and Truong Sa (Spratly) archipelagos. */
export const PHU_QUOC: LonLat = [103.97, 10.22];
export const HOANG_SA: readonly LonLat[] = [[111.6, 16.5], [112.1, 16.8], [112.3, 16.3], [111.9, 16.0]];
export const TRUONG_SA: readonly LonLat[] = [
  [113.6, 10.5], [114.2, 10.0], [114.4, 9.4], [113.9, 9.0], [114.8, 10.4], [113.3, 9.6],
];

/** Test-centre cities, in the order of the copy's city list. */
export const CITY_COORDS: readonly LonLat[] = [
  [106.7, 10.78], // Ho Chi Minh City
  [105.85, 21.03], // Hanoi
  [108.2, 16.05], // Da Nang
  [105.78, 10.03], // Can Tho
];

export const toPath = (points: readonly LonLat[]): string =>
  `${points.map((point, index) => `${index === 0 ? "M" : "L"}${project(point).map((v) => v.toFixed(1)).join(" ")}`).join(" ")} Z`;
