const mysql = require("./mysql");

const axios = require("axios");
const AUTORIA_URI = require("./autoriaUri");

async function database_init() {
    mysql.fetch("CREATE DATABASE IF NOT EXISTS `autoparse` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;")
    return;
}

async function tables_locations() {
    mysql.fetch("CREATE TABLE IF NOT EXISTS `states` (`id` int(10) unsigned NOT NULL AUTO_INCREMENT, `name` varchar(40) COLLATE utf8mb4_unicode_ci DEFAULT NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;")
    mysql.fetch("CREATE TABLE IF NOT EXISTS `cities` (`id` int(10) unsigned NOT NULL AUTO_INCREMENT, `state` int(11) DEFAULT NULL,`name` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,PRIMARY KEY (`id`)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;")

    await axios.get(AUTORIA_URI.search_params.states, { params: { api_key: process.env.AUTORIA_APIKEY } }).then((response) => {
        console.log(response.data);
        let sqlQuery = "INSERT INTO `states`(`id`,`name`) VALUES ";
        sqlQuery += response.data.reduce((prev, item) => prev + `(${item.value}, '${item.name}'), `, '');
        sqlQuery =sqlQuery.slice(0, -2)+ " ON DUPLICATE KEY UPDATE name = VALUES(name);";

        console.log(sqlQuery);
        mysql.fetch(sqlQuery);
    }).catch(function (err) { console.log(err); });

}

async function main() {
    await database_init();
    await tables_locations();

}

main();