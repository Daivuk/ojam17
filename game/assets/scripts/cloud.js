var CLOUD_COUNT = 20;
var WIND_DIRECTION = new Vector2(1, -.7);
var CLOUD_COLOR = new Color(.15);
var CLOUD_SPEED = 0;

var cloudTexture = getTexture("cloud.png");

var clouds = [];

function cloud_init()
{
    clouds = [];
    CLOUD_SPEED = TILE_SIZE;
    for (var i = 0; i < CLOUD_COUNT; ++i)
    {
        var cloud = {
            position: Random.randVector2(new Vector2(-MAP_SIZE * TILE_SIZE, 0), new Vector2(MAP_SIZE * TILE_SIZE, MAP_SIZE * TILE_SIZE * 2)),
            speed: CLOUD_SPEED + Random.randNumber(-CLOUD_SPEED * .1, CLOUD_SPEED * .1)
        };
        clouds.push(cloud);
    }
}

function clouds_update(dt)
{
    for (var i = 0; i < clouds.length; ++i)
    {
        var cloud = clouds[i];
        cloud.position = cloud.position.add(WIND_DIRECTION.mul(dt * cloud.speed));
        if (cloud.position.x > MAP_SIZE * TILE_SIZE * 2 ||
            cloud.position.y < -MAP_SIZE * TILE_SIZE)
        {
            cloud.position = Random.randVector2(
                new Vector2(-MAP_SIZE * TILE_SIZE, MAP_SIZE * TILE_SIZE), 
                new Vector2(0, MAP_SIZE * TILE_SIZE * 2));
        }
    }
}

function clouds_render()
{
    for (var i = 0; i < clouds.length; ++i)
    {
        var cloud = clouds[i];
        SpriteBatch.drawSprite(cloudTexture, cloud.position, CLOUD_COLOR, 0, 6);
    }
}
