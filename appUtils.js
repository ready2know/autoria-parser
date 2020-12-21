
const fs = require("fs");
let messageCount = 0;
let messageArchive = [];

module.exports.log = function (message) {
    let dt = new Date();
    let dtStr = `${dt.getDate()}-${dt.getMonth() + 1} ${dt.getHours()}:${dt.getMinutes()}:${dt.getSeconds()}`;

    console.log(`${dtStr}> ${message}`);
    messageArchive.push(message);
    if (messageArchive.length > 5) {
        for (let msg of messageArchive)
            fs.appendFile('.temp/msg.log', `${msg}\n`, function (err) {
                if (err) {
                    console.log(err);
                }
            });
        messageArchive = [];
    }
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

module.exports.saveToTXT = function (obj, filename = `tmp`) {

    if (typeof obj !== "string") obj = JSON.stringify(obj);
    fs.writeFile(`.temp/${filename}_${Date.now()}.txt`, obj, function (err) {
        if (err) {
            console.log(err);
        }
    });
}