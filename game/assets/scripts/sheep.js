var START_SHEEP = 20;

var SHEEP_SIZE;

// alive states
var SHEEP_STATE_IDLE = 0;
var SHEEP_STATE_WAIT = 1;
var SHEEP_STATE_EATING = 2;
var SHEEP_STATE_WANDERING = 3;
var SHEEP_STATE_GO_EAT = 4;

// death states
var SHEEP_STATE_DEAD = 100;
var SHEEP_STATE_DYING_FROM_WOLF = 101;
var SHEEP_STATE_DYING_FROM_HUNGER = 102

var SHEEP_WANDER_SPEED;
var SHEEP_WAIT_TIMES = [1, 3];
var SHEEP_HUNGER_SPEED = 1 / 30;
var SHEEP_HUNGER_THRESHOLD = .5;
var SHEEP_HUNGER_BUBBLE_THRESHOLD = .4;
var SHEEP_EAT_SPEED = .25;
var SHEEP_EAT_VALUE = 3;
var SHEEP_MOVE_TIMEOUT = 10;
var SHEEP_STRESS_MIN = 1;
var SHEEP_STRESS_MAX = 5;
var SHEEP_STRESS_THRESHOLD = 2.0;
var SHEEP_STRESS_RUN_SPEED = 2.0;
var SHEEP_STRESS_RANGE_CONTRIB_PER_SECOND = 5.0;
var SHEEP_STRESS_COOLDOWN_PER_SECOND = SHEEP_STRESS_RANGE_CONTRIB_PER_SECOND * 0.75;

var sheeps;

var hungryBubbleTexture = getTexture("hungryBubble.png", false);

function sheep_init()
{
    sheeps = []; 

    SHEEP_SIZE = TILE_SIZE * 0.25;
    SHEEP_WANDER_SPEED = TILE_SIZE * 1;

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
        hunger: 1,
        stress: SHEEP_STRESS_MIN,
        renderFn: sheep_render,
        bounceAnim: new NumberAnim(0),
        dir: "e"
    };

    sheep.spriteAnim = playSpriteAnim("sheep.spriteanim", "idle_e");

    return sheep;
}

function sheep_render(sheep)
{
    SpriteBatch.drawSpriteAnim(sheep.spriteAnim, sheep.position);

    if (sheep_isAlive(sheep) &&
        sheep.hunger < SHEEP_HUNGER_BUBBLE_THRESHOLD &&
        sheep.state != SHEEP_STATE_EATING) 
    {
        SpriteBatch.drawSprite(hungryBubbleTexture, new Vector2(
            sheep.position.x, sheep.position.y - 40));
    }

    //SpriteBatch.drawRect(null, new Rect(sheep.position.x - 10, sheep.position.y + 14, 20 * sheep.hunger, 3), new Color(1 - sheep.hunger, sheep.hunger, 0));
}

function sheep_spawn()
{
    // Find a spot in the middle
    var tryPos = Random.randCircle(MAP_CENTER, TILE_SIZE * 1);
    var sheep = sheep_create(tryPos);
    sheeps.push(sheep);
    pushers.push(sheep);
    focussables.push(sheep);
    renderables.push(sheep);
}

function sheeps_update(dt)
{
    beeeeeCoolDown -= dt;
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
            searchTiles.push(new Vector2(mapPos.x + i, mapPos.y - depth));
            searchTiles.push(new Vector2(mapPos.x + i, mapPos.y + depth));
        }
        for (var i = -depth + 1; i <= depth - 1; ++i)
        {
            searchTiles.push(new Vector2(mapPos.x - depth, mapPos.y + i));
            searchTiles.push(new Vector2(mapPos.x + depth, mapPos.y + i));
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
                sheep.moveTimeout = SHEEP_MOVE_TIMEOUT;
                return;
            }
            searchTiles.splice(i, 1);
        }
    }
}

var beeeeeCoolDown = 0;

function sheep_wander(sheep, dt)
{   
    var distance = Random.randNumber(TILE_SIZE / 2, TILE_SIZE);
    sheep.targetPosition = Random.randCircleEdge(sheep.position, distance);
    sheep.state = SHEEP_STATE_WANDERING;
    sheep.moveTimeout = SHEEP_MOVE_TIMEOUT;

    if (beeeeeCoolDown < 0)
    {
        playSound("SFX_sheep_bleat_" + Random.randInt(1, 13) + ".wav", .15);
        beeeeeCoolDown = 1;
    }
}

function sheep_isAlive(sheep)
{
    return sheep.state < 100; // death range starts at 100
}

function sheep_wait(sheep)
{
    sheep.waitTime = Random.randNumber(SHEEP_WAIT_TIMES[0], SHEEP_WAIT_TIMES[1]);
    sheep.state = SHEEP_STATE_WAIT;
}

