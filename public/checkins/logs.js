const mymap = L.map('mapid').setView([0, 0], 1);
const attribution = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';
const tileUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
const tiles = L.tileLayer(tileUrl, {
    attribution
});

tiles.addTo(mymap);

getData();

async function getData() {
    const response = await fetch('/api');
    const data = await response.json();

    console.log(data);

    for (item of data) {

        const marker = L.marker([item.lat, item.long]).addTo(mymap);

        const cityString = item.place.city;

        const timestamp = (new Date(item.timestamp)).toLocaleString();

        let aqString = "There is no air quality reading for this location.";
        if (item.airQuality.results.length > 0) {
            aqString = `The concentration of particulate matter (${item.airQuality.results[0].measurements[0].parameter}) was ${item.airQuality.results[0].measurements[0].value} ${item.airQuality.results[0].measurements[0].unit} as of ${item.airQuality.results[0].measurements[0].lastUpdated}`;
        }

        let txt = `The weather in ${cityString} (${item.lat}°, ${item.long}°) was ${item.weather.summary} with a temperature of ${item.weather.temperature}°F at ${timestamp}. ${aqString}`;

        marker.bindPopup(txt);
    }
}