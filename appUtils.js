
const fs = require("fs");


module.exports.log = function (message) {
    console.log(message);
};

module.exports.wait = function (ms) {
    return new Promise((resolve) => { setTimeout(resolve, ms) });
}

module.exports.sleep = module.exports.wait;
module.exports.printProgress = function (progress) {
    process.stdout.clearLine();
    process.stdout.cursorTo(0);
    process.stdout.writeLine(progress);
}

module.exports.saveToJSON = function (obj, filename = `tmp`) {
    if (typeof obj !== "string") obj = JSON.stringify(obj);
    fs.writeFile(`.temp/${filename}_${Date.now()}.json`, obj, function (err) {
        if (err) {
            console.log(err);
        }
    });
}