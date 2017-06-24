var START_SHEEP = 20;

var SHEEP_STATE_IDLE = 0;
var SHEEP_STATE_EATING = 1;
var SHEEP_STATE_WANDERING = 2;

var SHEEP_WANDER_SPEED = TILE_SIZE * 0.5;

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
        eatingTime: 0
    };

    return sheep;
}

function sheep_spawn()
{
    // Find a spot in the middle
    while (true)
    {
        var tryPos = Random.randCircle(MAP_CENTER, TILE_SIZE * 3);

        // Loop other sheeps to make sure none in the way
        for (var i = 0; i < sheeps.length; ++i)
        {
            var otherSheep = sheeps[i];
            var distance = Vector2.distanceSquared(tryPos, otherSheep.position);
            if (distance <= 16 * 16)
            {
                break;
            }
        }

        if (i == sheeps.length)
        {
            // Good
            sheeps.push(sheep_create(tryPos));
            break;
        }
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

function sheep_update(sheep, dt)
{
    switch (sheep.state)
    {
        case SHEEP_STATE_IDLE:
         /*   if (Random.randBool())
            {
                sheep_findGrass(sheep);
            }
            else*/
            {
                sheep_wander(sheep);
            }
            break;
        case SHEEP_STATE_WANDERING:
            sheep_moveToward(sheep, sheep.targetPosition);
            break;
    }
}
