const fs = require('fs');
const path = require('path');
const compiler = require('vue-template-compiler');

const lineSplit = /(?:\r\n|\r|\n)/g;
const importTag = /^[\t ]*<!--[\t ]*@import[\t ]*["'](.*)["'][\t ]*\/\/-->[\t ]*$/;
const scriptTag = /^[\t ]*<!--[\t ]*@script[\t ]*["'](.*)["'][\t ]*\/\/-->[\t ]*$/;
const svgTag = /^[\t ]*<!--[\t ]*@svg[\t ]*["'](.*)["'][\t ]*\/\/-->[\t ]*$/;
const vueTag = /^\/\/[\t ]*@vue[\t ]*["'](.*)["'][\t ]*$/;

let Current = {
    paths: '',
    extensions: {
        import: ['.html'],
        vue: ['.html']
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
    } else if (type === 'vue') {
        for (let ext in Current.extensions.vue) {
            const match = file + Current.extensions.vue[ext];
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

function handleImport(origin, file, result) {
    const match = searchRelative('import', file, origin) || searchRoot('import', file);
    if (!match) {
        console.error('ERROR: Could not @import ' + file + '!');
        process.exit(1);
    }

    for (const ln of scan(fs.readFileSync(match), match)) result.push(ln);
    return result;
}

function handleVue(origin, file, result) {
    const match = searchRelative('vue', file, origin) || searchRoot('vue', file);
    if (!match) {
        console.error('ERROR: Could not add @vue ' + file + '!');
        process.exit(1);
    }

    let template = scan(fs.readFileSync(match), match);
    template = template.join(' ').replace(/\n+/g, ' ').replace(/\s+/g, ' ');
    const vue = compiler.compile(template);

    const renderFn = vue.render.replace(/'/g, '\\\'');
    result.push(`const render = new Function('${renderFn}');`);

    if (vue.staticRenderFns.length === 0) {
        result.push('const staticRenderFns = [];');
    } else {
        result.push('const staticRenderFns = [');
        for (let i = 0, max = vue.staticRenderFns.length; i < max; i++) {
            const staticFn = vue.staticRenderFns[i].replace(/'/g, '\\\'');
            result.push(`new Function('${staticFn}')${(i + 1 < max) ? ',' : ''}`);
        }
        result.push('];');
    }

    return result;
}

function scan(buffer, origin, newFile) {
    const array = buffer.toString().split(lineSplit);
    let result = [];
    for (const line of array) {
        if (line.match(importTag)) result = handleImport(origin, line.match(importTag)[1], result);
        else if (line.match(vueTag)) result = handleVue(origin, line.match(vueTag)[1], result);
        else if (line.match(scriptTag)) {
            console.error('ERROR: @script tags not supported in Vue templates!');
            process.exit(1);
        } else if (line.match(svgTag)) {
            console.error('ERROR: @svg tags not supported in Vue templates!');
            process.exit(1);
        } else result.push(line);
    }
    if (newFile) return result.join('\n');
    else return result;
}

module.exports = function Vue(options) {
    if (options) {
        if (options.paths) Current.paths = options.paths;
        if (options.extensions) {
            if (options.extensions.import) Current.extensions.import = options.extensions.import;
            if (options.extensions.vue) Current.extensions.vue = options.extensions.vue;
        }
    }
    return {
        name: 'vue',
        transform(buffer, origin) {
            origin = origin.replace(process.cwd(), '.');
            return scan(buffer, origin, true);
        }
    };
};
