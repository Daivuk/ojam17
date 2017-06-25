var splats = [];
var splatTexture = getTexture("bloodsplat.png", false);

var SPLAT_DURATION = 60;
var SPLAT_SPEED = 1 / SPLAT_DURATION;

function splat_init()
{
    splats = [];
}

function splat_spawn(pos)
{
    var splat = {
        position: new Vector2(pos),
        size: Random.randNumber(TILE_SIZE * .5, TILE_SIZE * 2) / splatTexture.getSize().x,
        life: 1,
        angle: Random.randNumber(0, 360)
    };
    splats.push(splat);
}

function splat_update(dt)
{
    for (var i = 0; i < splats.length; ++i)
    {
        var splat = splats[i];
      //  splat.life -= SPLAT_SPEED * dt;
        if (splat.life <= 0)
        {
            splats.splice(i, 1);
            --i;
        }
    }
}

function splat_render()
{
    SpriteBatch.setBlend(BlendMode.MULTIPLY);
    for (var i = 0; i < splats.length; ++i)
    {
        var splat = splats[i];
        SpriteBatch.drawSprite(splatTexture, splat.position, new Color(splat.life * .5), splat.angle, splat.size);
    }
    SpriteBatch.setBlend(BlendMode.PREMULTIPLIED);
}
