const fs = require('fs');
const fetch = require('node-fetch');
const { createCanvas, loadImage, Image } = require('canvas');

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

    // draw background image
    this.ctx.drawImage(image, 0, 0);
    // draw user image
    const userCanvas = this.getUserPhotoCanvas(params.photo);
    // draw text
    this.drawText(params.text.toUpperCase());

    this.ctx.drawImage(userCanvas, 766, 168);

    return await this.saveImageToDisk();
  }

  getUserPhotoCanvas(photo) {
    const userCanvas = createCanvas(photo.width, photo.height);
    const ctx = userCanvas.getContext('2d');
    const radius = 50;

    ctx.beginPath();
    ctx.arc(50, 50, radius, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.clip();

    ctx.drawImage(photo, 0, 0, photo.width, photo.height);

    return userCanvas;
  }

  async readImageByPath(path) {
    return await loadImage(path);
  }

  async fetchUserPhoto(url) {
    const res = await fetch(url);
    const img = new Image();
    img.src = await res.buffer();

    return img;
  }

  drawText(text) {
    this.ctx.font = "30px Gotham Pro Narrow";
    this.ctx.fillStyle = "black";
    this.ctx.fillText(text, 908, 210);
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

module.exports = {
  ImageService,
  imageSvc: new ImageService(),
};
