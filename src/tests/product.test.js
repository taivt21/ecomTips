const redisPubsubService = require("../services/redisPubsub.service");

class ProductService {
  purchaseProduct(productId, quantity) {
    const order = {
      productId,
      quantity,
    };
    console.log(`product ${productId}`);
    redisPubsubService.publish("purchase_events", JSON.stringify(order));
  }
}
module.exports = new ProductService();
