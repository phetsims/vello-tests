
import shaderCreator from "./shaders.js";
import { default as init, VelloEncoding, VelloMix, VelloCompose } from "../pkg/vello_tests.js";

init().then( async () => {
  const width = 512;
  const height = 512;

  const adapter = await navigator.gpu?.requestAdapter();
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

  const preferredFormat = navigator.gpu.getPreferredCanvasFormat();

  const shaders = shaderCreator( preferredFormat );
  window.shaders = shaders;

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

  const sceneEncoding = VelloEncoding.new_scene();
  const encoding = new VelloEncoding();

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

  /***************************************************************************/
  // Scene
  /***************************************************************************/

  // An example image with a gradient
  const demoImageWidth = 256;
  const demoImageHeight = 256;
  const demoImageData = new Uint8Array( demoImageWidth * demoImageHeight * 4 );
  for ( let x = 0; x < demoImageWidth; x++ ) {
    for ( let y = 0; y < demoImageHeight; y++ ) {
      demoImageData.set( [ x, y, 0, 255 ], ( x + y * demoImageWidth ) * 4 );
    }
  }
  const demoImage = addImage( demoImageWidth, demoImageHeight, demoImageData.buffer );

  const angle = 0.3;
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
  encoding.begin_clip( VelloMix.Clip, VelloCompose.SrcOver, 0.5 ); // TODO: alpha 0.5 on clip layer fails EXCEPT on fine tiles where it ends

  encoding.matrix( 3, 0, 0, 3, 50, 150 );
  encoding.linewidth( -1 );
  encoding.svg_path( true, 'M 100 50 L 30 50 A 30 30 0 0 1 0 20 L 0 0 L 90 0 A 10 10 0 0 1 100 10 L 100 50 Z ' );
  encoding.color( 0xff00ff66 );

  encoding.matrix( 3, 0, 0, 3, 50, 150 );
  encoding.linewidth( 1 );
  encoding.svg_path( false, 'M 100 50 L 30 50 A 30 30 0 0 1 0 20 L 0 0 L 90 0 A 10 10 0 0 1 100 10 L 100 50 Z ' );
  encoding.color( 0x000000ff );

  encoding.end_clip();

  sceneEncoding.append( encoding );
  sceneEncoding.append_with_transform( encoding, 0.4, 0, 0, 0.4, Math.floor( 512 * ( 1 - 0.4 ) ) + 20, 0 );

  encoding.free();

  sceneEncoding.finalize_scene();

  const renderInfo = sceneEncoding.render( width, height, 0x666666ff );

  Object.keys( shaders ).forEach( shaderName => {
    const shader = shaders[ shaderName ];
    shader.module = device.createShaderModule( {
      label: shaderName,
      code: shader.wgsl
    } );

    shader.bindGroupLayout = device.createBindGroupLayout( {
      label: `${shaderName} bindGroupLayout`,
      entries: shader.bindings.map( ( binding, i ) => {
        const entry = {
          binding: i,
          visibility: GPUShaderStage.COMPUTE,
        };

        if ( binding === 'Buffer' || binding === 'BufReadOnly' || binding === 'Uniform' ) {
          entry.buffer = {
            type: {
              Buffer: 'storage',
              BufReadOnly: 'read-only-storage',
              Uniform: 'uniform'
            }[ binding ],
            hasDynamicOffset: false
          };
        }
        else if ( binding === 'Image' ) {
          entry.storageTexture = {
            access: 'write-only',
            // format: preferredFormat,
            // format: actualFormat, // We actually probably need rgba8 for the shaders to work, oops
            format: preferredFormat, // We actually probably need rgba8 for the shaders to work, oops
            viewDimension: '2d'
          };
        }
        else if ( binding === 'ImageRead' ) {
          // Note: fine takes ImageFormat::Rgba8 for Image/ImageRead
          entry.texture = {
            sampleType: 'float',
            viewDimension: '2d',
            multisampled: false
          };
        }
        else {
          throw new Error( `unknown binding: ${binding}` );
        }

        return entry;
      } )
    } );

    shader.pipeline = device.createComputePipeline( {
      label: `${shaderName} pipeline`,
      layout: device.createPipelineLayout( {
        bindGroupLayouts: [ shader.bindGroupLayout ],
      } ),
      compute: {
        module: shader.module,
        entryPoint: 'main',
      },
    } );
  } );

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
  console.log( `use_large_path_scan: ${workgroupCounts.use_large_path_scan}` );

  // TODO: We'll need a solution to pool buffers
  const createBuffer = ( label, size ) => {
    const buffer = device.createBuffer( {
      label,
      size: Math.max( size, 16 ), // Min of 16 bytes used, copying vello buffer requirements
      usage: GPUBufferUsage.COPY_SRC | GPUBufferUsage.COPY_DST | GPUBufferUsage.STORAGE
    } );
    return buffer;
  };

  const sceneBuffer = createBuffer( 'scene buffer', sceneBytes.byteLength );
  device.queue.writeBuffer( sceneBuffer, 0, sceneBytes.buffer );

  const configBuffer = device.createBuffer( {
    label: 'config buffer',
    size: configBytes.byteLength,
    // Different than the typical buffer
    usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
  } );
  device.queue.writeBuffer( configBuffer, 0, configBytes.buffer );

  const infoBinDataBuffer = createBuffer( 'info_bin_data buffer', bufferSizes.bin_data.size_in_bytes );
  const tileBuffer = createBuffer( 'tile buffer', bufferSizes.tiles.size_in_bytes );
  const segmentsBuffer = createBuffer( 'segments buffer', bufferSizes.segments.size_in_bytes );
  const ptclBuffer = createBuffer( 'ptcl buffer', bufferSizes.ptcl.size_in_bytes );
  const reducedBuffer = createBuffer( 'reduced buffer', bufferSizes.path_reduced.size_in_bytes );

  // TODO: rename, buffer could be GPUTextureView also
  const buffersToEntries = buffers => buffers.map( ( buffer, i ) => ( {
    binding: i,
    // handle GPUTextureView
    resource: buffer instanceof GPUBuffer ? { buffer: buffer } : buffer
  } ) );

  const encoder = device.createCommandEncoder( {
    label: 'the encoder',
  } );

  const dispatch = ( shaderName, internalShaderName, wg_counts, buffers ) => {
    const shader = shaders[ internalShaderName ];
    const bindGroup = device.createBindGroup( {
      label: `${shaderName} bindGroup`,
      layout: shader.bindGroupLayout,
      entries: buffersToEntries( buffers )
    } );
    const computePass = encoder.beginComputePass( {
      label: `${shaderName} compute pass`
    } );
    computePass.setPipeline( shader.pipeline );
    computePass.setBindGroup( 0, bindGroup );
    computePass.dispatchWorkgroups( wg_counts.x, wg_counts.y, wg_counts.z );
    computePass.end(); // TODO: does this mess stuff up?
  };

  dispatch( 'pathtag_reduce', 'pathtag_reduce', workgroupCounts.path_reduce, [ configBuffer, sceneBuffer, reducedBuffer ] );

  let pathtag_parent = reducedBuffer;
  let large_pathtag_bufs = null;

  if ( workgroupCounts.use_large_path_scan ) {
    const reduced2Buffer = createBuffer( 'reduced2 buffer', bufferSizes.path_reduced2.size_in_bytes );

    dispatch( 'pathtag_reduce2', 'pathtag_reduce2', workgroupCounts.path_reduce2, [ reducedBuffer, reduced2Buffer ] );

    const reducedScanBuffer = createBuffer( 'reducedScan buffer', bufferSizes.path_reduced_scan.size_in_bytes );

    dispatch( 'pathtag_scan1', 'pathtag_scan1', workgroupCounts.path_scan1, [ reducedBuffer, reduced2Buffer, reducedScanBuffer ] );

    pathtag_parent = reducedScanBuffer;
    large_pathtag_bufs = [ reduced2Buffer, reducedScanBuffer ];
  }

  const tagmonoidBuffer = createBuffer( 'tagmonoid buffer', bufferSizes.path_monoids.size_in_bytes );

  if ( workgroupCounts.use_large_path_scan ) {
    dispatch( 'pathtag_scan', 'pathtag_scan_large', workgroupCounts.path_scan, [ configBuffer, sceneBuffer, pathtag_parent, tagmonoidBuffer ] );
  }
  else {
    dispatch( 'pathtag_scan', 'pathtag_scan_small', workgroupCounts.path_scan, [ configBuffer, sceneBuffer, pathtag_parent, tagmonoidBuffer ] );
  }

  // free reducedBuffer
  // if ( large_pathtag_bufs ) {
  //   // free reduced2 / reducedScan
  // }

  const pathBBoxBuffer = createBuffer( 'pathBBox buffer', bufferSizes.path_bboxes.size_in_bytes );
  dispatch( 'bbox_clear', 'bbox_clear', workgroupCounts.bbox_clear, [ configBuffer, pathBBoxBuffer ] );

  const cubicBuffer = createBuffer( 'cubic buffer', bufferSizes.cubics.size_in_bytes );

  dispatch( 'pathseg', 'pathseg', workgroupCounts.path_seg, [ configBuffer, sceneBuffer, tagmonoidBuffer, pathBBoxBuffer, cubicBuffer ] );

  const drawReducedBuffer = createBuffer( 'drawReduced buffer', bufferSizes.draw_reduced.size_in_bytes );

  dispatch( 'draw_reduce', 'draw_reduce', workgroupCounts.draw_reduce, [ configBuffer, sceneBuffer, drawReducedBuffer ] );

  const drawMonoidBuffer = createBuffer( 'drawMonoid buffer', bufferSizes.draw_monoids.size_in_bytes );
  const clipInpBuffer = createBuffer( 'clipInp buffer', bufferSizes.clip_inps.size_in_bytes );

  dispatch( 'draw_leaf', 'draw_leaf', workgroupCounts.draw_leaf, [ configBuffer, sceneBuffer, drawReducedBuffer, pathBBoxBuffer, drawMonoidBuffer, infoBinDataBuffer, clipInpBuffer ] );

  // free drawReducedBuffer

  const clipElBuffer = createBuffer( 'clipEl buffer', bufferSizes.clip_els.size_in_bytes );
  const clipBicBuffer = createBuffer( 'clipBic buffer', bufferSizes.clip_bics.size_in_bytes );

  if ( workgroupCounts.clip_reduce.x > 0 ) {
    dispatch( 'clip_reduce', 'clip_reduce', workgroupCounts.clip_reduce, [ configBuffer, clipInpBuffer, pathBBoxBuffer, clipBicBuffer, clipElBuffer ] );
  }

  const clipBBoxBuffer = createBuffer( 'clipBBox buffer', bufferSizes.clip_bboxes.size_in_bytes );

  if ( workgroupCounts.clip_leaf.x > 0 ) {
    dispatch( 'clip_leaf', 'clip_leaf', workgroupCounts.clip_leaf, [ configBuffer, clipInpBuffer, pathBBoxBuffer, clipBicBuffer, clipElBuffer, drawMonoidBuffer, clipBBoxBuffer ] );
  }

  // free clipInpBuffer, clipBicBuffer, clipElBuffer

  const drawBBoxBuffer = createBuffer( 'drawBBox buffer', bufferSizes.draw_bboxes.size_in_bytes );
  const bumpBuffer = createBuffer( 'bump buffer', bufferSizes.bump_alloc.size_in_bytes );
  const binHeaderBuffer = createBuffer( 'binHeader buffer', bufferSizes.bin_headers.size_in_bytes );

  // TODO: wgpu might not have this implemented? Do I need a manual clear?
  // TODO: actually, we're not reusing the buffer, so it might be zero'ed out? Check spec
  // TODO: See if this clearBuffer is insufficient (implied by engine.rs docs)
  encoder.clearBuffer( bumpBuffer, 0 );
  // device.queue.writeBuffer( bumpBuffer, 0, new Uint8Array( bumpBuffer.size ) );

  dispatch( 'binning', 'binning', workgroupCounts.binning, [ configBuffer, drawMonoidBuffer, pathBBoxBuffer, clipBBoxBuffer, drawBBoxBuffer, bumpBuffer, infoBinDataBuffer, binHeaderBuffer ] );

  // free drawMonoidBuffer, pathBBoxBuffer, clipBBoxBuffer

  // Note: this only needs to be rounded up because of the workaround to store the tile_offset
  // in storage rather than workgroup memory.
  const pathBuffer = createBuffer( 'path buffer', bufferSizes.paths.size_in_bytes );

  dispatch( 'tile_alloc', 'tile_alloc', workgroupCounts.tile_alloc, [ configBuffer, sceneBuffer, drawBBoxBuffer, bumpBuffer, pathBuffer, tileBuffer ] );

  // free drawBBoxBuffer

  dispatch( 'path_coarse', 'path_coarse_full', workgroupCounts.path_coarse, [ configBuffer, sceneBuffer, tagmonoidBuffer, cubicBuffer, pathBuffer, bumpBuffer, tileBuffer, segmentsBuffer ] );

  // free tagmonoidBuffer, cubicBuffer

  dispatch( 'backdrop', 'backdrop_dyn', workgroupCounts.backdrop, [ configBuffer, pathBuffer, tileBuffer ] );

  dispatch( 'coarse', 'coarse', workgroupCounts.coarse, [ configBuffer, sceneBuffer, drawMonoidBuffer, binHeaderBuffer, infoBinDataBuffer, pathBuffer, tileBuffer, bumpBuffer, ptclBuffer ] );

  // free sceneBuffer, drawMonoidBuffer, binHeaderBuffer, pathBuffer

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

  const canvasOutView = context.getCurrentTexture().createView();

  // dispatch( 'fine', 'fine', workgroupCounts.fine, [ configBuffer, tileBuffer, segmentsBuffer, outImageView, ptclBuffer, gradientImageView, infoBinDataBuffer, atlasImageView ] );
  dispatch( 'fine', 'fine', workgroupCounts.fine, [ configBuffer, tileBuffer, segmentsBuffer, canvasOutView, ptclBuffer, gradientImageView, infoBinDataBuffer, atlasImageView ] );

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

  /* NOTES: bits of coarse/fine shader calls not moved over, including buffer frees
  self.fine_wg_count = Some(wg_counts.fine);
  self.fine_resources = Some(FineResources {
      config_buf,
      bump_buf,
      tile_buf,
      segments_buf,
      ptcl_buf,
      gradient_image,
      info_bin_data_buf,
      image_atlas: ResourceProxy::Image(image_atlas),
      out_image,
  });
  recording.free_resource(bump_buf);
  recording

  ......

  let fine_wg_count = self.fine_wg_count.take().unwrap();
  let fine = self.fine_resources.take().unwrap();
  recording.dispatch(
      shaders.fine,
      fine_wg_count,
      [
          fine.config_buf,
          fine.tile_buf,
          fine.segments_buf,
          ResourceProxy::Image(fine.out_image),
          fine.ptcl_buf,
          fine.gradient_image,
          fine.info_bin_data_buf,
          fine.image_atlas,
      ],
  );
  recording.free_resource(fine.config_buf);
  recording.free_resource(fine.tile_buf);
  recording.free_resource(fine.segments_buf);
  recording.free_resource(fine.ptcl_buf);
  recording.free_resource(fine.gradient_image);
  recording.free_resource(fine.image_atlas);
  recording.free_resource(fine.info_bin_data_buf);
   */

  const commandBuffer = encoder.finish();
  device.queue.submit( [ commandBuffer ] );

  sceneEncoding.free();
  demoImage.free();
});

// NOTE: Some render-path notes below:
// render_to_surface
// render_to_surface_async
// Event::RedrawRequested (in with_winit's src/lib)
// render_to_surface / render_to_surface_async
// render_to_texture_async ( or... render_encoding_full )
// render_encoding_coarse / record_fine
