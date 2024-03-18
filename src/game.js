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

    // CONSTANTS

    // Position of the camera
    this.cameraHeight = 50; // CONSTANT
    this.cameraDepth = 10; // CONSTANT

    // Road dimensions (boundaries includes the grass)
    this.roadWidth = 80;
    this.boundaries = [-160, 160];

    // The total game is 2000 * 200px long
    this.numOfSegments = 2000;
    this.segmentLength = 200;

    // Maximum allowed speed of the player
    this.maxSpeed = 80;

    // The total distance (z) to draw in a single frame
    this.drawDistance = 35;

    // The size of an individual sprite (polygon)
    this.spriteWidth = 20;
    this.spriteLength = 250;

    // The total number of sprites in the game
    this.numberOfSprites = 120;

    // THESE CHANGE AS THE GAME IS PLAYED

    // Segments of the ground to be drawn
    this.segments = [];

    // Sprites (polygons) to be drawn
    this.sprites = [];

    // Position of the player
    this.playerX = 0;
    this.playerZ = 0;
    // Note the player is always "on" the road so y is always 0

    // Player speed and change in speed
    this.speed = 0;
    this.acceleration = 0;
    this.dx = 0;

    // Whether or not the game is over and if won/lost
    this.gameOver = false;
    this.finalGameState = null;
    this.startTime = new Date().getTime();

    // Load images and generate the sprites
    loadImages(this);
    generateSprites(this);
    generateSegments(this);
  }

  // KEYBOARD EVENT HANDLERS

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

  // Detect if player has collided with a sprite
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

  // Move the player on the canvas
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

  // DRAW FUNCTIONS

  // Draw the background image
  drawBackground() {
    this.ctx.drawImage(
      this.sunset,
      this.playerX * -0.1 - this.width / 2,
      -this.height / 2 - 50,
      this.width * 2,
      this.height * 2
    );
  }

  // Draw the needed segments of the road
  drawRoad() {
    var currentSegment = Math.floor(this.playerZ / 200) % this.segments.length;
    for (i = 0; i < this.drawDistance; i++) {
      const n = (i + currentSegment) % this.segments.length;
      if (this.segments[n][0] > this.playerZ) {
        drawSegment(
          this,
          this.segments[n][0], // Start z
          this.segments[n][1], // End z
          this.segments[n][2], // Color
          this.segments[n][3] // Gras color
        );
      }
    }
  }

  // Draw the car image
  drawCar() {
    this.ctx.drawImage(
      this.car,
      this.width / 3.5,
      this.height / 1.5,
      this.width / 2.5,
      this.height / 3
    );
  }

  // Draw the timer
  drawTimer() {
    this.ctx.font = "10px sans-serif";
    this.ctx.fillStyle = "black";
    this.ctx.fillText("Your Time: " + (new Date().getTime() - this.startTime) / 1000, 10, 20);
  }

  // Render a frame and handle the physics
  render() {
    // Adjust the player position
    this.adjustPosition();

    // Draw the frame
    this.ctx.clearRect(0, 0, this.width, this.height);
    this.drawBackground();
    this.drawRoad();
    drawSprites(this);
    this.drawCar();
    this.drawTimer();

    // Check for collisions
    detectCollisions(this);
    if (this.gameOver) {
      this.endGame();
    }
  }

  // PUBLIC FUNCTIONS

  // Begin rendering the game
  run() {
    this.gameLoop = setInterval(this.render.bind(this), 1000 / 60);
  }

  // Stop rendering the game and render the end screen
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
