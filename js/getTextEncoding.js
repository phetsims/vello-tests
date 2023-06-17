import { VelloEncoding } from "../pkg/vello_tests.js";

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

export default getTextEncoding;
