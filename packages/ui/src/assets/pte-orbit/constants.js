export const COLORS = Object.freeze({
  blue: 0x1679ce,
  navy: 0x143a63,
  ice: 0xb9e2fc,
  porcelain: 0xf5f4ef,
  mint: 0x7fc5b7,
  gold: 0xe9ba73,
  silver: 0xc7d7e4,
  paper: 0xffffff,
});

export const THEMES = Object.freeze({
  light: { background: 0xedf2f8, orbit: 0x83a4c2, intensity: 0.65 },
  dark: { background: 0x0e192b, orbit: 0x5686b5, intensity: 0.85 },
});

export const SETTINGS = Object.freeze({
  maxPixelRatio: 1.5,
  shadowMapSize: 1024,
  camera: [5.4, 3.1, 8.8],
  target: [0, 0.15, 0],
  minimumDistance: 6,
  maximumDistance: 16,
  maxDelta: 0.05,
});

export const TEXT = Object.freeze({
  pause: "Tạm dừng",
  resume: "Tiếp tục",
  lightTheme: "Nền sáng",
  darkTheme: "Nền tối",
  live: "LIVE 3D",
  paused: "PAUSED",
  loadError: "Không tải được 3D. Thử lại.",
});
