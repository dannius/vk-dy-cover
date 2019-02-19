class EventService {
  constructor() {
    this.vk = undefined;
  }

  getWinnerIdFromIds(ids) {
    const idCounterObj = {};
    ids.forEach((id) => idCounterObj[id] ? idCounterObj[id]++ : idCounterObj[id] = 1);

    let maxIdCounter = this.createMaxIdCounter();

    Object
      .keys(idCounterObj)
      .forEach((key) => {
        if (maxIdCounter.counter < idCounterObj[key]) {
          maxIdCounter = this.createMaxIdCounter(key, idCounterObj[key]);
        }
      })

    return maxIdCounter;
  }

  createMaxIdCounter(id = '', counter = 0) {
    return { id, counter };
  }
}

module.exports = {
  EventService,
  eventSvc: new EventService(),
};
