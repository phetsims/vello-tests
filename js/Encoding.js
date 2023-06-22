const TILE_WIDTH = 16; // u32
const TILE_HEIGHT = 16; // u32
const PATH_REDUCE_WG = 256; // u32
const PATH_BBOX_WG = 256; // u32
const PATH_COARSE_WG = 256; // u32
const CLIP_REDUCE_WG = 256; // u32

const LAYOUT_BYTES = 10 * 4; // 10x u32
const CONFIG_UNIFORM_BYTES = 9 * 4 + LAYOUT_BYTES; // 9x u32 + Layout
const PATH_MONOID_BYTES = 5 * 4; // 5x u32
const PATH_BBOX_BYTES = 6 * 4; // 4x i32, f32, u32
const CUBIC_BYTES = 12 * 4; // 10x f32, 2x u32
const DRAW_MONOID_BYTES = 4 * 4; // 4x u32
const CLIP_BYTES = 2 * 4; // 2x u32
const CLIP_ELEMENT_BYTES = 4 + 12 + 4 * 4; // u32 + 12x u8 + 4x f32
const CLIP_BIC_BYTES = 2 * 4; // 2x u32
const CLIP_BBOX_BYTES = 4 * 4; // 4x f32
const DRAW_BBOX_BYTES = 4 * 4; // 4x f32
const BUMP_ALLOCATORS_BYTES = 6 * 4; // 6x u32
const BIN_HEADER_BYTES = 2 * 4; // 2x u32
const PATH_BYTES = 4 * 4 + 4 + 3 * 4; // 4x f32 + u32 + 3x u32
const TILE_BYTES = 2 * 4; // i32, u32
const PATH_SEGMENT_BYTES = 6 * 4; // 5x f32, u32

const size_to_words = byte_size => byte_size / 4;

const align_up = ( len, alignment ) => {
  return len + ( ( ( ~len ) + 1 ) & ( alignment - 1 ) );
}

const next_multiple_of = ( val, rhs ) => {
  const r = val % rhs;
  return r === 0 ? val : val + ( rhs - r );
}

// Convert u32/f32 to 4 bytes in little endian order
const scratch_to_bytes = new Uint8Array( 4 );
export const f32_to_bytes = float => {
  const view = new DataView( scratch_to_bytes.buffer );
  view.setFloat32( 0, float );
  return [ ...scratch_to_bytes ].reverse();
};
export const u32_to_bytes = int => {
  const view = new DataView( scratch_to_bytes.buffer );
  view.setUint32( 0, int );
  return [ ...scratch_to_bytes ].reverse();
};

export const with_alpha_factor = ( color, alpha ) => {
  return ( color & 0xffffff00 ) | ( Math.round( ( color & 0xff ) * alpha ) & 0xff );
};

export const to_premul_u32 = rgba8color => {
  const a = ( rgba8color & 0xff ) / 255;
  const r = Math.round( ( ( rgba8color >>> 24 ) & 0xff ) * a >>> 0 );
  const g = Math.round( ( ( rgba8color >>> 16 ) & 0xff ) * a >>> 0 );
  const b = Math.round( ( ( rgba8color >>> 8 ) & 0xff ) * a >>> 0 );
  return ( ( r << 24 ) | ( g << 16 ) | ( b << 8 ) | ( rgba8color & 0xff ) ) >>> 0;
};

export const lerp_rgba8 = ( c1, c2, t ) => {
  const l = ( x, y, a ) => Math.round( x * ( 1 - a ) + y * a >>> 0 );
  const r = l( ( c1 >>> 24 ) & 0xff, ( c2 >>> 24 ) & 0xff, t );
  const g = l( ( c1 >>> 16 ) & 0xff, ( c2 >>> 16 ) & 0xff, t );
  const b = l( ( c1 >>> 8 ) & 0xff, ( c2 >>> 8 ) & 0xff, t );
  const a = l( c1 & 0xff, c2 & 0xff, t );
  return ( ( r << 24 ) | ( g << 16 ) | ( b << 8 ) | a ) >>> 0;
};

export class ByteBuffer {
  constructor( initialSize = 512 ) {
    this._byteLength = 0;
    // TODO: resizable buffers once supported by Firefox, use maxByteLength (no copying!!!)
    this._arrayBuffer = new ArrayBuffer( initialSize );
    this._f32Array = new Float32Array( this._arrayBuffer );
    this._u32Array = new Uint32Array( this._arrayBuffer );
    this._u8Array = new Uint8Array( this._arrayBuffer );
  }

