// a simple PONG clone using the squareEngine 

const CANVAS_SCALE = 20;
const SPEED_UP = 1;

var gameGrid = new GameGrid(30, 20, CANVAS_SCALE);

//gameGrid.setGameSpeed(100);

let midH = parseInt(gameGrid.getWidth()/2)
let midV = parseInt(gameGrid.getHeight()/2)

// make dot first so it updates before paddles
let dot = gameGrid.createGameObject("dot", "Ball", x=midH, y=midV);

dot.setWrapAroundOff();
//dot.setGridSnapOn();
dot.setRandomDirection(normalize=true);
//dot.direction = dot.direction.mul(0.01)
dot.setUpdateDelay(100);
dot.setColor(250,0,0);

dot.start = function(gameGrid){
    this.leftPaddle = gameGrid.getGameObject("paddle1");
    this.rightPaddle = gameGrid.getGameObject("paddle2");
    this.leftOffset = 1;
    this.botOffset = -1;
}

dot.touchedLeft = function(x){
    let testVector = this.position.sum(new Vector(-1,0)); // check the position left to our dot
    if( this.leftPaddle.checkVectorCollision(testVector) == false ){

        if(this.leftPaddle._squareArray.length > 1){
            this.leftPaddle.popSquare();
            this.leftPaddle.paddleLength -= 1;
            this.increaseUpdateSpeed( SPEED_UP); // we can now lower or increase speed
        }
        else{
            this.gameOver();
            gameGrid.print("Right player won!")
        }
    }
}

dot.touchedRight = function(x){
    let testVector = this.position.sum(new Vector(1,0)); // check the position left to our dot
    if( this.rightPaddle.checkVectorCollision(testVector) == false ){

        if(this.rightPaddle._squareArray.length > 1){
            this.rightPaddle.popSquare();
            this.rightPaddle.paddleLength -= 1;
            this.increaseUpdateSpeed( SPEED_UP);
        }
        else{
            this.gameOver();
            gameGrid.print("Left player won!")
        }
    }
}


for(let p=0; p<2; p++){

    let name = "bar" + (p+1)
    let bar = gameGrid.createGameObject(name, "Basic");
    bar.setColor(130,130,130);
    bar.moveTo(0.5,0)
    for(let i=0; i<gameGrid._height-1; i++){
        let square = new Square();
        square.position = new Vector(0,1+i) ;
        bar.pushSquare( square );
    } 
    bar.setColor(130, 130, 130);
    if(p>0) bar.position.x = gameGrid._width-0.5;

    //############## padddles

    name = "paddle" + (p+1);
    let paddle = gameGrid.createGameObject(name, "Move");
    paddle.setColor(50, 50, 150);
    paddle.moveKeys.RIGHT = null;
    paddle.moveKeys.LEFT = null;
    paddle.setWrapAroundOff()
    paddle.setUpdateDelay(50);
    paddle.paddleLength = 4;

    let posX = p * (gameGrid.getWidth()-1);
    let posY = parseInt(gameGrid.getHeight()/2)-2;
    let posVector = new Vector(posX, posY);
    paddle.moveTo(posVector, true)

    paddle.start = function(gameGrid){
        this.ball = gameGrid.getGameObject("dot");
    }

    if(p==1){
        paddle.moveKeys.UP = keyCodesEnum.UP;   
        paddle.moveKeys.DOWN = keyCodesEnum.DOWN;   
    }

    for(let i=0; i<3; i++){
        let square = new Square()
        square.position = new Vector(0,1+i);
        paddle.pushSquare(square  )
    } 

    paddle.update = function(gameGrid){
        if(paddle.position.y < 0) paddle.position.y = 0;
        else if(paddle.position.y > gameGrid.getHeight()-paddle.paddleLength+0.5){
            paddle.position.y = gameGrid.getHeight()-paddle.paddleLength+0.5;
        } 
    }
}

createGameLoop(gameGrid);
