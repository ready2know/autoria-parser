require("dotenv").config();

const tress = require("tress");

const appUtils = require("./appUtils");
const apiParser = require("./parserApi");
const htmlParser = require("./parserHTML");
const mysql = require("./mysql");
const CronJob = require('cron').CronJob;

let parsingStatus = "waiting";

async function main(params) {

}

let q = tress(function (job, done) {
    parsingStatus = "ongoing";
    if (!job.page) {
        job.page = 0;
    }
    htmlParser.autoria.searchAdverts(job).then(function (data) {
        if (data && data.adverts && data.adverts.length > 0) {
            mysql.saveAdverts(data.adverts);
            appUtils.wait(10000);
            q.push({ page: (job.page + 1) });
        }
        else {
            console.log("Нет строк на запись");
            parsingStatus = 'waiting';
        }
        done();
    });

}, 2);


q.drain = function () {
    appUtils.log("Finished");
    parsingStatus = 'waiting';

}

q.error = function (err) {
    appUtils.log('Job ' + this + ' failed with error ' + err);
}

q.success = function (data) {
    appUtils.log('Страница ' + this.page + ' успешно просканирована.');
}



let job = new CronJob('* */5 * * * *', function () {
    if (parsingStatus == "waiting")
        q.push({ page: 0 });
}, null, true, null, null, true);

//job.start();