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
    constructor(width=10, height=10, canvasScale=20, gameSpeed=1){

        this._width = width;
        this._height = height;
        this._area = width * height;
        this._tiles = [this._area];
        this._moveUnits = canvasScale;
        this._emptyTiles = [this._area];
        this._gameObjects = [];
        this._gameObjectsDict = {};
        this._factoryClasses = {"Basic":GameObject, "Move":GameObjectMove, "Ball":GameObjectBall, "Paddle":GameObjectPaddle}
        this._backGroundColor = new RGB(150, 150, 150);

        this._logger = document.getElementById("logger"); 

        this._canvas = document.getElementById("squareEngineCanvas"); 
        this._canvas.width = width * canvasScale;
        this._canvas.height = height * canvasScale;
        this._context = this._canvas.getContext('2d');

        // time variables
        this._now;
        this._lastUpdate;
        this._deltaTime;
        this._stepCounter = 0;
        this._updateStep = 0;
        
        // game states        
        this._gameState = gameStateEnum.START;
    }

    _tick(){ // this method gets called about 60 times per second
        // get delta time
        this._now = new Date().getTime();
        this._deltaTime = (this._now - this._lastUpdate)/1000; // milliseconds
        this._lastUpdate = this._now;

        // a game simple state machine
        switch(this._gameState){
            case(gameStateEnum.START): // our start static screen
                this._startScreen();
                break;
            case(gameStateEnum.UPDATE): // our game update 
                this._update()
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
        // step counter can be used to make the game have stepped updates
        // set the stepCounter to 0 if you don't want stepped animation
        this._stepCounter += this._deltaTime;
        if( this._stepCounter >= this._updateStep){

            this.preUpdate()       
            for(let i=0; i<this._gameObjects.length; i++) this._gameObjects[i]._preUpdate(this);

            this.update()
            for(let i=0; i<this._gameObjects.length; i++) this._gameObjects[i]._update(this);

            this.postUpdate()
            for(let i=0; i<this._gameObjects.length; i++) this._gameObjects[i]._postUpdate(this);

            this._stepCounter = 0;
        }
         
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
        this.gameOver();
        return true;
    } 
    _pause(){ // pause screen - static - current game paused + UI
        this._render();
        this.renderPauseUI();
        return true;
    } 

    _renderBackground(){
        this._context.fillStyle = this._backGroundColor.colorString();
        this._context.fillRect(0, 0, this._canvas.width, this._canvas.height);
    }

    _setGameToStart(){this._gameState = gameStateEnum.START;}
    _setGameToUpdate(){this._gameState = gameStateEnum.UPDATE;}
    _setGameToPaused(){this._gameState = gameStateEnum.PAUSED;}
    _setGameToOver(){
        this._gameState = gameStateEnum.OVER;
        this._disableAllUpdates();
    }

    _start(){ for(let i=0; i<this._gameObjects.length; i++) this._gameObjects[i]._start(this); }

    _disableAllUpdates(){ for(let i=0; i<this._gameObjects.length; i++) this._gameObjects[i]._canUpdate=false; }

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
    gameOver(){return true;} 

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
            throw new Error("Error: " + objectType + " is not a valid gameObject");
        }
        let gameObject = new gameObjectClass(this, x, y, canUpdate, canRender);
        gameObject._name = name;
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
    getPixelWidth(){return this._width * this._moveUnits;}
    getPixelHeight(){return this._height * this._moveUnits;}
    getMoveUnit(){return this._moveUnits;}

    // changes the game backGround color
    setBackgroundColor(rgbObject){
        this._backGroundColor = rgbObject;
    }

    // print, printAdd and erase can be used to diplay text on the <p> "logger" element
    print(text){this._logger.innerHTML = text;}
    printAdd(text){this._logger.innerHTML += "<br>" + text;}
    erase(){this._logger.innerHTML = "";}

    setUpdateStep(delay){
        if(delay<0) this._updateStep = 0;
        else this._updateStep = delay;}
    getUpdateStep(){return this._updateStep;}

    // renders a square at x & y positions with given size and color
    renderSquare(position, size=new Vector(1,1), color=RGB.makeRandomColor(), scaleOffset=true){
        if(scaleOffset==true) position = position.sub( size.mul(0.5) );
        position = position.mul( this._moveUnits );
        size = size.mul( this._moveUnits );
        this._context.fillStyle = color.colorString();
        this._context.fillRect( position.x, position.y, size.x, size.y);
    }

    renderText(text, positionX=null, positionY=null, size=40, color=new RGB(0,0,0)){
        if(positionX==null) positionX = (this.getPixelWidth()/2.0); //- ((text.length/2.0)*this._moveUnits);
        if(positionY==null) positionY = (this.getPixelHeight()/2.0); //- (size/2);
        this._context.fillStyle = color.colorString();
        this._context.font = size + 'px Arial';
        this._context.textAlign = "center"; 
        this._context.fillText(text, positionX, positionY);
    }

}


