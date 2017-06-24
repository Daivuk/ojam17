var DOG_MOV_SPEED = 64; 

var DOG_STATE_IDLE = 0; 
var DOG_STATE_ATTACKING = 1;
var DOG_STATE_RUNNING = 2;

function dog_init(entity)
{
    entity.spriteAnim = playSpriteAnim("dog.spriteanim", "idle_s");

    entity.position = new Vector2(Random.randCircle(MAP_CENTER, TILE_SIZE * 3))
    entity.dir = "s";
    entity.state = DOG_STATE_IDLE;
    entity.pushBackVel = Vector2.ZERO; 

    dog = entity; 
}

function dog_update(entity, dt)
{
    var previousPosition = entity.position;
    var newPosition = entity.position.add(entity.pushBackVel.mul(dt));

    var dir = new Vector2.ZERO;

    if (GamePad.isDown(index, Button.LEFT_THUMBSTICK_RIGHT)) dir.x += 1;
    if (GamePad.isDown(index, Button.LEFT_THUMBSTICK_LEFT)) dir.x -= 1;
    if (GamePad.isDown(index, Button.LEFT_THUMBSTICK_UP)) dir.y -= 1;
    if (GamePad.isDown(index, Button.LEFT_THUMBSTICK_DOWN)) dir.y += 1;

    if (dir.lengthSquared() == 0)
    {
        entity.spriteAnim.play("idle_" + entity.dir);
    }
    else
    {
        dir = dir.normalize();
        if (dir.y > .7) entity.dir = 's';
        else if (dir.x > .7) entity.dir = 'e';
        else if (dir.x < .7) entity.dir = 'w';
        else entity.dir = 'n';
        entity.spriteAnim.play("run_" + entity.dir);

        newPosition = newPosition.add(dir.mul(DOG_MOV_SPEED * dt));
    }
}