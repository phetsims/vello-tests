
export class Affine {
  constructor( a00, a10, a01, a11, a02, a12 ) {
    this.a00 = a00;
    this.a10 = a10;
    this.a01 = a01;
    this.a11 = a11;
    this.a02 = a02;
    this.a12 = a12;
  }

  times( affine ) {
    const a00 = this.a00 * affine.a00 + this.a01 * affine.a10;
    const a01 = this.a00 * affine.a01 + this.a01 * affine.a11;
    const a02 = this.a00 * affine.a02 + this.a01 * affine.a12 + this.a02;
    const a10 = this.a10 * affine.a00 + this.a11 * affine.a10;
    const a11 = this.a10 * affine.a01 + this.a11 * affine.a11;
    const a12 = this.a10 * affine.a02 + this.a11 * affine.a12 + this.a12;
    return new Affine( a00, a10, a01, a11, a02, a12 );
  }

  equals( affine ) {
    return this.a00 === affine.a00 &&
           this.a10 === affine.a10 &&
           this.a01 === affine.a01 &&
           this.a11 === affine.a11 &&
           this.a02 === affine.a02 &&
           this.a12 === affine.a12;
  }

  static IDENTITY = new Affine(1, 0, 0, 1, 0, 0);
}

export class Point {
  constructor( x, y ) {
    this.x = x;
    this.y = y;
  }
}

export class ColorStop {
  constructor( offset, color ) {
    this.offset = offset;
    this.color = color;
  }
}

export class ImageStub {
  constructor( width, height, id ) {
    this.width = width;
    this.height = height;
    this.id = id;
  }
}

export class Extend {
  /// Extends the image by repeating the edge color of the brush.
  static Pad = 0;
  /// Extends the image by repeating the brush.
  static Repeat = 1;
  /// Extends the image by reflecting the brush.
  static Reflect = 2;
}

export class Mix {
  /// Default attribute which specifies no blending. The blending formula simply selects the source color.
  static Normal = 0;
  /// Source color is multiplied by the destination color and replaces the destination.
  static Multiply = 1;
  /// Multiplies the complements of the backdrop and source color values, then complements the result.
  static Screen = 2;
  /// Multiplies or screens the colors, depending on the backdrop color value.
  static Overlay = 3;
  /// Selects the darker of the backdrop and source colors.
  static Darken = 4;
  /// Selects the lighter of the backdrop and source colors.
  static Lighten = 5;
  /// Brightens the backdrop color to reflect the source color. Painting with black produces no
  /// change.
  static ColorDodge = 6;
  /// Darkens the backdrop color to reflect the source color. Painting with white produces no
  /// change.
  static ColorBurn = 7;
  /// Multiplies or screens the colors, depending on the source color value. The effect is
  /// similar to shining a harsh spotlight on the backdrop.
  static HardLight = 8;
  /// Darkens or lightens the colors, depending on the source color value. The effect is similar
  /// to shining a diffused spotlight on the backdrop.
  static SoftLight = 9;
  /// Subtracts the darker of the two constituent colors from the lighter color.
  static Difference = 10;
  /// Produces an effect similar to that of the Difference mode but lower in contrast. Painting
  /// with white inverts the backdrop color; painting with black produces no change.
  static Exclusion = 11;
  /// Creates a color with the hue of the source color and the saturation and luminosity of the
  /// backdrop color.
  static Hue = 12;
  /// Creates a color with the saturation of the source color and the hue and luminosity of the
  /// backdrop color. Painting with this mode in an area of the backdrop that is a pure gray
  /// (no saturation) produces no change.
  static Saturation = 13;
  /// Creates a color with the hue and saturation of the source color and the luminosity of the
  /// backdrop color. This preserves the gray levels of the backdrop and is useful for coloring
  /// monochrome images or tinting color images.
  static Color = 14;
  /// Creates a color with the luminosity of the source color and the hue and saturation of the
  /// backdrop color. This produces an inverse effect to that of the Color mode.
  static Luminosity = 15;
  /// Clip is the same as normal, but the latter always creates an isolated blend group and the
  /// former can optimize that out.
  static Clip = 128;
}

