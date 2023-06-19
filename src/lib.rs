use wasm_bindgen::prelude::*;
use vello_encoding::{Encoding, Resolver, RenderConfig, DrawColor, PathTag, DrawLinearGradient, DrawRadialGradient, Transform, Layout, ConfigUniform, BufferSize, WorkgroupCounts, WorkgroupSize, BufferSizes};
use bytemuck;
use peniko::{kurbo, Extend, ColorStop, BlendMode};

// Install rust
// Ensure we have wasm32 target with `rustup target add wasm32-unknown-unknown`
// Install wasm-pack
// Build with: `wasm-pack build --target web`

// TODO: We're including a ton of font infrastructure here, perhaps we can ditch a lot of dependencies (fello? perhaps even kurbo but that seems useful)

// Includes a ton of glue code to make it work with wasm_bindgen, I'm sure there's a better way to do this

// TODO: improve all enumerations (better JS interface, don't duplicate stuff here)
// TODO: can you wasm_bindgen existing types?
#[wasm_bindgen]
pub enum VelloMix {
    /// Default attribute which specifies no blending. The blending formula simply selects the source color.
    Normal = 0,
    /// Source color is multiplied by the destination color and replaces the destination.
    Multiply = 1,
    /// Multiplies the complements of the backdrop and source color values, then complements the result.
    Screen = 2,
    /// Multiplies or screens the colors, depending on the backdrop color value.
    Overlay = 3,
    /// Selects the darker of the backdrop and source colors.
    Darken = 4,
    /// Selects the lighter of the backdrop and source colors.
    Lighten = 5,
    /// Brightens the backdrop color to reflect the source color. Painting with black produces no
    /// change.
    ColorDodge = 6,
    /// Darkens the backdrop color to reflect the source color. Painting with white produces no
    /// change.
    ColorBurn = 7,
    /// Multiplies or screens the colors, depending on the source color value. The effect is
    /// similar to shining a harsh spotlight on the backdrop.
    HardLight = 8,
    /// Darkens or lightens the colors, depending on the source color value. The effect is similar
    /// to shining a diffused spotlight on the backdrop.
    SoftLight = 9,
    /// Subtracts the darker of the two constituent colors from the lighter color.
    Difference = 10,
    /// Produces an effect similar to that of the Difference mode but lower in contrast. Painting
    /// with white inverts the backdrop color; painting with black produces no change.
    Exclusion = 11,
    /// Creates a color with the hue of the source color and the saturation and luminosity of the
    /// backdrop color.
    Hue = 12,
    /// Creates a color with the saturation of the source color and the hue and luminosity of the
    /// backdrop color. Painting with this mode in an area of the backdrop that is a pure gray
    /// (no saturation) produces no change.
    Saturation = 13,
    /// Creates a color with the hue and saturation of the source color and the luminosity of the
    /// backdrop color. This preserves the gray levels of the backdrop and is useful for coloring
    /// monochrome images or tinting color images.
    Color = 14,
    /// Creates a color with the luminosity of the source color and the hue and saturation of the
    /// backdrop color. This produces an inverse effect to that of the Color mode.
    Luminosity = 15,
    /// Clip is the same as normal, but the latter always creates an isolated blend group and the
    /// former can optimize that out.
    Clip = 128,
}

fn vello_mix_to_mix(mix: VelloMix) -> peniko::Mix {
    // TODO: can we avoid duplicating this?
    match mix {
        VelloMix::Normal => peniko::Mix::Normal,
        VelloMix::Multiply => peniko::Mix::Multiply,
        VelloMix::Screen => peniko::Mix::Screen,
        VelloMix::Overlay => peniko::Mix::Overlay,
        VelloMix::Darken => peniko::Mix::Darken,
        VelloMix::Lighten => peniko::Mix::Lighten,
        VelloMix::ColorDodge => peniko::Mix::ColorDodge,
        VelloMix::ColorBurn => peniko::Mix::ColorBurn,
        VelloMix::HardLight => peniko::Mix::HardLight,
        VelloMix::SoftLight => peniko::Mix::SoftLight,
        VelloMix::Difference => peniko::Mix::Difference,
        VelloMix::Exclusion => peniko::Mix::Exclusion,
        VelloMix::Hue => peniko::Mix::Hue,
        VelloMix::Saturation => peniko::Mix::Saturation,
        VelloMix::Color => peniko::Mix::Color,
        VelloMix::Luminosity => peniko::Mix::Luminosity,
        VelloMix::Clip => peniko::Mix::Clip,
    }
}

