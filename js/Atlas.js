import { AtlasSubImage } from './Encoding.js';

const ATLAS_INITIAL_SIZE = 1024;
const ATLAS_MAX_SIZE = 8192;

export default class Atlas {

  // TODO: better image atlas, something nice like https://github.com/nical/guillotiere?
  constructor( device ) {
    this.device = device;
    // TODO: actual implementation!!!

    // TODO: Do we have "repeat" on images also? Think repeating patterns!
    this.images = [];

    // TODO: atlas size (1) when no images?
    this.width = ATLAS_INITIAL_SIZE;
    this.height = ATLAS_INITIAL_SIZE;
    this.texture = null;
    this.textureView = null;

    this.replaceTexture();

    this.binPacker = new phet.dot.BinPacker( new phet.dot.Bounds2( 0, 0, 1024, 1024 ) );
  }

  // @public
  updatePatches( patches ) {
    this.images.length = 0;

    // TODO: actually keep this stuff!
    this.binPacker = new phet.dot.BinPacker( new phet.dot.Bounds2( 0, 0, 1024, 1024 ) );

    patches.forEach( patch => {
      const tempGutter = 2;
      // TODO: gutters!!!! See SpriteSheet
      const bin = this.binPacker.allocate( patch.image.width + tempGutter * 2, patch.image.height + tempGutter * 2 );

      if ( !bin ) {
        throw new Error( 'could not allocate bin' );
      }

      const pos = bin.bounds.leftTop.plusXY( tempGutter, tempGutter );

      // const pos = this.atlas.addImage( patch.image );

      const atlasSubImage = new AtlasSubImage( patch.image, pos.x, pos.y );
      patch.atlasSubImage = atlasSubImage

      this.images.push( atlasSubImage );
    } );
  }

  // @private
  replaceTexture() {
    this.texture && this.texture.destroy();

    this.texture = this.device.createTexture( {
      label: 'atlas texture',
      size: {
        width: this.width,
        height: this.height,
        depthOrArrayLayers: 1
      },
      format: 'rgba8unorm',
      usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST
    } );
    this.textureView = this.texture.createView( {
      label: 'atlas texture view',
      format: 'rgba8unorm',
      dimension: '2d'
    } );
  }

  // @public
  updateTexture() {
    // TODO: don't draw in everything
    for ( let i = 0; i < this.images.length; i++ ) {
      const imageInfo = this.images[ i ]; // AtlasSubImage
      const image = imageInfo.image; // BufferImage
      const x = imageInfo.x;
      const y = imageInfo.y;

      this.device.queue.writeTexture( {
        texture: this.texture,
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

  dispose() {
    this.texture && this.texture.destroy();
  }
}
