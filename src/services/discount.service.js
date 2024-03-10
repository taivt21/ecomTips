/*  
    discount service
    1- generator discount code [Shop/Admin]
    2- Get discount amount [User]
    3- Get all discount ode [User/Shop]
    4- Verify discount code [User]
    5- Delete discount code [Admin/Shop]
    4- Cancel discount code [User]
*/

const { BadRequestError, NotFoundError } = require("../core/error.response");
const discount = require("../models/discount.model");
const { product } = require("../models/product.model");
const { findAllProducts } = require("../models/repositories/product.repo");
const {
  findAllDiscountCodeSelect,
  findAllDiscountCodeUnSelect,
  checkDiscountExists,
} = require("../models/repositories/discount.repo");
const { convertToObjectMongoDb } = require("../utils");

class DiscountService {
  static async createDiscountCode(payload) {
    const {
      code,
      start_date,
      end_date,
      is_active,
      shopId,
      min_order_value,
      product_ids,
      applies_to,
      name,
      description,
      type,
      value,
      max_value,
      max_uses,
      uses_count,
      max_uses_per_user,
      user_used,
    } = payload;
    console.log(`[1]::`, payload);
    // kiem tra
    // if (new Date() < new Date(start_date) || new Date() > new Date(end_date)) {
    //   throw new BadRequestError("Discount code has expried!");
    // }
    if (new Date(start_date) >= new Date(end_date)) {
      throw new BadRequestError("Start_date must be before end_date");
    }
    //builder pattern

    //create index for discount code
    const foundDiscount = await discount
      .findOne({
        discount_code: code,
        discount_shopId: shopId,
      })
      .lean();

    if (foundDiscount && foundDiscount.discount_is_active) {
      throw new BadRequestError("Discount exists!");
    }

    const newDiscount = await discount.create({
      discount_name: name,
      discount_description: description,
      discount_type: type,
      discount_code: code,
      discount_value: value,
      discount_min_order_value: min_order_value || 0,
      discount_max_value: max_value,
      discount_start_date: new Date(start_date),
      discount_end_date: new Date(end_date),
      discount_max_uses: max_uses,
      discount_uses_count: uses_count,
      discount_users_used: user_used,
      discount_shopId: shopId,
      discount_max_uses_per_user: max_uses_per_user,
      discount_is_active: is_active,
      discount_applies_to: applies_to,
      discount_product_ids: applies_to === "all" ? [] : product_ids,
    });
    return newDiscount;
  }

  static async updateDiscountCode() {
    //...
  }

  //get list discount code available with products

  static async getAllDiscountCodeWithProduct({
    code,
    shopId,
    userId,
    limit,
    page,
  }) {
    //create index for discount_code
    const foundDiscount = await discount
      .findOne({
        discount_code: code,
        discount_shopId: shopId,
      })
      .lean();

    if (!foundDiscount || !foundDiscount.discount_is_active) {
      throw new NotFoundError(`Discount not exists!`);
    }

    const { discount_applies_to, discount_product_ids } = foundDiscount;

    let products;
    if (discount_applies_to === "all") {
      products = await findAllProducts({
        filter: {
          product_shop: shopId,
          isPublished: true,
        },
        limit: +limit,
        page: +page,
        sort: "ctime",
        select: ["product_name"],
      });
    }
    if (discount_applies_to === "specific") {
      products = await findAllProducts({
        filter: {
          _id: { $in: discount_product_ids },
          isPublished: true,
        },
        limit: +limit,
        page: +page,
        sort: "ctime",
        select: ["product_name"],
      });
    }
    return products;
  }

  // get list discount code of shop

  static async getAllDiscountCodeByShop({ limit, page, shopId }) {
    const discounts = await findAllDiscountCodeUnSelect({
      limit: +limit,
      page: +page,
      filter: {
        discount_shopId: shopId,
        discount_is_active: true,
      },
      unselect: ["__v", "discount_shopId"],
      model: discount,
    });
    return discounts;
  }

  /*
  Apply discount code
  */

  static async getDiscountAmount({ codeId, userId, shopId, products }) {
    const foundDiscount = await checkDiscountExists({
      model: discount,
      filter: {
        discount_code: codeId,
        discount_shopId: shopId,
      },
    });
    if (!foundDiscount) {
      throw new NotFoundError(`Discount code does not exist`);
    }
    const {
      discount_is_active,
      discount_max_uses,
      discount_start_date,
      discount_end_date,
      discount_min_order_value,
      discount_max_uses_per_user,
      discount_users_used,
      discount_type,
      discount_value,
    } = foundDiscount;

    if (!discount_is_active) {
      throw new NotFoundError(`Discount expried!`);
    }
    if (!discount_max_uses) {
      throw new NotFoundError(`Discount are out!`);
    }

    if (
      new Date() < new Date(discount_start_date) ||
      new Date() > new Date(discount_end_date)
    ) {
      throw new NotFoundError(`Discount expried!`);
    }

    //check xem co set gia tri min ko

    let totalOrder = 0;
    if (discount_min_order_value > 0) {
      totalOrder = products.reduce((acc, product) => {
        return acc + product.quantity * product.price;
      }, 0);
      if (totalOrder < discount_min_order_value) {
        throw new NotFoundError(
          `Discount require min order value of ${discount_min_order_value}!`
        );
      }
    }

    if (discount_max_uses_per_user > 0) {
      const userUseDiscount = discount_users_used.find(
        (user) => user.userId === userId
      );
      if (userUseDiscount) {
        //..
      }
    }

    //fix amount hay specific
    const amount =
      discount_type === "fixed_amount"
        ? discount_value
        : totalOrder * (discount_value / 100);
    return { totalOrder, discount: amount, totalPrice: totalOrder - amount };
  }
  static async deleteDiscountCode({ shopId, codeId }) {
    // const foundDiscount = ''
    // if(foundDiscount){
    //     //delete
    // }
    const deleted = await discount.findOneAndDelete({
      discount_code: codeId,
      discount_shopId: shopId,
    });
    return deleted;
  }

  static async cancelDiscountCode({ codeId, shopId, userId }) {
    const foundDiscount = await checkDiscountExists({
      model: discount,
      filter: {
        discount_code: codeId,
        discount_shopId: shopId,
      },
    });
    if (!foundDiscount) {
      throw new NotFoundError(`discount does not exist!`);
    }
    const result = await discount.findByIdAndUpdate(foundDiscount._id, {
      $pull: {
        discount_users_used: userId,
      },
      $inc: {
        discount_max_uses: 1,
        discount_users_used: -1,
      },
    });
    return result;
  }
}

module.exports = DiscountService;
