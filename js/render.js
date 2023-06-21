import BufferPool from "./BufferPool.js";
import Shader from './Shader.js';
import { ResolvedEncoding } from './Encoding.js';

const render = ( sceneFrame, device, outTexture ) => {
  const width = outTexture.width;
  const height = outTexture.height;

  const shaders = Shader.getShaders( device );

  const preferredFormat = outTexture.format;
  if ( preferredFormat !== 'bgra8unorm' && preferredFormat !== 'rgba8unorm' ) {
    throw new Error( 'unsupported format' );
  }

  // const sceneData = JSON.parse( '{"packed":"IEAKCQoJCgkKDRAgCgkKCQkNECAJCQ0QQAkJDRAgQAoJCgkJDRAgCQkNEEAJCQ0QIEAKCQoJCgkKDRAgQAoJCgkJDRAgCQkNEEAJCQ0QIEAKCQoJCQ0QIAkJDRBACQkNECBACgkKCQoJCg0QIEAKCQoJCgkKDRAgQAoJCgkKCQoNEEAKCQoJCgkKDRAgQA0QAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA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","layout":{"n_draw_objects":19,"n_paths":19,"n_clips":0,"bin_data_start":19,"path_tag_base":0,"path_data_base":256,"draw_tag_base":552,"draw_data_base":571,"transform_base":590,"linewidth_base":674},"ramps":{"width":0,"height":0,"data":""},"images":{"width":1024,"height":1024,"images":[]},"renderConfig":null}' );
  // const renderInfo = ResolvedEncoding.deserialize( sceneData );
  // renderInfo.prepareRender( width, height, 0x666666ff );

  const renderInfo = sceneFrame.sceneEncoding.prepareRender( width, height, 0xf4fcfeff );
  // const renderInfo = sceneFrame.sceneEncoding.prepareRender( width, height, 0x666666ff );
  // renderInfo = ResolvedEncoding.deserialize( renderInfo.serialize() ); // serialization test

  // TODO: don't hard-code base_color
  // TODO: rename
  const renderConfig = renderInfo.renderConfig;

  const sceneBytes = renderInfo.packed;

  const ramps = renderInfo.ramps.data;
  const rampsWidth = renderInfo.ramps.width;
  const rampsHeight = renderInfo.ramps.height;
  const hasRamps = rampsHeight > 0;

  // TODO: hook up images
  const images = renderInfo.images.images; // TODO
  const imagesWidth = renderInfo.images.width;
  const imagesHeight = renderInfo.images.height;
  const hasImages = images.length > 0;

  const workgroupCounts = renderConfig.workgroup_counts;
  const bufferSizes = renderConfig.buffer_sizes;
  const configBytes = renderConfig.config_bytes;

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

  const infoBinDataBuffer = bufferPool.getBuffer( bufferSizes.bin_data.size_in_bytes(), 'info_bin_data buffer' );
  const tileBuffer = bufferPool.getBuffer( bufferSizes.tiles.size_in_bytes(), 'tile buffer' );
  const segmentsBuffer = bufferPool.getBuffer( bufferSizes.segments.size_in_bytes(), 'segments buffer' );
  const ptclBuffer = bufferPool.getBuffer( bufferSizes.ptcl.size_in_bytes(), 'ptcl buffer' );
  const reducedBuffer = bufferPool.getBuffer( bufferSizes.path_reduced.size_in_bytes(), 'reduced buffer' );

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
    reduced2Buffer = bufferPool.getBuffer( bufferSizes.path_reduced2.size_in_bytes(), 'reduced2 buffer' );

    shaders.pathtag_reduce2.dispatch( encoder, workgroupCounts.path_reduce2, [
      reducedBuffer, reduced2Buffer
    ] );

    reducedScanBuffer = bufferPool.getBuffer( bufferSizes.path_reduced_scan.size_in_bytes(), 'reducedScan buffer' );

    shaders.pathtag_scan1.dispatch( encoder, workgroupCounts.path_scan1, [
      reducedBuffer, reduced2Buffer, reducedScanBuffer
    ] );

    pathtag_parent = reducedScanBuffer;
  }

  const tagmonoidBuffer = bufferPool.getBuffer( bufferSizes.path_monoids.size_in_bytes(), 'tagmonoid buffer' );

  ( workgroupCounts.use_large_path_scan ? shaders.pathtag_scan_large : shaders.pathtag_scan_small ).dispatch( encoder, workgroupCounts.path_scan, [
    configBuffer, sceneBuffer, pathtag_parent, tagmonoidBuffer
  ] );

  bufferPool.freeBuffer( reducedBuffer );
  reduced2Buffer && bufferPool.freeBuffer( reduced2Buffer );
  reducedScanBuffer && bufferPool.freeBuffer( reducedScanBuffer );

  const pathBBoxBuffer = bufferPool.getBuffer( bufferSizes.path_bboxes.size_in_bytes(), 'pathBBox buffer' );

  shaders.bbox_clear.dispatch( encoder, workgroupCounts.bbox_clear, [
    configBuffer, pathBBoxBuffer
  ] );

  const cubicBuffer = bufferPool.getBuffer( bufferSizes.cubics.size_in_bytes(), 'cubic buffer' );

  shaders.pathseg.dispatch( encoder, workgroupCounts.path_seg, [
    configBuffer, sceneBuffer, tagmonoidBuffer, pathBBoxBuffer, cubicBuffer
  ] );

  const drawReducedBuffer = bufferPool.getBuffer( bufferSizes.draw_reduced.size_in_bytes(), 'drawReduced buffer' );

  shaders.draw_reduce.dispatch( encoder, workgroupCounts.draw_reduce, [
    configBuffer, sceneBuffer, drawReducedBuffer
  ] );

  const drawMonoidBuffer = bufferPool.getBuffer( bufferSizes.draw_monoids.size_in_bytes(), 'drawMonoid buffer' );

  const clipInpBuffer = bufferPool.getBuffer( bufferSizes.clip_inps.size_in_bytes(), 'clipInp buffer' );

  shaders.draw_leaf.dispatch( encoder, workgroupCounts.draw_leaf, [
    configBuffer, sceneBuffer, drawReducedBuffer, pathBBoxBuffer, drawMonoidBuffer, infoBinDataBuffer, clipInpBuffer
  ] );

  bufferPool.freeBuffer( drawReducedBuffer );

  const clipElBuffer = bufferPool.getBuffer( bufferSizes.clip_els.size_in_bytes(), 'clipEl buffer' );

  const clipBicBuffer = bufferPool.getBuffer( bufferSizes.clip_bics.size_in_bytes(), 'clipBic buffer' );

  if ( workgroupCounts.clip_reduce.x > 0 ) {
    shaders.clip_reduce.dispatch( encoder, workgroupCounts.clip_reduce, [
      configBuffer, clipInpBuffer, pathBBoxBuffer, clipBicBuffer, clipElBuffer
    ] );
  }

  const clipBBoxBuffer = bufferPool.getBuffer( bufferSizes.clip_bboxes.size_in_bytes(), 'clipBBox buffer' );

  if ( workgroupCounts.clip_leaf.x > 0 ) {
    shaders.clip_leaf.dispatch( encoder, workgroupCounts.clip_leaf, [
      configBuffer, clipInpBuffer, pathBBoxBuffer, clipBicBuffer, clipElBuffer, drawMonoidBuffer, clipBBoxBuffer
    ] );
  }

  bufferPool.freeBuffer( clipInpBuffer );
  bufferPool.freeBuffer( clipBicBuffer );
  bufferPool.freeBuffer( clipElBuffer );

  const drawBBoxBuffer = bufferPool.getBuffer( bufferSizes.draw_bboxes.size_in_bytes(), 'drawBBox buffer' );

  const bumpBuffer = bufferPool.getBuffer( bufferSizes.bump_alloc.size_in_bytes(), 'bump buffer' );

  const binHeaderBuffer = bufferPool.getBuffer( bufferSizes.bin_headers.size_in_bytes(), 'binHeader buffer' );


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
  const pathBuffer = bufferPool.getBuffer( bufferSizes.paths.size_in_bytes(), 'path buffer' );

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

  // TODO TODO: images
  if ( hasImages ) {
    for ( let i = 0; i < images.length; i++ ) {
      const imageInfo = images[ i ];
      const image = imageInfo.image;
      const x = imageInfo.x;
      const y = imageInfo.y;

      const block_size = 4;

      device.queue.writeTexture( {
        texture: atlasImage,
        origin: { x, y, z: 0 }
      }, image.buffer, {
        offset: 0,
        bytesPerRow: image.width * block_size
      }, {
        width: image.width,
        height: image.height,
        depthOrArrayLayers: 1
      } );
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
};

export default render;
