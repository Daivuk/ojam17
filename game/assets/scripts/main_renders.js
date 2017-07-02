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

function startMenu_render() 
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
}

function game_render()
{
    SpriteBatch.begin(cameraMatrix);
            SpriteBatch.setFilter(FilterMode.NEAREST);

            // Draw ground and grass first
            Renderer.setBlendMode(BlendMode.OPAQUE);
            tiledMap.renderLayer(GROUND_LAYER);
            Renderer.setBlendMode(BlendMode.PREMULTIPLIED);
            tiledMap.renderLayer(1);
            splat_render();
            Renderer.setBlendMode(BlendMode.PREMULTIPLIED);
            tiledMap.renderLayer(2);

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
}

function settings_render()
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
}

function quitMenu_render()
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
}

function gameOver_render()
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
}