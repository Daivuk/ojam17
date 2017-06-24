var PUSH_SPEED = TILE_SIZE;

var pushers = [];

function pushers_update(dt)
{
    var len = pushers.length;
    for (var i = 0; i < len; ++i)
    {
        var entity1 = pushers[i];
        for (var j = 0; j < len; ++j)
        {
            if (i == j) continue; // Cannot push itself
            var entity2 = pushers[j];

            var distance = Vector2.distance(entity1.position, entity2.position);
            if (distance <= entity1.size + entity2.size)
            {
                var percent = 1 - (distance / (entity1.size + entity2.size));
                var dir = entity2.position.sub(entity1.position);
                dir = dir.normalize().mul(PUSH_SPEED * dt);
                entity1.position = tiledMap.collision(entity1.position, entity1.position.sub(dir.mul(percent)));
                entity2.position = tiledMap.collision(entity2.position, entity2.position.add(dir.mul(percent)));
            }
        }
    }
}
