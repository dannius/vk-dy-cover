require('dotenv').config();

const express = require('express');

const app = express();

app.use("/covers", express.static('covers'));
app.use("/assets", express.static('assets'));

app.use((_, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, PUT, PATCH, POST, DELETE");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  next();
});

// rendering html
const path = require('path');
app.use(express.static(__dirname + '/views'));
app.get('/',(_, res) => {
  res.sendFile(path.join(__dirname+'/views/main.html'));
});

app.get('/change-cover',(req, res) => {
  if (req.query.password === 'ourgold') {
    res.json({ message: 'process starting, cover will be updated in next minute' });
  } else {
    res.json({ message: 'wrong password' });
  }
});

// settings
const {
  port,
  inputCoverName,
} = require('./lib/constants');

// services
const {
  SocketService,
  imageSvc,
  wallSvc,
  sessionSvc,
  eventSvc,
} = require('./services');

const Helpers = require('./lib/helpers');

let weeklyPhotoName = 'output__1553266293.jpeg';

const server = app.listen(port, () => {});
const io = new SocketService(server);

async function run() {
  io.emit(`RUN at ${new Date()}---------------`);
  try {
    await sessionSvc.login({
      // access_token: process.env.ACCESS_TOKEN,
      username: process.env.USERNAME,
      password: process.env.PASSWORD,
    });

    if (Helpers.isFriday()) {
      io.emit('its Friday, party time!');
      weeklyPhotoName = await getWeeklyPhoto();
      await Helpers.delay(1000);
    }

    const newCoverName = await getDailyPhoto();

    await updatePhoto(newCoverName);

    io.emit('cover was updated. \n');
  } catch (err) {
    io.emit(`Error: ${err}`);
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
  const ids = await postIds.reduce(async (userIds, postId, i) => {
    const prevIds = await userIds;
    io.emit(`processing post ${i + 1} - id: ${postId}`)

    const postLikedIds = await wallSvc.getLikesByPostId(postId, 100);

    await Helpers.delay(500);
    const postCommentedIds = await wallSvc.getCommentsByPostId(postId, 100);

    await Helpers.delay(500);

    return [...postLikedIds, ...postCommentedIds, ...prevIds];
  }, Promise.resolve([]));

  return eventSvc.getWinnerIdFromIds(ids);
}


async function getWeeklyPhoto() {
    // get posts
    const postIds = await wallSvc.getWeeklyPostIds(20);
    io.emit(`this week was ${postIds.length} posts`);
    // get winner object like { id: '151476044', counter: 10 }
    const winner = await getWinnerByPosts(postIds);
    io.emit(`weekly winner is ${winner.id}, activity: ${winner.counter}`);

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
    const postIds = await wallSvc.getDailyPostIds(5);
    io.emit(`today was ${postIds.length} posts`);

    // get winner object like { id: '151476044', counter: 10 }
    const winner = await getWinnerByPosts(postIds);
    io.emit(`daily winner is ${winner.id}, activity: ${winner.counter}`);

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
