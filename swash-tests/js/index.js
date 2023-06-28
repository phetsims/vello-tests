import { default as wasmInit, SwashFont } from '../pkg/swash_tests.js';
import Arial from '../../fonts/Arial.js';

function base64ToU8( base64 ) {
  const string = window.atob( base64 );

  var bytes = new Uint8Array( string.length );
  for ( let i = 0; i < string.length; i++ ) {
    bytes[ i ] = string.charCodeAt( i );
  }

  return bytes;
}

wasmInit().then( async wasm => {
  const memory = wasm.memory;

  const arial = new SwashFont( base64ToU8( Arial ) );

  // console.log( memory.buffer.byteLength );
  // const arial2 = new SwashFont( base64ToU8( Arial ) );
  // console.log( memory.buffer.byteLength );
  // arial2.free();
  // console.log( memory.buffer.byteLength );
  // const arial3 = new SwashFont( base64ToU8( Arial ) );
  // console.log( memory.buffer.byteLength );
  // arial3.free();
  // console.log( memory.buffer.byteLength );

  console.log( arial.get_units_per_em() );

  const show = str => {
    console.log( memory.buffer.byteLength );
    const scene = new phet.scenery.Node();
    const display = new phet.scenery.Display( scene, {
      width: 640,
      height: 320,
      preserveDrawingBuffer: true,
      accessibility: true
      // any overrides here?
    } );

    const shapedText = JSON.parse( arial.shape_text( str, true ) );

    const fontSize = 50;

    const scale = fontSize / 2048; // get UPM

    let embolden = 0;
    // if ( node._font.weight === 'bold' ) {
    //   embolden = 40;
    // }

    let x = 0;
    const container = new phet.scenery.Node( { x: 50, y: 70 } );
    container.setScaleMagnitude( scale, -scale );
    scene.addChild( container );
    shapedText.forEach( glyph => {
      const shape = new phet.kite.Shape( arial.get_glyph( glyph.id, embolden, embolden ) );

      container.addChild( new phet.scenery.Path( shape, {
        x: glyph.x + x,
        y: glyph.y,
        fill: 'black'
      } ) );

      x += glyph.adv;
    } );

    display.updateDisplay();
    document.body.insertBefore( display._domElement, document.body.firstChild );
    console.log( memory.buffer.byteLength );
  };

  show( 'To a kerning test?' );
} );
