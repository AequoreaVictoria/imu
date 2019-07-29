const fs = require('fs');
const path = require('path');
const xmldom = require('xmldom');

const parser = new xmldom.DOMParser();
const serializer = new xmldom.XMLSerializer();

const lineSplit = /(?:\r\n|\r|\n)/g;
const importTag = /^[\t ]*<!--[\t ]*@import[\t ]*["'](.*)["'][\t ]*\/\/-->[\t ]*$/;
const scriptTag = /^[\t ]*<!--[\t ]*@script[\t ]*["'](.*)["'][\t ]*\/\/-->[\t ]*$/;
const svgTag = /^[\t ]*<!--[\t ]*@svg[\t ]*["'](.*)["'][\t ]*\/\/-->[\t ]*$/;

let Current = {
    paths: '',
    extensions: {
        import: ['.html', '.js', '.json'],
        script: ['.js', '.json'],
        svg: ['.svg']
    }
};

function exists(file) {
    try { return fs.statSync(file).isFile(); }
    catch(e) { return false; }
}

function find(type, file) {
    if (exists(file)) return file;
    if (type === 'import') {
        for (let ext in Current.extensions.import) {
            const match = file + Current.extensions.import[ext];
            if (exists(match)) return match;
        }
    } else if (type === 'script') {
        for (let ext in Current.extensions.script) {
            const match = file + Current.extensions.script[ext];
            if (exists(match)) return match;
        }
    } else if (type === 'svg') {
        for (let ext in Current.extensions.svg) {
            const match = file + Current.extensions.svg[ext];
            if (exists(match)) return match;
        }
    }
    return false;
}

function searchRelative(type, file, origin) {
    if (!origin) return false;
    return find(type, path.join(path.dirname(origin), file));
}

function searchRoot(type, file) {
    for (let p in Current.paths) {
        const match = find(type, path.resolve(process.cwd(), Current.paths[p], file));
        if (match) return match;
    }
    return false;
}

function processSvg(buffer, name) {
    let icon = parser.parseFromString(buffer.toString(), 'image/svg+xml');
    let svg = icon.getElementsByTagName('svg')[0];
    svg.setAttribute('id', `svg-${name}`);
    svg.setAttribute('fill', 'inherit');
    svg.removeAttribute('height');
    svg.removeAttribute('width');
    return serializer.serializeToString(icon);
}

function handleSvg(origin, file, result) {
    const match = searchRelative('svg', file, origin) || searchRoot('svg', file);
    if (!match) {
        console.error('ERROR: Could not add @svg ' + file + '!');
        process.exit(1);
    }

    const name = path.basename(match, '.svg');
    result.push(processSvg(fs.readFileSync(match), name));
    return result;
}

function handleScript(origin, file, result) {
    let tagName = file.split(/[\\/]/).pop();
    for (let ext in Current.extensions.script) {
        tagName = tagName.replace(Current.extensions.script[ext], '');
    }

    const match = searchRelative('script', file, origin) || searchRoot('script', file);
    if (!match) {
        console.error('ERROR: Could not add @script ' + file + '!');
        process.exit(1);
    }

    for (const ln of scan(fs.readFileSync(match), match, true, tagName)) result.push(ln);
    return result;
}

function handleImport(origin, file, result) {
    const match = searchRelative('import', file, origin) || searchRoot('import', file);
    if (!match) {
        console.error('ERROR: Could not @import ' + file + '!');
        process.exit(1);
    }

    for (const ln of scan(fs.readFileSync(match), match)) result.push(ln);
    return result;
}

function scan(buffer, origin, tagged, tagName, newFile) {
    const array = buffer.toString().split(lineSplit);
    let result = [];
    for (const line of array) {
        if (line.match(importTag)) result = handleImport(origin, line.match(importTag)[1], result);
        else if (line.match(scriptTag)) result = handleScript(origin, line.match(scriptTag)[1], result);
        else if (line.match(svgTag)) result = handleSvg(origin, line.match(svgTag)[1], result);
        else result.push(line);
    }
    if (tagged) {
        result.splice(0, 0, `<script type="x/templates" id="script-${tagName}">`);
        result.push('</script>');
    }
    if (newFile) return result.join('\n');
    else return result;
}

module.exports = function (buffer, origin, options) {
    if (options) {
        if (options.paths) Current.paths = options.paths;
        if (options.extensions) {
            if (options.extensions.import) Current.extensions.import = options.extensions.import;
            if (options.extensions.script) Current.extensions.script = options.extensions.script;
            if (options.extensions.svg) Current.extensions.svg = options.extensions.svg;
        }
    }
    return scan(buffer, origin, false, null, true);
};
