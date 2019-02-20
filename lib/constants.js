const DAYS_OF_WEEK = Object.freeze({
  Sunday: 0,
  Monday: 1,
  Tuesday: 2,
  Wednesday: 3,
  Thursday: 4,
  Friday: 5,
  Saturday: 6,
});

constants = Object.freeze({
  port: process.env.PORT || 4200,
  inputCoverName: '2.jpeg',
  outputCoverName: 'output.jpeg',
  saveOutputToDisc: true,
  day: 1000 * 60 * 60 * 24,
  DAYS_OF_WEEK,
});

module.exports = constants;
