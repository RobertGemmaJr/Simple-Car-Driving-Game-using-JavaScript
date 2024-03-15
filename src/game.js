/**
 * Code originated as "Simple Car Driving Game"
 * https://www.sourcecodester.com/javascript/15229/simple-car-driving-game-using-javascript-free-source-code.html#google_vignette
 */

class Game {
  constructor(context, xDim, yDim) {
    // Context and dimensions of the <canvas>
    this.ctx = context;
    this.width = xDim;
    this.height = yDim;

    // Position of the camera
    this.cameraHeight = 50;
    this.cameraDepth = 10;

    // Position of the player
    this.playerX = 0;
    this.playerZ = 0;

    // Road dimensions (boundaries includes the grass)
    this.roadWidth = 80;
    this.boundaries = [-160, 160];

    // Segments of the ground to be drawn
    this.segments = [];
    this.numOfSegments = 2000;
    this.segmentLength = 200;

    // Player speed
    this.speed = 0;
    this.acceleration = 0;
    this.maxSpeed = 80;
    this.dx = 0;

    this.drawDistance = 35;

    // Spites to be drawn
    this.sprites = [];
    this.spriteWidth = 20;
    this.spriteLength = 250;
    this.numberOfSprites = 120;

    this.gameOver = false;
    this.finalGameState = null;
    this.startTime = new Date().getTime();

    // Load images and generate the sprites
    loadImages(this);
    generateSprites(this);
    generateSegments(this);
  }

  keyPressed(event) {
    if (event.which === KEYS.UP || event.which === KEYS.W) {
      this.acceleration = 0.5;
    }
    if (event.which === KEYS.RIGHT || event.which === KEYS.D) {
      this.dx = 1 / 55;
    }
    if (event.which === KEYS.LEFT || event.which === KEYS.A) {
      this.dx = -1 / 55;
    }
  }

  keyUnpressed(event) {
    if (event.which === KEYS.UP || event.which === KEYS.W) {
      this.acceleration = -0.5;
    }
    if (event.which === KEYS.RIGHT) {
      if (this.dx === 1 / 55) {
        this.dx = 0;
      }
    }
    if (event.which === KEYS.LEFT) {
      if (this.dx === -1 / 55) {
        this.dx = 0;
      }
    }
  }

  collisionDetected(color) {
    if (color === COLORS.STOP) {
      this.speed = 5;
    } else if (color === COLORS.GO) {
      this.speed += 80;
    } else if (color === COLORS.DEAD) {
      this.gameOver = true;
      this.finalGameState = "YOU LOSE";
    } else if (color === COLORS.WIN) {
      this.gameOver = true;
      this.finalGameState = "YOU WIN";
    }
  }

  adjustPosition() {
    var slowDown = this.onGrass ? -5 : -this.speed / this.maxSpeed;
    if (this.speed >= this.maxSpeed) {
      this.speed += slowDown;
    } else {
      if (this.acceleration < 0 && this.speed <= 0) {
        this.speed = 0;
      } else {
        this.speed += this.acceleration;
      }
    }
    var xPos = this.playerX + this.speed * this.dx;
    if (xPos > this.boundaries[0] && xPos < this.boundaries[1]) {
      this.playerX = xPos;
    }
    if (xPos > this.roadWidth - 12 || xPos < -this.roadWidth + 12) {
      this.onGrass = true;
      this.maxSpeed = 30;
    } else {
      this.onGrass = false;
      this.maxSpeed = 80;
    }
    this.playerZ += this.speed;
  }

  drawRoad() {
    var currentSegment = Math.floor(this.playerZ / 200) % this.segments.length;
    for (i = 0; i < this.drawDistance; i++) {
      const n = (i + currentSegment) % this.segments.length;
      if (this.segments[n][0] > this.playerZ) {
        drawSegment(
          this,
          this.segments[n][0],
          this.segments[n][1],
          this.segments[n][2],
          this.segments[n][3]
        );
      }
    }
  }

  drawSpritesAndDetectCollisions() {
    drawSprites(this);
    detectCollisions(this);
  }

  drawBackground() {
    this.ctx.drawImage(
      this.sunset,
      this.playerX * -0.1 - this.width / 2,
      -this.height / 2 - 50,
      this.width * 2,
      this.height * 2
    );
  }

  drawCar() {
    this.ctx.drawImage(
      this.car,
      this.width / 3.5,
      this.height / 1.5,
      this.width / 2.5,
      this.height / 3
    );
  }

  drawTimer() {
    this.ctx.font = "10px sans-serif";
    this.ctx.fillStyle = "black";
    this.ctx.fillText("Your Time: " + (new Date().getTime() - this.startTime) / 1000, 10, 20);
  }

  render() {
    this.ctx.clearRect(0, 0, this.width, this.height);
    this.adjustPosition();
    this.drawBackground();
    this.drawRoad();
    this.drawSpritesAndDetectCollisions();
    this.drawCar();
    this.drawTimer();
    if (this.gameOver) {
      this.endGame();
    }
  }

  run() {
    this.gameLoop = setInterval(this.render.bind(this), 1000 / 60);
  }

  endGame() {
    clearInterval(this.gameLoop);
    this.ctx.clearRect(0, 0, this.width, this.height);
    this.ctx.font = "48px serif";
    this.ctx.fillStyle = "black";
    this.ctx.fillText(this.finalGameState, this.width / 3.1, this.height / 2);
    if (this.finalGameState === "YOU WIN") {
      this.ctx.fillText(
        "Final Time: " + (new Date().getTime() - this.startTime) / 1000,
        this.width / 3.7,
        this.height / 2 + 50
      );
    } else {
      this.ctx.font = "20px serif";
      this.ctx.fillText("Try Again", this.width / 4, this.height / 2 + 50);
    }
  }
}

// TODO: Just make this an object?
// Game.KEYS = {
//   LEFT: 37,
//   UP: 38,
//   RIGHT: 39,
//   DOWN: 40,
//   A: 65,
//   D: 68,
//   S: 83,
//   W: 87,
// };
