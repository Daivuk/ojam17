var GROUND_LAYER = 0;
var DETAILS_LAYER = 1;

var TILE_GRASS0 = 1;
var TILE_GRASS1 = 2;
var TILE_GRASS2 = 3;
var TILE_GRASS3 = 4;

function map_init()
{
    tiledMap.addTileSet(getTexture("tileset.png", false));
    tiledMap.addLayer("ground");
    for (var y = 0; y < TILE_SIZE; ++y)
    {
        for (var x = 0; x < TILE_SIZE; ++x)
        {
            tiledMap.setTileAt(GROUND_LAYER, x, y, Random.randInt(TILE_GRASS0, TILE_GRASS3));
        }
    }
}
