const { ImageService, imageSvc } = require('./image.service');
const { WallService, wallSvc } = require('./wall.service');
const { SessionService, sessionSvc } = require('./session.service');

module.exports = {
  ImageService,
  WallService,
  SessionService,

  // singletons
  imageSvc,
  wallSvc,
  sessionSvc,
};
