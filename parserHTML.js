const axios = require("axios");
const cheerio = require("cheerio");

const AUTORIA_URI = require("./autoriaUri");


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

        let adverts = [];

        $("section.ticket-item").each(function (i, item) {
            let info = $(this).find("div.hide").first();
            let price = $(this).find("div.price-ticket").first().data("main-price");
            let description = $(this).find("div.definition-data").first();
            let milleage = description.find('.icon-mileage').first().parent().text().trim().replace(" тыс. км", "").replace("без пробега", "0");
            let transmission = description.find('i[title="Тип коробки передач"]').first().parent().text().trim();

            let driverOpt = description.find('.icon-fuel').first().parent().text().trim();
            let fuelType = "Не указано";
            let driverCap = "0";

            if (driverOpt.indexOf(",") > 0) {
                fuelType = driverOpt.substring(0, driverOpt.indexOf(","));
                driverCap = driverOpt.substring(driverOpt.indexOf(",") + 1 || driverOpt.length, driverOpt.indexOf("л.")).trim();
            }
            else if (driverOpt.length === 0) {
                fuelType = description.find('.icon-battery').first().parent().text().trim();
                //driverCap = driverOpt;
            }
            let location = description.find('.icon-location').first().parent().text().trim()

            let advert = {
                'brand': `${info.data("mark-name")}`,
                'model': `${info.data("model-name")}`,
                'year': `${info.data("year")}`,
                'advert_id': `${info.data("id")}`,
                'user_id': `${info.data("user-id")}`,
                'add_date': `${info.data("expire-date")}`,
                'link': `${info.data("link-to-view")}`,
                'price': price,
                'milleage': milleage,
                'transmission': transmission || "",
                'fuelType': fuelType,
                'driverCap': driverCap,
                'location': location
            }
            adverts.push(advert);

        });

        console.log(adverts);

        return adverts;
    }).catch((err) => { console.log(err); });
}


module.exports.autoria = {
    searchAdverts: searchAdverts,
    // getAdvertPhotos: getAdvertPhotos,
    // getAdvertInfo: getAdvertInfo,
    // getAvgPrice: getAvgPrice
}

searchAdverts()