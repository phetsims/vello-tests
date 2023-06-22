
import DeviceContext from './DeviceContext.js';

// name improvements for this
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

    // const sceneData = JSON.parse( '{"packed":"IEAKCQoJCgkKDRAgCgkKCQkNECAJCQ0QQAkJDRAgQAoJCgkJDRAgCQkNEEAJCQ0QIEAKCQoJCgkKDRAgQAoJCgkJDRAgCQkNEEAJCQ0QIEAKCQoJCQ0QIAkJDRBACQkNECBACgkKCQoJCg0QIEAKCQoJCgkKDRAgQAoJCgkKCQoNEEAKCQoJCgkKDRAgQA0QAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA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","layout":{"n_draw_objects":19,"n_paths":19,"n_clips":0,"bin_data_start":19,"path_tag_base":0,"path_data_base":256,"draw_tag_base":552,"draw_data_base":571,"transform_base":590,"linewidth_base":674},"ramps":{"width":0,"height":0,"data":""},"images":{"width":1024,"height":1024,"images":[]},"renderConfig":null}' );
    // const renderInfo = ResolvedEncoding.deserialize( sceneData );

    const outTexture = context.getCurrentTexture();
    const renderInfo = sceneEncoding.resolve( deviceContext );
    renderInfo.prepareRender( outTexture.width, outTexture.height, 0xf4fcfeff );

    render( renderInfo, deviceContext, outTexture );
  } )();
});
