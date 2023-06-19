
import { VelloEncoding } from "../pkg/vello_tests.js";

// An adapter for the WASM rust encoding code
// TODO: interface/supertype for WASM and JS encodings
export default class WASMEncoding {
  constructor() {
    this.encoding = new VelloEncoding();
    this.isFill = false;
    this.pathString = '';

    // image ID => stub
    this.imageMap = new Map();
  }

  is_empty() {
    return this.encoding.is_empty();
  }

  reset( is_fragment ) {
    this.encoding.reset( is_fragment );
  }

  append( other, transform = null ) {
    if ( transform ) {
      this.encoding.append_with_transform( other.encoding, transform.a00, transform.a10, transform.a01, transform.a11, transform.a02, transform.a12 );
    }
    else {
      this.encoding.append( other.encoding );
    }
    this.imageMap = new Map( [ ...this.imageMap, ...other.imageMap ] );
  }

  encode_linewidth( linewidth ) {
    this.encoding.linewidth( linewidth );
  }

  encode_transform( transform ) {
    this.encoding.matrix( transform.a00, transform.a10, transform.a01, transform.a11, transform.a02, transform.a12 );
  }

  encode_path( is_fill ) {
    this.isFill = is_fill;
    this.pathString = '';
  }

  move_to( x, y ) {
    this.pathString += `M ${x} ${y} `;
  }

  line_to( x, y ) {
    this.pathString += `L ${x} ${y} `;
  }

  quad_to( x1, y1, x2, y2 ) {
    this.pathString += `Q ${x1} ${y1} ${x2} ${y2} `;
  }

  cubic_to( x1, y1, x2, y2, x3, y3 ) {
    this.pathString += `C ${x1} ${y1} ${x2} ${y2} ${x3} ${y3} `;
  }

  close() {
    this.pathString += 'Z ';
  }

  finish( insert_path_marker ) {
    this.encoding.svg_path( this.isFill, insert_path_marker, this.pathString );
  }

  encode_color( color ) {
    this.encoding.color( color );
  }

  encode_linear_gradient( x0, y0, x1, y1, color_stops, alpha, extend ) {
    this.encoding.linear_gradient( x0, y0, x1, y1, alpha, extend, new Float32Array( color_stops.map( stop => stop.offset ) ), new Uint32Array( color_stops.map( stop => stop.color ) ) );
  }

  encode_radial_gradient( x0, y0, r0, x1, y1, r1, color_stops, alpha, extend ) {
    this.encoding.radial_gradient( x0, y0, r0, x1, y1, r1, alpha, extend, new Float32Array( color_stops.map( stop => stop.offset ) ), new Uint32Array( color_stops.map( stop => stop.color ) ) );
  }

  encode_image( image ) {
    // NOTE: memory leaks like crazy, and overwrites
    // TODO: improve

    const velloImage = VelloEncoding.new_image( image.width, image.height );
    const id = velloImage.id();
    this.imageMap.set( id, image );
    this.encoding.image( velloImage, 1 );
  }

  encode_begin_clip( mix, compose, alpha ) {
    this.encoding.begin_clip( mix, compose, alpha );
  }

  encode_end_clip() {
    this.encoding.end_clip();
  }

  // TODO: make this workaround not needed
  // TODO: factor out, this is common code
  finalize_scene() {
    this.encode_path( true );
    this.move_to( 0, 0 );
    this.line_to( 1, 0 );
    this.close();
    this.finish( true );
  }

  print_debug() {
    this.encoding.print_debug();
  }

  prepareRender( width, height, base_color ) {
    const wasmRenderInfo = this.encoding.render( width, height, base_color );

    const _workgroupCounts = wasmRenderInfo.workgroup_counts();
    const _bufferSizes = wasmRenderInfo.buffer_sizes();

    const workgroupCounts = {
      use_large_path_scan: _workgroupCounts.use_large_path_scan
    };
    [
      'path_reduce',
      'path_reduce2',
      'path_scan1',
      'path_scan',
      'bbox_clear',
      'path_seg',
      'draw_reduce',
      'draw_leaf',
      'clip_reduce',
      'clip_leaf',
      'binning',
      'tile_alloc',
      'path_coarse',
      'backdrop',
      'coarse',
      'fine'
    ].forEach( key => {
      workgroupCounts[ key ] = { x: _workgroupCounts[ key ].x, y: _workgroupCounts[ key ].y, z: _workgroupCounts[ key ].z };
    } );

    const bufferSizes = {};
    [
      'path_reduced',
      'path_reduced2',
      'path_reduced_scan',
      'path_monoids',
      'path_bboxes',
      'cubics',
      'draw_reduced',
      'draw_monoids',
      'info',
      'clip_inps',
      'clip_els',
      'clip_bics',
      'clip_bboxes',
      'draw_bboxes',
      'bump_alloc',
      'bin_headers',
      'paths',
      'bin_data',
      'tiles',
      'segments',
      'ptcl'
    ].forEach( key => {
      bufferSizes[ key ] = { size_in_bytes: () => _bufferSizes[ key ].size_in_bytes };
    } );

    const imageData = wasmRenderInfo.images();
    const images = [];
    for ( let i = 0; i < imageData.length; i += 3 ) {
      const id = imageData[ i ];
      const x = Number( imageData[ i + 1 ] );
      const y = Number( imageData[ i + 2 ] );
      const image = this.imageMap.get( id );
      if ( !image ) {
        throw new Error( 'missing image' );
      }

      images.push( {
        image,
        x,
        y
      } );
    }

    return {
      packed: wasmRenderInfo.scene(),
      layout: wasmRenderInfo.layout(),

      // TODO: ramp_cache.ramps(), image_cache.images()
      ramps: {
        width: wasmRenderInfo.ramps_width,
        height: wasmRenderInfo.ramps_height,
        data: wasmRenderInfo.ramps()
      },
      images: {
        width: wasmRenderInfo.images_width,
        height: wasmRenderInfo.images_height,
        images: images
      },
      renderConfig: {
        gpu: wasmRenderInfo.config_uniform(),
        workgroup_counts: workgroupCounts,
        buffer_sizes: bufferSizes,
        config_bytes: wasmRenderInfo.config_bytes()
      }
    }
  }
}
