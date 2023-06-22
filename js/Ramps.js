import { lerp_rgba8, to_premul_u32 } from './Encoding.js';

const NUM_RAMP_SAMPLES = 512;
const STARTING_RAMPS = 32;

export default class Ramps {
  constructor( device ) {

    this.device = device;

    // TODO: don't hardcode this
    this.arrayBuffer = new ArrayBuffer( NUM_RAMP_SAMPLES * STARTING_RAMPS * 4 );
    this.arrayView = new DataView( this.arrayBuffer );
    this.width = NUM_RAMP_SAMPLES;
    this.height = STARTING_RAMPS;
    this.texture = null;
    this.textureView = null;

    this.replaceTexture();
  }

  // @public
  updatePatches( patches ) {
    // TODO: actually do intelligent things, this is just to test it's working

    patches.forEach( ( patch, i ) => {
      patch.id = i;

      // TODO: rename to patch.colorStops;
      this.writeRamp( i, patch.stops );
    } );
  }

  // @private
  replaceTexture() {
    this.texture && this.texture.destroy();

    this.texture = this.device.createTexture( {
      label: 'ramps texture',
      size: {
        width: this.width,
        height: this.height,
        depthOrArrayLayers: 1
      },
      format: 'rgba8unorm',
      usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST
    } );

    this.textureView = this.texture.createView( {
      label: 'ramps texture view',
      format: 'rgba8unorm',
      dimension: '2d'
    } );
  }

  // @public
  updateTexture() {
    this.device.queue.writeTexture( {
      texture: this.texture
    }, this.arrayBuffer, {
      offset: 0,
      bytesPerRow: this.width * 4
    }, {
      width: this.width,
      height: this.height,
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
      this.arrayView.setUint32( offset + i * 4, u32, false );
    }
  }

  dispose() {
    this.texture && this.texture.dispose();
  }
}