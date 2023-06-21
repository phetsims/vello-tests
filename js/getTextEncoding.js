import { default as Encoding, Affine } from './Encoding.js';
import PhetEncoding from './PhetEncoding.js';

// user permissions request is likely a non-starter
// const fonts = await window.queryLocalFonts();
//
// const arialFontEntry = f.filter( g => g.fullName === 'Arial' )[ 0 ];
// if ( arialFontEntry ) {
//   // const arialFontBlob = await arialFontEntry.blob();
// }

// TODO: newer harfbuzz. or cosmic-text might be nice
const notoSerif = shaping.createBase64FontHandle( notoSerifRegularBase64 );
const scriptData = {};
scriptData.default = {
  font: notoSerif,
  language: 'en',
  script: shaping.Script.LATIN
};
const shapeText = ( text, direction ) => shaping.shapeRuns( text, direction, scriptData );

// glyphEncodingMap[ font ][ index ] = Encoding;
// NOTE: for fills only
const glyphEncodingMap = {};
const getGlyphEncoding = ( font, index ) => {
  if ( !glyphEncodingMap[ font ] ) {
    glyphEncodingMap[ font ] = {};
  }
  if ( glyphEncodingMap[ font ][ index ] === undefined ) {
    const glyph = shaping.getGlyph( font, index );

    const encoding = new PhetEncoding();

    // TODO: tolerance?
    encoding.encode_kite_shape( glyph, true, false, 0.01 );

    glyphEncodingMap[ font ][ index ] = encoding;
  }
  return glyphEncodingMap[ font ][ index ];
};
// TODO: allow both encoding types!
const getTextEncoding = ( text, direction ) => {
  const shapedText = shapeText( text, direction );

  const encoding = new Encoding();
  let hasEncodedGlyph = false;

  shapedText.glyphs.forEach( glyph => {
    const glyphEncoding = getGlyphEncoding( glyph.font, glyph.index );

    if ( glyphEncoding ) {
      hasEncodedGlyph = true;

      encoding.encode_transform( new Affine( 1, 0, 0, 1, glyph.x, glyph.y ) );
      encoding.encode_linewidth( -1 );

      encoding.append( glyphEncoding );
    }
  } );

  if ( hasEncodedGlyph ) {
    encoding.insert_path_marker();
  }

  return encoding;
};

export default getTextEncoding;
