const easyvk = require('easyvk');

class SessionService {
  constructor() {
    this.vk = undefined;
  }

  async login(params) {
    this.vk = await easyvk({ ...params, save_session: false });
  }
}

module.exports = {
  SessionService,
  sessionSvc: new SessionService(),
};
