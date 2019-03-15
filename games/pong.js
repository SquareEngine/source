// a simple PONG clone using the squareEngine 

// first we set our constants
const CANVAS_X_UNITS = 36;
const CANVAS_y_UNITS = 20;
const CANVAS_SCALE = 20;
const SPEED_UP = 3;
const BALL_SPEED = 15;

// here we create a gameGrid object and give it a X & Y units 
//and the canvas scale (how many pixels X & Y will be)
var gameGrid = new GameGrid(CANVAS_X_UNITS, CANVAS_y_UNITS, CANVAS_SCALE);

// lets set our gameGrid background color to a random color!
// first create a random color
let randomColor = RGB.makeRandomColor();
// then we set our background color
gameGrid.setBackgroundColor(randomColor);

// now our game content creation is placed inside the start function of the gameGrid.
// that way the gameGrid can rebuild the game from scratch if game is reset.
gameGrid.start = function(){
    
    // set our title screen text
    this._startText = ["Pong Game", "Enter: start game", 
    "Space: pause game", "R: reset game", "P1: arrow keys", "P2: WASD"];

    // here we just get the screen center X & Y position
    let midHorizontal = parseInt(gameGrid.getWidth()/2)
    let midVertical = parseInt(gameGrid.getHeight()/2)

    //############## ball ##############

    // here we make our ball object
    let ball = gameGrid.createGameObject("ball", "Ball", x=midHorizontal, y=midVertical);

    // lets give it a random direction and set the speed
    ball.setRandomDirectionX(normalize=true);
    ball.setSpeed(BALL_SPEED);

    // at the start of the game (use start function) 
    //our ball will store the paddle objects and set its screen offset
    ball.start = function(gameGrid){
        this.leftPaddle = gameGrid.getGameObject("paddle1");
        this.rightPaddle = gameGrid.getGameObject("paddle2");
        // here we are just adding an offset on the left and right 
        //so that the ball bounces at same level as the paddles
        this.leftOffset += 1;
        this.rightOffset += 1;
    }

    // here we define the touchLeft function
    // this function is called when ball touche sthe left side of the screen
    ball.touchedLeft = function(){
        // check the position left to our ball
        // we use checkVectorCollision to check if testVector touches left paddle
        let testVector = this.position.sum(new Vector(-1,0)); 
        if( this.leftPaddle.checkVectorCollision(testVector) == false ){

            // if ball doesnt touch the paddle than lets shrink the left paddle
            // if left paddle is bigger than one than lets shrink it
            if(this.leftPaddle.paddleLength > 1){

                // lets get our paddle square and change it's size
                this.leftPaddle.paddleLength -= 1;
                this.leftPaddle.getSquare().setSize(1, this.leftPaddle.paddleLength );
                // here we update our paddle limit to match its new square size
                this.leftPaddle.setAutoLimit();
                // finally we make the ball faster :)
                this.setSpeed( this.getSpeed() + SPEED_UP); // we can now lower or increase speed
            }
            else{ // otherwise lets end the game
                this.gameOver();
                gameGrid.print("Right player won!")
            }
        }
    }

    // same as above but for the right paddle
    ball.touchedRight = function(){
        let testVector = this.position.sum(new Vector(1,0)); // check the position left to our ball
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

    // here we loop to make just 2 paddles so we dont repeat code
    for(let p=0; p<2; p++){

        // first we make 2 basic gameobjects to be the left and right side grey bars
        let name = "bar" + (p+1)
        let bar = gameGrid.createGameObject( name, "Basic", 
            x = 0.5 + (p * (gameGrid.getWidth()-1)), 
            y = gameGrid.getHeight() /2 );

        // set its color and size
        bar.setColor(130,130,130);
        bar.getSquare().setSize(1, gameGrid.getHeight());

        //############## paddles ##############

        // here we create a paddle game object that responds to keyboard inputs
        // here we give it a name and its X & Y position
        name = "paddle" + (p+1);
        let paddle = gameGrid.createGameObject( name, "Paddle", 
            x = 0.5 + (p * (gameGrid.getWidth()-1)), 
            y = gameGrid.getHeight() / 2 );

        // lets set the paddle color and speed
        paddle.setColor(50, 50, 150);
        paddle.setSpeed(10);
        // lets give its paddle length
        // if you length reaches 0 you lose the game
        paddle.paddleLength = 5;
        // set size and update paddle limits
        paddle.getSquare().setSize(1,5);
        paddle.setAutoLimit();

        // by default paddle object suse arrow keys
        // the second paddle will use the WASD keys
        if(p==0){
            paddle.setWasd();
            // make it vertical only
            paddle.setVertical();
        } 
    }

}

// finally we call our createGameLoop function and give it the gameGrid

createGameLoop(gameGrid);
