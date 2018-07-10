const {
    CLIENT,
    TMP,
    PAGES_PATH,
    ROOT
} = require("../lib/constants");

const fs = require("fs");
const path = require("path");

const imuImport = require("../lib/import");

const page = process.argv[3];
const origin = `./${PAGES_PATH}/${page}/${ROOT}.html`;

require("../lib/root")();

let buffer = fs.readFileSync(origin);
buffer = imuImport(buffer, origin, {
    paths: [`${CLIENT}`, `${PAGES_PATH}`],
    extensions: {scripts: [".html", ".js", ".json"]}
});

fs.mkdirSync(`./${TMP}/${page}/`, {recursive: true});
fs.writeFileSync(`./${TMP}/${page}/${ROOT}.html`, buffer);
console.info(`--- Compiled ${page + path.sep + ROOT}.html -> ${TMP + path.sep + page + path.sep + ROOT}.html`);
