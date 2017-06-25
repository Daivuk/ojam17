var DOG_MAX = 4;
var DOG_MOV_SPEED = 150; 
var DOG_SIZE;
var DOG_BARK_COOLDOWN = 100;
var DOG_FEAR_FACTOR_MIN = 0.0;
var DOG_FEAR_FACTOR_MAX = 5.0;
var DOG_BARK_FEAR_CONTRIB_INSTANT = 10;
var DOG_RUN_FEAR_CONTRIB_PER_SECOND = 1.5;
var DOG_FEAR_COOLDOWN_PER_SECOND = 2.0;

var DOG_STATE_IDLE = 0; 
var DOG_STATE_RUNNING = 1;

var dogs;

var dogTexture = getTexture("dog.png", false);
var dogOverlayTexture = getTexture("dogOverlay.png", false);
var dogBarkTexture = getTexture("dogBark.png", false);
var barkTexture = getTexture("bark.png");

var DOG_COLORS = [
    new Color(1, 0, 0, 1),
    new Color(.25, .25, 1, 1),
    new Color(0, .8, 0, 1),
    new Color(1, 1, 0, 1)
];

function dog_init()
{
    dogs = [];

    DOG_SIZE = TILE_SIZE * 0.5; 

    for(var i = 0; i < DOG_MAX; ++i)
    {
        if (!activeDogs[i]) continue;
        // MC: TODO Looks like this is too soon to Call. Gamepad connects later.
        //if (GamePad.isConnected(index))  
        {
            var dog = {
                index: i,
                position: 
                    i == 0 ? MAP_CENTER.add(new Vector2(-TILE_SIZE * 2, -TILE_SIZE * 2)) :
                    i == 1 ? MAP_CENTER.add(new Vector2(TILE_SIZE * 2, -TILE_SIZE * 2)) :
                    i == 2 ? MAP_CENTER.add(new Vector2(-TILE_SIZE * 2, TILE_SIZE * 2)) :
                    MAP_CENTER.add(new Vector2(TILE_SIZE * 2, TILE_SIZE * 2)),
                dir: "e", // we start facing east.
                state: DOG_STATE_IDLE,
                size: DOG_SIZE,
                barking: false,
                barkingButtonState: false,
                pushBackVel: new Vector2(0, 0),
                fearFactor: DOG_FEAR_FACTOR_MIN,
                renderFn: dog_render,
                barkAnim: new NumberAnim(0),
                barkSoundCoolDown: 0,
                dead: false, 
            }

            dog.spriteAnim = playSpriteAnim("dog.spriteanim", "idle_e");

            dogs.push(dog);
            pushers.push(dog);
            focussables.push(dog);
            renderables.push(dog);
        }
    }
}

function dogs_update(dt)
{
    for (var i = 0; i < dogs.length; ++i)
    {
        var dog = dogs[i];
        dog_update(dog, dt);
    }
}

function dog_update(dog, dt) {
    var previousPosition = dog.position;
    var newPosition = dog.position.add(dog.pushBackVel.mul(dt));

    var barkingButtonState =
        GamePad.isDown(dog.index, Button.A) ||
        GamePad.isDown(dog.index, Button.B) ||
        GamePad.isDown(dog.index, Button.X) ||
        GamePad.isDown(dog.index, Button.Y);

    dog.barkSoundCoolDown -= dt;

    if (!dog.barking && barkingButtonState && !dog.barkingButtonState)
    {
        if (dog.barkSoundCoolDown < 0)
        {
            playSound("bark.wav", 1, 0, 1 + Random.randNumber(-.1, .1));
            dog.barkSoundCoolDown = .4;
        /*    var emitter = emitParticles(getParticleSystem("blood.pfx"), new Vector3(dog.position.x, dog.position.y, 0));
            emitter.setRenderEnabled(false);
            particles.push(emitter);*/
        }
        dog.barking = true;
        setTimeout(function() {
            dog.barking = false;
        }, DOG_BARK_COOLDOWN);
        dog.fearFactor = Math.min(dog.fearFactor+DOG_BARK_FEAR_CONTRIB_INSTANT, DOG_FEAR_FACTOR_MAX);
        dog.barkAnim.playSingle(0, dog.fearFactor, .15, Tween.EASE_OUT);
    }
    else
    {
        // since we're not barking on this frame, let's cool down the fear factor here.
        dog.fearFactor = Math.max(dog.fearFactor-(DOG_FEAR_COOLDOWN_PER_SECOND*dt), DOG_FEAR_FACTOR_MIN);
    }
    dog.barkingButtonState = barkingButtonState;

    var dir = GamePad.getLeftThumb(dog.index);

    if (GamePad.isDown(dog.index, Button.DPAD_RIGHT)) dir.x += 1;
    if (GamePad.isDown(dog.index, Button.DPAD_LEFT)) dir.x -= 1;
    if (GamePad.isDown(dog.index, Button.DPAD_UP)) dir.y -= 1;
    if (GamePad.isDown(dog.index, Button.DPAD_DOWN)) dir.y += 1;

    if (dir.lengthSquared() == 0) {
        dog.state = DOG_STATE_IDLE;
    }
    else {
        dir = dir.normalize();
        if (dir.x > .1) dog.dir = 'e';
        else if (dir.x < -.1) dog.dir = 'w';
        dog.state = DOG_STATE_RUNNING;
        newPosition = newPosition.add(dir.mul(DOG_MOV_SPEED * dt));

        dog.fearFactor = Math.min(dog.fearFactor+(DOG_RUN_FEAR_CONTRIB_PER_SECOND*dt), DOG_FEAR_FACTOR_MAX);

    }

    switch (dog.state) {
        case DOG_STATE_RUNNING:
            dog.spriteAnim.play("run_" + dog.dir);
            break;
        default:
        case DOG_STATE_IDLE:
            dog.spriteAnim.play("idle_" + dog.dir);
            break;
    }

    dog.position = tiledMap.collision(dog.position, newPosition, dog.size);
}

function dog_render(dog)
{
    // TEMP TEMP TEMP testing fear range
    //SpriteBatch.drawSprite(null, dog.position, Color.WHITE, 0, 20*dog.fearFactor);

    if (dog.barkSoundCoolDown > .15)
    {
        SpriteBatch.drawSpriteWithUVs(dogBarkTexture, dog.position, dog.spriteAnim.getUVs(), Color.WHITE, 0, 1, dog.spriteAnim.getOrigin());
    }
    else
    {
        SpriteBatch.drawSpriteAnim(dog.spriteAnim, dog.position);
    }

    SpriteBatch.drawSpriteWithUVs(dogOverlayTexture, dog.position, dog.spriteAnim.getUVs(), DOG_COLORS[dog.index], 0, 1, dog.spriteAnim.getOrigin());

    if (dog.barkAnim.isPlaying())
    {
        var barkVal = dog.barkAnim.get();
        SpriteBatch.drawSprite(barkTexture, dog.position, new Color(0, 1, 1, .15).mul(.25), 0, barkVal * 20 / barkTexture.getSize().x);
    }
}
