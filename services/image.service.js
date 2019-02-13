const fs = require('fs');
const { createCanvas, loadImage } = require('canvas');

const { outputCoverName } = require('./../lib/constants');
const Helpers = require('./../lib/helpers');

class ImageService {
  constructor() {
    this.canvas = undefined;
    this.ctx = undefined;
  }

  async createCover(image, params) {
    this.canvas = createCanvas(image.width, image.height);
    this.ctx = this.canvas.getContext('2d');
    this.ctx.drawImage(image, 0, 0);

    return await this.saveImageToDisk();
  }

  async readImageByPath(path) {
    return await loadImage(path);
  }

  saveImageToDisk() {
    const [ name, extension ] = outputCoverName.split('.');
    const filename = `${name}__${Helpers.timestamp()}.${extension}`;

    const output = fs.createWriteStream(`${__dirname}/../covers/${filename}`);

    let stream = this.canvas.createPNGStream();

    stream.on('data', function(chunk){
      output.write(chunk);
    });

    return new Promise(resolve => {
      stream.on('end', _ => {
        console.log(`photo was saved to disc: ${filename}`);
        resolve(filename);
      });
    });;
  }
}

module.exports = ImageService;