var START_IN = 3;

var resolution;
var renderables = [];
var gameState = "startMenu";
var difficultySettings = "normal";
var menuFont = getFont("main.fntempty.fnt");
var menuFontBig = getFont("mainBig.fntempty.fnt");
var menuFontSml = getFont("mainSmall.fntempty.fnt");
var menuMusic = createSoundInstance("Farmers.Menu Loop.wav");
var ambSound = createSoundInstance("amb_medow_01.wav");
var sheepIconTexture = getTexture("sheepIcon.png", false);
var arrowTexture = getTexture("arrow.png", false);
menuMusic.setLoop(true);
menuMusic.setVolume(.35);
ambSound.setLoop(true);
ambSound.setVolume(.35);

var gameOverExitAvailabilityTimer;
var gameToGameOverTimeout;

var menuDogs = [
    playSpriteAnim("dog.spriteanim", "idle_e", 0),
    playSpriteAnim("dog.spriteanim", "idle_w", 1),
    playSpriteAnim("dog.spriteanim", "idle_e", 2),
    playSpriteAnim("dog.spriteanim", "idle_w", 3)
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

var totalGameTime;

function toHHMMSS(secondTotal) {
    var sec_num = parseInt(secondTotal, 10);
    var hours   = Math.floor(sec_num / 3600);
    var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
    var seconds = sec_num - (hours * 3600) - (minutes * 60);

    if (hours   < 10) {hours   = "0"+hours;}
    if (minutes < 10) {minutes = "0"+minutes;}
    if (seconds < 10) {seconds = "0"+seconds;}
    //return hours+':'+minutes+':'+seconds;
    return +minutes + ' minutes ' + seconds + " seconds!";
}

function startGame()
{
    gameState = "game";

    totalGameTime = 0;
    gameToGameOverTimeout = 3;

    renderables = [];
    focussables = []; 
    pushers = [];
    
    map_init();
    camera_init();
    dog_init();
    sheep_init();
    wolf_init();
    pusher_init();
    cloud_init();
    butterfly_init();
    splat_init();
    plane_init();

    menuMusic.stop();
    ambSound.play();
}

var APrevStates = [false, false, false, false];
var MENU_SHEEP_COUNT = 8;

var startMenuAnims = [];

function goGameOver()
{
    gameState = "gameOver";
    gameOverExitAvailabilityTimer = 3;

    sheeps = [];
    dogs = [];
    wolfs = [];
    splats = [];
    butterflies = [];
    plane = {};
    clouds = [];
    for (var i = 0; i < particles.length; ++i)
    {
        var particle = particles[i];
        particle.stop();
    }
    particles = [];
    pushers = [];
    renderables = [];
    focussables = [];
    ambSound.stop();
}

function goStartMenu()
{
    resolution = Renderer.getResolution();

    gameState = "startMenu";

    APrevStates = [false, false, false, false];

    for (var i = 0; i < MENU_SHEEP_COUNT; ++i)
    {
        menuSheeps[i] = {
            spriteAnim: playSpriteAnim("sheep.spriteanim", i % 2 ? "run_e" : "scared_e", i),
            xPos: -i * 100
        };

        menuMusic.play();
    }

    startMenuAnims = [
        new NumberAnim(),
        new NumberAnim(),
        new NumberAnim(),
        new NumberAnim(),
        new NumberAnim(),
        new NumberAnim(),
        new NumberAnim(),
        new NumberAnim()
    ];

    for (var i = 0; i < startMenuAnims.length; ++i)
    {
        var anim = startMenuAnims[i];
        anim.set(-resolution.x);
        anim.queue(-resolution.x, i * .15, Tween.NONE);
        anim.queue(0, .5, Tween.EASE_OUT);
        anim.play();
    }
}

goStartMenu();
//goGameOver();

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
                    startIn = 0;  
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
                totalGameTime += dt;

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
                plane_update(dt);
            }
            if (sheeps.length == 0) {
                if (gameToGameOverTimeout < 0)
                {
                    goGameOver();
                }
                gameToGameOverTimeout -= dt;
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
            gameOverExitAvailabilityTimer -= dt;
            if (gameOverExitAvailabilityTimer < 0)
            {
                for (var i = 0; i < 4; i++)
                {
                    if (GamePad.isDown(i, Button.A)) goStartMenu();
                }
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
    var scale = 6;
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
            SpriteBatch.drawText(menuFontBig, "Sheep Dog Heroes", 
                new Vector2(resolution.x / 2 + startMenuAnims[0].get(), 30), Vector2.TOP);
            if (startIn == 0)
            {
                SpriteBatch.drawText(menuFont, "^666Press ^090A^666 to Join", 
                    new Vector2(resolution.x / 2 + startMenuAnims[5].get(), resolution.y / 2 - 30), Vector2.TOP);
                SpriteBatch.drawText(menuFont, "^666Press ^800B^666 to Quit", 
                    new Vector2(resolution.x / 2 + startMenuAnims[6].get(), resolution.y / 2 + 10), Vector2.TOP);
                SpriteBatch.drawText(menuFont, "^666Press ^999Start^666 to Herd!", 
                    new Vector2(resolution.x / 2 + startMenuAnims[7].get(), resolution.y / 2 + 50), Vector2.TOP);
            /*    SpriteBatch.drawText(menuFont, "^666Press ^027X^666 for Settings", 
                    new Vector2(resolution.x / 2, resolution.y / 2 - 12), Vector2.TOP);*/
            }
            else
            {
                SpriteBatch.drawText(menuFont, "^666Starting in ^090" + Math.round(startIn) + "^666", 
                    new Vector2(resolution.x / 2, resolution.y / 2 - 8), Vector2.BOTTOM);
            }
            drawMenuDog(new Vector2(resolution.x / 4 + startMenuAnims[1].get(), resolution.y / 4 + 70), 0);
            drawMenuDog(new Vector2(resolution.x / 4 * 3 + startMenuAnims[2].get(), resolution.y / 4 + 70), 1);
            drawMenuDog(new Vector2(resolution.x / 4 + startMenuAnims[3].get(), resolution.y / 4 * 3 + 25), 2);
            drawMenuDog(new Vector2(resolution.x / 4 * 3 + startMenuAnims[4].get(), resolution.y / 4 * 3 + 25), 3);

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

            // Clouds n shit
            SpriteBatch.setFilter(FilterMode.LINEAR);
            clouds_render();
            plane_render();
            SpriteBatch.setFilter(FilterMode.NEAREST);

            SpriteBatch.end();

            SpriteBatch.begin(); 

            // Dogs arrows
            var EPSILON_SCREEN = 20;
            for (var i = 0; i < dogs.length; ++i)
            {
                var dog = dogs[i];
                if (!dog) continue;
                var dogPos = new Vector3(dog.position).transform(cameraMatrix);
                if (dogPos.x < EPSILON_SCREEN && dogPos.y < EPSILON_SCREEN)
                {
                    dogPos.x = EPSILON_SCREEN;
                    dogPos.y = EPSILON_SCREEN;
                    SpriteBatch.drawSprite(arrowTexture, dogPos, DOG_COLORS[i], -135, 3, new Vector2(1.25, 0.5));
                }
                else if (dogPos.x > resolution.x - EPSILON_SCREEN && dogPos.y > resolution.y - EPSILON_SCREEN)
                {
                    dogPos.x = resolution.x - EPSILON_SCREEN;
                    dogPos.y = resolution.y - EPSILON_SCREEN;
                    SpriteBatch.drawSprite(arrowTexture, dogPos, DOG_COLORS[i], 45, 3, new Vector2(1.25, 0.5));
                }
                else if (dogPos.x > resolution.x - EPSILON_SCREEN && dogPos.y < EPSILON_SCREEN)
                {
                    dogPos.x = resolution.x - EPSILON_SCREEN;
                    dogPos.y = EPSILON_SCREEN;
                    SpriteBatch.drawSprite(arrowTexture, dogPos, DOG_COLORS[i], -45, 3, new Vector2(1.25, 0.5));
                }
                else if (dogPos.x < 0 && dogPos.y > resolution.y - EPSILON_SCREEN)
                {
                    dogPos.x = 0;
                    dogPos.y = resolution.y - EPSILON_SCREEN;
                    SpriteBatch.drawSprite(arrowTexture, dogPos, DOG_COLORS[i], 135, 3, new Vector2(1.25, 0.5));
                }
                else if (dogPos.y < EPSILON_SCREEN)
                {
                    dogPos.y = EPSILON_SCREEN;
                    SpriteBatch.drawSprite(arrowTexture, dogPos, DOG_COLORS[i], -90, 3, new Vector2(1.25, 0.5));
                }
                else if (dogPos.x > resolution.x - EPSILON_SCREEN)
                {
                    dogPos.x = resolution.x - EPSILON_SCREEN;
                    SpriteBatch.drawSprite(arrowTexture, dogPos, DOG_COLORS[i], 0, 3, new Vector2(1.25, 0.5));
                }
                else if (dogPos.y > resolution.y - EPSILON_SCREEN)
                {
                    dogPos.y = resolution.y - EPSILON_SCREEN;
                    SpriteBatch.drawSprite(arrowTexture, dogPos, DOG_COLORS[i], 90, 3, new Vector2(1.25, 0.5));
                }
                else if (dogPos.x < 0)
                {
                    dogPos.x = 0;
                    SpriteBatch.drawSprite(arrowTexture, dogPos, DOG_COLORS[i], 180, 3, new Vector2(1.25, 0.5));
                }
            }

            SpriteBatch.drawText(menuFontSml, "^666 Sheep Remaining ^880" + sheeps.length, new Vector2(10, 10), Vector2.TOP_LEFT);
            SpriteBatch.drawText(menuFontSml, "^666 Wolf Count ^880" + wolfs.length, new Vector2(resolution.x - 10, 10), Vector2.TOP_RIGHT);

            // for (var i = 0; i < sheeps.length; ++i)
            // {
            //     SpriteBatch.drawSprite(sheepIconTexture, new Vector2(i * 36 + 18, 18));
            // }
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

            drawGameOverWolf(new Vector2(resolution.x / 8, resolution.y / 8 * 7), 0);
            drawGameOverWolf(new Vector2(resolution.x / 8 * 7, resolution.y / 8 * 7), 1);

            SpriteBatch.drawText(menuFont, "^600What is done cannot be undone!", 
                new Vector2(resolution.x / 2, 10), Vector2.TOP);

            SpriteBatch.drawText(menuFontBig, "^900GAME OVER!", 
                new Vector2(resolution.x / 2, 60), Vector2.TOP);

            SpriteBatch.drawText(menuFont, "^999credits", 
                new Vector2(resolution.x / 2, 180), Vector2.TOP);

            SpriteBatch.drawText(menuFont, "^999Programmers", 
                new Vector2(resolution.x / 16 * 7.8, 240), Vector2.TOP_RIGHT);

            SpriteBatch.drawText(menuFontSml, "^777Mathieu Andre Chiasson", 
                new Vector2(resolution.x / 16 * 7.8, 280), Vector2.TOP_RIGHT);
            SpriteBatch.drawText(menuFontSml, "^777Isaac Neumann", 
                new Vector2(resolution.x / 16 * 7.8, 300), Vector2.TOP_RIGHT);
            SpriteBatch.drawText(menuFontSml, "^777David St Louis", 
                new Vector2(resolution.x / 16 * 7.8, 320), Vector2.TOP_RIGHT);

            SpriteBatch.drawText(menuFont, "^999Pixel Art", 
                new Vector2(resolution.x / 16 * 7.8, 360), Vector2.TOP_RIGHT);

            SpriteBatch.drawText(menuFontSml, "^777Don Dimanlig", 
                new Vector2(resolution.x / 16 * 7.8, 400), Vector2.TOP_RIGHT);
            SpriteBatch.drawText(menuFontSml, "^777Alice de Lemos", 
                new Vector2(resolution.x / 16 * 7.8, 420), Vector2.TOP_RIGHT);
            SpriteBatch.drawText(menuFontSml, "^777Gio Manning", 
                new Vector2(resolution.x / 16 * 7.8, 440), Vector2.TOP_RIGHT);
            SpriteBatch.drawText(menuFontSml, "^777Meng Ting Ma", 
                new Vector2(resolution.x / 16 * 7.8, 460), Vector2.TOP_RIGHT);
            SpriteBatch.drawText(menuFontSml, "^777Megan Winters", 
                new Vector2(resolution.x / 16 * 7.8, 480), Vector2.TOP_RIGHT);
            SpriteBatch.drawText(menuFontSml, "^777Matt Winters", 
                new Vector2(resolution.x / 16 * 7.8, 500), Vector2.TOP_RIGHT);

            SpriteBatch.drawText(menuFont, "^999Sound Design", 
                new Vector2(resolution.x / 16 * 8.2, 240), Vector2.TOP_LEFT);
            SpriteBatch.drawText(menuFontSml, "^777Nathaniel Vasconcelos", 
                new Vector2(resolution.x / 16 * 8.2, 280), Vector2.TOP_LEFT);
                

            SpriteBatch.drawText(menuFont, "^999Music", 
                new Vector2(resolution.x / 16 * 8.2, 360), Vector2.TOP_LEFT);
            SpriteBatch.drawText(menuFontSml, "^777Joel Heidinger", 
                new Vector2(resolution.x / 16 * 8.2, 400), Vector2.TOP_LEFT);

            var timeString = toHHMMSS(totalGameTime);

            SpriteBatch.drawText(menuFont, "^990" + timeString, 
                new Vector2(resolution.x / 2, resolution.y - 100), Vector2.BOTTOM);

            if (gameOverExitAvailabilityTimer < 0)
            {
                SpriteBatch.drawText(menuFont, "^666Press ^090A^666 to Replay!", 
                    new Vector2(resolution.x / 2, resolution.y - 10), Vector2.BOTTOM);
            }

            SpriteBatch.end(); 
            break;
        }
    }
}
