const {
    CLIENT,
    TMP,
    PAGES_PATH,
    ROOT
} = require("../lib/constants");

const fs = require("fs-extra");
const path = require("path");
const rollup = require("rollup").rollup;
const includepaths = require("rollup-plugin-includepaths");
const commonjs = require("rollup-plugin-commonjs");
const replace = require("rollup-plugin-replace");
const importVue = require("../lib/import-vue");
const minify = require("terser").minify;

const isRelease = process.argv[2] === "--release";
const page = process.argv[3];
const origin = `./${PAGES_PATH}/${page}/${ROOT}.js`;

require("../lib/root")();

rollup({
    input: origin,
    plugins: [
        includepaths({paths: [`${CLIENT}`, `${PAGES_PATH}`, "node_modules"]}),
        importVue({paths: [`${CLIENT}`, `${PAGES_PATH}`]}),
        commonjs(),
        replace({
            "process.env.NODE_ENV": JSON.stringify(isRelease ? "production" : "development")
        })
    ]
}).then((result) => {
    result.generate({format: "es"}).then((result) => {
        const {output} = result;

        let code;
        for (const chunk of output) if (!chunk.isAsset) code = chunk.code;

        if (isRelease) {
            const release = minify(code, {
                compress: {},
                mangle: {keep_fnames: true},
                output: {
                    beautify: false,
                    max_line_len: 0
                }
            });
            code = release.code;
        }

        fs.outputFileSync(`./${TMP}/${page}/${ROOT}.js`, code);
        console.info(`--- Compiled ${page + path.sep + ROOT}.js -> ${TMP + path.sep + page + path.sep + ROOT}.js`);
    });
});
