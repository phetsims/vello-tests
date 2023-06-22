import Atlas from './Atlas.js';
import Ramps from './Ramps.js';

export default class DeviceContext {
  constructor( device ) {
    this.device = device;

    this.ramps = new Ramps( device );
    this.atlas = new Atlas( device );
  }

  dispose() {
    this.ramps.dispose();
    this.atlas.dispose();

    // TODO: destroy the device too?
  }
}
