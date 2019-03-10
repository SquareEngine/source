// a simple PONG clone using the squareEngine 

const CANVAS_SCALE = 30;
const SPEED_UP = 3;
const GRID_UNITS = 20;

// tile enum. add here to implement new tile types
tileEnum = {EMPTY:0, APPLE:1, PORTAL:2, SNAKE:3, ROCK:4};
modeEnum = {"one":0, "two":1, "AI":2, "doubble":3}
directionEnumAttrArray = ["UP", "DOWN", "LEFT", "RIGHT"];
directionEnum = {
    UP : new Vector(0,-1),
    DOWN : new Vector(0,1),
    LEFT : new Vector(-1,0),
    RIGHT : new Vector(1,0)
}


class Snake extends GameObject{
    constructor(gameGrid, x=0, y=0, canUpdate=true, canRender=true){
        super(gameGrid=gameGrid, x=x, y=y, canUpdate=canUpdate, canRender=canRender);

        this.keys = {
            UP:keyCodesEnum.UP,
            DOWN:keyCodesEnum.DOWN,
            LEFT:keyCodesEnum.LEFT,
            RIGHT:keyCodesEnum.RIGHT
            }

        let randomValue = Math.floor(Math.random()*101);
        this.setColor(randomValue, 100 + randomValue, randomValue);
        this.setSecondSquareOn(new RGB(randomValue, 150 + randomValue, randomValue) );
        this.setUpdateStep(.3);    
        this.setWrapAroundOn();
        this.setGridSnapOn();
        this.setDirection(1,0);
        this.disableAutoBB();
        this.popSquare();
        this.direction = directionEnum.RIGHT;
        this.nextDirection = directionEnum.RIGHT;
        this.headPos = new Vector(0,0);
        this.isAlive = true;
        this.snakeSpeedLerp = 0;
        this.snakeSpeedInc = 0.05;
        this.wrapSnake = true;
        this.inPortal = null;
        this.outPortal = null

    }

    setSnakeDirection(snakeEnum){
        this.direction = snakeEnum;
        this.nextDirection = snakeEnum;
    }

    killSnake(){
        this.isAlive = false;
        this.setColor(0,0,0);   
        this.disableUpdate();
        return this.isAlive;
    }

    start(gameGrid){

        this.tailPos = this.headPos.sum(this.nextDirection.mul(-1));
        
        this.pushSquare(new Square( this.headPos ));
        this.pushSquare(new Square( this.tailPos ));

        gameGrid.ocupyTile(
            gameGrid.convertVectorToIndex(this.headPos), 
            tileEnum.SNAKE);

        gameGrid.ocupyTile(
            gameGrid.convertVectorToIndex(this.tailPos), 
            tileEnum.SNAKE);
    }

    inputKeyDown(keyCode){
        if(keyCode == this.keys.UP) this.nextDirection = new Vector(0,-1);
        else if(keyCode == this.keys.DOWN) this.nextDirection = new Vector(0,1);
        else if(keyCode == this.keys.LEFT) this.nextDirection = new Vector(-1,0);
        else if(keyCode == this.keys.RIGHT) this.nextDirection = new Vector(1,0);
    }

    update(gameGrid){

        if(this.direction.isEqual( this.nextDirection.mul(-1) ) == false){
            this.direction = this.nextDirection;
        }
    
        let nextHeadPos = this.headPos.sum(this.direction);
        let realHeadPos = nextHeadPos.sum(new Vector(.5,.5) );
        nextHeadPos = this.screenCheck(nextHeadPos);
        if(nextHeadPos.status==true && this.wrapSnake==false){
            return this.killSnake();
        }
    
        let newHeadSquare = new Square(nextHeadPos);
        let headIndex = gameGrid.convertVectorToIndex(nextHeadPos);
        let tileType = gameGrid.getTileType(headIndex);
        
        if(tileType == tileEnum.APPLE){
            for(let i=0; i<gameGrid.apples.length; i++){
                let apple = gameGrid.apples[i];
                if(apple.position.isEqual(realHeadPos)){
                    apple.moveIt = true;
                    break;
                }
            }
            this.snakeSpeedLerp += this.snakeSpeedInc;
            if(this.snakeSpeedLerp<1.0){
                this.setUpdateStep( lerp(0.3, 0.1, this.snakeSpeedLerp) ); 
            } 
            gameGrid.setTileType(headIndex, tileEnum.SNAKE);
        }
        else if(tileType == tileEnum.EMPTY || tileType == tileEnum.PORTAL){
            let tailSquare = this.popSquare();
            let tailIndex = gameGrid.convertVectorToIndex(tailSquare.position);

            gameGrid.freeTile(tailIndex); 
            

            if(tileType == tileEnum.PORTAL){
                if(gameGrid.portals[0].position.isEqual(realHeadPos)){
                    this.inPortal = gameGrid.portals[0];
                    this.outPortal = gameGrid.portals[1]
                }
                else{
                    this.inPortal = gameGrid.portals[1];
                    this.outPortal = gameGrid.portals[0]
                }
                nextHeadPos = this.outPortal.position.sub(new Vector(.5,.5));
            }
            else gameGrid.ocupyTile(headIndex, tileEnum.SNAKE);
            
            if(this.inPortal){
                if(gameGrid.convertVectorToIndex(this.inPortal)==tailIndex){
                    this.inPortal=null
                    gameGrid.setTileType(tailIndex, tileEnum.PORTAL);
                }
            }
            else if(this.outPortal){
                if(gameGrid.convertVectorToIndex(this.outPortal)==tailIndex){
                    this.outPortal=null
                    gameGrid.setTileType(tailIndex, tileEnum.PORTAL);
                }
            }
        }
        else{
            return this.killSnake();
        }

        this.insertSquare(newHeadSquare);
        this.headPos = nextHeadPos;
    }