#[wasm_bindgen]
pub enum VelloCompose {
    /// No regions are enabled.
    Clear = 0,
    /// Only the source will be present.
    Copy = 1,
    /// Only the destination will be present.
    Dest = 2,
    /// The source is placed over the destination.
    SrcOver = 3,
    /// The destination is placed over the source.
    DestOver = 4,
    /// The parts of the source that overlap with the destination are placed.
    SrcIn = 5,
    /// The parts of the destination that overlap with the source are placed.
    DestIn = 6,
    /// The parts of the source that fall outside of the destination are placed.
    SrcOut = 7,
    /// The parts of the destination that fall outside of the source are placed.
    DestOut = 8,
    /// The parts of the source which overlap the destination replace the destination. The
    /// destination is placed everywhere else.
    SrcAtop = 9,
    /// The parts of the destination which overlaps the source replace the source. The source is
    /// placed everywhere else.
    DestAtop = 10,
    /// The non-overlapping regions of source and destination are combined.
    Xor = 11,
    /// The sum of the source image and destination image is displayed.
    Plus = 12,
    /// Allows two elements to cross fade by changing their opacities from 0 to 1 on one
    /// element and 1 to 0 on the other element.
    PlusLighter = 13,
}

fn vello_compose_to_compose(compose: VelloCompose) -> peniko::Compose {
    // TODO: can we avoid duplicating this?
    match compose {
        VelloCompose::Clear => peniko::Compose::Clear,
        VelloCompose::Copy => peniko::Compose::Copy,
        VelloCompose::Dest => peniko::Compose::Dest,
        VelloCompose::SrcOver => peniko::Compose::SrcOver,
        VelloCompose::DestOver => peniko::Compose::DestOver,
        VelloCompose::SrcIn => peniko::Compose::SrcIn,
        VelloCompose::DestIn => peniko::Compose::DestIn,
        VelloCompose::SrcOut => peniko::Compose::SrcOut,
        VelloCompose::DestOut => peniko::Compose::DestOut,
        VelloCompose::SrcAtop => peniko::Compose::SrcAtop,
        VelloCompose::DestAtop => peniko::Compose::DestAtop,
        VelloCompose::Xor => peniko::Compose::Xor,
        VelloCompose::Plus => peniko::Compose::Plus,
        VelloCompose::PlusLighter => peniko::Compose::PlusLighter,
    }
}

/// Defines the layer composition function for a blend operation.
#[derive(Copy, Clone, PartialEq, Eq, Debug)]
#[repr(C)]
pub enum Compose {
    /// No regions are enabled.
    Clear = 0,
    /// Only the source will be present.
    Copy = 1,
    /// Only the destination will be present.
    Dest = 2,
    /// The source is placed over the destination.
    SrcOver = 3,
    /// The destination is placed over the source.
    DestOver = 4,
    /// The parts of the source that overlap with the destination are placed.
    SrcIn = 5,
    /// The parts of the destination that overlap with the source are placed.
    DestIn = 6,
    /// The parts of the source that fall outside of the destination are placed.
    SrcOut = 7,
    /// The parts of the destination that fall outside of the source are placed.
    DestOut = 8,
    /// The parts of the source which overlap the destination replace the destination. The
    /// destination is placed everywhere else.
    SrcAtop = 9,
    /// The parts of the destination which overlaps the source replace the source. The source is
    /// placed everywhere else.
    DestAtop = 10,
    /// The non-overlapping regions of source and destination are combined.
    Xor = 11,
    /// The sum of the source image and destination image is displayed.
    Plus = 12,
    /// Allows two elements to cross fade by changing their opacities from 0 to 1 on one
    /// element and 1 to 0 on the other element.
    PlusLighter = 13,
}

// TODO: Find a way to wasm_bindgen that doesn't require duplicating structs
#[wasm_bindgen]
#[derive(Copy, Clone, Debug, Default)]
pub struct VelloLayout {
    pub n_draw_objects: u32,
    pub n_paths: u32,
    pub n_clips: u32,
    pub bin_data_start: u32,
    pub path_tag_base: u32,
    pub path_data_base: u32,
    pub draw_tag_base: u32,
    pub draw_data_base: u32,
    pub transform_base: u32,
    pub linewidth_base: u32,
}

