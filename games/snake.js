/*
Dimitri Frazao - group project phase 2 - CSD 122 Javascript & JQuery
Winter 2019
s-Dimitri.Frazao@lwtech.edu

Here's my group project snake game.
This gameTest file needs our page to have loaded both these files to work:
1 - squareEngine.js
2 - JQuery.js

Im trying to document the game behavior as best as I can.
A lot of the squareEngine methods/attributes are fairly self explanatory.
Please refer to the squareEngine.js to obtain more info on a particular method/attribute.

Check index page for game keyboard/mouse controls and options info.
*/

// our gameGrid constants
const CANVAS_SCALE = 30;
const SPEED_UP = 3;
const GRID_UNITS = 20;
const OBJECTS_MAX = 25;
const SNAKE_MIN_SPEED = 0.1;
const SNAKE_MAX_SPEED = 0.3;

// a few Enums to help 
tileEnum = {EMPTY:0, APPLE:1, PORTAL:2, SNAKE:3, ROCK:4};
modeEnum = {"one":0, "two":1, "AI":2, "doubble":3};
directionEnumAttrArray = ["UP", "DOWN", "LEFT", "RIGHT"];
directionEnum = {
    UP : new Vector(0,-1),
    DOWN : new Vector(0,1),
    LEFT : new Vector(-1,0),
    RIGHT : new Vector(1,0)
};

// JQuery events to handle our buttons/number inputs that affect the game

// click event for start button to start gae
$("#start").click( function(){ gameGrid._setGameToUpdate() });
// click event for pause button to pause game
$("#pause").click(
    function(){
        if(gameGrid._getGameState()==gameStateEnum.PAUSED) gameGrid._setGameToUpdate()
        else if(gameGrid._getGameState()==gameStateEnum.UPDATE) gameGrid._setGameToPaused()
    }
);
// click event for reset button to reset game
$("#reset").click( function(){ gameGrid._reset(); });
// change event for inputs to reset game
$("input, select#mode").change( function(){ gameGrid._reset(); } );
// change event for speed increment input to keep value limit
$("input#sppedInc").change( function(){ 
    if($(this).val()<0) $(this).val(0);
    else if($(this).val()>10) $(this).val(10);
});
// change event for apples/obstacles increment input to keep value limit
$("input#apples, input#obstacles").change( function(){ 
    if($(this).val()<0) $(this).val(0);
    else if($(this).val()>OBJECTS_MAX) $(this).val(OBJECTS_MAX);
});
// change event for screen units input to keep value limit and resize gameGrid
$("input#units").change( function(){ 

    let unitValue = Number( $(this).val() );
    if(unitValue % 2 != 0) unitValue -= 1;
    if(unitValue < 8) unitValue = 8;    
    else if(unitValue > 32) unitValue = 32;

    $(this).val(unitValue);
    gameGrid._changeGameGridSize(unitValue, unitValue, 600/unitValue);
});

/* our snake class.
all necessary snake methods/attributes are encapsulated here so we can have n snakes as we want
this class is not meant to be initialized by the user. It must be addded to the gameGrid factory.
the gameGrid is the object that creates gameObjects.
*/
class Snake extends GameObject{
    // same constructor as gameObject. Please check gameObject class for more info
    constructor(gameGrid, x=0, y=0, canUpdate=true, canRender=true){
        super(gameGrid=gameGrid, x=x, y=y, canUpdate=canUpdate, canRender=canRender);
        // set our snake keyboard keys
        this.keys = {
            UP:keyCodesEnum.UP,
            DOWN:keyCodesEnum.DOWN,
            LEFT:keyCodesEnum.LEFT,
            RIGHT:keyCodesEnum.RIGHT
            };
        // initialize our snake with its proper settings
        // here we create a random color for our snake
        let randomValueR = Math.floor(Math.random()*51);    
        let randomValueG = Math.floor(Math.random()*101);
        let randomValueB = Math.floor(Math.random()*51);
        this.setColor(randomValueR, 100 + randomValueG, randomValueB); // sets color
        this.setSecondSquareOn(new RGB(randomValueR, 150 + randomValueG, randomValueB) ); // sets second square to on
        this.setUpdateStep(SNAKE_MAX_SPEED); // sets an update speed    
        this.setWrapAroundOn(); // make snake wrap around by default
        this.setGridSnapOn(); // grid aligned 
        this.setDirection(1,0); // starting direction
        this.disableAutoBB(); // no auto bounding box
        this.popSquare(); // remove default square
        this.direction = directionEnum.RIGHT; // sets our snake direction
        this.nextDirection = directionEnum.RIGHT; // creates nextDirection attribute (vectot)
        this.headPos = new Vector(0,0); // the position of our snake head square (vector)
        this.isAlive = true; // bool for snake being alive or not
        this.snakeSpeedLerp = 0; // snake speed lerp between min and max speed (float)
        this.snakeSpeedInc = 0.05; // our snake speed increment value (float)
        this.wrapSnake = true; // bool that determines if snake can wrap screen
        this.player = 1; // int that determines if player 1 or player 2
    }

