"use strict";

const JWT = require("jsonwebtoken");
const createTokenPair = async (payload, publicKey, privateKey) => {
  try {
    const accessToken = await JWT.sign(payload, publicKey, {
      expiresIn: "2 days",
    });
    const refreshToken = await JWT.sign(payload, privateKey, {
      expiresIn: "7 days",
    });

    JWT.verify(accessToken, publicKey, (err, decode) => {
      if (err) {
        console.error(`err verify:`, err);
      } else {
        console.log(`decode verify:`, decode);
      }
    });

    return { accessToken: accessToken, refreshToken: refreshToken };
  } catch (error) {
    console.error(`Error creating token pair:`, error);
    throw error; // Re-throw the error to handle it elsewhere
  }
};
module.exports = {
  createTokenPair,
};
