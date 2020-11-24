module.exports.log = function (message) {
    console.log(message);
};

module.exports.wait = function (ms) {
    return new Promise((resolve) => { setTimeout(resolve, ms) });
}