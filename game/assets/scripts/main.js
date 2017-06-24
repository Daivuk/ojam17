var resolution;

var TILE_SIZE = 36;
var MAP_SIZE = 64;

var sheeps = [];
var dogs = [];
var tiledMap = TiledMap.create(MAP_SIZE, MAP_SIZE, TILE_SIZE);

var cameraPos = new Vector2(MAP_SIZE * TILE_SIZE / 2, MAP_SIZE * TILE_SIZE / 2);
var cameraZoom = 2;
var cameraMatrix = new Matrix();
var invCameraMatrix = new Matrix();
var targetCameraPos = new Vector2(cameraPos);

map_init();

function updateCamera(dt)
{
    cameraMatrix = new Matrix();
    cameraMatrix = cameraMatrix.mul(Matrix.createTranslation(new Vector3(resolution.x / 2, resolution.y / 2)));
    cameraMatrix = cameraMatrix.mul(Matrix.createScale(cameraZoom));
    cameraMatrix = cameraMatrix.mul(Matrix.createTranslation(new Vector3(-cameraPos.x, -cameraPos.y, 0)));
    invCameraMatrix = cameraMatrix.invert();
}

function update(dt)
{
    // Cache latest resolution each frame
    resolution = Renderer.getResolution();

    // Update camera matrices
    updateCamera(dt);
}

function render()
{
    // Clear black just in case yo
    Renderer.clear(Color.BLACK);

    SpriteBatch.begin(cameraMatrix);

    // Draw ground and grass first
    tiledMap.renderLayer(GROUND_LAYER);

    SpriteBatch.end();
}
