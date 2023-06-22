use wasm_bindgen::prelude::*;
use swash::{FontRef, FontDataRef, shape::{ShapeContext, Direction}, text::Script, scale::ScaleContext, zeno::Verb};
use std::cell::RefCell;

// Install rust
// Ensure we have wasm32 target with `rustup target add wasm32-unknown-unknown`
// Install wasm-pack
// Build with: `wasm-pack build --target web swash-tests`

static mut FONT_PTR: u64 = 0;
static mut FONT_DATA: [u8; 23278008] = [0; 23278008]; // TODO: don't hardcode font file size!!

#[wasm_bindgen]
pub fn load_font_data(font_data: js_sys::Uint8Array) {
    unsafe {
        font_data.raw_copy_to_ptr( FONT_DATA.as_mut_ptr() );
    }

    unsafe {
        let font_data = FontDataRef::new(&FONT_DATA).expect( "Font load issues" );

        if let Some(font) = font_data.get(0) {
            FONT_PTR = Box::into_raw(Box::new(RefCell::new(font))) as u64;
        }
    }
}

fn with_font_data<F, R>(f: F) -> R
where
    F: FnOnce(&FontRef) -> R,
{
    unsafe {
        let me = FONT_PTR as *mut RefCell<FontRef>;
        return f( &(*me).borrow() );
    }
}

// TODO: use resources in https://rustwasm.github.io/docs/book/reference/code-size.html and
// TODO: https://github.com/rustwasm/wasm-snip in particular to reduce the size of all of this

#[wasm_bindgen]
pub fn shape_text(text: &str, is_ltr: bool) -> String {
    with_font_data(|font|{
        let mut context = ShapeContext::new();

        // TODO: cache shapers, it's just difficult with the lifetime stuff
        let mut shaper_builder = context.builder(*font);
        shaper_builder = shaper_builder.script(Script::Latin);
        shaper_builder = shaper_builder.direction(if is_ltr { Direction::LeftToRight } else { Direction::RightToLeft });

        let mut shaper = shaper_builder.build();

        // TODO: embolden 0.25
        // TODO: skew 14 deg

        shaper.add_str(text);

        let mut result = String::new();
        result.push_str("[");
        let mut is_first = true;
        shaper.shape_with(|glyph_cluster| {
            for glyph in glyph_cluster.glyphs {
                if !is_first {
                    result.push_str( "," );
                }
                is_first = false;
                result.push_str( &format!( "{{id:{},x:{},y:{},adv:{}}}", glyph.id, glyph.x, glyph.y, glyph.advance ) );
            }
        });
        result.push_str("]");
        result
    })
}

#[wasm_bindgen]
pub fn get_glyph(id: u16, embolden_x: f32, embolden_y: f32) -> String {
    with_font_data(|font|{
        let mut context = ScaleContext::new();
        let mut scaler = context.builder(*font)
            .hint(false)
            .build();

        let mut result = String::new();
        if let Some(mut outline) = scaler.scale_outline(id) {
            if embolden_x != 0.0 || embolden_y != 0.0 {
                outline.embolden(embolden_x, embolden_y);
            }
            let verbs = outline.verbs();
            let points = outline.points();

            let mut point_index = 0;
            for verb in verbs {
                match verb {
                    Verb::MoveTo => {
                        let p = points[point_index];
                        point_index += 1;
                        result.push_str( &format!( "M {} {} ", p.x, p.y ) );
                    }
                    Verb::LineTo => {
                        let p = points[point_index];
                        point_index += 1;
                        result.push_str( &format!( "L {} {} ", p.x, p.y ) );
                    }
                    Verb::QuadTo => {
                        let p1 = points[point_index];
                        let p2 = points[point_index + 1];
                        point_index += 2;
                        result.push_str( &format!( "Q {} {} {} {} ", p1.x, p1.y, p2.x, p2.y ) );
                    }
                    Verb::CurveTo => {
                        let p1 = points[point_index];
                        let p2 = points[point_index + 1];
                        let p3 = points[point_index + 2];
                        point_index += 3;
                        result.push_str( &format!( "C {} {} {} {} {} {}", p1.x, p1.y, p2.x, p2.y, p3.x, p3.y ) );
                    }
                    Verb::Close => {
                        result.push_str( &format!( "Z " ) );
                    }
                }
            }
        }
        result
    })
}

#[wasm_bindgen(start)]
fn run() {

}