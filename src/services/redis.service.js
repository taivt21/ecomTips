"use strict";

const redis = require("redis");
const { promisify } = require("util");
const {
  reservationInventory,
} = require("../models/repositories/inventory.repo");

// const redisClient = redis.createClient();

// redisClient.on("error", (err) => console.log("Redis Client Error", err));

// redisClient.connect();
(async () => {
  const redisClient = redis.createClient();

  redisClient.on('error', (err) => console.log('Redis Client Error', err));

  await redisClient.connect();

})();

// redisClient.ping((err, result) => {
//   if (err) {
//     console.log(`Error connecting to Redis:`, err);
//   } else {
//     console.log(`Connected to Redis`);
//   }
// });

// const pexpire = promisify(redisClient.pExpire).bind(redisClient);
// const setnxAsync = promisify(redisClient.setNX).bind(redisClient);

const acquireLock = async (productId, quantity, carId) => {
  const key = `lock_v2023_${productId}`;
  const retryTimes = 10;
  const expireTime = 3000;

  for (let i = 0; i < retryTimes.length; i++) {
    //tao 1 key, ai nam giu duoc vao thanh toan
    const result = await setnxAsync(key, expireTime);
    console.log(`result:: `, result);
    if (result === 1) {
      //thao tac voi inventory

      const isReversation = await reservationInventory({
        productId,
        quantity,
        carId,
      });
      if (isReversation.modifiedCount) {
        await pexpire(key, expireTime);
        return key;
      }
      return null;
    } else {
      await new Promise((resolve) => setTimeout(resolve, 50));
    }
  }
};

const releaseLock = async (keyLock) => {
  const delAsyncKey = promisify(redisClient.del).bind(redisClient);
  return await delAsyncKey(keyLock);
};

module.exports = {
  acquireLock,
  releaseLock,
};
