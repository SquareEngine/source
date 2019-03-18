/**
*
*author: Tamires D Boniolo
*
*/

/* Simple breakOut game using the squareEngine.
 Paddle moves right and left with the arrows control on the keyboard.
 Seeting ball colision, counting points and game over. 
 
 This breakOut file needs our page to have loaded both these files to work:
1 - squareEngine.js
2 - JQuery.js
*/

//gameGrid constants
const CANVAS_SCALE = 26;
const SPEED_UP = 1;

//creating the grid of grid class (GameGrid)
var gameGrid = new GameGrid(30, 20, CANVAS_SCALE);

//showing the points on the game over screen
gameGrid.gameOver = function(){
    gameGrid.print("Your points: " + gameGrid.points);
}


// JQuery events to handle buttons (start, pause, reset) that affect the game
$("#start").click( function(){ gameGrid._setGameToUpdate() });
$("#pause").click(
    function(){
        if(gameGrid._getGameState()==gameStateEnum.PAUSED) gameGrid._setGameToUpdate()
        else if(gameGrid._getGameState()==gameStateEnum.UPDATE) gameGrid._setGameToPaused()
    }
);
$("#reset").click( function(){ gameGrid._reset(); });
$("input, select#mode").change( function(){ gameGrid._reset(); } );


//function to start the game
gameGrid.start = function(){
	
	//text on the screen before start to play
    gameGrid._startText = ["Enter: start", "Left arrow key: move left", "Right arrow key: move right"]
	
    var screenHorizontalHalf = parseInt(gameGrid.getWidth()/2);
    var paddleVerticalPosition = gameGrid.getHeight()-0.5;
    gameGrid.setBackgroundColor(RGB.makeRandomColor()); //ramdom background color on the game grid

    //print the points on the screen
    gameGrid.points = 0; //starts with 0
    gameGrid.print("Your points: " + gameGrid.points);

    //creating the bar under the paddle (createGameObject)
    var bar = gameGrid.createGameObject("bar", "Basic", x=screenHorizontalHalf, y=paddleVerticalPosition);
	bar.setColor(120,120,120); //grey
    bar.getSquare().size.x = gameGrid.getWidth();

    //creating the paddle object (createGameObject)
    var paddle = gameGrid.createGameObject("paddle", "Paddle", x=screenHorizontalHalf, y=paddleVerticalPosition);

    //disabling paddle Up, down and around moviment	
    paddle.setWrapAroundOff();
    paddle.setHorizontal()
    paddle.setSpeed(15);//speed of the paddle
    paddle.setColor(0,0,255); //blue

    paddle.getSquare().size.x = 5; //size of the paddle
    paddle.updateBoundingBox();
    paddle.setAutoLimit();


    //creating the ball object of ball class (GameObjectBall)
    var ball = gameGrid.createGameObject("ball", "Ball", x=screenHorizontalHalf, y=paddleVerticalPosition - 1);
    ball.setDirection(-1, -1);
    ball.setSpeed(15);//speed of the ball
    ball.botOffset += 1;
    ball.paddle = paddle;

    //check colission: touch bottom game over or touch the paddle bounce and return up.
    ball.touchedBot = function(){

        let testPosition = this.getPosition().sum(new Vector(0, 1))
        if(this.paddle.checkVectorCollision( testPosition ) ){
            this.direction.y = 1;
            if(this.position.x > this.paddle.position.x) this.direction.x = 1;
            else this.direction.x = -1;
          }
		  
		  //if ball touch bottom show gameOver text and r to reset the game
        else{
            gameGrid._gameOverText = ["GAME OVER", "Press R to reset"];
            this.gameOver();
        }
        
    }

    //create the blocks
    var xCount = 9;
    var yCount = 3;

    //create random colors
    var rColor1 = RGB.makeRandomColor();
    var rColor2 = RGB.makeRandomColor();
    var rColor3 = RGB.makeRandomColor();
	
	//create the blocks grid
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
            resultColor = RGB.lerpColor(resultColor, rColor3, j/yCount); // j/yCount returns a scalar (0to1) 

            block.setColorObject(resultColor); //ramdom color on blocks

            for(let i=0; i<2; i++){
                let square = new Square();
                square.position.x = i-1;
                block.pushSquare(square);
            }
			
			//check the colision on the sides of the screen. Bounce off the walls.
            block.ball = ball;
            block.update = function(gameGrid){
                let col = this.checkCollision( this.ball );
                if( col ){
                    if(col.size.x > col.size.y) this.ball.direction.y *= -1;
                    else this.ball.direction.x *= -1;
                    this.hide();
                    this.disableUpdate();
					
                    //calculating the points each time that breaks a block (+1)
                    gameGrid.points += 1;
                    gameGrid.print("Your points: " + gameGrid.points);
					
					//if destroyed all the blocks will show the message that you won and the option to restart
                    if(gameGrid.points >= (xCount * yCount)){
                        gameGrid._gameOverText = ["YOU WON!", "Press R to reset"];
                        this.gameOver();
                    }
                }
            }
        }
    }
}

//loop the game
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
