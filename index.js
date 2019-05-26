#!/usr/bin/env node
const cli = require("./src/cli");

cli().then(() => {
}).catch(e => {
  console.error(`Error in application : ${e.stack}`);
});