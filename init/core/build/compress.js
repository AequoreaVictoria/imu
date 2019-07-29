const {DEPLOY_PATH} = require('../lib/constants');

const fs = require('fs-extra');
const path = require('path');

const page = process.argv[2];

require('../lib/root')();

const file = fs.readFileSync(`./${DEPLOY_PATH}/${page}.html`);
require('node-gzip').gzip(file).then((gz) => {
    fs.outputFileSync(`./${DEPLOY_PATH}/${page}.html.gz`, gz);
    console.info(`--- GZipped ${DEPLOY_PATH + path.sep + page}.html`);
});
