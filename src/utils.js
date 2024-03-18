const COLORS = {
  STOP: "#FF0000",
  GO: "#00FF00",
  DEAD: "#000000",
  WIN: "#FFFFFF",
};

const KEYS = {
  LEFT: 37,
  UP: 38,
  RIGHT: 39,
  DOWN: 40,
  A: 65,
  D: 68,
  S: 83,
  W: 87,
};

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function project(game, worldX, worldY, worldZ, objectWidth) {
  var cameraX = worldX - game.playerX;
  // camera height is essentially 'playerY'
  var cameraY = worldY - game.cameraHeight;
  var cameraZ = worldZ - game.playerZ;
  var scale = game.cameraDepth / cameraZ;
  var x = Math.round(game.width / 2 + (scale * cameraX * game.width) / 2);
  var y = Math.round(game.height / 2 - (scale * cameraY * game.height) / 2);
  var w = Math.round((scale * objectWidth * game.width) / 2);
  return [x, y, w];
}

// Load the needed images
function loadImages(game) {
  game.sunset = new Image();
  game.car = new Image();
  game.sunset.src = "./photos/sunset.jpg";
  game.car.src = "./photos/porsche.png";
}

// Detect if the player has collided with a sprite
function detectCollisions(game, x, z, color) {
  if (
    game.playerZ > z - 400 &&
    game.playerZ < z - 400 + game.spriteLength &&
    game.playerX > x - game.spriteWidth &&
    game.playerX < x + game.spriteWidth
  ) {
    game.collisionDetected(color);
  }
}

// Check if the player has finished the game
function checkForFinish(game) {
  var z = (game.numOfSegments - 100) * game.segmentLength;
  if (game.playerZ < z && z - game.playerZ < game.segmentLength * game.drawDistance) {
    var start = project(game, 0, 0, z, game.roadWidth);
    var end = project(game, 0, 0, z + game.spriteLength, game.roadWidth);
    var x1 = start[0];
    var y1 = start[1];
    var w1 = start[2];
    var x2 = end[0];
    var y2 = end[1];
    var w2 = end[2];
    drawPolygon(game.ctx, x1 - w1, y1, x1 + w1, y1, x2 + w2, y2, x2 - w2, y2, COLORS.WIN);
  }
  if (game.playerZ > z) {
    game.collisionDetected(COLORS.WIN);
  }
}

// GENERATION UTILITIES

// Generate the sprites in the game
function generateSprites(game) {
  for (i = 0; i < game.numberOfSprites; i++) {
    var x = getRandomInt(-game.roadWidth + game.spriteWidth, game.roadWidth - game.spriteWidth);
    var y = 0;
    var z = ((game.numOfSegments - 200) * game.segmentLength * i) / game.numberOfSprites + 10000;
    if (i % 5 === 0) {
      var color = COLORS.DEAD;
    } else {
      var color = i % 2 === 1 ? COLORS.STOP : COLORS.GO;
    }

    game.sprites.push([x, y, z, color]);
  }
}

// Generate the segments in the game
function generateSegments(game) {
  for (var n = 0; n < game.numOfSegments; n++) {
    var color = Math.floor(n) % 3 ? "#696969" : "white";
    var grassColor = Math.floor(n) % 2 ? "#007700" : "#006600";
    game.segments.push([n * game.segmentLength, (n + 1) * game.segmentLength, color, grassColor]);
  }
}

// DRAW UTILITIES

// Draws a simple polygon
function drawPolygon(ctx, x1, y1, x2, y2, x3, y3, x4, y4, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.lineTo(x3, y3);
  ctx.lineTo(x4, y4);
  ctx.closePath();
  ctx.fill();
}

// Draw the sprites in view
function drawSprites(game) {
  for (i = 0; i < game.numberOfSprites; i++) {
    var currentSprite = game.sprites[i];
    var x = currentSprite[0];
    var y = currentSprite[1];
    var z = currentSprite[2];
    var color = currentSprite[3];
    if (game.playerZ <= z && z - game.playerZ < game.segmentLength * game.drawDistance) {
      renderSprite(game, x, y, z, color);
      detectCollisions(game, x, z, color);
    }
  }
  checkForFinish(game);
}

// Draw a single sprite
function renderSprite(game, x, y, z, color) {
  var start = project(game, x, y, z, game.spriteWidth);
  var end = project(game, x, y, z + game.spriteLength, game.spriteWidth);

  var x1 = start[0];
  var y1 = start[1];
  var w1 = start[2];
  var x2 = end[0];
  var y2 = end[1];
  var w2 = end[2];

  // Polygon is written on the ground in a square (X and Z, polygon has no height)
  // Image needs to be drawn from the ground (X and Y, image has no depth)
  drawPolygon(game.ctx, x1 - w1, y1, x1 + w1, y1, x2 + w2, y2, x2 - w2, y2, color);
  game.ctx.drawImage(game.sunset, x1 - w1, y1, x1 + w1 - (x1 - w1), y2 - y1);
}

// Draw a single segment
function drawSegment(game, start, end, color, grassColor) {
  var start = project(game, 0, 0, start, game.roadWidth);
  var end = project(game, 0, 0, end, game.roadWidth);

  var x1 = start[0];
  var y1 = start[1];
  var w1 = start[2];
  var x2 = end[0];
  var y2 = end[1];
  var w2 = end[2];
  drawPolygon(game.ctx, 0, y1, x1 - w1, y1, x2 - w2, y2, 0, y2, grassColor);
  drawPolygon(game.ctx, game.width, y1, x1 + w1, y1, x2 + w2, y2, game.width, y2, grassColor);
  drawPolygon(game.ctx, x1 - w1, y1, x1 + w1, y1, x2 + w2, y2, x2 - w2, y2, "#696969");
  drawPolygon(
    game.ctx,
    x1 - w1 / 25,
    y1,
    x1 + w1 / 25,
    y1,
    x2 + w2 / 25,
    y2,
    x2 - w2 / 25,
    y2,
    color
  );
}

const test = {
  drawImage: {
    x: 522,
    y: 426,
    w: 200,
    h: 200,
  },
  drawPolygon: {
    x1: 522,
    y1: 426,
    x2: 554,
    y2: 426,
    x3: 553,
    y3: 425,
    x4: 523,
    y4: 425,
  },
};
