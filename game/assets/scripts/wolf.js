var WOLF_AMOUNT = 5; 
var WOLF_SIZE;
var WOLF_SPEED = 75; 

var WOLF_STATE_IDLE;
var WOLF_STATE_ATTACKING;
var WOLF_STATE_HUNTING;

var WOLF_STRESS_MIN = 0;
var WOLF_STRESS_MAX = 15;
var WOLF_STRESS_THRESHOLD = 10.0;
var WOLF_STRESS_RUN_SPEED = 2.0;
var WOLF_STRESS_RANGE_CONTRIB_PER_SECOND = 2.0;
var WOLF_STRESS_COOLDOWN_PER_SECOND = WOLF_STRESS_RANGE_CONTRIB_PER_SECOND * 0.15

var wolfs = [];
var wimperCoolDown = 0;

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
        stress: WOLF_STRESS_MIN,
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
    var wolfTryPos = Random.randCircle(MAP_CENTER, TILE_SIZE * MAP_SIZE)
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
    if (!sheep.dead && wolf.target.dead)
    {
        wolf.target = sheep; 
        return; 
    }
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
    wimperCoolDown -= dt;

    for (var i = 0; i < dogs.length; ++i) {
        var dog = dogs[i];

        var distance = Vector2.distance(wolf.position, dog.position);

          if (distance < TILE_SIZE * 1.6) {
            wolf.stress = Math.min(wolf.stress + (dog.fearFactor * WOLF_STRESS_RANGE_CONTRIB_PER_SECOND * dt), WOLF_STRESS_MAX);
            if (wolf.stress > WOLF_STRESS_THRESHOLD)
            {
                var factor = new Vector2(TILE_SIZE);
                wolf.targetPosition = wolf.position.add(factor.mul(wolf.position.sub(dog.position)));

                if (wimperCoolDown < 0)
                {
                    playSound("SFX_dog_wimper_" + Random.randInt(1, 2) + ".wav", 0.5);
                    wimperCoolDown = 5;
                }
            }
         }
    }

    if (wolf.stress < WOLF_STRESS_THRESHOLD)
    {
        for (var i = 0; i < sheeps.length; i++) 
        {
            wolf_targetAcquisition(wolf, sheeps[i]);
        }    
        wolf_moveToward(wolf, WOLF_SPEED, dt);
    }
    else
    {
        var dir = wolf.targetPosition.sub(wolf.position).normalize();
        wolf.position = wolf.position.add(dir.mul(WOLF_SPEED * dt));
        print("Wolf is stressed!"); 
    }
    wolf.stress = Math.max(wolf.stress-(WOLF_STRESS_COOLDOWN_PER_SECOND*dt), WOLF_STRESS_MIN);


}