  // Direct access, for when performance is helpful
  get fullU8Array() {
    return this._u8Array;
  }
  get fullU32Array() {
    return this._u32Array;
  }
  get fullF32Array() {
    return this._f32Array;
  }

  get u8Array() {
    return new Uint8Array( this._arrayBuffer, 0, this._byteLength );
  }
  get u32Array() {
    return new Uint32Array( this._arrayBuffer, 0, this._byteLength / 4 );
  }
  get f32Array() {
    return new Float32Array( this._arrayBuffer, 0, this._byteLength / 4 );
  }

  clear() {
    this._byteLength = 0;
    this._u8Array.fill( 0 );
  }

  pushByteBuffer( byteBuffer ) {
    // TODO: this is a hot spot, optimize
    this.ensureSpaceFor( byteBuffer._byteLength );

    this._u8Array.set( byteBuffer._u8Array.slice( 0, byteBuffer._byteLength ), this._byteLength );
    this._byteLength += byteBuffer._byteLength;
  }

  pushF32( f32 ) {
    this.ensureSpaceFor( 4 );
    // If aligned, use the faster _f32Array
    if ( this._byteLength % 4 === 0 ) {
      this._f32Array[ this._byteLength / 4 ] = f32;
    }
    else {
      const bytes = f32_to_bytes( f32 );
      this._u8Array.set( bytes, this._byteLength );
    }
    this._byteLength += 4;
  }

  pushU32( u32 ) {
    this.ensureSpaceFor( 4 );
    // If aligned, use the faster _u32Array
    if ( this._byteLength % 4 === 0 ) {
      this._u32Array[ this._byteLength / 4 ] = u32;
    }
    else {
      const bytes = u32_to_bytes( u32 );
      this._u8Array.set( bytes, this._byteLength );
    }
    this._byteLength += 4;
  }

  pushReversedU32( u32 ) {
    this.ensureSpaceFor( 4 );

    const bytes = u32_to_bytes( u32 ).reverse();
    this._u8Array.set( bytes, this._byteLength );

    this._byteLength += 4;
  }

  pushU8( u8 ) {
    this.ensureSpaceFor( 1 );
    this._u8Array[ this._byteLength ] = u8;
    this._byteLength += 1;
  }

  get byteLength() {
    return this._byteLength;
  }

  set byteLength( byteLength ) {
    // Don't actually expand below
    if ( byteLength > this._arrayBuffer.byteLength ) {
      this.resize( byteLength );
    }
    this._byteLength = byteLength;
  }

  ensureSpaceFor( byteLength ) {
    const requiredByteLength = this._byteLength + byteLength;
    if ( this._byteLength + byteLength > this._arrayBuffer.byteLength ) {
      this.resize( Math.max( this._arrayBuffer.byteLength * 2, requiredByteLength ) );
    }
  }

  // NOTE: this MAY truncate
  resize( byteLength = 0 ) {
    // TODO: This is a hot-spot!
    byteLength = byteLength || this._arrayBuffer.byteLength * 2;
    byteLength = Math.ceil( byteLength / 4 ) * 4; // Round up to nearest 4 (for alignment)
    // Double the size of the _arrayBuffer by default, copying memory
    const newArrayBuffer = new ArrayBuffer( byteLength );
    const newU8Array = new Uint8Array( newArrayBuffer );
    newU8Array.set( this._u8Array.slice( 0, Math.min( this._byteLength, byteLength ) ) );
    this._arrayBuffer = newArrayBuffer;
    this._f32Array = new Float32Array( this._arrayBuffer );
    this._u32Array = new Uint32Array( this._arrayBuffer );
    this._u8Array = new Uint8Array( this._arrayBuffer );
  }
}

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
    // TODO: Affine (and this method) are a hot spot IF we are doing client-side matrix stuff
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

