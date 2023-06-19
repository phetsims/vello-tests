import Render from './render.js';
import SceneFrame from './SceneFrame.js';
import { VelloEncoding, VelloMix, VelloCompose } from "../pkg/vello_tests.js";
import { addImage } from './imageMap.js';
import getTextEncoding from './getTextEncoding.js';
import { default as Encoding, Affine, Extend, ColorStop, ImageStub, Mix, Compose, RenderConfig } from './Encoding.js';

let demoImage;

const exampleScene = ( scale ) => {

  // Wait for WASM to be ready
  if ( !demoImage ) {
    // An example image with a gradient (permanent, not freed)
    const demoImageWidth = 256;
    const demoImageHeight = 256;
    const demoImageData = new Uint8Array( demoImageWidth * demoImageHeight * 4 );
    for ( let x = 0; x < demoImageWidth; x++ ) {
      for ( let y = 0; y < demoImageHeight; y++ ) {
        demoImageData.set( [ x, y, 0, 255 ], ( x + y * demoImageWidth ) * 4 );
      }
    }
    demoImage = addImage( demoImageWidth, demoImageHeight, demoImageData.buffer );
  }

  const sceneEncoding = VelloEncoding.new_scene();
  const encoding = new VelloEncoding();

  const testSceneEncoding = new Encoding();
  testSceneEncoding.reset( false );

  const testEncoding = new Encoding();

  const log = ( wasmEncoding, jsEncoding ) => {
    console.log( '|||||||||||||||| WASM encoding' );
    wasmEncoding.print_debug();

    console.log( '|||||||||||||||| JS encoding' );
    jsEncoding.print_debug();

    // TODO: keep both for testing, have an API that sends same commands to both

    // TODO: ramp and premultiply is causing things to be 1-off sometimes. Make it fully reproducible

    const wasmRenderConfig = wasmEncoding.render( 512, 512, 0x666666ff );

    console.log( '################ WASM scene' );
    console.log( [ ...wasmRenderConfig.scene() ] );
    console.log( 'ramps', wasmRenderConfig.ramps_width, wasmRenderConfig.ramps_height, [ ...wasmRenderConfig.ramps() ] );

    const resolved = jsEncoding.resolve();
    console.log( '################ JS scene' );
    console.log( [ ...resolved.packed ] );
    console.log( 'ramps', resolved.ramps.width, resolved.ramps.height, [ ...resolved.ramps.data ] );

    console.log( resolved.images );

    console.log( '################' );
    console.log( `scene ok: ${_.isEqual( [ ...wasmRenderConfig.scene() ], [ ...resolved.packed ] )}` );
    console.log( `max diff: ${_.max( _.zip( [ ...wasmRenderConfig.scene() ], [ ...resolved.packed ] ).map( arr => arr[ 0 ] - arr[ 1 ] ) )}` );
    console.log( `ramps ok: ${_.isEqual( [ ...wasmRenderConfig.ramps() ], [ ...resolved.ramps.data ] )}` );
    console.log( `max diff: ${_.max( _.zip( [ ...wasmRenderConfig.ramps() ], [ ...resolved.ramps.data ] ).map( arr => arr[ 0 ] - arr[ 1 ] ) )}` );

    const jsRenderConfig = new RenderConfig( resolved.layout, 512, 512, 0x666666ff );



    const wasmWorkgroupCounts = wasmRenderConfig.workgroup_counts();
    const wasmBufferSizes = wasmRenderConfig.buffer_sizes();
    const wasmConfigBytes = wasmRenderConfig.config_bytes();

    const jsConfigBytes = jsRenderConfig.config_bytes;

    console.log( '################ WASM config' );

    console.log( `config_bytes: ${[ ...wasmConfigBytes ]}` );
    // console.log( `workgroup_counts.use_large_path_scan: ${wasmWorkgroupCounts.use_large_path_scan}` );
    // console.log( `workgroup_counts.path_reduce: [${wasmWorkgroupCounts.path_reduce.x}, ${wasmWorkgroupCounts.path_reduce.y}, ${wasmWorkgroupCounts.path_reduce.z}]` );
    // console.log( `workgroup_counts.path_reduce2: [${wasmWorkgroupCounts.path_reduce2.x}, ${wasmWorkgroupCounts.path_reduce2.y}, ${wasmWorkgroupCounts.path_reduce2.z}]` );
    // console.log( `workgroup_counts.path_scan1: [${wasmWorkgroupCounts.path_scan1.x}, ${wasmWorkgroupCounts.path_scan1.y}, ${wasmWorkgroupCounts.path_scan1.z}]` );
    // console.log( `workgroup_counts.path_scan: [${wasmWorkgroupCounts.path_scan.x}, ${wasmWorkgroupCounts.path_scan.y}, ${wasmWorkgroupCounts.path_scan.z}]` );
    // console.log( `workgroup_counts.bbox_clear: [${wasmWorkgroupCounts.bbox_clear.x}, ${wasmWorkgroupCounts.bbox_clear.y}, ${wasmWorkgroupCounts.bbox_clear.z}]` );
    // console.log( `workgroup_counts.path_seg: [${wasmWorkgroupCounts.path_seg.x}, ${wasmWorkgroupCounts.path_seg.y}, ${wasmWorkgroupCounts.path_seg.z}]` );
    // console.log( `workgroup_counts.draw_reduce: [${wasmWorkgroupCounts.draw_reduce.x}, ${wasmWorkgroupCounts.draw_reduce.y}, ${wasmWorkgroupCounts.draw_reduce.z}]` );
    // console.log( `workgroup_counts.draw_leaf: [${wasmWorkgroupCounts.draw_leaf.x}, ${wasmWorkgroupCounts.draw_leaf.y}, ${wasmWorkgroupCounts.draw_leaf.z}]` );
    // console.log( `workgroup_counts.clip_reduce: [${wasmWorkgroupCounts.clip_reduce.x}, ${wasmWorkgroupCounts.clip_reduce.y}, ${wasmWorkgroupCounts.clip_reduce.z}]` );
    // console.log( `workgroup_counts.clip_leaf: [${wasmWorkgroupCounts.clip_leaf.x}, ${wasmWorkgroupCounts.clip_leaf.y}, ${wasmWorkgroupCounts.clip_leaf.z}]` );
    // console.log( `workgroup_counts.binning: [${wasmWorkgroupCounts.binning.x}, ${wasmWorkgroupCounts.binning.y}, ${wasmWorkgroupCounts.binning.z}]` );
    // console.log( `workgroup_counts.tile_alloc: [${wasmWorkgroupCounts.tile_alloc.x}, ${wasmWorkgroupCounts.tile_alloc.y}, ${wasmWorkgroupCounts.tile_alloc.z}]` );
    // console.log( `workgroup_counts.path_coarse: [${wasmWorkgroupCounts.path_coarse.x}, ${wasmWorkgroupCounts.path_coarse.y}, ${wasmWorkgroupCounts.path_coarse.z}]` );
    // console.log( `workgroup_counts.backdrop: [${wasmWorkgroupCounts.backdrop.x}, ${wasmWorkgroupCounts.backdrop.y}, ${wasmWorkgroupCounts.backdrop.z}]` );
    // console.log( `workgroup_counts.coarse: [${wasmWorkgroupCounts.coarse.x}, ${wasmWorkgroupCounts.coarse.y}, ${wasmWorkgroupCounts.coarse.z}]` );
    // console.log( `workgroup_counts.fine: [${wasmWorkgroupCounts.fine.x}, ${wasmWorkgroupCounts.fine.y}, ${wasmWorkgroupCounts.fine.z}]` );

    // console.log( `buffer_sizes.path_reduced.size_in_bytes: ${wasmBufferSizes.path_reduced.size_in_bytes}` );
    // console.log( `buffer_sizes.path_reduced2.size_in_bytes: ${wasmBufferSizes.path_reduced2.size_in_bytes}` );
    // console.log( `buffer_sizes.path_reduced_scan.size_in_bytes: ${wasmBufferSizes.path_reduced_scan.size_in_bytes}` );
    // console.log( `buffer_sizes.path_monoids.size_in_bytes: ${wasmBufferSizes.path_monoids.size_in_bytes}` );
    // console.log( `buffer_sizes.path_bboxes.size_in_bytes: ${wasmBufferSizes.path_bboxes.size_in_bytes}` );
    // console.log( `buffer_sizes.cubics.size_in_bytes: ${wasmBufferSizes.cubics.size_in_bytes}` );
    // console.log( `buffer_sizes.draw_reduced.size_in_bytes: ${wasmBufferSizes.draw_reduced.size_in_bytes}` );
    // console.log( `buffer_sizes.draw_monoids.size_in_bytes: ${wasmBufferSizes.draw_monoids.size_in_bytes}` );
    console.log( `buffer_sizes.info.size_in_bytes: ${wasmBufferSizes.info.size_in_bytes}` );
    // console.log( `buffer_sizes.clip_inps.size_in_bytes: ${wasmBufferSizes.clip_inps.size_in_bytes}` );
    // console.log( `buffer_sizes.clip_els.size_in_bytes: ${wasmBufferSizes.clip_els.size_in_bytes}` );
    // console.log( `buffer_sizes.clip_bics.size_in_bytes: ${wasmBufferSizes.clip_bics.size_in_bytes}` );
    // console.log( `buffer_sizes.clip_bboxes.size_in_bytes: ${wasmBufferSizes.clip_bboxes.size_in_bytes}` );
    // console.log( `buffer_sizes.draw_bboxes.size_in_bytes: ${wasmBufferSizes.draw_bboxes.size_in_bytes}` );
    // console.log( `buffer_sizes.bump_alloc.size_in_bytes: ${wasmBufferSizes.bump_alloc.size_in_bytes}` );
    // console.log( `buffer_sizes.bin_headers.size_in_bytes: ${wasmBufferSizes.bin_headers.size_in_bytes}` );
    // console.log( `buffer_sizes.paths.size_in_bytes: ${wasmBufferSizes.paths.size_in_bytes}` );
    // console.log( `buffer_sizes.bin_data.size_in_bytes: ${wasmBufferSizes.bin_data.size_in_bytes}` );
    // console.log( `buffer_sizes.tiles.size_in_bytes: ${wasmBufferSizes.tiles.size_in_bytes}` );
    // console.log( `buffer_sizes.segments.size_in_bytes: ${wasmBufferSizes.segments.size_in_bytes}` );
    // console.log( `buffer_sizes.ptcl.size_in_bytes: ${wasmBufferSizes.ptcl.size_in_bytes}` );

    console.log( `gpu.width_in_tiles: ${wasmRenderConfig.config_uniform().width_in_tiles}` );
    console.log( `gpu.height_in_tiles: ${wasmRenderConfig.config_uniform().height_in_tiles}` );
    console.log( `gpu.target_width: ${wasmRenderConfig.config_uniform().target_width}` );
    console.log( `gpu.target_height: ${wasmRenderConfig.config_uniform().target_height}` );
    console.log( `gpu.base_color: ${wasmRenderConfig.config_uniform().base_color}` );

    console.log( `gpu.layout.n_draw_objects: ${wasmRenderConfig.config_uniform().layout.n_draw_objects}` );
    console.log( `gpu.layout.n_paths: ${wasmRenderConfig.config_uniform().layout.n_paths}` );
    console.log( `gpu.layout.n_clips: ${wasmRenderConfig.config_uniform().layout.n_clips}` );
    console.log( `gpu.layout.bin_data_start: ${wasmRenderConfig.config_uniform().layout.bin_data_start}` );
    console.log( `gpu.layout.path_tag_base: ${wasmRenderConfig.config_uniform().layout.path_tag_base}` );
    console.log( `gpu.layout.path_data_base: ${wasmRenderConfig.config_uniform().layout.path_data_base}` );
    console.log( `gpu.layout.draw_tag_base: ${wasmRenderConfig.config_uniform().layout.draw_tag_base}` );
    console.log( `gpu.layout.draw_data_base: ${wasmRenderConfig.config_uniform().layout.draw_data_base}` );
    console.log( `gpu.layout.transform_base: ${wasmRenderConfig.config_uniform().layout.transform_base}` );
    console.log( `gpu.layout.linewidth_base: ${wasmRenderConfig.config_uniform().layout.linewidth_base}` );

    console.log( `gpu.binning_size: ${wasmRenderConfig.config_uniform().binning_size}` );
    console.log( `gpu.tiles_size: ${wasmRenderConfig.config_uniform().tiles_size}` );
    console.log( `gpu.segments_size: ${wasmRenderConfig.config_uniform().segments_size}` );
    console.log( `gpu.ptcl_size: ${wasmRenderConfig.config_uniform().ptcl_size}` );

    console.log( '################ JS config' );

    console.log( `config_bytes: ${[ ...jsConfigBytes ]}` );
    // console.log( `workgroup_counts.use_large_path_scan: ${jsRenderConfig.workgroup_counts.use_large_path_scan}` );
    // console.log( `workgroup_counts.path_reduce: ${jsRenderConfig.workgroup_counts.path_reduce}` );
    // console.log( `workgroup_counts.path_reduce2: ${jsRenderConfig.workgroup_counts.path_reduce2}` );
    // console.log( `workgroup_counts.path_scan1: ${jsRenderConfig.workgroup_counts.path_scan1}` );
    // console.log( `workgroup_counts.path_scan: ${jsRenderConfig.workgroup_counts.path_scan}` );
    // console.log( `workgroup_counts.bbox_clear: ${jsRenderConfig.workgroup_counts.bbox_clear}` );
    // console.log( `workgroup_counts.path_seg: ${jsRenderConfig.workgroup_counts.path_seg}` );
    // console.log( `workgroup_counts.draw_reduce: ${jsRenderConfig.workgroup_counts.draw_reduce}` );
    // console.log( `workgroup_counts.draw_leaf: ${jsRenderConfig.workgroup_counts.draw_leaf}` );
    // console.log( `workgroup_counts.clip_reduce: ${jsRenderConfig.workgroup_counts.clip_reduce}` );
    // console.log( `workgroup_counts.clip_leaf: ${jsRenderConfig.workgroup_counts.clip_leaf}` );
    // console.log( `workgroup_counts.binning: ${jsRenderConfig.workgroup_counts.binning}` );
    // console.log( `workgroup_counts.tile_alloc: ${jsRenderConfig.workgroup_counts.tile_alloc}` );
    // console.log( `workgroup_counts.path_coarse: ${jsRenderConfig.workgroup_counts.path_coarse}` );
    // console.log( `workgroup_counts.backdrop: ${jsRenderConfig.workgroup_counts.backdrop}` );
    // console.log( `workgroup_counts.coarse: ${jsRenderConfig.workgroup_counts.coarse}` );
    // console.log( `workgroup_counts.fine: ${jsRenderConfig.workgroup_counts.fine}` );

    // console.log( `buffer_sizes.path_reduced.size_in_bytes: ${jsRenderConfig.buffer_sizes.path_reduced.size_in_bytes()}` );
    // console.log( `buffer_sizes.path_reduced2.size_in_bytes: ${jsRenderConfig.buffer_sizes.path_reduced2.size_in_bytes()}` );
    // console.log( `buffer_sizes.path_reduced_scan.size_in_bytes: ${jsRenderConfig.buffer_sizes.path_reduced_scan.size_in_bytes()}` );
    // console.log( `buffer_sizes.path_monoids.size_in_bytes: ${jsRenderConfig.buffer_sizes.path_monoids.size_in_bytes()}` );
    // console.log( `buffer_sizes.path_bboxes.size_in_bytes: ${jsRenderConfig.buffer_sizes.path_bboxes.size_in_bytes()}` );
    // console.log( `buffer_sizes.cubics.size_in_bytes: ${jsRenderConfig.buffer_sizes.cubics.size_in_bytes()}` );
    // console.log( `buffer_sizes.draw_reduced.size_in_bytes: ${jsRenderConfig.buffer_sizes.draw_reduced.size_in_bytes()}` );
    // console.log( `buffer_sizes.draw_monoids.size_in_bytes: ${jsRenderConfig.buffer_sizes.draw_monoids.size_in_bytes()}` );
    console.log( `buffer_sizes.info.size_in_bytes: ${jsRenderConfig.buffer_sizes.info.size_in_bytes()}` );
    // console.log( `buffer_sizes.clip_inps.size_in_bytes: ${jsRenderConfig.buffer_sizes.clip_inps.size_in_bytes()}` );
    // console.log( `buffer_sizes.clip_els.size_in_bytes: ${jsRenderConfig.buffer_sizes.clip_els.size_in_bytes()}` );
    // console.log( `buffer_sizes.clip_bics.size_in_bytes: ${jsRenderConfig.buffer_sizes.clip_bics.size_in_bytes()}` );
    // console.log( `buffer_sizes.clip_bboxes.size_in_bytes: ${jsRenderConfig.buffer_sizes.clip_bboxes.size_in_bytes()}` );
    // console.log( `buffer_sizes.draw_bboxes.size_in_bytes: ${jsRenderConfig.buffer_sizes.draw_bboxes.size_in_bytes()}` );
    // console.log( `buffer_sizes.bump_alloc.size_in_bytes: ${jsRenderConfig.buffer_sizes.bump_alloc.size_in_bytes()}` );
    // console.log( `buffer_sizes.bin_headers.size_in_bytes: ${jsRenderConfig.buffer_sizes.bin_headers.size_in_bytes()}` );
    // console.log( `buffer_sizes.paths.size_in_bytes: ${jsRenderConfig.buffer_sizes.paths.size_in_bytes()}` );
    // console.log( `buffer_sizes.bin_data.size_in_bytes: ${jsRenderConfig.buffer_sizes.bin_data.size_in_bytes()}` );
    // console.log( `buffer_sizes.tiles.size_in_bytes: ${jsRenderConfig.buffer_sizes.tiles.size_in_bytes()}` );
    // console.log( `buffer_sizes.segments.size_in_bytes: ${jsRenderConfig.buffer_sizes.segments.size_in_bytes()}` );
    // console.log( `buffer_sizes.ptcl.size_in_bytes: ${jsRenderConfig.buffer_sizes.ptcl.size_in_bytes()}` );

    console.log( `gpu.width_in_tiles: ${jsRenderConfig.gpu.width_in_tiles}` );
    console.log( `gpu.height_in_tiles: ${jsRenderConfig.gpu.height_in_tiles}` );
    console.log( `gpu.target_width: ${jsRenderConfig.gpu.target_width}` );
    console.log( `gpu.target_height: ${jsRenderConfig.gpu.target_height}` );
    console.log( `gpu.base_color: ${jsRenderConfig.gpu.base_color}` );

    console.log( `gpu.layout.n_draw_objects: ${jsRenderConfig.gpu.layout.n_draw_objects}` );
    console.log( `gpu.layout.n_paths: ${jsRenderConfig.gpu.layout.n_paths}` );
    console.log( `gpu.layout.n_clips: ${jsRenderConfig.gpu.layout.n_clips}` );
    console.log( `gpu.layout.bin_data_start: ${jsRenderConfig.gpu.layout.bin_data_start}` );
    console.log( `gpu.layout.path_tag_base: ${jsRenderConfig.gpu.layout.path_tag_base}` );
    console.log( `gpu.layout.path_data_base: ${jsRenderConfig.gpu.layout.path_data_base}` );
    console.log( `gpu.layout.draw_tag_base: ${jsRenderConfig.gpu.layout.draw_tag_base}` );
    console.log( `gpu.layout.draw_data_base: ${jsRenderConfig.gpu.layout.draw_data_base}` );
    console.log( `gpu.layout.transform_base: ${jsRenderConfig.gpu.layout.transform_base}` );
    console.log( `gpu.layout.linewidth_base: ${jsRenderConfig.gpu.layout.linewidth_base}` );

    console.log( `gpu.binning_size: ${jsRenderConfig.gpu.binning_size}` );
    console.log( `gpu.tiles_size: ${jsRenderConfig.gpu.tiles_size}` );
    console.log( `gpu.segments_size: ${jsRenderConfig.gpu.segments_size}` );
    console.log( `gpu.ptcl_size: ${jsRenderConfig.gpu.ptcl_size}` );
  };

  const angle = Date.now() / 1000;
  let c = Math.cos( angle );
  let s = Math.sin( angle );

  encoding.matrix( c, -s, s, c, 200, 100 );
  testEncoding.encode_transform( new Affine( c, -s, s, c, 200, 100 ) );
  encoding.linewidth( -1 );
  testEncoding.encode_linewidth( -1 );
  encoding.json_path( true, true, JSON.stringify( [
    { type: 'MoveTo', x: -100, y: -100 },
    { type: 'QuadTo', x1: 0, y1: 0, x2: 100, y2: -100 },
    { type: 'LineTo', x: 100, y: 100 },
    { type: 'CubicTo', x1: 0, y1: 200, x2: 0, y2: 0, x3: -100, y3: 100 },
    { type: 'LineTo', x: -100, y: -100 },
    { type: 'Close' }
  ] ) );
  testEncoding.encode_path( true );
  testEncoding.move_to( -100, -100 );
  testEncoding.quad_to( 0, 0, 100, -100 );
  testEncoding.line_to( 100, 100 );
  testEncoding.cubic_to( 0, 200, 0, 0, -100, 100 );
  testEncoding.line_to( -100, -100 );
  testEncoding.close();
  testEncoding.finish( true );
  encoding.linear_gradient( -100, 0, 100, 0, 1, 0, new Float32Array( [ 0, 1 ] ), new Uint32Array( [ 0xff0000ff, 0x0000ffff ] ) );
  testEncoding.encode_linear_gradient( -100, 0, 100, 0, [
    new ColorStop( 0, 0xff0000ff ),
    new ColorStop( 1, 0x0000ffff )
  ], Extend.Pad );


  encoding.matrix( c, -s, s, c, 150, 200 );
  testEncoding.encode_transform( new Affine( c, -s, s, c, 150, 200 ) );
  encoding.linewidth( -1 );
  testEncoding.encode_linewidth( -1 );
  encoding.svg_path( true, true, 'M 0 0 L 128 0 Q 256 0 256 128 L 256 256 L 128 256 Q 0 256 0 128 L 0 0 Z' );
  testEncoding.encode_path( true );
  testEncoding.move_to( 0, 0 );
  testEncoding.line_to( 128, 0 );
  testEncoding.quad_to( 256, 0, 256, 128 );
  testEncoding.line_to( 256, 256 );
  testEncoding.line_to( 128, 256 );
  testEncoding.quad_to( 0, 256, 0, 128 );
  testEncoding.line_to( 0, 0 );
  testEncoding.close();
  testEncoding.finish( true );
  encoding.image( demoImage, 1 );
  const stub = new ImageStub( 256, 256, 0 );
  testEncoding.encode_image( stub );

  // For a layer push: matrix, linewidth(-1), shape, begin_clip
  encoding.matrix( 1, 0, 0, 1, 0, 0 );
  testEncoding.encode_transform( new Affine( 1, 0, 0, 1, 0, 0 ) );
  encoding.linewidth( -1 );
  testEncoding.encode_linewidth( -1 );
  // TODO: add rect() to avoid overhead
  encoding.svg_path( true, true, 'M 0 0 L 512 0 L 256 256 L 0 512 Z' );
  testEncoding.encode_path( true );
  testEncoding.move_to( 0, 0 );
  testEncoding.line_to( 512, 0 );
  testEncoding.line_to( 256, 256 );
  testEncoding.line_to( 0, 512 );
  testEncoding.close();
  testEncoding.finish( true );
  encoding.begin_clip( VelloMix.Normal, VelloCompose.SrcOver, 0.5 ); // TODO: alpha 0.5 on clip layer fails EXCEPT on fine tiles where it ends
  testEncoding.encode_begin_clip( Mix.Normal, Compose.SrcOver, 0.5 );

  encoding.matrix( c, -s, s, c, 200, 400 );
  testEncoding.encode_transform( new Affine( c, -s, s, c, 200, 400 ) );
  encoding.linewidth( -1 );
  testEncoding.encode_linewidth( -1 );
  encoding.svg_path( true, true, 'M -100 -100 L 100 -100 L 0 100 L -100 100 L -100 -100 Z' );
  testEncoding.encode_path( true );
  testEncoding.move_to( -100, -100 );
  testEncoding.line_to( 100, -100 );
  testEncoding.line_to( 0, 100 );
  testEncoding.line_to( -100, 100 );
  testEncoding.line_to( -100, -100 );
  testEncoding.close();
  testEncoding.finish( true );
  encoding.radial_gradient( 0, 0, 20, 0, 0, 120, 1, 0, new Float32Array( [ 0, 1 ] ), new Uint32Array( [ 0x0000ffff, 0x00ff00ff ] ) );
  testEncoding.encode_radial_gradient( 0, 0, 20, 0, 0, 120, [
    new ColorStop( 0, 0x0000ffff ),
    new ColorStop( 1, 0x00ff00ff )
  ], Extend.Pad );

  encoding.end_clip();
  testEncoding.encode_end_clip();

  encoding.color( 0x330000ff );
  testEncoding.encode_color( 0x330000ff );

  // const textScale = 40 + 10 * Math.sin( Date.now() / 1000 );
  // const textEncoding = getTextEncoding( 'How is this text? No hints!', shaping.Direction.LTR );
  // if ( !textEncoding.is_empty() ) {
  //   encoding.append_with_transform( textEncoding, textScale, 0, 0, textScale, 5, 400 );
  //   encoding.color( 0x330000ff );
  // }

  const intermediateEncoding = new VelloEncoding();
  intermediateEncoding.append( encoding );
  intermediateEncoding.append_with_transform( encoding, 0.4, 0, 0, 0.4, Math.floor( 512 * ( 1 - 0.4 ) ) + 20, 0 );
  const testIntermediateEncoding = new Encoding();
  testIntermediateEncoding.append( testEncoding );
  testIntermediateEncoding.append( testEncoding, new Affine( 0.4, 0, 0, 0.4, Math.floor( 512 * ( 1 - 0.4 ) ) + 20, 0 ) );

  log( intermediateEncoding, testIntermediateEncoding );

  sceneEncoding.append_with_transform( intermediateEncoding, scale, 0, 0, scale, 0, 0 );
  // sceneEncoding.append_with_transform( intermediateEncoding, scale, 0, 0, scale, 100, 100 );
  // sceneEncoding.append_with_transform( intermediateEncoding, scale, 0, 0, scale, 200, 200 );
  // sceneEncoding.append_with_transform( intermediateEncoding, scale, 0, 0, scale, 300, 300 );

  encoding.free();
  intermediateEncoding.free();

  sceneEncoding.finalize_scene();

  // TODO: scaling based on devicePixelRatio
  return new SceneFrame( sceneEncoding, () => {
    sceneEncoding.free();
  } )
};

export default exampleScene;
