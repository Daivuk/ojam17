var planeTexture = getTexture("plane.png", false);

var PLANE_SPEED = 0;

var plane = {};

function plane_init()
{
    PLANE_SPEED = TILE_SIZE * 5;
    plane = {
        position: new Vector2(),
        active: false,
    };
}

function plane_spawn()
{
    plane.active = true;
    plane.position = cameraPos.add(new Vector2(-MAP_SIZE * TILE_SIZE, MAP_SIZE * TILE_SIZE));
    setTimeout(function()
    {
        playSound("plane.wav");
    }, 8000);
}

function plane_update(dt)
{
    if (plane.active)
    {
        plane.position = plane.position.add(new Vector2(PLANE_SPEED * dt, -PLANE_SPEED * dt));
        if (plane.position.y < -MAP_SIZE * TILE_SIZE)
        {
            plane.active = false;
        }
    }
    else
    {
        if (Random.randBool(dt * .025)) // 2,5 % chances per second, place every ~40 seconds
        {
            plane_spawn();
        }
    }
}

function plane_render()
{
    if (plane.active)
    {
        SpriteBatch.drawSprite(planeTexture, plane.position, new Color(.25), 0, 3);
    }
}
