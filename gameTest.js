// a simple PONG test

const CANVAS_WIDTH = 600;
const CANVAS_HEIGHT = 400;

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
}

dot.touchedLeft = function(x){
    if(this.leftPaddle._squareArray.length > 1){
        this.leftPaddle._squareArray.pop();
    }
    else{
        this.disableUpdate();
        this.leftPaddle.disableUpdate();
        this.rightPaddle.disableUpdate();
        this.gameOver();
        gameGrid.print("Right player won!")
    }
    
}

dot.touchedRight = function(x){
    if(this.rightPaddle._squareArray.length > 1){
        this.rightPaddle._squareArray.pop();
    }
    else{
        this.disableUpdate();
        this.leftPaddle.disableUpdate();
        this.rightPaddle.disableUpdate();
        this.gameOver();
        gameGrid.print("Left player won!")
    }
}


for(let p=0; p<2; p++){

    let name = "paddle" + (p+1);

    let paddle = gameGrid.createGameObject(name, "Move");

    paddle.setColor(50, 50, 150);

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
        else if(paddle.position.y > gameGrid.getHeight()-4) paddle.position.y = gameGrid.getHeight()-4;

        if( this.checkVectorCollision( this.ball.getNextPosition() ) == true){
            this.ball.direction.x *= -1;
        }
    }
}

createGameLoop(gameGrid);
