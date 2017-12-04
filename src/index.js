var THREE = require("three");
var $ = require("jquery");
var icosphere = require("./icosphere.js");
var color_gradient = require("./color_gradient.json");

var config_info = require("./config.json");


// Config variables and info set in initConfig()
var config = {};
initConfig();

console.log(`Hello! Welcome to the console of my LowPoly Globe!
I've set this up to provide some timing information about my application`);
console.time("entire initialization");

var scene = new THREE.Scene();

var canvas_element = document.getElementById("drawing-canvas");

var renderer = new THREE.WebGLRenderer({ canvas: canvas_element });
var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.01, 1000);
resizeCanvas();

//// Lighting

// Ambient light
light = new THREE.AmbientLight(0x404040);
scene.add( light );

// Follows the camera
var light = new THREE.PointLight(0xffffff);
scene.add(light);

var material = new THREE.MeshPhongMaterial({
	vertexColors: THREE.VertexColors
});

var ocean_geometry = new THREE.Geometry();
var geometry = new THREE.Geometry(); 

geometry.dynamic = true;

var clock = new THREE.Clock;

var zoom_start = 2.5;

camera.position.z = zoom_start;
light.position.z = zoom_start;

// These shall be filled in the ajax call at the end of the file
var json_data = {
	globe: null
}

// These shall be used to hold information for controlling the camera position
var controls = {
	x: null,
	y: null,
	theta: 0,
	phi: 0,
	actual_theta: 0,
	actual_phi: 0,
	zoom: zoom_start,
	actual_zoom: zoom_start,
	touch_delta: 0
}

// Finds an x, y, z position on a globe given a theta, phi, and radius
function degreesToPosition(theta, phi, radius) {
	return [
		radius * Math.sin(theta * Math.PI / 360 ) * Math.cos(phi * Math.PI / 360 ),
		radius * Math.sin(phi * Math.PI / 360 ),
		radius * Math.cos(theta * Math.PI / 360 ) * Math.cos(phi * Math.PI / 360 )
	];
}

//// Controls / Events

// The main function of animate at this point is to control the camera position
var animate = function () {
	requestAnimationFrame( animate );

	var clock_delta = clock.getDelta();

	var smoothing = Math.min(12 * clock_delta, 1);
	var threshold = 0.05;

	var zoom_smoothing = Math.min(9 * clock_delta, 1);
	var zoom_threshold = 0.0005;

	var camera_changed = false;


	if (controls.zoom != controls.actual_zoom) {
		controls.actual_zoom += ((controls.zoom - controls.actual_zoom) * zoom_smoothing);

		if (controls.actual_zoom < controls.zoom + zoom_threshold && controls.actual_zoom > controls.zoom - zoom_threshold) {
			controls.actual_zoom = controls.zoom;
		}

		camera_changed = true;
	}

	if (controls.actual_theta != controls.theta || controls.actual_phi != controls.phi) {
		controls.actual_theta += ((controls.theta - controls.actual_theta) * smoothing);
		controls.actual_phi += ((controls.phi - controls.actual_phi) * smoothing);

		if (controls.actual_phi < controls.phi + threshold && controls.actual_phi > controls.phi - threshold) {
			controls.actual_phi = controls.phi;
		}
		if (controls.actual_theta < controls.theta + threshold && controls.actual_theta > controls.theta - threshold) {
			controls.actual_theta = controls.theta;
		}
		camera_changed = true;
	}

	if (camera_changed) {
		camera.position.set(...degreesToPosition(
			controls.actual_theta, 
			controls.actual_phi, 
			controls.actual_zoom
		));

		
		// light.position.set(...degreesToPosition(
		// 	45 + controls.actual_theta, 
		// 	45 + controls.actual_phi, 
		// 	2.5
		// ));
		light.position.set(
			camera.position.x,
			camera.position.y,
			camera.position.z
		);
		camera.lookAt(new THREE.Vector3(0, 0, 0));
		camera.updateMatrix();
	}

	renderer.render(scene, camera);
};

animate();

function pressMove(x, y) {
	// drawing is based on the height, so this scales with size of drawing
	var moveScaling = 500.0 / canvas_element.clientHeight;

	// make movescaling less when youre more zoomed in
	moveScaling *= Math.max(controls.zoom, 1) / zoom_start;

	controls.theta += -((x - controls.x) * moveScaling);
	controls.phi += ((y - controls.y) * moveScaling);

	controls.phi = Math.min(180, Math.max(-180, controls.phi));	
}

