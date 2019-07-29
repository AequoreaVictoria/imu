const fs = require('fs');
const path = require('path');

module.exports = function findRoot() {
    if (path.parse(process.cwd()).root === process.cwd()) {
        console.error('ERROR: No .imu directory found in project!');
        process.exit(1);
    }

    let notRoot = !fs.existsSync('./.imu');
    if (notRoot) {
        process.chdir('../');
        notRoot = !fs.existsSync('./.imu');
    }
    if (notRoot) findRoot();
};
