// Global scroll state — shared between App.tsx and AboutScene.tsx
export const scrollState = {
  progress: 0,         // 0–1 as user scrolls through the about section
  prevProgress: 0,
  triggerWaving: false, // Set to true from App.tsx to play wave
  wavePlayed: false,    // Track if auto-wave already happened
  waveFinished: false,  // Release scroll-lock in App.tsx when true
}
