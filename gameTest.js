// a simple PONG test

const CANVAS_WIDTH = 600;
const CANVAS_HEIGHT = 400;
const HORIZONTAL_UNITS = 30;
const VERTICAL_UNITS = 20;

var gameGrid = new GameGrid(HORIZONTAL_UNITS, VERTICAL_UNITS, CANVAS_WIDTH, CANVAS_HEIGHT);

// make dot first so it updates before paddles
let dot = gameGrid.createGameObject("GameObject");


dot.wrapAround = false;

let h_dir = Math.floor( Math.random() * 2 );
let v_dir = Math.floor( Math.random() * 2 );

dot.direction = new Vector([1,-1][h_dir], [1, -1][v_dir]);

dot.update = function(){

    let leftPaddle = gameGrid._gameObjects[1];
    let rightPaddle = gameGrid._gameObjects[2];

    if(dot.y < 0){
        dot.y = 1;
        dot.direction.y = 1;
    }
    else if(dot.y > VERTICAL_UNITS-1){
        dot.y = VERTICAL_UNITS-2;
        dot.direction.y = -1;
    } 

    if(dot.x == 1 && dot.direction.x == -1){
        
        let nextPos = dot.getNextPosition();
        if (gameGrid.checkCollision(nextPos.x, nextPos.y, leftPaddle) == true){
            dot.direction.x = 1;
        }
    }
    else if(dot.x == HORIZONTAL_UNITS-2 && dot.direction.x == 1){
        
        let nextPos = dot.getNextPosition();
        if (gameGrid.checkCollision(nextPos.x, nextPos.y, rightPaddle) == true){
            dot.direction.x = -1;
        }
    } 
    if(dot.x==0){
        if (gameGrid.checkCollision(dot.x, dot.y, leftPaddle) == true){
            dot.x=1;
            dot.direction.x = 1;
        }
        else gameGrid._setGameToOver();
    }
    else if(dot.x==HORIZONTAL_UNITS-1){
        if (gameGrid.checkCollision(dot.x, dot.y, rightPaddle) == true){
            dot.x=HORIZONTAL_UNITS-2;
            dot.direction.x = -1;
        }
        else gameGrid._setGameToOver();

    }

}

dot.move(parseInt(HORIZONTAL_UNITS/2), parseInt(VERTICAL_UNITS/2))

for(let p=0; p<2; p++){

    let paddle = gameGrid.createGameObject("GameObjectMove");

    paddle.color = "rgb(50,50, 150)"

    paddle.x = p * (HORIZONTAL_UNITS-1);

    paddle.move(0, parseInt(VERTICAL_UNITS/2)-2)

    if(p==1){
        paddle.moveKeys.UP = keyCodesEnum.UP;   
        paddle.moveKeys.DOWN = keyCodesEnum.DOWN;   
    }

    for(let i=0; i<3; i++) paddle.squareArray.push(new Vector(0,1+i))

    paddle.moveKeys.RIGHT = null;
    paddle.moveKeys.LEFT = null;
    paddle.wrapAround = false;

    paddle.update = function(){
        if(paddle.y < 0) paddle.y = 0;
        else if(paddle.y > VERTICAL_UNITS-4) paddle.y = VERTICAL_UNITS-4;
    }
}

createGameLoop(gameGrid);
