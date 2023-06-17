
// name improvements for this
import Shader from "./Shader.js";
import BufferPool from "./BufferPool.js";
import { default as init, VelloEncoding, VelloMix, VelloCompose } from "../pkg/vello_tests.js";

// Workaround for old namespacing
window.kite = phet.kite;

// TODO: newer harfbuzz. or cosmic-text might be nice
const notoSerif = shaping.createBase64FontHandle( notoSerifRegularBase64 );
const scriptData = {};
scriptData.default = {
  font: notoSerif,
  language: 'en',
  script: shaping.Script.LATIN
};
const shapeText = ( text, direction ) => shaping.shapeRuns( text, direction, scriptData );

init().then( async () => {
  const width = 512;
  const height = 512;

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

  // user permissions request is likely a non-starter
  // const fonts = await window.queryLocalFonts();
  //
  // const arialFontEntry = f.filter( g => g.fullName === 'Arial' )[ 0 ];
  // if ( arialFontEntry ) {
  //   // const arialFontBlob = await arialFontEntry.blob();
  // }

  // glyphEncodingMap[ font ][ index ] = VelloEncoding;
  // NOTE: for fills only
  const glyphEncodingMap = {};
  const getGlyphEncoding = ( font, index ) => {
    if ( !glyphEncodingMap[ font ] ) {
      glyphEncodingMap[ font ] = {};
    }
    if ( glyphEncodingMap[ font ][ index ] === undefined ) {
      const glyph = shaping.getGlyph( font, index );

      const svgPathData = glyph.getSVGPath();
      if ( svgPathData ) {
        const encoding = new VelloEncoding();

        encoding.svg_path( 'true', svgPathData );

        glyphEncodingMap[ font ][ index ] = encoding;
      }
      else {
        // empty, like whitespace
        glyphEncodingMap[ font ][ index ] = null;
      }
    }
    return glyphEncodingMap[ font ][ index ];
  };
  const getTextEncoding = ( text, direction ) => {
    const shapedText = shapeText( text, direction );

    const encoding = new VelloEncoding();

    shapedText.glyphs.forEach( glyph => {
      const glyphEncoding = getGlyphEncoding( glyph.font, glyph.index );

      if ( glyphEncoding ) {
        encoding.matrix( 1, 0, 0, 1, glyph.x, glyph.y );
        encoding.linewidth( -1 );

        encoding.append( glyphEncoding );

        encoding.color( 0x000000ff );
      }
    } );

    return encoding;
  };

  const preferredFormat = navigator.gpu.getPreferredCanvasFormat();

  const shaders = Shader.loadShaders( device );

  const canvas = document.createElement( 'canvas' );
  canvas.width = width;
  canvas.height = height;


  document.body.appendChild( canvas );

  const context = canvas.getContext( 'webgpu' );
  context.configure( {
    device,
    format: preferredFormat,
    usage: GPUTextureUsage.COPY_SRC | GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.STORAGE_BINDING
  } );

  // Handle high-dpi
  const backingScale = window.devicePixelRatio;
  canvas.style.width = `${Math.floor( width / backingScale )}px`;
  canvas.style.height = `${Math.floor( height / backingScale )}px`;

  // image ID => { id, image, width, height, buffer }
  const imageMap = {};

  const addImage = ( width, height, buffer ) => {
    const image = VelloEncoding.new_image( width, height );
    const id = image.id();
    imageMap[ id ] = {
      id,
      image,
      width,
      height,
      buffer
    };
    return image;
  };

  // TODO: check for memory leaks

  // An example image with a gradient (permanent, not freed)
  const demoImageWidth = 256;
  const demoImageHeight = 256;
  const demoImageData = new Uint8Array( demoImageWidth * demoImageHeight * 4 );
  for ( let x = 0; x < demoImageWidth; x++ ) {
    for ( let y = 0; y < demoImageHeight; y++ ) {
      demoImageData.set( [ x, y, 0, 255 ], ( x + y * demoImageWidth ) * 4 );
    }
  }
  const demoImage = addImage( demoImageWidth, demoImageHeight, demoImageData.buffer );

  /***************************************************************************/
  // Scene
  /***************************************************************************/

  class SceneFrame {
    constructor( sceneEncoding, dispose ) {
      this.sceneEncoding = sceneEncoding;
      this.dispose = dispose;
    }
  }

  const createSceneFrame = ( dt ) => {

    const sceneEncoding = VelloEncoding.new_scene();
    const encoding = new VelloEncoding();

    const angle = Date.now() / 1000;
    let c = Math.cos( angle );
    let s = Math.sin( angle );

    encoding.matrix( c, -s, s, c, 200, 100 );
    encoding.linewidth( -1 );
    encoding.json_path( true, true, JSON.stringify( [
      { type: 'MoveTo', x: -100, y: -100 },
      { type: 'QuadTo', x1: 0, y1: 0, x2: 100, y2: -100 },
      { type: 'LineTo', x: 100, y: 100 },
      { type: 'CubicTo', x1: 0, y1: 200, x2: 0, y2: 0, x3: -100, y3: 100 },
      { type: 'LineTo', x: -100, y: -100 },
      { type: 'Close' }
    ] ) );
    encoding.linear_gradient( -100, 0, 100, 0, 1, 0, new Float32Array( [ 0, 1 ] ), new Uint32Array( [ 0xff0000ff, 0x0000ffff ] ) );

    encoding.matrix( c, -s, s, c, 150, 200 );
    encoding.linewidth( -1 );
    encoding.svg_path( true, 'M 0 0 L 128 0 Q 256 0 256 128 L 256 256 L 128 256 Q 0 256 0 128 L 0 0 Z' );
    encoding.image( demoImage, 1 );

    encoding.matrix( c, -s, s, c, 200, 400 );
    encoding.linewidth( -1 );
    encoding.svg_path( true, 'M -100 -100 L 100 -100 L 0 100 L -100 100 L -100 -100 Z' );
    encoding.radial_gradient( 0, 0, 0, 0, 20, 120, 1, 0, new Float32Array( [ 0, 1 ] ), new Uint32Array( [ 0x0000ffff, 0x00ff00ff ] ) );

    // For a layer push: matrix, linewidth(-1), shape, begin_clip
    encoding.matrix( 1, 0, 0, 1, 0, 0 );
    encoding.linewidth( -1 );
    // TODO: add rect() to avoid overhead
    encoding.svg_path( true, 'M 0 0 L 512 0 L 256 256 L 0 512 Z' );
    encoding.begin_clip( VelloMix.Normal, VelloCompose.SrcOver, 0.5 ); // TODO: alpha 0.5 on clip layer fails EXCEPT on fine tiles where it ends

    encoding.matrix( 3, 0, 0, 3, 50, 150 );
    encoding.linewidth( -1 );
    encoding.svg_path( true, 'M 100 50 L 30 50 A 30 30 0 0 1 0 20 L 0 0 L 90 0 A 10 10 0 0 1 100 10 L 100 50 Z ' );
    encoding.color( 0xff00ff66 );

    encoding.matrix( 3, 0, 0, 3, 50, 150 );
    encoding.linewidth( 1 );
    encoding.svg_path( false, 'M 100 50 L 30 50 A 30 30 0 0 1 0 20 L 0 0 L 90 0 A 10 10 0 0 1 100 10 L 100 50 Z ' );
    encoding.color( 0x000000ff );

    encoding.end_clip();

    const textScale = 40 + 10 * Math.sin( Date.now() / 1000 );
    encoding.append_with_transform( getTextEncoding( 'How is this text? No hints!', shaping.Direction.LTR ), textScale, 0, 0, textScale, 5, 400 );

    sceneEncoding.append( encoding );
    sceneEncoding.append_with_transform( encoding, 0.4, 0, 0, 0.4, Math.floor( 512 * ( 1 - 0.4 ) ) + 20, 0 );

    encoding.free();

    sceneEncoding.finalize_scene();

    return new SceneFrame( sceneEncoding, () => {
      sceneEncoding.free();
    } )
  };


  /***************************************************************************/
  // Render
  /***************************************************************************/

  const render = ( sceneFrame, outTexture ) => {
    const renderInfo = sceneFrame.sceneEncoding.render( width, height, 0x666666ff );

    const sceneBytes = renderInfo.scene();

    const ramps = renderInfo.ramps();
    const rampsWidth = renderInfo.ramps_width;
    const rampsHeight = renderInfo.ramps_height;
    const hasRamps = rampsHeight > 0;

    const images = renderInfo.images();
    const imagesWidth = renderInfo.images_width;
    const imagesHeight = renderInfo.images_height;
    const hasImages = images.length > 0;

    const workgroupCounts = renderInfo.workgroup_counts();
    const bufferSizes = renderInfo.buffer_sizes();
    const configBytes = renderInfo.config_bytes();

    const bufferPool = new BufferPool( device );

    const sceneBuffer = bufferPool.getBuffer( sceneBytes.byteLength, 'scene buffer' );
    device.queue.writeBuffer( sceneBuffer, 0, sceneBytes.buffer );

    const configBuffer = device.createBuffer( {
      label: 'config buffer',
      size: configBytes.byteLength,
      // Different than the typical buffer from BufferPool, we'll create it here and manually destroy it
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
    } );
    device.queue.writeBuffer( configBuffer, 0, configBytes.buffer );

    const infoBinDataBuffer = bufferPool.getBuffer( bufferSizes.bin_data.size_in_bytes, 'info_bin_data buffer' );
    const tileBuffer = bufferPool.getBuffer( bufferSizes.tiles.size_in_bytes, 'tile buffer' );
    const segmentsBuffer = bufferPool.getBuffer( bufferSizes.segments.size_in_bytes, 'segments buffer' );
    const ptclBuffer = bufferPool.getBuffer( bufferSizes.ptcl.size_in_bytes, 'ptcl buffer' );
    const reducedBuffer = bufferPool.getBuffer( bufferSizes.path_reduced.size_in_bytes, 'reduced buffer' );

    const encoder = device.createCommandEncoder( {
      label: 'the encoder',
    } );

    shaders.pathtag_reduce.dispatch( encoder, workgroupCounts.path_reduce, [
      configBuffer, sceneBuffer, reducedBuffer
    ] );

    // TODO: rename?
    let pathtag_parent = reducedBuffer;

    let reduced2Buffer;
    let reducedScanBuffer;
    if ( workgroupCounts.use_large_path_scan ) {
      reduced2Buffer = bufferPool.getBuffer( bufferSizes.path_reduced2.size_in_bytes, 'reduced2 buffer' );

      shaders.pathtag_reduce2.dispatch( encoder, workgroupCounts.path_reduce2, [
        reducedBuffer, reduced2Buffer
      ] );

      reducedScanBuffer = bufferPool.getBuffer( bufferSizes.path_reduced_scan.size_in_bytes, 'reducedScan buffer' );

      shaders.pathtag_scan1.dispatch( encoder, workgroupCounts.path_scan1, [
        reducedBuffer, reduced2Buffer, reducedScanBuffer
      ] );

      pathtag_parent = reducedScanBuffer;
    }

    const tagmonoidBuffer = bufferPool.getBuffer( bufferSizes.path_monoids.size_in_bytes, 'tagmonoid buffer' );

    ( workgroupCounts.use_large_path_scan ? shaders.pathtag_scan_large : shaders.pathtag_scan_small ).dispatch( encoder, workgroupCounts.path_scan, [
      configBuffer, sceneBuffer, pathtag_parent, tagmonoidBuffer
    ] );

    bufferPool.freeBuffer( reducedBuffer );
    reduced2Buffer && bufferPool.freeBuffer( reduced2Buffer );
    reducedScanBuffer && bufferPool.freeBuffer( reducedScanBuffer );

    const pathBBoxBuffer = bufferPool.getBuffer( bufferSizes.path_bboxes.size_in_bytes, 'pathBBox buffer' );

    shaders.bbox_clear.dispatch( encoder, workgroupCounts.bbox_clear, [
      configBuffer, pathBBoxBuffer
    ] );

    const cubicBuffer = bufferPool.getBuffer( bufferSizes.cubics.size_in_bytes, 'cubic buffer' );

    shaders.pathseg.dispatch( encoder, workgroupCounts.path_seg, [
      configBuffer, sceneBuffer, tagmonoidBuffer, pathBBoxBuffer, cubicBuffer
    ] );

    const drawReducedBuffer = bufferPool.getBuffer( bufferSizes.draw_reduced.size_in_bytes, 'drawReduced buffer' );

    shaders.draw_reduce.dispatch( encoder, workgroupCounts.draw_reduce, [
      configBuffer, sceneBuffer, drawReducedBuffer
    ] );

    const drawMonoidBuffer = bufferPool.getBuffer( bufferSizes.draw_monoids.size_in_bytes, 'drawMonoid buffer' );
    const clipInpBuffer = bufferPool.getBuffer( bufferSizes.clip_inps.size_in_bytes, 'clipInp buffer' );

    shaders.draw_leaf.dispatch( encoder, workgroupCounts.draw_leaf, [
      configBuffer, sceneBuffer, drawReducedBuffer, pathBBoxBuffer, drawMonoidBuffer, infoBinDataBuffer, clipInpBuffer
    ] );

    bufferPool.freeBuffer( drawReducedBuffer );

    const clipElBuffer = bufferPool.getBuffer( bufferSizes.clip_els.size_in_bytes, 'clipEl buffer' );
    const clipBicBuffer = bufferPool.getBuffer( bufferSizes.clip_bics.size_in_bytes, 'clipBic buffer' );

    if ( workgroupCounts.clip_reduce.x > 0 ) {
      shaders.clip_reduce.dispatch( encoder, workgroupCounts.clip_reduce, [
        configBuffer, clipInpBuffer, pathBBoxBuffer, clipBicBuffer, clipElBuffer
      ] );
    }

    const clipBBoxBuffer = bufferPool.getBuffer( bufferSizes.clip_bboxes.size_in_bytes, 'clipBBox buffer' );

    if ( workgroupCounts.clip_leaf.x > 0 ) {
      shaders.clip_leaf.dispatch( encoder, workgroupCounts.clip_leaf, [
        configBuffer, clipInpBuffer, pathBBoxBuffer, clipBicBuffer, clipElBuffer, drawMonoidBuffer, clipBBoxBuffer
      ] );
    }

    bufferPool.freeBuffer( clipInpBuffer );
    bufferPool.freeBuffer( clipBicBuffer );
    bufferPool.freeBuffer( clipElBuffer );

    const drawBBoxBuffer = bufferPool.getBuffer( bufferSizes.draw_bboxes.size_in_bytes, 'drawBBox buffer' );
    const bumpBuffer = bufferPool.getBuffer( bufferSizes.bump_alloc.size_in_bytes, 'bump buffer' );
    const binHeaderBuffer = bufferPool.getBuffer( bufferSizes.bin_headers.size_in_bytes, 'binHeader buffer' );

    // TODO: wgpu might not have this implemented? Do I need a manual clear?
    // TODO: actually, we're not reusing the buffer, so it might be zero'ed out? Check spec
    // TODO: See if this clearBuffer is insufficient (implied by engine.rs docs)
    encoder.clearBuffer( bumpBuffer, 0 );
    // device.queue.writeBuffer( bumpBuffer, 0, new Uint8Array( bumpBuffer.size ) );

    shaders.binning.dispatch( encoder, workgroupCounts.binning, [
      configBuffer, drawMonoidBuffer, pathBBoxBuffer, clipBBoxBuffer, drawBBoxBuffer, bumpBuffer, infoBinDataBuffer, binHeaderBuffer
    ] );

    bufferPool.freeBuffer( drawMonoidBuffer );
    bufferPool.freeBuffer( pathBBoxBuffer );
    bufferPool.freeBuffer( clipBBoxBuffer );

    // Note: this only needs to be rounded up because of the workaround to store the tile_offset
    // in storage rather than workgroup memory.
    const pathBuffer = bufferPool.getBuffer( bufferSizes.paths.size_in_bytes, 'path buffer' );

    shaders.tile_alloc.dispatch( encoder, workgroupCounts.tile_alloc, [
      configBuffer, sceneBuffer, drawBBoxBuffer, bumpBuffer, pathBuffer, tileBuffer
    ] );

    bufferPool.freeBuffer( drawBBoxBuffer );

    shaders.path_coarse_full.dispatch( encoder, workgroupCounts.path_coarse, [
      configBuffer, sceneBuffer, tagmonoidBuffer, cubicBuffer, pathBuffer, bumpBuffer, tileBuffer, segmentsBuffer
    ] );

    bufferPool.freeBuffer( tagmonoidBuffer );
    bufferPool.freeBuffer( cubicBuffer );

    shaders.backdrop_dyn.dispatch( encoder, workgroupCounts.backdrop, [
      configBuffer, pathBuffer, tileBuffer
    ] );

    shaders.coarse.dispatch( encoder, workgroupCounts.coarse, [
      configBuffer, sceneBuffer, drawMonoidBuffer, binHeaderBuffer, infoBinDataBuffer, pathBuffer, tileBuffer, bumpBuffer, ptclBuffer
    ] );

    // TODO: Check frees on all buffers. Note the config buffer (manually destroy that, or can we reuse it?)
    bufferPool.freeBuffer( sceneBuffer );
    bufferPool.freeBuffer( drawMonoidBuffer );
    bufferPool.freeBuffer( binHeaderBuffer );
    bufferPool.freeBuffer( pathBuffer );
    bufferPool.freeBuffer( bumpBuffer );

    // let out_image = ImageProxy::new(params.width, params.height, ImageFormat::Rgba8);
    //
    // // NOTE: not apparently using robust for wasm?
        // Note: in the wasm case, we're currently not running the robust
        // pipeline, as it requires more async wiring for the readback.
    // if robust {
    //     recording.download(*bump_buf.as_buf().unwrap());
    // }

    // const outImage = device.createTexture( {
    //   label: 'outImage',
    //   size: {
    //     width: width,
    //     height: height,
    //     depthOrArrayLayers: 1
    //   },
    //   format: actualFormat,
    //   // TODO: wtf, usage: TextureUsages::TEXTURE_BINDING | TextureUsages::COPY_DST,
    //   usage: GPUTextureUsage.COPY_SRC | GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.STORAGE_BINDING
    // } );
    // const outImageView = outImage.createView( {
    //   label: 'outImageView',
    //   format: actualFormat,
    //   dimension: '2d'
    // } );

    const gradientWidth = hasRamps ? rampsWidth : 1;
    const gradientHeight = hasRamps ? rampsHeight : 1;
    const gradientImage = device.createTexture( {
      label: 'gradientImage',
      size: {
        width: gradientWidth,
        height: gradientHeight,
        depthOrArrayLayers: 1
      },
      format: 'rgba8unorm',
      usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST
    } );

    const gradientImageView = gradientImage.createView( {
      label: 'gradientImageView',
      format: 'rgba8unorm',
      dimension: '2d'
    } );

    if ( hasRamps ) {
      const block_size = 4;
      device.queue.writeTexture( {
        texture: gradientImage
      }, ramps.buffer, {
        offset: 0,
        bytesPerRow: rampsWidth * block_size
      }, {
        width: gradientWidth,
        height: gradientHeight,
        depthOrArrayLayers: 1
      } );
    }

    // TODO: Do we have "repeat" on images also? Think repeating patterns! Also alpha
    const atlasWidth = hasImages ? imagesWidth : 1;
    const atlasHeight = hasImages ? imagesHeight : 1;
    const atlasImage = device.createTexture( {
      label: 'atlasImage',
      size: {
        width: atlasWidth,
        height: atlasHeight,
        depthOrArrayLayers: 1
      },
      format: 'rgba8unorm',
      usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST
    } );
    const atlasImageView = atlasImage.createView( {
      label: 'atlasImageView',
      format: 'rgba8unorm',
      dimension: '2d'
    } );

    if ( hasImages ) {
      for ( let i = 0; i < images.length; i += 3 ) {
        const id = images[ i ];
        const x = Number( images[ i + 1 ] );
        const y = Number( images[ i + 2 ] );

        const entry = imageMap[ id ];

        if ( entry ) {
          const block_size = 4;

          device.queue.writeTexture( {
            texture: atlasImage,
            origin: { x, y, z: 0 }
          }, entry.buffer, {
            offset: 0,
            bytesPerRow: entry.width * block_size
          }, {
            width: entry.width,
            height: entry.height,
            depthOrArrayLayers: 1
          } );
        }
        else {
          throw new Error( 'missing image' );
        }
      }
    }

    // Have the fine-rasterization shader use the preferred format as output (for now)
    ( preferredFormat === 'bgra8unorm' ? shaders.fine_bgra8unorm : shaders.fine_rgba8unorm ).dispatch( encoder, workgroupCounts.fine, [
      configBuffer, tileBuffer, segmentsBuffer, outTexture.createView(), ptclBuffer, gradientImageView, infoBinDataBuffer, atlasImageView
    ] );

    // NOTE: bgra8unorm vs rgba8unorm can't be copied, so this depends on the platform?
    // encoder.copyTextureToTexture( {
    //   texture: outImage
    // }, {
    //   texture: context.getCurrentTexture()
    // }, {
    //   width: width,
    //   height: height,
    //   depthOrArrayLayers: 1
    // } );

    // TODO: are these early frees acceptable? Are we going to badly reuse things?
    bufferPool.freeBuffer( tileBuffer );
    bufferPool.freeBuffer( segmentsBuffer );
    bufferPool.freeBuffer( ptclBuffer );
    bufferPool.freeBuffer( infoBinDataBuffer );

    const commandBuffer = encoder.finish();
    device.queue.submit( [ commandBuffer ] );

    // for now TODO: can we reuse? Likely get some from reusing these
    configBuffer.destroy();
    gradientImage.destroy();
    atlasImage.destroy();

    bufferPool.nextGeneration();
    renderInfo.free();
  };

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

    const sceneFrame = createSceneFrame( timeElapsedInSeconds );
    render( sceneFrame, context.getCurrentTexture() );
    sceneFrame.dispose();
  } )();
});
