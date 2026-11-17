let socket;

let started = false;


let tiltX = 0;


document
  .getElementById('permission-btn')
  .addEventListener('click', startRemote);


document
  .getElementById('permission-btn')
  .addEventListener('touchend', (e) => {

    e.preventDefault();

    startRemote();

  });


function setup() {

  createCanvas(windowWidth, windowHeight);

  noLoop();


}


async function startRemote() {
  let button = document.getElementById('permission-btn');
  button.disabled = true;

  try {
    if (typeof DeviceOrientationEvent === 'undefined') {
      throw new Error('Orientation sensor is not available on this device.');
    }
    if (typeof DeviceOrientationEvent.requestPermission === 'function') {
      let permission = await DeviceOrientationEvent.requestPermission();
      if (permission !== 'granted') throw new Error('Please allow motion access to play.');
    }
  } catch (error) {
    button.textContent = error.message || 'Sensor permission failed — tap to retry';
    button.disabled = false;
    return;
  }

  window.addEventListener('deviceorientation', handleTilt);
  button.style.display = 'none';
  socket = io();
  socket.on('connect', () => {
    socket.emit('join', 'phone');
    socket.emit('control', { dx: tiltX });
  });
  socket.on('disconnect', () => { tiltX = 0; });
  started = true;
  loop();
}


function handleTilt(e) {

  if (typeof e.gamma !== 'number' || !Number.isFinite(e.gamma)) return;

  tiltX = constrain(
    e.gamma / 45,
    -1,
    1
  );


  // stop small unwanted movement
  if (abs(tiltX) < 0.08) {

    tiltX = 0;

  }


  if (socket && socket.connected) socket.emit('control', { dx: tiltX });

}


function draw() {

  background(20);


  if (!started) return;


  // controller line
  stroke(80);

  line(
    width / 2 - 100,
    height / 2,
    width / 2 + 100,
    height / 2
  );


  // moving dot
  fill(240, 90, 60);

  noStroke();

  let dotX =
    width / 2 +
    tiltX * 100;


  circle(
    dotX,
    height / 2,
    30
  );


  fill(200);

  textAlign(CENTER);

  textSize(16);

  text(
    'tilt left / right · tap to jump',
    width / 2,
    height - 50
  );

}


function touchStarted() {

  if (!started) return false;


  if (socket && socket.connected) socket.emit('control', { jump: true });


  return false;

}


function windowResized() {

  resizeCanvas(
    windowWidth,
    windowHeight
  );


}
// send a neutral value when the phone is no longer active
window.addEventListener('pagehide', () => {
  if (socket && socket.connected) socket.emit('control', { dx: 0 });
});
