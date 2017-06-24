var DOG_MAX = 4;
var DOG_MOV_SPEED = 64; 

var DOG_STATE_IDLE = 0; 
var DOG_STATE_ATTACKING = 1;
var DOG_STATE_RUNNING = 2;

var dogs = [];

function dog_init()
{
    for(var i = 0; i < DOG_MAX; ++i)
    {
        // MC: TODO Looks like this is too soon to Call. Gamepad connects later.
        //if (GamePad.isConnected(index))
        {
            var dog = {
                position: new Vector2(Random.randCircle(MAP_CENTER, TILE_SIZE * 3)),
                dir: "s", // we start facing south.
                state: DOG_STATE_IDLE,
                pushBackVel: new Vector2(0, 0)
            }

            // MC: TODO Figure out why this is doing a segfault.
            //dog.spriteAnim = playSpriteAnim("anims/dog.spriteanim", "idle_s"),

            dogs.push(dog);
        }

    }
}

function dog_update(dt)
{
    for (var i = 0; i < dogs.length; ++i)
    {
        var dog = dogs[i];

        var previousPosition = dog.position;
        var newPosition = dog.position.add(dog.pushBackVel.mul(dt));

        var dir = GamePad.getLeftThumb(i);

        if (GamePad.isDown(i, Button.DPAD_RIGHT)) dir.x += 1;
        if (GamePad.isDown(i, Button.DPAD_LEFT))  dir.x -= 1;
        if (GamePad.isDown(i, Button.DPAD_UP))    dir.y -= 1;
        if (GamePad.isDown(i, Button.DPAD_DOWN))  dir.y += 1;

        if (dir.lengthSquared() == 0)
        {
            //dog.spriteAnim.play("idle_" + dog.dir);
            dog.state = DOG_STATE_IDLE;
        }
        else
        {
            dir = dir.normalize();
            if (dir.y > .7) dog.dir = 's';
            else if (dir.x > .7) dog.dir = 'e';
            else if (dir.x < .7) dog.dir = 'w';
            else dog.dir = 'n';
            //dog.spriteAnim.play("run_" + dog.dir);
            dog.state = DOG_STATE_RUNNING;

            newPosition = newPosition.add(dir.mul(DOG_MOV_SPEED * dt));
        }

        dog.position = newPosition;
    }
}