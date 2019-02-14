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
} = require('./lib/constants');

// services
const {
  imageSvc,
  wallSvc,
  sessionSvc,
  eventSvc,
} = require('./services');

app.listen(port, serve);

async function serve() {
  try {
    await sessionSvc.login({
      // access_token: process.env.ACCESS_TOKEN,
      username: process.env.USERNAME,
      password: process.env.PASSWORD,
    });

    // get posts
    // const { vkr: vkposts } = await wallSvc.getPosts(2);

    // get winner { id: '151476044', counter: 10 }
    // const winner = await getWinnerByPosts([5144883, 5148616]);

    // get user
    const user = await sessionSvc.getUserById(60833780);

    // get photo
    const photo = await imageSvc.fetchUserPhoto(user.photo_100);

    // read input image
    const image = await imageSvc.readImageByPath(`${__dirname}/assets/${inputCoverName}`);

    const newCoverName = await imageSvc.createCover(image);


    // await updatePhoto(newCoverName);

    console.log('cover was updated');
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
    const postLikedIds = await wallSvc.getLikesByPostId(postId, 100);
    const postCommentedIds = await wallSvc.getCommentsByPostId(postId, 100);

    return [...postLikedIds, ...postCommentedIds, ...(await userIds)];
  }, Promise.resolve([]));

  return eventSvc.getWinnerIdFromIds(ids);
}