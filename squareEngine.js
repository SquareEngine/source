// simple enum to make it easier to interect with keycodes
var keyCodesEnum = {ENTER:13, RESET:82, SPACE:32, LEFT:37, RIGHT:39, UP:38, DOWN:40, W:87, A:65, S:83, D:68}
// tile enum. add here to implement new tile types
var tileEnum = {EMPTY:0};

// a simple enum with our 4 possible game states
var gameStateEnum = {START:0, UPDATE:1, PAUSED:2, OVER:3};

/*
The game engine class.
There should be only 1 gameGrid object per game file.
The gameGrid holds both the canvas and canvas context to render graphics.
gameGrid._tick() is called 60 times per second.
gameGrid methods and attributes that start with an "_" are not meant to be acceced from outside.
Most functions with an "_" will have a version without the "_" that can be overriden.
Ex: _render() is called by the _tick() and hsould not be changed, but you can use/override the render().

to create a gameObject you should use the gameGrid.createGameObject() method.
It will instanciate a new gameObject and place it inside the _gameObjects array.

*/
class GameGrid{
    constructor(width=10, height=10, canvasWidth=500, canvasHeight=500, gameSpeed=1, stepValue=100){

        this._width = width;
        this._height = height;
        this._area = width * height;
        this._tiles = [this._area];
        this._x_move_unit = canvasWidth / this._width;
        this._y_move_unit = canvasHeight / this._height;
        this._emptyTiles = [this._area];
        this._gameObjects = [];
        this._gameObjectsDict = {};
        this._factoryClasses = {"Basic":GameObject, "Move":GameObjectMove, "Ball":GameObjectBall, "Paddle":GameObjectPaddle}
        this._backGroundColor = "rgb(150, 150, 150)"

        this._logger = document.getElementById("logger"); 

        this._canvas = document.getElementById("squareEngineCanvas"); 
        this._canvas.width = canvasWidth;
        this._canvas.height = canvasHeight;
        this._context = this._canvas.getContext('2d');

        // time variables
        this._now;
        this._lastUpdate;
        this._deltaTime;
        this._stepCounter = 0;
        this._stepValue = stepValue;
        this._gameSpeed = gameSpeed;

        // game states        
        this._gameState = gameStateEnum.START;
    }

    _tick(){ // this method gets called about 60 times per second
        // get delta time
        this._now = Date.now();
        this._deltaTime = this._now - this._lastUpdate;
        this._lastUpdate = this._now;

        // a game simple state machine
        switch(this._gameState){
            case(gameStateEnum.START): // our start static screen
                this._startScreen();
                break;
            case(gameStateEnum.UPDATE): // our game update 
                // step counter can be used to make the game have stepped updates
                // set the stepCounter to 0 if you don't want stepped animation
                this._stepCounter += this._deltaTime * this._gameSpeed; 
                if(this._stepCounter >= this._stepValue){
                    this._update()
                    this._stepCounter = 0;
                }
                this._render();
                break;
            case(gameStateEnum.PAUSED):
                this._pause();
                break;
            case(gameStateEnum.OVER):
                this._gameOver()
                break;
        };
    }

    /*
    Both _inputKeyDown & _inputKeyUp are called by the keyboard event listener.
    If you ever override the keyboard input methods make sure you have the keyCode input argument.
    Ex: someGameObject.inputKeyDown = function(keyCode){ some code...}
    */
    _inputKeyDown(keyCode){
        this.inputKeyDown(keyCode);
        for(let i=0; i<this._gameObjects.length; i++) this._gameObjects[i]._inputKeyDown(keyCode);
    }
    _inputKeyUp(keyCode){
        this.inputKeyUp(keyCode);
        for(let i=0; i<this._gameObjects.length; i++) this._gameObjects[i]._inputKeyUp(keyCode);
    }

