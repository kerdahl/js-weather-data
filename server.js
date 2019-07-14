require('dotenv').config();
const express = require('express');
const Datastore = require('nedb');
const app = express();
const fetch = require('node-fetch');

const port = process.env.PORT || 3000;

app.listen(port, () => console.log(`listening at port ${port}`));

app.use(express.static('public'));
app.use(express.json({
    limit: '1mb'
}));

const database = new Datastore('database.db');
database.loadDatabase();

const weather_api_key = process.env.WEATHER_API_KEY;
const google_api_key = process.env.GOOGLE_API_KEY;

const googleMapsClient = require('@google/maps').createClient({
    key: google_api_key,
    Promise: Promise
});

app.get('/api', (request, response) => {
    database.find({}, (err, data) => {
        if (err) {
            response.end;
            return;
        }
        response.json(data);
    });

});

app.post('/api', (request, response) => {
    const data = request.body;
    const timestamp = Date.now();
    data.timestamp = timestamp;
    database.insert(data);
    response.json(data);
})

app.get('/weather/:lat/:long', async (request, response) => {
    console.log(request.params);
    const api_url = `https://api.darksky.net/forecast/${weather_api_key}/${request.params.lat},${request.params.long}`;
    const weatherResponse = await fetch(api_url);
    const weatherData = await weatherResponse.json();

    const air_url = `https://api.openaq.org/v1/latest?coordinates=${request.params.lat},${request.params.long}`;
    const airResponse = await fetch(air_url);
    const airData = await airResponse.json();

    let locationData = {
        city: "Unknown City",
        state: "Unknown State"
    };

    googleMapsClient.reverseGeocode({
            latlng: [request.params.lat, request.params.long],
        })
        .asPromise()
        .then((geoResponse) => {
            if (geoResponse.status == 200) {
                const geoData = geoResponse.json;
                if (geoData.results[1]) {
                    var city = false,
                        state = false;
                    for (var i = 0; i < geoData.results.length; i++) {
                        if ((!city || !state) && geoData.results[i].types[0] === "locality") {
                            city = geoData.results[i].address_components[0].short_name,
                                state = geoData.results[i].address_components[2].short_name;
                            locationData = {
                                city: city,
                                state: state
                            };
                        }
                    }
                }
            }

            const data = {
                weather: weatherData,
                air_quality: airData,
                location: locationData
            };

            response.json(data);
        });
});

exports = module.exports = app;