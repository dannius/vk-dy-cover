require('dotenv').config();
const { sessionSvc } = require('./session.service');

class WallService {
  getPosts() {
    return sessionSvc.vk.call("wall.get", {
      owner_id: `-${process.env.GROUP_ID}`,
    })
  }
}

module.exports = {
  WallService,
  wallSvc: new WallService(),
};
