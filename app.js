require("dotenv").config();

const tress = require("tress");

const appUtils = require("./appUtils");
const apiParser = require("./parserApi");
const htmlParser = require("./parserHTML");
const mysql = require("./mysql");
const CronJob = require('cron').CronJob;

let isParsing = false;

async function main(params) {

}

let q = tress(function (job, done) {
    isParsing = true;
    if (!job.page) {
        job.page = 0;
    }
    htmlParser.autoria.searchAdverts(job).then(async function (data) {
        if (data && data.adverts && data.adverts.length > 0) {
            mysql.saveAdverts(data.adverts);
            await appUtils.wait(2000);
            q.push({ page: (job.page + 1) });
        }
        else {
            console.log("Нет строк на запись");
            isParsing = false;
        }
        done();
    });

}, 2);


q.drain = function () {
    appUtils.log("Finished");
    isParsing = false;

}

q.error = function (err) {
    appUtils.log('Job ' + this + ' failed with error ' + err);
}

q.success = function (data) {
    appUtils.log('Страница ' + this.page + ' успешно просканирована.');
}



let job = new CronJob('* */5 * * * *', function () {
    if (!isParsing) {
        isParsing = true;
        appUtils.log("Starting parsing process")
        q.push({ page: 0 });
        return;
    }
}, null, true, null, null, true);

job.start();