impl VelloLayout {
    // convert Layout to VelloLayout
    pub fn from_layout(layout: Layout) -> VelloLayout {
        VelloLayout {
            n_draw_objects: layout.n_draw_objects,
            n_paths: layout.n_paths,
            n_clips: layout.n_clips,
            bin_data_start: layout.bin_data_start,
            path_tag_base: layout.path_tag_base,
            path_data_base: layout.path_data_base,
            draw_tag_base: layout.draw_tag_base,
            draw_data_base: layout.draw_data_base,
            transform_base: layout.transform_base,
            linewidth_base: layout.linewidth_base,
        }
    }
}

// TODO: Find a way to wasm_bindgen that doesn't require duplicating structs
#[wasm_bindgen]
#[derive(Clone, Debug, Default)]
pub struct VelloConfigUniform {
    pub width_in_tiles: u32,
    pub height_in_tiles: u32,
    pub target_width: u32,
    pub target_height: u32,
    pub base_color: u32,
    pub layout: VelloLayout,
    pub binning_size: u32,
    pub tiles_size: u32,
    pub segments_size: u32,
    pub ptcl_size: u32,
}

impl VelloConfigUniform {
    // convert ConfigUniform to VelloConfigUniform
    pub fn from_config_uniform(config_uniform: ConfigUniform) -> VelloConfigUniform {
        VelloConfigUniform {
            width_in_tiles: config_uniform.width_in_tiles,
            height_in_tiles: config_uniform.height_in_tiles,
            target_width: config_uniform.target_width,
            target_height: config_uniform.target_height,
            base_color: config_uniform.base_color,
            layout: VelloLayout::from_layout( config_uniform.layout ),
            binning_size: config_uniform.binning_size,
            tiles_size: config_uniform.tiles_size,
            segments_size: config_uniform.segments_size,
            ptcl_size: config_uniform.ptcl_size,
        }
    }
}

// TODO: Find a way to wasm_bindgen that doesn't require duplicating structs
#[wasm_bindgen]
#[derive(Copy, Clone, Debug, Default)]
pub struct VelloWorkgroupSize {
    pub x: u32,
    pub y: u32,
    pub z: u32,
}

impl VelloWorkgroupSize {
    pub fn from_tuple( size: WorkgroupSize ) -> VelloWorkgroupSize {
        VelloWorkgroupSize {
            x: size.0,
            y: size.1,
            z: size.2,
        }
    }
}

// TODO: Find a way to wasm_bindgen that doesn't require duplicating structs
#[wasm_bindgen]
#[derive(Debug, Default)]
pub struct VelloWorkgroupCounts {
    pub use_large_path_scan: bool,
    pub path_reduce: VelloWorkgroupSize,
    pub path_reduce2: VelloWorkgroupSize,
    pub path_scan1: VelloWorkgroupSize,
    pub path_scan: VelloWorkgroupSize,
    pub bbox_clear: VelloWorkgroupSize,
    pub path_seg: VelloWorkgroupSize,
    pub draw_reduce: VelloWorkgroupSize,
    pub draw_leaf: VelloWorkgroupSize,
    pub clip_reduce: VelloWorkgroupSize,
    pub clip_leaf: VelloWorkgroupSize,
    pub binning: VelloWorkgroupSize,
    pub tile_alloc: VelloWorkgroupSize,
    pub path_coarse: VelloWorkgroupSize,
    pub backdrop: VelloWorkgroupSize,
    pub coarse: VelloWorkgroupSize,
    pub fine: VelloWorkgroupSize,
}

static WORKGROUP_COUNTS_COUNT: core::sync::atomic::AtomicU64 = core::sync::atomic::AtomicU64::new(0);

impl Drop for VelloWorkgroupCounts {
    fn drop(&mut self) {
        let count = WORKGROUP_COUNTS_COUNT.fetch_sub(1, core::sync::atomic::Ordering::Relaxed);
        // web_sys::console::log_1( &JsValue::from( format!( "drop VelloWorkgroupCounts {count}" ) ) );
    }
}

