const {
    DEPLOY,
    TMP,
    DEPLOY_PATH,
    SERVER,
    SSL
} = require('../lib/constants');

const fs = require('fs-extra');

const artifacts = [
    '.tup', `${TMP}`, `${DEPLOY_PATH}`, `${DEPLOY}/nginx.conf`,
    `${DEPLOY}/${SERVER}`, `${DEPLOY}/${SSL}`, `${SERVER}/obj`, `${SERVER}/bin`
];

module.exports = function handleReset() {
    require('../lib/root')();
    for (let a in artifacts) fs.removeSync(artifacts[a]);

    console.info('--- Project artifacts removed!');
};
