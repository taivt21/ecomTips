const { Schema, model } = require("mongoose"); // Erase if already required

const DOCUMENT_NAME = "Order";
const COLLECTION_NAME = "Orders";
// Declare the Schema of the Mongo model
const orderSchema = new Schema(
  {
    order_userid: {
      type: Number,
      required: true,
    },
    order_checkout: {
      /*
        order_checkout = {
            totalPrice,
            totalApplyDiscount,
            feeShip
        }
        */
      type: Object,
      default: {},
      required: true,
    },
    order_shipping: {
      /*
        street,
        city,
        state,
        country,
        */
      type: Object,
      default: {},
    },
    order_payment: {
      type: Object,
      default: {},
    },
    order_products: {
      type: Array,
      required: true,
    },
    order_trackingNumber: {
      type: String,
      default: "#0002214123566",
    },
    order_status: {
      type: String,
      enum: ["pending", "confirmed", "shipped", "cancelled", "delivered"],
      default: "pending",
    },
  },
  {
    collection: COLLECTION_NAME,
    timestamps: true,
  }
);

//Export the model
module.exports = { order: model(DOCUMENT_NAME, orderSchema) };
