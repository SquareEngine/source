/*
Dimitri Frazao 
Beni Ungur
Tamires Boniolo

Group project - CSD 122 Javascript & JQuery
Winter 2019

s-Dimitri.Frazao@lwtech.edu
s-Beni.Ungur@lwtech.edu
s-Tamires.Boniolo@lwtech.edu
*/

// simple enum to make it easier to interect with keycodes
var keyCodesEnum = {ENTER:13, RESET:82, SPACE:32, LEFT:37, RIGHT:39, UP:38, DOWN:40, W:87, A:65, S:83, D:68}

// a simple enum with our 4 possible game states
var gameStateEnum = {START:0, UPDATE:1, PAUSED:2, OVER:3};

var tileEnum = {EMPTY:0, FULL:1};
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
The gameGrid comes with 4 default gameObjects that you can use and build upon:
"Basic" - the basic vanilla gameObject
"Move" - same as basic but with extra code to move the gameObject with keyboard arrow keys
"Paddle" - same as move but with extra code for limiting movement based on paddle size
"Ball" - same as basic but with extra code to move ball and bounce against the screen edges

params:
width (int) the number of horizontal tiles
height (int) the number of vertical tiles
canvasScale (float) the number of pixels per tile 

*/
class GameGrid{
    constructor(width=10, height=10, canvasScale=20){

        this._width = width; // our horizontal tile count
        this._height = height; // our vertical tile count
        this._area = width * height; // total number of tiles
        this._moveUnits = canvasScale; // our pixel count per tile units
        this._gameObjects = []; // our gameObject array. We can get a gameObject by index position
        this._gameObjectsDict = {}; // our gameObject "dictionary"
        this.debug = undefined; // this is just a gameObject used for debuging

        // our factory holds all gameObjects classes that gameGrid can create.
        // each factory entry is a string : class combination
        this._factoryClasses = {"Basic":GameObject, "Move":GameObjectMove, "Ball":GameObjectBall, "Paddle":GameObjectPaddle}

        this._backGroundColor = new RGB(150, 150, 150);
        
        // our canvas element used to draw our game screen and gameObjects
        this._canvas = document.getElementById("squareEngineCanvas"); 
        this._canvas.width = width * canvasScale;
        this._canvas.height = height * canvasScale;
        this._context = this._canvas.getContext('2d');

        // our logger used to output HTML debug text
        this._logger = document.getElementById("logger"); 

        // UI text
        this._startText = ["PRESS ENTER TO START"];
        this._pauseText = ["PAUSE"];
        this._gameOverText = ["GAME OVER"];

        // time variables
        this._now;
        this._lastUpdate;
        this._deltaTime;
        this._stepCounter = 0;
        this._updateStep = 0;
        
        // our game current state     
        this._gameState = gameStateEnum.START;

        // tile attributes
        this._tiles = [];
        this._emptyTiles = [];
        this._updateTileBoard();
    }

    //##########################################################################################
    //################################### internal methods #####################################
    //##########################################################################################

    // methods that starts with a "_" are not meant to be used and overriden.
    // if you do so make sure you don't break the gameGrid core functionality

    // the tick() method is being called 60 times a second
    // when you call the createGameLoop() and pass a gameGrid
    // it calls the tick() of the given gameGrid
    _tick(){ 
        // here we compared the current time vs our previous time
        // that elapsed time since our previous update is our delta time
        this._now = new Date().getTime();
        this._deltaTime = (this._now - this._lastUpdate)/1000; // milliseconds
        this._lastUpdate = this._now;

        // a simple game state machine
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
        switch(keyCode){
            case(keyCodesEnum.SPACE):
                if(this._gameState == gameStateEnum.PAUSED) this._setGameToUpdate();
                else if(this._gameState == gameStateEnum.UPDATE) this._setGameToPaused();
                break;
            case(keyCodesEnum.ENTER):
                if(this._gameState == gameStateEnum.START) this._setGameToUpdate();
                break;
            case(keyCodesEnum.RESET):
                this._reset();
                break;
        }
        this.inputKeyDown(keyCode);
        for(let i=0; i<this._gameObjects.length; i++) this._gameObjects[i]._inputKeyDown(keyCode);
    }
    _inputKeyUp(keyCode){
        this.inputKeyUp(keyCode);
        for(let i=0; i<this._gameObjects.length; i++) this._gameObjects[i]._inputKeyUp(keyCode);
    }

