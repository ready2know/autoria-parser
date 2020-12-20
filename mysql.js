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

function fetch(query, callback = () => { }) {
  pool.query(query, function (error, results, fields) {
    if (error) { console.log(error); throw error; }
    callback(results);

    return results;
  });
}

function saveAdverts(adverts) {
  //{"Audi":{"id":3, "models":{"A8":123,"A9":213}}}
  if (adverts.length > 0)
    pool.query("SELECT b.id AS BrandID, b.name AS BrandName, m.id AS ModelID, m.name AS ModelName FROM `brands` b, `models` m WHERE m.brand = b.id AND b.vehicle_type = 1;")
      .then(async result => {
        let brandModelList = {};
        let data = result[0];
        await data.forEach(function (item) {
          if (!brandModelList[`${item.BrandName}`])
            brandModelList[`${item.BrandName}`] = { id: item.BrandID, models: {} };
          brandModelList[`${item.BrandName}`]["models"][`${item.ModelName}`] = item.ModelID;
        });
        
       
        //appUtils.saveToJSON(brandModelList, `bmList`);

        let sqlQuery = "INSERT INTO `autoparse`.`adverts`(`_id`,`id`,`user_id`,`brand`,`model`,`year`, `link`,`price`, `milleage`, `engine_cap`) VALUES";

        sqlQuery += await adverts.reduce((prev, item) => { return prev + `(${item.advert_id || 0},${item.advert_id || 0},${item.user_id || 0},${(brandModelList[`${item.brand}`] || { id: 0 }).id || 0}, ${(brandModelList[item.brand] || { models: {} }).models[`${item.model}`] || 0}, ${item.year || 2020} , '${item.link || 0}',${item.price || 0},${(item.milleage > 5000 ? Math.round(item.milleage / 1000) : item.milleage) || 0}, ${item.driverCap || 0}), ` }, "")
        sqlQuery = sqlQuery.slice(0, -2) + " ON DUPLICATE KEY UPDATE price = VALUES(price);";

        //appUtils.saveToTXT(sqlQuery, `sqlquery`);

        pool.query(sqlQuery).then(r => {
          //console.log(r);
        });

      });
}

module.exports = {
  fetch: fetch,
  saveAdverts: saveAdverts
};