    _update(){
        // pre Update
        this.preUpdate()
        for(let i=0; i<this._gameObjects.length; i++) this._gameObjects[i]._preUpdate(this);

        // game update
        this.update();
        for(let i=0; i<this._gameObjects.length; i++) this._gameObjects[i]._update(this);

        // post update
        this.postUpdate()
        for(let i=0; i<this._gameObjects.length; i++) this._gameObjects[i]._postUpdate(this);
 
    }

    _reset(){
        this._stepCounter = 0; // reset the step counter always
        this.reset();
    }

    _render(){
        this._renderBackground(); // render background
        this.render(); // override render
        for(let i=0; i<this._gameObjects.length; i++) this._gameObjects[i]._render(this);
        this.renderGameUI(); // render UI
    }

    _startScreen(){ // start title screen - static 
        this._renderBackground();
        this.renderStartUI();
        return true;
    } 
    _gameOver(){ // game over screen - static - last game shot + UI
        this._render();
        this.renderGameOverUI()
        return true;
    } 
    _pause(){ // pause screen - static - current game paused + UI
        this._render();
        this.renderPauseUI();
        return true;
    } 

    _renderBackground(){
        this._context.fillStyle = this._backGroundColor;
        this._context.fillRect(0, 0, this._canvas.width, this._canvas.height);
    }

    _setGameToStart(){this._gameState = gameStateEnum.START;}
    _setGameToUpdate(){this._gameState = gameStateEnum.UPDATE;}
    _setGameToPaused(){this._gameState = gameStateEnum.PAUSED;}
    _setGameToOver(){this._gameState = gameStateEnum.OVER;}

    _start(){ for(let i=0; i<this._gameObjects.length; i++) this._gameObjects[i]._start(this); }

    //##########################################################################################
    //################################# methods to override ####################################
    //##########################################################################################

    preUpdate(){return true} // preUpdate stage if needed
    postUpdate(){return true} // post update if needed
    update(){return true} // update game grid logic
    render(){return true;} 
    renderStartUI(){
        this.renderText("PRESS ENTER TO START");
    }
    renderGameUI(){return true;}
    renderGameOverUI(){
        this.renderText("GAME OVER");
    }
    renderPauseUI(){
        this.renderText("PAUSE");
    }
    reset(){return true;} 

    inputKeyDown(keyCode){
        switch(keyCode){
            case(keyCodesEnum.SPACE):
                if(this._gameState == gameStateEnum.PAUSED) this._setGameToUpdate();
                else this._setGameToPaused();
                break;
            case(keyCodesEnum.ENTER):
                if(this._gameState == gameStateEnum.START) this._setGameToUpdate();
                break;
        }
    }
    inputKeyUp(keyCode){return true;}

    // use this method to get the delta time. Use the deltaTime to get smooth motion.
    // Ex: if you're moving an object by lets say X units on every update have it multiplied by deltaTime.
    getDeltaTime(){return this._deltaTime;}

    // you can use this method to add new gameObjects to the gameGrid
    addToFactory(gameObjectName, gameObjectClass){
        this._factoryClasses[gameObjectName]=gameObjectClass;
    }

    // creates and return a new gameObject. That gameObject is added to the gameGrid _gameObjects array
    createGameObject(name, objectType, x=0, y=0, canUpdate=true, canRender=true){
        let gameObjectClass = this._factoryClasses[objectType];
        if(gameObjectClass==undefined){
            this.print("Error: " + objectType + " is not a valid gameObject")
            return undefined;
        }
        let gameObject = new gameObjectClass(x, y, canUpdate, canRender);
        gameObject._gameGrid = this;
        this._gameObjects.push(gameObject);
        this._gameObjectsDict[name] = gameObject;
        return gameObject;
    }

    getGameObject(name){
        return this._gameObjectsDict[name];
    }

    // get width and height units
    getWidth(){return this._width;}
    getHeight(){return this._height;}

    // changes the game backGround color
    setBackgroundColor(r=150, g=150, b=150){
        this._backGroundColor = makeColorString(r,g,b);
    }

