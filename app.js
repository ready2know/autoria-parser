require("dotenv").config();


const axios = require("axios");

const AUTORIA_URI = require('./autoriaUri');

const mysql = require("./mysql");

const fs = require("fs");

//https://developers.ria.com/auto/search?api_key=YOUR_API_KEY& 
// category_id=1&  bodystyle%5B0%5D=3& bodystyle%5B4%5D=2& marka_id%5B0%5D=79& 
// model_id%5B0%5D=0& s_yers%5B0%5D=2010& po_yers%5B0%5D=2017& marka_id%5B1%5D=84& 
// model_id%5B1%5D=0& s_yers%5B1%5D=2012& po_yers%5B1%5D=2016& brandOrigin%5B0%5D=276& 
// brandOrigin%5B1%5D=392& price_ot=1000& price_do=60000& currency=1& auctionPossible=1& 
// with_real_exchange=1& with_exchange=1& exchange_filter%5Bmarka_id%5D=0& 
// exchange_filter%5Bmodel_id%5D=0& state%5B0%5D=1& city%5B0%5D=0& state%5B1%5D=2& city%5B1%5D=0& 
// state%5B2%5D=10& city%5B2%5D=0& abroad=2& custom=1& auto_options%5B477%5D=477& type%5B0%5D=1& 
// type%5B1%5D=2& type%5B3%5D=4& type%5B7%5D=8& gearbox%5B0%5D=1& gearbox%5B1%5D=2& gearbox%5B2%5D=3& 
// engineVolumeFrom=1.4& engineVolumeTo=3.2& powerFrom=90& powerTo=250& power_name=1& 
// countpage=50& with_photo=1

async function searchAdverts(params = {}) {
    let url = new URL(AUTORIA_URI.search);
    url.searchParams.set("api_key", process.env.AUTORIA_APIKEY);
    if (params)
        for (let [key, value] of Object.entries(params)) {
            if (Array.isArray(value)) {
                value.forEach((item, index, array) => { url.searchParams.set(`${key}[${index}]`, item) })
            }
            else
                url.searchParams.set(key.toString(), value);
        }
    console.log(url.href);
    return axios.get(url.href, {}).then((response) => {

        saveToJSON(response.data, `search`)
        return response.data;
    }).catch((err) => { console.log(err); });
}

async function getAdvertInfo(advertId) {
    let url = new URL(AUTORIA_URI.advert_info);
    url.searchParams.set("api_key", process.env.AUTORIA_APIKEY);
    url.searchParams.set("auto_id", advertId);

    return axios.get(url.href).then((response) => {
        saveToJSON(response.data, `advInfo_${advertId}`)
        return response.data;
    }).catch((err) => { console.log(err); });
}


async function getAdvertPhotos(advertId){
    let url = new URL(`${AUTORIA_URI.advert_photos_list}/${advertId}`);
    url.searchParams.set("api_key", process.env.AUTORIA_APIKEY);

    return axios.get(url.href).then((response) => {
        console.log(response.data);
        saveToJSON(response.data, `photos_${advertId}`);
        return response.data;
    }).catch((err) => { console.log(err); });
}


function saveToJSON(obj, filename = `tmp`) {
    if(typeof obj !== "string") obj = JSON.stringify(obj);
    fs.writeFile(`.temp/${filename}_${Date.now()}.json`, obj, function (err) {
        if (err) {
            console.log(err);
        }
    });
}



async function main(params) {
    //await searchAdverts({ countpage: 100, category_id: 1, currency: 1 });

    let a = await getAdvertPhotos("28311174");


}

main();