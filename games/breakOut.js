/**
*
*author: Tamires D Boniolo
*
*/

/* Simple breakOut game using the squareEngine.
 Paddle moves right and left with the arrows control on the keyboard.
 Seeting ball colision, counting points and game over. 
*/

const CANVAS_SCALE = 20;
const SPEED_UP = 1;

var gameGrid = new GameGrid(30, 20, CANVAS_SCALE);

//game over and show the points
gameGrid.gameOver = function(){
    gameGrid.print("Your points: " + gameGrid.points);
}

gameGrid.start = function(){

    gameGrid._startText = ["BREAKOUT", "Enter: start", "Left arrow key: move left", "Right arrow key: move right"]

    var screenHorizontalHalf = parseInt(gameGrid.getWidth()/2);
    var paddleVerticalPosition = gameGrid.getHeight()-0.5;
    gameGrid.setBackgroundColor(RGB.makeRandomColor());

    //keep the points on the screen
    gameGrid.points = 0;
    gameGrid.print("Your points: " + gameGrid.points);

    //paddle starts on the middle of the screen
    var bar = gameGrid.createGameObject("bar", "Basic", x=screenHorizontalHalf, y=paddleVerticalPosition);
    bar.setColor(120,120,120);
    bar.getSquare().size.x = gameGrid.getWidth();

    // set paddle object
    var paddle = gameGrid.createGameObject("paddle", "Paddle", x=screenHorizontalHalf, y=paddleVerticalPosition);

    paddle.setWrapAroundOff();

    //disabling paddle Up and down moviment
    paddle.setHorizontal()
    paddle.setSpeed(15);
    paddle.setColor(0,0,255);   

    paddle.getSquare().size.x = 5;
    paddle.updateBoundingBox();
    paddle.setAutoLimit();


    //creating the ball object of ball class (GameObjectBall)
    var ball = gameGrid.createGameObject("ball", "Ball", x=screenHorizontalHalf, y=paddleVerticalPosition - 1);
    //ball.setUpdateDelay(1);
    ball.setDirection(-1, -1);
    ball.setSpeed(15);
    ball.botOffset += 1;
    ball.paddle = paddle;

    //touch bottom game over or touch the paddle and return up
    ball.touchedBot = function(){

        let testPosition = this.getPosition().sum(new Vector(0, 1))
        if(this.paddle.checkVectorCollision( testPosition ) ){
            //this.position.y = this.prevPosition.y;
            this.direction.y = 1;
            if(this.position.x > this.paddle.position.x) this.direction.x = 1;
            else this.direction.x = -1;
            //this.gameOver();
        }
        else{
            gameGrid._gameOverText = ["GAME OVER", "Press R to replay"];
            this.gameOver();
        }
        
    }

    //creating the blocks
    var xCount = 9;
    var yCount = 3;

    // create 3 random colors
    var rColor1 = RGB.makeRandomColor();
    var rColor2 = RGB.makeRandomColor();
    var rColor3 = RGB.makeRandomColor();

    for(let i =0; i<xCount; i++){
        for(let j =0; j<yCount; j++){
            // unique block name
            let name = "block_" + (i*j);
            let xPos = 3 + (3*i);
            let yPos = 1 + (j*2);
            let block = gameGrid.createGameObject(name, "Basic", x=xPos, y=yPos );

            // lerp between our 3 random colors
            // check the RGB lerp method
            let resultColor = RGB.lerpColor(rColor1, rColor2, i/xCount); // i/xCount returns a scalar (0to1) for our lerp
            resultColor = RGB.lerpColor(resultColor, rColor3, j/yCount); // j/yCount returns a scalar (0to1) for our lerp
            // as we loop through xCount and our i increases if you test i/xCount it will start at 0 and get close to 1
            // same for j/yCount

            block.setColorObject(resultColor);

            for(let i=0; i<2; i++){
                let square = new Square();
                square.position.x = i-1;
                block.pushSquare(square);
            }

            block.ball = ball;
            block.update = function(gameGrid){
                let col = this.checkCollision( this.ball );
                if( col ){
                    //this.position.y = this.prevPosition.y;
                    if(col.size.x > col.size.y) this.ball.direction.y *= -1;
                    else this.ball.direction.x *= -1;
                    this.hide();
                    this.disableUpdate();
                    //calculating the points
                    gameGrid.points += 1;
                    gameGrid.print("Your points: " + gameGrid.points);

                    if(gameGrid.points >= (xCount * yCount)){
                        gameGrid._gameOverText = ["YOU WON!", "Press R to replay"];
                        this.gameOver();
                    }
                }
            }
        }
    }
}

createGameLoop(gameGrid);


/** Validation Logic:

 1. I clicked on the space bar on the start screen of the game. It paused the game without started and I clicked again and the game started with the space bar.
 
 2. I entered letters and numbers before start the game, the while the game was on and on the game over screen. Nothing happened. Result:confirmed!
 
 3. When the game was paused I clicked on the enter tab and nothing happended. Then I clicked on the space bar and the game started again.
 
 4. When the player breaks all the blocks, the game don't show any alert that you won, it shows Game over alert.
 
 5. The game was on "game over" screen and I clicked the space bar, and the game paused it. And I clicked the space bar one more time and it went back to the game screen but it was fronzen and without any alert.
 
 6.The game does not have restart option. If the game is over you need to upload the page.
 
 7. The game does not have a start and pause button. You can only control the game with the keyboard.

 8. If the ball touch half way on the paddle and half way on the bottom it will be game over.
 
 9. When shows the game over screen, you still can "pause" the game, and it will change from game over screen to pause screen. If you keep to pressing the space bar for pause, it will make the alert "pause" go away and back.
 
      
*/