impl VelloWorkgroupCounts {
    // convert WorkgroupCounts to VelloWorkgroupCounts
    pub fn from_config_uniform(workgroup_counts: WorkgroupCounts) -> VelloWorkgroupCounts {
        let count = WORKGROUP_COUNTS_COUNT.fetch_add(1, core::sync::atomic::Ordering::Relaxed);
        // web_sys::console::log_1( &JsValue::from( format!( "new VelloWorkgroupCounts {count}" ) ) );
        VelloWorkgroupCounts {
            use_large_path_scan: workgroup_counts.use_large_path_scan,
            path_reduce: VelloWorkgroupSize::from_tuple( workgroup_counts.path_reduce ),
            path_reduce2: VelloWorkgroupSize::from_tuple( workgroup_counts.path_reduce2 ),
            path_scan1: VelloWorkgroupSize::from_tuple( workgroup_counts.path_scan1 ),
            path_scan: VelloWorkgroupSize::from_tuple( workgroup_counts.path_scan ),
            bbox_clear: VelloWorkgroupSize::from_tuple( workgroup_counts.bbox_clear ),
            path_seg: VelloWorkgroupSize::from_tuple( workgroup_counts.path_seg ),
            draw_reduce: VelloWorkgroupSize::from_tuple( workgroup_counts.draw_reduce ),
            draw_leaf: VelloWorkgroupSize::from_tuple( workgroup_counts.draw_leaf ),
            clip_reduce: VelloWorkgroupSize::from_tuple( workgroup_counts.clip_reduce ),
            clip_leaf: VelloWorkgroupSize::from_tuple( workgroup_counts.clip_leaf ),
            binning: VelloWorkgroupSize::from_tuple( workgroup_counts.binning ),
            tile_alloc: VelloWorkgroupSize::from_tuple( workgroup_counts.tile_alloc ),
            path_coarse: VelloWorkgroupSize::from_tuple( workgroup_counts.path_coarse ),
            backdrop: VelloWorkgroupSize::from_tuple( workgroup_counts.backdrop ),
            coarse: VelloWorkgroupSize::from_tuple( workgroup_counts.coarse ),
            fine: VelloWorkgroupSize::from_tuple( workgroup_counts.fine ),
        }
    }
}

#[wasm_bindgen]
#[derive(Copy, Clone, Debug, Default)]
pub struct VelloBufferSize {
    pub size_in_bytes: u32
}

impl VelloBufferSize {
    pub fn from_buffer_size<T>(buffer_size: BufferSize<T>) -> VelloBufferSize {
        VelloBufferSize {
            // len: buffer_size.len(),
            size_in_bytes: buffer_size.size_in_bytes(),
        }
    }
}

// TODO: Find a way to wasm_bindgen that doesn't require duplicating structs
#[wasm_bindgen]
#[derive(Copy, Clone, Debug, Default)]
pub struct VelloBufferSizes {
    // Known size buffers
    pub path_reduced: VelloBufferSize,
    pub path_reduced2: VelloBufferSize,
    pub path_reduced_scan: VelloBufferSize,
    pub path_monoids: VelloBufferSize,
    pub path_bboxes: VelloBufferSize,
    pub cubics: VelloBufferSize,
    pub draw_reduced: VelloBufferSize,
    pub draw_monoids: VelloBufferSize,
    pub info: VelloBufferSize,
    pub clip_inps: VelloBufferSize,
    pub clip_els: VelloBufferSize,
    pub clip_bics: VelloBufferSize,
    pub clip_bboxes: VelloBufferSize,
    pub draw_bboxes: VelloBufferSize,
    pub bump_alloc: VelloBufferSize,
    pub bin_headers: VelloBufferSize,
    pub paths: VelloBufferSize,
    pub bin_data: VelloBufferSize,
    pub tiles: VelloBufferSize,
    pub segments: VelloBufferSize,
    pub ptcl: VelloBufferSize,
}

