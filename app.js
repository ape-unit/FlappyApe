// variables for the canvas itself
var canvas = document.getElementById("myCanvas");
var ctx = canvas.getContext("2d");
// variables for images
var titleImage = new Image();
titleImage.src = "images/title.png";
var playerImage = new Image();
playerImage.src = "images/apeBird.png";
var backgroundImage = new Image();
backgroundImage.src = "images/background.jpg";
var bananaImage = new Image();
bananaImage.src = "images/banana.png";
var bottomPipeImage = new Image();
bottomPipeImage.src = "images/bottomPipe.png";
var topPipeImage = new Image();
topPipeImage.src = "images/topPipe.png";
var gameOverImage = new Image();
gameOverImage.src = "images/gameOver.png";
// numerical values
var scrollingAmount = 0;
var jumpTime = 15;
var spawnInterval = 200;
var counter = 0;
var score = 0;
var refreshRate = 2;
var scoreInterval = 0;
// player object
var player = {x: 80, y: 250, width: 50, height: 50, incrementY : function(amount) {
    this.y = this.y + amount;
  }};
// jumping boolean
var goingUp = false;
// pipe objects
var bottomPipes = [{x: 900, y: 420, width: 100, height: 150, move : function() {
    this.x -= refreshRate;
}}];
var topPipes = [{x: 900, y: 0, width: 100, height: 210, move : function() {
    this.x -= refreshRate;
}}];
// banana objects
var bananas = [{x: 940, y: 310, width: 40, height: 40, move : function() {
    this.x -= refreshRate;
}}];
// key listener values
document.addEventListener("keydown", keyDownHandler, false);
document.addEventListener("keyup", keyUpHandler, false);
var upPressed = false;
var enterPressed = false;
// game booleans
var gameStarted = false;
var isGameOver = false;

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (gameStarted) {
        // draw background
    ctx.drawImage(backgroundImage, -1 * scrollingAmount, 0);
    ctx.drawImage(backgroundImage, canvas.width - scrollingAmount, 0)
    scrollingAmount += 1;
    if (scrollingAmount > canvas.width) {
        scrollingAmount = 0;
    }

    // draw player
    ctx.drawImage(playerImage, player.x, player.y);
    // update player position based on jump
    if (upPressed || goingUp) {
        if (goingUp) {
            if (jumpTime > 13) {
                player.incrementY(-9);
            } else if (jumpTime > 10) {
                player.incrementY(-7);
            } else if (jumpTime > 7) {
                player.incrementY(-5);
            } else if (jumpTime > 4) {
                player.incrementY(-3);
            } else if (jumpTime == 1) {
                player.incrementY(-1);
            }
            if (player.y < 0) {
                player.y = 0;
                goingUp = false;
            }

            // change direction if jumpTime == 0
            if (jumpTime != 0) {
                jumpTime--;
            } else {
                goingUp = false;
            }

        }  
    } else {
        // falling
            if (jumpTime >= 13) {
                player.incrementY(8);
            } else if (jumpTime > 10) {
                player.incrementY(7);
            } else if (jumpTime > 7) {
                player.incrementY(5);
            } else if (jumpTime > 4) {
                player.incrementY(2);
            } else if (jumpTime == 1) {
                player.incrementY(1);
            }
            if (jumpTime != 15) {
                jumpTime++;
            }
            // constrain to boundaries
            if (player.y > canvas.height - 50) {
                player.y = canvas.height - 50;
            }
    }


    // generate pipes
    if (counter == spawnInterval) {
        var random = Math.floor((Math.random() * 80)) + 20;
        var topPipeHeight = 0 - random;
        var bottomPipeHeight = 450 - random;
        bottomPipes.push({x: 900, y: bottomPipeHeight, width: 100, height: 150, move : function() {
            this.x -= refreshRate;
        }});
        topPipes.push({x: 900, y: topPipeHeight, width: 100, height: 210, move : function() {
            this.x -= refreshRate;
        }});
        // generate banana
        bananas.push({x: 940, y: Math.floor((topPipeHeight + 150 + bottomPipeHeight) / 2), width: 40, height: 40, move : function() {
            this.x -= refreshRate;
        }})
        counter = 0;
    }
    // draw pipes and banana
    bottomPipes.forEach(element => {
        element.move();
        if (isColliding(element)) {
            gameOver();
        } else if (element.x < -element.width) {
            // remove elements off screen
            bottomPipes.splice(element, 1);
        }
        ctx.drawImage(bottomPipeImage, element.x, element.y)
    });
    topPipes.forEach(element => {
        element.move();
        if (isColliding(element)) {
            gameOver();
        } else if (element.x < -element.width) {
            // remove elements off screen
            topPipes.splice(element, 1);
        }
        ctx.drawImage(topPipeImage, element.x, element.y)
    });
    bananas.forEach(element => {
        element.move();
        
        // collect banans you collide with
        if (isColliding(element)) {
            bananas.splice(element, 1);
            score++;
            scoreInterval++;
        } else if (element.x < -element.width) {
            // remove elements off screen
            bananas.splice(element, 1);
        }
        ctx.drawImage(bananaImage, element.x, element.y)
    });

    ctx.font = "40px Arial";
    ctx.fillStyle = "white";
    ctx.fillText("" + score, canvas.width / 2 - 20, 50);
    counter++;

    // make game harder
    if (scoreInterval % 25 == 0 && scoreInterval != 0) {
        refreshRate++;
        scoreInterval = 0;
        if (spawnInterval > 5) {
            spawnInterval = Math.floor(400 / refreshRate);
        }
    }

    } else if (!isGameOver) {
        canvas.width = 500;
        ctx.drawImage(titleImage, 0, 0);
        ctx.font = "28px Arial";
        ctx.fillStyle = "white";
        ctx.fillText("Press enter to begin", 130, 440);
    } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(gameOverImage, 0, 0);
        ctx.font = "28px Arial";
        ctx.fillStyle = "white";
        ctx.fillText("Your Score: " + score, canvas.width / 2 - 105, 4 * canvas.height / 5);
        ctx.fillText("Press enter to retry", canvas.width / 2 - 105, 4 * canvas.height / 5 + 30);
    }
}
setInterval(draw, 10)