    // print, printAdd and erase can be used to diplay text on the <p> "logger" element
    print(text){this._logger.innerHTML = text;}
    printAdd(text){this._logger.innerHTML += "<br>" + text;}
    erase(){this._logger.innerHTML = "";}

    // changes the game speed & step values
    setGameSpeed(speed){this._gameSpeed=speed;}
    setGameStep(step){this._stepValue=step;}

    // renders a square at x & y positions with given size and color
    renderSquare(positionX, positionY, size, color){
        positionX *= this._x_move_unit;
        positionY *= this._x_move_unit;
        this._context.fillStyle = color;
        this._context.fillRect(
            positionX, 
            positionY, 
            this._x_move_unit, 
            this._y_move_unit);
    }

    renderText(text, positionX=0, positionY=this._canvas.height/2, size=50, color="rgb(0,0,0)"){
        this._context.fillStyle = color;
        this._context.font = size + 'px Arial';
        this._context.fillText(text, positionX, positionY);
    }

}


class GameObject {
    /*
    our base class for gameObjects.
    It shares many methods with gameGrid such as update(), render(), inputKeyUp & inputKeyDown().
    gameGrid loops through all of its gameObject and call these methods during render & update.
    */
    constructor(x=0, y=0, canUpdate=true, canRender=true){
        // this attributes can be used/changed
        this.position = new Vector(x,y); 
        this.direction = new Vector(0,0);

        // do not access or override these. Use methods below
        this._canUpdate = canUpdate;
        this._canRender = canRender;
        this._squareArray = [];
        this._color = "rgb(200, 0, 0)";
        this._wrapAround = true;
        this._gameGrid = null;
        this._canMove = true;
        this._stepMove = true;
        this._bb = new BoundingBox(new Vector(0,0), new Vector(1,1), this);

        this.pushSquare( new Vector(0,0) );
    }

    _preUpdate(gameGrid){ if(this._canUpdate == true) this.preUpdate(gameGrid); }
    _update(gameGrid){
        if(this._canUpdate == true) {
            if(this._canMove==true) this.move(this.direction.x, this.direction.y);
            this.update(gameGrid); 
        }
    }
    _postUpdate(gameGrid){ if(this._canUpdate == true) this.postUpdate(gameGrid); }

    _render(gameGrid){ 
        if(this._canRender == true){
            this.render(gameGrid); 
            // render square arrays
            for(let i=0; i<this._squareArray.length; i++){
                this.drawSquare(
                    this.horizontalCheck( this.position.x + this._squareArray[i].x), 
                    this.verticalCheck( this.position.y + this._squareArray[i].y)
                    );
            }
        } 
    }
    // method that gets called right before the game starts
    _start(gameGrid){
        this.updateBoundingBox(); // first thing is to generate a bounding box
        this.start(gameGrid);
    }

    _inputKeyDown(keyCode){this.inputKeyDown(keyCode);}
    _inputKeyUp(keyCode){this.inputKeyUp(keyCode);}

    //##########################################################################################
    //################################# methods to override ####################################
    //##########################################################################################

    hide(){this._canRender=false;}
    show(){this._canRender=true;}
    enableUpdate(){this._canUpdate=true;}
    disableUpdate(){this._canUpdate=false;}
    setWrapAroundOn(){this._wrapAround=true;}
    setWrapAroundOff(){this._wrapAround=false;}
    setMoveOn(){this._canMove=true;}
    setMoveOff(){this._canMove=false;}
    setStepMoveOn(){this._stepMove=true;}
    setStepMoveOff(){this._stepMove=false;}

    gameOver(){this._gameGrid._setGameToOver()};
    resetGame(){this._gameGrid._reset()};
    pauseGame(){this._gameGrid._setGameToPaused()}

    pushSquare(vector){ // pushes a square to your squareArray
        this._squareArray.push(vector);
    }
    popSquare(){ // pops a square to your squareArray
        return this._squareArray.pop();
    }
    removeSquare(index){ // removes a square in your squareArray at given index
        return this._squareArray.splice(index, 1);
    }
    removeFirstSquare(index){ // removes the first square in your squareArray
        return this._squareArray.splice(0, 1);
    }

