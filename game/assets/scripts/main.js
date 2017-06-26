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
            startMenu_update(dt);
            } 
            break;
        
        case "game":
        {
            game_update(dt);
            break;
        }
        case "settings":
        {
            settings_update(dt); 
            break; 
        }
        case "quitMenu":
        {
            quitMenu_update(dt);
            break;
        }
        case "gameOver":
        {
            gameOver_update(dt);
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
            startMenu_render();
            break;
        }
        case "game":
        {
            game_render();
            break; 
        }
        case "settings":
        {
            settings_render(); 
            break;
        }
        case "quitMenu":
        {
            quitMenu_render(); 
            break;  
        }
        case "gameOver":
        {
            gameOver_render();
            break;
        }
    }
}
