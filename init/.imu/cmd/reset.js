const {
    DEPLOY,
    TMP,
    DEPLOY_PATH,
    SERVER,
    SSL
} = require("../lib/constants");

const fs = require("fs-extra");

const artifacts = [
    ".tup", `${TMP}`, `${DEPLOY_PATH}`, `${DEPLOY}/nginx.conf`,
    `${DEPLOY}/${SERVER}`, `${DEPLOY}/${SSL}`, `${DEPLOY}/${SERVER}.ini`,
    `${SERVER}/obj`, `${SERVER}/bin`
];

module.exports = function handleReset() {
    require("../lib/root")();
    for (let i = 0; i < artifacts.length; i++) fs.removeSync(artifacts[i]);

    console.info("--- Project artifacts removed!");
};