    // simple methods to set gameOver text
    pushPlayerWonText(){this.pushText("WON");}
    pushPlayerLostText(){this.pushText("LOST");}
    pushText(status){
        this._gameGrid._gameOverText.push("PLAYER " + this.player + " " + status);
        let appleCount = this._squareArray.length-2;
        let appleText = " apples";
        if(appleCount==1) appleText = " apple";
        this._gameGrid._gameOverText.push("PLAYER " + this.player + " ate " + appleCount + appleText);
    }

    // captures the canvas mouse click to change the snake direction
    // this method is called by gameGrid and must have a mousePos argument
    // we are just ovewritting this virtual method
    mouseClick(mousePos){
        if(this.player==1){
            // here we do 2 dot products to determin where the nextDirection is
            let centerVec = new Vector(this._gameGrid.getPixelWidth()/2, this._gameGrid.getPixelHeight()/2);
            let normVec = centerVec.sub(mousePos).normalized();
            let dotUp = normVec.dot(new Vector(0,1));
            let dotLeft = normVec.dot(new Vector(1,0));
            if(dotUp > 0.707) this.nextDirection = new Vector(0,-1);
            else if(dotUp < -0.707) this.nextDirection = new Vector(0,1);
            else if(dotLeft > 0.707) this.nextDirection = new Vector(-1,0);
            else this.nextDirection = new Vector(1,0); 
        }
    }

    // convinient method to set both direction and nextDirection vector.
    // argument direction must be a Vector()
    setSnakeDirection(direction){
        this.direction = direction;
        this.nextDirection = direction;
    }

    // use this method to set this snake dead.
    // stop all updates and changes it color
    killSnake(){
        this.isAlive = false;
        this.setColor(10,50,10);  
        this.setSecondSquareOff(); 
        this.disableUpdate();
        this.postRender = function(gameGrid){return true;}
        return false;
    }

    // overwritting postRender virtual method to draw snake head
    postRender(gameGrid){
        let headSquare = this.getSquare();
        headSquare.drawSquare(headSquare.getTopLeft(), new Vector(1,1), new RGB(50,100,50));
    }

    // placing our snake head and tail squares in the tile array at start
    start(gameGrid){
        // position tail square based on direction
        this.tailPos = this.headPos.sum(this.nextDirection.mul(-1));
        // add head and tail squares
        this.pushSquare(new Square( this.headPos ));
        this.pushSquare(new Square( this.tailPos ));
        // ocupies game tiles with our head and tail squares
        gameGrid.ocupyTile(
            gameGrid.convertVectorToIndex(this.headPos), 
            tileEnum.SNAKE);

        gameGrid.ocupyTile(
            gameGrid.convertVectorToIndex(this.tailPos), 
            tileEnum.SNAKE);
    }

    // overriding inputKeyDown virtual method to change snake direction with keyboard inputs
    inputKeyDown(keyCode){
        if(keyCode == this.keys.UP) this.nextDirection = new Vector(0,-1);
        else if(keyCode == this.keys.DOWN) this.nextDirection = new Vector(0,1);
        else if(keyCode == this.keys.LEFT) this.nextDirection = new Vector(-1,0);
        else if(keyCode == this.keys.RIGHT) this.nextDirection = new Vector(1,0);
    }

