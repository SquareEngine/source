// simple enum to make it easier to interect with keycodes
var keyCodesEnum = {ENTER:13, RESET:82, SPACE:32, LEFT:37, RIGHT:39, UP:38, DOWN:40, W:87, A:65, S:83, D:68}
// tile enum. add here to implement new tile types
var tileEnum = {EMPTY:0};

var gameStateEnum = {START:0, UPDATE:1, PAUSED:2, OVER:3};

class GameGrid{
    constructor(width=10, height=10, canvasWidth=500, canvasHeight=500, gameSpeed=1){

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
        this._stepValue = 100;
        this._gameSpeed = gameSpeed;

        // game states        
        this._gameState = gameStateEnum.START;
    }

    tick(){
        // get delta time
        this._now = Date.now();
        this._deltaTime = this._now - this._lastUpdate;
        this._lastUpdate = this._now;

        // if game is not paused we update
        switch(this._gameState){
            case(gameStateEnum.START):
                this._startScreen();
                break;
            case(gameStateEnum.UPDATE):
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
        for(let i=0; i<this._gameObjects.length; i++) this._gameObjects[i]._preUpdate();

        // game update
        this.update();
        for(let i=0; i<this._gameObjects.length; i++) this._gameObjects[i]._update();

        // post update
        this.postUpdate()
        for(let i=0; i<this._gameObjects.length; i++) this._gameObjects[i]._postUpdate();
 
    }

    _startScreen(){this.startScreen();}
    _pause(){this.pause();}
    _gameOver(){this.gameOver();}
    _reset(){
        this.reset();}

    _render(){
        this.render(); // render background
        for(let i=0; i<this._gameObjects.length; i++) this._gameObjects[i]._render();
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

    getDeltaTime(){return this._deltaTime;}

    addToFactory(gameObjectName, gameObjectClass){
        this._factoryClasses[gameObjectName]=gameObjectClass;
    }

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

    checkCollision(x, y, gameObject){
        for(let i=0; i<gameObject.squareArray.length; i++){
            let xPos = gameObject.squareArray[i].x + gameObject.x;
            let yPos = gameObject.squareArray[i].y + gameObject.y;
            if(xPos==x && yPos == y) return true;
        }
        return false;
    }

    setBackgroundColor(r=150, g=150, b=150){
        rgbText = "rgb(";

        if(r>255) r = 255;
        else if (r<0)r=0;
        rgbText += r + ","

        if(g>255) g = 255;
        else if (g<0)g=0;
        rgbText += g + ","

        if(b>255) b = 255;
        else if (b<0)b=0;
        rgbText += b + ")"

        this._backGroundColor = rgbText
    }

    print(text){this._logger.innerHTML = text;}
    printAdd(text){this._logger.innerHTML += text;}
    erase(){this._logger.innerHTML = "";}

    setGameSpeed(speed){this._gameSpeed=speed;}
    setGameStep(step){this._stepValue=step;}

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

class Vector{
    constructor(x,y){
        this.x = x;
        this.y = y;
    }
}

class GameObject extends Vector{
    constructor(x=0, y=0, canUpdate=true, canRender=true){
        super(x,y);
        this.canUpdate = canUpdate;
        this.canRender = canRender;
        this.squareArray = [new Vector(0,0)];
        this.direction = new Vector(0,0);
        this.color = "rgb(200, 0, 0)";
        this.wrapAround = true;
        this._gameGrid = null;
    }

    _preUpdate(){ if(this.canUpdate == true){} this.preUpdate(); }
    _update(){
        this.move(this.direction.x, this.direction.y);
        if(this.canUpdate == true) this.update(); 
    }
    _postUpdate(){ if(this.canUpdate == true){} this.postUpdate(); }
    _render(){ if(this.canRender == true) this.render(); }
    _inputKeyDown(keyCode){this.inputKeyDown(keyCode);}
    _inputKeyUp(keyCode){this.inputKeyUp(keyCode);}

    //##########################################################################################
    //################################# methods to override ####################################
    //##########################################################################################

    preUpdate(){return true}; 
    update(){return true;}
    postUpdate(){return true;} 
   
    inputKeyDown(keyCode){return true;}
    inputKeyUp(keyCode){return true;}

    drawSquare(positionX, positionY, size=1, color=this.color){
        this._gameGrid.renderSquare(positionX, positionY, size, color);
    }

    render(){
        for(let i=0; i<this.squareArray.length; i++){
            this.drawSquare(
                this.horizontalCheck( this.x + this.squareArray[i].x), 
                this.verticalCheck( this.y + this.squareArray[i].y))
        }
        return true;}

    move(x,y){
        x = parseInt(x);
        y = parseInt(y);
        this.x  = this.horizontalCheck(this.x + x);
        this.y  = this.verticalCheck(this.y + y);
    }

    getNextPosition(){
        return new Vector(this.x + this.direction.x, this.y + this.direction.y);
    }

    horizontalCheck(x){
        if(x >= this._gameGrid._width){
            if(this.wrapAround==true) x = x % this._gameGrid._width
            x = this.screenRight(x);
        }
        else if (x < 0){
            if(this.wrapAround==true) x = this._gameGrid._width + x;
            x = this.screenLeft(x);
        } 
        return x;
    }

    verticalCheck(y){
        if(y >= this._gameGrid._height){
            if(this.wrapAround==true) y = y % this._gameGrid._height
            y = this.screenBot(y);
        }
        else if (y < 0){
            if(this.wrapAround==true) y = this._gameGrid._height + y;
            y = this.screenTop(y);
        } 
        return y;
    }

    screenTop(y){return y;}
    screenBot(y){return y;}
    screenLeft(x){return x;}
    screenRight(x){return x;}
}

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

function createGameLoop(gameGrid){

    var animate = window.requestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    function(callback) { window.setTimeout(callback, 1000/60) }

    window.onload = function() {animate(step);};

    var step = function() {
        gameGrid.tick();
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
