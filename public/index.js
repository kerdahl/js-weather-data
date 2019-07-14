//Geolocate
let lat, long, weather, airQuality, place;

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
      place = json.location;

      let windBearing = weather.windBearing;
      let windDirection = null;

      if ((0 <= windBearing && windBearing <= 22.5) || (337.5 <= windBearing && windBearing < 360)) {
        windDirection = 'S';
      } else if (22.5 < windBearing && windBearing < 67.5) {
        windDirection = 'SW';
      } else if (67.5 <= windBearing && windBearing < 112.5) {
        windDirection = 'W';
      } else if (112.5 <= windBearing && windBearing < 157.5) {
        windDirection = 'NW';
      } else if (157.5 <= windBearing && windBearing < 202.5) {
        windDirection = 'N';
      } else if (202.5 <= windBearing && windBearing < 247.5) {
        windDirection = 'NE';
      } else if (247.5 <= windBearing && windBearing < 292.5) {
        windDirection = 'E';
      } else if (292.5 <= windBearing && windBearing < 337.5) {
        windDirection = 'SE';
      }

      let condition_icon = findIcon(weather.icon);

      document.getElementById('weather_temp').textContent = weather.temperature;
      document.getElementById('weather_summary').textContent = weather.summary;
      addClass(document.getElementById('summary_icon'), condition_icon);
      document.getElementById('weather_apparent').textContent = weather.apparentTemperature;
      document.getElementById('weather_dewPoint').textContent = weather.dewPoint;
      document.getElementById('weather_humidity').textContent = weather.humidity;
      document.getElementById('weather_windSpeed').textContent = weather.windSpeed;
      document.getElementById('weather_windDirection').textContent = windDirection;
      document.getElementById('weather_windGust').textContent = weather.windGust;

      const cityString = `${place.city}, ${place.state}`;
      document.getElementById('city').textContent = cityString;

      const measurement = airQuality.results[0].measurements[0];
      const timestamp = new Date(measurement.lastUpdated);

      document.getElementById('aq_param').textContent = measurement.parameter;
      document.getElementById('aq_quality').textContent = `${measurement.value} ${measurement.unit}`;
      document.getElementById('aq_timestamp').textContent = timestamp.toLocaleString();

      submitLocation();
    } catch (error) {
      //console.error(error);
      let handled = false;
      if (airQuality.results.length < 1) {
        console.log('No air quality data')
        document.getElementById('aq_param').textContent = 'Unknown';
        document.getElementById('aq_quality').textContent = 'Unknown';
        document.getElementById('aq_timestamp').textContent = 'Unknown';

        airQuality = {
          results: []
        };

        handled = true;
      }

      if (handled) {
        submitLocation();
      } else {
        console.error(error);
      }
    }
  });
} else {
  const msg = 'Geolocation unavailable';
  document.getElementById("latitude").textContent = msg;
  document.getElementById("longitude").textContent = msg;
}

function findIcon(icon) {
  let iconClass;
  switch (icon) {
    case "clear-day":
      iconClass = "wi-day-sunny";
      break;
    case "clear-night":
      iconClass = "wi-night-clear";
      break;
    case "rain":
      iconClass = "wi-rain";
      break;
    case "snow":
      iconClass = "wi-snow";
      break;
    case "sleet":
      iconClass = "wi-sleet";
      break;
    case "wind":
      iconClass = "wi-windy";
      break;
    case "fog":
      iconClass = "wi-fog";
      break;
    case "cloudy":
      iconClass = "wi-cloudy";
      break;
    case "partly-cloudy-day":
      iconClass = "wi-day-cloudy";
      break;
    case "partly-cloudy-night":
      iconClass = "wi-night-partly-cloudy";
      break;
    default:
      iconClass = "wi-day-sunny";
  }

  return iconClass;
}

function addClass(element, name) {
  let arr = element.className.split(" ");
  if (arr.indexOf(name) == -1) {
    element.className += ` ${name}`;
  }
}

async function submitLocation() {
  const data = {
    lat,
    long,
    weather,
    airQuality,
    place
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