    _mouseClick(mousePos){
        this.mouseClick(mousePos);
        for(let i=0; i<this._gameObjects.length; i++) this._gameObjects[i].mouseClick(mousePos);
    }

    // here's the gameGrod main update method
    // inside we call our preUpdate, update and postupdate methods of gameGrid & all gameObjects
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

            this._stepCounter = 0; // zero out our counter
        }
         
    }

    // resets clears all gameObjetcs, sets everything to default and calls our start
    // the start is what re creates our game
    _reset(){
        this._setGameToStart(); // we first set our game state to start screen
        this._gameObjects = [];
        this._gameObjectsDict = {};
        this.debug = undefined;
        this._stepCounter = 0; // reset the step counter always
        this._updateTileBoard();
        this.reset(); // call custom reset
        this._start(); // generate all game assets
    }

    /*
    This method changes our gameGrid unit size and scale size
    params:
    width (int) the number of horizontal tiles
    height (int) the number of vertical tiles
    canvasScale (float) the number of pixels per tile 
    */
    _changeGameGridSize(width=10, height=10, canvasScale=20){
        this._width = width;
        this._height = height;
        this._area = width * height;
        this._moveUnits = canvasScale;
        this._canvas.width = width * canvasScale;
        this._canvas.height = height * canvasScale;
        this._reset();
    }

    // resets and updates our tile variables
    _updateTileBoard(){
        this._tiles = [];
        this._emptyTiles = [];
        for(let i=0; i<this._area; i++){
            this._tiles[i] = tileEnum.EMPTY;
            this._emptyTiles[i] = i;
        }
    }

    // our render method. Renders the background and all gameObjects
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

    // render backGround with one large colored square
    _renderBackground(){
        this._context.fillStyle = this._backGroundColor.colorString();
        this._context.fillRect(0, 0, this._canvas.width, this._canvas.height);
    }

    // get and set game states
    _getGameState(){return this._gameState;}
    _setGameToStart(){this._gameState = gameStateEnum.START;}
    _setGameToUpdate(){this._gameState = gameStateEnum.UPDATE;}
    _setGameToPaused(){this._gameState = gameStateEnum.PAUSED;}
    _setGameToOver(){
        this._gameState = gameStateEnum.OVER;
        this._disableAllUpdates();
    }

    // our start method used to build or rebuild a game
    _start(){ 
        this.start();
        for(let i=0; i<this._gameObjects.length; i++) this._gameObjects[i]._start(this); 
        // create our debug square
        this.debug = this.createGameObject("debug", "Basic", 0,0, true, false);
        this.debug.setColor(0,200,200);
        this.debug.hide();
        this.postStart();
    }

    // sets all our gameObjects to not update
    _disableAllUpdates(){ for(let i=0; i<this._gameObjects.length; i++) this._gameObjects[i]._canUpdate=false; }

    //##########################################################################################
    //############################ methods to override and/or use ##############################
    //##########################################################################################

    /* these are the main method you will override to get your game behavior
    You can redefine any of these methods
    update() & start() are the most important.
    start() is used to create your gameObjects
    update() does the game logic
    */
    update(){return true;} // update game grid logic
    preUpdate(){return true;} // preUpdate stage if needed
    postUpdate(){return true;} // post update if needed
    render(){return true;} // render method
    reset(){return true;} // custom reset method called when game is reset
    gameOver(){return true;}  // custom gameOver method called when game state is set to gameOver
    start(){return true;} // our start up methods to build a game
    postStart(){return true;} // a post start method
    renderGameUI(){return true;} // render any UI text on game

    /* these input methods can be overriden 
    make sure you always give them a keyCode or mousePos argument.
    these are called by the gameGrid event listener and always have 1 argument
    */
    inputKeyDown(keyCode){return true;}
    inputKeyUp(keyCode){return true;}
    mouseClick(mousePos){return true;}

    // render the start screen
    renderStartUI(){
        // here we are rendering our start gae text
        let moveUnits = this.getPixelHeight() / (this._startText.length+1);
        for(let i=0; i<this._startText.length; i++){
            // method to render text on screen
            this.renderText( this._startText[i], 
                null,
                moveUnits*(i+1), 
                40, 
                new RGB(0,0,0));
        }
    }
    
    // renders our gameOver text
    renderGameOverUI(){
        let moveUnits = this.getPixelHeight() / (this._gameOverText.length+1);
        for(let i=0; i<this._gameOverText.length; i++){
            this.renderText( this._gameOverText[i], 
                null,
                moveUnits*(i+1), 
                40, 
                new RGB(0,0,0));
        }
    }
    // renders our pause text
    renderPauseUI(){
        this.renderText("PAUSE");
    }
    

    // use this method to get the delta time. Use the deltaTime to get smooth motion.
    // Ex: if you're moving an object by lets say X units on every update have it multiplied by deltaTime.
    getDeltaTime(){return this._deltaTime;}

    // you can use this method to add new gameObjects to the gameGrid
    // arguments: gameObjectName (string) and gameObjectClass (new gameObject class)
    addToFactory(gameObjectName, gameObjectClass){
        this._factoryClasses[gameObjectName]=gameObjectClass;
    }

    /* creates and return a new gameObject. That gameObject is added to the gameGrid _gameObjects array
    arguments:
    name (string) name of the gameObject
    x and y (float) the gameObject starting position
    canUpdate and canRender (bool) if gameObject updates and renders 
    returns gameObject
    */
    createGameObject(name, objectType, x=0, y=0, canUpdate=true, canRender=true){
        // get class from factory
        let gameObjectClass = this._factoryClasses[objectType];
        if(gameObjectClass==undefined){
            throw new Error("Error: " + objectType + " is not a valid gameObject");
        }
        // initialize a new gameObject
        let gameObject = new gameObjectClass(this, x, y, canUpdate, canRender);
        gameObject._name = name;
        this._gameObjects.push(gameObject);
        this._gameObjectsDict[name] = gameObject;
        return gameObject;
    }

    // given a gameObject name (string) returns that gameObject
    getGameObject(name){
        return this._gameObjectsDict[name];
    }

    // get width and height units
    getWidth(){return this._width;}
    getHeight(){return this._height;}
    // get width & height in pixels
    getPixelWidth(){return this._width * this._moveUnits;}
    getPixelHeight(){return this._height * this._moveUnits;}
    // get our move Units (how many pixels is needed to travel 1 cube unit)
    getMoveUnit(){return this._moveUnits;}

    // changes the game backGround color
    setBackgroundColor(rgbObject){
        this._backGroundColor = rgbObject;
    }

    // print, printAdd and erase can be used to diplay text on the <p> "logger" element
    print(text){this._logger.innerHTML = text;}
    printAdd(text){this._logger.innerHTML += "<br>" + text;}
    erase(){this._logger.innerHTML = "";}

    // sets an update step (delay) which is a float
    setUpdateStep(delay){
        if(delay<0) this._updateStep = 0;
        else this._updateStep = delay;
    }
    // gets current update step. Returns float
    getUpdateStep(){return this._updateStep;}

    /* renders a square at x & y positions with given size and color
    arguments:
    position & size (vector object) square position and size
    color (RGB object) square color
    scaleOffset (bool) if move scaled square to match position as center
    */
    renderSquare(position=new Vector(0,0), size=new Vector(1,1), color=RGB.makeRandomColor(), scaleOffset=true){
        if(scaleOffset==true) position = position.sub( size.mul(0.5) );
        position = position.mul( this._moveUnits );
        size = size.mul( this._moveUnits );
        this._context.fillStyle = color.colorString();
        this._context.fillRect( position.x, position.y, size.x, size.y);
    }

    /*
    method for rendering text on the screen
    arguments:
    text (string) the text to be rendered
    positionX & positionY (float) top left position of where text will be rendered
    size (float) text size
    color (RGB object) text color
    */
    renderText(text, positionX=null, positionY=null, size=40, color=new RGB(0,0,0)){
        if(positionX==null) positionX = (this.getPixelWidth()/2.0); //- ((text.length/2.0)*this._moveUnits);
        if(positionY==null) positionY = (this.getPixelHeight()/2.0); //- (size/2);
        this._context.fillStyle = color.colorString();
        this._context.font = size + 'px Arial';
        this._context.textAlign = "center"; 
        this._context.fillText(text, positionX, positionY);
    }

    /* these are tile methods used in conjuction with our tile and emptyTiles array
    these methods make tile game behavior easier
    The tile array is a list of what tileType is in that tile. 
    Is either empty or what ever you define in the tileEnum.
    The empty tile array is a list of all tiles that are set to empty
    */

    // gets a random tile index from our free tile array.
    // returns int if available or null in array is empty
    getRandomFreeTileIndex(){
        let freeIndex = Math.floor( Math.random() * this._emptyTiles.length );
        return this._emptyTiles[freeIndex];
    }
    // sets the tile at given index (int) to empty
    freeTile(index){
        this._tiles[ index ] = tileEnum.EMPTY;
        this._emptyTiles.push(index);
    }
    // sets the tileType of given index (int) to tileType
    ocupyTile(index, tileType){
        this._tiles[ index ] = tileType;
        this.removeEmptyTile(index);
    }
    // sets the tile at index (int) to the given tileType
    setTileType(index, tileType){ this._tiles[ index ] = tileType;}
    // returns the tileTyle of given index (int)
    getTileType(index){return this._tiles[index];}
    // removes empty tile of given index (int) from our empty tile array
    removeEmptyTile(index){
        let spliceIndex = this._emptyTiles.indexOf(index); 
        this._emptyTiles.splice(spliceIndex, 1);
    }
    // convers a Vrctor position to a tile array index position
    // returns int
    convertVectorToIndex(vector){ 
        return parseInt(vector.x) + (parseInt(vector.y) * this._width) ;
    }
    // comverts a tile index position to a vector object
    // returns Vector object
    convertIndexToVector(index){
        let returnVector = new Vector();
        returnVector.x = (index % this._width) + 0.5;
        returnVector.y = parseInt( index/this._width) + 0.5;
        return returnVector;
    }

}

