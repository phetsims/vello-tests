import Atlas from './Atlas.js';
import { AtlasSubImage, lerp_rgba8, to_premul_u32 } from './Encoding.js';

const NUM_RAMP_SAMPLES = 512;
const STARTING_RAMPS = 32;

export default class DeviceContext {
  constructor( device ) {
    this.device = device;

    // TODO: don't hardcode this
    this.rampArrayBuffer = new ArrayBuffer( NUM_RAMP_SAMPLES * STARTING_RAMPS * 4 );
    this.rampArrayView = new DataView( this.rampArrayBuffer );
    this.rampWidth = NUM_RAMP_SAMPLES;
    this.rampHeight = STARTING_RAMPS;
    this.rampTexture = null;
    this.rampTextureView = null;

    this.replaceRampTexture();

    this.atlas = new Atlas();
    this.images = [];
  }

  // @public
  updateRampPatches( patches ) {
    // TODO: actually do intelligent things, this is just to test it's working

    patches.forEach( ( patch, i ) => {
      patch.id = i;

      // TODO: rename to patch.colorStops;
      this.writeRamp( i, patch.stops );
    } );
  }

  // @public
  updateImagePatches( patches ) {
    this.images.length = 0;

    // TODO: actually keep this stuff!
    this.atlas = new Atlas();

    patches.forEach( patch => {
      const pos = this.atlas.addImage( patch.image );

      const atlasSubImage = new AtlasSubImage( patch.image, pos.x, pos.y );
      patch.atlasSubImage = atlasSubImage

      this.images.push( atlasSubImage );
    } );
  }

  // @private
  replaceRampTexture() {
    this.rampTexture && this.rampTexture.destroy();

    this.rampTexture = this.device.createTexture( {
      label: 'rampTexture',
      size: {
        width: this.rampWidth,
        height: this.rampHeight,
        depthOrArrayLayers: 1
      },
      format: 'rgba8unorm',
      usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST
    } );

    this.rampTextureView = this.rampTexture.createView( {
      label: 'rampTextureView',
      format: 'rgba8unorm',
      dimension: '2d'
    } );
  }

  // @private
  updateRampTexture() {
    this.device.queue.writeTexture( {
      texture: this.rampTexture
    }, this.rampArrayBuffer, {
      offset: 0,
      bytesPerRow: this.rampWidth * 4
    }, {
      width: this.rampWidth,
      height: this.rampHeight,
      depthOrArrayLayers: 1
    } );
  }

  // @private
  writeRamp( index, colorStops ) {
    const offset = index * NUM_RAMP_SAMPLES * 4;

    let last_u = 0.0;
    let last_c = colorStops[ 0 ].color;
    let this_u = last_u;
    let this_c = last_c;
    let j = 0;

    for ( let i = 0; i < NUM_RAMP_SAMPLES; i++ ) {
      let u = i / ( NUM_RAMP_SAMPLES - 1 );
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
      const u32 = to_premul_u32( du < 1e-9 ? this_c : lerp_rgba8( last_c, this_c, ( u - last_u ) / du ) );
      this.rampArrayView.setUint32( offset + i * 4, u32, false );
      // buf.pushReversedU32( u32 );
    }
    //
    // for ( let i = 0; i < NUM_RAMP_SAMPLES; i++ ) {
    //
    //   const color = colorStops.getColor( i / ( NUM_RAMP_SAMPLES - 1 ) );
    //   this.rampArrayView.setUint8( offset + i * 4 + 0, color.r * 255 );
    //   this.rampArrayView.setUint8( offset + i * 4 + 1, color.g * 255 );
    //   this.rampArrayView.setUint8( offset + i * 4 + 2, color.b * 255 );
    //   this.rampArrayView.setUint8( offset + i * 4 + 3, color.a * 255 );
    // }
  }

  dispose() {
    this.rampTexture && this.rampTexture.destroy();
  }
}