function pressDown(x, y) {
	controls.x = x;
	controls.y = y;
}

function zoomChange(delta) {
	var zoom_scaling = 0.1;

	controls.zoom += delta * zoom_scaling;

	controls.zoom = Math.max(0.1, controls.zoom);
}

// Called on touchstart or touchend if there are 2 or more touches
function touchesUpdate(x1, y1, x2, y2) {
	controls.touch_delta = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
}

// Called on touchmove if there are 2 or more touches
function touchesMove(x1, y1, x2, y2) {
	var touch_zoom_scaling = 0.03;

	var new_delta = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));

	zoomChange((controls.touch_delta - new_delta) * touch_zoom_scaling);
}

canvas_element.addEventListener('mousedown', event => {
	event.preventDefault();
	if (event.button == 0) {
		pressDown(event.clientX, event.clientY);
	}
}, false);

canvas_element.addEventListener('mousemove', event => {
	event.preventDefault();

	if (event.buttons & 1) {
		pressMove(event.clientX, event.clientY);
	}	
	pressDown(event.clientX, event.clientY);
}, false);

canvas_element.addEventListener("touchstart", event => {
	event.preventDefault();

	if (event.touches) {
		if (event.touches.length > 1) {
			touchesUpdate(
				event.touches[0].clientX,
				event.touches[0].clientY,
				event.touches[1].clientX,
				event.touches[1].clientY
			);
		}
		else {
			pressDown(event.touches[0].clientX, event.touches[0].clientY);
		}
	}
});

canvas_element.addEventListener("touchend", event => {
	event.preventDefault();

	if (event.touches && event.touches.length > 0) {
		if (event.touches.length > 1 && event.touches[1]) {
			touchesUpdate(
				event.touches[0].clientX,
				event.touches[0].clientY,
				event.touches[1].clientX,
				event.touches[1].clientY
			);
		}
		else {
			pressDown(event.touches[0].clientX, event.touches[0].clientY);
		}
	}
});

canvas_element.addEventListener("touchmove", event => {
	event.preventDefault();
	
	if (event.touches) {
		if (event.touches.length > 1) {
			touchesMove(
				event.touches[0].clientX,
				event.touches[0].clientY,
				event.touches[1].clientX,
				event.touches[1].clientY
			);
			touchesUpdate(
				event.touches[0].clientX,
				event.touches[0].clientY,
				event.touches[1].clientX,
				event.touches[1].clientY
			);
		}
		else {
			pressMove(event.touches[0].clientX, event.touches[0].clientY);
			pressDown(event.touches[0].clientX, event.touches[0].clientY);
		}
	}
});

canvas_element.addEventListener("wheel", event => {
	event.preventDefault();
	var divisor = {
		0: 100,
		1: 3,
		2: 1
	}[event.deltaMode] // based on the usual values for these modes
	zoomChange(event.deltaY / divisor);
});

// Resizes the canvas element and the renderer when the screen changes
// I've added support for a settings sidebar, but we are currently not using it, so I've commented out the functional part of it
function resizeCanvas() {
	var width = window.innerWidth;
	var height = window.innerHeight;


	camera.aspect = width / height;
	camera.updateProjectionMatrix();
	renderer.setSize(width, height);
	renderer.setPixelRatio(window.devicePixelRatio);
}
window.addEventListener('resize', resizeCanvas, false);


//// Globe stuff

function bytesToGlobe(buffer) {
	// See README.md for an explanation of how elevation.dat is formatted
	// Also, see elevation_history.md for an explanation of how I used to format this data

	var header = new Int16Array(buffer, 0, 1);
	var subdivisions = header[0];

	var globe = icosphere.create(subdivisions);

	var elevation_ints = new Int16Array(buffer, 2, globe.points.length);

	globe.points.forEach((point, i) => {
		point.elevation = elevation_ints[i];
	});

	return globe;
}


