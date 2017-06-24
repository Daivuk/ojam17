var WOLF_AMOUNT = 5; 

var WOLF_STATE_IDLE;
var WOLF_STATE_ATTACKING;
var WOLF_STATE_RUNNING;

var wolfs = [];

function wolf_init() 
{
    for (var i = 0; i < WOLF_AMOUNT; i++)
    {
        wolf_spawn();
    }
}

function wolf_create(wolfPos)
{
    var wolf = {
        position: new Vector2(wolfPos),
        state: WOLF_STATE_IDLE,
        renderFn: wolf_render,
    };

    return wolf; 
}

function wolf_render(wolf) 
{
   SpriteBatch.drawSprite(null, wolf.position, Color.BLACK, 0, 20); 
}

function wolf_spawn() 
{
    var wolfTryPos = Random.randCircle(MAP_CENTER, TILE_SIZE * 3)
    var wolf = wolf_create(wolfTryPos)
    focussables.push(wolf);
    renderables.push(wolf);

}

function wolfs_update(dt)
{
    for (var i = 0; i < wolfs.length; ++i)
    {
        var wolf = wolfs[i];
        wolf_update(wolf, dt);
    }
}

function wolf_update(wolf, dt)
{

}