var START_IN = 3;

var resolution;
var renderables = [];
var gameState = "mainMenu";
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

var APrevStates = [false, false, false, false];
var MENU_SHEEP_COUNT = 8;

var startMenuAnims = [];

goMainMenu();
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
        
        case "mainMenu":
        {
            mainMenu_update(dt);
            break;
        }
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
        case "mainMenu":
        {
            mainMenu_render();
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