    // overriding our update method.
    // here is where we update our snake body
    update(gameGrid){

        // here we get our nextDirection 
        if(this.direction.isEqual( this.nextDirection.mul(-1) ) == false){
            this.direction = this.nextDirection;
        }
        // checks if snake wet past the screen edges
        let nextHeadPos = this.headPos.sum(this.direction);
        nextHeadPos = this.screenCheck(nextHeadPos);
        if(nextHeadPos.status==true && this.wrapSnake==false){
            return this.killSnake();
        }
        // get our snake targeting next tile to ocupy
        let realHeadPos = nextHeadPos.sum(new Vector(.5,.5) );
        let headIndex = gameGrid.convertVectorToIndex(nextHeadPos);
        let tileType = gameGrid.getTileType(headIndex);

        // check for portal position jumps first
        if(tileType == tileEnum.PORTAL){

            let portal = gameGrid.portals[0];
            if(gameGrid.portals[0].position.isEqual(realHeadPos)) portal = gameGrid.portals[1];
            nextHeadPos = portal.position.sub(new Vector(.5,.5)).sum(this.direction);
            nextHeadPos = this.screenCheck(nextHeadPos);
            if(nextHeadPos.status==true && this.wrapSnake==false) return this.killSnake();
            headIndex = gameGrid.convertVectorToIndex(nextHeadPos);
            tileType = gameGrid.getTileType(headIndex);
        }
        
        // test what type of tyle it is and do its proper code accordingly.
        if(tileType == tileEnum.APPLE){
            // if apple then grow snake and move this apple to a new free location
            if(this._squareArray.length >= gameGrid._area-1){
                gameGrid._gameOverText.push("PLAYER " + this.player + " WON!!!");
                this.gameOver();
            }
            for(let i=0; i<gameGrid.apples.length; i++){
                let apple = gameGrid.apples[i];
                if(apple.exists){
                    if(apple.position.isEqual(nextHeadPos.sum(new Vector(.5,.5) ))){
                        apple.moveIt = true;
                        break;
                    }
                }
            }
            // increase snake speed
            this.snakeSpeedLerp += this.snakeSpeedInc;
            if(this.snakeSpeedLerp<=1.0){
                this.setUpdateStep( lerp(SNAKE_MAX_SPEED, SNAKE_MIN_SPEED, this.snakeSpeedLerp) ); 
            } 
        }
        // if empty or portal than just pop the snake tail
        else if(tileType == tileEnum.EMPTY){
            let tailSquare = this.popSquare();
            let tailIndex = gameGrid.convertVectorToIndex(tailSquare.position);
            gameGrid.freeTile(tailIndex); 
        }
        // if tile is snake or obstacle then kill snake
        else{
            return this.killSnake();
        }

        // ocupy target tile with our new snake head.
        if(tileType==tileEnum.APPLE) gameGrid.setTileType(headIndex, tileEnum.SNAKE);
        else gameGrid.ocupyTile(headIndex, tileEnum.SNAKE);
        let newHeadSquare = new Square(nextHeadPos);
        this.insertSquare(newHeadSquare);
        this.headPos = nextHeadPos;
    }

    // overwrting move method to keep snake gameObject still.
    // we just want to update the snake internal square objects
    move(){return true;}
    
}

