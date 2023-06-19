
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
    this.xy = new Point( 0, 0 );
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
    this.path_tags = args?.path_tags || 0;
    this.path_data = args?.path_data || 0;
    this.draw_tags = args?.draw_tags || 0;
    this.draw_data = args?.draw_data || 0;
    this.transforms = args?.transforms || 0;
    this.linewidths = args?.linewidths || 0;
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
  return [ ...bytes.reverse() ];
};

const u32_to_bytes = int => {
  const bytes = new Uint8Array( 4 );
  const view = new DataView( bytes.buffer );
  view.setUint32( 0, int );
  return [ ...bytes.reverse() ];
}

const with_alpha_factor = ( color, alpha ) => {
  return ( color & 0xffffff00 ) | ( Math.round( ( color & 0xff ) * alpha ) & 0xff );
}

const to_premul_u32 = rgba8color => {
  const a = ( rgba8color & 0xff ) / 255;
  const r = Math.round( ( ( rgba8color >>> 24 ) & 0xff ) * a >>> 0 );
  const g = Math.round( ( ( rgba8color >>> 16 ) & 0xff ) * a >>> 0 );
  const b = Math.round( ( ( rgba8color >>> 8 ) & 0xff ) * a >>> 0 );
  return ( ( r << 24 ) | ( g << 16 ) | ( b << 8 ) | ( rgba8color & 0xff ) ) >>> 0;
}

const lerp_rgba8 = ( c1, c2, t ) => {
  const l = ( x, y, a ) => Math.round( x * ( 1 - a ) + y * a >>> 0 );
  const r = l( ( c1 >>> 24 ) & 0xff, ( c2 >>> 24 ) & 0xff, t );
  const g = l( ( c1 >>> 16 ) & 0xff, ( c2 >>> 16 ) & 0xff, t );
  const b = l( ( c1 >>> 8 ) & 0xff, ( c2 >>> 8 ) & 0xff, t );
  const a = l( c1 & 0xff, c2 & 0xff, t );
  return ( ( r << 24 ) | ( g << 16 ) | ( b << 8 ) | a ) >>> 0;
}

const make_ramp = ( colorStops, numSamples ) => {
  let last_u = 0.0;
  let last_c = colorStops[ 0 ].color;
  let this_u = last_u;
  let this_c = last_c;
  let j = 0;
  return _.flatten( _.range( 0, numSamples ).map( i => {
    let u = i / ( numSamples - 1 );
    while ( u > this_u ) {
      last_u = this_u;
      last_c = this_c;
      const colorStop = colorStops[ j ];
      if ( colorStop ) {
        this_u = colorStop.offset;
        this_c = colorStop.color;
        j++;
      }
      else {
        break;
      }
    }
    let du = this_u - last_u;
    return u32_to_bytes( to_premul_u32( du < 1e-9 ? this_c : lerp_rgba8( last_c, this_c, ( u - last_u ) / du ) ) ).reverse();
  } ) );
};

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
    return ( ( drawTag >>> 6 ) & 0xf ) >>> 0;
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
    return PathTag.path_segment_type( pathTag ) !== 0;
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

export class Layout {
  constructor( args ) {
    // all u32
    this.n_draw_objects = args?.n_draw_objects || 0; /// Number of draw objects.
    this.n_paths = args?.n_paths || 0; /// Number of paths.
    this.n_clips = args?.n_clips || 0; /// Number of clips.
    this.bin_data_start = args?.bin_data_start || 0; /// Start of binning data.
    this.path_tag_base = args?.path_tag_base || 0; /// Start of path tag stream.
    this.path_data_base = args?.path_data_base || 0; /// Start of path data stream.
    this.draw_tag_base = args?.draw_tag_base || 0; /// Start of draw tag stream.
    this.draw_data_base = args?.draw_data_base || 0; /// Start of draw data stream.
    this.transform_base = args?.transform_base || 0; /// Start of transform stream.
    this.linewidth_base = args?.linewidth_base || 0; /// Start of linewidth stream.
  }
}

const TILE_WIDTH = 16; // u32
const TILE_HEIGHT = 16; // u32

