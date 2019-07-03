require('dotenv').config();
const express = require('express');
const Datastore = require('nedb');
const app = express();
const fetch = require('node-fetch');

app.listen(3000, () => console.log('listening at 3000'));

app.use(express.static('public'));
app.use(express.json({
    limit: '1mb'
}));

const database = new Datastore('database.db');
database.loadDatabase();

const api_key = process.env.API_KEY;

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
    const api_url = `https://api.darksky.net/forecast/adedaf8dfd2178fe6765cfcca84bd3cc/${request.params.lat},${request.params.long}`;
    const weatherResponse = await fetch(api_url);
    const weatherData = await weatherResponse.json();

    const air_url = `https://api.openaq.org/v1/latest?coordinates=${request.params.lat},${request.params.long}`;
    const airResponse = await fetch(air_url);
    const airData = await airResponse.json();

    const data = {
        weather: weatherData,
        air_quality: airData
    };

    response.json(data);
});