var GROUND_LAYER = 0;
var DETAILS_LAYER = 1;

var TILE_GRASS0 = 1;
var TILE_GRASS1 = 2;
var TILE_GRASS2 = 3;
var TILE_GRASS3 = 4;
var TILE_GRASS3_2 = 10;
var TILE_GRASS3_3 = 11;

var tiledMap;

var TILE_SIZE;
var MAP_SIZE;
var INV_TILE_SIZE;
var HALF_TILE_SIZE;
var MAP_CENTER;

var GROW_SPEED = 10;
var GRASS_MAX = 3;

var grassLevel;

function map_init()
{
    // Load map
    tiledMap = getFreshTiledMap("map.tmx");

    grassLevel = [];

    // Set constants
    TILE_SIZE = tiledMap.getTileSize();
    MAP_SIZE = tiledMap.getSize().x;
    INV_TILE_SIZE = 1 / TILE_SIZE;
    HALF_TILE_SIZE = TILE_SIZE / 2;
    MAP_CENTER = new Vector2(MAP_SIZE * TILE_SIZE / 2, MAP_SIZE * TILE_SIZE / 2);

    // Set grass amounts
    for (var y = 0; y < MAP_SIZE; ++y)
    {
        grassLevel[y] = [];
        for (var x = 0; x < MAP_SIZE; ++x)
        {
            var val = tiledMap.getTileAt(GROUND_LAYER, x, y);
            if (val == TILE_GRASS0)
                grassLevel[y][x] = 0;
            else if (val == TILE_GRASS1)
                grassLevel[y][x] = 1;
            else if (val == TILE_GRASS2)
                grassLevel[y][x] = 2;
            else if (val == TILE_GRASS3 ||
                val == TILE_GRASS3_2 ||
                val == TILE_GRASS3_3)
                grassLevel[y][x] = 3;
            else
                grassLevel[y][x] = 0;
        }
    }
}

function worldToMap(world)
{
    return new Vector2(Math.floor(world.x * INV_TILE_SIZE), Math.floor(world.y * INV_TILE_SIZE));
}

function mapToWorld(map)
{
    return new Vector2(map.x * TILE_SIZE + HALF_TILE_SIZE, map.y * TILE_SIZE + HALF_TILE_SIZE);
}

function map_getGrassAt(mapPos)
{
    if (mapPos.x < 0 || mapPos.y < 0 || mapPos.x >= MAP_SIZE || mapPos.y >= MAP_SIZE) return 0;
    return grassLevel[mapPos.y][mapPos.x];
}

function map_setGrassAt(mapPos, value)
{
    if (mapPos.x < 0 || mapPos.y < 0 || mapPos.x >= MAP_SIZE || mapPos.y >= MAP_SIZE) return;
    grassLevel[mapPos.y][mapPos.x] = value;
    if (value <= 0) tiledMap.setTileAt(GROUND_LAYER, mapPos.x, mapPos.y, TILE_GRASS0);
    else if (value <= 1) tiledMap.setTileAt(GROUND_LAYER, mapPos.x, mapPos.y, TILE_GRASS1);
    else if (value <= 2) tiledMap.setTileAt(GROUND_LAYER, mapPos.x, mapPos.y, TILE_GRASS2);
    else if (value <= 3) tiledMap.setTileAt(GROUND_LAYER, mapPos.x, mapPos.y, TILE_GRASS3);
}