function sheep_moveToward(sheep, targetPosition, speed, dt)
{
    sheep.running = true;

    if (sheep.position.x < targetPosition.x) sheep.dir = 'e';
    else if (sheep.position.x > targetPosition.x) sheep.dir = 'w';

    if (sheep.stress > SHEEP_STRESS_THRESHOLD)
    {
        speed*=SHEEP_STRESS_RUN_SPEED;
    }
    sheep.moveTimeout -= dt;
    if (sheep.moveTimeout < 0)
    {
        sheep.state = SHEEP_STATE_IDLE;
        return false;
    }

    if (!sheep.bounceAnim.isPlaying())
    {
        sheep.bounceAnim.queue(5, .15, Tween.EASE_OUT);
        sheep.bounceAnim.queue(0, .15, Tween.EASE_IN);
        sheep.bounceAnim.play();
    }

    var distance = Vector2.distance(targetPosition, sheep.position);
    if (distance > 0)
    {
        distance -= speed * dt;
        if (distance < 0) 
        {
            distance = 0;
            sheep.position = tiledMap.collision(sheep.position, targetPosition, sheep.size);
            return true;
        }
        var dir = targetPosition.sub(sheep.position).normalize();
        sheep.position = tiledMap.collision(sheep.position, sheep.position.add(dir.mul(speed * dt)), sheep.size);
        return distance <= TILE_SIZE * .25;
    }
    return true;
}

function sheep_attackedByWolf(sheep)
{
    sheep.state = SHEEP_STATE_DYING_FROM_WOLF;

    index = pushers.indexOf(sheep);
    if (index >= 0) pushers.splice(index, 1);

    sheep.spriteAnim.play("dying_" + sheep.dir);
}

function sheep_dyingFromHunger(sheep)
{
    sheep.state = SHEEP_STATE_DEAD;

    index = pushers.indexOf(sheep);
    if (index >= 0) pushers.splice(index, 1);

    sheep.spriteAnim.play("deadFromHunger_" + sheep.dir);
}

function sheep_kill_instantly(sheep)
{
    sheep.state = SHEEP_STATE_DEAD;

    var index;

    index = pushers.indexOf(sheep);
    if (index >= 0) pushers.splice(index, 1);

    index = focussables.indexOf(sheep);
    if (index >= 0) focussables.splice(index, 1);
/*
    index = renderables.indexOf(sheep);
    if (index >= 0) renderables.splice(index, 1);
*/
    defer(function()
    {
        var index = sheeps.indexOf(sheep);
        if (index >= 0) sheeps.splice(index, 1);
    });

    sheep.spriteAnim.play("dead_" + sheep.dir);
}

function sheep_kill(sheep)
{
    sheep.state = SHEEP_STATE_DEAD;

    var index;

    index = pushers.indexOf(sheep);
    if (index >= 0) pushers.splice(index, 1);

    index = focussables.indexOf(sheep);
    if (index >= 0) focussables.splice(index, 1);

    index = renderables.indexOf(sheep);
    if (index >= 0) renderables.splice(index, 1);

    defer(function()
    {
        var index = sheeps.indexOf(sheep);
        if (index >= 0) sheeps.splice(index, 1);
    });
}

function sheep_calculateStress(sheep, canine, dt) 
{
    var distance = Vector2.distance(sheep.position, canine.position);
    if (distance < TILE_SIZE * 1.6) {
        sheep.stress = Math.min(sheep.stress + (canine.fearFactor * SHEEP_STRESS_RANGE_CONTRIB_PER_SECOND * dt), SHEEP_STRESS_MAX);
        if (sheep.stress > SHEEP_STRESS_THRESHOLD)
        {
            sheep.targetPosition = sheep.position.add(sheep.position.sub(canine.position));

            if (beeeeeCoolDown < 0)
            {
                playSound("SFX_sheep_alarm_" + Random.randInt(1, 8) + ".wav", .25);
                beeeeeCoolDown = 1;
            }
        }
    }
}

function sheep_update(sheep, dt)
{
    if (!sheep_isAlive(sheep)) 
    {
        return;
    }
    sheep.running = false;
    sheep.hunger -= dt * SHEEP_HUNGER_SPEED;
    if (sheep.hunger <= 0)
    {
        sheep_dyingFromHunger(sheep);
        return;
    }

    for (var i = 0; i < dogs.length; ++i) {
        var dog = dogs[i];
        sheep_calculateStress(sheep, dog, dt); 
    }

    for (var i = 0; i < wolfs.length; ++i) {
        var wolf = wolfs[i];
        if (wolf.state == WOLF_STATE_ATTACKING)
            sheep_calculateStress(sheep, wolf, dt); 
    }

    if (sheep.stress > SHEEP_STRESS_THRESHOLD)
    {
        //print("SHEEP IS STRESSED OUT!!! " + sheep.stress);
        sheep.state = SHEEP_STATE_WANDERING;
    }
    sheep.stress = Math.max(sheep.stress-(SHEEP_STRESS_COOLDOWN_PER_SECOND*dt), SHEEP_STRESS_MIN);

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
                playSound("SFX_sheep_chew_" + Random.randInt(2, 16) + ".wav", .15);
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
                if (sheep.hunger >= .9)
                {
                    // Ate enough
                    sheep.state = SHEEP_STATE_IDLE;
                    break;
                }
            }
            break;
    }

    if (sheep.running)
    {
        if (sheep.stress > SHEEP_STRESS_THRESHOLD)
        {
            sheep.spriteAnim.play("scared_" + sheep.dir);
        }
        else
        {
            sheep.spriteAnim.play("run_" + sheep.dir);
        }
    }
    else if (sheep.state == SHEEP_STATE_EATING)
    {
        sheep.spriteAnim.play("eat_" + sheep.dir);
    }
    else
    {
        sheep.spriteAnim.play("idle_" + sheep.dir);
    }
}
