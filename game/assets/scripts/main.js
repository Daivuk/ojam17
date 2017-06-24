var resolution;

var renderables = [];

map_init();
camera_init();
sheep_init();
dog_init();

var ambSound = createSoundInstance("amb_medow_01.wav");
ambSound.setLoop(true);
ambSound.setVolume(.35);
ambSound.play();

function update(dt)
{
    // Cache latest resolution each frame
    resolution = Renderer.getResolution();

    //for (var i = 0; i < 30; ++i) // Turbo mode
    {
        // update dogs first so we can herb them the same frame
        dogs_update(dt);
        sheeps_update(dt);

        // Overlapping entities push each others again
        pushers_update(dt);

        // Update camera matrices
        camera_update(dt);
    }
}

function render()
{
    // Clear black just in case yo
    Renderer.clear(Color.BLACK);

    SpriteBatch.begin(cameraMatrix);
    SpriteBatch.setFilter(FilterMode.NEAREST);

    // Draw ground and grass first
    SpriteBatch.setBlend(BlendMode.OPAQUE);
    tiledMap.renderLayer(GROUND_LAYER);
    SpriteBatch.setBlend(BlendMode.PREMULTIPLIED);

    // Draw entities
    renderables.sort(function(a, b){return a.position.y < b.position.y ? -1 : 1});
    for (var i = 0; i < renderables.length; ++i)
    {
        var entity = renderables[i];
        entity.renderFn(entity);
    }

    SpriteBatch.end();

    SpriteBatch.begin();
    SpriteBatch.drawText(getFont("main.fntempty.fnt"), "Hello World", new Vector2(0, 0), Vector2.TOP_LEFT);
    SpriteBatch.end();
}
