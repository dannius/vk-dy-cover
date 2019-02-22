require('dotenv').config();

const express = require('express');
const { interval: RxInterval$ } = require('rxjs');

const app = express();
app.use("/covers", express.static('covers'));
app.use("/assets", express.static('assets'));

// settings
const {
  port,
  inputCoverName,
  day,
} = require('./lib/constants');

// services
const {
  imageSvc,
  wallSvc,
  sessionSvc,
  eventSvc,
} = require('./services');

const Helpers = require('./lib/helpers');

let weeklyPhotoName = '';

app.listen(port, serve);

async function serve() {
  run();

  RxInterval$(day).subscribe(() => {
    run();
  })
}

async function run() {
  console.log(`RUN at ${new Date()}---------------`);
  try {
    await sessionSvc.login({
      // access_token: process.env.ACCESS_TOKEN,
      username: process.env.USERNAME,
      password: process.env.PASSWORD,
    });

    if (Helpers.isFriday()) {
      console.log('its Friday, party time!')
      weeklyPhotoName = await getWeeklyPhoto();
      await Helpers.delay(1000);
    }

    const newCoverName = await getDailyPhoto();

    await updatePhoto(newCoverName);

    console.log('cover was updated. \n');
  } catch (err) {
    console.log(`Error: ${err}`);
  }
}


async function updatePhoto(newCoverName) {
  const fileData = await uploadPhoto(sessionSvc.vk, newCoverName);

  return sessionSvc.vk.call('photos.saveOwnerCoverPhoto', fileData);
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

async function getWinnerByPosts(postIds) {
  const ids = await postIds.reduce(async (userIds, postId) => {
    const prevIds = await userIds;

    const postLikedIds = await wallSvc.getLikesByPostId(postId, 100);
    await Helpers.delay(500);
    const postCommentedIds = await wallSvc.getCommentsByPostId(postId, 100);
    await Helpers.delay(500);
    const postRepostedIds = await wallSvc.getRepostsByPostId(postId, 100);

    return [...postLikedIds, ...postCommentedIds, ...postRepostedIds, ...prevIds];
  }, Promise.resolve([]));

  return eventSvc.getWinnerIdFromIds(ids);
}


async function getWeeklyPhoto() {
    // get posts
    const postIds = await wallSvc.getPostIds(7);

    // get winner object like { id: '151476044', counter: 10 }
    const winner = await getWinnerByPosts(postIds);
    console.log(`weekly winner is ${winner.id}, activity: ${winner.counter}`);

    // get user and his photo
    const { first_name, last_name, photo_100 } = await sessionSvc.getUserById(winner.id);
    const photo = await imageSvc.fetchUserPhoto(photo_100);

    const WeeklyPhotoParams = {
      photo,
      x: 817,
      y: 91,
      text: `${first_name} ${last_name}`,
    }

    // read input image
    const image = await imageSvc.readImageByPath(`${__dirname}/assets/${inputCoverName}`);
    return imageSvc.createCover(image, Helpers.getWeeklyPhotoPath(), WeeklyPhotoParams);
}

async function getDailyPhoto() {
    // get posts
    const postIds = await wallSvc.getPostIds(2);

    // get winner object like { id: '151476044', counter: 10 }
    const winner = await getWinnerByPosts(postIds);
    console.log(`daily winner is ${winner.id}, activity: ${winner.counter}`);

    // get user and his photo
    const { first_name, last_name, photo_100 } = await sessionSvc.getUserById(winner.id);
    const photo = await imageSvc.fetchUserPhoto(photo_100);

    const daylyPhotoParams = {
      photo,
      x: 817,
      y: 229,
      text: `${first_name} ${last_name}`,
    }

    // read input image
    const image = await imageSvc.readImageByPath(`${__dirname}/covers/weeks/${weeklyPhotoName}`);
    return imageSvc.createCover(image, Helpers.getDailyPhotoPath(), daylyPhotoParams);
}