impl VelloBufferSizes {
    pub fn from_buffer_sizes(buffer_sizes: BufferSizes) -> VelloBufferSizes {
        VelloBufferSizes {
            path_reduced: VelloBufferSize::from_buffer_size(buffer_sizes.path_reduced),
            path_reduced2: VelloBufferSize::from_buffer_size(buffer_sizes.path_reduced2),
            path_reduced_scan: VelloBufferSize::from_buffer_size(buffer_sizes.path_reduced_scan),
            path_monoids: VelloBufferSize::from_buffer_size(buffer_sizes.path_monoids),
            path_bboxes: VelloBufferSize::from_buffer_size(buffer_sizes.path_bboxes),
            cubics: VelloBufferSize::from_buffer_size(buffer_sizes.cubics),
            draw_reduced: VelloBufferSize::from_buffer_size(buffer_sizes.draw_reduced),
            draw_monoids: VelloBufferSize::from_buffer_size(buffer_sizes.draw_monoids),
            info: VelloBufferSize::from_buffer_size(buffer_sizes.info),
            clip_inps: VelloBufferSize::from_buffer_size(buffer_sizes.clip_inps),
            clip_els: VelloBufferSize::from_buffer_size(buffer_sizes.clip_els),
            clip_bics: VelloBufferSize::from_buffer_size(buffer_sizes.clip_bics),
            clip_bboxes: VelloBufferSize::from_buffer_size(buffer_sizes.clip_bboxes),
            draw_bboxes: VelloBufferSize::from_buffer_size(buffer_sizes.draw_bboxes),
            bump_alloc: VelloBufferSize::from_buffer_size(buffer_sizes.bump_alloc),
            bin_headers: VelloBufferSize::from_buffer_size(buffer_sizes.bin_headers),
            paths: VelloBufferSize::from_buffer_size(buffer_sizes.paths),
            bin_data: VelloBufferSize::from_buffer_size(buffer_sizes.bin_data),
            tiles: VelloBufferSize::from_buffer_size(buffer_sizes.tiles),
            segments: VelloBufferSize::from_buffer_size(buffer_sizes.segments),
            ptcl: VelloBufferSize::from_buffer_size(buffer_sizes.ptcl),
        }
    }
}

// Contains all of the information we'll need to export to JS for rendering
#[wasm_bindgen]
pub struct RenderInfo {
    scene: Vec<u8>,
    layout: Layout,
    render_config: RenderConfig,
    ramps: Vec<u8>,
    pub ramps_width: u32,
    pub ramps_height: u32,

    // Packed as triples of (image ID, x, y)
    images: Vec<u64>,

    pub images_width: u32,
    pub images_height: u32,
}

#[wasm_bindgen]
impl RenderInfo {
    pub fn scene(&self) -> js_sys::Uint8Array {
        js_sys::Uint8Array::from(&self.scene[..])
    }
    pub fn ramps(&self) -> js_sys::Uint8Array { js_sys::Uint8Array::from(&self.ramps[..]) }
    pub fn images(&self) -> js_sys::BigUint64Array { js_sys::BigUint64Array::from(&self.images[..]) }
    pub fn layout(&self) -> VelloLayout {
        VelloLayout::from_layout( self.layout )
    }
    pub fn config_uniform(&self) -> VelloConfigUniform {
        VelloConfigUniform::from_config_uniform(self.render_config.gpu)
    }
    pub fn workgroup_counts(&self) -> VelloWorkgroupCounts {
        VelloWorkgroupCounts::from_config_uniform(self.render_config.workgroup_counts)
    }
    pub fn buffer_sizes(&self) -> VelloBufferSizes {
        VelloBufferSizes::from_buffer_sizes(self.render_config.buffer_sizes)
    }
    pub fn config_bytes(&self) -> js_sys::Uint8Array {
        js_sys::Uint8Array::from(bytemuck::bytes_of(&self.render_config.gpu))
    }
}

#[wasm_bindgen]
pub struct VelloImage {
    image: peniko::Image
}

#[wasm_bindgen]
impl VelloImage {
    pub fn id(&self) -> u64 {
        self.image.data.id()
    }
}

// Represents an encoding of a scene/fragment, providing a render() method
#[wasm_bindgen]
pub struct VelloEncoding {
    encoding: Encoding
}

static VELLO_ENCODING_COUNTER: core::sync::atomic::AtomicU64 = core::sync::atomic::AtomicU64::new(0);

impl Drop for VelloEncoding {
    fn drop(&mut self) {
        let count = VELLO_ENCODING_COUNTER.fetch_sub(1, core::sync::atomic::Ordering::Relaxed);
        // web_sys::console::log_1( &JsValue::from( format!( "drop VelloEncoding {count}" ) ) );
    }
}

#[wasm_bindgen]
impl VelloEncoding {
    #[wasm_bindgen(constructor)]
    pub fn new() -> VelloEncoding {
        let count = VELLO_ENCODING_COUNTER.fetch_add(1, core::sync::atomic::Ordering::Relaxed);
        // web_sys::console::log_1( &JsValue::from( format!( "new VelloEncoding {count}" ) ) );

        VelloEncoding {
            encoding: Encoding::new()
        }
    }

