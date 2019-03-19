/*
Beni Ungur

Group project - CSD 122 Javascript & JQuery
Winter 2019

s-Beniamin.Ungur@lwtech.edu
*/

// a simple Flappy Bird clone using the squareEngine 

/*Constants*/
const WIDTH = 35; //canvas width
const HEIGHT = 25; //canvas height
const CANVAS_SCALE = 20; // canvas scale
const GRAVITY = 1.25; //bird fall gravity
const FALL_LIMIT = 0.15; //bird fall acceleration
const UP_FORCE = -17; //bird jump intensity
const NUM_PIPES = 3; //number of pipe objects
const PIPE_SPEED = 8; //speed of pipes
const PIPE_WIDTH = 2; //width of pipes
const PIPE_SCREEN_WIDTH = 37; //pipe creation start position
const GAP = 5; //gap between top and bottom part of pipe

var PIPE_Y_MOVE = 10; //horizontal distance between individual pipe objects
var HIGH_SCORE = 0; //holds high score

// JQuery events to handle start, pause, reset buttons

$("#start").click( function(){ gameGrid._setGameToUpdate() });
$("#pause").click(
    function(){
        if(gameGrid._getGameState()==gameStateEnum.PAUSED) gameGrid._setGameToUpdate()
        else if(gameGrid._getGameState()==gameStateEnum.UPDATE) gameGrid._setGameToPaused()
    }
);
$("#reset").click( function(){ gameGrid._reset(); });


/*This class is for creating pipe objects that the flappy bird flies through*/
class Pipe extends GameObjectMove {
    
    constructor(gameGrid, x=0, y=0, canUpdate=true, canRender=true, wasd=false) {
        super(gameGrid=gameGrid, x=x, y=y, canUpdate=canUpdate, canRender=canRender);
        
        this.bird = null;
        this.setWrapAroundOff(); //prevents pipe from wrapping through the game grid
        this.setColor(0,153,0); //set pipe color to green
        this.setDirection(-1, 0); //set pipe direction to left
        this.setSpeed(PIPE_SPEED); //set pipe speed
        
        /*these two functions prevent the pipe from moving with the bird object*/
        this._inputKeyDown = function(keyCode) { return true; }
        this._inputKeyUp = function(keyCode) { return true; }
        
        /*sets the pipe to the proper size*/
        this.getSquare(0).setSize(PIPE_WIDTH, HEIGHT);
        this.pushSquare(new Square());
        this.getSquare(1).setSize(PIPE_WIDTH, HEIGHT);
        this.getSquare(1).setPosition(0, HEIGHT+GAP);
    }//end of constructor
    
    /*checks for collision, adds score, and repositions pipes*/
    update(gameGrid) {
        
        /*Check for collision*/
        if(this.bird != null) {
            if(this.checkSquareCollision(this.bird) !== false || this.bird.position.y >= HEIGHT || this.bird.position.y <= 0) { this.gameOver(); }
        }
        
        /*Move last pipe back to start position and change to random size*/
        if(this.position.x < -PIPE_WIDTH){
            let randomValue = Math.random();
            let yPosition = -GAP/2;
            yPosition -= PIPE_Y_MOVE/2;
            yPosition += PIPE_Y_MOVE * randomValue;
            this.position = new Vector(PIPE_SCREEN_WIDTH, yPosition);
            gameGrid.points += 1; //add point to score every time pipe reaches the end
            gameGrid.print("Score : " + gameGrid.points); //Display new score
            //Compare current score with high score, if greater new high score is displayed
            if(gameGrid.points > HIGH_SCORE) {
                HIGH_SCORE = gameGrid.points;
            }
        }

    }//end gameGrid update
    
}//end Pipe class

/*create gameGrid object*/
var gameGrid = new GameGrid(WIDTH, HEIGHT, CANVAS_SCALE);

/*create gameGrid start function*/
gameGrid.start = function() {
    
    gameGrid._startText = ["TO PLAY","Use the up arrow","OR","Touch screen"];
    gameGrid._gameOverText = ["GAME OVER", "Press R to reset"];
    gameGrid.setBackgroundColor(new RGB(0,104,204));
    gameGrid.points = 0;
    gameGrid.print("Score : " + gameGrid.points);
    document.getElementById("info").innerHTML = "High Score: " + HIGH_SCORE; //Display high score
    gameGrid.addToFactory("Pipe", Pipe); //add pipe game object to game grid
    
    var bX = 4, bY = HEIGHT/2; //bird starting coordinates variables
    
    /*create bird object*/
    var bird = gameGrid.createGameObject("bird", "Basic", x=bX, y=bY);
    
    bird.setColor(204,0,0); //set bird color to red
    bird.setWrapAroundOff();
    bird.fallVector = new Vector(0,0);//Instantiate bird fall vector

    /*Function to set bird's continuous fall velocity*/
    bird.update = function(gameGrid) {
        bird.fallVector.y += GRAVITY * gameGrid.getDeltaTime();
        if(bird.fallVector.y >= FALL_LIMIT) {
            bird.fallVector.y = FALL_LIMIT;
        }
        bird.position = bird.position.sum(bird.fallVector);
    }


    
    /*Function to make bird fly or "flap"*/
    bird.flap = function() {
        bird.fallVector = new Vector(0, UP_FORCE * gameGrid.getDeltaTime());
    }
    
    /*Function to bind UP key to flap function*/
    bird.inputKeyDown = function(keyCode) {
        if(keyCode == keyCodesEnum.UP) {
            bird.flap();
        }
    }
    /*Function to bind mouse click to flap function
      Useful for touch-screen users*/
    bird.mouseClick = function(mousePosition) {
        bird.flap();
    }

    /*Create individual pipe objects*/
    let xPosition = PIPE_SCREEN_WIDTH/NUM_PIPES;
    for(let i = 0; i < NUM_PIPES; i++) {
        let pipePositionX = xPosition * i;
        pipePositionX += WIDTH;
        let pipe = gameGrid.createGameObject("pipe" + (i+1), "Pipe", x=pipePositionX, y=-GAP/2);
        pipe.bird = bird;
    }
}//end of gameGrid start function

/*function to start or restart game*/
gameGrid.click = function(key=false) {
    if(gameGrid._getGameState() == gameStateEnum.START) {
        gameGrid._setGameToUpdate();
    }else if(gameGrid._getGameState() == gameStateEnum.OVER) {
        if(key==keyCodesEnum.RESET) gameGrid._reset();
    }
}//end of click function

/*use mouse click to resume game using click function*/
gameGrid.mouseClick = function(mousePosition) {
    gameGrid.click();
}

/*use keyboard press to resume game using click function*/
gameGrid.inputKeyDown = function(keyCode) {
    gameGrid.click(keyCode);
}

createGameLoop(gameGrid); //run the game loop

/*
Logic validation / test

The following validation logic is done by hand:

1 - HTML inputs all working correctly.
2 - The JQuery input events and validation all works
3 - Keyboard and mouse click works.
4 - Game states and change of state all work properly and respond to the correct keys/clicks
5 - Game logic works and so far no bugs found.

The game works as intended.

*/

// validation logic to test HTML buttons
function buttonsLogicValidation()
{

    // calls our squareEngine logic validation
    logicValidation();

    // test JQuery methods
    try{
        $("#reset").click();
        $("#start").click();
        $("#pause").click();
        $("#pause").click();

    }
    catch(err){
        throw new Error("Failed jquery test. Error: " + err.message);
    }
    // all works!
    console.log("Button validation successful!");

}