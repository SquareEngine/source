// a simple PONG clone using the squareEngine 

const CANVAS_SCALE = 20;
const SPEED_UP = 3;

var gameGrid = new GameGrid(36, 20, CANVAS_SCALE);

gameGrid.color1 = RGB.makeRandomColor();
gameGrid.color2 = RGB.makeRandomColor();
gameGrid.colorLerpCounter = 0
gameGrid.colorLerpDirection = false;
gameGrid.colorLerpSpeed = 10;

gameGrid.update = function(){
    
    let lerpValue = this.colorLerpCounter/this.colorLerpSpeed ;
    if(lerpValue>1) lerpValue=1;
    
    
    if(this.colorLerpDirection==true){
        let color = RGB.lerpColor(this.color1, this.color2, lerpValue);
        this.setBackgroundColor(color);
    }
    else {
        let color = RGB.lerpColor(this.color2, this.color1, lerpValue);
        this.setBackgroundColor(color);
    }

    if(this.colorLerpCounter >= this.colorLerpSpeed){
        this.colorLerpDirection = !this.colorLerpDirection;
        this.colorLerpCounter = 0;
    }
    else this.colorLerpCounter += this.getDeltaTime();
}

//gameGrid.setGameSpeed(100);

let midH = parseInt(gameGrid.getWidth()/2)
let midV = parseInt(gameGrid.getHeight()/2)

// make dot first so it updates before paddles
let dot = gameGrid.createGameObject("dot", "Ball", x=midH, y=midV);

dot.setRandomDirection(normalize=true);
dot.setSpeed(15);
dot.setColor(250,0,0);

dot.start = function(gameGrid){
    this.leftPaddle = gameGrid.getGameObject("paddle1");
    this.rightPaddle = gameGrid.getGameObject("paddle2");
    this.leftOffset += 1;
    this.rightOffset += 1;
}

dot.touchedLeft = function(x){
    let testVector = this.position.sum(new Vector(-1,0)); // check the position left to our dot
    if( this.leftPaddle.checkVectorCollision(testVector) == false ){

        if(this.leftPaddle.paddleLength > 1){

            this.leftPaddle.paddleLength -= 1;
            this.leftPaddle.getSquare().setSize(1, this.leftPaddle.paddleLength );
            this.leftPaddle.setAutoLimit();
            this.setSpeed( this.getSpeed() + SPEED_UP); // we can now lower or increase speed
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

        if(this.rightPaddle.paddleLength > 1){

            this.rightPaddle.paddleLength -= 1;
            this.rightPaddle.getSquare().setSize(1, this.rightPaddle.paddleLength );
            this.rightPaddle.setAutoLimit();
            this.setSpeed( this.getSpeed() + SPEED_UP); // we can now lower or increase speed
        }
        else{
            this.gameOver();
            gameGrid.print("Left player won!")
        }
    }
}


for(let p=0; p<2; p++){

    let name = "bar" + (p+1)
    let bar = gameGrid.createGameObject( name, "Basic", 
        x = 0.5 + (p * (gameGrid.getWidth()-1)), 
        y = gameGrid.getHeight() /2 );

    bar.setColor(130,130,130);
    bar.getSquare().setSize(1, gameGrid.getHeight());

    //############## paddles

    name = "paddle" + (p+1);
    let paddle = gameGrid.createGameObject( name, "Paddle", 
        x = 0.5 + (p * (gameGrid.getWidth()-1)), 
        y = gameGrid.getHeight() / 2 );

    paddle.setColor(50, 50, 150);
    paddle.setSpeed(10);
    paddle.paddleLength = 5;
    paddle.getSquare().setSize(1,5);
    paddle.setAutoLimit();

    if(p==0){
        paddle.setWasd();
        paddle.setVertical();
    } 
}

createGameLoop(gameGrid);
