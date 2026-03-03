export interface MarkerData {
  location: [number, number];
  size: number;
  label?: string;
}

export interface GlobeConfig {
  // Appearance
  theta: number;
  dark: number;
  diffuse: number;
  mapSamples: number;
  mapBrightness: number;
  baseColor: string;
  markerColor: string;
  glowColor: string;
  glowIntensity: number;
  enableFadeMask: boolean;
  showDots: boolean;
  showGraticule: boolean;
  graticuleScale: number;
  graticuleColor: string;
  graticuleOpacity: number;
  showLandOutline: boolean;
  landOutlineScale: number;
  landOutlineColor: string;
  landOutlineOpacity: number;
  pulseMarkers: boolean;

  // Transform
  scale: number;
  offsetX: number;
  offsetY: number;

  // Behavior
  rotationSpeed: number;
  dragSensitivity: number;
}

export const defaultGlobeConfig: GlobeConfig = {
  theta: 0.3,
  dark: 1,
  diffuse: 1.2,
  mapSamples: 16000,
  mapBrightness: 6,
  baseColor: "#4d4d4d",
  markerColor: "#19ccff",
  glowColor: "#ffffff",
  glowIntensity: 1,
  enableFadeMask: true,
  showDots: true,
  showGraticule: true,
  graticuleScale: 0.8,
  graticuleColor: "#ffffff",
  graticuleOpacity: 0.2,
  showLandOutline: false,
  landOutlineScale: 0.8,
  landOutlineColor: "#ffffff",
  landOutlineOpacity: 0.5,
  pulseMarkers: true,
  scale: 1,
  offsetX: 0,
  offsetY: 0,
  rotationSpeed: 0.005,
  dragSensitivity: 0.005,
};
