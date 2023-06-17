import SceneFrame from './SceneFrame.js';
import { VelloEncoding, VelloMix, VelloCompose } from "../pkg/vello_tests.js";
import { addImage } from './imageMap.js';
import getTextEncoding from './getTextEncoding.js';

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
  encoding.svg_path( true, true, 'M 0 0 L 128 0 Q 256 0 256 128 L 256 256 L 128 256 Q 0 256 0 128 L 0 0 Z' );
  encoding.image( demoImage, 1 );

  encoding.matrix( c, -s, s, c, 200, 400 );
  encoding.linewidth( -1 );
  encoding.svg_path( true, true, 'M -100 -100 L 100 -100 L 0 100 L -100 100 L -100 -100 Z' );
  encoding.radial_gradient( 0, 0, 0, 0, 20, 120, 1, 0, new Float32Array( [ 0, 1 ] ), new Uint32Array( [ 0x0000ffff, 0x00ff00ff ] ) );

  // For a layer push: matrix, linewidth(-1), shape, begin_clip
  encoding.matrix( 1, 0, 0, 1, 0, 0 );
  encoding.linewidth( -1 );
  // TODO: add rect() to avoid overhead
  encoding.svg_path( true, true, 'M 0 0 L 512 0 L 256 256 L 0 512 Z' );
  encoding.begin_clip( VelloMix.Normal, VelloCompose.SrcOver, 0.5 ); // TODO: alpha 0.5 on clip layer fails EXCEPT on fine tiles where it ends

  encoding.matrix( 3, 0, 0, 3, 50, 150 );
  encoding.linewidth( -1 );
  encoding.svg_path( true, true, 'M 100 50 L 30 50 A 30 30 0 0 1 0 20 L 0 0 L 90 0 A 10 10 0 0 1 100 10 L 100 50 Z ' );
  encoding.color( 0xff00ff66 );

  encoding.matrix( 3, 0, 0, 3, 50, 150 );
  encoding.linewidth( 1 );
  encoding.svg_path( false, true, 'M 100 50 L 30 50 A 30 30 0 0 1 0 20 L 0 0 L 90 0 A 10 10 0 0 1 100 10 L 100 50 Z ' );
  encoding.color( 0x000000ff );

  encoding.end_clip();

  const textScale = 40 + 10 * Math.sin( Date.now() / 1000 );
  const textEncoding = getTextEncoding( 'How is this text? No hints!', shaping.Direction.LTR );
  if ( !textEncoding.is_empty() ) {
    encoding.append_with_transform( textEncoding, textScale, 0, 0, textScale, 5, 400 );
    encoding.color( 0x000000ff );
  }

  const intermediateEncoding = new VelloEncoding();
  intermediateEncoding.append( encoding );
  intermediateEncoding.append_with_transform( encoding, 0.4, 0, 0, 0.4, Math.floor( 512 * ( 1 - 0.4 ) ) + 20, 0 );

  sceneEncoding.append_with_transform( intermediateEncoding, scale, 0, 0, scale, 0, 0 );

  encoding.free();
  intermediateEncoding.free();

  sceneEncoding.finalize_scene();

  // TODO: scaling based on devicePixelRatio
  return new SceneFrame( sceneEncoding, () => {
    sceneEncoding.free();
  } )
};

export default exampleScene;