class GameObject {
    /*
    our base class for gameObjects.
    It shares many methods with gameGrid such as update(), render(), inputKeyUp & inputKeyDown().
    gameGrid loops through all of its gameObject and call these methods during render & update.
    */
    constructor(gameGrid, x=0, y=0, canUpdate=true, canRender=true){
        // this attributes can be used/changed
        this._name
        this.position = new Vector(x,y); 
        this.prevPosition = new Vector(0,0);
        this.direction = new Vector(0,0);

        // do not access or override these. Use methods below
        this._canUpdate = canUpdate;
        this._canRender = canRender;
        this._squareArray = [];
        this._color = new RGB(255, 0, 0); 
        this._wrapAround = true;
        this._gridSnap = false;
        this._gameGrid = gameGrid;
        this._canMove = true;
        this._speed = 1.0;
        this._updateStep = 0;
        this._stepCounter = 0;
        this._bb = new BoundingBox(new Vector(0,0), new Vector(1,1), this);
        this._autoBB = true;

        this.pushSquare( new Square() );
    }

    _preUpdate(gameGrid){ if(this._canUpdate == true) this.preUpdate(gameGrid); }
    _update(gameGrid){
        if(this._canUpdate == true) {
            this._stepCounter += gameGrid.getDeltaTime();
            if(this._stepCounter >= this._updateStep){
                if(this._canMove==true) this.move();
                this.update(gameGrid); 
                this._stepCounter = 0; 
            }
        }
    }
    _postUpdate(gameGrid){ if(this._canUpdate == true) this.postUpdate(gameGrid); }

