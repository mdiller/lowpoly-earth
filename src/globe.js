var Icosphere = require("./icosphere.js");
var elevation_buffer = require("./elevation.dat");

// Represents the structure of the globe
// basically an icosphere with a bit of extra elevation data
class Globe {
	constructor(config) {
		this.config = config;

		// See README.md for an explanation of how elevation.dat is formatted
		// Also, see elevation_history.md for an explanation of how I used to format this data
		var header = new Int16Array(elevation_buffer.buffer, 0, 1);
		var recursion_level = header[0];

		var icosphere = Icosphere.create(recursion_level);

		this.points = icosphere.points;
		this.triangles = icosphere.triangles;

		this.max_recursion_level = recursion_level;

		var elevation_ints = new Int16Array(elevation_buffer.buffer, 2, this.points.length);

		this.points.forEach((point, i) => {
			point.elevation = elevation_ints[i];
		});
	}

	// Regenerate faces based on the current recursion level
	generateTriangles() {
		var icosphere = Icosphere.create(this.config.recursion_level);

		this.triangles = icosphere.triangles;
	}
}

module.exports = Globe;