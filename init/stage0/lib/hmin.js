function getLocations(code, match) {
    const hits = [];
    let index = 0;
    do {
        index = code.indexOf(match, index + 1);
        if (index && index !== -1) hits.push(index);
    } while (index !== -1);
    if (hits.length > 0) return hits;
    else return null;
}

module.exports = function (code) {
    const starts = getLocations(code, 'h`\n');
    if (!starts) return code;

    const ends = getLocations(code, '\n`');
    if (!ends || ends.length !== starts.length) return code;

    let formatted = code.slice(0, starts[0] + 2);
    for (let i = 0; i < starts.length; i++) {
        formatted += code.slice(starts[i] + 3, ends[i])
            .replace(/[\s\n]+/g, ' ');
        if (starts[i + 1]) formatted += code.slice(ends[i] + 1, starts[i + 1] + 2);
        else formatted += code.slice(ends[i] + 1);
    }
    return formatted;
};
