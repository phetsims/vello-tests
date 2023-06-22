
import DeviceContext from './DeviceContext.js';
import Shader from "./Shader.js";
import exampleScene from "./exampleScene.js";
import render from "./render.js";

// import wasmInit from "../pkg/vello_tests.js";
const wasmInit = () => Promise.resolve( { memory: {} } ); // stub TODO remove

// Workaround for old namespacing
window.kite = phet.kite;

wasmInit().then( async wasm => {
  const memory = wasm.memory;

  const adapter = await navigator.gpu?.requestAdapter( {
    powerPreference: 'high-performance'
  } );
  const device = await adapter?.requestDevice( {
      requiredFeatures: [ 'bgra8unorm-storage' ]
  } );
  if ( !device ) {
    throw new Error( 'need a browser that supports WebGPU' );
  }

  // TODO: pooling of various resources we create (don't do much GC churn)

  // TODO: handle context losses, reconstruct with the device
  device.lost.then( info => {
    console.error( `WebGPU device was lost: ${info.message}` );

    // 'reason' will be 'destroyed' if we intentionally destroy the device.
    if ( info.reason !== 'destroyed' ) {
      // TODO: handle destruction
    }
  } );

  // Trigger shader compilation before anything (will be cached)
  Shader.getShaders( device );

  const canvas = document.createElement( 'canvas' );
  canvas.style.position = 'absolute';
  canvas.style.left = '0';
  canvas.style.top = '0';
  document.body.appendChild( canvas );

  let resizePending = true;
  // Can't synchronously do this in Firefox, see https://github.com/phetsims/vegas/issues/55 and
  // https://bugzilla.mozilla.org/show_bug.cgi?id=840412.
  const resizeListener = () => {
    resizePending = true;
  };
  $( window ).resize( resizeListener );
  window.addEventListener( 'resize', resizeListener );
  window.addEventListener( 'orientationchange', resizeListener );
  window.visualViewport && window.visualViewport.addEventListener( 'resize', resizeListener );

  const context = canvas.getContext( 'webgpu' );
  context.configure( {
    device,
    format: navigator.gpu.getPreferredCanvasFormat(),
    usage: GPUTextureUsage.COPY_SRC | GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.STORAGE_BINDING
  } );

  const deviceContext = new DeviceContext( device );

  // TODO: check for memory leaks (ZOMG there are memory leaks in WASM)

  ( function step() {
    window.requestAnimationFrame( step, canvas );

    if ( resizePending ) {
      resizePending = false;

      const fullWidth = window.innerWidth;
      const fullHeight = window.innerHeight;

      canvas.width = Math.ceil( fullWidth * window.devicePixelRatio );
      canvas.height = Math.ceil( fullHeight * window.devicePixelRatio );
      canvas.style.width = `${fullWidth}px`;
      canvas.style.height = `${fullHeight}px`;
    }

    const sceneEncoding = exampleScene( window.devicePixelRatio );

    const outTexture = context.getCurrentTexture();
    const renderInfo = sceneEncoding.resolve( deviceContext );
    renderInfo.prepareRender( outTexture.width, outTexture.height, 0xf4fcfeff );

    render( renderInfo, deviceContext, outTexture );
  } )();
});
