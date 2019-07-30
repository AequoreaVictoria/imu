const {
    DEPLOY,
    ROOT,
    SERVER,
    SSL,
    SQL_PATH,
    PATCHES,
    TABLES
} = require('../lib/constants');

const fs = require('fs-extra');
const path = require('path');
const execSync = require('child_process').execSync;

function cpConf() {
    fs.mkdirSync(`./${DEPLOY}`, {recursive: true});
    fs.copySync('./nginx.conf', `./${DEPLOY}/nginx.conf`, {overwrite: true});
    fs.copySync(`./${SSL}/`, `./${DEPLOY}/${SSL}/`, {overwrite: true});
    console.info(`--- Copied nginx.conf -> ${DEPLOY + path.sep}`);
    console.info(`--- Copied ${SSL + path.sep} -> ${DEPLOY + path.sep + SSL + path.sep}`);
}

function rmServerDir() {
    fs.removeSync(`./${DEPLOY}/${SERVER}`);
    console.info(`--- Clearing ${DEPLOY + path.sep + SERVER + path.sep}`);
}

function mkSQL() {
    const origin = `./${SQL_PATH}/${ROOT}.sql`;

    let buffer = fs.readFileSync(origin);
    buffer = require('../lib/import-sql')(buffer, origin, {
        paths: [`${SQL_PATH}/${TABLES}`]
    });

    fs.outputFileSync(`./${SQL_PATH}/${PATCHES}/0000000001.sql`, buffer);
    console.info(`--- Compiled SQL tables -> ${PATCHES + path.sep}0000000001.sql`);
}

function mkServer() {
    let runtime;
    if (/^lin/.test(process.platform)) runtime = 'linux-x64';
    if (/^dar/.test(process.platform)) runtime = 'osx-x64';
    if (/^win/.test(process.platform)) runtime = 'win-x64';

    rmServerDir();
    cpConf();
    console.info(`--- Compiling server for ${runtime}`);
    try { execSync('dotnet restore', {stdio: 'inherit'}); }
    catch(e) {
        console.error('ERROR: Could not finish \'dotnet restore\'!');
        process.exit(1);
    }
    try {
        execSync('dotnet publish '
            + `--self-contained --runtime ${runtime} `
            + '--configuration Release '
            + `--output .${path.sep + DEPLOY + path.sep + SERVER + path.sep} `
            + `.${path.sep + SERVER + path.sep}`,
        {stdio: 'inherit'});
    }
    catch(e) {
        console.error('ERROR: Could not finish \'dotnet publish\'!');
        process.exit(1);
    }
}

function mkServerLinux() {
    rmServerDir();
    cpConf();
    console.info('--- Compiling server for linux-x64');
    try { execSync('dotnet restore', {stdio: 'inherit'}); }
    catch(e) {
        console.error('ERROR: Could not finish \'dotnet restore\'!');
        process.exit(1);
    }
    try {
        execSync('dotnet publish '
            + '--self-contained --runtime linux-x64 '
            + '--configuration Release '
            + `--output .${path.sep + DEPLOY + path.sep + SERVER + path.sep} `
            + `.${path.sep + SERVER + path.sep}`,
        {stdio: 'inherit'});
    }
    catch(e) {
        console.error('ERROR: Could not finish \'dotnet publish\'!');
        process.exit(1);
    }
}

module.exports = function handleServer(args) {
    require('../lib/root')();
    switch (args) {
        case 'copy-conf': return cpConf();
        case 'sql': return mkSQL();
        case 'server': return mkServer();
        case 'server-linux': return mkServerLinux();
    }
};
