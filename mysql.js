require("dotenv").config();

const mysql = require("mysql");

var pool = mysql.createPool({
  connectionLimit: 10,
  host: process.env.DB,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

function fetch(query, callback=()=>{}) {
  pool.query(query, function (error, results, fields) {
    if (error) { console.log(error); throw error; }
    callback(results);
  });
}


module.exports = {
  fetch: fetch
};