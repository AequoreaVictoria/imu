module.exports = function (options) {
    if (!options.input) {
        console.error('ERROR: No input provided!');
        process.exit(1);
    }
    if (!options.target) {
        console.error('ERROR: No target provided!');
        process.exit(1);
    }

    if (options.header) return `${options.input}\n` + options.target;

    if (!options.key) {
        console.error('ERROR: No key provided!');
        process.exit(1);
    }

    const injectTag = new RegExp(`^[\\t ]*<!--[\\t ]*@inject[\\t ]*["']${options.key}["'][\\t ]*\\/\\/-->[\\t ]*$`);

    const lineSplit = /(?:\r\n|\r|\n)/g;
    const array = options.target.toString().split(lineSplit);

    let result = [];
    for (const line of array) {
        if (line.match(injectTag)) {
            const inputArray = options.input.toString().split(lineSplit);
            if (options.prepend) result.push(options.prepend);
            for (const inputLine of inputArray) result.push(inputLine);
            if (options.append) result.push(options.append);
        } else result.push(line);
    }
    return result.join('\n');
};
