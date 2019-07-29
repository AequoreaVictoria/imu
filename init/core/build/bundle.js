const {
    TMP,
    PAGES_PATH,
    DEPLOY_PATH,
    LICENSE,
    ROOT
} = require('../lib/constants');

const fs = require('fs-extra');
const path = require('path');
const htmlmin = require('html-minifier').minify;

const imuInject = require('../lib/inject');

const isRelease = process.argv[2] === '--release';
const page = process.argv[3];

const origin = `./${TMP}/${page}/${ROOT}.html`;
const JS = `./${TMP}/${page}/${ROOT}.js`;
const CSS = `./${TMP}/${page}/${ROOT}.css`;
const License = `./${PAGES_PATH}/${page}/${LICENSE}.html`;

require('../lib/root')();

const hasJS = fs.existsSync(JS);
const hasCSS = fs.existsSync(CSS);

let buffer = fs.readFileSync(origin);

if (hasCSS) {
    buffer = imuInject({
        input: fs.readFileSync(CSS),
        target: buffer,
        key: 'css',
        prepend: '<style>',
        append: '</style>'
    });
}

if (hasJS) {
    buffer = imuInject({
        input: fs.readFileSync(JS),
        target: buffer,
        key: 'js',
        prepend: '<script>',
        append: '</script>'
    });
}
if (isRelease) {
    buffer = htmlmin(buffer.toString(), {
        caseSensitive: true,
        collapseWhitespace: true,
        conservativeCollapse: true,
        removeComments: true,
        removeRedundantAttributes: true
    });
    buffer = imuInject({
        input: fs.readFileSync(License),
        target: buffer,
        header: true
    });
}

fs.outputFileSync(`./${DEPLOY_PATH}/${page}.html`, buffer);
console.info(`--- Bundled ${page} -> ${DEPLOY_PATH + path.sep + page}.html`);