export class BufferImage {
  // TODO: perhaps reorder parameters
  constructor( width, height, buffer ) {
    this.width = width;
    this.height = height;
    this.buffer = buffer;
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
  constructor( options ) {
    // all u32
    this.n_draw_objects = options?.n_draw_objects || 0; /// Number of draw objects.
    this.n_paths = options?.n_paths || 0; /// Number of paths.
    this.n_clips = options?.n_clips || 0; /// Number of clips.
    this.bin_data_start = options?.bin_data_start || 0; /// Start of binning data.
    this.path_tag_base = options?.path_tag_base || 0; /// Start of path tag stream.
    this.path_data_base = options?.path_data_base || 0; /// Start of path data stream.
    this.draw_tag_base = options?.draw_tag_base || 0; /// Start of draw tag stream.
    this.draw_data_base = options?.draw_data_base || 0; /// Start of draw data stream.
    this.transform_base = options?.transform_base || 0; /// Start of transform stream.
    this.linewidth_base = options?.linewidth_base || 0; /// Start of linewidth stream.
  }

  path_tags_size() {
    let start = this.path_tag_base * 4;
    let end = this.path_data_base * 4;
    return end - start;
  }
}

export class SceneBufferSizes {
  constructor( encoding ) {
    this.buffer_size = 0;
    this.path_tag_padded = 0;

    let n_path_tags = encoding.pathTagsBuf.byteLength + encoding.n_open_clips;

    /// Padded length of the path tag stream in bytes.
    this.path_tag_padded = align_up( n_path_tags, 4 * PATH_REDUCE_WG );

    /// Full size of the scene buffer in bytes.
    this.buffer_size = this.path_tag_padded
      + encoding.pathDataBuf.byteLength // u8
      + encoding.drawTagsBuf.byteLength + encoding.n_open_clips * 4 // u32 in rust
      + encoding.drawDataBuf.byteLength // u8
      + encoding.transforms.length * 6 * 4 // 6xf32
      + encoding.linewidths.length * 4; // f32

    // NOTE: because of not using the glyphs feature, our patch_sizes are effectively zero
  }
}

/// Uniform render configuration data used by all GPU stages.
///
/// This data structure must be kept in sync with the definition in
/// shaders/shared/config.wgsl.
export class ConfigUniform {
  constructor( options ) {
    /// Width of the scene in tiles.
    this.width_in_tiles = options.width_in_tiles;
    /// Height of the scene in tiles.
    this.height_in_tiles = options.height_in_tiles;
    /// Width of the target in pixels.
    this.target_width = options.target_width;
    /// Height of the target in pixels.
    this.target_height = options.target_height;
    /// The base background color applied to the target before any blends.
    this.base_color = options.base_color;
    /// Layout of packed scene data.
    this.layout = options.layout;
    /// Size of binning buffer allocation (in u32s).
    this.binning_size = options.binning_size;
    /// Size of tile buffer allocation (in Tiles).
    this.tiles_size = options.tiles_size;
    /// Size of segment buffer allocation (in PathSegments).
    this.segments_size = options.segments_size;
    /// Size of per-tile command list buffer allocation (in u32s).
    this.ptcl_size = options.ptcl_size;
  }

  to_typed_array() {
    const buf = new ByteBuffer( CONFIG_UNIFORM_BYTES );

    buf.pushU32( this.width_in_tiles );
    buf.pushU32( this.height_in_tiles );
    buf.pushU32( this.target_width );
    buf.pushU32( this.target_height );
    buf.pushU32( this.base_color );

    // Layout
    buf.pushU32( this.layout.n_draw_objects );
    buf.pushU32( this.layout.n_paths );
    buf.pushU32( this.layout.n_clips );
    buf.pushU32( this.layout.bin_data_start );
    buf.pushU32( this.layout.path_tag_base );
    buf.pushU32( this.layout.path_data_base );
    buf.pushU32( this.layout.draw_tag_base );
    buf.pushU32( this.layout.draw_data_base );
    buf.pushU32( this.layout.transform_base );
    buf.pushU32( this.layout.linewidth_base );

    buf.pushU32( this.binning_size );
    buf.pushU32( this.tiles_size );
    buf.pushU32( this.segments_size );
    buf.pushU32( this.ptcl_size );

    return buf.u8Array;
  }
}

export class WorkgroupSize {
  constructor( x, y, z ) {
    // u32
    this.x = x;
    this.y = y;
    this.z = z;
  }

