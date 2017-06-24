var START_SHEEP = 20;

var SHEEP_SIZE = TILE_SIZE * 0.25;

var SHEEP_STATE_IDLE = 0;
var SHEEP_STATE_WAIT = 1;
var SHEEP_STATE_EATING = 2;
var SHEEP_STATE_WANDERING = 3;
var SHEEP_STATE_GO_EAT = 4;

var SHEEP_WANDER_SPEED = TILE_SIZE * 1;
var SHEEP_WAIT_TIMES = [1, 3];
var SHEEP_HUNGER_SPEED = 1 / 30;
var SHEEP_HUNGER_THRESHOLD = .5;
var SHEEP_EAT_SPEED = .25;
var SHEEP_EAT_VALUE = 3;

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
        size: SHEEP_SIZE,
        hunger: 1
    };

    return sheep;
}

function sheep_spawn()
{
    // Find a spot in the middle
    var tryPos = Random.randCircle(MAP_CENTER, TILE_SIZE * 1);
    var sheep = sheep_create(tryPos);
    sheeps.push(sheep);
    pushers.push(sheep);
    focussables.push(sheep);
}

function sheeps_update(dt)
{
    for (var i = 0; i < sheeps.length; ++i)
    {
        var sheep = sheeps[i];
        sheep_update(sheep, dt);
    }
}

// This is slow... Matt HELP
function sheep_findGrass(sheep)
{
    var mapPos = worldToMap(sheep.position);
    var SEARCH_RADIUS = 3;
    for (var depth = 0; depth <= SEARCH_RADIUS; ++depth)
    {
        var searchTiles = [];
        for (var i = -depth; i <= depth; ++i)
        {
            searchTiles.push(new Vector2(mapPos.x + i, mapPos.y));
        }
        for (var i = -depth + 1; i <= depth - 1; ++i)
        {
            searchTiles.push(new Vector2(mapPos.x, mapPos.y + i));
        }
        while (searchTiles.length)
        {
            var i = Random.randInt(searchTiles.length - 1);
            var tilePos = searchTiles[i];
            var grassAmount = map_getGrassAt(tilePos);
            if (grassAmount > 0)
            {
                sheep.targetPosition = mapToWorld(tilePos);
                sheep.state = SHEEP_STATE_GO_EAT;
                return;
            }
            searchTiles.splice(i, 1);
        }
    }
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
        return distance <= TILE_SIZE * .25;
    }
    return true;
}

function sheep_kill(sheep)
{
    sheep.dead = true;
    pushers.splice(pushers.indexOf(sheep), 1);
    focussables.splice(focussables.indexOf(sheep), 1);
    sheep.deadAlpha = new NumberAnim(1);
    sheep.deadAlpha.queue(0, 1, Tween.NONE);
    sheep.deadAlpha.queue(1, .15, Tween.NONE);
    sheep.deadAlpha.queue(0, .15, Tween.NONE);
    sheep.deadAlpha.queue(1, .15, Tween.NONE);
    sheep.deadAlpha.queue(0, .15, Tween.NONE);
    sheep.deadAlpha.queue(1, .15, Tween.NONE);
    sheep.deadAlpha.queue(0, .15, Tween.NONE, function()
    {
        sheeps.splice(sheeps.indexOf(sheep), 1);
    });
    sheep.deadAlpha.play();
}

function sheep_update(sheep, dt)
{
    if (sheep.dead)
    {
        return;
    }
    sheep.hunger -= dt * SHEEP_HUNGER_SPEED;
    if (sheep.hunger <= 0)
    {
        sheep_kill(sheep);
        return;
    }
    switch (sheep.state)
    {
        case SHEEP_STATE_IDLE:
            if (sheep.hunger < SHEEP_HUNGER_THRESHOLD)
            {
                // Must find grass, no more time to wander
                sheep_findGrass(sheep);
            }
            else if (Random.randBool(.25)) // 25% chances to go eat grass
            {
                sheep_findGrass(sheep);
            }
            else if (Random.randBool()) // 50% chances to wander (50% of 75%)
            {
                sheep_wander(sheep);
            }
            else // 50% chances to just wait (50% of 75%)
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
        case SHEEP_STATE_GO_EAT:
            if (sheep_moveToward(sheep, sheep.targetPosition, SHEEP_WANDER_SPEED, dt))
            {
                sheep.state = SHEEP_STATE_EATING;
            }
            break;
        case SHEEP_STATE_EATING:
            var sheepMapPos = worldToMap(sheep.position);
            grassValue = map_getGrassAt(sheepMapPos);
            if (grassValue <= 0)
            {
                // No more grass here, go back idle
                sheep.state = SHEEP_STATE_IDLE;
            }
            else
            {
                var eatValue = Math.min(grassValue, SHEEP_EAT_SPEED * dt);
                eatValue = Math.min(eatValue, (1 - sheep.hunger) * SHEEP_EAT_VALUE);
                grassValue -= eatValue;
                if (grassValue < 0) grassValue = 0;
                sheep.hunger += eatValue / SHEEP_EAT_VALUE;
                map_setGrassAt(sheepMapPos, grassValue);
            }
            break;
    }
}
