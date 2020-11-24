require("dotenv").config();

const mysql = require("./mysql");
const appUtils = require("./appUtils");

const axios = require("axios");
const AUTORIA_URI = require("./autoriaUri");

async function database_init() {
    mysql.fetch("CREATE DATABASE IF NOT EXISTS `autoparse` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;")
    return;
}

async function table_states() {
    mysql.fetch("CREATE TABLE IF NOT EXISTS `states` (`id` int(10) unsigned NOT NULL AUTO_INCREMENT, `name` varchar(40) COLLATE utf8mb4_unicode_ci DEFAULT NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;", () => appUtils.log("Таблица областей создана"))


    return await axios.get(AUTORIA_URI.search_params.states, { params: { api_key: process.env.AUTORIA_APIKEY } }).then((response) => {
        let sqlQuery = "INSERT INTO `states`(`id`,`name`) VALUES ";
        sqlQuery += response.data.reduce((prev, item) => prev + `(${item.value}, '${item.name}'), `, '');
        sqlQuery = sqlQuery.slice(0, -2) + " ON DUPLICATE KEY UPDATE name = VALUES(name);";


        mysql.fetch(sqlQuery, () => appUtils.log("Таблица областей заполнена."));

        return response.data;
    }).catch(function (err) { appUtils.log(err); });
}

async function table_cities() {
    mysql.fetch("CREATE TABLE IF NOT EXISTS `cities` (`id` int(10) unsigned NOT NULL AUTO_INCREMENT, `state` int(11) DEFAULT NULL,`name` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,PRIMARY KEY (`id`)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;", () => appUtils.log("Таблица городов создана."));
    mysql.fetch("DELETE FROM `cities`;");


    mysql.fetch("SELECT * FROM `states`;", async function (states) {
        for (let i = 0; i < states.length; i++) {
            await axios.get(
                AUTORIA_URI.search_params.cities.replace(":stateId", states[i].id),
                {
                    params:
                    {
                        api_key: process.env.AUTORIA_APIKEY
                    }
                }
            )
                .then(
                    (response) => {
                        let sqlQuery = "INSERT INTO `cities`(`id`,`state`,`name`) VALUES ";
                        sqlQuery += response.data.reduce((prev, item) => prev + `(${item.value},${states[i].id}, '${item.name}'), `, "")
                        sqlQuery = sqlQuery.slice(0, -2) + " ON DUPLICATE KEY UPDATE name = VALUES(name);";
                        mysql.fetch(sqlQuery, function () { })
                        return response.data;
                    }
                )
                .catch((err) => { appUtils.log(errs) });
            await appUtils.wait(1000);
        }
        appUtils.log("Таблица городов заполнена.");
    });

}

async function table_vehicles() {
    mysql.fetch("CREATE TABLE IF NOT EXISTS `vehicle_type` (`id` int(11) unsigned NOT NULL AUTO_INCREMENT, `name` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL, PRIMARY KEY (`id`)      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;", () => appUtils.log("Таблица типов транспорта создана"))

    return await axios.get(AUTORIA_URI.search_params.vehicles, { params: { api_key: process.env.AUTORIA_APIKEY } }).then((response) => {
        let sqlQuery = "INSERT INTO `vehicle_type`(`id`,`name`) VALUES ";
        sqlQuery += response.data.reduce((prev, item) => prev + `(${item.value}, '${item.name}'), `, '');
        sqlQuery = sqlQuery.slice(0, -2) + " ON DUPLICATE KEY UPDATE name = VALUES(name);";


        mysql.fetch(sqlQuery, () => appUtils.log("Таблица типов транспорта заполнена."));

        return response.data;
    }).catch(function (err) { appUtils.log(err); });
}