  toString() {
    return `[${this.x} ${this.y} ${this.z}]`;
  }
}

export class WorkgroupCounts {
  constructor( layout, width_in_tiles, height_in_tiles, n_path_tags ) {

    let n_paths = layout.n_paths;
    let n_draw_objects = layout.n_draw_objects;
    let n_clips = layout.n_clips;
    let path_tag_padded = align_up( n_path_tags, 4 * PATH_REDUCE_WG );
    let path_tag_wgs = Math.floor( path_tag_padded / ( 4 * PATH_REDUCE_WG ) );
    let use_large_path_scan = path_tag_wgs > PATH_REDUCE_WG;
    let reduced_size = use_large_path_scan ? align_up( path_tag_wgs, PATH_REDUCE_WG ) : path_tag_wgs;
    let draw_object_wgs = Math.floor( ( n_draw_objects + PATH_BBOX_WG - 1 ) / PATH_BBOX_WG );
    let path_coarse_wgs = Math.floor( ( n_path_tags + PATH_COARSE_WG - 1 ) / PATH_COARSE_WG );
    let clip_reduce_wgs = Math.floor( Math.max( 0, n_clips - 1 ) / CLIP_REDUCE_WG );
    let clip_wgs = Math.floor( ( n_clips + CLIP_REDUCE_WG - 1 ) / CLIP_REDUCE_WG );
    let path_wgs = Math.floor( ( n_paths + PATH_BBOX_WG - 1 ) / PATH_BBOX_WG );
    let width_in_bins = Math.floor( ( width_in_tiles + 15 ) / 16 );
    let height_in_bins = Math.floor( ( height_in_tiles + 15 ) / 16 );

    this.use_large_path_scan = use_large_path_scan;
    this.path_reduce = new WorkgroupSize( path_tag_wgs, 1, 1 );
    this.path_reduce2 = new WorkgroupSize( PATH_REDUCE_WG, 1, 1 );
    this.path_scan1 = new WorkgroupSize( Math.floor( reduced_size / PATH_REDUCE_WG ), 1, 1 );
    this.path_scan = new WorkgroupSize( path_tag_wgs, 1, 1 );
    this.bbox_clear = new WorkgroupSize( draw_object_wgs, 1, 1 );
    this.path_seg = new WorkgroupSize( path_coarse_wgs, 1, 1 );
    this.draw_reduce = new WorkgroupSize( draw_object_wgs, 1, 1 );
    this.draw_leaf = new WorkgroupSize( draw_object_wgs, 1, 1 );
    this.clip_reduce = new WorkgroupSize( clip_reduce_wgs, 1, 1 );
    this.clip_leaf = new WorkgroupSize( clip_wgs, 1, 1 );
    this.binning = new WorkgroupSize( draw_object_wgs, 1, 1 );
    this.tile_alloc = new WorkgroupSize( path_wgs, 1, 1 );
    this.path_coarse = new WorkgroupSize( path_coarse_wgs, 1, 1 );
    this.backdrop = new WorkgroupSize( path_wgs, 1, 1 );
    this.coarse = new WorkgroupSize( width_in_bins, height_in_bins, 1 );
    this.fine = new WorkgroupSize( width_in_tiles, height_in_tiles, 1 );
  }
}

export class BufferSize {
  constructor( length, bytes_per_element ) {
    this.length = length;
    this.bytes_per_element = bytes_per_element;
  }

  /// Creates a new buffer size from size in bytes (u32)
  static from_size_in_bytes( size, bytes_per_element ) {
    return new BufferSize( size / bytes_per_element, bytes_per_element );
  }

  /// Returns the number of elements.
  len() {
    return this.length;
  }

  /// Returns the size in bytes.
  size_in_bytes() {
    return this.bytes_per_element * this.length;
  }

  /// Returns the size in bytes aligned up to the given value.
  aligned_in_bytes( alignment ) {
    return align_up( this.size_in_bytes(), alignment );
  }
}

export class BufferSizes {
  // TODO: this is a GREAT place to view documentation, go to each thing!
  // // Known size buffers
  // pub path_reduced: BufferSize<PathMonoid>,
  // pub path_reduced2: BufferSize<PathMonoid>,
  // pub path_reduced_scan: BufferSize<PathMonoid>,
  // pub path_monoids: BufferSize<PathMonoid>,
  // pub path_bboxes: BufferSize<PathBbox>,
  // pub cubics: BufferSize<Cubic>,
  // pub draw_reduced: BufferSize<DrawMonoid>,
  // pub draw_monoids: BufferSize<DrawMonoid>,
  // pub info: BufferSize<u32>,
  // pub clip_inps: BufferSize<Clip>,
  // pub clip_els: BufferSize<ClipElement>,
  // pub clip_bics: BufferSize<ClipBic>,
  // pub clip_bboxes: BufferSize<ClipBbox>,
  // pub draw_bboxes: BufferSize<DrawBbox>,
  // pub bump_alloc: BufferSize<BumpAllocators>, // 6x u32
  // pub bin_headers: BufferSize<BinHeader>,
  // pub paths: BufferSize<Path>,
  // // Bump allocated buffers
  // pub bin_data: BufferSize<u32>,
  // pub tiles: BufferSize<Tile>,
  // pub segments: BufferSize<PathSegment>,
  // pub ptcl: BufferSize<u32>,

