require("dotenv").config();
const compression = require("compression");
const express = require("express");
const { default: helmets } = require("helmet");
const morgan = require("morgan");
const app = express();

console.log(`Process: ${process.env}`);
//init middlewares
app.use(morgan("dev"));
// morgan("combined")
// morgan("common")
// morgan("short")
// morgan("tiny")
app.use(helmets());
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//test pub sub redis
require("./tests/inventory.test.js");
const pruductTest = require("./tests/product.test.js");
// pruductTest.purchaseProduct("product:001", 10);

//init db
require("./dbs/init.mongodb.js");
// const { checkOverload } = require("./helpers/check.connect.js");
// checkOverload();
//init routes
app.use("/", require("./routes"));
//handling errors
app.use((req, res, next) => {
  const error = new Error("Not found");
  error.status = 404;
  next(error);
});
app.use((error, req, res, next) => {
  const statusCode = error.status || 500;
  return res.status(statusCode).json({
    status: "error",
    code: statusCode,
    stack: error.stack,
    message: error.message || "Internal Server Error",
  });
});
module.exports = app;
