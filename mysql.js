require("dotenv").config();

const mysql = require("mysql2");

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

  pool.query("SELECT b.id AS BrandID, b.name AS BrandName, m.id AS ModelID, m.name AS ModelName FROM `brands` b, `models` m WHERE m.brand = b.id AND b.vehicle_type = 1;")
    .then(async result => {
      let brandModelList = {};
      let data = result[0];
      await data.forEach(function (item) {
        if (!brandModelList[`${item.BrandName}`])
          brandModelList[`${item.BrandName}`] = { id: item.BrandID, models: {} };
        brandModelList[`${item.BrandName}`]["models"][`${item.ModelName}`] = item.ModelID;
      });
      
     //console.log(brandModelList);

      let sqlQuery = "INSERT INTO `autoparse`.`adverts`(`_id`,`id`,`user_id`,`brand`,`model`,`year`, `link`,`price`, `milleage`, `engine_cap`) VALUES";
      
      sqlQuery+= await adverts.reduce((prev, item)=>{ return prev+`(${item.advert_id},${item.advert_id},${item.user_id},${brandModelList[item.brand].id}, ${brandModelList[item.brand].models[`${item.model}`]}, ${item.year}, '${item.link}',${item.price},${item.milleage}, ${item.driverCap}), `},"")
      sqlQuery = sqlQuery.slice(0, -2) + " ON DUPLICATE KEY UPDATE price = VALUES(price);";

      //console.log(sqlQuery);

      pool.query(sqlQuery).then(r => {
        //console.log(r);
      });

    });
}

module.exports = {
  fetch: fetch,
  saveAdverts: saveAdverts
};
