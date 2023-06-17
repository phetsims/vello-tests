
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

  // Trigger shader compilation before anything (will be cached)
  Shader.getShaders( device );

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

  ( function step() {
    window.requestAnimationFrame( step, canvas );

    const sceneFrame = exampleScene();
    render( sceneFrame, device, context.getCurrentTexture() );
    sceneFrame.dispose();
  } )();
});
