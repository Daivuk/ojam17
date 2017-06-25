var resolution;
var renderables = [];
var gameState = "startMenu";
var menuFont = getFont("main.fntempty.fnt");
var menuMusic = createSoundInstance("Farmers.Menu Loop.wav");
var ambSound = createSoundInstance("amb_medow_01.wav");
menuMusic.setLoop(true);
menuMusic.setVolume(.35);
ambSound.setLoop(true);
ambSound.setVolume(.35);

var menuDogs = [
    playSpriteAnim("dog.spriteanim", "idle_e", 0),
    playSpriteAnim("dog.spriteanim", "idle_e", 1),
    playSpriteAnim("dog.spriteanim", "idle_e", 2),
    playSpriteAnim("dog.spriteanim", "idle_e", 3)
];
var activeDogs = [false, false, false, false];
var menuBarkTimeouts = [0, 0, 0, 0];
var startIn = 0;
var menuSheeps = [];

var ambSound;

function startGame()
{
    gameState = "game";

    map_init();
    camera_init();
    sheep_init();
    dog_init();
    wolf_init();
    pusher_init();

    ambSound = createSoundInstance("amb_medow_01.wav");
    ambSound.setLoop(true);
    ambSound.setVolume(.35);
    menuMusic.stop();
    ambSound.play();
}

var APrevStates = [false, false, false, false];

var MENU_SHEEP_COUNT = 8
for (var i = 0; i < MENU_SHEEP_COUNT; ++i)
{
    menuSheeps[i] = {
        spriteAnim: playSpriteAnim("sheep.spriteanim", i % 2 ? "run_e" : "scared_e", i),
        xPos: -i * 100
    };

    menuMusic.play();
    
}

function update(dt)
{
    // Cache latest resolution each frame
    resolution = Renderer.getResolution();

    switch (gameState)
    {
        case "startMenu":
        {
            if (startIn > 0)
            {
                startIn -= dt;
                if (startIn <= 0)
                {
                    startGame();
                    break;
                }
            }
            for (var i = 0; i < MENU_SHEEP_COUNT; ++i)
            {
                var menuSheep = menuSheeps[i];
                menuSheep.xPos += dt * 100;
                if (menuSheep.xPos > resolution.x + 100)
                {
                    menuSheep.xPos -= resolution.x + 200;
                }
            }
            for (var i = 0; i < 4; ++i)
            {
                var downState = GamePad.isDown(i, Button.A);
                if (downState && !APrevStates[i])
                {
                    activeDogs[i] = true;
                    if (menuBarkTimeouts[i] <= 0)
                    {
                        playSound("bark.wav", 1, 0, 1 + Random.randNumber(-.1, .1));
                        menuBarkTimeouts[i] = .4;
                    }
                }
                APrevStates[i] = downState;
                menuBarkTimeouts[i] -= dt;
                if (GamePad.isDown(i, Button.START) && startIn == 0)
                {
                    startIn = 1;
                }
            }
            break;
        }
        case "game":
        {
            //for (var i = 0; i < 30; ++i) // Turbo mode
            {
                // update dogs first so we can herb them the same frame
                dogs_update(dt);
                sheeps_update(dt);
                wolfs_update(dt);

                // Overlapping entities push each others again
                pushers_update(dt);
        
                camera_update(dt);
            }
            break;
        }
    }
}

function drawMenuDog(position, index)
{
    var spriteAnim = menuDogs[index];
    var scale = 6;
    var multiplier = .35;

    if (activeDogs[index]) multiplier = 1;

    if (menuBarkTimeouts[index] > .1)
    {
        SpriteBatch.drawSpriteWithUVs(dogBarkTexture, position, spriteAnim.getUVs(), new Color(1, 1, 1, 1).mul(multiplier), 0, scale, spriteAnim.getOrigin());
    }
    else
    {
        SpriteBatch.drawSpriteAnim(spriteAnim, position, new Color(1, 1, 1, 1).mul(multiplier), 0, scale);
    }
    SpriteBatch.drawSpriteWithUVs(dogOverlayTexture, position, spriteAnim.getUVs(), DOG_COLORS[index].mul(multiplier), 0, scale, spriteAnim.getOrigin());
}

function render()
{
    // Cache latest resolution each frame
    resolution = Renderer.getResolution();

    // Clear black just in case yo
    Renderer.clear(Color.BLACK);

    switch (gameState)
    {
        case "startMenu":
        {
            SpriteBatch.begin();
            SpriteBatch.setFilter(FilterMode.NEAREST);
            SpriteBatch.setBlend(BlendMode.PREMULTIPLIED);
            if (startIn == 0)
            {
                SpriteBatch.drawText(menuFont, "^666Press ^090A^666 to Join", 
                    new Vector2(resolution.x / 2, resolution.y / 2 - 8), Vector2.BOTTOM);
                SpriteBatch.drawText(menuFont, "^666Press ^999Start^666 to Herd!", 
                    new Vector2(resolution.x / 2, resolution.y / 2 + 8), Vector2.TOP);
            }
            else
            {
                SpriteBatch.drawText(menuFont, "^666Starting in ^090" + Math.round(startIn) + "^666", 
                    new Vector2(resolution.x / 2, resolution.y / 2 - 8), Vector2.BOTTOM);
            }
            drawMenuDog(resolution.div(4), 0);
            drawMenuDog(new Vector2(resolution.x / 4 * 3, resolution.y / 4), 1);
            drawMenuDog(new Vector2(resolution.x / 4, resolution.y / 4 * 3), 2);
            drawMenuDog(new Vector2(resolution.x / 4 * 3, resolution.y / 4 * 3), 3);

            for (var i = 0; i < MENU_SHEEP_COUNT; ++i)
            {
                var menuSheep = menuSheeps[i];
                SpriteBatch.drawSpriteAnim(
                    menuSheep.spriteAnim, 
                    new Vector2(menuSheep.xPos, resolution.y - 24), Color.WHITE, 0, 2);
            }

            SpriteBatch.end();
            break;
        }
        case "game":
        {
            SpriteBatch.begin(cameraMatrix);
            SpriteBatch.setFilter(FilterMode.NEAREST);

            // Draw ground and grass first
            SpriteBatch.setBlend(BlendMode.OPAQUE);
            tiledMap.renderLayer(GROUND_LAYER);
            tiledMap.renderLayer(1);
            tiledMap.renderLayer(2);
            SpriteBatch.setBlend(BlendMode.PREMULTIPLIED);

            // Draw entities
            renderables.sort(function(a, b){return a.position.y < b.position.y ? -1 : 1});
            for (var i = 0; i < renderables.length; ++i)
            {
                var entity = renderables[i];
                entity.renderFn(entity);
            }

            SpriteBatch.end();
        }
    }
}
