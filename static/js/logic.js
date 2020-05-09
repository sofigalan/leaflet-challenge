 // Store our API endpoint inside queryUrl
var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson";

// Perform a GET request to the query URL
d3.json(queryUrl, function(data) {
  // Once we get a response, send the data.features object to the createFeatures function
  createFeatures(data.features);
});

function createFeatures(earthquakeData) {
    function styleFunc(feature) {
        return {
          opacity: 1,
          fillOpacity: .5,
          fillColor: getColor(feature.properties.mag),
          color: "#000000",
		  radius: getRadius(feature.properties.mag),
          stroke: true,
          weight: 0.5
        };
      }
      function getColor(d) {
        return d > 5  ? '#7a0177' :
               d > 4  ? '#bd0026' :
               d > 3  ? '#ff420e' :
               d > 2   ? '#f98866' :
               d > 1   ? '#80bd9e' :
                          '#89da59';
	  }
      function getRadius(d) {return d * 5}
	  
  // Define a function we want to run once for each feature in the features array
  // Give each feature a popup describing the place and time of the earthquake
  function onEachFeature(feature, layer) {
    layer.bindPopup("<h3>" + feature.properties.place +
      "</h3><hr><p>" + new Date(feature.properties.time) + "</p>");
  }

  // Create a GeoJSON layer containing the features array on the earthquakeData object
  // Run the onEachFeature function once for each piece of data in the array
  var earthquakes = L.geoJSON(earthquakeData, {
    onEachFeature: onEachFeature,
    pointToLayer: function (feature, latlng) {
        return L.circleMarker(latlng);
    },
    style: styleFunc,
  });

  // Sending our earthquakes layer to the createMap function
  createMap(earthquakes);
};

function createMap(earthquakes) {

  // Define streetmap and darkmap layers
  var streetmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.streets",
    accessToken: "pk.eyJ1Ijoic29maWdhbGFuIiwiYSI6ImNrOTBqdjY4ZTAwYjUzZXB4cjUxMWJqOTUifQ.VMgOFmx2AWjDs4fTl9kmRw"
  });

  var darkmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.dark",
    accessToken: "pk.eyJ1Ijoic29maWdhbGFuIiwiYSI6ImNrOTBqdjY4ZTAwYjUzZXB4cjUxMWJqOTUifQ.VMgOFmx2AWjDs4fTl9kmRw"
  });

  // Define a baseMaps object to hold our base layers
  var baseMaps = {
    "Street Map": streetmap,
    "Dark Map": darkmap
  };

  // Create overlay object to hold our overlay layer
  var overlayMaps = {
    Earthquakes: earthquakes
  };

  // Create our map, giving it the streetmap and earthquakes layers to display on load
  var myMap = L.map("map", {
    center: [
      38.510472, -102.974396
    ],
    zoom: 3,
    layers: [streetmap, earthquakes]
  });
  
  // Create legend
  var legend = L.control({position: 'bottomright'});
  legend.onAdd = function (map) {
    var div = L.DomUtil.create('div', 'legend'),
	labels = ['0-1', '1-2', '2-3', '3-4', '4-5', '5+'],
    colors = ['#89da59', '#80bd9e', '#f98866', '#ff420e', '#bd0026', '#7a0177'];
    div.innerHTML = '<strong>Magnitude</strong>';
  };
  legend.addTo(myMap);

  // Create a layer control
  // Pass in our baseMaps and overlayMaps
  // Add the layer control to the map
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);
}