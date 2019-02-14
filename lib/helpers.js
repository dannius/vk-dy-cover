class Helpers {
  static timestamp() {
    return Math.floor(Date.now() / 1000);
  };

  static delay(ms) {
    return new Promise(_ => setTimeout(_, ms));
  }
}

module.exports = Helpers;
