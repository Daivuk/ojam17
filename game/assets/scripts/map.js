var GROUND_LAYER = 0;
var DETAILS_LAYER = 1;

var TILE_GRASS0 = 1;
var TILE_GRASS1 = 2;
var TILE_GRASS2 = 3;
var TILE_GRASS3 = 4;

var TILE_SIZE = 36;
var MAP_SIZE = 32;

var GROW_SPEED = 10;
var GRASS_MAX = 3;

var MAP_CENTER = new Vector2(MAP_SIZE * TILE_SIZE / 2, MAP_SIZE * TILE_SIZE / 2);

var tilesetTexture = getTexture("tileset.png", false);
var tiledMap = getTiledMap("map.tmx");
var grassLevel = [];

function map_init()
{
    for (var y = 0; y < MAP_SIZE; ++y)
    {
        grassLevel[y] = [];
        for (var x = 0; x < MAP_SIZE; ++x)
        {
            tiledMap.setTileAt(GROUND_LAYER, x, y, TILE_GRASS3);
            grassLevel[y][x] = GRASS_MAX;
        }
    }
}
