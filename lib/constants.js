constants = Object.freeze({
  port: process.env.PORT || 4200,
  inputCoverName: '1.jpeg',
  outputCoverName: 'output.jpeg',
  saveOutputToDisc: true,
  day: 1000 * 60 * 60 * 24,
});

module.exports = constants;