/*
gameObject is our 
*/

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

        this._secondSquare = false;
        this._secondColor = null;
        this._secondSize = null;

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
                if(this._secondSquare){
                    let squarePosition = square.getTopLeft().sum(this._secondSize.mul(0.5));
                    square.drawSquare(squarePosition, this._secondSize, this._secondColor);
                }
            }
            this.postRender(gameGrid); 
        } 
    }
    // method that gets called right before the game starts
    _start(gameGrid){
        if(this._autoBB) this.updateBoundingBox(); // first thing is to generate a bounding box
        this.start(gameGrid);
        if(this._gridSnap==true){
            this.position.x = parseInt(this.position.x) + 0.5;
            this.position.y = parseInt(this.position.y) + 0.5;
        }
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
    enableAutoBB(){this._autoBB=true;}
    disableAutoBB(){this._autoBB=false;}
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
    insertSquare(square, index=0){
        square.gameObject = this;
        if(square._color==null) square._color = this._color;
        this._squareArray.splice( index, 0, square);
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

    // second square methods
    setSecondSquareOn(color=RGB.makeRandomColor(), size=new Vector(.5,.5)){
        this._secondSquare = true;
        this._secondColor = color;
        this._secondSize = size;
    }
    setSecondSquareOff(){
        this._secondSquare = false;
        this._secondColor = null;
        this._secondSize = null;
    }

    // when overriding these methods dont forget to pass a gameGrid input
    preUpdate(gameGrid){return true}; 
    update(gameGrid){return true;}
    postUpdate(gameGrid){return true;} 
    render(gameGrid){return true;}
    postRender(gameGrid){return true;}
    start(gameGrid){return true;}
   
    inputKeyDown(keyCode){return true;}
    inputKeyUp(keyCode){return true;}
    mouseClick(mousePos){return true;}

    setColor(r=150, g=150, b=150){
        this._color.setColor(r,g,b);
        for(let i=0; i<this._squareArray.length; i++){
            this._squareArray[i]._color = this._color;
        }
    }
    setColorObject(rgbObject){this._color.setColor(rgbObject.r, rgbObject.g, rgbObject.b);}

    setRandomColor(){
        let newColor = RGB.makeRandomColor();
        this._color.setColor(newColor.r, newColor.g, newColor.b);
    }
    
    setRandomDirection(len=1, normalize=true){
        // randomly generates diagonal directions
        // len will be the length of the X & Y values. That can make the ball move faster
        // normalize will normalize the direction vector after setting new value
        let xValue = Math.floor( Math.random() * 3 ) -1; // horizontal direction
        let yValue = Math.floor( Math.random() * 3 ) -1; // vertical direction

        this.direction = new Vector( xValue, yValue);
        this.direction = this.direction.mul(len);
        if(normalize==true){
            this.direction.normalize();
        }
    }
    setRandomDirectionX(len=1, normalize=false){
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
    setRandomPosition(){
        let randomX = Math.floor(Math.random() * this._gameGrid._width);
        let randomY = Math.floor(Math.random() * this._gameGrid._height);
        if(this._gridSnap){
            randomX = parseInt(randomX);
            randomY = parseInt(randomY);
        }
        this.position = new Vector(randomX, randomY);
    }


    getPosition(){return this.position.copy();}
    getPrevPosition(){return this.prevPosition.copy();}
    getNextPosition(){return this.position.sum(this.direction);}

    getDirection(){ 
        if(this._gridSnap==true){
            return this.direction.copy();
        }
        else{
            let nextPosition = this.direction.normalized();
            return nextPosition.mul( this._gameGrid.getDeltaTime() * this._speed);
        }
        
    }

    move(){ this.moveTo( this.getDirection() ); }

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
                let collision = mySquare.overlap(givenSquare);
                if(collision!=false) return collision;
            }
        }
        return false;
    } 

    updateBoundingBox(){ this._bb.updateBoundingBox(); }

    // tile methods
    getPositionAsIndex(){
        return this._gameGrid.convertVectorToIndex(this.position.copy());
    }
    getNextPositionAsIndex(){
        return this._gameGrid.convertVectorToIndex(this.getNextPosition());
    }
    setIndexPosition(index){
        this.position = this._gameGrid.convertIndexToVector(index);
    }
}

