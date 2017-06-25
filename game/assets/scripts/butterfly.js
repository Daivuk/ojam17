var MAX_BUTTERFLIES = 50;
var BUTTERFLY_SPEED = 20;
var BUTTERFLY_CHANGE_POS_TIMOUT = 0.5;

var butterflies = [];

function butterfly_init()
{
    butterflies = [];
    for (var i = 0; i < MAX_BUTTERFLIES; ++i)
    {
        var butterfly = {
            position: Random.randVector2(
                new Vector2(TILE_SIZE * 5), new Vector2((MAP_SIZE - 5) * TILE_SIZE)),
            spriteAnim: playSpriteAnim("butterfly.spriteanim", "fly", i),
            renderFn: butterfly_render,
            direction: Vector2.ZERO,
            changeDirTimeout: Random.randNumber(BUTTERFLY_CHANGE_POS_TIMOUT)
        };
        butterfly.startPosition = butterfly.position;
        butterflies.push(butterfly);
        renderables.push(butterfly);
    }
}

function butterflies_update(dt)
{
    for (var i = 0; i < butterflies.length; ++i)
    {
        var butterfly = butterflies[i];
        butterfly.changeDirTimeout -= dt;
        if (butterfly.changeDirTimeout <= 0)
        {
            butterfly.changeDirTimeout = BUTTERFLY_CHANGE_POS_TIMOUT;
            butterfly.direction = Random.randCircle(Vector2.ZERO, 1);
        }
        butterfly.position = butterfly.position.add(butterfly.direction.mul(dt * BUTTERFLY_SPEED));
    }
}

function butterfly_render(butterfly)
{
    SpriteBatch.drawSpriteAnim(butterfly.spriteAnim, butterfly.position, Color.WHITE, 0, 1.5);
}