  // layout: &Layout, workgroups: &WorkgroupCounts, n_path_tags: u32
  constructor( layout, workgroups, n_path_tags ) {

    let n_paths = layout.n_paths;
    let n_draw_objects = layout.n_draw_objects;
    let n_clips = layout.n_clips;
    let path_tag_wgs = workgroups.path_reduce.x;
    let reduced_size = workgroups.use_large_path_scan ? align_up( path_tag_wgs, PATH_REDUCE_WG ) : path_tag_wgs;
    this.path_reduced = new BufferSize( reduced_size, PATH_MONOID_BYTES);
    this.path_reduced2 = new BufferSize( PATH_REDUCE_WG, PATH_MONOID_BYTES );
    this.path_reduced_scan = new BufferSize( path_tag_wgs, PATH_MONOID_BYTES );
    this.path_monoids = new BufferSize( path_tag_wgs * PATH_REDUCE_WG, PATH_MONOID_BYTES );
    this.path_bboxes = new BufferSize( n_paths, PATH_BBOX_BYTES );
    this.cubics = new BufferSize( n_path_tags, CUBIC_BYTES );
    let draw_object_wgs = workgroups.draw_reduce.x;
    this.draw_reduced = new BufferSize( draw_object_wgs, DRAW_MONOID_BYTES );
    this.draw_monoids = new BufferSize( n_draw_objects, DRAW_MONOID_BYTES );
    this.info = new BufferSize( layout.bin_data_start, 4 );
    this.clip_inps = new BufferSize( n_clips, CLIP_BYTES );
    this.clip_els = new BufferSize( n_clips, CLIP_ELEMENT_BYTES );
    this.clip_bics = new BufferSize( Math.floor( n_clips / CLIP_REDUCE_WG ), CLIP_BIC_BYTES );
    this.clip_bboxes = new BufferSize( n_clips, CLIP_BBOX_BYTES );
    this.draw_bboxes = new BufferSize( n_paths, DRAW_BBOX_BYTES );
    this.bump_alloc = new BufferSize( 1, BUMP_ALLOCATORS_BYTES );
    this.bin_headers = new BufferSize( draw_object_wgs * 256, BIN_HEADER_BYTES );
    let n_paths_aligned = align_up( n_paths, 256 );
    this.paths = new BufferSize( n_paths_aligned, PATH_BYTES );

    // The following buffer sizes have been hand picked to accommodate the vello test scenes as
    // well as paris-30k. These should instead get derived from the scene layout using
    // reasonable heuristics.
    // TODO: derive from scene layout
    this.bin_data = new BufferSize( ( 1 << 18 ) >>> 0, 4 );
    this.tiles = new BufferSize( ( 1 << 21 ) >>> 0, TILE_BYTES );
    this.segments = new BufferSize( ( 1 << 21 ) >>> 0, PATH_SEGMENT_BYTES );
    this.ptcl = new BufferSize( ( 1 << 23 ) >>> 0, 4 );
  }
}

export class RenderConfig {
  constructor( layout, width, height, base_color ) {
    let new_width = next_multiple_of( width, TILE_WIDTH );
    let new_height = next_multiple_of( height, TILE_HEIGHT );
    let width_in_tiles = new_width / TILE_WIDTH;
    let height_in_tiles = new_height / TILE_HEIGHT;
    let n_path_tags = layout.path_tags_size();
    let workgroup_counts = new WorkgroupCounts( layout, width_in_tiles, height_in_tiles, n_path_tags );
    let buffer_sizes = new BufferSizes( layout, workgroup_counts, n_path_tags );

    this.width = width;
    this.height = height;
    this.base_color = base_color;

    // Workgroup counts for all compute pipelines.
    this.workgroup_counts = workgroup_counts;

    // Sizes of all buffer resources.
    this.buffer_sizes = buffer_sizes;

    // GPU side configuration.
    this.gpu = new ConfigUniform( {
      width_in_tiles,
      height_in_tiles,
      target_width: width,
      target_height: height,
      base_color: to_premul_u32( base_color ),
      binning_size: buffer_sizes.bin_data.len() - layout.bin_data_start,
      tiles_size: buffer_sizes.tiles.len(),
      segments_size: buffer_sizes.segments.len(),
      ptcl_size: buffer_sizes.ptcl.len(),
      layout: layout
    } );

    this.config_bytes = this.gpu.to_typed_array();
  }
}

const u8ToBase64 = u8array => {
  let string = '';

	for ( let i = 0; i < u8array.byteLength; i++) {
		string += String.fromCharCode( u8array[ i ] );
	}

	return window.btoa( string );
}

function base64ToU8( base64 ) {
  const string = window.atob( base64 );

  var bytes = new Uint8Array( string.length );
  for ( let i = 0; i < string.length; i++ ) {
    bytes[ i ] = string.charCodeAt( i );
  }

  return bytes;
}

export class RenderInfo {
  constructor( options ) {

    this.packed = options.packed;
    this.layout = options.layout;
    this.ramps = options.ramps;
    this.images = options.images;
    this.renderConfig = null; // generated with prepareRender
  }

