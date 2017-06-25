var START_IN = 1; // TODO set this value to 3 when we're done.

var resolution;
var renderables = [];
var gameState = "startMenu";
var difficultySettings = "normal";
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
var gameOverWolfs = [
    playSpriteAnim("wolf.spriteanim", "eat_e", 0),
    playSpriteAnim("wolf.spriteanim", "eat_w", 1)
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
    cloud_init();
    butterfly_init();
    splat_init();

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
                var buttonPressed = false;

                APrevStates[i] = downState;
                menuBarkTimeouts[i] -= dt;
                if (GamePad.isDown(i, Button.START) && startIn == 0)
                {
                    startIn = START_IN;
                }

                if (GamePad.isDown(i, Button.B) && startIn == 0 && activeDogs[i] == true) 
                {
                    activeDogs[i] = false;
                    buttonPressed = true;
                } 
                // if (GamePad.isDown(i, Button.X)) gameState = "settings"
                // if (GamePad.isDown(i, Button.B) && !activeDogs[i] && !buttonPressed) 
                // {
                //     gameState = "quitMenu";
                //     // quit();
                // }
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

                // Non-important stuff update
                clouds_update(dt);
                butterflies_update(dt);
                splat_update(dt);
            }
                if (sheeps.length == 0) {
                    gameState = "gameOver";
                }
            break;
        }
        case "settings":
        {
            for (var i = 0; i < MENU_SHEEP_COUNT; ++i)
            {
                var menuSheep = menuSheeps[i];
                menuSheep.xPos += dt * 100;
                if (menuSheep.xPos > resolution.x + 100)
                {
                    menuSheep.xPos -= resolution.x + 200;
                }
            }

            for (var i = 0; i < 4; i++)
            {
                var leftThumbLeft = GamePad.isDown(i, Button.LEFT_THUMBSTICK_LEFT);
                var leftThumbRight = GamePad.isDown(i, Button.LEFT_THUMBSTICK_RIGHT);

                var thumbPressed = false; 
                //Seems awfully inefficient, not sure if it can be done better though. 
                switch (difficultySettings) 
                {
                    case "normal":
                    if (leftThumbRight && !thumbPressed) 
                    {
                        difficultySettings = "hard";
                        thumbPressed = true; 
                    }
                    break;

                    case "hard":
                    if (leftThumbLeft && !thumbPressed) 
                    {
                        difficultySettings = "normal";
                        thumbPressed = true; 
                    }
                    else if (leftThumbRight && !thumbPressed) 
                    {
                        difficultySettings = "insane";
                        thumbPressed = true; 
                    }
                    break;

                    case "insane":
                    if (leftThumbLeft && !thumbPressed) 
                    {
                        difficultySettings = "hard";
                        thumbPressed = true; 
                    }
                    else if (leftThumbRight && !thumbPressed) 
                    {
                        difficultySettings = "nope";
                        thumbPressed = true; 
                    }
                    break;

                    case "nope":
                    if (leftThumbLeft && !thumbPressed) 
                    {
                        difficultySettings = "insane";
                        thumbPressed = true; 
                    }
                    break;
                }

                // setTimeout(function() {
                //     thumbPressed = false; 
                // }, 3000);

                if (GamePad.isDown(i, Button.B)) 
                {
                    gameState = "startMenu";
                    buttonPressed = true; 
                }
            }
            break; 
        }
        case "quitMenu":
        {
            for (var i = 0; i < MENU_SHEEP_COUNT; ++i)
            {
                var menuSheep = menuSheeps[i];
                menuSheep.xPos += dt * 100;
                if (menuSheep.xPos > resolution.x + 100)
                {
                    menuSheep.xPos -= resolution.x + 200;
                }
            }

            if (GamePad.isDown(i, Button.A)) quit();
            if (GamePad.isDown(i, Button.B)) gameState = "startMenu";

            break;
        }
        case "gameOver":
        {
            for (var i = 0; i < 4; i++)
            {
                if (GamePad.isDown(i, Button.A)) gameState = "startMenu";
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

function drawGameOverWolf(position, index)
{
    var wolfSpriteAnim = gameOverWolfs[index];
    var scale = 8;
    var multiplier = 1; 

    SpriteBatch.drawSpriteAnim(wolfSpriteAnim, position, new Color(1, 1, 1, 1).mul(multiplier), 0, scale);

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
                    new Vector2(resolution.x / 2, resolution.y / 2 - 72), Vector2.BOTTOM);
                SpriteBatch.drawText(menuFont, "^666Press ^999Start^666 to Herd!", 
                    new Vector2(resolution.x / 2, resolution.y / 2 - 56), Vector2.TOP);
                SpriteBatch.drawText(menuFont, "^666Press ^027X^666 for Settings", 
                    new Vector2(resolution.x / 2, resolution.y / 2 - 12), Vector2.TOP);
                SpriteBatch.drawText(menuFont, "^666Press ^800B^666 to Quit", 
                    new Vector2(resolution.x / 2, resolution.y / 2 + 32), Vector2.TOP);
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
            SpriteBatch.setBlend(BlendMode.PREMULTIPLIED);
            tiledMap.renderLayer(1);
            splat_render();
            tiledMap.renderLayer(2);
            SpriteBatch.setBlend(BlendMode.PREMULTIPLIED);

            // Draw entities
            renderables.sort(function(a, b){return a.position.y < b.position.y ? -1 : 1});
            for (var i = 0; i < renderables.length; ++i)
            {
                var entity = renderables[i];
                entity.renderFn(entity);
            }

            // Particles
            particle_render();

            // Clouds
            SpriteBatch.setFilter(FilterMode.LINEAR);
            clouds_render();
            SpriteBatch.setFilter(FilterMode.NEAREST);

            SpriteBatch.end();

            SpriteBatch.begin(); 
            SpriteBatch.drawText(menuFont, "^666 Sheep Remaining " + sheeps.length, 
            new Vector2(0, 10), Vector2.TOP_LEFT);
            SpriteBatch.end();
            break; 
        }
        case "settings":
        {
            SpriteBatch.begin();
            SpriteBatch.setFilter(FilterMode.NEAREST);
            SpriteBatch.setBlend(BlendMode.PREMULTIPLIED);
            
            switch (difficultySettings)
            {
                case "normal":
                SpriteBatch.drawText(menuFont, "^999Difficulty Normal ^666Hard Insane ^000Nope", 
                new Vector2(30, 80), Vector2.TOP_LEFT);
                break;
                
                case "hard":
                SpriteBatch.drawText(menuFont, "^999Difficulty ^666Normal ^999Hard ^666Insane ^000Nope", 
                new Vector2(30, 80), Vector2.TOP_LEFT);
                break;

                case "insane":
                SpriteBatch.drawText(menuFont, "^999Difficulty ^666Normal ^666Hard ^999Insane ^000Nope", 
                new Vector2(30, 80), Vector2.TOP_LEFT);
                break;

                case "nope":
                SpriteBatch.drawText(menuFont, "^999Difficulty ^666Normal ^666Hard Insane ^999Nope", 
                new Vector2(30, 80), Vector2.TOP_LEFT);
                break;

            }
            for (var i = 0; i < MENU_SHEEP_COUNT; ++i)
            {
                var menuSheep = menuSheeps[i];
                SpriteBatch.drawSpriteAnim(
                    menuSheep.spriteAnim, 
                    new Vector2(menuSheep.xPos, 50), Color.WHITE, 0, 2);
            }
            
            SpriteBatch.end();
            break;
        }
        case "quitMenu":
        {
            SpriteBatch.begin();
            SpriteBatch.setFilter(FilterMode.NEAREST);
            SpriteBatch.setBlend(BlendMode.PREMULTIPLIED);

            SpriteBatch.drawText(menuFont, "^666Are you sure you want to quit", 
            new Vector2(resolution.x / 2, resolution.y / 2 - 72), Vector2.BOTTOM);
            SpriteBatch.drawText(menuFont, "^090A ^666yes ^880Y ^666no", 
            new Vector2(resolution.x / 2, resolution.y / 2 - 56), Vector2.TOP);

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
        case "gameOver":
        {
            SpriteBatch.begin();
            SpriteBatch.setFilter(FilterMode.NEAREST);
            SpriteBatch.setBlend(BlendMode.PREMULTIPLIED);

            SpriteBatch.drawText(menuFont, "^900GAME OVER!", 
                new Vector2(resolution.x / 2, resolution.y / 2 - 72), Vector2.BOTTOM);
            SpriteBatch.drawText(menuFont, "^666Press ^090A^666 to Replay!", 
                new Vector2(resolution.x / 2, resolution.y / 2 - 56), Vector2.TOP);

            drawGameOverWolf(new Vector2(resolution.x / 4, resolution.y / 4 * 3), 0);
            drawGameOverWolf(new Vector2(resolution.x / 4 * 3, resolution.y / 4 * 3), 1);

            SpriteBatch.end(); 
            break;
        }
    }
}
