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
    mysql.fetch("CREATE TABLE IF NOT EXISTS `states` (`id` int(10) unsigned NOT NULL AUTO_INCREMENT, `name` varchar(40) COLLATE utf8mb4_unicode_ci DEFAULT NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;", () => appUtils.log("Таблица областей создана"));
    return await axios.get(AUTORIA_URL.api.search_params.states, { params: { api_key: process.env.AUTORIA_APIKEY } }).then((response) => {
        if (response.data.length < 1) return;
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

            appUtils.printProgress(`${i + 1}/${states.length}`);

            await axios.get(
                AUTORIA_URL.api.search_params.cities.replace(":stateId", states[i].id),
                {
                    params:
                    {
                        api_key: process.env.AUTORIA_APIKEY
                    }
                }
            )
                .then(
                    (response) => {
                        if (response.data.length < 1) return;

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
        appUtils.log("\nТаблица городов заполнена.");
    });

}

async function table_vehicles() {
    mysql.fetch("CREATE TABLE IF NOT EXISTS `vehicle_type` (`id` int(11) unsigned NOT NULL AUTO_INCREMENT, `name` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL, PRIMARY KEY (`id`)      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;", () => appUtils.log("Таблица типов транспорта создана"))

    return await axios.get(AUTORIA_URL.api.search_params.vehicles, { params: { api_key: process.env.AUTORIA_APIKEY } }).then((response) => {
        if (response.data.length < 1) return;

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
                AUTORIA_URL.api.search_params.bodystyles.replace(":categoryId", vehicles[i].id),
                {
                    params:
                    {
                        api_key: process.env.AUTORIA_APIKEY
                    }
                }
            )
                .then(
                    (response) => {
                        if (response.data.length < 1) return;

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
                AUTORIA_URL.api.search_params.brands.replace(":categoryId", vehicles[i].id),
                {
                    params:
                    {
                        api_key: process.env.AUTORIA_APIKEY
                    }
                }
            )
                .then(
                    (response) => {
                        if (response.data.length < 1) return;

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
            appUtils.printProgress(`${i + 1}/${brands.length}`);

            await axios.get(
                AUTORIA_URL.api.search_params.models.replace(":categoryId", brands[i].vehicle_type).replace(":markId", brands[i].id),
                { params: { api_key: process.env.AUTORIA_APIKEY } })
                .then(
                    (response) => {
                        if (response.data.length < 1) return;
                        let sqlQuery = "INSERT INTO `models`(`id`,`vehicle_type`,`brand`,`name`) VALUES ";
                        sqlQuery += response.data.reduce((prev, item) => prev + `(${item.value},${brands[i].vehicle_type},${brands[i].id}, "${item.name}"), `, "")
                        sqlQuery = sqlQuery.slice(0, -2) + " ON DUPLICATE KEY UPDATE name = VALUES(name);";
                        mysql.fetch(sqlQuery, () => { });
                        return response.data;
                    }
                )
                .catch((err) => { appUtils.log(err) });
            await appUtils.wait(1000);
        }
        appUtils.log("Таблица моделей заполнена.");
    });

}

async function table_driverTypes() {
    mysql.fetch("CREATE TABLE IF NOT EXISTS  `driver_types` (`_id` INT(11) NOT NULL AUTO_INCREMENT,`id` INT(11) UNSIGNED NOT NULL,`vehicle_type` INT(11) UNSIGNED NULL DEFAULT NULL,`name` VARCHAR(20) NULL DEFAULT NULL COLLATE 'utf8mb4_unicode_ci',PRIMARY KEY (`_id`) USING BTREE) COLLATE='utf8mb4_unicode_ci' ENGINE=InnoDB;", () => appUtils.log("Таблица приводов создана."));
    mysql.fetch("DELETE FROM `driver_types`;")

    mysql.fetch("SELECT * FROM `vehicle_type`;", async function (vehicles) {
        for (let i = 0; i < vehicles.length; i++) {
            await axios.get(
                AUTORIA_URL.api.search_params.driver_types.replace(":categoryId", vehicles[i].id),
                {
                    params:
                    {
                        api_key: process.env.AUTORIA_APIKEY
                    }
                }
            )
                .then(
                    (response) => {
                        if (response.data.length < 1) return;
                        let sqlQuery = "INSERT INTO `driver_types`(`id`,`vehicle_type`,`name`) VALUES ";
                        sqlQuery += response.data.reduce((prev, item) => prev + `(${item.value},${vehicles[i].id}, '${item.name}'), `, "")
                        sqlQuery = sqlQuery.slice(0, -2) + " ON DUPLICATE KEY UPDATE name = VALUES(name);";
                        // appUtils.log(response.data);
                        // appUtils.log(sqlQuery);
                        mysql.fetch(sqlQuery, function () { })
                        return response.data;
                    }
                )
                .catch((err) => { appUtils.log(err) });
            await appUtils.wait(1000);
        }
        appUtils.log("Таблица приводов заполнена.");
    });
}

async function table_fuelType() {
    mysql.fetch("CREATE TABLE IF NOT EXISTS `fuel_types` (`id` int(10) unsigned NOT NULL,`name` varchar(16) COLLATE utf8mb4_unicode_ci DEFAULT NULL,PRIMARY KEY (`id`)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;", () => appUtils.log("Таблица типов топлива создана"));


    return await axios.get(AUTORIA_URL.api.search_params.fuel_type, { params: { api_key: process.env.AUTORIA_APIKEY } }).then((response) => {
        if (response.data.length < 1) return;

        let sqlQuery = "INSERT INTO `fuel_types`(`id`,`name`) VALUES ";
        sqlQuery += response.data.reduce((prev, item) => prev + `(${item.value}, '${item.name}'), `, '');
        sqlQuery = sqlQuery.slice(0, -2) + " ON DUPLICATE KEY UPDATE name = VALUES(name);";


        mysql.fetch(sqlQuery, () => appUtils.log("Таблица типов топлива заполнена."));

        return response.data;
    }).catch(function (err) { appUtils.log(err); });
}

async function table_gearboxes() {
    mysql.fetch("CREATE TABLE IF NOT EXISTS `gearboxes` (`_id` INT(11) NOT NULL AUTO_INCREMENT,`id` INT(10) UNSIGNED NOT NULL,`vehicle_type` INT(11) UNSIGNED NULL DEFAULT NULL,`name` VARCHAR(20) NULL DEFAULT NULL COLLATE 'utf8mb4_unicode_ci',PRIMARY KEY (`_id`) USING BTREE) COLLATE='utf8mb4_unicode_ci' ENGINE=InnoDB ;", () => appUtils.log("Таблица коробок передач создана."));
    mysql.fetch("DELETE FROM `gearboxes`;")

    mysql.fetch("SELECT * FROM `vehicle_type`;", async function (vehicles) {
        for (let i = 0; i < vehicles.length; i++) {
            await axios.get(
                AUTORIA_URL.api.search_params.gearboxes.replace(":categoryId", vehicles[i].id),
                {
                    params:
                    {
                        api_key: process.env.AUTORIA_APIKEY
                    }
                }
            )
                .then(
                    (response) => {
                        if (response.data.length < 1) return;
                        let sqlQuery = "INSERT INTO `gearboxes`(`id`,`vehicle_type`,`name`) VALUES ";
                        sqlQuery += response.data.reduce((prev, item) => prev + `(${item.value},${vehicles[i].id}, '${item.name}'), `, "")
                        sqlQuery = sqlQuery.slice(0, -2) + " ON DUPLICATE KEY UPDATE name = VALUES(name);";
                        mysql.fetch(sqlQuery, function () { })
                        return response.data;
                    }
                )
                .catch((err) => { appUtils.log(err) });
            await appUtils.wait(1000);
        }
        appUtils.log("Таблица коробок передач заполнена.");
    });
}

async function table_colors(){
    mysql.fetch("CREATE TABLE IF NOT EXISTS `colors` (`id` INT(11) NOT NULL AUTO_INCREMENT,`name` VARCHAR(15) NULL DEFAULT NULL COLLATE 'utf8mb4_unicode_ci',PRIMARY KEY (`id`) USING BTREE) COLLATE='utf8mb4_unicode_ci' ENGINE=InnoDB;", () => appUtils.log("Таблица цветов создана"));
        
    return await axios.get(AUTORIA_URL.api.search_params.colors, { params: { api_key: process.env.AUTORIA_APIKEY } }).then((response) => {
        if (response.data.length < 1) return;
        let sqlQuery = "INSERT INTO `colors`(`id`,`name`) VALUES ";
        sqlQuery += response.data.reduce((prev, item) => prev + `(${item.value}, '${item.name}'), `, '');
        sqlQuery = sqlQuery.slice(0, -2) + " ON DUPLICATE KEY UPDATE name = VALUES(name);";


        mysql.fetch(sqlQuery, () => appUtils.log("Таблица цветов заполнена."));

        return response.data;
    }).catch(function (err) { appUtils.log(err); });

}

async function table_manufCountry(){
    mysql.fetch("CREATE TABLE IF NOT EXISTS `manuf_country` (`id` INT(10) UNSIGNED NOT NULL AUTO_INCREMENT,`name` VARCHAR(30) NULL DEFAULT NULL COLLATE 'utf8mb4_unicode_ci',PRIMARY KEY (`id`) USING BTREE) COLLATE='utf8mb4_unicode_ci' ENGINE=InnoDB;", () => appUtils.log("Таблица стран производителей создана"));
    return await axios.get(AUTORIA_URL.api.search_params.countries, { params: { api_key: process.env.AUTORIA_APIKEY } }).then((response) => {
        if (response.data.length < 1) return;
        let sqlQuery = "INSERT INTO `manuf_country`(`id`,`name`) VALUES ";
        sqlQuery += response.data.reduce((prev, item) => prev + `(${item.value}, '${item.name}'), `, '');
        sqlQuery = sqlQuery.slice(0, -2) + " ON DUPLICATE KEY UPDATE name = VALUES(name);";


        mysql.fetch(sqlQuery, () => appUtils.log("Таблица стран производителей заполнена."));

        return response.data;
    }).catch(function (err) { appUtils.log(err); });

}

async function table_options() {
    mysql.fetch("CREATE TABLE IF NOT EXISTS `options` (`_id` INT(10) UNSIGNED NOT NULL AUTO_INCREMENT,`id` INT(10) UNSIGNED NULL DEFAULT NULL,`vehicle_type` INT(10) UNSIGNED NULL DEFAULT NULL,`name` VARCHAR(50) NULL DEFAULT NULL COLLATE 'utf8mb4_unicode_ci',PRIMARY KEY (`_id`) USING BTREE)COLLATE='utf8mb4_unicode_ci' ENGINE=InnoDB;", () => appUtils.log("Таблица опций создана."));
    mysql.fetch("DELETE FROM `options`;")

    mysql.fetch("SELECT * FROM `vehicle_type`;", async function (vehicles) {
        for (let i = 0; i < vehicles.length; i++) {
            await axios.get(
                AUTORIA_URL.api.search_params.options.replace(":categoryId", vehicles[i].id),
                {
                    params:
                    {
                        api_key: process.env.AUTORIA_APIKEY
                    }
                }
            )
                .then(
                    (response) => {
                        if (response.data.length < 1) return;
                        let sqlQuery = "INSERT INTO `options`(`id`,`vehicle_type`,`name`) VALUES ";
                        sqlQuery += response.data.reduce((prev, item) => prev + `(${item.value},${vehicles[i].id}, '${item.name}'), `, "")
                        sqlQuery = sqlQuery.slice(0, -2) + " ON DUPLICATE KEY UPDATE name = VALUES(name);";
                        //appUtils.log(response.data);
                        //appUtils.log(sqlQuery);
                        mysql.fetch(sqlQuery, function () { })
                        return response.data;
                    }
                )
                .catch((err) => { appUtils.log(err) });
            await appUtils.wait(1000);
        }
        appUtils.log("Таблица опций заполнена.");
    });
}

async function table_adverts(){
    mysql.fetch("CREATE TABLE IF NOT EXISTS `adverts` ("+
        "`_id` INT(10) UNSIGNED NOT NULL AUTO_INCREMENT,"+
        "`id` INT(10) UNSIGNED NOT NULL,"+
        "`link` VARCHAR(200) NULL DEFAULT NULL COLLATE 'utf8mb4_unicode_ci',"+
        "`platform` VARCHAR(20) NULL DEFAULT NULL COLLATE 'utf8mb4_unicode_ci',"+
        "`vehicle_type` INT(11) UNSIGNED NULL DEFAULT NULL,"+
        "`brand` INT(10) UNSIGNED NULL DEFAULT NULL,"+
        "`model` INT(10) UNSIGNED NULL DEFAULT NULL,"+
        "`year` YEAR NULL DEFAULT NULL,"+
        "`bodystyle` INT(11) NULL DEFAULT NULL,"+
        "`fuel_type` INT(11) NULL DEFAULT NULL,"+
        "`driver_type` INT(11) NULL DEFAULT NULL,"+
        "`Manufacturer_country` INT(11) NULL DEFAULT NULL,"+
        "`engine_cap` FLOAT UNSIGNED NULL DEFAULT NULL,"+
        "`VIN` VARCHAR(17) NULL DEFAULT NULL COLLATE 'utf8mb4_unicode_ci',"+
        "`gov_number` VARCHAR(8) NULL DEFAULT NULL COLLATE 'utf8mb4_unicode_ci',"+
        "`photos` VARCHAR(500) NULL DEFAULT NULL COLLATE 'utf8mb4_unicode_ci',"+
        "`DTP` TINYINT(4) NULL DEFAULT NULL,"+
        "`RTD` TINYINT(4) NULL DEFAULT NULL,"+
        "`price` FLOAT UNSIGNED NULL DEFAULT NULL,"+
        "`state` INT(11) NULL DEFAULT NULL,"+
        "`city` INT(11) NULL DEFAULT NULL,"+
        "`date_add` TIMESTAMP NULL DEFAULT NULL,"+
        "`date_upd` TIMESTAMP NULL DEFAULT NULL,"+
        "`gearbox` INT(11) NULL DEFAULT NULL,"+
        "PRIMARY KEY (`_id`) USING BTREE"+
    ") COLLATE='utf8mb4_unicode_ci' ENGINE=InnoDB;",
    ()=>{appUtils.log("Таблица объявлений создана.")});    
}

async function main() {
    //await database_init();
    //await table_adverts();

    //await table_states();
    //await table_cities();

    //await table_vehicles();
    //await table_bodystyles();

    //await table_driverTypes();
    //await table_fuelType();
    //await table_gearboxes();

    //await table_brands();
    //await table_models();

    // await table_manufCountry();
    // await table_colors();

    //await table_options();

    return;
}

main();