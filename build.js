var fs = require('fs');
var async = require('async');
var icosphere = require('./icosphere.js');

config = JSON.parse(fs.readFileSync("config.json", "utf8"));

var googleMapsClient = require('@google/maps').createClient({
	key: config.google_api_key
});

function aboutEqual(a, b, error) {
	return a > (b - error) && a < (b + error);
}


function xyzAddlatlong(x, y, z) {
	var longitude = -(Math.atan2( -z, -x )) - Math.PI / 2;
	if(longitude < - Math.PI) {
		longitude += Math.PI * 2;
	}
	return {
		x: x,
		y: y,
		z: z,
		latitude: Math.asin(y) * (180 / Math.PI),
		longitude: longitude * (180 / Math.PI)
	};
}

function dumpToFile(globe) {
	fs.writeFileSync('./globe.json', JSON.stringify(globe, null, "\t") , 'utf-8'); 
}


var globe = icosphere.create(5);

globe.points = globe.points.map(p => xyzAddlatlong(p.x, p.y, p.z));

var groups_size = 100;
var location_groups = []

for (var i = 0; i < globe.points.length; i += groups_size) {
	location_groups.push(globe.points.slice(i, i + groups_size));
}

async.each(location_groups, function(locations, callback) {
	googleMapsClient.elevation({
		locations: locations.map(loc => `${loc.latitude}, ${loc.longitude}`).join("|")
	}, function(err, response) {
		if (err) return callback(err);
		response.json.results.forEach(loc => {
			globe.points.find(l => {
				return aboutEqual(l.latitude, loc.location.lat, 0.001) && aboutEqual(l.longitude, loc.location.lng, 0.0001);
			}).elevation = loc.elevation
		});
		callback();
	});
}, function(err, results) {
	if (err) {
		console.log(`Google Maps API Error: \n${err}`);
	}
	else {
		dumpToFile(globe);
	}
});