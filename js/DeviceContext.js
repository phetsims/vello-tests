import Atlas from './Atlas.js';
import { AtlasSubImage, lerp_rgba8, to_premul_u32 } from './Encoding.js';

const NUM_RAMP_SAMPLES = 512;
const STARTING_RAMPS = 32;
const ATLAS_INITIAL_SIZE = 1024;

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

    // TODO: Do we have "repeat" on images also? Think repeating patterns!
    this.atlas = new Atlas();
    this.images = [];

    // TODO: atlas size (1) when no images?
    this.atlasWidth = ATLAS_INITIAL_SIZE;
    this.atlasHeight = ATLAS_INITIAL_SIZE;
    this.atlasTexture = null;
    this.atlasTextureView = null;

    this.replaceAtlasTexture();
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
  replaceAtlasTexture() {
    this.atlasTexture && this.atlasTexture.destroy();

    this.atlasTexture = this.device.createTexture( {
      label: 'atlasImage',
      size: {
        width: this.atlasWidth,
        height: this.atlasHeight,
        depthOrArrayLayers: 1
      },
      format: 'rgba8unorm',
      usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST
    } );
    this.atlasTextureView = this.atlasTexture.createView( {
      label: 'atlasImageView',
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
  updateAtlasTexture() {
    // TODO: don't draw in everything
    for ( let i = 0; i < this.images.length; i++ ) {
      const imageInfo = this.images[ i ]; // AtlasSubImage
      const image = imageInfo.image; // ImageStub
      const x = imageInfo.x;
      const y = imageInfo.y;

      this.device.queue.writeTexture( {
        texture: this.atlasTexture,
        origin: { x, y, z: 0 }
      }, image.buffer, {
        offset: 0,
        bytesPerRow: image.width * 4
      }, {
        width: image.width,
        height: image.height,
        depthOrArrayLayers: 1
      } );
    }
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
    }
  }

  dispose() {
    this.rampTexture && this.rampTexture.destroy();
    this.atlasTexture && this.atlasTexture.destroy();

    // TODO: destroy the device too?
  }
}
