#!/usr/bin/env node
const fs = require("fs-extra");
const path = require("path");
const execSync = require("child_process").execSync;

function findRoot() {
    if (path.parse(process.cwd()).root === process.cwd()) {
        console.error("ERROR: No imu directory found in project!");
        process.exit(1);
    }

    let nodeRoot = fs.existsSync("./.imu");
    if (!nodeRoot) {
        process.chdir("../");
        nodeRoot = fs.existsSync("./.imu");
    }
    if (!nodeRoot) findRoot();
}

if (process.argv[2] === "version" || process.argv[2] === "ver") {
    const package = require('./package.json');
    console.info(`imu v${package.version}`);
    return;
}

if (process.argv[2] === "init") {
    const type = process.argv[3] ? process.argv[3] : "stage0";

    fs.copySync(`${__dirname}/init/core`, process.cwd());
    fs.copySync(`${__dirname}/init/${type}`, process.cwd());

    try { execSync("npm i", {stdio: "inherit"}); }
    catch { process.exit(1); }
    return;
}

findRoot();
const args = process.argv.slice(2).join(" ");
try { execSync(`node ./.imu/run.js ${args}`, {stdio: "inherit"}); }
catch { process.exit(1); }
