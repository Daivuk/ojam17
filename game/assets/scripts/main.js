var resolution;

var renderables = [];

map_init();
camera_init();
sheep_init();
dog_init();

function update(dt)
{
    // Cache latest resolution each frame
    resolution = Renderer.getResolution();

    // Update entities

    // update dogs first so we can herb them the same frame
    dogs_update(dt);

    sheeps_update(dt);

    // Overlapping entities push each others again
    pushers_update(dt);

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
        SpriteBatch.drawRect(null, new Rect(sheep.position.x - 10, sheep.position.y + 14, 20 * sheep.hunger, 3), new Color(1 - sheep.hunger, sheep.hunger, 0));
    }

    // TEMP TEMP TEMP, draw dogs
    //dog_render();
    for (var i = 0; i < dogs.length; ++i)
    {
        var dog = dogs[i];
        SpriteBatch.drawSprite(null, dog.position, Color.BLACK, 0, 20);
    }

    SpriteBatch.end();
}
