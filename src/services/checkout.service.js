"use strict";
const { BadRequestError, NotFoundError } = require("../core/error.response");

const { order } = require("../models/order.model");
const { findCartById } = require("../models/repositories/cart.repo");
const { checkProductByServer } = require("../models/repositories/product.repo");
const { getDiscountAmount } = require("./discount.service");
const { acquireLock, releaseLock } = require("./redis.service");
class CheckoutService {
  /*
  login and without login
    {
        cartId,
        userId,
        shop_order_ids:[
            {
                shopId,
                shop_discount,
                item_products:[{
                    price,
                    quantity,
                    productId
                }]
            },
            {
               shopId,
               shop_discount:[
                {
                    "shopId",
                    "discountId",
                    "codeId"
                }
               ],
               item_products:[
                {
                    price,
                    quantity,
                    productId,
                }
               ] 
            }
        ]
    }
    */
  static async checkoutReview({ cartId, userId, shop_order_ids = [] }) {
    //check cartId exists
    const foundCart = await findCartById(cartId);

    if (!foundCart) {
      throw new BadRequestError(`Cart does not exist`);
    }
    const checkout_order = {
        totalPrice: 0,
        feeShip: 0,
        totalDiscount: 0,
        totalCheckout: 0,
      },
      shop_order_ids_new = [];

    //tinh tong tien bill
    for (let i = 0; i < shop_order_ids.length; i++) {
      const {
        shopId,
        shop_discounts = [],
        item_products = [],
      } = shop_order_ids[i];
      const checkProductServer = await checkProductByServer(item_products);

      if (!checkProductServer[0]) {
        throw new BadRequestError(`order wrong`);
      }
      //tong tien trc khi xu li
      const checkoutPrice = checkProductServer.reduce((acc, product) => {
        return acc + product.quantity * product.price;
      }, 0);
      checkout_order.totalPrice = +checkoutPrice;
      const itemCheckout = {
        shopId,
        shop_discounts,
        priceRaw: checkoutPrice, //tien truoc khi giam gia
        priceApplyDiscount: checkoutPrice,
        item_products: checkProductServer,
      };
      //neu shop_discounts ton tai > 0, check xem hop le ko
      if (shop_discounts.length > 0) {
        //gia su chi co 1 discount
        //get amount discount
        const { totalPrice = 0, discount = 0 } = await getDiscountAmount({
          codeId: shop_discounts[0].codeId,
          userId,
          shopId,
          products: checkProductServer,
        });
        //tong cong discount giam gia
        checkout_order.totalDiscount += discount;

        // neu tien giam gia lon hon 0
        if (discount > 0) {
          itemCheckout.priceApplyDiscount = checkoutPrice - discount;
        }
      }
      //tong thanh toan cuoi cung
      checkout_order.totalCheckout += itemCheckout.priceApplyDiscount;
      shop_order_ids_new.push(itemCheckout);
    }

    return {
      shop_order_ids,
      shop_order_ids_new,
      checkout_order,
    };
  }

  static async orderByUser({
    shop_order_ids,
    cartId,
    userId,
    user_address = {},
    user_payment = {},
  }) {
    const { shop_order_ids_new, checkout_order } =
      await CheckoutService.checkoutReview({
        cartId,
        userId,
        shop_order_ids,
      });
    //check 1 lan nua xem vuot ton kho ko
    //get new array products
    const products = shop_order_ids_new.flatMap((order) => order.item_products);
    console.log(`[1]::`, products);
    const acquireProduct = [];
    for (let i = 0; i < products.length; i++) {
      const { productId, quantity } = products[i];
      const keyLock = await acquireLock(productId, quantity, cartId);
      acquireProduct.push(keyLock ? true : false);
      if (keyLock) {
        await releaseLock(keyLock);
      }
    }
    //check neu co 1 sp het hang trong kho
    if (acquireProduct.includes(false)) {
      throw new BadRequestError(
        `Some product has update, please comeback your cart!`
      );
    }
    const newOrder = await order.create({
      order_userId: userId,
      order_checkout: checkout_order,
      order_shipping: user_address,
      order_payment: user_payment,
      order_products: shop_order_ids_new,
    });

    //neu insert thanh cong thi remove product trong cart
    if (newOrder) {
      //remove product in cart
    }
    return newOrder;
  }

  /*
   1- query order [user]
   */
  static async getOrdersByUser() {}
  /*
   1- query order using id [user]
   */
  static async getOneOrderByUser() {}
  /*
   1- query cancel order [user]
   */
  static async cancelOrderByUser() {}
  /*
   1- update status order [shop|admin]
   */
  static async updateOrderStatusByShop() {}
}

module.exports = CheckoutService;
