const fs = require('fs');
const path = require('path');

const lineSplit = /(?:\r\n|\r|\n)/g;
const sqlTag = /^#[\t ]*@import[\t ]*["'](.*)["'][\t ]*$/;

let Current = {
    paths: '',
    extensions: ['.sql']
};

function exists(file) {
    try { return fs.statSync(file).isFile(); }
    catch(e) { return false; }
}

function find(file) {
    if (exists(file)) return file;
    for (let ext in Current.extensions) {
        const match = file + Current.extensions[ext];
        if (exists(match)) return match;
    }
    return false;
}

function searchRelative(file, origin) {
    if (!origin) return false;
    return find(path.join(path.dirname(origin), file));
}

function searchRoot(file) {
    for (let p in Current.paths) {
        const match = find(path.resolve(process.cwd(), Current.paths[p], file));
        if (match) return match;
    }
    return false;
}

function handleSql(origin, file, result) {
    const match = searchRelative(file, origin) || searchRoot(file);
    if (!match) {
        console.error('ERROR: Could not @import ' + file + '!');
        process.exit(1);
    }

    for (const ln of scan(fs.readFileSync(match), match)) result.push(ln);
    return result;
}

function scan(buffer, origin, newFile) {
    const array = buffer.toString().split(lineSplit);
    let result = [];
    for (const line of array) {
        if (line.match(sqlTag)) result = handleSql(origin, line.match(sqlTag)[1], result);
        else result.push(line);
    }
    if (newFile) return result.join('\n');
    else return result;
}

module.exports = function (buffer, origin, options) {
    if (options) {
        if (options.paths) Current.paths = options.paths;
        if (options.extensions) Current.extensions = options.extensions;
    }
    return scan(buffer, origin, true);
};
