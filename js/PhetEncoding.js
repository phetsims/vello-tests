import { default as Encoding, Affine, Extend, Mix, Compose, ColorStop, BufferImage, base64ToU8 } from './Encoding.js';
import { default as wasmInit, load_font_data, shape_text, get_glyph } from '../swash-tests/pkg/swash_tests.js';

/*
( async () => {
  const PhetEncoding = ( await import( '../vello-tests/js/PhetEncoding.js' ) ).default;
  nodeTest( PhetEncoding );
} )();
 */

window.nodeTest = async () => {
  const Arial = ( await import( '../fonts/Arial.js' ) ).default;

  const wasm = await wasmInit();

  const memory = wasm.memory;

  const arialBytes = base64ToU8( Arial );

  load_font_data( arialBytes );

  console.log( memory.buffer.byteLength );
  console.log( shape_text( 'Hello, world!', true ) );
  console.log( get_glyph( 43, 0, 0 ) );
  console.log( get_glyph( 43, 60, 60 ) );
  console.log( memory.buffer.byteLength );

  window.PhetEncoding = PhetEncoding;

  const encoding = new PhetEncoding();
  encoding.encode_node( phet.joist.display.rootNode );
};

export default class PhetEncoding extends Encoding {

  encode_node( topNode ) {
    // TODO: opacity and clipping

    const matrixStack = [ phet.dot.Matrix3.IDENTITY ];

    const matrixToAffine = matrix => new Affine( matrix.m00(), matrix.m10(), matrix.m01(), matrix.m11(), matrix.m02(), matrix.m12() );

    const convert_color = color => {
      return ( ( color.r << 24 ) + ( color.g << 16 ) + ( color.b << 8 ) + ( Math.floor( color.a * 255 ) & 0xff ) ) >>> 0;
    };

    const string_convert_color = color => {
      const value = convert_color( color );
      let result = value.toString( 16 );
      while ( result.length < 8 ) {
        result = '0' + result;
      }
      return `0x${result}`;
    };

    const convert_color_stop = color_stop => {
      return new ColorStop( color_stop.ratio, convert_color( phet.scenery.PaintDef.toColor( color_stop.color ) ) );
    };

    let str = '';

    const encode_paint = paint => {
      // Paint | TReadOnlyProperty<Color | string | null> | TReadOnlyProperty<Color | string> | TReadOnlyProperty<Color> | Color | string | null
      if ( paint instanceof phet.scenery.Paint ) {
        if ( paint instanceof phet.scenery.LinearGradient ) {
          str += `encoding.encode_linear_gradient( ${paint.start.x}, ${paint.start.y}, ${paint.end.x}, ${paint.end.y}, [ ${paint.stops.map( stop => {
            return `new ColorStop( ${stop.ratio}, ${string_convert_color( phet.scenery.PaintDef.toColor( stop.color ) )} )`;
          } ).join( ', ' ) } ], 1, Extend.Pad );\n`;
          this.encode_linear_gradient( paint.start.x, paint.start.y, paint.end.x, paint.end.y, paint.stops.map( convert_color_stop ), 1, Extend.Pad );
        }
        else if ( paint instanceof phet.scenery.RadialGradient ) {
          str += `encoding.encode_radial_gradient( ${paint.start.x}, ${paint.start.y}, ${paint.startRadius}, ${paint.end.x}, ${paint.end.y}, ${paint.endRadius}, [ ${paint.stops.map( stop => {
            return `new ColorStop( ${stop.ratio}, ${string_convert_color( phet.scenery.PaintDef.toColor( stop.color ) )} )`;
          } ).join( ', ' ) } ], 1, Extend.Pad );\n`;
          this.encode_radial_gradient( paint.start.x, paint.start.y, paint.startRadius, paint.end.x, paint.end.y, paint.endRadius, paint.stops.map( convert_color_stop ), 1, Extend.Pad );
        }
        else {
          // Pattern, no-op for now
          console.log( 'PATTERN UNIMPLEMENTED' );
          str += `encoding.encode_color( 0 );\n`;
          this.encode_color( 0 );
        }
      }
      else {
        const color = phet.scenery.PaintDef.toColor( paint );
        str += `encoding.encode_color( ${string_convert_color( color )} );\n`;
        this.encode_color( convert_color( color ) );
      }
    };

    const recurse = node => {
      if ( !node.visible || !node.bounds.isValid() ) {
        return;
      }

      const hasClip = node.opacity !== 1 || node.clipArea;

      str += `// push ${node.constructor.name}\n`;
      let matrix = matrixStack[ matrixStack.length - 1 ];
      if ( !node.matrix.isIdentity() ) {
        matrix = matrix.timesMatrix( node.matrix );
        matrixStack.push( matrix );
      }

      if ( hasClip ) {
        str += `encoding.encode_transform( new Affine( ${matrix.m00()}, ${matrix.m10()}, ${matrix.m01()}, ${matrix.m11()}, ${matrix.m02()}, ${matrix.m12()} ) );\n`;
        this.encode_transform( matrixToAffine( matrix ) );

        str += `encoding.encode_linewidth( -1 );\n`;
        this.encode_linewidth( -1 );

        if ( node.clipArea ) {
          str += `encoding.encode_kite_shape( new phet.kite.Shape( '${node.clipArea.getSVGPath()}' ), true, true, 1 );\n`;
          this.encode_kite_shape( node.clipArea, true, true, 1 );
        }
        else {
          // Just handling opacity
          const safeBoundingBox = node.localBounds.dilated( 100 ); // overdo it, how to clip without shape?
          const safeBoundingShape = phet.kite.Shape.bounds( safeBoundingBox );

          str += `encoding.encode_kite_shape( new phet.kite.Shape( '${safeBoundingShape.getSVGPath()}' ), true, true, 1 );\n`;
          this.encode_kite_shape( safeBoundingShape, true, true, 1 );
        }

        str += `encoding.encode_begin_clip( ${node.opacity === 1 ? 'Mix.Normal' : 'Mix.Normal'}, Compose.SrcOver, ${node.opacity} );\n`;
        this.encode_begin_clip( node.opacity === 1 ? Mix.Normal : Mix.Normal, Compose.SrcOver, node.opacity );
      }

      if ( node instanceof phet.scenery.Path ) {
        if ( node.hasFill() ) {
          str += `encoding.encode_transform( new Affine( ${matrix.m00()}, ${matrix.m10()}, ${matrix.m01()}, ${matrix.m11()}, ${matrix.m02()}, ${matrix.m12()} ) );\n`;
          this.encode_transform( matrixToAffine( matrix ) );
          str += `encoding.encode_linewidth( -1 );\n`;
          this.encode_linewidth( -1 );
          str += `encoding.encode_kite_shape( new phet.kite.Shape( '${node.shape.getSVGPath()}' ), true, true, 1 );\n`;
          this.encode_kite_shape( node.shape, true, true, 1 );
          encode_paint( node.fill );
        }
        if ( node.hasStroke() ) {
          str += `encoding.encode_transform( new Affine( ${matrix.m00()}, ${matrix.m10()}, ${matrix.m01()}, ${matrix.m11()}, ${matrix.m02()}, ${matrix.m12()} ) );\n`;
          this.encode_transform( matrixToAffine( matrix ) );
          str += `encoding.encode_linewidth( ${node.lineWidth} );\n`;
          this.encode_linewidth( node.lineWidth );
          str += `encoding.encode_kite_shape( new phet.kite.Shape( '${node.shape.getSVGPath()}' ), false, true, 1 );\n`;
          this.encode_kite_shape( node.shape, false, true, 1 );
          encode_paint( node.stroke );
        }
      }

      // TODO: support stroked text
      if ( node instanceof phet.scenery.Text ) {
        if ( node.hasFill() ) {
          const shapedText = JSON.parse( shape_text( node.renderedText, true ) );

          let hasEncodedGlyph = false;

          // TODO: more performance possible easily
          const scale = node._font.numericSize / 2048; // get UPM
          const sizedMatrix = matrix.timesMatrix( phet.dot.Matrix3.scaling( scale ) );
          const shearMatrix = phet.dot.Matrix3.rowMajor(
            // approx 14 degrees, with always vertical flip
            1, node._font.style !== 'normal' ? 0.2419 : 0, 0,
            0, -1, 0, // vertical flip
            0, 0, 1
          );

          let embolden = 0;
          if ( node._font.weight === 'bold' ) {
            embolden = 25;
          }

          let x = 0;
          shapedText.forEach( glyph => {
            const shape = new phet.kite.Shape( get_glyph( glyph.id, embolden, embolden ) ); // TODO: bold! (italic with oblique transform!!)

            // TODO: check whether the glyph y needs to be reversed! And italics/oblique
            const glyphMatrix = sizedMatrix.timesMatrix( phet.dot.Matrix3.translation( x + glyph.x, glyph.y ) ).timesMatrix( shearMatrix );
            x += glyph.adv;

            str += `encoding.encode_transform( new Affine( ${glyphMatrix.m00()}, ${glyphMatrix.m10()}, ${glyphMatrix.m01()}, ${glyphMatrix.m11()}, ${glyphMatrix.m02()}, ${glyphMatrix.m12()} ) );\n`;
            this.encode_transform( new Affine(
              glyphMatrix.m00(), glyphMatrix.m10(), glyphMatrix.m01(), glyphMatrix.m11(),
              glyphMatrix.m02(), glyphMatrix.m12()
            ) );
            str += `encoding.encode_linewidth( -1 );\n`;
            this.encode_linewidth( -1 );
            str += `encoding.encode_kite_shape( new phet.kite.Shape( '${shape.getSVGPath()}' ), true, false, 0.01 );\n`;
            const encodedCount = this.encode_kite_shape( shape, true, false, 1 );
            if ( encodedCount ) {
              hasEncodedGlyph = true;
            }
          } );

          if ( hasEncodedGlyph ) {
            str += `encoding.insert_path_marker();\n`;
            this.insert_path_marker();
            encode_paint( node.fill );
          }
        }
      }

      // TODO: not too hard to implement pattern now
      if ( node instanceof phet.scenery.Image ) {
        const canvas = document.createElement( 'canvas' );
        canvas.width = node.getImageWidth();
        canvas.height = node.getImageHeight();

        // if we are not loaded yet, just ignore
        if ( canvas.width && canvas.height ) {
          const context = canvas.getContext( '2d' );
          context.drawImage( node._image, 0, 0 );
          const imageData = context.getImageData( 0, 0, canvas.width, canvas.height );
          const buffer = new Uint8Array( imageData.data.buffer ).buffer; // copy in case the length isn't correct

          str += `encoding.encode_transform( new Affine( ${matrix.m00()}, ${matrix.m10()}, ${matrix.m01()}, ${matrix.m11()}, ${matrix.m02()}, ${matrix.m12()} ) );\n`;
          this.encode_transform( matrixToAffine( matrix ) );
          str += `encoding.encode_linewidth( -1 );\n`;
          this.encode_linewidth( -1 );

          const shape = phet.kite.Shape.rect( 0, 0, canvas.width, canvas.height );

          str += `encoding.encode_kite_shape( new phet.kite.Shape( '${shape.getSVGPath()}' ), true, true, 1 );\n`;
          this.encode_kite_shape( shape, true, true, 1 );

          str += `encoding.encode_image( new BufferImage( ${canvas.width}, ${canvas.height}, new Uint8Array( [ ${ [ ...imageData.data ].join( ', ' ) } ] ).buffer ) );\n`;
          this.encode_image( new BufferImage( canvas.width, canvas.height, buffer ) );
        }
      }

      node.children.forEach( child => recurse( child ) );

      if ( hasClip ) {
        str += `encoding.encode_end_clip();\n`;
        this.encode_end_clip();
      }

      if ( !node.matrix.isIdentity() ) {
        matrixStack.pop();
      }
      str += `// pop ${node.constructor.name}\n`;
    };

    recurse( topNode );

    console.log( `// Autogenerated\n\nimport { Affine, Extend, Mix, Compose, ColorStop, BufferImage } from './Encoding.js';\n\nconst examplePhetScene = encoding => {\n${str}\n};\nexport default examplePhetScene;\n` );
  }

