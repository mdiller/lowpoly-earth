var fs = require('fs');


config = JSON.parse(fs.readFileSync("config.json", "utf8"));

var googleMapsClient = require('@google/maps').createClient({
	key: config.google_api_key
});



function getLatLongs(slices, stacks) {
	var result = [];
	for (var i = 0; i < stacks; i++) {
		var latitude = ((i * 180.0) / stacks) - 90;
		for (var j = 0; j < slices; j++) {
			var longitude = ((j * 360.0) / slices) - 180;
			result.push({ 
				latitude: latitude, 
				longitude: longitude
			});
		}
	}
	return result;
}


function toFileString(locations) {
	var locations_text = locations.map(loc => {
		return `{ ${loc.location.lat}, ${loc.location.lng}, ${loc.elevation} }`
	}).join(",\n\t"); 

	return `#include "structs.hpp"

int globe_locations_count = ${locations.length};

struct location globe_locations[] = {
	${locations_text}
};`
}


var lat_longs = getLatLongs(20, 20);
var lat_longs_string = lat_longs.map(loc => {
	return `${loc.latitude}, ${loc.longitude}`;
}).join("|");

// Geocode an address.
googleMapsClient.elevation({
	locations: lat_longs_string
}, function(err, response) {
	if (err) {
		console.log(`Google Maps API Error: \n${err}`);
	}
	else {
		var file_string = toFileString(response.json.results);
		console.log(file_string);
		fs.writeFile("cpp_opengl_renderer/globe.550", file_string, function(err) {
			if(err) {
				console.log(`File Writing Error: \n${err}`);
			}
		});
	}
});