'use strict';

const route_threads = require("./threads");
const route_replies = require("./replies");

module.exports = app => {
  route_threads(app);
  route_replies(app);
};