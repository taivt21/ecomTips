"use strict";
const { CREATED, SuccessResponse } = require("../core/success.response");
const DiscountService = require("../services/discount.service");

class DiscountController {
  createDiscountCode = async (req, res, next) => {
    new SuccessResponse({
      message: "Create new discount code successfully",
      metadata: await DiscountService.createDiscountCode({
        ...req.body,
        shopId: req.user.userId,
      }),
    }).send(res);
  };
  getAllDiscountCodes = async (req, res, next) => {
    new SuccessResponse({
      message: "Get all discount code successfully",
      metadata: await DiscountService.getAllDiscountCodeByShop({
        ...req.query,
        shopId: req.user.userId,
      }),
    }).send(res);
  };
  getDiscountAmount = async (req, res, next) => {
    new SuccessResponse({
      message: "Get all discount code successfully",
      metadata: await DiscountService.getDiscountAmount({
        ...req.body,
      }),
    }).send(res);
  };
  getAllDiscountCodesWithProducts = async (req, res, next) => {
    new SuccessResponse({
      message: "Get all discount code successfully",
      metadata: await DiscountService.getAllDiscountCodeWithProduct({
        ...req.query,
      }),
    }).send(res);
  };
}

module.exports = new DiscountController();
