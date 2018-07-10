const fs = require("fs");
const path = require("path");
const xmldom = require("xmldom");

const parser = new xmldom.DOMParser();
const serializer = new xmldom.XMLSerializer();

const lineSplit = /(?:\r\n|\r|\n)/g;
const importTag = /^[\t ]*<!--[\t ]*@import[\t ]*["'](.*)["'][\t ]*\/\/-->[\t ]*$/;
const scriptTag = /^[\t ]*<!--[\t ]*@script[\t ]*["'](.*)["'][\t ]*\/\/-->[\t ]*$/;
const svgTag = /^[\t ]*<!--[\t ]*@svg[\t ]*["'](.*)["'][\t ]*\/\/-->[\t ]*$/;
const importSqlTag = /^#[\t ]*@import[\t ]*["'](.*)["'][\t ]*$/;

let Current = {
    paths: "",
    extensions: {
        imports: [".html", ".js", ".json"],
        scripts: [".js", ".json"],
        svgs: [".svg"]
    }
};

function exists(file) {
    try { return fs.statSync(file).isFile(); }
    catch { return false; }
}

function find(type, file) {
    if (exists(file)) return file;
    if (type === "import") {
        for (let i = 0, max = Current.extensions.imports.length; i < max; i++) {
            const match = file + Current.extensions.imports[i];
            if (exists(match)) return match;
        }
    } else if (type === "script") {
        for (let i = 0, max = Current.extensions.scripts.length; i < max; i++) {
            const match = file + Current.extensions.scripts[i];
            if (exists(match)) return match;
        }
    } else if (type === "svg") {
        for (let i = 0, max = Current.extensions.svgs.length; i < max; i++) {
            const match = file + Current.extensions.svgs[i];
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
    for (let i = 0, max = Current.paths.length; i < max; i++) {
        const match = find(type, path.resolve(process.cwd(), Current.paths[i], file));
        if (match) return match;
    }
    return false;
}

function processSvg(buffer, name) {
    let icon = parser.parseFromString(buffer.toString("utf8"), "image/svg+xml");
    let svg = icon.getElementsByTagName("svg")[0];
    svg.setAttribute("id", `svg-${name}`);
    svg.setAttribute("fill", "inherit");
    svg.removeAttribute("height");
    svg.removeAttribute("width");
    return serializer.serializeToString(icon);
}

function handleSvg(origin, file, result) {
    const match = searchRelative("svg", file, origin) || searchRoot("svg", file);
    if (!match) {
        console.error("ERROR: Could not add @svg " + file + "!");
        process.exit(1);
    }

    const name = path.basename(match, ".svg");
    result.push(processSvg(fs.readFileSync(match), name));
    return result;
}

function handleScript(origin, file, result) {
    let tagName = file.split(/[\\/]/).pop();
    for (let i = 0, max = Current.extensions.scripts.length; i < max; i++) {
        tagName = tagName.replace(Current.extensions.scripts[i], "");
    }

    const match = searchRelative("script", file, origin) || searchRoot("script", file);
    if (!match) {
        console.error("ERROR: Could not add @script " + file + "!");
        process.exit(1);
    }

    for (const ln of scan(fs.readFileSync(match), match, true, tagName)) result.push(ln);
    return result;
}

function handleImport(origin, file, result) {
    const match = searchRelative("import", file, origin) || searchRoot("import", file);
    if (!match) {
        console.error("ERROR: Could not add @import " + file + "!");
        process.exit(1);
    }

    for (const ln of scan(fs.readFileSync(match), match)) result.push(ln);
    return result;
}

function scan(buffer, origin, tagged, tagName, newFile) {
    const array = buffer.toString("utf8").split(lineSplit);
    let result = [];
    for (const line of array) {
        if (line.match(importTag)) result = handleImport(origin, line.match(importTag)[1], result);
        else if (line.match(scriptTag)) result = handleScript(origin, line.match(scriptTag)[1], result);
        else if (line.match(svgTag)) result = handleSvg(origin, line.match(svgTag)[1], result);
        else if (line.match(importSqlTag)) result = handleImport(origin, line.match(importSqlTag)[1], result);
        else result.push(line);
    }
    if (tagged) {
        result.splice(0, 0, `<script type="x/templates" id="script-${tagName}">`);
        result.push("</script>");
    }
    if (newFile) return result.join("\n");
    else return result;
}

module.exports = function (buffer, origin, options) {
    if (options) {
        if (options.paths) Current.paths = options.paths;
        if (options.extensions) {
            if (options.extensions.imports) Current.extensions.imports = options.extensions.imports;
            if (options.extensions.scripts) Current.extensions.scripts = options.extensions.scripts;
            if (options.extensions.svgs) Current.extensions.svgs = options.extensions.svgs;
        }
    }
    return scan(buffer, origin, false, null, true);
};
