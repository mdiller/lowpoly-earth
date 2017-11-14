

var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 0.1, 1000 );

var renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );


// Lighting
var light = new THREE.PointLight(0xffffff);
light.position.set(-1,2,1);
scene.add(light);
light = new THREE.AmbientLight( 0x404040 );
scene.add( light );


var geometry = new THREE.Geometry(); 


var camera_distance = 2.5;

camera.position.z = camera_distance;

var controls = {
	x: null,
	y: null,
	theta: 0,
	phi: 0,
	actual_theta: 0,
	actual_phi: 0
}

var animate = function () {
	requestAnimationFrame( animate );

	// Doing this here so we can add acceleration later
	var radius = 2.5;
	var smoothing = 0.2;
	var threshold = 0.05;

	if (controls.actual_theta != controls.theta || controls.actual_phi != controls.phi) {
		controls.actual_theta += ((controls.theta - controls.actual_theta) * smoothing);
		controls.actual_phi += ((controls.phi - controls.actual_phi) * smoothing);

		if (controls.actual_phi < controls.phi + threshold && controls.actual_phi > controls.phi - threshold) {
			controls.actual_phi = controls.phi;
		}
		if (controls.actual_theta < controls.theta + threshold && controls.actual_theta > controls.theta - threshold) {
			controls.actual_theta = controls.theta;
		}

		camera.position.x = radius * Math.sin(controls.actual_theta * Math.PI / 360 )
							* Math.cos(controls.actual_phi * Math.PI / 360 );
		camera.position.y = radius * Math.sin(controls.actual_phi * Math.PI / 360 );
		camera.position.z = radius * Math.cos(controls.actual_theta * Math.PI / 360 )
							* Math.cos(controls.actual_phi * Math.PI / 360 );
		camera.lookAt(new THREE.Vector3(0, 0, 0));
		camera.updateMatrix();
	}

	renderer.render(scene, camera);
};

animate();


document.addEventListener( 'mousemove', event => {
	event.preventDefault();

	if (event.buttons & 1) {
		controls.theta += -((event.clientX - controls.x) * 0.75 );
		controls.phi += ((event.clientY - controls.y) * 0.75 );


		controls.phi = Math.min( 180, Math.max( -180, controls.phi ) );		
	}

	controls.x = event.clientX;
	controls.y = event.clientY;
}, false);


document.addEventListener( 'mousedown', event => {
	if (event.button == 0) {
		controls.x = event.clientX;
		controls.y = event.clientY;
	}
}, false );

// Globe stuff

function pointToVector(point) {
	var radius = 1;
	var elevation = point.elevation / 50000;
	return new THREE.Vector3(
		(radius + elevation) * point.x, 
		(radius + elevation) * point.y, 
		(radius + elevation) * point.z);
}

function addGlobe(globe) {
	globe.points.map(pointToVector).forEach(vector => {
		geometry.vertices.push(vector);
	});

	globe.triangles.forEach(triangle => {
		geometry.faces.push(new THREE.Face3(triangle.p1, triangle.p2, triangle.p3));
	});

	var material = new THREE.MeshPhongMaterial({color: 0x55B663});

	var globe_object = new THREE.Mesh(geometry, material);
	scene.add(globe_object);

	geometry.computeFaceNormals();
	// geometry.computeVertexNormals();

	animate();
}





$.ajax({
	dataType: "json",
	url: "./globe.json",
	success: addGlobe
});