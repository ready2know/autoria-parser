const axios = require("axios");
const appUtils = require("./appUtils");
const cheerio = require("cheerio");
const AUTORIA_URI = require("./autoriaUri");
const userAgent = require("random-useragent");


async function searchAdverts(params = {}) {

    let url = new URL(AUTORIA_URI.html.search);
    if (params) {
        for (let [key, value] of Object.entries(params)) {
            if (Array.isArray(value)) {
                value.forEach((item, index, array) => { url.searchParams.set(`${key}[${index}]`, item) })
            }
            else
                url.searchParams.set(key.toString(), value);
        }
    }

    if (Object.keys(params).length < 1) {
        url.searchParams.set("indexName", "auto");
        url.searchParams.set("categories.main.id", "1");
    }

    url.searchParams.set("price.currency", "1");
    url.searchParams.set("sort[0].order", "dates.created.desc");
    url.searchParams.set("page", "0");
    url.searchParams.set("size", "100");
    url.searchParams.set("abroad.not", "0");
    url.searchParams.set("custom.not", "1");

    console.log(url.href);

    return axios.get(url.href, {}).then((response) => {
        let $ = cheerio.load(response.data);

        $("section.ticket-item").each(function (i, item) {
            console.log($(this).find("div.ticket-title").first().text());
        });

        return response.data;
    }).catch((err) => { console.log(err); });
}



async function main(){
    searchAdverts();

    
}

main();