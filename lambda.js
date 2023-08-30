const { createServer, proxy } = require('aws-serverless-express');
const { init } = require('./dist/app');
const { Pool } = require('@churchapps/apihelper');
const { Environment } = require('./dist/helpers/Environment');

Environment.init(process.env.APP_ENV).then(() => {
  Pool.initPool();
});


const universal = function universal(event, context) {
  init().then(app => {
    const server = createServer(app);
    return proxy(server, event, context);
  });
}

const nightly = async (event, context) => {
  await AutomationHelper.checkAll();
}

module.exports.universal = universal;
module.exports.nightly = nightly;