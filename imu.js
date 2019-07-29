#!/usr/bin/env node
const fs = require('fs-extra');
const path = require('path');
const execSync = require('child_process').execSync;

function findRoot() {
    if (path.parse(process.cwd()).root === process.cwd()) return false;

    let nodeRoot = fs.existsSync('./.imu');
    if (!nodeRoot) {
        process.chdir('../');
        nodeRoot = fs.existsSync('./.imu');
    }
    if (!nodeRoot) return findRoot();

    return true;
}

if (process.argv[2] === 'version') {
    const pkg = require('./package.json');
    console.info(`imu-build v${pkg.version}`);

    if (findRoot()) {
        const localpkg = require(`${process.cwd()}/.imu/version.json`);
        console.info(`-- project uses v${localpkg.version}`);
    }
    return;
}

if (process.argv[2] === 'init') {
    const type = process.argv[3] ? process.argv[3] : 'stage0';
    const target = `${process.cwd()}/.imu/`;

    fs.copySync(`${__dirname}/init/core`, target);
    fs.copySync(`${__dirname}/init/${type}`, target);

    const pkg = require('./package.json');
    fs.outputFileSync(`${target}/version.json`,
        `{\n  "version": "${pkg.version}"\n}\n`);

    fs.copySync(`${__dirname}/init/core/.gitignore`, `${process.cwd()}/.gitignore`);
    fs.moveSync(`${target}/package.json`, `${process.cwd()}/package.json`);
    fs.moveSync(`${target}/package-lock.json`, `${process.cwd()}/package-lock.json`);

    try { execSync('npm i', {stdio: 'inherit'}); }
    catch(e) { process.exit(1); }
    return;
}

if (!findRoot()) {
    console.error('ERROR: No imu directory found in project!');
    process.exit(1);
}

const args = process.argv.slice(2).join(' ');
try { execSync(`node ./.imu/run.js ${args}`, {stdio: 'inherit'}); }
catch(e) { process.exit(1); }
