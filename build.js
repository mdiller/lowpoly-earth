var fs = require('fs');
var async = require('async');
var icosphere = require('./icosphere.js');

config = JSON.parse(fs.readFileSync("build_config.json", "utf8"));

var googleMapsClient = require('@google/maps').createClient({
	key: config.google_api_key
});

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
	var floats_per_point = 6;
	var ints_per_triangle = 3;

	var points = globe.points;
	var triangles = globe.triangles;
	var num_points = points.length;
	var num_triangles = triangles.length;

	// This will hold all the buffers we will concat together
	var buffers = [];

	// Attach a header with the text GLOBEDAT, followed by:
	// num_points (int32)
	// num_triangles (int32)
	buffers.push(Buffer.from("GLOBEDAT", "utf8"));
	var header_vars = new Int32Array(2);
	header_vars[0] = num_points;
	header_vars[1] = num_triangles;
	buffers.push(new Buffer(header_vars.buffer));

	// Add all of the points
	var point_floats = new Float32Array(num_points * floats_per_point);
	for (var i = 0; i < num_points; i++) {
		var j = i * floats_per_point;
		point_floats[j] = points[i].x;
		point_floats[j + 1] = points[i].y;
		point_floats[j + 2] = points[i].z;
		point_floats[j + 3] = points[i].latitude;
		point_floats[j + 4] = points[i].longitude;
		point_floats[j + 5] = points[i].elevation;
	}
	buffers.push(new Buffer(point_floats.buffer));

	// Add all of the triangles
	var triangle_ints = new Uint16Array(num_triangles * ints_per_triangle);
	for (var i = 0; i < num_triangles; i++) {
		var j = i * ints_per_triangle;
		triangle_ints[j] = triangles[i].p1;
		triangle_ints[j + 1] = triangles[i].p2;
		triangle_ints[j + 2] = triangles[i].p3;
	}
	buffers.push(new Buffer(triangle_ints.buffer));

	return Buffer.concat(buffers);
}

function dumpToFile(globe) {
	fs.writeFileSync("./globe.dat", globeToBytes(globe)); 
}


var globe = icosphere.create(6);

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