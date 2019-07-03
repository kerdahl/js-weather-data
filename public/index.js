//Geolocate
let lat, long, weather, airQuality;

if ('geolocation' in navigator) {
    console.log('Geolocation available');
    navigator.geolocation.getCurrentPosition(async position => {
        try {
            lat = position.coords.latitude;
            long = position.coords.longitude;
            document.getElementById('latitude').textContent = lat;
            document.getElementById('longitude').textContent = long;

            const api_url = `/weather/${lat}/${long}`;
            const response = await fetch(api_url);
            const json = await response.json();

            weather = json.weather.currently;
            airQuality = json.air_quality;

            const measurement = airQuality.results[0].measurements[0];
            const timestamp = new Date(measurement.lastUpdated);

            document.getElementById('weather_temp').textContent = weather.temperature;
            document.getElementById('weather_summary').textContent = weather.summary;
            document.getElementById('aq_param').textContent = measurement.parameter;
            document.getElementById('aq_quality').textContent = `${measurement.value} ${measurement.unit}`;
            document.getElementById('aq_timestamp').textContent = timestamp.toLocaleString();

            submitLocation();
        } catch (error) {
            console.error(error);
            document.getElementById('aq_param').textContent = 'Unknown';
            document.getElementById('aq_quality').textContent = 'Unknown';
            document.getElementById('aq_timestamp').textContent = 'Unknown';

            airQuality = {
                results: []
            };
            submitLocation();
        }
    });
} else {
    const msg = 'Geolocation unavailable';
    document.getElementById("latitude").textContent = msg;
    document.getElementById("longitude").textContent = msg;
}

async function submitLocation() {
    const data = {
        lat,
        long,
        weather,
        airQuality
    };
    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    }
    const response = await fetch('/api', options);
    const responseJson = await response.json();
    console.log(responseJson);
}