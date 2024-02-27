"use strict";

const JWT = require("jsonwebtoken");
const HEADER = {
  API_KEY: "x-api-key",
  ClIENT_ID: "x-client-id",
  AUTHORIZATION: "authorization",
};
const { asyncHandler } = require("../helpers/asyncHandler");
const { AuthFailureError, NotFoundError } = require("../core/error.response");
const { findByUserId } = require("../services/keyToken.service");
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

const authentication = asyncHandler(async (req, res, next) => {
  //check userId missing?
  //get access token
  //verify token
  //check user in db
  //check keystore with userId
  //ok -> next
  const userId = req.headers[HEADER.ClIENT_ID];
  if (!userId) throw new AuthFailureError("Invalid request");

  const keyStore = await findByUserId(userId);
  if (!keyStore) throw new NotFoundError("Not found keystore");

  const accessToken = req.headers[HEADER.AUTHORIZATION];

  if (!accessToken) throw new AuthFailureError("Invalid request");

  try {
    const decodeUser = JWT.verify(accessToken, keyStore.publicKey);
    if (userId !== decodeUser.userId)
      throw new AuthFailureError("Invalid userId");
    req.keyStore = keyStore;
    return next();
  } catch (error) {
    throw error;
  }
});
module.exports = {
  createTokenPair,
  authentication,
};
