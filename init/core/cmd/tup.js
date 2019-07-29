const {
    TMP,
    PAGES_PATH,
    DEPLOY_PATH,
    ROOT,
} = require('../lib/constants');

const fs = require('fs-extra');
const execSync = require('child_process').execSync;
const glob = require('glob');

module.exports = function handleTup(args) {
    const mode = args === 'client-release' ? '--release' : '--debug';

    require('../lib/root')();

    if (!fs.existsSync(`./${PAGES_PATH}`)) {
        console.error('ERROR: No pages directory!');
        process.exit(1);
    }

    const hasCompress = mode === '--release';
    let hasPages = false;
    let hasJs = false;
    let hasCss = false;
    let hasHtml = false;
    fs.readdirSync(`./${PAGES_PATH}`)
        .filter(f => fs.statSync(`./${PAGES_PATH}/${f}`).isDirectory())
        .map((page) => {
            hasJs = fs.existsSync(`./${PAGES_PATH}/${page}/${ROOT}.js`);
            hasCss = fs.existsSync(`./${PAGES_PATH}/${page}/${ROOT}.css`);
            hasHtml = fs.existsSync(`./${PAGES_PATH}/${page}/${ROOT}.html`);
            if (hasJs || hasCss || hasHtml) hasPages = true;

            const compiledJs = hasJs ? `tmp.."/${ROOT}.js"` : '';
            const compiledCss = hasCss ? `tmp.."/${ROOT}.css"` : '';
            const compiledHtml = hasHtml ? `tmp.."/${ROOT}.html"` : '';

            let js = hasJs ? `\
            tup.definerule{
              inputs = {"${ROOT}.js"},
              command = imu.."js.js ${mode} ${page}",
              outputs = {${compiledJs}}
            }` : '';

            let html = hasHtml ? `\
            tup.definerule{
              inputs = {"${ROOT}.html"},
              command = imu.."html.js ${mode} ${page}",
              outputs = {${compiledHtml}}
            }` : '';

            let css = hasCss ? `\
            tup.definerule{
              inputs = {
                "${ROOT}.css",
                ${compiledJs ? compiledJs + ',' : ''}
                ${compiledHtml}
              },
              command = imu.."css.js ${mode} ${page}",
              outputs = {${compiledCss}}
            }` : '';

            const bundle = `\
            tup.definerule{
              inputs = {
                ${compiledJs ? compiledJs + ',' : ''}
                ${compiledCss ? compiledCss + ',' : ''}
                ${compiledHtml}
              },
              command = imu.."bundle.js ${mode} ${page}",
              outputs = {dest.."/${page}.html"}
            }`;

            let compress = hasCompress ? `\
            tup.definerule{
              inputs = {dest.."/${page}.html"},
              command = imu.."compress.js ${page}",
              outputs = {
                dest.."/${page}.html.gz"
              }
            }` : '';

            const tupfile = `\
            local imu = "node ../../../.imu/build/"
            local tmp = "../../../${TMP}/${page}"
            local dest = "../../../${DEPLOY_PATH}"

            ${js}
            ${html}
            ${css}
            ${bundle}
            ${compress}
            `;

            fs.writeFileSync(`./${PAGES_PATH}/${page}/Tupfile.lua`, tupfile);
        });

    if (!hasPages) {
        console.error('ERROR: No pages to build!');
        process.exit(1);
    }

    if (!fs.existsSync('.tup')) {
        try { execSync('tup init', {stdio: 'inherit'}); }
        catch(e) {
            console.error('ERROR: Could not finish \'tup init\'!');
            process.exit(1);
        }
    }

    try { execSync('tup', {stdio: 'inherit'}); }
    catch(e) {
        const files = glob.sync('**/Tupfile.lua');
        for (let i = 0; i < files.length; i++) fs.removeSync(files[i]);
        console.error('ERROR: Could not finish \'tup\'!');
        process.exit(1);
    }

    const files = glob.sync('**/Tupfile.lua');
    for (let i = 0; i < files.length; i++) fs.removeSync(files[i]);
};
