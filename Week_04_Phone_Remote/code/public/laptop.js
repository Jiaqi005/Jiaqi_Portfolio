let socket;
let input = { dx: 0, dy: 0 };

let player = { x: 60, y: 0, vy: 0, w: 34, h: 66 };
let gravity = 0.6;
let ground = 480;
let speed = 4.5;
let worldWidth = 2850;
let cameraX = 0;
let gameHeight = 540;
let viewWidth = 960;
let gameScale = 1;

let connected = false;
let phoneConnected = false;
let lastInputTime = 0;
let onSurface = false;
let finished = false;
let collected = 0;

let steveImg;
let blockImg;
let emeraldImg;
let successSound;
let jumpSound;
let landSound;

// Three connected sections, going from left to right.
let platforms = [
  { x: 210, y: 415, w: 144, h: 48 },
  { x: 435, y: 355, w: 144, h: 48 },
  { x: 690, y: 415, w: 144, h: 48 },
  { x: 1040, y: 415, w: 144, h: 48 },
  { x: 1260, y: 355, w: 144, h: 48 },
  { x: 1480, y: 300, w: 144, h: 48 },
  { x: 1730, y: 415, w: 144, h: 48 },
  { x: 1990, y: 400, w: 144, h: 48 },
  { x: 2200, y: 340, w: 144, h: 48 },
  { x: 2410, y: 280, w: 144, h: 48 }
];

let emeralds = [
  { x: 480, y: 306, w: 34, h: 40, collected: false },
  { x: 1535, y: 251, w: 34, h: 40, collected: false },
  { x: 2465, y: 231, w: 34, h: 40, collected: false }
];

function preload() {
  steveImg = loadImage('assets/steve.png');
  blockImg = loadImage('assets/block.png');
  emeraldImg = loadImage('assets/emerald.png');
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  pixelDensity(1);
  noSmooth();
  resizeGame();
  successSound = new Audio('assets/success.wav');
  jumpSound = new Audio('assets/jump.wav');
  landSound = new Audio('assets/land.wav');
  restartGame();

  socket = io();
  socket.on('connect', () => {
    connected = true;
    socket.emit('join', 'laptop');
    updateStatus();
  });
  socket.on('disconnect', () => {
    connected = false;
    phoneConnected = false;
    input.dx = 0;
    updateStatus();
  });
  socket.on('phone-status', (present) => {
    phoneConnected = present;
    if (!present) input.dx = 0;
    updateStatus();
  });
  socket.on('control', (data) => {
    if (typeof data.dx === 'number' && Number.isFinite(data.dx)) {
      input.dx = constrain(data.dx, -1, 1);
      lastInputTime = millis();
    }
    if (data.jump === true) doJump();
    updateStatus();
  });
  socket.on('restart', restartGame);

  let restartButton = createButton('Restart');
  restartButton.position(12, 42);
  restartButton.mousePressed(restartGame);
}

function resizeGame() {
  // Fit the browser window without stretching Steve or the blocks.
  gameScale = height / gameHeight;
  viewWidth = width / gameScale;
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  resizeGame();
}

function draw() {
  background(110, 190, 255);
  if (!phoneConnected || millis() - lastInputTime > 500) input.dx = 0;

  let direction = input.dx;
  if (keyIsDown(LEFT_ARROW)) direction = -1;
  if (keyIsDown(RIGHT_ARROW)) direction = 1;
  if (!finished) player.x = constrain(player.x + direction * speed, 0, worldWidth - player.w);

  let wasInAir = !onSurface;
  let fallingSpeed = player.vy;
  let previousBottom = player.y + player.h;
  player.vy += gravity;
  player.y += player.vy;
  onSurface = false;

  if (player.y + player.h >= ground) {
    player.y = ground - player.h;
    player.vy = 0;
    onSurface = true;
  }

  for (let i = 0; i < platforms.length; i++) {
    let p = platforms[i];
    let landing = player.x + player.w > p.x && player.x < p.x + p.w &&
      previousBottom <= p.y && player.y + player.h >= p.y && player.vy >= 0;
    if (landing) {
      player.y = p.y - player.h;
      player.vy = 0;
      onSurface = true;
    }
  }

  if (wasInAir && onSurface && fallingSpeed > 2 && !finished) {
    landSound.currentTime = 0;
    landSound.play().catch(() => {});
  }

  // Follow Steve once he moves beyond the middle of the screen.
  let targetCamera = constrain(player.x - viewWidth * 0.38, 0, max(0, worldWidth - viewWidth));
  cameraX += (targetCamera - cameraX) * 0.12;

  push();
  scale(gameScale);
  translate(-cameraX, 0);

  // Ground tiles touch edge to edge. The images are cropped to their visible pixels.
  for (let x = 0; x < worldWidth; x += 48) image(blockImg, x, ground, 48, 48);

  for (let i = 0; i < platforms.length; i++) {
    let p = platforms[i];
    for (let x = p.x; x < p.x + p.w; x += 48) image(blockImg, x, p.y, 48, 48);
  }

  // Subtle section markers help players see their progress.
  textAlign(CENTER);
  textSize(16);
  fill(35, 85, 50);
  text('LEVEL 1', 420, 110);
  text('LEVEL 2', 1390, 110);
  text('LEVEL 3', 2350, 110);

  for (let i = 0; i < emeralds.length; i++) {
    let e = emeralds[i];
    if (!e.collected) {
      image(emeraldImg, e.x, e.y, e.w, e.h);
      if (player.x < e.x + e.w && player.x + player.w > e.x &&
          player.y < e.y + e.h && player.y + player.h > e.y) {
        e.collected = true;
        collected++;
        successSound.currentTime = 0;
        successSound.play().catch(() => {});
      }
    }
  }
  image(steveImg, player.x, player.y, player.w, player.h);
  pop();

  // Keep the progress display separate from the finish message.
  push();
  scale(gameScale);
  fill(20, 65, 40);
  textAlign(RIGHT);
  textSize(19);
  text('Emeralds: ' + collected + ' / 3', viewWidth - 24, 38);
  pop();

  if (collected === 3) {
    finished = true;
    // Draw this on top of the game, in screen coordinates.
    push();
    rectMode(CENTER);
    fill(15, 55, 38, 210);
    noStroke();
    rect(width / 2, height / 2, min(width - 32, 540), 168, 12);
    textAlign(CENTER);
    fill(255);
    textSize(min(30, width / 19));
    text('All emeralds collected!', width / 2, height / 2 - 18);
    textSize(min(17, width / 32));
    text('Press R or click Restart to play again', width / 2, height / 2 + 25);
    pop();
  }
}

function keyPressed() {
  if (key === 'r' || key === 'R') restartGame();
  if (key === ' ') doJump();
}

function doJump() {
  if (onSurface && !finished) {
    player.vy = -12;
    onSurface = false;
    jumpSound.currentTime = 0;
    jumpSound.play().catch(() => {});
  }
}

function updateStatus() {
  let message = 'server disconnected';
  if (connected) message = phoneConnected ? 'phone connected — tilt to move' : 'waiting for phone...';
  document.getElementById('status').textContent = message;
}

function restartGame() {
  player.x = 60;
  player.y = ground - player.h;
  player.vy = 0;
  cameraX = 0;
  input.dx = 0;
  collected = 0;
  finished = false;
  onSurface = true;
  for (let i = 0; i < emeralds.length; i++) emeralds[i].collected = false;
}
