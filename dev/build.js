var fs = require('fs');
var async = require('async');
var icosphere = require('../src/icosphere.js');

config = JSON.parse(fs.readFileSync("build_config.json", "utf8"));

var googleMapsClient = require('@google/maps').createClient({
	key: config.google_api_key
});
var outfile = "../public/elevation.dat";


function aboutEqual(a, b, error) {
	return a > (b - error) && a < (b + error);
}

function fixPrecision(x){
	return x.toFixed(6).replace(/\.?0*$/, "");
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

function globeToBytes(globe) {
	// See README.md for an explanation of how elevation.dat is formatted
	// Also, see elevation_history.md for an explanation of how I used to format this data
	
	var elevation_ints = new Int16Array(globe.points.length + 1);
	elevation_ints[0] = subdivisions;

	for (var i = 0; i < globe.points.length; i++) {
		elevation_ints[i + 1] = Math.min(Math.max(globe.points[i].elevation, -32768), 32767);
	}

	return new Buffer(elevation_ints.buffer);
}

function dumpToFile(globe) {
	fs.writeFileSync(outfile, globeToBytes(globe)); 
}

var subdivisions = 6;

var globe = icosphere.create(subdivisions);

globe.points = globe.points.map(p => xyzAddlatlong(p.x, p.y, p.z));

var groups_size = 100;
var location_groups = []

for (var i = 0; i < globe.points.length; i += groups_size) {
	location_groups.push(globe.points.slice(i, i + groups_size));
}

async.each(location_groups, function(locations, callback) {
	googleMapsClient.elevation({
		locations: locations.map(loc => `${fixPrecision(loc.latitude)}, ${fixPrecision(loc.longitude)}`).join("|")
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