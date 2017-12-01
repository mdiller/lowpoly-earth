console.log(`Hello! Welcome to the console of my LowPoly Globe!
I've set this up to provide some timing information about my application`);
console.time("entire initialization");

var scene = new THREE.Scene();

var canvas_element = document.getElementById("drawing-canvas");

var renderer = new THREE.WebGLRenderer({ canvas: canvas_element });
var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.01, 1000);
resizeCanvas();

//// Ocean
var ocean_geometry = new THREE.IcosahedronBufferGeometry(1, 6);
var ocean_material = new THREE.MeshBasicMaterial({ 
	color: 0x0000ff, 
	transparent: true,
	opacity: 0.5
});
var ocean = new THREE.Mesh(ocean_geometry, ocean_material);
scene.add(ocean);

//// Lighting

// Ambient light
light = new THREE.AmbientLight(0x404040);
scene.add( light );

// Follows the camera
var light = new THREE.PointLight(0xffffff);
scene.add(light);


var geometry = new THREE.Geometry(); 

var clock = new THREE.Clock;

var camera_distance = 2.5;

camera.position.z = camera_distance;
light.position.z = camera_distance;

// These shall be filled in the ajax call at the end of the file
var json_data = {
	globe: null,
	color_gradient: null
}

// Config variables and info set in initConfig()
var config = {};
var config_info = [];

// These shall be used to hold information for controlling the camera position
var controls = {
	x: null,
	y: null,
	theta: 0,
	phi: 0,
	actual_theta: 0,
	actual_phi: 0,
	zoom: camera_distance,
	actual_zoom: camera_distance,
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

	var smoothing = Math.min(24 * clock_delta, 1);
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

	controls.theta += -((x - controls.x) * moveScaling);
	controls.phi += ((y - controls.y) * moveScaling);

	controls.phi = Math.min(180, Math.max(-180, controls.phi));	
}

function pressDown(x, y) {
	controls.x = x;
	controls.y = y;
}

function zoomChange(delta) {
	var zoom_scaling = 0.001;

	controls.zoom += delta * zoom_scaling;

	controls.zoom = Math.max(0.1, controls.zoom);
}

// Called on touchstart or touchend if there are 2 or more touches
function touchesUpdate(x1, y1, x2, y2) {
	controls.touch_delta = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
}

// Called on touchmove if there are 2 or more touches
function touchesMove(x1, y1, x2, y2) {
	var touch_zoom_scaling = 3;

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

	if (event.touches) {
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
	zoomChange(event.deltaY);
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
	var floats_per_point = 6;
	var ints_per_triangle = 3;

	var globe = {};

	// The header has the text GLOBEDAT, followed by:
	// num_points (int32)
	// num_triangles (int32)
	var offset = 8; // skip the first 8 bytes (GLOBEDAT)
	var header_info = new Int32Array(buffer, offset, 2);
	num_points = header_info[0];
	num_triangles = header_info[1];
	offset += 2  * header_info.BYTES_PER_ELEMENT; // skip over the rest of the header

	var point_floats = new Float32Array(buffer, offset, num_points * floats_per_point);
	offset += num_points * floats_per_point * point_floats.BYTES_PER_ELEMENT;

	var triangle_ints = new Uint16Array(buffer, offset, num_triangles * ints_per_triangle);

	globe.points = [];
	for (var i = 0; i < num_points; i++) {
		var j = i * floats_per_point;
		globe.points.push({
			x: point_floats[j],
			y: point_floats[j + 1],
			z: point_floats[j + 2],
			latitude: point_floats[j + 3],
			longitude: point_floats[j + 4],
			elevation: point_floats[j + 5]
		});
	}

	globe.triangles = [];
	for (var i = 0; i < num_triangles; i++) {
		var j = i * ints_per_triangle;
		globe.triangles.push({
			p1: triangle_ints[j],
			p2: triangle_ints[j + 1],
			p3: triangle_ints[j + 2],
		});
	}

	return globe;
}


// Gets a color based on an elevation
// Uses a color gradient. See color_gradient/build_color_gradiant.js for more info
function elevationColor(elevation) {
	var color_gradient = json_data.color_gradient;
	var i = 0;
	while (elevation > color_gradient[i].elevation && i < color_gradient.length) {
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
function pointToVector(point) {
	var radius = 1; // corresponds to 20903520 feet
	var elevation = config.elevation_scale * (point.elevation / 20903520);
	return new THREE.Vector3(
		(radius + elevation) * point.x, 
		(radius + elevation) * point.y, 
		(radius + elevation) * point.z);
}

// Converts a triangle from globe.json into a THREE.Vector3
function triangleToFace(triangle) {
	var globe = json_data.globe;
	var face = new THREE.Face3(triangle.p1, triangle.p2, triangle.p3);

	var points = [
		globe.points[triangle.p1],
		globe.points[triangle.p2],
		globe.points[triangle.p3]
	];
	var elevation = Math.max(...points.map(point => point.elevation));
	var color = elevationColorThree(elevation);

	// Initial style will have one color per face
	face.vertexColors[0] = color;
	face.vertexColors[1] = color;
	face.vertexColors[2] = color;

	return face;
}

// Creates and adds the globe to the scene
function loadGlobe() {
	var globe = json_data.globe;
	console.time('adding vertices');
	globe.points.forEach(point => {
		geometry.vertices.push(pointToVector(point));
	});
	console.timeEnd('adding vertices');

	console.time('adding triangles');
	globe.triangles.forEach(triangle => {
		geometry.faces.push(triangleToFace(triangle));
	});
	console.timeEnd('adding triangles');

	var material = new THREE.MeshPhongMaterial({
		vertexColors: THREE.VertexColors
	});

	var globe_object = new THREE.Mesh(geometry, material);
	scene.add(globe_object);


	console.time('computing face normals');
	geometry.computeFaceNormals();
	console.timeEnd('computing face normals');
	if (config.computeFaceNormals) {
		console.time('computing face normals');
		geometry.computeVertexNormals();
		console.timeEnd('computing face normals');
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

// Initializes the config object
function initConfig(config_data) {
	config_data.forEach(setting => {
		config[setting.name] = setting.default;
		config_info.push(setting);
	});
	console.log(config);
	console.log(config_info);
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
console.time('loading color_gradient.json');
console.time('loading config.json')
console.time('loading globe.dat');
$.when(
	$.getJSON("./color_gradient/color_gradient.json", response => {
		json_data.color_gradient = response;
		console.timeEnd('loading color_gradient.json');
	}),

	$.getJSON("./config.json", response => {
		initConfig(response);
		console.timeEnd('loading config.json');
	}),

	getBINARY("./globe.dat").then(response => {
		json_data.globe = bytesToGlobe(response);
		console.timeEnd('loading globe.dat');
	})
).then(loadGlobe);