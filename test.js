const axios = require("axios");
const appUtils = require("./appUtils");


axios.get("https://auto.ria.com/uk/search/?indexName=auto,order_auto,newauto_search", 
{ params: { price: { currency: 1 } } })
.then(function(response){
    console.log(response);
})