  prepareRender( width, height, base_color ) {
    this.renderConfig = new RenderConfig( this.layout, width, height, base_color );
  }
}

// TODO: TS
export default class Encoding {
  constructor() {
    /// The path tag stream.
    this.pathTagsBuf = new ByteBuffer(); // path_tags
    /// The path data stream.
    this.pathDataBuf = new ByteBuffer(); // path_data
    /// The draw tag stream.
    this.drawTagsBuf = new ByteBuffer(); // draw_tags // NOTE: was u32 array (effectively) in rust
    /// The draw data stream.
    this.drawDataBuf = new ByteBuffer(); // draw_data
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
    return this.pathTagsBuf.byteLength === 0;
  }

  /// Clears the encoding.
  reset( is_fragment ) {
    this.transforms.length = 0;
    this.pathTagsBuf.clear();
    this.pathDataBuf.clear();
    this.linewidths.length = 0;
    this.drawDataBuf.clear();
    this.drawTagsBuf.clear();
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
    const initial_draw_data_length = this.drawDataBuf.byteLength;

    this.pathTagsBuf.pushByteBuffer( other.pathTagsBuf );
    this.pathDataBuf.pushByteBuffer( other.pathDataBuf );
    this.drawTagsBuf.pushByteBuffer( other.drawTagsBuf );
    this.drawDataBuf.pushByteBuffer( other.drawDataBuf );
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

  /// Encodes a linewidth.
  encode_linewidth( linewidth ) {
    if ( this.linewidths[ this.linewidths.length - 1 ] !== linewidth ) {
      this.pathTagsBuf.pushU8( PathTag.LINEWIDTH );
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
      this.pathTagsBuf.pushU8( PathTag.TRANSFORM );
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
      this.pathDataBuf.byteLength -= 8;
    } else if ( this.state === Encoding.PATH_NONEMPTY_SUBPATH ) {
      this.setSubpathEndTag();
    }
    this.pathDataBuf.pushF32( x );
    this.pathDataBuf.pushF32( y );
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
    this.pathDataBuf.pushF32( x );
    this.pathDataBuf.pushF32( y );
    this.pathTagsBuf.pushU8( PathTag.LINE_TO_F32 );
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
    this.pathDataBuf.pushF32( x1 );
    this.pathDataBuf.pushF32( y1 );
    this.pathDataBuf.pushF32( x2 );
    this.pathDataBuf.pushF32( y2 );
    this.pathTagsBuf.pushU8( PathTag.QUAD_TO_F32 );
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
    this.pathDataBuf.pushF32( x1 );
    this.pathDataBuf.pushF32( y1 );
    this.pathDataBuf.pushF32( x2 );
    this.pathDataBuf.pushF32( y2 );
    this.pathDataBuf.pushF32( x3 );
    this.pathDataBuf.pushF32( y3 );
    this.pathTagsBuf.pushU8( PathTag.CUBIC_TO_F32 );
    this.state = Encoding.PATH_NONEMPTY_SUBPATH;
    this.n_encoded_segments += 1;
  }

  /// Closes the current subpath.
  close() {
    if ( this.state === Encoding.PATH_START ) {
      return;
    }
    else if ( this.state === Encoding.PATH_MOVE_TO ) {
      this.pathDataBuf.byteLength -= 8;
      this.state = Encoding.PATH_START;
      return;
    }
    const len = this.pathDataBuf.byteLength / 4;
    if ( len < 8 ) {
      // can't happen
      return;
    }
    const lastX = this.pathDataBuf.fullF32Array[ len - 2 ];
    const lastY = this.pathDataBuf.fullF32Array[ len - 1 ];
    if ( Math.abs( lastX - this.first_point.x ) > 1e-8 || Math.abs( lastY - this.first_point.y ) > 1e-8 ) {
      this.pathDataBuf.pushF32( this.first_point.x );
      this.pathDataBuf.pushF32( this.first_point.y );
      this.pathTagsBuf.pushU8( PathTag.with_subpath_end( PathTag.LINE_TO_F32 ) );
      this.n_encoded_segments += 1;
    } else {
      this.setSubpathEndTag();
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
      this.pathDataBuf.byteLength -= 8;
    }
    if ( this.n_encoded_segments !== 0 ) {
      this.setSubpathEndTag();
      this.n_path_segments += this.n_encoded_segments;
      if ( insert_path_marker ) {
        this.insert_path_marker();
      }
    }
    return this.n_encoded_segments;
  }

  setSubpathEndTag() {
    if ( this.pathTagsBuf.byteLength ) {
      // In-place replace, add the "subpath end" flag
      const lastIndex = this.pathTagsBuf.byteLength - 1;

      this.pathTagsBuf.fullU8Array[ lastIndex ] = PathTag.with_subpath_end( this.pathTagsBuf.fullU8Array[ lastIndex ] );
    }
  }

  // Exposed for glyph handling
  insert_path_marker() {
    this.pathTagsBuf.pushU8( PathTag.PATH );
    this.n_paths += 1;
  }

  /// Encodes a solid color brush.
  encode_color( color ) {
    this.drawTagsBuf.pushU32( DrawTag.COLOR );
    this.drawDataBuf.pushU32( to_premul_u32( color ) );
  }

  // zero: => false, one => color, many => true (icky)
  add_ramp( color_stops, alpha, extend ) {
    let offset = this.drawDataBuf.byteLength;
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
      this.drawTagsBuf.pushU32( DrawTag.LINEAR_GRADIENT );
      this.drawDataBuf.pushU32( 0 ); // ramp index, will get filled in
      this.drawDataBuf.pushF32( x0 );
      this.drawDataBuf.pushF32( y0 );
      this.drawDataBuf.pushF32( x1 );
      this.drawDataBuf.pushF32( y1 );
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
        this.drawTagsBuf.pushU32( DrawTag.RADIAL_GRADIENT );
        this.drawDataBuf.pushU32( 0 ); // ramp index, will get filled in
        this.drawDataBuf.pushF32( x0 );
        this.drawDataBuf.pushF32( y0 );
        this.drawDataBuf.pushF32( x1 );
        this.drawDataBuf.pushF32( y1 );
        this.drawDataBuf.pushF32( r0 );
        this.drawDataBuf.pushF32( r1 );
      }
      else {
        this.encode_color( result );
      }
    }
  }

