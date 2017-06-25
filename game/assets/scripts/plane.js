var planeTexture = getTexture("plane.png", false);

var PLANE_SPEED = 0;

var plane = {};

function plane_init()
{
    PLANE_SPEED = TILE_SIZE * 5;
    plane = {
        position: new Vector2(),
        active: false,
        elapsed: 0
    };
}

function plane_spawn()
{
    plane.active = true;
    plane.position = cameraPos.add(new Vector2(-MAP_SIZE * TILE_SIZE, MAP_SIZE * TILE_SIZE));
    plane.elapsed = 0;
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
        if (plane.elapsed < 8)
        {
            plane.elapsed += dt;
            if (plane.elapsed >= 8)
            {
                playSound("plane.wav");
            }
        }
    }
    else
    {
        if (Random.randBool(dt * .01)) // 1 % chances per second, place every ~40 seconds
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