    // when overriding these methods dont forget to pass a gameGrid input
    preUpdate(gameGrid){return true}; 
    update(gameGrid){return true;}
    postUpdate(gameGrid){return true;} 
    render(gameGrid){return true;}
    start(gameGrid){return true;}
   
    inputKeyDown(keyCode){return true;}
    inputKeyUp(keyCode){return true;}

    drawSquare(x, y, size=1, color=this._color){
        this._gameGrid.renderSquare(x, y, size, color);
    }

    setColor(r=150, g=150, b=150){
        this._color = makeColorString(r,g,b);
    }

    move(x,y){
        if(this._stepMove==true){
            x = parseInt(x);
            y = parseInt(y);
        }
        this.position.x  = this.horizontalCheck(this.position.x + x);
        this.position.y  = this.verticalCheck(this.position.y + y);
    }

    getNextPosition(){
        return new Vector(this.position.x + this.direction.x, this.position.y + this.direction.y);
    }

    horizontalCheck(x){
        if(x >= this._gameGrid._width){
            if(this._wrapAround==true) x = x % this._gameGrid._width;
            x = this.screenRight(x);
        }
        else if (x < 0){
            if(this._wrapAround==true) x = this._gameGrid._width + x;
            x = this.screenLeft(x);
        } 
        return x;
    }

    verticalCheck(y){
        if(y >= this._gameGrid._height){
            if(this._wrapAround==true) y = y % this._gameGrid._height;
            y = this.screenBot(y);
        }
        else if (y < 0){
            if(this._wrapAround==true) y = this._gameGrid._height + y;
            y = this.screenTop(y);
        } 
        return y;
    }

    // you can use these methods in case you want to manipulate the X & Y values when object touches the screen edges
    // make sure you have the x or y input argument when overriding these screen methods
    screenTop(y){return y;}
    screenBot(y){return y;}
    screenLeft(x){return x;}
    screenRight(x){return x;}

    // given a vector it return true or false if it's the same position as this gameObject
    isSamePosition(vector){
        if(this.position.x != vector.x) return false;
        if(this.position.y != vector.y) return false;
        return true;
    }
    // given a gameObject returns true or false if they have the same position
    isSameGameObjectPosition(gameObject){
        return this.isSamePosition(gameObject.position);
    }
    // given a gameObject returns true or false if it's bounding box overlaps this bounding box
    checkCollision( gameObject ){
        return this._bb.overlap( gameObject );
    }
    // given a vactor returns true or false if it overlaps this object's bounding box
    checkVectorCollision( vector ){
        return this._bb.isInside( vector );
    }
    // check if given gameObject's squares touches any of this object squares
    // warning: this is the most expensive collision check. Only use for non square/rectangular shapes
    // this methods is O(n^2)
    checkSquareCollision( gameObject ){
        for(let i=0; i<this._squareArray.length; i++){
            // our square is the current square + the object position
            let mySquare = this._squareArray[i].sum( this.position );
            for(let j=0; j<gameObject._squareArray.length; j++){
                // given gameObject current square + its position
                let givenSquare = gameObject._squareArray[j].sum( gameObject.position );
                if(mySquare.isEqual(givenSquare)==true) return true;
            }
        }
        return false;
    }

    updateBoundingBox(){
        let xLeft = this._squareArray[0].x;
        let xRight = 1;
        let yTop = this._squareArray[0].y;
        let yBot = 1;

        for(let i=0; i<this._squareArray.length; i++){
            let currentSquare = this._squareArray[i];
            xLeft = Math.min(xLeft, currentSquare.x);
            xRight = Math.max(xRight, currentSquare.x+1);
            yTop = Math.min(yTop, currentSquare.y);
            yBot = Math.max(yBot, currentSquare.y+1);
        }
        let topLeft = new Vector(xLeft, yTop);
        let botRight = new Vector(xRight, yBot);
        this._bb.topLeft = topLeft;
        this._bb.botRight = botRight;
    }
}