// a simple gameObject subClass that just adds movement keycodes to move up/down/left/right
class GameObjectMove extends GameObject{
    constructor(gameGrid, x=0, y=0, canUpdate=true, canRender=true, wasd=false){
        super(gameGrid=gameGrid, x=x, y=y, canUpdate=canUpdate, canRender=canRender);
        this.wasd=wasd;
        if(this.wasd) this.setWasd();
        else this.setArrow();
    }

    setWasd(){
        this.wasd=true;
        this.moveKeys = {UP:keyCodesEnum.W, DOWN:keyCodesEnum.S, 
            LEFT:keyCodesEnum.A, RIGHT:keyCodesEnum.D};
    }
    setArrow(){
        this.wasd=false;
        this.moveKeys = {UP:keyCodesEnum.UP, DOWN:keyCodesEnum.DOWN, 
            LEFT:keyCodesEnum.LEFT, RIGHT:keyCodesEnum.RIGHT};
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
        this.setWrapAroundOff();
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
        this.setAutoLimit();
    }

    isVertical(){return this._isVertical;}

    setHorizontal(){
        this._isVertical = false;
        if(this.wasd) this.moveKeys = {UP:null, DOWN:null, LEFT:keyCodesEnum.LEFT, RIGHT:keyCodesEnum.RIGHT};
        else this.moveKeys = {UP:null, DOWN:null, LEFT:keyCodesEnum.LEFT, RIGHT:keyCodesEnum.RIGHT};
        this.setAutoLimit();
    }

