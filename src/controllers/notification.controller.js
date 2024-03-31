"use strict";
const { SuccessResponse } = require("../core/success.response");
const { listNotiByUser } = require("../services/notification.service");

class NotiController {
  listNotiByUser = async (req, res, next) => {
    new SuccessResponse({
      message: "Create new list noti by user successfully",
      metadata: await listNotiByUser(req.query),
    }).send(res);
  };
}

module.exports = new NotiController();
