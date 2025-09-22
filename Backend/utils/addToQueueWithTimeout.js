const contestQueue=require("../queues/contestQueue");

const addToQueueWithTimeout = async (data, options, timeoutMs = 3000) => {
    return Promise.race([
      contestQueue.add(data, options),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Redis not responding in time")), timeoutMs)
      )
    ]);
  };
  

  module.exports =addToQueueWithTimeout;