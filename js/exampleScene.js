import SceneFrame from './SceneFrame.js';
import { VelloEncoding, VelloMix, VelloCompose } from "../pkg/vello_tests.js";
import { addImage } from './imageMap.js';
import getTextEncoding from './getTextEncoding.js';
import { default as Encoding, Affine, Extend, ColorStop, ImageStub, Mix, Compose } from './Encoding.js';

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

    // TODO: RenderConfig
    const renderInfo = wasmEncoding.render( 512, 512, 0x666666ff );

    console.log( '################ WASM scene' );
    console.log( [ ...renderInfo.scene() ] );
    console.log( 'ramps', renderInfo.ramps_width, renderInfo.ramps_height, [ ...renderInfo.ramps() ] );

    const resolved = jsEncoding.resolve();
    console.log( '################ JS scene' );
    console.log( [ ...resolved.packed ] );
    console.log( 'ramps', resolved.ramps.width, resolved.ramps.height, [ ...resolved.ramps.data ] );

    console.log( resolved.images );

    console.log( '################' );
    console.log( `scene ok: ${_.isEqual( [ ...renderInfo.scene() ], [ ...resolved.packed ] )}` );
    console.log( `max diff: ${_.max( _.zip( [ ...renderInfo.scene() ], [ ...resolved.packed ] ).map( arr => arr[ 0 ] - arr[ 1 ] ) )}` );
    console.log( `ramps ok: ${_.isEqual( [ ...renderInfo.ramps() ], [ ...resolved.ramps.data ] )}` );
    console.log( `max diff: ${_.max( _.zip( [ ...renderInfo.ramps() ], [ ...resolved.ramps.data ] ).map( arr => arr[ 0 ] - arr[ 1 ] ) )}` );
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
