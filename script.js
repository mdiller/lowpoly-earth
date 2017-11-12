

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

camera.position.z = 2.5;

var animate = function () {
	requestAnimationFrame( animate );

	renderer.render(scene, camera);
};



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