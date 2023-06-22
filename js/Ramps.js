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

    this.ramps = []; // [ index ] => RampEntry
    this.rampMap = new Map(); // RampEntry.getMapKey() => RampEntry
    this.dirty = false; // initially because it's empty! -- done after replaceTexture() so we don't start dirty
    this.generation = 0;
  }

  // @public
  updatePatches( patches ) {
    // TODO: actually do intelligent things, this is just to test it's working

    const generation = this.generation++;

    patches.forEach( ( patch, i ) => {
      const mapKey = RampEntry.getMapKey( patch.stops );
      let rampEntry = this.rampMap.get( mapKey );
      if ( rampEntry ) {
        rampEntry.generation = generation;
        patch.id = rampEntry.index;
      }
      else {
        let newIndex;

        if ( this.ramps.length < this.height ) {
          newIndex = this.ramps.length;
        }
        else {
          const oldEntry = _.find( this.ramps, entry => entry.generation < generation - 1 );
          if ( oldEntry ) {
            this.rampMap.delete( oldEntry.getMapKey() );
            newIndex = oldEntry.index;
          }
          else {
            // Increase size!
            this.height *= 2;
            const newArrayBuffer = new ArrayBuffer( this.arrayBuffer.byteLength * 2 );
            const newArrayView = new DataView( newArrayBuffer );
            new Uint8Array( newArrayBuffer ).set( new Uint8Array( this.arrayBuffer ) ); // data copy (what is there)
            this.arrayBuffer = newArrayBuffer;
            this.arrayView = newArrayView;
            this.replaceTexture();

            newIndex = this.ramps.length;
          }
        }

        rampEntry = new RampEntry( patch.stops, newIndex, generation );
        this.ramps[ newIndex ] = rampEntry;
        this.rampMap.set( mapKey, rampEntry );
        patch.id = newIndex;
        this.writeRamp( rampEntry.index, patch.stops );
      }
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

    this.dirty = true;
  }

  // @public
  updateTexture() {
    if ( this.dirty ) {
      this.dirty = false;

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
  }

  // @private
  writeRamp( index, colorStops ) {
    this.dirty = true;

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

class RampEntry {
  constructor( colorStops, index, generation ) {
    this.colorStops = colorStops;
    this.index = index;
    this.generation = generation;
  }

  getMapKey() {
    return RampEntry.getMapKey( this.colorStops );
  }

  static getMapKey( colorStops ) {
    return colorStops.map( colorStop => `${colorStop.offset}-${colorStop.color}` ).join( ',' );
  }
}