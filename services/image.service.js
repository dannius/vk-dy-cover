const fs = require('fs');
const fetch = require('node-fetch');
const { createCanvas, loadImage, Image } = require('canvas');

class ImageService {
  constructor() {
    this.canvas = undefined;
    this.ctx = undefined;
  }

  async createCover(image, pathToSave, params) {
    this.canvas = createCanvas(image.width, image.height);
    this.ctx = this.canvas.getContext('2d');
    this.ctx.drawImage(image, 0, 0);

    // draw background image
    this.ctx.drawImage(image, 0, 0);
    // draw user image
    const userCanvas = this.getUserPhotoCanvas(params.photo);
    // draw text
    this.drawText(params.text.toUpperCase(), params.x + 125, params.y + 38);

    this.ctx.drawImage(userCanvas, params.x, params.y);

    return await this.saveImageToDisk(pathToSave);
  }

  getUserPhotoCanvas(photo) {
    const userCanvas = createCanvas(photo.width, photo.height);
    const ctx = userCanvas.getContext('2d');
    const radius = 45;

    ctx.beginPath();
    ctx.arc(45, 45, radius, 0, Math.PI * 2, true);
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

  drawText(text, x, y) {
    this.ctx.font = "24px Gotham Pro Narrow";
    this.ctx.fillStyle = "black";
    this.ctx.fillText(text, x, y);
  }

  saveImageToDisk(pathToSave) {
    const output = fs.createWriteStream(pathToSave);

    let stream = this.canvas.createPNGStream();

    stream.on('data', function(chunk){
      output.write(chunk);
    });

    return new Promise(resolve => {
      stream.on('end', _ => {
        const filename = pathToSave.split('/').pop();
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
