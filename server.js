require('dotenv').config();
const express = require('express');
const app = express();
const fetch = require('node-fetch');
const firebase = require('firebase');
require('firebase/firestore');

const port = process.env.PORT || 3000;

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.FIREBASE_DATABASE_URL,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: '',
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID
};

firebase.initializeApp(firebaseConfig);

const db = firebase.firestore();

const weather_api_key = process.env.WEATHER_API_KEY;

const google_api_key = process.env.GOOGLE_API_KEY;
const googleMapsClient = require('@google/maps').createClient({
  key: google_api_key,
  Promise: Promise
});

app.listen(port, () => console.log(`listening at port ${port}`));
app.use(express.static('public'));
app.use(express.json({ limit: '1mb' }));

app.get('/api', (request, response) => {
  let data = [];
  let weatherCollection = db.collection('weather').orderBy('timestamp', 'asc');
  weatherCollection
    .get()
    .then(query => {
      query.forEach(weatherEntry => {
        data.push(weatherEntry.data());
      });

      response.json(data);
    })
    .catch(error => {
      console.error(`Error getting data: ${error}`);
      response.end;
    });
});

app.post('/api', (request, response) => {
  const data = request.body;
  const timestamp = Date.now();
  data.timestamp = timestamp;

  let weatherCollection = db.collection('weather');
  weatherCollection
    .add(data)
    .then(docRef => {
      console.log(`Document written, ID ${docRef.id}`);
    })
    .catch(error => {
      console.error(`Error adding document: ${error}`);
    });

  response.json(data);
});

app.get('/weather/:lat/:long', async (request, response) => {
  console.log(request.params);
  const api_url = `https://api.darksky.net/forecast/${weather_api_key}/${
    request.params.lat
  },${request.params.long}`;
  const weatherResponse = await fetch(api_url);
  const weatherData = await weatherResponse.json();

  const air_url = `https://api.openaq.org/v1/latest?coordinates=${
    request.params.lat
  },${request.params.long}`;
  const airResponse = await fetch(air_url);
  const airData = await airResponse.json();

  let locationData = {
    city: 'Unknown City',
    state: 'Unknown State'
  };

  googleMapsClient
    .reverseGeocode({
      latlng: [request.params.lat, request.params.long]
    })
    .asPromise()
    .then(geoResponse => {
      if (geoResponse.status == 200) {
        const geoData = geoResponse.json;
        if (geoData.results[1]) {
          var city = false,
            state = false;
          for (var i = 0; i < geoData.results.length; i++) {
            if (
              (!city || !state) &&
              geoData.results[i].types[0] === 'locality'
            ) {
              (city = geoData.results[i].address_components[0].short_name),
                (state = geoData.results[i].address_components[2].short_name);
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
