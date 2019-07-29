const {
    CLIENT,
    TMP,
    PAGES_PATH,
    ROOT
} = require('../lib/constants');

const fs = require('fs-extra');
const path = require('path');

const importHTML = require('../lib/import-html');

const page = process.argv[3];
const origin = `./${PAGES_PATH}/${page}/${ROOT}.html`;

require('../lib/root')();

let buffer = fs.readFileSync(origin);
buffer = importHTML(buffer, origin, {
    paths: [`${CLIENT}`, `${PAGES_PATH}`],
    extensions: {scripts: ['.html', '.js', '.json']}
});

fs.outputFileSync(`./${TMP}/${page}/${ROOT}.html`, buffer);
console.info(`--- Compiled ${page + path.sep + ROOT}.html -> ${TMP + path.sep + page + path.sep + ROOT}.html`);