/// Defines the layer composition function for a blend operation.
export class Compose {
  /// No regions are enabled.
  static Clear = 0;
  /// Only the source will be present.
  static Copy = 1;
  /// Only the destination will be present.
  static Dest = 2;
  /// The source is placed over the destination.
  static SrcOver = 3;
  /// The destination is placed over the source.
  static DestOver = 4;
  /// The parts of the source that overlap with the destination are placed.
  static SrcIn = 5;
  /// The parts of the destination that overlap with the source are placed.
  static DestIn = 6;
  /// The parts of the source that fall outside of the destination are placed.
  static SrcOut = 7;
  /// The parts of the destination that fall outside of the source are placed.
  static DestOut = 8;
  /// The parts of the source which overlap the destination replace the destination. The
  /// destination is placed everywhere else.
  static SrcAtop = 9;
  /// The parts of the destination which overlaps the source replace the source. The source is
  /// placed everywhere else.
  static DestAtop = 10;
  /// The non-overlapping regions of source and destination are combined.
  static Xor = 11;
  /// The sum of the source image and destination image is displayed.
  static Plus = 12;
  /// Allows two elements to cross fade by changing their opacities from 0 to 1 on one
  /// element and 1 to 0 on the other element.
  static PlusLighter = 13;
}

export class StreamOffsets {
  constructor( args ) {
    this.path_tags = args.path_tags;
    this.path_data = args.path_data;
    this.draw_tags = args.draw_tags;
    this.draw_data = args.draw_data;
    this.transforms = args.transforms;
    this.linewidths = args.linewidths;
  }

  add( other ) {
    this.path_tags += other.path_tags;
    this.path_data += other.path_data;
    this.draw_tags += other.draw_tags;
    this.draw_data += other.draw_data;
    this.transforms += other.transforms;
    this.linewidths += other.linewidths;
  }
}

const f32_to_bytes = float => {
  const bytes = new Uint8Array( 4 );
  const view = new DataView( bytes.buffer );
  view.setFloat32( 0, float );
  return bytes.reverse();
};

const u32_to_bytes = int => {
  const bytes = new Uint8Array( 4 );
  const view = new DataView( bytes.buffer );
  view.setUint32( 0, int );
  return bytes.reverse();
}

const with_alpha_factor = ( color, alpha ) => {
  return ( color & 0xffffff00 ) | ( Math.round( ( color & 0xff ) * alpha ) & 0xff );
}

export class PathSegmentType {
  static NOT_A_SEGMENT = 0x0;

  /// Line segment.
  static LINE_TO = 0x1;

  /// Quadratic segment.
  static QUAD_TO = 0x2;

  /// Cubic segment.
  static CUBIC_TO = 0x3;
}

// u32
export class DrawTag {
  constructor() {
    throw new Error( 'DrawTag is a static class' );
  }

  /// No operation.
  static NOP = 0;

  /// Color fill.
  static COLOR = 0x44;

  /// Linear gradient fill.
  static LINEAR_GRADIENT = 0x114;

  /// Radial gradient fill.
  static RADIAL_GRADIENT = 0x29c;

  /// Image fill.
  static IMAGE = 0x248;

  /// Begin layer/clip.
  static BEGIN_CLIP = 0x9;

  /// End layer/clip.
  static END_CLIP = 0x21;

  /// Returns the size of the info buffer (in u32s) used by this tag.
  static info_size( drawTag ) {
    return ( drawTag >> 6 ) & 0xf;
  }
}

// u8
export class PathTag {
  constructor() {
    throw new Error( 'PathTag is a static class' );
  }

  /// 32-bit floating point line segment.
  ///
  /// This is equivalent to (PathSegmentType::LINE_TO | PathTag::F32_BIT).
  static LINE_TO_F32 = 0x9;

  /// 32-bit floating point quadratic segment.
  ///
  /// This is equivalent to (PathSegmentType::QUAD_TO | PathTag::F32_BIT).
  static QUAD_TO_F32 = 0xa;

  /// 32-bit floating point cubic segment.
  ///
  /// This is equivalent to (PathSegmentType::CUBIC_TO | PathTag::F32_BIT).
  static CUBIC_TO_F32 = 0xb;

  /// 16-bit integral line segment.
  static LINE_TO_I16 = 0x1;

  /// 16-bit integral quadratic segment.
  static QUAD_TO_I16 = 0x2;

  /// 16-bit integral cubic segment.
  static CUBIC_TO_I16 = 0x3;

  /// Transform marker.
  static TRANSFORM = 0x20;

