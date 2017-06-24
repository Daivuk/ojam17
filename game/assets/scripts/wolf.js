var WOLF_AMOUNT = 5; 
var WOLF_SIZE;
var WOLF_SPEED = 75; 

var WOLF_STATE_IDLE;
var WOLF_STATE_ATTACKING;
var WOLF_STATE_HUNTING;

var wolfs = [];

function wolf_init() 
{
WOLF_SIZE = TILE_SIZE * 0.25; 

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
        size: WOLF_SIZE,
        target: sheeps[0],
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
    var wolfTryPos = Random.randCircle(MAP_CENTER, TILE_SIZE * 15)
    var wolf = wolf_create(wolfTryPos)
    wolfs.push(wolf);
    pushers.push(wolf);
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

function wolf_targetAcquisition(wolf, sheep)
{
    var distance = Vector2.distance(sheep.position, wolf.position);
    var currentTargetDistance = Vector2.distance(wolf.target.position, wolf.position);
    if (currentTargetDistance > distance)
    {
        wolf.target = sheep;
    }
}

function wolf_moveToward(wolf, speed, dt)
{
    var distance = Vector2.distance(wolf.target.position, wolf.position);
    if (distance > 0)
    {
        // use this block instead if you want collision on the wolves
        // distance -= speed * dt;
        // if (distance < 0) 
        // {
        //     distance = 0;
        //     wolf.position = tiledMap.collision(wolf.position, wolf.target.position, wolf.size);
        //     return true;
        // }
        // var dir = wolf.target.position.sub(wolf.position).normalize();
        // wolf.position = tiledMap.collision(wolf.position, wolf.position.add(dir.mul(speed * dt)), wolf.size);
        // return distance <= TILE_SIZE * .25;

        var dir = wolf.target.position.sub(wolf.position).normalize();
        wolf.position = wolf.position.add(dir.mul(speed * dt));
    }
    return true;
}

function wolf_update(wolf, dt)
{
    for (var i = 0; i < sheeps.length; i++) 
    {
        wolf_targetAcquisition(wolf, sheeps[i]);
    }    
    wolf_moveToward(wolf, WOLF_SPEED, dt);
}