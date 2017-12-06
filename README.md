# Low-Poly Earth

This is a low polygon count rendering of the earth. I created it using THREE.js / WebGL, with elevation data from the Google Maps API.

## Building the data

The first step in this project was to retrieve elevation data so that I could have something to display. I wanted to do this separately from the rendering, because if this was done before the client even loaded the page, that would mean they would not have to wait for it. 

To that end, I run [build.js](./dev/build.js) using node.js. First I create an [icosphere](https://en.wikipedia.org/wiki/Icosphere), at a specific level of recursion, using [icosphere.js](./src/icosphere.js). I then collect each point on the icosphere, figure out the latitude and longitude coordinates of the point, and get the elevation of that point from the [Google Maps API](https://developers.google.com/maps/documentation/elevation/start).

Once all of the data has been collected, I save it in elevation.dat, to be used in the actual application.

### Elevation Data

The elevation data is stored in the following format:

| Format | Description                        |
| ------ | ---------------------------------- |
| int16  | recursion level                    |
| int16  | elevation for 1<sup>st</sup> point |
| int16  | elevation for 2<sup>nd</sup> point |
| int16  | elevation for 3<sup>rd</sup> point |
| ...    | ...                                |
| int16  | elevation for n<sup>th</sup> point |

For an explanation of this format and a history showing how I brought the size of my elevation data file from  12.1 MB all the way down to 81 KB, check out my [Elevation Data History](./elevation_history.md) document.

## Colors

An important feature of this project is that I wanted it to look good. Colors are often used to achieve that goal, and I wanted to make sure that it would be fairly easy to switch between different color schemes until I found one that I liked. I also wanted the color to be dependant on the elevation, as that is common for geographic maps / models.

I decided to use a color gradient from a [site](http://soliton.vm.bytemark.co.uk/pub/cpt-city/) which offered a wide variety of gradients to choose from. I downloaded a few of the gradients I found there, and made it configurable so you could choose which one to use.