  /// Encodes an image brush.  (( BufferImage)
  encode_image( image ) {
    this.patches.push( {
      type: 'image',
      draw_data_offset: this.drawDataBuf.byteLength,
      image: image // BufferImage
    } );
    this.drawTagsBuf.pushU32( DrawTag.IMAGE );

    // packed atlas coordinates (xy) u32
    this.drawDataBuf.pushU32( 0 );

    // Packed image dimensions. (width_height) u32
    this.drawDataBuf.pushU32( ( ( image.width << 16 ) >>> 0 ) | ( image.height & 0xFFFF ) );
  }

  /// Encodes a begin clip command.
  encode_begin_clip( mix, compose, alpha ) {
    this.drawTagsBuf.pushU32( DrawTag.BEGIN_CLIP );

    // u32 combination of mix and compose
    this.drawDataBuf.pushU32( ( ( mix << 8 ) >>> 0 ) | compose );
    this.drawDataBuf.pushF32( alpha );

    this.n_clips += 1;
    this.n_open_clips += 1;
  }

  /// Encodes an end clip command.
  encode_end_clip() {
    if ( this.n_open_clips > 0 ) {
      this.drawTagsBuf.pushU32( DrawTag.END_CLIP );
      // This is a dummy path, and will go away with the new clip impl.
      this.pathTagsBuf.pushU8( PathTag.PATH );
      this.n_paths += 1;
      this.n_clips += 1;
      this.n_open_clips -= 1;
    }
  }

  // TODO: make this workaround not needed
  finalize_scene() {
    this.encode_path( true );
    this.move_to( 0, 0 );
    this.line_to( 1, 0 );
    this.close();
    this.finish( true );
  }

