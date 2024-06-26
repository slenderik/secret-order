function Paddle(x, y, width, height) {
  this.x = x;
  this.y = y;
  this.width = width;
  this.height = height;
}

var BallDirs = {
  NONE: 0,
  LEFT: 1,
  RIGHT: 2,
  UP: 4,
  DOWN: 8,
};

function Ball(x, y, radius, dir, speed) {
  this.x = x;
  this.y = y;
  this.radius = radius;
  this.dir = BallDirs.NONE;
  this.speed = speed;
}

var BricksTypes = {
  DEFAULT: 1,
  ICE: 1,
  WOOD: 2,
};

function Brick(x, y, width, height, type) {
  this.x = x;
  this.y = y;
  this.width = width;
  this.height = height;
  this.lifes = type;
}

function Bricks(hor_num, vert_num, brick_width, brick_height) {
  this.bricks = new Array();
  for (var i = 0; i < vert_num; i++) {
    this.bricks[i] = new Array();
    for (var j = 0; j < hor_num; j++) {
      this.bricks[i][j] = new Brick(
        j * brick_width,
        i * brick_height,
        brick_width,
        brick_height,
        BricksTypes.DEFAULT
      );
    }
  }
}

//-----------------------------------------------------------------------------------------------------------
// Arkanoid Game class
//-----------------------------------------------------------------------------------------------------------

