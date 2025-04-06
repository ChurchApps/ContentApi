const { createServer, proxy } = require('aws-serverless-express');
const { init } = require('./dist/app');
const { Pool } = require('@churchapps/apihelper');
const { Environment } = require('./dist/helpers/Environment');
const { ScheduleHelper } = require('./dist/helpers/ScheduleHelper');
const binaryMimeTypes = ['application/pdf', 'application/zip'];

let server; //Global cache

const checkPool = async () => {
  if (!Environment.connectionString) {
    await Environment.init(process.env.APP_ENV)
    Pool.initPool();
  }
}

const universal = function universal(event, context) {
  checkPool().then(() => {
    if (server) return proxy(server, event, context);
    
    init().then(app => {
      server = createServer(app, null, binaryMimeTypes);
      return proxy(server, event, context);
    });
  });
}

const nightly = async (event, context) => {
  await checkPool();
  await ScheduleHelper.handleAutoImports();
}

const timer2Monday = async (event, context) => {
  await checkPool();
  await ScheduleHelper.updateServiceTimes();
}

module.exports.universal = universal;
module.exports.nightly = nightly;
module.exports.timer2Monday = timer2Monday;