    move(){return true;}
    
}

class Apple extends GameObject{
    constructor(gameGrid, x=0, y=0, canUpdate=true, canRender=true){
        super(gameGrid=gameGrid, x=x, y=y, canUpdate=canUpdate, canRender=canRender);

        this.setWrapAroundOn();
        this.setGridSnapOn();
        this.setUpdateStep(0.1);   
        
        let randomValue = Math.floor(Math.random()*51);
        this.setColor(200+randomValue,randomValue,randomValue);
        this.moveIt = false;

    }
    start(gameGrid){
        let freeIndex = gameGrid.getRandomFreeTileIndex();
        this.position = gameGrid.convertIndexToVector(freeIndex);

        gameGrid.ocupyTile(freeIndex, tileEnum.APPLE);
    }

    update(gameGrid){
        if(this.moveIt==true) this.randomMove();
    }
    
    randomMove(){
    
        //let indexPos = this.getPositionAsIndex();
        //let newIndex = Math.floor( Math.random() * this._gameGrid._emptyTiles.length );
        let newIndex = this._gameGrid.getRandomFreeTileIndex();
    
        gameGrid.ocupyTile(newIndex, tileEnum.APPLE);
        //gameGrid.freeTile(indexPos);
    
        this.setIndexPosition(newIndex)
        this.moveIt = false;
    }
}

