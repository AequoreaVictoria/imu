const {
    STYLE,
    COMPONENTS,
    PAGES_PATH,
    STYLE_PATH,
    STATIC_PATH,
    LICENSE,
    ROOT,
    TAILWIND,
    BASE,
    SERVER,
    SQL_PATH,
    PATCHES,
    TABLES
} = require('../lib/constants');

const {
    getLicenseHTML,
    getRootHTML,
    getRootCSS,
    getBaseCSS,
    getRootJS,
    getComponentJS,
    getSQLRoot,
    getSQLTable,
    getServerProj
} = require('../lib/templates');

const fs = require('fs-extra');
const path = require('path');

function err() {
    console.info('USAGE: \n' +
        '    imu new <--page|-p> <--component|-c>\n' +
        '        The -c and -p flags are optional. They may only be used once each.\n' +
        '    imu new --server <ServerName>\n' +
        '        Creates server.csproj using ServerName.\n' +
        '    imu new --sql <DatabaseName>\n' +
        '        Creates root.sql using DatabaseName.\n' +
        '    imu new --table <TableName>\n' +
        '        Creates TableName.sql.\n' +
        '    imu new --patch\n' +
        '        Creates a blank patch .sql named with the current UNIX timestamp.\n');
    process.exit(1);
}

if (process.argv.length < 4 || process.argv.length > 7) err();

let page;
let component;
let name;

function mkLicenseHTML() {
    fs.outputFileSync(`./${PAGES_PATH}/${page}/${LICENSE}.html`, getLicenseHTML());
    console.info(`--- Created ${page + path.sep + LICENSE}.html`);
}

function mkRootHTML() {
    fs.outputFileSync(`./${PAGES_PATH}/${page}/${ROOT}.html`, getRootHTML(page));
    console.info(`--- Created ${page + path.sep + ROOT}.html`);
}

function mkRootCSS() {
    fs.outputFileSync(`./${PAGES_PATH}/${page}/${ROOT}.css`, getRootCSS(`${STYLE}/${BASE}`));
    console.info(`--- Created ${page + path.sep + ROOT}.css`);
}

function mkBaseCSS() {
    fs.outputFileSync(`./${STYLE_PATH}/${BASE}.css`, getBaseCSS());
    console.info(`--- Created ${STYLE + path.sep + BASE}.css`);
}

function mkTailwindJS() {
    const execSync = require('child_process').execSync;

    fs.mkdirSync(`./${STYLE_PATH}/`, {recursive: true});
    try { execSync(`node ./node_modules/tailwindcss/lib/cli.js init ./${STYLE_PATH}/${TAILWIND}.js --full`); }
    catch(e) {
        console.error('ERROR: Could not create Tailwind configuration!');
        process.exit(1);
    }
    console.info(`--- Created ${STYLE + path.sep + TAILWIND}.js`);
}

function mkRootJS() {
    fs.outputFileSync(`./${PAGES_PATH}/${page}/${ROOT}.js`, getRootJS(page));
    console.info(`--- Created ${page + path.sep + ROOT}.js`);
}

function mkComponentJS() {
    fs.outputFileSync(`./${PAGES_PATH}/${page}/${COMPONENTS}/${component}.js`, getComponentJS(component));
    console.info(`--- Created ${page + path.sep + COMPONENTS + path.sep + component}.js`);
}

function mkFaviconICO() {
    fs.outputFileSync(`./${STATIC_PATH}/favicon.ico`, Buffer.from(
        '4749463839610100010090000000000000000021f90405100000002c00000000010001000002020401003b',
        'hex'));
    console.info(`--- Created ${STATIC_PATH + path.sep}favicon.ico`);
}

function mkSQLRoot() {
    fs.outputFileSync(`./${SQL_PATH}/${ROOT}.sql`, getSQLRoot(name));
    console.info(`--- Created ${SQL_PATH + path.sep + ROOT}.sql`);
}

function mkSQLTable() {
    fs.outputFileSync(`./${SQL_PATH}/${TABLES}/${name}.sql`, getSQLTable(name));
    console.info(`--- Created ${TABLES + path.sep + name}.sql`);
}

function mkSQLPatch() {
    fs.outputFileSync(`./${SQL_PATH}/${PATCHES}/${name}.sql`, Buffer.from(''));
    console.info(`--- Created ${PATCHES + path.sep + name}.sql`);
}

function mkServerProj() {
    fs.outputFileSync(`./${SERVER}/${SERVER}.csproj`, getServerProj(name));
    console.info(`--- Created ${SERVER + path.sep + SERVER}.csproj`);
}

module.exports = function handleNew() {
    require('../lib/root')();

    if (process.argv[3] === 'help') err();

    component = (process.argv[3] === '-c' || process.argv[3] === '--component') ? process.argv[4] :
        (process.argv[5] === '-c' || process.argv[5] === '--component') ? process.argv[6] : undefined;
    page = (process.argv[3] === '-p' || process.argv[3] === '--page') ? process.argv[4] :
        (process.argv[5] === '-p' || process.argv[5] === '--page') ? process.argv[6] : undefined;

    let needsServer = false;
    let needsSqlRoot = false;
    let needsSqlTable = false;
    let needsSqlPatch = false;
    if (process.argv[3] === '--server') {
        name = process.argv[4];
        needsServer = true;
    } else if (process.argv[3] === '--sql') {
        name = process.argv[4];
        needsSqlRoot = true;
    } else if (process.argv[3] === '--table') {
        name = process.argv[4];
        needsSqlTable = true;
    } else if (process.argv[3] === '--patch') {
        name = Math.floor(Date.now() / 1000);
        needsSqlPatch = true;
    }

    if (component && !page) err();
    if (!name && !page) err();

    let needsMain = false;
    if (page) needsMain = !(
        fs.existsSync(`${PAGES_PATH}/${page}/${ROOT}.html`) ||
        fs.existsSync(`${PAGES_PATH}/${page}/${ROOT}.css`) ||
        fs.existsSync(`${PAGES_PATH}/${page}/${ROOT}.js`) ||
        fs.existsSync(`${PAGES_PATH}/${page}/${LICENSE}.html`));
    const needsTailwind = !fs.existsSync(`./${STYLE_PATH}/${TAILWIND}.js`);
    const needsFavicon = !fs.existsSync(`./${STATIC_PATH}/favicon.ico`);

    let queue = [];
    if (page && component) {
        queue.push(mkComponentJS);
    }
    if (needsMain) {
        queue.push(mkLicenseHTML);
        queue.push(mkRootCSS);
        queue.push(mkRootHTML);
        queue.push(mkRootJS);
    }
    if (needsTailwind) {
        queue.push(mkTailwindJS);
        queue.push(mkBaseCSS);
    }
    if (needsFavicon) queue.push(mkFaviconICO);
    if (needsSqlRoot) queue.push(mkSQLRoot);
    if (needsSqlTable) queue.push(mkSQLTable);
    if (needsSqlPatch) queue.push(mkSQLPatch);
    if (needsServer) {
        queue.push(mkSQLRoot);
        queue.push(mkServerProj);
    }

    if (queue.length === 0) {
        console.error('ERROR: Nothing to make!');
        process.exit(1);
    } else {
        for (let i = 0; i < queue.length; i++) queue[i]();
    }
};