    isHorizontal(){return !this._isVertical;}

    postUpdate(gameGrid){
        if(this.isVertical()){
            if(this.position.y<this._minLimit){
                this.position.y=this._minLimit;
            }
            else if (this.position.y>this._maxLimit){
                this.position.y=this._maxLimit;
            }  
        }
        else{
            if(this.position.x<this._minLimit){
                this.position.x=this._minLimit;
            }
            else if (this.position.x>this._maxLimit){
                this.position.x=this._maxLimit;
            }  
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
        this.setWrapAroundOff()
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

class KeyboardInterface{
    constructor(gameObject){
        this.gameObject = gameObject
    }
    remove(){}
    keyDown(keyCode){}
    keyUp(keyCode){}

}
class Directional extends KeyboardInterface{
    constructor(gameObject, wasd=true){
        super(gameObject)
        this.wasd=wasd;
        if(this.wasd) this.setWasd();
        else this.setArrow();
    }

    setWasd(){
        this.wasd=true;
        this.moveKeys = {UP:keyCodesEnum.W, DOWN:keyCodesEnum.S, 
            LEFT:keyCodesEnum.A, RIGHT:keyCodesEnum.D};
    }
    setArrow(){
        this.wasd=false;
        this.moveKeys = {UP:keyCodesEnum.UP, DOWN:keyCodesEnum.DOWN, 
            LEFT:keyCodesEnum.LEFT, RIGHT:keyCodesEnum.RIGHT};
    }

    keyDown(keyCode){
        switch(keyCode){
            case(keyCodesEnum.UP):
                this.gameObject.direction.y=-1;
                break;
            case(keyCodesEnum.DOWN):
                this.gameObject.direction.y=1;
                break;
            case(keyCodesEnum.LEFT):
                this.gameObject.direction.x=-1;
                break;
            case(keyCodesEnum.RIGHT):
                this.gameObject.direction.x=1;
                break;
        }
    }

    keyUp(keyCode){
        switch(keyCode){
            case(keyCodesEnum.UP):
                this.gameObject.direction.y=0;
                break;
            case(keyCodesEnum.DOWN):
                this.gameObject.direction.y=0;
                break;
            case(keyCodesEnum.LEFT):
                this.gameObject.direction.x=0;
                break;
            case(keyCodesEnum.RIGHT):
                this.gameObject.direction.x=0;
                break;
        }
    }

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
    dot(vector){
        return (this.x * vector.x) + (this.y * vector.y);
    }
    // check if given vector is equal to this vector
    isEqual(vector){
        if(this.x != vector.x) return false;
        if(this.y != vector.y) return false;
        return true;
    }
    copy(){
        return new Vector(this.x, this.y);
    }

    truncate(){
        this.x = parseInt(this.x);
        this.y = parseInt(this.y);
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
        let newColor = RGB.makeRandomColor();
        this._color.setColor(newColor.r, newColor.g, newColor.b);
    }

    render(){
        let position = this.getTopLeft();
        this.renderAt(position);
    }

    renderAt(position){
        this.drawSquare(position, this.size, this._color)
    }

    drawSquare(position, size=new Vector(1,1), color=RGB.makeRandomColor() ){
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
        if([32, 37, 38, 39, 40].indexOf(event.keyCode) > -1) {
            event.preventDefault();
        }
        //event.preventDefault();

    });
    document.addEventListener('keyup', function(event) {
        gameGrid._inputKeyUp(event.keyCode);
    });

    document.addEventListener("click", function (event) {
        let rect = gameGrid._canvas.getBoundingClientRect();
        var mousePos = new Vector(event.clientX - rect.left, event.clientY - rect.top)
        if(mousePos.x >=0 && mousePos.x <= gameGrid.getPixelWidth() &&
        mousePos.y >= 0 && mousePos.y <= gameGrid.getPixelHeight()){
            gameGrid._mouseClick(mousePos);
        }
        
    }, false);
    
}
