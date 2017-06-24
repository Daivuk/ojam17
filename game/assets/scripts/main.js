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
    SpriteBatch.setBlend(BlendMode.OPAQUE);
    tiledMap.renderLayer(GROUND_LAYER);
    SpriteBatch.setBlend(BlendMode.ALPHA);

    // Draw entities
    renderables.sort(function(a, b){return a.position.y < b.position.y ? -1 : 1});
    for (var i = 0; i < renderables.length; ++i)
    {
        var entity = renderables[i];
        entity.renderFn(entity);
    }

    SpriteBatch.end();
}
