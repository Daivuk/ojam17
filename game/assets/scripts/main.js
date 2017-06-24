var resolution;

var dogs = [];

var renderables = [];

map_init();
camera_init();
sheep_init();

function update(dt)
{
    // Cache latest resolution each frame
    resolution = Renderer.getResolution();

    for (var i = 0; i < sheeps.length; ++i)
    {
        var sheep = sheeps[i];
        sheep_update(sheep, dt);
    }

    // Update camera matrices
    camera_update(dt);
}

function render()
{
    // Clear black just in case yo
    Renderer.clear(Color.BLACK);

    SpriteBatch.begin(cameraMatrix);

    // Draw ground and grass first
    tiledMap.renderLayer(GROUND_LAYER);

    // TEMP TEMP TEMP, draw sheeps
    for (var i = 0; i < sheeps.length; ++i)
    {
        var sheep = sheeps[i];
        SpriteBatch.drawSprite(null, sheep.position, Color.WHITE, 0, 20);
    }

    SpriteBatch.end();
}
