const {
    PAGES_PATH,
    ROOT,
} = require('../lib/constants');

const fs = require('fs');
const execSync = require('child_process').execSync;

module.exports = function handleTupless(args) {
    const mode = args === 'client-release' ? '--release' : '--debug';

    require('../lib/root')();

    if (!fs.existsSync(`./${PAGES_PATH}`)) {
        console.error('ERROR: No pages directory!');
        process.exit(1);
    }

    const hasCompress = mode === '--release';
    fs.readdirSync(`./${PAGES_PATH}`)
        .filter(f => fs.statSync(`./${PAGES_PATH}/${f}`).isDirectory())
        .map((page) => {
            const hasJs = fs.existsSync(`./${PAGES_PATH}/${page}/${ROOT}.js`);
            const hasCss = fs.existsSync(`./${PAGES_PATH}/${page}/${ROOT}.css`);
            const hasHtml = fs.existsSync(`./${PAGES_PATH}/${page}/${ROOT}.html`);
            if (!hasJs && !hasCss && !hasHtml) return;

            if (hasJs) {
                try { execSync(`node ./.imu/build/js.js ${mode} ${page}`, {stdio: 'inherit'}); }
                catch(e) {
                    console.error('ERROR: Could not finish \'build/js.js\'!');
                    process.exit(1);
                }
            }

            if (hasHtml) {
                try { execSync(`node ./.imu/build/html.js ${mode} ${page}`, {stdio: 'inherit'}); }
                catch(e) {
                    console.error('ERROR: Could not finish \'build/html.js\'!');
                    process.exit(1);
                }
            }

            if (hasCss) {
                try { execSync(`node ./.imu/build/css.js ${mode} ${page}`, {stdio: 'inherit'}); }
                catch(e) {
                    console.error('ERROR: Could not finish \'build/css.js\'!');
                    process.exit(1);
                }
            }

            try { execSync(`node ./.imu/build/bundle.js ${mode} ${page}`, {stdio: 'inherit'}); }
            catch(e) {
                console.error('ERROR: Could not finish \'build/bundle.js\'!');
                process.exit(1);
            }

            if (hasCompress) {
                try { execSync(`node ./.imu/build/compress.js ${page}`, {stdio: 'inherit'}); }
                catch(e) {
                    console.error('ERROR: Could not finish \'build/compress.js\'!');
                    process.exit(1);
                }
            }
        });
};
