const { DAYS_OF_WEEK, outputCoverName } = require('./constants');

class Helpers {
  static timestamp() {
    return Math.floor(Date.now() / 1000);
  };

  static delay(ms) {
    return new Promise(_ => setTimeout(_, ms));
  }

  static isFriday() {
    return (new Date()).getDay() === DAYS_OF_WEEK.Friday;
  }

  static getOutputFileName() {
    const [ name, extension ] = outputCoverName.split('.');

    return `${name}__${Helpers.timestamp()}.${extension}`;
  }

  static getWeeklyPhotoPath() {
    const filename = this.getOutputFileName();

    return `${__dirname}/../covers/weeks/${filename}`;
  }

  static getDailyPhotoPath() {
    const filename = this.getOutputFileName();

    return `${__dirname}/../covers/${filename}`;
  }
}

module.exports = Helpers;
