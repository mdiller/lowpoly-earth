# Elevation Data History

This is the history of my storage of the elevation data for this project.

All the sizes listed below are for when the file is generated with an icosphere with a subdivision level of 6.

## globe.json (12.1 MB)

As a lover of json, my first instict was to dump the globe object that i created in my [build script](dev/build.js) directly into a json file. The file looked like this:

```json
{
	"points": [
		
	],
	"triangles": [

	]
}
```

Where each point in the list of points was represented like this:

```json
{
	"x": "<x position>",
	"y": "<y position>",
	"z": "<z position>",
	"latitude": "<latitude value>",
	"longitude": "<longitude value>",
	"elevation": "<elevation value>"
}
```

and each triangle in the list of triangles was represented like this:

```json
{
	"p1": "<index of the 1st point>",
	"p2": "<index of the 2nd point>",
	"p3": "<index of the 3rd point>"
}
```

This was of course very inefficient, and I soon realized that 12.1 MB is far too big for a web application, and I really should try to make it quite a bit smaller.

## globe.dat (1.4 MB)

I decided to serialize the data as bytes in a simple .dat format, which holds the same data, but is only 1.4 MB. The idea was that this would read much the same as the globe.json, but would be stored much more efficiently.

I started by making a header which looked like this:

| Format  | Description         |
| ------- | -------------       |
| 8 bytes | the string GLOBEDAT |
| uint32  | number of points    |
| uint32  | number of triangles |

Then, each point was represented in a format like this:

| Format | Field     |
| ------ | --------- |
| float  | x         |
| float  | y         |
| float  | z         |
| float  | latitude  |
| float  | longitude |
| float  | elevation |

and each triangle was represented in a format like this:

| Format | Field |
| ------ | ----- |
| uint16 | p1    |
| uint16 | p2    |
| uint16 | p3    |

This approach managed to bring the file size down to 1.4 MB, which improves on the last size by reducing it by a magnitude of about 9. This satisfied me for the time being, but it was not long before my thirst for efficiency urged me to reduce the file size even more.

## elevation.dat (81 KB)

My final approach resulted in a very simple file, because I realized that I didn't need to store all of the data. The main reason I wanted to create a file to store this data instead of including it in the application is that polling the google maps api for the elevation data takes a long time. The key part of that is that the only data I really need to store is the elevation data. The rest of the data for the icosphere can be generated very easily by running the [icosphere script](src/icosphere.js). With that in mind, I set out to create my new data format.

You may have noticed that since the triangles of the icosphere are referencing the indexes of the points, they must be ordered in a very particular way. This means that if I order my elevation data in that same exact way, whoever is reading the file will be able to know which point each elevation corresponds to, as it is in the same order. This fact resulted in a very simple format, which looked like this:

| Format | Description                        |
| ------ | ---------------------------------- |
| int16  | subdivisions                       |
| int16  | elevation for 1<sup>st</sup> point |
| int16  | elevation for 2<sup>nd</sup> point |
| int16  | elevation for 3<sup>rd</sup> point |
| ...    | ...                                |
| int16  | elevation for n<sup>th</sup> point |

The reason this works is because the number of subdivisions is directly related to the number of points of an icosphere, via the equation <code>n = 12 × 5<sup>s</sup></code> where `n` is the number of points, and `s` is the number of subdivisions.

I am just about able to use int16s to represent elevation on land, because maximum value of an int16 is 32,767, and the highest point on earth (Mt. Everest) is about 29,029 feet above sea level. However, the lowest value of a uint16 is -32,768, which is just a bit too high for the lowest elevation on earth (The Mariana Trench) measured at 36,070 feet below sea level. This means that a uint16 is *just barely* not big enough to store elevation data for every point on earth. Because it is so close, I made the decision that a difference of ~3,300 feet of depth at one point in the ocean floor is not enough to matter on my low-poly earth, especially since we have a subdivision level of only 6.

This final format brought the file size down to 81 KB, which is an improvement on the original file size by a magniude of about 150. I am quite happy with this file size, and I think that this is the smallest I can get the file to be without throwing away elevation precision.

The only way that I could bring the file size to be smaller than this is if I used a smaller format than an int16. This would mean that I would either be using a byte for each elevation point, or a some hacky solution where I store the data in non-standard sized chunks. If we use bytes, that would give us a range of -128 to 128, meaning we would have to scale each elevation point down by a factor of about 280, meaning that the data would not be very precise. 