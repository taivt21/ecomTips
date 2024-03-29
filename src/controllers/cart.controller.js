"use strict";
const { CREATED, SuccessResponse } = require("../core/success.response");
const CartService = require("../services/cart.service");

class CartController {
  //new
  addToCart = async (req, res, next) => {
    new SuccessResponse({
      message: "Create new cart successfully",
      metadata: await CartService.addToCart(req.body),
    }).send(res);
  };

  //update
  update = async (req, res, next) => {
    new SuccessResponse({
      message: "update cart successfully",
      metadata: await CartService.addToCartV2(req.body),
    }).send(res);
  };
  delete = async (req, res, next) => {
    new SuccessResponse({
      message: "delete cart successfully",
      metadata: await CartService.deleteUserCart(req.body),
    }).send(res);
  };
  listToCart = async (req, res, next) => {
    new SuccessResponse({
      message: "get list user cart successfully",
      metadata: await CartService.getListUserCart(req.query),
    }).send(res);
  };
}
module.exports = new CartController();