// a simple gameObject subClass that just adds movement keycodes to move up/down/left/right
class GameObjectMove extends GameObject{
    constructor(x=0, y=0, canUpdate=true, canRender=true){
        super(x=x, y=y, canUpdate=canUpdate, canRender=canRender);
        this.moveKeys = {UP:keyCodesEnum.W, DOWN:keyCodesEnum.S, LEFT:keyCodesEnum.A, RIGHT:keyCodesEnum.D};

    }

    _inputKeyDown(keyCode){
        switch(keyCode){
            case(this.moveKeys.UP):
                this.direction.y=-1;
                break;
            case(this.moveKeys.LEFT):
                this.direction.x=-1;
                break;
            case(this.moveKeys.DOWN):
                this.direction.y=1;
                break;
            case(this.moveKeys.RIGHT):
                this.direction.x=1;
                break;
        }
        this.inputKeyDown();
    }

    _inputKeyUp(keyCode){
        switch(keyCode){
            case(this.moveKeys.UP):
                this.direction.y=0;
                break;
            case(this.moveKeys.LEFT):
                this.direction.x=0;
                break;
            case(this.moveKeys.DOWN):
                this.direction.y=0;
                break;
            case(this.moveKeys.RIGHT):
                this.direction.x=0;
                break;
        }
        this.inputKeyUp();
    }
}

class GameObjectBall extends GameObject {
    constructor(x=0, y=0, canUpdate=true, canRender=true){
        super(x=x, y=y, canUpdate=canUpdate, canRender=canRender);
        this.leftOffset = 0;
        this.rightOffset = 0;
        this.topOffset = 0;
        this.botOffset = 0;
    }

    setRandomDirection(len=1, normalize=false){
        // randomly generates diagonal directions
        // len will be the length of the X & Y values. That can make the ball move faster
        // normalize will normalize the direction vector after setting new value
        let h_dir = Math.floor( Math.random() * 2 ); // horizontal direction
        let v_dir = Math.floor( Math.random() * 2 ); // vertical direction

        this.direction = new Vector( [len,-len][h_dir], [len, -len][v_dir] );
        if(normalize==true){
            this.direction.normalize();
        }
    }

    preUpdate(gameGrid){
        // here we add functionality to react to the game screen bounderies

        let nextPosition = this.getNextPosition();
        // check for top & bottom bounderies
        if(nextPosition.y < 0 + this.topOffset){
            //this.position.y = 1;
            this.touchedTop();
            this.direction.y *= -1; // flips up/down direction
        }
        else if(nextPosition.y > gameGrid.getHeight() -(1+this.botOffset)){
            //this.position.y = gameGrid.getHeight() -2;
            this.touchedBot();
            this.direction.y *= -1; // flips up/down direction
        } 

        if(nextPosition.x < 0 + this.leftOffset){
            //this.position.x = 1;
            this.touchedLeft();
            this.direction.x *= -1; // flips up/down direction
        }
        else if(nextPosition.x > gameGrid.getWidth()-(1+this.rightOffset)){
            //this.position.x = gameGrid.getWidth()-2;
            this.touchedRight();
            this.direction.x *= -1; // flips up/down direction
        } 
    }
    // override these methods if you want to perform some logic when ball touches the screen edges
    touchedTop(){return true;}
    touchedBot(){return true;}
    touchedLeft(){return true;}
    touchedRight(){return true;}
}

class GameObjectPaddle extends GameObject{
    constructor(x=0, y=0, canUpdate=true, canRender=true){
        super(x=x, y=y, canUpdate=canUpdate, canRender=canRender);

    }
}

