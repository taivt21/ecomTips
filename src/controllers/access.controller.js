"use strict";
const { CREATED, SuccessResponse } = require("../core/success.response");
const AccessService = require("../services/access.service");

class AccessController {
  handleRefreshToken = async (req, res, next) => {
    //v1
    // new SuccessResponse({
    //   message: "Get token successfully ",
    //   metadata: await AccessService.handleRefreshToken(req.body.refreshToken),
    // }).send(res);

    //v2
    new SuccessResponse({
      message: "Get token successfully ",
      metadata: await AccessService.handleRefreshTokenV2({
        refreshToken: req.refreshToken,
        user: req.user,
        keyStore: req.keyStore,
      }),
    }).send(res);
  };

  logout = async (req, res, next) => {
    new SuccessResponse({
      message: "Logged out",
      metadata: await AccessService.logout(req.keyStore),
    }).send(res);
  };

  login = async (req, res, next) => {
    new SuccessResponse({
      metadata: await AccessService.login(req.body),
    }).send(res);
  };

  signUp = async (req, res, next) => {
    // try {
    //   console.log(`[P]::signUp::`, req.body);
    new CREATED({
      message: "Registed ok",
      metadata: await AccessService.signUp(req.body),
      // options: {
      //   someoption: 10,
      // },
    }).send(res);
    // return res.status(201).json(await AccessService.signUp(req.body));
    // } catch (error) {
    //   next(error);
    // }
  };
}

module.exports = new AccessController();
