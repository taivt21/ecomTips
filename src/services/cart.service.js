"use strict";

const { cart } = require("../models/cart.model");
const { BadRequestError, NotFoundError } = require("../core/error.response");

const { getProductByID } = require("../models/repositories/product.repo");
/*
    key features
    - add product to cart [user]
    - reduce product quantity by one [user]
    - increase product quantity by one [user]
    - get cart [user]
    - delete cart [user]
    - delete cart item [user]
*/

class CartService {
  //repo cart
  static async createUserCart({ userId, product }) {
    const query = { cart_userId: userId, cart_state: "active" },
      updateOrInsert = {
        $addToSet: {
          cart_products: product,
        },
      },
      options = { upsert: true, new: true };
    return await cart.findOneAndUpdate(query, updateOrInsert, options);
  }

  static async updateUserCartQuantity({ userId, product }) {
    const { productId, quantity } = product;
    const query = {
        cart_userId: userId,
        "cart_products.productId": productId,
        cart_state: "active",
      },
      updateSet = {
        $inc: {
          "cart_products.$.quantity": quantity,
        },
      },
      options = { upsert: true, new: true };
    return await cart.findOneAndUpdate(query, updateSet, options);
  }

  //end repo cart
  static async addToCart({ userId, product = {} }) {
    //check cart ton tai ko
    const userCart = await cart.findOne({ cart_userId: userId });
    if (!userCart) {
      //create new cart
      return await CartService.createUserCart({ userId, product });
    }
    // //neu co gio hang roi nhung chua co sp
    // if (userCart.cart_products.length) {
    //   userCart.cart_products = [product];
    //   return await userCart.save();
    // }

    // //gio hang ton tai va co sp nay thi update quantity

    // return await CartService.updateUserCartQuantity({ userId, product });

    // Kiểm tra xem sản phẩm đã tồn tại trong giỏ hàng chưa
    const existingProductIndex = userCart.cart_products.findIndex(
      (p) => p.productId === product.productId
    );

    if (existingProductIndex !== -1) {
      // Nếu sản phẩm đã tồn tại trong giỏ hàng, cập nhật số lượng của sản phẩm
      return await CartService.updateUserCartQuantity({ userId, product });
    } else {
      // Nếu sản phẩm chưa tồn tại trong giỏ hàng, thêm sản phẩm mới vào giỏ hàng
      userCart.cart_products.push(product);
    }

    // Lưu giỏ hàng sau khi đã cập nhật hoặc thêm sản phẩm vào cơ sở dữ liệu
    return await userCart.save();
  }

  //update cart
  /*
    shop_order_ids: [
        {
            shopId,
            item_products:[
                {
                    quantity,
                    price,
                    shopId,
                    old_quantity,
                    productId
                }
            ],
            version
        }
    ]
  */

  static async addToCartV2({ userId, shop_order_ids }) {
    const { productId, quantity, old_quantity } =
      shop_order_ids[0]?.item_products[0];

    //check product
    const foundProduct = await getProductByID(productId);

    if (!foundProduct) {
      throw new NotFoundError(`Not found product ${productId}`);
    }
    if (foundProduct.product_shop.toString() !== shop_order_ids[0]?.shopId) {
      throw new NotFoundError(`Product do not belong to shop`);
    }

    if (quantity === 0) {
      //detele
    }
    return await CartService.updateUserCartQuantity({
      userId,
      product: {
        productId,
        quantity: quantity - old_quantity,
      },
    });
  }

  static async deleteUserCart({ userId, productId }) {
    const query = { cart_userId: userId, cart_state: "active" },
      updateSet = {
        $pull: {
          cart_products: {
            productId,
          },
        },
      };

    const deleteCart = await cart.updateOne(query, updateSet);
    return deleteCart;
  }

  static async getListUserCart({ userId }) {
    return await cart
      .findOne({
        cart_userId: userId,
      })
      .lean();
  }
}

module.exports = CartService;