    pub fn new_scene() -> VelloEncoding {
        let mut encoding = Encoding::new();
        encoding.reset( false );

        VelloEncoding {
            encoding
        }
    }

    // Creates an image stub (no data) with the given dimensions
    pub fn new_image(width: u32, height: u32) -> VelloImage {
        // web_sys::console::log_1( &JsValue::from( format!( "new_image {width} {height}" ) ) );
        VelloImage {
            image: peniko::Image::new(peniko::Blob::new( std::sync::Arc::new( Vec::new()) ),peniko::Format::Rgba8, width, height)
        }
    }

    pub fn append(&mut self, other: &VelloEncoding) {
        self.encoding.append( &other.encoding, &None );
    }

    pub fn append_with_transform(&mut self, other: &VelloEncoding, a00: f32, a10: f32, a01: f32, a11: f32, a20: f32, a21: f32) {
        self.encoding.append( &other.encoding, &Some( Transform {
            matrix: [ a00, a10, a01, a11 ],
            translation: [ a20, a21 ]
        } ) );
    }

    pub fn reset(&mut self, is_fragment: bool) {
        self.encoding.reset( is_fragment );
    }

    pub fn is_empty(&self) -> bool {
        self.encoding.is_empty()
    }

    pub fn linewidth(&mut self, linewidth: f32) {
        self.encoding.encode_linewidth( linewidth );
    }

    pub fn matrix(&mut self, a00: f32, a10: f32, a01: f32, a11: f32, a20: f32, a21: f32) {
        self.encoding.encode_transform( Transform {
            matrix: [ a00, a10, a01, a11 ],
            translation: [ a20, a21 ]
        } );
    }

    pub fn svg_path(&mut self, is_fill: bool, insert_path_marker: bool, path: String ) -> bool {
        let path = kurbo::BezPath::from_svg( &path.as_str() ).unwrap();

        let mut encoder = self.encoding.encode_path(is_fill);
        encoder.shape(&path);
        encoder.finish(insert_path_marker) != 0
    }

    pub fn insert_path_marker(&mut self) {
        self.encoding.path_tags.push(PathTag::PATH);
        self.encoding.n_paths += 1;
    }

    // wasm_bindgen REALLY doesn't like lifetimes, I fought a battle to create a Path wrapper struct
    // for PathEncoding<'a>, however I couldn't yet find a way to satisfy wasm_bindgen's
    // requirement to have no lifetime/type parameters AND rust's borrow checker. I'm sure there's a
    // way. For now, we'll use an API that creates more garbage on the JS side, though only has the
    // overhead (hopefully) of one method call.
    //
    // Path data is a JSON string of an array of path commands, each of which is an object with a
    // type and named coordinates
    // e.g. [
    //   { type: 'MoveTo', x: -100, y: -100 },
    //   { type: 'LineTo', x: 100, y: -100 },
    //   { type: 'LineTo', x: 100, y: 100 },
    //   { type: 'LineTo', x: -100, y: 100 },
    //   { type: 'LineTo', x: -100, y: -100 }
    // ]
    pub fn json_path(&mut self, is_fill: bool, insert_path_marker: bool, json: String ) -> bool {
        // web_sys::console::log_1( &json.as_str().into() );

        let mut path_encoder = self.encoding.encode_path( is_fill );

        use serde_json::{Value, self};

        let v: Value = serde_json::from_str(&json.as_str()).expect( "JSON parse fail" );

        match v {
            Value::Array( values ) => {
                // web_sys::console::log_1( &JsValue::from( values.len() ) );

                for value in values {
                    match value {
                        Value::Object( map ) => {
                            let ty = map.get( "type" ).unwrap();

                            match ty.as_str().unwrap() {
                                "MoveTo" => {
                                    let x = map.get( "x" ).unwrap().as_f64().unwrap() as f32;
                                    let y = map.get( "y" ).unwrap().as_f64().unwrap() as f32;

                                    // web_sys::console::log_3( &"MoveTo".into(), &x.into(), &y.into() );

                                    path_encoder.move_to( x, y );
                                }
                                "LineTo" => {
                                    let x = map.get( "x" ).unwrap().as_f64().unwrap() as f32;
                                    let y = map.get( "y" ).unwrap().as_f64().unwrap() as f32;

                                    // web_sys::console::log_3( &"LineTo".into(), &x.into(), &y.into() );

                                    path_encoder.line_to( x, y );
                                }
                                "QuadTo" => {
                                    let x1 = map.get( "x1" ).unwrap().as_f64().unwrap() as f32;
                                    let y1 = map.get( "y1" ).unwrap().as_f64().unwrap() as f32;
                                    let x2 = map.get( "x2" ).unwrap().as_f64().unwrap() as f32;
                                    let y2 = map.get( "y2" ).unwrap().as_f64().unwrap() as f32;

                                    // web_sys::console::log_5( &"QuadTo".into(), &x1.into(), &y1.into(), &x2.into(), &y2.into() );

                                    path_encoder.quad_to( x1, y1, x2, y2 );
                                }
                                "CubicTo" => {
                                    let x1 = map.get( "x1" ).unwrap().as_f64().unwrap() as f32;
                                    let y1 = map.get( "y1" ).unwrap().as_f64().unwrap() as f32;
                                    let x2 = map.get( "x2" ).unwrap().as_f64().unwrap() as f32;
                                    let y2 = map.get( "y2" ).unwrap().as_f64().unwrap() as f32;
                                    let x3 = map.get( "x3" ).unwrap().as_f64().unwrap() as f32;
                                    let y3 = map.get( "y3" ).unwrap().as_f64().unwrap() as f32;

                                    // web_sys::console::log_7( &"CubicTo".into(), &x1.into(), &y1.into(), &x2.into(), &y2.into(), &x3.into(), &y3.into() );

                                    path_encoder.cubic_to( x1, y1, x2, y2, x3, y3 );
                                },
                                "Close" => {
                                    // web_sys::console::log_1( &"Close".into() );

                                    path_encoder.close();
                                },
                                _ => panic!("Unknown type")
                            }
                        },
                        _ => panic!("Non-object in array")
                    }
                }
            },
            _ => panic!("Non-array")
        }

        path_encoder.finish( insert_path_marker ) != 0
    }