  /// Path marker.
  static PATH = 0x10;

  /// Line width setting.
  static LINEWIDTH = 0x40;

  /// Bit for path segments that are represented as f32 values. If unset
  /// they are represented as i16.
  static F32_BIT = 0x8;

  /// Bit that marks a segment that is the end of a subpath.
  static SUBPATH_END_BIT = 0x4;

  /// Mask for bottom 3 bits that contain the [PathSegmentType].
  static SEGMENT_MASK = 0x3;

  /// Returns true if the tag is a segment.
  static is_path_segment( pathTag ) {
    return PathTag.path_segment_type( pathTag ) !== PathSegmentType.NOT_A_SEGMENT;
  }

  /// Returns true if this is a 32-bit floating point segment.
  static is_f32( pathTag ) {
    return pathTag & PathTag.F32_BIT !== 0;
  }

  /// Returns true if this segment ends a subpath.
  static is_subpath_end( pathTag ) {
    return pathTag & PathTag.SUBPATH_END_BIT !== 0;
  }

  /// Sets the subpath end bit.
  static with_subpath_end( pathTag ) {
    return pathTag | PathTag.SUBPATH_END_BIT;
  }

  /// Returns the segment type.
  static path_segment_type( pathTag ) {
    return pathTag & PathTag.SEGMENT_MASK;
  }
}

// TODO: TS
export default class Encoding {
  constructor() {
    // TODO: Typed arrays probably more efficient, do that once working.

    /// The path tag stream.
    this.path_tags = []; // Vec<PathTag> e.g. u8 in rust, number[] in js
    /// The path data stream.
    this.path_data = []; // Vec<u8> in rust, number[] in js (OF THE BYTES) - use f32_to_bytes for now
    /// The draw tag stream.
    this.draw_tags = []; // Vec<DrawTag> e.g. u32 in rust, number[] in js
    /// The draw data stream.
    this.draw_data = []; // Vec<u8> in rust, number[] in js
    /// The transform stream.
    this.transforms = []; // Vec<Transform> in rust, Affine[] in js
    /// The line width stream.
    this.linewidths = []; // Vec<f32> in rust, number[] in js
    /// Number of encoded paths.
    this.n_paths = 0; // u32
    /// Number of encoded path segments.
    this.n_path_segments = 0; // u32,
    /// Number of encoded clips/layers.
    this.n_clips = 0; // u32,
    /// Number of unclosed clips/layers.
    this.n_open_clips = 0; // u32,

    // Embedded Resources
    /// Draw data patches for late bound resources.
    this.patches = []; // Vec<Patch> in rust, Patch[] in js
    /// Color stop collection for gradients.
    this.color_stops = []; // Vec<ColorStop> in rust, ColorStop[] in js

    // Embedded PathEncoder
    this.first_point = new Point( 0, 0 );
    this.state = Encoding.PATH_START;
    this.n_encoded_segments = 0;
    this.is_fill = true;
  }

  static PATH_START = 0x1;
  static PATH_MOVE_TO = 0x2;
  static PATH_NONEMPTY_SUBPATH = 0x3;

  is_empty() {
    return this.path_tags.length === 0;
  }

  /// Clears the encoding.
  reset( is_fragment ) {
    this.transforms.length = 0;
    this.path_tags.length = 0;
    this.path_data.length = 0;
    this.linewidths.length = 0;
    this.draw_data.length = 0;
    this.draw_tags.length = 0;
    this.n_paths = 0;
    this.n_path_segments = 0;
    this.n_clips = 0;
    this.n_open_clips = 0;
    this.patches.length = 0;
    this.color_stops.length = 0;
    if ( !is_fragment ) {
      this.transforms.push( Affine.IDENTITY );
      this.linewidths.push( -1.0 );
    }
  }

  /// Appends another encoding to this one with an optional transform.
  append( other, transform = null ) {
    this.path_tags.push( ...other.path_tags );
    this.path_data.push( ...other.path_data );
    this.draw_tags.push( ...other.draw_tags );
    this.draw_data.push( ...other.draw_data );
    this.n_paths += other.n_paths;
    this.n_path_segments += other.n_path_segments;
    this.n_clips += other.n_clips;
    this.n_open_clips += other.n_open_clips;
    if ( transform ) {
      this.transforms.push( ...other.transforms.map( t => transform.times( t ) ) );
    }
    else {
      this.transforms.push( ...other.transforms );
    }
    this.linewidths.push( ...other.linewidths );
  }

