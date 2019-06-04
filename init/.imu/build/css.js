const {
    CLIENT,
    TMP,
    PAGES_PATH,
    STYLE_PATH,
    ROOT,
    TAILWIND,
    BASE
} = require("../lib/constants");

const fs = require("fs");
const path = require("path");
const postcss = require("postcss");
const cssImport = require("postcss-import");
const tailwind = require("tailwindcss");
const presetEnv = require("postcss-preset-env");
const purgecss = require("purgecss");
const whitelister = require("purgecss-whitelister");
const csso = require("csso");

const isRelease = process.argv[2] === "--release";
const page = process.argv[3];
const origin = `./${PAGES_PATH}/${page}/${ROOT}.css`;

require("../lib/root")();

/* Process @imports, Tailwind and PostCSS features into standard CSS.
 * 'path' controls the addition of search paths for @import.
 *
 * On 'client-release' all 'content' paths are scanned to build a list of
 * used classes. All unused classes are purged, unless present in the
 * 'whitelist'. The result is then minified.
 *
 * You may need to update 'content' and 'whitelist' for specific libraries.
 */

let buffer = fs.readFileSync(origin);
postcss([
    cssImport({
        path: [`${CLIENT}`, `${PAGES_PATH}`, "node_modules"]
    }),
    tailwind(`./${STYLE_PATH}/${TAILWIND}.js`),
    presetEnv({
        stage: 2,
        features: {"nesting-rules": true}
    })
]).process(buffer, {from: undefined}).then(result => {
    buffer = result.css;

    if (isRelease) {
        const purger = new purgecss({
            css: [{raw: buffer}],
            content: [
                `./${TMP}/${page}/**/*.html`,
                `./${TMP}/${page}/**/*.js`
            ],
            extractors: [{
                extractor: class {
                    static extract(content) {
                        return content.match(/[A-Za-z0-9:_/-]+/g);
                    }
                },
                extensions: ["html", "js"]
            }],
            whitelist: whitelister([
                "./node_modules/tailwindcss/dist/base.css",
                `./${STYLE_PATH}/${BASE}.css`
            ])
        });
        buffer = csso.minify(purger.purge()[0].css, {comments: "none"}).css;
    }

    fs.mkdirSync(`./${TMP}/${page}/`, {recursive: true});
    fs.writeFileSync(`./${TMP}/${page}/${ROOT}.css`, buffer);
    console.info(`--- Compiled ${page + path.sep + ROOT}.css -> ${TMP + path.sep + page + path.sep + ROOT}.css`);
});
