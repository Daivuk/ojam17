var GROUND_LAYER = 0;
var DETAILS_LAYER = 1;

var TILE_GRASS0 = 1;
var TILE_GRASS1 = 2;
var TILE_GRASS2 = 3;
var TILE_GRASS3 = 4;

//var tilesetTexture = getTexture("tileset.png", false); // This ensures the texture will be cached without mipmaps
var tiledMap = getTiledMap("map.tmx");

var TILE_SIZE = tiledMap.getTileSize();
var MAP_SIZE = tiledMap.getSize().x;
var INV_TILE_SIZE = 1 / TILE_SIZE;
var HALF_TILE_SIZE = TILE_SIZE / 2;

var MAP_CENTER = new Vector2(MAP_SIZE * TILE_SIZE / 2, MAP_SIZE * TILE_SIZE / 2);

var GROW_SPEED = 10;
var GRASS_MAX = 3;

var grassLevel = [];

function map_init()
{
    for (var y = 0; y < MAP_SIZE; ++y)
    {
        grassLevel[y] = [];
        for (var x = 0; x < MAP_SIZE; ++x)
        {
            grassLevel[y][x] = GRASS_MAX;
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
