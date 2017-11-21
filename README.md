# Low-Poly Earth

This is a low polygon count rendering of the earth. I created it using THREE.js / WebGL, with elevation data from the Google Maps API.

## Building the data

The first step in this project was to retrieve elevation data so that I could have something to display. I wanted to do this separately from the rendering, because if this was done before the client even loaded the page, that would mean they would not have to wait for it. 

To that end, I run [build.js](./build.js) using node.js. First I create an [icosphere](https://en.wikipedia.org/wiki/Icosphere), with a set subdivision level, using [icosphere.js](./icosphere.js). I then collect each point on the icosphere, figure out the latitude and longitude coordinates of the point, and get the elevation of that point from the [Google Maps API](https://developers.google.com/maps/documentation/elevation/start).

Once all of the data has been collected, I save it in globe.dat, to be used in the actual application.

### Globe.dat

I originally stored the globe data in a json file, but with 6 subdivisions of the icosphere there are 40,962 vertices and 81,920 triangles, which made the file 12.1 MB. I decided to serialize the data as bytes in a simple .dat format. The format consists of the following:

- 8 bytes to store the string `GLOBEDAT`
- 4 bytes (a uint32) to store the number of points
- 4 bytes (a uint32) to store the number of triangles
- All of the points data
 - Each field encoded as a single precision float
- All of the triangles data
 - Each field encoded as a uint16

## Colors

An important feature of this project is that I wanted it to look good. Colors are often used to achieve that goal, and I wanted to make sure that it would be fairly easy to switch between different color schemes until I found one that I liked. I also wanted the color to be dependant on the elevation, as that is common for geographic maps / models.

I decided to use a color gradient from a [site](http://soliton.vm.bytemark.co.uk/pub/cpt-city/) which offered a wide variety of gradients to choose from. I then created [build_color_gradient.js](color_gradient/build_color_gradient.js) which builds the .c3g file into a nicer .json format. The gradient is then loaded into the application on startup, and applied to each triangle as needed.