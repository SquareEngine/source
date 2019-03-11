// title screen

const CANVAS_SCALE = 20;
const SPEED_UP = 3;

var gameGrid = new GameGrid(36, 20, CANVAS_SCALE);

gameGrid.color1 = RGB.makeRandomColor();
gameGrid.color2 = RGB.makeRandomColor();
gameGrid.colorLerpCounter = 0
gameGrid.colorLerpDirection = false;
gameGrid.colorLerpSpeed = 10;

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
}

createGameLoop(gameGrid);
