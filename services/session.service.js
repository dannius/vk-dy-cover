const easyvk = require('easyvk');

class SessionService {
  constructor() {
    this.vk = undefined;
  }

  async login(params) {
    this.vk = await easyvk({ ...params, save_session: false });
  }

  async getUserById(id) {
    const { vkr: items } = await this.vk.call('users.get', {
      user_ids: id,
      fields: "photo_100",
    })

    return items[0];
  }
}

module.exports = {
  SessionService,
  sessionSvc: new SessionService(),
};
