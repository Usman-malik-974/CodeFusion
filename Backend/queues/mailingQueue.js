const Queue = require("bull");

const mailingQueue = new Queue("mailingQueue", {
  redis: {
    host: "127.0.0.1",
    port: 6379,
  },
});

module.exports = mailingQueue;
