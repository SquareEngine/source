// a simple Flappy Bird clone using the squareEngine 

/*Constants*/
const WIDTH = 28; //canvas width
const HEIGHT = 25.6; //canvas height
const CANVAS_SCALE = 20; // canvas scale
const GRAVITY = 1.25; //bird fall gravity
const FALL_LIMIT = 0.15; //bird fall acceleration
const UP_FORCE = -17; //bird jump intensity
const NUM_PIPES = 3; //number of pipe objects
const PIPE_SPEED = 8; //speed of pipes
const PIPE_WIDTH = 2; //width of pipes
const PIPE_SCREEN_WIDTH = 30; //pipe creation start position
const GAP = 5; //gap between top and bottom part of pipe

var PIPE_Y_MOVE = 10; //horizontal distance between individual pipe objects

/*This class is for creating pipe objects that the flappy bird flies through*/
class Pipe extends GameObjectMove {
    
    constructor(gameGrid, x=0, y=0, canUpdate=true, canRender=true, wasd=false) {
        super(gameGrid=gameGrid, x=x, y=y, canUpdate=canUpdate, canRender=canRender);
        
        //this.bird = null;
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
            if(this.checkSquareCollision(this.bird) != false) { this.gameOver(); }
        }
        
        /*Move last pipe back to start position and change to random size*/
        if(this.position.x < -PIPE_WIDTH){
            let randomValue = Math.random();
            let yPosition = -GAP/2;
            yPosition -= PIPE_Y_MOVE/2;
            yPosition += PIPE_Y_MOVE * randomValue;
            this.position = new Vector(PIPE_SCREEN_WIDTH, yPosition);
            gameGrid.points += 1; //add point to score every time pipe reaches the end
            gameGrid.print("Score : " + gameGrid.points);
        }
        
    }//end gameGrid update
    
}//end Pipe class

/*create gameGrid object*/
var gameGrid = new GameGrid(WIDTH, HEIGHT, CANVAS_SCALE);

/*create gameGrid start function*/
gameGrid.start = function() {
    
    gameGrid._startText = ["TO PLAY","Use the up arrow","OR","Touch screen"];
    gameGrid._gameOverText = ["GAME OVER", "Press any key to continue"];
    gameGrid.setBackgroundColor(new RGB(0,104,204));
    gameGrid.points = 0;
    gameGrid.print("Score : " + gameGrid.points);
    gameGrid.addToFactory("Pipe", Pipe); //add pipe game object to game grid
    
    var bX = 4, bY = HEIGHT/2; //bird starting coordinates variables
    
    /*create bird object*/
    var bird = gameGrid.createGameObject("bird", "Basic", x=bX, y=bY);
    
    bird.setColor(204,0,0); //set bird color to red
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
gameGrid.click = function() {
    if(gameGrid._getGameState() == gameStateEnum.START) {
        gameGrid._setGameToUpdate();
    }else if(gameGrid._getGameState() == gameStateEnum.OVER) {
        gameGrid._reset();
    }
}//end of click function

/*use mouse click to resume game using click function*/
gameGrid.mouseClick = function(mousePosition) {
    gameGrid.click();
}

/*use keyboard press to resume game using click function*/
gameGrid.inputKeyDown = function(keyCode) {
    gameGrid.click();
}

createGameLoop(gameGrid); //run the game loop

document.getElementById("info").innerHTML = "Use SPACE to pause game. \nUse 'R' to restart.";