// Gets a color based on an elevation
// Uses a color gradient. See color_gradient/build_color_gradiant.js for more info
function elevationColor(elevation) {
	var i = 0;
	while (i < color_gradient.length && elevation > color_gradient[i].elevation) {
		i++;
	}
	if (i == 0) {
		return color_gradient[0].color;
	}
	if (i == color_gradient.length) {
		return color_gradient[color_gradient.length - 1].color;
	}

	var min = color_gradient[i - 1];
	var max = color_gradient[i];

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
function elevationColorThree(elevation) {
	var c = elevationColor(elevation);
	return new THREE.Color(c.r / 255.0, c.g / 255.0, c.b / 255.0);
}

// Converts a point from globe.json into a THREE.Vector3
// Takes elevation into account, adjusting for what we've configured
function pointToVector(point, use_elevation=true) {
	var radius = 1; // corresponds to 20903520 feet
	var elevation = config.elevation_scale * (point.elevation / 20903520);

	// To prevent the earth havin a z-fight with the ocean when elevation_scale is low
	var threshold = 0.001;
	if (Math.abs(elevation) < threshold){
		elevation = elevation > 0 ? threshold : -threshold;
	}

	if (!use_elevation) {
		elevation = 0;
	}
	return new THREE.Vector3(
		(radius + elevation) * point.x, 
		(radius + elevation) * point.y, 
		(radius + elevation) * point.z);
}


// Colors a face when given its index
function colorFace(face, index) {
	var globe = json_data.globe;
	var triangle = globe.triangles[index];

	var points = [
		globe.points[triangle.p1],
		globe.points[triangle.p2],
		globe.points[triangle.p3]
	];
	switch(config.triangle_coloring) {
		case "max":
			var color = points.reduce((p1, p2) => p1.elevation > p2.elevation ? p1 : p2).color;

			face.vertexColors[0] = color;
			face.vertexColors[1] = color;
			face.vertexColors[2] = color;
			break;
		case "min":
			var color = points.reduce((p1, p2) => p1.elevation < p2.elevation ? p1 : p2).color;

			face.vertexColors[0] = color;
			face.vertexColors[1] = color;
			face.vertexColors[2] = color;
			break;
		case "avg":
			var color = elevationColorThree(points.map(p => p.elevation).reduce((e1, e2) => e1 + e2) / points.length);
			face.vertexColors[0] = color;
			face.vertexColors[1] = color;
			face.vertexColors[2] = color;
			break;
		case "all":
			face.vertexColors[0] = points[0].color;
			face.vertexColors[1] = points[1].color;
			face.vertexColors[2] = points[2].color;
			break;
		default:
			console.error("bad triangle color setting");
	}
}

// Converts a triangle from globe.json into a THREE.Vector3
// Passed the index of the triangle instead of the triangle itself, to allow for freedom
function triangleToFace(index, add_colors=true) {
	var triangle = json_data.globe.triangles[index];

	var face = new THREE.Face3(triangle.p1, triangle.p2, triangle.p3);

	if (add_colors) {
		colorFace(face, index);
	}

	return face;
}

// Creates and adds the globe to the scene
function loadGlobe() {
	var globe = json_data.globe;

	//// Ocean
	globe.points.forEach(point => {
		ocean_geometry.vertices.push(pointToVector(point, false));
	});
	globe.triangles.forEach((triangle, index) => {
		ocean_geometry.faces.push(triangleToFace(index, false));
	});

	var ocean_material = new THREE.MeshBasicMaterial({ 
		color: 0x0000ff, 
		transparent: true,
		opacity: 0.5
	});
	var ocean = new THREE.Mesh(ocean_geometry, ocean_material);
	scene.add(ocean);

	console.time('computing vertex colors');
	globe.points.forEach(point => {
		point.color = elevationColorThree(point.elevation);
	});
	console.timeEnd('computing vertex colors');

	console.time('adding vertices');
	globe.points.forEach(point => {
		geometry.vertices.push(pointToVector(point));
	});
	console.timeEnd('adding vertices');

	console.time('adding triangles');
	globe.triangles.forEach((triangle, index) => {
		geometry.faces.push(triangleToFace(index));
	});
	console.timeEnd('adding triangles');

	if (config.render_globe_interior) {
		material.side = THREE.DoubleSide;
	}

	var globe_object = new THREE.Mesh(geometry, material);
	scene.add(globe_object);


	console.time('computing face normals');
	geometry.computeFaceNormals();
	console.timeEnd('computing face normals');
	if (config.compute_vertex_normals) {
		console.time('computing vertex normals');
		geometry.computeVertexNormals();
		console.timeEnd('computing vertex normals');
	}

	console.time('animating');
	animate();
	console.timeEnd('animating');

	console.timeEnd('entire globe initialization');
	console.timeEnd("entire initialization");
}

//// Config Stuff
var config_cog = document.getElementById("config-cog");
var config_box = document.getElementById("config-box");

config_cog.addEventListener("click", event => {
	event.preventDefault();
	config_cog.classList.toggle("hidden");
	config_box.classList.toggle("hidden");
});

var config_element_class = "config_item";
function createConfigElement(config_item) {
	var element_id = `config_item_${config_item.name}`;
	return {
		integer: `
			<label for="${element_id}">${config_item.label}</label>
			<input
				id="${element_id}" 
				class="${config_element_class}"
				type="range"
				min="1"
				max="580"
				value="${config_item.default}">
			</input>`,
		boolean: `
			<label>
				<input 
					id="${element_id}" 
					class="${config_element_class}"
					type="checkbox">
					${config_item.label}
				</input>
			</label>`,
		select: `
			<label for="${element_id}">${config_item.label}</label>
			<select
				id="${element_id}"
				class="${config_element_class}">
				${(config_item.options || []).map(option => {
					var selected = config_item.default == option.name ? " selected" : "";
					return `
						<option value="${option.name}"${selected}>
							${option.localized}
						</option>`;
				}).join("\n")}
			</select>`
	}[config_item.type];
}

function configElementChanged(name, value) {
	console.log(name, value);
	var new_config = {}
	new_config[name] = value;
	doConfigAction(new_config);
}

// handler for jquery event, clean up and give to configElementChanged
function configElementChangedHandler() {
	var element = $(this);
	var name = element.attr("id").replace("config_item_", "");

	if (element.is("select")) {
		configElementChanged(name, element.val());
	}
	else if (element.attr("type") == "checkbox") {
		configElementChanged(name, element.is(":checked"));
	}
	else if (element.attr("type") == "range") {
		configElementChanged(name, element.val());
	}
	else {
		console.error("don't know what type of input this is!");
	}
}

// Initializes the config object
function initConfig() {
	config_info.forEach(config_item => {
		config[config_item.name] = config_item.default;

		$("#config-content form").append(createConfigElement(config_item));
	});

	$(`.${config_element_class}`).change(configElementChangedHandler);
}

// Function to call when there is config work to be done
function doConfigAction(new_config) {
	var dirty = {};
	Object.keys(new_config).forEach(key => {
		dirty[key] = true
		config[key] = new_config[key]
	});

	if (dirty.render_globe_interior) {
		material.side = config.render_globe_interior ? THREE.DoubleSide : THREE.FrontSide;
	}

	if (dirty.elevation_scale) {
		json_data.globe.points.forEach((point, i) => {
			var vector = pointToVector(point);
			geometry.vertices[i].x = vector.x;
			geometry.vertices[i].y = vector.y;
			geometry.vertices[i].z = vector.z;
		});
		geometry.computeFaceNormals();
		geometry.elementsNeedUpdate = true;
		geometry.verticesNeedUpdate = true;
	}

	if (dirty.triangle_coloring) {
		geometry.faces.forEach((face, index) => {
			colorFace(face, index);
		});
		geometry.elementsNeedUpdate = true;
	}

	if (dirty.compute_vertex_normals) {
		if (config.compute_vertex_normals) {
			geometry.computeVertexNormals();
		}
		else {
			geometry.faces.forEach(face => {
				face.vertexNormals = [];
			});
		}
		geometry.elementsNeedUpdate = true;
	}
}


// Returns a Promise for a http request to get a binary file
function getBINARY(url) {
	return new Promise(function (resolve, reject) {
		var xhr = new XMLHttpRequest();
		xhr.open("GET", url, true);
		xhr.responseType = "arraybuffer";
		xhr.onload = function () {
			if (this.status >= 200 && this.status < 300) {
				resolve(xhr.response);
			}
			else {
				reject({
					status: this.status,
					statusText: xhr.statusText
				});
			}
		};
		xhr.onerror = function () {
			reject({
				status: this.status,
				statusText: xhr.statusText
			});
		};
		xhr.send();
	});
}

console.time('entire globe initialization');
console.time('loading elevation.dat');
$.when(
	getBINARY("./elevation.dat").then(response => {
		json_data.globe = bytesToGlobe(response);
		console.timeEnd('loading elevation.dat');
	})
).then(loadGlobe);