  print_debug() {
    console.log( `path_tags\n${this.pathTagsBuf.u8Array.map( x => x.toString() ).join( ', ' )}` );
    console.log( `path_data\n${this.pathDataBuf.u8Array.map( x => x.toString() ).join( ', ' )}` );
    console.log( `draw_tags\n${this.drawTagsBuf.u8Array.map( x => x.toString() ).join( ', ' )}` );
    console.log( `draw_data\n${this.drawDataBuf.u8Array.map( x => x.toString() ).join( ', ' )}` );
    console.log( `transforms\n${this.transforms.map( x => `_ a00:${x.a00} a10:${x.a10} a01:${x.a01} a11:${x.a11} a02:${x.a02} a12:${x.a12}_` ).join( '\n' )}` );
    console.log( `linewidths\n${this.linewidths.map( x => x.toString() ).join( ', ' )}` );
    console.log( `n_paths\n${this.n_paths}` );
    console.log( `n_path_segments\n${this.n_path_segments}` );
    console.log( `n_clips\n${this.n_clips}` );
    console.log( `n_open_clips\n${this.n_open_clips}` );
  }

  /// Resolves late bound resources and packs an encoding. Returns the packed
  /// layout and computed ramp data.
  resolve( deviceContext ) {

    deviceContext.ramps.updatePatches( this.patches.filter( patch => patch.type === 'ramp' ) );
    deviceContext.atlas.updatePatches( this.patches.filter( patch => patch.type === 'image' ) );

    const layout = new Layout();
    layout.n_paths = this.n_paths;
    layout.n_clips = this.n_clips;

    const sceneBufferSizes = new SceneBufferSizes( this );
    const buffer_size = sceneBufferSizes.buffer_size;
    const path_tag_padded = sceneBufferSizes.path_tag_padded;

    const dataBuf = new ByteBuffer( sceneBufferSizes.buffer_size );

    // Path tag stream
    layout.path_tag_base = size_to_words( dataBuf.byteLength );
    dataBuf.pushByteBuffer( this.pathTagsBuf );
    // TODO: what if we... just error if there are open clips? Why are we padding the streams to make this work?
    for ( let i = 0; i < this.n_open_clips; i++ ) {
      dataBuf.pushU8( PathTag.PATH );
    }
    dataBuf.byteLength = path_tag_padded;

    // Path data stream
    layout.path_data_base = size_to_words( dataBuf.byteLength );
    dataBuf.pushByteBuffer( this.pathDataBuf );

    // Draw tag stream
    layout.draw_tag_base = size_to_words( dataBuf.byteLength );
    // Bin data follows draw info
    layout.bin_data_start = _.sum( this.drawTagsBuf.u32Array.map( DrawTag.info_size ) );
    dataBuf.pushByteBuffer( this.drawTagsBuf );
    for ( let i = 0; i < this.n_open_clips; i++ ) {
      dataBuf.pushU32( DrawTag.END_CLIP );
    }

    // Draw data stream
    layout.draw_data_base = size_to_words( dataBuf.byteLength );
    {
      const drawDataOffset = dataBuf.byteLength;
      dataBuf.pushByteBuffer( this.drawDataBuf );

      this.patches.forEach( patch => {
        const byteOffset = drawDataOffset + patch.draw_data_offset;
        let bytes;

        if ( patch.type === 'ramp' ) {
          bytes = u32_to_bytes( ( ( patch.id << 2 ) >>> 0 ) | patch.extend );
        }
        else if ( patch.type === 'image' ) {
          bytes = u32_to_bytes( ( patch.atlasSubImage.x << 16 ) >>> 0 | patch.atlasSubImage.y );
          // TODO: assume the image fit (if not, we'll need to do something else)
        }
        else {
          throw new Error( 'unknown patch type' );
        }

        // Patch data directly into our full output
        dataBuf.fullU8Array.set( bytes, byteOffset );
      } );
    }

    // Transform stream
    // TODO: Float32Array instead of Affine?
    layout.transform_base = size_to_words( dataBuf.byteLength );
    for ( let i = 0; i < this.transforms.length; i++ ) {
      const transform = this.transforms[ i ];
      dataBuf.pushF32( transform.a00 );
      dataBuf.pushF32( transform.a10 );
      dataBuf.pushF32( transform.a01 );
      dataBuf.pushF32( transform.a11 );
      dataBuf.pushF32( transform.a02 );
      dataBuf.pushF32( transform.a12 );
    }

    // Linewidth stream
    layout.linewidth_base = size_to_words( dataBuf.byteLength );
    for ( let i = 0; i < this.linewidths.length; i++ ) {
      dataBuf.pushF32( this.linewidths[ i ] );
    }

    layout.n_draw_objects = layout.n_paths;

    if ( dataBuf.byteLength !== buffer_size ) {
      throw new Error( 'buffer size mismatch' );
    }

    return new RenderInfo( {
      packed: dataBuf.u8Array,
      layout: layout
    } );
  }
}