  /// Returns a snapshot of the current stream offsets.
  stream_offsets() {
    return new StreamOffsets( {
      path_tags: this.path_tags.length,
      path_data: this.path_data.length,
      draw_tags: this.draw_tags.length,
      draw_data: this.draw_data.length,
      transforms: this.transforms.length,
      linewidths: this.linewidths.length
    } );
  }

  /// Encodes a linewidth.
  encode_linewidth( linewidth ) {
    if ( this.linewidths[ this.linewidths.length - 1 ] !== linewidth ) {
      this.path_tags.push( PathTag.LINEWIDTH );
      this.linewidths.push( linewidth );
    }
  }

  /// Encodes a transform.
  ///
  /// If the given transform is different from the current one, encodes it and
  /// returns true. Otherwise, encodes nothing and returns false.
  encode_transform( transform ) {
    const last = this.transforms[ this.transforms.length - 1 ];
    if ( !last || !last.equals( transform ) ) {
      this.path_tags.push( PathTag.TRANSFORM );
      this.transforms.push( transform );
      return true;
    }
    else {
      return false;
    }
  }

  /// If `is_fill` is true, all subpaths will
  /// be automatically closed.
  encode_path( is_fill ) {
    this.first_point.x = 0;
    this.first_point.y = 0;
    this.state = Encoding.PATH_START;
    this.n_encoded_segments = 0;
    this.is_fill = is_fill;
  }


  /// Encodes a move, starting a new subpath.
  move_to( x, y ) {
    if ( this.is_fill ) {
      this.close();
    }
    this.first_point.x = x;
    this.first_point.y = y;
    if ( this.state === Encoding.PATH_MOVE_TO ) {
      this.path_data.length = this.path_data.length - 8;
    } else if ( this.state === Encoding.PATH_NONEMPTY_SUBPATH ) {
      if ( this.path_tags.length ) {
        this.path_tags[ this.path_tags.length - 1 ] = PathTag.with_subpath_end( this.path_tags[ this.path_tags.length - 1 ] );
      }
    }
    this.path_data.push( ...f32_to_bytes( x ), ...f32_to_bytes( y ) );
    this.state = Encoding.PATH_MOVE_TO;
  }

  /// Encodes a line.
  line_to( x, y ) {
    if ( this.state === Encoding.PATH_START ) {
      if ( this.n_encoded_segments === 0 ) {
        // This copies the behavior of kurbo which treats an initial line, quad
        // or curve as a move.
        this.move_to( x, y );
        return;
      }
      this.move_to( this.first_point.x, this.first_point.y );
    }
    this.path_data.push( ...f32_to_bytes( x ), ...f32_to_bytes( y ) );
    this.path_tags.push( PathTag.LINE_TO_F32 );
    this.state = Encoding.PATH_NONEMPTY_SUBPATH;
    this.n_encoded_segments += 1;
  }

  /// Encodes a quadratic bezier.
  quad_to( x1, y1, x2, y2 ) {
    if ( this.state === Encoding.PATH_START ) {
      if ( this.n_encoded_segments === 0 ) {
        this.move_to( x2, y2 );
        return;
      }
      this.move_to( this.first_point.x, this.first_point.y );
    }
    this.path_data.push( ...f32_to_bytes( x1 ), ...f32_to_bytes( y1 ), ...f32_to_bytes( x2 ), ...f32_to_bytes( y2 ) );
    this.path_tags.push( PathTag.QUAD_TO_F32 );
    this.state = Encoding.PATH_NONEMPTY_SUBPATH;
    this.n_encoded_segments += 1;
  }

  /// Encodes a cubic bezier.
  cubic_to( x1, y1, x2, y2, x3, y3 ) {
    if ( this.state === Encoding.PATH_START ) {
      if ( this.n_encoded_segments === 0 ) {
        this.move_to( x3, y3 );
        return;
      }
      this.move_to( this.first_point.x, this.first_point.y );
    }
    this.path_data.push( ...f32_to_bytes( x1 ), ...f32_to_bytes( y1 ), ...f32_to_bytes( x2 ), ...f32_to_bytes( y2 ), ...f32_to_bytes( x3 ), ...f32_to_bytes( y3 ) );
    this.path_tags.push( PathTag.CUBIC_TO_F32 );
    this.state = Encoding.PATH_NONEMPTY_SUBPATH;
    this.n_encoded_segments += 1;
  }