/*
Our apple class.
Simple class to encapsulate the apple random placement. 
A snake will change an apple this.moveIt attribute if it ever touches it
This class must be added to our gameGrid factory. Do not initialize it in code.
That has to be done by our gameGrid
*/
class Apple extends GameObject{
    // same constructor as gameObject. Please check gameObject class for more info
    constructor(gameGrid, x=0, y=0, canUpdate=true, canRender=true){
        super(gameGrid=gameGrid, x=x, y=y, canUpdate=canUpdate, canRender=canRender);
        // applpe basic settings
        this.setWrapAroundOn();
        this.setGridSnapOn();
        this.setUpdateStep(SNAKE_MIN_SPEED);   
        let randomValue = Math.floor(Math.random()*51);
        this.setColor(200+randomValue,randomValue,randomValue);
        this.moveIt = false;
        this.exists = true;

    }
    // randomly places the apple at start
    start(gameGrid){
        this.randomMove();
    }
    // check if apple need to be moved
    update(gameGrid){
        if(this.moveIt==true) this.randomMove();
    }
    // moves the apple to a new random and free tile
    randomMove(){
        let freeIndex = gameGrid.getRandomFreeTileIndex();
        if(freeIndex==null){
            // hides apple if no free index is available
            this.exists = false;
            this.hide();
            this.disableUpdate();
            //console.log("dead apple")
        }
        else{
            this.setIndexPosition(freeIndex);
            gameGrid.ocupyTile(freeIndex, tileEnum.APPLE);
            this.moveIt = false;
        }
        
    }
}

// simple AI method for computer snake
// makes the snake move towards the closest apple while avoiding obstacles
// argument 1 is a snake and argument 2 is the gameGrid
function AI(snake, gameGrid){

    // here we search and pick the closest apple to our snake head
    let headPos = snake.headPos.sum(new Vector(0.5,0.5));
    let closestApple = gameGrid.apples[0];
    let smallestLen = gameGrid.apples[0].getPosition().sub( headPos ).len();

    for(let i=1; i<gameGrid.apples.length; i++){
        let thisApple = gameGrid.apples[i];
        let currentLen = thisApple.getPosition().sub( headPos ).len();
        if(currentLen<smallestLen){
            closestApple = thisApple;
            smallestLen = currentLen;
        }
    }
    gameGrid.debug.position = closestApple.getPosition();
    let dir = closestApple.getPosition().sub( headPos );

    // now we try to find what is the next nextDirection available
    let targetDirection;
    if( Math.abs(dir.x) < Math.abs(dir.y) ){ 
        if(dir.x > 0){
            if(snake.direction.isEqual(directionEnum.LEFT)==false) targetDirection = directionEnum.RIGHT;
            else{
                if(dir.y > 0) targetDirection = directionEnum.DOWN;
                else if(dir.y < 0) targetDirection = directionEnum.UP;
                else targetDirection = [directionEnum.UP, directionEnum.DOWN][Math.floor(Math.random()*2)];
            }
        } 
        else if(dir.x < 0){
            if(snake.direction.isEqual(directionEnum.RIGHT)==false) targetDirection = directionEnum.LEFT;
            else{
                if(dir.y > 0) targetDirection = directionEnum.DOWN;
                else if(dir.y < 0) targetDirection = directionEnum.UP;
                else targetDirection = [directionEnum.UP, directionEnum.DOWN][Math.floor(Math.random()*2)];
            }
        }
        else {
            if(dir.y > 0) targetDirection = directionEnum.DOWN;
            else if(dir.y < 0) targetDirection = directionEnum.UP;
            else targetDirection = [directionEnum.UP, directionEnum.DOWN][Math.floor(Math.random()*2)];
        }
        
    }
    else{
        if(dir.y > 0){
            if(snake.direction.isEqual(directionEnum.UP)==false) targetDirection = directionEnum.DOWN;
            else{
                if(dir.x > 0) targetDirection = directionEnum.RIGHT;
                else if(dir.x < 0) targetDirection = directionEnum.LEFT;
                else targetDirection = [directionEnum.RIGHT, directionEnum.LEFT][Math.floor(Math.random()*2)];
            }
        } 
        else if(dir.y < 0){
            if(snake.direction.isEqual(directionEnum.DOWN)==false) targetDirection = directionEnum.UP;
            else{
                if(dir.x > 0) targetDirection = directionEnum.RIGHT;
                else if(dir.x < 0) targetDirection = directionEnum.LEFT;
                else targetDirection = [directionEnum.RIGHT, directionEnum.LEFT][Math.floor(Math.random()*2)];
            }
        }
        else{
            if(dir.x > 0) targetDirection = directionEnum.RIGHT;
            else if(dir.x < 0) targetDirection = directionEnum.LEFT;
            else targetDirection = [directionEnum.RIGHT, directionEnum.LEFT][Math.floor(Math.random()*2)];
        }
    }
    // now that we have a target next direction we need to check what ocupies this target tile
    let targetPos = snake.headPos.sum(targetDirection);
    let resultVec = snake.screenCheck(targetPos);
    if(resultVec.status==true) targetPos = resultVec;
    let targetTileIndex = gameGrid.convertVectorToIndex(targetPos);

    // if tile is a snake, obstacle or portal then we need to pick a new target direction
    if(gameGrid._tiles[targetTileIndex]>=tileEnum.PORTAL){
        
        // we check alternatives to our target next direction
        let randomStart = Math.floor(Math.random() * 4);
        for(let i=0; i<4; i++){
            let index = (randomStart + i) % 4;
            let dirAttr = directionEnumAttrArray[index];
            let currentDirection = directionEnum[dirAttr];
            if( currentDirection.isEqual( snake.direction.mul(-1) )) continue;
            else if(currentDirection.isEqual(targetDirection)) continue;
            else{
                let testPos = snake.headPos.sum(currentDirection);
                let testPosIndex = gameGrid.convertVectorToIndex(testPos);
                if(gameGrid._tiles[testPosIndex] <= tileEnum.APPLE){
                    console.log("works");
                    targetDirection = currentDirection;
                    break;
                } 

            }
        }
    }
    // sets our next direction
    snake.nextDirection = targetDirection;
}

