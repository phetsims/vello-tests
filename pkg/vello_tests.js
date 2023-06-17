let wasm;

const heap = new Array(128).fill(undefined);

heap.push(undefined, null, true, false);

function getObject(idx) { return heap[idx]; }

let heap_next = heap.length;

function dropObject(idx) {
    if (idx < 132) return;
    heap[idx] = heap_next;
    heap_next = idx;
}

function takeObject(idx) {
    const ret = getObject(idx);
    dropObject(idx);
    return ret;
}

const cachedTextDecoder = (typeof TextDecoder !== 'undefined' ? new TextDecoder('utf-8', { ignoreBOM: true, fatal: true }) : { decode: () => { throw Error('TextDecoder not available') } } );

if (typeof TextDecoder !== 'undefined') { cachedTextDecoder.decode(); };

let cachedUint8Memory0 = null;

function getUint8Memory0() {
    if (cachedUint8Memory0 === null || cachedUint8Memory0.byteLength === 0) {
        cachedUint8Memory0 = new Uint8Array(wasm.memory.buffer);
    }
    return cachedUint8Memory0;
}

function getStringFromWasm0(ptr, len) {
    ptr = ptr >>> 0;
    return cachedTextDecoder.decode(getUint8Memory0().subarray(ptr, ptr + len));
}

function addHeapObject(obj) {
    if (heap_next === heap.length) heap.push(heap.length + 1);
    const idx = heap_next;
    heap_next = heap[idx];

    heap[idx] = obj;
    return idx;
}

function _assertClass(instance, klass) {
    if (!(instance instanceof klass)) {
        throw new Error(`expected instance of ${klass.name}`);
    }
    return instance.ptr;
}

let WASM_VECTOR_LEN = 0;

const cachedTextEncoder = (typeof TextEncoder !== 'undefined' ? new TextEncoder('utf-8') : { encode: () => { throw Error('TextEncoder not available') } } );

const encodeString = (typeof cachedTextEncoder.encodeInto === 'function'
    ? function (arg, view) {
    return cachedTextEncoder.encodeInto(arg, view);
}
    : function (arg, view) {
    const buf = cachedTextEncoder.encode(arg);
    view.set(buf);
    return {
        read: arg.length,
        written: buf.length
    };
});

function passStringToWasm0(arg, malloc, realloc) {

    if (realloc === undefined) {
        const buf = cachedTextEncoder.encode(arg);
        const ptr = malloc(buf.length, 1) >>> 0;
        getUint8Memory0().subarray(ptr, ptr + buf.length).set(buf);
        WASM_VECTOR_LEN = buf.length;
        return ptr;
    }

    let len = arg.length;
    let ptr = malloc(len, 1) >>> 0;

    const mem = getUint8Memory0();

    let offset = 0;

    for (; offset < len; offset++) {
        const code = arg.charCodeAt(offset);
        if (code > 0x7F) break;
        mem[ptr + offset] = code;
    }

    if (offset !== len) {
        if (offset !== 0) {
            arg = arg.slice(offset);
        }
        ptr = realloc(ptr, len, len = offset + arg.length * 3, 1) >>> 0;
        const view = getUint8Memory0().subarray(ptr + offset, ptr + len);
        const ret = encodeString(arg, view);

        offset += ret.written;
    }

    WASM_VECTOR_LEN = offset;
    return ptr;
}
/**
*/
export function run() {
    wasm.run();
}

