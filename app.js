require("dotenv").config();

const tress = require("tress");

const appUtils = require("./appUtils");
const apiParser = require("./parserApi");
const htmlParser = require("./parserHTML");
const mysql = require("./mysql");

async function main(params) {
    //await searchAdverts({ countpage: 100, category_id: 1, currency: 1 });

    q.push({ page: 0 });


}

let q = tress(function (job, done) {
    htmlParser.autoria.searchAdverts(job).then(function (data) {
        //if (data.adverts.length > 0 && job.page<4)
        //  q.push({ page: job.page + 1 });
        //appUtils.saveToJSON(data,`page_${job.page}`);
        if (data.adverts.length > 0 && job.page<10)
            {
                mysql.saveAdverts(data.adverts);
                appUtils.wait(2000);
                q.push({page:job.page+1??0});
            }
        else console.log("Нет строк на запись")
        done();
    });

}, 2);


q.drain = function () {
    //appUtils.log("Finished");
}

q.error = function (err) {
    //appUtils.log('Job ' + this + ' failed with error ' + err);
}

q.success = function (data) {
    appUtils.log('Страница ' + this.page + ' успешно просканирована.');
}

main();