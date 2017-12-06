var THREE = require("three");

class ColorGradient {
	constructor(name) {
		// webpack will handle this properly
		var color_data = require(`./color_gradients/${name}.pg`);
		
		this.colors = color_data.split("\n").reverse().filter(line => line.length > 1).map(line => {
			var values = line.split(/\s+/);
			return {
				color: {
					r: parseInt(values[1]),
					g: parseInt(values[2]),
					b: parseInt(values[3])
				},
				elevation: parseInt(values[0])
			}
		});

		this.min_elevation = this.colors[0].elevation;
		this.max_elevation = this.colors[this.colors.length - 1].elevation;
		this.elevation_range = this.max_elevation - this.min_elevation;

		this.colors.forEach(color => {
			color.percent = `${(100.0 * (this.min_elevation - color.elevation) / this.elevation_range).toFixed(2)}%`;
		});
	}

	// Gets a color based on an elevation
	// Uses a color gradient. See color_gradient/build_color_gradiant.js for more info
	getColorRGB(elevation) {
		var i = 0;
		while (i < this.colors.length && elevation > this.colors[i].elevation) {
			i++;
		}
		if (i == 0) {
			return this.colors[0].color;
		}
		if (i == this.colors.length) {
			return this.colors[this.colors.length - 1].color;
		}

		var min = this.colors[i - 1];
		var max = this.colors[i];

		if (max.elevation - min.elevation == 0) {
			return min.color;
		}
		var percent = (elevation - min.elevation) / (max.elevation - min.elevation);
		return {
			r: min.color.r + ((max.color.r - min.color.r) * percent),
			g: min.color.g + ((max.color.g - min.color.g) * percent),
			b: min.color.b + ((max.color.b - min.color.b) * percent),
		};
	}

	// Converts a js object with keys r, g, and b into a THREE.Color object
	getColor(elevation) {
		var c = this.getColorRGB(elevation);
		return new THREE.Color(c.r / 255.0, c.g / 255.0, c.b / 255.0);
	}
}

module.exports = ColorGradient;