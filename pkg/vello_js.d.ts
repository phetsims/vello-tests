/* tslint:disable */
/* eslint-disable */
/**
*/
export function run(): void;
/**
*/
export class RenderInfo {
  free(): void;
/**
* @returns {Uint8Array}
*/
  scene(): Uint8Array;
/**
* @returns {VelloLayout}
*/
  layout(): VelloLayout;
/**
* @returns {VelloConfigUniform}
*/
  config_uniform(): VelloConfigUniform;
/**
* @returns {VelloWorkgroupCounts}
*/
  workgroup_counts(): VelloWorkgroupCounts;
/**
* @returns {VelloBufferSizes}
*/
  buffer_sizes(): VelloBufferSizes;
/**
* @returns {Uint8Array}
*/
  config_bytes(): Uint8Array;
}
/**
*/
export class VelloBufferSize {
  free(): void;
/**
*/
  size_in_bytes: number;
}
/**
*/
export class VelloBufferSizes {
  free(): void;
/**
*/
  bin_data: VelloBufferSize;
/**
*/
  bin_headers: VelloBufferSize;
/**
*/
  bump_alloc: VelloBufferSize;
/**
*/
  clip_bboxes: VelloBufferSize;
/**
*/
  clip_bics: VelloBufferSize;
/**
*/
  clip_els: VelloBufferSize;
/**
*/
  clip_inps: VelloBufferSize;
/**
*/
  cubics: VelloBufferSize;
/**
*/
  draw_bboxes: VelloBufferSize;
/**
*/
  draw_monoids: VelloBufferSize;
/**
*/
  draw_reduced: VelloBufferSize;
/**
*/
  info: VelloBufferSize;
/**
*/
  path_bboxes: VelloBufferSize;
/**
*/
  path_monoids: VelloBufferSize;
/**
*/
  path_reduced: VelloBufferSize;
/**
*/
  path_reduced2: VelloBufferSize;
/**
*/
  path_reduced_scan: VelloBufferSize;
/**
*/
  paths: VelloBufferSize;
/**
*/
  ptcl: VelloBufferSize;
/**
*/
  segments: VelloBufferSize;
/**
*/
  tiles: VelloBufferSize;
}
/**
*/
export class VelloConfigUniform {
  free(): void;
/**
*/
  base_color: number;
/**
*/
  binning_size: number;
/**
*/
  height_in_tiles: number;
/**
*/
  layout: VelloLayout;
/**
*/
  ptcl_size: number;
/**
*/
  segments_size: number;
/**
*/
  target_height: number;
/**
*/
  target_width: number;
/**
*/
  tiles_size: number;
/**
*/
  width_in_tiles: number;
}
/**
*/
export class VelloEncoding {
  free(): void;
/**
*/
  constructor();
/**
* @param {boolean} is_fragment
*/
  reset(is_fragment: boolean): void;
/**
* @param {number} linewidth
*/
  linewidth(linewidth: number): void;
/**
* @param {number} a00
* @param {number} a01
* @param {number} a10
* @param {number} a11
* @param {number} a20
* @param {number} a21
*/
  matrix(a00: number, a01: number, a10: number, a11: number, a20: number, a21: number): void;
/**
* @param {boolean} is_fill
* @param {boolean} insert_path_marker
* @param {string} json
*/
  json_path(is_fill: boolean, insert_path_marker: boolean, json: string): void;
/**
* @param {number} rgba
*/
  color(rgba: number): void;
/**
* @param {number} width
* @param {number} height
* @param {number} base_color
* @returns {RenderInfo}
*/
  render(width: number, height: number, base_color: number): RenderInfo;
}
/**
*/
export class VelloLayout {
  free(): void;
/**
*/
  bin_data_start: number;
/**
*/
  draw_data_base: number;
/**
*/
  draw_tag_base: number;
/**
*/
  linewidth_base: number;
/**
*/
  n_clips: number;
/**
*/
  n_draw_objects: number;
/**
*/
  n_paths: number;
/**
*/
  path_data_base: number;
/**
*/
  path_tag_base: number;
/**
*/
  transform_base: number;
}
/**
*/
export class VelloWorkgroupCounts {
  free(): void;
/**
*/
  backdrop: VelloWorkgroupSize;
/**
*/
  bbox_clear: VelloWorkgroupSize;
/**
*/
  binning: VelloWorkgroupSize;
/**
*/
  clip_leaf: VelloWorkgroupSize;
/**
*/
  clip_reduce: VelloWorkgroupSize;
/**
*/
  coarse: VelloWorkgroupSize;
/**
*/
  draw_leaf: VelloWorkgroupSize;
/**
*/
  draw_reduce: VelloWorkgroupSize;
/**
*/
  fine: VelloWorkgroupSize;
/**
*/
  path_coarse: VelloWorkgroupSize;
/**
*/
  path_reduce: VelloWorkgroupSize;
/**
*/
  path_reduce2: VelloWorkgroupSize;
/**
*/
  path_scan: VelloWorkgroupSize;
/**
*/
  path_scan1: VelloWorkgroupSize;
/**
*/
  path_seg: VelloWorkgroupSize;
/**
*/
  tile_alloc: VelloWorkgroupSize;
/**
*/
  use_large_path_scan: boolean;
}
/**
*/
export class VelloWorkgroupSize {
  free(): void;
/**
*/
  x: number;
/**
*/
  y: number;
/**
*/
  z: number;
}

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
  readonly memory: WebAssembly.Memory;
  readonly __wbg_vellolayout_free: (a: number) => void;
  readonly __wbg_get_vellolayout_n_paths: (a: number) => number;
  readonly __wbg_set_vellolayout_n_paths: (a: number, b: number) => void;
  readonly __wbg_get_vellolayout_n_clips: (a: number) => number;
  readonly __wbg_set_vellolayout_n_clips: (a: number, b: number) => void;
  readonly __wbg_get_vellolayout_bin_data_start: (a: number) => number;
  readonly __wbg_set_vellolayout_bin_data_start: (a: number, b: number) => void;
  readonly __wbg_get_vellolayout_path_tag_base: (a: number) => number;
  readonly __wbg_set_vellolayout_path_tag_base: (a: number, b: number) => void;
  readonly __wbg_get_vellolayout_path_data_base: (a: number) => number;
  readonly __wbg_set_vellolayout_path_data_base: (a: number, b: number) => void;
  readonly __wbg_get_vellolayout_draw_tag_base: (a: number) => number;
  readonly __wbg_set_vellolayout_draw_tag_base: (a: number, b: number) => void;
  readonly __wbg_get_vellolayout_draw_data_base: (a: number) => number;
  readonly __wbg_set_vellolayout_draw_data_base: (a: number, b: number) => void;
  readonly __wbg_get_vellolayout_transform_base: (a: number) => number;
  readonly __wbg_set_vellolayout_transform_base: (a: number, b: number) => void;
  readonly __wbg_get_vellolayout_linewidth_base: (a: number) => number;
  readonly __wbg_set_vellolayout_linewidth_base: (a: number, b: number) => void;
  readonly __wbg_velloconfiguniform_free: (a: number) => void;
  readonly __wbg_get_velloconfiguniform_width_in_tiles: (a: number) => number;
  readonly __wbg_set_velloconfiguniform_width_in_tiles: (a: number, b: number) => void;
  readonly __wbg_get_velloconfiguniform_height_in_tiles: (a: number) => number;
  readonly __wbg_set_velloconfiguniform_height_in_tiles: (a: number, b: number) => void;
  readonly __wbg_get_velloconfiguniform_target_width: (a: number) => number;
  readonly __wbg_set_velloconfiguniform_target_width: (a: number, b: number) => void;
  readonly __wbg_get_velloconfiguniform_target_height: (a: number) => number;
  readonly __wbg_set_velloconfiguniform_target_height: (a: number, b: number) => void;
  readonly __wbg_get_velloconfiguniform_base_color: (a: number) => number;
  readonly __wbg_set_velloconfiguniform_base_color: (a: number, b: number) => void;
  readonly __wbg_get_velloconfiguniform_layout: (a: number) => number;
  readonly __wbg_set_velloconfiguniform_layout: (a: number, b: number) => void;
  readonly __wbg_get_velloconfiguniform_binning_size: (a: number) => number;
  readonly __wbg_set_velloconfiguniform_binning_size: (a: number, b: number) => void;
  readonly __wbg_get_velloconfiguniform_tiles_size: (a: number) => number;
  readonly __wbg_set_velloconfiguniform_tiles_size: (a: number, b: number) => void;
  readonly __wbg_get_velloconfiguniform_segments_size: (a: number) => number;
  readonly __wbg_set_velloconfiguniform_segments_size: (a: number, b: number) => void;
  readonly __wbg_get_velloconfiguniform_ptcl_size: (a: number) => number;
  readonly __wbg_set_velloconfiguniform_ptcl_size: (a: number, b: number) => void;
  readonly __wbg_velloworkgroupsize_free: (a: number) => void;
  readonly __wbg_velloworkgroupcounts_free: (a: number) => void;
  readonly __wbg_get_velloworkgroupcounts_use_large_path_scan: (a: number) => number;
  readonly __wbg_set_velloworkgroupcounts_use_large_path_scan: (a: number, b: number) => void;
  readonly __wbg_get_velloworkgroupcounts_path_reduce: (a: number) => number;
  readonly __wbg_set_velloworkgroupcounts_path_reduce: (a: number, b: number) => void;
  readonly __wbg_get_velloworkgroupcounts_path_reduce2: (a: number) => number;
  readonly __wbg_set_velloworkgroupcounts_path_reduce2: (a: number, b: number) => void;
  readonly __wbg_get_velloworkgroupcounts_path_scan1: (a: number) => number;
  readonly __wbg_set_velloworkgroupcounts_path_scan1: (a: number, b: number) => void;
  readonly __wbg_get_velloworkgroupcounts_path_scan: (a: number) => number;
  readonly __wbg_set_velloworkgroupcounts_path_scan: (a: number, b: number) => void;
  readonly __wbg_get_velloworkgroupcounts_bbox_clear: (a: number) => number;
  readonly __wbg_set_velloworkgroupcounts_bbox_clear: (a: number, b: number) => void;
  readonly __wbg_get_velloworkgroupcounts_path_seg: (a: number) => number;
  readonly __wbg_set_velloworkgroupcounts_path_seg: (a: number, b: number) => void;
  readonly __wbg_get_velloworkgroupcounts_draw_reduce: (a: number) => number;
  readonly __wbg_set_velloworkgroupcounts_draw_reduce: (a: number, b: number) => void;
  readonly __wbg_get_velloworkgroupcounts_draw_leaf: (a: number) => number;
  readonly __wbg_set_velloworkgroupcounts_draw_leaf: (a: number, b: number) => void;
  readonly __wbg_get_velloworkgroupcounts_clip_reduce: (a: number) => number;
  readonly __wbg_set_velloworkgroupcounts_clip_reduce: (a: number, b: number) => void;
  readonly __wbg_get_velloworkgroupcounts_clip_leaf: (a: number) => number;
  readonly __wbg_set_velloworkgroupcounts_clip_leaf: (a: number, b: number) => void;
  readonly __wbg_get_velloworkgroupcounts_binning: (a: number) => number;
  readonly __wbg_set_velloworkgroupcounts_binning: (a: number, b: number) => void;
  readonly __wbg_get_velloworkgroupcounts_tile_alloc: (a: number) => number;
  readonly __wbg_set_velloworkgroupcounts_tile_alloc: (a: number, b: number) => void;
  readonly __wbg_get_velloworkgroupcounts_path_coarse: (a: number) => number;
  readonly __wbg_set_velloworkgroupcounts_path_coarse: (a: number, b: number) => void;
  readonly __wbg_get_velloworkgroupcounts_backdrop: (a: number) => number;
  readonly __wbg_set_velloworkgroupcounts_backdrop: (a: number, b: number) => void;
  readonly __wbg_get_velloworkgroupcounts_coarse: (a: number) => number;
  readonly __wbg_set_velloworkgroupcounts_coarse: (a: number, b: number) => void;
  readonly __wbg_get_velloworkgroupcounts_fine: (a: number) => number;
  readonly __wbg_set_velloworkgroupcounts_fine: (a: number, b: number) => void;
  readonly __wbg_vellobuffersize_free: (a: number) => void;
  readonly __wbg_get_vellobuffersize_size_in_bytes: (a: number) => number;
  readonly __wbg_set_vellobuffersize_size_in_bytes: (a: number, b: number) => void;
  readonly __wbg_vellobuffersizes_free: (a: number) => void;
  readonly __wbg_get_vellobuffersizes_path_reduced: (a: number) => number;
  readonly __wbg_set_vellobuffersizes_path_reduced: (a: number, b: number) => void;
  readonly __wbg_get_vellobuffersizes_path_reduced2: (a: number) => number;
  readonly __wbg_set_vellobuffersizes_path_reduced2: (a: number, b: number) => void;
  readonly __wbg_get_vellobuffersizes_path_reduced_scan: (a: number) => number;
  readonly __wbg_set_vellobuffersizes_path_reduced_scan: (a: number, b: number) => void;
  readonly __wbg_get_vellobuffersizes_path_monoids: (a: number) => number;
  readonly __wbg_set_vellobuffersizes_path_monoids: (a: number, b: number) => void;
  readonly __wbg_get_vellobuffersizes_path_bboxes: (a: number) => number;
  readonly __wbg_set_vellobuffersizes_path_bboxes: (a: number, b: number) => void;
  readonly __wbg_get_vellobuffersizes_cubics: (a: number) => number;
  readonly __wbg_set_vellobuffersizes_cubics: (a: number, b: number) => void;
  readonly __wbg_get_vellobuffersizes_draw_reduced: (a: number) => number;
  readonly __wbg_set_vellobuffersizes_draw_reduced: (a: number, b: number) => void;
  readonly __wbg_get_vellobuffersizes_draw_monoids: (a: number) => number;
  readonly __wbg_set_vellobuffersizes_draw_monoids: (a: number, b: number) => void;
  readonly __wbg_get_vellobuffersizes_info: (a: number) => number;
  readonly __wbg_set_vellobuffersizes_info: (a: number, b: number) => void;
  readonly __wbg_get_vellobuffersizes_clip_inps: (a: number) => number;
  readonly __wbg_set_vellobuffersizes_clip_inps: (a: number, b: number) => void;
  readonly __wbg_get_vellobuffersizes_clip_els: (a: number) => number;
  readonly __wbg_set_vellobuffersizes_clip_els: (a: number, b: number) => void;
  readonly __wbg_get_vellobuffersizes_clip_bics: (a: number) => number;
  readonly __wbg_set_vellobuffersizes_clip_bics: (a: number, b: number) => void;
  readonly __wbg_get_vellobuffersizes_clip_bboxes: (a: number) => number;
  readonly __wbg_set_vellobuffersizes_clip_bboxes: (a: number, b: number) => void;
  readonly __wbg_get_vellobuffersizes_draw_bboxes: (a: number) => number;
  readonly __wbg_set_vellobuffersizes_draw_bboxes: (a: number, b: number) => void;
  readonly __wbg_get_vellobuffersizes_bump_alloc: (a: number) => number;
  readonly __wbg_set_vellobuffersizes_bump_alloc: (a: number, b: number) => void;
  readonly __wbg_get_vellobuffersizes_bin_headers: (a: number) => number;
  readonly __wbg_set_vellobuffersizes_bin_headers: (a: number, b: number) => void;
  readonly __wbg_get_vellobuffersizes_paths: (a: number) => number;
  readonly __wbg_set_vellobuffersizes_paths: (a: number, b: number) => void;
  readonly __wbg_get_vellobuffersizes_bin_data: (a: number) => number;
  readonly __wbg_set_vellobuffersizes_bin_data: (a: number, b: number) => void;
  readonly __wbg_get_vellobuffersizes_tiles: (a: number) => number;
  readonly __wbg_set_vellobuffersizes_tiles: (a: number, b: number) => void;
  readonly __wbg_get_vellobuffersizes_segments: (a: number) => number;
  readonly __wbg_set_vellobuffersizes_segments: (a: number, b: number) => void;
  readonly __wbg_get_vellobuffersizes_ptcl: (a: number) => number;
  readonly __wbg_set_vellobuffersizes_ptcl: (a: number, b: number) => void;
  readonly __wbg_renderinfo_free: (a: number) => void;
  readonly renderinfo_scene: (a: number) => number;
  readonly renderinfo_layout: (a: number) => number;
  readonly renderinfo_config_uniform: (a: number) => number;
  readonly renderinfo_workgroup_counts: (a: number) => number;
  readonly renderinfo_buffer_sizes: (a: number) => number;
  readonly renderinfo_config_bytes: (a: number) => number;
  readonly __wbg_velloencoding_free: (a: number) => void;
  readonly velloencoding_new: () => number;
  readonly velloencoding_reset: (a: number, b: number) => void;
  readonly velloencoding_linewidth: (a: number, b: number) => void;
  readonly velloencoding_matrix: (a: number, b: number, c: number, d: number, e: number, f: number, g: number) => void;
  readonly velloencoding_json_path: (a: number, b: number, c: number, d: number, e: number) => void;
  readonly velloencoding_color: (a: number, b: number) => void;
  readonly velloencoding_render: (a: number, b: number, c: number, d: number) => number;
  readonly run: () => void;
  readonly __wbg_set_velloworkgroupsize_x: (a: number, b: number) => void;
  readonly __wbg_set_velloworkgroupsize_y: (a: number, b: number) => void;
  readonly __wbg_set_velloworkgroupsize_z: (a: number, b: number) => void;
  readonly __wbg_set_vellolayout_n_draw_objects: (a: number, b: number) => void;
  readonly __wbg_get_velloworkgroupsize_x: (a: number) => number;
  readonly __wbg_get_velloworkgroupsize_y: (a: number) => number;
  readonly __wbg_get_velloworkgroupsize_z: (a: number) => number;
  readonly __wbg_get_vellolayout_n_draw_objects: (a: number) => number;
  readonly __wbindgen_malloc: (a: number, b: number) => number;
  readonly __wbindgen_realloc: (a: number, b: number, c: number, d: number) => number;
  readonly __wbindgen_start: () => void;
}

export type SyncInitInput = BufferSource | WebAssembly.Module;
/**
* Instantiates the given `module`, which can either be bytes or
* a precompiled `WebAssembly.Module`.
*
* @param {SyncInitInput} module
*
* @returns {InitOutput}
*/
export function initSync(module: SyncInitInput): InitOutput;

/**
* If `module_or_path` is {RequestInfo} or {URL}, makes a request and
* for everything else, calls `WebAssembly.instantiate` directly.
*
* @param {InitInput | Promise<InitInput>} module_or_path
*
* @returns {Promise<InitOutput>}
*/
export default function __wbg_init (module_or_path?: InitInput | Promise<InitInput>): Promise<InitOutput>;
