// This code creates an Icosphere, when given a level of recursion
//
// Code originally written by Andreas Kahler on his blog at:
// http://blog.andreaskahler.com/2009/06/creating-icosphere-mesh-in-code.html
//
// I have converted it to javascript and adjusted it to fit my needs


function create(recursionLevel) {
	var points = [];
	var triangles = [];
	var point_index = -1;
	var middle_point_cache = {}

	// add vertex to mesh, fix position to be on unit sphere, return index
	function addPoint(x, y, z) {
		var length = Math.sqrt((x * x) + (y * y) + (z * z));
		points.push({
			x: x / length,
			y: y / length,
			z: z / length
		});
		point_index++;
		return point_index;
	}

	function addTriangle(p1, p2, p3) {
		triangles.push({
			p1: p1,
			p2: p2,
			p3: p3
		});
	}

	// return index of point in the middle of p1 and p2
	function getMiddlePoint(p1, p2)
	{
		// first check if we have it already
		var cache_key = p1 < p2 ? `${p1}_${p2}` : `${p2}_${p1}`;

		if (cache_key in middle_point_cache) {
			return middle_point_cache[cache_key];
		}

		// not in cache, calculate it
		var point1 = points[p1];
		var point2 = points[p2];

		// addPoint makes sure point is on unit sphere
		var i = addPoint(
			(point1.x + point2.x) * 0.5, 
			(point1.y + point2.y) * 0.5, 
			(point1.z + point2.z) * 0.5
		); 

		// store it, return index
		middle_point_cache[cache_key] = i;
		return i;
	}

	// create 12 vertices of a icosahedron
	var t = (1.0 + Math.sqrt(5.0)) / 2.0;

	addPoint(-1,  t,  0);
	addPoint( 1,  t,  0);
	addPoint(-1, -t,  0);
	addPoint( 1, -t,  0);

	addPoint( 0, -1,  t);
	addPoint( 0,  1,  t);
	addPoint( 0, -1, -t);
	addPoint( 0,  1, -t);

	addPoint( t,  0, -1);
	addPoint( t,  0,  1);
	addPoint(-t,  0, -1);
	addPoint(-t,  0,  1);

	// 5 faces around point 0
	addTriangle(0, 11, 5);
	addTriangle(0, 5, 1);
	addTriangle(0, 1, 7);
	addTriangle(0, 7, 10);
	addTriangle(0, 10, 11);

	// 5 adjacent faces 
	addTriangle(1, 5, 9);
	addTriangle(5, 11, 4);
	addTriangle(11, 10, 2);
	addTriangle(10, 7, 6);
	addTriangle(7, 1, 8);

	// 5 faces around point 3
	addTriangle(3, 9, 4);
	addTriangle(3, 4, 2);
	addTriangle(3, 2, 6);
	addTriangle(3, 6, 8);
	addTriangle(3, 8, 9);

	// 5 adjacent faces 
	addTriangle(4, 9, 5);
	addTriangle(2, 4, 11);
	addTriangle(6, 2, 10);
	addTriangle(8, 6, 7);
	addTriangle(9, 8, 1);

	// refine triangles
	for (var i = 0; i < recursionLevel; i++)
	{
		var new_triangles = [];
		triangles.forEach(tri => {
			// replace triangle by 4 triangles
			var a = getMiddlePoint(tri.p1, tri.p2);
			var b = getMiddlePoint(tri.p2, tri.p3);
			var c = getMiddlePoint(tri.p3, tri.p1);

			new_triangles.push({
				p1: tri.p1,
				p2: a,
				p3: c
			});
			new_triangles.push({
				p1: tri.p2,
				p2: b,
				p3: a
			});
			new_triangles.push({
				p1: tri.p3,
				p2: c,
				p3: b
			});
			new_triangles.push({
				p1: a,
				p2: b,
				p3: c
			});
		});
		triangles = new_triangles;
	}

	return {
		points: points,
		triangles: triangles
	};
}


module.exports = {
	create: create
}