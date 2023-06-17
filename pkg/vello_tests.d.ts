/* tslint:disable */
/* eslint-disable */
/**
*/
export function run(): void;
/**
*/
export enum VelloMix {
/**
* Default attribute which specifies no blending. The blending formula simply selects the source color.
*/
  Normal = 0,
/**
* Source color is multiplied by the destination color and replaces the destination.
*/
  Multiply = 1,
/**
* Multiplies the complements of the backdrop and source color values, then complements the result.
*/
  Screen = 2,
/**
* Multiplies or screens the colors, depending on the backdrop color value.
*/
  Overlay = 3,
/**
* Selects the darker of the backdrop and source colors.
*/
  Darken = 4,
/**
* Selects the lighter of the backdrop and source colors.
*/
  Lighten = 5,
/**
* Brightens the backdrop color to reflect the source color. Painting with black produces no
* change.
*/
  ColorDodge = 6,
/**
* Darkens the backdrop color to reflect the source color. Painting with white produces no
* change.
*/
  ColorBurn = 7,
/**
* Multiplies or screens the colors, depending on the source color value. The effect is
* similar to shining a harsh spotlight on the backdrop.
*/
  HardLight = 8,
/**
* Darkens or lightens the colors, depending on the source color value. The effect is similar
* to shining a diffused spotlight on the backdrop.
*/
  SoftLight = 9,
/**
* Subtracts the darker of the two constituent colors from the lighter color.
*/
  Difference = 10,
/**
* Produces an effect similar to that of the Difference mode but lower in contrast. Painting
* with white inverts the backdrop color; painting with black produces no change.
*/
  Exclusion = 11,
/**
* Creates a color with the hue of the source color and the saturation and luminosity of the
* backdrop color.
*/
  Hue = 12,
/**
* Creates a color with the saturation of the source color and the hue and luminosity of the
* backdrop color. Painting with this mode in an area of the backdrop that is a pure gray
* (no saturation) produces no change.
*/
  Saturation = 13,
/**
* Creates a color with the hue and saturation of the source color and the luminosity of the
* backdrop color. This preserves the gray levels of the backdrop and is useful for coloring
* monochrome images or tinting color images.
*/
  Color = 14,
/**
* Creates a color with the luminosity of the source color and the hue and saturation of the
* backdrop color. This produces an inverse effect to that of the Color mode.
*/
  Luminosity = 15,
/**
* Clip is the same as normal, but the latter always creates an isolated blend group and the
* former can optimize that out.
*/
  Clip = 128,
}
/**
*/
export enum VelloCompose {
/**
* No regions are enabled.
*/
  Clear = 0,
/**
* Only the source will be present.
*/
  Copy = 1,
/**
* Only the destination will be present.
*/
  Dest = 2,
/**
* The source is placed over the destination.
*/
  SrcOver = 3,
/**
* The destination is placed over the source.
*/
  DestOver = 4,
/**
* The parts of the source that overlap with the destination are placed.
*/
  SrcIn = 5,
/**
* The parts of the destination that overlap with the source are placed.
*/
  DestIn = 6,
/**
* The parts of the source that fall outside of the destination are placed.
*/
  SrcOut = 7,
/**
* The parts of the destination that fall outside of the source are placed.
*/
  DestOut = 8,
/**
* The parts of the source which overlap the destination replace the destination. The
* destination is placed everywhere else.
*/
  SrcAtop = 9,
/**
* The parts of the destination which overlaps the source replace the source. The source is
* placed everywhere else.
*/
  DestAtop = 10,
/**
* The non-overlapping regions of source and destination are combined.
*/
  Xor = 11,
/**
* The sum of the source image and destination image is displayed.
*/
  Plus = 12,
/**
* Allows two elements to cross fade by changing their opacities from 0 to 1 on one
* element and 1 to 0 on the other element.
*/
  PlusLighter = 13,
}
/**
*/
export class RenderInfo {
  free(): void;
/**
* @returns {Uint8Array}
*/
  scene(): Uint8Array;
/**
* @returns {Uint8Array}
*/
  ramps(): Uint8Array;
/**
* @returns {BigUint64Array}
*/
  images(): BigUint64Array;
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
/**
*/
  images_height: number;
/**
*/
  images_width: number;
/**
*/
  ramps_height: number;
/**
*/
  ramps_width: number;
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
* @returns {VelloEncoding}
*/
  static new_scene(): VelloEncoding;
/**
* @param {number} width
* @param {number} height
* @returns {VelloImage}
*/
  static new_image(width: number, height: number): VelloImage;
/**
* @param {VelloEncoding} other
*/
  append(other: VelloEncoding): void;
/**
* @param {VelloEncoding} other
* @param {number} a00
* @param {number} a10
* @param {number} a01
* @param {number} a11
* @param {number} a20
* @param {number} a21
*/
  append_with_transform(other: VelloEncoding, a00: number, a10: number, a01: number, a11: number, a20: number, a21: number): void;
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
* @param {number} a10
* @param {number} a01
* @param {number} a11
* @param {number} a20
* @param {number} a21
*/
  matrix(a00: number, a10: number, a01: number, a11: number, a20: number, a21: number): void;
/**
* @param {boolean} is_fill
* @param {string} path
*/
  svg_path(is_fill: boolean, path: string): void;
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
* @param {number} x0
* @param {number} y0
* @param {number} x1
* @param {number} y1
* @param {number} alpha
* @param {number} extend
* @param {Float32Array} offsets
* @param {Uint32Array} colors
*/
  linear_gradient(x0: number, y0: number, x1: number, y1: number, alpha: number, extend: number, offsets: Float32Array, colors: Uint32Array): void;
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
  radial_gradient(x0: number, y0: number, x1: number, y1: number, r0: number, r1: number, alpha: number, extend: number, offsets: Float32Array, colors: Uint32Array): void;
/**
* @param {number} mix
* @param {number} compose
* @param {number} alpha
*/
  begin_clip(mix: number, compose: number, alpha: number): void;
/**
*/
  end_clip(): void;
/**
* @param {VelloImage} image
* @param {number} alpha
*/
  image(image: VelloImage, alpha: number): void;
/**
*/
  finalize_scene(): void;
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
export class VelloImage {
  free(): void;
/**
* @returns {bigint}
*/
  id(): bigint;
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
  readonly __wbg_get_renderinfo_ramps_width: (a: number) => number;
  readonly __wbg_set_renderinfo_ramps_width: (a: number, b: number) => void;
  readonly __wbg_get_renderinfo_ramps_height: (a: number) => number;
  readonly __wbg_set_renderinfo_ramps_height: (a: number, b: number) => void;
  readonly __wbg_get_renderinfo_images_width: (a: number) => number;
  readonly __wbg_set_renderinfo_images_width: (a: number, b: number) => void;
  readonly __wbg_get_renderinfo_images_height: (a: number) => number;
  readonly __wbg_set_renderinfo_images_height: (a: number, b: number) => void;
  readonly renderinfo_scene: (a: number) => number;
  readonly renderinfo_ramps: (a: number) => number;
  readonly renderinfo_images: (a: number) => number;
  readonly renderinfo_layout: (a: number) => number;
  readonly renderinfo_config_uniform: (a: number) => number;
  readonly renderinfo_workgroup_counts: (a: number) => number;
  readonly renderinfo_buffer_sizes: (a: number) => number;
  readonly renderinfo_config_bytes: (a: number) => number;
  readonly __wbg_velloimage_free: (a: number) => void;
  readonly velloimage_id: (a: number) => number;
  readonly __wbg_velloencoding_free: (a: number) => void;
  readonly velloencoding_new: () => number;
  readonly velloencoding_new_scene: () => number;
  readonly velloencoding_new_image: (a: number, b: number) => number;
  readonly velloencoding_append: (a: number, b: number) => void;
  readonly velloencoding_append_with_transform: (a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: number) => void;
  readonly velloencoding_reset: (a: number, b: number) => void;
  readonly velloencoding_linewidth: (a: number, b: number) => void;
  readonly velloencoding_matrix: (a: number, b: number, c: number, d: number, e: number, f: number, g: number) => void;
  readonly velloencoding_svg_path: (a: number, b: number, c: number, d: number) => void;
  readonly velloencoding_json_path: (a: number, b: number, c: number, d: number, e: number) => void;
  readonly velloencoding_color: (a: number, b: number) => void;
  readonly velloencoding_linear_gradient: (a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: number, i: number) => void;
  readonly velloencoding_radial_gradient: (a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: number, i: number, j: number, k: number) => void;
  readonly velloencoding_begin_clip: (a: number, b: number, c: number, d: number) => void;
  readonly velloencoding_end_clip: (a: number) => void;
  readonly velloencoding_image: (a: number, b: number, c: number) => void;
  readonly velloencoding_finalize_scene: (a: number) => void;
  readonly velloencoding_render: (a: number, b: number, c: number, d: number) => number;
  readonly run: () => void;
  readonly __wbg_set_velloworkgroupsize_x: (a: number, b: number) => void;
  readonly __wbg_set_velloworkgroupsize_y: (a: number, b: number) => void;
  readonly __wbg_set_velloworkgroupsize_z: (a: number, b: number) => void;
  readonly __wbg_set_vellolayout_n_draw_objects: (a: number, b: number) => void;
  readonly __wbg_set_velloconfiguniform_width_in_tiles: (a: number, b: number) => void;
  readonly __wbg_set_velloconfiguniform_height_in_tiles: (a: number, b: number) => void;
  readonly __wbg_set_velloconfiguniform_target_width: (a: number, b: number) => void;
  readonly __wbg_set_velloconfiguniform_target_height: (a: number, b: number) => void;
  readonly __wbg_get_velloworkgroupsize_x: (a: number) => number;
  readonly __wbg_get_velloworkgroupsize_y: (a: number) => number;
  readonly __wbg_get_velloworkgroupsize_z: (a: number) => number;
  readonly __wbg_get_vellolayout_n_draw_objects: (a: number) => number;
  readonly __wbg_get_velloconfiguniform_width_in_tiles: (a: number) => number;
  readonly __wbg_get_velloconfiguniform_height_in_tiles: (a: number) => number;
  readonly __wbg_get_velloconfiguniform_target_width: (a: number) => number;
  readonly __wbg_get_velloconfiguniform_target_height: (a: number) => number;
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
