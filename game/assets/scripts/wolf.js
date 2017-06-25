var WOLF_AMOUNT = 1;
var WOLF_SIZE;
var WOLF_SPEED = 75; 

var WOLF_STATE_ATTACKING = 1;
var WOLF_STATE_HUNTING = 2;
var WOLF_STATE_RETREAT = 3;

var WOLF_EATING_TIME = 3000;
var KILL_DISTANCE;

var WOLF_SPAWN_DISTANCE;
var WOLF_SPAWN_TIME = 3;
var WOLF_WIMP_COOLDOWN_RESET = 2;
var WOLF_STRESS_MIN = 0;
var WOLF_STRESS_MAX = 15;
var WOLF_STRESS_THRESHOLD = 10.0;
var WOLF_STRESS_RUN_SPEED = 150;
var WOLF_STRESS_DOG_PROXIMITY_RANGE;
var WOLF_STRESS_RANGE_CONTRIB_PER_SECOND = 2.0;
var WOLF_STRESS_COOLDOWN_PER_SECOND = WOLF_STRESS_RANGE_CONTRIB_PER_SECOND * 0.15

var wolfs;
var wolfNextRespawn = WOLF_SPAWN_TIME;

function wolf_init() 
{
    wolfs = []; 
    WOLF_SPEED = 75;
    WOLF_SIZE = TILE_SIZE * 0.25; 
    KILL_DISTANCE = SHEEP_SIZE * 3.0; 
    WOLF_SPAWN_DISTANCE = TILE_SIZE * MAP_SIZE * 0.5;
    WOLF_STRESS_DOG_PROXIMITY_RANGE = DOG_SIZE * 4.0;

    for (var i = 0; i < WOLF_AMOUNT; i++)
    {
        wolf_spawn();
    }
}

function wolf_create(wolfPos)
{
    var wolf = {
        dir: 'e',
        position: new Vector2(wolfPos),
        state: WOLF_STATE_HUNTING,
        size: WOLF_SIZE,
        stress: WOLF_STRESS_MIN,
        target: null,
        retreatPosition: new Vector2(0,0),
        wimperCoolDown: 0,
        renderFn: wolf_render,
        fearFactor: 10
    };
    

    wolf.spriteAnim = playSpriteAnim("wolf.spriteanim", "run_e");

    return wolf; 
}

function wolf_render(wolf) 
{
//    SpriteBatch.drawSprite(null, wolf.position, Color.BLACK, 0, 20); 
    SpriteBatch.drawSpriteAnim(wolf.spriteAnim, wolf.position);
}

function wolf_spawn() 
{
    var wolfTryPos = Random.randCircleEdge(MAP_CENTER, WOLF_SPAWN_DISTANCE);
    var wolf = wolf_create(wolfTryPos)
    wolfs.push(wolf);
    pushers.push(wolf);
    renderables.push(wolf);
}

function wolfs_update(dt)
{
    if (sheeps.length > 0)
    {
        wolfNextRespawn -= dt;
        if (wolfNextRespawn < 0)
        {
            wolf_spawn();
            wolfNextRespawn = WOLF_SPAWN_TIME; 
        }
    }
    for (var i = 0; i < wolfs.length; ++i)
    {
        var wolf = wolfs[i];
        wolf_update(wolf, dt);
    }
}

function wolf_targetAcquisition(wolf, sheep)
{
    if (!sheep || !sheep_isAlive(sheep)) return;
    if (!wolf.target)
    {
        wolf.target = sheep;
        return;
    }

    var distance = Vector2.distance(sheep.position, wolf.position);
    var currentTargetDistance = Vector2.distance(wolf.target.position, wolf.position);
    if (distance < currentTargetDistance)
    {
        wolf.target = sheep;
    }
}

function wolf_moveToward(wolf, targetPosition, speed, dt)
{
    var distance = Vector2.distance(targetPosition, wolf.position);
    if (distance > 0)
    {
        distance -= speed * dt;
        if (distance < 0) 
        {
            distance = 0;
            wolf.position = targetPosition;
            return true;
        }
        var dir = targetPosition.sub(wolf.position).normalize();
        wolf.position = wolf.position.add(dir.mul(speed * dt));
        if (dir.x > .1) wolf.spriteAnim.play("run_e");
        else if (dir.x < -.1) wolf.spriteAnim.play("run_w");
    }
    return true;
}