  // To encode a kite shape, we'll need to split arcs/elliptical-arcs into bezier curves
  // TODO: don't keep Kite things in here, we'd move it to Kite
  encode_kite_shape( shape, isFill, insertPathMarker, tolerance ) {
    this.encode_path( isFill );

    shape.subpaths.forEach( subpath => {
      if ( subpath.isDrawable() ) {
        const startPoint = subpath.getFirstSegment().start;
        this.move_to( startPoint.x, startPoint.y );

        subpath.segments.forEach( segment => {
          if ( segment instanceof phet.kite.Line ) {
            this.line_to( segment.end.x, segment.end.y );
          }
          else if ( segment instanceof phet.kite.Quadratic ) {
            this.quad_to( segment.control.x, segment.control.y, segment.end.x, segment.end.y );
          }
          else if ( segment instanceof phet.kite.Cubic ) {
            this.cubic_to( segment.control1.x, segment.control1.y, segment.control2.x, segment.control2.y, segment.end.x, segment.end.y );
          }
          else {
            // arc or elliptical arc, split with kurbo's setup (not the most optimal).
            // See https://raphlinus.github.io/curves/2021/03/11/bezier-fitting.html for better.

            const maxRadius = segment instanceof phet.kite.Arc ? segment.radius : Math.max( segment.radiusX, segment.radiusY );
            const scaled_err = maxRadius / tolerance;
            const n_err = Math.max( Math.pow( 1.1163 * scaled_err, 1 / 6 ), 3.999999 );
            const n = Math.ceil( n_err * Math.abs( segment.getAngleDifference() ) * ( 1.0 / ( 2.0 * Math.PI ) ) );

            // For now, evenly subdivide
            const segments = n > 1 ? segment.subdivisions( _.range( 1, n ).map( t => t / n ) ) : [ segment ];

            // Create cubics approximations for each segment
            // TODO: performance optimize?
            segments.forEach( subSegment => {
              const start = subSegment.start;
              const middle = subSegment.positionAt( 0.5 );
              const end = subSegment.end;

              // 1/4 start, 1/4 end, 1/2 control, find the control point given the middle (t=0.5) point
              // average + 2 * ( middle - average ) => 2 * middle - average => 2 * middle - ( start + end ) / 2

              // const average = start.average( end );
              // const control = average.plus( middle.minus( average ).timesScalar( 2 ) );

              // mutates middle also
              const control = start.plus( end ).multiplyScalar( -0.5 ).add( middle.multiplyScalar( 2 ) );

              this.quad_to( control.x, control.y, end.x, end.y );
            } );
          }
        } );

        if ( subpath.closed ) {
          this.close();
        }
      }
    } );

    return this.finish( insertPathMarker );
  };
}