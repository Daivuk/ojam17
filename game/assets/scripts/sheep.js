var START_SHEEP = 20;

var SHEEP_SIZE = TILE_SIZE * 0.25;

var SHEEP_STATE_IDLE = 0;
var SHEEP_STATE_WAIT = 1;
var SHEEP_STATE_EATING = 2;
var SHEEP_STATE_WANDERING = 3;

var SHEEP_WANDER_SPEED = TILE_SIZE * 1;
var SHEEP_WAIT_TIMES = [1, 3];

var sheeps = [];

function sheep_init()
{
    for (var i = 0; i < START_SHEEP; ++i)
    {
        sheep_spawn();
    }
}

function sheep_create(pos)
{
    var sheep = {
        position: new Vector2(pos),
        state: SHEEP_STATE_IDLE,
        size: SHEEP_SIZE
    };

    return sheep;
}

function sheep_spawn()
{
    // Find a spot in the middle
    while (true)
    {
        var tryPos = Random.randCircle(MAP_CENTER, TILE_SIZE * 1);

        // Loop other sheeps to make sure none in the way
     /*   for (var i = 0; i < sheeps.length; ++i)
        {
            var otherSheep = sheeps[i];
            var distance = Vector2.distanceSquared(tryPos, otherSheep.position);
            if (distance <= 16 * 16)
            {
                break;
            }
        }

        if (i == sheeps.length)
        {*/
            // Good
            var sheep = sheep_create(tryPos);
            sheeps.push(sheep);
            pushers.push(sheep);
            break;
     //   }
    }
}

function sheeps_update(dt)
{
    for (var i = 0; i < sheeps.length; ++i)
    {
        var sheep = sheeps[i];
        sheep_update(sheep, dt);
    }
}

function sheep_findGrass(sheep)
{
}

function sheep_wander(sheep)
{
    var distance = Random.randNumber(TILE_SIZE / 2, TILE_SIZE);
    sheep.targetPosition = Random.randCircleEdge(sheep.position, distance);
    sheep.state = SHEEP_STATE_WANDERING;
}

function sheep_wait(sheep)
{
    sheep.waitTime = Random.randNumber(SHEEP_WAIT_TIMES[0], SHEEP_WAIT_TIMES[1]);
    sheep.state = SHEEP_STATE_WAIT;
}

function sheep_moveToward(sheep, targetPosition, speed, dt)
{
    var distance = Vector2.distance(targetPosition, sheep.position);
    if (distance > 0)
    {
        distance -= speed * dt;
        if (distance < 0) 
        {
            distance = 0;
            sheep.position = new Vector2(targetPosition);
            return true;
        }
        var dir = targetPosition.sub(sheep.position).normalize();
        sheep.position = sheep.position.add(dir.mul(speed * dt));
        return false;
    }
    return true;
}

function sheep_update(sheep, dt)
{
    switch (sheep.state)
    {
        case SHEEP_STATE_IDLE:
            if (Random.randBool())
            {
                sheep_findGrass(sheep);
            }
            else if (Random.randBool())
            {
                sheep_wander(sheep);
            }
            else
            {
                sheep_wait(sheep);
            }
            break;
        case SHEEP_STATE_WANDERING:
            if (sheep_moveToward(sheep, sheep.targetPosition, SHEEP_WANDER_SPEED, dt))
            {
                sheep.state = SHEEP_STATE_IDLE;
            }
            break;
        case SHEEP_STATE_WAIT:
            sheep.waitTime -= dt;
            if (sheep.waitTime <= 0)
            {
                sheep.state = SHEEP_STATE_IDLE;
            }
            break;
    }
}
