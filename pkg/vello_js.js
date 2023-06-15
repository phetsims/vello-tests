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
    * @returns {Uint8Array}
    */
    scene() {
        const ret = wasm.renderinfo_scene(this.__wbg_ptr);
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
        const ret = wasm.__wbg_get_velloconfiguniform_width_in_tiles(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
    * @param {number} arg0
    */
    set width_in_tiles(arg0) {
        wasm.__wbg_set_velloconfiguniform_width_in_tiles(this.__wbg_ptr, arg0);
    }
    /**
    * @returns {number}
    */
    get height_in_tiles() {
        const ret = wasm.__wbg_get_velloconfiguniform_height_in_tiles(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
    * @param {number} arg0
    */
    set height_in_tiles(arg0) {
        wasm.__wbg_set_velloconfiguniform_height_in_tiles(this.__wbg_ptr, arg0);
    }
    /**
    * @returns {number}
    */
    get target_width() {
        const ret = wasm.__wbg_get_velloconfiguniform_target_width(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
    * @param {number} arg0
    */
    set target_width(arg0) {
        wasm.__wbg_set_velloconfiguniform_target_width(this.__wbg_ptr, arg0);
    }
    /**
    * @returns {number}
    */
    get target_height() {
        const ret = wasm.__wbg_get_velloconfiguniform_target_height(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
    * @param {number} arg0
    */
    set target_height(arg0) {
        wasm.__wbg_set_velloconfiguniform_target_height(this.__wbg_ptr, arg0);
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
    * @param {number} a01
    * @param {number} a10
    * @param {number} a11
    * @param {number} a20
    * @param {number} a21
    */
    matrix(a00, a01, a10, a11, a20, a21) {
        wasm.velloencoding_matrix(this.__wbg_ptr, a00, a01, a10, a11, a20, a21);
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
        input = new URL('vello_js_bg.wasm', import.meta.url);
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