// here we create our gameGrid and add the new gameObjects to our factory
var gameGrid = new GameGrid(GRID_UNITS, GRID_UNITS, CANVAS_SCALE);
gameGrid.addToFactory("Snake", Snake);
gameGrid.addToFactory("Apple", Apple);

// turning on our debug square to show our AI apple target
gameGrid.postStart = function(){
    if(modeEnum[gameGrid.mode]==2){
        gameGrid.debug.getSquare().setSize(0.5, 0.5);
        gameGrid.debug.show();
    }    
}
// our gameGrid start method is where we create and place everything.
gameGrid.start = function(){

    // setting our start screen and game over texts
    this._startText = ["Snake Game", "Enter: start game", 
    "Space: pause game", "R: reset game", "P1: arrow keys", "P2: WASD"];
    this._gameOverText = ["Game Over"];
    // get our game mode
    this.mode = $("select#mode").val();

    let midH = parseInt(gameGrid.getWidth()/2);
    let midV = parseInt(gameGrid.getHeight()/2);
    
    this.apples = [];
    this.obstacles = [];
    this.portals = [];
    // get and validate our speed increment input
    let snakeSpeedIncrement = Number( $("input#sppedInc").val() );
    if(snakeSpeedIncrement<0) snakeSpeedIncrement=0;
    else if(snakeSpeedIncrement>10) snakeSpeedIncrement=10;
    snakeSpeedIncrement /= 100;

    // here we create player 1 snake
    let snake = gameGrid.createGameObject("snake", "Snake");
    snake.setSnakeDirection(directionEnum.RIGHT);
    snake.snakeSpeedInc = snakeSpeedIncrement;

    // here we get our wrap around input
    snake.wrapSnake = $("input#wrapAround").prop('checked');
    
    // any mode other than 0 we create a snake2 with or without AI
    if(modeEnum[gameGrid.mode]>0){
        let snake2 = gameGrid.createGameObject("snake2", "Snake");
        snake2.setSnakeDirection(directionEnum.LEFT);
        snake2.snakeSpeedInc = snakeSpeedIncrement
        snake2.wrapSnake = snake.wrapSnake;
        snake2.headPos = new Vector(gameGrid.getWidth()-3,midV);
        snake.headPos = new Vector(2, midV);

        // if 2nd player mode then set our nsake to have WASD key inputs
        if(modeEnum[gameGrid.mode]==1){
            snake2.keys = {
                UP:keyCodesEnum.W,
                DOWN:keyCodesEnum.S,
                LEFT:keyCodesEnum.A,
                RIGHT:keyCodesEnum.D
                };
            snake2.player = 2;
        }
        // if AI than add an AI to our 2nd snake
        else if(modeEnum[gameGrid.mode]==2){
            snake2.preUpdate = function(gameGrid){
                AI(snake2, gameGrid);
            }
            snake2.inputKeyDown = function(keyCode){return true;}
            snake2.player = "AI";
        }
        // make sure our AI snake turns off debug square if it dies
        snake2.gameOver = function(){
            this._gameGrid.debug.hide();
        }
    }
    else snake.headPos = new Vector(midH-1,midV);

    // here we check our apples input and validate
    let appleNum = $("input#apples").val();
    appleNum = Number(appleNum);
    if(isNaN(appleNum)==true) throw Error("Apple input must be a number between 1 and " + OBJECTS_MAX);
    if(appleNum<1) appleNum=1;
    else if(appleNum>OBJECTS_MAX) appleNum=OBJECTS_MAX;

    // now we create our apple objects
    for(let i=0; i<appleNum; i++){
        let apple = gameGrid.createGameObject("apple" + (i+1), "Apple");
        apple.appleIndex = i;
        gameGrid.apples.push(apple);
    }

    // here we check our obstacles input and validate
    let obstacleNum = $("input#obstacles").val();
    obstacleNum = Number(obstacleNum);
    if(isNaN(obstacleNum)==true) throw Error("Obstacles input must be a number between 1 and " + OBJECTS_MAX);
    if(obstacleNum<0) obstacleNum=0;
    else if(obstacleNum>OBJECTS_MAX) obstacleNum=OBJECTS_MAX;
    // now create our obstacles. lets loop through how many the user has defined
    for(let i=0; i<obstacleNum; i++){
        // creates basic gameObject
        let obstacle = gameGrid.createGameObject("obstacle" + (i+1), "Basic");
        // sets blue color with a small random variation
        let randomValue = Math.floor(Math.random()*51);
        obstacle.setColor(0,0,150 + randomValue);
        // gets a random position in the tile board that is available
        let randomIndex = gameGrid.getRandomFreeTileIndex();
        while(gameGrid.convertIndexToVector(randomIndex).y == midV + 0.5){
            randomIndex = gameGrid.getRandomFreeTileIndex();
        } 
        gameGrid.ocupyTile(randomIndex, tileEnum.ROCK);
        obstacle.position = gameGrid.convertIndexToVector(randomIndex);
        gameGrid.obstacles.push(obstacle);
    }

    // here we check our portal input and place them in the board if true
    if( $("input#portals").prop('checked') ){
        // creates portal A
        let portalA = gameGrid.createGameObject("portalA", "Basic");
        portalA.setColor(200,200,0); // sets color
        // gets free tile index and place portal there
        randomIndex = gameGrid.getRandomFreeTileIndex();
        while(gameGrid.convertIndexToVector(randomIndex).y == midV + 0.5){
            randomIndex = gameGrid.getRandomFreeTileIndex();
        } 
        gameGrid.ocupyTile(randomIndex, tileEnum.PORTAL);
        portalA.position = gameGrid.convertIndexToVector(randomIndex);
        gameGrid.portals.push(portalA);
        // creates portal B
        let portalB = gameGrid.createGameObject("portalB", "Basic");
        portalB.setColor(200,200,0); // sets color
        // gets free tile index and place portal there
        randomIndex = gameGrid.getRandomFreeTileIndex();
        while(gameGrid.convertIndexToVector(randomIndex).y == midV + 0.5){
            randomIndex = gameGrid.getRandomFreeTileIndex();
        } 
        gameGrid.ocupyTile(randomIndex, tileEnum.PORTAL);
        portalB.position = gameGrid.convertIndexToVector(randomIndex);
        gameGrid.portals.push(portalB);
    }
}

