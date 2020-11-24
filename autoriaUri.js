//LIMITS 1000 per 1 hour TOTAL
module.exports = {
    search: `https://developers.ria.com/auto/search`, // ?api_key=YOUR_API_KEY&{search_params}
    average_price: `https://developers.ria.com/auto/average_price`, // ?api_key=YOUR_API_KEY&{search_params}
    advert_info: `https://developers.ria.com/auto/info`, // ?api_key=YOUR_API_KEY&auto_id=AUTO_ID
    advert_photos_list: `https://developers.ria.com/auto/fotos/`, // id?api_key=YOUR_API_KEY

    photo_cdn: `https://cdn.riastatic.com/photos/auto/photo/`,

    search_params: {
        vehicles: `https://developers.ria.com/auto/categories/`, // ?apikey=YOUR_API_KEY

        bodystyles: `https://developers.ria.com/auto/categories/:categoryId/bodystyles`, // ?api_key=YOUR_API_KEY
        bodystyles_all: `https://developers.ria.com/auto/bodystyles`, // ?api_key=
        brands: `https://developers.ria.com/auto/categories/:categoryId/marks`, // ?api_key=YOUR_API_KEY
        models: `http://api.auto.ria.com/categories/:categoryId/marks/:markId/models?`, // ?api_key=YOUR_API_KEY

        driver_types: `https://developers.ria.com/auto/categories/:categoryId/driverTypes`, // api
        fuel_type: `https://developers.ria.com/auto/type`, // api
        options: `https://developers.ria.com/auto/categories/:categoryId/options`, //api
        colors: `https://developers.ria.com/auto/colors`, //api
        countries: `https://developers.ria.com/auto/countries`, //api

        states: `https://developers.ria.com/auto/states`, // ?api_key=YOUR_API_KEY`
        cities: `https://developers.ria.com/auto/states/:stateId/cities`, //?api_key=YOUR_API_KEY


        // Другие параметры https://api-docs-v2.readthedocs.io/ru/latest/auto_ria/used_cars/options/other.html
    }
}