function wolf_calculateStress(wolf, dt) 
{
    for (var i = 0; i < dogs.length; ++i) 
    {
        var dog = dogs[i];

        var distance = Vector2.distance(wolf.position, dog.position);

        // barking dogs only stress the wolves if the dog is close enough.
        if (distance <= WOLF_STRESS_DOG_PROXIMITY_RANGE) 
        {
            wolf.stress = Math.min(wolf.stress + (dog.fearFactor*3 * WOLF_STRESS_RANGE_CONTRIB_PER_SECOND * dt), WOLF_STRESS_MAX);

            if (wolf.stress > WOLF_STRESS_THRESHOLD)
            {
                // running away 1000 miles away from the dog. Wolf will most likely never reach this destination because the wolf
                // will turn around as soon as the wolf's stress level comes back to normal.
                var factor = new Vector2(TILE_SIZE);
                wolf.retreatPosition = wolf.position.add(factor.mul(wolf.position.sub(cameraPos)));

                if (wolf.wimperCoolDown <= 0) 
                {
                    playSound("SFX_dog_wimper_" + Random.randInt(1, 2) + ".wav", 0.5);
                    wolf.wimperCoolDown = WOLF_WIMP_COOLDOWN_RESET;
                }
            }
        }
    }
}

function wolf_update(wolf, dt)
{
    WOLF_SPAWN_TIME = Math.max(3 - ((20 - sheeps.length)/5), 0.5);
    WOLF_SPEED = 75 + ((START_SHEEP - sheeps.length)*5);
    wolf_calculateStress(wolf, dt);

    if (wolf.stress > WOLF_STRESS_THRESHOLD &&
        wolf.state != WOLF_STATE_ATTACKING) 
    {
        wolf.state = WOLF_STATE_RETREAT; 
    }

    switch (wolf.state) 
    {
        case WOLF_STATE_HUNTING:
            if (wolf.target && !sheep_isAlive(wolf.target)) // If the target was killed by another wolf
            {
                wolf.target = null; // We need to redo the aquisition
            }
            // Make sure we have to closest sheep
            for (var i = 0; i < sheeps.length; i++) 
            {
                wolf_targetAcquisition(wolf, sheeps[i]);
            }
            if (!wolf.target) break;
            wolf_moveToward(wolf, wolf.target.position, WOLF_SPEED, dt);
            var targetDistance = +Vector2.distance(wolf.target.position, wolf.position);
            if (targetDistance <= KILL_DISTANCE) 
            {
                wolf.state = WOLF_STATE_ATTACKING;
                wolf.position = wolf.target.position;
                sheep_attackedByWolf(wolf.target);
                wolf.spriteAnim.play("eat_" + wolf.dir);
                wolf.attackTime = 2;
                for (var i = 0; i < 3; ++i)
                {
                    setTimeout(function ()
                    {
                        var emitter = emitParticles(getParticleSystem("blood.pfx"), new Vector3(wolf.position.x, wolf.position.y, 0));
                        emitter.setRenderEnabled(false);
                        particles.push(emitter);
                        playSound("SFX_Dog_Growl_" + Random.randInt(1, 11) + ".wav");
                        splat_spawn(
                            Random.randVector2(
                                new Vector2(wolf.position.x - TILE_SIZE / 2, wolf.position.y - TILE_SIZE / 2),
                                new Vector2(wolf.position.x + TILE_SIZE / 2, wolf.position.y + TILE_SIZE / 2)));
                    }, 500 * (i));
                }
            }
            break;
        case WOLF_STATE_ATTACKING:
            wolf.attackTime -= dt;
            if (wolf.attackTime <= 0) 
            {
                if (wolf.target) sheep_kill_instantly(wolf.target);
                wolf.state = WOLF_STATE_HUNTING;
                wolf.spriteAnim.play("run_" + wolf.dir);
            }
            break;
        case WOLF_STATE_RETREAT:
            wolf.wimperCoolDown -= dt;
            wolf_moveToward(wolf, wolf.retreatPosition, WOLF_STRESS_RUN_SPEED, dt);
            if (wolf.stress <= WOLF_STRESS_THRESHOLD && sheeps.length > 0)
            {
                wolf.state = WOLF_STATE_HUNTING;
            }
            break;
    }
        
    // wolf's stress level cools down over time.
    wolf.stress = Math.max(wolf.stress-(WOLF_STRESS_COOLDOWN_PER_SECOND*dt), WOLF_STRESS_MIN);

}