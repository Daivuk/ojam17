var resolution;

function update(dt)
{
}

function render()
{
    // Cache latest resolution each frame
    resolution = Renderer.getResolution();

    // Clear black
    Renderer.clear(Color.BLACK);
}