// TODO: Obtain these from the vello_shaders crate
const PATH_REDUCE_WG = 256; // u32
const PATH_BBOX_WG = 256; // u32
const PATH_COARSE_WG = 256; // u32
const CLIP_REDUCE_WG = 256; // u32

export class SceneBufferSizes {
  constructor( encoding ) {
    this.buffer_size = 0;
    this.path_tag_padded = 0;

    let n_path_tags = encoding.path_tags.length + encoding.n_open_clips;

    /// Padded length of the path tag stream in bytes.
    this.path_tag_padded = align_up( n_path_tags, 4 * PATH_REDUCE_WG );

    /// Full size of the scene buffer in bytes.
    this.buffer_size = this.path_tag_padded
      + encoding.path_data.length // u8
      + ( encoding.draw_tags.length + encoding.n_open_clips ) * 4 // u32 in rust
      + encoding.draw_data.length // u8
      + encoding.transforms.length * 6 * 4 // 6xf32
      + encoding.linewidths.length * 4; // f32

    // NOTE: because of not using glyphs, our patch_sizes are effectively zero
    /*
            let n_path_tags =
            encoding.path_tags.len() + patch_sizes.path_tags + encoding.n_open_clips as usize;
        let path_tag_padded = align_up(n_path_tags, 4 * crate::config::PATH_REDUCE_WG);
        let buffer_size = path_tag_padded
            + slice_size_in_bytes(&encoding.path_data, patch_sizes.path_data)
            + slice_size_in_bytes(
                &encoding.draw_tags,
                patch_sizes.draw_tags + encoding.n_open_clips as usize,
            )
            + slice_size_in_bytes(&encoding.draw_data, patch_sizes.draw_data)
            + slice_size_in_bytes(&encoding.transforms, patch_sizes.transforms)
            + slice_size_in_bytes(&encoding.linewidths, patch_sizes.linewidths);
        Self {
            buffer_size,
            path_tag_padded,
        }
     */
  }
}

// TODO: It's the byte-size of the slice + extra
// const slice_size_in_bytes = <T: Sized>(slice: &[T], extra: usize) -> usize {
//     (slice.len() + extra) * std::mem::size_of::<T>()
// }

const size_to_words = byte_size => byte_size / 4;

