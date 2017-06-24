var DOG_MAX = 4;
var DOG_MOV_SPEED = 150; 
var DOG_SIZE;
var DOG_BARK_COOLDOWN = 250;

var DOG_STATE_IDLE = 0; 
var DOG_STATE_RUNNING = 1;

var dogs = [];

function dog_init()
{
    DOG_SIZE = TILE_SIZE * 0.25; 

    for(var i = 0; i < DOG_MAX; ++i)
    {
        // MC: TODO Looks like this is too soon to Call. Gamepad connects later.
        //if (GamePad.isConnected(index))  
        {
            var dog = {
                index: i,
                position: new Vector2(Random.randCircleEdge(MAP_CENTER, TILE_SIZE * 3)),
                dir: "e", // we start facing east.
                state: DOG_STATE_IDLE,
                size: DOG_SIZE,
                barking: false,
                barkingButtonState: false,
                pushBackVel: new Vector2(0, 0),
            }

            // MC: TODO Figure out why this is doing a segfault.
            dog.spriteAnim = playSpriteAnim("dog.spriteanim", "idle_e");

            dogs.push(dog);
            pushers.push(dog);
            focussables.push(dog);
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

    if (!dog.barking && barkingButtonState && !dog.barkingButtonState)
    {
        playSound("bark.wav", 1, 0, 1 + Random.randNumber(-.1, .1));
        dog.barking = true;
        print("Dog " + dog.index + ": Woof!");
        setTimeout(function() {
            print("done barking");
            dog.barking = false;        
        }, DOG_BARK_COOLDOWN);
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
        if (dir.y > .7) dog.dir = 's';
        else if (dir.x > .7) dog.dir = 'e';
        else if (dir.x < .7) dog.dir = 'w';
        else dog.dir = 'n';
        dog.state = DOG_STATE_RUNNING;
        newPosition = newPosition.add(dir.mul(DOG_MOV_SPEED * dt));
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

function dog_render()
{
    for (var i = 0; i < dogs.length; ++i)
    {
        var dog = dogs[i];
        SpriteBatch.drawSpriteAnim(dog.spriteAnim, dog.position);
    }
}