function ArkanoidGame(canvas, context) {
  // Вот плоды моей адаптации.
  var windowInnerWidth = document.documentElement.clientWidth;
  var windowInnerHeight = document.documentElement.clientHeight;

  canvas.width = windowInnerWidth >= 640 ? 640 : windowInnerWidth * 1 - 10;
  canvas.height = windowInnerHeight * 0.8;

  var PADDLE_SPEED = 1;
  var PADDLE_HEIGHT = 10;
  var PADDLE_WIDTH = 60;

  var BALL_RADIUS = 5;
  var BALL_MAX_SPEED = 6;
  var BALL_DEFAULT_SPEED = 3;

  var BRICK_SCORE = 100;
  var BRICK_WIDTH = canvas.width / 6;
  var BRICK_HEIGHT = BRICK_WIDTH * 0.4375;

  var PADDLE_IMAGE = new Image();
  PADDLE_IMAGE.src = "media/paddle.png";

  var BLOCK_BLUE_IMAGE = new Image();
  BLOCK_BLUE_IMAGE.src = "media/block-blue.png";
  BLOCK_BLUE_IMAGE.alt = "БЛЭСТКЭМП (киров)";

  var BLOCK_DARK_BLUE_IMAGE = new Image();
  BLOCK_DARK_BLUE_IMAGE.src = "media/block-dark-blue.png";
  BLOCK_DARK_BLUE_IMAGE.alt = "БЛЭСТКЭМП (киров)";

  var BALL_COLOR = "#b5f046";
  var startModal = document.getElementById("startModal");

  this.level = 0;
  this.lifes = 3;
  this.score = 0;
  this.paddle = new Paddle(
    canvas.width / 2 - PADDLE_WIDTH / 2,
    canvas.height - 20,
    PADDLE_WIDTH,
    PADDLE_HEIGHT
  );
  this.ball = new Ball(
    canvas.width / 2,
    canvas.height / 2,
    BALL_RADIUS,
    BallDirs.NONE,
    BALL_DEFAULT_SPEED
  );
  this.gameOver = false;
  this.gameWin = false;
  this.gamePaused = false;
  this.gameStarted = true;
  this.bricks = new Bricks(8, 2, BRICK_WIDTH, BRICK_HEIGHT);

  this.init = function () {
    this.level = 0;
    this.lifes = 3;
    this.score = 0;
    this.gameOver = false;
    this.gameWin = false;
    this.gamePaused = false;
    this.gameStarted = false;
    this.ball.dir = BallDirs.NONE;
    this.initLevel(this.level);
  };

  this.initLevel = function (level) {
    switch (level) {
      case 0:
        this.bricks = new Bricks(6, 4, BRICK_WIDTH, BRICK_HEIGHT);
        for (var i = 0; i < this.bricks.bricks.length; i++) {
          for (var j = 0; j < this.bricks.bricks[i].length; j++) {
            var a = i < 1 ? 1 : 0;
            this.bricks.bricks[i][j].lifes = BricksTypes.DEFAULT + a;
          }
        }
        break;

      default:
        break;
    }
  };

  this.displayLabel = function (
    text,
    x = canvas.width / 2 - 30,
    y = canvas.height / 2
  ) {
    context.fillStyle = "rgb(255,255,255)";
    context.font = "bold 20px Arial";
    context.fillText(text, x, y);
  };

  this.showStartModal = function () {
    startModal.showModal();
  };

  this.showModal = function () {
    document.getElementById("arcanoidModal").showModal();
  };

  this.drawBall = function () {
    context.beginPath();
    context.arc(
      this.ball.x,
      this.ball.y,
      this.ball.radius,
      0,
      2 * Math.PI,
      false
    );
    context.fillStyle = BALL_COLOR;
    context.fill();
  };

  this.drawBricks = function () {
    for (var i = 0; i < this.bricks.bricks.length; i++) {
      for (var j = 0; j < this.bricks.bricks[i].length; j++) {
        var current_block_image;

        if (this.bricks.bricks[i][j].lifes > 0) {
          if (this.bricks.bricks[i][j].lifes == BricksTypes.WOOD) {
            current_block_image = BLOCK_DARK_BLUE_IMAGE;
          } else {
            current_block_image = BLOCK_BLUE_IMAGE;
          }
          context.drawImage(
            current_block_image,
            this.bricks.bricks[i][j].x,
            this.bricks.bricks[i][j].y,
            this.bricks.bricks[i][j].width,
            this.bricks.bricks[i][j].height
          );
        }
      }
    }
  };

  this.draw = function () {
    this.drawBall();
    this.drawBricks();
    // draw paddle
    context.drawImage(
      PADDLE_IMAGE,
      this.paddle.x,
      this.paddle.y,
      this.paddle.width,
      this.paddle.height
    );

    if (!this.gameStarted) {
      this.showStartModal();
    }

    if (this.gamePaused && !this.gameWin && !this.gameOver) {
      this.displayLabel("Пауза");
    }

    if (this.gameOver) {
      this.displayLabel("Проигрыш", canvas.width / 2 - 45);
    }

    // Show winning modal
    if (this.gameWin) {
      this.showModal();
    }

    // Update statistics
    context.fillStyle = "rgb(255,255,220)";
    context.font = "bold 15px Arial";
    context.fillText("Счёт: " + this.score, 5, 15);

    context.fillStyle = "rgb(255,255,220)";
    context.font = "bold 15px Arial";
    context.fillText("Жизни: " + this.lifes, 5, 35);
  };

  this.update = function () {
    if (this.gamePaused || this.gameWin || this.gameOver) return;

    // update ball pos
    if (this.ball.dir & BallDirs.RIGHT) this.ball.x += this.ball.speed;
    else if (this.ball.dir & BallDirs.LEFT) this.ball.x -= this.ball.speed;
    if (this.ball.dir & BallDirs.UP) this.ball.y -= this.ball.speed;
    else if (this.ball.dir & BallDirs.DOWN) this.ball.y += this.ball.speed;

    // ball bounce from paddle
    if (
      this.ball.x + this.ball.radius > this.paddle.x &&
      this.ball.x - this.ball.radius < this.paddle.x + this.paddle.width &&
      this.ball.y + this.ball.radius > this.paddle.y
    ) {
      if (this.ball.speed < BALL_MAX_SPEED) this.ball.speed += 0.5; // adjust ball speed
      if (this.ball.dir & BallDirs.DOWN) {
        this.ball.dir = this.ball.dir - BallDirs.DOWN + BallDirs.UP;
      } else if (this.ball.dir & BallDirs.UP) {
        this.ball.dir = this.ball.dir - BallDirs.UP + BallDirs.DOWN;
      }
    }

    // update ball
    if (this.ball.x - this.ball.radius < 0) {
      this.ball.x = this.ball.radius;
      this.ball.dir = this.ball.dir - BallDirs.LEFT + BallDirs.RIGHT;
    }
    if (this.ball.x + this.ball.radius > canvas.width) {
      this.ball.x = canvas.width - this.ball.radius;
      this.ball.dir = this.ball.dir - BallDirs.RIGHT + BallDirs.LEFT;
    }
    if (this.ball.y - this.ball.radius < 0) {
      this.ball.y = this.ball.radius;
      this.ball.dir = this.ball.dir - BallDirs.UP + BallDirs.DOWN;
    }

    // lost one life
    if (this.ball.y + this.ball.radius > canvas.height) {
      this.lifes--;
      this.ball.speed = BALL_DEFAULT_SPEED;
      if (this.lifes == 0) {
        this.gameOver = true;
      } else {
        this.ball.x = canvas.width / 2;
        this.ball.y = canvas.height / 2;
        this.ball.dir = BallDirs.NONE;
      }
    }

    // "random" select first ball dir
    if (this.ball.dir == BallDirs.NONE) {
      this.ball.x = this.paddle.x + this.paddle.width / 2;
      this.ball.y = this.paddle.y - this.ball.radius * 2;
    }

    // bounces
    for (var i = 0; i < this.bricks.bricks.length; i++) {
      for (var j = 0; j < this.bricks.bricks[i].length; j++) {
        if (this.bricks.bricks[i][j].lifes > 0) {
          if (this.ball.dir == BallDirs.LEFT + BallDirs.UP) {
            if (
              this.isPointInRect(
                this.ball.x - this.ball.speed,
                this.ball.y - 0,
                this.bricks.bricks[i][j].x,
                this.bricks.bricks[i][j].y,
                this.bricks.bricks[i][j].width,
                this.bricks.bricks[i][j].height
              )
            ) {
              this.ball.x =
                this.bricks.bricks[i][j].x +
                this.bricks.bricks[i][j].width +
                this.ball.speed;
              this.ball.dir = this.ball.dir - BallDirs.LEFT + BallDirs.RIGHT;
              this.bricks.bricks[i][j].lifes--;
              this.score += BRICK_SCORE;
              return;
            }
            if (
              this.isPointInRect(
                this.ball.x - 0,
                this.ball.y - this.ball.speed,
                this.bricks.bricks[i][j].x,
                this.bricks.bricks[i][j].y,
                this.bricks.bricks[i][j].width,
                this.bricks.bricks[i][j].height
              )
            ) {
              this.ball.y =
                this.bricks.bricks[i][j].y +
                this.bricks.bricks[i][j].height +
                this.ball.speed;
              this.ball.dir = this.ball.dir - BallDirs.UP + BallDirs.DOWN;
              this.bricks.bricks[i][j].lifes--;
              this.score += BRICK_SCORE;
              return;
            }
          } else if (this.ball.dir == BallDirs.LEFT + BallDirs.DOWN) {
            if (
              this.isPointInRect(
                this.ball.x - this.ball.speed,
                this.ball.y + 0,
                this.bricks.bricks[i][j].x,
                this.bricks.bricks[i][j].y,
                this.bricks.bricks[i][j].width,
                this.bricks.bricks[i][j].height
              )
            ) {
              this.ball.x =
                this.bricks.bricks[i][j].x +
                this.bricks.bricks[i][j].width +
                this.ball.speed;
              this.ball.dir = this.ball.dir - BallDirs.LEFT + BallDirs.RIGHT;
              this.bricks.bricks[i][j].lifes--;
              this.score += BRICK_SCORE;
              return;
            }
            if (
              this.isPointInRect(
                this.ball.x - 0,
                this.ball.y + this.ball.speed,
                this.bricks.bricks[i][j].x,
                this.bricks.bricks[i][j].y,
                this.bricks.bricks[i][j].width,
                this.bricks.bricks[i][j].height
              )
            ) {
              this.ball.y = this.bricks.bricks[i][j].y - this.ball.speed;
              this.ball.dir = this.ball.dir - BallDirs.DOWN + BallDirs.UP;
              this.bricks.bricks[i][j].lifes--;
              this.score += BRICK_SCORE;
              return;
            }
          } else if (this.ball.dir == BallDirs.RIGHT + BallDirs.UP) {
            if (
              this.isPointInRect(
                this.ball.x + this.ball.speed,
                this.ball.y - 0,
                this.bricks.bricks[i][j].x,
                this.bricks.bricks[i][j].y,
                this.bricks.bricks[i][j].width,
                this.bricks.bricks[i][j].height
              )
            ) {
              this.ball.x = this.bricks.bricks[i][j].x - this.ball.speed;
              this.ball.dir = this.ball.dir - BallDirs.RIGHT + BallDirs.LEFT;
              this.bricks.bricks[i][j].lifes--;
              this.score += BRICK_SCORE;
              return;
            }
            if (
              this.isPointInRect(
                this.ball.x + 0,
                this.ball.y - this.ball.speed,
                this.bricks.bricks[i][j].x,
                this.bricks.bricks[i][j].y,
                this.bricks.bricks[i][j].width,
                this.bricks.bricks[i][j].height
              )
            ) {
              this.ball.y =
                this.bricks.bricks[i][j].y +
                this.bricks.bricks[i][j].height +
                this.ball.speed;
              this.ball.dir = this.ball.dir - BallDirs.UP + BallDirs.DOWN;
              this.bricks.bricks[i][j].lifes--;
              this.score += BRICK_SCORE;
              return;
            }
          } else if (this.ball.dir == BallDirs.RIGHT + BallDirs.DOWN) {
            if (
              this.isPointInRect(
                this.ball.x + this.ball.speed,
                this.ball.y + 0,
                this.bricks.bricks[i][j].x,
                this.bricks.bricks[i][j].y,
                this.bricks.bricks[i][j].width,
                this.bricks.bricks[i][j].height
              )
            ) {
              this.ball.x = this.bricks.bricks[i][j].x - this.ball.speed;
              this.ball.dir = this.ball.dir - BallDirs.RIGHT + BallDirs.LEFT;
              this.bricks.bricks[i][j].lifes--;
              this.score += BRICK_SCORE;
              return;
            }
            if (
              this.isPointInRect(
                this.ball.x + 0,
                this.ball.y + this.ball.speed,
                this.bricks.bricks[i][j].x,
                this.bricks.bricks[i][j].y,
                this.bricks.bricks[i][j].width,
                this.bricks.bricks[i][j].height
              )
            ) {
              this.ball.y = this.bricks.bricks[i][j].y - this.ball.speed;
              this.ball.dir = this.ball.dir - BallDirs.DOWN + BallDirs.UP;
              this.bricks.bricks[i][j].lifes--;
              this.score += BRICK_SCORE;
              return;
            }
          }
        }
      }
    }

    full_level_life = 0;
    for (var i = 0; i < this.bricks.bricks.length; i++) {
      for (var j = 0; j < this.bricks.bricks[i].length; j++) {
        full_level_life += this.bricks.bricks[i][j].lifes;
      }
    }

    if (full_level_life == 0) {
      if (this.level < 3) {
        this.ball.dir = BallDirs.NONE;
        this.level++;
        this.initLevel(this.level);
      } else this.gameWin = true;
    }
  };

  this.isPointInRect = function (
    x,
    y,
    rect_x,
    rect_y,
    rect_width,
    rect_height
  ) {
    if (
      x > rect_x &&
      x < rect_x + rect_width &&
      y > rect_y &&
      y < rect_y + rect_height
    )
      return true;
    return false;
  };

  this.isBallIntersectBrick = function (i, j) {
    if (
      this.ball.x + this.ball.radius > this.bricks.bricks[i][j].x &&
      this.ball.x - this.ball.radius <
        this.bricks.bricks[i][j].x + this.bricks.bricks[i][j].width &&
      this.ball.y + this.ball.radius > this.bricks.bricks[i][j].y &&
      this.ball.y - this.ball.radius <
        this.bricks.bricks[i][j].y + this.bricks.bricks[i][j].height
    )
      return true;
    return false;
  };

  this.render = function () {
    context.clearRect(0, 0, canvas.width, canvas.height);
    this.update();
    this.draw();
  };

  this.gameStart = function () {
    this.gameStarted = true;
  };

  this.togglePause = function () {
    this.gamePaused = !this.gamePaused;
  };

  this.movePaddleLeft = function () {
    if (this.paddle.x > 0) this.paddle.x -= 10 * PADDLE_SPEED;
  };

  this.movePaddleRight = function () {
    if (this.paddle.x < canvas.width - this.paddle.width)
      this.paddle.x += 10 * PADDLE_SPEED;
  };

  this.setPaddlePos = function (x) {
    x -= canvas.getBoundingClientRect().x;
    x -= PADDLE_WIDTH / 2;
    if (this.gamePaused || this.gameWin || this.gameOver) return;

    if (x < 0) x = 0;

    if (x > canvas.width - this.paddle.width)
      x = canvas.width - this.paddle.width;

    this.paddle.x = x;
  };

  this.startGame = function () {
    if (this.gamePaused) return;
    if (this.ball.dir == BallDirs.NONE) {
      this.ball.dir = BallDirs.RIGHT + BallDirs.UP;
    }
    this.gameStart();
  };
}

function getRandomRange(min, max) {
  return Math.random() * (max - min + 1) + min;
}

var arkanoidGame;

function render() {
  arkanoidGame.render();
}

function checkCanvasIsSupported() {
  canvas = document.getElementById("gameCanvas");

  if (canvas.getContext) {
    context = canvas.getContext("2d");

    arkanoidGame = new ArkanoidGame(canvas, context);
    arkanoidGame.init();

    setInterval(render, 1000 / 60);
  } else {
    alert("Простите, но ваш браузер не поддерживает запукс игры.");
  }
}

var KeyCodes = {
  SPACE: 32,
};

document.onkeydown = function (event) {
  var keyCode;
  if (event == null) {
    keyCode = window.event.keyCode;
  } else {
    keyCode = event.keyCode;
  }

  switch (keyCode) {
    case KeyCodes.SPACE:
      arkanoidGame.togglePause();
      break;
    default:
      break;
  }
};

document.onmousemove = function (event) {
  arkanoidGame.setPaddlePos(event.pageX);
};

document.ontouchmove = function (event) {
  arkanoidGame.setPaddlePos(event.touches[0].clientX);
};

document.onclick = function () {
  arkanoidGame.startGame();
};
