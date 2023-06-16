use wasm_bindgen::prelude::*;
use vello_encoding::{Encoding, Resolver, RenderConfig, DrawColor, Transform, Layout, ConfigUniform, BufferSize, WorkgroupCounts, WorkgroupSize, BufferSizes};
use bytemuck;
use peniko::kurbo;

// Install rust
// Ensure we have wasm32 target with `rustup target add wasm32-unknown-unknown`
// Install wasm-pack
// Build with: `wasm-pack build --target web`

// TODO: We're including a ton of font infrastructure here, perhaps we can ditch a lot of dependencies (fello? perhaps even kurbo but that seems useful)

// Includes a ton of glue code to make it work with wasm_bindgen, I'm sure there's a better way to do this

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
#[derive(Copy, Clone, Debug, Default)]
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
#[derive(Copy, Clone, Debug, Default)]
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

impl VelloWorkgroupCounts {
    // convert WorkgroupCounts to VelloWorkgroupCounts
    pub fn from_config_uniform(workgroup_counts: WorkgroupCounts) -> VelloWorkgroupCounts {
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
    render_config: RenderConfig
}

#[wasm_bindgen]
impl RenderInfo {
    pub fn scene(&self) -> js_sys::Uint8Array {
        js_sys::Uint8Array::from(&self.scene[..])
    }
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

// Represents an encoding of a scene/fragment, providing a render() method
#[wasm_bindgen]
pub struct VelloEncoding {
    encoding: Encoding
}

#[wasm_bindgen]
impl VelloEncoding {
    #[wasm_bindgen(constructor)]
    pub fn new() -> VelloEncoding {
        VelloEncoding {
            encoding: Encoding::new()
        }
    }

    // TODO: appending, and perhaps initialization based on whether it is a fragment or not?
    // TODO: gradients and images
    // TODO: clipping

    pub fn reset(&mut self, is_fragment: bool) {
        self.encoding.reset( is_fragment );
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

    pub fn svg_path(&mut self, is_fill: bool, path: String ) {
        let path = kurbo::BezPath::from_svg( &path.as_str() ).unwrap();

        self.encoding.encode_shape(&path, is_fill);
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
    pub fn json_path(&mut self, is_fill: bool, insert_path_marker: bool, json: String ) {
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

        path_encoder.finish( insert_path_marker );
    }

    pub fn color(&mut self, rgba: u32) {
        self.encoding.encode_color( DrawColor {
            rgba: rgba8_to_color(rgba).to_premul_u32() // Need premultiplied
        } );
    }

    pub fn render(&mut self, width: u32, height: u32, base_color: u32) -> RenderInfo {
        let base_color = rgba8_to_color(base_color);

        let mut resolver = Resolver::new();
        let mut packed: Vec<u8> = vec![];

        // TODO: gradients/images
        let (layout, ramps, images) = resolver.resolve(&self.encoding, &mut packed);

        let cpu_config = RenderConfig::new(&layout, width, height, &base_color);

        layout.n_draw_objects;

        RenderInfo {
            scene: packed,
            layout,
            render_config: cpu_config
        }
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

#[wasm_bindgen(start)]
fn run() {

}