async function table_bodystyles() {
    mysql.fetch("CREATE TABLE IF NOT EXISTS `bodystyles` (`id` int(10) unsigned NOT NULL AUTO_INCREMENT, `vehicle_type` int(10) unsigned DEFAULT NULL, `name` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;", () => appUtils.log("Таблица формфакторов создана."));
    mysql.fetch("SELECT * FROM `vehicle_type`;", async function (vehicles) {
        for (let i = 0; i < vehicles.length; i++) {
            await axios.get(
                AUTORIA_URI.search_params.bodystyles.replace(":categoryId", vehicles[i].id),
                {
                    params:
                    {
                        api_key: process.env.AUTORIA_APIKEY
                    }
                }
            )
                .then(
                    (response) => {
                        let sqlQuery = "INSERT INTO `bodystyles`(`id`,`vehicle_type`,`name`) VALUES ";
                        sqlQuery += response.data.reduce((prev, item) => prev + `(${item.value},${vehicles[i].id}, '${item.name}'), `, "")
                        sqlQuery = sqlQuery.slice(0, -2) + " ON DUPLICATE KEY UPDATE name = VALUES(name);";
                        mysql.fetch(sqlQuery, function () { })
                        return response.data;
                    }
                )
                .catch((err) => { appUtils.log(err) });
            await appUtils.wait(1000);
        }
    });
    appUtils.log("Таблица формфакторов заполнена.");
}


async function table_brands() {
    mysql.fetch("CREATE TABLE IF NOT EXISTS `brands` (`id` int(10) unsigned NOT NULL AUTO_INCREMENT, `vehicle_type` int(10) unsigned DEFAULT NULL, `name` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;", () => appUtils.log("Таблица брендов создана."))
    mysql.fetch("DELETE FROM `brands`;")

    mysql.fetch("SELECT * FROM `vehicle_type`;", async function (vehicles) {
        for (let i = 0; i < vehicles.length; i++) {
            await axios.get(
                AUTORIA_URI.search_params.brands.replace(":categoryId", vehicles[i].id),
                {
                    params:
                    {
                        api_key: process.env.AUTORIA_APIKEY
                    }
                }
            )
                .then(
                    (response) => {
                        let sqlQuery = "INSERT INTO `brands`(`id`,`vehicle_type`,`name`) VALUES ";
                        sqlQuery += response.data.reduce((prev, item) => prev + `(${item.value}, ${vehicles[i].id}, "${item.name}"), `, "")
                        sqlQuery = sqlQuery.slice(0, -2) + " ON DUPLICATE KEY UPDATE name = VALUES(name);";
                        mysql.fetch(sqlQuery, function () { })
                        return response.data;
                    }
                )
                .catch((err) => { appUtils.log(err) });
            await appUtils.wait(1000);
        }
        appUtils.log("Таблица брендов заполнена.");
    });

}

async function table_models() {
    mysql.fetch("CREATE TABLE IF NOT EXISTS `models` (`id` int(11) unsigned NOT NULL AUTO_INCREMENT,`vehicle_type` int(11) unsigned DEFAULT NULL,`brand` int(11) unsigned DEFAULT NULL,`name` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,PRIMARY KEY (`id`)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;", () => appUtils.log("Таблица моделей создана."))
    mysql.fetch("DELETE FROM `models`;")


    mysql.fetch("SELECT * FROM `brands`;", async function (brands) {

        for (let i = 0; i < brands.length; i++) {
            await axios.get(
                AUTORIA_URI.search_params.models.replace(":categoryId", brands[i].vehicle_type).replace(":markId", brands[i].id),
                { params: { api_key: process.env.AUTORIA_APIKEY } })
                .then(
                    (response) => {
                        if(response.data.length<1) return;
                        let sqlQuery = "INSERT INTO `models`(`id`,`vehicle_type`,`brand`,`name`) VALUES ";
                        sqlQuery += response.data.reduce((prev, item) => prev + `(${item.value},${brands[i].vehicle_type},${brands[i].id}, "${item.name}"), `, "")
                        sqlQuery = sqlQuery.slice(0, -2) + " ON DUPLICATE KEY UPDATE name = VALUES(name);";
                        mysql.fetch(sqlQuery, () => {});
                        return response.data;
                    }
                )
                .catch((err) => { appUtils.log(err) });
            await appUtils.wait(1000);
        }
        appUtils.log("Таблица моделей заполнена.");
    });
    s
}



async function main() {
    //await database_init();

    //await table_states();
    // await table_cities();

    //await table_vehicles();
    //await table_bodystyles();

    // await table_driverTypes();
    // await table_fuelType();

    //await table_brands();
    await table_models();



    return;
}

main();