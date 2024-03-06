"use strict";

const { model, Schema } = require("mongoose"); // Erase if already required
const slugify = require("slugify");
const DOCUMENT_NAME = "Product";
const COLLECTION_NAME = "Products";
// Declare the Schema of the Mongo model
const productSchema = new Schema(
  {
    product_name: {
      //quan jean cao cap
      type: String,
      required: true,
    },
    product_thumb: {
      type: String,
      required: true,
    },
    product_description: {
      type: String,
    },
    product_slug: {
      //quan-jean-cao-cap
      type: String,
    },
    product_price: {
      type: Number,
      required: true,
    },
    product_quantity: {
      type: Number,
      required: true,
    },
    product_type: {
      type: String,
      required: true,
      enum: ["Electronics", "Clothing", "Furniture"],
    },
    product_shop: {
      type: Schema.Types.ObjectId,
      ref: "Shop",
    },
    product_attributes: {
      type: Schema.Types.Mixed,
      required: true,
    },

    //more
    product_ratingAverage: {
      type: Number,
      default: 4.5,
      min: [1, "Rating must above 1.0"],
      max: [5, "Rating must above 5.0"],
      //4,3311233 -> 4.3
      set: (value) => Math.round(value * 10) / 10,
    },

    product_variations: {
      type: Array,
      default: [],
    },
    isDraft: {
      type: Boolean,
      default: true,
      index: true,
      select: false,
    },
    isPublished: {
      type: Boolean,
      default: false,
      index: true,
      select: false,
    },
  },
  { timestamps: true, collection: COLLECTION_NAME }
);
//create index for search
productSchema.index({ product_name: "text", product_description: "text" });

//document middleware: run before .save() and .create()
productSchema.pre("save", function (next) {
  this.product_slug = slugify(this.product_name, { lower: true });
  next();
});

//define the product type = clothing
const clothingSchema = new Schema(
  {
    brand: { type: String, required: true },
    size: { type: String },
    material: { type: String },
    product_shop: {
      type: Schema.Types.ObjectId,
      ref: "Shop",
    },
  },
  {
    collection: "clothes",
    timestamps: true,
  }
);

const electronicSchema = new Schema(
  {
    manufacturer: { type: String, required: true },
    model: { type: String },
    color: { type: String },
    product_shop: {
      type: Schema.Types.ObjectId,
      ref: "Shop",
    },
  },
  {
    collection: "electronics",
    timestamps: true,
  }
);
const furnitureSchema = new Schema(
  {
    brand: { type: String, required: true },
    size: { type: String },
    material: { type: String },
    product_shop: {
      type: Schema.Types.ObjectId,
      ref: "Shop",
    },
  },
  {
    collection: "furnitures",
    timestamps: true,
  }
);
//Export the model
module.exports = {
  product: model(DOCUMENT_NAME, productSchema),
  electronic: model("Electronics", electronicSchema),
  clothing: model("Clothing", clothingSchema),
  furniture: model("Furniture", furnitureSchema),
};
