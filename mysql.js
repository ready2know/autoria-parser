require("dotenv").config();

const mysql = require("mysql2");
const appUtils = require("./appUtils");

var pool = mysql.createPool({
  connectionLimit: 10,
  host: process.env.DB,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
}).promise();

async function fetch(query, callback = () => { }) {
  callback(await pool.query(query).then(function (results) {
    return results;
  }));
}

async function saveAdverts(adverts) {
  //appUtils.saveToJSON(adverts, "adverts");
  //{"Audi":{"id":3, "models":{"A8":123,"A9":213}}}
  if (adverts.length > 0) {
    let brandModelList = await pool.query("SELECT b.id AS BrandID, b.name AS BrandName, m.id AS ModelID, m.name AS ModelName FROM `brands` b, `models` m WHERE m.brand = b.id AND b.vehicle_type = 1;")
      .then(async result => {
        let brandModelList = {};
        let data = result[0];
        await data.forEach(function (item) {
          if (!brandModelList[`${item.BrandName}`])
            brandModelList[`${item.BrandName}`] = { id: item.BrandID, models: {} };
          brandModelList[`${item.BrandName}`]["models"][`${item.ModelName}`] = item.ModelID;
        });

        return brandModelList;
      });

    let citiesList = await pool.query("SELECT c.id AS CityId, c.name AS CityName, c.state AS StateId FROM cities c;")
      .then(
        async cities_data => {
          let citiesList = {};
          await cities_data[0].forEach(function (item) {
            citiesList[`${item.CityName}`] = { "id": item.CityId, "stateId": item.StateId };
          });
          return citiesList;
        }
      );


    //appUtils.saveToJSON(citiesList, `citiesList`);

    let sqlQuery = "INSERT INTO `autoparse`.`adverts`(`_id`,`id`,`user_id`,`brand`,`model`,`year`, `link`,`price`, `milleage`, `engine_cap`, `city`, `state`) VALUES";

    sqlQuery += await adverts.reduce((prev, item) => { return prev + `(${item.advert_id || 0},${item.advert_id || 0},${item.user_id || 0},${(brandModelList[`${item.brand}`] || { id: 0 }).id || 0}, ${(brandModelList[item.brand] || { models: {} }).models[`${item.model}`] || 0}, ${item.year || 2020} , '${item.link || 0}',${item.price || 0},${(item.milleage > 5000 ? Math.round(item.milleage / 1000) : item.milleage) || 0}, ${item.driverCap || 0}, ${citiesList[item.location].id || 0}, ${citiesList[item.location].stateId || 0}), ` }, "")
    sqlQuery = sqlQuery.slice(0, -2) + " ON DUPLICATE KEY UPDATE price = VALUES(price), city=VALUES(city), state=VALUES(state), link=VALUES(link);";

    //appUtils.saveToTXT(sqlQuery, `sqlquery`);

    pool.query(sqlQuery).then(r => {
      //console.log(r);
    });
  }
}

module.exports = {
  fetch: fetch,
  saveAdverts: saveAdverts
};