function AI(snake, gameGrid){
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

    //dir.truncate();
    //let applePos = closestApple.getPosition();
    //applePos.truncate();
     
    /* gameGrid.print("apple:")
    gameGrid.printAdd(applePos.x + " " + applePos.y);
    gameGrid.printAdd("head:")
    gameGrid.printAdd(headPos.x + " " + headPos.y);
    gameGrid.printAdd("vec:")
    gameGrid.printAdd(dir.x + " " + dir.y);
    gameGrid.printAdd("len:")
    gameGrid.printAdd(dir.len()); */

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
    let targetPos = snake.headPos.sum(targetDirection);
    let resultVec = snake.screenCheck(targetPos);
    if(resultVec.status==true) targetPos = resultVec;
    let targetTileIndex = gameGrid.convertVectorToIndex(targetPos);

    if(gameGrid._tiles[targetTileIndex]>=tileEnum.SNAKE){

        //console.log("snake at " + targetPos.x + " " + targetPos.y);
        //console.log("currentPos at " + snake.headPos.x + " " + snake.headPos.y);
        //console.log("currentDir at " + snake.direction.x + " " + snake.direction.y);

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
    snake.nextDirection = targetDirection;
}

var gameGrid = new GameGrid(GRID_UNITS, GRID_UNITS, CANVAS_SCALE);
gameGrid.addToFactory("Snake", Snake);
gameGrid.addToFactory("Apple", Apple);

gameGrid.postStart = function(){
    if(modeEnum[gameGrid.mode]==2){
        gameGrid.debug.getSquare().setSize(0.5, 0.5);
        gameGrid.debug.show();
    }    
}
gameGrid.start = function(){

    gameGrid.mode = $("select#mode").val()

    let midH = parseInt(gameGrid.getWidth()/2)
    let midV = parseInt(gameGrid.getHeight()/2)
    
    gameGrid.apples = [];
    gameGrid.obstacles = [];
    gameGrid.portals = [];

    let portalA = gameGrid.createGameObject("portalA", "Basic");
    portalA.setColor(200,200,0);
    randomIndex = gameGrid.getRandomFreeTileIndex();
    gameGrid.setTileType(randomIndex, tileEnum.PORTAL);
    portalA.position = gameGrid.convertIndexToVector(randomIndex);
    gameGrid.portals.push(portalA);

    let portalB = gameGrid.createGameObject("portalB", "Basic");
    portalB.setColor(200,200,0);
    randomIndex = gameGrid.getRandomFreeTileIndex();
    gameGrid.setTileType(randomIndex, tileEnum.PORTAL);
    portalB.position = gameGrid.convertIndexToVector(randomIndex);
    gameGrid.portals.push(portalB);


    let snakeSpeedIncrement = Number( $("input#sppedInc").val() );
    if(snakeSpeedIncrement<0) snakeSpeedIncrement=0;
    else if(snakeSpeedIncrement>10) snakeSpeedIncrement=10;
    snakeSpeedIncrement /= 100;

    let snake = gameGrid.createGameObject("snake", "Snake");
    snake.setSnakeDirection(directionEnum.RIGHT);
    snake.snakeSpeedInc = snakeSpeedIncrement
    snake.wrapSnake = $("input#wrapAround").prop('checked');
    

    if(modeEnum[gameGrid.mode]>0){
        let snake2 = gameGrid.createGameObject("snake2", "Snake");
        snake2.setSnakeDirection(directionEnum.LEFT);
        snake2.snakeSpeedInc = snakeSpeedIncrement
        snake2.wrapSnake = $("input#wrapAround").prop('checked');
        snake2.headPos = new Vector(gameGrid.getWidth()-3,midV);
        snake.headPos = new Vector(2, midV);

        if(modeEnum[gameGrid.mode]==1){
            snake2.keys = {
                UP:keyCodesEnum.W,
                DOWN:keyCodesEnum.S,
                LEFT:keyCodesEnum.A,
                RIGHT:keyCodesEnum.D
                }
            }
        else if(modeEnum[gameGrid.mode]==2){
            snake2.preUpdate = function(gameGrid){
                AI(snake2, gameGrid);
            }
            snake2.inputKeyDown = function(keyCode){return true;}
        }

        snake2.gameOver = function(){
            this._gameGrid.debug.hide();
        }
    }
    else snake.headPos = new Vector(midH-1,midV);

    let appleNum = $("input#apples").val()
    appleNum = Number(appleNum);
    if(isNaN(appleNum)==true) throw Error("Apple input must be a number between 1 and 5")
    if(appleNum<1) appleNum=1;
    else if(appleNum>20) appleNum=10

    for(let i=0; i<appleNum; i++){
        let apple = gameGrid.createGameObject("apple" + (i+1), "Apple");
        gameGrid.apples.push(apple);
    }

    let obstacleNum = $("input#obstacles").val()
    obstacleNum = Number(obstacleNum);
    if(isNaN(obstacleNum)==true) throw Error("Obstacles input must be a number between 1 and 5")
    if(obstacleNum<0) obstacleNum=0;
    else if(obstacleNum>20) obstacleNum=10

    for(let i=0; i<obstacleNum; i++){
        let obstacle = gameGrid.createGameObject("obstacle" + (i+1), "Basic");
        let randomValue = Math.floor(Math.random()*51);
        obstacle.setColor(0,0,150 + randomValue);
        let randomIndex = gameGrid.getRandomFreeTileIndex();
        while(gameGrid.convertIndexToVector(randomIndex).y == midV + 0.5) randomIndex = gameGrid.getRandomFreeTileIndex()
        gameGrid.ocupyTile(randomIndex, tileEnum.ROCK);
        obstacle.position = gameGrid.convertIndexToVector(randomIndex);
        gameGrid.obstacles.push(obstacle);
    }

    

}

gameGrid.update = function(){
    let snake = this.getGameObject("snake");
    let snake2 = this.getGameObject("snake2");

    switch(modeEnum[gameGrid.mode]){
        case(0):
            if(snake.isAlive==false) this._setGameToOver();
            break;
        case(1):
            if(snake.isAlive==false && snake2.isAlive==false){
                this._setGameToOver();
            }
            break;
        case(2):
            if(snake.isAlive==false && snake2.isAlive==false){
                this._setGameToOver();
            }
            else if(snake2.isAlive==false) snake2.gameOver();
            break;
        case(3):
            if(snake.isAlive==false || snake2.isAlive==false){
                this._setGameToOver();
            }
            break;
    }
}

gameGrid.greyColor = new RGB(160,160,160)
gameGrid.snakeColor = RGB.makeRandomColor();
gameGrid.appleColor = RGB.makeRandomColor();
gameGrid.emptyColor = RGB.makeRandomColor();

gameGrid._renderBackground = function(){
    this.renderSquare(
        position = new Vector(0,0), 
        size = new Vector(this.getWidth(), this.getHeight()), 
        color = this._backGroundColor,
        scaleOffset = false
        );
    for(let i=0; i<this._tiles.length; i++){
        let position = this.convertIndexToVector(i);
        if( (parseInt(i/this._width)+i) %2 ){
            this.renderSquare(position, size=new Vector(1,1), color=this.greyColor );
        }
    }
} 

// JQuery events

$("#start").click( function(){ gameGrid._setGameToUpdate() });

$("#pause").click(
    function(){
        if(gameGrid._getGameState()==gameStateEnum.PAUSED) gameGrid._setGameToUpdate()
        else if(gameGrid._getGameState()==gameStateEnum.UPDATE) gameGrid._setGameToPaused()
    }
);

$("#reset").click( function(){ gameGrid._reset(); });

$("select#mode").change( function(){ $("#reset").click(); } );

$("input#sppedInc").change( function(){ 
    if($(this).val()<0) $(this).val(0);
    else if($(this).val()>10) $(this).val(10);
    gameGrid._reset()
});



createGameLoop(gameGrid);
