import { default as wasmInit, load_font_data, shape_text, get_glyph } from '../pkg/swash_tests.js';
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

  const arialBytes = base64ToU8( Arial );

  load_font_data( arialBytes );

  console.log( memory.buffer.byteLength );
  console.log( shape_text( 'Hello, world!', true ) );
  console.log( get_glyph( 43, 0, 0 ) );
  console.log( get_glyph( 43, 60, 60 ) );
  console.log( memory.buffer.byteLength );
} );
