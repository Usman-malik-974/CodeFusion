const Queue = require("bull");

const contestQueue = new Queue("contestQueue", {
  redis: {
    host: "127.0.0.1",
    port: 6379,
  },
});

module.exports = contestQueue;