    _render(gameGrid){ 
        if(this._canRender == true){
            this.render(gameGrid); 
            // render square arrays
            for(let i=0; i<this._squareArray.length; i++){

                let square = this._squareArray[i];
                square.render();
                
                /* let TopLeft = this.screenCheck(square.getTopLeft());
                if(TopLeft.status==true) square.renderAt(TopLeft);

                let topRight = this.screenCheck(square.getTopRight());
                if(topRight.status==true) square.renderAt(topRight);

                let botLeft = this.screenCheck(square.getBotLeft());
                if(botLeft.status==true) square.renderAt(botLeft);

                let botRight = this.screenCheck(square.getBotRight());
                if(botRight.status==true) square.renderAt(botRight); */

                /* this.drawSquare(
                    this.horizontalCheck( this.position.x + this._squareArray[i].x), 
                    this.verticalCheck( this.position.y + this._squareArray[i].y)
                    ); */
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

    getName(){return this._name;}
    hide(){this._canRender=false;}
    show(){this._canRender=true;}
    enableUpdate(){this._canUpdate=true;}
    disableUpdate(){this._canUpdate=false;}
    setWrapAroundOn(){this._wrapAround=true;}
    setWrapAroundOff(){this._wrapAround=false;}
    setMoveOn(){this._canMove=true;}
    setMoveOff(){this._canMove=false;}
    setGridSnapOn(){this._gridSnap=true;}
    setGridSnapOff(){this._gridSnap=false;}
    setUpdateStep(updateStep){
        if(updateStep<0) this._updateStep=0;
        else this._updateStep=updateStep;}
    getUpdateStep(){return this.updateStep;}

    setSpeed(speed){this._speed=parseFloat(speed);}
    getSpeed(){return this._speed;}
    setDirection(x,y){this.direction = new Vector(x,y);}

    gameOver(){this._gameGrid._setGameToOver()};
    resetGame(){this._gameGrid._reset()};
    pauseGame(){this._gameGrid._setGameToPaused()}

    pushSquare(square){ // pushes a square to your squareArray
        square.gameObject = this;
        if(square._color==null) square._color = this._color;
        this._squareArray.push(square);
        if(this._autoBB==true) this.updateBoundingBox();
    }
    popSquare(){ // pops a square to your squareArray
        let returnData = this._squareArray.pop();
        if(this._autoBB==true) this.updateBoundingBox();
        return returnData;
    }
    removeSquare(index){ // removes a square in your squareArray at given index
        let returnData = this._squareArray.splice(index, 1);
        if(this._autoBB==true) this.updateBoundingBox();
        return returnData;
    }
    removeFirstSquare(){ // removes the first square in your squareArray
        let returnData = this._squareArray.splice(0, 1);
        if(this._autoBB==true) this.updateBoundingBox();
        return returnData;
    }
    getSquare(index=0){return this._squareArray[index];}

    // when overriding these methods dont forget to pass a gameGrid input
    preUpdate(gameGrid){return true}; 
    update(gameGrid){return true;}
    postUpdate(gameGrid){return true;} 
    render(gameGrid){return true;}
    start(gameGrid){return true;}
   
    inputKeyDown(keyCode){return true;}
    inputKeyUp(keyCode){return true;}

    /* drawSquare(x, y, size=1, color=this._color){
        this._gameGrid.renderSquare(x, y, size, color);
    } */

    setColor(r=150, g=150, b=150){
        this._color.setColor(r,g,b);
        for(let i=0; i<this._squareArray.length; i++){
            this._squareArray[i]._color = this._color;
        }
    }
    setColorObject(rgbObject){this._color=rgbObject;}

    setRandomColor(){ this._color.randomColor();}

    getPosition(){return this.position.copy();}
    getPrevPosition(){return this.prevPosition.copy();}

    getNextPosition(){ 
        let nextPosition = this.direction.normalized();
        return nextPosition.mul( this._gameGrid.getDeltaTime() * this._speed );
    }

    move(){ this.moveTo( this.getNextPosition() ); }

    moveTo(vector, absolute=false){
        this.prevPosition = this.getPosition();
        if(absolute==true) this.position = vector;
        else this.position = this.position.sum(vector);

        let screenVector = this.screenCheck( this.getPosition() );
        if(screenVector.status) this.position = screenVector;

        if(this._gridSnap==true){
            this.position.x = parseInt(this.position.x) + 0.5;
            this.position.y = parseInt(this.position.y) + 0.5;
        }
    }

    screenCheck(vector){
        vector.status = false;
        if(vector.x >= this._gameGrid._width){
            if(this._wrapAround==true) vector.x = vector.x % this._gameGrid._width;
            this.screenRight();
            vector.status = true;
        }
        else if (vector.x < 0){
            if(this._wrapAround==true) vector.x = this._gameGrid._width + vector.x;
            this.screenLeft();
            vector.status = true;
        } 
        if(vector.y >= this._gameGrid._height){
            if(this._wrapAround==true) vector.y = vector.y % this._gameGrid._height;
            this.screenRight();
            vector.status = true;
        }
        else if (vector.y < 0){
            if(this._wrapAround==true) vector.y = this._gameGrid._height + vector.y;
            this.screenLeft();
            vector.status = true;
        } 
        return vector;
    }

    // you can use these methods in case you want to manipulate the X & Y values when object touches the screen edges
    // make sure you have the x or y input argument when overriding these screen methods
    screenTop(){return true;}
    screenBot(){return true;}
    screenLeft(){return true;}
    screenRight(){return true;}

    // given a vector it return true or false if it's the same position as this gameObject
    isSamePosition(vector){ return this.position.isEqual(vector);}
    // given a gameObject returns true or false if they have the same position
    isSameGameObjectPosition(gameObject){
        return this.isSamePosition(gameObject.position);
    }
    // given a gameObject returns true or false if it's bounding box overlaps this bounding box
    checkCollision( gameObject ){
        return this._bb.overlap( gameObject._bb );
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
            let mySquare = this._squareArray[i];
            for(let j=0; j<gameObject._squareArray.length; j++){
                // given gameObject current square + its position
                let givenSquare = gameObject._squareArray[j];
                if(mySquare.overlap(givenSquare)==true) return true;
            }
        }
        return false;
    } 

    updateBoundingBox(){ this._bb.updateBoundingBox(); }
}

// a simple gameObject subClass that just adds movement keycodes to move up/down/left/right
class GameObjectMove extends GameObject{
    constructor(gameGrid, x=0, y=0, canUpdate=true, canRender=true, wasd=false){
        super(gameGrid=gameGrid, x=x, y=y, canUpdate=canUpdate, canRender=canRender);
        if(wasd) this.moveKeys = {UP:keyCodesEnum.W, DOWN:keyCodesEnum.S, LEFT:keyCodesEnum.A, RIGHT:keyCodesEnum.D};
        else this.moveKeys = {UP:keyCodesEnum.UP, DOWN:keyCodesEnum.DOWN, LEFT:keyCodesEnum.LEFT, RIGHT:keyCodesEnum.RIGHT};
    }

    _inputKeyDown(keyCode){
        switch(keyCode){
            case(this.moveKeys.UP):
                this.direction.y=-1;
                break;
            case(this.moveKeys.DOWN):
                this.direction.y=1;
                break;
            case(this.moveKeys.LEFT):
                this.direction.x=-1;
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
            case(this.moveKeys.DOWN):
                this.direction.y=0;
                break;
            case(this.moveKeys.LEFT):
                this.direction.x=0;
                break;
            case(this.moveKeys.RIGHT):
                this.direction.x=0;
                break;
        }
        this.inputKeyUp();
    }
}

class GameObjectPaddle extends GameObjectMove{
    constructor(gameGrid, x=0, y=0, canUpdate=true, canRender=true, wasd=false, vertical=true){
        super(gameGrid=gameGrid, x=x, y=y, canUpdate=canUpdate, canRender=canRender, wasd=wasd);
        this._isVertical;
        this._minLimit;
        this._maxLimit;

        if(vertical) this.setVertical();
        else this.setHorizontal();
        this.setAutoLimit();
            
    }

    setAutoLimit(){
        if(this.isVertical()) this._maxLimit = this._gameGrid.getHeight() - (this._bb.size.y/2);
        else this._maxLimit = this._gameGrid.getWidth() - (this._bb.size.x/2);

        if(this.isVertical()) this._minLimit = this._bb.size.y/2;
        else this._minLimit = this._bb.size.x/2;
    }

    setVertical(){
        this._isVertical = true;
        if(this.wasd) this.moveKeys = {UP:keyCodesEnum.W, DOWN:keyCodesEnum.S, LEFT:null, RIGHT:null};
        else this.moveKeys = {UP:keyCodesEnum.UP, DOWN:keyCodesEnum.DOWN, LEFT:null, RIGHT:null};
    }

    isVertical(){return this._isVertical;}

    setHorizontal(){
        this._isVertical = false;
        if(this.wasd) this.moveKeys = {UP:null, DOWN:null, LEFT:keyCodesEnum.LEFT, RIGHT:keyCodesEnum.RIGHT};
        else this.moveKeys = {UP:null, DOWN:null, LEFT:keyCodesEnum.LEFT, RIGHT:keyCodesEnum.RIGHT};
    }

    isHorizontal(){return !this._isVertical;}

    postUpdate(gameGrid){
        if(this.position.x<this._minLimit){
            this.position.x=this._minLimit;
        }
        else if (this.position.x>this._maxLimit){
            this.position.x=this._maxLimit;
        }   
    }
}

class GameObjectBall extends GameObject {
    constructor(gameGrid, x=0, y=0, canUpdate=true, canRender=true){
        super(gameGrid=gameGrid, x=x, y=y, canUpdate=canUpdate, canRender=canRender);
        this.leftOffset = 0;
        this.rightOffset = 0;
        this.topOffset = 0;
        this.botOffset = 0;
        this.autoSetOffsets();
        this._wrapAround = false;
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

    autoSetOffsets(){
        this.leftOffset = this._bb.size.x/2;
        this.rightOffset = this._bb.size.x/2;
        this.topOffset = this._bb.size.y/2;
        this.botOffset = this._bb.size.y/2;
    }

    postUpdate(gameGrid){
        // here we add functionality to react to the game screen bounderies

        let currentPos = this.getPosition();
        // check for top & bottom bounderies
        if(currentPos.y < 0 + this.topOffset){
            this.position.y = 0 + this.topOffset;
            this.touchedTop();
            this.direction.y *= -1; // flips up/down direction
        }
        else if(currentPos.y > gameGrid.getHeight() - ( this.botOffset)){
            this.position.y = gameGrid.getHeight() - ( this.botOffset);
            this.touchedBot();
            this.direction.y *= -1; // flips up/down direction
        } 

        if(currentPos.x < 0 + this.leftOffset){
            this.position.x = 0 + this.leftOffset;
            this.touchedLeft();
            this.direction.x *= -1; // flips up/down direction
        }
        else if(currentPos.x > gameGrid.getWidth() - ( this.rightOffset)){
            this.position.x = gameGrid.getWidth() - ( this.rightOffset);
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

class Vector{
    // simple vector class to represent x & y coordinates
    constructor(x=0,y=0){
        if( isNaN(x) || isNaN(y) ) throw Error("Vector got a NaN");
        this.x = x;
        this.y = y;
    }
    set x(x){
        if( isNaN(x) ) throw Error("Vector got a NaN X");
        this._x = x;
    }
    get x(){return this._x;}

    set y(y){
        if( isNaN(y) ) throw Error("Vector got a NaN Y");
        this._y = y;
    }
    get y(){return this._y;}

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
        if(length>0){
            this.x /= length;
            this.y /= length;
        }
        else{
            this.x = 0;
            this.y = 0;
        }
        
    }
    normalized(){
        let returnVector = this.copy();
        returnVector.normalize();
        return returnVector
    }
    // check if given vector is equal to this vector
    isEqual(vector){
        if(this.x != vector.x) return false;
        if(this.y != vector.y) return false;ou
        return true;
    }
    copy(){
        return new Vector(this.x, this.y);
    }
}



class BoundingBox{
    /* 
    bounding box is just a faster way of detecting collision between 2 objects rather then chacking each square.
    a bounding box only works for aquare/rectangle objects.
    every gameObject has 1 by default. If you decide to use unique shapes then use checkCollisionSquare
    */
    constructor(position=new Vector(0,0), size = new Vector(1,1), gameObject=null){ 
        this.position = position; // relative position to our gameObject
        this.size = size; // size = ( width/x/horizontal , height/y/vertical )
        this.gameObject = gameObject;
    }

    setSize(x=1,y=1){
        this.size.x = x;
        this.size.y = y;
        if(this.gameObject) this.gameObject.updateBoundingBox();
    }

    setPosition(x=0,y=0){
        this.position.x = x;
        this.position.y = y;
    }

    getWorldPosition(){ 
        if(this.gameObject) return this.position.sum( this.gameObject.position );
        else return this.getLocalPosition();
    }
    getLocalPosition(){ return this.position.copy();}

    getTopLeft(world=true){ // position - (size vector / 2 )
        if(world==true) return this.getWorldPosition().sub( this.size.mul(0.5) );
        else return this.getLocalPosition().sub( this.size.mul(0.5) );
    }
    getBotRight(world=true){ // position + (size vector / 2)
        if(world==true) return this.getWorldPosition().sum( this.size.mul(0.5) );
        else return this.getLocalPosition().sum( this.size.mul(0.5) );
    }

    // returns true if given vector (in world space) is inside the bounding box
    isInside(vector){
        let topLeft = this.getTopLeft();
        let botRight = this.getBotRight();
        if( vector.x > topLeft.x && vector.x < botRight.x){
            if( vector.y > topLeft.y && vector.y < botRight.y) return true;
        }
        return false;
    }

    // returns true if given BB overlaps this BB
    overlap(boundingBox){
        let thisTopLeft = this.getTopLeft();
        let thisBotRight = this.getBotRight();
        let inputTopLeft = boundingBox.getTopLeft();
        let inputBotRight = boundingBox.getBotRight();


        if (thisTopLeft.x < inputBotRight.x &&
            thisBotRight.x > inputTopLeft.x &&
            thisTopLeft.y < inputBotRight.y &&
            thisBotRight.y > inputTopLeft.y) {
            
                // here we return a boundingBox that is the intersection between the 2 BB above
                let overlapBB = new BoundingBox();

                overlapBB.size.x = Math.abs(
                    Math.max(thisTopLeft.x, inputTopLeft.x)
                    - Math.min(thisBotRight.x, inputBotRight.x) );

                overlapBB.size.y = Math.abs(
                    Math.max(thisTopLeft.y, inputTopLeft.y)
                    - Math.min(thisBotRight.y, inputBotRight.y) );

                return overlapBB
            }
        return false;
    }

    updateBoundingBox(){
        if(! this.gameObject) return false;

        let topLeft = this.gameObject._squareArray[0].getTopLeft(false);
        let botRight = this.gameObject._squareArray[0].getBotRight(false);

        for(let i=1; i<this.gameObject._squareArray.length; i++){
            let currentSquare = this.gameObject._squareArray[i];
            let currentTopLeft = currentSquare.getTopLeft(false);
            let currentBotRight = currentSquare.getBotRight(false);

            topLeft.x = Math.min(topLeft.x, currentTopLeft.x);
            topLeft.y = Math.max(topLeft.y, currentTopLeft.x);
            botRight.x = Math.min(botRight.x, currentBotRight.y);
            botRight.y = Math.max(botRight.y, currentBotRight.y);
        }
        let size = new Vector(
            Math.abs(topLeft.x) + Math.abs(botRight.x),
            Math.abs(topLeft.y) + Math.abs(botRight.y)
        )
        let position = new Vector(
            (topLeft.x + botRight.x)/2,
            (topLeft.y + botRight.y)/2
        )

        this.gameObject._bb.position = position;
        this.gameObject._bb.size = size;
        return true;
    }
}

class Square extends BoundingBox{
    constructor(position=new Vector(0,0), size=new Vector(1,1), gameObject=null, color=null){
        super(position=position, size=size, gameObject=gameObject);
        this._color = color;
    }

    setColor(r,g,b){this._color.setColor(r,g,b);}
    
    setRandomColor(){
        if(this._color==null) this._color = RGB.makeRandomColor();
        else this._color.setColor(r,g,b);
    }

    render(){
        let position = this.getTopLeft();
        this.renderAt(position);
    }

    renderAt(position){
        this._drawSquare(position, this.size, this._color)
    }

    _drawSquare(position, size=new Vector(1,1), color=RGB.makeRandomColor() ){
        position = position.mul( this.gameObject._gameGrid._moveUnits );
        size = size.mul( this.gameObject._gameGrid._moveUnits );
        this.gameObject._gameGrid._context.fillStyle = color.colorString();
        this.gameObject._gameGrid._context.fillRect( position.x, position.y, size.x, size.y );
    }

}

class RGB{
    constructor(r=0, g=0, b=0){
        this.r=0;
        this.g=0;
        this.b=0;
        this.setColor(r,g,b)
    }

    setColor(r,g,b){
        if(r>255) r = 255;
        else if (r<0)r=0;
        this.r = r;
    
        if(g>255) g = 255;
        else if (g<0) g=0;
        this.g = g;
    
        if(b>255) b = 255;
        else if (b<0) b=0;
        this.b = b;
    }

    colorString(){
        let rgbText = "rgb(" + this.r + "," + this.g + "," + this.b + ")";
        return rgbText;
    }

    randomColor(r=true, g=true, b=true){
        if(r==true) this.r = parseInt( Math.floor(Math.random() * 256) );
        if(g==true) this.g = parseInt( Math.floor(Math.random() * 256) );
        if(b==true) this.b = parseInt( Math.floor(Math.random() * 256) );
    }

    static makeRandomColor(){
        let newColor = new RGB()
        newColor.randomColor();
        return newColor;
    }

    static lerpColor(color1, color2, value){
        let returnColor = new RGB();
        returnColor.r = lerp(color1.r, color2.r, value); 
        returnColor.g = lerp(color1.g, color2.g, value); 
        returnColor.b = lerp(color1.b, color2.b, value); 
        return returnColor;
    }

}

//##########################################################################################
//################################## non class methods #####################################
//##########################################################################################

function lerp(start, end, value){
    if(value < 0 || value > 1) throw new Error("lerp value must be between 0-1");
    return (start * (1-value)) + (end * value);
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