// define our gameGrid update to check the state of the game dependig on what game mode we chose
gameGrid.update = function(){
    let snake = this.getGameObject("snake");
    let snake2 = this.getGameObject("snake2");

    switch(modeEnum[gameGrid.mode]){
        case(0): // 1 player
            if(snake.isAlive==false){
                snake.pushPlayerLostText()
                this._setGameToOver();
            }
            break;
        case(1):
        case(2):
            if(snake.isAlive==false){
                snake.pushPlayerLostText()
                snake2.pushPlayerWonText()
                this._setGameToOver();
            }
            else if(snake2.isAlive==false){
                snake2.pushPlayerLostText()
                snake.pushPlayerWonText()
                this._setGameToOver();
            }
            else if(snake.isAlive==false && snake2.isAlive==false){
                snake2.pushPlayerLostText()
                snake.pushPlayerLostText()
                this._setGameToOver();
            }
            break;
        case(3):
            if(snake.isAlive==false || snake2.isAlive==false){
                snake.killSnake();
                snake2.killSnake();
                
                gameGrid._gameOverText.push("PLAYER 1 LOST");
                let appleCount = snake._squareArray.length-2;
                appleCount += snake2._squareArray.length-2;
                let appleText = " apples";
                if(appleCount==1) appleText = " apple";
                gameGrid._gameOverText.push("PLAYER 1 ate " + appleCount + appleText);

                gameGrid._setGameToOver();
            }
            break;
    }
}

