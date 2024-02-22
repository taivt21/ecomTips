"use strict";
const mongoose = require("mongoose");
const {
  db: { host, name, port },
} = require("../config/config.mongodb");
const connectStr = `mongodb://${host}:${port}/${name}`;
const { countConnect } = require("../helpers/check.connect");

class Database {
  constructor() {
    this.connect();
  }

  //connect
  connect(type = "mongodb") {
    if (1 === 1) {
      mongoose.set("debug", true);
      mongoose.set("debug", { color: true });
    }
    mongoose
      .connect(connectStr, { maxPoolSize: 50 })
      .then((_) => {
        console.log(`Connected Mongodb success ${connectStr}`, countConnect());
      })
      .catch((err) => console.log("err connected"));
  }

  static getInstance() {
    if (!Database.instance) {
      Database.instance = new Database();
    }
    return Database.instance;
  }
}
const instanceMongodb = Database.getInstance();
module.exports = instanceMongodb;
