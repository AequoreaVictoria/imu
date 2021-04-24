const { TMP, DEPLOY_PATH } = require("../lib/constants");

const fs = require("fs-extra");

const artifacts = [".tup", `${TMP}`, `${DEPLOY_PATH}`];

module.exports = function handleReset() {
  require("../lib/root")();
  for (let a in artifacts) fs.removeSync(artifacts[a]);

  console.info("--- Project artifacts removed!");
};
