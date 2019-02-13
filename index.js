require('dotenv').config();

const express = require('express');
const easyvk = require('easyvk');
const { interval: RxInterval$ } = require('rxjs');

const app = express();
app.use("/covers", express.static('covers'));

//settings
const { port } = require('./lib');

app.listen(port, serve);

async function serve() {
  try {
    await updatePhoto();
    console.log('photo was updated');
  } catch (err) {
    console.log(`Error: ${err}`);
  }
}


async function updatePhoto() {
  const vk = await easyvk({
    access_token: process.env.ACCESS_TOKEN,
    save_session: true,
  });

  const fileData = await uploadPhoto(vk);

  return vk.call('photos.saveOwnerCoverPhoto', fileData);
}

async function uploadPhoto({ uploader }) {
  const uploadParams = {
    group_id: process.env.GROUP_ID,
    crop_x2: 1590,
    crop_y2: 400,
  }

  const { url: uploadUrl } = await uploader.getUploadURL('photos.getOwnerCoverPhotoUploadServer', uploadParams);
  const { vkr: fileData } = await uploader.uploadFile(uploadUrl, `${__dirname}/covers/test.jpeg`, 'photo');

  return fileData;
}
