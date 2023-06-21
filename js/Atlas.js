
export default class Atlas {

  constructor() {
    // TODO: actual implementation!!!

    this.binPacker = new phet.dot.BinPacker( new phet.dot.Bounds2( 0, 0, 1024, 1024 ) );
  }

  // StubImage
  addImage( image ) {
    const tempGutter = 2;
    // TODO: gutters!!!! See SpriteSheet
    const bin = this.binPacker.allocate( image.width + tempGutter * 2, image.height + tempGutter * 2 );

    if ( !bin ) {
      throw new Error( 'could not allocate bin' );
    }

    return bin.bounds.leftTop.plusXY( tempGutter, tempGutter );
  }
}