    pub fn color(&mut self, rgba: u32) {
        self.encoding.encode_color( rgba8_to_draw_color( rgba ) );
    }

    pub fn linear_gradient(&mut self, x0: f32, y0: f32, x1: f32, y1: f32, alpha: f32, extend: u8, offsets: js_sys::Float32Array, colors: js_sys::Uint32Array ) {
        // TODO: factor out offsets/colors -> impl Iterator<Item = ColorStop>
        // TODO: ran into to_vec() issues, need to learn more Rust
        self.encoding.encode_linear_gradient( DrawLinearGradient {
            index: 0,
            p0: [ x0, y0 ],
            p1: [ x1, y1 ]
        }, offsets.to_vec().iter().zip( colors.to_vec().iter() ).map(|(offset, color)| {
            ColorStop {
                offset: *offset,
                color: rgba8_to_color(*color)
            }
        }), alpha, match extend {
            0 => Extend::Pad,
            1 => Extend::Repeat,
            2 => Extend::Reflect,
            _ => panic!("Unknown extend mode")
        } );
    }

    // TODO: change the parameter order here. it's confusing, and matches nothing
    pub fn radial_gradient(&mut self, x0: f32, y0: f32, r0: f32, x1: f32, y1: f32, r1: f32, alpha: f32, extend: u8, offsets: js_sys::Float32Array, colors: js_sys::Uint32Array ) {
        self.encoding.encode_radial_gradient( DrawRadialGradient {
            index: 0,
            p0: [ x0, y0 ],
            p1: [ x1, y1 ],
            r0,
            r1
        }, offsets.to_vec().iter().zip( colors.to_vec().iter() ).map(|(offset, color)| {
            ColorStop {
                offset: *offset,
                color: rgba8_to_color(*color)
            }
        }), alpha, match extend {
            0 => Extend::Pad,
            1 => Extend::Repeat,
            2 => Extend::Reflect,
            _ => panic!("Unknown extend mode")
        } );
    }

    // For a layer push: matrix, linewidth(-1), shape, begin_clip
    pub fn begin_clip(&mut self, mix: VelloMix, compose: VelloCompose, alpha: f32) {
        self.encoding.encode_begin_clip( BlendMode {
            mix: vello_mix_to_mix(mix),
            compose: vello_compose_to_compose(compose)
        }, alpha );
    }

