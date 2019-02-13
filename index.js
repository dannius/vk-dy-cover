require('dotenv').config();

const express = require('express');
const easyvk = require('easyvk');
const { interval: RxInterval$ } = require('rxjs');

const app = express();
app.use("/covers", express.static('covers'));
app.use("/assets", express.static('assets'));

// settings
const {
  port,
  inputCoverName,
} = require('./lib/constants');

// services
const { imageService } = require('./services');

app.listen(port, serve);

async function serve() {
  try {
    const image = await imageService.readImageByPath(`${__dirname}/assets/${inputCoverName}`);
    const newCoverName = await imageService.createCover(image);

    // await updatePhoto(newCoverName);

    console.log('cover was updated');
  } catch (err) {
    console.log(`Error: ${err}`);
  }
}


async function updatePhoto(newCoverName) {
  const vk = await easyvk({
    access_token: process.env.ACCESS_TOKEN,
    save_session: true,
  });

  const fileData = await uploadPhoto(vk, newCoverName);

  return vk.call('photos.saveOwnerCoverPhoto', fileData);
}

async function uploadPhoto({ uploader }, newCoverName) {
  const uploadParams = {
    group_id: process.env.GROUP_ID,
    crop_x2: 1590,
    crop_y2: 400,
  }

  const { url: uploadUrl } = await uploader.getUploadURL('photos.getOwnerCoverPhotoUploadServer', uploadParams);
  const { vkr: fileData } = await uploader.uploadFile(uploadUrl, `${__dirname}/covers/${newCoverName}`, 'photo');

  return fileData;
}
