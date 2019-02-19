require('dotenv').config();
const Helpers = require('./../lib/helpers');
const { sessionSvc } = require('./session.service');

class WallService {
  async getPostIds(count = 2) {
    const { vkr: vkposts } = await sessionSvc.vk.call('wall.get', {
      owner_id: `-${process.env.GROUP_ID}`,
      count,
    })

    return vkposts.items.map(post => post.id);
  }

  async getLikesByPostId(postId, count = 100) {
    return await this.getRecursiveLikedUserIds(postId, count) || [];
  }

  async getCommentsByPostId(postId, count = 100) {
    return await this.getRecursiveCommentedUserIds(postId, count) || [];
  }

  async getRepostsByPostId(postId, count = 100) {
    return await this.getRecursiveRepostedUserIds(postId, count) || [];
  }

  async getRecursiveLikedUserIds(postId, count, ids = [], offset = 0) {
    const { vkr } = await sessionSvc.vk.call('likes.getList', {
      type: 'post',
      owner_id: `-${process.env.GROUP_ID}`,
      item_id: postId,
      count,
      offset,
    });

    ids = [...ids, ...vkr.items];

    if (ids.length >= vkr.count) {
      return ids;
    }

    await Helpers.delay(1000);

    return this.getRecursiveLikedUserIds(postId, count, ids, ids.length);
  }

  async getRecursiveCommentedUserIds(postId, count, ids = [], offset = 0) {
    const { vkr } = await sessionSvc.vk.call('wall.getComments', {
      owner_id: `-${process.env.GROUP_ID}`,
      post_id: postId,
      count,
      offset,
    })

    const comingIds = vkr.items.map((item) => item.from_id);

    ids = [...ids, ...comingIds];

    if (ids.length >= vkr.count) {
      return ids;
    }

    await Helpers.delay(1000);

    return this.getRecursiveCommentedUserIds(postId, count, ids, ids.length);
  }

  async getRecursiveRepostedUserIds(postId, count, ids = [], offset = 0) {
    const { vkr } = await sessionSvc.vk.call('wall.getReposts', {
      owner_id: `-${process.env.GROUP_ID}`,
      post_id: postId,
      count,
      offset,
    })

    const comingIds = vkr.profiles.map((profile) => profile.id);

    ids = [...ids, ...comingIds];

    if (ids.length >= vkr.count) {
      return ids;
    }

    await Helpers.delay(1000);

    return this.getRecursiveCommentedUserIds(postId, count, ids, ids.length);
  }
}

module.exports = {
  WallService,
  wallSvc: new WallService(),
};