/**
*/
export const VelloMix = Object.freeze({
/**
* Default attribute which specifies no blending. The blending formula simply selects the source color.
*/
Normal:0,"0":"Normal",
/**
* Source color is multiplied by the destination color and replaces the destination.
*/
Multiply:1,"1":"Multiply",
/**
* Multiplies the complements of the backdrop and source color values, then complements the result.
*/
Screen:2,"2":"Screen",
/**
* Multiplies or screens the colors, depending on the backdrop color value.
*/
Overlay:3,"3":"Overlay",
/**
* Selects the darker of the backdrop and source colors.
*/
Darken:4,"4":"Darken",
/**
* Selects the lighter of the backdrop and source colors.
*/
Lighten:5,"5":"Lighten",
/**
* Brightens the backdrop color to reflect the source color. Painting with black produces no
* change.
*/
ColorDodge:6,"6":"ColorDodge",
/**
* Darkens the backdrop color to reflect the source color. Painting with white produces no
* change.
*/
ColorBurn:7,"7":"ColorBurn",
/**
* Multiplies or screens the colors, depending on the source color value. The effect is
* similar to shining a harsh spotlight on the backdrop.
*/
HardLight:8,"8":"HardLight",
/**
* Darkens or lightens the colors, depending on the source color value. The effect is similar
* to shining a diffused spotlight on the backdrop.
*/
SoftLight:9,"9":"SoftLight",
/**
* Subtracts the darker of the two constituent colors from the lighter color.
*/
Difference:10,"10":"Difference",
/**
* Produces an effect similar to that of the Difference mode but lower in contrast. Painting
* with white inverts the backdrop color; painting with black produces no change.
*/
Exclusion:11,"11":"Exclusion",
/**
* Creates a color with the hue of the source color and the saturation and luminosity of the
* backdrop color.
*/
Hue:12,"12":"Hue",
/**
* Creates a color with the saturation of the source color and the hue and luminosity of the
* backdrop color. Painting with this mode in an area of the backdrop that is a pure gray
* (no saturation) produces no change.
*/
Saturation:13,"13":"Saturation",
/**
* Creates a color with the hue and saturation of the source color and the luminosity of the
* backdrop color. This preserves the gray levels of the backdrop and is useful for coloring
* monochrome images or tinting color images.
*/
Color:14,"14":"Color",
/**
* Creates a color with the luminosity of the source color and the hue and saturation of the
* backdrop color. This produces an inverse effect to that of the Color mode.
*/
Luminosity:15,"15":"Luminosity",
/**
* Clip is the same as normal, but the latter always creates an isolated blend group and the
* former can optimize that out.
*/
Clip:128,"128":"Clip", });
/**
*/
export const VelloCompose = Object.freeze({
/**
* No regions are enabled.
*/
Clear:0,"0":"Clear",
/**
* Only the source will be present.
*/
Copy:1,"1":"Copy",
/**
* Only the destination will be present.
*/
Dest:2,"2":"Dest",
/**
* The source is placed over the destination.
*/
SrcOver:3,"3":"SrcOver",
/**
* The destination is placed over the source.
*/
DestOver:4,"4":"DestOver",
/**
* The parts of the source that overlap with the destination are placed.
*/
SrcIn:5,"5":"SrcIn",
/**
* The parts of the destination that overlap with the source are placed.
*/
DestIn:6,"6":"DestIn",
/**
* The parts of the source that fall outside of the destination are placed.
*/
SrcOut:7,"7":"SrcOut",
/**
* The parts of the destination that fall outside of the source are placed.
*/
DestOut:8,"8":"DestOut",
/**
* The parts of the source which overlap the destination replace the destination. The
* destination is placed everywhere else.
*/
SrcAtop:9,"9":"SrcAtop",
/**
* The parts of the destination which overlaps the source replace the source. The source is
* placed everywhere else.
*/
DestAtop:10,"10":"DestAtop",
/**
* The non-overlapping regions of source and destination are combined.
*/
Xor:11,"11":"Xor",
/**
* The sum of the source image and destination image is displayed.
*/
Plus:12,"12":"Plus",
/**
* Allows two elements to cross fade by changing their opacities from 0 to 1 on one
* element and 1 to 0 on the other element.
*/
PlusLighter:13,"13":"PlusLighter", });
/**
*/
export class RenderInfo {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(RenderInfo.prototype);
        obj.__wbg_ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_renderinfo_free(ptr);
    }
    /**
    * @returns {number}
    */
    get ramps_width() {
        const ret = wasm.__wbg_get_renderinfo_ramps_width(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
    * @param {number} arg0
    */
    set ramps_width(arg0) {
        wasm.__wbg_set_renderinfo_ramps_width(this.__wbg_ptr, arg0);
    }
    /**
    * @returns {number}
    */
    get ramps_height() {
        const ret = wasm.__wbg_get_renderinfo_ramps_height(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
    * @param {number} arg0
    */
    set ramps_height(arg0) {
        wasm.__wbg_set_renderinfo_ramps_height(this.__wbg_ptr, arg0);
    }
    /**
    * @returns {number}
    */
    get images_width() {
        const ret = wasm.__wbg_get_renderinfo_images_width(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
    * @param {number} arg0
    */
    set images_width(arg0) {
        wasm.__wbg_set_renderinfo_images_width(this.__wbg_ptr, arg0);
    }
    /**
    * @returns {number}
    */
    get images_height() {
        const ret = wasm.__wbg_get_renderinfo_images_height(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
    * @param {number} arg0
    */
    set images_height(arg0) {
        wasm.__wbg_set_renderinfo_images_height(this.__wbg_ptr, arg0);
    }
    /**
    * @returns {Uint8Array}
    */
    scene() {
        const ret = wasm.renderinfo_scene(this.__wbg_ptr);
        return takeObject(ret);
    }
    /**
    * @returns {Uint8Array}
    */
    ramps() {
        const ret = wasm.renderinfo_ramps(this.__wbg_ptr);
        return takeObject(ret);
    }
    /**
    * @returns {BigUint64Array}
    */
    images() {
        const ret = wasm.renderinfo_images(this.__wbg_ptr);
        return takeObject(ret);
    }
    /**
    * @returns {VelloLayout}
    */
    layout() {
        const ret = wasm.renderinfo_layout(this.__wbg_ptr);
        return VelloLayout.__wrap(ret);
    }
    /**
    * @returns {VelloConfigUniform}
    */
    config_uniform() {
        const ret = wasm.renderinfo_config_uniform(this.__wbg_ptr);
        return VelloConfigUniform.__wrap(ret);
    }
    /**
    * @returns {VelloWorkgroupCounts}
    */
    workgroup_counts() {
        const ret = wasm.renderinfo_workgroup_counts(this.__wbg_ptr);
        return VelloWorkgroupCounts.__wrap(ret);
    }
    /**
    * @returns {VelloBufferSizes}
    */
    buffer_sizes() {
        const ret = wasm.renderinfo_buffer_sizes(this.__wbg_ptr);
        return VelloBufferSizes.__wrap(ret);
    }
    /**
    * @returns {Uint8Array}
    */
    config_bytes() {
        const ret = wasm.renderinfo_config_bytes(this.__wbg_ptr);
        return takeObject(ret);
    }
}
/**
*/
export class VelloBufferSize {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(VelloBufferSize.prototype);
        obj.__wbg_ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_vellobuffersize_free(ptr);
    }
    /**
    * @returns {number}
    */
    get size_in_bytes() {
        const ret = wasm.__wbg_get_vellobuffersize_size_in_bytes(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
    * @param {number} arg0
    */
    set size_in_bytes(arg0) {
        wasm.__wbg_set_vellobuffersize_size_in_bytes(this.__wbg_ptr, arg0);
    }
}
/**
*/
export class VelloBufferSizes {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(VelloBufferSizes.prototype);
        obj.__wbg_ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_vellobuffersizes_free(ptr);
    }
    /**
    * @returns {VelloBufferSize}
    */
    get path_reduced() {
        const ret = wasm.__wbg_get_vellobuffersizes_path_reduced(this.__wbg_ptr);
        return VelloBufferSize.__wrap(ret);
    }
    /**
    * @param {VelloBufferSize} arg0
    */
    set path_reduced(arg0) {
        _assertClass(arg0, VelloBufferSize);
        var ptr0 = arg0.__destroy_into_raw();
        wasm.__wbg_set_vellobuffersizes_path_reduced(this.__wbg_ptr, ptr0);
    }
    /**
    * @returns {VelloBufferSize}
    */
    get path_reduced2() {
        const ret = wasm.__wbg_get_vellobuffersizes_path_reduced2(this.__wbg_ptr);
        return VelloBufferSize.__wrap(ret);
    }
    /**
    * @param {VelloBufferSize} arg0
    */
    set path_reduced2(arg0) {
        _assertClass(arg0, VelloBufferSize);
        var ptr0 = arg0.__destroy_into_raw();
        wasm.__wbg_set_vellobuffersizes_path_reduced2(this.__wbg_ptr, ptr0);
    }
    /**
    * @returns {VelloBufferSize}
    */
    get path_reduced_scan() {
        const ret = wasm.__wbg_get_vellobuffersizes_path_reduced_scan(this.__wbg_ptr);
        return VelloBufferSize.__wrap(ret);
    }
    /**
    * @param {VelloBufferSize} arg0
    */
    set path_reduced_scan(arg0) {
        _assertClass(arg0, VelloBufferSize);
        var ptr0 = arg0.__destroy_into_raw();
        wasm.__wbg_set_vellobuffersizes_path_reduced_scan(this.__wbg_ptr, ptr0);
    }
    /**
    * @returns {VelloBufferSize}
    */
    get path_monoids() {
        const ret = wasm.__wbg_get_vellobuffersizes_path_monoids(this.__wbg_ptr);
        return VelloBufferSize.__wrap(ret);
    }
    /**
    * @param {VelloBufferSize} arg0
    */
    set path_monoids(arg0) {
        _assertClass(arg0, VelloBufferSize);
        var ptr0 = arg0.__destroy_into_raw();
        wasm.__wbg_set_vellobuffersizes_path_monoids(this.__wbg_ptr, ptr0);
    }
    /**
    * @returns {VelloBufferSize}
    */
    get path_bboxes() {
        const ret = wasm.__wbg_get_vellobuffersizes_path_bboxes(this.__wbg_ptr);
        return VelloBufferSize.__wrap(ret);
    }
    /**
    * @param {VelloBufferSize} arg0
    */
    set path_bboxes(arg0) {
        _assertClass(arg0, VelloBufferSize);
        var ptr0 = arg0.__destroy_into_raw();
        wasm.__wbg_set_vellobuffersizes_path_bboxes(this.__wbg_ptr, ptr0);
    }
    /**
    * @returns {VelloBufferSize}
    */
    get cubics() {
        const ret = wasm.__wbg_get_vellobuffersizes_cubics(this.__wbg_ptr);
        return VelloBufferSize.__wrap(ret);
    }
    /**
    * @param {VelloBufferSize} arg0
    */
    set cubics(arg0) {
        _assertClass(arg0, VelloBufferSize);
        var ptr0 = arg0.__destroy_into_raw();
        wasm.__wbg_set_vellobuffersizes_cubics(this.__wbg_ptr, ptr0);
    }
    /**
    * @returns {VelloBufferSize}
    */
    get draw_reduced() {
        const ret = wasm.__wbg_get_vellobuffersizes_draw_reduced(this.__wbg_ptr);
        return VelloBufferSize.__wrap(ret);
    }
    /**
    * @param {VelloBufferSize} arg0
    */
    set draw_reduced(arg0) {
        _assertClass(arg0, VelloBufferSize);
        var ptr0 = arg0.__destroy_into_raw();
        wasm.__wbg_set_vellobuffersizes_draw_reduced(this.__wbg_ptr, ptr0);
    }
    /**
    * @returns {VelloBufferSize}
    */
    get draw_monoids() {
        const ret = wasm.__wbg_get_vellobuffersizes_draw_monoids(this.__wbg_ptr);
        return VelloBufferSize.__wrap(ret);
    }
    /**
    * @param {VelloBufferSize} arg0
    */
    set draw_monoids(arg0) {
        _assertClass(arg0, VelloBufferSize);
        var ptr0 = arg0.__destroy_into_raw();
        wasm.__wbg_set_vellobuffersizes_draw_monoids(this.__wbg_ptr, ptr0);
    }
    /**
    * @returns {VelloBufferSize}
    */
    get info() {
        const ret = wasm.__wbg_get_vellobuffersizes_info(this.__wbg_ptr);
        return VelloBufferSize.__wrap(ret);
    }
    /**
    * @param {VelloBufferSize} arg0
    */
    set info(arg0) {
        _assertClass(arg0, VelloBufferSize);
        var ptr0 = arg0.__destroy_into_raw();
        wasm.__wbg_set_vellobuffersizes_info(this.__wbg_ptr, ptr0);
    }
    /**
    * @returns {VelloBufferSize}
    */
    get clip_inps() {
        const ret = wasm.__wbg_get_vellobuffersizes_clip_inps(this.__wbg_ptr);
        return VelloBufferSize.__wrap(ret);
    }
    /**
    * @param {VelloBufferSize} arg0
    */
    set clip_inps(arg0) {
        _assertClass(arg0, VelloBufferSize);
        var ptr0 = arg0.__destroy_into_raw();
        wasm.__wbg_set_vellobuffersizes_clip_inps(this.__wbg_ptr, ptr0);
    }
    /**
    * @returns {VelloBufferSize}
    */
    get clip_els() {
        const ret = wasm.__wbg_get_vellobuffersizes_clip_els(this.__wbg_ptr);
        return VelloBufferSize.__wrap(ret);
    }
    /**
    * @param {VelloBufferSize} arg0
    */
    set clip_els(arg0) {
        _assertClass(arg0, VelloBufferSize);
        var ptr0 = arg0.__destroy_into_raw();
        wasm.__wbg_set_vellobuffersizes_clip_els(this.__wbg_ptr, ptr0);
    }
    /**
    * @returns {VelloBufferSize}
    */
    get clip_bics() {
        const ret = wasm.__wbg_get_vellobuffersizes_clip_bics(this.__wbg_ptr);
        return VelloBufferSize.__wrap(ret);
    }
    /**
    * @param {VelloBufferSize} arg0
    */
    set clip_bics(arg0) {
        _assertClass(arg0, VelloBufferSize);
        var ptr0 = arg0.__destroy_into_raw();
        wasm.__wbg_set_vellobuffersizes_clip_bics(this.__wbg_ptr, ptr0);
    }
    /**
    * @returns {VelloBufferSize}
    */
    get clip_bboxes() {
        const ret = wasm.__wbg_get_vellobuffersizes_clip_bboxes(this.__wbg_ptr);
        return VelloBufferSize.__wrap(ret);
    }
    /**
    * @param {VelloBufferSize} arg0
    */
    set clip_bboxes(arg0) {
        _assertClass(arg0, VelloBufferSize);
        var ptr0 = arg0.__destroy_into_raw();
        wasm.__wbg_set_vellobuffersizes_clip_bboxes(this.__wbg_ptr, ptr0);
    }
    /**
    * @returns {VelloBufferSize}
    */
    get draw_bboxes() {
        const ret = wasm.__wbg_get_vellobuffersizes_draw_bboxes(this.__wbg_ptr);
        return VelloBufferSize.__wrap(ret);
    }
    /**
    * @param {VelloBufferSize} arg0
    */
    set draw_bboxes(arg0) {
        _assertClass(arg0, VelloBufferSize);
        var ptr0 = arg0.__destroy_into_raw();
        wasm.__wbg_set_vellobuffersizes_draw_bboxes(this.__wbg_ptr, ptr0);
    }
    /**
    * @returns {VelloBufferSize}
    */
    get bump_alloc() {
        const ret = wasm.__wbg_get_vellobuffersizes_bump_alloc(this.__wbg_ptr);
        return VelloBufferSize.__wrap(ret);
    }
    /**
    * @param {VelloBufferSize} arg0
    */
    set bump_alloc(arg0) {
        _assertClass(arg0, VelloBufferSize);
        var ptr0 = arg0.__destroy_into_raw();
        wasm.__wbg_set_vellobuffersizes_bump_alloc(this.__wbg_ptr, ptr0);
    }
    /**
    * @returns {VelloBufferSize}
    */
    get bin_headers() {
        const ret = wasm.__wbg_get_vellobuffersizes_bin_headers(this.__wbg_ptr);
        return VelloBufferSize.__wrap(ret);
    }
    /**
    * @param {VelloBufferSize} arg0
    */
    set bin_headers(arg0) {
        _assertClass(arg0, VelloBufferSize);
        var ptr0 = arg0.__destroy_into_raw();
        wasm.__wbg_set_vellobuffersizes_bin_headers(this.__wbg_ptr, ptr0);
    }
    /**
    * @returns {VelloBufferSize}
    */
    get paths() {
        const ret = wasm.__wbg_get_vellobuffersizes_paths(this.__wbg_ptr);
        return VelloBufferSize.__wrap(ret);
    }
    /**
    * @param {VelloBufferSize} arg0
    */
    set paths(arg0) {
        _assertClass(arg0, VelloBufferSize);
        var ptr0 = arg0.__destroy_into_raw();
        wasm.__wbg_set_vellobuffersizes_paths(this.__wbg_ptr, ptr0);
    }
    /**
    * @returns {VelloBufferSize}
    */
    get bin_data() {
        const ret = wasm.__wbg_get_vellobuffersizes_bin_data(this.__wbg_ptr);
        return VelloBufferSize.__wrap(ret);
    }
    /**
    * @param {VelloBufferSize} arg0
    */
    set bin_data(arg0) {
        _assertClass(arg0, VelloBufferSize);
        var ptr0 = arg0.__destroy_into_raw();
        wasm.__wbg_set_vellobuffersizes_bin_data(this.__wbg_ptr, ptr0);
    }
    /**
    * @returns {VelloBufferSize}
    */
    get tiles() {
        const ret = wasm.__wbg_get_vellobuffersizes_tiles(this.__wbg_ptr);
        return VelloBufferSize.__wrap(ret);
    }
    /**
    * @param {VelloBufferSize} arg0
    */
    set tiles(arg0) {
        _assertClass(arg0, VelloBufferSize);
        var ptr0 = arg0.__destroy_into_raw();
        wasm.__wbg_set_vellobuffersizes_tiles(this.__wbg_ptr, ptr0);
    }
    /**
    * @returns {VelloBufferSize}
    */
    get segments() {
        const ret = wasm.__wbg_get_vellobuffersizes_segments(this.__wbg_ptr);
        return VelloBufferSize.__wrap(ret);
    }
    /**
    * @param {VelloBufferSize} arg0
    */
    set segments(arg0) {
        _assertClass(arg0, VelloBufferSize);
        var ptr0 = arg0.__destroy_into_raw();
        wasm.__wbg_set_vellobuffersizes_segments(this.__wbg_ptr, ptr0);
    }
    /**
    * @returns {VelloBufferSize}
    */
    get ptcl() {
        const ret = wasm.__wbg_get_vellobuffersizes_ptcl(this.__wbg_ptr);
        return VelloBufferSize.__wrap(ret);
    }
    /**
    * @param {VelloBufferSize} arg0
    */
    set ptcl(arg0) {
        _assertClass(arg0, VelloBufferSize);
        var ptr0 = arg0.__destroy_into_raw();
        wasm.__wbg_set_vellobuffersizes_ptcl(this.__wbg_ptr, ptr0);
    }
}
/**
*/
export class VelloConfigUniform {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(VelloConfigUniform.prototype);
        obj.__wbg_ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_velloconfiguniform_free(ptr);
    }
    /**
    * @returns {number}
    */
    get width_in_tiles() {
        const ret = wasm.__wbg_get_renderinfo_ramps_width(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
    * @param {number} arg0
    */
    set width_in_tiles(arg0) {
        wasm.__wbg_set_renderinfo_ramps_width(this.__wbg_ptr, arg0);
    }
    /**
    * @returns {number}
    */
    get height_in_tiles() {
        const ret = wasm.__wbg_get_renderinfo_ramps_height(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
    * @param {number} arg0
    */
    set height_in_tiles(arg0) {
        wasm.__wbg_set_renderinfo_ramps_height(this.__wbg_ptr, arg0);
    }
    /**
    * @returns {number}
    */
    get target_width() {
        const ret = wasm.__wbg_get_renderinfo_images_width(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
    * @param {number} arg0
    */
    set target_width(arg0) {
        wasm.__wbg_set_renderinfo_images_width(this.__wbg_ptr, arg0);
    }
    /**
    * @returns {number}
    */
    get target_height() {
        const ret = wasm.__wbg_get_renderinfo_images_height(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
    * @param {number} arg0
    */
    set target_height(arg0) {
        wasm.__wbg_set_renderinfo_images_height(this.__wbg_ptr, arg0);
    }
    /**
    * @returns {number}
    */
    get base_color() {
        const ret = wasm.__wbg_get_velloconfiguniform_base_color(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
    * @param {number} arg0
    */
    set base_color(arg0) {
        wasm.__wbg_set_velloconfiguniform_base_color(this.__wbg_ptr, arg0);
    }
    /**
    * @returns {VelloLayout}
    */
    get layout() {
        const ret = wasm.__wbg_get_velloconfiguniform_layout(this.__wbg_ptr);
        return VelloLayout.__wrap(ret);
    }
    /**
    * @param {VelloLayout} arg0
    */
    set layout(arg0) {
        _assertClass(arg0, VelloLayout);
        var ptr0 = arg0.__destroy_into_raw();
        wasm.__wbg_set_velloconfiguniform_layout(this.__wbg_ptr, ptr0);
    }
    /**
    * @returns {number}
    */
    get binning_size() {
        const ret = wasm.__wbg_get_velloconfiguniform_binning_size(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
    * @param {number} arg0
    */
    set binning_size(arg0) {
        wasm.__wbg_set_velloconfiguniform_binning_size(this.__wbg_ptr, arg0);
    }
    /**
    * @returns {number}
    */
    get tiles_size() {
        const ret = wasm.__wbg_get_velloconfiguniform_tiles_size(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
    * @param {number} arg0
    */
    set tiles_size(arg0) {
        wasm.__wbg_set_velloconfiguniform_tiles_size(this.__wbg_ptr, arg0);
    }
    /**
    * @returns {number}
    */
    get segments_size() {
        const ret = wasm.__wbg_get_velloconfiguniform_segments_size(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
    * @param {number} arg0
    */
    set segments_size(arg0) {
        wasm.__wbg_set_velloconfiguniform_segments_size(this.__wbg_ptr, arg0);
    }
    /**
    * @returns {number}
    */
    get ptcl_size() {
        const ret = wasm.__wbg_get_velloconfiguniform_ptcl_size(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
    * @param {number} arg0
    */
    set ptcl_size(arg0) {
        wasm.__wbg_set_velloconfiguniform_ptcl_size(this.__wbg_ptr, arg0);
    }
}
/**
*/
export class VelloEncoding {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(VelloEncoding.prototype);
        obj.__wbg_ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_velloencoding_free(ptr);
    }
    /**
    */
    constructor() {
        const ret = wasm.velloencoding_new();
        return VelloEncoding.__wrap(ret);
    }
    /**
    * @returns {VelloEncoding}
    */
    static new_scene() {
        const ret = wasm.velloencoding_new_scene();
        return VelloEncoding.__wrap(ret);
    }
    /**
    * @param {number} width
    * @param {number} height
    * @returns {VelloImage}
    */
    static new_image(width, height) {
        const ret = wasm.velloencoding_new_image(width, height);
        return VelloImage.__wrap(ret);
    }
    /**
    * @param {VelloEncoding} other
    */
    append(other) {
        _assertClass(other, VelloEncoding);
        wasm.velloencoding_append(this.__wbg_ptr, other.__wbg_ptr);
    }
    /**
    * @param {VelloEncoding} other
    * @param {number} a00
    * @param {number} a10
    * @param {number} a01
    * @param {number} a11
    * @param {number} a20
    * @param {number} a21
    */
    append_with_transform(other, a00, a10, a01, a11, a20, a21) {
        _assertClass(other, VelloEncoding);
        wasm.velloencoding_append_with_transform(this.__wbg_ptr, other.__wbg_ptr, a00, a10, a01, a11, a20, a21);
    }
    /**
    * @param {boolean} is_fragment
    */
    reset(is_fragment) {
        wasm.velloencoding_reset(this.__wbg_ptr, is_fragment);
    }
    /**
    * @param {number} linewidth
    */
    linewidth(linewidth) {
        wasm.velloencoding_linewidth(this.__wbg_ptr, linewidth);
    }
    /**
    * @param {number} a00
    * @param {number} a10
    * @param {number} a01
    * @param {number} a11
    * @param {number} a20
    * @param {number} a21
    */
    matrix(a00, a10, a01, a11, a20, a21) {
        wasm.velloencoding_matrix(this.__wbg_ptr, a00, a10, a01, a11, a20, a21);
    }
    /**
    * @param {boolean} is_fill
    * @param {string} path
    */
    svg_path(is_fill, path) {
        const ptr0 = passStringToWasm0(path, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        wasm.velloencoding_svg_path(this.__wbg_ptr, is_fill, ptr0, len0);
    }
    /**
    * @param {boolean} is_fill
    * @param {boolean} insert_path_marker
    * @param {string} json
    */
    json_path(is_fill, insert_path_marker, json) {
        const ptr0 = passStringToWasm0(json, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        wasm.velloencoding_json_path(this.__wbg_ptr, is_fill, insert_path_marker, ptr0, len0);
    }
    /**
    * @param {number} rgba
    */
    color(rgba) {
        wasm.velloencoding_color(this.__wbg_ptr, rgba);
    }
    /**
    * @param {number} x0
    * @param {number} y0
    * @param {number} x1
    * @param {number} y1
    * @param {number} alpha
    * @param {number} extend
    * @param {Float32Array} offsets
    * @param {Uint32Array} colors
    */
    linear_gradient(x0, y0, x1, y1, alpha, extend, offsets, colors) {
        wasm.velloencoding_linear_gradient(this.__wbg_ptr, x0, y0, x1, y1, alpha, extend, addHeapObject(offsets), addHeapObject(colors));
    }
    /**
    * @param {number} x0
    * @param {number} y0
    * @param {number} x1
    * @param {number} y1
    * @param {number} r0
    * @param {number} r1
    * @param {number} alpha
    * @param {number} extend
    * @param {Float32Array} offsets
    * @param {Uint32Array} colors
    */
    radial_gradient(x0, y0, x1, y1, r0, r1, alpha, extend, offsets, colors) {
        wasm.velloencoding_radial_gradient(this.__wbg_ptr, x0, y0, x1, y1, r0, r1, alpha, extend, addHeapObject(offsets), addHeapObject(colors));
    }
    /**
    * @param {number} mix
    * @param {number} compose
    * @param {number} alpha
    */
    begin_clip(mix, compose, alpha) {
        wasm.velloencoding_begin_clip(this.__wbg_ptr, mix, compose, alpha);
    }
    /**
    */
    end_clip() {
        wasm.velloencoding_end_clip(this.__wbg_ptr);
    }
    /**
    * @param {VelloImage} image
    * @param {number} alpha
    */
    image(image, alpha) {
        _assertClass(image, VelloImage);
        wasm.velloencoding_image(this.__wbg_ptr, image.__wbg_ptr, alpha);
    }
    /**
    */
    finalize_scene() {
        wasm.velloencoding_finalize_scene(this.__wbg_ptr);
    }
    /**
    * @param {number} width
    * @param {number} height
    * @param {number} base_color
    * @returns {RenderInfo}
    */
    render(width, height, base_color) {
        const ret = wasm.velloencoding_render(this.__wbg_ptr, width, height, base_color);
        return RenderInfo.__wrap(ret);
    }
}
/**
*/
export class VelloImage {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(VelloImage.prototype);
        obj.__wbg_ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_velloimage_free(ptr);
    }
    /**
    * @returns {bigint}
    */
    id() {
        const ret = wasm.velloimage_id(this.__wbg_ptr);
        return BigInt.asUintN(64, ret);
    }
}
/**
*/
export class VelloLayout {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(VelloLayout.prototype);
        obj.__wbg_ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_vellolayout_free(ptr);
    }
    /**
    * @returns {number}
    */
    get n_draw_objects() {
        const ret = wasm.__wbg_get_vellobuffersize_size_in_bytes(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
    * @param {number} arg0
    */
    set n_draw_objects(arg0) {
        wasm.__wbg_set_vellobuffersize_size_in_bytes(this.__wbg_ptr, arg0);
    }
    /**
    * @returns {number}
    */
    get n_paths() {
        const ret = wasm.__wbg_get_vellolayout_n_paths(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
    * @param {number} arg0
    */
    set n_paths(arg0) {
        wasm.__wbg_set_vellolayout_n_paths(this.__wbg_ptr, arg0);
    }
    /**
    * @returns {number}
    */
    get n_clips() {
        const ret = wasm.__wbg_get_vellolayout_n_clips(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
    * @param {number} arg0
    */
    set n_clips(arg0) {
        wasm.__wbg_set_vellolayout_n_clips(this.__wbg_ptr, arg0);
    }
    /**
    * @returns {number}
    */
    get bin_data_start() {
        const ret = wasm.__wbg_get_vellolayout_bin_data_start(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
    * @param {number} arg0
    */
    set bin_data_start(arg0) {
        wasm.__wbg_set_vellolayout_bin_data_start(this.__wbg_ptr, arg0);
    }
    /**
    * @returns {number}
    */
    get path_tag_base() {
        const ret = wasm.__wbg_get_vellolayout_path_tag_base(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
    * @param {number} arg0
    */
    set path_tag_base(arg0) {
        wasm.__wbg_set_vellolayout_path_tag_base(this.__wbg_ptr, arg0);
    }
    /**
    * @returns {number}
    */
    get path_data_base() {
        const ret = wasm.__wbg_get_vellolayout_path_data_base(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
    * @param {number} arg0
    */
    set path_data_base(arg0) {
        wasm.__wbg_set_vellolayout_path_data_base(this.__wbg_ptr, arg0);
    }
    /**
    * @returns {number}
    */
    get draw_tag_base() {
        const ret = wasm.__wbg_get_vellolayout_draw_tag_base(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
    * @param {number} arg0
    */
    set draw_tag_base(arg0) {
        wasm.__wbg_set_vellolayout_draw_tag_base(this.__wbg_ptr, arg0);
    }
    /**
    * @returns {number}
    */
    get draw_data_base() {
        const ret = wasm.__wbg_get_vellolayout_draw_data_base(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
    * @param {number} arg0
    */
    set draw_data_base(arg0) {
        wasm.__wbg_set_vellolayout_draw_data_base(this.__wbg_ptr, arg0);
    }
    /**
    * @returns {number}
    */
    get transform_base() {
        const ret = wasm.__wbg_get_vellolayout_transform_base(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
    * @param {number} arg0
    */
    set transform_base(arg0) {
        wasm.__wbg_set_vellolayout_transform_base(this.__wbg_ptr, arg0);
    }
    /**
    * @returns {number}
    */
    get linewidth_base() {
        const ret = wasm.__wbg_get_vellolayout_linewidth_base(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
    * @param {number} arg0
    */
    set linewidth_base(arg0) {
        wasm.__wbg_set_vellolayout_linewidth_base(this.__wbg_ptr, arg0);
    }
}
/**
*/
export class VelloWorkgroupCounts {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(VelloWorkgroupCounts.prototype);
        obj.__wbg_ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_velloworkgroupcounts_free(ptr);
    }
    /**
    * @returns {boolean}
    */
    get use_large_path_scan() {
        const ret = wasm.__wbg_get_velloworkgroupcounts_use_large_path_scan(this.__wbg_ptr);
        return ret !== 0;
    }
    /**
    * @param {boolean} arg0
    */
    set use_large_path_scan(arg0) {
        wasm.__wbg_set_velloworkgroupcounts_use_large_path_scan(this.__wbg_ptr, arg0);
    }
    /**
    * @returns {VelloWorkgroupSize}
    */
    get path_reduce() {
        const ret = wasm.__wbg_get_velloworkgroupcounts_path_reduce(this.__wbg_ptr);
        return VelloWorkgroupSize.__wrap(ret);
    }
    /**
    * @param {VelloWorkgroupSize} arg0
    */
    set path_reduce(arg0) {
        _assertClass(arg0, VelloWorkgroupSize);
        var ptr0 = arg0.__destroy_into_raw();
        wasm.__wbg_set_velloworkgroupcounts_path_reduce(this.__wbg_ptr, ptr0);
    }
    /**
    * @returns {VelloWorkgroupSize}
    */
    get path_reduce2() {
        const ret = wasm.__wbg_get_velloworkgroupcounts_path_reduce2(this.__wbg_ptr);
        return VelloWorkgroupSize.__wrap(ret);
    }
    /**
    * @param {VelloWorkgroupSize} arg0
    */
    set path_reduce2(arg0) {
        _assertClass(arg0, VelloWorkgroupSize);
        var ptr0 = arg0.__destroy_into_raw();
        wasm.__wbg_set_velloworkgroupcounts_path_reduce2(this.__wbg_ptr, ptr0);
    }
    /**
    * @returns {VelloWorkgroupSize}
    */
    get path_scan1() {
        const ret = wasm.__wbg_get_velloworkgroupcounts_path_scan1(this.__wbg_ptr);
        return VelloWorkgroupSize.__wrap(ret);
    }
    /**
    * @param {VelloWorkgroupSize} arg0
    */
    set path_scan1(arg0) {
        _assertClass(arg0, VelloWorkgroupSize);
        var ptr0 = arg0.__destroy_into_raw();
        wasm.__wbg_set_velloworkgroupcounts_path_scan1(this.__wbg_ptr, ptr0);
    }
    /**
    * @returns {VelloWorkgroupSize}
    */
    get path_scan() {
        const ret = wasm.__wbg_get_velloworkgroupcounts_path_scan(this.__wbg_ptr);
        return VelloWorkgroupSize.__wrap(ret);
    }
    /**
    * @param {VelloWorkgroupSize} arg0
    */
    set path_scan(arg0) {
        _assertClass(arg0, VelloWorkgroupSize);
        var ptr0 = arg0.__destroy_into_raw();
        wasm.__wbg_set_velloworkgroupcounts_path_scan(this.__wbg_ptr, ptr0);
    }
    /**
    * @returns {VelloWorkgroupSize}
    */
    get bbox_clear() {
        const ret = wasm.__wbg_get_velloworkgroupcounts_bbox_clear(this.__wbg_ptr);
        return VelloWorkgroupSize.__wrap(ret);
    }
    /**
    * @param {VelloWorkgroupSize} arg0
    */
    set bbox_clear(arg0) {
        _assertClass(arg0, VelloWorkgroupSize);
        var ptr0 = arg0.__destroy_into_raw();
        wasm.__wbg_set_velloworkgroupcounts_bbox_clear(this.__wbg_ptr, ptr0);
    }
    /**
    * @returns {VelloWorkgroupSize}
    */
    get path_seg() {
        const ret = wasm.__wbg_get_velloworkgroupcounts_path_seg(this.__wbg_ptr);
        return VelloWorkgroupSize.__wrap(ret);
    }
    /**
    * @param {VelloWorkgroupSize} arg0
    */
    set path_seg(arg0) {
        _assertClass(arg0, VelloWorkgroupSize);
        var ptr0 = arg0.__destroy_into_raw();
        wasm.__wbg_set_velloworkgroupcounts_path_seg(this.__wbg_ptr, ptr0);
    }
    /**
    * @returns {VelloWorkgroupSize}
    */
    get draw_reduce() {
        const ret = wasm.__wbg_get_velloworkgroupcounts_draw_reduce(this.__wbg_ptr);
        return VelloWorkgroupSize.__wrap(ret);
    }
    /**
    * @param {VelloWorkgroupSize} arg0
    */
    set draw_reduce(arg0) {
        _assertClass(arg0, VelloWorkgroupSize);
        var ptr0 = arg0.__destroy_into_raw();
        wasm.__wbg_set_velloworkgroupcounts_draw_reduce(this.__wbg_ptr, ptr0);
    }
    /**
    * @returns {VelloWorkgroupSize}
    */
    get draw_leaf() {
        const ret = wasm.__wbg_get_velloworkgroupcounts_draw_leaf(this.__wbg_ptr);
        return VelloWorkgroupSize.__wrap(ret);
    }
    /**
    * @param {VelloWorkgroupSize} arg0
    */
    set draw_leaf(arg0) {
        _assertClass(arg0, VelloWorkgroupSize);
        var ptr0 = arg0.__destroy_into_raw();
        wasm.__wbg_set_velloworkgroupcounts_draw_leaf(this.__wbg_ptr, ptr0);
    }
    /**
    * @returns {VelloWorkgroupSize}
    */
    get clip_reduce() {
        const ret = wasm.__wbg_get_velloworkgroupcounts_clip_reduce(this.__wbg_ptr);
        return VelloWorkgroupSize.__wrap(ret);
    }
    /**
    * @param {VelloWorkgroupSize} arg0
    */
    set clip_reduce(arg0) {
        _assertClass(arg0, VelloWorkgroupSize);
        var ptr0 = arg0.__destroy_into_raw();
        wasm.__wbg_set_velloworkgroupcounts_clip_reduce(this.__wbg_ptr, ptr0);
    }
    /**
    * @returns {VelloWorkgroupSize}
    */
    get clip_leaf() {
        const ret = wasm.__wbg_get_velloworkgroupcounts_clip_leaf(this.__wbg_ptr);
        return VelloWorkgroupSize.__wrap(ret);
    }
    /**
    * @param {VelloWorkgroupSize} arg0
    */
    set clip_leaf(arg0) {
        _assertClass(arg0, VelloWorkgroupSize);
        var ptr0 = arg0.__destroy_into_raw();
        wasm.__wbg_set_velloworkgroupcounts_clip_leaf(this.__wbg_ptr, ptr0);
    }
    /**
    * @returns {VelloWorkgroupSize}
    */
    get binning() {
        const ret = wasm.__wbg_get_velloworkgroupcounts_binning(this.__wbg_ptr);
        return VelloWorkgroupSize.__wrap(ret);
    }
    /**
    * @param {VelloWorkgroupSize} arg0
    */
    set binning(arg0) {
        _assertClass(arg0, VelloWorkgroupSize);
        var ptr0 = arg0.__destroy_into_raw();
        wasm.__wbg_set_velloworkgroupcounts_binning(this.__wbg_ptr, ptr0);
    }
    /**
    * @returns {VelloWorkgroupSize}
    */
    get tile_alloc() {
        const ret = wasm.__wbg_get_velloworkgroupcounts_tile_alloc(this.__wbg_ptr);
        return VelloWorkgroupSize.__wrap(ret);
    }
    /**
    * @param {VelloWorkgroupSize} arg0
    */
    set tile_alloc(arg0) {
        _assertClass(arg0, VelloWorkgroupSize);
        var ptr0 = arg0.__destroy_into_raw();
        wasm.__wbg_set_velloworkgroupcounts_tile_alloc(this.__wbg_ptr, ptr0);
    }
    /**
    * @returns {VelloWorkgroupSize}
    */
    get path_coarse() {
        const ret = wasm.__wbg_get_velloworkgroupcounts_path_coarse(this.__wbg_ptr);
        return VelloWorkgroupSize.__wrap(ret);
    }
    /**
    * @param {VelloWorkgroupSize} arg0
    */
    set path_coarse(arg0) {
        _assertClass(arg0, VelloWorkgroupSize);
        var ptr0 = arg0.__destroy_into_raw();
        wasm.__wbg_set_velloworkgroupcounts_path_coarse(this.__wbg_ptr, ptr0);
    }
    /**
    * @returns {VelloWorkgroupSize}
    */
    get backdrop() {
        const ret = wasm.__wbg_get_velloworkgroupcounts_backdrop(this.__wbg_ptr);
        return VelloWorkgroupSize.__wrap(ret);
    }
    /**
    * @param {VelloWorkgroupSize} arg0
    */
    set backdrop(arg0) {
        _assertClass(arg0, VelloWorkgroupSize);
        var ptr0 = arg0.__destroy_into_raw();
        wasm.__wbg_set_velloworkgroupcounts_backdrop(this.__wbg_ptr, ptr0);
    }
    /**
    * @returns {VelloWorkgroupSize}
    */
    get coarse() {
        const ret = wasm.__wbg_get_velloworkgroupcounts_coarse(this.__wbg_ptr);
        return VelloWorkgroupSize.__wrap(ret);
    }
    /**
    * @param {VelloWorkgroupSize} arg0
    */
    set coarse(arg0) {
        _assertClass(arg0, VelloWorkgroupSize);
        var ptr0 = arg0.__destroy_into_raw();
        wasm.__wbg_set_velloworkgroupcounts_coarse(this.__wbg_ptr, ptr0);
    }
    /**
    * @returns {VelloWorkgroupSize}
    */
    get fine() {
        const ret = wasm.__wbg_get_velloworkgroupcounts_fine(this.__wbg_ptr);
        return VelloWorkgroupSize.__wrap(ret);
    }
    /**
    * @param {VelloWorkgroupSize} arg0
    */
    set fine(arg0) {
        _assertClass(arg0, VelloWorkgroupSize);
        var ptr0 = arg0.__destroy_into_raw();
        wasm.__wbg_set_velloworkgroupcounts_fine(this.__wbg_ptr, ptr0);
    }
}
/**
*/
export class VelloWorkgroupSize {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(VelloWorkgroupSize.prototype);
        obj.__wbg_ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_velloworkgroupsize_free(ptr);
    }
    /**
    * @returns {number}
    */
    get x() {
        const ret = wasm.__wbg_get_vellobuffersize_size_in_bytes(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
    * @param {number} arg0
    */
    set x(arg0) {
        wasm.__wbg_set_vellobuffersize_size_in_bytes(this.__wbg_ptr, arg0);
    }
    /**
    * @returns {number}
    */
    get y() {
        const ret = wasm.__wbg_get_vellolayout_n_paths(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
    * @param {number} arg0
    */
    set y(arg0) {
        wasm.__wbg_set_vellolayout_n_paths(this.__wbg_ptr, arg0);
    }
    /**
    * @returns {number}
    */
    get z() {
        const ret = wasm.__wbg_get_vellolayout_n_clips(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
    * @param {number} arg0
    */
    set z(arg0) {
        wasm.__wbg_set_vellolayout_n_clips(this.__wbg_ptr, arg0);
    }
}

async function __wbg_load(module, imports) {
    if (typeof Response === 'function' && module instanceof Response) {
        if (typeof WebAssembly.instantiateStreaming === 'function') {
            try {
                return await WebAssembly.instantiateStreaming(module, imports);

            } catch (e) {
                if (module.headers.get('Content-Type') != 'application/wasm') {
                    console.warn("`WebAssembly.instantiateStreaming` failed because your server does not serve wasm with `application/wasm` MIME type. Falling back to `WebAssembly.instantiate` which is slower. Original error:\n", e);

                } else {
                    throw e;
                }
            }
        }

        const bytes = await module.arrayBuffer();
        return await WebAssembly.instantiate(bytes, imports);

    } else {
        const instance = await WebAssembly.instantiate(module, imports);

        if (instance instanceof WebAssembly.Instance) {
            return { instance, module };

        } else {
            return instance;
        }
    }
}

function __wbg_get_imports() {
    const imports = {};
    imports.wbg = {};
    imports.wbg.__wbindgen_object_drop_ref = function(arg0) {
        takeObject(arg0);
    };
    imports.wbg.__wbg_buffer_085ec1f694018c4f = function(arg0) {
        const ret = getObject(arg0).buffer;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_newwithbyteoffsetandlength_6da8e527659b86aa = function(arg0, arg1, arg2) {
        const ret = new Uint8Array(getObject(arg0), arg1 >>> 0, arg2 >>> 0);
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_new_8125e318e6245eed = function(arg0) {
        const ret = new Uint8Array(getObject(arg0));
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_new_fcbee3dadeecfb4d = function(arg0) {
        const ret = new Uint32Array(getObject(arg0));
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_set_6fc85f95c0fabed7 = function(arg0, arg1, arg2) {
        getObject(arg0).set(getObject(arg1), arg2 >>> 0);
    };
    imports.wbg.__wbg_length_af9e17a74c21f08c = function(arg0) {
        const ret = getObject(arg0).length;
        return ret;
    };
    imports.wbg.__wbg_new_d086a66d1c264b3f = function(arg0) {
        const ret = new Float32Array(getObject(arg0));
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_set_6146c51d49a2c0df = function(arg0, arg1, arg2) {
        getObject(arg0).set(getObject(arg1), arg2 >>> 0);
    };
    imports.wbg.__wbg_length_d7327c75a759af37 = function(arg0) {
        const ret = getObject(arg0).length;
        return ret;
    };
    imports.wbg.__wbg_newwithbyteoffsetandlength_fd5db02a521a2c38 = function(arg0, arg1, arg2) {
        const ret = new BigUint64Array(getObject(arg0), arg1 >>> 0, arg2 >>> 0);
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_new_62d794c212489a2b = function(arg0) {
        const ret = new BigUint64Array(getObject(arg0));
        return addHeapObject(ret);
    };
    imports.wbg.__wbindgen_throw = function(arg0, arg1) {
        throw new Error(getStringFromWasm0(arg0, arg1));
    };
    imports.wbg.__wbindgen_memory = function() {
        const ret = wasm.memory;
        return addHeapObject(ret);
    };

    return imports;
}

function __wbg_init_memory(imports, maybe_memory) {

}

function __wbg_finalize_init(instance, module) {
    wasm = instance.exports;
    __wbg_init.__wbindgen_wasm_module = module;
    cachedUint8Memory0 = null;

    wasm.__wbindgen_start();
    return wasm;
}

function initSync(module) {
    if (wasm !== undefined) return wasm;

    const imports = __wbg_get_imports();

    __wbg_init_memory(imports);

    if (!(module instanceof WebAssembly.Module)) {
        module = new WebAssembly.Module(module);
    }

    const instance = new WebAssembly.Instance(module, imports);

    return __wbg_finalize_init(instance, module);
}

async function __wbg_init(input) {
    if (wasm !== undefined) return wasm;

    if (typeof input === 'undefined') {
        input = new URL('vello_tests_bg.wasm', import.meta.url);
    }
    const imports = __wbg_get_imports();

    if (typeof input === 'string' || (typeof Request === 'function' && input instanceof Request) || (typeof URL === 'function' && input instanceof URL)) {
        input = fetch(input);
    }

    __wbg_init_memory(imports);

    const { instance, module } = await __wbg_load(await input, imports);

    return __wbg_finalize_init(instance, module);
}

export { initSync }
export default __wbg_init;
