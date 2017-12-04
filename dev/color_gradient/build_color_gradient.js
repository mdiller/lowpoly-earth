// Run this script using node.js to load a .c3g file into a nice json format
// these files are obtained from places like this:
// http://soliton.vm.bytemark.co.uk/pub/cpt-city/
// or
// http://soliton.vm.bytemark.co.uk/pub/cpt-city/gmt/index.html


var fs = require("fs");

var config = {
	filename: "color_gradient.c3g",
	min: -11000,
	max: 8500,
	outfile: "../../src/color_gradient.json"
}

var text = fs.readFileSync(config.filename, "utf8");

var result = []

var pattern = /rgb\((?: *)([0-9]+),(?: *)([0-9]+),(?: *)([0-9]+)\)\s+?([\.0-9]+)%/g;
while((match = pattern.exec(text)) !== null) {
	var percent = parseFloat(match[4]) / 100;
	var elevation = (percent * (config.max - config.min)) + config.min;

	result.push({
		color: {
			r: parseInt(match[1]),
			g: parseInt(match[2]),
			b: parseInt(match[3]),
		},
		elevation: elevation,
		percent: percent * 100
	});
}

console.log(result);

fs.writeFileSync(config.outfile, JSON.stringify(result, null, "\t"), "utf8");
