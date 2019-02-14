const { ImageService, imageSvc } = require('./image.service');
const { WallService, wallSvc } = require('./wall.service');
const { SessionService, sessionSvc } = require('./session.service');
const { EventService, eventSvc } = require('./event.service');

module.exports = {
  ImageService,
  WallService,
  SessionService,
  EventService,

  // singletons
  imageSvc,
  wallSvc,
  sessionSvc,
  eventSvc,
};
