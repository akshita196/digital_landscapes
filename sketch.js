let amps = [0, 0 ,0 ,0 ,0 ,0];
let bg;
let chords = [];
let prevButtons = [];
let lastDpad = 0;
let played = 0;
let chordNames = ["A", "C", "D", "E", "G", "Am", "Dm", "Em"];
let chordColors = [
  [255, 170, 60],   // A - orange
  [255, 220, 80],   // C - gold
  [255, 110, 90],   // D - coral
  [255, 140, 200],  // E - pink
  [140, 230, 120],  // G - green
  [120, 160, 255],  // Am - blue
  [170, 120, 255],  // Dm - purple
  [90, 210, 230]    // Em - teal
];
let bend = 1;
let notes = [];

async function setup() {
  createCanvas(windowWidth, windowHeight);
  bg = await loadImage("media/guitar_wood.jpg");
  chords[0] = await loadSound("media/major_chords/A_major.mp3");
  chords[1] = await loadSound("media/major_chords/C_major.mp3");
  chords[2] = await loadSound("media/major_chords/D_major.mp3");
  chords[3] = await loadSound("media/major_chords/E_major.mp3");
  chords[4] = await loadSound("media/major_chords/G_major.mp3");
  chords[5] = await loadSound("media/minor_chords/A_minor.mp3");
  chords[6] = await loadSound("media/minor_chords/D_minor.mp3");
  chords[7] = await loadSound("media/minor_chords/E_minor.mp3");
}


function draw() {
  image(bg, 0, 0, width, height);
  guitar(); 
  drawNotes();
  let c = chordColors[played];
  noStroke();
  fill(c[0], c[1], c[2]);
  textSize(64);
  textAlign(LEFT, TOP);
  text(chordNames[played], 30, 30);
  let gp = navigator.getGamepads()[0];
  if (gp) {
    controller(gp);
  }
}

function guitar() {
  strokeWeight(3);
  fill(0, 0, 13);
  stroke(0);
  circle(width/2, height/2, height*0.7);
  let top = height * 0.25;
  let bottom = height * 0.75;
  let gap = (bottom - top) / 5;
  
  for (let i = 0; i < 6; i++) {
    let c = chordColors[played];
    stroke(c[0], c[1], c[2], map(amps[i], 0, 40, 120, 255));
    let y = top + i * gap;
    beginShape();
    for(let j = 0; j <= width; j+=10) {
      let wave = sin(j * 0.03* bend + frameCount * 0.1);
      let stringEnds = sin(map(j, 0, width, 0, PI));
      vertex(j, y + wave * amps[i] * stringEnds);
    } 
    endShape();
    amps[i] = amps[i] * 0.95;
  }
}

function playChord(n) {
  chords[n].play();
  played = n;
  for (let i = 0; i < 5; i++) {
    notes.push({
      x: random(width * 0.2, width * 0.8),
      y: random(height * 0.25, height * 0.75),
      speed: 5,
      size: random(24, 44),
      symbol: random(["♪", "♫", "♬", "♩"])
    });
  }
  strum();
}

function strum() {
  for (let i = 0; i < 6; i++) {
    amps[i] = random(20, 40);
  }
}

function drawNotes() {
  noStroke();
  textAlign(CENTER, CENTER);
  for (let k = notes.length - 1; k >= 0; k--) {
    let note = notes[k];

    fill(255);
    textSize(note.size);
    text(note.symbol, note.x, note.y);
    note.y -= note.speed;
  }
}

function controller(gp) {
  let dpad = gp.axes[9];
  if (dpad !== lastDpad) {
    if (abs(dpad - (-1)) < 0.1) {
      playChord(4);
    }
    if (abs(dpad - (0.714)) < 0.1) {
      playChord(5);
    }
    if (abs(dpad - (0.143)) < 0.1) {
      playChord(6);
    }
    if (abs(dpad - (-0.429)) < 0.1) {
      playChord(7);
    }
  }
  lastDpad = dpad;
  
  gp.buttons.forEach((button, index)=> {
    let current = button.pressed;
    let prev = prevButtons[index] || false;
    if (current &&! prev) {
      switch (index) {
        case 0: 
          playChord(0);
          break;
        case 1: 
          playChord(1);
          break;
        case 3: 
          playChord(3);
          break;
        case 4: 
          playChord(2);
          break;
      }
    }
    prevButtons[index] = current;
  });
  
  let deadzone = 0.15;
  let stickX = 0;
  if (abs(gp.axes[0]) > deadzone) {
    stickX = gp.axes[0];
  } else {
    stickX = 0;
  }
  let stickY = 0;
  if (abs(gp.axes[2]) > deadzone) {
    stickY = gp.axes[2];
  } else {
    stickY = 0;
  }
  let total = constrain(stickX + stickY, -1, 1);
  bend = 1 + total * 0.06;
  chords[played].rate(bend);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}