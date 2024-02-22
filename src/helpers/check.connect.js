"use strict";
const mongoose = require("mongoose");
const os = require("os");
const process = require("process");

const _SECONDS = 5000;
//count connections
const countConnect = () => {
  const numConnections = mongoose.connections.length;
  console.log(`numConnections : ${numConnections}`);
};

//chech overload
const checkOverload = () => {
  setInterval(() => {
    const numConnections = mongoose.connections.length;
    const numCores = os.cpus().length;
    const memoryUsaged = process.memoryUsage().rss;

    //example max number of connections based on number of cores
    const maxConnections = numCores * 5;

    console.log(`Active connection : ${numConnections}`);
    console.log(`Memory usage : ${memoryUsaged / 1024 / 1024}MB`);
    if (numConnections > maxConnections) {
      console.log(`Connections overload detected`);
    }
  }, _SECONDS); //monitor every 5 second
};
module.exports = { countConnect, checkOverload };
