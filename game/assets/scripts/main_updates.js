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
    Random.randomizeSeed();
    gameState = "game";

    totalGameTime = 0;
    gameToGameOverTimeout = 3;

    renderables = [];
    focussables = []; 
    pushers = [];
    
    map_init();
    dog_init();
    camera_init();
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

function startMenu_update(dt)
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
    for (var i = 0; i < 4; ++i)
    {
        var downState = GamePad.isDown(i, Button.A);
        if (downState && !APrevStates[i])
        {
            activeDogs[i] = true;
            if (menuBarkTimeouts[i] <= 0)
            {
                //playSound("bark.wav", 1, 0, 1 + Random.randNumber(-.1, .1));
                playSound("bark.wav", 1, 0, 1);
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
}

function game_update(dt)
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
}

function settings_update(dt)
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
}

function quitMenu_update(dt)
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
}

function gameOver_update(dt)
{
    gameOverExitAvailabilityTimer -= dt;
            if (gameOverExitAvailabilityTimer < 0)
            {
                for (var i = 0; i < 4; i++)
                {
                    if (GamePad.isDown(i, Button.A)) goStartMenu();
                }
            }
}