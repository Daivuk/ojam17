var mainMenuOptions = ["Single Player", "Party Mode", "Quit"];
var mainMenuSelection = 0;

function goMainMenu()
{
    resolution = Renderer.getResolution();
    gameState = "mainMenu";
    menuMusic.play();

    for (var i = 0; i < MENU_SHEEP_COUNT; ++i)
    {
        menuSheeps[i] = {
            spriteAnim: playSpriteAnim("sheep.spriteanim", i % 2 ? "run_e" : "scared_e", i),
            xPos: -i * 100
        };
    }

    mainMenuSelection = 0;
}

function mainMenu_update(dt)
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

    if (GamePad.isJustDown(0, Button.DPAD_DOWN) ||
        GamePad.isJustDown(0, Button.LEFT_THUMBSTICK_DOWN) ||
        Input.isJustDown(Key.S) ||
        Input.isJustDown(Key.DOWN))
    {
        mainMenuSelection = (mainMenuSelection + 1) % mainMenuOptions.length;
        playSound("bark.wav");
    }

    if (GamePad.isJustDown(0, Button.DPAD_UP) ||
        GamePad.isJustDown(0, Button.LEFT_THUMBSTICK_UP) ||
        Input.isJustDown(Key.W) ||
        Input.isJustDown(Key.UP))
    {
        mainMenuSelection = (mainMenuSelection + mainMenuOptions.length - 1) % mainMenuOptions.length;
        playSound("bark.wav");
    }

    if (GamePad.isJustDown(0, Button.START) ||
        GamePad.isJustDown(0, Button.A) ||
        Input.isJustDown(Key.SPACE_BAR) ||
        Input.isJustDown(Key.ENTER))
    {
        switch (mainMenuSelection)
        {
            case 0:
                // todo...
                break;
            case 1:
                goStartMenu();
                break;
            case 2:
                quit();
                break;
        }
    }
}

function mainMenu_render()
{
    resolution = Renderer.getResolution();

    SpriteBatch.begin();
    SpriteBatch.setFilter(FilterMode.NEAREST);
    SpriteBatch.setBlend(BlendMode.PREMULTIPLIED);
    SpriteBatch.drawText(menuFontBig, "Sheep Dog Heroes", 
        new Vector2(resolution.x / 2, 30), Vector2.TOP);

    for (var i = 0; i < MENU_SHEEP_COUNT; ++i)
    {
        var menuSheep = menuSheeps[i];
        SpriteBatch.drawSpriteAnim(
            menuSheep.spriteAnim, 
            new Vector2(menuSheep.xPos, resolution.y - 24), Color.WHITE, 0, 2);
    }

    var xPos = resolution.x / 2;
    var yPos = resolution.y / 2 - (mainMenuOptions.length - 1) / 2 * 80;

    for (var i = 0; i < mainMenuOptions.length; ++i)
    {
        if (i == mainMenuSelection)
            SpriteBatch.drawText(menuFont, mainMenuOptions[i], new Vector2(xPos, yPos), Vector2.CENTER);
        else
            SpriteBatch.drawText(menuFont, mainMenuOptions[i], new Vector2(xPos, yPos), Vector2.CENTER, new Color(.5));
        yPos += 80;
    }

    SpriteBatch.end();
}