class Vector{
    // simple vector class to represent x & y coordinates
    constructor(x,y){
        this.x = x;
        this.y = y;
    }
    sum(value){// returns a new vector that is the sum of given vector/value and this vector
        let returnVector = new Vector();
        if(value.constructor === Vector){
            returnVector.x = this.x + value.x;
            returnVector.y = this.y + value.y;
        }
        else{
            returnVector.x = this.x + value;
            returnVector.y = this.y + value;
        }
        return returnVector;
    }
    sub(value){// returns a new vector that is the subtraction of given vector/value and this vector
        let returnVector = new Vector();
        if(value.constructor === Vector){
            returnVector.x = this.x - value.x;
            returnVector.y = this.y - value.y;
        }
        else{
            returnVector.x = this.x - value;
            returnVector.y = this.y - value;
        }
        return returnVector;
    }  
    mul(value){// returns a new vector that is the multiplication of given vector/value and this vector
        let returnVector = new Vector();
        if(value.constructor === Vector){
            returnVector.x = this.x * value.x;
            returnVector.y = this.y * value.y;
        }
        else{
            returnVector.x = this.x * value;
            returnVector.y = this.y * value;
        }
        return returnVector;
    }  
    // dont have a divide to avoid division by zero
    // if you need to divide, let say by 2, then just miltiply the vector by 0.5

    len(){ // returns the vector length
        return Math.sqrt((this.x * this.x) + (this.y * this.y));
    }
    normalize(){ // turns it into a unit vector (vector with length == 1)
        let length = this.len();
        this.x /= length;
        this.y /= length;
    }
    // check if given vector is equal to this vector
    isEqual(vector){
        if(this.x != vector.x) return false;
        if(this.y != vector.y) return false;
        return true;
    }
}

class BoundingBox{
    /* 
    bounding box is just a faster way of detecting collision between 2 objects rather then chacking each square.
    a bounding box only works for aquare/rectangle objects.
    every gameObject has 1 by default. If you decide to use unique shapes then use checkCollisionSquare
    */
    constructor(topLeft, botRight, gameObject){ // these are 2 x vectors
        this.topLeft = topLeft;
        this.botRight = botRight;
        this.gameObject = gameObject;
    }
    // returns true if given vector is inside the bounding box
    isInside(vector){
        vector = vector.sum( new Vector(0.5, 0.5) );
        let topLeft= this.topLeft.sum( this.gameObject.position );
        let botRight = this.botRight.sum( this.gameObject.position );
        if( vector.x >= topLeft.x && vector.x <= botRight.x){
            if( vector.y >= topLeft.y && vector.y <= botRight.y) return true;
        }
        return false;
    }
    // returns true if given BB overlaps this BB
    overlap(gameObject){
        let inputTopLeft = gameObject._bb.topLeft.sum(gameObject.position);
        let inputBotRight = gameObject._bb.botRight.sum(gameObject.position);
        if(this.isInside(inputTopLeft)==true) return true;
        if(this.isInside(inputBotRight)==true) return true;
        return false;
    }
}

//##########################################################################################
//################################## non class methods #####################################
//##########################################################################################

//convenient methods for generating a rgb string for color
function makeColorString(r=150, g=150, b=150){
    rgbText = "rgb(";

    if(r>255) r = 255;
    else if (r<0)r=0;
    rgbText += r + ",";

    if(g>255) g = 255;
    else if (g<0)g=0;
    rgbText += g + ",";

    if(b>255) b = 255;
    else if (b<0)b=0;
    rgbText += b + ")";

    return rgbText;
}

/*
At the end of your game code, you have to call this method and pass your newly create gameGrid to it.
It passes the gameGrid tick() to be called 60 times a frame.
It also passes the gameGrid keyboard methods into the event listeners
*/
function createGameLoop(gameGrid){

    gameGrid._start();

    var animate = window.requestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    function(callback) { window.setTimeout(callback, 1000/60) }

    window.onload = function() {animate(step);};

    var step = function() {
        gameGrid._tick();
        animate(step);
    };

    // creates keyboard events and calls our gameGrid input methods
    document.addEventListener('keydown', function(event) {
        gameGrid._inputKeyDown(event.keyCode);

    });
    document.addEventListener('keyup', function(event) {
        gameGrid._inputKeyUp(event.keyCode);
    });
}
