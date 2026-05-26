/**
 * Preferred path: Three.js WebGPURenderer (GPU-native, PBR-friendly pipeline).
 * Falls back to classic WebGLRenderer if init fails (older browsers, blocked adapters).
 *
 * Signature matches R3F `gl` async factory (`canvas` may be HTMLCanvasElement or OffscreenCanvas).
 */
export async function createParableRenderer(defaultProps: {
  canvas: HTMLCanvasElement | OffscreenCanvas;
  [key: string]: unknown;
}) {
  const { canvas } = defaultProps;

  if (!(canvas instanceof HTMLCanvasElement)) {
    const THREE = await import('three');
    return new THREE.WebGLRenderer({
      canvas: canvas as OffscreenCanvas,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    } as ConstructorParameters<typeof THREE.WebGLRenderer>[0]);
  }

  try {
    const { WebGPURenderer } = await import('three/webgpu');
    const renderer = new WebGPURenderer({
      canvas,
      antialias: true,
      alpha: true,
    } as ConstructorParameters<typeof WebGPURenderer>[0]);
    await renderer.init();
    const r = renderer as unknown as { shadowMap?: { enabled: boolean } };
    if (r.shadowMap) r.shadowMap.enabled = true;
    return renderer;
  } catch (err) {
    console.warn('[Parable Engine] WebGPURenderer unavailable, using WebGLRenderer.', err);
    const THREE = await import('three');
    const gl = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    gl.shadowMap.enabled = true;
    gl.toneMapping = THREE.ACESFilmicToneMapping;
    gl.outputColorSpace = THREE.SRGBColorSpace;
    return gl;
  }
}
