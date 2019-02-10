// a simple PONG clone using the squareEngine 

const CANVAS_WIDTH = 600;
const CANVAS_HEIGHT = 400;
const SPEED_UP = 0.02;

var gameGrid = new GameGrid(30, 20, CANVAS_WIDTH, CANVAS_HEIGHT);

gameGrid.setGameSpeed(0.1);
gameGrid.setGameStep(10);

let midH = parseInt(gameGrid.getWidth()/2)
let midV = parseInt(gameGrid.getHeight()/2)

// make dot first so it updates before paddles
let dot = gameGrid.createGameObject("dot", "Ball", x=midH, y=midV);

dot.setWrapAroundOff();
dot.setStepMoveOff();

dot.setRandomDirection();

dot.start = function(gameGrid){
    this.leftPaddle = gameGrid.getGameObject("paddle1");
    this.rightPaddle = gameGrid.getGameObject("paddle2");

    this.leftOffset = 1;
    this.rightOffset = 1;
}

dot.touchedLeft = function(x){
    let testVector = this.position.sum(new Vector(-1,0)); // check the position left to our dot
    if( this.leftPaddle.checkVectorCollision(testVector) == false ){

        if(this.leftPaddle._squareArray.length > 1){
            this.leftPaddle.popSquare();
            this.leftPaddle.updateBoundingBox()
            this.leftPaddle.paddleLength -= 1;
            gameGrid._gameSpeed += SPEED_UP;
        }
        else{
            this.disableUpdate();
            this.leftPaddle.disableUpdate();
            this.rightPaddle.disableUpdate();
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
            this.rightPaddle.updateBoundingBox()
            this.rightPaddle.paddleLength -= 1;
            gameGrid._gameSpeed += SPEED_UP;
        }
        else{
            this.disableUpdate();
            this.leftPaddle.disableUpdate();
            this.rightPaddle.disableUpdate();
            this.gameOver();
            gameGrid.print("Left player won!")
        }
    }
}


for(let p=0; p<2; p++){

    let name = "bar" + (p+1)
    let bar = gameGrid.createGameObject(name, "Basic");
    for(let i=0; i<gameGrid._height-1; i++) bar.pushSquare(new Vector(0,1+i))
    bar.setColor(130, 130, 130);
    if(p>0) bar.position.x = gameGrid._width-1;

    name = "paddle" + (p+1);
    let paddle = gameGrid.createGameObject(name, "Move");
    paddle.setColor(50, 50, 150);

    paddle.paddleLength = 4;

    let posX = p * (gameGrid.getWidth()-1);
    let posY = parseInt(gameGrid.getHeight()/2)-2;

    paddle.move(posX, posY)

    paddle.start = function(gameGrid){
        this.ball = gameGrid.getGameObject("dot");
    }

    if(p==1){
        paddle.moveKeys.UP = keyCodesEnum.UP;   
        paddle.moveKeys.DOWN = keyCodesEnum.DOWN;   
    }

    for(let i=0; i<3; i++) paddle.pushSquare(new Vector(0,1+i))

    paddle.moveKeys.RIGHT = null;
    paddle.moveKeys.LEFT = null;
    paddle.setWrapAroundOff()

    paddle.update = function(gameGrid){
        if(paddle.position.y < 0) paddle.position.y = 0;
        else if(paddle.position.y > gameGrid.getHeight()-paddle.paddleLength){
            paddle.position.y = gameGrid.getHeight()-paddle.paddleLength;
        } 
    }
}

createGameLoop(gameGrid);