const align_up = (len, alignment) => {
  return len + ( ( ( ~len ) + 1 ) & ( alignment - 1 ) );
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
    const initial_draw_data_length = this.draw_data.length;

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
    this.color_stops.push( ...other.color_stops );
    this.patches.push( ...other.patches.map( patch => ( {
      ...patch,
      draw_data_offset: patch.draw_data_offset + initial_draw_data_length
    } ) ) );
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
      this.path_data.length = this.path_data.length - 8;
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
    this.draw_data.push( ...u32_to_bytes( to_premul_u32( color ) ) );
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
        stops: color_stops,
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
    const SKIA_EPSILON = 1 / ( ( 1 << 12 ) >>> 0 );
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
      ...u32_to_bytes( ( ( image.width << 16 ) >>> 0 ) | ( image.height & 0xFFFF ) )
    ] );
  }

  /// Encodes a begin clip command.
  encode_begin_clip( mix, compose, alpha ) {
    this.draw_tags.push( DrawTag.BEGIN_CLIP );
    this.draw_data.push( ...[
      // u32 combination of mix and compose
      ...u32_to_bytes( ( ( mix << 8 ) >>> 0 ) | compose ),
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

  /// Resolves late bound resources and packs an encoding. Returns the packed
  /// layout and computed ramp data.
  resolve() {
    const NUM_RAMP_SAMPLES = 512;
    let numRamps = 0;
    let rampData = [];

    // TODO: image atlas
    const imageWidth = 1024;
    const imageHeight = 1024;
    const images = [];

    this.patches.forEach( patch => {
      if ( patch.type === 'image' ) {
        // { type: 'image', draw_data_offset: number, image: ImageStub }
        // TODO: image atlas (we have BinPacker?)
        const x = 0;
        const y = 0;
        // TODO: eeek, don't modify the xy of the stub image, include our own wrapper
        patch.image.xy.x = x;
        patch.image.xy.y = y;
        images.push( {
          image: patch.image,
          x: x,
          y: y
        } );
      }
      else if ( patch.type === 'ramp' ) {
        // { type: 'ramp', draw_data_offset: number, stops: number[], extend: number }

        // TODO: cache ramps (we burn a lot of data!!!)
        patch.id = numRamps++;
        rampData.push( ...make_ramp( patch.stops, NUM_RAMP_SAMPLES ) );
      }
    } );

    // TODO: typed array (we'll need to convert it later)
    const data = [];
    const layout = new Layout();
    layout.n_paths = this.n_paths;
    layout.n_clips = this.n_clips;

    const sceneBufferSizes = new SceneBufferSizes( this );
    // data.reserve(buffer_size);
    const buffer_size = sceneBufferSizes.buffer_size;
    const path_tag_padded = sceneBufferSizes.path_tag_padded;

    // Path tag stream
    layout.path_tag_base = size_to_words( data.length );
    data.push( ...this.path_tags );
    // TODO: what if we... just error if there are open clips? Why are we padding the streams to make this work?
    for ( let i = 0; i < this.n_open_clips; i++ ) {
      data.push( PathTag.PATH );
    }
    // TODO: probably a more elegant way in the future, especially when typed array
    while ( data.length < path_tag_padded ) {
      data.push( 0 );
    }

    // Path data stream
    layout.path_data_base = size_to_words( data.length );
    data.push( ...this.path_data );

    // Draw tag stream
    layout.draw_tag_base = size_to_words( data.length );
    // Bin data follows draw info
    layout.bin_data_start = _.sum( this.draw_tags, DrawTag.info_size );
    data.push( ...( _.flatten( this.draw_tags.map( u32_to_bytes ) ) ) );
    for ( let i = 0; i < this.n_open_clips; i++ ) {
      data.push( ...u32_to_bytes( DrawTag.END_CLIP ) );
    }

    // Draw data stream
    layout.draw_data_base = size_to_words( data.length );
    {
      // TODO: a bit simpler to just draw all of it in, then do the ramp/image stuff? get it working first
      let pos = 0;
      this.patches.forEach( patch => {
        if ( pos < patch.draw_data_offset ) {
          data.push( ...this.draw_data.slice( pos, patch.draw_data_offset ) );
        }
        pos = patch.draw_data_offset;
        if ( patch.type === 'ramp' ) {
          data.push( ...u32_to_bytes( ( ( patch.id << 2 ) >>> 0 ) | patch.extend ) );
          pos += 4;
        }
        else if ( patch.type === 'image' ) {
          data.push( ...u32_to_bytes( ( patch.image.xy.x << 16 ) >>> 0 | patch.image.xy.y ) );
          pos += 4;
          // TODO: assume the image fit (if not, we'll need to do something else)
        }
        else {
          throw new Error( 'unknown patch type' );
        }
      } );
      if ( pos < this.draw_data.length ) {
        data.push( ...this.draw_data.slice( pos ) );
      }
    }

    // Transform stream
    layout.transform_base = size_to_words( data.length );
    data.push( ...( _.flatten( this.transforms.map( transform => {
      return [
        ...f32_to_bytes( transform.a00 ),
        ...f32_to_bytes( transform.a10 ),
        ...f32_to_bytes( transform.a01 ),
        ...f32_to_bytes( transform.a11 ),
        ...f32_to_bytes( transform.a02 ),
        ...f32_to_bytes( transform.a12 )
      ];
    } ) ) ) );

    // Linewidth stream
    layout.linewidth_base = size_to_words( data.length );
    data.push( ...( _.flatten( this.linewidths.map( f32_to_bytes ) ) ) );

    layout.n_draw_objects = layout.n_paths;

    if ( data.length !== buffer_size ) {
      throw new Error( 'buffer size mismatch' );
    }

    return {
      packed: new Uint8Array( data ),
      layout: layout,

      // TODO: ramp_cache.ramps(), image_cache.images()
      ramps: {
        width: numRamps === 0 ? 0 : NUM_RAMP_SAMPLES,
        height: numRamps,
        data: new Uint8Array( rampData )
      },
      images: {
        width: imageWidth,
        height: imageHeight,
        images: images
      }
    };
  }
}

/*

/// Counters for tracking dynamic allocation on the GPU.
///
/// This must be kept in sync with the struct in shader/shared/bump.wgsl
#[derive(Clone, Copy, Debug, Default, Zeroable, Pod)]
#[repr(C)]
pub struct BumpAllocators {
    pub failed: u32,
    // Final needed dynamic size of the buffers. If any of these are larger
    // than the corresponding `_size` element reallocation needs to occur.
    pub binning: u32,
    pub ptcl: u32,
    pub tile: u32,
    pub segments: u32,
    pub blend: u32,
}

/// Uniform render configuration data used by all GPU stages.
///
/// This data structure must be kept in sync with the definition in
/// shaders/shared/config.wgsl.
#[derive(Clone, Copy, Debug, Default, Zeroable, Pod)]
#[repr(C)]
pub struct ConfigUniform {
    /// Width of the scene in tiles.
    pub width_in_tiles: u32,
    /// Height of the scene in tiles.
    pub height_in_tiles: u32,
    /// Width of the target in pixels.
    pub target_width: u32,
    /// Height of the target in pixels.
    pub target_height: u32,
    /// The base background color applied to the target before any blends.
    pub base_color: u32,
    /// Layout of packed scene data.
    pub layout: Layout,
    /// Size of binning buffer allocation (in u32s).
    pub binning_size: u32,
    /// Size of tile buffer allocation (in Tiles).
    pub tiles_size: u32,
    /// Size of segment buffer allocation (in PathSegments).
    pub segments_size: u32,
    /// Size of per-tile command list buffer allocation (in u32s).
    pub ptcl_size: u32,
}

/// CPU side setup and configuration.
#[derive(Default)]
pub struct RenderConfig {
    /// GPU side configuration.
    pub gpu: ConfigUniform,
    /// Workgroup counts for all compute pipelines.
    pub workgroup_counts: WorkgroupCounts,
    /// Sizes of all buffer resources.
    pub buffer_sizes: BufferSizes,
}

impl RenderConfig {
    pub fn new(layout: &Layout, width: u32, height: u32, base_color: &peniko::Color) -> Self {
        let new_width = next_multiple_of(width, TILE_WIDTH);
        let new_height = next_multiple_of(height, TILE_HEIGHT);
        let width_in_tiles = new_width / TILE_WIDTH;
        let height_in_tiles = new_height / TILE_HEIGHT;
        let n_path_tags = layout.path_tags_size();
        let workgroup_counts =
            WorkgroupCounts::new(layout, width_in_tiles, height_in_tiles, n_path_tags);
        let buffer_sizes = BufferSizes::new(layout, &workgroup_counts, n_path_tags);
        Self {
            gpu: ConfigUniform {
                width_in_tiles,
                height_in_tiles,
                target_width: width,
                target_height: height,
                base_color: base_color.to_premul_u32(),
                binning_size: buffer_sizes.bin_data.len() - layout.bin_data_start,
                tiles_size: buffer_sizes.tiles.len(),
                segments_size: buffer_sizes.segments.len(),
                ptcl_size: buffer_sizes.ptcl.len(),
                layout: *layout,
            },
            workgroup_counts,
            buffer_sizes,
        }
    }
}

/// Type alias for a workgroup size.
pub type WorkgroupSize = (u32, u32, u32);

/// Computed sizes for all dispatches.
#[derive(Copy, Clone, Debug, Default)]
pub struct WorkgroupCounts {
    pub use_large_path_scan: bool,
    pub path_reduce: WorkgroupSize,
    pub path_reduce2: WorkgroupSize,
    pub path_scan1: WorkgroupSize,
    pub path_scan: WorkgroupSize,
    pub bbox_clear: WorkgroupSize,
    pub path_seg: WorkgroupSize,
    pub draw_reduce: WorkgroupSize,
    pub draw_leaf: WorkgroupSize,
    pub clip_reduce: WorkgroupSize,
    pub clip_leaf: WorkgroupSize,
    pub binning: WorkgroupSize,
    pub tile_alloc: WorkgroupSize,
    pub path_coarse: WorkgroupSize,
    pub backdrop: WorkgroupSize,
    pub coarse: WorkgroupSize,
    pub fine: WorkgroupSize,
}

impl WorkgroupCounts {
    pub fn new(
        layout: &Layout,
        width_in_tiles: u32,
        height_in_tiles: u32,
        n_path_tags: u32,
    ) -> Self {
        let n_paths = layout.n_paths;
        let n_draw_objects = layout.n_draw_objects;
        let n_clips = layout.n_clips;
        let path_tag_padded = align_up(n_path_tags, 4 * PATH_REDUCE_WG);
        let path_tag_wgs = path_tag_padded / (4 * PATH_REDUCE_WG);
        let use_large_path_scan = path_tag_wgs > PATH_REDUCE_WG;
        let reduced_size = if use_large_path_scan {
            align_up(path_tag_wgs, PATH_REDUCE_WG)
        } else {
            path_tag_wgs
        };
        let draw_object_wgs = (n_draw_objects + PATH_BBOX_WG - 1) / PATH_BBOX_WG;
        let path_coarse_wgs = (n_path_tags + PATH_COARSE_WG - 1) / PATH_COARSE_WG;
        let clip_reduce_wgs = n_clips.saturating_sub(1) / CLIP_REDUCE_WG;
        let clip_wgs = (n_clips + CLIP_REDUCE_WG - 1) / CLIP_REDUCE_WG;
        let path_wgs = (n_paths + PATH_BBOX_WG - 1) / PATH_BBOX_WG;
        let width_in_bins = (width_in_tiles + 15) / 16;
        let height_in_bins = (height_in_tiles + 15) / 16;
        Self {
            use_large_path_scan,
            path_reduce: (path_tag_wgs, 1, 1),
            path_reduce2: (PATH_REDUCE_WG, 1, 1),
            path_scan1: (reduced_size / PATH_REDUCE_WG, 1, 1),
            path_scan: (path_tag_wgs, 1, 1),
            bbox_clear: (draw_object_wgs, 1, 1),
            path_seg: (path_coarse_wgs, 1, 1),
            draw_reduce: (draw_object_wgs, 1, 1),
            draw_leaf: (draw_object_wgs, 1, 1),
            clip_reduce: (clip_reduce_wgs, 1, 1),
            clip_leaf: (clip_wgs, 1, 1),
            binning: (draw_object_wgs, 1, 1),
            tile_alloc: (path_wgs, 1, 1),
            path_coarse: (path_coarse_wgs, 1, 1),
            backdrop: (path_wgs, 1, 1),
            coarse: (width_in_bins, height_in_bins, 1),
            fine: (width_in_tiles, height_in_tiles, 1),
        }
    }
}

/// Typed buffer size primitive.
#[derive(Copy, Clone, Eq, Default, Debug)]
pub struct BufferSize<T: Sized> {
    len: u32,
    _phantom: std::marker::PhantomData<T>,
}

impl<T: Sized> BufferSize<T> {
    /// Creates a new buffer size from number of elements.
    pub const fn new(len: u32) -> Self {
        Self {
            len,
            _phantom: std::marker::PhantomData,
        }
    }

    /// Creates a new buffer size from size in bytes.
    pub const fn from_size_in_bytes(size: u32) -> Self {
        Self::new(size / mem::size_of::<T>() as u32)
    }

    /// Returns the number of elements.
    #[allow(clippy::len_without_is_empty)]
    pub const fn len(self) -> u32 {
        self.len
    }

    /// Returns the size in bytes.
    pub const fn size_in_bytes(self) -> u32 {
        mem::size_of::<T>() as u32 * self.len
    }

    /// Returns the size in bytes aligned up to the given value.
    pub const fn aligned_in_bytes(self, alignment: u32) -> u32 {
        align_up(self.size_in_bytes(), alignment)
    }
}

impl<T: Sized> PartialEq for BufferSize<T> {
    fn eq(&self, other: &Self) -> bool {
        self.len == other.len
    }
}

impl<T: Sized> PartialOrd for BufferSize<T> {
    fn partial_cmp(&self, other: &Self) -> Option<std::cmp::Ordering> {
        self.len.partial_cmp(&other.len)
    }
}

/// Computed sizes for all buffers.
#[derive(Copy, Clone, Debug, Default)]
pub struct BufferSizes {
    // Known size buffers
    pub path_reduced: BufferSize<PathMonoid>,
    pub path_reduced2: BufferSize<PathMonoid>,
    pub path_reduced_scan: BufferSize<PathMonoid>,
    pub path_monoids: BufferSize<PathMonoid>,
    pub path_bboxes: BufferSize<PathBbox>,
    pub cubics: BufferSize<Cubic>,
    pub draw_reduced: BufferSize<DrawMonoid>,
    pub draw_monoids: BufferSize<DrawMonoid>,
    pub info: BufferSize<u32>,
    pub clip_inps: BufferSize<Clip>,
    pub clip_els: BufferSize<ClipElement>,
    pub clip_bics: BufferSize<ClipBic>,
    pub clip_bboxes: BufferSize<ClipBbox>,
    pub draw_bboxes: BufferSize<DrawBbox>,
    pub bump_alloc: BufferSize<BumpAllocators>,
    pub bin_headers: BufferSize<BinHeader>,
    pub paths: BufferSize<Path>,
    // Bump allocated buffers
    pub bin_data: BufferSize<u32>,
    pub tiles: BufferSize<Tile>,
    pub segments: BufferSize<PathSegment>,
    pub ptcl: BufferSize<u32>,
}

impl BufferSizes {
    pub fn new(layout: &Layout, workgroups: &WorkgroupCounts, n_path_tags: u32) -> Self {
        let n_paths = layout.n_paths;
        let n_draw_objects = layout.n_draw_objects;
        let n_clips = layout.n_clips;
        let path_tag_wgs = workgroups.path_reduce.0;
        let reduced_size = if workgroups.use_large_path_scan {
            align_up(path_tag_wgs, PATH_REDUCE_WG)
        } else {
            path_tag_wgs
        };
        let path_reduced = BufferSize::new(reduced_size);
        let path_reduced2 = BufferSize::new(PATH_REDUCE_WG);
        let path_reduced_scan = BufferSize::new(path_tag_wgs);
        let path_monoids = BufferSize::new(path_tag_wgs * PATH_REDUCE_WG);
        let path_bboxes = BufferSize::new(n_paths);
        let cubics = BufferSize::new(n_path_tags);
        let draw_object_wgs = workgroups.draw_reduce.0;
        let draw_reduced = BufferSize::new(draw_object_wgs);
        let draw_monoids = BufferSize::new(n_draw_objects);
        let info = BufferSize::new(layout.bin_data_start);
        let clip_inps = BufferSize::new(n_clips);
        let clip_els = BufferSize::new(n_clips);
        let clip_bics = BufferSize::new(n_clips / CLIP_REDUCE_WG);
        let clip_bboxes = BufferSize::new(n_clips);
        let draw_bboxes = BufferSize::new(n_paths);
        let bump_alloc = BufferSize::new(1);
        let bin_headers = BufferSize::new(draw_object_wgs * 256);
        let n_paths_aligned = align_up(n_paths, 256);
        let paths = BufferSize::new(n_paths_aligned);

        // The following buffer sizes have been hand picked to accommodate the vello test scenes as
        // well as paris-30k. These should instead get derived from the scene layout using
        // reasonable heuristics.
        let bin_data = BufferSize::new(1 << 18);
        let tiles = BufferSize::new(1 << 21);
        let segments = BufferSize::new(1 << 21);
        let ptcl = BufferSize::new(1 << 23);
        Self {
            path_reduced,
            path_reduced2,
            path_reduced_scan,
            path_monoids,
            path_bboxes,
            cubics,
            draw_reduced,
            draw_monoids,
            info,
            clip_inps,
            clip_els,
            clip_bics,
            clip_bboxes,
            draw_bboxes,
            bump_alloc,
            bin_headers,
            paths,
            bin_data,
            tiles,
            segments,
            ptcl,
        }
    }
}

const fn align_up(len: u32, alignment: u32) -> u32 {
    len + (len.wrapping_neg() & (alignment - 1))
}

const fn next_multiple_of(val: u32, rhs: u32) -> u32 {
    match val % rhs {
        0 => val,
        r => val + (rhs - r),
    }
}

 */