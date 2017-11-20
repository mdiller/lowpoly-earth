# Low-Poly Earth

This is a low polygon count rendering of the earth. I created it using THREE.js / WebGL, with elevation data from the Google Maps API.

## Building the data

The first step in this project was to retrieve elevation data so that I could have something to display. I wanted to do this separately from the rendering, because if this was done before the client even loaded the page, that would mean they would not have to wait for it. 

To that end, I run [build.js](./build.js) using node.js. First I create an [icosphere](https://en.wikipedia.org/wiki/Icosphere), with a set subdivision level, using [icosphere.js](./icosphere.js). I then collect each point on the icosphere, figure out the latitude and longitude coordinates of the point, and get the elevation of that point from the [Google Maps API](https://developers.google.com/maps/documentation/elevation/start).

Once all of the data has been collected, I save it in [globe.json](./globe.json), to be used in the actual application.

## Colors

An important feature of this project is that I wanted it to look good. Colors are often used to achieve that goal, and I wanted to make sure that it would be fairly easy to switch between different color schemes until I found one that I liked. I also wanted the color to be dependant on the elevation, as that is common for geographic maps / models.

I decided to use a color gradient from a [site](http://soliton.vm.bytemark.co.uk/pub/cpt-city/) which offered a wide variety of gradients to choose from. I then created [build_color_gradient.js](color_gradient/build_color_gradient.js) which builds the .c3g file into a nicer .json format. The gradient is then loaded into the application on startup, and applied to each triangle as needed.