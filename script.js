var scene = new THREE.Scene();

var canvasElement = document.getElementById("drawing-canvas");

var renderer = new THREE.WebGLRenderer({ canvas: canvasElement });
var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
resizeCanvas();

//// Ocean
var oceanGeometry = new THREE.IcosahedronBufferGeometry(1, 6);
var oceanMaterial = new THREE.MeshBasicMaterial({ 
	color: 0x0000ff, 
	transparent: true,
	opacity: 0.5
});
var ocean = new THREE.Mesh(oceanGeometry, oceanMaterial);
scene.add(ocean);

//// Lighting

// Ambient light
light = new THREE.AmbientLight(0x404040);
scene.add( light );

// Follows the camera
var light = new THREE.PointLight(0xffffff);
scene.add(light);


var geometry = new THREE.Geometry(); 


var camera_distance = 2.5;

camera.position.z = camera_distance;
light.position.z = camera_distance;

// These shall be filled in the ajax call at the end of the file
var json_data = {
	globe: null,
	color_gradient: null
}

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

	var smoothing = 0.2;
	var threshold = 0.05;

	var zoomSmoothing = 0.075;
	var zoomThreshold = 0.0005;

	var camera_changed = false;

	if (controls.zoom != controls.actual_zoom) {
		controls.actual_zoom += ((controls.zoom - controls.actual_zoom) * zoomSmoothing);

		if (controls.actual_zoom < controls.zoom + zoomThreshold && controls.actual_zoom > controls.zoom - zoomThreshold) {
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
	var moveScaling = 500.0 / canvasElement.height;

	controls.theta += -((x - controls.x) * moveScaling);
	controls.phi += ((y - controls.y) * moveScaling);

	controls.phi = Math.min(180, Math.max(-180, controls.phi));	
}

function pressDown(x, y) {
	controls.x = x;
	controls.y = y;
}

function zoomChange(delta) {
	var zoomScaling = 0.001;

	controls.zoom += delta * zoomScaling;

	controls.zoom = Math.max(0.1, controls.zoom);
}

// Called on touchstart or touchend if there are 2 or more touches
function touchesUpdate(x1, y1, x2, y2) {
	controls.touch_delta = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
}

// Called on touchmove if there are 2 or more touches
function touchesMove(x1, y1, x2, y2) {
	var touchZoomScaling = 3;

	var new_delta = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));

	zoomChange((controls.touch_delta - new_delta) * touchZoomScaling);
}

canvasElement.addEventListener('mousedown', event => {
	event.preventDefault();
	if (event.button == 0) {
		pressDown(event.clientX, event.clientY);
	}
}, false);

canvasElement.addEventListener('mousemove', event => {
	event.preventDefault();

	if (event.buttons & 1) {
		pressMove(event.clientX, event.clientY);
	}	
	pressDown(event.clientX, event.clientY);
}, false);

canvasElement.addEventListener("touchstart", event => {
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

canvasElement.addEventListener("touchend", event => {
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

canvasElement.addEventListener("touchmove", event => {
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

canvasElement.addEventListener("wheel", event => {
	event.preventDefault();
	zoomChange(event.deltaY);
});

// Resizes the canvas element and the renderer when the screen changes
// I've added support for a settings sidebar, but we are currently not using it, so I've commented out the functional part of it
function resizeCanvas() {
	var settings_size = 400;
	var cutoff_size = 800;

	var width = window.innerWidth;
	var height = window.innerHeight;

	// if (width > cutoff_size) {
	// 	width -= settings_size;
	// }

	camera.aspect = width / height;
	camera.updateProjectionMatrix();
	renderer.setSize(width, height);
}
window.addEventListener('resize', resizeCanvas, false);


//// Globe stuff


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
	var radius = 1;
	var elevation = point.elevation / 50000;
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
function addGlobe() {
	var globe = json_data.globe;
	globe.points.forEach(point => {
		geometry.vertices.push(pointToVector(point));
	});

	globe.triangles.forEach(triangle => {
		geometry.faces.push(triangleToFace(triangle));
	});

	var material = new THREE.MeshPhongMaterial({
		vertexColors: THREE.VertexColors
	});

	var globe_object = new THREE.Mesh(geometry, material);
	scene.add(globe_object);

	geometry.computeFaceNormals();
	// geometry.computeVertexNormals();

	animate();
}

// Load our json data, and add the globe
$.when(
	$.getJSON("./globe.json", function(globe) {
		json_data.globe = globe;
	}),

	$.getJSON("./color_gradient/color_gradient.json", function(color_gradient) {
		json_data.color_gradient = color_gradient;
	}),

).then(addGlobe);