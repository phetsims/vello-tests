import { Affine, BufferImage } from './Encoding.js';
import examplePhetScene from './examplePhetScene.js';
// import WASMEncoding from './WASMEncoding.js';
import PhetEncoding from './PhetEncoding.js';

let demoImage;

let examplePhetSceneEncoding = null;

const exampleScene = ( scale ) => {

  // const EncodingType = true ? Encoding : WASMEncoding;
  const EncodingType = PhetEncoding;

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
    demoImage = new BufferImage( demoImageWidth, demoImageHeight, demoImageData.buffer );
  }

  const sceneEncoding = new EncodingType();
  sceneEncoding.reset( false );

  const encoding = new EncodingType();

  const log = jsEncoding => {
    console.log( '|||||||||||||||| encoding' );
    jsEncoding.print_debug();

    // TODO: ramp and premultiply is causing things to be 1-off sometimes. Make it fully reproducible

    // TODO: we'll need a device context to get this back to working
    const resolved = jsEncoding.prepareRender( 512, 512, 0x666666ff );

    console.log( '################ JS scene' );
    console.log( [ ...resolved.packed ] );
    console.log( 'ramps', resolved.ramps.width, resolved.ramps.height, [ ...resolved.ramps.data ] );
    console.log( resolved.images );

    const renderConfig = resolved.renderConfig;
    const jsConfigBytes = renderConfig.config_bytes;

    console.log( '################ config' );

    console.log( `config_bytes: ${[ ...jsConfigBytes ]}` );
    console.log( `workgroup_counts.use_large_path_scan: ${renderConfig.workgroup_counts.use_large_path_scan}` );
    console.log( `workgroup_counts.path_reduce: ${renderConfig.workgroup_counts.path_reduce}` );
    console.log( `workgroup_counts.path_reduce2: ${renderConfig.workgroup_counts.path_reduce2}` );
    console.log( `workgroup_counts.path_scan1: ${renderConfig.workgroup_counts.path_scan1}` );
    console.log( `workgroup_counts.path_scan: ${renderConfig.workgroup_counts.path_scan}` );
    console.log( `workgroup_counts.bbox_clear: ${renderConfig.workgroup_counts.bbox_clear}` );
    console.log( `workgroup_counts.path_seg: ${renderConfig.workgroup_counts.path_seg}` );
    console.log( `workgroup_counts.draw_reduce: ${renderConfig.workgroup_counts.draw_reduce}` );
    console.log( `workgroup_counts.draw_leaf: ${renderConfig.workgroup_counts.draw_leaf}` );
    console.log( `workgroup_counts.clip_reduce: ${renderConfig.workgroup_counts.clip_reduce}` );
    console.log( `workgroup_counts.clip_leaf: ${renderConfig.workgroup_counts.clip_leaf}` );
    console.log( `workgroup_counts.binning: ${renderConfig.workgroup_counts.binning}` );
    console.log( `workgroup_counts.tile_alloc: ${renderConfig.workgroup_counts.tile_alloc}` );
    console.log( `workgroup_counts.path_coarse: ${renderConfig.workgroup_counts.path_coarse}` );
    console.log( `workgroup_counts.backdrop: ${renderConfig.workgroup_counts.backdrop}` );
    console.log( `workgroup_counts.coarse: ${renderConfig.workgroup_counts.coarse}` );
    console.log( `workgroup_counts.fine: ${renderConfig.workgroup_counts.fine}` );

    console.log( `buffer_sizes.path_reduced.size_in_bytes: ${renderConfig.buffer_sizes.path_reduced.size_in_bytes()}` );
    console.log( `buffer_sizes.path_reduced2.size_in_bytes: ${renderConfig.buffer_sizes.path_reduced2.size_in_bytes()}` );
    console.log( `buffer_sizes.path_reduced_scan.size_in_bytes: ${renderConfig.buffer_sizes.path_reduced_scan.size_in_bytes()}` );
    console.log( `buffer_sizes.path_monoids.size_in_bytes: ${renderConfig.buffer_sizes.path_monoids.size_in_bytes()}` );
    console.log( `buffer_sizes.path_bboxes.size_in_bytes: ${renderConfig.buffer_sizes.path_bboxes.size_in_bytes()}` );
    console.log( `buffer_sizes.cubics.size_in_bytes: ${renderConfig.buffer_sizes.cubics.size_in_bytes()}` );
    console.log( `buffer_sizes.draw_reduced.size_in_bytes: ${renderConfig.buffer_sizes.draw_reduced.size_in_bytes()}` );
    console.log( `buffer_sizes.draw_monoids.size_in_bytes: ${renderConfig.buffer_sizes.draw_monoids.size_in_bytes()}` );
    console.log( `buffer_sizes.info.size_in_bytes: ${renderConfig.buffer_sizes.info.size_in_bytes()}` );
    console.log( `buffer_sizes.clip_inps.size_in_bytes: ${renderConfig.buffer_sizes.clip_inps.size_in_bytes()}` );
    console.log( `buffer_sizes.clip_els.size_in_bytes: ${renderConfig.buffer_sizes.clip_els.size_in_bytes()}` );
    console.log( `buffer_sizes.clip_bics.size_in_bytes: ${renderConfig.buffer_sizes.clip_bics.size_in_bytes()}` );
    console.log( `buffer_sizes.clip_bboxes.size_in_bytes: ${renderConfig.buffer_sizes.clip_bboxes.size_in_bytes()}` );
    console.log( `buffer_sizes.draw_bboxes.size_in_bytes: ${renderConfig.buffer_sizes.draw_bboxes.size_in_bytes()}` );
    console.log( `buffer_sizes.bump_alloc.size_in_bytes: ${renderConfig.buffer_sizes.bump_alloc.size_in_bytes()}` );
    console.log( `buffer_sizes.bin_headers.size_in_bytes: ${renderConfig.buffer_sizes.bin_headers.size_in_bytes()}` );
    console.log( `buffer_sizes.paths.size_in_bytes: ${renderConfig.buffer_sizes.paths.size_in_bytes()}` );
    console.log( `buffer_sizes.bin_data.size_in_bytes: ${renderConfig.buffer_sizes.bin_data.size_in_bytes()}` );
    console.log( `buffer_sizes.tiles.size_in_bytes: ${renderConfig.buffer_sizes.tiles.size_in_bytes()}` );
    console.log( `buffer_sizes.segments.size_in_bytes: ${renderConfig.buffer_sizes.segments.size_in_bytes()}` );
    console.log( `buffer_sizes.ptcl.size_in_bytes: ${renderConfig.buffer_sizes.ptcl.size_in_bytes()}` );

    console.log( `gpu.width_in_tiles: ${renderConfig.gpu.width_in_tiles}` );
    console.log( `gpu.height_in_tiles: ${renderConfig.gpu.height_in_tiles}` );
    console.log( `gpu.target_width: ${renderConfig.gpu.target_width}` );
    console.log( `gpu.target_height: ${renderConfig.gpu.target_height}` );
    console.log( `gpu.base_color: ${renderConfig.gpu.base_color}` );

    console.log( `gpu.layout.n_draw_objects: ${renderConfig.gpu.layout.n_draw_objects}` );
    console.log( `gpu.layout.n_paths: ${renderConfig.gpu.layout.n_paths}` );
    console.log( `gpu.layout.n_clips: ${renderConfig.gpu.layout.n_clips}` );
    console.log( `gpu.layout.bin_data_start: ${renderConfig.gpu.layout.bin_data_start}` );
    console.log( `gpu.layout.path_tag_base: ${renderConfig.gpu.layout.path_tag_base}` );
    console.log( `gpu.layout.path_data_base: ${renderConfig.gpu.layout.path_data_base}` );
    console.log( `gpu.layout.draw_tag_base: ${renderConfig.gpu.layout.draw_tag_base}` );
    console.log( `gpu.layout.draw_data_base: ${renderConfig.gpu.layout.draw_data_base}` );
    console.log( `gpu.layout.transform_base: ${renderConfig.gpu.layout.transform_base}` );
    console.log( `gpu.layout.linewidth_base: ${renderConfig.gpu.layout.linewidth_base}` );

    console.log( `gpu.binning_size: ${renderConfig.gpu.binning_size}` );
    console.log( `gpu.tiles_size: ${renderConfig.gpu.tiles_size}` );
    console.log( `gpu.segments_size: ${renderConfig.gpu.segments_size}` );
    console.log( `gpu.ptcl_size: ${renderConfig.gpu.ptcl_size}` );
  };

  if ( !examplePhetSceneEncoding ) {
    examplePhetSceneEncoding = new PhetEncoding();
    examplePhetScene( examplePhetSceneEncoding );
  }

  // const angle = Date.now() / 1000;
  // let c = Math.cos( angle );
  // let s = Math.sin( angle );
  //
  // encoding.encode_transform( new Affine( c, -s, s, c, 200, 100 ) );
  // encoding.encode_linewidth( -1 );
  // encoding.encode_path( true );
  // encoding.move_to( -100, -100 );
  // encoding.quad_to( 0, 0, 100, -100 );
  // encoding.line_to( 100, 100 );
  // encoding.cubic_to( 0, 200, 0, 0, -100, 100 );
  // encoding.line_to( -100, -100 );
  // encoding.close();
  // encoding.finish( true );
  // encoding.encode_linear_gradient( -100, 0, 100, 0, [
  //   new ColorStop( 0, 0xff0000ff ),
  //   new ColorStop( 1, 0x0000ffff )
  // ], Extend.Pad );
  //
  //
  // encoding.encode_transform( new Affine( c, -s, s, c, 150, 200 ) );
  // encoding.encode_linewidth( -1 );
  // encoding.encode_path( true );
  // encoding.move_to( 0, 0 );
  // encoding.line_to( 128, 0 );
  // encoding.quad_to( 256, 0, 256, 128 );
  // encoding.line_to( 256, 256 );
  // encoding.line_to( 128, 256 );
  // encoding.quad_to( 0, 256, 0, 128 );
  // encoding.line_to( 0, 0 );
  // encoding.close();
  // encoding.finish( true );
  // encoding.encode_image( demoImage );
  //
  // encoding.encode_transform( new Affine( c, -s, s, c, 200, 400 ) );
  // encoding.encode_linewidth( -1 );
  // encoding.encode_path( true );
  // encoding.move_to( -100, -100 );
  // encoding.line_to( 100, -100 );
  // encoding.line_to( 0, 100 );
  // encoding.line_to( -100, 100 );
  // encoding.line_to( -100, -100 );
  // encoding.close();
  // encoding.finish( true );
  // encoding.encode_radial_gradient( 0, 0, 20, 0, 0, 120, [
  //   new ColorStop( 0, 0x0000ffff ),
  //   new ColorStop( 1, 0x00ff00ff )
  // ], Extend.Pad );
  //
  // // For a layer push: matrix, linewidth(-1), shape, begin_clip
  // encoding.encode_transform( new Affine( 1, 0, 0, 1, 0, 0 ) );
  // encoding.encode_linewidth( -1 );
  // encoding.encode_path( true );
  // encoding.move_to( 0, 0 );
  // encoding.line_to( 512, 0 );
  // encoding.line_to( 256, 256 );
  // encoding.line_to( 0, 512 );
  // encoding.close();
  // encoding.finish( true );
  // encoding.encode_begin_clip( Mix.Normal, Compose.SrcOver, 0.5 );
  //
  // encoding.encode_transform( new Affine( 3, 0, 0, 3, 50, 150 ) );
  // encoding.encode_linewidth( -1 );
  // // TODO: inspect tolerance function and see if our subdivisions are good
  // encoding.encode_kite_shape( new phet.kite.Shape( 'M 100 50 L 30 50 A 30 30 0 0 1 0 20 L 0 0 L 90 0 A 10 10 0 0 1 100 10 L 100 50 Z ' ), true, true, 0.00001 );
  // encoding.encode_color( 0xff00ff66 );
  //
  // encoding.encode_transform( new Affine( 3, 0, 0, 3, 50, 150 ) );
  // encoding.encode_linewidth( 1 );
  // encoding.encode_kite_shape( new phet.kite.Shape( 'M 100 50 L 30 50 A 30 30 0 0 1 0 20 L 0 0 L 90 0 A 10 10 0 0 1 100 10 L 100 50 Z ' ), false, true, 0.00001 );
  // encoding.encode_color( 0x000000ff );
  //
  // encoding.encode_end_clip();
  //
  // const textScale = 40 + 10 * Math.sin( Date.now() / 1000 );
  // const textEncoding = getTextEncoding( 'How is this text? No hints!', shaping.Direction.LTR );
  // if ( !textEncoding.is_empty() ) {
  //   encoding.append( textEncoding, new Affine( textScale, 0, 0, textScale, 5, 400 ) );
  //   encoding.encode_color( 0x330000ff );
  // }


  const testIntermediateEncoding = new EncodingType();
  testIntermediateEncoding.append( examplePhetSceneEncoding );
  const time = Date.now() / 1000;
  const mag = 30;
  testIntermediateEncoding.append( examplePhetSceneEncoding, new Affine(
    0.4, 0, 0, 0.4,
    50 + Math.cos( time ) * mag, 450 + Math.sin( time ) * mag
  ) );
  testIntermediateEncoding.append( examplePhetSceneEncoding, new Affine(
    3.5, 0, 0, 3.5,
    200 + Math.cos( time ) * mag - 120, 450 + Math.sin( time ) * mag - 40
  ) );

  sceneEncoding.append( testIntermediateEncoding, new Affine( scale, 0, 0, scale, 0, 0 ) );

  sceneEncoding.finalize_scene();

  return sceneEncoding;
};

export default exampleScene;