  /// Closes the current subpath.
  close() {
    if ( this.state === Encoding.PATH_START ) {
      return;
    }
    else if ( this.state === Encoding.PATH_MOVE_TO ) {
      this.path_data.length = this.path_data.length - 8;
      this.state = Encoding.PATH_START;
      return;
    }
    let len = this.path_data.length;
    if ( len < 8 ) {
      // can't happen
      return;
    }
    let first_bytes = [ ...f32_to_bytes( this.first_point.x ), ...f32_to_bytes( this.first_point.y ) ];
    if ( first_bytes[ 0 ] !== this.path_data[ len - 8 ] ||
         first_bytes[ 1 ] !== this.path_data[ len - 7 ] ||
         first_bytes[ 2 ] !== this.path_data[ len - 6 ] ||
         first_bytes[ 3 ] !== this.path_data[ len - 5 ] ||
         first_bytes[ 4 ] !== this.path_data[ len - 4 ] ||
         first_bytes[ 5 ] !== this.path_data[ len - 3 ] ||
         first_bytes[ 6 ] !== this.path_data[ len - 2 ] ||
         first_bytes[ 7 ] !== this.path_data[ len - 1 ] ) {
      this.path_data.push( ...first_bytes );
      this.path_tags.push( PathTag.with_subpath_end( PathTag.LINE_TO_F32 ) );
      this.n_encoded_segments += 1;
    } else if ( this.path_tags.length ) {
      this.path_tags[ this.path_tags.length - 1 ] = PathTag.with_subpath_end( this.path_tags[ this.path_tags.length - 1 ] );
    }
    this.state = Encoding.PATH_START;
  }

  /// Completes path encoding and returns the actual number of encoded segments.
  ///
  /// If `insert_path_marker` is true, encodes the [PathTag::PATH] tag to signify
  /// the end of a complete path object. Setting this to false allows encoding
  /// multiple paths with differing transforms for a single draw object.
  finish( insert_path_marker ) {
    if ( this.is_fill ) {
      this.close();
    }
    if ( this.state === Encoding.PATH_MOVE_TO ) {
      this.path_data.length = this.path_data.len() - 8;
    }
    if ( this.n_encoded_segments !== 0 ) {
      if ( this.path_tags.length ) {
        this.path_tags[ this.path_tags.length - 1 ] = PathTag.with_subpath_end( this.path_tags[ this.path_tags.length - 1 ] );
      }
      this.n_path_segments += this.n_encoded_segments;
      if ( insert_path_marker ) {
        this.path_tags.push( PathTag.PATH );
        this.n_paths += 1;
      }
    }
    return this.n_encoded_segments;
  }

  /// Encodes a solid color brush.
  encode_color( color ) {
    this.draw_tags.push( DrawTag.COLOR );
    this.draw_data.push( ...u32_to_bytes( color ) );
  }

  // zero: => false, one => color, many => true (icky)
  add_ramp( color_stops, alpha, extend ) {
    let offset = this.draw_data.length;
    let stops_start = this.color_stops.length;
    if ( alpha !== 1 ) {
      this.color_stops.push( ...color_stops.map( stop => new ColorStop( stop.offset, with_alpha_factor( stop.color, alpha ) ) ) );
    } else {
      this.color_stops.push( ...color_stops );
    }
    let stops_end = this.color_stops.length;

    const stopCount = stops_end - stops_start;

    if ( stopCount === 0 ) {
      return null;
    }
    else if ( stopCount === 1 ) {
      return this.color_stops.pop().color;
    }
    else {
      // TODO: patch type?
      this.patches.push( {
        type: 'ramp',
        draw_data_offset: offset,
        stops: _.range( stops_start, stops_end ),
        extend: extend
      } );
      return true;
    }
  }

  /// Encodes a linear gradient brush.
  encode_linear_gradient( x0, y0, x1, y1, color_stops, alpha, extend ) {
    const result = this.add_ramp( color_stops, alpha, extend );
    if ( result === null ) {
      this.encode_color( 0 );
    }
    else if ( result === true ) {
      this.draw_tags.push( DrawTag.LINEAR_GRADIENT );
      this.draw_data.push( ...[
        // u32 ramp index
        0, 0, 0, 0,

        ...f32_to_bytes( x0 ),
        ...f32_to_bytes( y0 ),
        ...f32_to_bytes( x1 ),
        ...f32_to_bytes( y1 )
      ] );
    }
    else {
      this.encode_color( result );
    }
  }

