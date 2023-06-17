import { VelloEncoding } from "../pkg/vello_tests.js";

// TODO: cleanup
// image ID => { id, image, width, height, buffer }
const imageMap = {};

const addImage = ( width, height, buffer ) => {
  const image = VelloEncoding.new_image( width, height );
  const id = image.id();
  imageMap[ id ] = {
    id,
    image,
    width,
    height,
    buffer
  };
  return image;
};

export default imageMap;
export { addImage };