    pub fn end_clip(&mut self) {
        self.encoding.encode_end_clip();
    }

    // TODO: since we're manually free'ing VelloImage, are we going to blow away the encoding ImageCache?
    // TODO: probably need to free encodings using any images BEFORE the images?
    // TODO: do a full check into this
    pub fn image(&mut self, image: &VelloImage, alpha: f32) {
        // web_sys::console::log_1( &JsValue::from( format!( "image {} {}", image.image.width, image.image.height ) ) );
        self.encoding.encode_image(&image.image, alpha);
    }

    pub fn finalize_scene(&mut self) {
        // Dummy path to make the previous paths show up (since we're a fill with no area, it shouldn't show up)
        self.svg_path(true, true, String::from("M 0 0 L 1 0"));
    }

    pub fn render(&mut self, width: u32, height: u32, base_color: u32) -> RenderInfo {
        let base_color = rgba8_to_color(base_color);

        let mut resolver = Resolver::new();
        let mut packed: Vec<u8> = vec![];

        let (layout, ramps, images) = resolver.resolve(&self.encoding, &mut packed);

        let cpu_config = RenderConfig::new(&layout, width, height, &base_color);

        layout.n_draw_objects;

        RenderInfo {
            scene: packed,
            layout,
            render_config: cpu_config,
            ramps: ( bytemuck::cast_slice(ramps.data) as &[u8] ).into(),
            ramps_width: ramps.width,
            ramps_height: ramps.height,
            images: images.images.iter().map(|entry| [entry.0.data.id(), entry.1 as u64, entry.2 as u64]).flatten().collect(),
            images_width: images.width,
            images_height: images.height
        }
    }

    pub fn print_debug(&mut self) {
        web_sys::console::log_1( &JsValue::from( format!( "path_tags\n{}", self.encoding.path_tags.iter().map(|x| x.0.to_string()).fold(String::new(), |a, b| a + ", " + b.as_str()) ) ) );
        web_sys::console::log_1( &JsValue::from( format!( "path_data\n{}", self.encoding.path_data.iter().map(|x| x.to_string()).fold(String::new(), |a, b| a + ", " + b.as_str()) ) ) );
        web_sys::console::log_1( &JsValue::from( format!( "draw_tags\n{}", self.encoding.draw_tags.iter().map(|x| x.0.to_string()).fold(String::new(), |a, b| a + ", " + b.as_str()) ) ) );
        web_sys::console::log_1( &JsValue::from( format!( "draw_data\n{}", self.encoding.draw_data.iter().map(|x| x.to_string()).fold(String::new(), |a, b| a + ", " + b.as_str()) ) ) );
        web_sys::console::log_1( &JsValue::from( format!( "transforms\n{}", self.encoding.transforms.iter().map(|x| format!( "_ a00:{} a10:{} a01:{} a11:{} a02:{} a12:{}_", x.matrix[0], x.matrix[1], x.matrix[2], x.matrix[3], x.translation[0], x.translation[1] ) ).fold(String::new(), |a, b| a + "\n" + b.as_str()) ) ) );
        web_sys::console::log_1( &JsValue::from( format!( "linewidths\n{}", self.encoding.linewidths.iter().map(|x| x.to_string()).fold(String::new(), |a, b| a + ", " + b.as_str()) ) ) );
        // TODO: resources
        web_sys::console::log_1( &JsValue::from( format!( "n_paths\n{}", self.encoding.n_paths ) ) );
        web_sys::console::log_1( &JsValue::from( format!( "n_path_segments\n{}", self.encoding.n_path_segments ) ) );
        web_sys::console::log_1( &JsValue::from( format!( "n_clips\n{}", self.encoding.n_clips ) ) );
        web_sys::console::log_1( &JsValue::from( format!( "n_open_clips\n{}", self.encoding.n_open_clips ) ) );
    }
}

pub fn rgba8_to_color(rgba: u32) -> peniko::Color {
    peniko::Color::rgba8(
        (rgba >> 24) as u8,
        (rgba >> 16) as u8,
        (rgba >> 8) as u8,
        rgba as u8
    )
}

pub fn rgba8_to_draw_color(rgba: u32) -> DrawColor {
    DrawColor {
        rgba: rgba8_to_color(rgba).to_premul_u32() // Need premultiplied
    }
}

#[wasm_bindgen(start)]
fn run() {

}