  // TODO: note the parameter order?
  /// Encodes a radial gradient brush.
  encode_radial_gradient( x0, y0, r0, x1, y1, r1, color_stops, alpha, extend ) {
    // Match Skia's epsilon for radii comparison
    const SKIA_EPSILON = 1 / ( 1 << 12 );
    if ( x0 === x1 && y0 === y1 && Math.abs( r0 - r1 ) < SKIA_EPSILON ) {
      this.encode_color( 0 );
    }
    else {
      const result = this.add_ramp( color_stops, alpha, extend );
      if ( result === null ) {
        this.encode_color( 0 );
      }
      else if ( result === true ) {
        this.draw_tags.push( DrawTag.RADIAL_GRADIENT );
        this.draw_data.push( ...[
          // u32 ramp index
          0, 0, 0, 0,

          ...f32_to_bytes( x0 ),
          ...f32_to_bytes( y0 ),
          ...f32_to_bytes( x1 ),
          ...f32_to_bytes( y1 ),

          ...f32_to_bytes( r0 ),
          ...f32_to_bytes( r1 )
        ] );
      }
      else {
        this.encode_color( result );
      }
    }
  }

  /// Encodes an image brush.  (( ImageStub)
  encode_image( image ) {
    this.patches.push( {
      type: 'image',
      draw_data_offset: this.draw_data.length,
      image: image
    } );
    this.draw_tags.push( DrawTag.IMAGE );
    this.draw_data.push( ...[
      /// Packed atlas coordinates. (xy) u32
      ...u32_to_bytes( 0 ),
      /// Packed image dimensions. (width_height) u32
      ...u32_to_bytes( ( image.width << 16 ) | ( image.height & 0xFFFF ) )
    ] );
  }

  /// Encodes a begin clip command.
  encode_begin_clip( mix, compose, alpha ) {
    this.draw_tags.push( DrawTag.BEGIN_CLIP );
    this.draw_data.push( ...[
      // u32 combination of mix and compose
      ...u32_to_bytes( ( mix << 8 ) | compose ),
      ...f32_to_bytes( alpha )
    ] );
    this.n_clips += 1;
    this.n_open_clips += 1;
  }

  /// Encodes an end clip command.
  encode_end_clip() {
    if ( this.n_open_clips > 0 ) {
      this.draw_tags.push( DrawTag.END_CLIP );
      // This is a dummy path, and will go away with the new clip impl.
      this.path_tags.push( PathTag.PATH );
      this.n_paths += 1;
      this.n_clips += 1;
      this.n_open_clips -= 1;
    }
  }

  // Swap the last two tags in the path tag stream; used for transformed
  // gradients.
  swap_last_path_tags() {
    let len = this.path_tags.length;

    // Swap
    const first = this.path_tags[ len - 1 ];
    this.path_tags[ len - 1 ] = this.path_tags[ len - 2 ];
    this.path_tags[ len - 2 ] = first;
  }

  print_debug() {
    console.log( 'ENCODING' );
    console.log( `path_tags\n${this.path_tags.map( x => x.toString() ).join( ', ' )}` );
    console.log( `path_data\n${this.path_data.map( x => x.toString() ).join( ', ' )}` );
    console.log( `draw_tags\n${this.draw_tags.map( x => x.toString() ).join( ', ' )}` );
    console.log( `draw_data\n${this.draw_data.map( x => x.toString() ).join( ', ' )}` );
    console.log( `transforms\n${this.transforms.map( x => `_ a00:${x.a00} a10:${x.a10} a01:${x.a01} a11:${x.a11} a02:${x.a02} a12:${x.a12}_` ).join( '\n' )}` );
    console.log( `linewidths\n${this.linewidths.map( x => x.toString() ).join( ', ' )}` );
    // TODO: resources
    console.log( `n_paths\n${this.n_paths}` );
    console.log( `n_path_segments\n${this.n_path_segments}` );
    console.log( `n_clips\n${this.n_clips}` );
    console.log( `n_open_clips\n${this.n_open_clips}` );
  }
}