// here we render our checkerboard bacground
gameGrid.greyColor1 = new RGB(140,140,160);
gameGrid.greyColor2 = new RGB(160,160,180);
gameGrid._renderBackground = function(){
    this.renderSquare(
        position = new Vector(0,0), 
        size = new Vector(this.getWidth(), this.getHeight()), 
        color = this.greyColor1,
        scaleOffset = false
        );
    for(let i=0; i<this._tiles.length; i++){
        let position = this.convertIndexToVector(i);
        if( (parseInt(i/this._width)+i) %2 ){
            this.renderSquare(position, size=new Vector(1,1), color=this.greyColor2 );
        }
    }
} 

// overwritting our mouse click to start/reset our game
gameGrid.mouseClick = function(mousePos){
    if(gameGrid._getGameState()==gameStateEnum.START) gameGrid._setGameToUpdate();
    else if(gameGrid._getGameState()==gameStateEnum.OVER) gameGrid._reset();
}

// finally we start our game loop :)
createGameLoop(gameGrid);



// simple logic validation to test our main classes 
// need to eventually change it to a better unit test 
function snakeLogicValidation()
{

    // calls our squareEngine logic validation
    logicValidation();

    // test JQuery methods
    try{
        $("#reset").click();
        $("#start").click();
        $("#pause").click();
        $("#pause").click();
        
        $("input, select#mode").change();
        $("#start").click();

        $("input#sppedInc").change();
        $("#start").click();

        $("input#apples, input#obstacles").change();
        $("#start").click();

        $("input#units").change();
        $("#start").click();
    }
    catch(err){
        throw new Error("Failed jquery test. Error: " + err.message);
    }

    // test creating our custom gameObjects Snake and Apple
    let gameObjectNames = ["Snake", "Apple"];
    let gameObjects = [Snake, Apple];
    try{
        for(let i=0; i< gameObjects.lengthl; i++){
            let aGameObject = new gameObjects[i](null);
        }
    }
    catch(err){
        throw new Error("Failed to create a new GameObject. Error: " + gameObjectNames[i]);
    }

    // all works!
    console.log("Snake game Logic validation successful!");

}

/*
Logic validation / test

Since this project is a game it's very hard to perform logic validation/test other than playing.
The game, as you see, if very complex and tuning the game was a very long series of tests.
The game library itself is very flexible and it's up to the dev to use it properly.

I have done the following tests:

1 - HTML inputs all works correctly.
2 - The JQuery input events and validation all works
3 - Keyboard and mouse click works.
4 - Game states and change of state all work properly and respond to the correct keys/clicks
5 - Game logic works and so far no bugs found.

I have tested this game throughly and can say it's all working as expected.

*/
