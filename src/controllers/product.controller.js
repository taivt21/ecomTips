"use strict";
const { CREATED, SuccessResponse } = require("../core/success.response");
const ProductService = require("../services/product.service");
const ProductServiceV2 = require("../services/product.service.lvxxx");

class ProductController {
  createProduct = async (req, res, next) => {
    // new SuccessResponse({
    //   message: "Create new product successfully",
    //   metadata: await ProductService.createProduct(req.body.product_type, {
    //     ...req.body,
    //     product_shop: req.user.userId,
    //   }),
    // }).send(res);
    new SuccessResponse({
      message: "Create new product successfully",
      metadata: await ProductServiceV2.createProduct(req.body.product_type, {
        ...req.body,
        product_shop: req.user.userId,
      }),
    }).send(res);
  };

  // query
  getAllDraftsForShop = async (req, res, next) => {
    new SuccessResponse({
      message: "Get list draft products",
      metadata: await ProductServiceV2.findAllDraftsForShop({
        product_shop: req.user.userId,
      }),
    }).send(res);
  };

  getAllPublishForShop = async (req, res, next) => {
    new SuccessResponse({
      message: "Get list published products",
      metadata: await ProductServiceV2.findAllPublishForShop({
        product_shop: req.user.userId,
      }),
    }).send(res);
  };

  publishProductByShop = async (req, res, next) => {
    new SuccessResponse({
      message: "Change published product success",
      metadata: await ProductServiceV2.publishProductByShop({
        product_id: req.params.id,
        product_shop: req.user.userId,
      }),
    }).send(res);
  };
  unPublishProductByShop = async (req, res, next) => {
    new SuccessResponse({
      message: "Change draft product success",
      metadata: await ProductServiceV2.unPublishProductByShop({
        product_id: req.params.id,
        product_shop: req.user.userId,
      }),
    }).send(res);
  };
  getListSearchProduct = async (req, res, next) => {
    new SuccessResponse({
      message: "get list search product success",
      metadata: await ProductServiceV2.searchProducts(req.params),
    }).send(res);
  };
  findAllProducts = async (req, res, next) => {
    new SuccessResponse({
      message: "find all products success",
      metadata: await ProductServiceV2.findAllProducts(req.query),
    }).send(res);
  };
  findProduct = async (req, res, next) => {
    new SuccessResponse({
      message: "find  product success",
      metadata: await ProductServiceV2.findProduct({
        product_id: req.params.product_id,
      }),
    }).send(res);
  };

  updateProduct = async (req, res, next) => {
    new SuccessResponse({
      message: "update product success",
      metadata: await ProductServiceV2.updateProduct(
        req.body.product_type,
        req.params.productId,
        {
          ...req.body,
          product_shop: req.user.userId,
        }
      ),
    }).send(res);
  };
  //end query
}

module.exports = new ProductController();
