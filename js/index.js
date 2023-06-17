
// name improvements for this
import Shader from "./Shader.js";
import exampleScene from "./exampleScene.js";
import render from "./render.js";
import wasmInit from "../pkg/vello_tests.js";

// Workaround for old namespacing
window.kite = phet.kite;

wasmInit().then( async () => {
  const adapter = await navigator.gpu?.requestAdapter( {
    powerPreference: 'high-performance'
  } );
  const device = await adapter?.requestDevice( {
      requiredFeatures: [ 'bgra8unorm-storage' ]
  } );
  if ( !device ) {
    throw new Error( 'need a browser that supports WebGPU' );
  }

  device.lost.then( info => {
    console.error( `WebGPU device was lost: ${info.message}` );

    // 'reason' will be 'destroyed' if we intentionally destroy the device.
    if ( info.reason !== 'destroyed' ) {
      // TODO: handle destruction
    }
  } );

  const width = 512;
  const height = 512;
  const canvas = document.createElement( 'canvas' );
  canvas.width = width;
  canvas.height = height;
  canvas.style.width = `${Math.floor( width / window.devicePixelRatio )}px`;
  canvas.style.height = `${Math.floor( height / window.devicePixelRatio )}px`;
  document.body.appendChild( canvas );

  const context = canvas.getContext( 'webgpu' );
  context.configure( {
    device,
    format: navigator.gpu.getPreferredCanvasFormat(),
    usage: GPUTextureUsage.COPY_SRC | GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.STORAGE_BINDING
  } );

  // TODO: check for memory leaks

  const shaders = Shader.loadShaders( device );

  // keep track of how much time elapsed over the last frame
  let lastTime = 0;
  let timeElapsedInSeconds = 0;
  ( function step() {
    window.requestAnimationFrame( step, canvas );

    // calculate how much time has elapsed since we rendered the last frame
    const timeNow = Date.now();
    if ( lastTime !== 0 ) {
      timeElapsedInSeconds = ( timeNow - lastTime ) / 1000.0;
    }
    lastTime = timeNow;

    const sceneFrame = exampleScene( timeElapsedInSeconds );
    render( sceneFrame, device, shaders, context.getCurrentTexture() );
    sceneFrame.dispose();
  } )();
});
