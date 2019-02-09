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
        this._factoryClasses = {"GameObject":GameObject, "GameObjectMove":GameObjectMove}
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
                break;
            case(gameStateEnum.PAUSED):
                this._pause()
                break;
            case(gameStateEnum.OVER):
                this._gameOver()
                break;
        };

        this._render();
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

    _startScreen(){this.startScreen();}
    _pause(){this.pause();}
    _gameOver(){this.gameOver();}
    _reset(){
        this._stepCounter = 0; // reset the step counter always
        this.reset();
    }

    _render(){
        this.render(); // render background
        for(let i=0; i<this._gameObjects.length; i++) this._gameObjects[i]._render(this);
        this.renderUI(); // render UI
    }

    _setGameToStart(){this._gameState = gameStateEnum.START;}
    _setGameToUpdate(){this._gameState = gameStateEnum.UPDATE;}
    _setGameToPaused(){this._gameState = gameStateEnum.PAUSED;}
    _setGameToOver(){this._gameState = gameStateEnum.OVER;}

    //##########################################################################################
    //################################# methods to override ####################################
    //##########################################################################################

    startScreen(){return true;} // start title screen - static 
    gameOver(){return true;} //
    pause(){return true;}  //

    preUpdate(){return true} // preUpdate stage if needed
    postUpdate(){return true} // post update if needed

    update(){return true} // update game grid logic
    
    reset(){return true;} 

    render(){
        this._context.fillStyle = this._backGroundColor;
        this._context.fillRect(0, 0, this._canvas.width, this._canvas.height);
    }
    renderUI(){return true;}

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
    createGameObject(gameObjectName){
        let gameObjectClass = this._factoryClasses[gameObjectName];
        if(gameObjectClass==undefined){
            this.print(gameObjectName + " is not a valid gameObject")
            return undefined;
        }
        let gameObject = new gameObjectClass();
        gameObject._gameGrid = this;
        this._gameObjects.push(gameObject);
        return gameObject;
    }

    getGameObject(index){
        return this._gameObjects[index];
    }

    // given an x y position it will check if "hits" the given game object. return a bool
    checkCollision(x, y, gameObject){
        for(let i=0; i<gameObject._squareArray.length; i++){
            let xPos = gameObject._squareArray[i].x + gameObject.x;
            let yPos = gameObject._squareArray[i].y + gameObject.y;
            if(xPos==x && yPos == y) return true;
        }
        return false;
    }

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

}

// simple vector class to represent x & y coordinates
class Vector{
    constructor(x,y){
        this.x = x;
        this.y = y;
    }
    add(value){// adds this vector to the given input vector or number
        if(typeof(value)==Vector){
            this.x += value.x;
            this.y += value.y;
        }
        else{
            this.x += value;
            this.y += value;
        }
    }
    sub(value){// subtracts this vector to the given input vector or number
        if(typeof(value)==Vector){
            this.x -= value.x;
            this.y -= value.y;
        }
        else{
            this.x -= value;
            this.y -= value;
        }
    }  
    mul(value){// multiplies this vector to the given input vector or number
        if(typeof(value)==Vector){
            this.x *= value.x;
            this.y *= value.y;
        }
        else{
            this.x *= value;
            this.y *= value;
        }
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
}

// class that can be used to make collision detaction easier for gameObjects with multiple squares
class BoundingBox{
    constructor(topLeft, botRight){
        this.topLeft = topLeft;
        this.botRight = botRight;
    }
    hasCollided(BoundingBox){
        if(this.topLeft.x <= BoundingBox.botRight.x && this.topLeft.y <= BoundingBox.botRight.y) return true;
        else if(this.topLeft.x <= BoundingBox.botRight.x && this.topLeft.y <= BoundingBox.botRight.y) return true;
        return false;
    }
}

/*
our base class for gameObjects.
It shares many methods with gameGrid such as update(), render(), inputKeyUp & inputKeyDown().
gameGrid loops through all of its gameObject and call these methods during render & update.

*/
class GameObject extends Vector{
    constructor(x=0, y=0, canUpdate=true, canRender=true){
        // this attributes can be used/changed
        super(x=x, y=y);
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

        this.pushSquare( new Vector(0,0) );
    }

    _preUpdate(gameGrid){ if(this._canUpdate == true){} this.preUpdate(gameGrid); }
    _update(gameGrid){
        if(this._canUpdate == true) {
            if(this._canMove==true) this.move(this.direction.x, this.direction.y);
            this.update(gameGrid); 
        }
    }
    _postUpdate(gameGrid){ if(this._canUpdate == true){} this.postUpdate(gameGrid); }
    _render(gameGrid){ 
        if(this._canRender == true){
            this.render(gameGrid); 
            for(let i=0; i<this._squareArray.length; i++){
                this.drawSquare(
                    this.horizontalCheck( this.x + this._squareArray[i].x), 
                    this.verticalCheck( this.y + this._squareArray[i].y))
            }
        } 
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
   
    inputKeyDown(keyCode){return true;}
    inputKeyUp(keyCode){return true;}

    drawSquare(positionX, positionY, size=1, color=this._color){
        this._gameGrid.renderSquare(positionX, positionY, size, color);
    }

    setColor(r=150, g=150, b=150){
        this._color = makeColorString(r,g,b);
    }

    move(x,y){
        if(this._stepMove==true){
            x = parseInt(x);
            y = parseInt(y);
        }
        this.x  = this.horizontalCheck(this.x + x);
        this.y  = this.verticalCheck(this.y + y);
    }

    getNextPosition(){
        return new Vector(this.x + this.direction.x, this.y + this.direction.y);
    }

    horizontalCheck(x){
        if(x >= this._gameGrid._width){
            if(this._wrapAround==true) x = x % this._gameGrid._width
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
            if(this._wrapAround==true) y = y % this._gameGrid._height
            y = this.screenBot(y);
        }
        else if (y < 0){
            if(this._wrapAround==true) y = this._gameGrid._height + y;
            y = this.screenTop(y);
        } 
        return y;
    }

    screenTop(y){return y;}
    screenBot(y){return y;}
    screenLeft(x){return x;}
    screenRight(x){return x;}
}

// a simple gameObject subClass that just adds movement keycodes to move up/down/left/right
class GameObjectMove extends GameObject{
    constructor(positionX=0, positionY=0, canUpdate=true, canRender=true){
        super(positionX=positionX, positionY=positionY, canUpdate=canUpdate, canRender=canRender);
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