// key listener methods
function keyDownHandler(e) {
    if(e.keyCode == 32 || e.key == "ArrowUp") {
        upPressed = true;
        goingUp = true;
        jumpTime = 15;
    }
    else if(e.key == "Enter" && !gameStarted) {
        enterPressed = true;
        setup();
        canvas.width = 900;
    }
}

// handle releasing buttons
function keyUpHandler(e) {
    if(e.keyCode == 32 || e.key == "ArrowUp") {
        upPressed = false;
    }
    else if(e.key == "Enter") {
        enterPressed = false;
    }
}

// collision detection
function isColliding(element) {
    // check left corners
    if (player.x > element.x && player.x < (element.x + element.width)) {
        // check top left corner
        if (player.y > element.y && player.y < (element.y + element.height)) {
            return true;
        }// check bottom left corner
        else if ((player.y + player.height) > element.y && (player.y + player.height) < (element.y + element.height)) {
            return true;
        }
    } // check right corners
    else if ((player.x + player.width) > element.x && (player.x + player.width) < (element.x + element.width)) {
        // check top right corner
        if (player.y > element.y && player.y < (element.y + element.height)) {
            return true;
        }// check bottom right corner
        else if ((player.y + player.height) > element.y && (player.y + player.height) < (element.y + element.height)) {
            return true;
        }
    }
    
    return false;
}

// game over screen
function gameOver() {
    isGameOver = true;
    gameStarted = false;
    canvas.width = canvas.height;
}

// sets up initial values
function setup() {
    isGameOver = false;
    score = 0;
    scrollingAmount = 0;
    jumpTime = 15;
    spawnInterval = 200;
    counter = 0;
    score = 0;
    refreshRate = 2;
    scoreInterval = 0;

    player = {x: 80, y: 250, width: 50, height: 50, incrementY : function(amount) {
        this.y = this.y + amount;
      }};
    // jumping boolean
    goingUp = false;
    // pipe objects
    bottomPipes = [{x: 900, y: 420, width: 100, height: 150, move : function() {
        this.x -= refreshRate;
    }}];
    topPipes = [{x: 900, y: 0, width: 100, height: 210, move : function() {
        this.x -= refreshRate;
    }}];
    // banana objects
    bananas = [{x: 940, y: 310, width: 40, height: 40, move : function() {
        this.x -= refreshRate;
    }}];
    gameStarted = true;

}