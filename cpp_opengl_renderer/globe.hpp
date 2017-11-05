#include "structs.hpp"

int globe_locations_count = 12;
int globe_triangles_count = 20;

struct location globe_locations[] = {
	{ 58.282525588538995, -90, -99.8140640258789 },
	{ 58.282525588538995, 90, 153.5678100585938 },
	{ -58.282525588538995, -90, -4170.91796875 },
	{ -58.282525588538995, 90, -4515.16552734375 },
	{ -31.717474411461005, 0, -4417.39208984375 },
	{ 31.717474411461005, 0, 758.5527954101562 },
	{ -31.717474411461005, -180, -2986.602294921875 },
	{ 31.717474411461005, -180, -4984.673828125 },
	{ 0, 121.71747441146098, -630.9949951171875 },
	{ 0, 58.282525588538995, -4683.64794921875 },
	{ 0, -121.717474411461, -4354.22119140625 },
	{ 0, -58.282525588538995, 230.7387542724609 }
};

struct triangle globe_triangles[] = {
	{ 0, 11, 5 },
	{ 0, 5, 1 },
	{ 0, 1, 7 },
	{ 0, 7, 10 },
	{ 0, 10, 11 },
	{ 1, 5, 9 },
	{ 5, 11, 4 },
	{ 11, 10, 2 },
	{ 10, 7, 6 },
	{ 7, 1, 8 },
	{ 3, 9, 4 },
	{ 3, 4, 2 },
	{ 3, 2, 6 },
	{ 3, 6, 8 },
	{ 3, 8, 9 },
	{ 4, 9, 5 },
	{ 2, 4, 11 },
	{ 6, 2, 10 },
	{ 8, 6, 7 },
	{ 9, 8, 1 }
};