
// TODO: TypeScript this

// If we're applying labels to buffers, we'll need to create a new buffer for each allocation.
const APPLY_LABELS = false;
const AGE_TO_FREE = 2;

// Holds a bunch of buffers with COPY_SRC|COPY_DST|STORAGE that we can reuse (but with the ability to aggressively
// control memory usage). With changing scene/window size, we might have buffers that we need to permanently toss.
//
export default class BufferPool {

  constructor( device ) {
    this.generation = 0;
    this.device = device;

    // This is definitely unoptimized
    this.freeBuffers = [];
  }

  // @private
  createBuffer( size, label ) {
    return this.device.createBuffer( {
      size: Math.max( size, 16 ), // Min of 16 bytes used, copying vello buffer requirements
      usage: GPUBufferUsage.COPY_SRC | GPUBufferUsage.COPY_DST | GPUBufferUsage.STORAGE,

      // Conditionally apply the label
      ...( APPLY_LABELS ? { label } : {} )
    } );
  }

  // @public
  getBuffer( size, label ) {
    if ( !APPLY_LABELS ) {
      for ( let i = 0; i < this.freeBuffers.length; i++ ) {
        const entry = this.freeBuffers[ i ];
        if ( entry.size >= size ) {
          this.freeBuffers.splice( i, 1 );
          return entry.buffer;
        }
      }
    }
    return this.createBuffer( size, label );
  }

  // @public
  freeBuffer( buffer ) {
    this.freeBuffers.push( new BufferEntry( buffer, buffer.size, this.generation ) );
  }

  // @public
  nextGeneration() {
    this.generation++;

    // Clear out unused buffers
    for ( let i = 0; i < this.freeBuffers.length; i++ ) {
      const entry = this.freeBuffers[ i ];
      if ( this.generation - entry.generation > AGE_TO_FREE ) {
        entry.buffer.destroy();
        this.freeBuffers.splice( i, 1 );
        i--;
      }
    }
  }
}

class BufferEntry {
  constructor( buffer, size, generation ) {
    this.buffer = buffer;
    this.size = size;
    this.generation = generation;
  }
}