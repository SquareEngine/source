// title screen


const CANVAS_SCALE = 20;

var gameGrid = new GameGrid(40, 20, CANVAS_SCALE);

class SquareDot extends GameObjectMove{

    start(){
        this.storedPos = this.position.copy();
        this.floating = false;
        this.startColor = new RGB(255,0,0);
    }
    
    mouseClick(mousePos){
        if(this.floating==false){
            while(this.direction.len()<0.01) this.setRandomDirection(1, false);
            this.floating = true;
            gameGrid._setGameToUpdate();
        }
        else{
            this.direction = new Vector(0,0);
            this.position = this.storedPos;
            this.setColorObject(this.startColor);
            this.floating = false;
            gameGrid._setGameToStart();
        }
        
    }

    screenTop(){this.setRandomColor();}
    screenBot(){this.setRandomColor();}
    screenLeft(){this.setRandomColor();}
    screenRight(){this.setRandomColor();}
}
gameGrid.addToFactory("SquareDot", SquareDot);

gameGrid.start = function(){

    gameGrid.color1 = RGB.makeRandomColor();
    gameGrid.color2 = RGB.makeRandomColor();
    gameGrid.colorLerpCounter = 0
    gameGrid.colorLerpDirection = false;
    gameGrid.colorLerpSpeed = 5;

    let squareSXY = [
                    [0,0],[1,0],[2,0],[3,0],[4,0],
                    [0,1],                  [4,1],
                    [0,2],
                    [0,3],[1,3],[2,3],[3,3],[4,3],
                                            [4,4],
                    [0,5],                  [4,5],
                    [0,6],[1,6],[2,6],[3,6],[4,6] 
                ];

    let squareQXY = [
                    [0,0],[1,0],[2,0],[3,0],[4,0],
                    [0,1],                  [4,1],
                    [0,2],                  [4,2],
                    [0,3],                  [4,3],
                    [0,4],      [2,4],      [4,4],
                    [0,5],            [3,5],[4,5],
                    [0,6],[1,6],[2,6],[3,6],[4,6] 
                ];

    let squareUXY = [
                    [0,0],                  [4,0],
                    [0,1],                  [4,1],
                    [0,2],                  [4,2],
                    [0,3],                  [4,3],
                    [0,4],                  [4,4],
                    [0,5],                  [4,5],
                    [0,6],[1,6],[2,6],[3,6],[4,6] 
                ];

    let squareAXY = [
                        [1,0],[2,0],[3,0],
                    [0,1],                  [4,1],
                    [0,2],                  [4,2],
                    [0,3],[1,3],[2,3],[3,3],[4,3],
                    [0,4],                  [4,4],
                    [0,5],                  [4,5],
                    [0,6],                  [4,6] 
                ];

    let squareRXY = [
                    [0,0],[1,0],[2,0],[3,0],
                    [0,1],                  [4,1],
                    [0,2],                  [4,2],
                    [0,3],[1,3],[2,3],[3,3],
                    [0,4],                  [4,4],
                    [0,5],                  [4,5],
                    [0,6],                  [4,6] 
                ];

    let squareEXY = [
                    [0,0],[1,0],[2,0],[3,0],[4,0],
                    [0,1],                  
                    [0,2],                
                    [0,3],[1,3],[2,3],[3,3],               
                    [0,4],      
                    [0,5],            
                    [0,6],[1,6],[2,6],[3,6],[4,6] 
                ];

    let squareNXY = [
                    [0,0],                  [4,0],
                    [0,1],                  [4,1],
                    [0,2],[1,2],            [4,2],
                    [0,3],      [2,3],      [4,3],
                    [0,4],            [3,4],[4,4],
                    [0,5],                  [4,5],
                    [0,6],                  [4,6] 
                ];

    let squareGXY = [
                    [0,0],[1,0],[2,0],[3,0],[4,0],
                    [0,1],                  [4,1],
                    [0,2],                  
                    [0,3],            [3,3],[4,3],
                    [0,4],                  [4,4],
                    [0,5],                  [4,5],
                    [0,6],[1,6],[2,6],[3,6],[4,6] 
                ];

    let squareIXY = [
                    [2,0],
                    [2,2],                
                    [2,3],              
                    [2,4],      
                    [2,5],            
                    [2,6],
                ];

    
    let squareWord = [squareSXY, squareQXY, squareUXY, squareAXY, squareRXY, squareEXY];
    let startPos = [3,2];
    let squareSpeed = 5

    for(let j=0; j<squareWord.length; j++){
        let word = squareWord[j];

        for(let i=0; i<word.length; i++){
            let posX = word[i][0] + startPos[0] + (j*6);
            let posY = word[i][1] + startPos[1];
            let square = gameGrid.createGameObject("squareA" + i, "SquareDot", x=posX, y=posY);
            square.setSpeed(Math.ceil(Math.random()*squareSpeed));
            //thisSquare.setColorObject(startColor)
            //thisSquare.startColor = startColor;
        }
    }

    let engineWord = [squareEXY, squareNXY, squareGXY, squareIXY, squareNXY, squareEXY];
    startPos = [3,12];

    for(let j=0; j<engineWord.length; j++){
        let word = engineWord[j];

        for(let i=0; i<word.length; i++){
            let posX = word[i][0] + startPos[0] + (j*6);
            let posY = word[i][1] + startPos[1];
            let square = gameGrid.createGameObject("squareB" + i, "SquareDot", x=posX, y=posY);
            square.setSpeed(Math.ceil(Math.random()*squareSpeed));
            //thisSquare.setColorObject(startColor)
            //thisSquare.startColor = startColor;
        }
    }
    
    //setTimeout(function() { gameGrid._setGameToUpdate(); }, 5);
    //gameGrid._gameState = gameStateEnum.UPDATE;
    //;
}

gameGrid.update = function(){
        
    let lerpValue = this.colorLerpCounter/this.colorLerpSpeed ;
    if(lerpValue>1) lerpValue=1;
    
    
    if(this.colorLerpDirection==true){
        let color = RGB.lerpColor(this.color1, this.color2, lerpValue);
        this.setBackgroundColor(color);
    }
    else {
        let color = RGB.lerpColor(this.color2, this.color1, lerpValue);
        this.setBackgroundColor(color);
    }

    if(this.colorLerpCounter >= this.colorLerpSpeed){
        this.colorLerpDirection = !this.colorLerpDirection;
        this.colorLerpCounter = 0;
    }
    else this.colorLerpCounter += this.getDeltaTime();
    //console.log("b")
}

gameGrid._startScreen = function(){
    gameGrid._renderBackground();
    gameGrid._render();
}

createGameLoop(gameGrid);

