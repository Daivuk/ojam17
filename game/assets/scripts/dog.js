var DOG_MAX = 4;
var DOG_MOV_SPEED = 225; 
var DOG_SIZE;

var DOG_STATE_IDLE = 0; 
var DOG_STATE_ATTACKING = 1;
var DOG_STATE_RUNNING = 2;
var DOG_STATE_BARKING = 3;

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
                position: new Vector2(Random.randCircle(MAP_CENTER, TILE_SIZE * 3)),
                dir: "s", // we start facing south.
                state: DOG_STATE_IDLE,
                size: DOG_SIZE,
                pushBackVel: new Vector2(0, 0)
            }

            // MC: TODO Figure out why this is doing a segfault.
            //dog.spriteAnim = playSpriteAnim("anims/dog.spriteanim", "idle_s"),

            dogs.push(dog);
            pushers.push(dog);
            focussables.push(dog);
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

        //MC TODO. Still not sure what sound file we're going to have, but
        // it might be a good idea to have a few samples of 4 different dogs
        // We don't want all the bark sounds to sound all the same. for example
        // if player 1 presses "X", it would play dog_bark_0_[0-3].wav while
        // player 2 would play  dog_bark_1_[0-3].wav

        if(GamePad.isJustDown(i, Button.A))
        {
            //playSound("dog_growl_" + i + "_" + Random.randInt(3) + ".wav", .5);
            dog.state = DOG_STATE_ATTACKING;
        }

        if(GamePad.isJustDown(i, Button.X))
        {
            //playSound("dog_bark_" + i + "_" + Random.randInt(3) + ".wav", .5);
            print("Dog " + i + ": Woof!");
            dog.state = DOG_STATE_RUNNING;
        }

        switch(dog.state)
        {
            case DOG_STATE_IDLE:
                //dog.spriteAnim.play("idle_" + dog.dir);
                break;


        }

        dog.position = newPosition;
    }
}

function dog_render()
{
    for (var i = 0; i < dogs.length; ++i)
    {
        var dog = dogs[i];
        SpriteBatch.drawSpriteAnim(dog.spriteAnim, dog.position);
    }
}